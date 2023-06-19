package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/mhanifiisik/server/models"
	"gorm.io/gorm"
)

type FriendController struct {
	DB *gorm.DB
}

func NewFriendController(db *gorm.DB) *FriendController {
	return &FriendController{
		DB: db,
	}
}

type AddFriendRequest struct {
	FriendID string `json:"friend_id"`
}

func (fc *FriendController) AddFriend(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)

	var req AddFriendRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	friendID, err := uuid.Parse(req.FriendID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid friend ID",
		})
	}

	friendship := models.Friendship{
		UserID:    uuid.MustParse(userID),
		FriendID:  friendID,
		IsBlocked: false,
	}

	result := fc.DB.Create(&friendship)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to add friend",
		})
	}

	friendResponse := models.FriendResponse{
		ID:       friendship.ID,
		UserID:   friendship.UserID,
		FriendID: friendship.FriendID,
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Friend added successfully",
		"friend":  friendResponse,
	})
}

func (fc *FriendController) GetFriends(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)

	friendships := []models.Friendship{}
	result := fc.DB.Where("user_id = ?", userID).Find(&friendships)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to fetch friends",
		})
	}

	friendResponses := make([]models.FriendResponse, len(friendships))
	for i, friendship := range friendships {
		friendResponses[i] = models.FriendResponse{
			ID:       friendship.ID,
			UserID:   friendship.UserID,
			FriendID: friendship.FriendID,
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"friends": friendResponses,
	})
}
