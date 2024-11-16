import {
  VUE_DEVTOOLS_MESSAGE_KEY,
  LEGACY_VUE_DEVTOOLS_MESSAGE_KEY,
  VueDevtoolsMessage,
  LegacyVueDevtoolsMessage,
  VueDevtoolsMessageDetail,
} from '../types/message';

export const unpackVueDevtoolsMessage = (
  data: VueDevtoolsMessage | LegacyVueDevtoolsMessage,
): VueDevtoolsMessageDetail =>
  VUE_DEVTOOLS_MESSAGE_KEY === data.key
    ? data.data
    : LEGACY_VUE_DEVTOOLS_MESSAGE_KEY === data.key
      ? data.message
      : data;
