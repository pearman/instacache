import { Observable } from 'rxjs/Observable';
import { get, isFunction } from 'lodash';
import { map, share, take, tap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { ReplaySubject } from 'rxjs/ReplaySubject';

interface CacheEntry {
  generator: () => Observable<any>;
  source: ReplaySubject<any>;
  initialized: boolean;
}

export class InstaCache {
  private cacheEntries: { [key: string]: CacheEntry } = {};

  public cache(key: string, generator: () => any): InstaCache {
    const source = new ReplaySubject(1);
    this.cacheEntries[key] = {
      generator,
      source,
      initialized: false
    };
    return this;
  }

  public get(key: string, miss?: () => any): Observable<any> | undefined {
    const entry = <CacheEntry>get(this.cacheEntries, key);

    if (entry) {
      this._initialize(entry, key);
      // Create a fresh reference to prevent mutability bugs
      return entry.source.pipe(map(x => x));
    } else if (miss) {
      return this.cache(key, miss).get(key);
    }

    return undefined;
  }

  public refresh(key: string): Observable<any> | undefined {
    const entry = <CacheEntry>get(this.cacheEntries, key);
    if (entry) {
      const result = this._toObservable(entry.generator()).pipe(
        take(1),
        tap(result => entry.source.next(result)),
        share()
      );
      // Make sure the update occurs regardless of caller subscribing
      result.subscribe();
      return result;
    }
    return undefined;
  }

  public update(key: string, value: any): boolean {
    const entry = <CacheEntry>get(this.cacheEntries, key);
    if (entry) {
      entry.source.next(value);
      return true;
    }
    return false;
  }

  private _initialize(entry: CacheEntry, key: string): void {
    if (!entry.initialized) {
      this.refresh(key);
      entry.initialized = true;
    }
  }

  private _toObservable(input: any): Observable<any> {
    if (input instanceof Observable) return input;

    // Promise.resolve will turn values into promises,
    // and will have no effect on existing promises
    return fromPromise(Promise.resolve(input));
  }
}
