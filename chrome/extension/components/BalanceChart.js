import React from 'react';
import { Line } from 'react-chartjs-2';

const BalanceChart = ({ ledgers }) => {
  const getChartData = () => {
    let chartData = [];

    try {
      chartData = ledgers
        .filter((ledger) => ledger.description && ledger.description.match('Position closed'))
        .map((ledger, index) => ({
          x: index,
          y: ledger.balance,
        }));
    } catch (ex) {
      console.warn(ex, ledgers);
    } finally {
      return chartData;
    }
  };

  return (
    <Line
      data={{
        labels: Array.from(Array(getChartData().length).keys()).reverse(),
        datasets: [
          {
            label: 'Kapitał',
            fill: true,
            pointRadius: 0,
            borderWidth: 2,
            backgroundColor: '#42A5F5',
            borderColor: '#42A5F5',
            data: getChartData(),
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
        legend: {
          display: false,
        },
        showTooltips: true,
        multiTooltipTemplate: '<%= value %>',
        interaction: {
          mode: 'index',
        },
        hover: {
          mode: 'label',
        },
      }}
    />
  );
};

export default BalanceChart;
