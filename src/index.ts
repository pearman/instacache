import { has, identity, get, unset, forEach } from 'lodash';
import { map, share, take, tap } from 'rxjs/operators';
import { from, Observable, ReplaySubject } from 'rxjs';

interface CacheEntry {
  generator: () => Observable<any>;
  source: ReplaySubject<any>;
  initialized: boolean;
}

export class InstaCache {
  private cacheEntries: { [key: string]: CacheEntry } = {};

  public cache(key: string, generator: () => any): InstaCache {
    this.cacheEntries[key] = {
      generator,
      source: new ReplaySubject(1),
      initialized: false
    };
    return this;
  }

  public isInitialized(key: string): boolean {
    return get(this.cacheEntries, [key, 'initialized']) === true;
  }

  public has(key: string): boolean {
    return has(this.cacheEntries, key);
  }

  public get(key: string, miss?: () => any): Observable<any> | undefined {
    const entry = <CacheEntry>get(this.cacheEntries, key);

    if (entry) {
      if (!entry.initialized) {
        this.refresh(key);
        entry.initialized = true;
      }
      // Create a fresh reference to prevent mutability bugs
      return entry.source.pipe(map(identity));
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
        tap(res => entry.source.next(res)),
        tap(() => (entry.initialized = true)),
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

  public clear(key: string): boolean {
    const entry = <CacheEntry>get(this.cacheEntries, key);
    if (entry) {
      entry.source.complete();
      unset(this.cacheEntries, key);
      return true;
    }
    return false;
  }

  public clearAll(): void {
    forEach(this.cacheEntries, (entry, key) => this.clear(key));
  }

  private _toObservable(input: any): Observable<any> {
    if (input instanceof Observable) return input;

    // Promise.resolve will turn values into promises,
    // and will have no effect on existing promises
    return from(Promise.resolve(input));
  }
}
