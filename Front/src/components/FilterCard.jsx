import React, {useState} from "react";
import StatusDropdown from "./StatusDropdown";
import ProvinceDropdown from "./ProvinceDropdown";

// รับ props เพิ่ม: filters, onFilterChange, onClear
function FilterCard({name, placeholderName, option1Name, option2Name, filters, onFilterChange, onClear, option2Key}){

    console.log("option2",option2Name)

    const [openStatus, setOpenStatus] = useState(false);
    const [openProvince, setOpenProvince] = useState(false);

    // 1. สร้าง Handler สำหรับช่องค้นหา
    const handleSearchChange = (event) => {
        onFilterChange('search', event.target.value);
    };

    // 2. สร้าง Handler สำหรับ Dropdown
    // เนื่องจากเราไม่เห็นโค้ด StatusDropdown/ProvinceDropdown
    // เราจะสร้างฟังก์ชันจำลองการเลือกและปิด Dropdown
    const handleOption2Select = (value) => {
        // 💡 ใช้ option2Key ที่ส่งมาจาก Component แม่
        onFilterChange(option2Key, value); 
        setOpenProvince(false);
    };
    
    // Handler สำหรับ Dropdown ตัวที่ 1 (Status) 
    const handleStatusSelect = (value) => {
        onFilterChange('status', value);
        setOpenStatus(false);
    }

    const Dropdown2Component = ProvinceDropdown; 

    return(
        <>
            <div className="card flex justify-between items-center">
                <div className="ml-3">
                    <form onSubmit={(e) => e.preventDefault()}> 
                        <p className="text-start">ค้นหา {name}</p>
                        <input 
                            className="w-[400px] bg-gray-200" 
                            type="search" 
                            placeholder={placeholderName}
                            // 3. ผูกค่าและ Event เข้ากับ State
                            value={filters.search}
                            onChange={handleSearchChange}
                        />
                    </form>
                </div>

                <div className="relative mr-3">
                    <p className="text-start">{option1Name}</p>
                    <button className="dropdown-btn" onClick={() => setOpenStatus((prev) => !prev)}>
                        {/* แสดงสถานะปัจจุบัน */}
                        {filters.status} 
                    </button>
                    {/* ต้องส่ง onSelect prop ไปให้ StatusDropdown ด้วย */}
                    {openStatus && <StatusDropdown 
                        currentStatus={filters.status}
                        onSelect={(value) => { onFilterChange('status', value); setOpenStatus(false); }} 
                    />}
                </div>

                <div className="relative mr-3">
                    <p className="text-start">{option2Name}</p>
                    <button className="dropdown-btn" onClick={() => setOpenProvince((prev) => !prev)}>
                        {/* 💡 แสดงผลโดยใช้ Key ที่ส่งมา (filters[option2Key] จะเป็น filters.role หรือ filters.province) */}
                        {filters[option2Key]} 
                    </button>
                    {openProvince && <Dropdown2Component 
                        // 💡 ส่งค่าปัจจุบัน โดยใช้ Key ที่ส่งมา
                        currentValue={filters[option2Key]} 
                        onSelect={handleOption2Select} // ใช้ Handler ใหม่
                        // ... props อื่นๆ ที่ Dropdown2Component ต้องการ
                    />}
                </div>
                
                <div className="relative mr-3">
                    {/* 4. เชื่อมปุ่มเข้ากับฟังก์ชันล้างตัวกรอง */}
                    <button 
                        className="bg-gray-200 px-5 py-2 rounded-[10px] w-[200px] cursor-pointer hover:bg-gray-400 hover:text-white"
                        onClick={onClear}
                    >
                        ล้างตัวกรอง
                    </button>
                </div>
                
            </div>
        </>
    )
}

export default FilterCard;