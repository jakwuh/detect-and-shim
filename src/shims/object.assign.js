module.exports = {
    check: function () {
        return !Object.assign;
    },
    shim: function (cb) {
        require.ensure([], function() {
            require('object.assign').shim();
            cb();
        });
    }
};
