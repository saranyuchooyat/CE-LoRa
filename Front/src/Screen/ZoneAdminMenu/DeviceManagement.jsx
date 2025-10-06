import { useState, useEffect} from "react"; 
import api from "../../components/API";
import MenuNameCard from "../../components/MainCardOption/MenuNameCard";
import CardFilter from "../../components/CardFilter";
import Cardno2 from "../../components/Cardno2";
import CardLayouts from "../../components/CardLayouts";

function DeviceManagement(){

    const [deviceData, setDeviceData]= useState([]);
    // const [filters, setFilters] = useState(initialFilters);
    const [loading, setLoading] = useState(true);

    //ดึงข้อมูลหลังบ้าน
    const fetchDeviceData = async () => {
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
            const [deviceRes] = await Promise.all([
                api.get('/devices'),
            ]);
            setDeviceData(deviceRes.data);

        } catch (error) {
            console.error("Error fetching device data:", error);
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
        fetchDeviceData(); 
        
    }, [location.state]);
    //ดึงข้อมูลหลังบ้าน

    console.log("Device:",deviceData)

    // //ระบบ filter
    // const handleFilterChange = (key, value) => {
    //     setFilters(prev => ({
    //         ...prev,
    //         [key]: value
    //     }));
    // };

    // const handleClearFilters = () => {
    //     setFilters(initialFilters);
    // };

    // const filteredZones = useMemo(() => {
    //     const { search, province, status } = filters;
    //     let data = zoneData;

    //     // กรองตามช่องค้นหา (Search)
    //     if (search) {
    //         const lowerSearch = search.toLowerCase();
    //         data = data.filter(zone => {
                
    //             // 1. การค้นหาด้วย ID (ต้องแปลงเป็น String ก่อน)
    //             const zoneIdSearch = zone.zoneid ? String(zone.zoneid).includes(lowerSearch) : false;
                
    //             // 2. การค้นหาด้วยชื่อและรหัส (ป้องกันค่าเป็น null/undefined ก่อนเรียก toLowerCase)
    //             const nameSearch = zone.zonename && zone.zonename.toLowerCase().includes(lowerSearch);
    //             const addressSearch = zone.address && zone.address.toLowerCase().includes(lowerSearch);

    //             // รวมผลลัพธ์การค้นหาทั้งหมด
    //             return zoneIdSearch || nameSearch || addressSearch;
    //         });
    //     }

    //     if (province && province !== 'ทั้งหมด') {
    //         data = data.filter(zone => zone.Province === province);
    //     }

    //     if (status && status !== 'ทั้งหมด') {
    //         data = data.filter(zone => zone.Status === status);
    //     }  

    //     return data;
    // }, [zoneData, filters]);
    // //ระบบ filter

    //ระบบกรองสถานะอุปกรณ์
    const deviceStatusCount = deviceData.reduce((acc,device) => {
    const status = device.status;
    acc[status] = (acc[status] || 0)+1;
    console.log("acc",acc)
    return acc
    }, {});

    const deviceStatusList = Object.entries(deviceStatusCount).map(([status, count]) => {
        return {
            name: status, 
            value: count
        }
        
    })

    const totalDevicesObject = {name: "อุปกรณ์ทั้งหมด", value: deviceData.length}

    const deviceStatusData = [
        totalDevicesObject,
        ...deviceStatusList
    ];
    //ระบบกรองสถานะอุปกรณ์

    

    if (loading) {
        return <div className="mx-5 mt-10 text-center text-xl">Loading Dashboard...</div>;
    }

    return(
        <>
            <div className="mx-5">
                <MenuNameCard
                title="จัดการอุปกรณ์ Smart Healthcare ภายในพื้นที่"
                description=""
                onButtonClick="A"
                detail={false}
                buttonText="เพิ่มอุปกรณ์ใหม่"/>
                
                <Cardno2 data={deviceStatusData}/>

                <CardFilter
                name="อุปกรณ์"
                placeholderName="รหัสอุปกรณ์, ชื่อรุ่นอุปกรณ์"
                option1Name="สถานะ"
                option2Name="ประเภท"
                // filters={filters}
                // onFilterChange={handleFilterChange}
                // onClear={handleClearFilters}
                filters={false}
                onFilterChange={false}
                onClear={false}
                option2Key="province"
                />

                <CardLayouts
                name="device"
                data={deviceData}/>

            </div>

        </>
    );

}

export default DeviceManagement;