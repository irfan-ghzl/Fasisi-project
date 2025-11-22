package repository

import (
	"context"
	"github.com/irfan-ghzl/fasisi-backend/internal/domain/entity"
)

// GalleryRepository defines gallery data access interface
type GalleryRepository interface {
	FindAll(ctx context.Context) ([]*entity.Gallery, error)
	FindByID(ctx context.Context, id int64) (*entity.Gallery, error)
	FindByUserID(ctx context.Context, userID int64) ([]*entity.Gallery, error)
	Create(ctx context.Context, gallery *entity.Gallery) error
	Delete(ctx context.Context, id int64) error
}
