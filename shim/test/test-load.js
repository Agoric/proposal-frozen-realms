import test from 'tape';
import { beMutableProperties } from '../src/mutable';
import deepFreeze from '../src/deep-freeze';
import { walkObjects } from '../src/scan';

test('override', t => {
  const parent = { foo: 4 };
  beMutableProperties(parent);
  Object.freeze(parent);
  const child = Object.create(parent);

  child.foo = 5;
  t.equal(child.foo, 5);
  t.equal(parent.foo, 4);

  t.deepEqual(Object.getOwnPropertyDescriptor(child, 'foo'), {
    value: 5,
    writable: true,
    enumerable: true,
    configurable: true
  });

  t.end();
});

test('borrowed-setter', t => {
  const parent = { foo: 4 };
  beMutableProperties(parent);
  Object.freeze(parent);
  const child = Object.create(parent);
  const other = { foo: 6 };

  Object.getOwnPropertyDescriptor(parent, 'foo').set.call(other, 7);
  t.equal(other.foo, 7);
  t.equal(child.foo, 4);

  t.end();
});

test('deep-freeze', t => {
  const parent = Object.create(null);
  parent.foo = 4;
  parent.bar = Object.create(null);
  parent.bar.baz = 5;
  beMutableProperties(parent); // fix parent
  const child = Object.create(parent);

  deepFreeze(child);

  const gopd = Object.getOwnPropertyDescriptor;
  // the repair is visible: without the repair, after freeze .writable would
  // be true. With the repair, it's now an accessor
  t.equal(gopd(parent, 'foo').writable, undefined);
  t.throws(
    () => {
      parent.foo = 6;
    },
    TypeError,
    'parent.foo=6 should fail'
  );
  t.throws(
    () => {
      child.foo = 6;
    },
    TypeError,
    'child.foo=6 should fail'
  );
  t.equal(child.foo, 4, 'child.foo is still 4');
  t.equal(parent.foo, 4, 'parent.foo is still 4');
  t.throws(() => {
    parent.bar.baz = 7;
  }, TypeError);
  t.throws(() => {
    child.bar.baz = 7;
  }, TypeError);
  t.throws(() => {
    child.newprop = 8;
  }, TypeError);
  t.throws(() => {
    delete parent.foo;
  }, TypeError);

  t.end();
});

test('scan', t => {
  const parent = Object.create(null);
  deepFreeze(parent);
  // Object.freeze(parent);
  t.ok(Object.isFrozen(parent), 'the deepFrozen parent should be frozen');

  walkObjects(parent, (obj, pathForObject) => {
    if (!Object.isFrozen(obj)) {
      t.fail(`the object at ${pathForObject(obj)} should be frozen`);
    }
  });

  t.end();
});

/*
import Realm from '../../../proposal-realms/shim/src/realm';
test('runtime', t => {
  const start = Date.now();
  const r = new Realm();
  deepFreeze(r.global);
  const finish = Date.now();
  console.log(`elapsed: ${finish - start} ms`);

  t.end();
});
*/
