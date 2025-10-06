import Addbutton from "./AddButton";
import Banner from "./Banner";

function MenuNameCard({title, description, buttonText, onButtonClick, detail}){
    console.log(buttonText)

    const componentCheck = () =>{

        if(onButtonClick){
            return <Addbutton buttonText={buttonText} onButtonClick={onButtonClick}/>
        }

        if(detail != false){
            return <Banner text={buttonText} detail={detail}/>
        }

    };
    return(
        <>
            <div className="card flex justify-between items-center">
                <div className="ml-3">
                    <p className="text-[22px] font-bold text-start">{title}</p>
                    <p>{description}</p>
                </div>
                {componentCheck()}
                
            </div>
        </>
    )
}

export default MenuNameCard;