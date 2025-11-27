package entity

import "time"

// NotificationType defines notification types
type NotificationType string

const (
	NotificationTypeDateRequest   NotificationType = "date_request"
	NotificationTypeChatMessage   NotificationType = "chat_message"
	NotificationTypeNewMessage    NotificationType = "new_message"
	NotificationTypeGalleryUpload NotificationType = "gallery_upload"
)

// Notification entity
type Notification struct {
	ID         int64            `json:"id"`
	UserID     int64            `json:"user_id"`
	Type       NotificationType `json:"type"`
	Message    string           `json:"message"`
	RelatedID  int64            `json:"related_id"`  // ID of related entity (chat, gallery, etc)
	ReadStatus bool             `json:"read_status"`
	SentEmail  bool             `json:"sent_email"`
	SentSMS    bool             `json:"sent_sms"`
	CreatedAt  time.Time        `json:"created_at"`
}
