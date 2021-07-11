import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';
import styled from 'styled-components';
import { useInterval } from '../hooks';
import { MainWrapper, Title } from '../theme';
import { getData } from '../utils';
import { TICKERS_STATUS_INTERVAL } from '../../config';

const BlockText = styled.span`
  width: 55px;
  display: inline-block;
  text-align: center;
`;

const BlockTokenText = styled.span`
  display: inline-block;
  width: 40px;
`;

const TickersStatus = () => {
  const refreshTime = TICKERS_STATUS_INTERVAL / 1000;

  const { tickers } = useSelector((state) => state.pageInfo);

  const [tickersHistory, setTickersHistory] = useState({});
  const [timeToRefresh, setTimeToRefresh] = useState(refreshTime);

  useInterval(() => {
    setTimeToRefresh((old) => (old <= 0 ? 0 : old - 1));
  }, 1000);

  useInterval(async () => {
    const updatedTickersHistory = {};

    const setTickerPrice = (ticker, propName) => {
      const symbol = ticker[0];
      const avgPrice = (ticker[1] + ticker[3]) / 2;

      updatedTickersHistory[symbol] = updatedTickersHistory[symbol] || {};
      updatedTickersHistory[symbol][propName] = avgPrice;
    };

    if (tickers.length) {
      const tickersSymbols = tickers.join(',').replace(/:/g, '');
      const currTime = new Date().getTime();
      const tenSeconds = 10000;
      const tenMinutesEarlier = currTime - 1000 * 60 * 10;
      const thirtyMinutesEarlier = currTime - 1000 * 60 * 30;
      const fourHoursEarlier = currTime - 1000 * 60 * 240;

      const tickersCurrResp = await getData(
        `/v2/tickers/hist?symbols=${tickersSymbols}&start=${currTime - tenSeconds}`
      );
      const tickersCurrResp1 = await getData(
        `/v2/tickers/hist?symbols=${tickersSymbols}&start=${tenMinutesEarlier}&end=${
          tenMinutesEarlier + tenSeconds
        }`
      );

      const tickersCurrResp2 = await getData(
        `/v2/tickers/hist?symbols=${tickersSymbols}&start=${thirtyMinutesEarlier}&end=${
          thirtyMinutesEarlier + tenSeconds
        }`
      );

      const tickersCurrResp3 = await getData(
        `/v2/tickers/hist?symbols=${tickersSymbols}&start=${fourHoursEarlier}&end=${
          fourHoursEarlier + tenSeconds
        }`
      );

      if (tickersCurrResp.length) {
        tickersCurrResp.forEach((ticker) => setTickerPrice(ticker, 'current'));
        tickersCurrResp1.forEach((ticker) => setTickerPrice(ticker, 'tenMinutes'));
        tickersCurrResp2.forEach((ticker) => setTickerPrice(ticker, 'thirtyMinutes'));
        tickersCurrResp3.forEach((ticker) => setTickerPrice(ticker, 'fourHours'));
      }
      setTimeToRefresh(refreshTime);
      setTickersHistory(updatedTickersHistory);
    }
  }, TICKERS_STATUS_INTERVAL);

  return (
    <MainWrapper>
      <Title>
        Tickers Status <span>{timeToRefresh}s</span>
      </Title>
      <SimpleBar style={{ maxHeight: '205px' }}>
        <div style={{ fontSize: '13px' }}>
          <BlockTokenText>Token</BlockTokenText>
          <BlockText>4h</BlockText>
          <BlockText>30m</BlockText>
          <BlockText>10m</BlockText>
        </div>
        {Object.keys(tickersHistory).map((symbol) => {
          const ticker = tickersHistory[symbol];
          const { current, tenMinutes, thirtyMinutes, fourHours } = ticker;
          const tenMinutesChange = (((tenMinutes - current) / current) * -100).toFixed(2);
          const thirtyMinutesChange = (((thirtyMinutes - current) / current) * -100).toFixed(2);
          const fourHoursChange = (((fourHours - current) / current) * -100).toFixed(2);

          return (
            <div style={{ fontSize: '13px' }}>
              <BlockTokenText>{symbol.replace('t', '').replace('USD', '')}</BlockTokenText>
              <BlockText className={fourHoursChange > 0 ? 'bfx-green-text' : 'bfx-red-text'}>
                {fourHoursChange} %
              </BlockText>
              <BlockText className={thirtyMinutesChange > 0 ? 'bfx-green-text' : 'bfx-red-text'}>
                {thirtyMinutesChange} %
              </BlockText>
              <BlockText className={tenMinutesChange > 0 ? 'bfx-green-text' : 'bfx-red-text'}>
                {tenMinutesChange} %
              </BlockText>
            </div>
          );
        })}
      </SimpleBar>
    </MainWrapper>
  );
};

export default TickersStatus;
