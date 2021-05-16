export const setStorageData = (data) =>
  new Promise((resolve, reject) =>
    chrome.storage.sync.set(data, () =>
      chrome.runtime.lastError ? reject(Error(chrome.runtime.lastError.message)) : resolve()
    )
  );

export const getStorageData = (key) =>
  new Promise((resolve, reject) =>
    chrome.storage.sync.get(key, (result) =>
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve(result[key])
    )
  );

export const clearStorage = () =>
  new Promise((resolve, reject) =>
    chrome.storage.sync.clear(() =>
      chrome.runtime.lastError ? reject(Error(chrome.runtime.lastError.message)) : resolve()
    )
  );
