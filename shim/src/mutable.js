// Adapted from SES/Caja
// Copyright (C) 2011 Google Inc.
// https://github.com/google/caja/blob/master/src/com/google/caja/ses/startSES.js
// https://github.com/google/caja/blob/master/src/com/google/caja/ses/repairES5.js

import {
  defineProperty,
  getOwnPropertyDescriptor,
  getOwnPropertyDescriptors,
  objectHasOwnProperty,
  ownKeys
} from './commons';

/**
 * For a special set of properties (defined below), it ensures that the
 * effect of freezing does not suppress the ability to override these
 * properties on derived objects by simple assignment.
 *
 * Because of lack of sufficient foresight at the time, ES5 unfortunately
 * specified that a simple assignment to a non-existent property must fail if
 * it would override a non-writable data property of the same name (e.g. the
 * target object doesn't have an own-property by that name, but it inherits
 * from an object which does, and the inherited property is non-writable).
 * (In retrospect, this was a mistake, but it is now too late and we must
 * live with the consequences.) As a result, simply freezing an object to
 * make it tamper proof has the unfortunate side effect of breaking
 * previously correct code that is considered to have followed JS best
 * practices, if this previous code used assignment to override.
 *
 * For example, the following code violates no JavaScript best practice but
 * nevertheless fails without the repair:
 *
 * Object.freeze(Object.prototype);
 *
 * function Point(x, y) {
 *   this.x = x;
 *   this.y = y;
 * }
 *
 * Point.prototype.toString = function() { return `<${this.x},${this.y}>`; };
 *
 * The problem is that the override will cause the assignment to
 * Point.prototype.toString to fail because Point.prototype inherits from
 * Object.prototype, and Object.freeze made Object.prototype.toString into a
 * non-writable data property.
 *
 * Another common pattern is:
 *
 *  Object.freeze(Error.prototype);
 *  e = new Error();
 *  e.message = 'something';
 *
 * To work around this mistake, deepFreeze(), prior to freezing, replaces
 * selected configurable own data properties with accessor properties which
 * simulate what we should have specified -- that assignments to derived
 * objects succeed if otherwise possible.
 */
function beMutable(obj, prop, desc) {
  // todo: rename to doRepair
  // prepare for 'parent' (aka 'obj') to be frozen, and allow 'child' to
  // inherit from 'parent' and accept property assignment (like
  // 'child.foo=4')
  if ('value' in desc && desc.configurable) {
    const value = desc.value;

    // eslint-disable-next-line no-inner-declarations
    function getter() {
      // we're now committed to being non-writable: until we freeze this
      // object, its behavior will be visibly different than if the override
      // mistake had not been made
      return value;
    }

    // Re-attach the data property on the object so
    // it can be found by the deep-freeze traversal process.
    getter.value = value;

    // eslint-disable-next-line no-inner-declarations
    function setter(newValue) {
      if (obj === this) {
        // prevent 'parent.foo='
        throw new TypeError(`Cannot assign to read only property '${prop}' of object '${obj}'`);
      }
      if (objectHasOwnProperty.call(this, prop)) {
        // todo: uncurry
        // we can only get here if someone extracts this setter and applies
        // it to an object which has already been assigned to (so normal
        // assignment would have changed the data property instead of using
        // this getter)
        this[prop] = newValue;
      } else {
        defineProperty(this, prop, {
          value: newValue,
          writable: true, // emulate creating a property by assignment
          enumerable: true,
          configurable: true
        });
      }
    }

    defineProperty(obj, prop, {
      get: getter,
      set: setter,
      enumerable: desc.enumerable,
      configurable: false // we're freezing
    });
  }
}

export function beMutableProperties(obj) {
  // repairObjectForFreeze
  if (!obj) {
    return;
  }
  const descs = getOwnPropertyDescriptors(obj);
  if (!descs) {
    return;
  }
  // todo: forEach may be corrupted, use for of, make sure it gets Symbols
  // todo: for of can be corrupted by changing IteratorSymbol something
  // todo: uncurry forEach, use that
  // forEach(ownKeys(descs), prop => beMutable(obj, prop, descs[prop]))
  for (const prop of ownKeys(descs)) {
    beMutable(obj, prop, descs[prop]);
  }
  // getOwnPropertyNames(obj).forEach(prop => beMutable(obj, prop, descs[prop]));
  // getOwnPropertySymbols(obj).forEach(prop => beMutable(obj, prop, descs[prop]));
}

export function beMutableProperty(obj, prop) {
  // repairForFreeze
  const desc = getOwnPropertyDescriptor(obj, prop);
  beMutable(obj, prop, desc);
}

/**
 * These properties are subject to the override mistake
 * and must be converted before freezing.
 */
export function repairDataProperties(intrinsics) {
  const i = intrinsics;

  [
    i.ObjectPrototype,
    i.ArrayPrototype,
    i.BooleanPrototype,
    i.DatePrototype,
    i.NumberPrototype,
    i.StringPrototype,

    i.FunctionPrototype,
    i.GeneratorPrototype,
    i.AsyncFunctionPrototype,
    i.AsyncGeneratorPrototype,

    i.IteratorPrototype,
    i.ArrayIteratorPrototype,

    i.PromisePrototype,
    i.DataViewPrototype,

    i.TypedArray,
    i.Int8ArrayPrototype,
    i.Int16ArrayPrototype,
    i.Int32ArrayPrototype,
    i.Uint8Array,
    i.Uint16Array,
    i.Uint32Array,

    i.ErrorPrototype,
    i.EvalErrorPrototype,
    i.RangeErrorPrototype,
    i.ReferenceErrorPrototype,
    i.SyntaxErrorPrototype,
    i.TypeErrorPrototype,
    i.URIErrorPrototype
  ].forEach(beMutableProperties);
}
