import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../API";
import { showPopup } from "../Popup";

function SetElderlyDeviceForm({ isOpen, onClose, elderData, onSuccess }) {
    const [selectedDevice, setSelectedDevice] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // รีเซ็ตค่าเมื่อเปิด Modal หรือได้ elderData ใหม่
    useEffect(() => {
        if (isOpen) {
            setSelectedDevice("");
        }
    }, [isOpen, elderData]);

    // ดึงอุปกรณ์ทั้งหมดเพื่อนำมากรองอันที่ว่าง
    const { data: devices = [], isLoading: isDevicesLoading } = useQuery({
        queryKey: ["allDevices"],
        queryFn: async () => {
            const res = await api.get("/devices");
            return res.data;
        },
        enabled: isOpen, // โหลดเฉพาะตอนเปิด Modal
    });

    // กรองอุปกรณ์ที่ว่าง (ยังไม่มีคนใช้ หรือ unassigned)
    const availableDevices = devices.filter((device) => {
        return (
            !device.assigned_to || 
            device.assigned_to === "None" || 
            device.assigned_to === "" || 
            device.status === "unassigned"
        );
    });

    if (!isOpen || !elderData) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // เอา Alert ง่ายๆ ก่อน ถ้าไม่เลือกอะไรเลย
        if (!selectedDevice) {
            showPopup("แจ้งเตือน", "กรุณาเลือกอุปกรณ์ที่ต้องการเชื่อมต่อ", "warning");
            return;
        }

        try {
            setIsSubmitting(true);

            // 1. ถ้ามีอุปกรณ์เดิม ให้ปลดออกก่อน (ตั้งค่าเป็น None)
            if (elderData.device_id) {
                await api.put(`/devices/${elderData.device_id}`, {
                    assigned_to: "None",
                    status: "unassigned"
                });
            }

            // 2. ผูกอุปกรณ์ใหม่ (อัปเดต AssignedTo และ status ให้เป็น online)
            await api.put(`/devices/${selectedDevice}`, {
                assigned_to: `${elderData.first_name} ${elderData.last_name}`,
                status: "online"
            });

            showPopup("สำเร็จ", "ทำการตั้งค่าอุปกรณ์สำเร็จ", "success");
            
            if (onSuccess) onSuccess(); // เรียกให้โหลดข้อมูลใหม่
            onClose(); // ปิด Modal
        } catch (error) {
            console.error("Error updating device:", error);
            showPopup("ข้อผิดพลาด", "ไม่สามารถอัปเดตอุปกรณ์ได้ โปรดลองอีกครั้ง", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in font-kanit">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform scale-100 transition-all">
                <div className="flex justify-between items-center mb-5 border-b pb-3">
                    <h2 className="text-2xl font-bold text-gray-800">ตั้งค่าอุปกรณ์ Smartwatch</h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-red-500 transition-colors bg-gray-100 hover:bg-red-50 p-2 rounded-full"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div className="mb-6 bg-green-50 rounded-xl p-4 border border-green-100">
                    <p className="text-sm text-gray-500 mb-1">ชื่อผู้สูงอายุ:</p>
                    <p className="text-lg font-bold text-gray-800">{elderData.first_name} {elderData.last_name}</p>
                    
                    <p className="text-sm text-gray-500 mt-3 mb-1">อุปกรณ์ปัจจุบัน:</p>
                    <p className="text-md font-semibold text-main-green bg-white inline-block px-3 py-1 rounded border border-green-200 shadow-sm">
                        {elderData.device_id || "ยังไม่มีอุปกรณ์"}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2 ml-1">
                            เลือกอุปกรณ์ใหม่ <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedDevice}
                            onChange={(e) => setSelectedDevice(e.target.value)}
                            disabled={isDevicesLoading || isSubmitting}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-xl focus:ring-main-green focus:border-main-green p-3 shadow-sm transition-colors cursor-pointer"
                        >
                            <option value="" disabled>-- เลือกอุปกรณ์ที่ว่าง --</option>
                            {isDevicesLoading ? (
                                <option value="" disabled>กำลังโหลดอุปกรณ์...</option>
                            ) : availableDevices.length > 0 ? (
                                availableDevices.map((dev) => (
                                    <option key={dev.device_id} value={dev.device_id}>
                                        {dev.device_name} (ID: {dev.device_id})
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>ไม่มีอุปกรณ์ว่างในระบบ</option>
                            )}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                            disabled={isSubmitting}
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl font-bold text-white bg-main-green hover:bg-green-600 shadow-md transition-all flex items-center justify-center min-w-[120px]"
                            disabled={isSubmitting || !selectedDevice}
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                "บันทึกการเปลี่ยนแปลง"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SetElderlyDeviceForm;
