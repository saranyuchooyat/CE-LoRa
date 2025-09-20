package main

type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type Zone struct {
	ZoneID      int    `json:"zone_id"`
	ZoneName    string `json:"zone_name"`
	Address     string `json:"address"`
	Description string `json:"description"`
	Status      string `json:"status"`
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

// ---------------- Mock Data ----------------

var users = []User{
	{ID: 1, Username: "yu", Password: "1234", Role: "Systemadmin"},
	{ID: 2, Username: "ink", Password: "5678", Role: "Zoneadmin"},
	{ID: 3, Username: "eak", Password: "9999", Role: "Zonestaff"},
}

var zones = []Zone{
	{ZoneID: 1, ZoneName: "Lat Krabang", Address: "Chalong Krung Road, Lat Krabang", Description: "พื้นที่โซนด้านตะวันออกของกรุงเทพมหานคร ใกล้มหาวิทยาลัยและสนามบินสุวรรณภูมิ", Status: "Active"},
	{ZoneID: 2, ZoneName: "Rangsit", Address: "Phahonyothin Road, Rangsit, Pathum Thani", Description: "พื้นที่โซนตอนเหนือของกรุงเทพมหานคร และปริมณฑล มีสถานศึกษาและแหล่งชุมชนสำคัญ", Status: "Active"},
	{ZoneID: 3, ZoneName: "Bang Na", Address: "Bang Na-Trat Rd, Km. 5", Description: "เขตพื้นที่ทางตะวันออก ใกล้สนามบินสุวรรณภูมิ", Status: "Active"},
	{ZoneID: 4, ZoneName: "Thonburi", Address: "Charan Sanitwong Rd", Description: "ฝั่งธนบุรี ติดแม่น้ำเจ้าพระยา", Status: "Inactive"},
	{ZoneID: 5, ZoneName: "Pathum Thani", Address: "Khlong Luang", Description: "เขตอุตสาหกรรมและการศึกษา มหาวิทยาลัยเยอะ", Status: "Active"},
	{ZoneID: 6, ZoneName: "Samut Prakan", Address: "Paknam", Description: "พื้นที่ทางใต้ของกรุงเทพ ใกล้ทะเล", Status: "Active"},
	{ZoneID: 7, ZoneName: "Nonthaburi", Address: "Rattanathibet Rd", Description: "โซนเมืองใหญ่ ใกล้ MRT", Status: "Inactive"},
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
