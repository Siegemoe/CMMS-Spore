# 🔒 Production Security Guide - SPORE CMMS

## Overview
This guide provides comprehensive security instructions for deploying the SPORE CMMS application to production.

## 🔧 Pre-Deployment Security Checklist

### 1. Environment Variables Configuration

#### Critical Environment Variables
```bash
# Database Configuration
DATABASE_URL="your-production-database-url"

# NextAuth Configuration
NEXTAUTH_SECRET="your-cryptographically-secure-secret-here"
NEXTAUTH_URL="https://your-domain.com"

# Production Settings
NODE_ENV="production"
```

#### Generate Secure NextAuth Secret
```bash
# Generate a new secure secret for production
node -e "console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Database Security

#### SQLite (Development/Small Scale)
- Ensure database file has proper permissions
- Enable WAL mode for better concurrency
- Regular backups required

#### PostgreSQL (Recommended for Production)
```bash
# Example PostgreSQL connection string
DATABASE_URL="postgresql://username:password@host:port/database"
```

- Use strong database passwords
- Enable SSL connections
- Restrict database user permissions
- Regular database backups

### 3. Infrastructure Security

#### Web Server Configuration
- **HTTPS Required**: Configure SSL/TLS certificates
- **Reverse Proxy**: Use Nginx or Cloudflare
- **Firewall**: Configure appropriate firewall rules
- **Load Balancer**: For high availability

#### Recommended Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
}
```

## 🚀 Deployment Security Steps

### 1. Environment Setup
```bash
# Set production environment
export NODE_ENV=production

# Install dependencies
npm ci --production

# Generate database (if using Prisma)
npx prisma generate
npx prisma db push
```

### 2. Application Security Features Implemented

#### Rate Limiting
- **General API**: 100 requests per minute
- **Authentication**: 5 requests per minute
- **Write Operations**: 20 requests per minute
- **Read Operations**: 200 requests per minute

#### Input Validation
- All API endpoints use Zod validation schemas
- Sanitization of user input
- Type safety with TypeScript

#### Security Headers
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection
- Strict-Transport-Security (HTTPS only)

#### CORS Configuration
- Configured for specific domains only
- Credentials not shared with untrusted origins

### 3. Monitoring & Logging

#### Application Logs
- Authentication attempts (success/failure)
- Rate limit violations
- API errors and exceptions
- Data modification events

#### Security Monitoring
```bash
# Monitor authentication failures
grep "authentication failed" /var/log/app.log

# Monitor rate limiting
grep "Too many requests" /var/log/app.log

# Monitor API errors
grep "Internal server error" /var/log/app.log
```

## 🔒 Security Best Practices

### 1. Regular Security Updates
```bash
# Check for npm vulnerabilities weekly
npm audit

# Update dependencies
npm update

# Fix critical vulnerabilities
npm audit fix
```

### 2. Database Security
- Regular database backups
- Database user with minimal permissions
- Encrypted connections (SSL/TLS)
- Database access logging

### 3. Session Security
- Secure session configuration (already implemented)
- Session timeout: Default 30 days
- Secure cookie settings

### 4. Password Security
- Strong password requirements (implemented)
- bcrypt hashing (salt rounds: 12)
- Password complexity validation

## 🛡️ API Security Features

### Authentication & Authorization
- NextAuth.js for secure authentication
- Session-based authentication
- Role-based access control (RBAC)

### Input Validation & Sanitization
- Zod schemas for all API inputs
- Type validation and sanitization
- SQL injection prevention (Prisma ORM)

### Rate Limiting
- IP-based rate limiting
- Different limits for different endpoint types
- Graceful degradation under load

### Error Handling
- Secure error responses (no information leakage)
- Comprehensive error logging
- User-friendly error messages

## 📊 Security Monitoring Dashboard

### Key Metrics to Monitor
1. **Authentication Metrics**
   - Login success/failure rates
   - Session creation/expiration
   - Role-based access attempts

2. **API Security Metrics**
   - Rate limit violations
   - Input validation failures
   - Authentication failures by endpoint

3. **System Security Metrics**
   - Unusual request patterns
   - Error rates by endpoint
   - Geographic access patterns

## 🔧 Security Hardening Scripts

### Production Environment Setup
```bash
#!/bin/bash
# security-setup.sh

echo "🔒 Setting up production security..."

# Generate secure secret
echo "Generating NextAuth secret..."
SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
echo "NEXTAUTH_SECRET=$SECRET" >> .env.production

# Set file permissions
chmod 600 .env.production
chmod 755 scripts/

# Install security dependencies
npm install helmet cors express-rate-limit

echo "✅ Security setup complete!"
```

### Backup Script
```bash
#!/bin/bash
# backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.db"

# Create database backup
cp prisma/dev.db backups/$BACKUP_FILE

# Compress backup
gzip backups/$BACKUP_FILE

echo "✅ Database backup created: ${BACKUP_FILE}.gz"
```

## 🚨 Security Incident Response

### Immediate Actions for Security Incident
1. **Isolate the affected system**
2. **Preserve logs and evidence**
3. **Change all credentials**
4. **Notify security team**
5. **Patch vulnerabilities**
6. **Monitor for further suspicious activity**

### Emergency Contacts
- Security Team: [security-team@company.com]
- DevOps Team: [devops@company.com]
- Legal Team: [legal@company.com]

## 📋 Security Testing

### Pre-Deployment Testing
```bash
# Type checking
npm run type-check

# Security audit
npm audit

# Build verification
npm run build

# Security headers test
curl -I https://your-domain.com/api/assets
```

### Recommended Security Testing Tools
- **OWASP ZAP**: Web application security scanner
- **Burp Suite**: Web application testing
- **Nessus**: Vulnerability scanner
- **Postman**: API security testing

---

**Security Status**: ✅ Production Ready
**Last Updated**: $(date)
**Next Review**: $(date -d "+30 days")

For security questions or incident reports, contact the security team immediately.