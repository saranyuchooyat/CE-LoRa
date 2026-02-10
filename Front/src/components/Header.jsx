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

                <button className ="text-[18px] ml-[10px] text-zinc-400 hover:text-black cursor-pointer" onClick={() => handleRowClick()}>
                    <div className="flex items-center justify-around gap-2">
                        {/* <div>{currentUser}</div> */}
                        Log out
                        <svg 
                            className="w-6 h-6 stroke-current" // stroke-current จะทำให้สีเปลี่ยนตาม text-zinc-400/hover:text-black
                            aria-hidden="true" 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="24" 
                            height="24" 
                            fill="none" 
                            viewBox="0 0 24 24">
                            <path 
                                strokeLinecap="round" // React ใช้ camelCase สำหรับ property ของ SVG
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2"
                                stroke="currentColor"/>
                        </svg>
                    </div>
                </button>
                
            </div>
        </>
    )
}

export default Header;