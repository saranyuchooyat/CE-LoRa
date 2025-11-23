/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/API";
import MenuNameCard from "../../components/MainCardOption/MenuNameCard";
import CardFilter from "../../components/Card/CardFilter";
import CardFull from "../../components/Card/Cardno5";


//กำหนดตัวแปรแต่ละช่อง Filter
const initialFilters = {
  search: "", // สำหรับช่องค้นหา ชื่อ, อีเมล, เบอร์โทร
  province: "ทั้งหมด", // สำหรับ Role (option2Name)
  status: "ทั้งหมด", // สำหรับ Status (option1Name)
};
//กำหนดตัวแปรแต่ละช่อง Filter

function ZoneDashboard(){

    const location = useLocation();

    const [filters, setFilters] = useState(initialFilters);


    //ดึงข้อมูลหลังบ้าน
    const zoneQueries = useQueries({
        queries: [
        { queryKey: ['zones'], queryFn: () => api.get('/zones/my-zones').then(res => res.data) },
        ],
    });

    const isSystemLoading = zoneQueries.some(query => query.isLoading);
    const isSystemError = zoneQueries.some(query => query.isError);
    
    const zoneData = zoneQueries[0].data || [];

    useEffect(() => {
        const tokenInStorage = localStorage.getItem('token');
        if (location.state?.token && location.state.token !== tokenInStorage) {
            localStorage.setItem('token', location.state.token);
        }
    }, [location.state]);


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
        let data = zoneData; 

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
    }, [zoneData, filters]);
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
                detail={zoneQueries.length}
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