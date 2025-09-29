function Cardno7({ data }){

    console.log("usesage", data);

    // ฟังก์ชันคำนวณเปอร์เซ็นต์ (ย้ายมาข้างนอกหรือปล่อยไว้ตรงนี้ก็ได้)
    const calculatePercentage = (used, total) => {
        // console.log(used, total); // ตรวจสอบค่าที่ส่งเข้ามา
        
        // เราใช้ 1024 ตามมาตรฐานคอมพิวเตอร์
        const UNIT_FACTORS = {
            'TB': 1024,   // 1 TB = 1024 GB
            'GB': 1,      // 1 GB = 1 GB (หน่วยพื้นฐาน)
            'MB': 1 / 1024 // 1 MB = 1/1024 GB
        };

        // Regex เพื่อดึงค่าตัวเลขและหน่วยออกจาก String (รองรับจุดทศนิยม)
        const VALUE_REGEX = /([0-9\.]+)([a-zA-Z]+)/; 

        // ฟังก์ชันช่วยในการแปลงค่าเป็น GB
        const convertToGB = (valueString) => {
            // ใช้ .trim() เพื่อลบช่องว่างก่อน Match (สำคัญมาก)
            const match = valueString.trim().match(VALUE_REGEX);
            
            if (!match) return 0;

            const value = parseFloat(match[1]);
            const unit = match[2].toUpperCase();

            if (UNIT_FACTORS[unit]) {
                return value * UNIT_FACTORS[unit];
            }
            return 0; // ไม่รู้จักหน่วย
        };

        // 1. แปลงค่า Used และ Total เป็น GB ทั้งหมด
        const usedInGB = convertToGB(used);
        const totalInGB = convertToGB(total);
        
        // 2. คำนวณเปอร์เซ็นต์
        if (totalInGB === 0) return 0;
        
        // คำนวณและปัดเศษ
        return Math.round((usedInGB / totalInGB) * 100);
    };

    return(
        <>
            <div className="flex justify-between h-fit text-center gap-4">
                {data.map((card, index) => {
                    const cpuPercent = parseFloat(card.cpu);

                    // คำนวณเปอร์เซ็นต์สำหรับ Memory และ Disk
                    const memoryPercent = calculatePercentage(card.memoryUsed, card.memoryTotal);
                    const diskPercent = calculatePercentage(card.diskUsed, card.diskTotal);

                    return (
                        <div key={index} className="card">
                            <div className="mb-2">
                                <p className="text-start font-bold text-[18px]">{card.name}</p>  
                            </div>

                            <div className="flex flex-col gap-4">
                                {/* ----- CPU USAGE BAR (ไม่เปลี่ยนแปลง) ----- */}
                                <div className="text-start">
                                    <div className="flex justify-between">
                                        <p className="">CPU Usage</p>
                                        <p className="">{card.cpu}</p>
                                    </div>
                                    <div className="bg-gray-200 rounded-full w-full h-3">
                                        <div 
                                            style={{ width: `${cpuPercent}%` }} 
                                            className="h-3 bg-red-500 rounded-[10px]"
                                        ></div>
                                    </div>
                                </div>

                                {/* ----- MEMORY USAGE BAR (แก้ไข) ----- */}
                                <div className="text-start">
                                    <div className="flex justify-between">
                                        <p className="">Memory Usage</p>
                                        {/* แสดงผลในรูปแบบใหม่ */}
                                        <p className="">{card.memoryUsed} / {card.memoryTotal}</p> 
                                    </div>
                                    <div className="bg-gray-200 rounded-full w-full h-3">
                                        <div 
                                            // *** ใช้ memoryPercent ที่คำนวณไว้แล้ว ***
                                            style={{ width: `${memoryPercent}%` }} 
                                            className="h-3 bg-red-500 rounded-[10px]"
                                        ></div>
                                    </div>
                                </div>

                                {/* ----- DISK SPACE BAR (แก้ไข) ----- */}
                                <div className="text-start">
                                    <div className="flex justify-between">
                                        <p className="">Disk Space</p>
                                        {/* แสดงผลในรูปแบบใหม่ */}
                                        <p className="">{card.diskUsed} / {card.diskTotal}</p>
                                    </div>
                                    <div className="bg-gray-200 rounded-full w-full h-3">
                                        <div 
                                            // *** ใช้ diskPercent ที่คำนวณไว้แล้ว ***
                                            style={{ width: `${diskPercent}%` }}
                                            className="h-3 bg-red-500 rounded-[10px]"
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    )
}

export default Cardno7;