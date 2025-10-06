import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../../components/API";
import Cardno2 from "../../components/Cardno2";
import Cardno3 from "../../components/Cardno3";
import CardFull from "../../components/Cardno5";
import CardServerData from "../../components/CardServerData";



function SystemOverviewDashboard(){

    const location = useLocation();
    const [userData, setUserData] = useState([]);
    const [elderlyData, setElderlyData] = useState([]);
    const [deviceData, setDeviceyData] = useState([]);
    const [zoneData, setZoneData] = useState([]);
    const [serverData, setServerData] = useState([]);
    const [alertData, setAlertData] = useState([]);
    const [loading, setLoading] = useState(true);

    //ดึงข้อมูลหลังบ้าน
    const fetchSystemData = async () => {

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
                const userPromise = api.get('/users');
                const elderPromise = api.get('/elders');
                const devicePromise = api.get('/devices');
                const zonePromise = api.get('/zones');
                const serversPromise = api.get('/system/health/servers');
                const alertPromise = api.get('/system/alerts');

                const [userRes, elderRes, deviceRes, zoneRes, serverRes, alertRes] = await Promise.all([
                    userPromise, 
                    elderPromise,
                    devicePromise,
                    zonePromise,
                    serversPromise,
                    alertPromise 
                ]);

                setUserData(userRes.data);
                setElderlyData(elderRes.data);
                setDeviceyData(deviceRes.data);
                setZoneData(zoneRes.data);
                setServerData(serverRes.data);
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
             // 💡 เมื่อบันทึกเสร็จแล้ว ไม่ต้องเรียก fetchSystemData ที่นี่
             // เราจะให้ Component โหลดซ้ำด้วย dependency (location.state) แล้วค่อยเรียก
        }

        // 💡 เรียกใช้ฟังก์ชันดึงข้อมูลเมื่อ Component ถูกโหลด หรือเมื่อมีการอัปเดต Token
        fetchSystemData(); 
        
    }, [location.state]);
    //ดึงข้อมูลหลังบ้าน


    // console.log("userData: ",userData)
    // console.log("elderlyData: ",elderlyData)
    // console.log("deviceData: ",deviceData)
    // console.log("zoneData: ",zoneData)
    // console.log("serverData: ",serverData)
    // console.log("alertData: ",alertData)

    const SystemData = 
    [
        {value: zoneData.length ,name:"จำนวน Zone ที่ใช้งาน"},
        {value: (userData.length),name:"จำนวนผู้ใช้งานทั้งหมด"},
        {value: elderlyData.length ,name:"จำนวนผู้สูงอายุที่ลงทะเบียน"},
        {value: deviceData.length,name:"จำนวนอุปกรณ์ที่ลงทะเบียน"},
    ]

    if (loading) {
        return <div className="mx-5 mt-10 text-center text-xl">Loading Dashboard...</div>;
    }

    return(
        <>
            <div className="mx-5">
                <Cardno2 data={SystemData}/>
                <Cardno3/>
                <CardServerData data={serverData}/>
                <CardFull data={alertData}/>
            </div>
        </>
    );
}

export default SystemOverviewDashboard;