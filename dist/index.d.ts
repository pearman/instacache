import { Observable } from 'rxjs/Observable';
export declare class InstaCache {
    private cacheEntries;
    cache(key: string, generator: () => any): InstaCache;
    get(key: string): Observable<any>;
    refresh(key: string): boolean;
    private _toObservable(input);
}
