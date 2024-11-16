export const VUE_DEVTOOLS_MESSAGE_KEY = '__VUE_DEVTOOLS_VUE_DETECTED_EVENT__';

export interface VueDevtoolsMessageDetail {
  devtoolsEnabled: boolean;
  vueDetected: boolean;
  nuxtDetected: boolean;
  vue2Detected: boolean;
  vitePressDetected: boolean;
  vitePluginDetected: boolean;
  vitePluginClientUrl: string;
}

export interface VueDevtoolsMessage {
  key: typeof VUE_DEVTOOLS_MESSAGE_KEY;
  data: VueDevtoolsMessageDetail;
}

// The key used by devtools v6 will be removed in the future
export const LEGACY_VUE_DEVTOOLS_MESSAGE_KEY = '_vue-devtools-send-message';

// The message structure used by devtools v6 will be removed in the future
export interface LegacyVueDevtoolsMessage {
  key: typeof LEGACY_VUE_DEVTOOLS_MESSAGE_KEY;
  message: VueDevtoolsMessageDetail;
}
