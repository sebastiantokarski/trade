import React, { useState } from 'react';
import SimpleBar from 'simplebar-react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
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

const TitleBtn = styled.button`
  background: none;
  border: none;

  &:hover {
    color: #969b9e;
  }

  &:focus {
    background-color: unset !important;
  }
`;

const Timestamp = styled.span`
  display: inline-block;
  min-width: 105px;
`;

const ChangeValue = styled.span`
  display: inline-block;
  margin: 0.1rem 1rem;
  min-width: 3.5rem;
`;

const TotalPLPerc = styled.span`
  margin-left: 5px;
`;

const LastChanges = () => {
  const lastChangesTypes = ['Today', 'Last days'];
  let sumPLPerc = 0;

  const [lastChangeType, setLastChangesType] = useState(lastChangesTypes[0]);

  const { ledgers, currDayBalance } = useSelector((state) => state.account);

  const lastLedgers = ledgers
    .filter((ledger) => ledger.description && ledger.description.match('Position closed'))
    .filter((ledger) => (lastChangeType === 'Today' ? isDateFromToday(ledger.timestamp) : true));

  if (lastChangeType === 'Last days') {
    console.log(
      lastLedgers.reduce(
        (prev, ledger) => {
          const { timestamp, balance } = ledger;
          const currDate = new Date(timestamp).toLocaleDateString();
          if (prev[currDate] === null || prev[currDate] === undefined) {
            prev[currDate] = balance;
          }

          return prev;
        },
        {
          [new Date().toLocaleDateString()]: null,
        }
      )
    );
  }

  const getLastChanges = () => {
    if (lastChangeType === 'Today') {
      lastLedgers.push({
        initial: true,
        balance: currDayBalance,
        timestamp: new Date().setHours(0, 0, 0, 0),
        change: 0,
      });
    }

    const changes = lastLedgers
      .map((ledger, index) => {
        const { balance, timestamp, initial } = ledger;
        const nextLedger = lastLedgers[index + 1];

        if (initial || !nextLedger) {
          return undefined;
        }
        return {
          // balance - ~fees
          value: balance * 0.99,
          change: ((balance - nextLedger.balance) / nextLedger.balance) * 100,
          timestamp,
        };
      })
      .filter((change) => change !== undefined);

    if (lastChangeType === 'Today') {
      return changes;
    }

    return changes; //.reduce((prev, curr) => {}, []);
  };

  const lastChanges = getLastChanges();

  const handleTypeChange = () => {
    setLastChangesType((ctype) => {
      return lastChangesTypes.filter((type) => type !== ctype)[0];
    });
  };

  if (lastChanges.length) {
    sumPLPerc = ((lastChanges[0].value - currDayBalance) / currDayBalance) * 100;
  }

  return (
    <MainWrapper>
      <Title>
        <TitleBtn onClick={handleTypeChange}>
          {lastChangeType} Trades{'\u00A0\u00A0'}
        </TitleBtn>
        <TotalPLPerc className={sumPLPerc > 0 ? 'bfx-green-text' : 'bfx-red-text'}>
          {sumPLPerc > 0 ? '▲' : '▼'} {sumPLPerc.toFixed(2)}%
        </TotalPLPerc>
      </Title>
      <SimpleBar style={{ maxHeight: '205px' }}>
        {lastChanges.map((data, index) => {
          const { change, value, timestamp } = data;
          const className = change > 0 ? 'bfx-green-text' : 'bfx-red-text';

          return (
            <div key={index}>
              <Timestamp>{timeSince(timestamp)}</Timestamp>
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
