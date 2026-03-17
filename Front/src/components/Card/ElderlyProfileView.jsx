import React from 'react';

function ElderlyProfileView({ elderData, onBack }) {
    if (!elderData) return null;

    return (
        <div className="p-6 max-w-5xl mx-auto animate-fade-in">
            {/* ปุ่มกดย้อนกลับ */}
            <button 
                onClick={onBack} 
                className="mb-6 flex items-center text-gray-600 hover:text-main-green font-bold bg-white px-4 py-2 rounded-lg shadow-sm border"
            >
                ← ย้อนกลับไปหน้า Dashboard
            </button>

            {/* การ์ดประวัติ */}
            <div className="bg-white rounded-xl shadow p-8 border-t-4 border-main-green">
                <div className="flex items-center gap-6 mb-8 border-b pb-6">
                    <div className="w-24 h-24 bg-green-100 text-main-green flex items-center justify-center rounded-full text-4xl font-bold">
                        {elderData.first_name ? elderData.first_name.charAt(0) : "?"}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            {elderData.first_name} {elderData.last_name}
                        </h1>
                        <p className="text-lg text-gray-500 mt-2">
                            รหัส: <span className="font-semibold text-main-green">{elderData.elder_id}</span> | 
                            อายุ {elderData.age || '-'} ปี | 
                            อุปกรณ์: <span className="font-semibold text-blue-500">{elderData.device_id || 'ไม่มีอุปกรณ์'}</span>
                        </p>
                    </div>
                </div>

                {/* ข้อมูลสุขภาพล่าสุด */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">ข้อมูลสุขภาพล่าสุด</h2>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center">
                            <p className="text-sm text-gray-500">อัตราการเต้นหัวใจ</p>
                            <p className="text-2xl font-bold text-red-500">{elderData.vitals?.heart_rate ?? "-"}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                            <p className="text-sm text-gray-500">ออกซิเจนในเลือด</p>
                            <p className="text-2xl font-bold text-blue-500">{elderData.vitals?.spo2 ?? "-"}</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-center">
                            <p className="text-sm text-gray-500">อุณหภูมิร่างกาย</p>
                            <p className="text-2xl font-bold text-orange-500">{elderData.vitals?.temperature ?? "-"}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-center">
                            <p className="text-sm text-gray-500">ความดันโลหิต</p>
                            <p className="text-2xl font-bold text-purple-500">{elderData.vitals?.blood_pressure ?? "-"}</p>
                        </div>
                    </div>
                </div>

                {/* ข้อมูลส่วนตัวอื่นๆ */}
                <div>
                    <h2 className="text-xl font-bold text-gray-700 mb-4">ข้อมูลส่วนตัวและประวัติการรักษา</h2>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                        <div><p className="text-gray-500 text-sm">โรคประจำตัว</p><p className="font-semibold bg-gray-50 p-2 rounded">{elderData.congenital_disease || "-"}</p></div>
                        <div><p className="text-gray-500 text-sm">ยาประจำตัว</p><p className="font-semibold bg-gray-50 p-2 rounded">{elderData.personal_medicine || "-"}</p></div>
                        
                        {/* ✅ เพิ่มชื่อผู้ติดต่อฉุกเฉินตรงนี้ */}
                        <div>
                            <p className="text-gray-500 text-sm">ชื่อผู้ติดต่อฉุกเฉิน</p>
                            <p className="font-semibold text-red-700 bg-red-50 p-2 rounded">{elderData.emergency_contact_name || "-"}</p>
                        </div>
                        
                        <div>
                            <p className="text-gray-500 text-sm">เบอร์โทรติดต่อฉุกเฉิน</p>
                            <p className="font-semibold text-red-500 bg-red-50 p-2 rounded">{elderData.emergency_contacts || "-"}</p>
                        </div>
                        
                        {/* ✅ ปรับที่อยู่ให้ขยายเต็ม 2 คอลัมน์ (col-span-2) */}
                        <div className="col-span-2">
                            <p className="text-gray-500 text-sm">ที่อยู่</p>
                            <p className="font-semibold bg-gray-50 p-2 rounded">{elderData.address || "-"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ElderlyProfileView;