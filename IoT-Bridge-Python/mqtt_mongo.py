import pymongo
from paho.mqtt import client as mqtt
import json
import time

# ตั้งค่า MongoDB
uri = "mongodb://localhost:27017/LoRa"
mongo_client = pymongo.MongoClient(uri)
db = mongo_client["LoRa"]
collection = db["device_data"]

def on_message(client, userdata, message):
    try:
        data = json.loads(message.payload.decode())
        collection.insert_one(data)
        print("บันทึกข้อมูลลง MongoDB เรียบร้อย")
    except Exception as e:
        print(f"Error Saving to Mongo: {e}")

# ตั้งค่า MQTT 
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.on_message = on_message
while True:
    try:
        print("กำลังพยายามเชื่อมต่อ MQTT Broker (localhost:1883)...")
        client.connect("127.0.0.1", 1883, 60) 
        print("เชื่อมต่อ MQTT สำเร็จ!")
        break
    except Exception as e:
        print(f"เชื่อมต่อไม่ได้ (รอ 5 วินาที): {e}")
        time.sleep(5)
client.subscribe("processed/smartwatch/data")
client.loop_forever()