import { enablePiniaDevtools } from './plugins/index';
import { error } from './utils/console';
import { unpackVueDevtoolsMessage } from './utils/index';

// Receive the message of vue devtools, crack and replay it.
function listenVueDevtoolsMessage() {
  const messageHandler = (e) => {
    try {
      if (!window.__VUE_DEVTOOLS_GLOBAL_HOOK__) return;
      const data = unpackVueDevtoolsMessage(e.data);
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

  function detect(e) {
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

  function crack(data) {
    let result;

    // Nuxt.js
    if (data.nuxtDetected) {
      let Vue;

      if (window.$nuxt) {
        Vue = window.$nuxt.$root && window.$nuxt.$root.constructor;
      }

      // Vue 2
      if (Vue) {
        result = crackVue2(Vue);
      } else {
        // Vue 3.2.14+
        result = crackVue3();
      }
    }
    // Vue 3
    else if (window.__VUE__) {
      result = crackVue3();
    }
    // Vue 2
    else {
      result = crackVue2();
    }

    if (result) data.devtoolsEnabled = true;

    return result;
  }

  function crackVue2(Vue?) {
    if (!Vue) {
      const app = getVueRootInstance(2);
      if (!app) return false; // Vue may not be finished yet
      Vue = Object.getPrototypeOf(app).constructor;
      while (Vue.super) {
        Vue = Vue.super;
      }
    }

    const devtools = window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
    Vue.config.devtools = true;
    devtools.emit('init', Vue);

    return true;
  }

  function crackVue3() {
    const app = getVueRootInstance(3);
    if (!app) return false; // Vue may not be finished yet
    const devtools = window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
    devtools.enabled = true;
    const version = app.version;
    devtools.emit('app:init' /* APP_INIT */, app, version, {
      Fragment: Symbol.for('v-fgt'),
      Text: Symbol.for('v-txt'),
      Comment: Symbol.for('v-cmt'),
      Static: Symbol.for('v-stc'),
    });

    // TODO How to trigger the devtools refresh when vue instance changed.
    // Maybe `devtools.emit("flush")` can be used, but i don't know when, where and how to use it.

    try {
      enablePiniaDevtools(app, 3);
    } catch (e) {
      error(e);
    }

    return true;
  }

  function getVueRootInstance(version) {
    const signProperty = version === 2 ? '__vue__' : '__vue_app__';
    const all = document.querySelectorAll('*');
    for (let i = 0; i < all.length; i++) {
      if (all[i][signProperty]) {
        return all[i][signProperty];
      }
    }
  }
}

// inject the hook
if (document instanceof Document) {
  listenVueDevtoolsMessage();
}
