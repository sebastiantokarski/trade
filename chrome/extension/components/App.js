import React, { useState, useEffect } from 'react';
import { BalanceChart, BalanceSlider, PositionStatus, MarginForm } from '../components';
import styled from 'styled-components';
import SimpleBar from 'simplebar-react';
import { timeSince, getTodayMidnightTime, fetchData, getWebsocketAuthData } from '../utils';
import { WEBSOCKET_API_HOST } from '../config';

const ContentWrapper = styled.div`
  display: flex;
  height: 250px;
  padding: 10px;
`;
const ContentContainer = styled.div`
  padding: 10px;
`;

const ChangeValue = styled.span`
  display: inline-block;
  margin: 0.1rem 1rem;
  min-width: 3.5rem;
`;

const RefreshIcon = styled.i`
  margin-right: 0.4rem;
`;

const App = () => {
  const [ledgers, setLedgers] = useState([]);
  const [position, setPosition] = useState();
  const [currBalance, setCurrBalance] = useState();
  const [currDayBalance, setCurrDayBalance] = useState();
  const [lastbalanceChanges, setLastBalanceChanges] = useState([]);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const performWebSocketMsg = (msg) => {
      if (msg[1] === 'wu' && msg[2][0] === 'margin' && msg[2][1] === 'USD') {
        setCurrBalance(msg[2][2]);
      } else if (msg[1] === 'pu') {
        setPosition({
          lossProfitValue: msg[2][6],
          lossProfitPerc: msg[2][7],
        });
      }
      console.log(msg);
    };

    const wss = new WebSocket(process.env.REACT_APP_WEBSOCKET_API_HOST);

    wss.onopen = () => wss.send(JSON.stringify(getWebsocketAuthData()));

    wss.onmessage = (msg) => {
      const response = JSON.parse(msg.data);

      if (response.event === 'auth' && response.status !== 'FAILED') {
        wss.send(JSON.stringify({ event: 'subscribe', channel: 'wallet' }));
      } else if (response) {
        performWebSocketMsg(response);
      }
    };

    return () => wss.close();
  }, []);

  useEffect(() => {
    if (position) {
      chrome.runtime.sendMessage({ badgeValue: position.lossProfitPerc });
    }
  }, [position]);

  useEffect(async () => {
    const rawLedgers = await fetchData('v2/auth/r/ledgers/hist', {
      limit: 200,
    });

    setLedgers(
      rawLedgers.map((rawLedger) => ({
        id: rawLedger[0],
        currency: rawLedger[1],
        timestamp: rawLedger[3],
        amout: rawLedger[5],
        balance: rawLedger[6],
        description: rawLedger[8],
      }))
    );
  }, [refreshCount]);

  useEffect(() => {
    console.log(ledgers);
    const getLastLedgersChanges = () => {
      const lastPositionLedgers = ledgers
        .filter((ledger) => ledger.description && ledger.description.match('Position closed'))
        .slice(0, 11);

      return lastPositionLedgers
        .map((ledger, index) => {
          const { balance, timestamp } = ledger;
          const nextLedger = lastPositionLedgers[index + 1];

          if (nextLedger) {
            const nextBalance = nextLedger.balance;

            return {
              value: balance,
              change:
                nextBalance > balance
                  ? (balance / nextBalance - 1) * 100
                  : (1 - nextBalance / balance) * 100,
              timestamp,
            };
          }
        })
        .filter((balance) => balance !== undefined);
    };
    if (ledgers.length) {
      const todayMidnight = getTodayMidnightTime();
      const lastLedgerBalance = ledgers.find((ledger) => ledger.balance > 1);
      const currDayledger = ledgers
        .filter((ledger) => ledger.description && ledger.description.match('Position closed'))
        .find((ledger) => ledger.timestamp < todayMidnight);

      if (currDayledger) {
        //@TODO remove after '2021-02-27
        setCurrDayBalance(
          new Date().toJSON().slice(0, 10) === '2021-02-27' ? 112 : currDayledger.balance
        );
      }
      if (lastLedgerBalance) {
        setCurrBalance(lastLedgerBalance.balance);
      }
      setLastBalanceChanges(getLastLedgersChanges());
    }
  }, [ledgers]);

  return (
    <div style={{ overflow: 'visible' }}>
      <div
        className="ui-collapsible__header"
        style={{
          borderBottom: '1px solid rgba(100, 100, 100, 0.3)',
          cursor: 'pointer',
        }}
      >
        <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '30%' }}>
            <RefreshIcon
              className="fa fa-refresh fa-fw bfx-blue"
              onClick={() => setRefreshCount(refreshCount + 1)}
            />
            <span className="ui-collapsible__title">Jesteś tu po to żeby zarabiać</span>
          </div>
          <div style={{ width: '60%' }}>
            <BalanceSlider
              data={{
                currBalance,
                currDayBalance,
                currBalanceModifier: position && position.lossProfitValue,
              }}
            />
          </div>
          <div style={{ width: '30%' }}>
            <PositionStatus position={position} />
          </div>
        </div>
      </div>
      <ContentWrapper>
        <ContentContainer style={{ width: '35%' }}>
          <MarginForm lossProfitPerc={position && position.lossProfitPerc} />
        </ContentContainer>
        <ContentContainer style={{ width: '50%' }}>
          <BalanceChart ledgers={ledgers} />
        </ContentContainer>
        <ContentContainer style={{ width: '35%' }}>
          <SimpleBar style={{ maxHeight: '230px' }}>
            Last changes
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
        </ContentContainer>
      </ContentWrapper>
    </div>
  );
};

export default App;
