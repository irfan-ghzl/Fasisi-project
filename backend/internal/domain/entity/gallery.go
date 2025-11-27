package entity

import "time"

// FileType defines media file types
type FileType string

const (
	FileTypePhoto FileType = "photo"
	FileTypeVideo FileType = "video"
)

// Gallery entity
type Gallery struct {
	ID        int64     `json:"id"`
	UserID    int64     `json:"user_id"`
	FileType  FileType  `json:"file_type"`
	FilePath  string    `json:"file_path"`
	Caption   string    `json:"caption"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
