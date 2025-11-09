# Comprehensive .gitignore for Next.js with Prisma and TypeScript

Below is a recommended .gitignore file for your spore-cmms project. This includes all necessary exclusions for Next.js, Prisma, TypeScript, and development files.

```gitignore
# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
.next
out
dist
build

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE and editor files
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Prisma
prisma/dev.db
prisma/dev.db-journal
prisma/migrations/

# Test results and logs
test-results/
*.test.log
e2e-test-results/

# Database
*.sqlite
*.sqlite3
*.db

# Vercel
.vercel

# Turbo
.turbo

# Local Netlify folder
.netlify

# Sentry
.sentryclirc

# Git
.git
.gitignore

# Markdown files with sensitive info
*SECRETS*.md
*CONFIG*.md
```

## Key sections included:

1. **Dependencies**: Node modules and package manager logs
2. **Production builds**: Next.js .next directory and other build outputs
3. **Environment variables**: All .env files to protect sensitive data
4. **IDE files**: VSCode, IntelliJ, and other editor configurations
5. **OS files**: macOS, Windows, and Linux system files
6. **Logs**: Various log files and test coverage reports
7. **TypeScript**: Build cache files
8. **Prisma**: Database files and migration directories
9. **Test results**: Your existing test-results directory

This comprehensive .gitignore will ensure that only the necessary source code and configuration files are committed to your GitHub repository, while excluding sensitive data, build artifacts, and temporary files.