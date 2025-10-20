package main

import (
	"fmt"
	"math/rand"
	"net/smtp"
	"os"
	"sort"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

func checkMiddleWare(c *fiber.Ctx) error {
	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	fmt.Println(claims)
	if claims["role"] == "Zone Admin" || claims["role"] == "System Admin" {
		return c.Next()
	}
	return fiber.ErrUnauthorized

}

// getAllUser godoc
// @Summary Get all users
// @Description ดึงข้อมูลผู้ใช้งานทั้งหมด
// @Tags User
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {array} User
// @Failure 401 {object} ErrorResponse
// @Router /users [get]
func getAllUser(c *fiber.Ctx) error {
	return c.JSON(users)
}

// createUser godoc
// @Summary Create a new user
// @Description สร้างผู้ใช้งานใหม่ในระบบ (UserID และสถานะจะถูกสร้างอัตโนมัติ)
// @Tags User
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body UserCreationRequest true "User details (UserID, Status, Permissions ถูกสร้างอัตโนมัติ)"
// @Success 201 {object} User
// @Failure 400 {object} ErrorResponse
// @Router /users [post]
func createUser(c *fiber.Ctx) error {
	req := new(UserCreationRequest)

	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	var rolePermissions = map[string][]string{
		"System Admin": {"manage_zones", "manage_users", "view_all"},
		"Zone Admin":   {"manage_elderly", "view_devices", "view_health"},
		"Zone Staff":   {"view_elderly", "view_health", "view_devices"},
	}

	newUser := User{
		UserID:   len(users) + 1,
		Name:     req.Name,
		Email:    req.Email,
		Phone:    req.Phone,
		Username: req.Username,
		Password: req.Password,
		Role:     req.Role,
		ZoneIDs:  req.ZoneIDs,

		Status:    "active",
		CreatedAt: time.Now().Format("2006-01-02 15:04:05"),

		StaffInfo: &StaffDetail{
			Description: req.Description,
			Position:    req.Position,
		},
	}

	if perms, ok := rolePermissions[newUser.Role]; ok {
		newUser.Permissions = perms
	} else {
		newUser.Permissions = []string{}
	}

	users = append(users, newUser)
	return c.Status(fiber.StatusCreated).JSON(newUser)
}

// updateUser godoc
// @Summary Update user
// @Description อัปเดตข้อมูลผู้ใช้งานด้วย ID
// @Tags User
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "User ID"
// @Param request body UserUpdateRequest true "Fields to update (ใช้เฉพาะฟิลด์ที่ต้องการเปลี่ยน)"
// @Success 200 {object} User
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /users/{id} [put]
func updateUser(c *fiber.Ctx) error {
	userID, err := strconv.Atoi(c.Params("id"))

	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid User ID format"})
	}

	requestBody := new(UserUpdateRequest)
	if err := c.BodyParser(requestBody); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	for i := range users {
		if users[i].UserID == userID {

			if requestBody.Username != "" {
				users[i].Username = requestBody.Username
			}
			if requestBody.Name != "" {
				users[i].Name = requestBody.Name
			}
			if requestBody.Password != "" {

				users[i].Password = requestBody.Password
			}
			if requestBody.Role != "" {
				users[i].Role = requestBody.Role

			}
			if requestBody.Email != "" {
				users[i].Email = requestBody.Email
			}
			if requestBody.Phone != "" {
				users[i].Phone = requestBody.Phone
			}
			if len(requestBody.ZoneIDs) > 0 {
				users[i].ZoneIDs = requestBody.ZoneIDs
			}

			if users[i].StaffInfo == nil {
				users[i].StaffInfo = &StaffDetail{}
			}
			if requestBody.Position != "" {
				users[i].StaffInfo.Position = requestBody.Position
			}
			if requestBody.Description != "" {
				users[i].StaffInfo.Description = requestBody.Description
			}

			return c.Status(fiber.StatusOK).JSON(users[i])
		}
	}

	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
}

// deleteUser godoc
// @Summary Delete a user
// @Description ลบผู้ใช้งานออกจากระบบด้วย ID
// @Tags User
// @Security BearerAuth
// @Param id path int true "User ID ที่ต้องการลบ"
// @Success 204 "No Content (ลบสำเร็จ)"
// @Failure 400 {object} ErrorResponse "ID ไม่ถูกต้อง"
// @Failure 404 {object} ErrorResponse "ไม่พบผู้ใช้งาน"
// @Router /users/{id} [delete]
func deleteUser(c *fiber.Ctx) error {
	userID, err := strconv.Atoi(c.Params("id"))

	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	for i, u := range users {
		if u.UserID == userID {
			users = append(users[:i], users[i+1:]...)
			return c.SendStatus(fiber.StatusNoContent)
		}
	}
	return c.SendStatus(fiber.StatusNotFound)
}

// getUserByID godoc
// @Summary Get user by ID
// @Description ดึงข้อมูลผู้ใช้งานตาม ID
// @Tags User
// @Produce json
// @Security BearerAuth
// @Param id path int true "User ID ที่ต้องการดูข้อมูล"
// @Success 200 {object} User
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /users/{id} [get]
func getUserByID(c *fiber.Ctx) error {
	userID, err := strconv.Atoi(c.Params("id"))

	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}
	for _, u := range users {
		if u.UserID == userID {
			return c.JSON(u)
		}
	}
	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
}

// getAllElderly godoc
// @Summary Get all elderly records
// @Description ดึงข้อมูลผู้สูงอายุทั้งหมดในระบบ
// @Tags Elderly
// @Produce json
// @Security BearerAuth
// @Success 200 {array} Elderly
// @Router /elders [get]
func getAllElderly(c *fiber.Ctx) error {
	return c.JSON(elderlys)
}

// getAllZone godoc
// @Summary Get all zones
// @Description ดึงข้อมูลโซนดูแลผู้สูงอายุทั้งหมด
// @Tags Zone
// @Produce json
// @Security BearerAuth
// @Success 200 {array} Zone
// @Router /zones [get]
func getAllZone(c *fiber.Ctx) error {
	return c.JSON(zones)
}

// createZone godoc
// @Summary Create a new zone
// @Description สร้างโซนดูแลผู้สูงอายุใหม่
// @Tags Zone
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body ZoneCreationRequest true "Zone details (ZoneID และ Status จะถูกสร้างอัตโนมัติ)"
// @Success 201 {object} Zone
// @Failure 400 {object} ErrorResponse
// @Router /zones [post]
func createZone(c *fiber.Ctx) error {
	req := new(ZoneCreationRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	newZone := Zone{
		ZoneID:      len(zones) + 1,
		ZoneName:    req.ZoneName,
		Address:     req.Address,
		Description: req.Description,

		Status:     "Active",
		ActiveUser: 0,
	}

	zones = append(zones, newZone)
	return c.Status(fiber.StatusCreated).JSON(newZone)
}

// updateZone godoc
// @Summary Update zone details
// @Description อัปเดตข้อมูลโซนด้วย ID (เช่น ชื่อ, ที่อยู่, สถานะ)
// @Tags Zone
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Zone ID ที่ต้องการอัปเดต"
// @Param request body ZoneUpdateRequest true "Fields to update"
// @Success 200 {object} Zone
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /zones/{id} [put]
func updateZone(c *fiber.Ctx) error {
	zoneID, err := strconv.Atoi(c.Params("id"))

	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid Zone ID format"})
	}

	zoneUpdate := new(ZoneUpdateRequest)
	if err := c.BodyParser(zoneUpdate); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	for i := range zones {
		if zones[i].ZoneID == zoneID {

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

			return c.Status(fiber.StatusOK).JSON(zones[i])
		}
	}
	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Zone not found"})
}

// deleteZone godoc
// @Summary Delete a zone
// @Description ลบโซนดูแลผู้สูงอายุออกจากระบบ
// @Tags Zone
// @Security BearerAuth
// @Param id path int true "Zone ID ที่ต้องการลบ"
// @Success 204 "No Content (ลบสำเร็จ)"
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /zones/{id} [delete]
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

// getTopZones godoc
// @Summary Get top zones by active users
// @Description ดึงข้อมูลโซนที่มีผู้ใช้งาน Active มากที่สุด (เรียงตาม ActiveUser)
// @Tags Dashboard
// @Produce json
// @Security BearerAuth
// @Param limit query int false "จำนวนโซนสูงสุดที่ต้องการแสดง (ค่าเริ่มต้น: 5)"
// @Success 200 {object} TopZonesResponse
// @Router /dashboard/top-zones [get]
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

// getMyZone godoc
// @Summary Get zones assigned to the current user
// @Description ดึงรายการโซนที่ผูกกับผู้ใช้งานที่กำลัง Login อยู่ (อิงจาก JWT Token)
// @Tags Zone
// @Produce json
// @Security BearerAuth
// @Success 200 {array} Zone
// @Failure 401 {object} ErrorResponse "Unauthorized (Token ไม่ถูกต้อง)"
// @Failure 404 {object} ErrorResponse "User not found (ไม่พบผู้ใช้งานในระบบ)"
// @Router /zones/my-zones [get]
func getMyZone(c *fiber.Ctx) error {
	token := c.Locals("user").(*jwt.Token)
	claims := token.Claims.(jwt.MapClaims)
	userID := int(claims["userID"].(float64))

	var currentUser *User
	for i, u := range users {
		if u.UserID == userID {
			currentUser = &users[i]
			break
		}
	}

	if currentUser == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	myzone := []Zone{}
	for _, zid := range currentUser.ZoneIDs {
		for _, z := range zones {
			if z.ZoneID == zid {
				myzone = append(myzone, z)
			}
		}
	}

	return c.JSON(myzone)
}

// getZoneDashboard godoc
// @Summary Get dashboard data for a specific zone
// @Description ดึงข้อมูลสรุปสำหรับ Dashboard ของแต่ละโซน (ผู้สูงอายุ, สถานะอุปกรณ์, Alert)
// @Tags Zone
// @Produce json
// @Security BearerAuth
// @Param id path int true "Zone ID สำหรับ Dashboard"
// @Success 200 {object} ZoneDashboardResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /zones/{id}/dashboard [get]
func getZoneDashboard(c *fiber.Ctx) error {
	zoneID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid Zone ID"})
	}

	var zone *Zone
	for i, z := range zones {
		if z.ZoneID == zoneID {
			zone = &zones[i]
			break
		}
	}
	if zone == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Zone not found"})
	}
	var zoneElders []Elderly
	for _, e := range elderlys {
		if e.ZoneID == zoneID {
			zoneElders = append(zoneElders, e)
		}
	}
	deviceStatus := map[string]int{
		"online":  0,
		"offline": 0,
		"total":   0,
	}
	var alertsInZone []Alert

	for _, e := range zoneElders {
		for _, d := range devices {
			if e.DeviceID == d.DeviceID {
				deviceStatus["total"]++
				if d.Status == "online" {
					deviceStatus["online"]++
				} else if d.Status == "offline" {
					deviceStatus["offline"]++
					alertsInZone = append(alertsInZone, Alert{
						ID:          len(alertsInZone) + 1,
						Title:       fmt.Sprintf("อุปกรณ์ของ %s Offline", e.Name),
						Description: fmt.Sprintf("Device %s ไม่ออนไลน์ตั้งแต่ %s", d.DeviceID, d.LastUpdate),
						Type:        "warning",
						CreatedAt:   time.Now().Format(time.RFC3339),
					})
				}
				break
			}
		}
		if e.Status == "critical" {
			alertsInZone = append(alertsInZone, Alert{
				ID:          len(alertsInZone) + 1,
				Title:       fmt.Sprintf("Elder %s มีภาวะวิกฤต", e.Name),
				Description: fmt.Sprintf("อัตราการเต้นหัวใจ %d bpm, BP %s", e.Vitals.HeartRate, e.Vitals.BloodPressure),
				Type:        "critical",
				CreatedAt:   time.Now().Format(time.RFC3339),
			})
		} else if e.Status == "warning" {
			alertsInZone = append(alertsInZone, Alert{
				ID:          len(alertsInZone) + 1,
				Title:       fmt.Sprintf("Elder %s มีสัญญาณเตือน", e.Name),
				Description: fmt.Sprintf("SpO₂ %d%%, อุณหภูมิ %.1f°C", e.Vitals.SpO2, e.Vitals.Temperature),
				Type:        "warning",
				CreatedAt:   time.Now().Format(time.RFC3339),
			})
		}
	}

	return c.JSON(fiber.Map{
		"zone": fiber.Map{
			"id":          zone.ZoneID,
			"name":        zone.ZoneName,
			"status":      zone.Status,
			"activeUsers": zone.ActiveUser,
		},
		"elderlyCount": len(zoneElders),
		"deviceStatus": deviceStatus,
		"alerts":       alertsInZone,
		"elders":       zoneElders,
	})

}

// getAllDevice godoc
// @Summary Get all devices
// @Description ดึงข้อมูลอุปกรณ์ติดตามสุขภาพทั้งหมดในระบบ
// @Tags Device
// @Produce json
// @Security BearerAuth
// @Success 200 {array} Device
// @Router /devices [get]
func getAllDevice(c *fiber.Ctx) error {
	return c.JSON(devices)
}

// getDashSum godoc
// @Summary Get dashboard summary counts
// @Description ดึงจำนวนรวมของ โซน, ผู้ใช้งาน, ผู้สูงอายุ และอุปกรณ์ทั้งหมด
// @Tags Dashboard
// @Produce json
// @Security BearerAuth
// @Success 200 {object} DashboardSummary
// @Router /dashboard/summary [get]
func getDashSum(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"zonesCount":   len(zones),
		"usersCount":   len(users),
		"elderlyCount": len(elderlys),
		"devicesCount": len(devices),
	})
}

// getHealthservers godoc
// @Summary Get health server status
// @Description ดึงสถานะของเซิร์ฟเวอร์ที่เกี่ยวข้องกับระบบสุขภาพ
// @Tags System
// @Produce json
// @Security BearerAuth
// @Success 200 {array} Server
// @Router /system/health/servers [get]
func getHealthservers(c *fiber.Ctx) error {
	return c.JSON(servers)
}

// getAlert godoc
// @Summary Get all system alerts
// @Description ดึงรายการการแจ้งเตือนทั้งหมดในระบบ
// @Tags System
// @Produce json
// @Security BearerAuth
// @Success 200 {array} Alert
// @Router /system/alerts [get]
func getAlert(c *fiber.Ctx) error {
	return c.JSON(alerts)
}

// getUserTrend godoc
// @Summary Get user activity trend
// @Description ดึงข้อมูลแนวโน้มการใช้งานของผู้ใช้ในช่วงเวลาที่กำหนด
// @Tags Dashboard
// @Produce json
// @Security BearerAuth
// @Param days query int false "จำนวนวันย้อนหลังที่ต้องการดูข้อมูล (ค่าเริ่มต้น: 30)"
// @Success 200 {object} UserTrendResponse
// @Router /dashboard/usage-trend [get]
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

// resetPassword godoc
// @Summary Reset user password
// @Description รีเซ็ตรหัสผ่านของผู้ใช้งานตาม ID และส่งรหัสผ่านใหม่ทางอีเมล
// @Tags User
// @Produce json
// @Security BearerAuth
// @Param id path int true "User ID ที่ต้องการรีเซ็ตรหัสผ่าน"
// @Success 200 {object} PasswordResetResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /users/{id}/reset-password [post]
func resetPassword(c *fiber.Ctx) error {
	userId, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid User ID format"})
	}
	var Resetuser *User

	for i, u := range users {
		if u.UserID == userId {
			Resetuser = &users[i]
			break
		}
	}
	if Resetuser == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "ไม่พบผู้ใช้งาน",
		})
	}

	newPass := generateRandomPassword(10)
	Resetuser.Password = newPass

	to := Resetuser.Email
	subject := "รีเซ็ทรหัสผ่านใหม่"
	body := "สวัสดีครับ นี่คือรหัสผ่านใหม่ของคุณ: " + newPass

	mailErr := sendEmail(to, subject, body)
	if mailErr != nil {
		fmt.Println("ส่งเมลล้มเหลว:", err)
	} else {
		fmt.Println("ส่งเมลสำเร็จ!")
	}

	fmt.Printf("ส่งรหัสใหม่ไปที่ %s: %s\n", Resetuser.Email, newPass)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "รหัสผ่านได้ถูกรีเซ็ทและส่งไปทางเมลแล้ว",
		"userId":  Resetuser.UserID,
		"email":   Resetuser.Email,
	})
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
	password := "kwrp owck otsh ozab" //App password

	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	msg := "From: " + from + "\n" +
		"To: " + to + "\n" +
		"Subject: " + subject + "\n\n" +
		body

	auth := smtp.PlainAuth("", from, password, smtpHost)

	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, []byte(msg))
	if err != nil {
		return err
	}
	return nil
}

// Login godoc
// @Summary Login
// @Description เข้าสู่ระบบเพื่อรับ JWT Token
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body LoginRequest true "Login credentials"
// @Success 200 {object} LoginResponse
// @Failure 400 {object} ErrorResponse
// @Router /auth/login [post]
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
			// Create token
			token := jwt.New(jwt.SigningMethodHS256)

			// Set claims
			claims := token.Claims.(jwt.MapClaims)
			claims["userID"] = u.UserID
			claims["name"] = req.Username
			claims["role"] = u.Role
			claims["exp"] = time.Now().Add(time.Minute * 15).Unix()

			// Generate encoded token
			t, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
			if err != nil {
				return c.SendStatus(fiber.StatusInternalServerError)
			}
			return c.JSON(fiber.Map{
				"message":  "Login success",
				"id":       u.UserID,
				"username": u.Username,
				"role":     u.Role,
				"token":    t,
			})
		}
	}
	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
		"message": "Login Failed",
		"error":   "invalid username or password",
	})
}

func findDeviceByID(id string) *Device {
	for i := range devices {
		if devices[i].DeviceID == id {
			return &devices[i]
		}
	}
	return nil
}

// addEldertoZone godoc
// @Summary Register elderly and assign device
// @Description ลงทะเบียนผู้สูงอายุใหม่ คำนวณอายุ และผูกกับอุปกรณ์ในโซน
// @Tags Zone
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body RegisterElderlyRequest true "Elderly registration details and initial device assignment"
// @Success 201 {object} ElderlyRegistrationResponse
// @Failure 400 {object} ErrorResponse "Invalid request, device not found, device not available, or invalid date format"
// @Router /zones/elderlyRegister [post]
func addEldertoZone(c *fiber.Ctx) error {
	var req RegisterElderlyRequest
	fmt.Println(req)
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	device := findDeviceByID(req.Device.DeviceID)
	if device == nil {
		return c.Status(400).JSON(fiber.Map{"error": "Device not found"})
	}
	if device.AssignedTo != "" || device.ZoneID != 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Device not available"})
	}
	birthDate, err := time.Parse("2006-01-02", req.BirthDate)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid birthDate format"})
	}
	today := time.Now()
	age := today.Year() - birthDate.Year()
	if today.YearDay() < birthDate.YearDay() {
		age -= 1
	}

	newElder := Elderly{
		Name:      req.Fname + " " + req.Lname,
		ID:        fmt.Sprintf("E%03d", len(elderlys)+1),
		CitizenID: req.CitizenID,
		BirthDate: req.BirthDate,
		Age:       age,
		Gender:    req.Gender,
		Address:   req.Address,
		Phone:     req.Phone,
		Status:    "stable",
		Email:     req.Email,
		ZoneID:    req.ZoneID,
		DeviceID:  req.Device.DeviceID,
	}
	elderlys = append(elderlys, newElder)

	device.AssignedTo = req.Fname + " " + req.Lname
	device.ZoneID = req.ZoneID

	return c.JSON(fiber.Map{"message": "Elderly registered successfully"})
}

// getElderinZone godoc
// @Summary Get elderly patients in a specific zone
// @Description ดึงรายการผู้สูงอายุทั้งหมดที่อยู่ในโซนที่กำหนด
// @Tags Zone
// @Produce json
// @Security BearerAuth
// @Param id path int true "Zone ID ที่ต้องการดึงข้อมูลผู้สูงอายุ"
// @Success 200 {array} Elderly
// @Failure 400 {object} ErrorResponse
// @Router /zones/{id}/elders [get]
func getElderinZone(c *fiber.Ctx) error {
	zoneID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.ErrBadRequest.Code).JSON(fiber.Map{"error": "Invalid Zone ID"})
	}
	var elderlyinZone []Elderly
	for _, e := range elderlys {
		if e.ZoneID == zoneID {
			elderlyinZone = append(elderlyinZone, e)
		}
	}
	return c.JSON(elderlyinZone)
}

// getElderAlertandstatus godoc
// @Summary Get elderly status and device alert summary
// @Description ดึงข้อมูลสรุปสถานะอุปกรณ์และรายการแจ้งเตือนของผู้สูงอายุในโซน
// @Tags Elderly
// @Produce json
// @Security BearerAuth
// @Param id path int true "Zone ID สำหรับดึงข้อมูล"
// @Success 200 {object} ZoneAlertStatusResponse
// @Failure 400 {object} ErrorResponse
// @Router /zones/{id}/elders/alertandstatus [get]
func getElderAlertandstatus(c *fiber.Ctx) error {
	zoneID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid Zone ID"})
	}

	var alerts []AlertZoneInfo
	onlineCount := 0
	offlineCount := 0

	for _, d := range devices {
		if d.ZoneID == zoneID {
			if d.Status == "online" {
				onlineCount++
			} else {
				offlineCount++
			}
		}
	}

	for _, e := range elderlys {
		if e.ZoneID != zoneID {
			continue
		}

		var alertMsg string

		if e.Battery < 20 {
			alertMsg = fmt.Sprintf("Battery low: %d%%", e.Battery)
		}

		if e.Status == "critical" {
			if alertMsg != "" {
				alertMsg += " | "
			}
			alertMsg += fmt.Sprintf("Critical condition: BloodPressure = %s, HeartRate = %d bpm", e.Vitals.BloodPressure, e.Vitals.HeartRate)
		} else if e.Status == "warning" {
			if alertMsg != "" {
				alertMsg += " | "
			}
			alertMsg += fmt.Sprintf("Warning condition: HeartRate = %d bpm", e.Vitals.HeartRate)
		}

		if alertMsg != "" {
			alerts = append(alerts, AlertZoneInfo{
				ID:      e.ID,
				Name:    e.Name,
				Message: alertMsg,
				Status:  e.Status,
				Battery: e.Battery,
			})
		}
	}

	total := onlineCount + offlineCount
	onlineRate := 0
	if total > 0 {
		onlineRate = int(float64(onlineCount) / float64(total) * 100)
	}

	return c.JSON(fiber.Map{
		"zoneID":       zoneID,
		"onlineCount":  onlineCount,
		"offlineCount": offlineCount,
		"onlineRate":   onlineRate,
		"alertCount":   len(alerts),
		"alerts":       alerts,
	})
}

// createDevice godoc
// @Summary Register a new device
// @Description ลงทะเบียนอุปกรณ์ติดตามสุขภาพใหม่
// @Tags Device
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body DeviceCreationRequest true "Device registration details"
// @Success 201 {object} Device
// @Failure 400 {object} ErrorResponse
// @Router /devices [post]
func createDevice(c *fiber.Ctx) error {

	req := new(DeviceCreationRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	newDevice := Device{
		DeviceID:     req.DeviceID,
		SerialNumber: req.SerialNumber,
		Type:         req.Type,
		Model:        req.Model,
		Battery:      req.Battery,
		Features:     req.Features,
		LastUpdate:   req.LastUpdate,
		Status:       req.Status,

		AssignedTo: "",
		ZoneID:     0,
	}

	devices = append(devices, newDevice)
	return c.Status(fiber.StatusCreated).JSON(newDevice)
}

// updateDevice godoc
// @Summary Update device details
// @Description อัปเดตข้อมูลอุปกรณ์ติดตามสุขภาพด้วย Device ID
// @Tags Device
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Device ID ที่ต้องการอัปเดต"
// @Param request body DeviceUpdateRequest true "Fields to update (ใช้เฉพาะฟิลด์ที่ต้องการเปลี่ยน)"
// @Success 200 {object} Device
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /devices/{id} [put]
func updateDevice(c *fiber.Ctx) error {
	deviceID := c.Params("id")

	updatedDevice := new(Device)
	if err := c.BodyParser(updatedDevice); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	for i, d := range devices {
		if d.DeviceID == deviceID {

			if updatedDevice.SerialNumber != "" {
				devices[i].SerialNumber = updatedDevice.SerialNumber
			}
			if updatedDevice.Type != "" {
				devices[i].Type = updatedDevice.Type
			}
			if updatedDevice.Model != "" {
				devices[i].Model = updatedDevice.Model
			}
			if updatedDevice.Status != "" {
				devices[i].Status = updatedDevice.Status
			}
			if updatedDevice.AssignedTo != "" {
				devices[i].AssignedTo = updatedDevice.AssignedTo
			}
			if updatedDevice.ZoneID != 0 {
				devices[i].ZoneID = updatedDevice.ZoneID
			}
			if updatedDevice.Battery != 0 {
				devices[i].Battery = updatedDevice.Battery
			}
			if len(updatedDevice.Features) > 0 {
				devices[i].Features = updatedDevice.Features
			}
			if updatedDevice.LastUpdate != "" {
				devices[i].LastUpdate = updatedDevice.LastUpdate
			}

			return c.Status(fiber.StatusOK).JSON(devices[i])
		}
	}
	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Device not found"}) // เปลี่ยนเป็น JSON
}

// deleteDevice godoc
// @Summary Delete a device
// @Description ลบอุปกรณ์ติดตามสุขภาพออกจากระบบด้วย Device ID
// @Tags Device
// @Security BearerAuth
// @Param id path string true "Device ID ที่ต้องการลบ"
// @Success 204 "No Content (ลบสำเร็จ)"
// @Failure 404 {object} ErrorResponse
// @Router /devices/{id} [delete]
func deleteDevice(c *fiber.Ctx) error {
	deviceID := c.Params("id")

	for i, d := range devices {
		if d.DeviceID == deviceID {
			fmt.Println(d.DeviceID)
			devices = append(devices[:i], devices[i+1:]...)
			return c.SendStatus(fiber.StatusNoContent)
		}
	}
	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Device not found"})
}

// getZoneStaff godoc
// @Summary Get all staff members in a zone
// @Description ดึงรายการบุคลากรทั้งหมดที่ถูกกำหนดให้กับโซนตาม ID
// @Tags Zone
// @Produce json
// @Security BearerAuth
// @Param id path int true "Zone ID สำหรับดึงข้อมูลบุคลากร"
// @Success 200 {array} ZoneStaffResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /zones/{id}/staff [get]
func getZoneStaff(c *fiber.Ctx) error {
	zoneID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid Zone ID"})
	}
	found := false
	for _, z := range zones {
		if zoneID == z.ZoneID {
			found = true
			break
		}
	}
	if !found {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Zone not found",
		})
	}
	var staffList []fiber.Map
	for _, u := range users {
		if len(u.ZoneIDs) == 1 && u.ZoneIDs[0] == zoneID {
			staffList = append(staffList, fiber.Map{
				"id":          u.UserID,
				"name":        u.Name,
				"position":    u.StaffInfo.Position,
				"Description": u.StaffInfo.Description,
				"phone":       u.Phone,
				"email":       u.Email,
				"join_date":   u.CreatedAt,
				"last_login":  u.LastLogin,
				"status":      u.Status,
				"permissions": u.Permissions,
			})
		}
	}
	return c.JSON(staffList)
}

// createZoneStaff godoc
// @Summary Add a new staff member to a zone
// @Description สร้างผู้ใช้งานใหม่ในฐานะ Zone Staff และกำหนดให้รับผิดชอบ ZoneID ที่ระบุ
// @Tags Zone
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Zone ID ที่ต้องการเพิ่มบุคลากร"
// @Param request body CreateZoneStaffRequest true "Staff details and permissions"
// @Success 201 {object} User
// @Failure 400 {object} ErrorResponse
// @Router /zones/{id}/staff [post]
func createZoneStaff(c *fiber.Ctx) error {
	zoneID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid Zone ID"})
	}
	var req CreateZoneStaffRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	validPermissions := map[string]bool{
		"view_elderly":   true,
		"view_devices":   true,
		"view_health":    true,
		"manage_elderly": true,
	}
	var finalPerms []string
	for _, p := range req.Permissions {
		if validPermissions[p] {
			finalPerms = append(finalPerms, p)
		}
	}
	newUser := User{
		UserID:      len(users) + 1,
		Name:        req.FirstName + " " + req.Lastname,
		Email:       req.Email,
		Phone:       req.Phone,
		Username:    req.Username,
		Password:    req.Password,
		Role:        "Zone Staff",
		ZoneIDs:     []int{zoneID},
		Status:      "active",
		CreatedAt:   time.Now().Format("2006-01-02 15:04:05"),
		Permissions: finalPerms,
		StaffInfo: &StaffDetail{
			Description: req.Description,
			Position:    req.Position,
		},
	}

	users = append(users, newUser)

	return c.Status(fiber.StatusCreated).JSON(newUser)
}

// updateZoneStaff godoc
// @Summary Update a staff member's details
// @Description อัปเดตข้อมูลบุคลากรในโซนที่กำหนด
// @Tags Zone
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Zone ID ที่บุคลากรคนนี้สังกัด"
// @Param userid path int true "User ID ของบุคลากรที่ต้องการอัปเดต"
// @Param request body CreateZoneStaffRequest true "Fields to update (ใช้เฉพาะฟิลด์ที่ต้องการเปลี่ยน)"
// @Success 200 {object} User
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /zones/{id}/staff/{userid} [put]
func updateZoneStaff(c *fiber.Ctx) error {
	zoneID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid Zone ID format"})
	}
	userID, err := strconv.Atoi(c.Params("userid"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid User ID"})
	}

	var userToUpdate *User
	for i := range users {
		if users[i].UserID == userID {
			userToUpdate = &users[i]
			break
		}
	}

	if userToUpdate == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	var req CreateZoneStaffRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	if req.FirstName != "" || req.Lastname != "" {
		userToUpdate.Name = req.FirstName + " " + req.Lastname
	}

	if req.Email != "" {
		userToUpdate.Email = req.Email
	}

	if req.Phone != "" {
		userToUpdate.Phone = req.Phone
	}

	if req.Username != "" {
		userToUpdate.Username = req.Username
	}

	if req.Password != "" {
		userToUpdate.Password = req.Password
	}

	if len(req.Permissions) > 0 {
		var finalPerms []string
		validPermissions := map[string]bool{
			"view_elderly":   true,
			"view_devices":   true,
			"view_health":    true,
			"manage_elderly": true,
		}
		for _, p := range req.Permissions {
			if validPermissions[p] {
				finalPerms = append(finalPerms, p)
			}
		}
		userToUpdate.Permissions = finalPerms
	}

	if req.Description != "" {
		userToUpdate.StaffInfo.Description = req.Description
	}

	if req.Position != "" {
		userToUpdate.StaffInfo.Position = req.Position
	}
	if zoneID != 0 {
		userToUpdate.ZoneIDs = []int{zoneID}
	}

	return c.Status(fiber.StatusOK).JSON(userToUpdate)
}

// deleteZoneStaff godoc
// @Summary Delete a staff member
// @Description ลบผู้ใช้งานที่เป็นบุคลากรโซนออกจากระบบด้วย User ID
// @Tags Zone
// @Security BearerAuth
// @Param id path int true "Zone ID ที่บุคลากรคนนี้สังกัด (ใช้ในการตรวจสอบสิทธิ์)"
// @Param userid path int true "User ID ของบุคลากรที่ต้องการลบ"
// @Success 204 "No Content (ลบสำเร็จ)"
// @Failure 400 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse "Staff member is not assigned to this zone"
// @Failure 404 {object} ErrorResponse
// @Router /zones/{id}/staff/{userid} [delete]
func deleteZoneStaff(c *fiber.Ctx) error {
	zoneID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid Zone ID format"})
	}

	userID, err := strconv.Atoi(c.Params("userid"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid User ID format"})
	}

	for i, u := range users {
		if u.UserID == userID {

			isStaffInZone := false
			for _, zid := range u.ZoneIDs {
				if zid == zoneID {
					isStaffInZone = true
					break
				}
			}

			if !isStaffInZone {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Staff member is not assigned to this zone"})
			}

			users = append(users[:i], users[i+1:]...)
			return c.SendStatus(fiber.StatusNoContent)
		}
	}
	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
}

// getZoneStaffSummary godoc
// @Summary Get summary counts for a zone
// @Description ดึงข้อมูลสรุปจำนวนผู้สูงอายุ, อุปกรณ์ และบุคลากรในโซน
// @Tags Zone
// @Produce json
// @Security BearerAuth
// @Param id path int true "Zone ID สำหรับดึงข้อมูลสรุป"
// @Success 200 {object} ZoneSummaryResponse
// @Failure 400 {object} ErrorResponse
// @Router /zones/{id}/summary [get]
func getZoneStaffSummary(c *fiber.Ctx) error {
	zoneID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid zone ID"})
	}

	countElderly := 0
	for _, e := range elderlys {
		if e.ZoneID == zoneID {
			countElderly++
		}
	}

	countDevices := 0
	for _, d := range devices {
		if d.ZoneID == zoneID {
			countDevices++
		}
	}

	countCaregivers := 0
	for _, u := range users {
		if u.Role == "Zone Staff" || u.Role == "Zone Admin" {
			for _, z := range u.ZoneIDs {
				if z == zoneID {
					countCaregivers++
				}
			}
		}
	}

	return c.JSON(fiber.Map{
		"ZoneID":       zoneID,
		"elderlyCount": countElderly,
		"devicesCount": countDevices,
		"caregivers":   countCaregivers,
	})
}

// getElderDetail godoc
// @Summary Get elderly patient details
// @Description ดึงข้อมูลรายละเอียดผู้สูงอายุและ Vital Signs ตาม ID
// @Tags Elderly
// @Produce json
// @Security BearerAuth
// @Param id path string true "Elder ID (เช่น E001)"
// @Success 200 {object} Elderly
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /elders/{id} [get]
func getElderDetail(c *fiber.Ctx) error {
	elderID := c.Params("id")

	for _, e := range elderlys {
		if e.ID == elderID {
			return c.JSON(e)
		}
	}

	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
}

// getSystemSummary godoc
// @Summary Get system summary
// @Description ดึงข้อมูลสรุปสถานะสุขภาพโดยรวมของระบบ (จำนวนเซิร์ฟเวอร์, uptime, load, storage)
// @Tags System
// @Produce json
// @Security BearerAuth
// @Success 200 {object} HealthSummaryResponse
// @Router /system/summarys [get]
func getSystemSum(c *fiber.Ctx) error {
	var countOnline int
	for _, s := range servers {
		if s.Status == "online" {
			countOnline++
		}
	}
	response := HealthSummaryResponse{
		TotalServers:     len(servers),
		OnlineServers:    countOnline,
		UptimePercentage: 99.7,
		SystemLoad:       66.1,
		StorageUsed:      "3.2TB",
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

// getSystemLogs godoc
// @Summary Get system logs
// @Description ดึงรายการ Log ล่าสุดของระบบ
// @Tags System
// @Produce json
// @Security BearerAuth
// @Success 200 {array} SystemLogEntry
// @Router /system/logs [get]
func getSystemLogs(c *fiber.Ctx) error {
	return c.Status(fiber.StatusOK).JSON(logs)
}

// getSystemNetworks godoc
// @Summary Get system network status
// @Description ดึงข้อมูลสถานะเครือข่ายต่างๆ ของระบบ (อินเทอร์เน็ต, LoRaWAN, ความปลอดภัย)
// @Tags Health
// @Produce json
// @Security BearerAuth
// @Success 200 {object} NetworkSummaryResponse
// @Router /system/networks [get]
func getSystemNetworks(c *fiber.Ctx) error {

	response := NetworkSummaryResponse{
		Networks: networks,
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

// getemergencySum godoc
// @Summary Get emergency alert summary counts
// @Description ดึงจำนวนรวมของ Alert ที่กำลังดำเนินอยู่แบ่งตามระดับความสำคัญ
// @Tags Emergency
// @Produce json
// @Security BearerAuth
// @Success 200 {object} AlertSummaryResponse
// @Router /emergencys/alert/summary [get]
func getEmergencySum(c *fiber.Ctx) error {
	return c.JSON(summary)
}

// getTeamsStatus godoc
// @Summary Get emergency response team statuses
// @Description ดึงสถานะของทีมตอบสนองฉุกเฉินทั้งหมด
// @Tags Emergency
// @Produce json
// @Security BearerAuth
// @Success 200 {array} TeamStatusEntry
// @Router /emergencys/team/status [get]
func getTeamsStatus(c *fiber.Ctx) error {
	return c.JSON(teams)
}
