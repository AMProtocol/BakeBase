# Quick Start Guide

Get BakeBase running in 5 minutes.

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up database (PostgreSQL required)
cp .env.example .env
# Edit .env and add your DATABASE_URL

# 3. Initialize database
npx prisma db push
npm run db:seed

# 4. Start development server
npm run dev
```

Visit `http://localhost:3000/agents` to see the AI agent guide.

## Test the API

```bash
# Health check
curl http://localhost:3000/health

# Get all flours
curl http://localhost:3000/ingredients?category=flour

# Search for butter
curl http://localhost:3000/ingredients/search?q=butter

# Combine flour + water (calculate hydration)
curl -X POST http://localhost:3000/ingredients/combine \
  -H "Content-Type: application/json" \
  -d '{
    "ingredients": [
      { "ingredient_id": "<flour_id>", "quantity_g": 100 },
      { "ingredient_id": "<water_id>", "quantity_g": 70 }
    ]
  }'
```

**Note:** Replace `<flour_id>` and `<water_id>` with actual IDs from the database. Get IDs via:
```bash
curl http://localhost:3000/ingredients
```

## Deploy to Railway

1. Push code to GitHub
2. Create Railway project
3. Add PostgreSQL database
4. Connect GitHub repo
5. Deploy!

Railway automatically runs:
- `npm install && npm run build`
- `npx prisma db push`
- `npm run db:seed`
- `npm start`

## Verify Deployment

```bash
# Replace with your Railway URL
curl https://your-app.railway.app/health
curl https://your-app.railway.app/agents
```

## Next Steps

1. **Add more ingredients**: Edit `src/prisma/seed.ts`
2. **Customize chemistry**: Edit `src/services/chemistry.service.ts`
3. **Add endpoints**: Create new controllers in `src/controllers/`
4. **Update OpenAPI spec**: Edit `src/middleware/openapi.ts`

## Troubleshooting

**Database connection fails**
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Try `npx prisma db push` manually

**Seed fails**
- Check Prisma schema matches database
- Ensure no duplicate ingredient names
- Run `npm run db:seed` with `--force` flag if needed

**TypeScript errors**
- Run `npx prisma generate` to regenerate client
- Check `tsconfig.json` matches project structure
- Rebuild: `npm run build`

## Development Commands

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build TypeScript
npm start            # Start production server
npm run db:seed      # Seed database
npx prisma studio    # Open database GUI
npx prisma db push   # Push schema to database
```
