const COLOR = {
  log: '#1475b2',
  info: '#606060',
  error: '#42b883',
};
const message = ({ type, params }) => {
  const LOG_MARK = [
    '%c vue-force-dev',
    `padding: 1px; border-radius: 0 3px 3px 0; color: #fff; background:${COLOR[type]}`,
  ];
  console[type](
    ...LOG_MARK,
    ...params,
    '\n\nreport issues: https://github.com/hzmming/vue-force-dev/issues',
  );
};

export function error(...params) {
  message({ type: 'error', params });
}

export function log(...params) {
  message({ type: 'log', params });
}

export function info(...params) {
  message({ type: 'info', params });
}
