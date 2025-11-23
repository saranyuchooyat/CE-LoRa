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
                value1: 'Active',
                value2: 'Inactive'
            });
        } else if (optionalKey === "role") {
            // ตั้งค่าสำหรับ Device Status/Role
            setStatusValues({
                value1: 'Online',
                value2: 'offline'
            });
        } else {
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
            <div 
                className={`cursor-pointer hover:bg-gray-300 p-2 ${currentValue === statusValues.value1 ? 'font-bold bg-gray-200' : ''}`}
                onClick={() => handleItemClick(statusValues.value1)}
            >
                {statusValues.value1} 
            </div>

            <div 
                className={`cursor-pointer hover:bg-gray-300 p-2 ${currentValue === statusValues.value2 ? 'font-bold bg-gray-200' : ''}`}
                onClick={() => handleItemClick(statusValues.value2)}
            >
                {statusValues.value2}
            </div>
            
            <div 
                className={`cursor-pointer hover:bg-gray-300 p-2 ${currentValue === 'ทั้งหมด' ? 'font-bold bg-gray-200' : ''}`}
                onClick={() => handleItemClick('ทั้งหมด')}
            >
                ทั้งหมด
            </div>
        </div>
    );
}

export default StatusDropdown;