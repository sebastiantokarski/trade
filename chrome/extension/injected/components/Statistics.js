import React, { Fragment } from 'react';
import { useTimer } from 'use-timer';

const Statistics = () => {
  const { time, start, pause, reset, status } = useTimer();

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
      <p>Elapsed time: {time}</p>
      {status === 'RUNNING' && <p>Running...</p>}
    </Fragment>
  );
};

export default Statistics;
