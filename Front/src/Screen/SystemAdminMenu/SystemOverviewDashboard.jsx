import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../../components/API";
import Cardno2 from "../../components/Cardno2";
import Cardno3 from "../../components/Cardno3";
import Cardno5 from "../../components/Cardno5";
import Cardno7 from "../../components/Cardno7";



function SystemOverviewDashboard(){

    const location = useLocation();
    const [userData, setUserData] = useState([]);
    const [elderlyData, setElderlyData] = useState([]);
    const [deviceData, setDeviceyData] = useState([]);
    const [zoneData, setZoneData] = useState([]);
    const [serverData, setServerData] = useState([]);
    const [alertData, setAlertData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. ตรวจสอบว่า Token พร้อมใน LocalStorage แล้ว
        const tokenInStorage = localStorage.getItem('token');
        
        // 2. ถ้าไม่มี token ใน storage, และไม่มี token ถูกส่งมาใน state (การเข้ามาตรงๆ) ให้ออกไป
        if (!tokenInStorage && !location.state?.token) {
            console.error("No authentication context found. Please log in.");
            setLoading(false);
            // *ในแอปจริง ควร navigate ไปหน้า /login ที่นี่*
            return;
        }

        // 3. (สำคัญสำหรับครั้งแรก) ถ้า Token ถูกส่งมาใน state จากหน้า Login 
        // ให้บันทึกมันก่อนเรียก API
        if (location.state?.token && location.state.token !== tokenInStorage) {
             localStorage.setItem('token', location.state.token);
        }
        
        // 4. ถ้ามี Token ใน Storage แล้ว (ไม่ว่าจะมาจาก state หรือ Refresh) ให้เริ่มดึงข้อมูล
        if (tokenInStorage || location.state?.token) {
            const fetchAllData = async () => {
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
            fetchAllData();
        }

    // 💡 ให้ useEffect รันซ้ำเมื่อ state เปลี่ยน (จาก login)
    // หรือเมื่อ localStorage ถูกอัปเดต (ถ้าคุณใช้ library ที่ติดตาม localStorage)
    // สำหรับกรณีนี้ ให้ใช้ location.state เป็น dependency
    }, [location.state]);


    console.log("userData: ",userData)
    console.log("elderlyData: ",elderlyData)
    console.log("deviceData: ",deviceData)
    console.log("zoneData: ",zoneData)
    console.log("serverData: ",serverData)
    console.log("alertData: ",alertData)

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
                <Cardno7 data={serverData}/>
                <Cardno5 data={alertData}/>
            </div>
        </>
    );
}

export default SystemOverviewDashboard;