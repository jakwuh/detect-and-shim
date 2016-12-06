# detect-and-shim [![Build Status](https://travis-ci.org/jakwuh/detect-and-shim.svg?branch=master)](https://travis-ci.org/jakwuh/detect-and-shim)

> Easy to use asynchronous automatic shims

### Installation

```bash
npm install -S detect-and-shim
```

### Usage

```js
import shim from 'detect-and-shim';

shim([
    'promise',
    // load 'promise.finally' only after 'promise'
    ['promise.finally', ['promise']],
    'object.assign'
], ()  => {
    // now you could work!
})
```

By default, all shims are loaded in parallel. 
If some shims should be loaded only after some other shims, 
it could be done by defining an array `['shim', [/* shim dependencies */]]`

Additionally, you could pass your own shims:

```js
import shim from 'detect-and-shim';

shim([{
    check() {
        return true; // if shim is needed;
    },
    shim(cb) {
        // shim and call cb()
    }
}], ()  => {
    // now you could work!
})
```

All shims are loaded asynchronously using `require.ensure([])`.

### List of included shims:

- `object.assign`
- `promise`
- `promise.finally`
