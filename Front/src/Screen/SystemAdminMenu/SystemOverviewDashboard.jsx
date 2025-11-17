import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/API";
import Cardno2 from "../../components/Cardno2";
import TwoGrpahCard from "../../components/CardTwoGraph";
import CardFull from "../../components/Cardno5";
import CardServerData from "../../components/CardServerData";



function SystemOverviewDashboard(){

    const location = useLocation();

    //ดึงข้อมูลหลังบ้าน
    const systemQueries = useQueries({
        queries: [
            { queryKey: ['summaryInfo'], queryFn:() => api.get('dashboard/summary').then(res => res.data)},
            { queryKey: ['servers'], queryFn: () => api.get('/system/health/servers').then(res => res.data) },
            { queryKey: ['topZone'], queryFn:() => api.get('dashboard/top-zones').then(res => res.data)},
            { queryKey: ['usageTrend'], queryFn:() => api.get('dashboard/usage-trend').then(res => res.data)},
            
        ],
    });

    const isSystemLoading = systemQueries.some(query => query.isLoading);
    const isSystemError = systemQueries.some(query => query.isError);

    const summaryInfoData = systemQueries[0].data || [];
    const serverData = systemQueries[1].data || [];
    const topZoneData = systemQueries[2].data || [];
    const UsageTrendData = systemQueries[3].data || [];
    

    useEffect(() => {
        const tokenInStorage = localStorage.getItem('token');
        if (location.state?.token && location.state.token !== tokenInStorage) {
             localStorage.setItem('token', location.state.token);
             // 💡 เมื่อบันทึก Token ใหม่แล้ว React Query จะทำการ Refetch ให้อัตโนมัติ
             // เนื่องจากทุก Query จะถูก Trigger เมื่อ Token ถูกบันทึกและ Component Rerender
        }
    }, [location.state]);
    //ดึงข้อมูลหลังบ้าน

    console.log("summary",summaryInfoData)

    const systemData = 
    [
        {value: summaryInfoData.zonesCount ,name:"จำนวน Zone ที่ใช้งาน"},
        {value: summaryInfoData.usersCount ,name:"จำนวนผู้ใช้งานทั้งหมด"},
        {value: summaryInfoData.elderlyCount ,name:"จำนวนผู้สูงอายุที่ลงทะเบียน"},
        {value: summaryInfoData.devicesCount ,name:"จำนวนอุปกรณ์ที่ลงทะเบียน"},
    ]

    if (isSystemLoading) {
        return <div className="mx-5 mt-10 text-center text-xl">Loading Dashboard...</div>;
    }
    
    if (isSystemError) {
        return <div className="mx-5 mt-10 text-center text-xl text-red-600">Error fetching data!</div>;
    }

    // console.log("topzone",topZoneData)
    return(
        <>
            <div className="mx-5">
                <Cardno2 data={systemData}/>
                <TwoGrpahCard graphdata={UsageTrendData} piedata={topZoneData}/>
                <CardServerData data={serverData}/>
            </div>
        </>
    );
}

export default SystemOverviewDashboard;