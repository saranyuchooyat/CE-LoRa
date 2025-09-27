function Cardno7({ data }){

    console.log("usesage",data)

    const calculatePercentage = (data) => {

        const UNIT_FACTORS = {
            'TB': 1024,   // 1 TB = 1024 GB
            'GB': 1,      // 1 GB = 1 GB (หน่วยพื้นฐาน)
            'MB': 1 / 1024 // 1 MB = 1/1024 GB
        };

        // Regex เพื่อดึงค่าตัวเลขและหน่วยออกจาก String
        const VALUE_REGEX = /([0-9\.]+)([a-zA-Z]+)/;

        // ฟังก์ชันช่วยในการแปลงค่าเป็น GB
        const convertToGB = (valueString) => {
            const match = valueString.trim().match(VALUE_REGEX);
            
            if (!match) return 0;

            const value = parseFloat(match[1]);
            const unit = match[2].toUpperCase();

            if (UNIT_FACTORS[unit]) {
                return value * UNIT_FACTORS[unit];
            }
            return 0; // ไม่รู้จักหน่วย
        };

        // --- เริ่มต้นการคำนวณหลัก ---
        const parts = data.split('/').map(part => part.trim()); 
        
        if (parts.length !== 2) {
            console.error("Invalid data format:", data);
            return 0; 
        }

        const usedString = parts[0];
        const totalString = parts[1];
        
        // 1. แปลงค่า Used และ Total เป็น GB ทั้งหมด
        const usedInGB = convertToGB(usedString);
        const totalInGB = convertToGB(totalString);
        
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

                    return (
                        <div key={index} className="card">
                            <div className="mb-2">
                                <p className="text-start font-bold text-[18px]">{card.name}</p>  
                            </div>

                            <div className="flex flex-col gap-4">
                                {/* ----- CPU USAGE BAR ----- */}
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

                                {/* ----- MEMORY USAGE BAR ----- */}
                                <div className="text-start">
                                    <div className="flex justify-between">
                                        <p className="">Memory Usage</p>
                                        <p className="">{card.mem}</p>
                                    </div>
                                    <div className="bg-gray-200 rounded-full w-full h-3">
                                        <div 
                                            // *** KEY CHANGE: ใช้ style={{ width: 'XX%' }} ***
                                            style={{ width: `${calculatePercentage(card.mem)}%` }}
                                            className="h-3 bg-red-500 rounded-[10px]"
                                        ></div>
                                    </div>
                                </div>

                                {/* ----- DISK SPACE BAR ----- */}
                                <div className="text-start">
                                    <div className="flex justify-between">
                                        <p className="">Disk Space</p>
                                        <p className="">{card.disk}</p>
                                    </div>
                                    <div className="bg-gray-200 rounded-full w-full h-3">
                                        <div 
                                            // *** KEY CHANGE: ใช้ style={{ width: 'XX%' }} ***
                                            style={{ width: `${calculatePercentage(card.disk)}%` }}
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