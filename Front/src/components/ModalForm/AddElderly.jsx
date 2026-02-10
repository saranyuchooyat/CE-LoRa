import { useState, useEffect } from "react";
import axios from "axios";

function AddElderlyform({ zoneid, onClose, onSaveSuccess }){

    console.log("ZoneID in AddElderlyform:", typeof zoneid, zoneid);

    // 1. กำหนดโครงสร้าง State ให้ครบตามฟิลด์ที่ต้องการ
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        gender: '',
        id:'',
        birthDate: '',
        phone: '',
        address: '',
        email:'',
        // emergencyContact: '',
        // medicalHistory: '',
        device:'เลือกอุปกรณ์'

    });

    // const [openGender, setOpenGender] = useState(false);
    // const [openDevice, setOpenDevice] = useState(false);
    const [devices, setDevices] = useState([]);
    // const [loadingDevices, setLoadingDevices] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
    const fetchAvailableDevices = async () => {
        // 💡 เริ่มการโหลด
        // setIsLoadingDevices(true); 

        try {
            const token = localStorage.getItem('token');
            if (!token) return; // 💡 ป้องกันกรณีไม่มี token

            const response = await axios.get('http://localhost:8080/devices', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const allDevices = response.data;

            // 💡 กรองเฉพาะตัวที่ "ว่าง" ตามเงื่อนไขที่คุณตั้งไว้
            // ตรวจสอบชื่อฟิลด์ (เช่น 'available' หรือ null) ให้ตรงกับ Backend
            const availableOnly = allDevices.filter(dev => 
                dev.assigned_to === ''
            );

            setDevices(availableOnly);
        } catch (error) {
            console.error("Error fetching devices:", error);
        } finally {
            // 💡 ปิดสถานะการโหลดไม่ว่าจะสำเร็จหรือไม่
            // setIsLoadingDevices(false); 
        }
    };

    fetchAvailableDevices();
}, []);

    console.log("Available devices:", devices);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // // 2. Handler สำหรับเลือก Device จาก Dropdown
    // const selectDevice = (selectedDevice) => {
    //     setFormData(prev => ({ ...prev, device: selectedDevice }));
    //     setOpenDevice(false);
    // };

    // const selectGender = (selectedGender) => {
    //     setFormData(prev => ({ ...prev, gender: selectedGender }));
    //     setOpenGender(false);
    // };

    // 3. ฟังก์ชันส่งข้อมูล (ยึด Logic ตาม AddZoneForm)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const token = localStorage.getItem('token');

        const dataToSend = {
            fname: formData.firstName,
            lname: formData.lastName,
            gender: formData.gender,
            citizenId: formData.id,
            birthDate: formData.birthDate,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            // emergencyContact: formData.emergencyContact,
            // medicalHistory: formData.medicalHistory,
            device: {deviceId: formData.device},
            zoneId: parseInt(zoneid)
        };

        try {
            const response = await axios.post('http://localhost:8080/zones/elderlyRegister', dataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log("Elderly added:", response.data);
            onSaveSuccess(); // แจ้งให้ Parent Component รู้ว่าการเพิ่มสำเร็จ
            onClose(); // ปิด Modal
        } catch (error) {
            console.error("Error adding elderly:", error);
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
                    <label className="block text-gray-700 text-sm">วันเกิด</label>
                    <input name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} className="border rounded w-full p-2 bg-white" required />
                </div>

                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">รหัสประจำตัวประชาชน</label>
                    <input name="id" type="text" value={formData.id} onChange={handleChange} className="border rounded w-full p-2 bg-white" required />
                </div>

                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">เบอร์โทรศัพท์</label>
                    <input name="phone" type="text" value={formData.phone} onChange={handleChange} className="border rounded w-full p-2 bg-white" required />
                </div>

                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">Email</label>
                    <input name="email" type="text" value={formData.email} onChange={handleChange} className="border rounded w-full p-2 bg-white" required />
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
                    <label className="block text-gray-700 text-sm">เลือกอุปกรณ์:</label>
                    <select
                        name="device"
                        value={formData.device}
                        onChange={handleChange}
                        className="border rounded w-full p-2 bg-white"
                        required
                    >
                        <option value="">เลือกอุปกรณ์</option>
                            {devices.length > 0 ? (
                                devices.map(device => (
                                    <option key={device.id} value={device.id}>
                                        {device.device_id}
                                    </option>
                                ))
                            ) : (
                                <option disabled>ไม่มีอุปกรณ์ว่างในระบบ</option>
                            )}
                    </select>
                </div>

            </div>

            <div className="mb-2">
                <label className="block text-gray-700 text-sm">ที่อยู่</label>
                <textarea name="address" type="text" value={formData.address} onChange={handleChange} className="border rounded w-full h-20 p-2 bg-white resize-none"  required />
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
export default AddElderlyform;

   