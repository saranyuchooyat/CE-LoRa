import { useState } from "react";
import { Link } from 'react-router-dom';

function Menu() {
    const [currentRole, setCurrentRole] = useState("System Admin");
    const [activeButton, setActiveButton] = useState("System Overview Dashboard");

    const roleRoutes = {
        "System Admin": {
            "System Overview Dashboard": "/system-overview-dashboard",
            "Zone Management": "/zone-management",
            "User Management": "/user-management",
            "System Health Monitoring": "/health-monitoring"
        }
    };

    const handleButtonClick = (buttonTitle) => {
        setActiveButton(buttonTitle);
    };

    const renderMenuButtons = (role) => {
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
                    <p className="text-[22px] font-bold">{currentRole} Menu</p>
                    <div className="flex justify-start mt-1">
                        {renderMenuButtons(currentRole)}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Menu;