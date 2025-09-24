import Cardno2 from "./Cardno2";
import Cardno3 from "./Cardno3";
import CardFilter from "./FilterCard";
import CardnStatus from "./MenuNameCard";
import Cardno4 from "./Cardno4";
import Cardno5 from "./Cardno5";
import Cardno6 from "./Cardno6";
import Cardno7 from "./Cardno7";

function Contents(){

    const SystemData = 
    [
        {value:"24",name:"จำนวน Zone ที่ใช้งาน"},
        {value:"156",name:"จำนวนผู้ใช้งานทั้งหมด"},
        {value:"2,567",name:"จำนวนผู้สูงอายุที่ลงทะเบียน"},
        {value:"2,789",name:"จำนวนอุปกรณ์ที่ลงทะเบียน"},
    ]

    return(
        <>
            <div className="mx-5">
                <CardnStatus/>
                <CardFilter/>
                <Cardno2 data={SystemData}/>
                <Cardno3/>
                <Cardno4/>
                <Cardno5/>
                <Cardno6/>
                {/* <Cardno7/> */}
            </div>
        </>
    )
}

export default Contents;