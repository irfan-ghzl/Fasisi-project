package database

import (
	"context"
	"database/sql"
	"embed"
	"fmt"
	"log"
	"sort"
	"strings"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

// Migration represents a database migration
type Migration struct {
	Version int
	Name    string
	UpSQL   string
	DownSQL string
}

// MigrationRunner handles database migrations
type MigrationRunner struct {
	db *sql.DB
}

// NewMigrationRunner creates a new migration runner
func NewMigrationRunner(db *sql.DB) *MigrationRunner {
	return &MigrationRunner{db: db}
}

// createMigrationsTable creates the migrations tracking table
func (m *MigrationRunner) createMigrationsTable(ctx context.Context) error {
	query := `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version INTEGER PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`
	_, err := m.db.ExecContext(ctx, query)
	return err
}

// getAppliedMigrations returns a map of applied migration versions
func (m *MigrationRunner) getAppliedMigrations(ctx context.Context) (map[int]bool, error) {
	applied := make(map[int]bool)
	
	rows, err := m.db.QueryContext(ctx, "SELECT version FROM schema_migrations")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var version int
		if err := rows.Scan(&version); err != nil {
			return nil, err
		}
		applied[version] = true
	}

	return applied, rows.Err()
}

// loadMigrations loads all migration files from the embedded filesystem
func (m *MigrationRunner) loadMigrations() ([]Migration, error) {
	entries, err := migrationsFS.ReadDir("migrations")
	if err != nil {
		return nil, fmt.Errorf("failed to read migrations directory: %w", err)
	}

	migrationMap := make(map[int]*Migration)

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		name := entry.Name()
		if !strings.HasSuffix(name, ".sql") {
			continue
		}

		// Parse migration file name (e.g., "001_create_users_table.up.sql")
		var version int
		var migName string
		var direction string

		parts := strings.Split(name, "_")
		if len(parts) < 2 {
			continue
		}

		// Extract version number
		fmt.Sscanf(parts[0], "%d", &version)
		
		// Extract migration name and direction
		lastPart := parts[len(parts)-1]
		if strings.HasSuffix(lastPart, ".up.sql") {
			direction = "up"
			migName = strings.Join(parts[1:len(parts)-1], "_") + "_" + strings.TrimSuffix(lastPart, ".up.sql")
		} else if strings.HasSuffix(lastPart, ".down.sql") {
			direction = "down"
			migName = strings.Join(parts[1:len(parts)-1], "_") + "_" + strings.TrimSuffix(lastPart, ".down.sql")
		} else {
			continue
		}

		// Read migration file content
		content, err := migrationsFS.ReadFile("migrations/" + name)
		if err != nil {
			return nil, fmt.Errorf("failed to read migration file %s: %w", name, err)
		}

		// Create or update migration in map
		if migrationMap[version] == nil {
			migrationMap[version] = &Migration{
				Version: version,
				Name:    migName,
			}
		}

		if direction == "up" {
			migrationMap[version].UpSQL = string(content)
		} else {
			migrationMap[version].DownSQL = string(content)
		}
	}

	// Convert map to sorted slice
	migrations := make([]Migration, 0, len(migrationMap))
	for _, mig := range migrationMap {
		migrations = append(migrations, *mig)
	}

	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].Version < migrations[j].Version
	})

	return migrations, nil
}

// RunMigrations runs all pending migrations
func (m *MigrationRunner) RunMigrations(ctx context.Context) error {
	// Create migrations table if it doesn't exist
	if err := m.createMigrationsTable(ctx); err != nil {
		return fmt.Errorf("failed to create migrations table: %w", err)
	}

	// Get applied migrations
	applied, err := m.getAppliedMigrations(ctx)
	if err != nil {
		return fmt.Errorf("failed to get applied migrations: %w", err)
	}

	// Load migrations from files
	migrations, err := m.loadMigrations()
	if err != nil {
		return fmt.Errorf("failed to load migrations: %w", err)
	}

	// Run pending migrations
	for _, migration := range migrations {
		if applied[migration.Version] {
			continue
		}

		log.Printf("Running migration %d: %s", migration.Version, migration.Name)

		// Begin transaction
		tx, err := m.db.BeginTx(ctx, nil)
		if err != nil {
			return fmt.Errorf("failed to begin transaction for migration %d: %w", migration.Version, err)
		}

		// Execute migration
		if _, err := tx.ExecContext(ctx, migration.UpSQL); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to execute migration %d: %w", migration.Version, err)
		}

		// Record migration
		if _, err := tx.ExecContext(ctx, 
			"INSERT INTO schema_migrations (version, name) VALUES ($1, $2)",
			migration.Version, migration.Name); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to record migration %d: %w", migration.Version, err)
		}

		// Commit transaction
		if err := tx.Commit(); err != nil {
			return fmt.Errorf("failed to commit migration %d: %w", migration.Version, err)
		}

		log.Printf("Successfully applied migration %d: %s", migration.Version, migration.Name)
	}

	log.Println("All migrations completed successfully")
	return nil
}

// Rollback rolls back the last migration
func (m *MigrationRunner) Rollback(ctx context.Context) error {
	// Get last applied migration
	var version int
	var name string
	err := m.db.QueryRowContext(ctx, 
		"SELECT version, name FROM schema_migrations ORDER BY version DESC LIMIT 1",
	).Scan(&version, &name)
	
	if err == sql.ErrNoRows {
		log.Println("No migrations to rollback")
		return nil
	}
	if err != nil {
		return fmt.Errorf("failed to get last migration: %w", err)
	}

	// Load migrations
	migrations, err := m.loadMigrations()
	if err != nil {
		return fmt.Errorf("failed to load migrations: %w", err)
	}

	// Find migration
	var migration *Migration
	for _, m := range migrations {
		if m.Version == version {
			migration = &m
			break
		}
	}

	if migration == nil {
		return fmt.Errorf("migration %d not found in files", version)
	}

	log.Printf("Rolling back migration %d: %s", version, name)

	// Begin transaction
	tx, err := m.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	// Execute rollback
	if _, err := tx.ExecContext(ctx, migration.DownSQL); err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to rollback migration %d: %w", version, err)
	}

	// Remove migration record
	if _, err := tx.ExecContext(ctx, 
		"DELETE FROM schema_migrations WHERE version = $1", version); err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to remove migration record %d: %w", version, err)
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit rollback %d: %w", version, err)
	}

	log.Printf("Successfully rolled back migration %d: %s", version, name)
	return nil
}
