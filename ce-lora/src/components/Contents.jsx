import CardFilter from "./CardFilter";
import Cardno2 from "./Cardno2";
import CardnStatus from "./CardStatus";

function Contents(){
    return(
        <>
            <div className="h-lvh mt-3 mx-5">
                <CardnStatus/>
                <CardFilter/>
            </div>
        </>
    )
}

export default Contents;