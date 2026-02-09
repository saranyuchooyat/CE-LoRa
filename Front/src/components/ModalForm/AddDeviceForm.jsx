import { useState } from "react";
import axios from "axios";

function AddDeviceForm({ onClose, onSaveSuccess }){

    const [formData, setFormData] = useState({
        deviceId: '',
        model: '',
        serialnumber: '',
        type:'เลือก Type',
    });

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
        // 1. ดึง Token จาก localStorage (เปลี่ยนชื่อ Key ตามที่คุณตั้งไว้ตอน Login)
        const token = localStorage.getItem('token');

        const dataToSend = {
            deviceId: formData.deviceId,
            model: formData.model,
            serialnumber: formData.serialnumber,
            type: formData.type
        };

        try {
            // 2. ส่ง request พร้อมแนบ Header Authorization
            await axios.post("http://localhost:8080/devices", dataToSend, {
                headers: {
                    // รูปแบบมาตรฐานคือ 'Bearer [TOKEN]'
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (typeof onSaveSuccess === 'function') {
                onSaveSuccess();
            }
            if (typeof onClose === 'function') {
                onClose();
            }

        } catch (error) {
            if (error.response) {
                // จะเห็น Error "Missing or malformed JWT" ที่นี่ถ้า Token ไม่ถูกต้อง
                console.error("Server Error Detail:", error.response.data);
            }
            console.error("Error adding device:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>

           <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {/*Device ID*/}
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">Device ID:</label>
                    <input 
                        name="deviceId" 
                        type="text"
                        value={formData.deviceId}
                        onChange={handleChange}
                        className="border rounded w-full p-2 bg-white"
                        required
                    />
                </div>
                
                {/* Dropdown Type */}
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">Type:</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="border rounded w-full p-2 bg-white"
                        required
                    >
                        <option value="เลือก Type">เลือก Type</option>
                        <option value="Smartwatch">Smartwatch</option>
                        <option value="Gateway">Gateway</option>
                    </select>
                </div>
                
                {/* Model */}
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">Model:</label>
                    <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        className="border rounded w-full p-2 bg-white"
                        required
                    />
                </div>
                
                {/* Serial Number */}
                <div className="mb-2">
                    <label className="block text-gray-700 text-sm">Serial Number:</label>
                    <input
                        type="text"
                        name="serialnumber"
                        value={formData.serialnumber}
                        onChange={handleChange}
                        className="border rounded w-full p-2 bg-white"
                        required
                    />
                </div>
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

export default AddDeviceForm;