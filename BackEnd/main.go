package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

// @title LoraWan Service API
// @version 1.0
// @description ระบบจัดการช่วยเหลือผู้สูงอายุผ่าน LoraWan
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description พิมพ์ Bearer  แล้วตามด้วย token เช่น Bearer eyJhbGciOiJIUzI1NiIsInR5...

func main() {
	ConnectMongo()

	app := fiber.New()

	app.Get("/swagger/*", fiberSwagger.WrapHandler)

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept,Authorization",
	}))

	app.Post("/auth/login", login)

	// app.Use(jwtware.New(jwtware.Config{
	// 	SigningKey: []byte(os.Getenv("JWT_SECRET")),
	// }))

	// app.Use(checkMiddleWare)
	app.Get("/users", getAllUser)
	app.Get("/users/:id", getUserByID)
	app.Post("/users", createUser)
	app.Put("/users/:id", updateUser)
	app.Delete("/users/:id", deleteUser)
	// app.Post("/users/:id/reset-password", resetPassword)

	app.Get("/zones", getAllZone)
	// app.Get("/zones/my-zones", getMyZone)
	app.Post("/zones", createZone)
	app.Put("/zones/:id", updateZone)
	app.Delete("/zones/:id", deleteZone)
	// app.Get("/zones/:id/dashboard", getZoneDashboard)
	// app.Post("zones/elderlyRegister", addEldertoZone)
	// app.Get("/zones/:id/elder", getElderinZone)

	app.Get("/elders", getAllElderly)
	app.Get("/elders/:id", getElderDetail)

	//zone staff
	app.Get("/zones/:id/elders", getElderinZone)
	app.Get("/zones/:id/elders/alertandstatus", getElderAlertandstatus)

	app.Get("/devices", getAllDevice)
	// app.Post("/devices", createDevice)
	// app.Put("/devices/:id", updateDevice)
	// app.Delete("/devices/:id", deleteDevice)
	app.Get("/device_data/:device_id", getDeviceDataByDeviceID)

	app.Get("/dashboard/usage-trend", getUserTrend)
	// app.Get("/dashboard/summary", getDashSum)
	// app.Get("/dashboard/top-zones", getTopZones)
	app.Listen(":8080")
}
