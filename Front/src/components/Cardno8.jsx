import Cardno8Info from "./Cardno8Info";

function Cardno8({data}){
    return(
        <>
            <div className="flex justify-between gap-4 h-full">
                
                <div className="card flex flex-col justify-start items-center">

                    <p className="font-bold text-[18px]">แนวโน้มสุขภาพภายในพื้นที่ (7วันที่ผ่านมา)</p>

                    <div className="mt-1 bg-gray-300 w-full h-100 rounded-[10px]"></div>

                    <div className="flex justify-around mt-4 gap-4 w-full">
                        <div className="bg-gray-200 text-center p-4 rounded-[10px]">
                            <p className="text-[18px]">45</p>
                            <p className="text-[16px] text-gray-500 mt-2">ค่าเฉลี่ย SpO2</p>
                        </div>

                        <div className="bg-gray-200 text-center p-4 rounded-[10px]">
                            <p className="text-[18px]">156</p>
                            <p className="text-[16px] text-gray-500 mt-2">ค่าเฉลี่ย Heart Rate</p>
                        </div>

                        <div className="bg-gray-200 text-center p-4 rounded-[10px]">
                            <p className="text-[18px]">12ms</p>
                            <p className="text-[16px] text-gray-500 mt-2">ค่าเฉลี่ยอุณหภูมิ</p>
                        </div>
                    </div>
                </div>

                <Cardno8Info/>
            </div>
        </>
    )
}

export default Cardno8;