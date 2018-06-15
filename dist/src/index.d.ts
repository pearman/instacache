import { Observable } from 'rxjs';
export declare class InstaCache {
    private cacheEntries;
    cache(key: string, generator: () => any): InstaCache;
    isInitialized(key: string): boolean;
    has(key: string): boolean;
    get(key: string, miss?: () => any): Observable<any> | undefined;
    refresh(key: string): Observable<any> | undefined;
    update(key: string, value: any): boolean;
    clear(key: string): boolean;
    clearAll(): void;
    private _toObservable(input);
}
