package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	UserID      uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"user_id"`
	Name        string    `json:"name"`
	Email       string    `gorm:"uniqueIndex" json:"email"`
	Password    string    `json:"-"`
	Role        string    `gorm:"default:user" json:"role"`
	Photo       string    `json:"photo"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
