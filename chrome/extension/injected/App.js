import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  BalanceChart,
  PanelHeader,
  MarginForm,
  LastChanges,
  Statistics,
  StartTradeDayPopup,
} from './components';
import { startObservingPosition } from './redux/slices/positionSlice';
import { WARNING_MODE_CLASS, UPDATE_SESSION_INTERVAL } from '../config';
import { useInterval } from './hooks';

const AppWrapper = styled.div`
  overflow: visible !important;
`;

const ContentWrapper = styled.div`
  display: flex;
  height: 280px;
  padding: 10px;
`;
const ContentContainer = styled.div`
  padding: 10px;
  width: ${(props) => props.width};
`;

const App = () => {
  const dispatch = useDispatch();

  const [warningMode, setWarningMode] = useState(false);

  const { plPerc } = useSelector((state) => state.position);
  const { minBalance, currBalance } = useSelector((state) => state.account);

  useInterval(() => {
    const markerEquiv = document.getElementById('enable-toggle-market-equiv');

    if (markerEquiv) {
      markerEquiv.click();
    }
  }, UPDATE_SESSION_INTERVAL);

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
      injectedByExtension.classList.add(WARNING_MODE_CLASS);
    } else {
      injectedByExtension.classList.remove(WARNING_MODE_CLASS);
    }

    return () => {
      const classToRemove = document.querySelector(
        `.ui-panel.injected-by-extension.${WARNING_MODE_CLASS}`
      );

      if (classToRemove) {
        classToRemove.classList.remove(WARNING_MODE_CLASS);
      }
    };
  }, [warningMode]);

  return (
    <AppWrapper>
      <PanelHeader />
      <ContentWrapper>
        <ContentContainer width={'33%'}>
          <MarginForm />
        </ContentContainer>
        <ContentContainer width={'33%'}>
          <BalanceChart />
          <Statistics />
        </ContentContainer>
        <ContentContainer width={'33%'}>
          <LastChanges />
        </ContentContainer>
      </ContentWrapper>
      <StartTradeDayPopup />
    </AppWrapper>
  );
};

export default App;
