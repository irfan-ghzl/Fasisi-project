package database

import (
	"context"

	"github.com/irfan-ghzl/fasisi-backend/internal/domain/entity"
	"github.com/irfan-ghzl/fasisi-backend/internal/domain/repository"
)

type notificationRepository struct {
	db *PostgresDB
}

// NewNotificationRepository creates a new notification repository
func NewNotificationRepository(db *PostgresDB) repository.NotificationRepository {
	return &notificationRepository{db: db}
}

func (r *notificationRepository) FindByUserID(ctx context.Context, userID int64, limit int) ([]*entity.Notification, error) {
	query := `SELECT id, user_id, type, message, read_status, sent_email, sent_sms, created_at 
			  FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`

	rows, err := r.db.DB.QueryContext(ctx, query, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []*entity.Notification
	for rows.Next() {
		notif := &entity.Notification{}
		err := rows.Scan(&notif.ID, &notif.UserID, &notif.Type, &notif.Message,
			&notif.ReadStatus, &notif.SentEmail, &notif.SentSMS, &notif.CreatedAt)
		if err != nil {
			return nil, err
		}
		notifications = append(notifications, notif)
	}

	return notifications, nil
}

func (r *notificationRepository) Create(ctx context.Context, notification *entity.Notification) error {
	query := `INSERT INTO notifications (user_id, type, message, read_status, sent_email, sent_sms, created_at) 
			  VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id`

	err := r.db.DB.QueryRowContext(ctx, query,
		notification.UserID, notification.Type, notification.Message,
		notification.ReadStatus, notification.SentEmail, notification.SentSMS,
	).Scan(&notification.ID)

	return err
}

func (r *notificationRepository) MarkAsRead(ctx context.Context, id int64) error {
	query := `UPDATE notifications SET read_status = TRUE WHERE id = $1`
	_, err := r.db.DB.ExecContext(ctx, query, id)
	return err
}

func (r *notificationRepository) MarkAllAsRead(ctx context.Context, userID int64) error {
	query := `UPDATE notifications SET read_status = TRUE WHERE user_id = $1 AND read_status = FALSE`
	_, err := r.db.DB.ExecContext(ctx, query, userID)
	return err
}

func (r *notificationRepository) CountUnread(ctx context.Context, userID int64) (int64, error) {
	query := `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read_status = FALSE`

	var count int64
	err := r.db.DB.QueryRowContext(ctx, query, userID).Scan(&count)
	return count, err
}
