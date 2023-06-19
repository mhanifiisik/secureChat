package app

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"github.com/mhanifiisik/server/config"
	"github.com/mhanifiisik/server/routes"
)

func StartServer() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalln("Failed to load config from env:", err)
	}

	app := fiber.New()
	app.Use(cors.New())
	app.Use(recover.New())
	app.Use(requestid.New())

	routes.RegisterAuthRoutes(app, cfg)
	routes.RegisterMessageRoutes(app,cfg)

	log.Fatal(app.Listen(cfg.Port))
}
