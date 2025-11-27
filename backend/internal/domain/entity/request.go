package entity

import "time"

// RequestType defines request types
type RequestType string

const (
	RequestTypePlace RequestType = "place"
	RequestTypeFood  RequestType = "food"
)

// RequestStatus defines request status
type RequestStatus string

const (
	RequestStatusPending  RequestStatus = "pending"
	RequestStatusApproved RequestStatus = "approved"
	RequestStatusRejected RequestStatus = "rejected"
)

// DateRequest entity
type DateRequest struct {
	ID          int64         `json:"id"`
	UserID      int64         `json:"user_id"`
	RequestType RequestType   `json:"request_type"`
	Title       string        `json:"title"`
	Description string        `json:"description"`
	Location    string        `json:"location"`
	Status      RequestStatus `json:"status"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`
}
