import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

function UserTrendGraph({graphdata}){

    const usageTrendData = graphdata.map(item => (
        [
            new Date(item.date).getTime(), 
            item.activeUsers
        ]
    ));

    const graphoptions = {
        chart:{
            
        },
        title:{
            text:''
        },
        credits:{
            enabled:false
        },
        xAxis:{
            type: 'datetime',
            title: 'Date'

        },
        yAxis:{
            title: 
            {
                text:'Active Users'
            }

        },
        series:[{
            name:'Date',
            data: usageTrendData

        }]
    }

    return(
        <>
            <HighchartsReact highcharts={Highcharts} options={graphoptions}/>
        </>
    )
}

export default UserTrendGraph;