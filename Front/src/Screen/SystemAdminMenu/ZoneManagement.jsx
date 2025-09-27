import { useState, useEffect, useMemo } from "react"; 
import MenuNameCard from "../../components/MenuNameCard";
import FilterCard from "../../components/FilterCard";
import axios from "axios";
import Cardno5 from "../../components/Cardno5";

const initialFilters = {
    search: '', // สำหรับช่องค้นหา ชื่อ, อีเมล, เบอร์โทร
    province: 'ทั้งหมด', // สำหรับ Role (option2Name)
    status: 'ทั้งหมด' // สำหรับ Status (option1Name)
};

function ZoneManagement(){

    const [zoneData, setZoneData] = useState([]);
    const [filters, setFilters] = useState(initialFilters); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

        fetchZoneData();
    }, []);


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

    if (loading) {
        return <div className="mx-5 mt-10 text-center text-xl">Loading Dashboard...</div>;
    }

    return(
        <>
            <div className="mx-5">
                <MenuNameCard
                title="จัดการ zone พื้นที่"
                description="ระบบจัดการพื้นที่ใช้งาน Smart Healthcare System"
                buttonText="เพิ่ม Zone"/>

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

export default ZoneManagement;