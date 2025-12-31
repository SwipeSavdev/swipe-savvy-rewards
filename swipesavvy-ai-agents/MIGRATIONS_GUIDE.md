# Database Migrations Guide

This guide covers the Alembic database migration system used for SwipeSavvy.

## Overview

Alembic is a lightweight database migration tool that tracks schema changes and enables version control for your database. It integrates with SQLAlchemy to provide:

- **Auto-detection** of schema changes in Python models
- **Version history** of all database changes
- **Rollback capability** to revert changes safely
- **Collaboration support** for team development

## Project Structure

```
alembic/
├── versions/           # Migration scripts
├── env.py             # Migration execution environment
├── script.py.mako     # Migration template
├── README.md          # Alembic documentation
└── .gitignore         # Tracked but not committed
alembic.ini            # Configuration file
```

## Initial Setup

Alembic has been initialized and configured for SwipeSavvy:

### Configuration
- **Database**: PostgreSQL (development: localhost, production: via env var)
- **Models**: Imported from `app.models` for auto-detection
- **File Format**: Timestamped migrations (YYYYMMDD_HHMMSS_revision_desc.py)

### Environment Variable
Set `DATABASE_URL` to override the default development connection:
```bash
export DATABASE_URL="postgresql://user:password@host/dbname"
```

## Common Tasks

### Create New Migration

After modifying a model in `app/models.py`:

```bash
# Auto-generate migration from model changes
alembic revision --autogenerate -m "Add user email verification"

# Manual migration (no auto-detection)
alembic revision -m "Custom schema change"
```

Alembic will:
1. Compare current models with database schema
2. Generate Python code to apply changes
3. Create file: `alembic/versions/YYYYMMDD_HHMMSS_revision_desc.py`

### Apply Migrations

```bash
# Apply all pending migrations
alembic upgrade head

# Apply up to specific revision
alembic upgrade <revision_id>

# Apply specific number of migrations
alembic upgrade +3
```

### Review Migration History

```bash
# View all migrations and their status
alembic history --verbose

# Show current database revision
alembic current

# List revisions with descriptions
alembic branches
```

### Rollback Migrations

```bash
# Undo last migration
alembic downgrade -1

# Undo to specific revision
alembic downgrade <revision_id>

# Undo specific number of migrations
alembic downgrade -3
```

### Debug Migrations

```bash
# Generate SQL without executing (offline mode)
alembic upgrade head --sql

# Test on custom database
DATABASE_URL="postgresql://test:pass@localhost/test_db" alembic upgrade head
```

## Best Practices

### 1. Meaningful Commit Messages
```bash
# Good
alembic revision --autogenerate -m "Add phone_verified column to users table"

# Bad
alembic revision --autogenerate -m "Update schema"
```

### 2. Review Generated Code
Always review the generated migration before applying:
```bash
# Check what the migration will do
cat alembic/versions/<revision>_<name>.py

# Test on staging database first
alembic upgrade head  # Test env
```

### 3. Manual Adjustments
For complex changes, manually edit the migration file before applying:
```python
def upgrade() -> None:
    op.add_column('users', sa.Column('email_verified', sa.Boolean, default=False))
    op.execute("UPDATE users SET email_verified = FALSE")

def downgrade() -> None:
    op.drop_column('users', 'email_verified')
```

### 4. Version Control
- **Commit**: Migration files (they're code)
- **Don't commit**: `alembic/__pycache__/` (in .gitignore)
- **Review**: All migrations in code review before merge

### 5. Team Collaboration
When pulling changes:
```bash
# Update to latest schema
alembic upgrade head

# Check your model matches database
# If mismatch, create new migration
alembic revision --autogenerate -m "Sync with teammates' changes"
```

## Troubleshooting

### Migration Conflicts
If two developers create migrations simultaneously:

1. Pull both migration files
2. Edit the second one to reference the first in `down_revision`
3. Test: `alembic upgrade head`

### Wrong Revision Applied
```bash
# View current state
alembic current

# Downgrade if needed
alembic downgrade -1

# Recreate migration
alembic revision --autogenerate -m "Fix previous migration"
```

### Database out of sync
If database revision doesn't match alembic_version table:

```bash
# Check status
alembic current
alembic history --verbose

# Manually update (dangerous - use only if certain)
# UPDATE alembic_version SET version_num = '<revision_id>';
```

### Model Changes Not Detected
Ensure:
1. Model is in `app/models.py` (imported in `alembic/env.py`)
2. Model inherits from `Base`
3. All columns have proper SQLAlchemy types
4. Run: `alembic revision --autogenerate -m "Check changes"`

## Integration with Deployment

### Pre-deployment
```bash
# Test all migrations apply cleanly
alembic upgrade head

# Verify schema matches production
```

### CI/CD Pipeline
```bash
# In your deployment script
alembic upgrade head
```

### Rollback Procedure
```bash
# If deployment fails
alembic downgrade -1
# Fix code
# Reapply
alembic upgrade head
```

## Current Migrations

**Initial Migration**: `27dafa983136` (2025-12-30 13:55:33)
- Creates database schema from current models
- Status: Applied ✅

## Resources

- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/20/orm/)
- [Migration Best Practices](https://alembic.sqlalchemy.org/en/latest/ops.html)

## Migration Checklist

- [ ] Create migration: `alembic revision --autogenerate -m "description"`
- [ ] Review generated code
- [ ] Test on development database: `alembic upgrade head`
- [ ] Verify no errors in logs
- [ ] Commit migration file to version control
- [ ] Merge to main branch
- [ ] Apply in staging: `alembic upgrade head`
- [ ] Verify application works with new schema
- [ ] Deploy to production with `alembic upgrade head`
