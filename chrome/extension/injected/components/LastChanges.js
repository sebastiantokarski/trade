import React, { useState } from 'react';
import SimpleBar from 'simplebar-react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import {
  timeSince,
  isDateFromToday,
  getTodayDate,
  getDateFromString,
  isDiffBiggerThanOneDay,
} from '../utils';

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
  min-width: 4.5rem;
`;

const TotalPLPerc = styled.span`
  margin-left: 5px;
`;

const LastChanges = () => {
  const lastChangesTypes = ['Today', 'Last days', 'Transfers'];
  let sumPLPerc = 0;

  const [lastChangeType, setLastChangesType] = useState(lastChangesTypes[0]);

  const { ledgers, currDayBalance, currBalance } = useSelector((state) => state.account);

  const getTodayTrades = () => {
    const todayLedgers = ledgers.filter(
      (ledger) =>
        ledger.description &&
        ledger.description.match('Position closed') &&
        isDateFromToday(ledger.timestamp)
    );

    return todayLedgers.map((ledger) => {
      const { balance, timestamp } = ledger;

      return {
        // balance - ~fees
        value: balance * 0.99,
        timestamp,
      };
    });
  };

  const getLastDaysTrades = () => {
    const lastLedgers = ledgers
      .filter((ledger) => ledger.description && ledger.description.match('Position closed'))
      .filter((ledger) => (lastChangeType === 'Today' ? isDateFromToday(ledger.timestamp) : true));

    const valueByDays = lastLedgers.reduce(
      (prev, ledger, index) => {
        const { timestamp, balance } = ledger;
        const currDate = new Date(timestamp).toLocaleDateString();
        let lastDate = getDateFromString(Object.keys(prev).pop());

        while (isDiffBiggerThanOneDay(lastDate, getDateFromString(currDate))) {
          lastDate = new Date(lastDate.setDate(lastDate.getDate() - 1));

          prev[lastDate.toLocaleDateString()] = lastLedgers[index + 1].balance;
        }

        if (prev[currDate] === null || prev[currDate] === undefined) {
          prev[currDate] = balance;
        }

        return prev;
      },
      {
        [getTodayDate()]: currBalance,
      }
    );

    return Object.keys(valueByDays).map((date) => ({
      timestamp: date,
      value: valueByDays[date],
    }));
  };
  const getTransfers = () => {
    const lastTransfers = ledgers.filter(
      (ledger) =>
        ledger.description &&
        ledger.description.match(
          /Transfer of [\d\.]+ USD from wallet Trading to Exchange on wallet exchange/
        ) &&
        // From 24.05.2021
        ledger.timestamp > new Date(1621807200000).getTime()
    );

    const valueByDays = lastTransfers.reduce(
      (prev, ledger) => {
        const { timestamp, amout } = ledger;
        const currDate = new Date(timestamp).toLocaleDateString();
        let lastDate = getDateFromString(Object.keys(prev).pop());

        while (isDiffBiggerThanOneDay(lastDate, getDateFromString(currDate))) {
          lastDate = new Date(lastDate.setDate(lastDate.getDate() - 1));
          prev[lastDate.toLocaleDateString()] = 0;
        }

        if (prev[currDate] === undefined) {
          prev[currDate] = amout;
        } else {
          prev[currDate] += amout;
        }

        return prev;
      },
      {
        [getTodayDate()]: 0,
      }
    );

    const transferModifiers = {
      '30.05.2021': -263,
    };

    Object.keys(transferModifiers).map((date) => {
      if (valueByDays[date] !== undefined) {
        valueByDays[date] += transferModifiers[date];
      }
    });

    return Object.keys(valueByDays).map((date) => ({
      timestamp: date,
      value: valueByDays[date],
    }));
  };

  const getLastChanges = () => {
    if (lastChangeType === 'Today') {
      return getTodayTrades();
    } else if (lastChangeType === 'Last days') {
      return getLastDaysTrades();
    } else if (lastChangeType === 'Transfers') {
      return getTransfers();
    }
    return [];
  };

  const lastChanges = getLastChanges();

  const handleTypeChange = () => {
    setLastChangesType((ctype) => {
      const currIndex = lastChangesTypes.findIndex((type) => type === ctype);

      return lastChangesTypes[currIndex + 1] || lastChangesTypes[0];
    });
  };

  if (lastChangeType === 'Transfers') {
    sumPLPerc = lastChanges.reduce((a, b) => a + b.value, 0) / lastChanges.length;
  } else if (lastChanges.length) {
    sumPLPerc = ((lastChanges[0].value - currDayBalance) / currDayBalance) * 100;
  }

  return (
    <MainWrapper>
      <Title>
        <TitleBtn onClick={handleTypeChange}>
          {lastChangeType === 'Transfers' ? lastChangeType : `${lastChangeType} Trades`}
          {'\u00A0'}
        </TitleBtn>
        <TotalPLPerc className={sumPLPerc > 0 ? 'bfx-green-text' : 'bfx-red-text'}>
          {lastChangeType === 'Transfers' ? '~' : ''}
          {sumPLPerc > 0 ? '▲' : '▼'} {sumPLPerc.toFixed(2)}
          {lastChangeType === 'Transfers' ? '$' : '%'}
        </TotalPLPerc>
      </Title>
      <SimpleBar style={{ maxHeight: '205px' }}>
        {lastChanges.map((data, index) => {
          const { value, timestamp } = data;
          const nextValue = lastChanges[index + 1]
            ? lastChanges[index + 1].value
            : lastChangeType === 'Today'
            ? currDayBalance
            : null;
          const change =
            lastChangeType === 'Transfers'
              ? lastChanges.slice(index, lastChanges.length).reduce((a, b) => a + b.value, 0)
              : nextValue && ((value - nextValue) / nextValue) * 100;
          const className = change === null || change > 0 ? 'bfx-green-text' : 'bfx-red-text';

          return (
            <div key={index}>
              <Timestamp>
                {typeof timestamp === 'string' ? timestamp : timeSince(timestamp)}
              </Timestamp>
              <ChangeValue className={className}>
                {lastChangeType === 'Transfers'
                  ? `${change.toFixed(2)}$`
                  : change && `${change.toFixed(2)}%`}
              </ChangeValue>
              <ChangeValue className={className}>${value && value.toFixed(2)}</ChangeValue>
            </div>
          );
        })}
      </SimpleBar>
    </MainWrapper>
  );
};

export default LastChanges;
