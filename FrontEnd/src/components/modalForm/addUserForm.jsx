import { useState } from "react";
import axios from "axios";
import { showPopup } from "./popup";

function AddUserForm({ onClose, onSaveSuccess }){
    // 1. กำหนดโครงสร้าง State ให้ครบตามฟิลด์ที่ต้องการ
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        description: '',
        position: '',
        role: 'เลือกบทบาท',
        username: '',
        password:'',
        zoneids: []
    });

    const [openRole, setOpenRole] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 2. Handler สำหรับการพิมพ์ใน input ทั่วไป
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 3. Handler สำหรับการเลือก Role จาก Dropdown
    const selectRole = (selectedRole) => {
        setFormData(prev => ({ ...prev, role: selectedRole }));
        setOpenRole(false);
    };

    // 4. ฟังก์ชันส่งข้อมูล (ยึด Logic ตาม AddZoneForm)
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setIsSubmitting(true);

        // ดึง Token จาก sessionStorage มาใช้ยืนยันตัวตน
        const token = sessionStorage.getItem('token'); 

        // จัดเตรียม Object สำหรับส่งไป API (รวมชื่อ-นามสกุล และ map ค่าให้ตรงกับ Backend)
        const dataToSend = {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            username: formData.username,
            password: formData.password,
            email: formData.email,
            phone: formData.phone,
            description: formData.description,
            position: formData.position,
            role: formData.role,
            zone_id: (formData.zoneids && formData.zoneids.length > 0) ? formData.zoneids.join(',') : ""
        };

        try {
            // ส่ง request ไปยัง Endpoint สำหรับ User (ปกติจะเป็น /users หรือ /create-user)
            await axios.post("${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/users", dataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            }); 
            
            showPopup("สำเร็จ", "เพิ่มข้อมูลผู้ใช้เรียบร้อยแล้ว", "success");
            // หากสำเร็จ: แจ้งให้ Component แม่รีเฟรชข้อมูล (refetch) และปิด Modal
            if (typeof onSaveSuccess === 'function') {
                onSaveSuccess(); 
            }
            if (typeof onClose === 'function') {
                onClose(); 
            }

        } catch (error) {
            // จัดการ Error เหมือนใน AddZoneForm เพื่อการ Debug ที่ง่ายขึ้น
            if (error.response) {
                console.error("Server Error Detail:", error.response.data);
            }
            console.error("Error adding user:", error);
            showPopup("ข้อผิดพลาด", error.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit}> 
            {/* ส่วนของฟิลด์ข้อมูลจัดเรียงแบบ Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">ชื่อ</label>
                    <input name="firstName" type="text" value={formData.firstName} onChange={handleChange} className="border rounded w-full p-2 bg-white" required />
                </div>
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">นามสกุล</label>
                    <input name="lastName" type="text" value={formData.lastName} onChange={handleChange} className="border rounded w-full p-2 bg-white" required />
                </div>
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">อีเมล</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} className="border rounded w-full p-2 bg-white" required />
                </div>
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">เบอร์โทรศัพท์</label>
                    <input name="phone" type="text" value={formData.phone} onChange={handleChange} className="border rounded w-full p-2 bg-white" />
                </div>
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">Username</label>
                    <input name="username" type="text" value={formData.username} onChange={handleChange} className="border rounded w-full p-2 bg-white" required />
                </div>
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">Password</label>
                    <input name="password" type="password" value={formData.password} onChange={handleChange} className="border rounded w-full p-2 bg-white" required />
                </div>
                
                {/* Dropdown บทบาท */}
                <div className="relative mb-2">
                    <label className="block text-gray-700 text-sm">บทบาท</label>
                    <button 
                        type="button"
                        onClick={() => setOpenRole(!openRole)}
                        className="border rounded w-full p-2 bg-white text-left flex justify-between items-center"
                    >
                        {formData.role}
                        <svg className={`w-4 h-4 transition-transform ${openRole ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20"><path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" /></svg>
                    </button>
                    {openRole && (
                        <div className="absolute z-10 w-full bg-white border rounded mt-1 shadow-lg">
                            {["System Admin", "Zone Admin", "Zone Staff"].map(r => (
                                <div key={r} onClick={() => selectRole(r)} className="p-2 hover:bg-gray-100 cursor-pointer">{r}</div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">ตำแหน่งหน้าที่</label>
                    <input name="position" type="text" value={formData.position} onChange={handleChange} className="border rounded w-full p-2 bg-white" />
                </div>
            </div>

            {/* ช่องรายละเอียดเพิ่มเติม (ขยายเต็มกว้าง) */}
            <div className="mb-4 mt-2">
                <label className="block text-gray-700 text-sm">รายละเอียดเพิ่มเติม</label>
                <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    className="border rounded w-full h-24 p-2 bg-white resize-none"
                    placeholder="ระบุรายละเอียด..."
                />
            </div>

            {/* ปุ่มกด (Footer) */}
            <div className="pt-4 border-t flex justify-end gap-3">
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="submit-btn"
                >
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="cancel-btn"
                >
                    ยกเลิก
                </button>
            </div>
        </form>
    );
}

export default AddUserForm;