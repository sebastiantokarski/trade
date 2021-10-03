import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { log } from '../utils';

const ChartWrapper = styled.div`
  max-height: 220px;
`;

const DateBtn = styled.button`
  background: none;
  border: 1px solid #7e8486;
  border-radius: 10px;
  padding: 3px 10px;
  margin: 2px;
  &:hover {
    opacity: 0.6;
  }
`;

const chartPeriods = ['Day', 'Week', 'Month', 'Year', 'Max'];

const BalanceChart = () => {
  const [chartPeriod, setChartPeriod] = useState(chartPeriods[0]);
  const { posLedgers } = useSelector((state) => state.account);

  const filterByPeriod = (timestamp) => {
    const today = new Date();

    if (chartPeriod === 'Day') {
      return today.setHours(0, 0, 0, 0) === new Date(timestamp).setHours(0, 0, 0, 0);
    } else if (chartPeriod === 'Week') {
      const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);

      return lastWeek.getTime() < new Date(timestamp).getTime();
    } else if (chartPeriod === 'Month') {
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);

      return lastMonth.getTime() < new Date(timestamp).getTime();
    } else if (chartPeriod === 'Year') {
      const lastYear = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 365);

      return lastYear.getTime() < new Date(timestamp).getTime();
    }
    return true;
  };

  const getChartData = () => {
    let chartData = [];

    try {
      chartData = posLedgers
        .filter((ledger) => filterByPeriod(ledger.timestamp))
        .map((ledger) => ({ x: ledger.timestamp, y: ledger.balance }));

      // chartData.push({
      //   x: chartData.length,
      //   y: currDayBalance,
      // });

      return chartData.reverse();
    } catch (ex) {
      log('error', 'FAILED TO PROCESS BALANCE CHART DATA', ex);
    }
  };

  return (
    <ChartWrapper>
      <div>
        {chartPeriods.map((period) => (
          <DateBtn onClick={() => setChartPeriod(period)}>{period}</DateBtn>
        ))}
      </div>
      <Line
        data={{
          labels: Array.from(Array(getChartData().length).keys()).reverse(),
          datasets: [
            {
              label: 'Balance',
              fill: true,
              pointRadius: 0,
              borderWidth: 2,
              borderColor: '#42A5F5',
              data: getChartData(),
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
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
          xAxes: [
            {
              type: 'time',
              time: {
                format: 'DD/MM/YYYY',
                tooltipFormat: 'DD T',
                unit: 'hour',
              },
              scaleLabel: {
                display: true,
                labelString: 'Data',
              },
            },
          ],
        }}
      />
    </ChartWrapper>
  );
};

export default BalanceChart;
