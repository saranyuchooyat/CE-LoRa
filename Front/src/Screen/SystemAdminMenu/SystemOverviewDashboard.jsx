import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/API";
import Cardno2 from "../../components/Cardno2";
import Cardno3 from "../../components/Cardno3";
import CardFull from "../../components/Cardno5";
import CardServerData from "../../components/CardServerData";



function SystemOverviewDashboard(){

    const location = useLocation();

    //ดึงข้อมูลหลังบ้าน
    const systemQueries = useQueries({
        queries: [
            { queryKey: ['users'], queryFn: () => api.get('/users').then(res => res.data) },
            { queryKey: ['elders'], queryFn: () => api.get('/elders').then(res => res.data) },
            { queryKey: ['devices'], queryFn: () => api.get('/devices').then(res => res.data) },
            { queryKey: ['zones'], queryFn: () => api.get('/zones').then(res => res.data) },
            { queryKey: ['servers'], queryFn: () => api.get('/system/health/servers').then(res => res.data) },
            { queryKey: ['alerts'], queryFn: () => api.get('/system/alerts').then(res => res.data) },
        ],
    });

    const isSystemLoading = systemQueries.some(query => query.isLoading);
    const isSystemError = systemQueries.some(query => query.isError);

    const userData = systemQueries[0].data || [];
    const elderlyData = systemQueries[1].data || [];
    const deviceData = systemQueries[2].data || [];
    const zoneData = systemQueries[3].data || [];
    const serverData = systemQueries[4].data || [];
    const alertData = systemQueries[5].data || [];

    useEffect(() => {
        const tokenInStorage = localStorage.getItem('token');
        if (location.state?.token && location.state.token !== tokenInStorage) {
             localStorage.setItem('token', location.state.token);
             // 💡 เมื่อบันทึก Token ใหม่แล้ว React Query จะทำการ Refetch ให้อัตโนมัติ
             // เนื่องจากทุก Query จะถูก Trigger เมื่อ Token ถูกบันทึกและ Component Rerender
        }
    }, [location.state]);
    //ดึงข้อมูลหลังบ้าน

    const SystemData = 
    [
        {value: zoneData.length ,name:"จำนวน Zone ที่ใช้งาน"},
        {value: (userData.length),name:"จำนวนผู้ใช้งานทั้งหมด"},
        {value: elderlyData.length ,name:"จำนวนผู้สูงอายุที่ลงทะเบียน"},
        {value: deviceData.length,name:"จำนวนอุปกรณ์ที่ลงทะเบียน"},
    ]

    if (isSystemLoading) {
        return <div className="mx-5 mt-10 text-center text-xl">Loading Dashboard...</div>;
    }
    
    if (isSystemError) {
        return <div className="mx-5 mt-10 text-center text-xl text-red-600">Error fetching data!</div>;
    }

    return(
        <>
            <div className="mx-5">
                <Cardno2 data={SystemData}/>
                <Cardno3/>
                <CardServerData data={serverData}/>
                <CardFull data={alertData}/>
            </div>
        </>
    );
}

export default SystemOverviewDashboard;