import { sanitize } from 'express-mongo-sanitize';

function getDescriptor(target, key) {
  let current = target;

  while (current) {
    const descriptor = Object.getOwnPropertyDescriptor(current, key);
    if (descriptor) {
      return descriptor;
    }
    current = Object.getPrototypeOf(current);
  }

  return undefined;
}

function safelyAssign(target, key, value) {
  const descriptor = getDescriptor(target, key);

  if (descriptor?.get && !descriptor.set) {
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: descriptor.enumerable ?? true,
      writable: true,
      value,
    });
    return;
  }

  target[key] = value;
}

function compatMongoSanitize(options = {}) {
  const hasOnSanitize = typeof options.onSanitize === 'function';

  return function middleware(req, res, next) {
    ['body', 'params', 'headers', 'query'].forEach((key) => {
      if (req[key] !== undefined && req[key] !== null) {
        const sanitized = sanitize(req[key], options);
        safelyAssign(req, key, sanitized);
      }
    });

    if (hasOnSanitize) {
      options.onSanitize({ req, key: 'query' });
    }

    next();
  };
}

export default compatMongoSanitize;
