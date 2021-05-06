import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  BalanceChart,
  BalanceSlider,
  PositionStatus,
  MarginForm,
  LastChanges,
  Statistics,
} from './components';
import { getWebsocketAuthData, log } from './utils';
import { WEBSOCKET_API_HOST } from '../config';
import { fetchLedgers } from './redux/slices/accountSlice';

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
  const dispatch = useDispatch();

  const [position, setPosition] = useState();
  const [currActiveBalance, setCurrActiveBalance] = useState(0);
  const [refreshCount, setRefreshCount] = useState(0);
  const [isPositionOnPage, setPositionOnPage] = useState(false);
  const [plValue, setPlValue] = useState(null);
  const [plPerc, setPlPerc] = useState(null);
  const [warningMode, setWarningMode] = useState(false);

  const {
    ledgers,
    minBalance,
    targetBalance,
    performDataSucces,
    currBalance,
    currDayBalance,
  } = useSelector((state) => state.account);

  useEffect(() => {
    dispatch(fetchLedgers());
  }, [dispatch, refreshCount]);

  useEffect(() => {
    if (!warningMode && currBalance < minBalance) {
      setWarningMode(true);
    } else if (warningMode && currBalance > minBalance) {
      setWarningMode(false);
    }
  }, [currBalance]);

  useEffect(() => {
    if (position) {
      setCurrActiveBalance(currBalance + position.lossProfitValue);
    }
  }, [position]);

  useEffect(() => {
    if (plValue) {
      setCurrActiveBalance(currBalance + plValue);
    }
  }, [plValue]);

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
        setCurrActiveBalance(msg[2][2]);
      } else if (msg[1] === 'ws') {
        const walletMarginUSD = msg[2].find(
          (wallet) => wallet[0] === 'margin' && wallet[1] === 'USD'
        );

        if (walletMarginUSD) {
          //setCurActiveBalance(walletMarginUSD[2]);
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
    } else if (plPerc) {
      chrome.runtime.sendMessage({ badgeValue: plPerc });
    }
  }, [position, plPerc, isPositionOnPage]);

  useEffect(() => {
    if (!isPositionOnPage) return;

    const plPercEl = document.querySelector('[data-qa-id="positions-table"] span:nth-child(8)');

    const observer = new MutationObserver(() => {
      const plValueEl = document.querySelector(
        '[data-qa-id="positions-table"] span:nth-child(7) span'
      );

      if (plPercEl) {
        setPlPerc(Number(plPercEl.textContent));
      }
      if (setPlValue) {
        setPlValue(Number(plValueEl.textContent));
      }
    });

    observer.observe(plPercEl, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer && observer.disconnect();
  }, [isPositionOnPage]);

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
            {performDataSucces && (
              <BalanceSlider
                minBalance={minBalance}
                currDayBalance={currDayBalance}
                currActiveBalance={currActiveBalance}
                targetBalance={targetBalance}
              />
            )}
          </div>
          <div style={{ width: '30%' }}>
            <PositionStatus
              position={position}
              isPositionOnPage={isPositionOnPage}
              positionLossProfitPerc={plPerc}
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
