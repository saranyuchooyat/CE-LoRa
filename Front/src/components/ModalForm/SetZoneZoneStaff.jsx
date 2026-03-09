import { useState, useEffect } from "react";
import api from "../API";

function SetZoneZoneStaff({ userId, onClose, onSaveSuccess }) {
    const [zones, setZones] = useState([]);
    const [userData, setUserData] = useState(null);
    const [selectedZoneId, setSelectedZoneId] = useState("");
    const [selectedZoneIds, setSelectedZoneIds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [zonesRes, userRes] = await Promise.all([
                    api.get('/zones'),
                    api.get(`/users/${userId}`)
                ]);

                const zoneOptions = zonesRes.data.map(zone => ({
                    label: zone.zonename,
                    value: zone.zoneid
                }));
                setZones(zoneOptions);

                setUserData(userRes.data);
                
                // Initialize selected zones
                if (userRes.data.zoneids && userRes.data.zoneids.length > 0) {
                    if (['Zone Admin', 'System Admin'].includes(userRes.data.role)) {
                        setSelectedZoneIds(userRes.data.zoneids);
                    } else {
                        setSelectedZoneId(userRes.data.zoneids[0].toString());
                    }
                } else if (userRes.data.zoneId) {
                    setSelectedZoneId(userRes.data.zoneId.toString());
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const uId = Number(userId);
            
            let finalZoneIds = [];
            if (['Zone Admin', 'System Admin'].includes(userData?.role)) {
                finalZoneIds = selectedZoneIds;
                if (finalZoneIds.length === 0) {
                    alert("กรุณาเลือกอย่างน้อย 1 โซน");
                    setIsSubmitting(false);
                    return;
                }
            } else {
                if (!selectedZoneId) {
                    alert("กรุณาเลือกโซน");
                    setIsSubmitting(false);
                    return;
                }
                finalZoneIds = [Number(selectedZoneId)];
            }

            const requestBody = {
                zoneids: finalZoneIds
            };

            await api.put(`/users/${uId}`, requestBody);
            
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error("Update failed:", error.response?.data || error.message);
            alert("บันทึกการแก้ไขไม่สำเร็จ");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCheckboxChange = (zoneId) => {
        setSelectedZoneIds(prev => 
            prev.includes(zoneId) 
                ? prev.filter(id => id !== zoneId) 
                : [...prev, zoneId]
        );
    };

    if (isLoading) return <div className="p-4 text-center">กำลังโหลดข้อมูล...</div>;

    const isMultiZoneRole = ['Zone Admin', 'System Admin'].includes(userData?.role);

    return (
        <form onSubmit={handleSubmit} className="p-4">
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800 font-semibold">ผู้ใช้งาน: {userData?.name}</p>
                <p className="text-xs text-blue-600">อีเมล: {userData?.email}</p>
                <p className="text-xs text-blue-600">บทบาท: {userData?.role}</p>
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">เขตพื้นที่ดูแล:</label>
                
                {isMultiZoneRole ? (
                    <div className="border rounded w-full p-3 bg-white max-h-48 overflow-y-auto">
                        {zones.map((zone) => (
                            <div key={zone.value} className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    id={`zone-${zone.value}`}
                                    checked={selectedZoneIds.includes(zone.value)}
                                    onChange={() => handleCheckboxChange(zone.value)}
                                    className="mr-2"
                                />
                                <label htmlFor={`zone-${zone.value}`} className="text-sm text-gray-700 cursor-pointer">
                                    {zone.label}
                                </label>
                            </div>
                        ))}
                    </div>
                ) : (
                    <select
                        value={selectedZoneId}
                        onChange={(e) => setSelectedZoneId(e.target.value)}
                        className="border rounded w-full p-2 bg-white"
                        required
                    >
                        <option value="" disabled>-- เลือกโซนใหม่ --</option>
                        {zones.map((zone) => (
                            <option key={zone.value} value={zone.value}>
                                {zone.label}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                    {isSubmitting ? "กำลังบันทึก..." : "ยืนยันการตั้งค่า"}
                </button>
                <button type="button" onClick={onClose} className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300">ยกเลิก</button>
            </div>
        </form>
    );
}

export default SetZoneZoneStaff;