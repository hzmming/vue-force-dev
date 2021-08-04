(function () {
  "use strict";
  const defineProperty = Object.defineProperty;
  Object.defineProperty = function (...args) {
    // [native code]
    try {
      hack(...args);
    } catch (e) {
      console.error("vue-force-dev", e);
    }
    return defineProperty(...args);
  };

  function hack(...args) {
    const prop = args[1];
    if (prop !== "config") return;
    const obj = args[0];
    if (!isVue(obj)) return;
    const descriptor = args[2];
    const config = descriptor.get();
    config.devtools = !0;
    config.productionTip = !0;
    // console.log(config);
  }

  // There's no good way. Just use it
  function isVue(obj) {
    if (typeof obj !== "function") return false;
    const prototype = obj.prototype;
    if (!prototype) return false;
    const signs = [
      "_init",
      "$set",
      "$delete",
      "$watch",
      "$on",
      "$once",
      "$off",
      "$emit",
      "_update",
      "$forceUpdate",
      "$destroy",
    ];
    const objKeys = Object.keys(prototype);
    return signs.every((i) => objKeys.includes(i));
  }
})();
