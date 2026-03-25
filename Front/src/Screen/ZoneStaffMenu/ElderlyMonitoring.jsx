import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/API";
import MenuNameCard from "../../components/MainCardOption/MenuNameCard";
import SummaryCard from "../../components/Card/SummaryCard";
import DataTableCard from "../../components/Card/DataTableCard";
import CardFilter from "../../components/Card/CardFilter";

const initialFilters ={
    search:"",
    status: "ทั้งหมด"
};

function ElderlyMonitoring() {

    const location = useLocation();
    const [filters, setFilters] = useState(initialFilters);

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

    


    // 3. ดึงข้อมูล Elders และ Dashboard โดยใช้ Dependent Queries
    const detailQueries = useQueries({
        queries: [
            { 
                queryKey: ['eldersData', currentZoneId], 
                queryFn: () => api.get(`/zones/${currentZoneId}/elder`).then(res => res.data),
                enabled: !!currentZoneId 
            },
            { 
                queryKey: ['zoneDashboardData', currentZoneId], 
                queryFn: () => api.get(`/zones/${currentZoneId}/dashboard`).then(res => res.data),
                enabled: !!currentZoneId 
            },
        ],
    });

    const eldersData = detailQueries[0].data || [];
    const isEldersLoading = detailQueries[0].isLoading;
    
    const zoneDashboardData = detailQueries[1].data || null;
    const isDashLoading = detailQueries[1].isLoading;

    // 4. จัดการ Token
    useEffect(() => {
        const tokenInStorage = sessionStorage.getItem('token');
        if (location.state?.token && location.state.token !== tokenInStorage) {
            sessionStorage.setItem('token', location.state.token);
        }
    }, [location.state]);
    //ดึงข้อมูลหลังบ้าน

    //ระบบ Filter
    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
        ...prev,
        [key]: value,
        }));
    };

    const handleClearFilters = () => {
        setFilters(initialFilters);
    };

    const filteredElderly = useMemo(() =>{
        const { search, status} = filters;
        let data = eldersData;

        // กรองตามช่องค้นหา
        if(search){
            const lowerSearch = search.toLowerCase();
            data = data.filter((elder) => {
                const elderIdSearch = elder.elder_id ? String(elder.elder_id).includes(lowerSearch) : false;
                const nameSearch = (elder.first_name || elder.last_name) ? `${elder.first_name} ${elder.last_name}`.toLowerCase().includes(lowerSearch) : false;
                const addressSearch = elder.address && elder.address.toLowerCase().includes(lowerSearch);
                return elderIdSearch || nameSearch || addressSearch;
            });
        }

        if(status && status !== "ทั้งหมด"){
            data = data.filter((elder) => elder.health_status === status);
        }

        return data;
    }, [eldersData, filters]);

    const { alerts, deviceStatus, elders, zone } = zoneDashboardData || {};

    const allAlertDetail = alerts;
    
    const allDeviceStatus = deviceStatus;

    // นับจำนวน critical alert
    const criticalAlertCount = Array.isArray(alerts)
        ? alerts.filter(a => a.type === 'critical').length
        : 0;

    const CardNo2Data = [
        {
            name: zoneData[0]?.zone_address ? `ที่อยู่โซน: ${zoneData[0]?.zone_address}` : "ชื่อโซน (ไม่พบข้อมูล)",
            value: zoneData[0]?.zone_name || (isZoneLoading ? "กำลังโหลด..." : "ไม่พบข้อมูล")
        },
        {
            name: "จำนวนผู้สูงอายุในโซน",
            value: isEldersLoading ? "..." : `${eldersData.length} คน`
        },
        {
            name: "อุปกรณ์ที่เชื่อมต่อทั้งหมด",
            value: isDashLoading ? "..." : `${allDeviceStatus?.total || 0} ชิ้น`
        },
        {
            name: "แจ้งเตือนวิกฤต (Critical Alert)",
            value: isDashLoading ? "..." : `${criticalAlertCount} รายการ`
        }
    ];

    if (isZoneLoading) return <div className="text-center mt-10">กำลังโหลดข้อมูลพื้นที่...</div>;
    if (isZoneError) return <div className="text-center mt-10 text-red-500">เกิดข้อผิดพลาดในการดึงข้อมูลโซน</div>;

    return (
        <div className="mx-5">
            <MenuNameCard 
                title="ติดตามข้อมูลผู้สูงอายุ"
                detail={false}
                
            />

            {/* แสดงการ์ดสรุปข้อมูล 3 ชุด */}
            <SummaryCard data={CardNo2Data} />

            <CardFilter
                name="Elder"
                placeholderName="ชื่อผู้สูงอายุ, รหัสผู้สูงอายุ, ที่อยู่"
                option1Name="สถานะ"
                option2Name={null}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
                option2Key="Elder"
            />

            <DataTableCard
                data={filteredElderly}
                showActions={false}
            />
        </div>
    );
}

export default ElderlyMonitoring;