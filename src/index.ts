import { Observable } from 'rxjs/Observable';
import { get, isFunction } from 'lodash';
import { map, take } from 'rxjs/operators';
import { fromPromise } from 'rxjs/observable/fromPromise';
import {ReplaySubject} from 'rxjs/ReplaySubject';

interface CacheEntry {
  generator: () => Observable<any>;
  source: ReplaySubject<any>;
}

function logErrorIf(condition: boolean, error: string) {
  if (condition) console.error('[instacache] ' + error);
}

export class InstaCache {
  private cacheEntries: { [key: string]: CacheEntry } = {};

  public cache(key: string, generator: () => any): InstaCache {
    logErrorIf(
      !isFunction(generator),
      `generator for "${key}" must be a function: () => value | Promise | Observable`
    );

    const source = new ReplaySubject(1);
    this.cacheEntries[key] = {
      generator,
      source
    };
    this.refresh(key);
    return this;
  }

  public get(key: string): Observable<any> {
    const entry = <CacheEntry>get(this.cacheEntries, key);
    // Create a fresh reference to prevent mutability bugs
    if (entry) return entry.source.pipe(map(x => x));
    return undefined;
  }

  public refresh(key: string): boolean {
    const entry = <CacheEntry>get(this.cacheEntries, key);
    if (entry) {
      this._toObservable(entry.generator())
        .pipe(take(1)) // Prevent subscription leakage
        .subscribe(result => entry.source.next(result));
      return true;
    }
    return false;
  }

  private _toObservable(input: any): Observable<any> {
    if (input instanceof Observable) return input;

    // Promise.resolve will turn values into promises,
    // and will have no effect on existing promises
    return fromPromise(Promise.resolve(input));
  }
}
