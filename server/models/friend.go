package models

import "github.com/google/uuid"

type Friendship struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID    uuid.UUID `gorm:"type:uuid"`
	FriendID  uuid.UUID `gorm:"type:uuid"`
	IsBlocked bool      `gorm:"default:false"`
}

type FriendResponse struct {
	ID       uuid.UUID `json:"id"`
	UserID   uuid.UUID `json:"user_id"`
	FriendID uuid.UUID `json:"friend_id"`
}
