import Cardno8Info from "./Cardno8Info";

function Cardno9({data}){
    console.log(data)
    return(
        <>
            <div className="flex justify-between gap-4 h-full">
                
                <div className="card flex flex-col justify-start items-center">

                    <p className="font-bold text-[18px]">แผนที่ภาพรวมของพื้นที่ {data}</p>

                    <div className="flex w-full justify-end gap-4">
                        <button className="font-semibold bg-main-card p-2 px-4 rounded-[10px] text-black cursor-pointer hover:text-white hover:bg-main-green hover:border-1">ทั้งหมด</button>
                        <button className="font-semibold bg-alert-bg p-2 px-4 rounded-[10px] text-black cursor-pointer hover:text-white hover:bg-main-red hover:border-1">ฉุกเฉิน</button>
                        <button className="font-semibold bg-warn-bg p-2 px-4 rounded-[10px] text-black cursor-pointer hover:text-white hover:bg-main-yellow hover:border-1">เตือน</button>
                        <button className="font-semibold bg-gray-200 p-2 px-4 rounded-[10px] text-black cursor-pointer hover:text-white hover:bg-gray-400 hover:border-1">รีเฟรช</button>
                    </div>

                    <div className="mt-1 bg-gray-300 w-full h-100 rounded-[10px]"></div>
                </div>

                <Cardno8Info/>
            </div>
        </>
    )
}

export default Cardno9;