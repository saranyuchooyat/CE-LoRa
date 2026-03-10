import { useState, useEffect } from "react";
import api from "../API";

function SetDeviceForm({ deviceId, onClose }) {
    const [zones, setZones] = useState([]);
    const [selectedZone, setSelectedZone] = useState("");
    const [elders, setElders] = useState([]);
    const [selectedElder, setSelectedElder] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Fetch Zones on mount
    useEffect(() => {
        const fetchZones = async () => {
            try {
                // สมมติว่าดึง zone ที่ตัวเองดูแล ถ้ามี role admin อาจจะ get('/zones') ก็ได้
                // แต่โจทย์คือ "zone ที่ตัวเองดูแล" ดังนั้นลอง my-zones ก่อน
                const res = await api.get('/zones/my-zones');
                setZones(res.data);
            } catch (err) {
                console.error("Failed to fetch zones", err);
            }
        };
        fetchZones();
    }, []);

    // 2. Fetch Elders when selectedZone changes
    useEffect(() => {
        if (!selectedZone) {
            setElders([]);
            return;
        }
        const fetchElders = async () => {
            try {
                const res = await api.get(`/zones/${selectedZone}/elder`);
                setElders(res.data);
            } catch (err) {
                console.error("Failed to fetch elders", err);
            }
        };
        fetchElders();
    }, [selectedZone]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedElder) {
            alert("กรุณาเลือกผู้สูงอายุ");
            return;
        }

        setIsSubmitting(true);
        try {
            // หาข้อมูลผู้สูงอายุที่ถูกเลือก เพื่อจัดเป็นชื่อ AssignedTo
            const elder = elders.find(e => e.elder_id === selectedElder);
            const assignedToName = elder ? `${elder.first_name} ${elder.last_name}` : selectedElder;

            const payload = {
                status: "offline", // ให้สถานะตั้งต้นเมื่อพึ่งผูกอุปกรณ์เป็น offline รออัปเดตจากอุปกรณ์จริง
                assigned_to: assignedToName
            };

            await api.put(`/devices/${deviceId}`, payload, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (onClose) onClose();
        } catch (error) {
            console.error("Failed to set device:", error);
            alert("ไม่สามารถบันทึกการตั้งค่าได้");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label htmlFor="device_id" className="text-gray-700 text-sm">Device ID:</label>
                    <input 
                        type="text" 
                        id="device_id" 
                        value={deviceId || ''} 
                        readOnly 
                        className="border rounded p-2 bg-gray-100 w-full" 
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="zone_id" className="text-gray-700 text-sm">เลือกโซน (ที่ดูแล):</label>
                    <select 
                        id="zone_id" 
                        value={selectedZone} 
                        onChange={(e) => setSelectedZone(e.target.value)}
                        className="border rounded p-2 bg-white w-full"
                        required
                    >
                        <option value="">-- กรุณาเลือกโซน --</option>
                        {zones.map((z, idx) => (
                            <option key={idx} value={z.zone_id}>{z.zone_name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="elder_id" className="text-gray-700 text-sm">เลือกผู้สูงอายุ:</label>
                    <select 
                        id="elder_id" 
                        value={selectedElder} 
                        onChange={(e) => setSelectedElder(e.target.value)}
                        className="border rounded p-2 bg-white w-full"
                        disabled={!selectedZone || elders.length === 0}
                        required
                    >
                        <option value="">-- กรุณาเลือกผู้สูงอายุ --</option>
                        {elders.map((e, idx) => (
                            <option key={idx} value={e.elder_id}>
                                {e.first_name} {e.last_name}
                            </option>
                        ))}
                    </select>
                    {selectedZone && elders.length === 0 && (
                        <p className="text-sm text-red-500">ไม่มีผู้สูงอายุในโซนนี้</p>
                    )}
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-6 mt-4 border-t flex justify-end gap-3">
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

export default SetDeviceForm;