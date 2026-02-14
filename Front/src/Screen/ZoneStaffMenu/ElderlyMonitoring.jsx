import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/API"; // 💡 ใช้ตัวแปร api ที่ส่งออกมาจาก API.js

function ElderlyMonitoring(){
    
    const location = useLocation();

    // 1. ดึงข้อมูล Zone ของผู้ใช้งานปัจจุบันก่อน
    const zoneDataQueries = useQueries({
        queries: [
            { 
                queryKey: ['zoneData'], 
                queryFn: () => api.get(`/zones/my-zones`).then(res => res.data) 
            },
        ],
    });

    // 2. ตรวจสอบสถานะการโหลดและข้อมูล
    const isZoneDataLoading = zoneDataQueries[0].isLoading;
    const isZoneDataError = zoneDataQueries[0].isError;
    const zoneData = zoneDataQueries[0].data || [];

    // 3. ดึง ID ออกมาให้ถูกต้อง (สกัดจาก Array เป็นค่าเดียว)
    // 💡 เปลี่ยนจาก .filter() เป็นการเข้าถึง index 0 เพราะข้อมูลมาเป็น Array ของ Object
    const currentZoneId = zoneData.length > 0 ? zoneData[0].zoneid : null;

    // 4. ใช้ useQueries อีกครั้งเพื่อดึงข้อมูล Elders โดยรอจนกว่าจะได้ ID
    const eldersQueries = useQueries({
        queries: [
            { 
                queryKey: ['eldersData', currentZoneId], 
                queryFn: () => api.get(`/zones/${currentZoneId}/elders`).then(res => res.data),
                // 💡 สำคัญ: enabled จะช่วยป้องกัน API พังถ้า currentZoneId ยังเป็น null
                enabled: !!currentZoneId 
            },
        ],
    });

    const isEldersLoading = eldersQueries[0].isLoading;
    const eldersData = eldersQueries[0].data || [];

    // 5. จัดการ Token และสิทธิ์การเข้าถึง
    useEffect(() => {
        const tokenInStorage = localStorage.getItem('token');
        if (location.state?.token && location.state.token !== tokenInStorage) {
            localStorage.setItem('token', location.state.token);
        }
    }, [location.state]);

    if (isZoneDataLoading) {
        return <div className="mx-5 mt-10 text-center text-xl">Loading Zone Data...</div>;
    }
    if (isZoneDataError) {
        return <div className="mx-5 mt-10 text-center text-xl text-red-600">Error fetching Zone Data</div>;
    }

    return(
        <>
            <div className="mx-5">
                <h1>Elderly Monitoring Dashboard</h1>
                {/* แสดงข้อมูลที่ดึงมาได้ */}
                <pre>{JSON.stringify(zoneData, null, 2)}</pre>
                <h2>Elders in Zone</h2>
                {isEldersLoading ? (
                    <div>Loading Elders Data...</div>
                ) : (
                    <pre>{JSON.stringify(eldersData, null, 2)}</pre>
                )}
            </div>
        </>
    );
}

export default ElderlyMonitoring;