import {useState} from "react";
import StatusDropdown from "../dropdown/statusDropdown";
import FilterDropdown from "../dropdown/filterDropdown";

// รับ props เพิ่ม: filters, onFilterChange, onClear
function CardFilter({name, placeholderName, option1Name, option2Name, filters, onFilterChange, onClear, data, option2Key}){

    const [openStatus, setOpenStatus] = useState(false);
    const [openDropdown2, setOpenDropdown2] = useState(false);

    console.log("data in CardFilter:", data);

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

    console.log("status",filters.status)
    console.log("role",filters[option2Key])


    return(
        <>
            <div className="card flex justify-between items-center">
                <div className="ml-3">
                    <form onSubmit={(e) => e.preventDefault()}> 
                        <p className="text-start">ค้นหา {name}</p>
                        <input 
                            className="w-[400px] bg-gray-200 py-2 rounded-lg px-2" 
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
                    <button className="dropdown-btn flex justify-between items-center" onClick={() => setOpenStatus((prev) => !prev)}>
                        <span>{filters.status}</span>
                        <svg className={`w-4 h-4 ml-2 text-gray-500 transition-transform duration-200 ${openStatus ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {openStatus && <StatusDropdown 
                        currentValue={filters.status}
                        onSelect={handleStatusSelect}
                        optionalKey={option2Key}
                    />}
                </div>

               {/* Dropdown 2: จังหวัด/บทบาท */}
                {option2Name && (
                    <div className="relative mr-3">
                        <p className="text-start">{option2Name}</p>
                        <button className="dropdown-btn flex justify-between items-center" onClick={() => setOpenDropdown2((prev) => !prev)}>
                            <span>{filters[option2Key]}</span>
                            <svg className={`w-4 h-4 ml-2 text-gray-500 transition-transform duration-200 ${openDropdown2 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {openDropdown2 && <FilterDropdown
                            currentValue={filters[option2Key]}
                            onSelect={handleDropdownSelect}
                            optionalKey={option2Key}
                            data={data}
                        />}
                    </div>
                )}
                
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