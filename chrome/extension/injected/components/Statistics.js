import React, { Fragment, useEffect } from 'react';
import { useTimer } from 'use-timer';

const Statistics = () => {
  const { time, start, pause, status } = useTimer();

  useEffect(() => {
    window.addEventListener('focus', start);
    window.addEventListener('blur', pause);

    document.addEventListener('visibilitychange', (ev) => {
      if (document.hidden) {
        pause();
      } else {
        start();
      }
    });

    return () => {
      window.removeEventListener('focus', start);
      window.addEventListener('blur', pause);
    };
  }, []);

  return (
    <Fragment>
      <p>Time spent today: {(time / 60).toFixed(0)}m</p>
      {status === 'RUNNING' && <p>Running...</p>}
    </Fragment>
  );
};

export default Statistics;
