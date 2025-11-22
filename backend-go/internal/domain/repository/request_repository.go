package repository

import (
	"context"
	"github.com/irfan-ghzl/fasisi-backend/internal/domain/entity"
)

// DateRequestRepository defines date request data access interface
type DateRequestRepository interface {
	FindAll(ctx context.Context) ([]*entity.DateRequest, error)
	FindByID(ctx context.Context, id int64) (*entity.DateRequest, error)
	FindByUserID(ctx context.Context, userID int64) ([]*entity.DateRequest, error)
	Create(ctx context.Context, request *entity.DateRequest) error
	UpdateStatus(ctx context.Context, id int64, status entity.RequestStatus) error
	Delete(ctx context.Context, id int64) error
}
