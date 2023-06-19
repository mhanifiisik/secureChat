package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mhanifiisik/server/config"
	"github.com/mhanifiisik/server/controllers"
	"github.com/mhanifiisik/server/db"
	"github.com/mhanifiisik/server/middleware"
)

func RegisterRoutes(app *fiber.App, cfg config.Config) {
	dbInstance := db.Init(cfg.DbUrl)
	friendController := controllers.NewFriendController(dbInstance)
	api := app.Group("/api", middleware.AuthMiddleware(cfg))

	

	friendRoutes := api.Group("/friends")
	friendRoutes.Post("/", friendController.AddFriend)
	friendRoutes.Get("/", friendController.GetFriends)
}
