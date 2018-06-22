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
  getOwnPropertySymbols
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
