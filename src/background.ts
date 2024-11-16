import type { VueDevtoolsMessageDetail } from './types/message';

chrome.runtime.onMessage.addListener(
  (req: VueDevtoolsMessageDetail, sender) => {
    if (sender.tab && req.vueDetected) {
      chrome.action.setIcon({
        tabId: sender.tab.id,
        path: {
          16: `icons/16.png`,
          48: `icons/48.png`,
          128: `icons/128.png`,
        },
      });
      chrome.action.setPopup({
        tabId: sender.tab.id,
        popup: `popups/enabled.html`,
      });
    }
  },
);
