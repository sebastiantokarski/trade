export const WEBSOCKET_API_HOST = '';
export const WEBSOCKET_API_KEY = '';
export const WEBSOCKET_API_SECRET_KEY = '';

export const API_ORIGIN = '';
export const API_KEY = '';
export const API_SECRET_KEY = '';

export const TRADE_HOST = '';

export const DEFAULT_ICON_PATH = './favicon/logo.png';
export const PROFIT_ICON_PATH = './favicon/logo_profit.png';
export const LOSS_ICON_PATH = './favicon/logo_loss.png';

export const POSITIVE_COLOR = '#16b157';
export const NEGATIVE_COLOR = '#f05359';

export const DEBUG_MODE = true;

export const MAXIMUM_PERC_LOSS = 0.15;
export const TARGET_PERC_PROFIT = 0.2;

export const LEDGERS_HISTORY_LIMIT = 1000;
export const LEDGERS_CATEGORY_POSITION_CLOSED = 22;

export const CHECK_BADGE_INTERVAL = 60000;
export const TICKERS_STATUS_INTERVAL = 30000;

export const RISK_OPTIONS = {
  min_profit: { name: 'min_profit', perc: 3, label: 'Minimal profit' },
  no_risk: { name: 'no_risk', perc: 0, label: 'No risk' },
  minimal: { name: 'minimal', perc: -3, label: 'Minimal risk' },
  standard: { name: 'standard', perc: -6, label: 'Standard risk' },
  high: { name: 'high', perc: -9, label: 'High risk' },
  very_high: { name: 'very_high', perc: -12, label: 'Very high risk' },
  maximum: { name: 'liquidation', perc: -15, label: 'Liquidation' },
};

export const WARNING_MODE_CLASS = 'warning-mode';
export const STORAGE_STR = '_str';

export const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const NUMBER_OF_ATTEMPTS = 2;
