import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import NotificationBell from "./notificationbells";
function Menu() {
  const [currentRole, setCurrentRole] = useState(null);
  const [activeButton, setActiveButton] = useState(null);
  const location = useLocation();

  useEffect(() => {
    let userRole = null;

    if (location.state?.role) {
      userRole = location.state.role;
    }

    else {
      const storedUser = sessionStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          userRole = userData.role;
        } catch (e) {
          console.error("Failed to parse user data from sessionStorage:", e);
        }
      }
    }

    if (userRole) {
      setCurrentRole(userRole);
    }
  }, [location.state]);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);

      if (userData.role === "Zone Staff" && userData.is_caregiver === true) {
        setCurrentRole("Elderly Caregiver");
      } else {
        setCurrentRole(userData.role);
      }
    }
  }, [location.pathname]);
  const roleRoutes = {
    "System Admin": {
      "System Overview Dashboard": "/system-overview-dashboard",
      "Zone Management": "/zone-management",
      "User Management": "/user-management",
    },
    "Zone Admin": {
      "Zone Dashboard": "/zone-dashboard",
      "Alert Management": "/alert-management",
      "Device Management": "/device-management",
      "Zone Staff Management": "/zone-staff-management",
    },
    "Zone Staff": {
      "Eldery Monitoring": "/eldery-monitoring",
      "Alert Management": "/alert-management",
    },
    "Elderly Caregiver": {
      "My Elders Dashboard": "/caregiver",
      "Alert Management": "/my-alert-management",
    },
  };

  useEffect(() => {
    if (currentRole && roleRoutes[currentRole]) {
      const currentPath = location.pathname;
      const buttons = roleRoutes[currentRole];

      for (const buttonTitle in buttons) {
        if (buttons[buttonTitle] === currentPath) {
          setActiveButton(buttonTitle);
          return;
        }
      }

      if (currentPath.startsWith("/zone-details/")) {
        if (buttons["Zone Management"]) {
          setActiveButton("Zone Management");
          return;
        } else if (buttons["Zone Dashboard"]) {
          setActiveButton("Zone Dashboard");
          return;
        }
      }

      setActiveButton(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, currentRole]);

  // const handleButtonClick = (buttonTitle) => {
  //     setActiveButton(buttonTitle);
  // };

  const renderMenuButtons = (role) => {
    if (!role || !roleRoutes[role]) {
      return null;
    }

    const buttons = roleRoutes[role];
    return Object.keys(buttons).map((buttonTitle) => (
      <Link
        key={buttonTitle}
        to={buttons[buttonTitle]}
        className={`menu-btn ${activeButton === buttonTitle ? "bg-main-green text-white" : ""}`}
      >
        {buttonTitle}
      </Link>
    ));
  };

  return (
    <div className="mt-3 mx-5">
      <div>
        <p className="text-[22px] font-bold">
          {currentRole ? `${currentRole} Menu` : "Loading Menu..."}
        </p>

        <div className="flex items-center justify-between mt-1 w-full">
          <div className="flex justify-start gap-2">
            {renderMenuButtons(currentRole)}
          </div>

          <div className="flex items-center">
            {["Zone Staff", "Elderly Caregiver", "Zone Admin"].includes(
              currentRole,
            ) && <NotificationBell />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Menu;
