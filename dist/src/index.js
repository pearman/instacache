"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var lodash_1 = require("lodash");
var operators_1 = require("rxjs/operators");
var fromPromise_1 = require("rxjs/observable/fromPromise");
var ReplaySubject_1 = require("rxjs/ReplaySubject");
var InstaCache = /** @class */ (function () {
    function InstaCache() {
        this.cacheEntries = {};
    }
    InstaCache.prototype.cache = function (key, generator) {
        this.cacheEntries[key] = {
            generator: generator,
            source: new ReplaySubject_1.ReplaySubject(1),
            initialized: false
        };
        return this;
    };
    InstaCache.prototype.get = function (key, miss) {
        var entry = lodash_1.get(this.cacheEntries, key);
        if (entry) {
            this._initialize(entry, key);
            // Create a fresh reference to prevent mutability bugs
            return entry.source.pipe(operators_1.map(function (x) { return x; }));
        }
        else if (miss) {
            return this.cache(key, miss).get(key);
        }
        return undefined;
    };
    InstaCache.prototype.refresh = function (key) {
        var entry = lodash_1.get(this.cacheEntries, key);
        if (entry) {
            var result = this._toObservable(entry.generator()).pipe(operators_1.take(1), operators_1.tap(function (result) { return entry.source.next(result); }), operators_1.share());
            // Make sure the update occurs regardless of caller subscribing
            result.subscribe();
            return result;
        }
        return undefined;
    };
    InstaCache.prototype.update = function (key, value) {
        var entry = lodash_1.get(this.cacheEntries, key);
        if (entry) {
            entry.source.next(value);
            return true;
        }
        return false;
    };
    InstaCache.prototype.clear = function (key) {
        var entry = lodash_1.get(this.cacheEntries, key);
        if (entry) {
            entry.source.complete();
            lodash_1.unset(this.cacheEntries, key);
            return true;
        }
        return false;
    };
    InstaCache.prototype.clearAll = function () {
        var _this = this;
        lodash_1.forEach(this.cacheEntries, function (entry, key) { return _this.clear(key); });
    };
    InstaCache.prototype._initialize = function (entry, key) {
        if (!entry.initialized) {
            this.refresh(key);
            entry.initialized = true;
        }
    };
    InstaCache.prototype._toObservable = function (input) {
        if (input instanceof Observable_1.Observable)
            return input;
        // Promise.resolve will turn values into promises,
        // and will have no effect on existing promises
        return fromPromise_1.fromPromise(Promise.resolve(input));
    };
    return InstaCache;
}());
exports.InstaCache = InstaCache;
//# sourceMappingURL=index.js.map