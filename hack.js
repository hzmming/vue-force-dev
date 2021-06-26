(function() {
  "use strict";
  const defineProperty = Object.defineProperty;
  Object.defineProperty = function(...args) {
    // [native code]
    hack(...args);
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

  // 没什么好的方法，能用就行
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
      "$destroy"
    ];
    const objKeys = Object.keys(prototype);
    return signs.every(i => objKeys.includes(i));
  }
})();
