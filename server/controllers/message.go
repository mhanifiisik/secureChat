package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/mhanifiisik/server/models"
	"github.com/mhanifiisik/server/utils"
	"gorm.io/gorm"
)

type MessageController struct {
	DB        *gorm.DB
	secretKey string
}

func NewMessageController(db *gorm.DB, secretKey string) *MessageController {
	return &MessageController{
		DB:        db,
		secretKey: secretKey,
	}
}

type SendMessageRequest struct {
	ReceiverID string `json:"receiver_id"`
	Content    string `json:"content"`
}

func (mc *MessageController) SendMessage(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)

	var req SendMessageRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	receiverID, err := uuid.Parse(req.ReceiverID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid receiver ID",
		})
	}

	encryptedContent, err := utils.Encrypt(req.Content, mc.secretKey)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to encrypt message content",
		})
	}

	message := models.Message{
		SenderID:   uuid.MustParse(userID),
		ReceiverID: receiverID,
		Content:    encryptedContent,
	}

	result := mc.DB.Create(&message)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to send message",
		})
	}

	decryptedContent, err := utils.Decrypt(message.Content, mc.secretKey)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Failed to decrypt message content",
			})
	}

	messageResponse := models.MessageResponse{
		MessageID:   message.MessageID,
		SenderID:    message.SenderID,
		ReceiverID:  message.ReceiverID,
		Content:     decryptedContent,
		CreatedAt:   message.CreatedAt,
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Message sent successfully",
		"data":    messageResponse,
	})
}


func (mc *MessageController) GetMessages(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)
	friendID := c.Params("friendID")

	messages := []models.Message{}
	result := mc.DB.Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
		userID, friendID, friendID, userID).
		Order("created_at").
		Find(&messages)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to fetch messages",
		})
	}

	messageResponses := []models.MessageResponse{}
	for _, message := range messages {
		decryptedContent, err := utils.Decrypt(message.Content, mc.secretKey)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Failed to decrypt message content",
			})
		}

		messageResponses = append(messageResponses, models.MessageResponse{
			MessageID:   message.MessageID,
			SenderID:    message.SenderID,
			ReceiverID:  message.ReceiverID,
			Content:     decryptedContent,
			CreatedAt:   message.CreatedAt,
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success":  true,
		"messages": messageResponses,
	})
}
