import { useState, useEffect } from "react";
import MenuNameCard from "../../components/MenuNameCard";
import FilterCard from "../../components/FilterCard";
import CardTable from "../../components/ZoneTable";
import axios from "axios";
import Cardno5 from "../../components/Cardno5";

function ZoneManagement(){

    const [zoneData, setZoneData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const zonePromise = await axios.get("http://localhost:8080/zones");

                const [zoneRes] = await Promise.all([

                    zonePromise,

                    
                ]);
                setZoneData(zoneRes.data)

            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false); // หยุดสถานะ loading
            }
        };

        fetchUserData();
    }, []);

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
                option2Name="จังหวัด"/>
                <Cardno5 data={zoneData}/>
            </div>
        </>
    );
}

export default ZoneManagement;