import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { hashApiKey } from '../middleware/auth';

const prisma = new PrismaClient();

const KEY_PREFIX = 'bake_';
const KEY_EXPIRY_DAYS = 90;

function generateApiKey(): { key: string; keyHash: string; keyPrefix: string } {
  const randomPart = crypto.randomBytes(16).toString('hex');
  const key = `${KEY_PREFIX}${randomPart}`;
  return {
    key,
    keyHash: hashApiKey(key),
    keyPrefix: key.slice(0, 12) // bake_ + first 7 chars for display
  };
}

const DASHBOARD_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BakeBase API Keys</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 2rem auto; padding: 0 1rem; }
    h1 { color: #333; }
    p { line-height: 1.6; color: #555; }
    code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.9em; }
    .key-display { background: #1a1a1a; color: #0f0; padding: 1rem; border-radius: 8px; font-family: monospace; word-break: break-all; margin: 1rem 0; }
    .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
    button { background: #333; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 1rem; }
    button:hover { background: #555; }
    a { color: #0066cc; }
  </style>
</head>
<body>
  <h1>BakeBase API Keys</h1>
  <p>Generate an API key to authenticate with the BakeBase API. No account required.</p>
  <p>Use your key in requests:</p>
  <ul>
    <li><code>Authorization: Bearer &lt;your-key&gt;</code></li>
    <li>Or <code>X-API-Key: &lt;your-key&gt;</code></li>
  </ul>
  <p>Keys expire after 90 days. Store your key securely &mdash; you won't be able to see it again.</p>
  <form method="POST" action="/dashboard/keys">
    <button type="submit">Generate API Key</button>
  </form>
  <p><a href="/">Back to API</a> | <a href="/agents">Agent Guide</a></p>
</body>
</html>
`;

const SUCCESS_HTML = (key: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BakeBase API Key Generated</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 2rem auto; padding: 0 1rem; }
    h1 { color: #333; }
    p { line-height: 1.6; color: #555; }
    code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.9em; }
    .key-display { background: #1a1a1a; color: #0f0; padding: 1rem; border-radius: 8px; font-family: monospace; word-break: break-all; margin: 1rem 0; }
    .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
    a { color: #0066cc; }
  </style>
</head>
<body>
  <h1>API Key Generated</h1>
  <div class="warning">Copy your key now. You won't be able to see it again.</div>
  <div class="key-display">${key}</div>
  <p>Use it in requests:</p>
  <ul>
    <li><code>Authorization: Bearer ${key}</code></li>
    <li>Or <code>X-API-Key: ${key}</code></li>
  </ul>
  <p><a href="/dashboard/keys">Generate another key</a> | <a href="/">Back to API</a></p>
</body>
</html>
`;

export class KeysController {
  /**
   * GET /dashboard/keys - Key provisioning page (returns 200 for validator)
   */
  static getDashboard(_req: Request, res: Response): void {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(DASHBOARD_HTML);
  }

  /**
   * POST /dashboard/keys - Generate new API key (form submit or JSON when Accept: application/json)
   */
  static async createKey(req: Request, res: Response): Promise<void> {
    try {
      const { key, keyHash, keyPrefix } = generateApiKey();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + KEY_EXPIRY_DAYS);

      await prisma.apiKey.create({
        data: {
          key_prefix: keyPrefix,
          key_hash: keyHash,
          expires_at: expiresAt
        }
      });

      const acceptsJson = req.headers.accept?.includes('application/json');
      if (acceptsJson) {
        res.status(200).json({
          success: true,
          api_key: key,
          expires_in_days: KEY_EXPIRY_DAYS,
          usage: 'Send as Authorization: Bearer <key> or X-API-Key: <key>'
        });
        return;
      }

      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(SUCCESS_HTML(key));
    } catch (err) {
      console.error('Key generation error:', err);
      res.status(500).send(`
        <!DOCTYPE html>
        <html><head><title>Error</title></head>
        <body><h1>Error</h1><p>Failed to generate API key. Please try again.</p>
        <a href="/dashboard/keys">Back</a></body></html>
      `);
    }
  }

  /**
   * POST /api/keys - Generate new API key (JSON API for programmatic use)
   */
  static async createKeyJson(_req: Request, res: Response): Promise<void> {
    try {
      const { key, keyHash, keyPrefix } = generateApiKey();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + KEY_EXPIRY_DAYS);

      await prisma.apiKey.create({
        data: {
          key_prefix: keyPrefix,
          key_hash: keyHash,
          expires_at: expiresAt
        }
      });

      res.status(201).json({
        success: true,
        data: { api_key: key },
        meta: {
          endpoint_description: 'API key created. Store it securely; it expires in 90 days.',
          field_glossary: { api_key: 'Your API key. Use in Authorization: Bearer <key> or X-API-Key header.' }
        }
      });
    } catch (err) {
      console.error('Key generation error:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to generate API key',
        meta: { endpoint_description: 'Internal error.', field_glossary: {} }
      });
    }
  }
}
