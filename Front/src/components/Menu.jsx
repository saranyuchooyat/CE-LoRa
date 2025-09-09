import { useState } from "react";

function Menu(){
    // ใช้ชื่อตัวแปรตาม convention: 'btnActive' และ 'setBtnActive'
    const [btnActive, setBtnActive] = useState(false);
    const [role, setRole] = useState({
    SystemAdmin: ["System Overview Dashboard","Zone Management","User Management","System Health Monitoring"],
    ZoneAdmin: ["Zone Dashboard","Device Management","System Health Monitoring"],
    ZoneStaff: ["Elderly Monitoring","Alert Management","Reports","Zone Map Overview","System Health Monitoring"],
    ElderyCaregiver: ["System Overview Dashboard","System Health Monitoring"],
  });

    // ฟังก์ชันสำหรับสลับค่า state ให้สั้นลง
    function activeBtn(){
        setBtnActive(!btnActive);
    }

    return(
        <>
            <div className="mt-3 mx-5">
                <div>
                    <p className="text-[22px] font-bold">System Admin Menu </p>
                    <div className="flex justify-start mt-1">
                        <button className={`menu-btn ${btnActive ? 'bg-main-green text-white' : ''}`} onClick={activeBtn}>
                            System Overview Dashboard
                        </button>
                        <button className="menu-btn">Zone Management</button>
                        <button className="menu-btn">User Management</button>
                        <button className="menu-btn">System Health Monitoring</button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Menu;