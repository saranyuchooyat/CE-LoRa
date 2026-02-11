import { useState, useEffect } from "react";

// 💡 1. กำหนด Array ของตัวเลือกทั้งหมด
const DEFAULT_OPTIONS = ['Active', 'Inactive', 'ทั้งหมด']; 
const ROLE_OPTIONS = ['System Admin', 'Zone Admin','Zone Staff' , 'ทั้งหมด'];
const DEVICE_TYPE_OPTIONS = ['SmartWatch', 'Gateway', 'ทั้งหมด'];

function FilterDropdown({ onSelect, currentValue, optionalKey ,data}) {

    console.log(optionalKey)
    
    // 💡 2. เปลี่ยน State ให้เก็บ Array ของ String
    const [statusValues, setStatusValues] = useState(DEFAULT_OPTIONS); 
    
    useEffect(() => {
        if (optionalKey === "deviceType") {
            // ตั้งค่าสำหรับ Zone Status
            setStatusValues(DEVICE_TYPE_OPTIONS);

        } else if (optionalKey === "role") {
            // ตั้งค่าสำหรับ Device Status/Role
            setStatusValues(ROLE_OPTIONS);
            
        } else if (optionalKey === "zonestaff") {
            // สร้าง Array ของโซนจาก data ที่ส่งมา
            const zoneLabels = data.map(item => item.label);
            setStatusValues([...zoneLabels,'N/A', 'ทั้งหมด']);

        }
        else {
             // ค่า Default
             setStatusValues(DEFAULT_OPTIONS);
        }
    }, [optionalKey]); // 💡 Dependency Array ถูกต้อง

    const handleItemClick = (value) => {
        onSelect(value);
    };

    return (
        <div className="dropdown-menu">
            {/* 💡 3. ใช้ .map() เพื่อวนซ้ำ Array statusValues */}
            {statusValues.map((value, index) => (
                <div 
                    key={index}
                    className={`cursor-pointer hover:bg-gray-300 p-2 ${currentValue === value ? 'font-bold bg-gray-200' : ''}`}
                    onClick={() => handleItemClick(value)}
                >
                    {value} 
                </div>
            ))}
        </div>
    );
}

export default FilterDropdown;