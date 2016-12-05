# detect-and-shim

### Usage

```js
import shim from 'detect-and-shim';

shim([
    'promise',
    'promise.finally',
    'object.assign'
], ()  => {
    // now you could work!
})
```

Additionally, you could pass your own shims:

```js
import shim from 'detect-and-shim';

shim([{
    check() {
        return true; // if shim is needed;
    },
    shim(cb) {
        // shim and call cb
    }
}], ()  => {
    // now you could work!
})
```

All shims are loaded asynchronously using `reqiure.ensure([])`.

### List of included shims:

- `object.assign`
- `promise`
- `promise.finally`
