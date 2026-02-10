package main

import (
	"encoding/json"
	"time"
)

type User struct {
	UserID    string `json:"user_id" bson:"user_id"`
	ZoneID    string `json:"zone_id" bson:"zone_id"`
	Role      string `json:"role" bson:"role"`
	Username  string `json:"username" bson:"username"`
	Password  string `json:"password" bson:"password"`
	FirstName string `json:"first_name" bson:"first_name"`
	LastName  string `json:"last_name" bson:"last_name"`
	Age       int    `json:"age" bson:"age"`
	Phone     string `json:"phone" bson:"phone"`
	Email     string `json:"email" bson:"email"`
	Status    string `json:"status"`
	LastLogin string `json:"lastLogin"`
	CreatedAt string `json:"createdAt"`
}

type Zone struct {
	ZoneID      string `json:"zone_id" bson:"zone_id"`
	ZoneName    string `json:"zone_name" bson:"zone_name"`
	Subdistrict string `json:"zone_subdistrict" bson:"zone_subdistrict"`
	Province    string `json:"zone_province" bson:"zone_province"`
	Region      string `json:"zone_region" bson:"zone_region"`
	ActiveUser  int    `json:"active_user" bson:"active_user"`
	Status      string `json:"status" bson:"status"`
}

type Elder struct {
	ElderID          string  `json:"elder_id" bson:"elder_id"`
	DeviceID         string  `json:"device_id" bson:"device_id"`
	ZoneID           string  `json:"zone_id" bson:"zone_id"`
	FirstName        string  `json:"first_name" bson:"first_name"`
	LastName         string  `json:"last_name" bson:"last_name"`
	Sex              string  `json:"sex" bson:"sex"`
	Age              int     `json:"age" bson:"age"`
	Weight           float64 `json:"weight" bson:"weight"`
	Height           float64 `json:"height" bson:"height"`
	Congenital       string  `json:"congenital_disease" bson:"congenital_disease"`
	Medicine         string  `json:"personal_medicine" bson:"personal_medicine"`
	EmergencyContact string  `json:"emergency_contacts" bson:"emergency_contacts"`
	HealthStatus     string  `json:"health_status" bson:"health_status"`
	Address          string  `json:"address" bson:"address"`
}

type Device struct {
	DeviceID    string `json:"device_id" bson:"device_id"`
	DeviceName  string `json:"device_name" bson:"device_name"`
	Description string `json:"description" bson:"description"`
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
	CreatedAt   string `json:"createdAt"`
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
