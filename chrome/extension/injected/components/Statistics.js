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
      <div>
        <button onClick={start} className="ui-button">
          Start
        </button>
        <button onClick={pause} className="ui-button">
          Pause
        </button>
        <button onClick={reset} className="ui-button">
          Reset
        </button>
      </div>
      <p>Time spent today: {time}</p>
      {status === 'RUNNING' && <p>Running...</p>}
    </Fragment>
  );
};

export default Statistics;
