package main

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()

	app.Get("/user", getAllUser)
	app.Get("/user/:id", getUserByID)
	app.Get("/elder", getAllElderly)
	app.Get("/zone", getAllZone)
	app.Get("/device", getAllDevice)
	app.Get("/dashboard/summary", getDashSum)

	app.Post("/auth/login", login)
	app.Listen(":8080")
}

func getAllUser(c *fiber.Ctx) error {
	return c.JSON(users)
}

func getUserByID(c *fiber.Ctx) error {
	userID, err := strconv.Atoi(c.Params("id"))

	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}
	for _, u := range users {
		if u.ID == userID {
			return c.JSON(u)
		}
	}
	return c.JSON(users)
}
func getAllElderly(c *fiber.Ctx) error {
	return c.JSON(elderlys)
}

func getAllZone(c *fiber.Ctx) error {
	return c.JSON(zones)
}

func getAllDevice(c *fiber.Ctx) error {
	return c.JSON(devices)
}

func getDashSum(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"zonesCount":   len(zones),
		"usersCount":   len(users),
		"elderlyCount": len(elderlys),
		"devicesCount": len(devices),
	})
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
