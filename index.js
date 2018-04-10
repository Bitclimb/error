const procDir = process.cwd();
const re = /^(?:\()(.+)(?::)(\d+)(?::.+)$/;

const handler = (err, p = '') => {
  if (!err) {
    console.error('No StackTrace', p);
    return;
  }
  console.error('Reason:', err.message || err);
  if (err.code) {
    console.error('Code:', err.code);
  }
  let stack = [];
  if (err.stack) {
    stack = err.stack.split('\n');
    stack = stack.slice(1);
    stack = stack.filter(x => !x.includes('node_modules'));
    stack = stack.map(x => x.trim().split(' ').slice(1).map(x => {
      if (x.includes(procDir)) {
        return x.replace(re, (m, g1, g2) => `[${g1} => Line: ${g2}]`);
      }
      return x;
    }).join(' => '));

    stack.forEach((v, i) => {
      if (i > 0 && !v.includes(procDir)) {
        return;
      }
      console.error(`Stack(${i}): ${v}`);
    });
  }
};

exports.catch = () => {
  process.on('unhandledRejection', handler);
  process.on('uncaughtException', (err) => {
    err.message = `[Exception] ${err.message}`;
    handler(err);
    process.exit('SIGINT');
  });
};
