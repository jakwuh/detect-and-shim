module.exports = {
    check() {
        return !Object.assign;
    },
    shim(cb) {
        require.ensure([], () => {
            require('object.assign').shim();
            cb();
        }, 'shims/object.assign');
    }
};
