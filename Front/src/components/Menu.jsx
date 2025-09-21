import { useState, useEffect } from "react"; // เพิ่ม useEffect
import { Link, useLocation } from 'react-router-dom'; // เพิ่ม useLocation

function Menu() {
    // กำหนด initial state ให้เป็นค่าเริ่มต้น หรือ null
    const [currentRole, setCurrentRole] = useState(null); 
    const [activeButton, setActiveButton] = useState("System Overview Dashboard");
    const location = useLocation(); // เรียกใช้ useLocation

    console.log(location)
    // ใช้ useEffect เพื่อรับค่า role จาก state
    useEffect(() => {
        if (location.state?.role) {
            setCurrentRole(location.state.role);
        }
    }, [location.state]); // Dependency array: ให้ useEffect ทำงานเมื่อ location.state เปลี่ยน

    const roleRoutes = {
        "System Admin": {
            "System Overview Dashboard": "/system-overview-dashboard",
            "Zone Management": "/zone-management",
            "User Management": "/user-management",
            "System Health Monitoring": "/health-monitoring"
        },
        "Zone Admin": {
            "Zone Dashboard": "/zone-dashboard",
            "Device Management": "/device-management",
            "Zone Staff Management": "/zone-staff-management",
            "System Health Monitoring": "/health-monitoring"
        },
        "Zone Staff": {
            "Eldery Monitoring": "/eldery-monitoring",
            "Alert Management": "/alert-management",
            "Reports": "/reports",
            "Zone Map Overview": "/zone-map-overview",
            "System Health Monitoring": "/health-monitoring"
        },
        "Elderly Caregiver": {}
    };

    const handleButtonClick = (buttonTitle) => {
        setActiveButton(buttonTitle);
    };

    const renderMenuButtons = (role) => {
        // ตรวจสอบว่า role มีอยู่ใน roleRoutes หรือไม่ก่อนจะเข้าถึง
        if (!role || !roleRoutes[role]) {
            return null; // หรือแสดงข้อความ/component ที่เหมาะสม
        }
        
        const buttons = roleRoutes[role];
        return Object.keys(buttons).map((buttonTitle) => (
            <Link
                key={buttonTitle}
                to={buttons[buttonTitle]}
                onClick={() => handleButtonClick(buttonTitle)}
                className={`menu-btn ${activeButton === buttonTitle ? 'bg-main-green text-white' : ''}`}
            >
                {buttonTitle}
            </Link>
        ));
    };

    return (
        <>
            <div className="mt-3 mx-5">
                <div>
                    {/* แสดง role ที่ได้รับมา หรือข้อความเริ่มต้น */}
                    <p className="text-[22px] font-bold">{currentRole ? `${currentRole} Menu` : 'Loading Menu...'}</p>
                    <div className="flex justify-start mt-1">
                        {/* ส่ง currentRole ที่อัปเดตแล้วไปที่ renderMenuButtons */}
                        {renderMenuButtons(currentRole)}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Menu;