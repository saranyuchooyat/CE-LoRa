package main

import (
	"encoding/json"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	UserID         string             `bson:"user_id" json:"user_id"`
	ZoneID         string             `bson:"zone_id" json:"zone_id"`
	Role           string             `bson:"role" json:"role"`
	Username       string             `bson:"username" json:"username"`
	Password       string             `bson:"password" json:"password"`
	FirstName      string             `bson:"first_name" json:"first_name"`
	LastName       string             `bson:"last_name" json:"last_name"`
	Age            int                `bson:"age" json:"age"`
	Phone          string             `bson:"phone" json:"phone"`
	Email          string             `bson:"email" json:"email"`
	LastLogin      time.Time          `bson:"last_login" json:"last_login"`
	AccountStatus  string             `bson:"account_status" json:"account_status"`
	IsCaregiver    bool               `json:"is_caregiver" bson:"is_caregiver"`
	AssignedElders []string           `json:"assigned_elders" bson:"assigned_elders"`
}
type Zone struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	ZoneID      string             `bson:"zone_id" json:"zone_id"`
	ZoneName    string             `bson:"zone_name" json:"zone_name"`
	ZoneAddress string             `bson:"zone_address" json:"zone_address"`
	Description string             `bson:"description" json:"description"` // 👈 เพิ่มบรรทัดนี้
	ActiveUser  int                `bson:"active_user" json:"active_user"`
	Status      string             `bson:"status" json:"status"`
}

type Elder struct {
	ID                   primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	ElderID              string             `bson:"elder_id" json:"elder_id"`
	ZoneID               string             `bson:"zone_id" json:"zone_id"`
	DeviceID             string             `bson:"device_id" json:"device_id"`
	CaregiverUserIDs     []string           `bson:"caregiver_user_id" json:"caregiver_user_id"` // Array
	FirstName            string             `bson:"first_name" json:"first_name"`
	LastName             string             `bson:"last_name" json:"last_name"`
	Sex                  string             `bson:"sex" json:"sex"`
	Age                  int                `bson:"age" json:"age"`
	Weight               float64            `bson:"weight" json:"weight"`
	Height               float64            `bson:"height" json:"height"`
	CongenitalDisease    string             `bson:"congenital_disease" json:"congenital_disease"`
	PersonalMedicine     string             `bson:"personal_medicine" json:"personal_medicine"`
	EmergencyContactName string             `json:"emergency_contact_name" bson:"emergency_contact_name"`
	EmergencyContacts    string             `bson:"emergency_contacts" json:"emergency_contacts"`
	HealthStatus         string             `bson:"health_status" json:"health_status"`
	Address              string             `bson:"address" json:"address"`
}
type Device struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	DeviceID     string             `bson:"device_id" json:"device_id"`
	DeviceName   string             `bson:"device_name" json:"device_name"`
	Description  string             `bson:"description" json:"description"`
	Battery      int                `bson:"battery" json:"battery"`
	Features     []string           `bson:"features" json:"features"`
	LastUpdate   string             `bson:"last_update" json:"last_update"`
	Model        string             `bson:"model" json:"model"`
	SerialNumber string             `bson:"serial_number" json:"serial_number"`
	Status       string             `bson:"status" json:"status"`
	Type         string             `bson:"type" json:"type"`
	AssignedTo   string             `bson:"assigned_to" json:"assigned_to"`
}

type DeviceData struct {
	DeviceID string `json:"device_id" bson:"device_id"`
	Vitals   struct {
		SpO2          float64 `json:"spo2" bson:"spo2"`
		BodyTemp      float64 `json:"body_temp" bson:"body_temp"`
		HeartRate     int     `json:"heart_rate" bson:"heart_rate"`
		Gravity       float64 `json:"gravity" bson:"gravity"`
		BloodPressure float64 `json:"blood_pressure" bson:"blood_pressure"`
	} `json:"vitals" bson:"vitals"`
	Time       time.Time `json:"time"`
	GPSLat     float64   `json:"gps_latitude" bson:"gps_latitude"`
	GPSLong    float64   `json:"gps_longitude" bson:"gps_longitude"`
	SOS        bool      `json:"sos" bson:"sos"`
	FallStatus bool      `json:"fall_status" bson:"fall_status"`
}

func (d DeviceData) MarshalJSON() ([]byte, error) {
	type Alias DeviceData
	return json.Marshal(&struct {
		Time string `json:"time"`
		*Alias
	}{
		Time:  d.Time.Format("2006-01-02 15:04:05"),
		Alias: (*Alias)(&d),
	})
}

type Server struct {
	Name        string `json:"name"`
	CPUUsage    int    `json:"cpuUsage"`
	MemoryUsed  string `json:"memoryUsed"`
	MemoryTotal string `json:"memoryTotal"`
	DiskUsed    string `json:"diskUsed"`
	DiskTotal   string `json:"diskTotal"`
}

type Alert struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	CreatedAt   string `json:"created_at"`
	Severity    string `json:"severity"`
}

type UsageTrend struct {
	Date        string `json:"date"`
	ActiveUsers int    `json:"activeUsers"`
}

// ---------------- Mock Data ----------------

var servers = []Server{
	{
		Name:        "LoRaWAN Network Server",
		CPUUsage:    45,
		MemoryUsed:  "12.8GB",
		MemoryTotal: "16GB",
		DiskUsed:    "456GB",
		DiskTotal:   "1TB",
	},
	{
		Name:        "Database Server",
		CPUUsage:    67,
		MemoryUsed:  "28.4GB",
		MemoryTotal: "32GB",
		DiskUsed:    "1.2TB",
		DiskTotal:   "2TB",
	},
	{
		Name:        "Analytics Server",
		CPUUsage:    88,
		MemoryUsed:  "30.1GB",
		MemoryTotal: "32GB",
		DiskUsed:    "1.8TB",
		DiskTotal:   "2TB",
	},
	{
		Name:        "Web Application Server",
		CPUUsage:    34,
		MemoryUsed:  "8.2GB",
		MemoryTotal: "16GB",
		DiskUsed:    "234GB",
		DiskTotal:   "1TB",
	},
}

var alerts = []Alert{
	{
		ID:          1,
		Title:       "Analytics Server High Memory Usage",
		Description: "Memory usage reached 94% - immediate attention required",
		CreatedAt:   "2025-08-19T10:25:00Z",
	},
	{
		ID:          2,
		Title:       "3 อุปกรณ์ใน Zone ลาดกระบัง ไม่ส่งสัญญาณ",
		Description: "Device offline เกิน 30 นาที - ตรวจสอบการเชื่อมต่อ",
		CreatedAt:   "2025-08-19T10:10:00Z",
	},
	{
		ID:          3,
		Title:       "Database Backup Completed",
		Description: "Nightly backup finished successfully",
		CreatedAt:   "2025-08-19T00:30:00Z",
	},
}

var usageTrends = []UsageTrend{ //mock up ไปก่อน จริงๆ ต้องมีการบันทึก date เก็บลงฐานข้อมูล ว่ามี user เข้าใช้งานกี่คนในเว็บ แต่ละวัน
	{Date: "2025-07-20", ActiveUsers: 120},
	{Date: "2025-07-21", ActiveUsers: 134},
	{Date: "2025-07-22", ActiveUsers: 140},
	{Date: "2025-07-23", ActiveUsers: 110},
	{Date: "2025-07-24", ActiveUsers: 150},
}
