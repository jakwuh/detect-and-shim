module.exports = {
    check() {
        return !Promise.prototype.finally;
    },
    shim(cb) {
        require.ensure([], () => {
            require('promise.prototype.finally').shim();
            cb();
        }, 'shims/promise.finally');
    }
};
