import paho.mqtt.client as mqtt
import json
import time
from datetime import datetime, timedelta, timezone

MQTT_HOST = "localhost"
MQTT_PORT = 1883
TOPIC = "processed/smartwatch/data" 

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.connect(MQTT_HOST, MQTT_PORT)

def send_payload(case_name, hr=80, is_fallen=False, battery=80, lat=13.72, lon=100.76,blood_pressure_systolic=120,blood_pressure_diastolic=80):
    tz = timezone(timedelta(hours=7))
    payload = {
        "api_version":"2.0",
        "data_type":"Data",
        "device":{
            "device_name": "J3_Smartwatch_01",
            "device_model": "Smartwatch_V2_Mock",   
            "device_type": "smartwatch"
        },
        "timestamp":datetime.now(tz).isoformat(timespec="seconds"),
        "location": {
                "latitude": lat,
                "longitude": lon
        },
        "smartwatch_data": {
            "is_wearing": True,
            "device_battery": battery,
            "body_temperature": 36.5,
            "skin_temperature": 32.0,
            "blood_pressure_systolic": blood_pressure_systolic,
            "blood_pressure_diastolic": blood_pressure_diastolic,
            "heart_rate_variability": 50,
            "steps": 1200,
            "activity_level": 2,
            "stress_level": 10,
            "spo2": 99,
            "heart_rate": hr,
            "is_fallen": is_fallen,
            "is_sos_called": False,
        }
    }
    
    client.publish(TOPIC, json.dumps(payload))
    print(f"[SENT] {case_name}: HR={hr}, Batt={battery}%, Fallen={is_fallen}, Loc={lat},{lon}")


print("--- Smartwatch Simulator (Advanced) ---")
print("1: คนล้ม (Emergency)")
print("2: หัวใจเต้นสูง (150+ bpm)")
print("3: แบตเตอรี่ต่ำ (15%)")
print("4: หัวใจเต้นช้าผิดปกติ (45 bpm)")
print("5: ส่งจากโซนอื่น (บางนา)")
print("6: RESET เป็นสถานะปกติ (HR 75, Batt 90, ไม่ล้ม)") 
print("7: เคสความดันสูง") 
print("8: เคสความดันต่ำ") 
print("0: ออกจากโปรแกรม")

while True:
    choice = input("\nเลือกเคสที่ต้องการเทส: ")
    
    if choice == "1":
        send_payload("FALL_CASE", is_fallen=True, hr=90) 
        
    elif choice == "2":
        print("ส่งข้อมูล HR สูงต่อเนื่อง...")
        for i in range(3):
            send_payload(f"HIGH_HR_{i+1}", hr=140+(i*5))
            time.sleep(1)
            
    elif choice == "3":
        send_payload("LOW_BATTERY_CASE", battery=15)

    elif choice == "4":
        send_payload("LOW_HR_CASE", hr=45)

    elif choice == "5":
        send_payload("BANGNA_ZONE_CASE", lat=13.668, lon=100.623)

    elif choice == "6":
        send_payload("NORMAL_RESET_CASE", hr=75, is_fallen=False, battery=90)
        print("✅ ส่งข้อมูลสถานะปกติเรียบร้อย ระบบควรกลับเป็นสีเขียว")
        
    elif choice == "7":
        send_payload("ความดัน_case_high", blood_pressure_systolic=160,blood_pressure_diastolic=100, is_fallen=False, battery=90)
        print("✅ ส่งข้อมูลสถานะปกติเรียบร้อย ระบบควรกลับเป็นสีเขียว")
        
    elif choice == "8":
        send_payload("ความดัน_case_Low", blood_pressure_systolic=80,blood_pressure_diastolic=50, is_fallen=False, battery=90)
        print("✅ ส่งข้อมูลสถานะปกติเรียบร้อย ระบบควรกลับเป็นสีเขียว")
    
    elif choice == "0":
        break
    else:
        print("กรุณาเลือก 0-6")

client.disconnect()