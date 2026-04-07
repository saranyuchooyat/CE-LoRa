#!/bin/bash
mongoimport --db LoRa --collection users --file /docker-entrypoint-initdb.d/LoRa.users.json --jsonArray
mongoimport --db LoRa --collection zones --file /docker-entrypoint-initdb.d/LoRa.zones.json --jsonArray
mongoimport --db LoRa --collection elders --file /docker-entrypoint-initdb.d/LoRa.elders.json --jsonArray
mongoimport --db LoRa --collection devices --file /docker-entrypoint-initdb.d/LoRa.devices.json --jsonArray
mongoimport --db LoRa --collection device_data --file /docker-entrypoint-initdb.d/LoRa.device_data.json --jsonArray
mongoimport --db LoRa --collection alerts --file /docker-entrypoint-initdb.d/LoRa.alerts.json --jsonArray