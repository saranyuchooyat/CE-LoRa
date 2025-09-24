import Contents from "../../components/Contents";
import Cardno2 from "../../components/Cardno2";
import Cardno3 from "../../components/Cardno3";
import Cardno5 from "../../components/Cardno5";
import Cardno7 from "../../components/Cardno7";


function SystemOverviewDashboard(){

    const SystemData = 
    [
        {value:"24",name:"จำนวน Zone ที่ใช้งาน"},
        {value:"156",name:"จำนวนผู้ใช้งานทั้งหมด"},
        {value:"2,567",name:"จำนวนผู้สูงอายุที่ลงทะเบียน"},
        {value:"2,789",name:"จำนวนอุปกรณ์ที่ลงทะเบียน"},
    ]

    const SaerverUsageData =
    [
        {name:"LoRaWAN Server" ,cpu:"45%" ,mem:"12.8GB / 16GB" ,disk:"456GB / 1TB"},
        {name:"Database Server" ,cpu:"45%" ,mem:"12.8GB / 16GB" ,disk:"456GB / 1TB"},
        {name:"Analytic Server" ,cpu:"45%" ,mem:"12.8GB / 16GB" ,disk:"456GB / 1TB"},
        {name:"Web Application Server" ,cpu:"45%" ,mem:"12.8GB / 16GB" ,disk:"456GB / 1TB"}
    ]

    return(
        <>
            <div className="mx-5">
                <Cardno2 data={SystemData}/>
                <Cardno3/>
                <Cardno7 data={SaerverUsageData}/>
                <Cardno5/>
            </div>
        </>
    );
}

export default SystemOverviewDashboard;