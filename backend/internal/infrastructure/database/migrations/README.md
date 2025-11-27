# Database Migrations

This directory contains SQL migration files for the Fasisi dating application database.

## Migration Files

Migrations are organized in numbered files with `.up.sql` and `.down.sql` suffixes:

- `001_create_users_table.up.sql` / `.down.sql` - Creates users table
- `002_create_gallery_table.up.sql` / `.down.sql` - Creates gallery table for photos/videos
- `003_create_date_requests_table.up.sql` / `.down.sql` - Creates date requests table
- `004_create_chat_messages_table.up.sql` / `.down.sql` - Creates chat messages table
- `005_create_notifications_table.up.sql` / `.down.sql` - Creates notifications table

## How It Works

The migration system uses Go's `embed` package to embed SQL files directly into the binary. When the application starts, it:

1. Creates a `schema_migrations` table to track which migrations have been applied
2. Reads all migration files from the embedded filesystem
3. Executes pending migrations in order
4. Records each successful migration in the tracking table

## Running Migrations

Migrations run automatically when the backend application starts:

```bash
cd backend
go run cmd/api/main.go
```

Output example:
```
Running database migrations...
Running migration 1: create_users_table
Successfully applied migration 1: create_users_table
Running migration 2: create_gallery_table
Successfully applied migration 2: create_gallery_table
...
All migrations completed successfully
Database migrations completed successfully
```

## Migration Naming Convention

Migration files follow this naming pattern:
```
<version>_<description>.<direction>.sql
```

Examples:
- `001_create_users_table.up.sql` - Forward migration
- `001_create_users_table.down.sql` - Rollback migration

## Adding New Migrations

To add a new migration:

1. Create two new files with the next version number:
   ```
   006_your_migration_name.up.sql
   006_your_migration_name.down.sql
   ```

2. Write the forward migration in the `.up.sql` file:
   ```sql
   -- Add your schema changes here
   CREATE TABLE IF NOT EXISTS new_table (
       id SERIAL PRIMARY KEY,
       ...
   );
   ```

3. Write the rollback migration in the `.down.sql` file:
   ```sql
   -- Reverse the changes
   DROP TABLE IF EXISTS new_table;
   ```

4. The migration will run automatically on next application start

## Rolling Back Migrations

To rollback the last migration, you can use the migration runner programmatically:

```go
runner := database.NewMigrationRunner(db.DB)
err := runner.Rollback(ctx)
```

## Database Schema

After all migrations, the database will have these tables:

### users
- Stores user information (Irfan and Sisti)
- Includes authentication credentials and roles

### gallery
- Stores photos and videos with captions
- Links to user who uploaded the media

### date_requests
- Stores date requests (places to visit, food to eat)
- Includes approval workflow (pending/approved/rejected)

### chat_messages
- Stores chat messages between users
- Tracks read/unread status

### notifications
- Stores in-app notifications
- Tracks email and SMS delivery status

### schema_migrations
- System table that tracks applied migrations
- Created automatically by the migration runner

## Important Notes

1. **Never edit applied migrations** - Once a migration has been applied to production, create a new migration instead
2. **Always test migrations** - Test both up and down migrations in development
3. **Migrations are transactional** - Each migration runs in a transaction and rolls back on error
4. **Embedded in binary** - Migration files are embedded in the compiled binary, no need to deploy SQL files separately
