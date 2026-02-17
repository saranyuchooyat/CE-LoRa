import { useState, useEffect } from "react";

function StatusDropdown({ onSelect, currentValue, optionalKey }) {
    
    const [statusValues, setStatusValues] = useState({
        value1: 'Active', 
        value2: 'Inactive'
    });
    
    useEffect(() => {
        if (optionalKey === "province") {
            // ตั้งค่าสำหรับ Zone Status
            setStatusValues({
                value1: 'active',
                value2: 'inactive'
            });
        } else if (optionalKey === "role" || optionalKey === "zonestaff") {
            // ตั้งค่าสำหรับ Device Status/Role
            setStatusValues({
                value1: 'Online',
                value2: 'offline'
            });
        }
        else if (optionalKey === "deviceType") {
            // ตั้งค่าสำหรับ Device Type
            setStatusValues({
                value1: 'online',
                value2: 'offline',
                value3: 'unassigned'
            });
        }
        else if (optionalKey === "Elder") {
            // ตั้งค่าสำหรับ Device Type
            setStatusValues({
                value1: 'stable',
                value2: 'warning',
                value3: 'critical'
            });
        }
        else {
             // ค่า Default หาก optionalKey ไม่ตรง
             setStatusValues({
                value1: 'Active',
                value2: 'Inactive'
            });
        }
    }, [optionalKey]);

    const handleItemClick = (value) => {
        onSelect(value);
    };

    return (
        <div className="dropdown-menu">
            {Object.values(statusValues).map((value, index) => (
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

export default StatusDropdown;