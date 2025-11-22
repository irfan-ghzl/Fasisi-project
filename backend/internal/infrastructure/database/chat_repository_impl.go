package database

import (
	"context"

	"github.com/irfan-ghzl/fasisi-backend/internal/domain/entity"
	"github.com/irfan-ghzl/fasisi-backend/internal/domain/repository"
)

type chatRepository struct {
	db *PostgresDB
}

// NewChatRepository creates a new chat repository
func NewChatRepository(db *PostgresDB) repository.ChatRepository {
	return &chatRepository{db: db}
}

func (r *chatRepository) FindHistory(ctx context.Context, user1ID, user2ID int64) ([]*entity.ChatMessage, error) {
	query := `SELECT id, sender_id, receiver_id, message, read_status, created_at 
			  FROM chat_messages 
			  WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
			  ORDER BY created_at ASC`

	rows, err := r.db.DB.QueryContext(ctx, query, user1ID, user2ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []*entity.ChatMessage
	for rows.Next() {
		msg := &entity.ChatMessage{}
		err := rows.Scan(&msg.ID, &msg.SenderID, &msg.ReceiverID, &msg.Message, &msg.ReadStatus, &msg.CreatedAt)
		if err != nil {
			return nil, err
		}
		messages = append(messages, msg)
	}

	return messages, nil
}

func (r *chatRepository) Create(ctx context.Context, message *entity.ChatMessage) error {
	query := `INSERT INTO chat_messages (sender_id, receiver_id, message, read_status, created_at) 
			  VALUES ($1, $2, $3, $4, NOW()) RETURNING id`

	err := r.db.DB.QueryRowContext(ctx, query,
		message.SenderID, message.ReceiverID, message.Message, message.ReadStatus,
	).Scan(&message.ID)

	return err
}

func (r *chatRepository) MarkAsRead(ctx context.Context, senderID, receiverID int64) error {
	query := `UPDATE chat_messages SET read_status = TRUE 
			  WHERE sender_id = $1 AND receiver_id = $2 AND read_status = FALSE`

	_, err := r.db.DB.ExecContext(ctx, query, senderID, receiverID)
	return err
}

func (r *chatRepository) CountUnread(ctx context.Context, userID int64) (int64, error) {
	query := `SELECT COUNT(*) FROM chat_messages WHERE receiver_id = $1 AND read_status = FALSE`

	var count int64
	err := r.db.DB.QueryRowContext(ctx, query, userID).Scan(&count)
	return count, err
}
