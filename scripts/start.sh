#!/bin/sh
set -e
echo "Applying database schema..."
npx prisma db push
echo "Ensuring ingredient catalog..."
npm run db:seed
echo "Starting BakeBase API..."
exec npm start
