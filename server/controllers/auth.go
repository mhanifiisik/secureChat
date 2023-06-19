package controllers

import (
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/mhanifiisik/server/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthController struct {
	DB          *gorm.DB
	TokenSecret []byte
}

type Claims struct {
	UserID string `json:"user_id"`
	jwt.StandardClaims
}

func NewAuthController(db *gorm.DB, tokenSecret string) *AuthController {
	return &AuthController{
		DB:          db,
		TokenSecret: []byte(tokenSecret),
	}
}

type SignUpRequest struct {
	Name              string `json:"name"`
	Email             string `json:"email"`
	Password          string `json:"password"`
	ConfirmPassword   string `json:"confirm_password"`
	Photo             string `json:"photo"`
}

type SignInRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (ac *AuthController) SignUp(c *fiber.Ctx) error {
	var req SignUpRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Invalid request body",
		})
	}

	if req.Password != req.ConfirmPassword {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Passwords do not match",
		})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to create user",
		})
	}

	user := models.User{
		UserID:        uuid.New(),
		Name:      req.Name,
		Email:     req.Email,
		Password:  string(hashedPassword),
		Photo:     req.Photo,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	result := ac.DB.Create(&user)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   true,
			"message": "Failed to create user",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "User created successfully",
		"user":    user,
	})
}

func (ac *AuthController) SignIn(c *fiber.Ctx) error {
		type SignInRequest struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		var req SignInRequest


		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Invalid request body",
			})
		}
		log.Println("SignIn req:", req) 

		var user models.User
		result := ac.DB.Where("email = ?", req.Email).First(&user)
		if result.Error != nil {
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"error":   true,
					"message": "Invalid email or password",
				})
			}
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Failed to sign in",
			})
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   true,
				"message": "Invalid email or password",
			})
		}

		token := jwt.New(jwt.SigningMethodHS256)
		claims := token.Claims.(jwt.MapClaims)
		claims["user_id"] = user.UserID
		claims["email"] = user.Email

		expirationTime := time.Now().Add(time.Hour * 24) 
		claims["exp"] = expirationTime.Unix()

		tokenString, err := token.SignedString(ac.TokenSecret)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   true,
				"message": "Failed to sign in",
			})
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"success": true,
			"message": "User authenticated successfully",
			"token":   tokenString,
		})
	}


	func (ac *AuthController) Logout(c *fiber.Ctx) error {
		tokenString := c.Get("Authorization")
		fmt.Println("Token:", tokenString) // Print the token for debugging purposes
	
		if tokenString == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": "Missing token in Authorization header",
			})
		}
	
		tokenString = strings.Replace(tokenString, "Bearer ", "", 1)
	
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return ac.TokenSecret, nil
		})
		invalidTokenMessage:="Invalid token"
		if err != nil {
			fmt.Println("Token parsing error:", err) 
	
			if err == jwt.ErrSignatureInvalid {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"error":   true,
					"message": "Invalid token signature",
				})
			}
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":   true,
				"message": invalidTokenMessage,
			})
		}
	
		if !token.Valid {
			fmt.Println(invalidTokenMessage) 
	
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   true,
				"message": invalidTokenMessage,
			})
		}
	
		fmt.Println("User logged out successfully") 
	
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"success": true,
			"message": "User logged out successfully",
		})
	}
	

