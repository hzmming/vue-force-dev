import { error } from './utils/console';
import type {
  VueDevtoolsMessage,
  LegacyVueDevtoolsMessage,
  VueDevtoolsMessageDetail,
} from './types/message';
import { unpackVueDevtoolsMessage } from './utils/index';
import { crack } from './crack';

// Receive the message of vue devtools, crack and replay it.
function listenVueDevtoolsMessage() {
  const messageHandler = (
    e: MessageEvent<VueDevtoolsMessage | LegacyVueDevtoolsMessage>,
  ) => {
    try {
      if (!window.__VUE_DEVTOOLS_GLOBAL_HOOK__) return;

      const data: VueDevtoolsMessageDetail = unpackVueDevtoolsMessage(e.data);
      if (e.source === window && data.vueDetected) {
        // skip
        if (data.devtoolsEnabled) {
          window.removeEventListener('message', messageHandler);
          return;
        }

        detect(e);
      }
    } catch (e) {
      error(e);
      window.removeEventListener('message', messageHandler);
    }
  };

  window.addEventListener('message', messageHandler);
}

function detect(
  e: MessageEvent<VueDevtoolsMessage | LegacyVueDevtoolsMessage>,
) {
  const data = unpackVueDevtoolsMessage(e.data);
  let delay = 1000;
  let detectRemainingTries = 10;

  function executeDetection() {
    // force devtools to be enabled
    if (crack(data)) {
      // replay
      window.postMessage(e.data, '*');
      return;
    }

    if (detectRemainingTries > 0) {
      detectRemainingTries--;
      setTimeout(() => {
        executeDetection();
      }, delay);
      delay *= 5;
    }
  }

  setTimeout(() => {
    executeDetection();
  }, 100);
}

// inject the hook
if (document instanceof Document) {
  listenVueDevtoolsMessage();
}
