"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var of_1 = require("rxjs/observable/of");
var Observable_1 = require("rxjs/Observable");
test('get of valid key returns observable', function () {
    var testCache = new index_1.InstaCache();
    testCache.cache('value', function () { return 3; });
    expect(testCache.get('value') instanceof Observable_1.Observable).toBe(true);
});
test('get of invalid key returns undefined', function () {
    var testCache = new index_1.InstaCache();
    expect(testCache.get('value')).toBe(undefined);
});
test('cache observable', function (done) {
    var testCache = new index_1.InstaCache();
    testCache.cache('observable', function () { return of_1.of(3); });
    testCache.get('observable').subscribe(function (result) {
        expect(result).toBe(3);
        done();
    });
});
test('cache promise', function (done) {
    var testCache = new index_1.InstaCache();
    testCache.cache('promise', function () { return Promise.resolve(3); });
    testCache.get('promise').subscribe(function (result) {
        expect(result).toBe(3);
        done();
    });
});
test('cache value', function (done) {
    var testCache = new index_1.InstaCache();
    testCache.cache('value', function () { return 3; });
    testCache.get('value').subscribe(function (result) {
        expect(result).toBe(3);
        done();
    });
});
//# sourceMappingURL=index.test.js.map