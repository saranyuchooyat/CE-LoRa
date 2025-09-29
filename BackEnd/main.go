package main

import (
	"github.com/gofiber/fiber/v2"

	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))
	app.Get("/users", getAllUser)
	app.Get("/users/:id", getUserByID)
	app.Post("/users", createUser)
	app.Put("/users/:id", updateUser)
	app.Delete("/users/:id", deleteUser)
	app.Post("/users/:id/reset-password", resetPassword)

	app.Get("/zones", getAllZone)
	app.Post("/zones", createZone)
	app.Put("/zones/:id", updateZone)
	app.Delete("/zones/:id", deleteZone)

	app.Post("/auth/login", login)

	app.Get("/elders", getAllElderly)

	app.Get("/system/health/servers", getHealthservers)
	app.Get("/system/alerts", getAlert)
	app.Get("/devices", getAllDevice)

	app.Get("/dashboard/usage-trend", getUserTrend)
	app.Get("/dashboard/summary", getDashSum)
	app.Get("/dashboard/top-zones", getTopZones)
	app.Listen(":8080")
}
