package main

type User struct {
	UserID      int          `json:"userId"`
	Name        string       `json:"name"`
	Email       string       `json:"email"`
	Phone       string       `json:"phone"`
	Username    string       `json:"username,omitempty"`
	Password    string       `json:"password,omitempty"`
	Role        string       `json:"role"`
	ZoneIDs     []int        `json:"zoneids"`
	Status      string       `json:"status"`
	LastLogin   string       `json:"lastLogin"`
	CreatedAt   string       `json:"createdAt"`
	Permissions []string     `json:"permission"`
	StaffInfo   *StaffDetail `json:"staff_info,omitempty"`
}
type LoginRequest struct {
	Username string `json:"username" example:"ink"`
	Password string `json:"password" example:"5678"`
}
type UserCreationRequest struct {
	Name     string `json:"name" example:"John Doe"`
	Email    string `json:"email" example:"john.d@example.com"`
	Phone    string `json:"phone" example:"0812345678"`
	Username string `json:"username" example:"johndoe"`
	Password string `json:"password" example:"P@ssword123"`
	Role     string `json:"role" example:"Zone Staff"`
	ZoneIDs  []int  `json:"zoneids"`

	Description string `json:"description" example:"Staff at main building"`
	Position    string `json:"position" example:"Nurse"`
}

type UserUpdateRequest struct {
	Name     string `json:"name" example:"John Doe"`
	Email    string `json:"email" example:"john.d@example.com"`
	Phone    string `json:"phone" example:"0812345678"`
	Username string `json:"username" example:"johndoe"`
	Password string `json:"password" example:"P@ssword123"`
	Role     string `json:"role" example:"Zone Staff"`
	ZoneIDs  []int  `json:"zoneids"`

	Description string `json:"description" example:"Staff at main building"`
	Position    string `json:"position" example:"Nurse"`
}

type Zone struct {
	ZoneID      int    `json:"zoneid"`
	ZoneName    string `json:"zonename"`
	Address     string `json:"address"`
	Description string `json:"description"`
	Status      string `json:"status"`
	ActiveUser  int    `json:"activeuser"`
}
type ZoneCreationRequest struct {
	ZoneName    string `json:"zoneName" example:"Lardkrabang-A"`
	Address     string `json:"address" example:"123 Main St Soi Lardkrabang"`
	Description string `json:"description" example:"ศูนย์กลางติดสถานีรถไฟลาดกระบัง"`
}
type ZoneUpdateRequest struct {
	ZoneName    string `json:"zoneName,omitempty" example:"Prayathai-A"`
	Address     string `json:"address,omitempty" example:"53/2 Prayathai"`
	Description string `json:"description,omitempty" example:"โซนติด 4 แยก BTS ถึงปลายสถานี"`
	Status      string `json:"status,omitempty" example:"maintenance"`
}
type TopZonesResponse struct {
	TopZones []Zone `json:"topzones"`
}

type ZoneDashboardResponse struct {
	ZoneDashboardInfo `json:"zone"`
	ElderlyCount      int           `json:"elderlyCount" example:"35"`
	DeviceSummary     DeviceSummary `json:"deviceStatus"`
	Alerts            []Alert       `json:"alerts"`
	Elders            []Elderly     `json:"elders"`
}

// struct ย่อย Zone dasboardResponse-------

type ZoneDashboardInfo struct {
	ID          int    `json:"id" example:"1"`
	Name        string `json:"name" example:"Zone A - Main Building"`
	Status      string `json:"status" example:"operational"`
	ActiveUsers int    `json:"activeUsers" example:"15"`
}
type UserTrendResponse struct {
	Trend []UsageTrend `json:"trend"`
}

type PasswordResetResponse struct {
	Message string `json:"message" example:"รหัสผ่านได้ถูกรีเซ็ทและส่งไปทางเมลแล้ว"`
	UserID  int    `json:"userId" example:"5"`
	Email   string `json:"email" example:"testuser@example.com"`
}
type DashboardSummary struct {
	ZonesCount   int `json:"zonesCount" example:"4"`
	UsersCount   int `json:"usersCount" example:"12"`
	ElderlyCount int `json:"elderlyCount" example:"35"`
	DevicesCount int `json:"devicesCount" example:"30"`
}
type DeviceSummary struct {
	Online  int `json:"online" example:"28"`
	Offline int `json:"offline" example:"2"`
	Total   int `json:"total" example:"30"`
}
type Alert struct {
	ID          int    `json:"id" example:"1"`
	Title       string `json:"title" example:"Elder Bua has critical condition"`
	Description string `json:"description" example:"HeartRate 120 bpm, BP 160/100"`
	Type        string `json:"type" example:"critical"`
	CreatedAt   string `json:"createdAt" example:"2025-10-18T10:00:00Z"`
	Status      string `json:"status" example:"pending"`
}

// struct ย่อย Zone dasboardResponse ----------
type StaffDetail struct {
	Position    string `json:"position"`
	Description string `json:"description"`
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
	CitizenID   string `json:"citizenId"`
	BirthDate   string `json:"birthDate"`
	Gender      string `json:"gender"`
	Status      string `json:"status"`
	Address     string `json:"address"`
	Vitals      Vitals `json:"vitals"`
	DeviceID    string `json:"device_id"`
	Phone       string `json:"phone"`
	Email       string `json:"email"`
	Battery     int    `json:"battery"`
	LastUpdated string `json:"last_updated"`
	ZoneID      int    `json:"zone_id"`
}
type ElderDetailResponse struct {
	ID          string `json:"id" example:"E001"`
	Name        string `json:"name" example:"นายสมชาย มั่นคง"`
	Age         int    `json:"age" example:"72"`
	Gender      string `json:"gender" example:"ชาย"`
	Status      string `json:"status" example:"critical"`
	Vitals      Vitals `json:"vitals"`
	DeviceID    string `json:"device_id" example:"SW-2024-001"`
	Battery     int    `json:"battery" example:"78"`
	LastUpdated string `json:"last_updated" example:"2025-08-20T14:30:00Z"`
}
type RegisterElderlyRequest struct {
	Fname     string `json:"fname" example:"Boonmee"`
	Lname     string `json:"lname" example:"Saetang"`
	CitizenID string `json:"citizenId" example:"1101100011000"`
	BirthDate string `json:"birthDate" example:"1945-05-15" format:"YYYY-MM-DD"`
	Gender    string `json:"gender" example:"Female"`
	Address   string `json:"address" example:"123 Elder Home"`
	Phone     string `json:"phone" example:"0881234567"`
	Email     string `json:"email" example:"boonmee@contact.com"`
	ZoneID    int    `json:"zoneId" example:"1"`

	Device struct {
		DeviceID string `json:"deviceId" example:"SW-2024-006"`
	} `json:"device"`
}
type ElderlyRegistrationResponse struct {
	Message string `json:"message" example:"Elderly registered successfully"`
}
type ZoneAlertStatusResponse struct {
	ZoneID       int             `json:"zoneID" example:"1"`
	OnlineCount  int             `json:"onlineCount" example:"10"`
	OfflineCount int             `json:"offlineCount" example:"2"`
	OnlineRate   int             `json:"onlineRate" example:"83"`
	AlertCount   int             `json:"alertCount" example:"3"`
	Alerts       []AlertZoneInfo `json:"alerts"`
}
type AlertZoneInfo struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Message string `json:"message"`
	Status  string `json:"status"`
	Battery int    `json:"battery"`
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
	ZoneID       int      `json:"zone_id"`
}
type DeviceCreationRequest struct {
	DeviceID     string   `json:"deviceId" example:"D-WATCH-007" binding:"required"`
	SerialNumber string   `json:"serialNumber" example:"SN12345678" binding:"required"`
	Type         string   `json:"type" example:"Wearable"`
	Model        string   `json:"model" example:"WatchX"`
	Battery      int      `json:"battery" example:"100"`
	Features     []string `json:"features" example:"heart_rate, spo2"`
	LastUpdate   string   `json:"lastUpdate" example:"2025-10-19 10:00:00"`
	Status       string   `json:"status" example:"unassigned"`
}

type DeviceUpdateRequest struct {
	SerialNumber string   `json:"serialNumber,omitempty" example:"SN98765432"`
	Type         string   `json:"type,omitempty" example:"Watch"`
	Model        string   `json:"model,omitempty" example:"WatchX Pro"`
	Status       string   `json:"status,omitempty" example:"online"`
	AssignedTo   string   `json:"assigned_to,omitempty" example:"Elder Bua"`
	ZoneID       int      `json:"zoneId,omitempty" example:"1"`
	Battery      int      `json:"battery,omitempty" example:"85"`
	Features     []string `json:"features,omitempty" example:"heart_rate, spo2, gps"`
	LastUpdate   string   `json:"lastUpdate,omitempty" example:"2025-10-20 15:00:00"`
}
type CreateZoneStaffRequest struct {
	FirstName   string   `json:"firstName" example:"Sombat"`
	Lastname    string   `json:"lastName" example:"Jitdee"`
	Email       string   `json:"email" example:"sombat.j@zone.com"`
	Phone       string   `json:"phone" example:"0912340000"`
	Username    string   `json:"username" example:"sombat.j"`
	Password    string   `json:"password" example:"securepass123"`
	Description string   `json:"description" example:"Day shift nurse"`
	Position    string   `json:"position" example:"Nurse"`
	Permissions []string `json:"permissions" example:"view_elderly,view_health"`
}
type ZoneStaffResponse struct {
	ID          string   `json:"id" example:"staff-005"`
	Name        string   `json:"name" example:"Sompong Jaidee"`
	Position    string   `json:"position" example:"Nurse"`
	Description string   `json:"Description" example:"Specialized in elderly care"`
	Phone       string   `json:"phone" example:"0812345678"`
	Email       string   `json:"email" example:"sompong@zone.com"`
	JoinDate    string   `json:"join_date" example:"2024-03-10 09:00:00"`
	LastLogin   string   `json:"last_login" example:"2025-10-18 15:00:00"`
	Status      string   `json:"status" example:"active"`
	Permissions []string `json:"permissions" example:"[view_elderly, view_health]"`
}
type ZoneSummaryResponse struct {
	ZoneID       int `json:"ZoneID" example:"1"`
	ElderlyCount int `json:"elderlyCount" example:"25"`
	DevicesCount int `json:"devicesCount" example:"20"`
	Caregivers   int `json:"caregivers" example:"5"`
}

type HealthSummaryResponse struct {
	TotalServers     int     `json:"totalServers" example:"4"`
	OnlineServers    int     `json:"onlineServers" example:"4"`
	UptimePercentage float64 `json:"uptimePercentage" example:"99.7"`
	SystemLoad       float64 `json:"systemLoad" example:"66.1"`
	StorageUsed      string  `json:"storageUsed" example:"3.2TB"`
}
type Server struct {
	Name        string `json:"name"`
	CPUUsage    int    `json:"cpuUsage"`
	MemoryUsed  string `json:"memoryUsed"`
	MemoryTotal string `json:"memoryTotal"`
	DiskUsed    string `json:"diskUsed"`
	DiskTotal   string `json:"diskTotal"`
	Status      string `json:"status"`
}

type UsageTrend struct {
	Date        string `json:"date"`
	ActiveUsers int    `json:"activeUsers"`
}

type LoginResponse struct {
	Token string `json:"token"`
}
type ErrorResponse struct {
	Error string `json:"error"`
}

type SystemLogEntry struct {
	Timestamp string `json:"timestamp" example:"2025-08-17T14:35:25Z"`
	Level     string `json:"level" example:"INFO"`
	Message   string `json:"message" example:"New health data batch processed successfully (156 records)"`
}

type NetworkStatusEntry struct {
	Name string `json:"name" example:"internet-status"`

	// Internet Status Fields
	ISP           string `json:"isp,omitempty" example:"AIS Fiber"`
	DownSpeedMbps int    `json:"downSpeedMbps,omitempty" example:"156"`
	UpSpeedMbps   int    `json:"upSpeedMbps,omitempty" example:"45"`
	LatencyMs     int    `json:"latencyMs,omitempty" example:"12"`

	// LoRaWAN Status Fields
	GatewaysActive int `json:"gatewaysActive,omitempty" example:"24"`
	DevicesOnline  int `json:"devicesOnline,omitempty" example:"2721"`
	DevicesOffline int `json:"devicesOffline,omitempty" example:"126"`

	// Security Status Fields
	FirewallStatus  string `json:"firewallStatus,omitempty" example:"active"`
	IdsStatus       string `json:"idsStatus,omitempty" example:"active"`
	SecurityThreats int    `json:"securityThreats,omitempty" example:"0"`
	BlockedIPs      int    `json:"blockedIPs,omitempty" example:"5"`
	LastScan        string `json:"lastScan,omitempty" example:"2025-08-19T13:50:00Z"`

	// Common Fields
	Status     string `json:"status,omitempty" example:"online"`
	LastUpdate string `json:"lastUpdate,omitempty" example:"2025-08-19T14:20:00Z"`
}

type NetworkSummaryResponse struct {
	Networks []NetworkStatusEntry `json:"networks"`
}
type AlertSummaryResponse struct { //แนวคิดคือ ถ้า Alert ไหนแจ้งเตือน Cri hight Medium ให้มันบวก 1 ละเก็บไว้
	Critical    int `json:"critical" example:"3"`
	High        int `json:"high_priority" example:"7"`
	Medium      int `json:"medium_priority" example:"12"`
	TotalAlerts int `json:"total_alerts" example:"45"`
}

type TeamStatusEntry struct {
	TeamName string `json:"team_name" example:"ทีม Alpha-1"`
	Status   string `json:"status" example:"กำลังเดินทาง - ETA 5 นาที"`
	IsReady  bool   `json:"is_ready" example:"false"`

	VehicleLocation Location `json:"vehicle_location"`
}

type Location struct {
	Latitude  float64 `json:"lat" example:"13.738012"`
	Longitude float64 `json:"lon" example:"100.781605"`
}

// ---------------- Mock Data ----------------

var users = []User{
	{
		UserID:      1,
		Username:    "yu",
		Password:    "1234",
		Name:        "Sarunyu Chooyat",
		Phone:       "0123456789",
		Role:        "System Admin",
		Email:       "66015172@kmitl.ac.th",
		ZoneIDs:     []int{1, 2, 3, 4, 5, 6, 7},
		Permissions: []string{"manage_zones", "manage_users", "view_all"},
		Status:      "Online",
	},
	{
		UserID:      2,
		Username:    "ink",
		Password:    "5678",
		Name:        "Pruettinan Limlertvaree",
		Phone:       "0996291914",
		Role:        "Zone Admin",
		Email:       "66015134@kmitl.ac.th",
		ZoneIDs:     []int{1, 3, 4},
		Permissions: []string{"manage_elderly", "view_devices", "view_health"},
		Status:      "Online",
	},
	{
		UserID:      3,
		Username:    "eak",
		Password:    "9999",
		Name:        "Detsukmongkol Bunta",
		Phone:       "0987654321",
		Role:        "Zone Staff",
		Email:       "66015072@kmitl.ac.th",
		ZoneIDs:     []int{2},
		Permissions: []string{"manage_elderly", "view_devices", "view_health"},
		StaffInfo: &StaffDetail{
			Position:    "เจ้าหน้าที่ IT",
			Description: "เจ้าหน้าที่ IT รับผิดชอบระบบและอุปกรณ์",
		},
		Status: "Online",
	},
	{
		UserID:      4,
		Username:    "book",
		Password:    "9999",
		Name:        "Aphiwit Somphet",
		Phone:       "0987443121",
		Role:        "Zone Staff",
		Email:       "66015221@kmitl.ac.th",
		ZoneIDs:     []int{2},
		Permissions: []string{"manage_elderly", "view_devices", "view_health"},
		StaffInfo: &StaffDetail{
			Position:    "นักสังคมสงเคราะห์",
			Description: "เชี่ยวชาญด้านดูแลผู้สูงอายุ",
		},
		Status: "offline",
	},
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
		ID: "E001", Name: "นายสมชาย มั่นคง", Age: 72, Gender: "ชาย", Status: "critical", CitizenID: "1309903050900",
		Vitals:   Vitals{HeartRate: 125, BloodPressure: "160/95", SpO2: 94, Temperature: 37.1},
		DeviceID: "SW-2024-001", Battery: 78, LastUpdated: "2025-08-20T14:30:00Z", ZoneID: 1,
	},
	{
		ID: "E002", Name: "นางสมศรี ใจดี", Age: 68, Gender: "หญิง", Status: "stable", CitizenID: "1309903050901",
		Vitals:   Vitals{HeartRate: 82, BloodPressure: "125/80", SpO2: 97, Temperature: 36.7},
		DeviceID: "SW-2024-002", Battery: 55, LastUpdated: "2025-08-20T14:32:00Z", ZoneID: 1,
	},
	{
		ID: "E003", Name: "นายบุญเลิศ ขยัน", Age: 75, Gender: "ชาย", Status: "warning", CitizenID: "1309903050902",
		Vitals:   Vitals{HeartRate: 102, BloodPressure: "150/92", SpO2: 93, Temperature: 38.0},
		DeviceID: "SW-2024-003", Battery: 22, LastUpdated: "2025-08-20T14:35:00Z", ZoneID: 2,
	},
	{
		ID: "E004", Name: "นางละไม สุขใจ", Age: 70, Gender: "หญิง", Status: "stable", CitizenID: "1309903050903",
		Vitals:   Vitals{HeartRate: 76, BloodPressure: "118/76", SpO2: 99, Temperature: 36.5},
		DeviceID: "SW-2024-004", Battery: 90, LastUpdated: "2025-08-20T14:40:00Z", ZoneID: 2,
	},
	{
		ID: "E005", Name: "นายมานพ อดทน", Age: 80, Gender: "ชาย", Status: "critical", CitizenID: "1309903050904",
		Vitals:   Vitals{HeartRate: 130, BloodPressure: "170/100", SpO2: 88, Temperature: 39.2},
		DeviceID: "SW-2024-005", Battery: 12, LastUpdated: "2025-08-20T14:45:00Z", ZoneID: 2,
	},
	{
		ID: "E006", Name: "นายรัสวิ อิอิ", Age: 80, Gender: "ชาย", Status: "stable", CitizenID: "1309903050904",
		Vitals:   Vitals{HeartRate: 130, BloodPressure: "170/100", SpO2: 88, Temperature: 39.2},
		DeviceID: "SW-2024-005", Battery: 19, LastUpdated: "2025-08-20T14:45:00Z", ZoneID: 2,
	},
	{
		ID: "E007", Name: "นายมานพ อดทน", Age: 80, Gender: "ชาย", Status: "critical", CitizenID: "1309903050904",
		Vitals:   Vitals{HeartRate: 130, BloodPressure: "170/100", SpO2: 88, Temperature: 39.2},
		DeviceID: "SW-2024-005", Battery: 12, LastUpdated: "2025-08-20T14:45:00Z", ZoneID: 3,
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
		ZoneID:       1,
	},
	{
		DeviceID:     "SW-2024-002",
		SerialNumber: "JSW240002",
		Type:         "SmartWatch",
		Model:        "J3 iSmart Watch",
		Battery:      55,
		LastUpdate:   "2025-08-20T14:32:00Z",
		Status:       "offline",
		AssignedTo:   "นางสมศรี ใจดี",
		Features:     []string{"SpO2", "Heart Rate", "Body Temp", "Blood Pressure"},
		ZoneID:       1,
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
		ZoneID:       2,
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
		ZoneID:       2,
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
		ZoneID:       3,
	},
	{
		DeviceID:     "SW-2024-006",
		SerialNumber: "JSW240006",
		Type:         "SmartWatch",
		Model:        "J3 iSmart Watch",
		Battery:      50,
		LastUpdate:   "2025-08-20T14:45:00Z",
		Status:       "online",
		AssignedTo:   "",
		Features:     []string{"SpO2", "Heart Rate", "Body Temp", "Blood Pressure"},
		ZoneID:       0,
	},
	{
		DeviceID:     "SW-2024-007",
		SerialNumber: "JSW240007",
		Type:         "SmartWatch",
		Model:        "J3 iSmart Watch",
		Battery:      42,
		LastUpdate:   "2025-08-20T14:45:00Z",
		Status:       "online",
		AssignedTo:   "",
		Features:     []string{"SpO2", "Heart Rate", "Body Temp", "Blood Pressure"},
		ZoneID:       0,
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
		Status:      "online",
	},
	{
		Name:        "Database Server",
		CPUUsage:    67,
		MemoryUsed:  "28.4GB",
		MemoryTotal: "32GB",
		DiskUsed:    "1.2TB",
		DiskTotal:   "2TB",
		Status:      "online",
	},
	{
		Name:        "Analytics Server",
		CPUUsage:    88,
		MemoryUsed:  "30.1GB",
		MemoryTotal: "32GB",
		DiskUsed:    "1.8TB",
		DiskTotal:   "2TB",
		Status:      "online",
	},
	{
		Name:        "Web Application Server",
		CPUUsage:    34,
		MemoryUsed:  "8.2GB",
		MemoryTotal: "16GB",
		DiskUsed:    "234GB",
		DiskTotal:   "1TB",
		Status:      "offline",
	},
}

var alerts = []Alert{
	{
		ID:          1,
		Title:       "Analytics Server High Memory Usage",
		Description: "Memory usage reached 94% - immediate attention required",
		CreatedAt:   "2025-08-19T10:25:00Z",
		Type:        "critical",
		Status:      "new",
	},
	{
		ID:          2,
		Title:       "3 อุปกรณ์ใน Zone ลาดกระบัง ไม่ส่งสัญญาณ",
		Description: "Device offline เกิน 30 นาที - ตรวจสอบการเชื่อมต่อ",
		CreatedAt:   "2025-08-19T10:10:00Z",
		Type:        "warning",
		Status:      "new",
	},
	{
		ID:          3,
		Title:       "Database Backup Completed",
		Description: "Nightly backup finished successfully",
		CreatedAt:   "2025-08-19T00:30:00Z",
		Type:        "info",
		Status:      "new",
	},
}

var usageTrends = []UsageTrend{ //mock up ไปก่อน จริงๆ ต้องมีการบันทึก date เก็บลงฐานข้อมูล ว่ามี user เข้าใช้งานกี่คนในเว็บ แต่ละวัน
	{Date: "2025-07-20", ActiveUsers: 120},
	{Date: "2025-07-21", ActiveUsers: 134},
	{Date: "2025-07-22", ActiveUsers: 140},
	{Date: "2025-07-23", ActiveUsers: 110},
	{Date: "2025-07-24", ActiveUsers: 150},
}
var logs = []SystemLogEntry{
	{
		Timestamp: "2025-08-17T14:35:25Z",
		Level:     "INFO",
		Message:   "New health data batch processed successfully (156 records)",
	},
	{
		Timestamp: "2025-08-17T14:30:03Z",
		Level:     "WARN",
		Message:   "Gateway ZN005: Signal strength below optimal threshold",
	},
}
var networks = []NetworkStatusEntry{
	{
		Name:          "internet-status",
		ISP:           "AIS Fiber",
		DownSpeedMbps: 156,
		UpSpeedMbps:   45,
		LatencyMs:     12,
		Status:        "online",
	},
	{
		Name:           "lorawan-status",
		GatewaysActive: 24,
		DevicesOnline:  2721,
		DevicesOffline: 126,
		LastUpdate:     "2025-08-19T14:20:00Z",
	},
	{
		Name:            "security-status",
		FirewallStatus:  "active",
		IdsStatus:       "active",
		SecurityThreats: 0,
		BlockedIPs:      5,
		LastScan:        "2025-08-19T13:50:00Z",
	},
}
var summary = AlertSummaryResponse{
	Critical:    3,
	High:        7,
	Medium:      12,
	TotalAlerts: 45,
}

var teams = []TeamStatusEntry{
	{
		TeamName:        "ทีม Alpha-1",
		Status:          "กำลังเดินทาง - ETA 5 นาที",
		IsReady:         false,
		VehicleLocation: Location{Latitude: 13.7563, Longitude: 100.5018},
	},
	{
		TeamName:        "ทีม Beta-2",
		Status:          "พร้อมตอบรับแล้ว",
		IsReady:         true,
		VehicleLocation: Location{Latitude: 13.6890, Longitude: 100.7510},
	},
	{
		TeamName:        "ทีม Gamma-3",
		Status:          "รอกู้คืนระบบ",
		IsReady:         true,
		VehicleLocation: Location{Latitude: 13.8000, Longitude: 100.4000},
	},
}
