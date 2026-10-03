#!/bin/sh
set -e
echo "Applying database schema..."
npx prisma db push
echo "Ensuring ingredient catalog..."
if ! npm run db:seed; then
  echo "WARN: db:seed failed — starting API anyway if catalog partially present"
fi
echo "Starting BakeBase API..."
exec npm start
