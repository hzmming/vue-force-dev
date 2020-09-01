(() => {
  function injectCustomJs(jsPath) {
    var temp = document.createElement("script");
    temp.async = false;
    temp.setAttribute("type", "text/javascript");
    /**
     * 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
     */
    temp.src = chrome.extension.getURL(jsPath);
    temp.onload = function () {
      this.parentNode.removeChild(this);
    };
    document.documentElement.appendChild(temp);
  }
  injectCustomJs("hack.js");
})();
