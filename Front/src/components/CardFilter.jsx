import React, {useState} from "react";
import StatusDropdown from "./StatusDropdown";
import ProvinceDropdown from "./ProvinceDropdown";

function CardFilter(){
    const [openStatus, setOpenStatus] = useState(false);
    const [openProvince, setOpenProvince] = useState(false);

    return(
        <>
            <div className="card flex justify-between items-center">
                <div className="ml-3">
                    <form>
                        <p className="text-start">ค้นหา Zone</p>
                        <input className="w-[400px] bg-gray-200" type="seach" placeholder=" ชื่อ zone, รหัส zone, หรือที่อยู่"></input>
                    </form>
                </div>

                <div className="relative mr-3">
                    <p className="text-start">สถานะ</p>
                    <button className="dropdown-btn" onClick={() => setOpenStatus((prev) => !prev)}>
                        ทั้งหมด
                    </button>
                    {openStatus && <StatusDropdown />}
                </div>

                <div className="relative mr-3">
                    <p className="text-start">จังหวัด</p>
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

export default CardFilter;