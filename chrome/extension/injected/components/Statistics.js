import React, { useState, useEffect } from 'react';
import { useTimer } from 'use-timer';
import styled from 'styled-components';
import { formatTime, getTodayDate } from '../utils';
import { STORAGE_TS } from '../../config';
import { getStorageData, setStorageData } from '../storage';

const StatisticsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const RunningStatus = styled.div`
  margin-bottom: 5px;

  @keyframes arrows {
    0%,
    100% {
      color: black;
      transform: translateY(0);
    }
    50% {
      color: #3ab493;
      transform: translateY(20px);
    }
  }

  span {
    --delay: 0s;
    animation: arrows 1s var(--delay) infinite ease-in;
  }
`;

const Statistics = () => {
  const { time, start, pause, status, advanceTime } = useTimer();

  const [initialTime, setInitialTime] = useState(0);

  useEffect(() => {
    const handleVisibilityChange = () => (document.hidden ? pause() : start());
    const handleWindowBlur = () => (document.hidden ? pause() : null);

    window.addEventListener('focus', start);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', start);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(async () => {
    const timeFromStorage = (await getStorageData(`${STORAGE_TS}_${getTodayDate()}`)) || 0;

    if (timeFromStorage) {
      setInitialTime(timeFromStorage);
    }
  }, []);

  useEffect(async () => {
    if (status === 'RUNNNING' && initialTime) {
      advanceTime(initialTime);
      setInitialTime(0);
    }
  }, [status]);

  useEffect(() => setStorageData({ [`${STORAGE_TS}_${getTodayDate()}`]: time }), [time]);

  return (
    <StatisticsWrapper>
      {status === 'RUNNING' && (
        <RunningStatus>
          <span>↓</span>
          <span style={{ '--delay': '0.1s' }}>↓</span>
          <span style={{ '--delay': '0.3s' }}>↓</span>
          <span style={{ '--delay': '0.4s' }}>↓</span>
          <span style={{ '--delay': '0.5s' }}>↓</span>
        </RunningStatus>
      )}
      <span>Time spent today: {formatTime(time)}</span>
    </StatisticsWrapper>
  );
};

export default Statistics;
