package database

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/irfan-ghzl/fasisi-backend/internal/domain/entity"
	"github.com/irfan-ghzl/fasisi-backend/internal/domain/repository"
)

type userRepository struct {
	db *PostgresDB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *PostgresDB) repository.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) FindByID(ctx context.Context, id int64) (*entity.User, error) {
	query := `SELECT id, username, email, phone, password_hash, role, created_at, updated_at 
			  FROM users WHERE id = $1`

	user := &entity.User{}
	err := r.db.DB.QueryRowContext(ctx, query, id).Scan(
		&user.ID, &user.Username, &user.Email, &user.Phone,
		&user.PasswordHash, &user.Role, &user.CreatedAt, &user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *userRepository) FindByEmail(ctx context.Context, email string) (*entity.User, error) {
	query := `SELECT id, username, email, phone, password_hash, role, created_at, updated_at 
			  FROM users WHERE email = $1`

	user := &entity.User{}
	err := r.db.DB.QueryRowContext(ctx, query, email).Scan(
		&user.ID, &user.Username, &user.Email, &user.Phone,
		&user.PasswordHash, &user.Role, &user.CreatedAt, &user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *userRepository) FindByUsername(ctx context.Context, username string) (*entity.User, error) {
	query := `SELECT id, username, email, phone, password_hash, role, created_at, updated_at 
			  FROM users WHERE username = $1`

	user := &entity.User{}
	err := r.db.DB.QueryRowContext(ctx, query, username).Scan(
		&user.ID, &user.Username, &user.Email, &user.Phone,
		&user.PasswordHash, &user.Role, &user.CreatedAt, &user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *userRepository) Create(ctx context.Context, user *entity.User) error {
	query := `INSERT INTO users (username, email, phone, password_hash, role, created_at, updated_at) 
			  VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id`

	err := r.db.DB.QueryRowContext(ctx, query,
		user.Username, user.Email, user.Phone, user.PasswordHash, user.Role,
	).Scan(&user.ID)

	return err
}

func (r *userRepository) Update(ctx context.Context, user *entity.User) error {
	query := `UPDATE users SET username = $1, email = $2, phone = $3, password_hash = $4, 
			  role = $5, updated_at = NOW() WHERE id = $6`

	_, err := r.db.DB.ExecContext(ctx, query,
		user.Username, user.Email, user.Phone, user.PasswordHash, user.Role, user.ID,
	)

	return err
}
