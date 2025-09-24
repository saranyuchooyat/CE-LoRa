package main

type User struct {
	UserID    int    `json:"userId"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	Role      string `json:"role"`
	Zone      string `json:"zone"`
	Status    string `json:"status"`
	LastLogin string `json:"lastLogin"`
	CreatedAt string `json:"createdAt"`
	Username  string `json:"username,omitempty"`
	Password  string `json:"password,omitempty"`
}

type Zone struct {
	ZoneID      int    `json:"zoneid"`
	ZoneName    string `json:"zonename"`
	Address     string `json:"address"`
	Description string `json:"description"`
	Status      string `json:"status"`
	ActiveUser  int    `json:"activeuser"`
}

type Vitals struct {
	HeartRate     int     `json:"heart_rate"`
	BloodPressure string  `json:"blood_pressure"`
	SpO2          int     `json:"spo2"`
	Temperature   float64 `json:"temperature"`
}

type Elderly struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Age         int    `json:"age"`
	Gender      string `json:"gender"`
	Status      string `json:"status"`
	Vitals      Vitals `json:"vitals"`
	DeviceID    string `json:"device_id"`
	Battery     int    `json:"battery"`
	LastUpdated string `json:"last_updated"`
}

type Device struct {
	DeviceID     string   `json:"device_id"`
	SerialNumber string   `json:"serial_number"`
	Type         string   `json:"type"`
	Model        string   `json:"model"`
	Battery      int      `json:"battery"`
	LastUpdate   string   `json:"last_update"`
	Status       string   `json:"status"`
	AssignedTo   string   `json:"assigned_to"`
	Features     []string `json:"features"`
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

var users = []User{
	{UserID: 1, Username: "yu", Password: "1234", Name: "Sarunyu Chooyat", Phone: "0123456789", Role: "System Admin", Email: "66015172@kmitl.ac.th"},
	{UserID: 2, Username: "ink", Password: "5678", Name: "Pruettinan Limlertvaree", Phone: "0996291914", Role: "Zone Admin", Email: "66015134@kmitl.ac.th"},
	{UserID: 3, Username: "eak", Password: "9999", Name: "Detsukmongkol Bunta", Phone: "0987654321", Role: "Zone Staff", Email: "66015072@kmitl.ac.th"},
}

var zones = []Zone{
	{ZoneID: 1, ZoneName: "Lat Krabang", Address: "Chalong Krung Road, Lat Krabang", Description: "พื้นที่โซนด้านตะวันออกของกรุงเทพมหานคร ใกล้มหาวิทยาลัยและสนามบินสุวรรณภูมิ", Status: "Active", ActiveUser: 500},
	{ZoneID: 2, ZoneName: "Rangsit", Address: "Phahonyothin Road, Rangsit, Pathum Thani", Description: "พื้นที่โซนตอนเหนือของกรุงเทพมหานคร และปริมณฑล มีสถานศึกษาและแหล่งชุมชนสำคัญ", Status: "Active", ActiveUser: 900},
	{ZoneID: 3, ZoneName: "Bang Na", Address: "Bang Na-Trat Rd, Km. 5", Description: "เขตพื้นที่ทางตะวันออก ใกล้สนามบินสุวรรณภูมิ", Status: "Active", ActiveUser: 400},
	{ZoneID: 4, ZoneName: "Thonburi", Address: "Charan Sanitwong Rd", Description: "ฝั่งธนบุรี ติดแม่น้ำเจ้าพระยา", Status: "Inactive", ActiveUser: 352},
	{ZoneID: 5, ZoneName: "Pathum Thani", Address: "Khlong Luang", Description: "เขตอุตสาหกรรมและการศึกษา มหาวิทยาลัยเยอะ", Status: "Active", ActiveUser: 1200},
	{ZoneID: 6, ZoneName: "Samut Prakan", Address: "Paknam", Description: "พื้นที่ทางใต้ของกรุงเทพ ใกล้ทะเล", Status: "Active", ActiveUser: 509},
	{ZoneID: 7, ZoneName: "Nonthaburi", Address: "Rattanathibet Rd", Description: "โซนเมืองใหญ่ ใกล้ MRT", Status: "Inactive", ActiveUser: 250},
}

var elderlys = []Elderly{
	{
		ID: "E001", Name: "นายสมชาย มั่นคง", Age: 72, Gender: "ชาย", Status: "critical",
		Vitals:   Vitals{HeartRate: 125, BloodPressure: "160/95", SpO2: 94, Temperature: 37.1},
		DeviceID: "SW-2024-001", Battery: 78, LastUpdated: "2025-08-20T14:30:00Z",
	},
	{
		ID: "E002", Name: "นางสมศรี ใจดี", Age: 68, Gender: "หญิง", Status: "stable",
		Vitals:   Vitals{HeartRate: 82, BloodPressure: "125/80", SpO2: 97, Temperature: 36.7},
		DeviceID: "SW-2024-002", Battery: 55, LastUpdated: "2025-08-20T14:32:00Z",
	},
	{
		ID: "E003", Name: "นายบุญเลิศ ขยัน", Age: 75, Gender: "ชาย", Status: "warning",
		Vitals:   Vitals{HeartRate: 102, BloodPressure: "150/92", SpO2: 93, Temperature: 38.0},
		DeviceID: "SW-2024-003", Battery: 22, LastUpdated: "2025-08-20T14:35:00Z",
	},
	{
		ID: "E004", Name: "นางละไม สุขใจ", Age: 70, Gender: "หญิง", Status: "stable",
		Vitals:   Vitals{HeartRate: 76, BloodPressure: "118/76", SpO2: 99, Temperature: 36.5},
		DeviceID: "SW-2024-004", Battery: 90, LastUpdated: "2025-08-20T14:40:00Z",
	},
	{
		ID: "E005", Name: "นายมานพ อดทน", Age: 80, Gender: "ชาย", Status: "critical",
		Vitals:   Vitals{HeartRate: 130, BloodPressure: "170/100", SpO2: 88, Temperature: 39.2},
		DeviceID: "SW-2024-005", Battery: 12, LastUpdated: "2025-08-20T14:45:00Z",
	},
}

var devices = []Device{
	{
		DeviceID:     "SW-2024-001",
		SerialNumber: "JSW240001",
		Type:         "SmartWatch",
		Model:        "J3 iSmart Watch",
		Battery:      78,
		LastUpdate:   "2025-08-20T14:30:00Z",
		Status:       "online",
		AssignedTo:   "นายสมชาย มั่นคง",
		Features:     []string{"SpO2", "Heart Rate", "Body Temp", "Blood Pressure"},
	},
	{
		DeviceID:     "SW-2024-002",
		SerialNumber: "JSW240002",
		Type:         "SmartWatch",
		Model:        "J3 iSmart Watch",
		Battery:      55,
		LastUpdate:   "2025-08-20T14:32:00Z",
		Status:       "online",
		AssignedTo:   "นางสมศรี ใจดี",
		Features:     []string{"SpO2", "Heart Rate", "Body Temp", "Blood Pressure"},
	},
	{
		DeviceID:     "SW-2024-003",
		SerialNumber: "JSW240003",
		Type:         "SmartWatch",
		Model:        "J3 iSmart Watch",
		Battery:      22,
		LastUpdate:   "2025-08-20T14:35:00Z",
		Status:       "offline",
		AssignedTo:   "นายบุญเลิศ ขยัน",
		Features:     []string{"SpO2", "Heart Rate", "Body Temp"},
	},
	{
		DeviceID:     "SW-2024-004",
		SerialNumber: "JSW240004",
		Type:         "SmartWatch",
		Model:        "J3 iSmart Watch",
		Battery:      90,
		LastUpdate:   "2025-08-20T14:40:00Z",
		Status:       "online",
		AssignedTo:   "นางละไม สุขใจ",
		Features:     []string{"SpO2", "Heart Rate", "Body Temp", "Blood Pressure"},
	},
	{
		DeviceID:     "SW-2024-005",
		SerialNumber: "JSW240005",
		Type:         "SmartWatch",
		Model:        "J3 iSmart Watch",
		Battery:      12,
		LastUpdate:   "2025-08-20T14:45:00Z",
		Status:       "offline",
		AssignedTo:   "นายมานพ อดทน",
		Features:     []string{"SpO2", "Heart Rate", "Body Temp", "Blood Pressure"},
	},
}

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
