module.exports = {
    check() {
        return !Array.prototype.includes;
    },
    shim(cb) {
        require.ensure([], () => {
            require('array-includes').shim();
            cb();
        }, 'shims/array-includes');
    }
};
