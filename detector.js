(() => {
  const isBrowser = typeof navigator !== "undefined";
  const isFirefox = isBrowser && navigator.userAgent.indexOf("Firefox") > -1;

  // Light up my extension icon
  window.addEventListener("message", (e) => {
    if (e.source === window && e.data.vueDetected) {
      chrome.runtime.sendMessage(e.data);
    }
  });

  // Receive the message of vue devtools, crack and replay it.
  function listenVueDevtoolsMessage() {
    const messageHander = (e) => {
      try {
        if (!window.__VUE_DEVTOOLS_GLOBAL_HOOK__) return;
        if (e.source === window && e.data.vueDetected) {
          const data = e.data;
          // skip
          if (data.devtoolsEnabled) {
            window.removeEventListener("message", messageHander);
            return;
          }

          // force devtools enabled
          crack(data);

          // replay
          window.postMessage(data, "*");
        }
      } catch (e) {
        console.error("vue-force-dev", e);
        window.removeEventListener("message", messageHander);
      }
    };
    window.addEventListener("message", messageHander);

    function crack(data) {
      data.devtoolsEnabled = true;

      // Nuxt.js
      if (data.nuxtDetected) {
        let Vue;

        if (window.$nuxt) {
          Vue = window.$nuxt.$root && window.$nuxt.$root.constructor;
        }

        // Vue 2
        if (Vue) {
          crackVue2(Vue);
        } else {
          // Vue 3.2.14+
          crackVue3();
        }

        return;
      }

      // Vue 3
      const vueDetected = !!window.__VUE__;
      if (vueDetected) {
        crackVue3();
        return;
      }

      // Vue 2
      crackVue2();
    }

    function crackVue2(Vue) {
      const devtools = window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

      if (!Vue) {
        const app = getVueRootInstance(2);
        Vue = Object.getPrototypeOf(app).constructor;
        while (Vue.super) {
          Vue = Vue.super;
        }
      }

      Vue.config.devtools = true;
      devtools.emit("init", Vue);
    }

    function crackVue3() {
      const devtools = window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
      devtools.enabled = true;
      const app = getVueRootInstance(3);
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
