let isPositive = false;

chrome.extension.onMessage.addListener((request) => {
  const { badgeValue } = request;

  if (badgeValue) {
    chrome.browserAction.setBadgeText({
      text: Math.abs(badgeValue).toFixed(2),
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: badgeValue > 0 ? '#16b157' : '#f05359',
    });

    if (badgeValue > 0 && !isPositive) {
      isPositive = true;

      chrome.browserAction.setIcon({
        path: './favicon/logo_profit.png',
      });
    } else if (badgeValue < 0 && isPositive) {
      isPositive = false;

      chrome.browserAction.setIcon({
        path: './favicon/logo_loss.png',
      });
    }
  } else if (!badgeValue) {
    chrome.browserAction.setIcon({
      path: './favicon/logo.png',
    });
  }
});
