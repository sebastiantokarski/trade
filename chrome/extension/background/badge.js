import {
  TRADE_HOST,
  DEFAULT_ICON_PATH,
  PROFIT_ICON_PATH,
  LOSS_ICON_PATH,
  POSITIVE_COLOR,
  NEGATIVE_COLOR,
} from '../config';

let isPositive = false;

const setDefaultBadge = () => {
  chrome.browserAction.setIcon({ path: DEFAULT_ICON_PATH });
  chrome.browserAction.setBadgeText({ text: '' });
};

chrome.extension.onMessage.addListener((request) => {
  const { badgeValue } = request;

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
