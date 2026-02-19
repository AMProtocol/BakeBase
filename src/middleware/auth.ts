import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Extend Express Request to include apiKey
declare global {
  namespace Express {
    interface Request {
      apiKey?: { id: string; key_prefix: string };
    }
  }
}

/**
 * Extract API key from Authorization: Bearer <key> or X-API-Key header
 */
function extractApiKey(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const apiKeyHeader = req.headers['x-api-key'];
  if (typeof apiKeyHeader === 'string') {
    return apiKeyHeader.trim();
  }
  return null;
}

/**
 * Hash API key for storage/lookup (SHA-256)
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Auth middleware: validates API key and returns 401 if missing/invalid
 */
export async function requireApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const key = extractApiKey(req);

  if (!key) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      meta: {
        endpoint_description:
          'API key required. Send it in the Authorization header as Bearer <key> or in the X-API-Key header.',
        field_glossary: {},
        manifest: '/.well-known/agent-manifest.json'
      }
    });
    return;
  }

  const keyHash = hashApiKey(key);

  try {
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key_hash: keyHash }
    });

    if (!apiKeyRecord) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        meta: {
          endpoint_description: 'Invalid API key.',
          field_glossary: {},
          manifest: '/.well-known/agent-manifest.json'
        }
      });
      return;
    }

    if (apiKeyRecord.revoked_at) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        meta: {
          endpoint_description: 'API key has been revoked.',
          field_glossary: {},
          manifest: '/.well-known/agent-manifest.json'
        }
      });
      return;
    }

    if (apiKeyRecord.expires_at && apiKeyRecord.expires_at < new Date()) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        meta: {
          endpoint_description: 'API key has expired.',
          field_glossary: {},
          manifest: '/.well-known/agent-manifest.json'
        }
      });
      return;
    }

    req.apiKey = { id: apiKeyRecord.id, key_prefix: apiKeyRecord.key_prefix };

    // Update last_used_at (fire and forget, don't block response)
    prisma.apiKey
      .update({
        where: { id: apiKeyRecord.id },
        data: { last_used_at: new Date() }
      })
      .catch((err) => console.error('Failed to update last_used_at:', err));

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      meta: { endpoint_description: 'Authentication failed.', field_glossary: {} }
    });
  }
}
