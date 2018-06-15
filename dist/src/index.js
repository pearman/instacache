"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var operators_1 = require("rxjs/operators");
var rxjs_1 = require("rxjs");
var InstaCache = /** @class */ (function () {
    function InstaCache() {
        this.cacheEntries = {};
    }
    InstaCache.prototype.cache = function (key, generator) {
        this.cacheEntries[key] = {
            generator: generator,
            source: new rxjs_1.ReplaySubject(1),
            initialized: false
        };
        return this;
    };
    InstaCache.prototype.isInitialized = function (key) {
        return lodash_1.get(this.cacheEntries, [key, 'initialized']) === true;
    };
    InstaCache.prototype.has = function (key) {
        return lodash_1.has(this.cacheEntries, key);
    };
    InstaCache.prototype.get = function (key, miss) {
        var entry = lodash_1.get(this.cacheEntries, key);
        if (entry) {
            if (!entry.initialized) {
                this.refresh(key);
                entry.initialized = true;
            }
            // Create a fresh reference to prevent mutability bugs
            return entry.source.pipe(operators_1.map(lodash_1.identity));
        }
        else if (miss) {
            return this.cache(key, miss).get(key);
        }
        return undefined;
    };
    InstaCache.prototype.refresh = function (key) {
        var entry = lodash_1.get(this.cacheEntries, key);
        if (entry) {
            var result = this._toObservable(entry.generator()).pipe(operators_1.take(1), operators_1.tap(function (res) { return entry.source.next(res); }), operators_1.tap(function () { return (entry.initialized = true); }), operators_1.share());
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
    InstaCache.prototype._toObservable = function (input) {
        if (input instanceof rxjs_1.Observable)
            return input;
        // Promise.resolve will turn values into promises,
        // and will have no effect on existing promises
        return rxjs_1.from(Promise.resolve(input));
    };
    return InstaCache;
}());
exports.InstaCache = InstaCache;
//# sourceMappingURL=index.js.map