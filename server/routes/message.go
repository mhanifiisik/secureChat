package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mhanifiisik/server/controllers"
	"github.com/mhanifiisik/server/db"
	"github.com/mhanifiisik/server/middleware"
	"github.com/mhanifiisik/server/config"
)

func RegisterMessageRoutes(app *fiber.App, cfg config.Config) {
	dbInstance := db.Init(cfg.DbUrl)
	messageController := controllers.NewMessageController(dbInstance, cfg.SecretKey)
	messageRoutes := app.Group("/api/messages", middleware.AuthMiddleware(cfg))

	messageRoutes.Post("/", messageController.SendMessage)
	messageRoutes.Get("/:friendID", messageController.GetMessages)
}
