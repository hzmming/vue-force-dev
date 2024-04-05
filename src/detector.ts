import { unpackVueDevtoolsMessage } from './utils/index';

// Light up my extension icon
window.addEventListener('message', (e) => {
  const data = unpackVueDevtoolsMessage(e.data);
  if (e.source === window && data.vueDetected) {
    chrome.runtime.sendMessage(data);
  }
});

const script = document.createElement('script');
script.src = chrome.runtime.getURL('detectorExec.js');
script.onload = () => {
  script.remove();
};
(document.head || document.documentElement).appendChild(script);
