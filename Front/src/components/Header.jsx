import { useState, useEffect } from "react";
import { Link, useLocation } from 'react-router-dom';


function Header(){

    const [currentUser, setCurrentUser] = useState(null); 
    const location = useLocation(); 

    useEffect(() => {
        console.log("header",location.state)
        if (location.state?.user) {
            setCurrentUser(location.state.user);
        }
    }, [location.state]);

    return(
        <>
            <div className="flex items-center justify-between h-[64px] mt-3 mx-5flex items-center justify-between h-[64px] mt-3 mx-5">
                <p className ="text-[24px] font-bold"> Smart Healthcare System</p>

                <div className="flex items-center">
                    <div className="w-12 h-12 bg-zinc-400 rounded-full"></div>
                    <p className ="text-[18px] ml-[10px] text-zinc-400 hover:text-black">{currentUser}</p>
                </div>
            </div>
        </>
    )
}

export default Header;