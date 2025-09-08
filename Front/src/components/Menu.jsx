import { useState } from "react";




function Menu(){
    const [btn,SetBtn]=useState(false);

    function activeBtn(){
        
        if (btn == false){
            SetBtn(true)
        }
        else if (btn == true){
            SetBtn(false)
        }
    }

    return(
        <>
            <div className="mt-3 mx-5">
                <div>
                    <p className="text-[22px] font-bold">System Admin Menu </p>
                    <div className="flex justify-start mt-1">
                        <button className="menu-btn" onClick={activeBtn()}>System Overview Dashboard</button>
                       <button className="menu-btn">Zone Management</button>
                       <button className="menu-btn">User Management</button>
                       <button className="menu-btn">System Health Monitoring</button>
                       <button className="menu-btn">System Health Monitoring</button>
                    </div>


                </div>
            </div>
        </>
    );
}

export default Menu