module.exports = {
    check() {
        return typeof Promise === 'undefined';
    },
    shim(cb) {
        require.ensure([], () => {
            require('../global').Promise = require('promise-polyfill');
            cb();
        }, 'shims/promise');
    }
};
