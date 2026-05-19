import { useState, useEffect } from "react";
import api from "../api";
import { showPopup } from "./popup";

function EditUserForm({ userId, onClose, onSaveSuccess }) {
    const [formData, setFormData] = useState({
        first_name: '', 
        last_name: '',  
        email: '',
        phone: '',
        description: '',
        position: '',
        role: 'เลือกบทบาท',
        username: '',
        password: '', 
        zoneids: []
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [openRole, setOpenRole] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const response = await api.get(`/users/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const user = response.data;
                
                setFormData({
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    description: user.description || '',
                    position: user.position || '',
                    role: user.role || 'เลือกบทบาท',
                    username: user.username || '',
                    password: '', 
                    zoneids: user.zone_id || user.zoneIds || []
                });
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (userId) fetchUserData();
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const selectRole = (role) => {
        setFormData(prev => ({ ...prev, role }));
        setOpenRole(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = sessionStorage.getItem('token');

        const dataToSend = {
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            username: formData.username,
            email: formData.email,
            phone: formData.phone,
            description: formData.description,
            position: formData.position,
            role: formData.role,
            zone_id: formData.zoneids
        };

        if (formData.password) {
            dataToSend.password = formData.password;
        }

        try {
            await api.put(`/users/${userId}`, dataToSend, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showPopup("สำเร็จ", "บันทึกการแก้ไขสำเร็จ", "success");
            onSaveSuccess(); 
            onClose(); 
        } catch (error) {
            console.error("Update failed:", error.response?.data || error.message);
            showPopup("ข้อผิดพลาด", "บันทึกการแก้ไขไม่สำเร็จ", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-5 text-center">กำลังโหลดข้อมูลผู้ใช้...</div>;

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {/* ✅ แก้ไข 4: เปลี่ยน name และ value เป็น first_name */}
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold">ชื่อ</label>
                    <input name="first_name" type="text" value={formData.first_name} onChange={handleChange} className="border rounded w-full p-2 bg-white" required />
                </div>
                {/* ✅ แก้ไข 5: เปลี่ยน name และ value เป็น last_name */}
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold">นามสกุล</label>
                    <input name="last_name" type="text" value={formData.last_name} onChange={handleChange} className="border rounded w-full p-2 bg-white" required />
                </div>

                {/* แถวที่ 2: อีเมล - เบอร์โทร */}
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold">อีเมล</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} className="border rounded w-full p-2 bg-white" required />
                </div>
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold">เบอร์โทรศัพท์</label>
                    <input name="phone" type="text" value={formData.phone} onChange={handleChange} className="border rounded w-full p-2 bg-white" />
                </div>

                {/* แถวที่ 3: Username - Password (Password ให้เป็นทางเลือก) */}
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold">Username</label>
                    <input name="username" type="text" value={formData.username} onChange={handleChange} className="border rounded w-full p-2 bg-white" required />
                </div>
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold">เปลี่ยนรหัสผ่าน</label>
                    <label className="block text-gray-700 text-sm font-bold text-gray-400">(เว้นว่างไว้หากไม่ต้องการเปลี่ยน)</label>
                    <input name="password" type="password" value={formData.password} onChange={handleChange} className="border rounded w-full p-2 bg-white" placeholder="รหัสผ่านใหม่" />
                </div>

                {/* แถวที่ 4: บทบาท - ตำแหน่ง */}
                <div className="relative mb-2">
                    <label className="block text-gray-700 text-sm font-bold">บทบาท</label>
                    <button type="button" onClick={() => setOpenRole(!openRole)} className="border rounded w-full p-2 bg-white text-left flex justify-between items-center">
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
                    <label className="block text-gray-700 text-sm font-bold">ตำแหน่งหน้าที่</label>
                    <input name="position" type="text" value={formData.position} onChange={handleChange} className="border rounded w-full p-2 bg-white" />
                </div>
            </div>

            {/* ส่วนท้าย: รายละเอียดเพิ่มเติม */}
            <div className="mb-4 mt-2">
                <label className="block text-gray-700 text-sm font-bold">รายละเอียดเพิ่มเติม</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="border rounded w-full h-24 p-2 bg-white resize-none" placeholder="ระบุรายละเอียด..." />
            </div>

            <div className="pt-4 border-t flex justify-end gap-3">
                <button type="submit" disabled={isSubmitting} className="submit-btn">
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
                <button type="button" onClick={onClose} className="cancel-btn">
                    ยกเลิก
                </button>
            </div>
        </form>
    );
}

export default EditUserForm;