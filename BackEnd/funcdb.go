package main

import (
	"context"
	"fmt"
	"math/rand"
	"net/smtp"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var jwtSecret = []byte("secret_lora_key_1234")

// Helper: เรียกใช้ MI.DB จาก mongo.go
func getCollection(collectionName string) *mongo.Collection {
	return MI.DB.Collection(collectionName)
}

// AUTHENTICATION
func login(c *fiber.Ctx) error {
	type LoginRequest struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	req := new(LoginRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user User
	err := getCollection("users").FindOne(ctx, bson.M{
		"username": req.Username,
		"password": req.Password,
	}).Decode(&user)

	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Login Failed",
			"error":   "Invalid username or password",
		})
	}

	claims := jwt.MapClaims{
		"user_id":  user.UserID,
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	t, err := token.SignedString(jwtSecret)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not generate token"})
	}

	return c.JSON(fiber.Map{
		"message": "Login success",
		"token":   t,
		"user": fiber.Map{
			"id":       user.UserID,
			"username": user.Username,
			"role":     user.Role,
			"name":     user.FirstName + " " + user.LastName,
		},
	})
}

// DASHBOARD FUNCTIONS
func getDashSum(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	usersCount, _ := getCollection("users").CountDocuments(ctx, bson.M{})
	zonesCount, _ := getCollection("zones").CountDocuments(ctx, bson.M{})
	eldersCount, _ := getCollection("elders").CountDocuments(ctx, bson.M{})
	devicesCount, _ := getCollection("devices").CountDocuments(ctx, bson.M{})

	return c.JSON(fiber.Map{
		"zonesCount":   zonesCount,
		"usersCount":   usersCount,
		"elderlyCount": eldersCount,
		"devicesCount": devicesCount,
	})
}

func getTopZones(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 5)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	pipeline := mongo.Pipeline{
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "elders"},
			{Key: "localField", Value: "zone_id"},
			{Key: "foreignField", Value: "zone_id"},
			{Key: "as", Value: "elder_list"},
		}}},

		{{Key: "$addFields", Value: bson.D{
			{Key: "active_user", Value: bson.D{{Key: "$size", Value: "$elder_list"}}},
		}}},

		{{Key: "$project", Value: bson.D{
			{Key: "elder_list", Value: 0},
		}}},

		{{Key: "$sort", Value: bson.D{{Key: "active_user", Value: -1}}}},

		{{Key: "$limit", Value: limit}},
	}

	cursor, err := getCollection("zones").Aggregate(ctx, pipeline)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	defer cursor.Close(ctx)

	var topZones []Zone
	if err = cursor.All(ctx, &topZones); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"topzones": topZones})
}

func getSystemHealth(c *fiber.Ctx) error {
	return c.JSON([]fiber.Map{
		{
			"name":        "LoRaWAN Server",
			"cpuUsage":    45,
			"memoryUsed":  "8GB",
			"memoryTotal": "16GB",
			"diskUsed":    "120GB",
			"diskTotal":   "500GB",
		},
		{
			"name":        "Database Server",
			"cpuUsage":    60,
			"memoryUsed":  "12GB",
			"memoryTotal": "32GB",
			"diskUsed":    "800GB",
			"diskTotal":   "1TB",
		},
		{
			"name":        "Web Server",
			"cpuUsage":    30,
			"memoryUsed":  "4GB",
			"memoryTotal": "8GB",
			"diskUsed":    "50GB",
			"diskTotal":   "256GB",
		},
	})
}

func getUserTrend(c *fiber.Ctx) error {
	trends := []UsageTrend{
		{Date: "2024-02-01", ActiveUsers: 10},
		{Date: "2024-02-02", ActiveUsers: 15},
		{Date: "2024-02-03", ActiveUsers: 12},
		{Date: "2024-02-04", ActiveUsers: 20},
		{Date: "2024-02-05", ActiveUsers: 18},
	}
	return c.JSON(fiber.Map{"trend": trends})
}

// USER MANAGEMENT
func getAllUser(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	cursor, err := getCollection("users").Find(ctx, bson.M{})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	var users []User = []User{}
	cursor.All(ctx, &users)
	return c.JSON(users)
}

func getUserByID(c *fiber.Ctx) error {
	id := c.Params("id")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	var user User
	err := getCollection("users").FindOne(ctx, bson.M{"user_id": id}).Decode(&user)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}
	return c.JSON(user)
}

func createUser(c *fiber.Ctx) error {
	user := new(User)
	if err := c.BodyParser(user); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"user_id": bson.M{"$regex": "^UID"}}
	opts := options.FindOne().SetSort(bson.M{"user_id": -1})

	var lastUser User
	err := getCollection("users").FindOne(ctx, filter, opts).Decode(&lastUser)

	if err == nil {
		var lastNum int
		_, scanErr := fmt.Sscanf(lastUser.UserID, "UID%03d", &lastNum)
		if scanErr == nil {
			user.UserID = fmt.Sprintf("UID%03d", lastNum+1)
		} else {
			user.UserID = fmt.Sprintf("UID%03d", rand.Intn(9999))
		}
	} else {
		user.UserID = "UID001"
	}

	if user.ID.IsZero() {
		user.ID = primitive.NewObjectID()
	}

	count, _ := getCollection("users").CountDocuments(ctx, bson.M{"user_id": user.UserID})
	if count > 0 {
		return c.Status(400).JSON(fiber.Map{"error": "User ID already exists (System Error)"})
	}

	_, err = getCollection("users").InsertOne(ctx, user)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create user"})
	}

	return c.Status(201).JSON(user)
}

func updateUser(c *fiber.Ctx) error {
	id := c.Params("id")
	userUpdate := new(User)
	if err := c.BodyParser(userUpdate); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	updateFields := bson.M{}
	if userUpdate.Username != "" {
		updateFields["username"] = userUpdate.Username
	}
	if userUpdate.FirstName != "" {
		updateFields["first_name"] = userUpdate.FirstName
	}
	if userUpdate.LastName != "" {
		updateFields["last_name"] = userUpdate.LastName
	}
	if userUpdate.Role != "" {
		updateFields["role"] = userUpdate.Role
	}
	if userUpdate.Phone != "" {
		updateFields["phone"] = userUpdate.Phone
	}
	if userUpdate.Email != "" {
		updateFields["email"] = userUpdate.Email
	}
	if userUpdate.Password != "" {
		updateFields["password"] = userUpdate.Password
	}
	if userUpdate.ZoneID != "" {
		updateFields["zone_id"] = userUpdate.ZoneID
	}
	_, err := getCollection("users").UpdateOne(ctx, bson.M{"user_id": id}, bson.M{"$set": updateFields})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Update failed"})
	}
	return c.JSON(fiber.Map{"message": "User updated", "id": id})
}

func deleteUser(c *fiber.Ctx) error {
	id := c.Params("id")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	res, err := getCollection("users").DeleteOne(ctx, bson.M{"user_id": id})
	if err != nil || res.DeletedCount == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}
	return c.SendStatus(204)
}

// ZONE MANAGEMENT
func getAllZone(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	cursor, err := getCollection("zones").Find(ctx, bson.M{})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	var zones []Zone = []Zone{}
	cursor.All(ctx, &zones)
	return c.JSON(zones)
}

func getMyZone(c *fiber.Ctx) error {
	userToken := c.Locals("user").(*jwt.Token)
	claims := userToken.Claims.(jwt.MapClaims)
	userID := claims["user_id"].(string)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var currentUser User
	err := getCollection("users").FindOne(ctx, bson.M{"user_id": userID}).Decode(&currentUser)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}
	if currentUser.ZoneID == "" {
		return c.JSON([]Zone{})
	}
	var myZones []Zone = []Zone{}
	cursor, err := getCollection("zones").Find(ctx, bson.M{"zone_id": currentUser.ZoneID})
	if err == nil {
		cursor.All(ctx, &myZones)
	}
	return c.JSON(myZones)
}

func createZone(c *fiber.Ctx) error {
	zone := new(Zone)
	if err := c.BodyParser(zone); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"zone_id": bson.M{"$regex": "^Z"}}
	opts := options.FindOne().SetSort(bson.M{"zone_id": -1})

	var lastZone Zone
	err := getCollection("zones").FindOne(ctx, filter, opts).Decode(&lastZone)

	if err == nil {
		var lastNum int
		_, scanErr := fmt.Sscanf(lastZone.ZoneID, "Z%03d", &lastNum)
		if scanErr == nil {
			zone.ZoneID = fmt.Sprintf("Z%03d", lastNum+1)
		} else {
			zone.ZoneID = fmt.Sprintf("Z%03d", rand.Intn(999))
		}
	} else {
		zone.ZoneID = "Z001"
	}

	if zone.Status == "" {
		zone.Status = "active"
	}

	_, err = getCollection("zones").InsertOne(ctx, zone)
	if err != nil {
		fmt.Println("❌ Insert Zone Error:", err)
		return c.Status(500).JSON(fiber.Map{"error": "Create zone failed: " + err.Error()})
	}

	fmt.Println("✅ Create Zone Success:", zone.ZoneID)
	return c.Status(201).JSON(zone)
}

func updateZone(c *fiber.Ctx) error {
	id := c.Params("id")
	zoneUpdate := new(Zone)
	if err := c.BodyParser(zoneUpdate); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	updateFields := bson.M{}
	if zoneUpdate.ZoneName != "" {
		updateFields["zone_name"] = zoneUpdate.ZoneName
	}
	if zoneUpdate.ZoneAddress != "" {
		updateFields["zone_address"] = zoneUpdate.ZoneAddress
	}
	if zoneUpdate.Status != "" {
		updateFields["status"] = zoneUpdate.Status
	}
	getCollection("zones").UpdateOne(ctx, bson.M{"zone_id": id}, bson.M{"$set": updateFields})
	return c.JSON(fiber.Map{"message": "Zone updated"})
}

func deleteZone(c *fiber.Ctx) error {
	id := c.Params("id")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	getCollection("zones").DeleteOne(ctx, bson.M{"zone_id": id})
	return c.SendStatus(204)
}

// ELDERLY & DEVICES
func getAllElderly(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var elders []Elder = []Elder{}

	cursor, err := getCollection("elders").Find(ctx, bson.M{})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Database error: " + err.Error()})
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &elders); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error decoding data"})
	}

	return c.JSON(elders)
}

func getElderinZone(c *fiber.Ctx) error {
	zoneID := c.Params("id")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var elders []Elder = []Elder{}

	cursor, err := getCollection("elders").Find(ctx, bson.M{"zone_id": zoneID})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch elders"})
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &elders); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to decode elders"})
	}
	return c.JSON(elders)
}

func addEldertoZone(c *fiber.Ctx) error {
	elder := new(Elder)
	if err := c.BodyParser(elder); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid data format"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"elder_id": bson.M{"$regex": "^E"}}
	opts := options.FindOne().SetSort(bson.M{"elder_id": -1})

	var lastElder Elder
	err := getCollection("elders").FindOne(ctx, filter, opts).Decode(&lastElder)

	if err == nil {
		var lastNum int
		_, scanErr := fmt.Sscanf(lastElder.ElderID, "E%03d", &lastNum)
		if scanErr == nil {
			elder.ElderID = fmt.Sprintf("E%03d", lastNum+1)
		} else {
			elder.ElderID = fmt.Sprintf("E%03d", rand.Intn(999))
		}
	} else {
		elder.ElderID = "E001"
	}

	if elder.ID.IsZero() {
		elder.ID = primitive.NewObjectID()
	}

	_, err = getCollection("elders").InsertOne(ctx, elder)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to add elder: " + err.Error()})
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "Elder added successfully",
		"elder":   elder,
	})
}

func getAllDevice(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	var devices []Device = []Device{}
	cursor, _ := getCollection("devices").Find(ctx, bson.M{})
	cursor.All(ctx, &devices)
	return c.JSON(devices)
}

func createDevice(c *fiber.Ctx) error {
	device := new(Device)
	if err := c.BodyParser(device); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"device_id": bson.M{"$regex": "^D"}}
	opts := options.FindOne().SetSort(bson.M{"device_id": -1})

	var lastDevice Device
	err := getCollection("devices").FindOne(ctx, filter, opts).Decode(&lastDevice)

	if err == nil {
		var lastNum int
		_, scanErr := fmt.Sscanf(lastDevice.DeviceID, "D%03d", &lastNum)
		if scanErr == nil {
			device.DeviceID = fmt.Sprintf("D%03d", lastNum+1)
		} else {
			device.DeviceID = fmt.Sprintf("D%03d", rand.Intn(999))
		}
	} else {
		device.DeviceID = "D001"
	}

	if device.ID.IsZero() {
		device.ID = primitive.NewObjectID()
	}

	_, err = getCollection("devices").InsertOne(ctx, device)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create device"})
	}

	return c.Status(201).JSON(device)
}

func updateDevice(c *fiber.Ctx) error {
	id := c.Params("id")
	deviceUpdate := new(Device)

	if err := c.BodyParser(deviceUpdate); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ข้อมูลไม่ถูกต้อง"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	updateFields := bson.M{}

	if deviceUpdate.DeviceName != "" {
		updateFields["device_name"] = deviceUpdate.DeviceName
	}

	if deviceUpdate.Description != "" {
		updateFields["description"] = deviceUpdate.Description
	}

	if len(updateFields) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "กรุณาระบุข้อมูลที่ต้องการแก้ไข"})
	}

	result, err := getCollection("devices").UpdateOne(
		ctx,
		bson.M{"device_id": id},
		bson.M{"$set": updateFields},
	)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ไม่สามารถอัปเดตข้อมูลได้"})
	}

	if result.MatchedCount == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "ไม่พบอุปกรณ์รหัส " + id})
	}

	return c.JSON(fiber.Map{
		"message":   "อัปเดตอุปกรณ์สำเร็จ",
		"device_id": id,
	})
}

func deleteDevice(c *fiber.Ctx) error {
	id := c.Params("id")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := getCollection("devices").DeleteOne(ctx, bson.M{"device_id": id})

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ไม่สามารถเชื่อมต่อฐานข้อมูลได้"})
	}

	if result.DeletedCount == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "ไม่พบอุปกรณ์รหัส " + id})
	}

	return c.SendStatus(204)
}

func getDeviceDataByDeviceID(c *fiber.Ctx) error {
	id := c.Params("device_id")
	return c.JSON(fiber.Map{
		"device_id": id,
		"status":    "online",
		"data":      []string{"data1", "data2"},
	})
}

func getZoneDashboard(c *fiber.Ctx) error {
	zoneID := c.Params("id")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var zone Zone
	err := getCollection("zones").FindOne(ctx, bson.M{"zone_id": zoneID}).Decode(&zone)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Zone not found"})
	}

	var zoneElders []Elder = []Elder{}
	cursor, err := getCollection("elders").Find(ctx, bson.M{"zone_id": zoneID})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error fetching elders"})
	}
	if err = cursor.All(ctx, &zoneElders); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error decoding elders"})
	}

	deviceStatus := map[string]int{"online": 0, "offline": 0, "total": 0}
	var alertsInZone []Alert = []Alert{}

	for _, e := range zoneElders {
		if e.DeviceID != "" {
			deviceStatus["total"]++

			status := "online"
			if rand.Intn(10) < 2 {
				status = "offline"
			}

			if status == "online" {
				deviceStatus["online"]++
			} else {
				deviceStatus["offline"]++
				alertsInZone = append(alertsInZone, Alert{
					ID:          rand.Intn(10000),
					Title:       "Device Offline",
					Description: fmt.Sprintf("อุปกรณ์ของ %s %s ขาดการเชื่อมต่อ", e.FirstName, e.LastName),
					CreatedAt:   time.Now().Format(time.RFC3339),
					Severity:    "High", // เพิ่มความรุนแรง (ถ้ามี field นี้)
				})
			}
		}

		if e.HealthStatus == "Critical" {
			alertsInZone = append(alertsInZone, Alert{
				ID:          rand.Intn(10000),
				Title:       "Critical Health",
				Description: fmt.Sprintf("ผู้สูงอายุ %s %s อยู่ในภาวะวิกฤต", e.FirstName, e.LastName),
				CreatedAt:   time.Now().Format(time.RFC3339),
				Severity:    "Critical",
			})
		}
	}

	return c.JSON(fiber.Map{
		"zone": fiber.Map{
			"id":          zone.ZoneID,
			"name":        zone.ZoneName,
			"status":      zone.Status,
			"activeUsers": len(zoneElders),
		},
		"elderlyCount": len(zoneElders),
		"deviceStatus": deviceStatus,
		"alerts":       alertsInZone,
		"elders":       zoneElders,
	})
}

// UTILS
func resetPassword(c *fiber.Ctx) error {
	id := c.Params("id")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	var user User
	err := getCollection("users").FindOne(ctx, bson.M{"user_id": id}).Decode(&user)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}
	newPass := generateRandomPassword(10)
	getCollection("users").UpdateOne(ctx, bson.M{"user_id": id}, bson.M{"$set": bson.M{"password": newPass}})
	go sendEmail(user.Email, "Reset Password", "New Password: "+newPass)
	return c.JSON(fiber.Map{"message": "Password reset sent to email", "new_password_preview": newPass})
}

func generateRandomPassword(length int) string {
	letters := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	b := make([]rune, length)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

func sendEmail(to, subject, body string) error {
	from := "legazink@gmail.com"
	password := "kwrp owck otsh ozab"
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"
	msg := "From: " + from + "\n" + "To: " + to + "\n" + "Subject: " + subject + "\n\n" + body
	auth := smtp.PlainAuth("", from, password, smtpHost)
	return smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, []byte(msg))
}
