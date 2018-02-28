"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var lodash_1 = require("lodash");
var operators_1 = require("rxjs/operators");
var fromPromise_1 = require("rxjs/observable/fromPromise");
var ReplaySubject_1 = require("rxjs/ReplaySubject");
function logErrorIf(condition, error) {
    if (condition)
        console.error('[instacache] ' + error);
}
var InstaCache = /** @class */ (function () {
    function InstaCache() {
        this.cacheEntries = {};
    }
    InstaCache.prototype.cache = function (key, generator) {
        logErrorIf(!lodash_1.isFunction(generator), "generator for \"" + key + "\" must be a function: () => value | Promise | Observable");
        var source = new ReplaySubject_1.ReplaySubject(1);
        this.cacheEntries[key] = {
            generator: generator,
            source: source
        };
        this.refresh(key);
        return this;
    };
    InstaCache.prototype.get = function (key) {
        var entry = lodash_1.get(this.cacheEntries, key);
        // Create a fresh reference to prevent mutability bugs
        if (entry)
            return entry.source.pipe(operators_1.map(function (x) { return x; }));
        return undefined;
    };
    InstaCache.prototype.refresh = function (key) {
        var entry = lodash_1.get(this.cacheEntries, key);
        if (entry) {
            this._toObservable(entry.generator())
                .pipe(operators_1.take(1)) // Prevent subscription leakage
                .subscribe(function (result) { return entry.source.next(result); });
            return true;
        }
        return false;
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