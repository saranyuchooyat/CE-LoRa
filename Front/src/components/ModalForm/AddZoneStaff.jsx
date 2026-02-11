import { useState } from "react";
import axios from "axios";

function AddZoneStaffForm({ onClose, onSaveSuccess, zones }) {
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
        zoneIds: []
    });

    console.log("zones in AddZoneStaffForm:", zones);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // 2. Handler สำหรับการพิมพ์ใน input ทั่วไป
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 4. ฟังก์ชันส่งข้อมูล (ยึด Logic ตาม AddZoneForm)
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setIsSubmitting(true);

        // ดึง Token จาก localStorage มาใช้ยืนยันตัวตน
        const token = localStorage.getItem('token'); 

        const currentZoneId = formData.zoneIds[0];

        // จัดเตรียม Object สำหรับส่งไป API (รวมชื่อ-นามสกุล และ map ค่าให้ตรงกับ Backend)
        const dataToSend = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            username: formData.username,
            password: formData.password,
            email: formData.email,
            phone: formData.phone,
            description: formData.description,
            position: formData.position,
            role: formData.role,
            zoneIds: formData.currentZoneId
        };
        console.log("Data to send:", dataToSend);
        try {
            await axios.post(`http://localhost:8080/zones/${currentZoneId}/staff`, dataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            }); 
            
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
            alert(error.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
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
                
                {/* Dropdown โซน */}
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">โซนที่ดูแล:</label>
                    <select
                        name="zoneIds" // 💡 ปรับชื่อให้ตรงกับ state
                        // เช็คความยาว Array ป้องกัน Error reading '0'
                        value={formData.zoneIds && formData.zoneIds.length > 0 ? formData.zoneIds[0] : ""} 
                        onChange={(e) => {
                            const selectedId = Number(e.target.value); // แปลงเป็นตัวเลข
                            setFormData(prev => ({
                                ...prev,
                                zoneIds: [selectedId] // 💡 เก็บค่า ID ลงใน Array
                            }));
                        }}
                        className="border rounded w-full p-2 bg-white"
                        required
                    >
                        <option value="" disabled>เลือกโซน</option>
                        {zones && zones.map((zone) => (
                            <option key={zone.value} value={zone.value}>
                                {zone.label}
                            </option>
                        ))}
                    </select>
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
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300"
                >
                    ยกเลิก
                </button>
            </div>
        </form>
    );
}

export default AddZoneStaffForm;