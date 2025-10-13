import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/API";
import MenuNameCard from "../../components/MainCardOption/MenuNameCard";
import CardFilter from "../../components/CardFilter";
import CardFull from "../../components/Cardno5";


const initialFilters = {
    search: '', // สำหรับช่องค้นหา ชื่อ, อีเมล, เบอร์โทร
    province: 'ทั้งหมด', // สำหรับ Role (option2Name)
    status: 'ทั้งหมด' // สำหรับ Status (option1Name)
};

function ZoneDashboard(){

    const location = useLocation();
    const [filters, setFilters] = useState(initialFilters);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    //ดึงข้อมูลหลังบ้าน
    const ZoneQueries = useQueries({
        queries: [
        { queryKey: ['zones'], queryFn: () => api.get('/zones/my-zones').then(res => res.data) },
        ],
    });

    const isSystemLoading = ZoneQueries.some(query => query.isLoading);
    const isSystemError = ZoneQueries.some(query => query.isError);

    useEffect(() => {
        const tokenInStorage = localStorage.getItem('token');
        if (location.state?.token && location.state.token !== tokenInStorage) {
            localStorage.setItem('token', location.state.token);
            // 💡 เมื่อบันทึก Token ใหม่แล้ว React Query จะทำการ Refetch ให้อัตโนมัติ
            // เนื่องจากทุก Query จะถูก Trigger เมื่อ Token ถูกบันทึกและ Component Rerender
        }
    }, [location.state]);

    const zoneQueryResult = ZoneQueries[0];
    //ดึงข้อมูลหลังบ้าน

    //ระบบ filter
    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
        ...prev,
        [key]: value,
        }));
    };

    const handleClearFilters = () => {
        setFilters(initialFilters);
    };

    const filteredZones = useMemo(() => {
        const { search, province, status } = filters;
        let data = zoneQueryResult.data || []; 

        // กรองตามช่องค้นหา (Search)
        if (search) {
        const lowerSearch = search.toLowerCase();
        data = data.filter((zone) => {
            // 1. การค้นหาด้วย ID (ต้องแปลงเป็น String ก่อน)
            const zoneIdSearch = zone.zoneid
            ? String(zone.zoneid).includes(lowerSearch)
            : false;

            // 2. การค้นหาด้วยชื่อและรหัส (ป้องกันค่าเป็น null/undefined ก่อนเรียก toLowerCase)
            const nameSearch =
            zone.zonename && zone.zonename.toLowerCase().includes(lowerSearch);
            const addressSearch =
            zone.address && zone.address.toLowerCase().includes(lowerSearch);

            // รวมผลลัพธ์การค้นหาทั้งหมด
            return zoneIdSearch || nameSearch || addressSearch;
        });
        }

        if (province && province !== "ทั้งหมด") {
        data = data.filter((zone) => zone.Province === province);
        }

        if (status && status !== "ทั้งหมด") {
        data = data.filter((zone) => zone.Status === status);
        }

        return data;
    }, [zoneQueryResult.data, filters]);
    //ระบบ filter

    if (isSystemLoading) {
        return <div className="mx-5 mt-10 text-center text-xl">Loading Dashboard...</div>;
    }
        
    if (isSystemError) {
        return <div className="mx-5 mt-10 text-center text-xl text-red-600">Error fetching data!</div>;
    }

    return(
        <>
            <div className="mx-5">
                <MenuNameCard
                title="ภาพรวม  Zone (พื้นที่)"
                description="ระบบดูข้อมูลภาพรวมพื้นที่ใช้งาน Smart Healthcare System"
                onButtonClick={false}
                detail={ZoneQueries.length}
                buttonText="จำนวนพื้นที่ที่ผู้ใช้งานดูแล => "/>

                <CardFilter
                name="Zone"
                placeholderName=" ชื่อ zone, รหัส zone, หรือที่อยู่"
                option1Name="สถานะ"
                option2Name="จังหวัด"
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
                option2Key="province"
                />
                <CardFull data={filteredZones}/>
            </div>
        </>
    );
}

export default ZoneDashboard;