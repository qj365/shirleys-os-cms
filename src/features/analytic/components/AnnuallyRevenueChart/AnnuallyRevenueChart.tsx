import type { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';

const AnnuallyRevenueChart = () => {
  return (
    <Chart
      type="bar"
      height={300}
      series={[
        {
          name: 'Nội địa',
          data: [44, 55, 41, 67, 22, 43, 44, 55, 41, 67, 22, 43],
        },
        {
          name: 'Quốc tế',
          data: [13, 23, 20, 8, 13, 27, 13, 23, 20, 8, 13, 27],
        },
      ]}
      options={
        {
          chart: {
            type: 'bar',
            stacked: true,
            toolbar: {
              show: false,
            },
          },
          legend: {
            fontSize: '13',
            position: 'top',
            labels: {
              colors: 'black',
            },
            markers: {
              strokeWidth: 0,
            },
          },
          xaxis: {
            categories: [
              'Tháng 1',
              'Tháng 2',
              'Tháng 3',
              'Tháng 4',
              'Tháng 5',
              'Tháng 6',
              'Tháng 7',
              'Tháng 8',
              'Tháng 9',
              'Tháng 10',
              'Tháng 11',
              'Tháng 12',
            ],
            labels: {
              style: {
                colors: 'black',
                fontSize: '13',
              },
            },
          },
          yaxis: {
            labels: {
              style: {
                colors: 'black',
                fontSize: '13',
              },
            },
          },
          grid: {
            strokeDashArray: 3,
            position: 'back',
            borderColor: '#e9e9e9',
          },
        } as ApexOptions
      }
    />
  );
};

export default AnnuallyRevenueChart;
