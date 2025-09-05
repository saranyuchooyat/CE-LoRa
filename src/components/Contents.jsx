import Cardno2 from "./Cardno2";
import Cardno3 from "./Cardno3";
import CardFilter from "./CardFilter";
import CardnStatus from "./CardStatus";

function Contents(){
    return(
        <>
            <div className="mt-3 mx-5">
                <CardnStatus/>
                <CardFilter/>
                <Cardno2/>
                <Cardno3/>
                <Cardno2/>
            </div>
        </>
    )
}

export default Contents;