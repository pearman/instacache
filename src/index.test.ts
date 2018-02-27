import { InstaCache } from './index';
import { of } from 'rxjs/observable/of';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { toPromise } from 'rxjs/operator/toPromise';
import { Observable } from 'rxjs/Observable';
import { delay } from 'rxjs/operators';

declare var test;
declare var expect;

test('get of valid key returns observable', () => {
  const testCache = new InstaCache();
  testCache.cache('value', () => 3);
  expect(testCache.get('value') instanceof Observable).toBe(true);
});

test('get of invalid key returns undefined', () => {
  const testCache = new InstaCache();
  expect(testCache.get('value')).toBe(undefined);
});

test('cache observable', done => {
  const testCache = new InstaCache();
  testCache.cache('observable', () => of(3).pipe(delay(10)));
  testCache.get('observable').subscribe(result => {
    expect(result).toBe(3);
    done();
  });
});

test('cache promise', done => {
  const testCache = new InstaCache();
  testCache.cache('promise', () => Promise.resolve(3));
  testCache.get('promise').subscribe(result => {
    expect(result).toBe(3);
    done();
  });
});

test('cache value', done => {
  const testCache = new InstaCache();
  testCache.cache('value', () => 3);
  testCache.get('value').subscribe(result => {
    expect(result).toBe(3);
    done();
  });
});
