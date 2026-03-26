package main

import (
	"context"
	"fmt"
	"math/rand"
	"net/smtp"
	"strings"
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

	_, updateErr := getCollection("users").UpdateOne(ctx,
		bson.M{"_id": user.ID},
		bson.M{"$set": bson.M{
			"is_online":  true,
			"last_login": time.Now(),
		}},
	)

	if updateErr != nil {
		fmt.Println("Warning: Failed to update online status:", updateErr)
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
			"id":           user.UserID,
			"username":     user.Username,
			"role":         user.Role,
			"name":         user.FirstName + " " + user.LastName,
			"is_caregiver": user.IsCaregiver,
		},
	})
}

func logout(c *fiber.Ctx) error {
	// ดึง Token จาก Header ออกมาเพื่อเช็คว่าใครกำลังเรียกใช้
	userToken := c.Locals("user").(*jwt.Token)
	claims := userToken.Claims.(jwt.MapClaims)
	userID := claims["user_id"].(string)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 🎯 สั่งให้ MongoDB อัปเดตสถานะ is_online กลับเป็น false
	_, err := getCollection("users").UpdateOne(ctx,
		bson.M{"user_id": userID},
		bson.M{"$set": bson.M{"is_online": false}},
	)

	if err != nil {
		fmt.Println("Error updating offline status:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to logout"})
	}

	return c.JSON(fiber.Map{"message": "Logout successful"})
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

	if user.AccountStatus == "" {
		user.AccountStatus = "Active"
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
	if userUpdate.AccountStatus != "" {
		updateFields["account_status"] = userUpdate.AccountStatus
	}

	// ✅ กรองขยะ (ค่าว่าง) ออกจาก Array ของ AssignedElders ก่อน
	var validElderIds []string
	if userUpdate.AssignedElders != nil {
		for _, eID := range userUpdate.AssignedElders {
			if eID != "" {
				validElderIds = append(validElderIds, eID)
			}
		}
	} else {
		validElderIds = []string{}
	}

	// ✅ ยัด 2 ฟิลด์ใหม่ลงไป (ข้อมูลคลีนๆ ไม่มีช่องว่างหลงเหลือ)
	updateFields["is_caregiver"] = userUpdate.IsCaregiver
	updateFields["assigned_elders"] = validElderIds

	// =========================================================
	// 🎯 1. อัปเดตข้อมูลฝั่ง User
	// =========================================================
	_, err := getCollection("users").UpdateOne(ctx, bson.M{"user_id": id}, bson.M{"$set": updateFields})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Update failed"})
	}

	// =========================================================
	// 🎯 2. ซิงค์ข้อมูลไปยังฝั่ง Elders
	// =========================================================

	// 2.1 ล้างไพ่: ดึง user_id ของสตาฟคนนี้ออกจากผู้สูงอายุทุกคนก่อน
	// (ใช้ $pull เผื่อกรณีที่แอดมินปลดสตาฟออกจากการดูแลคนไข้บางคน)
	_, err = getCollection("elders").UpdateMany(
		ctx,
		bson.M{"caregiver_user_id": id},
		bson.M{"$pull": bson.M{"caregiver_user_id": id}},
	)
	if err != nil {
		fmt.Println("Error pulling caregiver from elders:", err)
	}

	// 2.2 จ่ายไพ่ใหม่: ถ้าเป็น Caregiver ให้เอา user_id ไปใส่ให้ผู้สูงอายุที่ถูกเลือก
	if userUpdate.IsCaregiver && len(validElderIds) > 0 {
		// ใช้ $addToSet ยัด user_id เข้าไป (ป้องกันการใส่ค่าซ้ำ)
		_, err = getCollection("elders").UpdateMany(
			ctx,
			bson.M{"elder_id": bson.M{"$in": validElderIds}},
			bson.M{"$addToSet": bson.M{"caregiver_user_id": id}},
		)
		if err != nil {
			fmt.Println("Error pushing caregiver to elders:", err)
		}
	}

	return c.JSON(fiber.Map{"message": "User updated and synced with elders successfully", "id": id})
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

	var currentUser bson.M
	err := getCollection("users").FindOne(ctx, bson.M{"user_id": userID}).Decode(&currentUser)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	// 1. แกะรหัสโซนออกมา
	var zoneIDs []string
	if rawZone, ok := currentUser["zone_id"]; ok {
		switch v := rawZone.(type) {
		case string:
			if v != "" {
				// ✅ อัปเกรด: ถ้า Database เก็บมาเป็น "Z001,Z002" ให้หั่นแบ่งด้วยลูกน้ำ
				parts := strings.Split(v, ",")
				for _, p := range parts {
					zoneIDs = append(zoneIDs, strings.TrimSpace(p))
				}
			}
		case bson.A: // กรณีเป็น Array ใน MongoDB
			for _, val := range v {
				if strVal, ok := val.(string); ok {
					zoneIDs = append(zoneIDs, strVal)
				}
			}
		}
	}

	// 🔍 2. ปริ้นท์เช็คใน Terminal (สำคัญมาก! เอาไว้ดูว่ามันดึงโซนอะไรมาได้บ้าง)
	fmt.Println("=====================================")
	fmt.Printf("🧐 Debug User: %s\n", userID)
	fmt.Printf("🧐 Zone IDs extracted: %v\n", zoneIDs)
	fmt.Println("=====================================")

	if len(zoneIDs) == 0 {
		return c.JSON([]fiber.Map{}) // คืนค่า Array ว่างถ้าไม่มีโซน
	}

	// 3. ไปดึงข้อมูลโซนจาก Collection zones
	var myZones []bson.M // ใช้ bson.M เพื่อความเหนียวแน่น ไม่ต้องกลัว Struct พัง
	cursor, err := getCollection("zones").Find(ctx, bson.M{"zone_id": bson.M{"$in": zoneIDs}})
	if err == nil {
		defer cursor.Close(ctx)
		cursor.All(ctx, &myZones)
	}

	if myZones == nil {
		myZones = []bson.M{}
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
func getElderDetail(c *fiber.Ctx) error {
	// 1. รับ ID จาก URL (เช่น /elders/E001)
	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{"error": "ID is required"})
	}

	// 2. ดึงคอลเลกชัน (ตรวจสอบชื่อ collection ให้ตรงกับที่พี่ใช้นะครับ)
	collection := getCollection("elders")

	var elder bson.M

	// 3. ค้นหาด้วยฟิลด์ "elder_id" โดยตรง (ใช้ id ที่เป็น string ได้เลย)
	err := collection.FindOne(context.Background(), bson.M{"elder_id": id}).Decode(&elder)

	if err != nil {
		// กรณีหาไม่เจอในระบบ
		return c.Status(404).JSON(fiber.Map{"error": "ไม่พบข้อมูลผู้สูงอายุรหัสนี้"})
	}

	// 4. ส่งข้อมูลกลับไปให้ React
	return c.Status(200).JSON(elder)
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

func updateElder(c *fiber.Ctx) error {
	id := c.Params("id")
	elderUpdate := new(Elder)
	if err := c.BodyParser(elderUpdate); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ข้อมูลไม่ถูกต้อง"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	updateFields := bson.M{}

	// ... (โค้ดเช็คตัวแปรอื่นๆ เหมือนเดิม) ...

	if elderUpdate.PersonalMedicine != "" {
		updateFields["personal_medicine"] = elderUpdate.PersonalMedicine
	}

	if elderUpdate.EmergencyContacts != "" {
		updateFields["emergency_contacts"] = elderUpdate.EmergencyContacts
	}

	if elderUpdate.EmergencyContactName != "" {
		updateFields["emergency_contact_name"] = elderUpdate.EmergencyContactName
	}

	if elderUpdate.Address != "" {
		updateFields["address"] = elderUpdate.Address
	}

	if len(updateFields) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "กรุณาระบุข้อมูลที่ต้องการแก้ไข"})
	}

	result, err := getCollection("elders").UpdateOne(ctx, bson.M{"elder_id": id}, bson.M{"$set": updateFields})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ไม่สามารถอัปเดตข้อมูลได้"})
	}
	if result.MatchedCount == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "ไม่พบผู้สูงอายุรหัส " + id})
	}

	return c.JSON(fiber.Map{
		"message":  "อัปเดตข้อมูลสำเร็จ",
		"elder_id": id,
	})
}

func deleteElder(c *fiber.Ctx) error {
	id := c.Params("id")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := getCollection("elders").DeleteOne(ctx, bson.M{"elder_id": id})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ไม่สามารถเชื่อมต่อฐานข้อมูลได้"})
	}

	if result.DeletedCount == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "ไม่พบผู้สูงอายุรหัส " + id})
	}

	return c.SendStatus(204)
}

func getAllDevice(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 1. ดึงรายชื่ออุปกรณ์ทั้งหมดจากตาราง devices
	cursor, err := getCollection("devices").Find(ctx, bson.M{})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ดึงข้อมูลอุปกรณ์ไม่สำเร็จ"})
	}

	var devices []bson.M
	if err = cursor.All(ctx, &devices); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ถอดรหัสข้อมูลไม่สำเร็จ"})
	}

	// 2. วนลูปเพื่อเอา "สถานะล่าสุด" มาแปะใส่แต่ละ Card
	for i, device := range devices {
		currentStatus, _ := device["status"].(string)
		assignedTo, _ := device["assigned_to"].(string)

		// ถ้ายังไม่ได้มอบหมาย (unassigned) ให้ข้ามการคำนวณ Online/Offline
		if currentStatus == "unassigned" || assignedTo == "" || assignedTo == "None" {
			devices[i]["status"] = "unassigned"
			devices[i]["battery"] = 0
			continue
		}

		targetName := device["device_name"]

		var latestData bson.M
		filter := bson.M{"device.device_name": targetName}
		opts := options.FindOne().SetSort(bson.D{{Key: "timestamp", Value: -1}})

		// แอบไปดูในสมุดบันทึก (device_data) ว่ามีข้อมูลล่าสุดไหม
		err := MI.DB.Collection("device_data").FindOne(ctx, filter, opts).Decode(&latestData)

		if err == nil {
			// 1. ดึงแบตเตอรี่
			if swData, ok := latestData["smartwatch_data"].(bson.M); ok {
				devices[i]["battery"] = swData["device_battery"]
			}

			// 2. คำนวณสถานะ Online/Offline
			lastUpdateStr, _ := latestData["timestamp"].(string)
			lastUpdateTime, _ := time.Parse(time.RFC3339, lastUpdateStr)

			var newStatus string
			duration := time.Since(lastUpdateTime)

			if duration.Minutes() > 5 {
				newStatus = "offline"
				elderID := getElderIDByName(assignedTo)
				if elderID != "" {
					CreateAlertWithCheck(elderID, "🔌 นาฬิกาขาดการติดต่อ!", "นาฬิกาของ "+assignedTo+" ออฟไลน์ (เกิน 5 นาที)", "medium", "OFFLINE")
				}
			} else {
				newStatus = "online"
			}

			// 3. ยัดค่าใส่ตัวแปรที่จะส่งไปหน้าบ้าน
			devices[i]["status"] = newStatus
			devices[i]["last_update"] = lastUpdateStr

			if currentStatus != newStatus {
				MI.DB.Collection("devices").UpdateOne(ctx,
					bson.M{"device_name": targetName},
					bson.M{"$set": bson.M{"status": newStatus}},
				)
			}
		} else {

			devices[i]["status"] = "offline"
			devices[i]["battery"] = 0

			if currentStatus != "offline" {
				MI.DB.Collection("devices").UpdateOne(ctx,
					bson.M{"device_name": targetName},
					bson.M{"$set": bson.M{"status": "offline"}},
				)
			}
		}
	}

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
func getDeviceOwnerbyID(c *fiber.Ctx) error {
	deviceID := c.Params("id")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var elder bson.M

	// 2. ไปที่ collection "elders" เพื่อหาคนที่มี device_id ตรงกับเครื่องนี้
	err := getCollection("elders").FindOne(ctx, bson.M{"device_id": deviceID}).Decode(&elder)

	if err != nil {
		return c.Status(404).JSON(fiber.Map{
			"message": "อุปกรณ์นี้ยังไม่มีผู้ครอบครอง",
		})
	}

	return c.JSON(elder)
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
	if deviceUpdate.Status != "" {
		updateFields["status"] = deviceUpdate.Status
	}
	if deviceUpdate.AssignedTo != "" {
		updateFields["assigned_to"] = deviceUpdate.AssignedTo
	}

	if deviceUpdate.Model != "" {
		updateFields["model"] = deviceUpdate.Model
	}

	if len(updateFields) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "กรุณาระบุข้อมูลที่ต้องการแก้ไข"})
	}

	result, err := getCollection("devices").UpdateOne(
		ctx,
		bson.M{"device_id": id},
		bson.M{"$set": updateFields},
	)

	if err != nil || result.MatchedCount == 0 {
		return c.Status(500).JSON(fiber.Map{"error": "ไม่พบอุปกรณ์หรืออัปเดตไม่ได้"})
	}

	if deviceUpdate.AssignedTo != "" {
		// ขั้นตอนที่ A: ล้าง device_id ออกจาก Elder คนเก่าที่เคยถือเครื่องนี้
		// (คนไหนเคยมี device_id นี้ ให้กลายเป็นค่าว่าง)
		getCollection("elders").UpdateMany(ctx,
			bson.M{"device_id": id},
			bson.M{"$set": bson.M{"device_id": ""}},
		)

		// ขั้นตอนที่ B: อัปเดต device_id ให้คนใหม่
		fullName := deviceUpdate.AssignedTo
		nameParts := strings.Split(fullName, " ")

		if len(nameParts) >= 2 {
			firstName := nameParts[0]
			lastName := nameParts[1]

			_, err = getCollection("elders").UpdateOne(ctx,
				bson.M{"first_name": firstName, "last_name": lastName},
				bson.M{"$set": bson.M{"device_id": id}},
			)
			if err != nil {
				fmt.Println("Warning: Failed to link elder:", err)
			}
		}
	}

	return c.JSON(fiber.Map{
		"message":   "อัปเดตอุปกรณ์และผู้สูงอายุสำเร็จ",
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

func getDeviceDataByDeviceName(c *fiber.Ctx) error {
	deviceID := c.Params("device_id")

	var deviceProfile bson.M
	err := MI.DB.Collection("devices").FindOne(c.Context(), bson.M{"device_id": deviceID}).Decode(&deviceProfile)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"message": "ไม่พบเครื่องนี้ในระบบ"})
	}

	targetName := deviceProfile["device_name"]

	// 2. หาข้อมูลล่าสุดชุดเดียวจาก device_data โดยเทียบกับ device_name
	var latestData bson.M
	filter := bson.M{
		"device.device_name": targetName,
	}
	// Sort ตาม timestamp จากใหม่ไปเก่า (-1) และเอาแค่อันเดียว
	opts := options.FindOne().SetSort(bson.D{{Key: "timestamp", Value: -1}})

	err = MI.DB.Collection("device_data").FindOne(c.Context(), filter, opts).Decode(&latestData)
	// กรณีหาชื่อเจอแต่ใน device_data ยังไม่มีข้อมูล
	if err != nil {
		return c.JSON(fiber.Map{
			"info": deviceProfile,
			"data": nil,
		})
	}

	// 3. ส่งข้อมูลรวมร่างกลับไป
	return c.JSON(fiber.Map{
		"info": deviceProfile, // ข้อมูลจากตาราง devices
		"data": latestData,    // ข้อมูลล่าสุดจากตาราง device_data
	})

}

func getZoneDashboard(c *fiber.Ctx) error {
	zoneID := c.Params("id")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 1. ดึงรายชื่อผู้สูงอายุใน Zone นี้ (ได้ zoneElders)
	var zoneElders []Elder
	cursor, err := getCollection("elders").Find(ctx, bson.M{"zone_id": zoneID})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error fetching elders"})
	}
	cursor.All(ctx, &zoneElders)

	// 2. ดึง Devices ทั้งหมดมาทำ Map (Key คือ assigned_to) เพื่อให้ Match เร็วๆ
	var allDevices []bson.M
	deviceCursor, _ := getCollection("devices").Find(ctx, bson.M{})
	deviceCursor.All(ctx, &allDevices)

	// สร้างตัวช่วยค้นหา: [ชื่อ-นามสกุล] -> "online"/"offline"
	deviceStatusMap := make(map[string]string)
	for _, d := range allDevices {
		// ดึงค่าจากฟิลด์ assigned_to และ status ตามรูปที่พี่ส่งมา
		assignedTo, _ := d["assigned_to"].(string)
		status, _ := d["status"].(string)

		if assignedTo != "" {
			deviceStatusMap[assignedTo] = status
			fmt.Println(deviceStatusMap[assignedTo])
		}
	}

	// 3. เตรียมตัวนับสรุปผล
	summary := map[string]int{
		"online":  0,
		"offline": 0,
		"total":   0,
	}

	// 4. วนลูป zoneElders เพื่อ Match กับ deviceStatusMap
	for _, e := range zoneElders {
		summary["total"]++

		// ประกอบชื่อให้ตรงกับ format ใน assigned_to (สมมติว่าใน DB เก็บ "ชื่อ นามสกุล")
		fullName := e.FirstName + " " + e.LastName

		status, found := deviceStatusMap[fullName]
		if found && status == "online" {
			summary["online"]++
		} else {
			summary["offline"]++
		}
	}

	// 5. ส่งผลลัพธ์กลับไปให้ ZoneDashboardDetail.js
	return c.JSON(fiber.Map{
		"deviceStatus": summary,
		"elders":       zoneElders,
		"alerts":       []string{}, // เว้นไว้ก่อนหรือใส่แจ้งเตือนตามเดิม
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

func getZoneStaff(c *fiber.Ctx) error {
	zoneID := c.Params("id") // รับรหัสโซนจาก URL เช่น Z001

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var users []User = []User{}

	filter := bson.M{
		"zone_id": primitive.Regex{
			Pattern: "(^|\\s*,\\s*)" + zoneID + "(\\s*,\\s*|$)",
			Options: "i",
		},
	}

	cursor, err := getCollection("users").Find(ctx, filter)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch staff"})
	}
	defer cursor.Close(ctx) // ป้องกัน Memory Leak

	if err = cursor.All(ctx, &users); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Error decoding data"})
	}

	return c.JSON(users)
}

func CreateAlert(elderID, zoneID, title, desc, severity, alertType string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// ดึง Alert ตัวล่าสุด 1 ตัว เพื่อดู ID ล่าสุด
	opts := options.FindOne().SetSort(bson.D{{Key: "created_at", Value: -1}})
	var lastAlert bson.M
	err := MI.DB.Collection("alerts").FindOne(ctx, bson.M{}, opts).Decode(&lastAlert)

	nextNumber := 1
	if err == nil {
		// ถ้าเจอตัวล่าสุด ให้แงะเลขออกมาบวก 1 (เช่น จาก A005 เป็น 6)
		lastIDStr, _ := lastAlert["alert_id"].(string)
		fmt.Sscanf(lastIDStr, "A%03d", &nextNumber)
		nextNumber++
	}
	nextAlertID := fmt.Sprintf("A%03d", nextNumber)

	// 2. เตรียมข้อมูล
	newEntry := bson.M{
		"alert_id":    nextAlertID,
		"zone_id":     zoneID,
		"elder_id":    elderID,
		"title":       title,
		"description": desc,
		"severity":    severity,
		"type":        alertType,
		"status":      "unread",
		"created_at":  time.Now().Format(time.RFC3339),
	}

	// 3. Insert ลง DB
	_, err = MI.DB.Collection("alerts").InsertOne(ctx, newEntry)
	if err != nil {
		fmt.Printf("Error inserting alert: %v\n", err)
		return err
	}

	return nil
}
func GetMyAlerts(c *fiber.Ctx) error {
	// 1. ดึง Token ออกมา (ปกติ JWT Middleware ของ Fiber จะเก็บไว้ใน "user")
	userToken := c.Locals("user").(*jwt.Token)
	claims := userToken.Claims.(jwt.MapClaims)

	// 2. ดึง user_id ออกมาจาก Claims (ต้องชื่อเดียวกับตอนพี่ Generate Token นะ)
	userID, ok := claims["user_id"].(string)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "ไม่พบข้อมูลผู้ใช้ใน Token"})
	}

	// --- ส่วน Query เหมือนเดิม ---
	var user bson.M
	err := MI.DB.Collection("users").FindOne(context.Background(), bson.M{"user_id": userID}).Decode(&user)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	assigned, ok := user["assigned_elders"].(primitive.A)
	if !ok {
		return c.JSON([]interface{}{})
	}

	filter := bson.M{
		"status":   "unread",
		"elder_id": bson.M{"$in": assigned},
	}

	cursor, err := MI.DB.Collection("alerts").Find(context.Background(), filter)
	var alerts []bson.M
	cursor.All(context.Background(), &alerts)

	return c.JSON(alerts)
}

func GetAlerts(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var alerts []Alert
	// ดึง 20 อันล่าสุด และเรียงจากใหม่ไปเก่า
	opts := options.Find().SetSort(bson.D{{"created_at", -1}}).SetLimit(20)

	cursor, err := getCollection("alerts").Find(ctx, bson.D{}, opts)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	if err = cursor.All(ctx, &alerts); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(alerts)
}

var hrCounters = make(map[string]int)

func checkHR(elderID string, currentHR int, elderName string) {
	if currentHR > 120 {
		hrCounters[elderID]++
		if hrCounters[elderID] >= 3 {

			CreateAlertWithCheck(elderID, "💓 หัวใจเต้นเร็วเกินไป", elderName+" มีอัตราการเต้นหัวใจสูงติดต่อกัน 3 ครั้ง ("+fmt.Sprintf("%d", currentHR)+")", "medium", "HR")
			hrCounters[elderID] = 0
		}
	} else if currentHR < 50 && currentHR > 0 {

		CreateAlertWithCheck(elderID, "💙 หัวใจเต้นช้าผิดปกติ", elderName+" มีอัตราการเต้นหัวใจต่ำ ("+fmt.Sprintf("%d", currentHR)+")", "high", "HR")
	} else {
		hrCounters[elderID] = 0
	}
}

func MarkAlertRead(c *fiber.Ctx) error {
	alertID := c.Params("id")
	objID, _ := primitive.ObjectIDFromHex(alertID)

	filter := bson.M{"_id": objID}
	update := bson.M{"$set": bson.M{"status": "read"}}

	_, err := MI.DB.Collection("alerts").UpdateOne(context.Background(), filter, update)
	if err != nil {
		return c.Status(500).SendString("Update failed")
	}
	return c.SendStatus(200)
}

func GetUnreadCount(c *fiber.Ctx) error {
	count, err := MI.DB.Collection("alerts").CountDocuments(context.Background(), bson.M{"status": "unread"})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"count": 0})
	}
	return c.JSON(fiber.Map{"count": count})
}

func DeleteAlert(c *fiber.Ctx) error {
	// 1. รับ ID จาก URL Parameter (เช่น /api/alerts/65f123...)
	id := c.Params("id")

	// 2. แปลง string ID เป็น ObjectID ของ MongoDB
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ID ไม่ถูกต้อง"})
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 3. สั่งลบจาก Collection "alerts"
	result, err := MI.DB.Collection("alerts").DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ลบการแจ้งเตือนไม่สำเร็จ"})
	}

	// 4. เช็คว่ามีข้อมูลให้ลบไหม
	if result.DeletedCount == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "ไม่พบการแจ้งเตือนที่ต้องการลบ"})
	}

	return c.JSON(fiber.Map{"message": "ลบการแจ้งเตือนเรียบร้อยแล้ว"})
}

func StartAlertMonitor() {
	go func() {
		for {
			ctx := context.Background()
			cursor, err := MI.DB.Collection("devices").Find(ctx, bson.M{"status": "online"})
			if err == nil {
				var devices []bson.M
				cursor.All(ctx, &devices)

				for _, device := range devices {

					checkDeviceAndCreateAlert(device)
				}
			}
			time.Sleep(1 * time.Second)
		}
	}()
}

func checkDeviceAndCreateAlert(device bson.M) {
	ctx := context.Background()
	targetName := device["device_name"]
	assignedName, _ := device["assigned_to"].(string)

	var elder bson.M
	elderID := ""
	filter := bson.M{
		"$expr": bson.M{
			"$eq": bson.A{
				bson.M{"$concat": bson.A{"$first_name", " ", "$last_name"}},
				assignedName,
			},
		},
	}

	err := MI.DB.Collection("elders").FindOne(ctx, filter).Decode(&elder)

	if err == nil {
		elderID, _ = elder["elder_id"].(string)
	}

	if elderID == "" {
		return
	}

	var latestData bson.M
	opts := options.FindOne().SetSort(bson.D{{Key: "timestamp", Value: -1}})
	err = MI.DB.Collection("device_data").FindOne(ctx, bson.M{"device.device_name": targetName}, opts).Decode(&latestData)

	if err == nil {
		if swData, ok := latestData["smartwatch_data"].(bson.M); ok {

			// --- 🚨 1. เช็คการล้ม (Boolean) ---
			if fall, ok := swData["is_fallen"].(bool); ok && fall {
				CreateAlertWithCheck(elderID, "🔴 ตรวจพบการล้ม!", "คุณ "+assignedName+" อาจเกิดอุบัติเหตุล้มลง", "high", "FALL")
			}
			// --- 💓 2. เช็คอัตราการเต้นหัวใจ ---
			var hr int
			if val, ok := swData["heart_rate"]; ok {
				switch v := val.(type) {
				case int32:

					hr = int(v)
				}
			}
			if hr > 0 {
				// เรียกใช้ checkHR ที่พี่เขียนไว้ (มันมีตัวนับ 3 ครั้งอยู่แล้ว แจ่มมากครับ)
				checkHR(elderID, int(hr), assignedName)
			}

			// --- 🪫 3. เช็คแบตเตอรี่ ---
			var batt float64
			if val, ok := swData["device_battery"]; ok {
				switch v := val.(type) {
				case float64:
					batt = v
				case int32:
					batt = float64(v)
				}
			}
			if batt < 20 && batt > 0 {
				CreateAlertWithCheck(elderID, "🪫 แบตเตอรี่ต่ำ", "นาฬิกาของ "+assignedName+" เหลือ "+fmt.Sprintf("%.0f", batt)+"%", "low", "BATT")
			}
		}
	}
}

// ฟังก์ชันใหม่: เช็คก่อนสร้าง เพื่อไม่ให้ Alert ขยะเต็ม DB
func CreateAlertWithCheck(elderID, title, desc, severity, alertType string) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 1. เช็คว่ามี Alert ประเภทนี้ ของผู้สูงอายุคนนี้ ที่ "ยังไม่อ่าน" ค้างอยู่ไหม
	filter := bson.M{
		"elder_id": elderID,
		"type":     alertType,
		"status":   "unread",
	}

	count, _ := MI.DB.Collection("alerts").CountDocuments(ctx, filter)

	// 2. ถ้าไม่มีอันเดิมค้างอยู่ ถึงจะสร้างอันใหม่
	if count == 0 {
		var elder bson.M
		err := MI.DB.Collection("elders").FindOne(ctx, bson.M{"elder_id": elderID}).Decode(&elder)

		zoneID := ""
		if err == nil {
			zoneID, _ = elder["zone_id"].(string)
		}

		// 3. ส่ง zoneID เข้าไปในฟังก์ชัน CreateAlert ด้วย
		CreateAlert(elderID, zoneID, title, desc, severity, alertType)
	}
}

// GetZoneSummaryReport API สรุปข้อมูลสำหรับทำหน้า Report Dashboard
func GetZoneSummaryReport(c *fiber.Ctx) error {
	zoneID := c.Params("id")
	timeFilter := c.Query("filter", "all")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// ==========================================
	// 1. ดึงข้อมูล Elders และเตรียม Device IDs, Elder IDs
	// ==========================================
	var elders []bson.M
	cursor, err := getCollection("elders").Find(ctx, bson.M{"zone_id": zoneID})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ไม่สามารถดึงข้อมูลผู้สูงอายุได้"})
	}
	cursor.All(ctx, &elders)

	var elderIDs []string
	var deviceIDs []string
	for _, e := range elders {
		if eID, ok := e["elder_id"].(string); ok {
			elderIDs = append(elderIDs, eID)
		}
		if dID, ok := e["device_id"].(string); ok && dID != "" {
			deviceIDs = append(deviceIDs, dID)
		}
	}

	// ==========================================
	// 2. นับจำนวน Staff ในโซนนี้
	// ==========================================
	staffCount, _ := getCollection("users").CountDocuments(ctx, bson.M{
		"zone_id": bson.M{"$regex": zoneID},
		"role":    "Zone Staff",
	})

	// ==========================================
	// 3. เช็คสถานะ Devices (Online / Offline)
	// ==========================================
	onlineCount, _ := getCollection("devices").CountDocuments(ctx, bson.M{
		"device_id": bson.M{"$in": deviceIDs},
		"status":    "online",
	})

	offlineCount, _ := getCollection("devices").CountDocuments(ctx, bson.M{
		"device_id": bson.M{"$in": deviceIDs},
		"status":    "offline",
	})

	// ==========================================
	// 4. สรุป Alerts (เปลี่ยนเป็น Critical, Warning, Normal)
	// ==========================================
	alertMatch := bson.M{"elder_id": bson.M{"$in": elderIDs}}

	if timeFilter != "all" {
		now := time.Now()
		var pastTime time.Time

		switch timeFilter {
		case "1m":
			pastTime = now.AddDate(0, -1, 0)
		case "3m":
			pastTime = now.AddDate(0, -3, 0)
		case "6m":
			pastTime = now.AddDate(0, -6, 0)
		}

		if !pastTime.IsZero() {
			alertMatch["created_at"] = bson.M{"$gte": pastTime.Format(time.RFC3339)}
		}
	}

	// ✅ เปลี่ยนชื่อตัวแปรให้ตรงกับสถานะใหม่
	criticalCount, warningCount, normalCount := 0, 0, 0

	if len(elderIDs) > 0 {
		pipeline := mongo.Pipeline{
			{{Key: "$match", Value: alertMatch}},
			{{Key: "$group", Value: bson.D{
				{Key: "_id", Value: "$severity"},
				{Key: "count", Value: bson.D{{Key: "$sum", Value: 1}}},
			}}},
		}

		alertCursor, _ := getCollection("alerts").Aggregate(ctx, pipeline)
		var alertResults []bson.M
		alertCursor.All(ctx, &alertResults)

		for _, res := range alertResults {
			sev, _ := res["_id"].(string)

			// เซฟตี้ไว้เผื่อ MongoDB คืนค่า count มาเป็น int32 หรือ int64
			var count int
			if v, ok := res["count"].(int32); ok {
				count = int(v)
			} else if v, ok := res["count"].(int64); ok {
				count = int(v)
			}

			// ✅ เทียบกับสถานะใหม่
			switch sev {
			case "critical":
				criticalCount = count
			case "warning":
				warningCount = count
			case "normal":
				normalCount = count
			}
		}
	}

	// ==========================================
	// 🎯 ส่งข้อมูลกลับไปให้หน้าบ้าน
	// ==========================================
	return c.JSON(fiber.Map{
		"total_elders": len(elderIDs),
		"total_staff":  staffCount,
		"device_status": fiber.Map{
			"online":  onlineCount,
			"offline": offlineCount,
		},
		"alerts_summary": fiber.Map{
			"critical": criticalCount,
			"warning":  warningCount,
			"normal":   normalCount,
		},
	})
}

func getElderIDByName(name string) string {
	if name == "" || name == "None" {
		return ""
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var elder bson.M
	filter := bson.M{
		"$expr": bson.M{
			"$eq": bson.A{
				bson.M{"$concat": bson.A{"$first_name", " ", "$last_name"}},
				name,
			},
		},
	}

	err := MI.DB.Collection("elders").FindOne(ctx, filter).Decode(&elder)
	if err != nil {
		return ""
	}

	id, _ := elder["elder_id"].(string)
	return id
}

func heartbeat(c *fiber.Ctx) error {
	// 1. ดึง ID ว่าใครส่งชีพจรมา
	userToken := c.Locals("user").(*jwt.Token)
	claims := userToken.Claims.(jwt.MapClaims)
	userID := claims["user_id"].(string)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 2. อัปเดตเวลาล่าสุด (last_active) และย้ำว่ายัง Online อยู่
	_, err := getCollection("users").UpdateOne(ctx,
		bson.M{"user_id": userID},
		bson.M{"$set": bson.M{
			"last_active": time.Now(),
			"is_online":   true,
		}},
	)

	if err != nil {
		fmt.Println("Error updating heartbeat:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to beat"})
	}

	return c.SendStatus(fiber.StatusOK)
}

func StartOnlineStatusMonitor() {
	ticker := time.NewTicker(1 * time.Minute) // ยามเดินตรวจทุกๆ 1 นาที

	go func() {
		for range ticker.C {
			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)

			// กำหนดเส้นตาย: เวลาปัจจุบัน ถอยหลังไป 2 นาที
			deadline := time.Now().Add(-2 * time.Minute)

			// ค้นหาคนที่ Online อยู่ แต่ last_active เก่ากว่า 2 นาที แล้วจับเปลี่ยนเป็น false ให้หมด
			_, err := getCollection("users").UpdateMany(ctx,
				bson.M{
					"is_online":   true,
					"last_active": bson.M{"$lt": deadline}, // $lt = less than (เก่ากว่า)
				},
				bson.M{"$set": bson.M{"is_online": false}},
			)

			if err != nil {
				fmt.Println("Monitor Error:", err)
			}
			cancel()
		}
	}()
}
