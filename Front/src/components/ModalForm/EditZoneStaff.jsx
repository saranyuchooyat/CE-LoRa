import { useState, useEffect } from "react";
import api from "../API";
import { showPopup } from '../Popup';

function EditZoneStaff({ userId, onClose, onSaveSuccess, zones }) {
    const [formData, setFormData] = useState({
        first_name: '', 
        last_name: '',  
        email: '',
        phone: '',
        description: '',
        position: '',
        username: '',
        password: '', 
        zone_id: ''
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const response = await api.get(`/users/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const user = response.data;
                
                // Handle zone_id properly depending on type (it could be an array of strings or comma-separated string)
                let currentZone = '';
                if (user.zone_id) {
                    if (Array.isArray(user.zone_id)) {
                        currentZone = user.zone_id[0] || '';
                    } else if (typeof user.zone_id === 'string') {
                        currentZone = user.zone_id.split(',')[0] || '';
                    }
                }

                setFormData({
                    first_name: user.first_name || user.firstName || '',
                    last_name: user.last_name || user.lastName || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    description: user.description || '',
                    position: user.position || '',
                    username: user.username || '',
                    password: '', 
                    zone_id: currentZone
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
            zone_id: formData.zone_id
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
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold">ชื่อ</label>
                    <input name="first_name" type="text" value={formData.first_name} onChange={handleChange} className="border rounded w-full p-2 bg-white" required />
                </div>
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold">นามสกุล</label>
                    <input name="last_name" type="text" value={formData.last_name} onChange={handleChange} className="border rounded w-full p-2 bg-white" required />
                </div>

                <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold">อีเมล</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} className="border rounded w-full p-2 bg-white" required />
                </div>
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold">เบอร์โทรศัพท์</label>
                    <input name="phone" type="text" value={formData.phone} onChange={handleChange} className="border rounded w-full p-2 bg-white" />
                </div>

                <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold">Username</label>
                    <input name="username" type="text" value={formData.username} onChange={handleChange} className="border rounded w-full p-2 bg-white" required />
                </div>
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold">เปลี่ยนรหัสผ่าน</label>
                    <div className="text-xs text-gray-400 mb-1">(เว้นว่างไว้หากไม่ต้องการเปลี่ยน)</div>
                    <input name="password" type="password" value={formData.password} onChange={handleChange} className="border rounded w-full p-2 bg-white" placeholder="รหัสผ่านใหม่" />
                </div>

                {/* Dropdown โซน */}
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold">โซนที่ดูแล:</label>
                    <div className="text-xs text-gray-400 mb-1">&nbsp;</div>
                    <select
                        name="zone_id" 
                        value={formData.zone_id} 
                        onChange={handleChange}
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
                    <label className="block text-gray-700 text-sm font-bold">ตำแหน่งหน้าที่</label>
                    <div className="text-xs text-gray-400 mb-1">&nbsp;</div>
                    <input name="position" type="text" value={formData.position} onChange={handleChange} className="border rounded w-full p-2 bg-white" />
                </div>
            </div>

            <div className="mb-4 mt-2">
                <label className="block text-gray-700 text-sm font-bold">รายละเอียดเพิ่มเติม</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="border rounded w-full h-24 p-2 bg-white resize-none" placeholder="ระบุรายละเอียด..." />
            </div>

            <div className="pt-4 border-t flex justify-end gap-3">
                <button type="submit" disabled={isSubmitting} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400">
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
                <button type="button" onClick={onClose} className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300">
                    ยกเลิก
                </button>
            </div>
        </form>
    );
}

export default EditZoneStaff;
