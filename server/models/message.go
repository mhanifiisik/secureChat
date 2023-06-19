package models

import (
	"time"

	"github.com/google/uuid"
)

type Message struct {
	MessageID   uuid.UUID `gorm:"type:uuid;primaryKey" json:"message_id"`
	SenderID    uuid.UUID `gorm:"type:uuid;not null" json:"sender_id"`
	ReceiverID  uuid.UUID `gorm:"type:uuid;not null" json:"receiver_id"`
	Content     string    `gorm:"type:text;not null" json:"content"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type MessageResponse struct {
	MessageID   uuid.UUID `json:"message_id"`
	SenderID    uuid.UUID `json:"sender_id"`
	ReceiverID  uuid.UUID `json:"receiver_id"`
	Content     string    `json:"content"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
