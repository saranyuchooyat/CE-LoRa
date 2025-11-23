import {useState} from "react";
import StatusDropdown from "../Dropdown/StatusDropdown";
import FilterDropdown from "../Dropdown/FilterDropdown";

// รับ props เพิ่ม: filters, onFilterChange, onClear
function CardFilter({name, placeholderName, option1Name, option2Name, filters, onFilterChange, onClear, option2Key}){

    const [openStatus, setOpenStatus] = useState(false);
    const [openDropdown2, setOpenDropdown2] = useState(false);

    // 1. สร้าง Handler สำหรับช่องค้นหา
    const handleSearchChange = (event) => {
        onFilterChange('search', event.target.value);
    };

    // Handler สำหรับ Dropdown ตัวที่ 1 (Status)
    const handleStatusSelect = (value) => {
        onFilterChange('status', value);
        setOpenStatus(false);
    }

    const handleDropdownSelect = (value) => {
        onFilterChange(option2Key, value);
        setOpenDropdown2(false);
    } 


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
                            value={filters.search}
                            onChange={handleSearchChange}
                        />
                    </form>
                </div>

               {/* Dropdown 1: สถานะ */}
                <div className="relative mr-3">
                    <p className="text-start">{option1Name}</p>
                    <button className="dropdown-btn" onClick={() => setOpenStatus((prev) => !prev)}>
                        {filters.status} 
                    </button>
                    {openStatus && <StatusDropdown 
                        currentValue={filters.status}
                        onSelect={handleStatusSelect}
                        optionalKey={option2Key}
                    />}
                </div>

               {/* Dropdown 2: จังหวัด/บทบาท */}
                <div className="relative mr-3">
                    <p className="text-start">{option2Name}</p>
                    <button className="dropdown-btn" onClick={() => setOpenDropdown2((prev) => !prev)}>
                        {filters[option2Key]} 
                    </button>
                    {openDropdown2 && <FilterDropdown
                        currentValue={filters[option2Key]}
                        onSelect={handleDropdownSelect}
                        optionalKey={option2Key}
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

export default CardFilter;