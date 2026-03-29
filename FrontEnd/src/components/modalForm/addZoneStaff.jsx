import { useState } from "react";
import api from "../api.jsx";
import { showPopup } from "./popup";

function AddZoneStaffForm({ onClose, onSaveSuccess, zones }) {
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setIsSubmitting(true);

        const currentZoneId = formData.zoneIds[0];

        const dataToSend = {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            username: formData.username,
            password: formData.password,
            email: formData.email,
            phone: formData.phone,
            description: formData.description,
            position: formData.position,
            role: "Zone Staff",
            zone_id: currentZoneId || ""
        };

        console.log("Data to send:", dataToSend);

        try {
            await api.post("/users", dataToSend);
            
            showPopup("สำเร็จ", "เพิ่มหมวดหมู่หรือโซนเรียบร้อยแล้ว", "success");
            if (typeof onSaveSuccess === 'function') {
                onSaveSuccess(); 
            }
            if (typeof onClose === 'function') {
                onClose(); 
            }

        } catch (error) {
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
                
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">โซนที่ดูแล:</label>
                    <select
                        name="zoneIds"
                        value={formData.zoneIds && formData.zoneIds.length > 0 ? formData.zoneIds[0] : ""} 
                        onChange={(e) => {
                            const selectedId = e.target.value;
                            setFormData(prev => ({
                                ...prev,
                                zoneIds: [selectedId]
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

export default AddZoneStaffForm;