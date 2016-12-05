require('../src/index')([
    'promise',
    'promise.finally',
    'object.assign',
    {
        check: function () {
            return false;
        },
        shim: function () {
            throw "error";
        }
    }
], function() {
    console.log('hooray');
});
