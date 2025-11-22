package repository

import (
	"context"
	"github.com/irfan-ghzl/fasisi-backend/internal/domain/entity"
)

// NotificationRepository defines notification data access interface
type NotificationRepository interface {
	FindByUserID(ctx context.Context, userID int64, limit int) ([]*entity.Notification, error)
	Create(ctx context.Context, notification *entity.Notification) error
	MarkAsRead(ctx context.Context, id int64) error
	MarkAllAsRead(ctx context.Context, userID int64) error
	CountUnread(ctx context.Context, userID int64) (int64, error)
}
