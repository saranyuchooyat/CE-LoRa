import { useState, useEffect } from "react";
import api from "../api";
import { showPopup } from "./popup";

function SetZoneForm({ zoneId, zoneData, onClose, onSaveSuccess }) {
    const [formData, setFormData] = useState({
        status: 'active',
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (zoneData) {
            setFormData({
                status: zoneData.status ? zoneData.status.toLowerCase() : 'active',
            });
            setIsLoading(false);
        }
    }, [zoneData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = sessionStorage.getItem('token');

        const dataToSend = {
            status: formData.status,
        };
        
        try {
            await api.put(`/zones/${zoneId}`, dataToSend, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showPopup("สำเร็จ", "ตั้งค่าสถานะ Zone สำเร็จ", "success");
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error("Error setting zone status:", error);
            showPopup("ข้อผิดพลาด", "ตั้งค่าสถานะไม่สำเร็จ", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-5 text-center">กำลังโหลดข้อมูล Zone...</div>;

    return (
        <form onSubmit={handleSubmit} className="p-4">
            <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">สถานะ Zone</label>
                <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleChange} 
                    className="border rounded w-full p-2 bg-white"
                >
                    <option value="active">Active (เปิดใช้งาน)</option>
                    <option value="inactive">Inactive (ปิดใช้งาน)</option>
                </select>
            </div>

            <div className="pt-4 border-t flex justify-end gap-3">
                <button type="submit" disabled={isSubmitting} className="submit-btn">
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
                </button>
                <button type="button" onClick={onClose} className="cancel-btn">
                    ยกเลิก
                </button>
            </div>
        </form>
    );
}

export default SetZoneForm;
