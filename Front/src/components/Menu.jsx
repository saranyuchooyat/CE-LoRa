import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import NotificationBell from "./Notificationbells";
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
      "Alert Management": "/alert-management",
    },
  };

  useEffect(() => {
    if (currentRole && roleRoutes[currentRole]) {
      const currentPath = location.pathname;
      const buttons = roleRoutes[currentRole];

      // วนลูปเช็คความตรงกันแบบ 100%
      for (const buttonTitle in buttons) {
        if (buttons[buttonTitle] === currentPath) {
          setActiveButton(buttonTitle);
          return;
        }
      }

      // จัดการกรณี Sub-path ของหน้าลูก
      if (currentPath.startsWith("/zone-details/")) {
        if (buttons["Zone Management"]) {
          setActiveButton("Zone Management");
          return;
        } else if (buttons["Zone Dashboard"]) {
          setActiveButton("Zone Dashboard");
          return;
        }
      }

      // ไม่พบหน้านี้ในเมนู
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
        {/* ส่วนหัว: ชื่อ Role */}
        <p className="text-[22px] font-bold">
          {currentRole ? `${currentRole} Menu` : "Loading Menu..."}
        </p>

        {/* ส่วนแถวเมนู: ใช้ flex และ w-full เพื่อแผ่ให้เต็มความกว้าง */}
        <div className="flex items-center justify-between mt-1 w-full">
          {/* กลุ่มปุ่มเมนูทางซ้าย */}
          <div className="flex justify-start gap-2">
            {renderMenuButtons(currentRole)}
          </div>

          {/* กลุ่มกระดิ่งทางขวาสุด */}
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
