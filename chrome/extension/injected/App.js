import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { BalanceChart, BalanceSlider, MarginForm, LastChanges, Statistics } from './components';
import { fetchLedgers } from './redux/slices/accountSlice';
import { startObservingPosition } from './redux/slices/positionSlice';

const ContentWrapper = styled.div`
  display: flex;
  height: 280px;
  padding: 10px;
`;
const ContentContainer = styled.div`
  padding: 10px;
  width: ${(props) => props.width};
`;

const Header = styled.div`
  borderbottom: 1px solid rgba(100, 100, 100, 0.3);
  cursor: pointer;
`;

const HeaderWrapper = styled.div`
  width: 100%;
  display: flex;
  alignitems: center;
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

  return (
    <div style={{ overflow: 'visible' }}>
      <Header className="ui-collapsible__header">
        <HeaderWrapper>
          <div style={{ width: '20%' }}>
            <RefreshIcon
              className="fa fa-refresh fa-fw bfx-blue"
              onClick={() => setRefreshCount((count) => count + 1)}
            />
            <span className="ui-collapsible__title">Refresh</span>
          </div>
          <div style={{ width: '60%' }}>{performDataSuccess && <BalanceSlider />}</div>
        </HeaderWrapper>
      </Header>
      <ContentWrapper>
        <ContentContainer width={'30%'}>
          <MarginForm />
        </ContentContainer>
        <ContentContainer width={'30%'}>
          <BalanceChart />
        </ContentContainer>
        <ContentContainer width={'30%'}>
          <LastChanges />
        </ContentContainer>
        <ContentContainer width={'10%'}>
          <Statistics />
        </ContentContainer>
      </ContentWrapper>
    </div>
  );
};

export default App;
