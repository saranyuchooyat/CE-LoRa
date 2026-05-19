import { useState, useEffect } from "react";

// 💡 1. กำหนด Array ของตัวเลือกทั้งหมด
const DEFAULT_OPTIONS = ['Active', 'Inactive', 'ทั้งหมด']; 
const ROLE_OPTIONS = ['System Admin', 'Zone Admin','Zone Staff' , 'ทั้งหมด'];
const DEVICE_TYPE_OPTIONS = ['X7', 'J3', 'ED20W', 'ทั้งหมด'];

// FilterDropdown.jsx
function FilterDropdown({ onSelect, currentValue, optionalKey, data }) {
    const [statusValues, setStatusValues] = useState([]);

    useEffect(() => {
        if (optionalKey === "zonestaff") {
            // 💡 เก็บทั้งออบเจกต์เพื่อให้มีทั้งชื่อแสดงผลและ ID สำหรับกรอง
            const zoneOptions = data.map(item => ({ label: item.label, value: item.value }));
            setStatusValues([{ label: 'ทั้งหมด', value: 'ทั้งหมด' }, ...zoneOptions]);
        } 
        else if (optionalKey === "deviceType") {
            const deviceOptions = DEVICE_TYPE_OPTIONS.map(item => ({ label: item, value: item }));
            setStatusValues(deviceOptions);
        }
        else {
            // สำหรับ Role หรือ Status ทั่วไป
            const options = (optionalKey === "role" ? ROLE_OPTIONS : DEFAULT_OPTIONS)
                .map(opt => ({ label: opt, value: opt }));
            setStatusValues(options);
        }
    }, [optionalKey, data]);

    return (
        <div className="dropdown-menu">
            {statusValues.map((item, index) => (
                <div 
                    key={index}
                    className={`cursor-pointer hover:bg-gray-300 p-2 ${currentValue === item.value ? 'font-bold bg-gray-200' : ''}`}
                    onClick={() => onSelect(item.value)} // 💡 ส่ง ID (value) กลับไป
                >
                    {item.label} 
                </div>
            ))}
        </div>
    );
}

export default FilterDropdown;