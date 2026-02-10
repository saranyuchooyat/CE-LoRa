import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

function TopZonePieChart({piedata}){

    const topZoneData = piedata.map(item => ({
        name: item.zonename, 
        y: item.activeuser
    }));

    const pieoptions = {
        chart:{
            type: 'pie',
        },
        title:{
            text:''
        },
        credits:{
            enabled:false
        },
        plotOption:{
            pie:{
                dataLabels:{
                    enabled: true,
                    format: '{point.name}: {point.y}'
                },
                zone:[{
                    value: 50,
                    color: '#f7a35c' // Color for values up to 50
                    }, 
                    {
                    value: 100,
                    color: '#7cb5ec' // Color for values between 51 and 100
                    }, 
                    {
                    color: '#90ed7d' // Color for values above 100
                }]
            }
        },
        series: [{
            name: 'Data',
            data: topZoneData
        }]
    };

    return(
        <>
            <HighchartsReact highcharts={Highcharts} options={pieoptions}/>
        </>
    )
}

export default TopZonePieChart;