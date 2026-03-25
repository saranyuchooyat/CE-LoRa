function SummaryCard({data}){

    console.log("data in cardno2",data)

    return(
        <>
            <div className="flex justify-between items-stretch h-fit text-center gap-4">
                {data.map((card, index) => (    
                <div key={index} className="card flex-1 flex flex-col justify-center items-center p-4">
                    <p className="text-[40px] font-bold leading-tight">{card.value}</p>
                    <p className="">{card.name}</p>
                </div>  
                ))}
            </div>
        </>
    )
}

export default SummaryCard;