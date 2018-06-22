// Declare shorthand functions. Sharing these declarations accross modules
// improves both consitency and minification. Unused declarations are dropped
// by the tree shaking process.

// todo: delete and copy from realms/commons.js

export const {
  assign,
  create,
  defineProperties,
  freeze,
  getOwnPropertyDescriptors,
  getOwnPropertyNames,
  getOwnPropertySymbols,
  hasOwnProperty
} = Object;

export const {
  apply,
  defineProperty,
  deleteProperty,
  getOwnPropertyDescriptor,
  getPrototypeOf,
  ownKeys,
  setPrototypeOf
} = Reflect;

export const objectHasOwnProperty = Object.prototype.hasOwnProperty;

// See http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
// which only lives at http://web.archive.org/web/20160805225710/http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
const bind = Function.prototype.bind;
const uncurryThis = bind.bind(bind.call);

//export const objectHasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
export const forEach = uncurryThis(Array.prototype.forEach);

