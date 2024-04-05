import { devtoolsPlugin, registerPiniaDevtools } from './vendors/pinia';

export const enablePiniaDevtools = (vueRootInstance, vueVersion) => {
  if (vueVersion === 2) {
    // There are no plans to support the Vue2 version of Pinia. If needed, please submit an issue and let me know
    return;
  }

  const pinia = vueRootInstance.config.globalProperties.$pinia;
  if (!pinia) return;
  pinia.use(devtoolsPlugin);
  registerPiniaDevtools(vueRootInstance, pinia);
};
