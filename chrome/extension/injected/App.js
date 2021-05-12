import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { BalanceChart, BalanceSlider, MarginForm, LastChanges, Statistics } from './components';
import { getWebsocketAuthData, log } from './utils';
import { WEBSOCKET_API_HOST } from '../config';
import { fetchLedgers } from './redux/slices/accountSlice';
import { startObservingPosition } from './redux/slices/positionSlice';

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

  const [refreshCount, setRefreshCount] = useState(0);
  const [warningMode, setWarningMode] = useState(false);

  const { plPerc } = useSelector((state) => state.position);
  const { minBalance, performDataSuccess, currBalance } = useSelector((state) => state.account);

  useEffect(() => {
    dispatch(fetchLedgers());
  }, [dispatch, refreshCount]);

  useEffect(() => {
    dispatch(startObservingPosition());
  }, [dispatch]);

  useEffect(() => {
    chrome.runtime.sendMessage({ badgeValue: plPerc });
  }, [plPerc]);

  useEffect(() => {
    if (!warningMode && currBalance < minBalance) {
      setWarningMode(true);
    } else if (warningMode && currBalance > minBalance) {
      setWarningMode(false);
    }
  }, [currBalance]);

  useEffect(() => {
    const injectedByExtension = document.querySelector('.ui-panel.injected-by-extension');

    if (warningMode) {
      injectedByExtension.classList.add('warning-mode');
    } else {
      injectedByExtension.classList.remove('warning-mode');
    }
  }, [warningMode]);

  // useEffect(() => {
  //   const performWebSocketMsg = (msg) => {
  //     if (msg.event === 'auth' && msg.status === 'FAILED') {
  //       log('error', 'FAILED CONNECT TO WEBSOCKET', msg);
  //     } else if (msg[1] === 'wu' && msg[2][0] === 'margin' && msg[2][1] === 'USD') {
  //       setCurrActiveBalance(msg[2][2]);
  //     } else if (msg[1] === 'ws') {
  //       const walletMarginUSD = msg[2].find(
  //         (wallet) => wallet[0] === 'margin' && wallet[1] === 'USD'
  //       );

  //       if (walletMarginUSD) {
  //         //setCurActiveBalance(walletMarginUSD[2]);
  //       }
  //     } else if (msg[1] === 'pu') {
  //       setPosition({
  //         symbol: msg[2][0],
  //         basePrice: msg[2][3],
  //         lossProfitValue: msg[2][6],
  //         lossProfitPerc: msg[2][7],
  //         leverage: msg[2][9],
  //       });
  //     }
  //   };

  //   const wss = new WebSocket(WEBSOCKET_API_HOST);

  //   wss.onopen = () => wss.send(JSON.stringify(getWebsocketAuthData()));

  //   wss.onmessage = (msg) => {
  //     const response = JSON.parse(msg.data);

  //     if (response) {
  //       performWebSocketMsg(response);
  //     }
  //   };

  //   return () => wss.close();
  // }, []);

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
              onClick={() => setRefreshCount((count) => count + 1)}
            />
            <span className="ui-collapsible__title">Refresh</span>
          </div>
          <div style={{ width: '60%' }}>{performDataSuccess && <BalanceSlider />}</div>
        </div>
      </div>
      <ContentWrapper>
        <ContentContainer style={{ width: '30%' }}>
          <MarginForm blockMarginActions={currBalance < minBalance} />
        </ContentContainer>
        <ContentContainer style={{ width: '30%' }}>
          <BalanceChart />
        </ContentContainer>
        <ContentContainer style={{ width: '30%' }}>
          <LastChanges />
        </ContentContainer>
        <ContentContainer style={{ width: '10%' }}>
          <Statistics />
        </ContentContainer>
      </ContentWrapper>
    </div>
  );
};

export default App;
