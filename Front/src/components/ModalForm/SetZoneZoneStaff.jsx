import { useState, useEffect } from "react";
import api from "../API";
import { showPopup } from '../Popup';

function SetZoneZoneStaff({ userId, onClose, onSaveSuccess }) {
    const [zones, setZones] = useState([]);
    const [userData, setUserData] = useState(null);
    const [selectedZoneId, setSelectedZoneId] = useState("");
    const [selectedZoneIds, setSelectedZoneIds] = useState([]);
    const [accountStatus, setAccountStatus] = useState("Active");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ✅ State สำหรับระบบ Caregiver
    const [isCaregiver, setIsCaregiver] = useState('no');
    const [availableElders, setAvailableElders] = useState([]); 
    
    // 🎯 แก้ให้ selectedElders เก็บแค่ "รหัส (String)" เช่น ["E001", "E002"]
    const [selectedElders, setSelectedElders] = useState([]); 
    
    const [searchElder, setSearchElder] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [zonesRes, userRes] = await Promise.all([
                    api.get('/zones'),
                    api.get(`/users/${userId}`)
                ]);

                const zoneOptions = zonesRes.data.map(zone => ({
                    label: zone.zone_name,
                    value: zone.zone_id
                }));
                setZones(zoneOptions);
                setUserData(userRes.data);
                setAccountStatus(userRes.data.account_status || "Active");

                let userZones = [];
                if (userRes.data.zone_id) {
                    if (Array.isArray(userRes.data.zone_id)) {
                        userZones = userRes.data.zone_id;
                    } else if (typeof userRes.data.zone_id === 'string') {
                        userZones = userRes.data.zone_id.includes(',') 
                                        ? userRes.data.zone_id.split(',').map(z => z.trim()) 
                                        : [userRes.data.zone_id];
                    }
                }

                if (userZones.length > 0) {
                    if (['Zone Admin', 'System Admin'].includes(userRes.data.role)) {
                        setSelectedZoneIds(userZones);
                    } else {
                        setSelectedZoneId(userZones[0]);
                    }
                }

                // ✅ โหลดค่า Caregiver
                if (userRes.data.is_caregiver) {
                    setIsCaregiver('yes');
                }
                
                // 🎯 ดึง Array ของรหัส ["E001", "E002"] มาใส่ได้เลยโดยตรง
                if (userRes.data.assigned_elders && Array.isArray(userRes.data.assigned_elders)) {
                    setSelectedElders(userRes.data.assigned_elders); 
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    useEffect(() => {
        const fetchElders = async () => {
            if (!['Zone Admin', 'System Admin'].includes(userData?.role) && selectedZoneId) {
                try {
                    const res = await api.get(`/zones/${selectedZoneId}/dashboard`);
                    if (res.data && res.data.elders) {
                        setAvailableElders(res.data.elders);
                    } else {
                        setAvailableElders([]);
                    }
                } catch (error) {
                    console.error("Failed to fetch elders:", error);
                    setAvailableElders([]);
                }
            }
        };
        fetchElders();
    }, [selectedZoneId, userData]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const uId = userId;
            let finalZoneIds = [];
            
            if (['Zone Admin', 'System Admin'].includes(userData?.role)) {
                finalZoneIds = selectedZoneIds;
                if (finalZoneIds.length === 0) {
                    showPopup("แจ้งเตือน", "กรุณาเลือกอย่างน้อย 1 โซน", "error");
                    setIsSubmitting(false);
                    return;
                }
            } else {
                if (!selectedZoneId) {
                    showPopup("แจ้งเตือน", "กรุณาเลือกโซน", "error");
                    setIsSubmitting(false);
                    return;
                }
                finalZoneIds = [selectedZoneId];
            }

            const requestBody = {
                zone_id: finalZoneIds.join(','),
                account_status: accountStatus,
                is_caregiver: isCaregiver === 'yes',
                // 🎯 ส่งก้อน String Array ไปได้เลย
                assigned_elders: isCaregiver === 'yes' ? selectedElders : []
            };

            await api.put(`/users/${uId}`, requestBody);
            showPopup("สำเร็จ", "บันทึกการแก้ไขสำเร็จ", "success");
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error("Submit Error:", error.response?.data || error.message);
            showPopup("ข้อผิดพลาด", "บันทึกการแก้ไขไม่สำเร็จ", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCheckboxChange = (zoneId) => {
        setSelectedZoneIds(prev => 
            prev.includes(zoneId) ? prev.filter(id => id !== zoneId) : [...prev, zoneId]
        );
    };

    // 🎯 แก้ฟังก์ชันเพิ่ม/ลบ ให้ทำงานกับ String ID
    const handleAddElder = (elderId) => {
        if (!selectedElders.includes(elderId)) {
            setSelectedElders([...selectedElders, elderId]);
        }
    };
    const handleRemoveElder = (elderId) => {
        setSelectedElders(selectedElders.filter(id => id !== elderId));
    };

    const filteredElders = availableElders.filter(elder => 
        (elder.first_name + " " + elder.last_name).toLowerCase().includes(searchElder.toLowerCase()) ||
        elder.elder_id.toLowerCase().includes(searchElder.toLowerCase())
    );

    if (isLoading) return <div className="p-4 text-center">กำลังโหลดข้อมูล...</div>;
    const isMultiZoneRole = ['Zone Admin', 'System Admin'].includes(userData?.role);

    return (
        <form onSubmit={handleSubmit} className="p-4">
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800 font-semibold">ผู้ใช้งาน: {userData?.first_name} {userData?.last_name || userData?.name}</p>
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
                        onChange={(e) => {
                            setSelectedZoneId(e.target.value);
                            setSelectedElders([]); 
                        }}
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

            {!isMultiZoneRole && (
                <div className="mb-4 border-t pt-4">
                    <label className="block text-gray-800 text-sm font-bold mb-3">
                        🏥 บทบาท Caregiver (ดูแลผู้สูงอายุ)
                    </label>
                    <div className="flex gap-6 mb-4">
                        <label className="flex items-center cursor-pointer text-sm">
                            <input 
                                type="radio" 
                                name="isCaregiver" 
                                value="no" 
                                checked={isCaregiver === 'no'} 
                                onChange={(e) => setIsCaregiver(e.target.value)} 
                                className="mr-2 w-4 h-4" 
                            />
                            ไม่ใช่ (เป็นสตาฟทั่วไป)
                        </label>
                        <label className="flex items-center cursor-pointer text-sm">
                            <input 
                                type="radio" 
                                name="isCaregiver" 
                                value="yes" 
                                checked={isCaregiver === 'yes'} 
                                onChange={(e) => setIsCaregiver(e.target.value)} 
                                className="mr-2 w-4 h-4 text-green-500" 
                            />
                            ใช่ (เป็นคนดูแล)
                        </label>
                    </div>

                    {isCaregiver === 'yes' && (
                        <div className="bg-gray-50 border rounded-lg p-3 animate-fade-in">
                            <label className="block text-gray-700 text-xs font-bold mb-2">
                                👥 ระบุผู้สูงอายุที่ต้องดูแล <span className="font-normal text-gray-500">(เลือกได้หลายคน)</span>
                            </label>

                            {/* 🎯 แสดงป้าย Tag โดยดึงชื่อจาก availableElders */}
                            <div className="flex flex-wrap gap-2 mb-3 min-h-[32px]">
                                {selectedElders.length === 0 && <span className="text-xs text-gray-400 italic mt-1">ยังไม่ได้เลือกผู้สูงอายุ...</span>}
                                {selectedElders.map(elderId => {
                                    // หาข้อมูลชื่อจากตารางหลัก
                                    const elderInfo = availableElders.find(e => e.elder_id === elderId);
                                    const elderName = elderInfo ? `- ${elderInfo.first_name}` : '';
                                    
                                    return (
                                        <div key={elderId} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs flex items-center shadow-sm border border-green-200">
                                            <span className="font-bold mr-1">{elderId}</span> {elderName}
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveElder(elderId)} 
                                                className="ml-2 text-red-400 hover:text-red-600 font-bold focus:outline-none"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>

                            <input 
                                type="text" 
                                placeholder="🔍 ค้นหาชื่อ หรือ รหัส (E00...)" 
                                value={searchElder} 
                                onChange={(e) => setSearchElder(e.target.value)} 
                                className="border rounded w-full p-2 mb-2 bg-white text-sm focus:outline-none focus:border-green-500" 
                            />

                            <div className="max-h-32 overflow-y-auto border rounded bg-white">
                                {availableElders.length === 0 ? (
                                    <div className="text-center text-gray-500 text-xs py-4">
                                        {!selectedZoneId ? "กรุณาเลือกโซนก่อน" : "กำลังโหลด... หรือไม่มีข้อมูลในโซนนี้"}
                                    </div>
                                ) : filteredElders.length === 0 ? (
                                    <div className="text-center text-gray-500 text-xs py-4">ไม่พบชื่อที่ค้นหา</div>
                                ) : (
                                    filteredElders.map(elder => {
                                        // 🎯 เช็คว่าเลือกไปหรือยังจาก Array String
                                        const isSelected = selectedElders.includes(elder.elder_id);
                                        return (
                                            <div key={elder.elder_id} className={`flex justify-between items-center p-2 border-b last:border-0 transition-colors ${isSelected ? 'bg-gray-50 opacity-60' : 'hover:bg-green-50'}`}>
                                                <div className="text-xs text-gray-700">
                                                    <span className="font-bold">{elder.elder_id}</span> : {elder.first_name} {elder.last_name}
                                                </div>
                                                <button 
                                                    type="button" 
                                                    disabled={isSelected}
                                                    onClick={() => handleAddElder(elder.elder_id)}
                                                    className={`text-[10px] px-2 py-1 rounded font-bold transition-all ${isSelected ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-600 hover:bg-blue-500 hover:text-white shadow-sm'}`}
                                                >
                                                    {isSelected ? 'เลือกแล้ว' : '+ เพิ่ม'}
                                                </button>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">สถานะบัญชีผู้ใช้งาน:</label>
                <select
                    value={accountStatus}
                    onChange={(e) => setAccountStatus(e.target.value)}
                    className="border text-sm rounded w-full p-2.5 bg-white"
                    required
                >
                    <option value="Active">Active (เปิดใช้งาน)</option>
                    <option value="Inactive">Inactive (ระงับบัญชี)</option>
                </select>
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