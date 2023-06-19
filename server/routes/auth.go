package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mhanifiisik/server/config"
	"github.com/mhanifiisik/server/controllers"
	"github.com/mhanifiisik/server/db"
)

func RegisterAuthRoutes(app *fiber.App,cfg config.Config) {
	dbInstance := db.Init(cfg.DbUrl)
	authController := controllers.NewAuthController(dbInstance,cfg.SecretKey)

	app.Post("/api/auth/signup", authController.SignUp)
	app.Post("/api/auth/signin", authController.SignIn)
	app.Get("/api/auth/logout", authController.Logout)
}
