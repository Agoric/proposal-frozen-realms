import test from 'tape';
import { beMutableProperties } from '../src/mutable';
import deepFreeze from '../src/deep-freeze';

test('override', t => {
  const parent = { foo: 4 };
  beMutableProperties(parent);
  Object.freeze(parent);
  const child = Object.create(parent);

  child.foo = 5;
  t.equal(child.foo, 5);
  t.equal(parent.foo, 4);

  t.deepEqual(Object.getOwnPropertyDescriptor(child, 'foo'),
              { value: 5, writable: true, enumerable: true, configurable: true });

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
  t.equal(gopd(parent, 'foo').writable, false);
  t.end(); return;
  t.throws(() => { parent.foo = 6; }, TypeError);
  t.throws(() => { child.foo = 6; }, TypeError);
  t.throws(() => { parent.bar.baz = 7; }, TypeError);
  t.throws(() => { child.bar.baz = 7; }, TypeError);
  t.throws(() => { child.newprop = 8; }, TypeError);
  t.throws(() => { delete parent.foo; }, TypeError);

  t.end();
});

