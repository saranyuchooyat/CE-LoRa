import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

function HealthGraph({ graphdata }) {
    // 💡 เช็คความปลอดภัย: ถ้าไม่ใช่ Array ให้หยุดทำงานทันทีเพื่อไม่ให้แอปค้าง
    if (!Array.isArray(graphdata)) return <p>Loading graph...</p>;

    const graphoptions = {
        chart: {},
        title: { text: '' },
        xAxis: { type: 'datetime' },
        yAxis: [{
            title: { text: 'Heart Rate (bpm)' },
            opposite: false
        }, {
            title: { text: 'SpO2 (%)' },
            opposite: true // แยกแกน Y ไปไว้อีกฝั่งเพื่อให้เห็นชัด
        },{
            title: { text: 'Temperature (°C)' },
            opposite: true // แยกแกน Y ไปไว้อีกฝั่งเพื่อให้เห็นชัด
        }],
        series: [
            {
                name: 'Heart Rate',
                data: graphdata.map(item => [new Date(item.date).getTime(), item.avgHR]),
                color: '#FF6B6B' // สีแดงสื่อถึงหัวใจ
            },
            {
                name: 'SpO2',
                yAxis: 1,
                data: graphdata.map(item => [new Date(item.date).getTime(), item.avgSpO2]),
                color: '#4D96FF' // สีฟ้าสื่อถึงออกซิเจน
            },
            {
                name: 'Temperature',
                yAxis: 2,
                data: graphdata.map(item => [new Date(item.date).getTime(), item.avgTemp]),
                color: '#FFD700' // สีเหลืองสื่อถึงอุณหภูมิ
            }
        ],
        credits: { enabled: false }
    };

    return <HighchartsReact highcharts={Highcharts} options={graphoptions} />;
}

export default HealthGraph;