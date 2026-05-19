import paho.mqtt.client as mqtt
import time
import json
import dataclasses
from datetime import datetime, timedelta, timezone
from message.sensor_message import SmartwatchPayload, Device, Location, SmartwatchData,LocationData,SosData

# MQTT Broker settings
BROKER_ADDRESS = "smartcity02.kmitl.ac.th"  
BROKER_PORT = 1883
USER_NAME = "apm03"
PWD = "Kf8f4r2YuL"
TOPIC_READ = "application/9f14033e-688b-4d97-bf44-4bafed576117/device/+/event/up"

LOCAL_BROKER = "localhost" 
TOPIC_WRITE = "processed/smartwatch/data"

publisher = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
# Callback when client connects to broker
def on_connect(client, userdata, flags, reason_code, properties):
    
    if reason_code == 0:
        print("Connected successfully to MQTT broker")
        client.subscribe(TOPIC_READ)
        print(f"Subscribed to topic: {TOPIC_READ}")
    else:
        error_messages = {
            1: "Connection refused - incorrect protocol version",
            2: "Connection refused - invalid client identifier",
            3: "Connection refused - server unavailable",
            4: "Connection refused - bad username or password",
            5: "Connection refused - not authorized"
        }
        
        error = error_messages.get(reason_code, f"Connection failed with code {reason_code}")
        print(f"ERROR: {error}")

# Callback when a message is received
def on_message(client, userdata, message):
        try:
            tz = timezone(timedelta(hours=7))
            ts = datetime.now(tz).isoformat(timespec="seconds")
                
            payload_raw = json.loads(message.payload.decode())
            
            print(f"\n--- ดึงข้อมูลสำเร็จ ---")
                
            data_obj = payload_raw.get('object', {})
            dev_info = payload_raw.get('deviceInfo', {})
            loc_data = data_obj.get('location', {})
            msg_type = data_obj.get('type')
    
            if msg_type == "Body Data":
                print("data")
                sw_data = SmartwatchData(
                    is_wearing = (data_obj.get('wearing_status') == "Worn"),
                    device_battery = data_obj.get('battery_level', 0),
                    body_temperature = data_obj.get('body_temp', 0),
                    skin_temperature = data_obj.get('skin_temp', 0),
                    blood_pressure_systolic = data_obj.get('systolic_bp', 0),
                    blood_pressure_diastolic= data_obj.get('diastolic_bp', 0),
                    heart_rate_variability = data_obj.get('rri_hrv', 0),
                    steps = data_obj.get('steps', 0),
                    activity_level = data_obj.get('activity_level', 0),
                    stress_level = data_obj.get('stress', 0),
                    spo2 = data_obj.get('spo2', 0),
                    heart_rate = data_obj.get('heart_rate', 0),
                    is_fallen = (data_obj.get('fall_flag', 0) == 1),
                    is_sos_called = (data_obj.get('sos_status', 0) == 1)
                )
                
                final_payload = SmartwatchPayload(
                    api_version = "2.0",
                    data_type = "Data",
                    device = Device(
                        device_name = dev_info.get('deviceName', 'unknown'),
                        device_model = dev_info.get('deviceProfileName', 'unknown'),
                        device_type = "smartwatch"
                    ),
                    timestamp=ts,
                    location = Location(
                        latitude = loc_data.get('latitude', "Not found"), 
                        longitude = loc_data.get('longitude', "Not found")
                    ),
                    smartwatch_data = sw_data
                )
                
            if msg_type == "SOS_SIGNAL":
                print("SOS")
                sw_data = SosData(
                    is_sos_called = True, 
                    device_battery = data_obj.get('battery_level', "-"),
                )
                
                final_payload = SmartwatchPayload(
                    api_version = "2.0", 
                    data_type = "SOS",
                    device = Device(
                        device_name = dev_info.get('deviceName', 'unknown'), 
                        device_model = dev_info.get('deviceProfileName', 'unknown'),
                        device_type = "smartwatch"
                    ), 
                    timestamp = ts,
                    location = Location(
                        latitude = loc_data.get('latitude', "Not found"), 
                        longitude = loc_data.get('longitude', "Not found")
                    ),
                    smartwatch_data = sw_data
                )
                

            if msg_type == "GPS Data":
                print("GPS")
                sw_data = LocationData(
                    longtitude = data_obj.get('longitude', "Not found"),
                    latitude = data_obj.get('latitude', "Not found"),
                )
                final_payload = SmartwatchPayload(
                    api_version="2.0", 
                    data_type = "GPS",
                    device = Device(
                        device_name = dev_info.get('deviceName', 'unknown'), 
                        device_model = dev_info.get('deviceProfileName', 'unknown'),
                        device_type = "smartwatch"
                    ), 
                    timestamp=ts,
                    location = Location(
                        latitude = loc_data.get('latitude', "Not found"), 
                        longitude = loc_data.get('longitude', "Not found")
                    ),
                    smartwatch_data=sw_data
                )
            if final_payload:
                formatted_json = json.dumps(dataclasses.asdict(final_payload))
                publisher.connect(LOCAL_BROKER, 1883)
                publisher.publish(TOPIC_WRITE, formatted_json)
                
                print(f"🚀 [Success] Sent {msg_type} to Local Broker")
                print("==========================================\n")

        except Exception as e:
            print(f"❌ Error: {e}")

# --- เริ่มรันระบบ ---
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2) 
client.on_connect = on_connect
client.on_message = on_message
client.username_pw_set(USER_NAME, PWD)

try:
    print(f"กำลังเชื่อมต่อเพื่ออ่านข้อมูลจาก {BROKER_ADDRESS}...")
    client.connect(BROKER_ADDRESS, BROKER_PORT, 60)
    client.loop_forever()
except KeyboardInterrupt:
    print("หยุดการทำงาน")
    client.disconnect()