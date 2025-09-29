import { useState, useEffect } from "react";
import Cardno2 from "../../components/Cardno2";
import Cardno3 from "../../components/Cardno3";
import Cardno5 from "../../components/Cardno5";
import Cardno7 from "../../components/Cardno7";
import axios from "axios";


function SystemOverviewDashboard(){

    const [userData, setUserData] = useState([]);
    const [elderlyData, setElderlyData] = useState([]);
    const [deviceData, setDeviceyData] = useState([]);
    const [zoneData, setZoneData] = useState([]);
    const [serverData, setServerData] = useState([]);
    const [alertData, setAlertData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userPromise = await axios.get("http://localhost:8080/users");
                const elderPromise = await axios.get("http://localhost:8080/elders");
                const devicePromise = await axios.get("http://localhost:8080/devices");
                const zonePromise = await axios.get("http://localhost:8080/zones");
                const serversPromise = await axios.get("http://localhost:8080/system/health/servers");
                const alertPromise = await axios.get("http://localhost:8080/system/alerts");

                const [userRes, elderRes, deviceRes, zoneRes, serverRes, alertRes] = await Promise.all([
                    userPromise, 
                    elderPromise,
                    devicePromise,
                    zonePromise,
                    serversPromise,
                    alertPromise 
                    
                ]);
                setUserData(userRes.data)
                setElderlyData(elderRes.data)
                setDeviceyData(deviceRes.data)
                setZoneData(zoneRes.data)
                setServerData(serverRes.data)
                setAlertData(alertRes.data)


            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false); // หยุดสถานะ loading
            }
        };

        fetchUserData();
    }, []);


    // console.log("userData: ",userData.length)
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
                <Cardno7 data={serverData}/>
                <Cardno5 data={alertData}/>
            </div>
        </>
    );
}

export default SystemOverviewDashboard;