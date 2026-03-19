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
            <div className="flex items-center justify-between h-[64px] mt-3 mx-5">
                <div className="gap-[8px]">
                    <p className="text-[24px] font-bold text-gray-800">Smart Healthcare System</p>
                </div>
            
                <div className="relative group cursor-pointer inline-block">
                    {/* User Profile Trigger */}
                    <div className="flex items-center gap-2 text-zinc-500 hover:text-black transition-colors py-2">
                        {/* User Icon */}
                        <div className="bg-gray-100 p-2 rounded-full group-hover:bg-gray-200 transition-colors">
                            <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        </div>
                        <span className="text-[18px] font-medium">{currentUser || "User"}</span>
                        
                        {/* Dropdown Chevron */}
                        <svg className="w-4 h-4 ml-1 text-gray-400 group-hover:text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </div>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 origin-top-right transform group-hover:translate-y-0 translate-y-2">
                        <div className="p-2">
                            <button 
                                onClick={() => handleRowClick()}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg flex items-center gap-3 transition-colors"
                            >
                                <svg 
                                    className="w-5 h-5 flex-shrink-0" 
                                    aria-hidden="true" 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    fill="none" 
                                    viewBox="0 0 24 24">
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth="2" 
                                        d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2"
                                        stroke="currentColor"/>
                                </svg>
                                Log out
                            </button>
                        </div>
                    </div>
                </div>
                
            </div>
        </>
    )
}

export default Header;