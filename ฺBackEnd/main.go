package main

import (
	"sort"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()

	app.Get("/users", getAllUser)
	app.Get("/users/:id", getUserByID)
	app.Get("/elders", getAllElderly)
	app.Get("/zones", getAllZone)
	app.Get("/devices", getAllDevice)
	app.Get("/dashboard/summary", getDashSum)
	app.Get("/dashboard/top-zones", getTopZones)

	app.Post("/users", createUser)
	app.Post("/zones", createZone)
	app.Post("/auth/login", login)
	app.Listen(":8080")
}

func getAllUser(c *fiber.Ctx) error {
	return c.JSON(users)
}

func createUser(c *fiber.Ctx) error {
	user := new(User)

	if err := c.BodyParser(user); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	users = append(users, *user)
	return c.JSON(user)
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

func getTopZones(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 5)

	zonescopy := make([]Zone, len(zones))
	copy(zonescopy, zones)

	sort.Slice(zonescopy, func(i, j int) bool {
		return zonescopy[i].ActiveUser > zonescopy[j].ActiveUser
	})

	if limit > len(zonescopy) {
		limit = len(zonescopy)
	}
	return c.JSON(fiber.Map{
		"topzones": zonescopy[:limit],
	})

}

func createZone(c *fiber.Ctx) error {
	zone := new(Zone)
	if err := c.BodyParser(zone); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	zones = append(zones, *zone)
	return c.JSON(zone)
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
