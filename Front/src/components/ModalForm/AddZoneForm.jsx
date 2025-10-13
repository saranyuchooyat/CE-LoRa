import { useState } from "react";
import axios from "axios";

function AddZoneForm({ onClose, onSaveSuccess }){

    const [formData, setFormData] = useState({
        zonename: '',
        address: '',
        description: '',
        totalDevice: '',
        status:'เลือกสถานะ'
    });

    // const [openStatus, setOpenStatus] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // // ระบบเลือก Status
    // const selectStatus = (selectedStatus) => {
    //     setFormData(prev => ({ ...prev, status: selectedStatus })); // เก็บค่า Status จริง
    //     setOpenStatus(false);
    // };
    // // ระบบเลือก Status

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setIsSubmitting(true);

        const dataToSend = {
            // รวม firstName และ lastName เป็น name
            zonename: formData.zonename || 'N/A', 
            address: formData.address || 'N/A',
            description: formData.description || 'N/A',
            status: formData.status,
            activeuser: 0
        };

        try {
            // 💡 1. ส่งข้อมูล API โดยตรง
            // หากต้องการส่งข้อมูลที่แตกต่างจาก formData เล็กน้อย ให้สร้าง object ใหม่ที่นี่
            await axios.post("http://localhost:8080/zones", dataToSend); 
            
            // 2. หากสำเร็จ: แจ้ง Component แม่ให้รีเฟรชข้อมูล
            onSaveSuccess(); 
            // 3. ปิด Modal
            onClose();

        } catch (error) {
            // จัดการ Error (เช่น แสดงข้อความแจ้งเตือน)
            console.error("Error adding zone:", error);
            
        } finally {
            // 4. รีเซ็ตสถานะโหลดเสมอ
            setIsSubmitting(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit}> 
            <div className="grid grid-cols-2 justify-center items-center gap-4">
                
                {/* ชื่อ */}
                <div className="mb-4">
                    <label className="block text-gray-700">ชื่อ zone</label>
                    <input 
                        type="text" 
                        name="zonename" 
                        value={formData.zonename} 
                        onChange={handleChange} 
                        className="border rounded w-full p-2 bg-white" 
                    />
                </div>

                {/* จำนวนอุปกรณ์สูงสุด */}
                <div className="mb-4">
                    <label className="block text-gray-700">จำนวนอุปกรณ์สูงสุด</label>
                    <input 
                        type="text" 
                        name="totalDevice" 
                        value={formData.totalDevice} 
                        onChange={handleChange} 
                        className="border rounded w-full p-2 bg-white" 
                    />
                </div>

                {/* เลือกสถานะ
                <div className="relative mr-3">
                    <p className="block text-gray-700">เลือกสถานะ</p>
                    <button 
                        className="border rounded w-35 p-2 bg-white text-start flex justify-between items-center" 
                        onClick={() => setOpenStatus((prev) => !prev)} 
                        type="button">
                        <span className="truncate">{formData.status}</span>
                        <svg 
                            className={`w-4 h-4 text-gray-700 transform transition-transform duration-200 ${openStatus ? 'rotate-180' : ''}`} 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 20 20" 
                            fill="currentColor">
                                <path 
                                    fillRule="evenodd" 
                                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" 
                                    clipRule="evenodd"/>
                            </svg>
                    </button>
                    {openStatus &&
                        <div className="dropdown-menu border rounded w-35">
                            <div className="cursor-pointer hover:bg-gray-300 p-2" onClick={() => selectStatus("Active")}>Active</div>
                            <div className="cursor-pointer hover:bg-gray-300 p-2" onClick={() => selectStatus("InActive")}>InActive</div>
                        </div>}
                </div> */}

            </div>

            <div className="mt-4">

                {/*เบอร์โทรศัพท์*/}
                <div className="mb-4">
                    <label className="block text-gray-700">เบอร์โทรศัพท์</label>
                    <input 
                        type="text" 
                        name="address" 
                        value={formData.address} 
                        onChange={handleChange} 
                        className="border rounded w-full p-2 bg-white" 
                    />
                </div>

                {/*ที่อยู่*/}
                <div className="mb-4">
                    <label className="block text-gray-700">ที่อยู่</label>
                    <textarea
                        type="text" 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        className="border rounded w-full h-20 p-2 bg-white resize-none" 
                    />
                </div>
            </div>


            {/* Footer (ปุ่ม Save/Cancel) */}
            <div className="mt-6 pt-4 border-t flex justify-end gap-4">
                <button 
                    type="submit" 
                    className="bg-complete-bg text-main-blue px-4 py-2 rounded-lg hover:bg-main-blue hover:text-white cursor-pointer"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
                
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 hover:text-white cursor-pointer"
                    disabled={isSubmitting}
                >
                    ยกเลิก
                </button>
            </div>
        </form>
    );
}

export default AddZoneForm;