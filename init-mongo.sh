#!/bin/bash
echo "เริ่มการนำเข้าข้อมูล (Importing Dump Data)..."

mongoimport --db LoRa --collection alerts --type json --file /docker-entrypoint-initdb.d/LoRa.alerts.json --jsonArray
mongoimport --db LoRa --collection device_data --type json --file /docker-entrypoint-initdb.d/LoRa.device_data.json --jsonArray
mongoimport --db LoRa --collection devices --type json --file /docker-entrypoint-initdb.d/LoRa.devices.json --jsonArray
mongoimport --db LoRa --collection elders --type json --file /docker-entrypoint-initdb.d/LoRa.elders.json --jsonArray
mongoimport --db LoRa --collection users --type json --file /docker-entrypoint-initdb.d/LoRa.users.json --jsonArray
mongoimport --db LoRa --collection zones --type json --file /docker-entrypoint-initdb.d/LoRa.zones.json --jsonArray

echo "นำเข้าข้อมูลสำเร็จ ครบทั้ง 6 Collections!"