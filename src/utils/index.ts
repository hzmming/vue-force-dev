export const unpackVueDevtoolsMessage = (data) =>
  data.key === '_vue-devtools-send-message' ? data.message : data;
