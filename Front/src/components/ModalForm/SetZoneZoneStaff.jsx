import { useState, useEffect } from "react";
import api from "../API";

function SetZoneZoneStaff({ userId, onClose, onSaveSuccess }) {
    const [zones, setZones] = useState([]);
    const [userData, setUserData] = useState(null); // 💡 เก็บข้อมูลผู้ใช้ที่ดึงมา
    const [selectedZoneId, setSelectedZoneId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 💡 1. ดึงทั้งข้อมูลโซน และข้อมูลผู้ใช้พร้อมกัน
                const [zonesRes, userRes] = await Promise.all([
                    api.get('/zones'),
                    api.get(`/users/${userId}`)
                ]);

                // จัดการข้อมูลโซน
                const zoneOptions = zonesRes.data.map(zone => ({
                    label: zone.zonename,
                    value: zone.zoneid
                }));
                setZones(zoneOptions);

                // 💡 2. เก็บข้อมูลผู้ใช้ และตั้งค่า Zone ID ปัจจุบัน (ถ้ามี)
                setUserData(userRes.data);
                if (userRes.data.zoneId) {
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
            const zoneId = Number(selectedZoneId);
            const uId = Number(userId);

            // 💡 3. นำข้อมูลที่ดึงมา ใส่กลับเข้าไปใน Body ตามโครงสร้าง Swagger
            const requestBody = {
                firstName: userData?.firstName || "", 
                lastName: userData?.lastName || "",
                email: userData?.email || "",
                phone: userData?.phone || "",
                position: userData?.position || "Zone Staff",
                username: userData?.username || "",
                // permissions: userData?.permissions || []
            };

            await api.put(`/zones/${zoneId}/staff/${uId}`, requestBody);
            
            onSaveSuccess(); // รีเฟรชตาราง
            onClose(); // ปิด Modal
        } catch (error) {
            console.error("Update failed:", error.response?.data || error.message);
            alert("บันทึกการแก้ไขไม่สำเร็จ");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-4 text-center">กำลังโหลดข้อมูล...</div>;

    console.log ("userData", userData);

    return (
        <form onSubmit={handleSubmit} className="p-4">
            {/* 💡 แสดงชื่อผู้ใช้ที่ดึงมาได้ */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800 font-semibold">เจ้าหน้าที่: {userData?.name}</p>
                <p className="text-xs text-blue-600">อีเมล: {userData?.email}</p>
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">ย้ายไปยังโซน:</label>
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
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                    {isSubmitting ? "กำลังบันทึก..." : "ยืนยันการย้ายโซน"}
                </button>
                <button type="button" onClick={onClose} className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300">ยกเลิก</button>
            </div>
        </form>
    );
}

export default SetZoneZoneStaff;