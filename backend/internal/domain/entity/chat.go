package entity

import "time"

// ChatMessage entity
type ChatMessage struct {
	ID         int64     `json:"id"`
	SenderID   int64     `json:"sender_id"`
	ReceiverID int64     `json:"receiver_id"`
	Message    string    `json:"message"`
	ReadStatus bool      `json:"read_status"`
	CreatedAt  time.Time `json:"created_at"`
}
