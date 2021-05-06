import React, { useEffect, useState } from 'react';
import SimpleBar from 'simplebar-react';
import styled from 'styled-components';
import { timeSince, isDateFromToday } from '../utils';

const MainWrapper = styled.div`
  position: relative;
  max-width: 400px;
  padding: 20px;
  border: 1px solid rgba(100, 100, 100, 0.3);
`;

const Title = styled.span`
  position: absolute;
  display: inline-block;
  padding: 0 12px;
  background-color: #1b262d;
  left: 50%;
  top: 0;
  transform: translate(-50%, -50%);
  text-transform: uppercase;
  white-space: nowrap;
`;

const ChangeValue = styled.span`
  display: inline-block;
  margin: 0.1rem 1rem;
  min-width: 3.5rem;
`;

const LastChanges = ({ ledgers, currDayBalance }) => {
  const [lastbalanceChanges, setLastBalanceChanges] = useState([]);

  useEffect(() => {
    const getLastLedgersChanges = () => {
      const lastPositionLedgers = ledgers
        .filter((ledger) => ledger.description && ledger.description.match('Position closed'))
        .filter((ledger) => isDateFromToday(ledger.timestamp));

      lastPositionLedgers.push({
        balance: currDayBalance,
        timestamp: new Date().setHours(0, 0, 0, 0),
        change: 0,
      });

      return lastPositionLedgers
        .map((ledger, index) => {
          const { balance, timestamp } = ledger;
          const nextLedger = lastPositionLedgers[index + 1];

          if (nextLedger) {
            const nextBalance = nextLedger.balance;

            return {
              value: balance,
              change: ((balance - nextBalance) / nextBalance) * 100,
              timestamp,
            };
          }
          return undefined;
        })
        .filter((balance) => balance !== undefined);
    };
    setLastBalanceChanges(getLastLedgersChanges());
  }, [ledgers, currDayBalance]);

  let sumLastLossProfit = 0;
  if (lastbalanceChanges.length) {
    sumLastLossProfit =
      ((lastbalanceChanges[0].value - lastbalanceChanges[lastbalanceChanges.length - 1].value) /
        lastbalanceChanges[lastbalanceChanges.length - 1].value) *
      100;
  }

  return (
    <MainWrapper>
      <Title>
        <span>Today Trades{'\u00A0\u00A0'}</span>
        <span
          className={sumLastLossProfit > 0 ? 'bfx-green-text' : 'bfx-red-text'}
          style={{ marginLeft: '5px' }}
        >
          {sumLastLossProfit > 0 ? '▲' : '▼'} {sumLastLossProfit.toFixed(2)}%
        </span>
      </Title>
      <SimpleBar style={{ maxHeight: '205px' }}>
        {lastbalanceChanges.map((data, index) => {
          const { change, value, timestamp } = data;
          const className = change > 0 ? 'bfx-green-text' : 'bfx-red-text';

          return (
            <div key={index}>
              <span>{timeSince(timestamp)}</span>
              <ChangeValue className={className}>{change.toFixed(2)}%</ChangeValue>
              <ChangeValue className={className}>${value.toFixed(2)}</ChangeValue>
            </div>
          );
        })}
      </SimpleBar>
    </MainWrapper>
  );
};

export default LastChanges;
