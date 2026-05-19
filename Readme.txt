
Project: CE68-GG-13-Elderly Health Index Measurement System

1. ภาพรวมของระบบ (System Overview)
----------------------------------
ระบบนี้เป็นระบบดูแลผู้สูงอายุผ่านเครือข่าย LoRaWAN ประกอบด้วย 3 ส่วนหลัก:
- IoT Layer: การจำลองข้อมูล (Mock Data) และการจัดการเครือข่าย (ChirpStack)
- Processing Layer: Python Bridge สำหรับแปลงและคัดกรองข้อมูลลง Database
- Application Layer: Backend (Go Fiber) และ Frontend (React Dashboard)

2. โครงสร้างไฟล์และคำอธิบาย (File Directory & Descriptions)
------------------------------------------------------
/Frontend-React       : Source code หน้าจอ Dashboard สำหรับเจ้าหน้าที่
/Backend-Go           : Source code ระบบ API และ Logic ของระบบทั้งหมด
/IoT-Bridge-Python    : โค้ดสำหรับดึงข้อมูลจาก MQTT มาแปลงเป็น JSON 
                        และบันทึกลง MongoDB
/ChirpStack-Docker    : ไฟล์สำหรับติดตั้ง LoRaWAN Network Server (Docker Compose) 
                        รวมถึงไฟล์ Config (.toml) และ Payload Codec (JavaScript)
/Mock-Data-Sim        : สคริปต์ Python สำหรับยิงข้อมูลจำลองกรณีต่างๆ 
                        (เช่น การล้มปกติ, ค่า Heartสูง, ความดันสูงและต่ำ, สถานะแบตเตอรี่ต่ำ)

3. วิธีการติดตั้งและรันระบบ (Installation Guide)
---------------------------------------------
1. ตรวจสอบว่าเครื่องมี Docker และ Docker Desktop ติดตั้งอยู่
2. แตกไฟล์ ZIP และเปิด Terminal ในไดเรกทอรีหลัก
3. รันคำสั่ง: cd chirpstack-docker 
4. รันคำสั่ง: docker compose up
5. เปิด terminal ใหม่
6. รันคำสั่ง: cd IoT-Bridge-Python
7. รันคำสั่ง: docker compose up
8. รันค่ำสัง: cd CE-Lora และ cd FrontEnd
9. รันคำสั่ง: npm install
10. รันคำสั่ง: npm run dev
 เข้าใช้งานระบบ:
   - Frontend: http://localhost:5173/
   - ChirpStack Console: http://localhost:8082

4. รายละเอียดเพิ่มเติม
--------------------
- ข้อมูลจำลอง (Mock Data): สามารถรันสคริปต์ในโฟลเดอร์ /Mock-Data-Sim
  1.ติดตั้งบน Terminal รันคำสั่ง:  pip install paho-mqtt
  เพื่อทดสอบ Alert Popup บนหน้าเว็บได้ทันที แต่ต้อง run docker ทั้งหมดในระบบตามข้างบนให้ครบก่อน
- Database: ระบบใช้ MongoDB ในการจัดเก็บข้อมูลสุขภาพ เจ้าหน้าที่ ข้อมูลผู้สูงอายุ ข้อมูลนาฬิกา อุปกรณ์ต่างๆ และรายการแจ้งเตือน 
- Chirpstack server : เมื่อรัน docker สำเร็จและเปิดหน้าเว็บจะ login ด้วย username:admin password:admin
และการ setup ต่างๆ ผู้ใช้จะต้องลงทะเบียน gateway และนาฬิกา Lora เข้าไปในระบบ และปรับ Ip ให้ gateway เชื่อม networkserver 
ผ่าน cmd ด้วย ipconfig และไปที่ Wireless LAN adapter Wi-Fi: ในส่วนของ ipv4
