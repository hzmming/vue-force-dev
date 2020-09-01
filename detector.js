(() => {
  window.addEventListener("message", (e) => {
    if (e.source === window && e.data.vueDetected) {
      chrome.runtime.sendMessage(e.data);
    }
  });

  function detect() {
    setTimeout(() => {
      const all = document.querySelectorAll("*");
      let el;
      for (let i = 0; i < all.length; i++) {
        if (all[i].__vue__) {
          el = all[i];
          break;
        }
      }
      if (el) {
        let Vue = Object.getPrototypeOf(el.__vue__).constructor;
        while (Vue.super) {
          Vue = Vue.super;
        }
        window.postMessage(
          {
            devtoolsEnabled: Vue.config.devtools,
            vueDetected: true,
          },
          "*"
        );
      }
    }, 100);
  }
  detect();
})();
