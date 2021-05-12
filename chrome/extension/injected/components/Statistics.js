import React, { Fragment, useEffect } from 'react';
import { useTimer } from 'use-timer';

const Statistics = () => {
  const { time, start, pause, reset, status } = useTimer();

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
      <p>Time spent today: {time}</p>
      {status === 'RUNNING' && <p>Running...</p>}
    </Fragment>
  );
};

export default Statistics;
