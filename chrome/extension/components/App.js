import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SimpleBar from 'simplebar-react';
import { BalanceChart, BalanceSlider, PositionStatus, MarginForm } from '../components';
import { getLedgersHistory } from '../api';
import { timeSince, getTodayMidnightTime, getWebsocketAuthData } from '../utils';
import { WEBSOCKET_API_HOST } from '../config';

const ContentWrapper = styled.div`
  display: flex;
  height: 260px;
  padding: 10px;
`;
const ContentContainer = styled.div`
  padding: 10px;
`;

const Value = styled.span`
  display: inline-block;
  margin: 0.1rem 1rem;
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
  const [isPositionOnPage, setPositionOnPage] = useState(false);
  const [positionLossProfitPerc, setPositionLossProfitPerc] = useState(null);

  useEffect(() => {
    const performWebSocketMsg = (msg) => {
      if (msg.event === 'auth' && msg.status === 'FAILED') {
        console.error('WEBSOCKET FAILED', msg);
      } else if (msg[1] === 'wu' && msg[2][0] === 'margin' && msg[2][1] === 'USD') {
        setCurrBalance(msg[2][2]);
      } else if (msg[1] === 'pu') {
        setPosition({
          symbol: msg[2][0],
          basePrice: msg[2][3],
          lossProfitValue: msg[2][6],
          lossProfitPerc: msg[2][7],
          leverage: msg[2][9],
        });
      }
    };

    const wss = new WebSocket(WEBSOCKET_API_HOST);

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
    const pageContent = document.getElementById('app-page-content');

    const observer = new MutationObserver(() => {
      const positionsTable = document.querySelector('[data-qa-id="positions-table"]');

      if (!isPositionOnPage && positionsTable) {
        setPositionOnPage(true);
      } else if (isPositionOnPage && !positionsTable) {
        // @TODO
        setPositionOnPage(false);
        chrome.runtime.sendMessage({ badgeValue: null });
      }
    });

    observer.observe(pageContent, {
      childList: true,
      subtree: true,
    });
  }, []);

  useEffect(() => {
    if (!isPositionOnPage && position) {
      chrome.runtime.sendMessage({ badgeValue: position.lossProfitPerc });
    } else if (positionLossProfitPerc) {
      chrome.runtime.sendMessage({ badgeValue: positionLossProfitPerc });
    }
  }, [position, positionLossProfitPerc, isPositionOnPage]);

  useEffect(() => {
    if (!isPositionOnPage) return;

    const lossProfitPerc = document.querySelector(
      '[data-qa-id="positions-table"] span:nth-child(8)'
    );

    const observer = new MutationObserver(() => {
      if (lossProfitPerc) {
        setPositionLossProfitPerc(Number(lossProfitPerc.textContent));
      }
    });

    observer.observe(lossProfitPerc, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer && observer.disconnect();
  }, [isPositionOnPage]);

  useEffect(async () => {
    const ledgersHistory = await getLedgersHistory(1000);

    setLedgers(ledgersHistory);
  }, [refreshCount]);

  useEffect(() => {
    const getLastLedgersChanges = () => {
      const lastPositionLedgers = ledgers
        .filter((ledger) => ledger.description && ledger.description.match('Position closed'))
        .slice(0, 21);

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
    if (ledgers.length) {
      const todayMidnight = getTodayMidnightTime();
      const lastLedgerBalance = ledgers.find((ledger) => ledger.balance > 1);
      const currDayledger = ledgers
        .filter((ledger) => ledger.description && ledger.description.match('Position closed'))
        .find((ledger) => ledger.timestamp < todayMidnight);

      if (currDayledger) {
        setCurrDayBalance(currDayledger.balance);
      }
      if (lastLedgerBalance) {
        setCurrBalance(lastLedgerBalance.balance);
      }
      setLastBalanceChanges(getLastLedgersChanges());
    }
  }, [ledgers]);

  const sumLastLossProfit = lastbalanceChanges.reduce((a, b) => a + b.change, 0).toFixed(2);
  const sumLastProfit = lastbalanceChanges
    .reduce((a, b) => (b.change > 0 ? a + b.change : a), 0)
    .toFixed(2);
  const sumLastLoss = lastbalanceChanges
    .reduce((a, b) => (b.change < 0 ? a - b.change : a), 0)
    .toFixed(2);

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
            <span className="ui-collapsible__title">Be careful</span>
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
            <PositionStatus
              position={position}
              isPositionOnPage={isPositionOnPage}
              positionLossProfitPerc={positionLossProfitPerc}
            />
          </div>
        </div>
      </div>
      <ContentWrapper>
        <ContentContainer style={{ width: '35%' }}>
          <MarginForm currBalance={currBalance} />
        </ContentContainer>
        <ContentContainer style={{ width: '40%' }}>
          <BalanceChart ledgers={ledgers} />
        </ContentContainer>
        <ContentContainer style={{ width: '35%' }}>
          <SimpleBar style={{ maxHeight: '230px' }}>
            <div>
              <span>Last changes</span>
              <Value className="bfx-red-text">{sumLastLoss}%</Value>
              <Value className="bfx-green-text">{sumLastProfit}%</Value>
              <Value className={sumLastLossProfit > 0 ? 'bfx-green-text' : 'bfx-red-text'}>
                {sumLastLossProfit}%
              </Value>
            </div>
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
