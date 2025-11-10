# Vercel Postgres Setup Guide

This document outlines the process for setting up Vercel Postgres with a Next.js application using Prisma ORM.

## Problem Solved

**Original Error:**
```
Error [PrismaClientKnownRequestError]: 
Invalid `prisma.user.findUnique()` invocation:
The table `public.users` does not exist in the current database.
```

**Root Cause:** The database schema was defined in `prisma/schema.prisma` but not applied to the actual Vercel Postgres database.

## Setup Steps

### 1. Get Vercel Postgres Credentials

1. Go to your Vercel dashboard
2. Navigate to your project
3. Click on "Storage" tab
4. Select your Postgres database
5. Click ".env.local" to copy the environment variables

You'll need these four variables:
- `DATABASE_URL`
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

### 2. Update Environment Files

**Important:** Update both `.env` and `.env.local` files to ensure consistency.

Add the database credentials to both files:

```bash
# Database (Vercel Postgres)
DATABASE_URL="postgres://[username]:[password]@db.prisma.io:5432/postgres?sslmode=require"
POSTGRES_URL="postgres://[username]:[password]@db.prisma.io:5432/postgres?sslmode=require&pgbouncer=true"
POSTGRES_PRISMA_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=[your-api-key]"
POSTGRES_URL_NON_POOLING="postgres://[username]:[password]@db.prisma.io:5432/postgres?sslmode=require"
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

This ensures the Prisma client is up to date with your schema.

### 4. Apply Database Schema

```bash
npx prisma db push
```

This command:
- Reads your `prisma/schema.prisma` file
- Creates all necessary tables in your Vercel Postgres database
- Preserves any existing data
- Is safe to run multiple times

### 5. Verify Setup

**Option A: Verify with Prisma**
```bash
npx prisma db pull
```
This should show that all models are successfully introspected from the database.

**Option B: Test with API**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword123","name":"Test User"}'
```

## Key Points

1. **Schema Preservation:** The `prisma db push` command applies your existing schema without modifying the schema file itself.

2. **Environment Variables:** Both `.env` and `.env.local` should be updated to ensure consistency across different environments.

3. **Database URLs:** 
   - `DATABASE_URL`: Standard connection string
   - `POSTGRES_URL`: With connection pooling
   - `POSTGRES_PRISMA_URL`: For Prisma Accelerate
   - `POSTGRES_URL_NON_POOLING`: Direct connection without pooling

4. **Safety:** `prisma db push` is safe for production use and won't destroy existing data.

## Troubleshooting

### Error: "Can't reach database server"
- Check that your environment variables are correctly set
- Ensure you're updating the correct `.env` file (not just `.env.local`)
- Verify the database credentials are valid

### Error: "Table does not exist"
- Run `npx prisma db push` to apply the schema
- Verify the schema file is correctly defined
- Check that you're connected to the right database

## File Structure

```
project-root/
├── .env                    # Production/stable environment variables
├── .env.local             # Local development overrides
├── .env.example           # Example template
└── prisma/
    └── schema.prisma      # Your database schema definition
```

## Commands Reference

```bash
# Generate Prisma client
npx prisma generate

# Apply schema to database (safe)
npx prisma db push

# Pull schema from database (for verification)
npx prisma db pull

# View database in Prisma Studio
npx prisma studio
```

## Success Indicators

✅ `npx prisma db push` shows "Your database is now in sync with your Prisma schema"
✅ `npx prisma db pull` shows all your models were introspected
✅ Registration endpoint returns successful user creation
✅ No more "table does not exist" errors