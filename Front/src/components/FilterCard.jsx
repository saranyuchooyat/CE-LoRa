import React, {useState} from "react";
import StatusDropdown from "./StatusDropdown";
import ProvinceDropdown from "./ProvinceDropdown";

function FilterCard({name, placeholderName, option1Name, option2Name}){
    const [openStatus, setOpenStatus] = useState(false);
    const [openProvince, setOpenProvince] = useState(false);

    return(
        <>
            <div className="card flex justify-between items-center">
                <div className="ml-3">
                    <form>
                        <p className="text-start">ค้นหา {name}</p>
                        <input className="w-[400px] bg-gray-200" type="seach" placeholder={placeholderName}></input>
                    </form>
                </div>

                <div className="relative mr-3">
                    <p className="text-start">{option1Name}</p>
                    <button className="dropdown-btn" onClick={() => setOpenStatus((prev) => !prev)}>
                        ทั้งหมด
                    </button>
                    {openStatus && <StatusDropdown />}
                </div>

                <div className="relative mr-3">
                    <p className="text-start">{option2Name}</p>
                    <button className="dropdown-btn" onClick={() => setOpenProvince((prev) => !prev)}>
                        ทั้งหมด
                    </button>
                    {openProvince && <ProvinceDropdown />}
                </div>
                
                <div className="relative mr-3">
                    <button className="bg-gray-200 px-5 py-2 rounded-[10px] w-[200px] cursor-pointer hover:bg-gray-400 hover:text-white">ล้างตัวกรอง</button>
                </div>
                
            </div>
        </>
    )
}

export default FilterCard;