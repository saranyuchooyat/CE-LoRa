import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/API"; // 💡 ใช้ตัวแปร api ที่ส่งออกมาจาก API.js

function ElderlyMonitoring(){
    const location = useLocation();

    // 💡 1. จัดการเรื่อง Token ให้เสร็จก่อนเป็นอันดับแรก
    useEffect(() => {
        const tokenInState = location.state?.token;
        const tokenInStorage = localStorage.getItem('token');
        
        if (tokenInState && tokenInState !== tokenInStorage) {
            localStorage.setItem('token', tokenInState);
        }
    }, [location.state]);

    // 💡 2. ปรับ useQueries ให้รันเมื่อมี Token เท่านั้น
    const systemQueries = useQueries({
        queries: [
            { 
                queryKey: ['staff'], 
                queryFn: () => api.get('/zones/my-zones').then(res => res.data),
                // 🛡️ สำคัญ: ถ้าไม่มี Token ใน localStorage จะยังไม่เริ่มยิง API
                enabled: !!localStorage.getItem('token') 
            },
        ],
    });

    const isSystemLoading = systemQueries.some(query => query.isLoading);
    const isSystemError = systemQueries.some(query => query.isError);
    const zoneData = systemQueries[0]?.data || [];

    // 💡 3. เช็คว่าถ้ายังไม่มี Token และกำลังโหลด ให้แสดง Loading ไปก่อน
    if (isSystemLoading || !localStorage.getItem('token')) {
        return <div className="mx-5 mt-10 text-center text-xl">Checking Authorization...</div>;
    }
    
    if (isSystemError) {
        return <div className="mx-5 mt-10 text-center text-xl text-red-600">Error fetching data!</div>;
    }

    return(
        <>
            <div className="mx-5">
                <h1>Elderly Monitoring Dashboard</h1>
                {/* แสดงข้อมูลที่ดึงมาได้ */}
                <pre>{JSON.stringify(zoneData, null, 2)}</pre>
            </div>
        </>
    );
}

export default ElderlyMonitoring;