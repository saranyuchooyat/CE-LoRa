import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
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
    const [zoneData, setZoneData] = useState([]);
    const [filters, setFilters] = useState(initialFilters);
    const [loading, setLoading] = useState(true);

    //ดึงข้อมูลหลังบ้าน
    const fetchZoneData = async () => {
        // 1. ตรวจสอบว่า Token พร้อมใน LocalStorage แล้ว
        const tokenInStorage = localStorage.getItem('token');
        const tokenInState = location.state?.token;

        if (!tokenInStorage && !tokenInState) {
            console.error("No authentication context found. Please log in.");
            setLoading(false);
            return;
        }

        // 2. ถ้ามี Token ใน Storage แล้ว (ไม่ว่าจะมาจาก state หรือ Refresh) ให้เริ่มดึงข้อมูล
        try {
            setLoading(true);
            
            // 💡 ถ้าคุณใช้ Promise.all ให้ใช้ตามนี้ (เพื่อความรวดเร็ว)
            const [zoneRes] = await Promise.all([
                api.get('/zones/my-zones'),
            ]);
            setZoneData(zoneRes.data);

        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const tokenInStorage = localStorage.getItem('token');

        // สำคัญ: บันทึก Token จาก State ลง Storage ถ้าเพิ่งมาจากหน้า Login
        if (location.state?.token && location.state.token !== tokenInStorage) {
             localStorage.setItem('token', location.state.token);
             // 💡 เมื่อบันทึกเสร็จแล้ว ไม่ต้องเรียก fetchZoneData ที่นี่
             // เราจะให้ Component โหลดซ้ำด้วย dependency (location.state) แล้วค่อยเรียก
        }

        // 💡 เรียกใช้ฟังก์ชันดึงข้อมูลเมื่อ Component ถูกโหลด หรือเมื่อมีการอัปเดต Token
        fetchZoneData(); 
        
    }, [location.state]);
    //ดึงข้อมูลหลังบ้าน

    console.log("my-zone",zoneData)

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
                detail={zoneData.length}
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