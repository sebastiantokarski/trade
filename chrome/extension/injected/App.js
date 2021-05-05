import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  BalanceChart,
  BalanceSlider,
  PositionStatus,
  MarginForm,
  LastChanges,
  Statistics,
} from './components';
import { getLedgersHistory } from './api';
import { getTodayMidnightTime, getWebsocketAuthData, log } from './utils';
import { WEBSOCKET_API_HOST, MAXIMUM_LOSS, TARGET_PROFIT } from './config';

const ContentWrapper = styled.div`
  display: flex;
  height: 280px;
  padding: 10px;
`;
const ContentContainer = styled.div`
  padding: 10px;
`;

const RefreshIcon = styled.i`
  margin-right: 0.4rem;
`;

const App = () => {
  const [ledgers, setLedgers] = useState([]);
  const [position, setPosition] = useState();
  const [balance, setBalance] = useState(0);
  const [currBalance, setCurrBalance] = useState(0);
  const [currDayBalance, setCurrDayBalance] = useState(0);
  const [refreshCount, setRefreshCount] = useState(0);
  const [isPositionOnPage, setPositionOnPage] = useState(false);
  const [positionLossProfitPerc, setPositionLossProfitPerc] = useState(null);
  const [warningMode, setWarningMode] = useState(false);

  const minimalBalance = currDayBalance - currDayBalance * MAXIMUM_LOSS;
  const targetBalance = currDayBalance + currDayBalance * TARGET_PROFIT;

  useEffect(() => {
    if (!warningMode && currBalance < minimalBalance) {
      setWarningMode(true);
    } else if (warningMode && currBalance > minimalBalance) {
      setWarningMode(false);
    }
  }, [currBalance]);

  useEffect(() => {
    if (position) {
      setCurrBalance(balance + position.lossProfitValue);
    }
  }, [position]);

  useEffect(() => {
    const injectedByExtension = document.querySelector('.ui-panel.injected-by-extension');

    if (warningMode) {
      injectedByExtension.classList.add('warning-mode');
    } else {
      injectedByExtension.classList.remove('warning-mode');
    }
  }, [warningMode]);

  useEffect(() => {
    const performWebSocketMsg = (msg) => {
      if (msg.event === 'auth' && msg.status === 'FAILED') {
        log('error', 'FAILED CONNECT TO WEBSOCKET', msg);
      } else if (msg[1] === 'wu' && msg[2][0] === 'margin' && msg[2][1] === 'USD') {
        setBalance(msg[2][2]);
      } else if (msg[1] === 'ws') {
        const walletMarginUSD = msg[2].find(
          (wallet) => wallet[0] === 'margin' && wallet[1] === 'USD'
        );

        if (walletMarginUSD) {
          setBalance(walletMarginUSD[2]);
        }
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

      if (response) {
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
            <span className="ui-collapsible__title">Refresh</span>
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
        <ContentContainer style={{ width: '30%' }}>
          <MarginForm currBalance={currBalance} />
        </ContentContainer>
        <ContentContainer style={{ width: '30%' }}>
          <BalanceChart ledgers={ledgers} />
        </ContentContainer>
        <ContentContainer style={{ width: '30%' }}>
          <LastChanges ledgers={ledgers} currDayBalance={currDayBalance} />
        </ContentContainer>
        <ContentContainer style={{ width: '10%' }}>
          <Statistics />
        </ContentContainer>
      </ContentWrapper>
    </div>
  );
};

export default App;
