package repository

import (
	"context"
	"github.com/irfan-ghzl/fasisi-backend/internal/domain/entity"
)

// UserRepository defines user data access interface
type UserRepository interface {
	FindByID(ctx context.Context, id int64) (*entity.User, error)
	FindByEmail(ctx context.Context, email string) (*entity.User, error)
	FindByUsername(ctx context.Context, username string) (*entity.User, error)
	Create(ctx context.Context, user *entity.User) error
	Update(ctx context.Context, user *entity.User) error
}
