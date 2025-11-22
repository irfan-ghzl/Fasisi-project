package entity

import (
	"time"
)

// UserRole defines user roles
type UserRole string

const (
	RoleUser       UserRole = "user"
	RoleSuperAdmin UserRole = "super_admin"
)

// User entity - Fixed users: Irfan (super admin) and Sisti
type User struct {
	ID           int64     `json:"id"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	Phone        string    `json:"phone"`
	PasswordHash string    `json:"-"`
	Role         UserRole  `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// IsAdmin checks if user is super admin
func (u *User) IsAdmin() bool {
	return u.Role == RoleSuperAdmin
}

// Fixed users - Only Irfan and Sisti
var (
	// Irfan - Super Admin
	UserIrfan = User{
		ID:       1,
		Username: "irfan",
		Email:    "irfan@fasisi.com",
		Role:     RoleSuperAdmin,
	}

	// Sisti - Regular User
	UserSisti = User{
		ID:       2,
		Username: "sisti",
		Email:    "sisti@fasisi.com",
		Role:     RoleUser,
	}
)
