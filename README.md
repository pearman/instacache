[![Build Status](https://travis-ci.org/pearman/instacache.svg?branch=master)](https://travis-ci.org/pearman/instacache)

# InstaCache

> A simple, async caching library powered by RxJS.

### Installation

Install the library via NPM.

```bash
npm install --save instacache
```

### Initializing the Cache

The cache is initialized simply with *key* and a *generator*. The *generator* is a lambda returning an Observable, Promise, or value. Internally the value yielded by the *generator* is converted to an Observable.

```typescript
const instaCache = new InstaCache()
    .cache('markets', () =>
           this.http.get("http://api.bitcoincharts.com/v1/markets.json"))
    .cache('prices', () =>
           this.http.get("http://api.bitcoincharts.com/v1/weighted_prices.json"));
```

### Getting Cached Data

Use the  `get` method to grab the current value and subscribe to any future updates.

```typescript
instaCache.get('markets').subscribe(data => console.log(data));
```

If your using Angular, you can load values directly in your template using the `async` pipe. Angular will automatically re-render new data if the cache is refreshed.

```html
<pre>{{instaCache.get('markets') | async}}</pre>
```

### Refreshing a Cache Entry

To get the latest value yielded by an existing *generator* simply call the refresh method.

```typescript
instaCache.refresh('markets');
```

