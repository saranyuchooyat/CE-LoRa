package main

import (
	"sort"
	"strconv"

	"github.com/gofiber/fiber/v2"

	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

// func getAllUser(c *fiber.Ctx) error {
// 	return c.JSON(users)
// }

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

// func createUser(c *fiber.Ctx) error {
// 	user := new(User)

// 	if err := c.BodyParser(user); err != nil {
// 		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
// 	}

// 	users = append(users, *user)
// 	return c.JSON(user)
// }

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

// func updateUser(c *fiber.Ctx) error {
// 	userID, err := strconv.Atoi(c.Params("id"))

// 	if err != nil {
// 		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
// 	}

// 	userUpdate := new(User)
// 	if err := c.BodyParser(userUpdate); err != nil {
// 		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
// 	}

// 	for i, u := range users {
// 		if u.UserID == userID {
// 			if userUpdate.Username != "" {
// 				users[i].Username = userUpdate.Username
// 			}
// 			if userUpdate.Password != "" {
// 				users[i].Password = userUpdate.Password
// 			}
// 			if userUpdate.Role != "" {
// 				users[i].Role = userUpdate.Role
// 			}
// 			return c.JSON(users[i])
// 		}
// 	}

// 	return c.SendStatus(fiber.StatusNotFound)
// }

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

// func deleteUser(c *fiber.Ctx) error {
// 	userID, err := strconv.Atoi(c.Params("id"))

// 	if err != nil {
// 		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
// 	}

// 	for i, u := range users {
// 		if u.UserID == userID {
// 			users = append(users[:i], users[i+1:]...)
// 			return c.SendStatus(fiber.StatusNoContent)
// 		}
// 	}
// 	return c.SendStatus(fiber.StatusNotFound)
// }

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

// func getUserByID(c *fiber.Ctx) error {
// 	userID, err := strconv.Atoi(c.Params("id"))

// 	if err != nil {
// 		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
// 	}
// 	for _, u := range users {
// 		if u.UserID == userID {
// 			return c.JSON(u)
// 		}
// 	}
// 	return c.JSON(users)
// }

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
	return c.JSON(elderlys)
}

func getAllZone(c *fiber.Ctx) error {
	return c.JSON(zones)
}

func createZone(c *fiber.Ctx) error {
	zone := new(Zone)
	if err := c.BodyParser(zone); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	zones = append(zones, *zone)
	return c.JSON(zone)
}

func updateZone(c *fiber.Ctx) error {
	zoneID, err := strconv.Atoi(c.Params("id"))

	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	zoneUpdate := new(Zone)
	if err := c.BodyParser(zoneUpdate); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	for i, z := range zones {
		if z.ZoneID == zoneID {
			if zoneUpdate.ZoneName != "" {
				zones[i].ZoneName = zoneUpdate.ZoneName
			}
			if zoneUpdate.Address != "" {
				zones[i].Address = zoneUpdate.Address
			}
			if zoneUpdate.Description != "" {
				zones[i].Description = zoneUpdate.Description
			}
			if zoneUpdate.Status != "" {
				zones[i].Status = zoneUpdate.Status
			}

			return c.JSON(zones[i])
		}
	}

	return c.SendStatus(fiber.StatusNotFound)
}

func deleteZone(c *fiber.Ctx) error {
	zoneID, err := strconv.Atoi(c.Params("id"))

	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	for i, z := range zones {
		if z.ZoneID == zoneID {
			zones = append(zones[:i], zones[i+1:]...)
			return c.SendStatus(fiber.StatusNoContent)
		}
	}
	return c.SendStatus(fiber.StatusNotFound)
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

func getAllDevice(c *fiber.Ctx) error {
	return c.JSON(devices)
}

func getDashSum(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"zonesCount": len(zones),
		// "usersCount":   len(users),
		"elderlyCount": len(elderlys),
		"devicesCount": len(devices),
	})
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

// func login(c *fiber.Ctx) error {
// 	type LoginRequest struct {
// 		Username string `json:"username"`
// 		Password string `json:"password"`
// 	}

// 	req := new(LoginRequest)

// 	if err := c.BodyParser(req); err != nil {
// 		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
// 			"error": "ไม่เจอข้อมูล JSON",
// 		})
// 	}

// 	for _, u := range users {
// 		if u.Username == req.Username && u.Password == req.Password {
// 			return c.JSON(fiber.Map{
// 				"message":  "Login success",
// 				"id":       u.UserID,
// 				"username": u.Username,
// 				"role":     u.Role,
// 			})
// 		}
// 	}
// 	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
// 		"message": "Login Failed",
// 		"error":   "invalid username or password",
// 	})
// }

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
