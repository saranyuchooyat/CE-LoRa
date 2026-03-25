import { useState, useEffect } from "react";
import api from "../API";
import { showPopup } from '../Popup';

function EditElderlyForm({ elderData, onClose, onSaveSuccess }) {

    const [formData, setFormData] = useState({
        elderId: elderData?.elder_id || '',
        firstName: elderData?.first_name || '',
        lastName: elderData?.last_name || '',
        gender: elderData?.sex || 'เลือกเพศ',
        age: elderData?.age || 0,
        weight: elderData?.weight || 0,
        height: elderData?.height || 0,
        congenitalDisease: elderData?.congenital_disease || '',
        personalMedicine: elderData?.personal_medicine || '',
        emergencyContactName: elderData?.emergency_contact_name || '', // ✅ 1. เพิ่ม State ดึงค่าเก่ามาโชว์
        emergencyContacts: elderData?.emergency_contacts || '',
        address: elderData?.address || ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (elderData) {
            setFormData({
                elderId: elderData.elder_id || '',
                firstName: elderData.first_name || '',
                lastName: elderData.last_name || '',
                gender: elderData.sex || 'เลือกเพศ',
                age: elderData.age || 0,
                weight: elderData.weight || 0,
                height: elderData.height || 0,
                congenitalDisease: elderData.congenital_disease || '',
                personalMedicine: elderData.personal_medicine || '',
                emergencyContactName: elderData.emergency_contact_name || '', // ✅ ดึงค่าตอนที่ Props เปลี่ยน
                emergencyContacts: elderData.emergency_contacts || '',
                address: elderData.address || ''
            });
        }
    }, [elderData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'age' || name === 'weight' || name === 'height' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const dataToSend = {
            first_name: formData.firstName,
            last_name: formData.lastName,
            sex: formData.gender,
            age: formData.age,
            weight: formData.weight,
            height: formData.height,
            congenital_disease: formData.congenitalDisease,
            personal_medicine: formData.personalMedicine,
            emergency_contact_name: formData.emergencyContactName, // ✅ 2. เตรียมแพ็คส่งกลับไปอัปเดต
            emergency_contacts: formData.emergencyContacts,
            address: formData.address
        };

        try {
            await api.put(`/elders/${formData.elderId}`, dataToSend, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            showPopup("สำเร็จ", "บันทึกการแก้ไขสำเร็จ", "success");
            if (onSaveSuccess) onSaveSuccess();
            if (onClose) onClose();
        } catch (error) {
            console.error("Error updating elderly:", error);
            showPopup("ข้อผิดพลาด", "ไม่สามารถบันทึกการแก้ไขได้", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!elderData) return null;

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                 <div className="col-span-2 mb-2">
                    <label className="block text-gray-700 text-sm">รหัสผู้สูงอายุ (Elder ID):</label>
                    <input type="text" value={formData.elderId} className="border rounded w-full p-2 bg-gray-100" readOnly />
                </div>

                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">ชื่อ</label>
                    <input name="firstName" type="text" value={formData.firstName} onChange={handleChange} className="border rounded w-full p-2 bg-white" required />
                </div>

                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">นามสกุล</label>
                    <input name="lastName" type="text" value={formData.lastName} onChange={handleChange} className="border rounded w-full p-2 bg-white" required />
                </div>

                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">อายุ</label>
                    <input name="age" type="number" value={formData.age} onChange={handleChange} className="border rounded w-full p-2 bg-white" required min="0"/>
                </div>

                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">เพศ:</label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="border rounded w-full p-2 bg-white"
                        required
                    >
                        <option value="เลือกเพศ">เลือกเพศ</option>
                        <option value="ชาย">ชาย</option>
                        <option value="หญิง">หญิง</option>
                        <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                </div>
                
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">น้ำหนัก (kg)</label>
                    <input name="weight" type="number" step="0.1" value={formData.weight} onChange={handleChange} className="border rounded w-full p-2 bg-white" min="0"/>
                </div>

                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">ส่วนสูง (cm)</label>
                    <input name="height" type="number" step="0.1" value={formData.height} onChange={handleChange} className="border rounded w-full p-2 bg-white" min="0"/>
                </div>
            </div>

             <div className="mb-2 mt-2">
                <label className="block text-gray-700 text-sm">โรคประจำตัว</label>
                <textarea name="congenitalDisease" type="text" value={formData.congenitalDisease} onChange={handleChange} className="border rounded w-full h-14 p-2 bg-white resize-none" placeholder="ระบุโรคประจำตัว"/>
            </div>

            <div className="mb-2">
                <label className="block text-gray-700 text-sm">ยาประจำตัว</label>
                <textarea name="personalMedicine" type="text" value={formData.personalMedicine} onChange={handleChange} className="border rounded w-full h-14 p-2 bg-white resize-none" placeholder="ระบุประเภทของยาที่ต้องรับประทาน"/>
            </div>
            
            {/* ✅ 3. ปรับตรงนี้ให้แบ่ง 2 คอลัมน์เหมือนกับหน้า Add */}
            <div className="grid grid-cols-2 gap-x-4">
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">ชื่อผู้ติดต่อฉุกเฉิน</label>
                    <input name="emergencyContactName" type="text" value={formData.emergencyContactName} onChange={handleChange} className="border rounded w-full p-2 bg-white outline-none focus:border-blue-500" placeholder="ชื่อ-นามสกุล ผู้ติดต่อ"/>
                </div>
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">เบอร์โทรติดต่อฉุกเฉิน</label>
                    <input name="emergencyContacts" type="text" value={formData.emergencyContacts} onChange={handleChange} className="border rounded w-full p-2 bg-white outline-none focus:border-blue-500" placeholder="เบอร์โทรฉุกเฉิน (มีหลายเบอร์ให้ใช้ลูกน้ำขั้น)"/>
                </div>
            </div>

            <div className="mb-2">
                <label className="block text-gray-700 text-sm">ที่อยู่</label>
                <textarea name="address" type="text" value={formData.address} onChange={handleChange} className="border rounded w-full h-14 p-2 bg-white resize-none"/>
            </div>

            {/* ปุ่มกด (Footer) */}
            <div className="pt-4 mt-2 border-t flex justify-end gap-3">
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="submit-btn"
                >
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
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
export default EditElderlyForm;