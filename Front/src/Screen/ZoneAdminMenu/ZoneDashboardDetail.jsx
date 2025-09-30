import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MenuNameCard from "../../components/MainCardOption/MenuNameCard";
import MenuNameCard2 from '../../components/MainCardOption/MenuNameCard2';
import Cardno8 from '../../components/Cardno8';
import Cardno9 from '../../components/Cardno9';
import Cardno5 from '../../components/Cardno5';
import axios from "axios";


function ZoneDashboardDetail (){

    const { zoneid } = useParams();
    const [zoneData, setZoneData] = useState([]);
    const [alertData, setAlertData] = useState([]);
    const [zoneDetail, setZoneDetail] = useState(null); // 💡 เปลี่ยนค่าเริ่มต้นเป็น null
    const [loading, setLoading] = useState(true); // 💡 เพิ่ม loading state
    
    const fetchZoneData = async () => {
        setLoading(true);
        try {
            // 💡 ถ้า API ของคุณรองรับการค้นหาตาม ID ควรใช้:
            // const zoneRes = await axios.get(`http://localhost:8080/zones/${zoneid}`);
            // setZoneDetail(zoneRes.data);
            
            // 💡 แต่ถ้า API ดึงข้อมูลมาทั้งหมดก่อน (ตามโค้ดเดิม):
            const zonePromise = await axios.get("http://localhost:8080/zones");
            const alertPromise = await axios.get("http://localhost:8080/system/alerts");

            const [zoneRes, alertRes] = await Promise.all([
                    zonePromise,
                    alertPromise 
                    
                ]);
            setZoneData(zoneRes.data);
            setAlertData(alertRes.data);

        } catch (error) {
            console.error("Error fetching zone data:", error);
            setZoneDetail(null); // ตั้งเป็น null หากเกิด Error
        } finally {
            // 🛑 ลบ setLoading(false) ออกจากที่นี่ เพราะต้องรอ FindZoneDataByzoneid ทำงานก่อน
        }
    };
    
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