import type { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';

const BookingByAirlinesChart = () => {
  return (
    <Chart
      options={
        {
          labels: [
            'Vietnam Airlines',
            'Bamboo Airways',
            'Vietjet Air',
            'Hãng khác',
          ],
          dataLabels: {
            enabled: false,
          },
          stroke: {
            show: false,
            width: 0,
          },
          legend: {
            fontSize: '13',
            position: 'bottom',
            labels: {
              colors: 'black',
            },
            markers: {
              strokeWidth: 0,
            },
          },
        } as ApexOptions
      }
      series={[1026, 291, 1349, 203]}
      type="donut"
      height={320}
    />
  );
};

export default BookingByAirlinesChart;
