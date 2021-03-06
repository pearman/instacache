[![Build Status](https://travis-ci.org/pearman/instacache.svg?branch=master)](https://travis-ci.org/pearman/instacache) [![Coverage Status](https://coveralls.io/repos/github/pearman/instacache/badge.svg?branch=master)](https://coveralls.io/github/pearman/instacache?branch=master)

# InstaCache

> A simple, async caching library powered by RxJS.

## Installation

Install the library via NPM.

```bash
npm install --save instacache
```

## Getting Started

### Initializing the Cache

The cache is initialized simply with _key_ and a _generator_. The _generator_ is a lambda returning an Observable, Promise, or value. Internally the value yielded by the _generator_ is converted to an Observable. _The `cache` method is lazy_, meaning it will not generate its first result until it is requested with `get`.

```typescript
// Initialize cache with lazy entries
const instaCache = new InstaCache()
  .cache('markets', () =>
    this.http.get('http://api.bitcoincharts.com/v1/markets.json')
  )
  .cache('prices', () =>
    this.http.get('http://api.bitcoincharts.com/v1/weighted_prices.json')
  );
```

### Getting Cached Data

Use the `get` method to grab the current value and subscribe to any future updates.

```typescript
instaCache.get('markets').subscribe(data => console.log(data));
```

If race conditions are an issue, or if you want to eagerly retrieve your data, you can supply an optional second parameter to `get`.

```typescript
// If 'markets' does not exist, it will be initialized with the
// supplied generator.
instaCache
  .get('markets', () =>
    this.http.get('http://api.bitcoincharts.com/v1/markets.json')
  )
  .subscribe(data => console.log(data));
```

If your using **Angular**, you can load values directly in your template using the `async` pipe. Angular will automatically re-render new data if the cache is refreshed.

```html
<pre>{{instaCache.get('markets') | async}}</pre>
```

### Refreshing a Cache Entry

To get the latest value yielded by an existing _generator_ simply call the refresh method.

```typescript
instaCache.refresh('markets');
```

Note that `refresh` returns an `Observable<any>` so it can be subscribed too if you need the latest result.

```typescript
instaCache.refresh('markets').subscribe(console.log);
```

### Update an Entry

To cache a fresh value in an existing entry use the `update` method. This will broadcast the new entry to all subscribers. Note that if `refresh` is called it will replace this value with whatever is supplied by the generator.

```typescript
instaCache.update('markets', someNewData);
```

### Clearing Data

To clear an entry use the `clear` method. This will send a complete event to each subscriber, ending their subscriptions.

```typescript
instaCache.clear('markets');
```

To clear everything, and complete all subscriptions use `clearAll`.

```typescript
instaCache.clearAll();
```

## Methods

### cache

```typescript
cache(key: string, generator: () => any): InstaCache
```

The `cache` method will create a lazy entry in the cache.

### get

```typescript
get(key: string, miss?: () => any): Observable<any> | undefined
```

The `get` method will retrieve a key from the cache. If `miss` is supplied, and the key has not been defined, a new entry will be created.

### refresh

```typescript
refresh(key: string): Observable<any> | undefined
```

`refresh` will call `key`'s the generator, cache the new result, and broadcast the result to all subscribers.

### update

```typescript
update(key: string, value: any): boolean
```

`update` will cache and broadcast to all subscribers for a given `key`. `update` will return `true` if an entry was removed and `false` otherwise.

### clear

```typescript
clear(key: string): boolean
```

`clear` will remove a key from the cache, sending a complete event to each subscriber (ending their subscriptions). `clear` will return `true` if an entry was removed and `false` otherwise.

### clearAll

```
clearAll(): void
```

`clearAll` will complete all subscriptions, for any key, and start fresh.

### isInitialized

```typescript
isInitialized(key: string): boolean
```

`isInitialized` will return true if the provided key is both present and the value has been initialized (`get` or `refresh` have been called on the key). This is useful for detecting if calling `get` on a key will return immediately.

### has

```typescript
has(key: string): boolean
```

`has` will return true if the provided key is present (regardless of whether or not it is initialized).
