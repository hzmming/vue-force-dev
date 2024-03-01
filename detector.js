(() => {
  const isBrowser = typeof navigator !== "undefined";
  const isFirefox = isBrowser && navigator.userAgent.indexOf("Firefox") > -1;

  const unpackVueDevtoolsMessage = (data) =>
    data.key === "_vue-devtools-send-message" ? data.message : data;

  // Light up my extension icon
  window.addEventListener("message", (e) => {
    const data = unpackVueDevtoolsMessage(e.data);
    if (e.source === window && data.vueDetected) {
      chrome.runtime.sendMessage(data);
    }
  });

  // Receive the message of vue devtools, crack and replay it.
  function listenVueDevtoolsMessage() {
    const LOG_MARK = [
      "%c vue-force-dev ",
      `padding: 1px; border-radius: 0 3px 3px 0; color: #fff; background: #42b883`,
    ];

    const unpackVueDevtoolsMessage = (data) =>
      data.key === "_vue-devtools-send-message" ? data.message : data;

    const messageHandler = (e) => {
      try {
        if (!window.__VUE_DEVTOOLS_GLOBAL_HOOK__) return;
        const data = unpackVueDevtoolsMessage(e.data);
        if (e.source === window && data.vueDetected) {
          // skip
          if (data.devtoolsEnabled) {
            window.removeEventListener("message", messageHandler);
            return;
          }

          detect(e);
        }
      } catch (e) {
        console.error(
          ...LOG_MARK,
          e,
          "\n\nreport issues: https://github.com/hzmming/vue-force-dev/issues"
        );
        window.removeEventListener("message", messageHandler);
      }
    };
    window.addEventListener("message", messageHandler);

    function detect(e) {
      const data = unpackVueDevtoolsMessage(e.data);
      let delay = 1000
      let detectRemainingTries = 10

      function executeDetection() {
        // force devtools to be enabled
        if (crack(data)) {
          // replay
          window.postMessage(e.data, "*");
          return
        }

        if (detectRemainingTries > 0) {
          detectRemainingTries--
          setTimeout(() => {
            executeDetection()
          }, delay)
          delay *= 5
        }
      }

      setTimeout(() => {
        executeDetection()
      }, 100)
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

    function crackVue2(Vue) {
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
      devtools.emit("init", Vue);

      return true;
    }

    function crackVue3() {
      const app = getVueRootInstance(3);
      if (!app) return false; // Vue may not be finished yet
      const devtools = window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
      devtools.enabled = true;
      const version = app.version;
      devtools.emit("app:init" /* APP_INIT */, app, version, {
        // TODO I can't get the right value.
        // Now only one use has found. (packages/app-backend-vue3/src/components/util.ts - isFragment)
        // Fragment,
        // Text,
        // Comment,
        // Static,
      });

      // TODO How to trigger the devtools refresh when vue instance changed.
      // Maybe `devtools.emit("flush")` can be used, but i don't know when, where and how to use it.

      return true;
    }

    function getVueRootInstance(version) {
      const signProperty = version === 2 ? "__vue__" : "__vue_app__";
      const all = document.querySelectorAll("*");
      for (let i = 0; i < all.length; i++) {
        if (all[i][signProperty]) {
          return all[i][signProperty];
        }
      }
    }
  }

  // inject the hook
  if (document instanceof Document) {
    installScript(listenVueDevtoolsMessage);
  }

  function installScript(fn) {
    const source = ";(" + fn.toString() + ")(window)";

    if (isFirefox) {
      // eslint-disable-next-line no-eval
      window.eval(source); // in Firefox, this evaluates on the content window
    } else {
      const script = document.createElement("script");
      script.textContent = source;
      document.documentElement.appendChild(script);
      script.parentNode.removeChild(script);
    }
  }
})();
