import { Observable } from 'rxjs/Observable';
export declare class InstaCache {
  private cacheEntries;
  cache(key: string, generator: () => any): InstaCache;
  get(key: string, miss?: () => any): Observable<any> | undefined;
  refresh(key: string): Observable<any> | undefined;
  update(key: string, value: any): boolean;
  private _initialize(entry, key);
  private _toObservable(input);
}
