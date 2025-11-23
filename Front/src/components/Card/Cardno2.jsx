function Cardno2({data}){

    return(
        <>
            <div className="flex justify-between h-fit text-center gap-4">
                {data.map((card, index) => (
                <div key={index} className="card flex flex-col justify-center items-center">
                    <p className="text-[40px] font-bold">{card.value}</p>
                    <p className="">{card.name}</p>
                </div>  
                ))}
            </div>
        </>
    )
}

export default Cardno2;