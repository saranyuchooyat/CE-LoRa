import Addbutton from "./AddButton";

function MenuNameCard2({title, description, onButtonClick, buttonText }){
    
    return(
        <>
            <div className="card flex justify-between items-center">
                <div className="flex gap-4">
                    <p className="text-[40px] font-bold text-start">{title}</p>
                    <p className="text-[16px] text-start self-center">{description}</p>
                </div>
                {onButtonClick && (
                    <div className="self-center">
                        <Addbutton buttonText={buttonText} onButtonClick={onButtonClick}/>
                    </div>
                )}
            </div>
        </>
    )
}

export default MenuNameCard2;