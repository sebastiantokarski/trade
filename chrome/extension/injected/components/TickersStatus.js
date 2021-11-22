import React, { useState } from 'react';
import SimpleBar from 'simplebar-react';
import styled from 'styled-components';
import { useInterval } from '../hooks';
import { MainWrapper, Title } from '../theme';
import { getData, getSymbolFromPathname } from '../utils';
import { TICKERS_STATUS_INTERVAL } from '../../config';

const BlockText = styled.span`
  display: inline-block;
  width: 25%;
  text-align: center;
`;

const TickersStatus = () => {
  const refreshTime = TICKERS_STATUS_INTERVAL / 1000;

  const [tickersHistory, setTickersHistory] = useState({});
  const [timeToRefresh, setTimeToRefresh] = useState(refreshTime);

  useInterval(() => {
    setTimeToRefresh((old) => (old <= 0 ? 0 : old - 1));
  }, 1000);

  useInterval(async () => {
    const tickersNodes = document.querySelectorAll(
      '.tickerlist__container [aria-label=row] .tickerlist__symbolcell'
    );
    const updatedTickersHistory = {};

    const setTickerPrice = (ticker, propName) => {
      const symbol = getSymbolFromPathname(ticker[0]);
      const avgPrice = (ticker[1] + ticker[3]) / 2;

      updatedTickersHistory[symbol] = updatedTickersHistory[symbol] || {};
      updatedTickersHistory[symbol][propName] = avgPrice;
    };

    if (tickersNodes.length) {
      const symbols = [...tickersNodes]
        .map((node) => getSymbolFromPathname(node.pathname))
        .join(',');

      const currTime = new Date().getTime();
      const tenSeconds = 10000;
      const earlier10m = currTime - 1000 * 60 * 10;
      const earlier30m = currTime - 1000 * 60 * 30;
      const earlier4h = currTime - 1000 * 60 * 240;

      const tickersCurrResp = await getData(
        `/v2/tickers/hist?symbols=${symbols}&start=${currTime - tenSeconds}`
      );
      const tickersCurrResp1 = await getData(
        `/v2/tickers/hist?symbols=${symbols}&start=${earlier10m}&end=${earlier10m + tenSeconds}`
      );

      const tickersCurrResp2 = await getData(
        `/v2/tickers/hist?symbols=${symbols}&start=${earlier30m}&end=${earlier30m + tenSeconds}`
      );

      const tickersCurrResp3 = await getData(
        `/v2/tickers/hist?symbols=${symbols}&start=${earlier4h}&end=${earlier4h + tenSeconds}`
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

  const getBlockTextProps = (value) => {
    if (value > 3) {
      return { style: { fontWeight: 'bold', color: '#05ff84e3' } };
    } else if (value < -3) {
      return { style: { fontWeight: 'bold', color: 'rgb(223 43 43)' } };
    }
    return { className: value > 0 ? 'bfx-green-text' : 'bfx-red-text' };
  };

  return (
    <MainWrapper>
      <Title>
        Tickers Status <span>{timeToRefresh}s</span>
      </Title>
      <SimpleBar style={{ maxHeight: '205px' }}>
        <div style={{ fontSize: '13px' }}>
          <BlockText>Token</BlockText>
          <BlockText>4h</BlockText>
          <BlockText>30m</BlockText>
          <BlockText>10m</BlockText>
        </div>
        {Object.keys(tickersHistory)
          .sort((a, b) => a.localeCompare(b))
          .map((symbol, index) => {
            const ticker = tickersHistory[symbol];
            const { current, tenMinutes, thirtyMinutes, fourHours } = ticker;
            const tenMinutesChange = (((tenMinutes - current) / current) * -100).toFixed(2);
            const thirtyMinutesChange = (((thirtyMinutes - current) / current) * -100).toFixed(2);
            const fourHoursChange = (((fourHours - current) / current) * -100).toFixed(2);

            return (
              <div key={`${index}_ticker`} style={{ fontSize: '13px' }}>
                <BlockText>{symbol.replace(/^t|:|USD/g, '')}</BlockText>
                <BlockText {...getBlockTextProps(fourHoursChange)}>
                  {isNaN(fourHoursChange) ? '-' : `${fourHoursChange} %`}
                </BlockText>
                <BlockText {...getBlockTextProps(thirtyMinutesChange)}>
                  {isNaN(thirtyMinutesChange) ? '-' : `${thirtyMinutesChange} %`}
                </BlockText>
                <BlockText {...getBlockTextProps(tenMinutesChange)}>
                  {isNaN(tenMinutesChange) ? '-' : `${tenMinutesChange} %`}
                </BlockText>
              </div>
            );
          })}
      </SimpleBar>
    </MainWrapper>
  );
};

export default TickersStatus;
