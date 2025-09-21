package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

var users []User

func main() {
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:5173",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	users = append(users, User{ID: 1, Username: "yu", Password: "1234", Role: "System Admin"})
	users = append(users, User{ID: 2, Username: "ink", Password: "5678", Role: "Zone Admin"})
	users = append(users, User{ID: 3, Username: "eak", Password: "9999", Role: "Zone Staff"})

	app.Get("/User", getUser)
	app.Post("/auth/login", login)
	app.Listen(":8080")
}

func getUser(c *fiber.Ctx) error {
	return c.JSON(users)
}

func login(c *fiber.Ctx) error {
	type LoginRequest struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	req := new(LoginRequest)

	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ไม่เจอข้อมูล JSON",
		})
	}

	for _, u := range users {
		if u.Username == req.Username && u.Password == req.Password {
			return c.JSON(fiber.Map{
				"message":  "Login success",
				"id":       u.ID,
				"username": u.Username,
				"role":     u.Role,
			})
		}
	}
	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
		"message": "Login Failed",
		"error":   "invalid username or password",
	})
}
