import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import Chart from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
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
import { fetchPageInfo, observeCurrToken } from './redux/slices/pageInfoSlice';
import { WARNING_MODE_CLASS } from '../config';

Chart.plugins.register([ChartAnnotation]);

const AppWrapper = styled.div`
  overflow: visible !important;
`;

const ContentWrapper = styled.div`
  display: flex;
  height: 280px;
  padding: 10px 0 0;
`;
const ContentContainer = styled.div`
  padding: 10px;
  width: ${(props) => props.width};
`;

const ChartContainer = styled.div`
  width: 95%;
  margin: 0 auto;
  text-align: center;
  padding-bottom: 35px;
`;

const App = () => {
  const dispatch = useDispatch();

  const [warningMode, setWarningMode] = useState(false);

  const { plPerc } = useSelector((state) => state.position);
  const { minBalance, currBalance } = useSelector((state) => state.account);

  useEffect(() => {
    dispatch(fetchPageInfo());
    dispatch(observeCurrToken());
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
        <ContentContainer width={'33%'}>
          <MarginForm />
        </ContentContainer>
        {/* <ContentContainer width={'25%'}>
          <Statistics />
        </ContentContainer> */}
        <ContentContainer width={'33%'}>
          <LastChanges />
        </ContentContainer>
        <ContentContainer width={'33%'}>
          <TickersStatus />
        </ContentContainer>
      </ContentWrapper>
      <ChartContainer>
        <BalanceChart />
      </ChartContainer>
      <StartTradeDayPopup />
    </AppWrapper>
  );
};

export default App;
