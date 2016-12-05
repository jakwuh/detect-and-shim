module.exports = (typeof window !== "undefined"
    ? window
    : (typeof process === 'object' &&
typeof require === 'function' &&
typeof global === 'object')
    ? global
    : this);
