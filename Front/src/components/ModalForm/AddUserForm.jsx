import { useState } from "react";
import axios from "axios";

function AddUserForm({ onClose, onSaveSuccess }){

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'เลือกบทบาท',
        username: '',
        password:''
    });

    const [openRole, setOpenRole] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // ระบบเลือก Role
    const selectRole = (selectedRole) => {
        setFormData(prev => ({ ...prev, role: selectedRole })); // เก็บค่า role จริง
        setOpenRole(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setIsSubmitting(true);

        const dataToSend = {
            // รวม firstName และ lastName เป็น name
            name: `${formData.firstName} ${formData.lastName}`, 
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
        };

        try {
            // 💡 1. ส่งข้อมูล API โดยตรง
            // หากต้องการส่งข้อมูลที่แตกต่างจาก formData เล็กน้อย ให้สร้าง object ใหม่ที่นี่
            await axios.post("http://localhost:8080/users", dataToSend); 
            
            // 2. หากสำเร็จ: แจ้ง Component แม่ให้รีเฟรชข้อมูล
            onSaveSuccess(); 
            // 3. ปิด Modal
            onClose();

        } catch (error) {
            // จัดการ Error (เช่น แสดงข้อความแจ้งเตือน)
            console.error("Error adding user:", error);
            
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
                    <label className="block text-gray-700">ชื่อ</label>
                    <input 
                        type="text" 
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={handleChange} 
                        className="border rounded w-full p-2 bg-white" 
                    />
                </div>

                {/* นามสกุล */}
                <div className="mb-4">
                    <label className="block text-gray-700">นามสกุล</label>
                    <input 
                        type="text" 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={handleChange} 
                        className="border rounded w-full p-2 bg-white" 
                    />
                </div>

                {/* อีเมลล์ */}
                <div className="mb-4">
                    <label className="block text-gray-700">อีเมลล์</label>
                    <input 
                        type="text" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        className="border rounded w-full p-2 bg-white" 
                    />
                </div>

                {/* เบอร์โทรศัพท์ */}
                <div className="mb-4">
                    <label className="block text-gray-700">เบอร์โทรศัพท์</label>
                    <input 
                        type="text" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        className="border rounded w-full p-2 bg-white" 
                    />
                </div>

                {/* username */}
                <div className="mb-4">
                    <label className="block text-gray-700">ตั้งชื่อ Username</label>
                    <input 
                        type="text" 
                        name="username" 
                        value={formData.username} 
                        onChange={handleChange} 
                        className="border rounded w-full p-2 bg-white" 
                    />
                </div>

                {/* password */}
                <div className="mb-4">
                    <label className="block text-gray-700">ตั้งรหัสผ่านเข้าใช้งาน</label>
                    <input 
                        type="text" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        className="border rounded w-full p-2 bg-white" 
                    />
                </div>

                {/* เลือกบทบาท */}
                <div className="relative mr-3">
                    <p className="block text-gray-700">เลือกบทบาท</p>
                    <button 
                        className="border rounded w-35 p-2 bg-white text-start flex justify-between items-center" 
                        onClick={() => setOpenRole((prev) => !prev)} 
                        type="button">
                        <span className="truncate">{formData.role}</span>
                        <svg 
                            className={`w-4 h-4 text-gray-700 transform transition-transform duration-200 ${openRole? 'rotate-180' : ''}`} 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 20 20" 
                            fill="currentColor">
                                <path 
                                    fillRule="evenodd" 
                                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" 
                                    clipRule="evenodd"/>
                            </svg>
                    </button>
                    {openRole &&
                        <div className="dropdown-menu border rounded w-35">
                            <div className="cursor-pointer hover:bg-gray-300 p-2" onClick={() => selectRole("System Admin")}>System Admin</div>
                            <div className="cursor-pointer hover:bg-gray-300 p-2" onClick={() => selectRole("Zone Admin")}>Zone Admin</div>
                            <div className="cursor-pointer hover:bg-gray-300 p-2" onClick={() => selectRole("Zone Staff")}>Zone staff</div>
                        </div>}
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

export default AddUserForm;