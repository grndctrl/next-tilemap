type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

type ArrayName = 'Int8' | 'Uint8' | 'Uint8Clamped' | 'Int16' | 'Uint16' | 'Int32' | 'Uint32' | 'Float32' | 'Float64';

export interface Store {
  [key: string]: TypedArray;
}

export interface Schema {
  [key: string]: ArrayName;
}

interface Stores {
  [key: symbol]: Store;
}

const stores: Stores = {};

const createTypedArray = (arrayName: ArrayName, size: number): TypedArray => {
  switch (arrayName) {
    case 'Int8':
      return new Int8Array(size);
    case 'Uint8':
      return new Uint8Array(size);
    case 'Uint8Clamped':
      return new Uint8ClampedArray(size);
    case 'Int16':
      return new Int16Array(size);
    case 'Uint16':
      return new Uint16Array(size);
    case 'Int32':
      return new Int32Array(size);
    case 'Uint32':
      return new Uint32Array(size);
    case 'Float32':
      return new Float32Array(size);
    case 'Float64':
      return new Float64Array(size);
  }
};

const createStore = (schema: Schema, size: number): Store => {
  const $store = Symbol('store');
  stores[$store] = {};

  const keys = Object.keys(schema);
  for (const key of keys) {
    stores[$store] = {
      ...stores[$store],
      [key]: createTypedArray(schema[key], size),
    };
  }

  return stores[$store];
};

export default createStore;
