"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../src/index");
var of_1 = require("rxjs/observable/of");
var Observable_1 = require("rxjs/Observable");
var operators_1 = require("rxjs/operators");
var lodash_1 = require("lodash");
test('get of valid key returns observable', function () {
    var testCache = new index_1.InstaCache();
    testCache.cache('value', function () { return 3; });
    expect(testCache.get('value') instanceof Observable_1.Observable).toBe(true);
});
test('get of non-existant key returns undefined', function () {
    var testCache = new index_1.InstaCache();
    expect(testCache.get('value')).toBe(undefined);
});
test('refresh of non-existant key returns undefined', function () {
    var testCache = new index_1.InstaCache();
    expect(testCache.refresh('value')).toBe(undefined);
});
test('update of non-existant key returns false', function () {
    var testCache = new index_1.InstaCache();
    expect(testCache.update('value', 10)).toBe(false);
});
test('update of existing key returns true', function () {
    var testCache = new index_1.InstaCache();
    testCache.get('key', function () { return 10; });
    expect(testCache.update('key', 15)).toBe(true);
});
test('get with generator will init a key if it does not exist', function (done) {
    var testCache = new index_1.InstaCache();
    testCache.get('observable', function () { return of_1.of(3); });
    testCache.get('observable').subscribe(function (result) {
        expect(result).toBe(3);
        done();
    });
});
test('refresh calls the generator', function (done) {
    var testCache = new index_1.InstaCache();
    var key = 'observable';
    testCache.cache(key, function () { return new Date().getTime(); });
    testCache
        .refresh(key)
        .pipe(operators_1.tap(function (result) {
        expect(lodash_1.isNumber(result)).toBe(true);
    }), operators_1.delay(10), operators_1.mergeMap(function (result1) {
        return testCache.refresh(key).pipe(operators_1.map(function (result2) { return [result1, result2]; }));
    }))
        .subscribe(function (_a) {
        var result1 = _a[0], result2 = _a[1];
        expect(result1).not.toBe(result2);
        done();
    });
});
test('update pushs a new value to subscribers', function (done) {
    var testCache = new index_1.InstaCache();
    var key = 'test';
    var result1;
    testCache
        .get(key, function () { return 10; })
        .pipe(operators_1.take(2))
        .subscribe(function (result) {
        if (!result1)
            result1 = result;
        else {
            expect(result1).toBe(10);
            expect(result).toBe(15);
            done();
        }
    });
    // After some time emit a fresh value
    setTimeout(function () { return testCache.update(key, 15); }, 100);
});
test('cache observable', function (done) {
    var testCache = new index_1.InstaCache();
    testCache.get('observable', function () { return of_1.of(3); }).subscribe(function (result) {
        expect(result).toBe(3);
        done();
    });
});
test('cache promise', function (done) {
    var testCache = new index_1.InstaCache();
    testCache.get('promise', function () { return Promise.resolve(3); }).subscribe(function (result) {
        expect(result).toBe(3);
        done();
    });
});
test('cache value', function (done) {
    var testCache = new index_1.InstaCache();
    testCache.get('value', function () { return 3; }).subscribe(function (result) {
        expect(result).toBe(3);
        done();
    });
});
//# sourceMappingURL=index.test.js.map