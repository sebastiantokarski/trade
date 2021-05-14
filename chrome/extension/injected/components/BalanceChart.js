import React from 'react';
import { Line } from 'react-chartjs-2';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { isDateFromToday, log } from '../utils';

const ChartWrapper = styled.div`
  padding-top: 40px;
`;

const BalanceChart = () => {
  const getChartData = () => {
    let chartData = [];

    const { ledgers, currDayBalance } = useSelector((state) => state.account);

    try {
      chartData = ledgers
        .filter((ledger) => ledger.description && ledger.description.match('Position closed'))
        .filter((ledger) => {
          return isDateFromToday(ledger.timestamp);
        })
        .map((ledger, index) => ({
          x: index,
          y: ledger.balance,
        }));
    } catch (ex) {
      log('error', 'FAILED TO PROCESS BALANCE CHART DATA', ex);
    } finally {
      return chartData;
    }
  };

  return (
    <ChartWrapper>
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
    </ChartWrapper>
  );
};

export default BalanceChart;
