package database

import (
	"context"
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

// PostgresDB wraps sql.DB
type PostgresDB struct {
	DB *sql.DB
}

// NewPostgresDB creates a new PostgreSQL connection
func NewPostgresDB(host, port, user, password, dbname string) (*PostgresDB, error) {
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &PostgresDB{DB: db}, nil
}

// RunMigrations runs all database migrations
func (p *PostgresDB) RunMigrations(ctx context.Context) error {
	runner := NewMigrationRunner(p.DB)
	return runner.RunMigrations(ctx)
}

// Close closes database connection
func (p *PostgresDB) Close() error {
	return p.DB.Close()
}
