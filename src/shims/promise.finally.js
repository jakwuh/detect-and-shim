module.exports = {
    check: function () {
        return !Promise.finally;
    },
    shim: function (cb) {
        require.ensure([], function() {
            require('promise.prototype.finally').shim();
            cb();
        });
    }
};
