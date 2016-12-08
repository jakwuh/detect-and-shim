const {expect} = require('chai');
const shim = require('../src/index');

function tryExecute(fn, done) {
    try {
        fn();
        done();
    } catch (e) {
        done(e);
    }
}

describe('detect-and-shim', function () {
    let counters, timers, shims;

    beforeEach(function () {
        counters = [0, 0, 0, 0];
        timers = [0, 0, 0, 0];
        let increaseAndCall = (i, a = true) => cb => {
            counters[i]++;
            let hrTime = process.hrtime();
            timers[i] = hrTime[0] * 1000000 + hrTime[1] / 1000;
            a ? setTimeout(cb, 4) : cb();
        };
        shims = [{
            check: () => false,
            shim: increaseAndCall(0),
            idx: 0
        }, {
            check: () => true,
            shim: increaseAndCall(1),
            idx: 1
        }, {
            check: () => true,
            shim: increaseAndCall(2, false),
            idx: 2
        }, {
            check: () => true,
            shim: increaseAndCall(3),
            idx: 3
        }];
    });

    function expectConfigToThrow(config, done) {
        shim(config, err => {
            tryExecute(() => {
                expect(err).to.be.instanceOf(Error);
            }, done);
        });
    }

    it('does not allow duplicate strings 1', function (done) {
        expectConfigToThrow([
            ['promise.finally', ['promise']],
            'promise.finally'
        ], done);
    });

    it('does not allow duplicate strings 2', function (done) {
        expectConfigToThrow([
            'promise.finally',
            'promise.finally'
        ], done);
    });

    it('does not allow duplicate shims 1', function (done) {
        expectConfigToThrow([
            shims[1],
            [shims[1], [shims[2]]]
        ], done);
    });

    it('does not allow duplicate shims 2', function (done) {
        expectConfigToThrow([
            shims[0],
            shims[0]
        ], done);
    });

    it('fails on circular dependencies 1', function (done) {
        expectConfigToThrow([
            [shims[1], [shims[1]]]
        ], done);
    });

    it('fails on circular dependencies 2', function (done) {
        expectConfigToThrow([
            [shims[1], ['object.assign']],
            ['object.assign', [shims[1]]]
        ], done);
    });

    it('fails on circular dependencies 3', function (done) {
        expectConfigToThrow([
            'promise',
            [shims[1], ['object.assign']],
            ['object.assign', ['promise', shims[2]]],
            [shims[2], [shims[1]]]
        ], done);
    });

    it('fails on unsatisfied dependencies', function (done) {
        expectConfigToThrow([
            ['object.assign', [shims[1]]]
        ], done);
    });

    it('works in correct order', function (done) {
        shim([
            [shims[0], [shims[1]]],
            shims[1],
            [shims[2], [shims[0], shims[3]]],
            [shims[3]]
        ], err => { // 1 3 (0) 2
            tryExecute(() => {
                expect(err).to.be.undefined;
                expect(timers[1]).to.be.lessThan(timers[3]);
                expect(timers[3]).to.be.lessThan(timers[2]);
                expect(counters).to.eql([0, 1, 1, 1]);
            }, done);
        })
    });

    it('works with duplicate dependencies', function (done) {
        shim([
            [shims[1], [shims[2], shims[0], shims[2]]],
            shims[2],
            [shims[0], [shims[2]]]
        ], err => { // 2 1
            tryExecute(() => {
                expect(err).to.be.undefined;
                expect(counters).to.eql([0, 1, 1, 0]);
                expect(timers[2]).to.be.lessThan(timers[1]);
            }, done);
        })
    });

    it('actually works', function (done) {
        global.Promise = undefined;
        shim([
            ['promise.finally', ['promise']],
            'promise',
        ], err => {
            tryExecute(() => {
                expect(err).to.be.undefined;
                expect(global.Promise).not.to.be.undefined;
                expect(global.Promise.prototype.finally).to.be.instanceOf(Function);
            }, done);
        })
    });

});

describe('shims', function () {

    function checkShim(name, done) {
        let {shim, check} = require('../src/shims/' + name);
        expect(check()).to.eql(true);
        shim(err => {
            tryExecute(() => {
                expect(err).to.be.undefined;
                expect(check(), 'Expected shim ' + name + ' to work properly').to.be.false;
            }, done);
        });
    }

    it('object.assign', function (done) {
        Object.assign = undefined;
        checkShim('object.assign', done);
    });

    it('promise', function (done) {
        global.Promise = undefined;
        checkShim('promise', done);
    });

    it('promise.finally', function (done) {
        Promise.prototype.finally = undefined;
        checkShim('promise.finally', done);
    });

    it('array.includes', function (done) {
        delete Array.prototype.includes;
        checkShim('array.includes', done);
    });

});
