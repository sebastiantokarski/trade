import {
  TRADE_HOST,
  DEFAULT_ICON_PATH,
  PROFIT_ICON_PATH,
  LOSS_ICON_PATH,
  POSITIVE_COLOR,
  NEGATIVE_COLOR,
  CHECK_BADGE_INTERVAL,
} from '../config';

let isPositive = false;
let lastUpdateTimestamp = new Date().getTime();

const setDefaultBadge = () => {
  chrome.browserAction.setIcon({ path: DEFAULT_ICON_PATH });
  chrome.browserAction.setBadgeText({ text: '' });
};

chrome.extension.onMessage.addListener((request) => {
  const { badgeValue } = request;

  lastUpdateTimestamp = new Date().getTime();

  if (badgeValue) {
    chrome.browserAction.setBadgeText({
      text: Math.abs(badgeValue).toFixed(2),
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: badgeValue > 0 ? POSITIVE_COLOR : NEGATIVE_COLOR,
    });

    if (badgeValue > 0 && !isPositive) {
      isPositive = true;

      chrome.browserAction.setIcon({ path: PROFIT_ICON_PATH });
    } else if (badgeValue < 0 && isPositive) {
      isPositive = false;

      chrome.browserAction.setIcon({ path: LOSS_ICON_PATH });
    }
  } else if (!badgeValue) {
    setDefaultBadge();
  }
});

chrome.tabs.onRemoved.addListener(() => {
  chrome.tabs.query({}, (tabs) => {
    const tradeTab = tabs.find((tab) => tab.url.match(TRADE_HOST));

    if (!tradeTab) {
      setDefaultBadge();
    }
  });
});

setInterval(() => {
  const currTimestamp = new Date().getTime();

  if (lastUpdateTimestamp && currTimestamp - lastUpdateTimestamp > CHECK_BADGE_INTERVAL) {
    setDefaultBadge();
  }
}, CHECK_BADGE_INTERVAL);
