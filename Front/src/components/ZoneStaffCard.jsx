import J3 from '../assets/picture/J3-Smartwatch.png';

function ZoneStaffCard() {

    return(
        <>
            <button className="flex flex-col items-center bg-test-color border-l-0 border-y-5 border-main-green rounded-[15px] gap-4 p-3 drop-shadow-lg">
                <div className="bg-main-green font-semibold  text-white rounded-full py-1 px-10 w-fit self-end">
                    <p>Online</p>
                </div>
                <div className="grid grid-cols-2 text-start gap-4 w-full">

                    <div className='flex justify-center'>
                        <img src={J3} alt="J3-ismarch"/>
                    </div>

                    <div className='flex flex-col justify-between'>
                        <div className=''>
                            <p className='text-gray-400'>ชื่อ-นามสกุล</p>
                            <p>Saranyu Chooyat</p>
                            <p className='text-gray-700 text-xs mb-2'>Saranyu Chooyat</p>
                        </div>
                        <div className=''>
                            <p className='text-gray-400'>ข้อมูลติดต่อ</p>
                            <p>📞: 09x-xxx-xxxx</p>
                            <p>✉️: saranyu.chooyat@gmail.com</p>
                        </div>

                        <div className=''>
                            <p className='text-gray-400'>รุ่นอุปกรณ์</p>
                            <p>J3 iSmarch Watch</p>
                        </div>
                    </div>
                </div>

                <div className='text-start w-full'>
                    <p className='text-gray-400'>สิทธิ์การเข้าถึง</p>
                    <div className='flex justify-normal w-full gap-4'>
                        <div className='bg-main-green font-xs text-white rounded-lg px-2 w-fit'>Sensor 1</div>
                        <div className='bg-main-green font-xs text-white rounded-lg px-2 w-fit'>Sensor 1</div>
                        <div className='bg-main-green font-xs text-white rounded-lg px-2 w-fit'>Sensor 1</div>
                        <div className='bg-main-green font-xs text-white rounded-lg px-2 w-fit'>Sensor 1</div>
                    </div>
                </div>

                <p className='text-gray-400 self-start'>Description</p>

                <div className='flex w-full gap-4'>
                            <button className="table-btn hover:bg-main-yellow hover:text-white">Edit</button>
                            <button className="table-btn hover:bg-green-500 hover:text-white">Setting</button>
                            <button className="table-btn hover:bg-main-red hover:text-white">Delete</button>
                </div>
            </button>
        </>
    );
}

export default ZoneStaffCard;