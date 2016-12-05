module.exports = {
    check: function () {
        return typeof Promise === 'undefined';
    },
    shim: function (cb) {
        require.ensure([], function() {
            require('../global').Promise = require('promise-polyfill');
            cb();
        });
    }
};
