import { useState, useEffect, useMemo } from "react"; 
import MenuNameCard from "../../components/MainCardOption/MenuNameCard";
import FilterCard from "../../components/FilterCard";
import Cardno5 from "../../components/Cardno5";
import CardLayouts from "../../components/CardLayouts";
import axios from "axios";


const initialFilters = {
    search: '', // สำหรับช่องค้นหา ชื่อ, อีเมล, เบอร์โทร
    province: 'ทั้งหมด', // สำหรับ Role (option2Name)
    status: 'ทั้งหมด' // สำหรับ Status (option1Name)
};

function ZoneDashboard(){

    const [zoneData, setZoneData] = useState([]);
    const [filters, setFilters] = useState(initialFilters);
    const [loading, setLoading] = useState(true);

    //ดึงข้อมูลหลังบ้าน
    const fetchZoneData = async () => {
            try {
                const zonePromise = await axios.get("http://localhost:8080/zones");

                const [zoneRes] = await Promise.all([

                    zonePromise,
                ]);
                setZoneData(zoneRes.data)

            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        fetchZoneData();
    }, []);
    //ดึงข้อมูลหลังบ้าน


    //ระบบ filter
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
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
            data = data.filter(zone => {
                
                // 1. การค้นหาด้วย ID (ต้องแปลงเป็น String ก่อน)
                const zoneIdSearch = zone.zoneid ? String(zone.zoneid).includes(lowerSearch) : false;
                
                // 2. การค้นหาด้วยชื่อและรหัส (ป้องกันค่าเป็น null/undefined ก่อนเรียก toLowerCase)
                const nameSearch = zone.zonename && zone.zonename.toLowerCase().includes(lowerSearch);
                const addressSearch = zone.address && zone.address.toLowerCase().includes(lowerSearch);

                // รวมผลลัพธ์การค้นหาทั้งหมด
                return zoneIdSearch || nameSearch || addressSearch;
            });
        }

        if (province && province !== 'ทั้งหมด') {
            data = data.filter(zone => zone.Province === province);
        }

        if (status && status !== 'ทั้งหมด') {
            data = data.filter(zone => zone.Status === status);
        }  

        return data;
    }, [zoneData, filters]);
    //ระบบ filter

    if (loading) {
        return <div className="mx-5 mt-10 text-center text-xl">Loading Dashboard...</div>;
    }

    return(
        <>
            <div className="mx-5">
                <MenuNameCard
                title="ภาพรวม  Zone (พื้นที่)"
                description="ระบบดูข้อมูลภาพรวมพื้นที่ใช้งาน Smart Healthcare System"
                onButtonClick={false}
                detail="2/2"
                buttonText="จำนวนพื้นที่ที่ผู้ใช้งานดูแล"/>

                <FilterCard
                name="Zone"
                placeholderName=" ชื่อ zone, รหัส zone, หรือที่อยู่"
                option1Name="สถานะ"
                option2Name="จังหวัด"
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
                option2Key="province"
                />
                <Cardno5 data={filteredZones}/>
            </div>
        </>
    );
}

export default ZoneDashboard;