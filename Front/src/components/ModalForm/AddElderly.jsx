import { useState, useEffect } from "react";
import api from "../API"; 
import { showPopup } from '../Popup';

function AddElderlyform({ zoneid, onClose, onSaveSuccess }){

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        gender: 'เลือกเพศ',
        age: '',
        weight: '',
        height: '',
        congenitalDisease: '',
        personalMedicine: '',
        emergencyContactName: '', // ✅ 1. เพิ่ม State เก็บชื่อผู้ติดต่อ
        emergencyContacts: '',
        address: '',
        device: 'เลือกอุปกรณ์'
    });

    const [devices, setDevices] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchAvailableDevices = async () => {
            try {
                const response = await api.get('/devices'); 
                
                const allDevices = response.data || [];
                const availableOnly = allDevices.filter(dev => 
                    !dev.assigned_to || dev.assigned_to === ''
                );
                setDevices(availableOnly);
            } catch (error) {
                console.error("Error fetching devices:", error);
            }
        };

        fetchAvailableDevices();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'age' || name === 'weight' || name === 'height') 
                    ? (value === '' ? '' : Number(value)) 
                    : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const dataToSend = {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            sex: formData.gender, 
            age: Number(formData.age),
            weight: Number(formData.weight),
            height: Number(formData.height),
            congenital_disease: formData.congenitalDisease,
            personal_medicine: formData.personalMedicine,
            emergency_contact_name: formData.emergencyContactName, // ✅ 2. เพิ่มฟิลด์สำหรับส่งไปหลังบ้าน
            emergency_contacts: formData.emergencyContacts,
            address: formData.address,
            device_id: (formData.device === 'เลือกอุปกรณ์' || !formData.device) ? "" : formData.device,
            zone_id: String(zoneid)
        };

        try {
            await api.post('/zones/elderlyRegister', dataToSend);

            if (dataToSend.device_id && dataToSend.device_id.trim() !== "") {
                try {
                    await api.put(`/devices/${dataToSend.device_id}`, {
                        status: "active", 
                        assigned_to: `${formData.firstName} ${formData.lastName}`
                    });
                    console.log("Device linked successfully!");
                } catch (devErr) {
                    console.warn("Elderly added, but device link failed:", devErr);
                }
            }

            showPopup("สำเร็จ", "เพิ่มข้อมูลผู้สูงอายุสำเร็จเรียบร้อยแล้ว", "success");
            
            if (onSaveSuccess) onSaveSuccess();
            if (onClose) onClose();

        } catch (error) {
            console.error("Primary Error:", error.response?.data || error.message);
            showPopup("ข้อผิดพลาด", "ไม่สามารถเพิ่มข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อหรือข้อมูลอีกครั้ง", "error");
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
                        <option value="เลือกเพศ" disabled>เลือกเพศ</option>
                        <option value="ชาย">ชาย</option>
                        <option value="หญิง">หญิง</option>
                        <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                </div>
                
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">น้ำหนัก (kg)</label>
                    <input name="weight" type="number" step="0.1" value={formData.weight} onChange={handleChange} className="border rounded w-full p-2 bg-white" min="0" required/>
                </div>

                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">ส่วนสูง (cm)</label>
                    <input name="height" type="number" step="0.1" value={formData.height} onChange={handleChange} className="border rounded w-full p-2 bg-white" min="0" required/>
                </div>

                <div className="mb-2 col-span-2">
                    <label className="block text-gray-700 text-sm">เลือกอุปกรณ์ (ถ้ามี):</label>
                    <select
                        name="device"
                        value={formData.device}
                        onChange={handleChange}
                        className="border rounded w-full p-2 bg-white"
                    >
                        <option value="เลือกอุปกรณ์">-- ไม่ระบุอุปกรณ์ --</option>
                            {devices.length > 0 ? (
                                devices.map(device => (
                                    <option key={device.device_id || device.id} value={device.device_id}>
                                        {device.device_id} - {device.device_name || 'Smart Watch'}
                                    </option>
                                ))
                            ) : (
                                <option disabled>ไม่มีอุปกรณ์ว่างในระบบ</option>
                            )}
                    </select>
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
            
            {/* ✅ 3. ปรับตรงนี้ให้แบ่ง 2 คอลัมน์ (ชื่อผู้ติดต่อ และ เบอร์โทร) */}
            <div className="grid grid-cols-2 gap-x-4">
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">ชื่อผู้ติดต่อฉุกเฉิน</label>
                    <input name="emergencyContactName" type="text" value={formData.emergencyContactName} onChange={handleChange} className="border rounded w-full p-2 bg-white outline-none focus:border-blue-500" placeholder="ชื่อ-นามสกุล ผู้ติดต่อ"/>
                </div>
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">เบอร์โทรติดต่อฉุกเฉิน</label>
                    <input name="emergencyContacts" type="text" value={formData.emergencyContacts} onChange={handleChange} className="border rounded w-full p-2 bg-white outline-none focus:border-blue-500" placeholder="เบอร์โทรศัพท์"/>
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
export default AddElderlyform;