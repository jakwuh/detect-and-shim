// @flow
type ShimLike = {check: Function, shim: Function};
type ShimSource = string | ShimLike;
type ShimTuple = [ShimSource, Array<ShimSource>]
type ShimConfig = ShimSource | ShimTuple;
type Shim = ShimLike & {
    subscribers: Array<Shim>, // we will notify them after applying shim
    countdown: number, // number of dependencies
    processed: boolean,
    initialized: boolean,
    finished: boolean
}

module.exports = function (config: Array<ShimConfig>, callback?: Function) {

    function toString(obj) {
        return Object.prototype.toString.call(obj);
    }

    function isFunction(obj) {
        return typeof obj === 'function';
    }

    function isObject(obj) {
        return typeof obj === 'object';
    }

    function isString(obj) {
        return typeof obj === 'string';
    }

    function isArray(obj) {
        return isObject(obj) && toString(obj) === '[object Array]';
    }

    function iterate<T>(array: Array<T>, fn: Function): ?T {
        let length = array.length;
        for (let i = 0; i < length; ++i) {
            if (fn(array[i])) {
                return array[i];
            }
        }
    }

    function warn(error) {
        console.warn(error);
    }

    function throwError(error) {
        error = error instanceof Error ? error : new Error(error);
        if (callback) {
            callback(error);
        } else {
            warn(error);
        }
    }

    function setDefaults(shimLike: ShimLike): Shim {
        let shim = ((shimLike: any): Shim);
        shim.countdown = 0;
        shim.subscribers = [];
        shim.finished = false;
        shim.processed = false;
        shim.initialized = false;
        return shim;
    }

    function normalizeString(source: string): Shim {
        // @disable-flow
        return setDefaults(require('./shims/' + source));
    }

    function normalizeShimLike(source: ShimLike): Shim {
        return setDefaults(source);
    }

    function normalize(source): ?Shim {
        if (isString(source)) {
            return normalizeString(source);
        } else if (isObject(source) && isFunction(source.check) && isFunction(source.shim)) {
            return normalizeShimLike(source);
        } else {
            warn('Cannot parse shim: '+ source);
        }
    }

    let errors = [];
    let shimSet = [];
    let shimPairs = [];
    let remainedShims = 0;
    let progressShims = 0;
    let processing = true;

    function maybeFinish() {
        if (!processing && progressShims === 0) {
            if (remainedShims !== 0) {
                throwError('Shims have unsatisfied or circular dependencies');
            } else if (errors.length) {
                throwError(errors[0].toString());
            } else if (callback) {
                callback();
            }
        }
    }

    function onProcess(err, shim: Shim) {
        if (err) {
            errors.push(err);
        } else {
            iterate(shim.subscribers, (subscriber: Shim) => {
                --subscriber.countdown;
                process(subscriber);
            });
        }
        shim.finished = true;
        progressShims--;
        remainedShims--;
        maybeFinish();
    }

    function process(shim: Shim) {
        if (shim.countdown || shim.processed) {
            return; // shim dependencies are not ready || shim was already processed
        }

        progressShims++; // atomic
        shim.processed = true;

        try {
            if (shim.check()) {
                shim.shim(err => {
                    onProcess(err, shim)
                });
            } else {
                onProcess(undefined, shim)
            }
        } catch (e) {
            errors.push(e);
            if (!shim.finished) {
                progressShims--;
            }
        }
    }

    iterate(config, (source: ShimConfig) => {
        let shim, dependencies = [];

        if (isArray(source)) {
            shim = normalize(source[0]);

            if (isArray(source[1])) {
                // @disable-flow
                iterate(source[1], (source: ShimSource) => {
                    let dependency = normalize(source);
                    if (dependency) {
                        dependencies.push(dependency);
                    }
                });
            }
        } else {
            shim = normalize(source);
        }

        if (shim) {
            shimPairs.push([shim, dependencies]);
        }
    });

    let duplicate = iterate(shimPairs, (pair) => {
        let shim = pair[0];
        let dependencies = pair[1];
        if (shim.initialized) {
            return true; // set should be unique
        }
        shim.initialized = true;
        iterate(dependencies, (dependency) => {
            shim.countdown++;
            dependency.subscribers.push(shim);
        });
        shimSet.push(shim);
    });

    if (duplicate) {
        return throwError('Shims config contains duplicates');
    }

    remainedShims = shimSet.length;
    processing = true;
    iterate(shimSet, (shim: Shim) => {
        process(shim);
    });
    processing = false;

    maybeFinish();
};
