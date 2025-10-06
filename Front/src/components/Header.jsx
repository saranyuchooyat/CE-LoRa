import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';


function Header(){

    const [currentUser, setCurrentUser] = useState(null); 
    const location = useLocation(); 

    const navigate = useNavigate();

    const handleRowClick = () => {
        navigate(`/`); 
    };

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

                <div className="flex items-center justify-around gap-2">
                    <div className="w-12 h-12 bg-zinc-400 rounded-full"></div>
                    <button className ="text-[18px] ml-[10px] text-zinc-400 hover:text-black cursor-pointer" onClick={() => handleRowClick()}>{currentUser}</button>
                </div>
                
            </div>
        </>
    )
}

export default Header;