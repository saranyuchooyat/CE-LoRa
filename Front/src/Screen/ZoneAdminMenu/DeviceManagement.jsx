import { useState, useEffect, useMemo } from "react"; 
import MenuNameCard from "../../components/MainCardOption/MenuNameCard";
import FilterCard from "../../components/FilterCard";
import Cardno2 from "../../components/Cardno2";
import Cardno5 from "../../components/Cardno5";
import axios from "axios";
import CardLayouts from "../../components/CardLayouts";

function DeviceManagement(){

    const [deviceData, setDeviceData]= useState([]);
    // const [filters, setFilters] = useState(initialFilters);
    const [loading, setLoading] = useState(true);

    //ดึงข้อมูลหลังบ้าน
    const fetchDeviceData = async () => {
            try {
                const devicePromise = await axios.get("http://localhost:8080/devices");

                const [deviceRes] = await Promise.all([

                    devicePromise,
                ]);
                setDeviceData(deviceRes.data)

            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        fetchDeviceData();
    }, []);
    //ดึงข้อมูลหลังบ้าน


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
                onButtonClick={true}
                detail={false}
                buttonText="เพิ่มอุปกรณ์ใหม่"/>
                
                <Cardno2 data={deviceStatusData}/>

                <FilterCard
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

                <CardLayouts data="device"/>

            </div>

        </>
    );

}

export default DeviceManagement;