package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/mhanifiisik/server/config"
	"github.com/mhanifiisik/server/utils"
)

func AuthMiddleware(cfg config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authorization := c.Get("Authorization")
		if authorization == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   true,
				"message": "Missing token in Authorization header",
			})
		}

		tokenPrefix := "Bearer "
		if strings.HasPrefix(authorization, tokenPrefix) {
			token := strings.Replace(authorization, tokenPrefix, "", 1)
			claims, err := utils.ValidateToken(token, cfg.SecretKey)
			if err != nil {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"error":   true,
					"message": "Invalid token",
				})
			}

			userID, ok := claims["user_id"].(string)
			if !ok {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"error":   true,
					"message": "Invalid token claims",
				})
			}

			c.Locals("userID", userID)
			return c.Next()
		}

		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid token format",
		})
	}
}


