import { useState, useEffect } from "react";
import { Link, useLocation } from 'react-router-dom';

function Menu() {
    const [currentRole, setCurrentRole] = useState(null); 
    const [activeButton, setActiveButton] = useState(null);
    const location = useLocation();


    useEffect(() => {
        let userRole = null;
        
        // ก. พยายามดึง Role จาก Route State (ใช้ได้เฉพาะตอนเปลี่ยนหน้าจาก Login)
        if (location.state?.role) {
            userRole = location.state.role;
        } 
        
        // ข. หากไม่มีใน Route State ให้พยายามดึงจาก Local Storage (กรณี Refresh)
        else {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    userRole = userData.role;
                } catch (e) {
                    // จัดการหากข้อมูล Local Storage เสียหาย
                    console.error("Failed to parse user data from localStorage:", e);
                }
            }
        }

        // ค. ถ้าพบ Role ให้ตั้งค่า State
        if (userRole) {
            setCurrentRole(userRole);
        }

    }, [location.state]);


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
        if (!role || !roleRoutes[role]) {
            return null;
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
                    <p className="text-[22px] font-bold">{currentRole ? `${currentRole} Menu` : 'Loading Menu...'}</p>
                    <div className="flex justify-start mt-1">
                        {renderMenuButtons(currentRole)}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Menu;