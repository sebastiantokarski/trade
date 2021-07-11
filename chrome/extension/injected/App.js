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
  TickersStatus,
} from './components';
import { startObservingPosition } from './redux/slices/positionSlice';
import { fetchPageInfo } from './redux/slices/pageInfoSlice';
import { WARNING_MODE_CLASS } from '../config';

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

  useEffect(() => {
    dispatch(fetchPageInfo());
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
    <AppWrapper className="injected_by_extension">
      <PanelHeader />
      <ContentWrapper>
        <ContentContainer width={'25%'}>
          <MarginForm />
        </ContentContainer>
        <ContentContainer width={'25%'}>
          <BalanceChart />
          <Statistics />
        </ContentContainer>
        <ContentContainer width={'25%'}>
          <LastChanges />
        </ContentContainer>
        <ContentContainer width={'25%'}>
          <TickersStatus />
        </ContentContainer>
      </ContentWrapper>
      <StartTradeDayPopup />
    </AppWrapper>
  );
};

export default App;
