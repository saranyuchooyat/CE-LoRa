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
	start := time.Now()

	fmt.Printf("URL = %s,Method =%s, Time =%s\n", c.OriginalURL(), c.Method(), start)

	return c.Next()
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

func updateUser(c *fiber.Ctx) error {
	userID, err := strconv.Atoi(c.Params("id"))

	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	userUpdate := new(User)
	if err := c.BodyParser(userUpdate); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
	}

	for i, u := range users {
		if u.UserID == userID {
			if userUpdate.Username != "" {
				users[i].Username = userUpdate.Username
			}
			if userUpdate.Password != "" {
				users[i].Password = userUpdate.Password
			}
			if userUpdate.Role != "" {
				users[i].Role = userUpdate.Role
			}
			return c.JSON(users[i])
		}
	}

	return c.SendStatus(fiber.StatusNotFound)
}

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
	return c.JSON(users)
}
func getAllElderly(c *fiber.Ctx) error {
	return c.JSON(elderlys)
}

func getAllZone(c *fiber.Ctx) error {
	return c.JSON(zones)
}

func getMyZone(c *fiber.Ctx) error {
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
		"zonesCount":   len(zones),
		"usersCount":   len(users),
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

func resetPassword(c *fiber.Ctx) error {
	userId, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).SendString(err.Error())
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

	return c.JSON(fiber.Map{
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
			claims["name"] = req.Username
			claims["role"] = "admin" //u.Role
			claims["exp"] = time.Now().Add(time.Hour * 72).Unix()

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
