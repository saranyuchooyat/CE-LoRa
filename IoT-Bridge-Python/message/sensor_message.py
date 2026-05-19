from dataclasses import dataclass
from datetime import datetime

@dataclass
class Device:
    device_name : str
    device_model: str
    device_type: str

@dataclass
class Location:
    latitude: float
    longitude: float

@dataclass
class SmartwatchData:
    is_wearing: bool
    device_battery: int
    body_temperature: float
    skin_temperature:float
    steps: int
    activity_level: int
    stress_level: int
    spo2: int
    heart_rate: int
    heart_rate_variability: int
    blood_pressure_systolic: int
    blood_pressure_diastolic: int
    is_fallen: bool
    is_sos_called: bool

@dataclass
class LocationData:
    longtitude:int
    latitude:int
    
@dataclass
class SosData:
    is_sos_called:bool
    device_battery:int
    
@dataclass
class SmartwatchPayload:
    api_version: str
    data_type: str
    device: Device
    timestamp: str  # You can convert this to datetime if needed
    location: Location
    smartwatch_data: SmartwatchData
