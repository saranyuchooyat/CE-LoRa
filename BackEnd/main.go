package main

import (
	"log"
	"os"

	jwtware "github.com/gofiber/contrib/jwt"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	_ "github.com/saranyuchooyat/CE-LoRa/docs"
	fiberSwagger "github.com/swaggo/fiber-swagger"
)

// @title LoraWan Service API
// @version 1.0
// @description ระบบจัดการช่วยเหลือผู้สูงอายุผ่าน LoraWan
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description พิมพ์ Bearer แล้วตามด้วย token

func main() {
	ConnectMongo() // เรียกใช้ฟังก์ชันเชื่อมต่อ DB

	app := fiber.New()

	// CORS Setup
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept,Authorization",
	}))

	// Swagger & Public Routes
	app.Get("/swagger/*", fiberSwagger.WrapHandler)
	app.Post("/auth/login", login)

	// =====================================
	// Private Routes (ต้อง Login ก่อน)
	// =====================================

	// JWT Configuration
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "secret_lora_key_1234" // fallback secret
	}
	app.Use(jwtware.New(jwtware.Config{
		SigningKey: jwtware.SigningKey{Key: []byte(secret)},
	}))

	// --- Users ---
	app.Get("/users", getAllUser)        //✅
	app.Post("/users", createUser)       //✅
	app.Get("/users/:id", getUserByID)   //✅
	app.Put("/users/:id", updateUser)    //✅
	app.Delete("/users/:id", deleteUser) //✅
	app.Post("/users/:id/reset-password", resetPassword)

	// --- Zones ---
	app.Get("/zones", getAllZone)                      //✅
	app.Get("/zones/my-zones", getMyZone)              //✅
	app.Post("/zones/elderlyRegister", addEldertoZone) //✅
	app.Post("/zones", createZone)                     //✅

	// Dynamic Routes for Zones
	app.Put("/zones/:id", updateZone)                 //✅
	app.Delete("/zones/:id", deleteZone)              //✅
	app.Get("/zones/:id/dashboard", getZoneDashboard) //✅
	app.Get("/zones/:id/elder", getElderinZone)       //✅
	app.Get("/zones/:id/staff", getZoneStaff)         //✅

	// --- Elders ---
	app.Get("/elders", getAllElderly) //✅
	app.Put("/elders/:id", updateElder)
	app.Delete("/elders/:id", deleteElder)
	// app.Get("/elders/:id", getElderDetail)

	// --- Devices ---
	app.Get("/devices", getAllDevice)        //✅
	app.Post("/devices", createDevice)       //✅
	app.Put("/devices/:id", updateDevice)    //✅
	app.Delete("/devices/:id", deleteDevice) //✅
	app.Get("/device_data/:device_id", getDeviceDataByDeviceID)

	// --- System Dashboard ---
	app.Get("/dashboard/usage-trend", getUserTrend)    //mock
	app.Get("/dashboard/summary", getDashSum)          //✅
	app.Get("/dashboard/top-zones", getTopZones)       //✅
	app.Get("/system/health/servers", getSystemHealth) //mock

	// Start Server
	log.Fatal(app.Listen(":8080"))
}
