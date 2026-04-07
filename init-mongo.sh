#!/bin/bash

echo "========================================"
echo "เริ่มการนำเข้าข้อมูล (Importing Dump Data)..."
echo "========================================"

# กำหนดชื่อฐานข้อมูล
DB_NAME="LoRa"

# คำสั่งนำเข้าข้อมูลทีละตาราง (อ้างอิงตามชื่อไฟล์ที่จารย์มี)
mongoimport --db $DB_NAME --collection users --file /docker-entrypoint-initdb.d/LoRa.users.json --jsonArray
mongoimport --db $DB_NAME --collection zones --file /docker-entrypoint-initdb.d/LoRa.zones.json --jsonArray
mongoimport --db $DB_NAME --collection elders --file /docker-entrypoint-initdb.d/LoRa.elders.json --jsonArray
mongoimport --db $DB_NAME --collection devices --file /docker-entrypoint-initdb.d/LoRa.devices.json --jsonArray
mongoimport --db $DB_NAME --collection device_data --file /docker-entrypoint-initdb.d/LoRa.device_data.json --jsonArray
mongoimport --db $DB_NAME --collection alerts --file /docker-entrypoint-initdb.d/LoRa.alerts.json --jsonArray

echo "========================================"
echo "นำเข้าข้อมูลเสร็จสมบูรณ์! (Import Completed)"
echo "========================================"