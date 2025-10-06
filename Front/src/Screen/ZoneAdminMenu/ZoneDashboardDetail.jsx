import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../../components/API';
import MenuNameCard from "../../components/MainCardOption/MenuNameCard";
import MenuNameCard2 from '../../components/MainCardOption/MenuNameCard2';
import Cardno8 from '../../components/Cardno8';
import Cardno9 from '../../components/Cardno9';
import Cardno5 from '../../components/Cardno5';


function ZoneDashboardDetail (){

    const { zoneid } = useParams();
    const [zoneData, setZoneData] = useState([]);
    const [alertData, setAlertData] = useState([]);
    const [zoneDetail, setZoneDetail] = useState(null); // 💡 เปลี่ยนค่าเริ่มต้นเป็น null
    const [loading, setLoading] = useState(true); // 💡 เพิ่ม loading state
    
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
            const [zoneRes, alertRes] = await Promise.all([
                api.get('/zones/my-zones'),
                api.get('/system/alerts')
            ]);
            setZoneData(zoneRes.data);
            setAlertData(alertRes.data);

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
    
    console.log("zone",zoneData)

    useEffect(() => {
        fetchZoneData();
    }, [zoneid]); // 💡 ให้รัน fetchZoneData ใหม่เมื่อ zoneid เปลี่ยน


    useEffect(() => {
        // 💡 รัน Logic ค้นหา เมื่อ zoneData เปลี่ยนแปลง
        if (zoneData.length > 0) {
            
            const foundZone = zoneData.find(card => card.zoneid === Number(zoneid));
            
            if (foundZone) {
                setZoneDetail(foundZone);
            } else {
                console.warn(`Zone ID: ${zoneid} not found.`);
                setZoneDetail(null);
            }
            
            setLoading(false); // เมื่อค้นหาเสร็จสิ้น ค่อยตั้งค่า loading เป็น false
        }
    }, [zoneData, zoneid]); // 💡 ให้รันเมื่อ zoneData หรือ zoneid เปลี่ยน



    if (loading) {
        return <div className="p-5 text-center text-xl">Loading Zone Details...</div>;
    }
    
    if (!zoneDetail) {
        return <div className="p-5 text-center text-red-500">Error: Zone ID "{zoneid}" not found or data failed to load.</div>;
    }
    
    console.log("zone",zoneDetail)
    return(
        <>
            <div className="mx-5">
                <MenuNameCard
                title={`${zoneDetail.zonename}`}
                description="Zone Admin Dashboard"
                onButtonClick={false}
                detail="2/2"
                buttonText="จำนวนพื้นที่ที่ผู้ใช้งานดูแล"/>

                <MenuNameCard2
                title={`${zoneDetail.activeuser}`}
                description="จำนวนผู้สูงอายุทั้งหมด"/>

                <Cardno8 data={alertData}/>
                <Cardno5 data={alertData}/>
                <Cardno9 data={zoneDetail.zonename}/>
            </div>
        </>
    );

}

export default ZoneDashboardDetail;