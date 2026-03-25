/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import api from "../../components/API";
import MenuNameCard from "../../components/MainCardOption/MenuNameCard";
import CardFilter from "../../components/Card/CardFilter";
import DataTableCard from "../../components/Card/DataTableCard";

const initialFilters = {
    search: "", 
    province: "ทั้งหมด", 
    status: "ทั้งหมด", 
};

function ZoneDashboard(){
    const location = useLocation();
    const [filters, setFilters] = useState(initialFilters);

    const zoneQueries = useQueries({
        queries: [
            { 
                queryKey: ['zones'], 
                queryFn: () => api.get('/zones/my-zones').then(res => res.data),
                retry: false 
            },
        ],
    });

    const isSystemLoading = zoneQueries.some(query => query.isLoading);
    const isSystemError = zoneQueries.some(query => query.isError);
    
    const zoneData = zoneQueries[0].data || [];

    useEffect(() => {
        const tokenInStorage = sessionStorage.getItem('token');
        if (location.state?.token && location.state.token !== tokenInStorage) {
            sessionStorage.setItem('token', location.state.token);
        }
    }, [location.state]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => {
        setFilters(initialFilters);
    };

    const filteredZones = useMemo(() => {
        const { search, province, status } = filters;
        let data = zoneData; 

        if (search) {
            const lowerSearch = search.toLowerCase();
            data = data.filter((zone) => {
                const zoneIdSearch = zone.zone_id ? String(zone.zone_id).toLowerCase().includes(lowerSearch) : false;
                const nameSearch = zone.zone_name && zone.zone_name.toLowerCase().includes(lowerSearch);
                const addressSearch = zone.address && zone.address.toLowerCase().includes(lowerSearch);
                return zoneIdSearch || nameSearch || addressSearch;
            });
        }

        if (province && province !== "ทั้งหมด") {
            data = data.filter((zone) => zone.Province === province);
        }

        // ✅ อัปเกรด: ป้องกันบั๊กกรณี Status ใน DB พิมพ์เล็ก-ใหญ่ไม่ตรงกัน
        if (status && status !== "ทั้งหมด") {
            data = data.filter((zone) => zone.status && zone.status.toLowerCase() === status.toLowerCase());
        }

        return data;
    }, [zoneData, filters]);

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
                    title="ภาพรวม Zone (พื้นที่)"
                    description="ระบบดูข้อมูลภาพรวมพื้นที่ใช้งาน Smart Healthcare System"
                    onButtonClick={false}
                    // ✅ แก้ไข: ดึงจำนวนมาจากข้อมูลโซนจริงๆ ไม่ใช่จากจำนวน Query
                    detail={filteredZones.length + " พื้นที่"} 
                    buttonText="จำนวนพื้นที่ที่ผู้ใช้งานดูแล => "
                />

                <CardFilter
                    name="Zone"
                    placeholderName=" ชื่อ zone, รหัส zone, หรือที่อยู่"
                    option1Name="สถานะ"
                    option2Name={null}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClear={handleClearFilters}
                    option2Key="province"
                />
                
                <DataTableCard data={filteredZones} showActions={false}/>
            </div>
        </>
    );
}

export default ZoneDashboard;