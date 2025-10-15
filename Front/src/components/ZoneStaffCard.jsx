import J3 from '../assets/picture/J3-Smartwatch.png';

function ZoneStaffCard({data}) {

    return(
        <>
            {data.map((card, index)=>{
                return(
                    <button key={index} className="flex flex-col items-center bg-test-color border-l-0 border-y-5 border-main-green rounded-[15px] gap-4 p-3 drop-shadow-lg drop-shadow-lg hover:bg-main-card/30 cursor-pointer transition-colors duration-150">
                        <div className="bg-main-green font-semibold  text-white rounded-full py-1 px-10 w-fit self-start">
                            <p>{card.status}</p>
                        </div>
                        <div className="grid grid-cols-2 text-start gap-4 w-full">

                            <div className='flex justify-center'>
                                <div className='w-70 h-70 bg-gray-800 rounded-lg'></div>
                            </div>

                            <div className='flex flex-col gap-4'>
                                <div className=''>
                                    <p className='text-gray-400'>ชื่อ-นามสกุล</p>
                                    <p>{card.name}</p>
                                    <p className='text-gray-700 text-xs mb-2'>{card.position}</p>
                                </div>
                                <div className=''>
                                    <p className='text-gray-400'>ข้อมูลติดต่อ</p>
                                    <p>📞: {card.phone}</p>
                                    <p>✉️: {card.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className='text-start w-full ml-12'>
                            <p className='text-gray-400'>สิทธิ์การเข้าถึง</p>
                            <div className='flex justify-normal w-full gap-4'>
                                {card.permissions.map((data, index)=>{
                                    return(
                                        <div key={index} className='bg-main-green font-xs text-white rounded-lg px-2 w-fit'>{data}</div>
                                    );
                                })}
                            </div>
                            <p className='text-gray-400 self-start mt-4'>{card.Description}</p>

                            <div className='flex w-full gap-4 mt-4'>
                                    <button className="table-btn hover:bg-main-yellow hover:text-white">Edit</button>
                                    <button className="table-btn hover:bg-green-500 hover:text-white">Setting</button>
                                    <button className="table-btn hover:bg-main-red hover:text-white">Delete</button>
                            </div>
                        </div>

                        

                        
                    </button>


                );
            })}
        </>
    );
}

export default ZoneStaffCard;