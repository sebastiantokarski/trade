import React from 'react';
import { Provider } from 'react-redux';
import TradingViewWidget, { Themes } from 'react-tradingview-widget';

const Root = (props) => {
  const { store } = props;

  return (
    <Provider store={store}>
      <TradingViewWidget
        height={300}
        symbol="EOSUSD"
        theme={Themes.dark}
        timezone="Europe/Warsaw"
      />
    </Provider>
  );
};

export default Root;
