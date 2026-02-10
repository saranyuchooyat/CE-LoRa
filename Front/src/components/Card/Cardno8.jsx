import Cardno8Info from "./Cardno8Info";
import HealthGraph from "../HealthGraph";

function Cardno8({healthdata, devicedata}){

    console.log ("HealthData",healthdata)
    console.log ("DeviceData",devicedata)
    return(
        <>
            <div className="flex justify-between gap-4 h-full">
                
                <div className="card flex flex-col justify-start items-center">

                    <p className="font-bold text-[18px]">แนวโน้มสุขภาพภายในพื้นที่ (7วันที่ผ่านมา)</p>
                    <div className="w-full mt-2 rounded-[10px]">
                        <HealthGraph graphdata={healthdata}/>
                    </div>
                
                    <div className="flex justify-around mt-4 gap-4 w-full">
                        <div className="bg-gray-200 text-center p-4 rounded-[10px]">
                            <p className="text-[18px]">{healthdata[healthdata.length - 1]?.avgSpO2 || 0}</p>
                            <p className="text-[16px] text-gray-500 mt-2">ค่าเฉลี่ย SpO2</p>
                        </div>

                        <div className="bg-gray-200 text-center p-4 rounded-[10px]">
                            <p className="text-[18px]">{healthdata[healthdata.length - 1]?.avgHR || 0}</p>
                            <p className="text-[16px] text-gray-500 mt-2">ค่าเฉลี่ย Heart Rate</p>
                        </div>

                        <div className="bg-gray-200 text-center p-4 rounded-[10px]">
                            <p className="text-[18px]">{healthdata[healthdata.length - 1]?.avgTemp || 0}</p>
                            <p className="text-[16px] text-gray-500 mt-2">ค่าเฉลี่ยอุณหภูมิ</p>
                        </div>
                    </div>
                </div>

                <Cardno8Info data={devicedata}/>
            </div>
        </>
    )
}

export default Cardno8;