import { InstaCache } from '../src/index';
import { of, Observable } from 'rxjs';
import { delay, map, mergeMap, take, tap } from 'rxjs/operators';
import { isNumber } from 'lodash';

declare var test;
declare var expect;

test('get of valid key returns observable', () => {
  const testCache = new InstaCache();
  testCache.cache('value', () => 3);
  expect(testCache.get('value') instanceof Observable).toBe(true);
});

test('get of non-existant key returns undefined', () => {
  const testCache = new InstaCache();
  expect(testCache.get('value')).toBe(undefined);
});

test('refresh of non-existant key returns undefined', () => {
  const testCache = new InstaCache();
  expect(testCache.refresh('value')).toBe(undefined);
});

test('update of non-existant key returns false', () => {
  const testCache = new InstaCache();
  expect(testCache.update('value', 10)).toBe(false);
});

test('update of existing key returns true', () => {
  const testCache = new InstaCache();
  testCache.get('key', () => 10);
  expect(testCache.update('key', 15)).toBe(true);
});

test('get with generator will init a key if it does not exist', done => {
  const testCache = new InstaCache();
  testCache.get('observable', () => of(3));
  testCache.get('observable').subscribe(result => {
    expect(result).toBe(3);
    done();
  });
});

test('refresh calls the generator', done => {
  const testCache = new InstaCache();
  const key = 'observable';
  testCache.cache(key, () => new Date().getTime());
  testCache
    .refresh(key)
    .pipe(
      tap(result => {
        expect(isNumber(result)).toBe(true);
      }),
      delay(10),
      mergeMap(result1 =>
        testCache.refresh(key).pipe(map(result2 => [result1, result2]))
      )
    )
    .subscribe(([result1, result2]) => {
      expect(result1).not.toBe(result2);
      done();
    });
});

test('returns whether a value has been initialized', done => {
  const testCache = new InstaCache()
    .cache('cool', () => 'cool')
    .cache('notcool', () => 'notcool');

  expect(testCache.isInitialized('cool')).toBe(false);
  expect(testCache.isInitialized('notcool')).toBe(false);
  expect(testCache.isInitialized('non-existant')).toBe(false);

  testCache.get('cool').subscribe(() => {
    expect(testCache.isInitialized('cool')).toBe(true);
    expect(testCache.isInitialized('notcool')).toBe(false);
    expect(testCache.isInitialized('non-existant')).toBe(false);

    testCache.refresh('notcool').subscribe(() => {
      expect(testCache.isInitialized('cool')).toBe(true);
      expect(testCache.isInitialized('notcool')).toBe(true);
      expect(testCache.isInitialized('non-existant')).toBe(false);

      done();
    });
  });
});

test('returns whether a value exists', done => {
  const testCache = new InstaCache().cache('cool', () => 'cool');

  expect(testCache.has('cool')).toBe(true);
  expect(testCache.isInitialized('non-existant')).toBe(false);

  testCache.get('cool').subscribe(() => {
    expect(testCache.has('cool')).toBe(true);
    expect(testCache.isInitialized('non-existant')).toBe(false);
    done();
  });
});

test('update pushs a new value to subscribers', done => {
  const testCache = new InstaCache();
  const key = 'test';
  let result1;
  testCache
    .get(key, () => 10)
    .pipe(take(2))
    .subscribe(result => {
      if (!result1) result1 = result;
      else {
        expect(result1).toBe(10);
        expect(result).toBe(15);
        done();
      }
    });

  // After some time emit a fresh value
  setTimeout(() => testCache.update(key, 15), 100);
});

test('get subscription should complete on clear, clear should return true', done => {
  const testCache = new InstaCache().cache('cool', () => 'cool');

  testCache
    .get('cool')
    .pipe(
      tap(data => {
        expect(data).toBe('cool');
        expect(testCache.clear('cool')).toBe(true);
        expect(testCache.get('cool')).toBe(undefined);
      })
    )
    .subscribe(
      data => {},
      err => {},
      () => {
        done();
      }
    );
});

test('get subscription should complete on clearAll', done => {
  const testCache = new InstaCache()
    .cache('cool', () => 'cool')
    .cache('neat', () => 'neat');

  testCache
    .get('neat')
    .pipe(
      tap(data => {
        expect(data).toBe('neat');
        testCache.clearAll();
        expect(testCache.get('neat')).toBe(undefined);
        expect(testCache.get('cool')).toBe(undefined);
      })
    )
    .subscribe(() => {}, () => {}, () => done());
});

test('clearing a non-existing key should return false', done => {
  const testCache = new InstaCache();
  expect(testCache.clear('wow')).toBe(false);
  done();
});

test('cache observable', done => {
  const testCache = new InstaCache();
  testCache.get('observable', () => of(3)).subscribe(result => {
    expect(result).toBe(3);
    done();
  });
});

test('cache promise', done => {
  const testCache = new InstaCache();
  testCache.get('promise', () => Promise.resolve(3)).subscribe(result => {
    expect(result).toBe(3);
    done();
  });
});

test('cache value', done => {
  const testCache = new InstaCache();
  testCache.get('value', () => 3).subscribe(result => {
    expect(result).toBe(3);
    done();
  });
});
