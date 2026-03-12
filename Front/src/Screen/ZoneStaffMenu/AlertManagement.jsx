import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/API";
import MenuNameCard2 from "../../components/MainCardOption/MenuNameCard2";
import Cardno2 from "../../components/Card/Cardno2";
import CardFull from "../../components/Card/Cardno5";
import CardFilter from "../../components/Card/CardFilter";

function AlertManagement() {

    const location = useLocation();

     // 1. ดึงข้อมูล Zone พื้นฐาน
    const zoneQueries = useQueries({
        queries: [
            { 
                queryKey: ['zoneData'], 
                queryFn: () => api.get(`/zones/my-zones`).then(res => res.data) 
            },
        ],
    });

    const isZoneLoading = zoneQueries[0].isLoading;
    const isZoneError = zoneQueries[0].isError;
    const zoneData = zoneQueries[0].data || [];

    // 2. สกัด Zone ID (ใช้ Optional Chaining เพื่อความปลอดภัย)
    const currentZoneId = zoneData[0]?.zone_id || null;

    const AlertQueries = useQueries({
        queries: [
            { 
                queryKey: ['zoneDashboardData', currentZoneId], 
                queryFn: () => api.get(`/zones/${currentZoneId}/dashboard`).then(res => res.data),
                enabled: !!currentZoneId 
            },
        ],
    });
    const zoneDashboardData = AlertQueries[0].data || null;
    const isDashLoading = AlertQueries[0].isLoading;

    useEffect(() => {
        const tokenInStorage = localStorage.getItem('token');
        if (location.state?.token && location.state.token !== tokenInStorage) {
            localStorage.setItem('token', location.state.token);
        }
    }, [location.state]);
    //ดึงข้อมูลหลังบ้าน

    console.log(zoneData)

    const { alerts, deviceStatus, elders, zone } = zoneDashboardData || {};
    const allAlertDetail = alerts;

    const [showCriticalOnly, setShowCriticalOnly] = useState(false);

    // กรอง alert เฉพาะ critical ถ้ากดปุ่ม
    const filteredAlerts = useMemo(() => {
        if (!Array.isArray(allAlertDetail)) return [];
        return showCriticalOnly
            ? allAlertDetail.filter(a => a.type === 'critical')
            : allAlertDetail;
    }, [allAlertDetail, showCriticalOnly]);


    console.log(allAlertDetail)
    const CardNo2Data =[
        {
            name: "ฉุกเฉิน",
            value: isDashLoading ? "..." : `${alerts.filter(item => item.type === 'critical').length} รายการ`
        },
        {
            name: "เผ้าระวัง",
            value: isDashLoading ? "..." : `${alerts.filter(item => item.type === 'warning').length} รายการ`
        },
        {
            name: "ข้อมูล",
            value: isDashLoading ? "..." : `${alerts.filter(item => item.type === 'data').length} รายการ`
        }
    ]

    if (isZoneLoading) return <div className="text-center mt-10">กำลังโหลดข้อมูลพื้นที่...</div>;
    if (isZoneError) return <div className="text-center mt-10 text-red-500">เกิดข้อผิดพลาดในการดึงข้อมูลโซน</div>;

    return(
        <>
            <div className="mx-5">
                <MenuNameCard2
                    title="จัดการการแจ้งเตือน"
                    description= {`${zoneData[0]?.zone_name} : ${zoneData[0]?.address}`}
                    buttonText={showCriticalOnly ? "แสดงทั้งหมด" : "ดูรายการฉุกเฉินทั้งหมด"}
                    onButtonClick={() => setShowCriticalOnly(v => !v)}
                />
                <Cardno2
                    data ={CardNo2Data}
                />
                <CardFull
                    data={filteredAlerts}
                />
            </div>
        </>
    );

}
export default AlertManagement;