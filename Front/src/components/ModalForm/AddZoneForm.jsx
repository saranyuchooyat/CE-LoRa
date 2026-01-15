import { useState } from "react";
import axios from "axios";

function AddZoneForm({ onClose, onSaveSuccess }){

    const [formData, setFormData] = useState({
        zonename: '',
        address: '',
        description: '',
    });

    // const [openStatus, setOpenStatus] = useState(false);
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
            zoneName: formData.zonename,
            description: formData.description,
            address: formData.address
        };

        try {
            // 2. ส่ง request พร้อมแนบ Header Authorization
            await axios.post("http://localhost:8080/zones", dataToSend, {
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
            console.error("Error adding zone:", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
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



            {/* Footer (ปุ่ม Save/Cancel) */}
            <div className="mt-6 pt-4 border-t flex justify-end gap-4">
                <button 
                    type="submit" 
                    className="bg-complete-bg text-main-blue px-4 py-2 rounded-lg hover:bg-main-blue hover:text-white cursor-pointer"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
                
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 hover:text-white cursor-pointer"
                    disabled={isSubmitting}
                >
                    ยกเลิก
                </button>
            </div>
        </form>
    );
}

export default AddZoneForm;