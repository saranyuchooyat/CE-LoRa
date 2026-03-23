import { useState, useEffect } from "react";
import api from "../API";
import { showPopup } from '../Popup';

function EditZoneForm({ zoneId, zoneData, onClose, onSaveSuccess }) {
    const [formData, setFormData] = useState({
        zonename: '',
        address: '',
        description: '',
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. ดึงข้อมูลเดิมมาแสดง
    useEffect(() => {
        if (zoneData) {
            setFormData({
                zonename: zoneData.zone_name || zoneData.zonename || '', // fallback
                address: zoneData.address || zoneData.zone_address || '', // fallback to zone_address 
                description: zoneData.description || '',
            });
            setIsLoading(false);
        }
    }, [zoneData]);

    // 2. จัดการการเปลี่ยนแปลงข้อมูลใน Input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 3. ส่งข้อมูลที่แก้ไขไปยังเซิร์ฟเวอร์
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = sessionStorage.getItem('token');

        const dataToSend = {
            zoneName: formData.zonename,
            address: formData.address,
            description: formData.description,
        };
        try {
            await api.put(`/zones/${zoneId}`, dataToSend, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showPopup("สำเร็จ", "บันทึกการแก้ไขสำเร็จ", "success");
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error("Error updating zone:", error);
            showPopup("ข้อผิดพลาด", "บันทึกการแก้ไขไม่สำเร็จ", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-5 text-center">กำลังโหลดข้อมูล Zone...</div>;


    return (
        <form onSubmit={handleSubmit}>
            
            <div className="flex items-center gap-4 w-full">
                {/* ชื่อ */}
                <div className="mb-4">
                    <label className="block text-gray-700">ชื่อ zone</label>
                    <input 
                        type="text" 
                        name="zonename" 
                        value={formData.zonename} 
                        onChange={handleChange} 
                        className="border rounded w-[150px] p-2 bg-white" 
                    />
                </div>

                <div className="mb-4 flex-1">
                    <label className="block text-gray-700">คำอธิบาย Zone</label>
                    <input 
                        type="text" 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        className="border rounded w-full p-2 bg-white" 
                    />
                </div>

            </div>

            {/*ที่อยู่*/}
            <div className="mb-4">
                <label className="block text-gray-700">ที่อยู่</label>
                <textarea
                    type="text" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    className="border rounded w-full h-20 p-2 bg-white resize-none" 
                />
            </div>



            {/* ส่วนท้าย: รายละเอียดเพิ่มเติม */}
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

export default EditZoneForm;