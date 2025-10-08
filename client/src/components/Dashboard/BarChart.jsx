
import React from 'react';
import ReactECharts from 'echarts-for-react';

const BarChart = ({ title, data }) => {
    const option = {
        title: {
            text: title,
        },
        tooltip: {},
        xAxis: {
            data: data.map(item => item.name)
        },
        yAxis: {},
        series: [{
            name: title,
            type: 'bar',
            data: data.map(item => item.value)
        }]
    };

    return <ReactECharts option={option} />;
};

export default BarChart;