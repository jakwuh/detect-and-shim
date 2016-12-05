module.exports = function (shims, cb) {
    var counter = shims.length;

    var reduceCallback = function () {
        counter--;
        if (counter === 0) {
            cb();
        }
    };

    var processShim = function(shimmer) {
        if (shimmer.check()) {
            shimmer.shim(reduceCallback);
        } else {
            reduceCallback();
        }
    };

    while (shims.length) {
        var shim = shims.shift();

        if (typeof shim === 'string') {
            processShim(require('./shims/' + shim));
        } else if (typeof shim === 'object') {
            processShim(shim);
        } else {
            reduceCallback();
        }
    }
};
