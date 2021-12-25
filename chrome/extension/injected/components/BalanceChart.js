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

const chartPeriods = ['Day', 'Week', 'Month', 'Quarter', 'Year'];

const BalanceChart = () => {
  const [chartPeriod, setChartPeriod] = useState(chartPeriods[0]);

  const { plValue, isActive: isPositionActive } = useSelector((state) => state.position);
  const { posLedgers, currDayBalance, currBalance, minBalance } = useSelector(
    (state) => state.account
  );

  const currActiveBalance = currBalance + plValue;

  const createAnnotation = (value, content) => {
    return {
      type: 'line',
      mode: 'horizontal',
      scaleID: 'y-axis-0',
      value,
      borderColor: 'red',
      borderWidth: 1,
      label: {
        content,
        backgroundColor: 'rgba(0,0,0,0.15)',
        color: 'rgb(255, 0, 0)',
        position: 'top',
        textAlign: 'end',
        enabled: true,
      },
    };
  };

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
    } else if (chartPeriod === 'Quarter') {
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 91);

      return lastMonth.getTime() < new Date(timestamp).getTime();
    } else if (chartPeriod === 'Year') {
      const lastYear = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 365);

      return lastYear.getTime() < new Date(timestamp).getTime();
    }
    return true;
  };

  const getChartData = () => {
    try {
      const chartData = posLedgers
        .filter((ledger) => filterByPeriod(ledger.timestamp))
        .map((ledger) => ({ x: ledger.timestamp, y: ledger.balance }));

      if (isPositionActive) {
        chartData.unshift({
          x: new Date().getTime(),
          y: currActiveBalance,
        });
      }

      if (chartPeriod === 'Day') {
        chartData.push({
          x: new Date().getTime(),
          y: currDayBalance,
        });
      }

      return chartData.reverse();
    } catch (ex) {
      log('error', 'FAILED TO PROCESS BALANCE CHART DATA', ex);
    }
  };

  const getLabels = (chartData) => {
    if (chartPeriod === 'Day') {
      return chartData.map((data) => new Date(data.x).toISOString().slice(11, 16));
    } else if (chartPeriod === 'Week') {
      return chartData.map((data) =>
        new Date(data.x).toLocaleDateString('en-En', { weekday: 'long' })
      );
    } else if (chartPeriod === 'Month') {
      return chartData.map((data) => new Date(data.x).toISOString().slice(8, 10));
    }

    return chartData.map((data) => new Date(data.x).toISOString().slice(0, 10));
  };

  const chartData = getChartData();
  const annotations = [createAnnotation(minBalance, 'Today minimum')];

  if (chartPeriod !== 'Day') {
    // @TODO From variable
    annotations.push(createAnnotation(300, 'Absolute minimum'));
  }

  return (
    <ChartWrapper>
      <div>
        {chartPeriods.map((period) => (
          <DateBtn key={`period-type-${period}`} onClick={() => setChartPeriod(period)}>
            {period}
          </DateBtn>
        ))}
      </div>
      <Line
        data={{
          labels: getLabels(chartData),
          datasets: [
            {
              label: 'Balance',
              fill: true,
              pointRadius: 0,
              tension: 0,
              borderWidth: 2,
              borderColor: '#42A5F5',
              data: chartData,
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
          tooltips: {
            mode: 'x-axis',
            callbacks: {
              label: (tooltipItems) => {
                return `Balance: $${tooltipItems.yLabel.toFixed(2)}`;
              },
            },
          },
          xAxes: [
            {
              type: 'time',
              time: {
                unit: 'minute',
                round: true,
                min: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
                max: new Date().getTime(),
                displayFormats: {
                  millisecond: 'MMM DD',
                  second: 'MMM DD',
                  minute: 'MMM DD',
                  hour: 'MMM DD',
                  day: 'MMM DD',
                  week: 'MMM DD',
                  month: 'MMM DD',
                  quarter: 'MMM DD',
                  year: 'MMM DD',
                },
              },
            },
          ],
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          annotation: { annotations },
        }}
      />
    </ChartWrapper>
  );
};

export default BalanceChart;
