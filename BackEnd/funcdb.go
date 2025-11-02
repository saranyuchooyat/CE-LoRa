package main

import (
	"github.com/gofiber/fiber/v2"

	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

func getAllUser(c *fiber.Ctx) error {
	var users []User
	collection := db.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return c.Status(500).SendString("Failed to fetch users: " + err.Error())
	}
	defer cursor.Close(ctx)

	if err := cursor.All(ctx, &users); err != nil {
		return c.Status(500).SendString("Failed to decode users: " + err.Error())
	}

	return c.JSON(users)
}

func createUser(c *fiber.Ctx) error {
	user := new(User)

	if err := c.BodyParser(user); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	collection := db.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := collection.InsertOne(ctx, user)
	if err != nil {
		return c.Status(500).SendString("Failed to insert user: " + err.Error())
	}

	return c.Status(201).JSON(user)
}

func updateUser(c *fiber.Ctx) error {
	id := c.Params("id")

	var userUpdate User
	if err := c.BodyParser(&userUpdate); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	collection := db.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	update := bson.M{"$set": userUpdate}
	result, err := collection.UpdateOne(ctx, bson.M{"user_id": id}, update)
	if err != nil || result.MatchedCount == 0 {
		return c.Status(404).SendString("User not found or update failed")
	}

	return c.JSON(fiber.Map{"message": "User updated successfully"})
}

func deleteUser(c *fiber.Ctx) error {
	id := c.Params("id")

	collection := db.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := collection.DeleteOne(ctx, bson.M{"user_id": id})
	if err != nil {
		return c.Status(500).SendString("Failed to delete user: " + err.Error())
	}
	if result.DeletedCount == 0 {
		return c.Status(404).SendString("User not found")
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func getUserByID(c *fiber.Ctx) error {
	id := c.Params("id") // สมมุติว่า id = user_id (UID0001)

	var user User
	collection := db.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err := collection.FindOne(ctx, bson.M{"user_id": id}).Decode(&user)
	if err != nil {
		return c.Status(404).SendString("User not found")
	}

	return c.JSON(user)
}

func getAllElderly(c *fiber.Ctx) error {
	var elders []Elder
	collection := db.Collection("elders")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return c.Status(500).SendString("Failed to fetch elders: " + err.Error())
	}
	defer cursor.Close(ctx)

	if err := cursor.All(ctx, &elders); err != nil {
		return c.Status(500).SendString("Failed to decode elders: " + err.Error())
	}

	return c.JSON(elders)
}

func getAllZone(c *fiber.Ctx) error {
	var zones []Zone
	collection := db.Collection("zones")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return c.Status(500).SendString("Failed to fetch zones: " + err.Error())
	}
	defer cursor.Close(ctx)

	if err := cursor.All(ctx, &zones); err != nil {
		return c.Status(500).SendString("Failed to decode zones: " + err.Error())
	}

	return c.JSON(zones)
}

func createZone(c *fiber.Ctx) error {
	zone := new(Zone)
	if err := c.BodyParser(zone); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	collection := db.Collection("zones")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := collection.InsertOne(ctx, zone)
	if err != nil {
		return c.Status(500).SendString("Failed to insert zone: " + err.Error())
	}

	return c.Status(201).JSON(zone)
}

func updateZone(c *fiber.Ctx) error {
	id := c.Params("id")

	var zoneUpdate Zone
	if err := c.BodyParser(&zoneUpdate); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	collection := db.Collection("zones")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	update := bson.M{"$set": zoneUpdate}
	result, err := collection.UpdateOne(ctx, bson.M{"zone_id": id}, update)
	if err != nil || result.MatchedCount == 0 {
		return c.Status(404).SendString("Zone not found or update failed")
	}

	return c.JSON(fiber.Map{"message": "Zone updated successfully"})
}

func deleteZone(c *fiber.Ctx) error {
	id := c.Params("id")

	collection := db.Collection("zones")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := collection.DeleteOne(ctx, bson.M{"zone_id": id})
	if err != nil {
		return c.Status(500).SendString("Failed to delete zone: " + err.Error())
	}
	if result.DeletedCount == 0 {
		return c.Status(404).SendString("Zone not found")
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func getAllDevice(c *fiber.Ctx) error {
	var devices []Device
	collection := db.Collection("devices")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return c.Status(500).SendString("Failed to fetch devices: " + err.Error())
	}
	defer cursor.Close(ctx)

	if err := cursor.All(ctx, &devices); err != nil {
		return c.Status(500).SendString("Failed to decode devices: " + err.Error())
	}

	return c.JSON(devices)
}

func getDeviceDataByDeviceID(c *fiber.Ctx) error {
	deviceID := c.Params("device_id")

	var data []DeviceData
	collection := db.Collection("device_data")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// filter ตาม device_id
	cursor, err := collection.Find(ctx, bson.M{"device_id": deviceID})
	if err != nil {
		return c.Status(500).SendString("Failed to fetch device data: " + err.Error())
	}
	defer cursor.Close(ctx)

	if err := cursor.All(ctx, &data); err != nil {
		return c.Status(500).SendString("Failed to decode device data: " + err.Error())
	}

	if len(data) == 0 {
		return c.Status(404).SendString("No data found for device_id: " + deviceID)
	}

	return c.JSON(data)
}

func getHealthservers(c *fiber.Ctx) error {
	return c.JSON(servers)
}

func getAlert(c *fiber.Ctx) error {
	return c.JSON(alerts)
}

func getUserTrend(c *fiber.Ctx) error {
	days := c.QueryInt("days", 30)

	if days < len(usageTrends) {
		return c.JSON(fiber.Map{
			"trend": usageTrends[len(usageTrends)-days:],
		})
	}
	return c.JSON(fiber.Map{
		"trend": usageTrends,
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

	collection := db.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user User
	err := collection.FindOne(ctx, bson.M{
		"username": req.Username,
		"password": req.Password, // ❗️ในโปรจริงควรใช้ hash password
	}).Decode(&user)

	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Login Failed",
			"error":   "invalid username or password",
		})
	}

	return c.JSON(fiber.Map{
		"message":  "Login success",
		"id":       user.UserID,
		"username": user.Username,
		"role":     user.Role,
	})
}
