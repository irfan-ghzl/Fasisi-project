package repository

import (
	"context"
	"github.com/irfan-ghzl/fasisi-backend/internal/domain/entity"
)

// ChatRepository defines chat data access interface
type ChatRepository interface {
	FindHistory(ctx context.Context, user1ID, user2ID int64) ([]*entity.ChatMessage, error)
	Create(ctx context.Context, message *entity.ChatMessage) error
	MarkAsRead(ctx context.Context, senderID, receiverID int64) error
	CountUnread(ctx context.Context, userID int64) (int64, error)
}
