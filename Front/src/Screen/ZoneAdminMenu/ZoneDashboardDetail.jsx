import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useQueries } from "@tanstack/react-query";
import api from '../../components/API';
import MenuNameCard from "../../components/MainCardOption/MenuNameCard";
import MenuNameCard2 from '../../components/MainCardOption/MenuNameCard2';
import Cardno8 from '../../components/Cardno8';
import Cardno9 from '../../components/Cardno9';
import Cardno5 from '../../components/Cardno5';


function ZoneDashboardDetail (){

    const { zoneid } = useParams();
    const location = useLocation();


    //ดึงข้อมูลหลังบ้าน
    const zoneDashboardQueries = useQueries({
        queries: [
            { queryKey: ['zoneDashboard'], queryFn: () => api.get(`/zones/${zoneid}/dashboard`).then(res => res.data) },
        ],
    });

    const isDashboardLoading = zoneDashboardQueries.some(query => query.isLoading);
    const isDashboardError = zoneDashboardQueries.some(query => query.isError);

    const zoneDashboard = zoneDashboardQueries[0].data || [];


    useEffect(() => {
        const tokenInStorage = localStorage.getItem('token');
        if (location.state?.token && location.state.token !== tokenInStorage) {
             localStorage.setItem('token', location.state.token);
             // 💡 เมื่อบันทึก Token ใหม่แล้ว React Query จะทำการ Refetch ให้อัตโนมัติ
             // เนื่องจากทุก Query จะถูก Trigger เมื่อ Token ถูกบันทึกและ Component Rerender
        }
    }, [location.state]);
    //ดึงข้อมูลหลังบ้าน

    console.log("ZoneData",zoneDashboard)

    if (isDashboardLoading || !zoneid) { // ตรวจสอบ isLoading และ zoneid
        return <div className="mx-5 mt-10 text-center text-xl">Loading Zone Dashboard...</div>;
    }
    
    if (isDashboardError) {
        return <div className="mx-5 mt-10 text-center text-xl text-red-600">Error fetching data: {error.message}</div>;
    }

    if (!zoneDashboard || Object.keys(zoneDashboard).length === 0) {
        return <div className="mx-5 mt-10 text-center text-xl text-red-600">Zone ID "{zoneid}" not found.</div>;
    }



    // 💡 สมมติ Key ที่จำเป็นสำหรับ MenuNameCard
    const { alerts, deviceStatus, elderlyCount, elders, zone } = zoneDashboard;

    const allAlertDetail = alerts;
    // console.log("alert",allAlertDetail)


    const allDeviceStatus = deviceStatus;


    const allEldery = elders


    const zoneDetail = zone;


    return(
        <>
            <div className="mx-5">
                <MenuNameCard
                    title={zoneDetail?.name || "Zone Detail"}
                    description={"Zone Admin Dashboard"}
                    onButtonClick={false}
                    detail="2/2"
                    buttonText="จำนวนพื้นที่ที่ผู้ใช้งานดูแล"
                />

                <MenuNameCard2
                    title={zoneDetail?.activeUsers}
                    description="จำนวนผู้สูงอายุทั้งหมด"
                />
                
                <Cardno5 data={allAlertDetail}/>
                <Cardno8 data={allDeviceStatus}/>
                <Cardno9 data=""/>
            </div>
        </>
    );
}

export default ZoneDashboardDetail;