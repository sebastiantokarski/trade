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
  EndOfDayPopup,
  StartTradeDayPopup,
  TickersStatus,
} from './components';
import { isDateFromToday } from './utils';
import { startObservingPosition, stopObservingPosition } from './redux/slices/positionSlice';
import { fetchPageInfo } from './redux/slices/pageInfoSlice';
import { fetchLedgers } from './redux/slices/accountSlice';
import { WARNING_MODE_CLASS, NUMBER_OF_ATTEMPTS } from '../config';

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
  const [endOfTrade, setEndOfTrade] = useState(false);
  const [numberOfAttempts, setNumberOfAttempts] = useState(NUMBER_OF_ATTEMPTS);

  const { plPerc } = useSelector((state) => state.position);
  const { ledgers, minBalance, currBalance } = useSelector((state) => state.account);

  useEffect(() => {
    dispatch(fetchLedgers());
    dispatch(fetchPageInfo());
    dispatch(startObservingPosition());

    return () => dispatch(stopObservingPosition());
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

    return () => setWarningMode(false);
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

  useEffect(() => {
    const todayPositionsOnMinus = ledgers
      .filter((ledger) => ledger.description && ledger.description.match('Position closed'))
      .filter((ledger) => isDateFromToday(ledger.timestamp))
      .filter((ledger) => ledger.amout < 0);

    setNumberOfAttempts((currNumber) => currNumber - todayPositionsOnMinus.length);
  }, [ledgers]);

  useEffect(() => {
    if (numberOfAttempts <= 0) {
      setEndOfTrade(true);
    }
  }, [numberOfAttempts]);

  return (
    <AppWrapper className="injected_by_extension">
      <PanelHeader numberOfAttempts={numberOfAttempts} />
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
      <EndOfDayPopup isOpen={endOfTrade} />
    </AppWrapper>
  );
};

export default App;
