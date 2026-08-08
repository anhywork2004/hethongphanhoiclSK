
import {Buffer} from "node:buffer";
globalThis.Buffer = Buffer;

import {AsyncLocalStorage} from "node:async_hooks";
globalThis.AsyncLocalStorage = AsyncLocalStorage;


const defaultDefineProperty = Object.defineProperty;
Object.defineProperty = function(o, p, a) {
  if(p=== '__import_unsupported' && Boolean(globalThis.__import_unsupported)) {
    return;
  }
  return defaultDefineProperty(o, p, a);
};

  
  
  globalThis.openNextDebug = false;globalThis.openNextVersion = "4.1.0";globalThis.nextVersion = "16.3.0";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@opennextjs/aws/dist/utils/error.js
function isOpenNextError(e) {
  try {
    return "__openNextInternal" in e;
  } catch {
    return false;
  }
}
var init_error = __esm({
  "node_modules/@opennextjs/aws/dist/utils/error.js"() {
  }
});

// node_modules/@opennextjs/aws/dist/adapters/logger.js
function debug(...args) {
  if (globalThis.openNextDebug) {
    console.log(...args);
  }
}
function warn(...args) {
  console.warn(...args);
}
function error(...args) {
  if (args.some((arg) => isDownplayedErrorLog(arg))) {
    return debug(...args);
  }
  if (args.some((arg) => isOpenNextError(arg))) {
    const error2 = args.find((arg) => isOpenNextError(arg));
    if (error2.logLevel < getOpenNextErrorLogLevel()) {
      return;
    }
    if (error2.logLevel === 0) {
      return console.log(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    if (error2.logLevel === 1) {
      return warn(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    return console.error(...args);
  }
  console.error(...args);
}
function getOpenNextErrorLogLevel() {
  const strLevel = process.env.OPEN_NEXT_ERROR_LOG_LEVEL ?? "1";
  switch (strLevel.toLowerCase()) {
    case "debug":
    case "0":
      return 0;
    case "error":
    case "2":
      return 2;
    default:
      return 1;
  }
}
var DOWNPLAYED_ERROR_LOGS, isDownplayedErrorLog;
var init_logger = __esm({
  "node_modules/@opennextjs/aws/dist/adapters/logger.js"() {
    init_error();
    DOWNPLAYED_ERROR_LOGS = [
      {
        clientName: "S3Client",
        commandName: "GetObjectCommand",
        errorName: "NoSuchKey"
      }
    ];
    isDownplayedErrorLog = (errorLog) => DOWNPLAYED_ERROR_LOGS.some((downplayedInput) => downplayedInput.clientName === errorLog?.clientName && downplayedInput.commandName === errorLog?.commandName && (downplayedInput.errorName === errorLog?.error?.name || downplayedInput.errorName === errorLog?.error?.Code));
  }
});

// node_modules/cookie/dist/index.js
var require_dist = __commonJS({
  "node_modules/cookie/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseCookie = parseCookie;
    exports.parse = parseCookie;
    exports.stringifyCookie = stringifyCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    exports.parseSetCookie = parseSetCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
    var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    var maxAgeRegExp = /^-?\d+$/;
    var __toString = Object.prototype.toString;
    var NullObject = /* @__PURE__ */ (() => {
      const C = function() {
      };
      C.prototype = /* @__PURE__ */ Object.create(null);
      return C;
    })();
    function parseCookie(str, options) {
      const obj = new NullObject();
      const len = str.length;
      if (len < 2)
        return obj;
      const dec = options?.decode || decode;
      let index = 0;
      do {
        const eqIdx = eqIndex(str, index, len);
        if (eqIdx === -1)
          break;
        const endIdx = endIndex(str, index, len);
        if (eqIdx > endIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        const key = valueSlice(str, index, eqIdx);
        if (obj[key] === void 0) {
          obj[key] = dec(valueSlice(str, eqIdx + 1, endIdx));
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    function stringifyCookie(cookie, options) {
      const enc = options?.encode || encodeURIComponent;
      const cookieStrings = [];
      for (const name of Object.keys(cookie)) {
        const val = cookie[name];
        if (val === void 0)
          continue;
        if (!cookieNameRegExp.test(name)) {
          throw new TypeError(`cookie name is invalid: ${name}`);
        }
        const value = enc(val);
        if (!cookieValueRegExp.test(value)) {
          throw new TypeError(`cookie val is invalid: ${val}`);
        }
        cookieStrings.push(`${name}=${value}`);
      }
      return cookieStrings.join("; ");
    }
    function stringifySetCookie(_name, _val, _opts) {
      const cookie = typeof _name === "object" ? _name : { ..._opts, name: _name, value: String(_val) };
      const options = typeof _val === "object" ? _val : _opts;
      const enc = options?.encode || encodeURIComponent;
      if (!cookieNameRegExp.test(cookie.name)) {
        throw new TypeError(`argument name is invalid: ${cookie.name}`);
      }
      const value = cookie.value ? enc(cookie.value) : "";
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${cookie.value}`);
      }
      let str = cookie.name + "=" + value;
      if (cookie.maxAge !== void 0) {
        if (!Number.isInteger(cookie.maxAge)) {
          throw new TypeError(`option maxAge is invalid: ${cookie.maxAge}`);
        }
        str += "; Max-Age=" + cookie.maxAge;
      }
      if (cookie.domain) {
        if (!domainValueRegExp.test(cookie.domain)) {
          throw new TypeError(`option domain is invalid: ${cookie.domain}`);
        }
        str += "; Domain=" + cookie.domain;
      }
      if (cookie.path) {
        if (!pathValueRegExp.test(cookie.path)) {
          throw new TypeError(`option path is invalid: ${cookie.path}`);
        }
        str += "; Path=" + cookie.path;
      }
      if (cookie.expires) {
        if (!isDate(cookie.expires) || !Number.isFinite(cookie.expires.valueOf())) {
          throw new TypeError(`option expires is invalid: ${cookie.expires}`);
        }
        str += "; Expires=" + cookie.expires.toUTCString();
      }
      if (cookie.httpOnly) {
        str += "; HttpOnly";
      }
      if (cookie.secure) {
        str += "; Secure";
      }
      if (cookie.partitioned) {
        str += "; Partitioned";
      }
      if (cookie.priority) {
        const priority = typeof cookie.priority === "string" ? cookie.priority.toLowerCase() : void 0;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError(`option priority is invalid: ${cookie.priority}`);
        }
      }
      if (cookie.sameSite) {
        const sameSite = typeof cookie.sameSite === "string" ? cookie.sameSite.toLowerCase() : cookie.sameSite;
        switch (sameSite) {
          case true:
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError(`option sameSite is invalid: ${cookie.sameSite}`);
        }
      }
      return str;
    }
    function parseSetCookie(str, options) {
      const dec = options?.decode || decode;
      const len = str.length;
      const endIdx = endIndex(str, 0, len);
      const eqIdx = eqIndex(str, 0, endIdx);
      const setCookie = eqIdx === -1 ? { name: "", value: dec(valueSlice(str, 0, endIdx)) } : {
        name: valueSlice(str, 0, eqIdx),
        value: dec(valueSlice(str, eqIdx + 1, endIdx))
      };
      let index = endIdx + 1;
      while (index < len) {
        const endIdx2 = endIndex(str, index, len);
        const eqIdx2 = eqIndex(str, index, endIdx2);
        const attr = eqIdx2 === -1 ? valueSlice(str, index, endIdx2) : valueSlice(str, index, eqIdx2);
        const val = eqIdx2 === -1 ? void 0 : valueSlice(str, eqIdx2 + 1, endIdx2);
        switch (attr.toLowerCase()) {
          case "httponly":
            setCookie.httpOnly = true;
            break;
          case "secure":
            setCookie.secure = true;
            break;
          case "partitioned":
            setCookie.partitioned = true;
            break;
          case "domain":
            setCookie.domain = val;
            break;
          case "path":
            setCookie.path = val;
            break;
          case "max-age":
            if (val && maxAgeRegExp.test(val))
              setCookie.maxAge = Number(val);
            break;
          case "expires":
            if (!val)
              break;
            const date = new Date(val);
            if (Number.isFinite(date.valueOf()))
              setCookie.expires = date;
            break;
          case "priority":
            if (!val)
              break;
            const priority = val.toLowerCase();
            if (priority === "low" || priority === "medium" || priority === "high") {
              setCookie.priority = priority;
            }
            break;
          case "samesite":
            if (!val)
              break;
            const sameSite = val.toLowerCase();
            if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
              setCookie.sameSite = sameSite;
            }
            break;
        }
        index = endIdx2 + 1;
      }
      return setCookie;
    }
    function endIndex(str, min, len) {
      const index = str.indexOf(";", min);
      return index === -1 ? len : index;
    }
    function eqIndex(str, min, max) {
      const index = str.indexOf("=", min);
      return index < max ? index : -1;
    }
    function valueSlice(str, min, max) {
      let start = min;
      let end = max;
      do {
        const code = str.charCodeAt(start);
        if (code !== 32 && code !== 9)
          break;
      } while (++start < end);
      while (end > start) {
        const code = str.charCodeAt(end - 1);
        if (code !== 32 && code !== 9)
          break;
        end--;
      }
      return str.slice(start, end);
    }
    function decode(str) {
      if (str.indexOf("%") === -1)
        return str;
      try {
        return decodeURIComponent(str);
      } catch (e) {
        return str;
      }
    }
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
  }
});

// node_modules/@opennextjs/aws/dist/http/util.js
function parseSetCookieHeader(cookies) {
  if (!cookies) {
    return [];
  }
  if (typeof cookies === "string") {
    return cookies.split(/(?<!Expires=\w+),/i).map((c) => c.trim());
  }
  return cookies;
}
function getQueryFromIterator(it) {
  const query = {};
  for (const [key, value] of it) {
    if (key in query) {
      if (Array.isArray(query[key])) {
        query[key].push(value);
      } else {
        query[key] = [query[key], value];
      }
    } else {
      query[key] = value;
    }
  }
  return query;
}
var init_util = __esm({
  "node_modules/@opennextjs/aws/dist/http/util.js"() {
    init_logger();
  }
});

// node_modules/@opennextjs/aws/dist/overrides/converters/utils.js
function getQueryFromSearchParams(searchParams) {
  return getQueryFromIterator(searchParams.entries());
}
var init_utils = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/converters/utils.js"() {
    init_util();
  }
});

// node_modules/@opennextjs/aws/dist/overrides/converters/edge.js
var edge_exports = {};
__export(edge_exports, {
  default: () => edge_default
});
import { Buffer as Buffer2 } from "node:buffer";
var import_cookie, NULL_BODY_STATUSES, converter, edge_default;
var init_edge = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/converters/edge.js"() {
    import_cookie = __toESM(require_dist(), 1);
    init_util();
    init_utils();
    NULL_BODY_STATUSES = /* @__PURE__ */ new Set([101, 103, 204, 205, 304]);
    converter = {
      convertFrom: async (event) => {
        const url = new URL(event.url);
        const searchParams = url.searchParams;
        const query = getQueryFromSearchParams(searchParams);
        const headers = {};
        event.headers.forEach((value, key) => {
          headers[key] = value;
        });
        const rawPath = url.pathname;
        const method = event.method;
        const shouldHaveBody = method !== "GET" && method !== "HEAD";
        const body = shouldHaveBody ? Buffer2.from(await event.arrayBuffer()) : void 0;
        const cookieHeader = event.headers.get("cookie");
        const cookies = cookieHeader ? import_cookie.default.parse(cookieHeader) : {};
        return {
          type: "core",
          method,
          rawPath,
          url: event.url,
          body,
          headers,
          remoteAddress: event.headers.get("x-forwarded-for") ?? "::1",
          query,
          cookies
        };
      },
      convertTo: async (result) => {
        if ("internalEvent" in result) {
          const request = new Request(result.internalEvent.url, {
            body: result.internalEvent.body,
            method: result.internalEvent.method,
            headers: {
              ...result.internalEvent.headers,
              "x-forwarded-host": result.internalEvent.headers.host
            }
          });
          if (globalThis.__dangerous_ON_edge_converter_returns_request === true) {
            return request;
          }
          const cfCache = (result.isISR || result.internalEvent.rawPath.startsWith("/_next/image")) && process.env.DISABLE_CACHE !== "true" ? { cacheEverything: true } : {};
          return fetch(request, {
            // This is a hack to make sure that the response is cached by Cloudflare
            // See https://developers.cloudflare.com/workers/examples/cache-using-fetch/#caching-html-resources
            // @ts-expect-error - This is a Cloudflare specific option
            cf: cfCache
          });
        }
        const headers = new Headers();
        for (const [key, value] of Object.entries(result.headers)) {
          if (key === "set-cookie" && typeof value === "string") {
            const cookies = parseSetCookieHeader(value);
            for (const cookie of cookies) {
              headers.append(key, cookie);
            }
            continue;
          }
          if (Array.isArray(value)) {
            for (const v of value) {
              headers.append(key, v);
            }
          } else {
            headers.set(key, value);
          }
        }
        const body = NULL_BODY_STATUSES.has(result.statusCode) ? null : result.body;
        return new Response(body, {
          status: result.statusCode,
          headers
        });
      },
      name: "edge"
    };
    edge_default = converter;
  }
});

// node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js
var cloudflare_edge_exports = {};
__export(cloudflare_edge_exports, {
  default: () => cloudflare_edge_default
});
var cfPropNameMapping, handler, cloudflare_edge_default;
var init_cloudflare_edge = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js"() {
    cfPropNameMapping = {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: [encodeURIComponent, "x-open-next-city"],
      country: "x-open-next-country",
      regionCode: "x-open-next-region",
      latitude: "x-open-next-latitude",
      longitude: "x-open-next-longitude"
    };
    handler = async (handler3, converter2) => async (request, env, ctx) => {
      globalThis.process = process;
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === "string") {
          process.env[key] = value;
        }
      }
      const internalEvent = await converter2.convertFrom(request);
      const cfProperties = request.cf;
      for (const [propName, mapping] of Object.entries(cfPropNameMapping)) {
        const propValue = cfProperties?.[propName];
        if (propValue != null) {
          const [encode, headerName] = Array.isArray(mapping) ? mapping : [null, mapping];
          internalEvent.headers[headerName] = encode ? encode(propValue) : propValue;
        }
      }
      const response = await handler3(internalEvent, {
        waitUntil: ctx.waitUntil.bind(ctx)
      });
      const result = await converter2.convertTo(response);
      return result;
    };
    cloudflare_edge_default = {
      wrapper: handler,
      name: "cloudflare-edge",
      supportStreaming: true,
      edgeRuntime: true
    };
  }
});

// node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js
var pattern_env_exports = {};
__export(pattern_env_exports, {
  default: () => pattern_env_default
});
function initializeOnce() {
  if (initialized)
    return;
  cachedOrigins = JSON.parse(process.env.OPEN_NEXT_ORIGIN ?? "{}");
  const functions = globalThis.openNextConfig.functions ?? {};
  for (const key in functions) {
    if (key !== "default") {
      const value = functions[key];
      const regexes = [];
      for (const pattern of value.patterns) {
        const regexPattern = `/${pattern.replace(/\*\*/g, "(.*)").replace(/\*/g, "([^/]*)").replace(/\//g, "\\/").replace(/\?/g, ".")}`;
        regexes.push(new RegExp(regexPattern));
      }
      cachedPatterns.push({
        key,
        patterns: value.patterns,
        regexes
      });
    }
  }
  initialized = true;
}
var cachedOrigins, cachedPatterns, initialized, envLoader, pattern_env_default;
var init_pattern_env = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js"() {
    init_logger();
    cachedPatterns = [];
    initialized = false;
    envLoader = {
      name: "env",
      resolve: async (_path) => {
        try {
          initializeOnce();
          for (const { key, patterns, regexes } of cachedPatterns) {
            for (const regex of regexes) {
              if (regex.test(_path)) {
                debug("Using origin", key, patterns);
                return cachedOrigins[key];
              }
            }
          }
          if (_path.startsWith("/_next/image") && cachedOrigins.imageOptimizer) {
            debug("Using origin", "imageOptimizer", _path);
            return cachedOrigins.imageOptimizer;
          }
          if (cachedOrigins.default) {
            debug("Using default origin", cachedOrigins.default, _path);
            return cachedOrigins.default;
          }
          return false;
        } catch (e) {
          error("Error while resolving origin", e);
          return false;
        }
      }
    };
    pattern_env_default = envLoader;
  }
});

// node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js
var dummy_exports = {};
__export(dummy_exports, {
  default: () => dummy_default
});
var resolver, dummy_default;
var init_dummy = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js"() {
    resolver = {
      name: "dummy"
    };
    dummy_default = resolver;
  }
});

// node_modules/@opennextjs/aws/dist/utils/stream.js
import { ReadableStream as ReadableStream2 } from "node:stream/web";
function toReadableStream(value, isBase64) {
  return new ReadableStream2({
    pull(controller) {
      controller.enqueue(Buffer.from(value, isBase64 ? "base64" : "utf8"));
      controller.close();
    }
  }, { highWaterMark: 0 });
}
function emptyReadableStream() {
  if (process.env.OPEN_NEXT_FORCE_NON_EMPTY_RESPONSE === "true") {
    return new ReadableStream2({
      pull(controller) {
        maybeSomethingBuffer ??= Buffer.from("SOMETHING");
        controller.enqueue(maybeSomethingBuffer);
        controller.close();
      }
    }, { highWaterMark: 0 });
  }
  return new ReadableStream2({
    start(controller) {
      controller.close();
    }
  });
}
var maybeSomethingBuffer;
var init_stream = __esm({
  "node_modules/@opennextjs/aws/dist/utils/stream.js"() {
  }
});

// node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js
var fetch_exports = {};
__export(fetch_exports, {
  default: () => fetch_default
});
var fetchProxy, fetch_default;
var init_fetch = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js"() {
    init_stream();
    fetchProxy = {
      name: "fetch-proxy",
      // @ts-ignore
      proxy: async (internalEvent) => {
        const { url, headers: eventHeaders, method, body } = internalEvent;
        const headers = Object.fromEntries(Object.entries(eventHeaders).filter(([key]) => key.toLowerCase() !== "cf-connecting-ip"));
        const response = await fetch(url, {
          method,
          headers,
          body
        });
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
          const cur = responseHeaders[key];
          if (cur === void 0) {
            responseHeaders[key] = value;
          } else if (Array.isArray(cur)) {
            cur.push(value);
          } else {
            responseHeaders[key] = [cur, value];
          }
        });
        return {
          type: "core",
          headers: responseHeaders,
          statusCode: response.status,
          isBase64Encoded: true,
          body: response.body ?? emptyReadableStream()
        };
      }
    };
    fetch_default = fetchProxy;
  }
});

// .next/server/edge-runtime-webpack.js
var require_edge_runtime_webpack = __commonJS({
  ".next/server/edge-runtime-webpack.js"() {
    "use strict";
    (() => {
      "use strict";
      var a, b, c, d, e = {}, f = {};
      function g(a2) {
        var b2 = f[a2];
        if (void 0 !== b2) return b2.exports;
        var c2 = f[a2] = { exports: {} }, d2 = true;
        try {
          e[a2](c2, c2.exports, g), d2 = false;
        } finally {
          d2 && delete f[a2];
        }
        return c2.exports;
      }
      g.m = e, g.amdO = {}, a = [], g.O = (b2, c2, d2, e2) => {
        if (c2) {
          e2 = e2 || 0;
          for (var f2 = a.length; f2 > 0 && a[f2 - 1][2] > e2; f2--) a[f2] = a[f2 - 1];
          a[f2] = [c2, d2, e2];
          return;
        }
        for (var h = 1 / 0, f2 = 0; f2 < a.length; f2++) {
          for (var [c2, d2, e2] = a[f2], i = true, j = 0; j < c2.length; j++) (false & e2 || h >= e2) && Object.keys(g.O).every((a2) => g.O[a2](c2[j])) ? c2.splice(j--, 1) : (i = false, e2 < h && (h = e2));
          if (i) {
            a.splice(f2--, 1);
            var k = d2();
            void 0 !== k && (b2 = k);
          }
        }
        return b2;
      }, g.n = (a2) => {
        var b2 = a2 && a2.__esModule ? () => a2.default : () => a2;
        return g.d(b2, { a: b2 }), b2;
      }, g.d = (a2, b2) => {
        for (var c2 in b2) g.o(b2, c2) && !g.o(a2, c2) && Object.defineProperty(a2, c2, { enumerable: true, get: b2[c2] });
      }, g.g = function() {
        if ("object" == typeof globalThis) return globalThis;
        try {
          return this || Function("return this")();
        } catch (a2) {
          if ("object" == typeof window) return window;
        }
      }(), g.o = (a2, b2) => Object.prototype.hasOwnProperty.call(a2, b2), g.r = (a2) => {
        "u" > typeof Symbol && Symbol.toStringTag && Object.defineProperty(a2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(a2, "__esModule", { value: true });
      }, b = { 149: 0 }, g.O.j = (a2) => 0 === b[a2], c = (a2, c2) => {
        var d2, e2, [f2, h, i] = c2, j = 0;
        if (f2.some((a3) => 0 !== b[a3])) {
          for (d2 in h) g.o(h, d2) && (g.m[d2] = h[d2]);
          if (i) var k = i(g);
        }
        for (a2 && a2(c2); j < f2.length; j++) e2 = f2[j], g.o(b, e2) && b[e2] && b[e2][0](), b[e2] = 0;
        return g.O(k);
      }, (d = self.webpackChunk_N_E = self.webpackChunk_N_E || []).forEach(c.bind(null, 0)), d.push = c.bind(null, d.push.bind(d));
    })();
  }
});

// node-built-in-modules:node:buffer
var node_buffer_exports = {};
import * as node_buffer_star from "node:buffer";
var init_node_buffer = __esm({
  "node-built-in-modules:node:buffer"() {
    __reExport(node_buffer_exports, node_buffer_star);
  }
});

// node-built-in-modules:node:async_hooks
var node_async_hooks_exports = {};
import * as node_async_hooks_star from "node:async_hooks";
var init_node_async_hooks = __esm({
  "node-built-in-modules:node:async_hooks"() {
    __reExport(node_async_hooks_exports, node_async_hooks_star);
  }
});

// .next/server/src/middleware.js
var require_middleware = __commonJS({
  ".next/server/src/middleware.js"() {
    "use strict";
    (self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[550], { 42: (a) => {
      !function() {
        "use strict";
        var b = { 431: function(a2) {
          function b2(a3) {
            if ("string" != typeof a3) throw TypeError("Path must be a string. Received " + JSON.stringify(a3));
          }
          function c2(a3, b3) {
            for (var c3, d3 = "", e = 0, f = -1, g = 0, h = 0; h <= a3.length; ++h) {
              if (h < a3.length) c3 = a3.charCodeAt(h);
              else if (47 === c3) break;
              else c3 = 47;
              if (47 === c3) {
                if (f === h - 1 || 1 === g) ;
                else if (f !== h - 1 && 2 === g) {
                  if (d3.length < 2 || 2 !== e || 46 !== d3.charCodeAt(d3.length - 1) || 46 !== d3.charCodeAt(d3.length - 2)) {
                    if (d3.length > 2) {
                      var i = d3.lastIndexOf("/");
                      if (i !== d3.length - 1) {
                        -1 === i ? (d3 = "", e = 0) : e = (d3 = d3.slice(0, i)).length - 1 - d3.lastIndexOf("/"), f = h, g = 0;
                        continue;
                      }
                    } else if (2 === d3.length || 1 === d3.length) {
                      d3 = "", e = 0, f = h, g = 0;
                      continue;
                    }
                  }
                  b3 && (d3.length > 0 ? d3 += "/.." : d3 = "..", e = 2);
                } else d3.length > 0 ? d3 += "/" + a3.slice(f + 1, h) : d3 = a3.slice(f + 1, h), e = h - f - 1;
                f = h, g = 0;
              } else 46 === c3 && -1 !== g ? ++g : g = -1;
            }
            return d3;
          }
          var d2 = { resolve: function() {
            for (var a3, d3, e = "", f = false, g = arguments.length - 1; g >= -1 && !f; g--) g >= 0 ? d3 = arguments[g] : (void 0 === a3 && (a3 = ""), d3 = a3), b2(d3), 0 !== d3.length && (e = d3 + "/" + e, f = 47 === d3.charCodeAt(0));
            if (e = c2(e, !f), f) if (e.length > 0) return "/" + e;
            else return "/";
            return e.length > 0 ? e : ".";
          }, normalize: function(a3) {
            if (b2(a3), 0 === a3.length) return ".";
            var d3 = 47 === a3.charCodeAt(0), e = 47 === a3.charCodeAt(a3.length - 1);
            return (0 !== (a3 = c2(a3, !d3)).length || d3 || (a3 = "."), a3.length > 0 && e && (a3 += "/"), d3) ? "/" + a3 : a3;
          }, isAbsolute: function(a3) {
            return b2(a3), a3.length > 0 && 47 === a3.charCodeAt(0);
          }, join: function() {
            if (0 == arguments.length) return ".";
            for (var a3, c3 = 0; c3 < arguments.length; ++c3) {
              var e = arguments[c3];
              b2(e), e.length > 0 && (void 0 === a3 ? a3 = e : a3 += "/" + e);
            }
            return void 0 === a3 ? "." : d2.normalize(a3);
          }, relative: function(a3, c3) {
            if (b2(a3), b2(c3), a3 === c3 || (a3 = d2.resolve(a3)) === (c3 = d2.resolve(c3))) return "";
            for (var e = 1; e < a3.length && 47 === a3.charCodeAt(e); ++e) ;
            for (var f = a3.length, g = f - e, h = 1; h < c3.length && 47 === c3.charCodeAt(h); ++h) ;
            for (var i = c3.length - h, j = g < i ? g : i, k = -1, l = 0; l <= j; ++l) {
              if (l === j) {
                if (i > j) {
                  if (47 === c3.charCodeAt(h + l)) return c3.slice(h + l + 1);
                  else if (0 === l) return c3.slice(h + l);
                } else g > j && (47 === a3.charCodeAt(e + l) ? k = l : 0 === l && (k = 0));
                break;
              }
              var m = a3.charCodeAt(e + l);
              if (m !== c3.charCodeAt(h + l)) break;
              47 === m && (k = l);
            }
            var n = "";
            for (l = e + k + 1; l <= f; ++l) (l === f || 47 === a3.charCodeAt(l)) && (0 === n.length ? n += ".." : n += "/..");
            return n.length > 0 ? n + c3.slice(h + k) : (h += k, 47 === c3.charCodeAt(h) && ++h, c3.slice(h));
          }, _makeLong: function(a3) {
            return a3;
          }, dirname: function(a3) {
            if (b2(a3), 0 === a3.length) return ".";
            for (var c3 = a3.charCodeAt(0), d3 = 47 === c3, e = -1, f = true, g = a3.length - 1; g >= 1; --g) if (47 === (c3 = a3.charCodeAt(g))) {
              if (!f) {
                e = g;
                break;
              }
            } else f = false;
            return -1 === e ? d3 ? "/" : "." : d3 && 1 === e ? "//" : a3.slice(0, e);
          }, basename: function(a3, c3) {
            if (void 0 !== c3 && "string" != typeof c3) throw TypeError('"ext" argument must be a string');
            b2(a3);
            var d3, e = 0, f = -1, g = true;
            if (void 0 !== c3 && c3.length > 0 && c3.length <= a3.length) {
              if (c3.length === a3.length && c3 === a3) return "";
              var h = c3.length - 1, i = -1;
              for (d3 = a3.length - 1; d3 >= 0; --d3) {
                var j = a3.charCodeAt(d3);
                if (47 === j) {
                  if (!g) {
                    e = d3 + 1;
                    break;
                  }
                } else -1 === i && (g = false, i = d3 + 1), h >= 0 && (j === c3.charCodeAt(h) ? -1 == --h && (f = d3) : (h = -1, f = i));
              }
              return e === f ? f = i : -1 === f && (f = a3.length), a3.slice(e, f);
            }
            for (d3 = a3.length - 1; d3 >= 0; --d3) if (47 === a3.charCodeAt(d3)) {
              if (!g) {
                e = d3 + 1;
                break;
              }
            } else -1 === f && (g = false, f = d3 + 1);
            return -1 === f ? "" : a3.slice(e, f);
          }, extname: function(a3) {
            b2(a3);
            for (var c3 = -1, d3 = 0, e = -1, f = true, g = 0, h = a3.length - 1; h >= 0; --h) {
              var i = a3.charCodeAt(h);
              if (47 === i) {
                if (!f) {
                  d3 = h + 1;
                  break;
                }
                continue;
              }
              -1 === e && (f = false, e = h + 1), 46 === i ? -1 === c3 ? c3 = h : 1 !== g && (g = 1) : -1 !== c3 && (g = -1);
            }
            return -1 === c3 || -1 === e || 0 === g || 1 === g && c3 === e - 1 && c3 === d3 + 1 ? "" : a3.slice(c3, e);
          }, format: function(a3) {
            var b3, c3;
            if (null === a3 || "object" != typeof a3) throw TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof a3);
            return b3 = a3.dir || a3.root, c3 = a3.base || (a3.name || "") + (a3.ext || ""), b3 ? b3 === a3.root ? b3 + c3 : b3 + "/" + c3 : c3;
          }, parse: function(a3) {
            b2(a3);
            var c3, d3 = { root: "", dir: "", base: "", ext: "", name: "" };
            if (0 === a3.length) return d3;
            var e = a3.charCodeAt(0), f = 47 === e;
            f ? (d3.root = "/", c3 = 1) : c3 = 0;
            for (var g = -1, h = 0, i = -1, j = true, k = a3.length - 1, l = 0; k >= c3; --k) {
              if (47 === (e = a3.charCodeAt(k))) {
                if (!j) {
                  h = k + 1;
                  break;
                }
                continue;
              }
              -1 === i && (j = false, i = k + 1), 46 === e ? -1 === g ? g = k : 1 !== l && (l = 1) : -1 !== g && (l = -1);
            }
            return -1 === g || -1 === i || 0 === l || 1 === l && g === i - 1 && g === h + 1 ? -1 !== i && (0 === h && f ? d3.base = d3.name = a3.slice(1, i) : d3.base = d3.name = a3.slice(h, i)) : (0 === h && f ? (d3.name = a3.slice(1, g), d3.base = a3.slice(1, i)) : (d3.name = a3.slice(h, g), d3.base = a3.slice(h, i)), d3.ext = a3.slice(g, i)), h > 0 ? d3.dir = a3.slice(0, h - 1) : f && (d3.dir = "/"), d3;
          }, sep: "/", delimiter: ":", win32: null, posix: null };
          d2.posix = d2, a2.exports = d2;
        } }, c = {};
        function d(a2) {
          var e = c[a2];
          if (void 0 !== e) return e.exports;
          var f = c[a2] = { exports: {} }, g = true;
          try {
            b[a2](f, f.exports, d), g = false;
          } finally {
            g && delete c[a2];
          }
          return f.exports;
        }
        d.ab = "//", a.exports = d(431);
      }();
    }, 202: (a, b, c) => {
      "use strict";
      let d, e, f, g, h, i, j, k;
      c.r(b), c.d(b, { default: () => jU, handler: () => jT });
      var l, m, n, o = {};
      c.r(o), c.d(o, { q: () => e5, l: () => e8 });
      var p = {};
      async function q() {
        return "_ENTRIES" in globalThis && _ENTRIES.middleware_instrumentation && await _ENTRIES.middleware_instrumentation;
      }
      c.r(p), c.d(p, { config: () => jN, default: () => jM });
      let r = null;
      async function s() {
        if ("phase-production-build" === process.env.NEXT_PHASE) return;
        r || (r = q());
        let a10 = await r;
        if (null == a10 ? void 0 : a10.register) try {
          await a10.register();
        } catch (a11) {
          throw a11.message = `An error occurred while loading instrumentation hook: ${a11.message}`, a11;
        }
      }
      async function t(...a10) {
        let b10 = await q();
        try {
          var c10;
          await (null == b10 || null == (c10 = b10.onRequestError) ? void 0 : c10.call(b10, ...a10));
        } catch (a11) {
          console.error("Error in instrumentation.onRequestError:", a11);
        }
      }
      let u = null;
      function v() {
        return u || (u = s()), u;
      }
      function w(a10) {
        return `The edge runtime does not support Node.js '${a10}' module.
Learn More: https://nextjs.org/docs/messages/node-module-in-edge-runtime`;
      }
      process !== c.g.process && (process.env = c.g.process.env, c.g.process = process);
      try {
        Object.defineProperty(globalThis, "__import_unsupported", { value: function(a10) {
          let b10 = new Proxy(function() {
          }, { get(b11, c10) {
            if ("then" === c10) return {};
            throw Object.defineProperty(Error(w(a10)), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
          }, construct() {
            throw Object.defineProperty(Error(w(a10)), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
          }, apply(c10, d10, e10) {
            if ("function" == typeof e10[0]) return e10[0](b10);
            throw Object.defineProperty(Error(w(a10)), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
          } });
          return new Proxy({}, { get: () => b10 });
        }, enumerable: false, configurable: false });
      } catch {
      }
      v();
      class x extends Error {
        constructor({ page: a10 }) {
          super(`The middleware "${a10}" accepts an async API directly with the form:
  
  export function middleware(request, event) {
    return NextResponse.redirect('/new-location')
  }
  
  Read more: https://nextjs.org/docs/messages/middleware-new-signature
  `), Object.defineProperty(this, "__NEXT_ERROR_CODE", { value: "E1177", enumerable: false, configurable: true });
        }
      }
      class y extends Error {
        constructor() {
          super("The request.page has been deprecated in favour of `URLPattern`.\n  Read more: https://nextjs.org/docs/messages/middleware-request-page\n  "), Object.defineProperty(this, "__NEXT_ERROR_CODE", { value: "E1178", enumerable: false, configurable: true });
        }
      }
      class z extends Error {
        constructor() {
          super("The request.ua has been removed in favour of `userAgent` function.\n  Read more: https://nextjs.org/docs/messages/middleware-parse-user-agent\n  "), Object.defineProperty(this, "__NEXT_ERROR_CODE", { value: "E1172", enumerable: false, configurable: true });
        }
      }
      let A = "x-prerender-revalidate", B = "x-prerender-revalidate-if-generated", C = ".meta", D = "x-next-cache-tags", E = "x-next-revalidated-tags", F = "_N_T_", G = { shared: "shared", reactServerComponents: "rsc", serverSideRendering: "ssr", actionBrowser: "action-browser", apiNode: "api-node", apiEdge: "api-edge", middleware: "middleware", instrument: "instrument", edgeAsset: "edge-asset", appPagesBrowser: "app-pages-browser", pagesDirBrowser: "pages-dir-browser", pagesDirEdge: "pages-dir-edge", pagesDirNode: "pages-dir-node" };
      function H(a10) {
        var b10, c10, d10, e10, f10, g10 = [], h10 = 0;
        function i10() {
          for (; h10 < a10.length && /\s/.test(a10.charAt(h10)); ) h10 += 1;
          return h10 < a10.length;
        }
        for (; h10 < a10.length; ) {
          for (b10 = h10, f10 = false; i10(); ) if ("," === (c10 = a10.charAt(h10))) {
            for (d10 = h10, h10 += 1, i10(), e10 = h10; h10 < a10.length && "=" !== (c10 = a10.charAt(h10)) && ";" !== c10 && "," !== c10; ) h10 += 1;
            h10 < a10.length && "=" === a10.charAt(h10) ? (f10 = true, h10 = e10, g10.push(a10.substring(b10, d10)), b10 = h10) : h10 = d10 + 1;
          } else h10 += 1;
          (!f10 || h10 >= a10.length) && g10.push(a10.substring(b10, a10.length));
        }
        return g10;
      }
      function I(a10) {
        let b10 = {}, c10 = [];
        if (a10) for (let [d10, e10] of a10.entries()) "set-cookie" === d10.toLowerCase() ? (c10.push(...H(e10)), b10[d10] = 1 === c10.length ? c10[0] : c10) : b10[d10] = e10;
        return b10;
      }
      function J(a10) {
        try {
          return String(new URL(String(a10)));
        } catch (b10) {
          throw Object.defineProperty(Error(`URL is malformed "${String(a10)}". Please use only absolute URLs - https://nextjs.org/docs/messages/middleware-relative-urls`, { cause: b10 }), "__NEXT_ERROR_CODE", { value: "E61", enumerable: false, configurable: true });
        }
      }
      ({ ...G, GROUP: { builtinReact: [G.reactServerComponents, G.actionBrowser], serverOnly: [G.reactServerComponents, G.actionBrowser, G.instrument, G.middleware], neutralTarget: [G.apiNode, G.apiEdge], clientOnly: [G.serverSideRendering, G.appPagesBrowser], bundled: [G.reactServerComponents, G.actionBrowser, G.serverSideRendering, G.appPagesBrowser, G.shared, G.instrument, G.middleware], appPages: [G.reactServerComponents, G.serverSideRendering, G.appPagesBrowser, G.actionBrowser] } });
      let K = Symbol("response"), L = Symbol("passThrough"), M = Symbol("waitUntil");
      class N {
        constructor(a10, b10) {
          this[L] = false, this[M] = b10 ? { kind: "external", function: b10 } : { kind: "internal", promises: [] };
        }
        respondWith(a10) {
          this[K] || (this[K] = Promise.resolve(a10));
        }
        passThroughOnException() {
          this[L] = true;
        }
        waitUntil(a10) {
          if ("external" === this[M].kind) return (0, this[M].function)(a10);
          this[M].promises.push(a10);
        }
      }
      class O extends N {
        constructor(a10) {
          var b10;
          super(a10.request, null == (b10 = a10.context) ? void 0 : b10.waitUntil), this.sourcePage = a10.page;
        }
        get request() {
          throw Object.defineProperty(new x({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
        respondWith() {
          throw Object.defineProperty(new x({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
      }
      function P(a10) {
        return 47 === a10.charCodeAt(a10.length - 1) && a10.length > 1 ? a10.slice(0, -1) : a10;
      }
      function Q(a10) {
        let b10 = a10.indexOf("#"), c10 = a10.indexOf("?"), d10 = c10 > -1 && (b10 < 0 || c10 < b10);
        return d10 || b10 > -1 ? { pathname: a10.substring(0, d10 ? c10 : b10), query: d10 ? a10.substring(c10, b10 > -1 ? b10 : void 0) : "", hash: b10 > -1 ? a10.slice(b10) : "" } : { pathname: a10, query: "", hash: "" };
      }
      function R(a10, b10) {
        if (!a10.startsWith("/") || !b10) return a10;
        let { pathname: c10, query: d10, hash: e10 } = Q(a10);
        return `${b10}${c10}${d10}${e10}`;
      }
      function S(a10, b10) {
        if (!a10.startsWith("/") || !b10) return a10;
        let { pathname: c10, query: d10, hash: e10 } = Q(a10);
        return `${c10}${b10}${d10}${e10}`;
      }
      function T(a10, b10) {
        if ("string" != typeof a10) return false;
        let { pathname: c10 } = Q(a10);
        return c10 === b10 || c10.startsWith(b10 + "/");
      }
      let U = /* @__PURE__ */ new WeakMap();
      function V(a10, b10) {
        let c10;
        if (!b10) return { pathname: a10 };
        let d10 = U.get(b10);
        d10 || (d10 = b10.map((a11) => a11.toLowerCase()), U.set(b10, d10));
        let e10 = a10.split("/", 2);
        if (!e10[1]) return { pathname: a10 };
        let f10 = e10[1].toLowerCase(), g10 = d10.indexOf(f10);
        return g10 < 0 ? { pathname: a10 } : (c10 = b10[g10], { pathname: a10 = a10.slice(c10.length + 1) || "/", detectedLocale: c10 });
      }
      let W = /^(?:127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}|\[::1\]|localhost)$/;
      function X(a10, b10) {
        let c10 = new URL(String(a10), b10 && String(b10));
        return W.test(c10.hostname) && (c10.hostname = "localhost"), c10;
      }
      let Y = Symbol("NextURLInternal");
      class Z {
        constructor(a10, b10, c10) {
          let d10, e10;
          "object" == typeof b10 && "pathname" in b10 || "string" == typeof b10 ? (d10 = b10, e10 = c10 || {}) : e10 = c10 || b10 || {}, this[Y] = { url: X(a10, d10 ?? e10.base), options: e10, basePath: "" }, this.analyze();
        }
        analyze() {
          var a10, b10, c10, d10, e10;
          let f10 = function(a11, b11) {
            let { basePath: c11, i18n: d11, trailingSlash: e11 } = b11.nextConfig ?? {}, f11 = { pathname: a11, trailingSlash: "/" !== a11 ? a11.endsWith("/") : e11 };
            c11 && T(f11.pathname, c11) && (f11.pathname = function(a12, b12) {
              if (!T(a12, b12)) return a12;
              let c12 = a12.slice(b12.length);
              return c12.startsWith("/") ? c12 : `/${c12}`;
            }(f11.pathname, c11), f11.basePath = c11);
            let g11 = f11.pathname;
            if (f11.pathname.startsWith("/_next/data/") && f11.pathname.endsWith(".json")) {
              let a12 = f11.pathname.replace(/^\/_next\/data\//, "").replace(/\.json$/, "").split("/");
              f11.buildId = a12[0], g11 = "index" !== a12[1] ? `/${a12.slice(1).join("/")}` : "/", true === b11.parseData && (f11.pathname = g11);
            }
            if (d11) {
              let a12 = b11.i18nProvider ? b11.i18nProvider.analyze(f11.pathname) : V(f11.pathname, d11.locales);
              f11.locale = a12.detectedLocale, f11.pathname = a12.pathname ?? f11.pathname, !a12.detectedLocale && f11.buildId && (a12 = b11.i18nProvider ? b11.i18nProvider.analyze(g11) : V(g11, d11.locales)).detectedLocale && (f11.locale = a12.detectedLocale);
            }
            return f11;
          }(this[Y].url.pathname, { nextConfig: this[Y].options.nextConfig, parseData: true, i18nProvider: this[Y].options.i18nProvider }), g10 = function(a11, b11) {
            let c11;
            if (b11?.host && !Array.isArray(b11.host)) c11 = b11.host.toString().split(":", 1)[0];
            else {
              if (!a11.hostname) return;
              c11 = a11.hostname;
            }
            return c11.toLowerCase();
          }(this[Y].url, this[Y].options.headers);
          this[Y].domainLocale = this[Y].options.i18nProvider ? this[Y].options.i18nProvider.detectDomainLocale(g10) : function(a11, b11, c11) {
            if (a11) {
              for (let d11 of (c11 && (c11 = c11.toLowerCase()), a11)) if (b11 === d11.domain?.split(":", 1)[0].toLowerCase() || c11 === d11.defaultLocale.toLowerCase() || d11.locales?.some((a12) => a12.toLowerCase() === c11)) return d11;
            }
          }(null == (b10 = this[Y].options.nextConfig) || null == (a10 = b10.i18n) ? void 0 : a10.domains, g10);
          let h10 = (null == (c10 = this[Y].domainLocale) ? void 0 : c10.defaultLocale) || (null == (e10 = this[Y].options.nextConfig) || null == (d10 = e10.i18n) ? void 0 : d10.defaultLocale);
          this[Y].url.pathname = f10.pathname, this[Y].defaultLocale = h10, this[Y].basePath = f10.basePath ?? "", this[Y].buildId = f10.buildId, this[Y].locale = f10.locale ?? h10, this[Y].trailingSlash = f10.trailingSlash;
        }
        formatPathname() {
          var a10;
          let b10;
          return b10 = function(a11, b11, c10, d10) {
            if (!b11 || b11 === c10) return a11;
            let e10 = a11.toLowerCase();
            return !d10 && (T(e10, "/api") || T(e10, `/${b11.toLowerCase()}`)) ? a11 : R(a11, `/${b11}`);
          }((a10 = { basePath: this[Y].basePath, buildId: this[Y].buildId, defaultLocale: this[Y].options.forceLocale ? void 0 : this[Y].defaultLocale, locale: this[Y].locale, pathname: this[Y].url.pathname, trailingSlash: this[Y].trailingSlash }).pathname, a10.locale, a10.buildId ? void 0 : a10.defaultLocale, a10.ignorePrefix), (a10.buildId || !a10.trailingSlash) && (b10 = P(b10)), a10.buildId && (b10 = S(R(b10, `/_next/data/${a10.buildId}`), "/" === a10.pathname ? "index.json" : ".json")), b10 = R(b10, a10.basePath), !a10.buildId && a10.trailingSlash ? b10.endsWith("/") ? b10 : S(b10, "/") : P(b10);
        }
        formatSearch() {
          return this[Y].url.search;
        }
        get buildId() {
          return this[Y].buildId;
        }
        set buildId(a10) {
          this[Y].buildId = a10;
        }
        get locale() {
          return this[Y].locale ?? "";
        }
        set locale(a10) {
          var b10, c10;
          if (!this[Y].locale || !(null == (c10 = this[Y].options.nextConfig) || null == (b10 = c10.i18n) ? void 0 : b10.locales.includes(a10))) throw Object.defineProperty(TypeError(`The NextURL configuration includes no locale "${a10}"`), "__NEXT_ERROR_CODE", { value: "E597", enumerable: false, configurable: true });
          this[Y].locale = a10;
        }
        get defaultLocale() {
          return this[Y].defaultLocale;
        }
        get domainLocale() {
          return this[Y].domainLocale;
        }
        get searchParams() {
          return this[Y].url.searchParams;
        }
        get host() {
          return this[Y].url.host;
        }
        set host(a10) {
          this[Y].url.host = a10;
        }
        get hostname() {
          return this[Y].url.hostname;
        }
        set hostname(a10) {
          this[Y].url.hostname = a10;
        }
        get port() {
          return this[Y].url.port;
        }
        set port(a10) {
          this[Y].url.port = a10;
        }
        get protocol() {
          return this[Y].url.protocol;
        }
        set protocol(a10) {
          this[Y].url.protocol = a10;
        }
        get href() {
          let a10 = this.formatPathname(), b10 = this.formatSearch();
          return `${this.protocol}//${this.host}${a10}${b10}${this.hash}`;
        }
        set href(a10) {
          this[Y].url = X(a10), this.analyze();
        }
        get origin() {
          return this[Y].url.origin;
        }
        get pathname() {
          return this[Y].url.pathname;
        }
        set pathname(a10) {
          this[Y].url.pathname = a10;
        }
        get hash() {
          return this[Y].url.hash;
        }
        set hash(a10) {
          this[Y].url.hash = a10;
        }
        get search() {
          return this[Y].url.search;
        }
        set search(a10) {
          this[Y].url.search = a10;
        }
        get password() {
          return this[Y].url.password;
        }
        set password(a10) {
          this[Y].url.password = a10;
        }
        get username() {
          return this[Y].url.username;
        }
        set username(a10) {
          this[Y].url.username = a10;
        }
        get basePath() {
          return this[Y].basePath;
        }
        set basePath(a10) {
          this[Y].basePath = a10.startsWith("/") ? a10 : `/${a10}`;
        }
        toString() {
          return this.href;
        }
        toJSON() {
          return this.href;
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { href: this.href, origin: this.origin, protocol: this.protocol, username: this.username, password: this.password, host: this.host, hostname: this.hostname, port: this.port, pathname: this.pathname, search: this.search, searchParams: this.searchParams, hash: this.hash };
        }
        clone() {
          return new Z(String(this), this[Y].options);
        }
      }
      var $ = c(918);
      let _ = Symbol("internal request");
      class aa extends Request {
        constructor(a10, b10 = {}) {
          const c10 = "string" != typeof a10 && "url" in a10 ? a10.url : String(a10);
          J(c10), a10 instanceof Request ? super(a10, b10) : super(c10, b10);
          const d10 = new Z(c10, { headers: I(this.headers), nextConfig: b10.nextConfig });
          this[_] = { cookies: new $.RequestCookies(this.headers), nextUrl: d10, url: d10.toString() };
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, nextUrl: this.nextUrl, url: this.url, bodyUsed: this.bodyUsed, cache: this.cache, credentials: this.credentials, destination: this.destination, headers: Object.fromEntries(this.headers), integrity: this.integrity, keepalive: this.keepalive, method: this.method, mode: this.mode, redirect: this.redirect, referrer: this.referrer, referrerPolicy: this.referrerPolicy, signal: this.signal };
        }
        get cookies() {
          return this[_].cookies;
        }
        get nextUrl() {
          return this[_].nextUrl;
        }
        get page() {
          throw new y();
        }
        get ua() {
          throw new z();
        }
        get url() {
          return this[_].url;
        }
      }
      class ab {
        static get(a10, b10, c10) {
          let d10 = Reflect.get(a10, b10, c10);
          return "function" == typeof d10 ? d10.bind(a10) : d10;
        }
        static set(a10, b10, c10, d10) {
          return Reflect.set(a10, b10, c10, d10);
        }
        static has(a10, b10) {
          return Reflect.has(a10, b10);
        }
        static deleteProperty(a10, b10) {
          return Reflect.deleteProperty(a10, b10);
        }
      }
      let ac = Symbol("internal response"), ad = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
      function ae(a10, b10) {
        var c10;
        if (null == a10 || null == (c10 = a10.request) ? void 0 : c10.headers) {
          if (!(a10.request.headers instanceof Headers)) throw Object.defineProperty(Error("request.headers must be an instance of Headers"), "__NEXT_ERROR_CODE", { value: "E119", enumerable: false, configurable: true });
          let c11 = [];
          for (let [d10, e10] of a10.request.headers) b10.set("x-middleware-request-" + d10, e10), c11.push(d10);
          b10.set("x-middleware-override-headers", c11.join(","));
        }
      }
      class af extends Response {
        constructor(a10, b10 = {}) {
          super(a10, b10);
          const c10 = this.headers, d10 = new Proxy(new $.ResponseCookies(c10), { get(a11, d11, e10) {
            switch (d11) {
              case "delete":
              case "set":
                return (...e11) => {
                  let f10 = Reflect.apply(a11[d11], a11, e11), g10 = new Headers(c10);
                  return f10 instanceof $.ResponseCookies && c10.set("x-middleware-set-cookie", f10.getAll().map((a12) => (0, $.stringifyCookie)(a12)).join(",")), ae(b10, g10), f10;
                };
              default:
                return ab.get(a11, d11, e10);
            }
          } });
          this[ac] = { cookies: d10, url: b10.url ? new Z(b10.url, { headers: I(c10), nextConfig: b10.nextConfig }) : void 0 };
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, url: this.url, body: this.body, bodyUsed: this.bodyUsed, headers: Object.fromEntries(this.headers), ok: this.ok, redirected: this.redirected, status: this.status, statusText: this.statusText, type: this.type };
        }
        get cookies() {
          return this[ac].cookies;
        }
        static json(a10, b10) {
          let c10 = Response.json(a10, b10);
          return new af(c10.body, c10);
        }
        static redirect(a10, b10) {
          let c10 = "number" == typeof b10 ? b10 : (null == b10 ? void 0 : b10.status) ?? 307;
          if (!ad.has(c10)) throw Object.defineProperty(RangeError('Failed to execute "redirect" on "response": Invalid status code'), "__NEXT_ERROR_CODE", { value: "E529", enumerable: false, configurable: true });
          let d10 = "object" == typeof b10 ? b10 : {}, e10 = new Headers(null == d10 ? void 0 : d10.headers);
          return e10.set("Location", J(a10)), new af(null, { ...d10, headers: e10, status: c10 });
        }
        static rewrite(a10, b10) {
          let c10 = new Headers(null == b10 ? void 0 : b10.headers);
          return c10.set("x-middleware-rewrite", J(a10)), ae(b10, c10), new af(null, { ...b10, headers: c10 });
        }
        static next(a10) {
          let b10 = new Headers(null == a10 ? void 0 : a10.headers);
          return b10.set("x-middleware-next", "1"), ae(a10, b10), new af(null, { ...a10, headers: b10 });
        }
      }
      function ag(a10, b10) {
        let c10 = "string" == typeof b10 ? new URL(b10) : b10, d10 = new URL(a10, b10), e10 = d10.origin === c10.origin;
        return { url: e10 ? d10.toString().slice(c10.origin.length) : d10.toString(), isRelative: e10 };
      }
      let ah = "next-router-prefetch", ai = ["rsc", "next-router-state-tree", ah, "next-hmr-refresh", "next-router-segment-prefetch"], aj = "_rsc";
      function ak(a10) {
        return a10.startsWith("/") ? a10 : `/${a10}`;
      }
      function al(a10) {
        return ak(a10.split("/").reduce((a11, b10, c10, d10) => b10 ? "(" === b10[0] && b10.endsWith(")") || "@" === b10[0] || ("page" === b10 || "route" === b10) && c10 === d10.length - 1 ? a11 : `${a11}/${b10}` : a11, ""));
      }
      class am extends Error {
        constructor() {
          super("Headers cannot be modified. Read more: https://nextjs.org/docs/app/api-reference/functions/headers"), Object.defineProperty(this, "__NEXT_ERROR_CODE", { value: "E1176", enumerable: false, configurable: true });
        }
        static callable() {
          throw new am();
        }
      }
      class an extends Headers {
        constructor(a10) {
          super(), this.headers = new Proxy(a10, { get(b10, c10, d10) {
            if ("symbol" == typeof c10) return ab.get(b10, c10, d10);
            let e10 = c10.toLowerCase(), f10 = Object.keys(a10).find((a11) => a11.toLowerCase() === e10);
            if (void 0 !== f10) return ab.get(b10, f10, d10);
          }, set(b10, c10, d10, e10) {
            if ("symbol" == typeof c10) return ab.set(b10, c10, d10, e10);
            let f10 = c10.toLowerCase(), g10 = Object.keys(a10).find((a11) => a11.toLowerCase() === f10);
            return ab.set(b10, g10 ?? c10, d10, e10);
          }, has(b10, c10) {
            if ("symbol" == typeof c10) return ab.has(b10, c10);
            let d10 = c10.toLowerCase(), e10 = Object.keys(a10).find((a11) => a11.toLowerCase() === d10);
            return void 0 !== e10 && ab.has(b10, e10);
          }, deleteProperty(b10, c10) {
            if ("symbol" == typeof c10) return ab.deleteProperty(b10, c10);
            let d10 = c10.toLowerCase(), e10 = Object.keys(a10).find((a11) => a11.toLowerCase() === d10);
            return void 0 === e10 || ab.deleteProperty(b10, e10);
          } });
        }
        static seal(a10) {
          return new Proxy(a10, { get(a11, b10, c10) {
            switch (b10) {
              case "append":
              case "delete":
              case "set":
                return am.callable;
              default:
                return ab.get(a11, b10, c10);
            }
          } });
        }
        static fresh(a10) {
          return new Proxy(a10, { get: (a11, b10, c10) => ab.get(a11, b10, c10) });
        }
        merge(a10) {
          return Array.isArray(a10) ? a10.join(", ") : a10;
        }
        static from(a10) {
          return a10 instanceof Headers ? a10 : new an(a10);
        }
        append(a10, b10) {
          let c10 = this.headers[a10];
          "string" == typeof c10 ? this.headers[a10] = [c10, b10] : Array.isArray(c10) ? c10.push(b10) : this.headers[a10] = b10;
        }
        delete(a10) {
          delete this.headers[a10];
        }
        get(a10) {
          let b10 = this.headers[a10];
          return void 0 !== b10 ? this.merge(b10) : null;
        }
        has(a10) {
          return void 0 !== this.headers[a10];
        }
        set(a10, b10) {
          this.headers[a10] = b10;
        }
        forEach(a10, b10) {
          for (let [c10, d10] of this.entries()) a10.call(b10, d10, c10, this);
        }
        *entries() {
          for (let a10 of Object.keys(this.headers)) {
            let b10 = a10.toLowerCase(), c10 = this.get(b10);
            yield [b10, c10];
          }
        }
        *keys() {
          for (let a10 of Object.keys(this.headers)) {
            let b10 = a10.toLowerCase();
            yield b10;
          }
        }
        *values() {
          for (let a10 of Object.keys(this.headers)) {
            let b10 = this.get(a10);
            yield b10;
          }
        }
        [Symbol.iterator]() {
          return this.entries();
        }
      }
      let ao = Object.defineProperty(Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available"), "__NEXT_ERROR_CODE", { value: "E504", enumerable: false, configurable: true });
      class ap {
        disable() {
          throw ao;
        }
        getStore() {
        }
        run() {
          throw ao;
        }
        exit() {
          throw ao;
        }
        enterWith() {
          throw ao;
        }
        static bind(a10) {
          return a10;
        }
      }
      let aq = "u" > typeof globalThis && globalThis.AsyncLocalStorage;
      function ar() {
        return aq ? new aq() : new ap();
      }
      let as = ar();
      class at extends Error {
        constructor() {
          super("Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#options"), Object.defineProperty(this, "__NEXT_ERROR_CODE", { value: "E1180", enumerable: false, configurable: true });
        }
        static callable() {
          throw new at();
        }
      }
      class au {
        static seal(a10) {
          return new Proxy(a10, { get(a11, b10, c10) {
            switch (b10) {
              case "clear":
              case "delete":
              case "set":
                return at.callable;
              default:
                return ab.get(a11, b10, c10);
            }
          } });
        }
        static fresh(a10) {
          return new Proxy(a10, { get: (a11, b10, c10) => ab.get(a11, b10, c10) });
        }
      }
      let av = Symbol.for("next.mutated.cookies");
      class aw {
        static wrap(a10, b10) {
          let c10 = new $.ResponseCookies(new Headers());
          for (let b11 of a10.getAll()) c10.set(b11);
          let d10 = [], e10 = /* @__PURE__ */ new Set(), f10 = () => {
            let a11 = as.getStore();
            if (a11 && (a11.pathWasRevalidated = 1), d10 = c10.getAll().filter((a12) => e10.has(a12.name)), b10) {
              let a12 = [];
              for (let b11 of d10) {
                let c11 = new $.ResponseCookies(new Headers());
                c11.set(b11), a12.push(c11.toString());
              }
              b10(a12);
            }
          }, g10 = new Proxy(c10, { get(a11, b11, c11) {
            switch (b11) {
              case av:
                return d10;
              case "delete":
                return function(...b12) {
                  e10.add("string" == typeof b12[0] ? b12[0] : b12[0].name);
                  try {
                    return a11.delete(...b12), g10;
                  } finally {
                    f10();
                  }
                };
              case "set":
                return function(...b12) {
                  e10.add("string" == typeof b12[0] ? b12[0] : b12[0].name);
                  try {
                    return a11.set(...b12), g10;
                  } finally {
                    f10();
                  }
                };
              default:
                return ab.get(a11, b11, c11);
            }
          } });
          return g10;
        }
      }
      function ax(a10) {
        return "action" === a10.phase;
      }
      function ay(a10, b10) {
        if (!ax(a10)) throw new at();
      }
      var az = ((fG = az || {}).handleRequest = "BaseServer.handleRequest", fG.run = "BaseServer.run", fG.pipe = "BaseServer.pipe", fG.getStaticHTML = "BaseServer.getStaticHTML", fG.render = "BaseServer.render", fG.renderToResponseWithComponents = "BaseServer.renderToResponseWithComponents", fG.renderToResponse = "BaseServer.renderToResponse", fG.renderToHTML = "BaseServer.renderToHTML", fG.renderError = "BaseServer.renderError", fG.renderErrorToResponse = "BaseServer.renderErrorToResponse", fG.renderErrorToHTML = "BaseServer.renderErrorToHTML", fG.render404 = "BaseServer.render404", fG), aA = ((fH = aA || {}).loadDefaultErrorComponents = "LoadComponents.loadDefaultErrorComponents", fH.loadComponents = "LoadComponents.loadComponents", fH), aB = ((fI = aB || {}).getRequestHandler = "NextServer.getRequestHandler", fI.getRequestHandlerWithMetadata = "NextServer.getRequestHandlerWithMetadata", fI.getServer = "NextServer.getServer", fI.getServerRequestHandler = "NextServer.getServerRequestHandler", fI.createServer = "createServer.createServer", fI), aC = ((fJ = aC || {}).compression = "NextNodeServer.compression", fJ.getBuildId = "NextNodeServer.getBuildId", fJ.createComponentTree = "NextNodeServer.createComponentTree", fJ.clientComponentLoading = "NextNodeServer.clientComponentLoading", fJ.getLayoutOrPageModule = "NextNodeServer.getLayoutOrPageModule", fJ.generateStaticRoutes = "NextNodeServer.generateStaticRoutes", fJ.generateFsStaticRoutes = "NextNodeServer.generateFsStaticRoutes", fJ.generatePublicRoutes = "NextNodeServer.generatePublicRoutes", fJ.generateImageRoutes = "NextNodeServer.generateImageRoutes.route", fJ.sendRenderResult = "NextNodeServer.sendRenderResult", fJ.proxyRequest = "NextNodeServer.proxyRequest", fJ.runApi = "NextNodeServer.runApi", fJ.render = "NextNodeServer.render", fJ.renderHTML = "NextNodeServer.renderHTML", fJ.imageOptimizer = "NextNodeServer.imageOptimizer", fJ.getPagePath = "NextNodeServer.getPagePath", fJ.getRoutesManifest = "NextNodeServer.getRoutesManifest", fJ.findPageComponents = "NextNodeServer.findPageComponents", fJ.getFontManifest = "NextNodeServer.getFontManifest", fJ.getServerComponentManifest = "NextNodeServer.getServerComponentManifest", fJ.getRequestHandler = "NextNodeServer.getRequestHandler", fJ.renderToHTML = "NextNodeServer.renderToHTML", fJ.renderError = "NextNodeServer.renderError", fJ.renderErrorToHTML = "NextNodeServer.renderErrorToHTML", fJ.render404 = "NextNodeServer.render404", fJ.startResponse = "NextNodeServer.startResponse", fJ.route = "route", fJ.onProxyReq = "onProxyReq", fJ.apiResolver = "apiResolver", fJ.internalFetch = "internalFetch", fJ), aD = ((fK = aD || {}).startServer = "startServer.startServer", fK), aE = ((fL = aE || {}).getServerSideProps = "Render.getServerSideProps", fL.getStaticProps = "Render.getStaticProps", fL.renderToString = "Render.renderToString", fL.renderDocument = "Render.renderDocument", fL.createBodyResult = "Render.createBodyResult", fL), aF = ((fM = aF || {}).renderToString = "AppRender.renderToString", fM.renderToReadableStream = "AppRender.renderToReadableStream", fM.getBodyResult = "AppRender.getBodyResult", fM.fetch = "AppRender.fetch", fM.waitShellReady = "AppRender.waitShellReady", fM.renderToNodeFizzStream = "AppRender.renderToNodeFizzStream", fM.instantInsights = "AppRender.instantInsights", fM.instantInsightsPrepareValidation = "AppRender.instantInsights.prepareValidation", fM.instantInsightsRunValidation = "AppRender.instantInsights.runValidation", fM), aG = ((fN = aG || {}).executeRoute = "Router.executeRoute", fN), aH = ((fO = aH || {}).runHandler = "Node.runHandler", fO), aI = ((fP = aI || {}).runHandler = "AppRouteRouteHandlers.runHandler", fP), aJ = ((fQ = aJ || {}).generateMetadata = "ResolveMetadata.generateMetadata", fQ.generateViewport = "ResolveMetadata.generateViewport", fQ), aK = ((fR = aK || {}).execute = "Middleware.execute", fR);
      let aL = /* @__PURE__ */ new Set(["Middleware.execute", "BaseServer.handleRequest", "Render.getServerSideProps", "Render.getStaticProps", "AppRender.fetch", "AppRender.getBodyResult", "Render.renderDocument", "Node.runHandler", "AppRouteRouteHandlers.runHandler", "ResolveMetadata.generateMetadata", "ResolveMetadata.generateViewport", "NextNodeServer.createComponentTree", "NextNodeServer.findPageComponents", "NextNodeServer.getLayoutOrPageModule", "NextNodeServer.startResponse", "NextNodeServer.clientComponentLoading"]), aM = /* @__PURE__ */ new Set(["NextNodeServer.findPageComponents", "NextNodeServer.createComponentTree", "NextNodeServer.clientComponentLoading"]);
      function aN(a10) {
        return null !== a10 && "object" == typeof a10 && "then" in a10 && "function" == typeof a10.then;
      }
      let aO = process.env.NEXT_OTEL_PERFORMANCE_PREFIX;
      function aP() {
      }
      Symbol.for("@next/local-span-recorder");
      let { context: aQ, propagation: aR, trace: aS, SpanStatusCode: aT, SpanKind: aU, ROOT_CONTEXT: aV } = d = c(446);
      class aW extends Error {
        constructor(a10, b10) {
          super(), this.bubble = a10, this.result = b10;
        }
      }
      let aX = (a10, b10) => {
        "object" == typeof b10 && null !== b10 && b10 instanceof aW && b10.bubble ? a10.setAttribute("next.bubble", true) : (b10 && (a10.recordException(b10), a10.setAttribute("error.type", b10.name)), a10.setStatus({ code: aT.ERROR, message: null == b10 ? void 0 : b10.message })), a10.end();
      }, aY = /* @__PURE__ */ new Map(), aZ = d.createContextKey("next.rootSpanId"), a$ = 0, a_ = { set(a10, b10, c10) {
        a10.push({ key: b10, value: c10 });
      } };
      class a0 {
        getTracerInstance() {
          return aS.getTracer("next.js", "0.0.1");
        }
        isOpenTelemetryEnabled() {
          var a10, b10;
          let c10 = aS.getSpan(aQ.active());
          if (null == c10 ? void 0 : c10.isRecording()) return true;
          let d10 = aS.getTracerProvider();
          return !("getDelegate" in d10) || (null == d10.getDelegate || null == (b10 = d10.getDelegate.call(d10)) || null == (a10 = b10.constructor) ? void 0 : a10.name) !== "NoopTracerProvider";
        }
        getContext() {
          return aQ;
        }
        getTracePropagationData() {
          let a10 = aQ.active(), b10 = [];
          return aR.inject(a10, b10, a_), b10;
        }
        getActiveScopeSpan() {
          let a10 = aP(), b10 = null == a10 ? void 0 : a10.getActiveLocalSpan();
          return b10 && (null == a10 ? void 0 : a10.isOpenTelemetryIsolatedSpan(b10)) ? b10 : aS.getSpan(aQ.active());
        }
        runWithDetachedContext(a10) {
          return aO || this.isOpenTelemetryEnabled() ? aQ.with(aV, a10) : a10();
        }
        withPropagatedContext(a10, b10, c10, d10 = false) {
          let e10 = aQ.active();
          if (!aO && !this.isOpenTelemetryEnabled() && !aS.getSpanContext(e10)) return b10();
          if (d10) {
            let d11 = aR.extract(aV, a10, c10);
            if (aS.getSpanContext(d11)) return aQ.with(d11, b10);
            let f11 = aR.extract(e10, a10, c10);
            return aQ.with(f11, b10);
          }
          if (aS.getSpanContext(e10)) return b10();
          let f10 = aR.extract(e10, a10, c10);
          return aQ.with(f10, b10);
        }
        trace(...a10) {
          let [b10, c10, d10] = a10, e10 = !!aO || this.isOpenTelemetryEnabled(), f10 = aP(), g10 = (null == f10 ? void 0 : f10.isLocalSpanRecordingEnabled()) ?? false;
          if (!e10 && !g10) return "function" == typeof c10 ? c10() : d10();
          let { fn: h10, options: i10 } = "function" == typeof c10 ? { fn: c10, options: {} } : { fn: d10, options: { ...c10 } }, j2 = i10.spanName ?? b10, k2 = i10.parentSpan ?? this.getActiveScopeSpan(), l2 = k2 && (null == f10 ? void 0 : f10.isOpenTelemetryIsolatedSpan(k2)) ? k2 : void 0, m2 = !l2 && (aL.has(b10) || "1" === process.env.NEXT_OTEL_VERBOSE);
          if (!(m2 || (null == f10 ? void 0 : f10.isRequestInsightsEnabled())) || i10.hideSpan) return h10();
          let n2 = l2 ? aQ.active() : this.getSpanContext(k2);
          n2 || (n2 = (null == aQ ? void 0 : aQ.active()) ?? aV);
          let o2 = n2.getValue(aZ), p2 = "number" != typeof o2 || !aY.has(o2), q2 = a$++;
          return i10.attributes = { "next.span_category": "nextjs", "next.span_name": j2, "next.span_type": b10, ...i10.attributes }, aQ.with(n2.setValue(aZ, q2), () => this.runWithActiveSpan(j2, i10, n2, e10 && m2, g10, l2, (a11) => {
            let c11;
            aO && b10 && aM.has(b10) && (c11 = "performance" in globalThis && "measure" in performance ? globalThis.performance.now() : void 0);
            let d11 = false, e11 = () => {
              !d11 && (d11 = true, aY.delete(q2), c11 && performance.measure(`${aO}:next-${(b10.split(".").pop() || "").replace(/[A-Z]/g, (a12) => "-" + a12.toLowerCase())}`, { start: c11, end: performance.now() }));
            };
            if (p2 && aY.set(q2, new Map(Object.entries(i10.attributes ?? {}))), h10.length > 1) try {
              return h10(a11, (b11) => {
                b11 ? aX(a11, b11) : a11.end();
              });
            } catch (b11) {
              throw aX(a11, b11), b11;
            } finally {
              e11();
            }
            try {
              let b11 = h10(a11);
              if (aN(b11)) return b11.then((b12) => (a11.end(), b12)).catch((b12) => {
                throw aX(a11, b12), b12;
              }).finally(e11);
              return a11.end(), e11(), b11;
            } catch (b11) {
              throw aX(a11, b11), e11(), b11;
            }
          }));
        }
        runWithActiveSpan(a10, b10, c10, d10, e10, f10, g10) {
          if (d10) return this.getTracerInstance().startActiveSpan(a10, b10, (d11) => g10(e10 ? this.createLocalRecordingSpan(a10, b10, c10, d11, f10) : d11));
          let h10 = this.createLocalRecordingSpan(a10, b10, c10, void 0, f10), i10 = aP();
          return i10.withLocalSpan(h10, () => i10.isOpenTelemetryIsolatedSpan(h10) ? g10(h10) : aQ.with(aS.setSpan(aQ.active(), h10), g10, void 0, h10));
        }
        createLocalRecordingSpan(a10, b10, c10, d10, e10) {
          let f10 = (null == e10 ? void 0 : e10.spanContext()) ?? aS.getSpanContext(c10), g10 = null == d10 ? void 0 : d10.spanContext();
          return aP().createLocalSpan({ name: a10, attributes: b10.attributes, links: b10.links, startTime: b10.startTime, delegateSpan: d10, traceId: (null == g10 ? void 0 : g10.traceId) ?? (null == f10 ? void 0 : f10.traceId), spanId: null == g10 ? void 0 : g10.spanId, parentSpanId: null == f10 ? void 0 : f10.spanId, isolateOpenTelemetry: void 0 !== e10 });
        }
        wrap(...a10) {
          let b10 = this, [c10, d10, e10] = 3 === a10.length ? a10 : [a10[0], {}, a10[1]];
          return aL.has(c10) || "1" === process.env.NEXT_OTEL_VERBOSE ? function() {
            let a11 = d10;
            "function" == typeof a11 && "function" == typeof e10 && (a11 = a11.apply(this, arguments));
            let f10 = arguments.length - 1, g10 = arguments[f10];
            if ("function" != typeof g10) return b10.trace(c10, a11, () => e10.apply(this, arguments));
            {
              let d11 = b10.getContext().bind(aQ.active(), g10);
              return b10.trace(c10, a11, (a12, b11) => (arguments[f10] = function(a13) {
                return null == b11 || b11(a13), d11.apply(this, arguments);
              }, e10.apply(this, arguments)));
            }
          } : e10;
        }
        startSpan(...a10) {
          let [b10, c10] = a10, d10 = c10 ? { ...c10, attributes: { "next.span_category": "nextjs", ...c10.attributes } } : { attributes: { "next.span_category": "nextjs" } }, e10 = aP(), f10 = d10.parentSpan ?? this.getActiveScopeSpan(), g10 = f10 && (null == e10 ? void 0 : e10.isOpenTelemetryIsolatedSpan(f10)) ? f10 : void 0, h10 = (g10 ? void 0 : this.getSpanContext(f10)) ?? aQ.active();
          if (!(null == e10 ? void 0 : e10.isLocalSpanRecordingEnabled())) return this.getTracerInstance().startSpan(b10, d10, h10);
          let i10 = !g10 && this.isOpenTelemetryEnabled() ? this.getTracerInstance().startSpan(b10, d10, h10) : void 0;
          return this.createLocalRecordingSpan(b10, d10, h10, i10, g10);
        }
        getSpanContext(a10) {
          return a10 ? aS.setSpan(aQ.active(), a10) : void 0;
        }
        getRootSpanAttributes() {
          let a10 = aQ.active().getValue(aZ);
          return aY.get(a10);
        }
        setRootSpanAttribute(a10, b10) {
          let c10 = aQ.active().getValue(aZ), d10 = aY.get(c10);
          d10 && !d10.has(a10) && d10.set(a10, b10);
        }
        withSpan(a10, b10) {
          let c10 = aP();
          return (null == c10 ? void 0 : c10.isLocalRecordingSpan(a10)) ? c10.withLocalSpan(a10, () => c10.isOpenTelemetryIsolatedSpan(a10) ? b10() : aQ.with(aS.setSpan(aQ.active(), a10), b10)) : aQ.with(aS.setSpan(aQ.active(), a10), b10);
        }
      }
      let a1 = (j = new a0(), () => j), a2 = "__prerender_bypass";
      Symbol("__next_preview_data"), Symbol(a2);
      class a3 {
        constructor(a10, b10, c10, d10) {
          var e10;
          const f10 = a10 && function(a11, b11) {
            if ("function" == typeof a11.get) {
              let c11 = an.from(a11);
              return { isOnDemandRevalidate: c11.get(A) === b11.previewModeId, revalidateOnlyGenerated: c11.has(B) };
            }
            return { isOnDemandRevalidate: a11[A] === b11.previewModeId, revalidateOnlyGenerated: a11.hasOwnProperty(B) };
          }(b10, a10).isOnDemandRevalidate, g10 = null == (e10 = c10.get(a2)) ? void 0 : e10.value;
          this._isEnabled = !!(!f10 && g10 && a10 && g10 === a10.previewModeId), this._previewModeId = null == a10 ? void 0 : a10.previewModeId, this._mutableCookies = d10;
        }
        get isEnabled() {
          return this._isEnabled;
        }
        enable() {
          if (!this._previewModeId) throw Object.defineProperty(Error("Invariant: previewProps missing previewModeId this should never happen"), "__NEXT_ERROR_CODE", { value: "E93", enumerable: false, configurable: true });
          this._mutableCookies.set({ name: a2, value: this._previewModeId, httpOnly: true, sameSite: "none", secure: true, path: "/" }), this._isEnabled = true;
        }
        disable() {
          this._mutableCookies.set({ name: a2, value: "", httpOnly: true, sameSite: "none", secure: true, path: "/", expires: /* @__PURE__ */ new Date(0) }), this._isEnabled = false;
        }
      }
      function a4(a10, b10) {
        if ("x-middleware-set-cookie" in a10 && "string" == typeof a10["x-middleware-set-cookie"]) {
          let c10 = a10["x-middleware-set-cookie"], d10 = new Headers();
          for (let a11 of H(c10)) d10.append("set-cookie", a11);
          for (let a11 of new $.ResponseCookies(d10).getAll()) b10.set(a11);
        }
      }
      let a5 = ar();
      function a6(a10) {
        throw Object.defineProperty(Error(`\`${a10}\` was called outside a request scope. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context`), "__NEXT_ERROR_CODE", { value: "E251", enumerable: false, configurable: true });
      }
      function a7(a10) {
        switch (a10.type) {
          case "request":
          case "prerender":
          case "prerender-runtime":
          case "prerender-client":
          case "validation-client":
          case "prerender-ppr":
            return a10.resumeDataCache;
          case "cache":
          case "private-cache":
          case "unstable-cache":
          case "prerender-legacy":
          case "generate-static-params":
            return null;
          default:
            return a10;
        }
      }
      var a8 = c(232), a9 = c.n(a8);
      class ba extends Error {
        constructor(a10, b10) {
          super(`Invariant: ${a10.endsWith(".") ? a10 : a10 + "."} This is a bug in Next.js.`, b10), Object.defineProperty(this, "__NEXT_ERROR_CODE", { value: "E1179", enumerable: false, configurable: true }), this.name = "InvariantError";
        }
      }
      class bb {
        constructor(a10, b10, c10) {
          this.prev = null, this.next = null, this.key = a10, this.data = b10, this.size = c10;
        }
      }
      class bc {
        constructor() {
          this.prev = null, this.next = null;
        }
      }
      class bd {
        constructor(a10, b10, c10) {
          this.cache = /* @__PURE__ */ new Map(), this.totalSize = 0, this.maxSize = a10, this.calculateSize = b10, this.onEvict = c10, this.head = new bc(), this.tail = new bc(), this.head.next = this.tail, this.tail.prev = this.head;
        }
        addToHead(a10) {
          a10.prev = this.head, a10.next = this.head.next, this.head.next.prev = a10, this.head.next = a10;
        }
        removeNode(a10) {
          a10.prev.next = a10.next, a10.next.prev = a10.prev;
        }
        moveToHead(a10) {
          this.removeNode(a10), this.addToHead(a10);
        }
        removeTail() {
          let a10 = this.tail.prev;
          return this.removeNode(a10), a10;
        }
        set(a10, b10) {
          let c10 = (null == this.calculateSize ? void 0 : this.calculateSize.call(this, b10, a10)) ?? 1;
          if (c10 <= 0) throw Object.defineProperty(Error(`LRUCache: calculateSize returned ${c10}, but size must be > 0. Items with size 0 would never be evicted, causing unbounded cache growth.`), "__NEXT_ERROR_CODE", { value: "E1045", enumerable: false, configurable: true });
          if (c10 > this.maxSize) return console.warn("Single item size exceeds maxSize"), false;
          let d10 = this.cache.get(a10);
          if (d10) d10.data = b10, this.totalSize = this.totalSize - d10.size + c10, d10.size = c10, this.moveToHead(d10);
          else {
            let d11 = new bb(a10, b10, c10);
            this.cache.set(a10, d11), this.addToHead(d11), this.totalSize += c10;
          }
          for (; this.totalSize > this.maxSize && this.cache.size > 0; ) {
            let a11 = this.removeTail();
            this.cache.delete(a11.key), this.totalSize -= a11.size, null == this.onEvict || this.onEvict.call(this, a11.key, a11.data);
          }
          return true;
        }
        has(a10) {
          return this.cache.has(a10);
        }
        get(a10) {
          let b10 = this.cache.get(a10);
          if (b10) return this.moveToHead(b10), b10.data;
        }
        *[Symbol.iterator]() {
          let a10 = this.head.next;
          for (; a10 && a10 !== this.tail; ) {
            let b10 = a10;
            yield [b10.key, b10.data], a10 = a10.next;
          }
        }
        remove(a10) {
          let b10 = this.cache.get(a10);
          b10 && (this.removeNode(b10), this.cache.delete(a10), this.totalSize -= b10.size);
        }
        get size() {
          return this.cache.size;
        }
        get currentSize() {
          return this.totalSize;
        }
      }
      let be = /* @__PURE__ */ new Map(), bf = (a10, b10) => {
        for (let c10 of a10) {
          let a11 = be.get(c10), d10 = null == a11 ? void 0 : a11.expired;
          if ("number" == typeof d10 && d10 <= performance.timeOrigin + performance.now() && d10 > b10) return true;
        }
        return false;
      }, bg = (a10, b10) => {
        for (let c10 of a10) {
          let a11 = be.get(c10), d10 = (null == a11 ? void 0 : a11.stale) ?? 0;
          if ("number" == typeof d10 && d10 > b10) return true;
        }
        return false;
      };
      c(356).Buffer, process.env.NEXT_PRIVATE_DEBUG_CACHE, Symbol.for("@next/cache-handlers");
      let bh = Symbol.for("@next/cache-handlers-map"), bi = Symbol.for("@next/cache-handlers-set");
      Symbol.for("@next/cache-handlers-private"), Symbol.for("@next/cache-handlers-dev-fronts"), Symbol.for("@next/cache-handlers-dev-tiered"), Symbol.for("@next/cache-handlers-memory-disabled");
      let bj = globalThis;
      function bk() {
        let a10 = bj[bh];
        if (a10) return a10.entries();
      }
      async function bl(a10, b10) {
        if (!a10) return b10();
        let c10 = bm(a10);
        try {
          return await b10();
        } finally {
          var d10, e10, f10, g10;
          let b11, h10, i10, j2, k2 = (d10 = c10, e10 = bm(a10), b11 = new Set(d10.pendingRevalidatedTags.map((a11) => {
            let b12 = "object" == typeof a11.profile ? JSON.stringify(a11.profile) : a11.profile || "";
            return `${a11.tag}:${b12}`;
          })), h10 = new Set(d10.pendingRevalidateWrites), { pendingRevalidatedTags: e10.pendingRevalidatedTags.filter((a11) => {
            let c11 = "object" == typeof a11.profile ? JSON.stringify(a11.profile) : a11.profile || "";
            return !b11.has(`${a11.tag}:${c11}`);
          }), pendingRevalidates: Object.fromEntries(Object.entries(e10.pendingRevalidates).filter(([a11]) => !(a11 in d10.pendingRevalidates))), pendingRevalidateWrites: e10.pendingRevalidateWrites.filter((a11) => !h10.has(a11)) });
          await (f10 = a10, i10 = [], (j2 = (null == (g10 = k2) ? void 0 : g10.pendingRevalidatedTags) ?? f10.pendingRevalidatedTags ?? []).length > 0 && i10.push(bn(j2, f10.incrementalCache, f10)), i10.push(...Object.values((null == g10 ? void 0 : g10.pendingRevalidates) ?? f10.pendingRevalidates ?? {})), i10.push(...(null == g10 ? void 0 : g10.pendingRevalidateWrites) ?? f10.pendingRevalidateWrites ?? []), 0 !== i10.length && Promise.all(i10).then(() => void 0));
        }
      }
      function bm(a10) {
        return { pendingRevalidatedTags: a10.pendingRevalidatedTags ? [...a10.pendingRevalidatedTags] : [], pendingRevalidates: { ...a10.pendingRevalidates }, pendingRevalidateWrites: a10.pendingRevalidateWrites ? [...a10.pendingRevalidateWrites] : [] };
      }
      async function bn(a10, b10, c10) {
        if (0 === a10.length) return;
        let d10 = function() {
          let a11 = bj[bi];
          if (a11) return a11.values();
        }(), e10 = [], f10 = /* @__PURE__ */ new Map();
        for (let b11 of a10) {
          let a11, c11 = b11.profile;
          for (let [b12] of f10) if ("string" == typeof b12 && "string" == typeof c11 && b12 === c11 || "object" == typeof b12 && "object" == typeof c11 && JSON.stringify(b12) === JSON.stringify(c11) || b12 === c11) {
            a11 = b12;
            break;
          }
          let d11 = a11 || c11;
          f10.has(d11) || f10.set(d11, []), f10.get(d11).push(b11.tag);
        }
        for (let [a11, g10] of f10) {
          let f11;
          if (a11) {
            let b11;
            if ("object" == typeof a11) b11 = a11;
            else if ("string" == typeof a11 && !(b11 = null == c10 ? void 0 : c10.cacheLifeProfiles[a11])) throw Object.defineProperty(Error(`Invalid profile provided "${a11}" must be configured under cacheLife in next.config or be "max"`), "__NEXT_ERROR_CODE", { value: "E873", enumerable: false, configurable: true });
            b11 && (f11 = { expire: b11.expire });
          }
          for (let b11 of d10 || []) a11 ? e10.push(null == b11.updateTags ? void 0 : b11.updateTags.call(b11, g10, f11)) : e10.push(null == b11.updateTags ? void 0 : b11.updateTags.call(b11, g10));
          b10 && e10.push(b10.revalidateTag(g10, f11));
        }
        await Promise.all(e10);
      }
      let bo = Object.defineProperty(Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available"), "__NEXT_ERROR_CODE", { value: "E504", enumerable: false, configurable: true });
      class bp {
        disable() {
          throw bo;
        }
        getStore() {
        }
        run() {
          throw bo;
        }
        exit() {
          throw bo;
        }
        enterWith() {
          throw bo;
        }
        static bind(a10) {
          return a10;
        }
      }
      let bq = "u" > typeof globalThis && globalThis.AsyncLocalStorage, br = bq ? new bq() : new bp();
      class bs {
        constructor({ waitUntil: a10, onClose: b10, onTaskError: c10 }) {
          this.isRequestClosed = false, this.initialOnCloseError = null, this.workUnitStores = /* @__PURE__ */ new Set(), this.waitUntil = a10, this.onClose = b10, this.onTaskError = c10, this.callbackQueue = new (a9())(), this.callbackQueue.pause();
          try {
            b10(() => {
              for (let a11 of (this.isRequestClosed = true, this.workUnitStores)) a11.phase = "after";
            });
          } catch (a11) {
            this.initialOnCloseError = { error: a11 };
          }
        }
        after(a10, b10) {
          if (this.initialOnCloseError) throw Object.defineProperty(new ba("An onClose call failed, which means after() can't work correctly.", { cause: this.initialOnCloseError.error }), "__NEXT_ERROR_CODE", { value: "E1376", enumerable: false, configurable: true });
          if (this.workUnitStores.add(b10), aN(a10)) this.addThenable(a10);
          else if ("function" == typeof a10) this.addCallback(a10, b10);
          else throw Object.defineProperty(Error("`after()`: Argument must be a promise or a function"), "__NEXT_ERROR_CODE", { value: "E50", enumerable: false, configurable: true });
        }
        addThenable(a10) {
          this.waitUntil || bt(), this.waitUntil(new Promise((b10) => {
            a10.then(() => {
              b10();
            }, (a11) => {
              b10(), this.reportTaskError("promise", a11);
            });
          }));
        }
        addCallback(a10, b10) {
          var c10;
          this.waitUntil || bt();
          let d10 = br.getStore(), e10 = d10 ? d10.rootTaskSpawnPhase : b10.phase;
          this.runCallbacksOnClosePromise || (this.runCallbacksOnClosePromise = this.runCallbacksOnClose(), this.waitUntil(this.runCallbacksOnClosePromise));
          let f10 = (c10 = async () => {
            try {
              await br.run({ rootTaskSpawnPhase: e10 }, () => a10());
            } catch (a11) {
              this.reportTaskError("function", a11);
            }
          }, bq ? bq.bind(c10) : bp.bind(c10));
          this.callbackQueue.add(f10);
        }
        async runCallbacksOnClose() {
          return this.isRequestClosed ? await new Promise((a10) => {
            setTimeout(a10, 0);
          }) : await new Promise((a10) => this.onClose(a10)), this.runCallbacks();
        }
        async runCallbacks() {
          if (0 === this.callbackQueue.size) return;
          let a10 = as.getStore();
          if (!a10) throw Object.defineProperty(new ba("Missing workStore in AfterContext.runCallbacks"), "__NEXT_ERROR_CODE", { value: "E547", enumerable: false, configurable: true });
          return bl(a10, () => (this.callbackQueue.start(), this.callbackQueue.onIdle()));
        }
        reportTaskError(a10, b10) {
          if (console.error("promise" === a10 ? "A promise passed to `after()` rejected:" : "An error occurred in a function passed to `after()`:", b10), this.onTaskError) try {
            null == this.onTaskError || this.onTaskError.call(this, b10);
          } catch (a11) {
            console.error(Object.defineProperty(new ba("`onTaskError` threw while handling an error thrown from an `after` task", { cause: a11 }), "__NEXT_ERROR_CODE", { value: "E569", enumerable: false, configurable: true }));
          }
        }
      }
      function bt() {
        throw Object.defineProperty(Error("`after()` will not work correctly, because `waitUntil` is not available in the current environment."), "__NEXT_ERROR_CODE", { value: "E91", enumerable: false, configurable: true });
      }
      function bu(a10) {
        let b10, c10 = { then: (d10, e10) => (b10 || (b10 = Promise.resolve(a10())), b10.then((a11) => {
          c10.value = a11;
        }).catch(() => {
        }), b10.then(d10, e10)) };
        return c10;
      }
      class bv {
        onClose(a10) {
          if (this.isClosed) throw Object.defineProperty(Error("Cannot subscribe to a closed CloseController"), "__NEXT_ERROR_CODE", { value: "E365", enumerable: false, configurable: true });
          this.target.addEventListener("close", a10), this.listeners++;
        }
        dispatchClose() {
          if (this.isClosed) throw Object.defineProperty(Error("Cannot close a CloseController multiple times"), "__NEXT_ERROR_CODE", { value: "E229", enumerable: false, configurable: true });
          this.listeners > 0 && this.target.dispatchEvent(new Event("close")), this.isClosed = true;
        }
        constructor() {
          this.target = new EventTarget(), this.listeners = 0, this.isClosed = false;
        }
      }
      function bw() {
        return { previewModeId: process.env.__NEXT_PREVIEW_MODE_ID || "", previewModeSigningKey: process.env.__NEXT_PREVIEW_MODE_SIGNING_KEY || "", previewModeEncryptionKey: process.env.__NEXT_PREVIEW_MODE_ENCRYPTION_KEY || "" };
      }
      let bx = Symbol.for("@next/request-context"), by = /[^\t\x20-\x7e]/, bz = /[^\t\x20-\x7e]+/g;
      function bA(a10) {
        return by.test(a10) ? a10.replace(bz, (a11) => encodeURIComponent(a11)) : a10;
      }
      async function bB(a10, b10, c10) {
        let d10 = /* @__PURE__ */ new Set();
        for (let b11 of ((a11) => {
          let b12 = ["/layout"];
          if (a11.startsWith("/")) {
            let c11 = a11.indexOf("/", 1);
            for (; ; ) {
              -1 === c11 && (c11 = a11.length);
              let d11 = a11.slice(0, c11);
              if (d11 && (d11.endsWith("/page") || d11.endsWith("/route") || (d11 = `${d11}${!d11.endsWith("/") ? "/" : ""}layout`), b12.push(d11)), c11 === a11.length) break;
              c11 = a11.indexOf("/", c11 + 1);
            }
          }
          return b12;
        })(a10)) b11 = bA(`${F}${b11}`), d10.add(b11);
        if (b10 && (!c10 || 0 === c10.size)) {
          let a11 = bA(`${F}${b10}`);
          d10.add(a11);
        }
        d10.has(`${F}/`) && d10.add(`${F}/index`), d10.has(`${F}/index`) && d10.add(`${F}/`);
        let e10 = Array.from(d10);
        return { tags: e10, expirationsByCacheKind: function(a11) {
          let b11 = /* @__PURE__ */ new Map(), c11 = bk();
          if (c11) for (let [d11, e11] of c11) "getExpiration" in e11 && b11.set(d11, bu(async () => e11.getExpiration(a11)));
          return b11;
        }(e10) };
      }
      let bC = Symbol.for("NextInternalRequestMeta"), bD = { get default() {
        throw Object.defineProperty(new ba("Proxy does not support `use cache`, so reading its `default` cacheLife profile is unexpected."), "__NEXT_ERROR_CODE", { value: "E1406", enumerable: false, configurable: true });
      } };
      class bE extends aa {
        constructor(a10) {
          super(a10.input, a10.init), this.sourcePage = a10.page;
        }
        get request() {
          throw Object.defineProperty(new x({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
        respondWith() {
          throw Object.defineProperty(new x({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
        waitUntil() {
          throw Object.defineProperty(new x({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
      }
      let bF = { keys: (a10) => Array.from(a10.keys()), get: (a10, b10) => a10.get(b10) ?? void 0 }, bG = (a10, b10) => a1().withPropagatedContext(a10.headers, b10, bF), bH = false;
      async function bI(a10) {
        var b10, d10, e10, f10, g10;
        let h10, i10, j2, k2, l2;
        !function() {
          if (!bH && (bH = true, "true" === process.env.NEXT_PRIVATE_TEST_PROXY)) {
            let { interceptTestApis: a11, wrapRequestHandler: b11 } = c(987);
            a11(), bG = b11(bG);
          }
        }(), await v();
        let m2 = void 0 !== globalThis.__BUILD_MANIFEST;
        a10.request.url = a10.request.url.replace(/\.rsc($|\?)/, "$1");
        let n2 = a10.bypassNextUrl ? new URL(a10.request.url) : new Z(a10.request.url, { headers: a10.request.headers, nextConfig: a10.request.nextConfig });
        for (let a11 of [...n2.searchParams.keys()]) {
          let b11 = n2.searchParams.getAll(a11), c10 = function(a12) {
            for (let b12 of ["nxtP", "nxtI"]) if (a12 !== b12 && a12.startsWith(b12)) return a12.substring(b12.length);
            return null;
          }(a11);
          if (c10) {
            for (let a12 of (n2.searchParams.delete(c10), b11)) n2.searchParams.append(c10, a12);
            n2.searchParams.delete(a11);
          }
        }
        let o2 = process.env.__NEXT_BUILD_ID || "";
        "buildId" in n2 && (o2 = n2.buildId || "", n2.buildId = "");
        let p2 = function(a11) {
          let b11 = new Headers();
          for (let [c10, d11] of Object.entries(a11)) for (let a12 of Array.isArray(d11) ? d11 : [d11]) void 0 !== a12 && ("number" == typeof a12 && (a12 = a12.toString()), b11.append(c10, a12));
          return b11;
        }(a10.request.headers), q2 = p2.has("x-nextjs-data"), r2 = "1" === p2.get("rsc");
        q2 && "/index" === n2.pathname && (n2.pathname = "/");
        let s2 = /* @__PURE__ */ new Map();
        if (!m2) for (let a11 of ai) {
          let b11 = p2.get(a11);
          null !== b11 && (s2.set(a11, b11), p2.delete(a11));
        }
        let t2 = n2.searchParams.get(aj), u2 = new bE({ page: a10.page, input: ((k2 = (j2 = "string" == typeof n2) ? new URL(n2) : n2).searchParams.delete(aj), j2 ? k2.toString() : k2).toString(), init: { body: a10.request.body, headers: p2, method: a10.request.method, nextConfig: a10.request.nextConfig, signal: a10.request.signal } });
        a10.request.requestMeta && (g10 = a10.request.requestMeta, u2[bC] = g10), q2 && Object.defineProperty(u2, "__isData", { enumerable: false, value: true }), !globalThis.__incrementalCacheShared && a10.IncrementalCache && (globalThis.__incrementalCache = new a10.IncrementalCache({ CurCacheHandler: a10.incrementalCacheHandler, minimalMode: true, fetchCacheKeyPrefix: "", dev: false, requestHeaders: a10.request.headers, getPrerenderManifest: () => ({ version: -1, routes: {}, dynamicRoutes: {}, notFoundRoutes: [], preview: bw() }) }));
        let w2 = a10.request.waitUntil ?? (null == (b10 = null == (l2 = globalThis[bx]) ? void 0 : l2.get()) ? void 0 : b10.waitUntil), x2 = new O({ request: u2, page: a10.page, context: w2 ? { waitUntil: w2 } : void 0 });
        if ((h10 = await bG(u2, () => {
          if ("/middleware" === a10.page || "/src/middleware" === a10.page || "/proxy" === a10.page || "/src/proxy" === a10.page) {
            let b11 = x2.waitUntil.bind(x2), c10 = new bv();
            return a1().trace(aK.execute, { spanName: `middleware ${u2.method}`, attributes: { "http.target": u2.nextUrl.pathname, "http.method": u2.method } }, async () => {
              try {
                var d11, e11, f11, g11, h11;
                let j3 = bw(), k3 = await bB("/", u2.nextUrl.pathname, null), l3 = (f11 = u2.nextUrl, g11 = (a11) => {
                  i10 = a11;
                }, h11 = void 0, function(a11) {
                  let { phase: b12, headers: c11, onUpdateCookies: d12, url: e12, rootParams: f12, implicitTags: g12, resumeDataCache: h12, previewProps: i11, isHmrRefresh: j4, serverComponentsHmrCache: k4, hmrRefreshHash: l4, fallbackParams: m4 } = a11, n3 = {};
                  return { type: "request", phase: b12, implicitTags: g12, url: { pathname: e12.pathname, search: e12.search ?? "" }, rootParams: f12, get headers() {
                    return n3.headers || (n3.headers = function(a12) {
                      let b13 = an.from(a12 instanceof Headers ? new Headers(a12) : { ...a12 });
                      for (let a13 of ai) b13.delete(a13);
                      return b13.delete("x-nextjs-request-id"), b13.delete("x-nextjs-html-request-id"), an.seal(b13);
                    }(c11)), n3.headers;
                  }, get cookies() {
                    if (!n3.cookies) {
                      let a12 = new $.RequestCookies(an.from(c11));
                      a4(c11, a12), n3.cookies = au.seal(a12);
                    }
                    return n3.cookies;
                  }, set cookies(value) {
                    n3.cookies = value;
                  }, get mutableCookies() {
                    if (!n3.mutableCookies) {
                      let a12, b13 = (a12 = new $.RequestCookies(an.from(c11)), aw.wrap(a12, d12));
                      a4(c11, b13), n3.mutableCookies = b13;
                    }
                    return n3.mutableCookies;
                  }, get userspaceMutableCookies() {
                    if (!n3.userspaceMutableCookies) {
                      var o3;
                      let a12;
                      o3 = this, n3.userspaceMutableCookies = a12 = new Proxy(o3.mutableCookies, { get(b13, c12, d13) {
                        switch (c12) {
                          case "delete":
                            return function(...c13) {
                              return ay(o3, "cookies().delete"), b13.delete(...c13), a12;
                            };
                          case "set":
                            return function(...c13) {
                              return ay(o3, "cookies().set"), b13.set(...c13), a12;
                            };
                          default:
                            return ab.get(b13, c12, d13);
                        }
                      } });
                    }
                    return n3.userspaceMutableCookies;
                  }, get draftMode() {
                    return n3.draftMode || (n3.draftMode = new a3(i11, c11, this.cookies, this.mutableCookies)), n3.draftMode;
                  }, resumeDataCache: h12 ?? null, isHmrRefresh: j4, serverComponentsHmrCache: k4 || globalThis.__serverComponentsHmrCache, hmrRefreshHash: l4, fallbackParams: m4 };
                }({ phase: "action", headers: u2.headers, onUpdateCookies: g11, url: f11, rootParams: {}, implicitTags: k3, resumeDataCache: null, previewProps: j3, isHmrRefresh: false, serverComponentsHmrCache: void 0, hmrRefreshHash: h11, fallbackParams: null })), m3 = function({ page: a11, renderOpts: b12, isPrefetchRequest: c11, buildId: d12, deploymentId: e12, previouslyRevalidatedTags: f12, nonce: g12 }) {
                  let h12 = !b12.supportsDynamicResponse && !b12.isDraftMode && !b12.isPossibleServerAction, i11 = h12 && (!!process.env.NEXT_DEBUG_BUILD || "1" === process.env.NEXT_SSG_FETCH_METRICS), j4 = { isStaticGeneration: h12, page: a11, route: al(a11), incrementalCache: b12.incrementalCache || globalThis.__incrementalCache, cacheLifeProfiles: b12.cacheLifeProfiles, useCacheTimeout: b12.experimental.useCacheTimeout, staticPageGenerationTimeout: b12.staticPageGenerationTimeout, isBuildTimePrerendering: b12.isBuildTimePrerendering, fetchCache: b12.fetchCache, isOnDemandRevalidate: b12.isOnDemandRevalidate, requestId: void 0, htmlRequestId: void 0, isDraftMode: b12.isDraftMode, isPrefetchRequest: c11, buildId: d12, deploymentId: e12, reactLoadableManifest: (null == b12 ? void 0 : b12.reactLoadableManifest) || {}, assetPrefix: (null == b12 ? void 0 : b12.assetPrefix) || "", nonce: g12, afterContext: function(a12) {
                    let { waitUntil: b13, onClose: c12, onAfterTaskError: d13 } = a12;
                    return new bs({ waitUntil: b13, onClose: c12, onTaskError: d13 });
                  }(b12), cacheComponentsEnabled: b12.cacheComponents, validationLevel: b12.validationLevel, previouslyRevalidatedTags: f12, refreshTagsByCacheKind: function() {
                    let a12 = /* @__PURE__ */ new Map(), b13 = bk();
                    if (b13) for (let [c12, d13] of b13) "refreshTags" in d13 && a12.set(c12, bu(async () => d13.refreshTags()));
                    return a12;
                  }(), runInCleanSnapshot: bq ? bq.snapshot() : function(a12, ...b13) {
                    return a12(...b13);
                  }, shouldTrackFetchMetrics: i11, reactServerErrorsByDigest: /* @__PURE__ */ new Map() };
                  return b12.store = j4, j4;
                }({ page: "/", renderOpts: { cacheLifeProfiles: bD, staticPageGenerationTimeout: 0, cacheComponents: false, validationLevel: "warning", experimental: { isRoutePPREnabled: false, authInterrupts: !!(null == (e11 = a10.request.nextConfig) || null == (d11 = e11.experimental) ? void 0 : d11.authInterrupts), useCacheTimeout: 0 }, supportsDynamicResponse: true, waitUntil: b11, onClose: c10.onClose.bind(c10), onAfterTaskError: void 0 }, isPrefetchRequest: "1" === u2.headers.get(ah), buildId: o2 ?? "", deploymentId: false, previouslyRevalidatedTags: [] });
                return await as.run(m3, () => a5.run(l3, a10.handler, u2, x2));
              } finally {
                setTimeout(() => {
                  c10.dispatchClose();
                }, 0);
              }
            });
          }
          return a10.handler(u2, x2);
        })) && !(h10 instanceof Response)) throw Object.defineProperty(TypeError("Expected an instance of Response to be returned"), "__NEXT_ERROR_CODE", { value: "E567", enumerable: false, configurable: true });
        h10 && i10 && h10.headers.set("set-cookie", i10);
        let y2 = null == h10 ? void 0 : h10.headers.get("x-middleware-rewrite");
        if (h10 && y2 && (r2 || !m2)) {
          let b11 = new Z(y2, { forceLocale: true, headers: a10.request.headers, nextConfig: a10.request.nextConfig });
          m2 || b11.host !== u2.nextUrl.host || (b11.buildId = o2 || b11.buildId, h10.headers.set("x-middleware-rewrite", String(b11)));
          let { url: c10, isRelative: g11 } = ag(b11.toString(), n2.toString());
          !m2 && q2 && h10.headers.set("x-nextjs-rewrite", c10);
          let i11 = !g11 && (null == (f10 = a10.request.nextConfig) || null == (e10 = f10.experimental) || null == (d10 = e10.clientParamParsingOrigins) ? void 0 : d10.some((a11) => new RegExp(a11).test(b11.origin)));
          r2 && (g11 || i11) && (n2.pathname !== b11.pathname && h10.headers.set("x-nextjs-rewritten-path", b11.pathname), n2.search !== b11.search && h10.headers.set("x-nextjs-rewritten-query", b11.search.slice(1)));
        }
        if (h10 && y2 && r2 && t2) {
          let a11 = new URL(y2);
          a11.searchParams.has(aj) || (a11.searchParams.set(aj, t2), h10.headers.set("x-middleware-rewrite", a11.toString()));
        }
        let z2 = null == h10 ? void 0 : h10.headers.get("Location");
        if (h10 && z2 && !m2) {
          let b11 = new Z(z2, { forceLocale: false, headers: a10.request.headers, nextConfig: a10.request.nextConfig });
          h10 = new Response(h10.body, h10), b11.host === n2.host && (b11.buildId = o2 || b11.buildId, h10.headers.set("Location", ag(b11, n2).url)), q2 && (h10.headers.delete("Location"), h10.headers.set("x-nextjs-redirect", ag(b11.toString(), n2.toString()).url));
        }
        let A2 = h10 || af.next(), B2 = A2.headers.get("x-middleware-override-headers"), C2 = [];
        if (B2) {
          for (let [a11, b11] of s2) A2.headers.set(`x-middleware-request-${a11}`, b11), C2.push(a11);
          C2.length > 0 && A2.headers.set("x-middleware-override-headers", B2 + "," + C2.join(","));
        }
        return { response: A2, waitUntil: ("internal" === x2[M].kind ? Promise.all(x2[M].promises).then(() => {
        }) : void 0) ?? Promise.resolve(), fetchMetrics: u2.fetchMetrics };
      }
      let { env: bJ, stdout: bK } = (null == (fU = globalThis) ? void 0 : fU.process) ?? {}, bL = bJ && !bJ.NO_COLOR && (bJ.FORCE_COLOR || (null == bK ? void 0 : bK.isTTY) && !bJ.CI && "dumb" !== bJ.TERM), bM = (a10, b10, c10, d10) => {
        let e10 = a10.substring(0, d10) + c10, f10 = a10.substring(d10 + b10.length), g10 = f10.indexOf(b10);
        return ~g10 ? e10 + bM(f10, b10, c10, g10) : e10 + f10;
      }, bN = (a10, b10, c10 = a10) => bL ? (d10) => {
        let e10 = "" + d10, f10 = e10.indexOf(b10, a10.length);
        return ~f10 ? a10 + bM(e10, b10, c10, f10) + b10 : a10 + e10 + b10;
      } : String, bO = bN("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m");
      bN("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m"), bN("\x1B[3m", "\x1B[23m"), bN("\x1B[4m", "\x1B[24m"), bN("\x1B[7m", "\x1B[27m"), bN("\x1B[8m", "\x1B[28m"), bN("\x1B[9m", "\x1B[29m"), bN("\x1B[30m", "\x1B[39m");
      let bP = bN("\x1B[31m", "\x1B[39m"), bQ = bN("\x1B[32m", "\x1B[39m"), bR = bN("\x1B[33m", "\x1B[39m");
      bN("\x1B[34m", "\x1B[39m");
      let bS = bN("\x1B[35m", "\x1B[39m");
      bN("\x1B[38;2;173;127;168m", "\x1B[39m"), bN("\x1B[36m", "\x1B[39m");
      let bT = bN("\x1B[37m", "\x1B[39m");
      bN("\x1B[90m", "\x1B[39m"), bN("\x1B[40m", "\x1B[49m"), bN("\x1B[41m", "\x1B[49m"), bN("\x1B[42m", "\x1B[49m"), bN("\x1B[43m", "\x1B[49m"), bN("\x1B[44m", "\x1B[49m"), bN("\x1B[45m", "\x1B[49m"), bN("\x1B[46m", "\x1B[49m"), bN("\x1B[47m", "\x1B[49m"), bT(bO("\u25CB")), bP(bO("\u2A2F")), bR(bO("\u26A0")), bT(bO(" ")), bQ(bO("\u2713")), bS(bO("\xBB")), new bd(1e4, (a10) => a10.length), new bd(1e4, (a10) => a10.length);
      var bU = ((fS = {}).APP_PAGE = "APP_PAGE", fS.APP_ROUTE = "APP_ROUTE", fS.PAGES = "PAGES", fS.FETCH = "FETCH", fS.REDIRECT = "REDIRECT", fS.IMAGE = "IMAGE", fS), bV = ((fT = {}).APP_PAGE = "APP_PAGE", fT.APP_ROUTE = "APP_ROUTE", fT.PAGES = "PAGES", fT.FETCH = "FETCH", fT.IMAGE = "IMAGE", fT);
      function bW() {
      }
      new Uint8Array([60, 104, 116, 109, 108]), new Uint8Array([60, 104, 101, 97, 100]), new Uint8Array([60, 98, 111, 100, 121]), new Uint8Array([60, 47, 104, 101, 97, 100, 62]), new Uint8Array([60, 47, 98, 111, 100, 121, 62]), new Uint8Array([60, 47, 104, 116, 109, 108, 62]), new Uint8Array([60, 47, 98, 111, 100, 121, 62, 60, 47, 104, 116, 109, 108, 62]), new Uint8Array([60, 109, 101, 116, 97, 32, 110, 97, 109, 101, 61, 34, 194, 171, 110, 120, 116, 45, 105, 99, 111, 110, 194, 187, 34]), c(356).Buffer, new TextEncoder(), c(356).Buffer;
      let bX = new TextEncoder();
      function bY(a10) {
        return new ReadableStream({ start(b10) {
          b10.enqueue(bX.encode(a10)), b10.close();
        } });
      }
      function bZ(a10) {
        return new ReadableStream({ start(b10) {
          b10.enqueue(a10), b10.close();
        } });
      }
      async function b$(a10, b10) {
        let c10 = new TextDecoder("utf-8", { fatal: true }), d10 = "";
        for await (let e10 of a10) {
          if (null == b10 ? void 0 : b10.aborted) return d10;
          d10 += c10.decode(e10, { stream: true });
        }
        return d10 + c10.decode();
      }
      let b_ = "ResponseAborted";
      class b0 extends Error {
        constructor(...a10) {
          super(...a10), this.name = b_;
        }
      }
      class b1 {
        constructor() {
          let a10, b10;
          this.promise = new Promise((c10, d10) => {
            a10 = c10, b10 = d10;
          }), this.resolve = a10, this.reject = b10;
        }
      }
      let b2 = 0, b3 = 0, b4 = 0;
      function b5(a10 = {}) {
        let b10 = 0 === b2 ? void 0 : { clientComponentLoadStart: b2, clientComponentLoadTimes: b3, clientComponentLoadCount: b4 };
        return a10.reset && (b2 = 0, b3 = 0, b4 = 0), b10;
      }
      function b6(a10) {
        return (null == a10 ? void 0 : a10.name) === "AbortError" || (null == a10 ? void 0 : a10.name) === b_;
      }
      let b7 = "performance" in globalThis && process.env.NEXT_OTEL_PERFORMANCE_PREFIX;
      async function b8(a10, b10, c10) {
        try {
          let d10, { errored: e10, destroyed: f10 } = b10;
          if (e10 || f10) return;
          let g10 = (d10 = new AbortController(), b10.once("close", () => {
            b10.writableFinished || d10.abort(new b0());
          }), d10), h10 = function(a11, b11) {
            let c11 = false, d11 = new b1();
            function e11() {
              d11.resolve();
            }
            a11.on("drain", e11), a11.once("close", () => {
              a11.off("drain", e11), d11.resolve();
            });
            let f11 = new b1();
            return a11.once("finish", () => {
              f11.resolve();
            }), new WritableStream({ write: async (b12) => {
              if (!c11) {
                if (c11 = true, b7) {
                  let a12 = b5();
                  a12 && performance.measure(`${process.env.NEXT_OTEL_PERFORMANCE_PREFIX}:next-client-component-loading`, { start: a12.clientComponentLoadStart, end: a12.clientComponentLoadStart + a12.clientComponentLoadTimes });
                }
                a11.flushHeaders(), a1().trace(aC.startResponse, { spanName: "start response" }, () => void 0);
              }
              try {
                let c12 = a11.write(b12);
                "flush" in a11 && "function" == typeof a11.flush && a11.flush(), c12 || (await d11.promise, d11 = new b1());
              } catch (b13) {
                throw a11.end(), Object.defineProperty(Error("failed to write chunk to response", { cause: b13 }), "__NEXT_ERROR_CODE", { value: "E321", enumerable: false, configurable: true });
              }
            }, abort: (b12) => {
              a11.writableFinished || a11.destroy(b12);
            }, close: async () => {
              if (b11 && await b11, !a11.writableFinished) return a11.end(), f11.promise;
            } });
          }(b10, c10);
          await a10.pipeTo(h10, { signal: g10.signal });
        } catch (a11) {
          if (b6(a11)) return;
          throw Object.defineProperty(Error("failed to pipe response", { cause: a11 }), "__NEXT_ERROR_CODE", { value: "E180", enumerable: false, configurable: true });
        }
      }
      async function b9(a10, b10, c10) {
        try {
          let { errored: d10, destroyed: e10 } = b10;
          if (d10 || e10) return;
          let f10 = false, g10 = new b1();
          b10.once("close", () => {
            a10.destroy(), g10.resolve();
          }), a10.on("data", (c11) => {
            if (!f10) {
              if (f10 = true, "performance" in globalThis && process.env.NEXT_OTEL_PERFORMANCE_PREFIX) {
                let a11 = b5();
                a11 && performance.measure(`${process.env.NEXT_OTEL_PERFORMANCE_PREFIX}:next-client-component-loading`, { start: a11.clientComponentLoadStart, end: a11.clientComponentLoadStart + a11.clientComponentLoadTimes });
              }
              b10.flushHeaders(), a1().trace(aC.startResponse, { spanName: "start response" }, () => void 0);
            }
            let d11 = b10.write(c11);
            "flush" in b10 && "function" == typeof b10.flush && b10.flush(), d11 || (a10.pause(), b10.once("drain", () => {
              a10.resume();
            }));
          }), a10.on("end", async () => {
            c10 && await c10, b10.writableFinished || b10.end(), g10.resolve();
          }), a10.on("error", (a11) => {
            b6(a11) || b10.destroy(a11), g10.resolve();
          }), await g10.promise;
        } catch (a11) {
          if (b6(a11)) return;
          throw Object.defineProperty(Error("failed to pipe response", { cause: a11 }), "__NEXT_ERROR_CODE", { value: "E180", enumerable: false, configurable: true });
        }
      }
      var ca = c(356).Buffer;
      function cb(a10) {
        return null !== a10 && "object" == typeof a10 && "function" == typeof a10.pipe && "function" == typeof a10.on && !(a10 instanceof ReadableStream);
      }
      class cc {
        static #a = this.EMPTY = new cc(null, { metadata: {}, contentType: null });
        static fromStatic(a10, b10) {
          return new cc(a10, { metadata: {}, contentType: b10 });
        }
        constructor(a10, { contentType: b10, waitUntil: c10, metadata: d10 }) {
          this.response = a10, this.contentType = b10, this.metadata = d10, this.waitUntil = c10;
        }
        assignMetadata(a10) {
          Object.assign(this.metadata, a10);
        }
        get isNull() {
          return null === this.response;
        }
        get isDynamic() {
          return "string" != typeof this.response;
        }
        toUnchunkedString(a10 = false) {
          if (null === this.response) return "";
          if ("string" != typeof this.response) {
            if (!a10) throw Object.defineProperty(new ba("dynamic responses cannot be unchunked. This is a bug in Next.js"), "__NEXT_ERROR_CODE", { value: "E732", enumerable: false, configurable: true });
            return b$(this.readable);
          }
          return this.response;
        }
        get readable() {
          if (null === this.response) return new ReadableStream({ start(a10) {
            a10.close();
          } });
          if ("string" == typeof this.response) return bY(this.response);
          if (ca.isBuffer(this.response)) return bZ(this.response);
          if (Array.isArray(this.response)) return function(...a10) {
            if (0 === a10.length) return new ReadableStream({ start(a11) {
              a11.close();
            } });
            if (1 === a10.length) return a10[0];
            let { readable: b10, writable: c10 } = new TransformStream(), d10 = a10[0].pipeTo(c10, { preventClose: true }), e10 = 1;
            for (; e10 < a10.length - 1; e10++) {
              let b11 = a10[e10];
              d10 = d10.then(() => b11.pipeTo(c10, { preventClose: true }));
            }
            let f10 = a10[e10];
            return (d10 = d10.then(() => f10.pipeTo(c10))).catch(bW), b10;
          }(...this.response);
          if (cb(this.response)) throw Object.defineProperty(new ba("Node.js Readable cannot be converted to a web stream in the edge runtime"), "__NEXT_ERROR_CODE", { value: "E1150", enumerable: false, configurable: true });
          return this.response;
        }
        coerce() {
          if (null === this.response) return [];
          if ("string" == typeof this.response) return [bY(this.response)];
          if (Array.isArray(this.response)) return this.response;
          if (ca.isBuffer(this.response)) return [bZ(this.response)];
          if (!cb(this.response)) return [this.response];
          throw Object.defineProperty(new ba("Node.js Readable cannot be converted to a web stream in the edge runtime"), "__NEXT_ERROR_CODE", { value: "E1150", enumerable: false, configurable: true });
        }
        pipeThrough(a10) {
          this.response = this.readable.pipeThrough(a10);
        }
        unshift(a10) {
          this.response = this.coerce(), this.response.unshift(a10);
        }
        push(a10) {
          this.response = this.coerce(), this.response.push(a10);
        }
        async pipeTo(a10) {
          try {
            await this.readable.pipeTo(a10, { preventClose: true }), this.waitUntil && await this.waitUntil, await a10.close();
          } catch (b10) {
            if (b6(b10)) return void await a10.abort(b10);
            throw b10;
          }
        }
        async pipeToNodeResponse(a10) {
          null !== this.response && "string" != typeof this.response && !ca.isBuffer(this.response) && !Array.isArray(this.response) && cb(this.response) ? await b9(this.response, a10, this.waitUntil) : await b8(this.readable, a10, this.waitUntil);
        }
      }
      function cd(a10, b10) {
        if (!a10) return b10;
        let c10 = parseInt(a10, 10);
        return Number.isFinite(c10) && c10 > 0 ? c10 : b10;
      }
      cd(process.env.NEXT_PRIVATE_RESPONSE_CACHE_TTL, 1e4), cd(process.env.NEXT_PRIVATE_RESPONSE_CACHE_MAX_SIZE, 150);
      var ce = c(654), cf = c.n(ce);
      class cg {
        constructor(a10) {
          this.fs = a10, this.tasks = [];
        }
        findOrCreateTask(a10) {
          for (let b11 of this.tasks) if (b11[0] === a10) return b11;
          let b10 = this.fs.mkdir(a10);
          b10.catch(() => {
          });
          let c10 = [a10, b10, []];
          return this.tasks.push(c10), c10;
        }
        append(a10, b10) {
          let c10 = this.findOrCreateTask(cf().dirname(a10)), d10 = c10[1].then(() => this.fs.writeFile(a10, b10));
          d10.catch(() => {
          }), c10[2].push(d10);
        }
        wait() {
          return Promise.all(this.tasks.flatMap((a10) => a10[2]));
        }
      }
      function ch(a10) {
        return (null == a10 ? void 0 : a10.length) || 0;
      }
      class ci {
        static #a = this.debug = !!process.env.NEXT_PRIVATE_DEBUG_CACHE;
        constructor(a10) {
          this.fs = a10.fs, this.flushToDisk = a10.flushToDisk, this.serverDistDir = a10.serverDistDir, this.revalidatedTags = a10.revalidatedTags, a10.maxMemoryCacheSize ? ci.memoryCache ? ci.debug && console.log("FileSystemCache: memory store already initialized") : (ci.debug && console.log("FileSystemCache: using memory store for fetch cache"), ci.memoryCache = function(a11) {
            return e || (e = new bd(a11, function({ value: a12 }, b10) {
              var c10, d10;
              let e10;
              if (a12) if (a12.kind === bU.REDIRECT) e10 = JSON.stringify(a12.props).length;
              else if (a12.kind === bU.IMAGE) throw Object.defineProperty(Error("invariant image should not be incremental-cache"), "__NEXT_ERROR_CODE", { value: "E501", enumerable: false, configurable: true });
              else e10 = a12.kind === bU.FETCH ? JSON.stringify(a12.data || "").length : a12.kind === bU.APP_ROUTE ? a12.body.length : a12.kind === bU.APP_PAGE ? Math.max(1, a12.html.length + ch(a12.rscData) + ((null == (c10 = a12.postponed) ? void 0 : c10.length) || 0) + function(a13) {
                if (!a13) return 0;
                let b11 = 0;
                for (let [c11, d11] of a13) b11 += c11.length + ch(d11);
                return b11;
              }(a12.segmentData)) : a12.html.length + ((null == (d10 = JSON.stringify(a12.pageData)) ? void 0 : d10.length) || 0);
              else e10 = 25;
              return b10.length + e10;
            })), e;
          }(a10.maxMemoryCacheSize)) : ci.debug && console.log("FileSystemCache: not using memory store for fetch cache");
        }
        resetRequestCache() {
        }
        async revalidateTag(a10, b10) {
          if (a10 = "string" == typeof a10 ? [a10] : a10, ci.debug && console.log("FileSystemCache: revalidateTag", a10, b10), 0 === a10.length) return;
          let c10 = Date.now();
          for (let d10 of a10) {
            let a11 = be.get(d10) || {};
            if (b10) {
              let e10 = { ...a11 };
              e10.stale = c10, void 0 !== b10.expire && (e10.expired = c10 + 1e3 * b10.expire), be.set(d10, e10);
            } else be.set(d10, { ...a11, expired: c10 });
          }
        }
        async get(...a10) {
          var b10, c10, d10, e10, f10, g10;
          let [h10, i10] = a10, { kind: j2 } = i10, k2 = null == (b10 = ci.memoryCache) ? void 0 : b10.get(h10);
          if (ci.debug && (j2 === bV.FETCH ? console.log("FileSystemCache: get", h10, i10.tags, j2, !!k2) : console.log("FileSystemCache: get", h10, j2, !!k2)), (null == k2 || null == (c10 = k2.value) ? void 0 : c10.kind) === bU.APP_PAGE || (null == k2 || null == (d10 = k2.value) ? void 0 : d10.kind) === bU.APP_ROUTE || (null == k2 || null == (e10 = k2.value) ? void 0 : e10.kind) === bU.PAGES) {
            let a11 = null == (g10 = k2.value.headers) ? void 0 : g10[D];
            if ("string" == typeof a11) {
              let b11 = a11.split(",");
              if (b11.length > 0 && bf(b11, k2.lastModified)) return ci.debug && console.log("FileSystemCache: expired tags", b11), null;
            }
          } else if ((null == k2 || null == (f10 = k2.value) ? void 0 : f10.kind) === bU.FETCH) {
            let a11 = i10.kind === bV.FETCH ? [...i10.tags || [], ...i10.softTags || []] : [];
            if (a11.some((a12) => this.revalidatedTags.includes(a12))) return ci.debug && console.log("FileSystemCache: was revalidated", a11), null;
            if (bf(a11, k2.lastModified)) return ci.debug && console.log("FileSystemCache: expired tags", a11), null;
          }
          return k2 ?? null;
        }
        async set(a10, b10, c10) {
          var d10;
          if (null == (d10 = ci.memoryCache) || d10.set(a10, { value: b10, lastModified: Date.now() }), ci.debug && console.log("FileSystemCache: set", a10), !this.flushToDisk || !b10) return;
          let e10 = new cg(this.fs);
          if (b10.kind === bU.APP_ROUTE) {
            let c11 = this.getFilePath(`${a10}.body`, bV.APP_ROUTE);
            e10.append(c11, b10.body);
            let d11 = { headers: b10.headers, status: b10.status, postponed: void 0, segmentPaths: void 0, prefetchHints: void 0 };
            e10.append(c11.replace(/\.body$/, C), JSON.stringify(d11, null, 2));
          } else if (b10.kind === bU.PAGES || b10.kind === bU.APP_PAGE) {
            let d11 = b10.kind === bU.APP_PAGE, f10 = this.getFilePath(`${a10}.html`, d11 ? bV.APP_PAGE : bV.PAGES);
            if (e10.append(f10, b10.html), c10.fetchCache || c10.isFallback || c10.isRoutePPREnabled || e10.append(this.getFilePath(`${a10}${d11 ? ".rsc" : ".json"}`, d11 ? bV.APP_PAGE : bV.PAGES), d11 ? b10.rscData : JSON.stringify(b10.pageData)), (null == b10 ? void 0 : b10.kind) === bU.APP_PAGE) {
              let a11;
              if (b10.segmentData) {
                a11 = [];
                let c12 = f10.replace(/\.html$/, ".segments");
                for (let [d12, f11] of b10.segmentData) {
                  a11.push(d12);
                  let b11 = c12 + d12 + ".segment.rsc";
                  e10.append(b11, f11);
                }
              }
              let c11 = { headers: b10.headers, status: b10.status, postponed: b10.postponed, segmentPaths: a11, prefetchHints: void 0 };
              e10.append(f10.replace(/\.html$/, C), JSON.stringify(c11));
            }
          } else if (b10.kind === bU.FETCH) {
            let d11 = this.getFilePath(a10, bV.FETCH);
            e10.append(d11, JSON.stringify({ ...b10, tags: c10.fetchCache ? c10.tags : [] }));
          }
          await e10.wait();
        }
        getFilePath(a10, b10) {
          switch (b10) {
            case bV.FETCH:
              return cf().join(this.serverDistDir, "..", "cache", "fetch-cache", a10);
            case bV.PAGES:
              return cf().join(this.serverDistDir, "pages", a10);
            case bV.IMAGE:
            case bV.APP_PAGE:
            case bV.APP_ROUTE:
              return cf().join(this.serverDistDir, "app", a10);
            default:
              throw Object.defineProperty(Error(`Unexpected file path kind: ${b10}`), "__NEXT_ERROR_CODE", { value: "E479", enumerable: false, configurable: true });
          }
        }
      }
      let cj = ["(..)(..)", "(.)", "(..)", "(...)"], ck = /\/[^/]*\[[^/]+\][^/]*(?=\/|$)/, cl = /\/\[[^/]+\](?=\/|$)/;
      function cm(a10) {
        return a10.replace(/(?:\/index)?\/?$/, "") || "/";
      }
      "u" > typeof performance && ["mark", "measure", "getEntriesByName"].every((a10) => "function" == typeof performance[a10]);
      class cn {
        static #a = this.cacheControls = /* @__PURE__ */ new Map();
        constructor(a10) {
          this.prerenderManifest = a10;
        }
        get(a10) {
          let b10 = cn.cacheControls.get(a10);
          if (b10) return b10;
          let c10 = this.prerenderManifest.routes[a10];
          if (c10) {
            let { initialRevalidateSeconds: a11, initialExpireSeconds: b11 } = c10;
            if (void 0 !== a11) return { revalidate: a11, expire: b11 };
          }
          let d10 = this.prerenderManifest.dynamicRoutes[a10];
          if (d10) {
            let { fallbackRevalidate: a11, fallbackExpire: b11 } = d10;
            if (void 0 !== a11) return { revalidate: a11, expire: b11 };
          }
        }
        set(a10, b10) {
          cn.cacheControls.set(a10, b10);
        }
        clear() {
          cn.cacheControls.clear();
        }
      }
      function co(a10) {
        let b10 = "buffer" in a10 ? new Uint8Array(a10.buffer, a10.byteOffset, a10.byteLength) : new Uint8Array(a10), c10 = "";
        for (let a11 of b10) c10 += a11.toString(16).padStart(2, "0");
        return c10;
      }
      async function cp(a10) {
        {
          let b10 = new TextEncoder().encode(a10);
          return co(await crypto.subtle.digest("SHA-256", b10));
        }
      }
      c(259);
      class cq {
        static #a = this.debug = !!process.env.NEXT_PRIVATE_DEBUG_CACHE;
        constructor({ fs: a10, dev: b10, flushToDisk: c10, minimalMode: d10, serverDistDir: e10, requestHeaders: f10, maxMemoryCacheSize: g10, getPrerenderManifest: h10, fetchCacheKeyPrefix: i10, CurCacheHandler: j2, allowedRevalidateHeaderKeys: k2 }) {
          var l2, m2, n2, o2;
          this.locks = /* @__PURE__ */ new Map(), this.hasCustomCacheHandler = !!j2;
          const p2 = Symbol.for("@next/cache-handlers"), q2 = globalThis;
          if (j2) cq.debug && console.log("IncrementalCache: using custom cache handler", j2.name);
          else {
            const b11 = q2[p2];
            (null == b11 ? void 0 : b11.FetchCache) ? (j2 = b11.FetchCache, cq.debug && console.log("IncrementalCache: using global FetchCache cache handler")) : a10 && e10 && (cq.debug && console.log("IncrementalCache: using filesystem cache handler"), j2 = ci);
          }
          process.env.__NEXT_TEST_MAX_ISR_CACHE && (g10 = parseInt(process.env.__NEXT_TEST_MAX_ISR_CACHE, 10)), this.dev = b10, this.disableForTestmode = "true" === process.env.NEXT_PRIVATE_TEST_PROXY, this.minimalMode = d10, this.requestHeaders = f10, this.allowedRevalidateHeaderKeys = k2, this.prerenderManifest = h10(), this.cacheControls = new cn(this.prerenderManifest), this.fetchCacheKeyPrefix = i10;
          let r2 = [];
          f10[A] === (null == (m2 = this.prerenderManifest) || null == (l2 = m2.preview) ? void 0 : l2.previewModeId) && (this.isOnDemandRevalidate = true), d10 && (r2 = this.revalidatedTags = function(a11, b11) {
            return "string" == typeof a11[E] && a11["x-next-revalidate-tag-token"] === b11 ? a11[E].split(",") : [];
          }(f10, null == (o2 = this.prerenderManifest) || null == (n2 = o2.preview) ? void 0 : n2.previewModeId)), j2 && (this.cacheHandler = new j2({ dev: b10, fs: a10, flushToDisk: c10, serverDistDir: e10, revalidatedTags: r2, maxMemoryCacheSize: g10, _requestHeaders: f10, fetchCacheKeyPrefix: i10 }));
        }
        calculateRevalidate(a10, b10, c10, d10) {
          if (c10) return Math.floor(performance.timeOrigin + performance.now() - 1e3);
          let e10 = this.cacheControls.get(cm(a10)), f10 = e10 ? e10.revalidate : !d10 && 1;
          return "number" == typeof f10 ? 1e3 * f10 + b10 : f10;
        }
        _getPathname(a10, b10) {
          return b10 ? a10 : /^\/index(\/|$)/.test(a10) && !function(a11, b11 = true) {
            return (void 0 !== a11.split("/").find((a12) => cj.find((b12) => a12.startsWith(b12))) && (a11 = function(a12) {
              let b12, c10, d10;
              for (let e10 of a12.split("/")) if (c10 = cj.find((a13) => e10.startsWith(a13))) {
                [b12, d10] = a12.split(c10, 2);
                break;
              }
              if (!b12 || !c10 || !d10) throw Object.defineProperty(Error(`Invalid interception route: ${a12}. Must be in the format /<intercepting route>/(..|...|..)(..)/<intercepted route>`), "__NEXT_ERROR_CODE", { value: "E269", enumerable: false, configurable: true });
              switch (b12 = al(b12), c10) {
                case "(.)":
                  d10 = "/" === b12 ? `/${d10}` : b12 + "/" + d10;
                  break;
                case "(..)":
                  if ("/" === b12) throw Object.defineProperty(Error(`Invalid interception route: ${a12}. Cannot use (..) marker at the root level, use (.) instead.`), "__NEXT_ERROR_CODE", { value: "E207", enumerable: false, configurable: true });
                  d10 = b12.split("/").slice(0, -1).concat(d10).join("/");
                  break;
                case "(...)":
                  d10 = "/" + d10;
                  break;
                case "(..)(..)":
                  let e10 = b12.split("/");
                  if (e10.length <= 2) throw Object.defineProperty(Error(`Invalid interception route: ${a12}. Cannot use (..)(..) marker at the root level or one level up.`), "__NEXT_ERROR_CODE", { value: "E486", enumerable: false, configurable: true });
                  d10 = e10.slice(0, -2).concat(d10).join("/");
                  break;
                default:
                  throw Object.defineProperty(Error("Invariant: unexpected marker"), "__NEXT_ERROR_CODE", { value: "E112", enumerable: false, configurable: true });
              }
              return { interceptingRoute: b12, interceptedRoute: d10 };
            }(a11).interceptedRoute), b11) ? cl.test(a11) : ck.test(a11);
          }(a10) ? `/index${a10}` : "/" === a10 ? "/index" : ak(a10);
        }
        resetRequestCache() {
          var a10, b10;
          null == (b10 = this.cacheHandler) || null == (a10 = b10.resetRequestCache) || a10.call(b10);
        }
        async lock(a10) {
          for (; ; ) {
            let b11 = this.locks.get(a10);
            if (cq.debug && console.log("IncrementalCache: lock get", a10, !!b11), !b11) break;
            await b11;
          }
          let { resolve: b10, promise: c10 } = new b1();
          return cq.debug && console.log("IncrementalCache: successfully locked", a10), this.locks.set(a10, c10), () => {
            b10(), this.locks.delete(a10);
          };
        }
        async revalidateTag(a10, b10) {
          var c10;
          return null == (c10 = this.cacheHandler) ? void 0 : c10.revalidateTag(a10, b10);
        }
        async generateSimpleCacheKey(a10) {
          return cp(JSON.stringify(["v4", this.fetchCacheKeyPrefix || "", a10]));
        }
        async generateCacheKey(a10, b10 = {}) {
          let c10 = [], d10 = new TextEncoder(), e10 = null, f10 = b10.body;
          if (f10) if ("object" == typeof f10 && "byteLength" in f10) c10.push(`bytes:${co(f10)}`), b10._ogBody = f10;
          else if ("function" == typeof f10.getReader) {
            let a11 = [];
            try {
              await f10.pipeTo(new WritableStream({ write(b11) {
                a11.push("string" == typeof b11 ? d10.encode(b11) : b11);
              } }));
              let e11 = a11.reduce((a12, b11) => a12 + b11.length, 0), g11 = new Uint8Array(e11), h10 = 0;
              for (let b11 of a11) g11.set(b11, h10), h10 += b11.length;
              c10.push(`bytes:${co(g11)}`), b10._ogBody = g11;
            } catch (a12) {
              console.error("Problem reading body", a12);
            }
          } else if ("function" == typeof f10.keys) for (let [a11, d11] of (e10 = "[object FormData]" === String(f10) ? "multipart/form-data; boundary=" : "application/x-www-form-urlencoded;charset=UTF-8", b10._ogBody = f10, f10.entries())) c10.push(`key:${a11}`), "string" == typeof d11 ? c10.push(`str:${d11}`) : c10.push("file", d11.name, d11.type, `bytes:${co(await d11.arrayBuffer())}`);
          else if ("function" == typeof f10.arrayBuffer) {
            let a11 = await f10.arrayBuffer();
            c10.push("blob", f10.type, `bytes:${co(a11)}`), b10._ogBody = new Blob([a11], { type: f10.type }), e10 = f10.type;
          } else if ("string" == typeof f10) c10.push(`str:${f10}`), b10._ogBody = f10, e10 = "text/plain;charset=UTF-8";
          else throw Object.defineProperty(Error(`Unsupported body type: ${typeof f10}`), "__NEXT_ERROR_CODE", { value: "E1443", enumerable: false, configurable: true });
          let g10 = "function" == typeof (b10.headers || {}).keys ? Object.fromEntries(b10.headers) : Object.assign({}, b10.headers);
          return "traceparent" in g10 && delete g10.traceparent, "tracestate" in g10 && delete g10.tracestate, cp(JSON.stringify(["v4", this.fetchCacheKeyPrefix || "", a10, b10.method, e10, g10, b10.mode, b10.redirect, b10.credentials, b10.referrer, b10.referrerPolicy, b10.integrity, b10.cache, c10]));
        }
        async get(a10, b10) {
          var c10, d10, e10, f10, g10, h10, i10;
          let j2, k2;
          if (b10.kind === bV.FETCH) {
            let c11 = a5.getStore(), d11 = c11 ? a7(c11) : null;
            if (d11) {
              let c12 = d11.fetch.get(a10);
              if ((null == c12 ? void 0 : c12.kind) === bU.FETCH) {
                let d12 = as.getStore();
                if (![...b10.tags || [], ...b10.softTags || []].some((a11) => {
                  var b11, c13;
                  return (null == (b11 = this.revalidatedTags) ? void 0 : b11.includes(a11)) || (null == d12 || null == (c13 = d12.pendingRevalidatedTags) ? void 0 : c13.some((b12) => b12.tag === a11));
                })) return cq.debug && console.log("IncrementalCache: rdc:hit", a10), { isStale: false, value: c12 };
                cq.debug && console.log("IncrementalCache: rdc:revalidated-tag", a10);
              } else cq.debug && console.log("IncrementalCache: rdc:miss", a10);
            } else cq.debug && console.log("IncrementalCache: rdc:no-resume-data");
          }
          if (this.disableForTestmode || this.dev && (b10.kind !== bV.FETCH || "no-cache" === this.requestHeaders["cache-control"])) return null;
          a10 = this._getPathname(a10, b10.kind === bV.FETCH);
          let l2 = await (null == (c10 = this.cacheHandler) ? void 0 : c10.get(a10, b10));
          if (b10.kind === bV.FETCH) {
            if (!l2) return null;
            if ((null == (e10 = l2.value) ? void 0 : e10.kind) !== bU.FETCH) throw Object.defineProperty(new ba(`Expected cached value for cache key ${JSON.stringify(a10)} to be a "FETCH" kind, got ${JSON.stringify(null == (f10 = l2.value) ? void 0 : f10.kind)} instead.`), "__NEXT_ERROR_CODE", { value: "E653", enumerable: false, configurable: true });
            let c11 = as.getStore(), d11 = [...b10.tags || [], ...b10.softTags || []];
            if (d11.some((a11) => {
              var b11, d12;
              return (null == (b11 = this.revalidatedTags) ? void 0 : b11.includes(a11)) || (null == c11 || null == (d12 = c11.pendingRevalidatedTags) ? void 0 : d12.some((b12) => b12.tag === a11));
            })) return cq.debug && console.log("IncrementalCache: expired tag", a10), null;
            let g11 = a5.getStore();
            if (g11) {
              let b11 = a7(g11);
              (null == b11 ? void 0 : b11.mutable) && (cq.debug && console.log("IncrementalCache: rdc:set", a10), b11.fetch.set(a10, l2.value));
            }
            let h11 = b10.revalidate || l2.value.revalidate, i11 = (performance.timeOrigin + performance.now() - (l2.lastModified || 0)) / 1e3 > h11, j3 = l2.value.data;
            return bf(d11, l2.lastModified) ? null : (bg(d11, l2.lastModified) && (i11 = true), { isStale: i11, value: { kind: bU.FETCH, data: j3, revalidate: h11 } });
          }
          if ((null == l2 || null == (d10 = l2.value) ? void 0 : d10.kind) === bU.FETCH) throw Object.defineProperty(new ba(`Expected cached value for cache key ${JSON.stringify(a10)} not to be a ${JSON.stringify(b10.kind)} kind, got "FETCH" instead.`), "__NEXT_ERROR_CODE", { value: "E652", enumerable: false, configurable: true });
          let m2 = null, { isFallback: n2 } = b10, o2 = this.cacheControls.get(cm(a10));
          if ((null == l2 ? void 0 : l2.lastModified) === -1) j2 = -1, k2 = -31536e6;
          else {
            let c11 = performance.timeOrigin + performance.now(), d11 = (null == l2 ? void 0 : l2.lastModified) || c11;
            k2 = this.calculateRevalidate(a10, d11, this.dev ?? false, b10.isFallback);
            let e11 = "number" == typeof (null == o2 ? void 0 : o2.expire) ? 1e3 * o2.expire + d11 : void 0;
            if (void 0 !== e11 && e11 < c11) j2 = -1;
            else if (void 0 === (j2 = false !== k2 && k2 < c11 || void 0) && ((null == l2 || null == (g10 = l2.value) ? void 0 : g10.kind) === bU.APP_PAGE || (null == l2 || null == (h10 = l2.value) ? void 0 : h10.kind) === bU.APP_ROUTE)) {
              let a11 = null == (i10 = l2.value.headers) ? void 0 : i10[D];
              if ("string" == typeof a11) {
                let b11 = a11.split(",");
                b11.length > 0 && (bf(b11, d11) ? j2 = -1 : bg(b11, d11) && (j2 = true));
              }
            }
          }
          return l2 && (m2 = { isStale: j2, cacheControl: o2, revalidateAfter: k2, value: l2.value, isFallback: n2 }), !l2 && this.prerenderManifest.notFoundRoutes.includes(a10) && (m2 = { isStale: j2, value: null, cacheControl: o2, revalidateAfter: k2, isFallback: n2 }, this.set(a10, m2.value, { ...b10, cacheControl: o2 })), m2;
        }
        async set(a10, b10, c10) {
          if ((null == b10 ? void 0 : b10.kind) === bU.FETCH) {
            let c11 = a5.getStore(), d11 = c11 ? a7(c11) : null;
            (null == d11 ? void 0 : d11.mutable) && (cq.debug && console.log("IncrementalCache: rdc:set", a10), d11.fetch.set(a10, b10));
          }
          if (this.disableForTestmode || this.dev && !c10.fetchCache) return;
          a10 = this._getPathname(a10, c10.fetchCache);
          let d10 = JSON.stringify(b10).length;
          if (c10.fetchCache && d10 > 2097152 && !this.hasCustomCacheHandler && !c10.isImplicitBuildTimeCache) {
            let b11 = `Failed to set Next.js data cache for ${c10.fetchUrl || a10}, items over 2MB can not be cached (${d10} bytes)`;
            if (this.dev) throw Object.defineProperty(Error(b11), "__NEXT_ERROR_CODE", { value: "E1003", enumerable: false, configurable: true });
            console.warn(b11);
            return;
          }
          try {
            var e10;
            !c10.fetchCache && c10.cacheControl && this.cacheControls.set(cm(a10), c10.cacheControl), await (null == (e10 = this.cacheHandler) ? void 0 : e10.set(a10, b10, c10));
          } catch (b11) {
            console.warn("Failed to update prerender cache for", a10, b11);
          }
        }
      }
      var cr = function(a10, b10, c10, d10, e10) {
        if ("m" === d10) throw TypeError("Private method is not writable");
        if ("a" === d10 && !e10) throw TypeError("Private accessor was defined without a setter");
        if ("function" == typeof b10 ? a10 !== b10 || !e10 : !b10.has(a10)) throw TypeError("Cannot write private member to an object whose class did not declare it");
        return "a" === d10 ? e10.call(a10, c10) : e10 ? e10.value = c10 : b10.set(a10, c10), c10;
      }, cs = function(a10, b10, c10, d10) {
        if ("a" === c10 && !d10) throw TypeError("Private accessor was defined without a getter");
        if ("function" == typeof b10 ? a10 !== b10 || !d10 : !b10.has(a10)) throw TypeError("Cannot read private member from an object whose class did not declare it");
        return "m" === c10 ? d10 : "a" === c10 ? d10.call(a10) : d10 ? d10.value : b10.get(a10);
      };
      function ct(a10) {
        let b10 = a10 ? "__Secure-" : "";
        return { sessionToken: { name: `${b10}authjs.session-token`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: a10 } }, callbackUrl: { name: `${b10}authjs.callback-url`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: a10 } }, csrfToken: { name: `${a10 ? "__Host-" : ""}authjs.csrf-token`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: a10 } }, pkceCodeVerifier: { name: `${b10}authjs.pkce.code_verifier`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: a10, maxAge: 900 } }, state: { name: `${b10}authjs.state`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: a10, maxAge: 900 } }, nonce: { name: `${b10}authjs.nonce`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: a10 } }, webauthnChallenge: { name: `${b10}authjs.challenge`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: a10, maxAge: 900 } } };
      }
      class cu {
        constructor(a10, b10, c10) {
          if (fV.add(this), fW.set(this, {}), fX.set(this, void 0), fY.set(this, void 0), cr(this, fY, c10, "f"), cr(this, fX, a10, "f"), !b10) return;
          const { name: d10 } = a10;
          for (const [a11, c11] of Object.entries(b10)) a11.startsWith(d10) && c11 && (cs(this, fW, "f")[a11] = c11);
        }
        get value() {
          return Object.keys(cs(this, fW, "f")).sort((a10, b10) => parseInt(a10.split(".").pop() || "0") - parseInt(b10.split(".").pop() || "0")).map((a10) => cs(this, fW, "f")[a10]).join("");
        }
        chunk(a10, b10) {
          let c10 = cs(this, fV, "m", f$).call(this);
          for (let d10 of cs(this, fV, "m", fZ).call(this, { name: cs(this, fX, "f").name, value: a10, options: { ...cs(this, fX, "f").options, ...b10 } })) c10[d10.name] = d10;
          return Object.values(c10);
        }
        clean() {
          return Object.values(cs(this, fV, "m", f$).call(this));
        }
      }
      fW = /* @__PURE__ */ new WeakMap(), fX = /* @__PURE__ */ new WeakMap(), fY = /* @__PURE__ */ new WeakMap(), fV = /* @__PURE__ */ new WeakSet(), fZ = function(a10) {
        let b10 = Math.ceil(a10.value.length / 3936);
        if (1 === b10) return cs(this, fW, "f")[a10.name] = a10.value, [a10];
        let c10 = [];
        for (let d10 = 0; d10 < b10; d10++) {
          let b11 = `${a10.name}.${d10}`, e10 = a10.value.substr(3936 * d10, 3936);
          c10.push({ ...a10, name: b11, value: e10 }), cs(this, fW, "f")[b11] = e10;
        }
        return cs(this, fY, "f").debug("CHUNKING_SESSION_COOKIE", { message: "Session cookie exceeds allowed 4096 bytes.", emptyCookieSize: 160, valueSize: a10.value.length, chunks: c10.map((a11) => a11.value.length + 160) }), c10;
      }, f$ = function() {
        let a10 = {};
        for (let b10 in cs(this, fW, "f")) delete cs(this, fW, "f")?.[b10], a10[b10] = { name: b10, value: "", options: { ...cs(this, fX, "f").options, maxAge: 0 } };
        return a10;
      };
      class cv extends Error {
        constructor(a10, b10) {
          a10 instanceof Error ? super(void 0, { cause: { err: a10, ...a10.cause, ...b10 } }) : "string" == typeof a10 ? (b10 instanceof Error && (b10 = { err: b10, ...b10.cause }), super(a10, b10)) : super(void 0, a10), this.name = this.constructor.name, this.type = this.constructor.type ?? "AuthError", this.kind = this.constructor.kind ?? "error", Error.captureStackTrace?.(this, this.constructor);
          const c10 = `https://errors.authjs.dev#${this.type.toLowerCase()}`;
          this.message += `${this.message ? ". " : ""}Read more at ${c10}`;
        }
      }
      class cw extends cv {
      }
      cw.kind = "signIn";
      class cx extends cv {
      }
      cx.type = "AdapterError";
      class cy extends cv {
      }
      cy.type = "AccessDenied";
      class cz extends cv {
      }
      cz.type = "CallbackRouteError";
      class cA extends cv {
      }
      cA.type = "ErrorPageLoop";
      class cB extends cv {
      }
      cB.type = "EventError";
      class cC extends cv {
      }
      cC.type = "InvalidCallbackUrl";
      class cD extends cw {
        constructor() {
          super(...arguments), this.code = "credentials";
        }
      }
      cD.type = "CredentialsSignin";
      class cE extends cv {
      }
      cE.type = "InvalidEndpoints";
      class cF extends cv {
      }
      cF.type = "InvalidCheck";
      class cG extends cv {
      }
      cG.type = "JWTSessionError";
      class cH extends cv {
      }
      cH.type = "MissingAdapter";
      class cI extends cv {
      }
      cI.type = "MissingAdapterMethods";
      class cJ extends cv {
      }
      cJ.type = "MissingAuthorize";
      class cK extends cv {
      }
      cK.type = "MissingSecret";
      class cL extends cw {
      }
      cL.type = "OAuthAccountNotLinked";
      class cM extends cw {
      }
      cM.type = "OAuthCallbackError";
      class cN extends cv {
      }
      cN.type = "OAuthProfileParseError";
      class cO extends cv {
      }
      cO.type = "SessionTokenError";
      class cP extends cw {
      }
      cP.type = "OAuthSignInError";
      class cQ extends cw {
      }
      cQ.type = "EmailSignInError";
      class cR extends cv {
      }
      cR.type = "SignOutError";
      class cS extends cv {
      }
      cS.type = "UnknownAction";
      class cT extends cv {
      }
      cT.type = "UnsupportedStrategy";
      class cU extends cv {
      }
      cU.type = "InvalidProvider";
      class cV extends cv {
      }
      cV.type = "UntrustedHost";
      class cW extends cv {
      }
      cW.type = "Verification";
      class cX extends cw {
      }
      cX.type = "MissingCSRF";
      let cY = /* @__PURE__ */ new Set(["CredentialsSignin", "OAuthAccountNotLinked", "OAuthCallbackError", "AccessDenied", "Verification", "MissingCSRF", "AccountNotLinked", "WebAuthnVerificationError"]);
      class cZ extends cv {
      }
      cZ.type = "DuplicateConditionalUI";
      class c$ extends cv {
      }
      c$.type = "MissingWebAuthnAutocomplete";
      class c_ extends cv {
      }
      c_.type = "WebAuthnVerificationError";
      class c0 extends cw {
      }
      c0.type = "AccountNotLinked";
      class c1 extends cv {
      }
      c1.type = "ExperimentalFeatureNotEnabled";
      let c2 = false;
      function c3(a10, b10) {
        try {
          return /^https?:/.test(new URL(a10, a10.startsWith("/") ? b10 : void 0).protocol);
        } catch {
          return false;
        }
      }
      let c4 = false, c5 = false, c6 = false, c7 = ["createVerificationToken", "useVerificationToken", "getUserByEmail"], c8 = ["createUser", "getUser", "getUserByEmail", "getUserByAccount", "updateUser", "linkAccount", "createSession", "getSessionAndUser", "updateSession", "deleteSession"], c9 = ["createUser", "getUser", "linkAccount", "getAccount", "getAuthenticator", "createAuthenticator", "listAuthenticatorsByUserId", "updateAuthenticatorCounter"], da = async (a10, b10, c10, d10, e10) => {
        let { crypto: { subtle: f10 } } = (() => {
          if ("u" > typeof globalThis) return globalThis;
          if ("u" > typeof self) return self;
          if ("u" > typeof window) return window;
          throw Error("unable to locate global object");
        })();
        return new Uint8Array(await f10.deriveBits({ name: "HKDF", hash: `SHA-${a10.substr(3)}`, salt: c10, info: d10 }, await f10.importKey("raw", b10, "HKDF", false, ["deriveBits"]), e10 << 3));
      };
      function db(a10, b10) {
        if ("string" == typeof a10) return new TextEncoder().encode(a10);
        if (!(a10 instanceof Uint8Array)) throw TypeError(`"${b10}"" must be an instance of Uint8Array or a string`);
        return a10;
      }
      async function dc(a10, b10, c10, d10, e10) {
        return da(function(a11) {
          switch (a11) {
            case "sha256":
            case "sha384":
            case "sha512":
            case "sha1":
              return a11;
            default:
              throw TypeError('unsupported "digest" value');
          }
        }(a10), function(a11) {
          let b11 = db(a11, "ikm");
          if (!b11.byteLength) throw TypeError('"ikm" must be at least one byte in length');
          return b11;
        }(b10), db(c10, "salt"), function(a11) {
          let b11 = db(a11, "info");
          if (b11.byteLength > 1024) throw TypeError('"info" must not contain more than 1024 bytes');
          return b11;
        }(d10), function(a11, b11) {
          if ("number" != typeof a11 || !Number.isInteger(a11) || a11 < 1) throw TypeError('"keylen" must be a positive integer');
          if (a11 > 255 * (parseInt(b11.substr(3), 10) >> 3 || 20)) throw TypeError('"keylen" too large');
          return a11;
        }(e10, a10));
      }
      let dd = new TextEncoder(), de = new TextDecoder(), df = new TextDecoder("utf-8", { fatal: true });
      function dg(...a10) {
        let b10 = new Uint8Array(a10.reduce((a11, { length: b11 }) => a11 + b11, 0)), c10 = 0;
        for (let d10 of a10) b10.set(d10, c10), c10 += d10.length;
        return b10;
      }
      function dh(a10, b10, c10) {
        if (b10 < 0 || b10 >= 4294967296) throw RangeError(`value must be >= 0 and <= ${4294967296 - 1}. Received ${b10}`);
        a10.set([b10 >>> 24, b10 >>> 16, b10 >>> 8, 255 & b10], c10);
      }
      function di(a10) {
        let b10 = Math.floor(a10 / 4294967296), c10 = new Uint8Array(8);
        return dh(c10, b10, 0), dh(c10, a10 % 4294967296, 4), c10;
      }
      function dj(a10) {
        let b10 = new Uint8Array(4);
        return dh(b10, a10), b10;
      }
      function dk(a10) {
        let b10 = new Uint8Array(a10.length);
        for (let c10 = 0; c10 < a10.length; c10++) {
          let d10 = a10.charCodeAt(c10);
          if (d10 > 127) throw TypeError("non-ASCII string encountered in encode()");
          b10[c10] = d10;
        }
        return b10;
      }
      let dl = "The input to be decoded is not correctly encoded.";
      function dm(a10) {
        if (Uint8Array.fromBase64) try {
          return Uint8Array.fromBase64("string" == typeof a10 ? a10 : de.decode(a10), { alphabet: "base64url" });
        } catch (a11) {
          throw TypeError(dl, { cause: a11 });
        }
        let b10 = a10;
        if (b10 instanceof Uint8Array && (b10 = de.decode(b10)), b10.includes("+") || b10.includes("/")) throw TypeError(dl);
        b10 = b10.replace(/-/g, "+").replace(/_/g, "/");
        try {
          var c10 = b10;
          if (Uint8Array.fromBase64) return Uint8Array.fromBase64(c10);
          let a11 = atob(c10), d10 = new Uint8Array(a11.length);
          for (let b11 = 0; b11 < a11.length; b11++) d10[b11] = a11.charCodeAt(b11);
          return d10;
        } catch {
          throw TypeError(dl);
        }
      }
      function dn(a10) {
        let b10 = a10;
        return ("string" == typeof b10 && (b10 = dd.encode(b10)), Uint8Array.prototype.toBase64) ? b10.toBase64({ alphabet: "base64url", omitPadding: true }) : function(a11) {
          if (Uint8Array.prototype.toBase64) return a11.toBase64();
          let b11 = [];
          for (let c10 = 0; c10 < a11.length; c10 += 32768) b11.push(String.fromCharCode.apply(null, a11.subarray(c10, c10 + 32768)));
          return btoa(b11.join(""));
        }(b10).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      }
      function dp(a10) {
        if ("object" != typeof a10 || null === a10 || "[object Object]" !== Object.prototype.toString.call(a10)) return false;
        let b10 = Object.getPrototypeOf(a10);
        if (null === b10) return true;
        let c10 = b10;
        for (; null !== Object.getPrototypeOf(c10); ) c10 = Object.getPrototypeOf(c10);
        return b10 === c10;
      }
      function dq(...a10) {
        let b10 = /* @__PURE__ */ new Set();
        for (let c10 of a10) if (c10) for (let a11 of Object.keys(c10)) {
          if (b10.has(a11)) return false;
          b10.add(a11);
        }
        return true;
      }
      let dr = (a10) => dp(a10) && "string" == typeof a10.kty, ds = Symbol();
      function dt(a10, b10) {
        if (a10) throw TypeError(`${b10} can only be called once`);
      }
      function du(a10, b10, c10) {
        try {
          return dm(a10);
        } catch {
          throw new c10(`Failed to base64url decode the ${b10}`);
        }
      }
      async function dv(a10, b10) {
        let c10 = `SHA-${a10.slice(-3)}`;
        return new Uint8Array(await crypto.subtle.digest(c10, b10));
      }
      class dw extends Error {
        static code = "ERR_JOSE_GENERIC";
        code = "ERR_JOSE_GENERIC";
        constructor(a10, b10) {
          super(a10, b10), this.name = this.constructor.name, Error.captureStackTrace?.(this, this.constructor);
        }
      }
      class dx extends dw {
        static code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
        code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
        claim;
        reason;
        payload;
        constructor(a10, b10, c10 = "unspecified", d10 = "unspecified") {
          super(a10, { cause: { claim: c10, reason: d10, payload: b10 } }), this.claim = c10, this.reason = d10, this.payload = b10;
        }
      }
      class dy extends dw {
        static code = "ERR_JWT_EXPIRED";
        code = "ERR_JWT_EXPIRED";
        claim;
        reason;
        payload;
        constructor(a10, b10, c10 = "unspecified", d10 = "unspecified") {
          super(a10, { cause: { claim: c10, reason: d10, payload: b10 } }), this.claim = c10, this.reason = d10, this.payload = b10;
        }
      }
      class dz extends dw {
        static code = "ERR_JOSE_ALG_NOT_ALLOWED";
        code = "ERR_JOSE_ALG_NOT_ALLOWED";
      }
      class dA extends dw {
        static code = "ERR_JOSE_NOT_SUPPORTED";
        code = "ERR_JOSE_NOT_SUPPORTED";
      }
      class dB extends dw {
        static code = "ERR_JWE_DECRYPTION_FAILED";
        code = "ERR_JWE_DECRYPTION_FAILED";
        constructor(a10 = "decryption operation failed", b10) {
          super(a10, b10);
        }
      }
      class dC extends dw {
        static code = "ERR_JWE_INVALID";
        code = "ERR_JWE_INVALID";
      }
      class dD extends dw {
        static code = "ERR_JWT_INVALID";
        code = "ERR_JWT_INVALID";
      }
      class dE extends dw {
        static code = "ERR_JWK_INVALID";
        code = "ERR_JWK_INVALID";
      }
      function dF(a10) {
        if (!dG(a10)) throw Error("CryptoKey instance expected");
      }
      let dG = (a10) => {
        if (a10?.[Symbol.toStringTag] === "CryptoKey") return true;
        try {
          return a10 instanceof CryptoKey;
        } catch {
          return false;
        }
      }, dH = (a10) => a10?.[Symbol.toStringTag] === "KeyObject", dI = (a10) => dG(a10) || dH(a10);
      function dJ(a10, b10, ...c10) {
        if (c10.length > 2) {
          let b11 = c10.pop();
          a10 += `one of type ${c10.join(", ")}, or ${b11}.`;
        } else 2 === c10.length ? a10 += `one of type ${c10[0]} or ${c10[1]}.` : a10 += `of type ${c10[0]}.`;
        return null == b10 ? a10 += ` Received ${b10}` : "function" == typeof b10 && b10.name ? a10 += ` Received function ${b10.name}` : "object" == typeof b10 && null != b10 && b10.constructor?.name && (a10 += ` Received an instance of ${b10.constructor.name}`), a10;
      }
      let dK = (a10, ...b10) => dJ("Key must be ", a10, ...b10), dL = (a10, b10, ...c10) => dJ(`Key for the ${a10} algorithm must be `, b10, ...c10);
      async function dM(a10) {
        if (dH(a10)) if ("secret" !== a10.type) return a10.export({ format: "jwk" });
        else a10 = a10.export();
        if (a10 instanceof Uint8Array) return { kty: "oct", k: dn(a10) };
        if (!dG(a10)) throw TypeError(dK(a10, "CryptoKey", "KeyObject", "Uint8Array"));
        if (!a10.extractable) throw TypeError("non-extractable CryptoKey cannot be exported as a JWK");
        let { ext: b10, key_ops: c10, alg: d10, use: e10, ...f10 } = Object.fromEntries(Object.entries(await crypto.subtle.exportKey("jwk", a10)).filter(([, a11]) => void 0 !== a11));
        return "AKP" === f10.kty && (f10.alg = d10), f10;
      }
      let dN = (a10, b10) => {
        if ("string" != typeof a10 || !a10) throw new dE(`${b10} missing or invalid`);
      };
      async function dO(a10, b10) {
        let c10, d10;
        if (dr(a10)) c10 = a10;
        else if (dI(a10)) c10 = await dM(a10);
        else throw TypeError(dK(a10, "CryptoKey", "KeyObject", "JSON Web Key"));
        if ("sha256" !== (b10 ??= "sha256") && "sha384" !== b10 && "sha512" !== b10) throw TypeError('digestAlgorithm must one of "sha256", "sha384", or "sha512"');
        switch (c10.kty) {
          case "AKP":
            dN(c10.alg, '"alg" (Algorithm) Parameter'), dN(c10.pub, '"pub" (Public key) Parameter'), d10 = { alg: c10.alg, kty: c10.kty, pub: c10.pub };
            break;
          case "EC":
            dN(c10.crv, '"crv" (Curve) Parameter'), dN(c10.x, '"x" (X Coordinate) Parameter'), dN(c10.y, '"y" (Y Coordinate) Parameter'), d10 = { crv: c10.crv, kty: c10.kty, x: c10.x, y: c10.y };
            break;
          case "OKP":
            dN(c10.crv, '"crv" (Subtype of Key Pair) Parameter'), dN(c10.x, '"x" (Public Key) Parameter'), d10 = { crv: c10.crv, kty: c10.kty, x: c10.x };
            break;
          case "RSA":
            dN(c10.e, '"e" (Exponent) Parameter'), dN(c10.n, '"n" (Modulus) Parameter'), d10 = { e: c10.e, kty: c10.kty, n: c10.n };
            break;
          case "oct":
            dN(c10.k, '"k" (Key Value) Parameter'), d10 = { k: c10.k, kty: c10.kty };
            break;
          default:
            throw new dA('"kty" (Key Type) Parameter missing or unsupported');
        }
        let e10 = dk(JSON.stringify(d10));
        return dn(await dv(b10, e10));
      }
      let dP = (a10, b10 = "algorithm.name") => TypeError(`CryptoKey does not support this operation, its ${b10} must be ${a10}`);
      function dQ(a10, b10) {
        if (b10 && !a10.usages.includes(b10)) throw TypeError(`CryptoKey does not support this operation, its usages must include ${b10}.`);
      }
      function dR(a10, b10, c10) {
        let d10 = a10.algorithm;
        if (d10.name !== b10.name) throw dP(b10.name);
        if (b10.hash && d10.hash?.name !== b10.hash) throw dP(b10.hash, "algorithm.hash");
        if (b10.namedCurve && d10.namedCurve !== b10.namedCurve) throw dP(b10.namedCurve, "algorithm.namedCurve");
        if (void 0 !== b10.length && d10.length !== b10.length) throw dP(b10.length, "algorithm.length");
        dQ(a10, c10);
      }
      let dS = (a10) => crypto.getRandomValues(new Uint8Array(a10.cekBits >> 3));
      function dT(a10, b10) {
        let c10 = a10.byteLength << 3;
        if (c10 !== b10) throw new dC(`Invalid Content Encryption Key length. Expected ${b10} bits, got ${c10} bits`);
      }
      function dU(a10, b10) {
        if (b10.length << 3 !== a10.ivBits) throw new dC("Invalid Initialization Vector length");
      }
      async function dV(a10, b10, c10) {
        if (!(b10 instanceof Uint8Array)) throw TypeError(dK(b10, "Uint8Array"));
        let d10 = a10.cekBits >> 1;
        return [await crypto.subtle.importKey("raw", b10.subarray(d10 >> 3), "AES-CBC", false, [c10]), await crypto.subtle.importKey("raw", b10.subarray(0, d10 >> 3), { hash: `SHA-${d10 << 1}`, name: "HMAC" }, false, ["sign"]), d10];
      }
      async function dW(a10, b10, c10) {
        return new Uint8Array((await crypto.subtle.sign("HMAC", a10, b10)).slice(0, c10 >> 3));
      }
      async function dX(a10, b10, c10, d10, e10) {
        let [f10, g10, h10] = await dV(a10, c10, "encrypt"), i10 = new Uint8Array(await crypto.subtle.encrypt({ iv: d10, name: "AES-CBC" }, f10, b10)), j2 = dg(e10, d10, i10, di(8 * e10.length));
        return { ciphertext: i10, tag: await dW(g10, j2, h10), iv: d10 };
      }
      async function dY(a10, b10) {
        let c10 = { name: "HMAC", hash: "SHA-256" }, d10 = await crypto.subtle.generateKey(c10, false, ["sign", "verify"]), e10 = await crypto.subtle.sign(c10, d10, a10);
        return crypto.subtle.verify(c10, d10, e10, b10);
      }
      async function dZ(a10, b10, c10, d10, e10, f10) {
        let g10, h10, [i10, j2, k2] = await dV(a10, b10, "decrypt"), l2 = dg(f10, d10, c10, di(8 * f10.length)), m2 = await dW(j2, l2, k2);
        try {
          g10 = await dY(e10, m2);
        } catch {
        }
        if (!g10) throw new dB();
        try {
          h10 = new Uint8Array(await crypto.subtle.decrypt({ iv: d10, name: "AES-CBC" }, i10, c10));
        } catch {
        }
        if (!h10) throw new dB();
        return h10;
      }
      async function d$(a10, b10, c10, d10, e10) {
        let f10 = c10 instanceof Uint8Array ? await crypto.subtle.importKey("raw", c10, "AES-GCM", false, ["encrypt"]) : (dR(c10, a10.subtle, "encrypt"), c10), g10 = new Uint8Array(await crypto.subtle.encrypt({ additionalData: e10, iv: d10, name: "AES-GCM", tagLength: 128 }, f10, b10)), h10 = g10.slice(-16);
        return { ciphertext: g10.slice(0, -16), tag: h10, iv: d10 };
      }
      async function d_(a10, b10, c10, d10, e10, f10) {
        let g10 = b10 instanceof Uint8Array ? await crypto.subtle.importKey("raw", b10, "AES-GCM", false, ["decrypt"]) : (dR(b10, a10.subtle, "decrypt"), b10);
        try {
          return new Uint8Array(await crypto.subtle.decrypt({ additionalData: f10, iv: d10, name: "AES-GCM", tagLength: 128 }, g10, dg(c10, e10)));
        } catch {
          throw new dB();
        }
      }
      async function d0(a10, b10, c10, d10, e10) {
        if (!dG(c10) && !(c10 instanceof Uint8Array)) throw TypeError(dK(c10, "CryptoKey", "KeyObject", "Uint8Array", "JSON Web Key"));
        if (d10) dU(a10, d10);
        else d10 = crypto.getRandomValues(new Uint8Array(a10.ivBits >> 3));
        return c10 instanceof Uint8Array && dT(c10, a10.cekBits), a10.cbc ? dX(a10, b10, c10, d10, e10) : d$(a10, b10, c10, d10, e10);
      }
      async function d1(a10, b10, c10, d10, e10, f10) {
        if (!dG(b10) && !(b10 instanceof Uint8Array)) throw TypeError(dK(b10, "CryptoKey", "KeyObject", "Uint8Array", "JSON Web Key"));
        if (!d10) throw new dC("JWE Initialization Vector missing");
        if (!e10) throw new dC("JWE Authentication Tag missing");
        return dU(a10, d10), b10 instanceof Uint8Array && dT(b10, a10.cekBits), a10.cbc ? dZ(a10, b10, c10, d10, e10, f10) : d_(a10, b10, c10, d10, e10, f10);
      }
      async function d2(a10, b10) {
        if ("RSA" === b10.kty && "oth" in b10 && void 0 !== b10.oth) throw new dA('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
        if (!a10.kty.includes(b10.kty)) throw new dA('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
        let c10 = a10.resolve?.({ kty: b10.kty, crv: b10.crv }) ?? a10.subtle, d10 = !!(b10.d || b10.priv), e10 = { ...b10 };
        return "AKP" !== e10.kty && delete e10.alg, delete e10.use, crypto.subtle.importKey("jwk", e10, c10, b10.ext ?? !d10, b10.key_ops ?? a10.usages[+!!d10]);
      }
      let d3 = (a10) => a10[Symbol.toStringTag], d4 = { __proto__: null, prime256v1: "P-256", secp384r1: "P-384", secp521r1: "P-521" };
      function d5(a10, b10, c10) {
        let d10 = (f ||= /* @__PURE__ */ new WeakMap()).get(a10);
        return c10 && (d10 ? d10[b10] = c10 : f.set(a10, { __proto__: null, [b10]: c10 })), c10 ?? d10?.[b10];
      }
      let d6 = async (a10, b10, c10) => d5(a10, c10.alg) ?? d5(a10, c10.alg, await d2(c10, { ...b10, alg: c10.alg }));
      async function d7(a10, b10, c10) {
        let d10 = function(a11, b11, c11) {
          let { alg: d11, secret: e10 } = a11, f10 = "decrypt" === c11 || "sign" === c11;
          if (e10 && b11 instanceof Uint8Array) return [0, b11];
          if (dr(b11)) {
            if (e10 ? "oct" !== b11.kty || "string" != typeof b11.k : !(f10 ? "oct" !== b11.kty && ("AKP" === b11.kty && "string" == typeof b11.priv || "string" == typeof b11.d) : "oct" !== b11.kty && void 0 === b11.d && void 0 === b11.priv)) throw TypeError(e10 ? 'JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present' : `JSON Web Key for this operation must be a ${f10 ? "private" : "public"} JWK`);
            return ((a12, b12, c12) => {
              let { alg: d12 } = a12;
              if (void 0 !== b12.use) {
                let a13 = "sign" === c12 || "verify" === c12 ? "sig" : "enc";
                if (b12.use !== a13) throw TypeError(`Invalid key for this operation, its "use" must be "${a13}" when present`);
              }
              if (void 0 !== b12.alg && b12.alg !== d12) throw TypeError(`Invalid key for this operation, its "alg" must be "${d12}" when present`);
              if (Array.isArray(b12.key_ops)) {
                let d13 = "encrypt" === c12 || "decrypt" === c12 ? a12.ops?.[+("encrypt" !== c12)] : c12;
                if (d13 && !b12.key_ops.includes(d13)) throw TypeError(`Invalid key for this operation, its "key_ops" must include "${d13}" when present`);
              }
            })(a11, b11, c11), [3, b11];
          }
          if (!dI(b11)) throw TypeError(e10 ? dL(d11, b11, "CryptoKey", "KeyObject", "JSON Web Key", "Uint8Array") : dL(d11, b11, "CryptoKey", "KeyObject", "JSON Web Key"));
          if (e10) {
            if ("secret" !== b11.type) throw TypeError(`${d3(b11)} instances for symmetric algorithms must be of type "secret"`);
          } else {
            if ("secret" === b11.type) throw TypeError(`${d3(b11)} instances for asymmetric algorithms must not be of type "secret"`);
            let a12 = f10 ? "private" : "public";
            if (("public" === b11.type || "private" === b11.type) && b11.type !== a12) {
              let d12 = "sign" === c11 ? "signing" : "verify" === c11 ? "verifying" : `${c11.slice(0, -1)}tion`;
              throw TypeError(`${d3(b11)} instances for asymmetric algorithm ${d12} must be of type "${a12}"`);
            }
          }
          return dG(b11) ? [1, b11] : [2, b11];
        }(a10, b10, c10);
        switch (d10[0]) {
          case 0:
          case 1:
            return d10[1];
          case 3: {
            let b11 = d10[1];
            if (b11.k) return dm(b11.k);
            if (!Object.isFrozen(b11)) {
              let { key_ops: a11 } = b11;
              Array.isArray(a11) && Object.freeze(a11), Object.freeze(b11);
            }
            return d6(b11, b11, a10);
          }
          case 2: {
            let b11 = d10[1];
            if ("secret" === b11.type) return b11.export();
            if ("toCryptoKey" in b11 && "function" == typeof b11.toCryptoKey) return ((a11, b12) => {
              let c11 = d5(a11, b12.alg);
              if (c11) return c11;
              let d11 = "public" === a11.type, e10 = b12.usages[+!d11], { asymmetricKeyType: f10 } = a11, g10 = d4[a11.asymmetricKeyDetails?.namedCurve], h10 = b12.resolve?.({ crv: g10, asymmetricKeyType: f10 }) ?? b12.subtle;
              return d5(a11, b12.alg, a11.toCryptoKey(h10, d11, e10));
            })(b11, a10);
            return d6(b11, b11.export({ format: "jwk" }), a10);
          }
        }
      }
      function d8(a10) {
        let b10 = { __proto__: null };
        for (let c10 in a10) b10[c10] = { ...a10[c10], alg: c10 };
        return b10;
      }
      let d9 = [["encrypt", "wrapKey"], ["decrypt", "unwrapKey"]], ea = [[], ["deriveBits"]], eb = [[], []];
      function ec(a10) {
        return { kty: ["RSA"], subtle: { name: "RSA-OAEP", hash: `SHA-${a10}` }, usages: d9, ops: ["wrapKey", "unwrapKey"] };
      }
      function ed() {
        return { kty: ["EC", "OKP"], subtle: { name: "ECDH" }, resolve: ({ kty: a10, crv: b10, asymmetricKeyType: c10 }) => {
          if ("X25519" === b10 || "x25519" === c10) return { name: "X25519" };
          if ("OKP" === a10) throw new dA('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
          return { name: "ECDH", namedCurve: b10 };
        }, usages: ea, ops: [void 0, "deriveBits"] };
      }
      function ee(a10, b10 = false) {
        return { kty: ["oct"], secret: true, subtle: { name: b10 ? "AES-GCM" : "AES-KW", length: a10 }, usages: eb, ops: b10 ? ["encrypt", "decrypt"] : ["wrapKey", "unwrapKey"] };
      }
      function ef() {
        return { kty: ["oct"], secret: true, subtle: { name: "PBKDF2" }, usages: eb, ops: ["deriveBits", "deriveBits"] };
      }
      let eg = d8({ dir: { kty: ["oct"], secret: true, subtle: { name: "AES-GCM" }, usages: eb, ops: ["encrypt", "decrypt"] }, "RSA-OAEP": ec(1), "RSA-OAEP-256": ec(256), "RSA-OAEP-384": ec(384), "RSA-OAEP-512": ec(512), "ECDH-ES": ed(), "ECDH-ES+A128KW": ed(), "ECDH-ES+A192KW": ed(), "ECDH-ES+A256KW": ed(), A128KW: ee(128), A192KW: ee(192), A256KW: ee(256), A128GCMKW: ee(128, true), A192GCMKW: ee(192, true), A256GCMKW: ee(256, true), "PBES2-HS256+A128KW": ef(), "PBES2-HS384+A192KW": ef(), "PBES2-HS512+A256KW": ef() }), eh = ["encrypt", "decrypt"];
      function ei(a10, b10 = false) {
        return { kty: ["oct"], secret: true, subtle: { name: b10 ? "AES-CBC" : "AES-GCM", length: a10 }, usages: eb, ops: eh, cekBits: a10, ivBits: b10 ? 128 : 96, cbc: b10 };
      }
      let ej = d8({ A128GCM: ei(128), A192GCM: ei(192), A256GCM: ei(256), "A128CBC-HS256": ei(256, true), "A192CBC-HS384": ei(384, true), "A256CBC-HS512": ei(512, true) });
      function ek(a10, b10) {
        throw new dA(`Invalid or unsupported "${a10}" (JWE ${b10}) header value`);
      }
      function el(a10) {
        return ("string" == typeof a10 ? eg[a10] : void 0) ?? ek("alg", "Algorithm");
      }
      function em(a10) {
        return ("string" == typeof a10 ? ej[a10] : void 0) ?? ek("enc", "Encryption Algorithm");
      }
      function en(a10, b10) {
        if ("ECDH" !== a10.algorithm.name && "X25519" !== a10.algorithm.name) throw TypeError("CryptoKey does not support this operation, its algorithm.name must be ECDH or X25519");
        dQ(a10, b10);
      }
      async function eo(a10, b10, c10) {
        let d10 = el(b10).subtle, e10 = a10 instanceof Uint8Array ? await crypto.subtle.importKey("raw", a10, "AES-KW", true, [c10]) : a10;
        return dR(e10, d10, c10), e10;
      }
      async function ep(a10, b10, c10) {
        let d10 = await eo(b10, a10, "wrapKey"), e10 = await crypto.subtle.importKey("raw", c10, { hash: "SHA-256", name: "HMAC" }, true, ["sign"]);
        return new Uint8Array(await crypto.subtle.wrapKey("raw", e10, d10, "AES-KW"));
      }
      async function eq(a10, b10, c10) {
        let d10 = await eo(b10, a10, "unwrapKey"), e10 = await crypto.subtle.unwrapKey("raw", c10, d10, "AES-KW", { hash: "SHA-256", name: "HMAC" }, true, ["sign"]);
        return new Uint8Array(await crypto.subtle.exportKey("raw", e10));
      }
      function er(a10, b10, c10) {
        dR(b10, el(a10).subtle, c10), function(a11, b11) {
          let { modulusLength: c11 } = b11.algorithm;
          if ("number" != typeof c11 || c11 < 2048) throw TypeError(`${a11} requires key modulusLength to be 2048 bits or larger`);
        }(a10, b10);
      }
      async function es(a10, b10, c10, d10) {
        if (!(a10 instanceof Uint8Array) || a10.length < 8) throw new dC("PBES2 Salt Input must be 8 or more octets");
        if (!Number.isSafeInteger(c10) || 1 !== Math.sign(c10)) throw new dC("PBES2 Count Input must be a positive integer");
        let e10 = dg(dk(b10), Uint8Array.of(0), a10), f10 = parseInt(b10.slice(13, 16), 10), g10 = { hash: `SHA-${b10.slice(8, 11)}`, iterations: c10, name: "PBKDF2", salt: e10 }, h10 = await (d10 instanceof Uint8Array ? crypto.subtle.importKey("raw", d10, "PBKDF2", false, ["deriveBits"]) : (dR(d10, el(b10).subtle, "deriveBits"), d10));
        return new Uint8Array(await crypto.subtle.deriveBits(g10, h10, f10));
      }
      function et(a10) {
        return dg(dj(a10.length), a10);
      }
      async function eu(a10, b10, c10) {
        let d10 = b10 >> 3, e10 = Math.ceil(d10 / 32), f10 = new Uint8Array(32 * e10);
        for (let b11 = 1; b11 <= e10; b11++) {
          let d11 = await dv("sha256", dg(dj(b11), a10, c10));
          f10.set(d11, (b11 - 1) * 32);
        }
        return f10.slice(0, d10);
      }
      async function ev(a10, b10, c10, d10, e10 = new Uint8Array(), f10 = new Uint8Array()) {
        en(a10), en(b10, "deriveBits");
        let g10 = dg(et(dk(c10)), et(e10), et(f10), dj(d10));
        return eu(new Uint8Array(await crypto.subtle.deriveBits({ name: a10.algorithm.name, public: a10 }, b10, "X25519" === a10.algorithm.name ? 256 : Math.ceil(parseInt(a10.algorithm.namedCurve.slice(-3), 10) / 8) << 3)), d10, g10);
      }
      function ew(a10) {
        dF(a10);
        let b10 = a10.algorithm.namedCurve;
        if ("P-256" !== b10 && "P-384" !== b10 && "P-521" !== b10 && "X25519" !== a10.algorithm.name) throw new dA("ECDH with the provided key is not allowed or not supported by your javascript runtime");
      }
      function ex(a10) {
        if (void 0 === a10) throw new dC("JWE Encrypted Key missing");
      }
      function ey(a10) {
        if (void 0 !== a10) throw new dC("Encountered unexpected JWE Encrypted Key");
      }
      async function ez(a10, b10, c10, d10, e10, f10) {
        let g10 = el(a10);
        if ("dir" === a10) return ey(d10), c10;
        switch (g10.subtle.name) {
          case "ECDH": {
            let f11, h10;
            if ("ECDH-ES" === a10 && ey(d10), !dp(e10.epk)) throw new dC('JOSE Header "epk" (Ephemeral Public Key) missing or invalid');
            ew(c10);
            let i10 = await d2(g10, e10.epk);
            if (void 0 !== e10.apu) {
              if ("string" != typeof e10.apu) throw new dC('JOSE Header "apu" (Agreement PartyUInfo) invalid');
              f11 = du(e10.apu, "apu", dC);
            }
            if (void 0 !== e10.apv) {
              if ("string" != typeof e10.apv) throw new dC('JOSE Header "apv" (Agreement PartyVInfo) invalid');
              h10 = du(e10.apv, "apv", dC);
            }
            let j2 = await ev(i10, c10, "ECDH-ES" === a10 ? b10.alg : a10, "ECDH-ES" === a10 ? b10.cekBits : parseInt(a10.slice(-5, -2), 10), f11, h10);
            if ("ECDH-ES" === a10) return j2;
            return ex(d10), eq(a10.slice(-6), j2, d10);
          }
          case "RSA-OAEP":
            return ex(d10), dF(c10), er(a10, c10, "decrypt"), new Uint8Array(await crypto.subtle.decrypt("RSA-OAEP", c10, d10));
          case "PBKDF2": {
            if (ex(d10), "number" != typeof e10.p2c) throw new dC('JOSE Header "p2c" (PBES2 Count) missing or invalid');
            let b11 = f10?.maxPBES2Count || 1e4;
            if (e10.p2c > b11) throw new dC('JOSE Header "p2c" (PBES2 Count) out is of acceptable bounds');
            if ("string" != typeof e10.p2s) throw new dC('JOSE Header "p2s" (PBES2 Salt) missing or invalid');
            let g11 = du(e10.p2s, "p2s", dC), h10 = await es(g11, a10, e10.p2c, c10);
            return eq(a10.slice(-6), h10, d10);
          }
          case "AES-KW":
            return ex(d10), eq(a10, c10, d10);
          case "AES-GCM": {
            let b11, f11;
            if (ex(d10), "string" != typeof e10.iv) throw new dC('JOSE Header "iv" (Initialization Vector) missing or invalid');
            if ("string" != typeof e10.tag) throw new dC('JOSE Header "tag" (Authentication Tag) missing or invalid');
            return b11 = du(e10.iv, "iv", dC), f11 = du(e10.tag, "tag", dC), d1(em(a10.slice(0, -2)), c10, d10, b11, f11, new Uint8Array());
          }
        }
      }
      async function eA(a10, b10, c10, d10, e10 = {}) {
        let f10, g10, h10, i10 = el(a10);
        if ("dir" === a10) return [c10, void 0, void 0];
        switch (i10.subtle.name) {
          case "ECDH": {
            let j2;
            ew(c10);
            let { apu: k2, apv: l2 } = e10;
            j2 = e10.epk ? await d7(i10, e10.epk, "decrypt") : (await crypto.subtle.generateKey(c10.algorithm, true, ["deriveBits"])).privateKey;
            let m2 = crypto.subtle, n2 = j2;
            if (!n2.extractable) {
              if ("function" != typeof m2.getPublicKey) throw TypeError('CryptoKey for "epk" must be extractable');
              n2 = await m2.getPublicKey(j2, []);
            }
            let { x: o2, y: p2, crv: q2, kty: r2 } = await m2.exportKey("jwk", n2), s2 = await ev(c10, j2, "ECDH-ES" === a10 ? b10.alg : a10, "ECDH-ES" === a10 ? b10.cekBits : parseInt(a10.slice(-5, -2), 10), k2, l2);
            if (g10 = { epk: { x: o2, crv: q2, kty: r2 } }, "EC" === r2 && (g10.epk.y = p2), k2 && (g10.apu = dn(k2)), l2 && (g10.apv = dn(l2)), "ECDH-ES" === a10) {
              h10 = s2;
              break;
            }
            h10 = d10 || dS(b10);
            let t2 = a10.slice(-6);
            f10 = await ep(t2, s2, h10);
            break;
          }
          case "RSA-OAEP":
            h10 = d10 || dS(b10), dF(c10), er(a10, c10, "encrypt"), f10 = new Uint8Array(await crypto.subtle.encrypt("RSA-OAEP", c10, h10));
            break;
          case "PBKDF2": {
            h10 = d10 || dS(b10);
            let { p2c: i11 = 2048, p2s: j2 = crypto.getRandomValues(new Uint8Array(16)) } = e10, k2 = await es(j2, a10, i11, c10);
            f10 = await ep(a10.slice(-6), k2, h10), g10 = { p2c: i11, p2s: dn(j2) };
            break;
          }
          case "AES-KW":
            h10 = d10 || dS(b10), f10 = await ep(a10, c10, h10);
            break;
          case "AES-GCM": {
            h10 = d10 || dS(b10);
            let { iv: i11 } = e10, j2 = await d0(em(a10.slice(0, -2)), h10, c10, i11, new Uint8Array());
            f10 = j2.ciphertext, g10 = { iv: dn(j2.iv), tag: dn(j2.tag) };
          }
        }
        return [h10, f10, g10];
      }
      let eB = { __proto__: null };
      function eC(a10, b10) {
        if (void 0 !== b10 && (!Array.isArray(b10) || b10.some((a11) => "string" != typeof a11))) throw TypeError(`"${a10}" option must be an array of strings`);
        if (b10) return new Set(b10);
      }
      function eD(a10, b10, c10, d10, e10) {
        if (void 0 !== e10.crit && d10?.crit === void 0) throw new a10('"crit" (Critical) Header Parameter MUST be integrity protected');
        if (!d10 || void 0 === d10.crit) return [];
        if (!Array.isArray(d10.crit) || 0 === d10.crit.length || d10.crit.some((a11) => "string" != typeof a11 || 0 === a11.length)) throw new a10('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
        let f10 = void 0 === c10 ? b10 : { __proto__: null, ...c10, ...b10 };
        for (let b11 of d10.crit) {
          if (!(b11 in f10)) throw new dA(`Extension Header Parameter "${b11}" is not recognized`);
          if (!Object.hasOwn(e10, b11) || void 0 === e10[b11]) throw new a10(`Extension Header Parameter "${b11}" is missing`);
          if (f10[b11] && (!Object.hasOwn(d10, b11) || void 0 === d10[b11])) throw new a10(`Extension Header Parameter "${b11}" MUST be integrity protected`);
        }
        return d10.crit;
      }
      function eE(a10) {
        if (void 0 === globalThis[a10]) throw new dA(`JWE "zip" (Compression Algorithm) Header Parameter requires the ${a10} API.`);
      }
      async function eF(a10) {
        eE("CompressionStream");
        let b10 = new CompressionStream("deflate-raw"), c10 = b10.writable.getWriter();
        c10.write(a10).catch(() => {
        }), c10.close().catch(() => {
        });
        let d10 = [], e10 = b10.readable.getReader();
        for (; ; ) {
          let { value: a11, done: b11 } = await e10.read();
          if (b11) break;
          d10.push(a11);
        }
        return dg(...d10);
      }
      async function eG(a10, b10) {
        eE("DecompressionStream");
        let c10 = new DecompressionStream("deflate-raw"), d10 = c10.writable.getWriter();
        d10.write(a10).catch(() => {
        }), d10.close().catch(() => {
        });
        let e10 = [], f10 = 0, g10 = c10.readable.getReader();
        for (; ; ) {
          let { value: a11, done: c11 } = await g10.read();
          if (c11) break;
          if (e10.push(a11), f10 += a11.byteLength, b10 !== 1 / 0 && f10 > b10) throw new dC("Decompressed plaintext exceeded the configured limit");
        }
        return dg(...e10);
      }
      async function eH(a10, b10, c10) {
        let d10, e10, f10, g10, [h10, i10, , j2] = b10, [k2, l2, m2, n2, o2, p2, q2, r2, , s2] = a10, t2 = l2, u2 = m2;
        if (p2 && ("dir" === i10 || "ECDH-ES" === i10)) throw TypeError(`setContentEncryptionKey cannot be called with JWE "alg" (Algorithm) Header ${i10}`);
        let v2 = el(i10), w2 = await d7("dir" === i10 ? j2 : v2, c10, "encrypt"), [x2, y2, z2] = await eA(i10, j2, w2, p2, r2);
        z2 && (s2 ? u2 = u2 ? { ...u2, ...z2 } : z2 : t2 = t2 ? { ...t2, ...z2 } : z2), t2 ? e10 = dk(d10 = dn(JSON.stringify(t2))) : (d10 = "", e10 = new Uint8Array()), o2?.byteLength ? (g10 = dn(o2), f10 = dg(e10, dk("."), dk(g10))) : f10 = e10;
        let A2 = k2;
        "DEF" === h10.zip && (A2 = await eF(A2).catch((a11) => {
          throw new dC("Failed to compress plaintext", { cause: a11 });
        }));
        let { ciphertext: B2, tag: C2, iv: D2 } = await d0(j2, A2, x2, q2, f10), E2 = { ciphertext: dn(B2) };
        return D2 && (E2.iv = dn(D2)), C2 && (E2.tag = dn(C2)), y2 && (E2.encrypted_key = dn(y2)), g10 && (E2.aad = g10), t2 && (E2.protected = d10), n2 && (E2.unprotected = n2), u2 && (E2.header = u2), E2;
      }
      async function eI(a10, b10) {
        return eH(a10, function(a11) {
          let [, b11, c10, d10, , , , , e10] = a11;
          if (!dq(b11, c10, d10)) throw new dC("JWE Protected, JWE Shared Unprotected and JWE Per-Recipient Header Parameter names must be disjoint");
          let f10 = { ...b11, ...c10, ...d10 };
          if (eD(dC, eB, e10, b11, f10), void 0 !== f10.zip && "DEF" !== f10.zip) throw new dA('Unsupported JWE "zip" (Compression Algorithm) Header Parameter value.');
          if (void 0 !== f10.zip && !b11?.zip) throw new dC('JWE "zip" (Compression Algorithm) Header Parameter MUST be in a protected header.');
          let { alg: g10, enc: h10 } = f10;
          if ("string" != typeof g10 || !g10) throw new dC('JWE "alg" (Algorithm) Header Parameter missing or invalid');
          if ("string" != typeof h10 || !h10) throw new dC('JWE "enc" (Encryption Algorithm) Header Parameter missing or invalid');
          return [f10, g10, h10, em(h10)];
        }(a10), b10);
      }
      class eJ {
        #b;
        #c;
        #d;
        #e;
        #f;
        #g;
        #h;
        #i;
        constructor(a10) {
          if (!(a10 instanceof Uint8Array)) throw TypeError("plaintext must be an instance of Uint8Array");
          this.#b = a10;
        }
        setKeyManagementParameters(a10) {
          return dt(this.#i, "setKeyManagementParameters"), this.#i = a10, this;
        }
        setProtectedHeader(a10) {
          return dt(this.#c, "setProtectedHeader"), this.#c = a10, this;
        }
        setSharedUnprotectedHeader(a10) {
          return dt(this.#d, "setSharedUnprotectedHeader"), this.#d = a10, this;
        }
        setUnprotectedHeader(a10) {
          return dt(this.#e, "setUnprotectedHeader"), this.#e = a10, this;
        }
        setAdditionalAuthenticatedData(a10) {
          return this.#f = a10, this;
        }
        setContentEncryptionKey(a10) {
          return dt(this.#g, "setContentEncryptionKey"), this.#g = a10, this;
        }
        setInitializationVector(a10) {
          return dt(this.#h, "setInitializationVector"), this.#h = a10, this;
        }
        async encrypt(a10, b10) {
          if (!this.#c && !this.#e && !this.#d) throw new dC("either setProtectedHeader, setUnprotectedHeader, or sharedUnprotectedHeader must be called before #encrypt()");
          return !function(a11, b11) {
            let { crit: c10 } = b11 ?? {};
            if (Array.isArray(c10) && new Set(c10).size !== c10.length) throw new a11('"crit" (Critical) Header Parameter MUST NOT contain duplicate values');
          }(dC, this.#c), eI([this.#b, this.#c, this.#e, this.#d, this.#f, this.#g, this.#h, this.#i, b10?.crit, !!b10 && ds in b10], a10);
        }
      }
      class eK {
        #j;
        constructor(a10) {
          this.#j = new eJ(a10);
        }
        setContentEncryptionKey(a10) {
          return this.#j.setContentEncryptionKey(a10), this;
        }
        setInitializationVector(a10) {
          return this.#j.setInitializationVector(a10), this;
        }
        setProtectedHeader(a10) {
          return this.#j.setProtectedHeader(a10), this;
        }
        setKeyManagementParameters(a10) {
          return this.#j.setKeyManagementParameters(a10), this;
        }
        async encrypt(a10, b10) {
          let c10 = await this.#j.encrypt(a10, b10);
          return [c10.protected, c10.encrypted_key, c10.iv, c10.ciphertext, c10.tag].join(".");
        }
      }
      let eL = (a10) => Math.floor(a10.getTime() / 1e3), eM = { s: 1, m: 60, h: 3600, d: 86400, w: 604800, y: 31557600 }, eN = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i, eO = "check_failed";
      function eP(a10) {
        let b10 = eN.exec(a10);
        if (!b10 || b10[4] && b10[1]) throw TypeError("Invalid time period format");
        let c10 = Math.round(parseFloat(b10[2]) * eM[b10[3][0].toLowerCase()]);
        return "-" === b10[1] || "ago" === b10[4] ? -c10 : c10;
      }
      function eQ(a10, b10) {
        if (!Number.isFinite(b10)) throw TypeError(`Invalid ${a10} input`);
        return b10;
      }
      function eR(a10, b10) {
        return "number" == typeof a10 ? eQ(b10, a10) : a10 instanceof Date ? eQ(b10, eL(a10)) : eL(/* @__PURE__ */ new Date()) + eP(a10);
      }
      let eS = (a10) => a10.includes("/") ? a10.toLowerCase() : `application/${a10.toLowerCase()}`;
      function eT(a10, b10, c10 = false) {
        let d10 = a10[b10];
        if (void 0 !== d10 || c10) {
          if ("number" != typeof d10) throw new dx(`"${b10}" claim must be a number`, a10, b10, "invalid");
          return d10;
        }
      }
      function eU(a10, b10) {
        throw new dx(`unexpected "${b10}" claim value`, a10, b10, eO);
      }
      class eV {
        #k;
        constructor(a10) {
          if (!dp(a10)) throw TypeError("JWT Claims Set MUST be an object");
          this.#k = structuredClone(a10);
        }
        data() {
          return dd.encode(JSON.stringify(this.#k));
        }
        get iss() {
          return this.#k.iss;
        }
        set iss(a10) {
          this.#k.iss = a10;
        }
        get sub() {
          return this.#k.sub;
        }
        set sub(a10) {
          this.#k.sub = a10;
        }
        get aud() {
          return this.#k.aud;
        }
        set aud(a10) {
          this.#k.aud = a10;
        }
        set jti(a10) {
          this.#k.jti = a10;
        }
        set nbf(a10) {
          this.#k.nbf = eR(a10, "setNotBefore");
        }
        set exp(a10) {
          this.#k.exp = eR(a10, "setExpirationTime");
        }
        set iat(a10) {
          void 0 === a10 ? this.#k.iat = eL(/* @__PURE__ */ new Date()) : "string" == typeof a10 ? this.#k.iat = eQ("setIssuedAt", eL(/* @__PURE__ */ new Date()) + eP(a10)) : this.#k.iat = eR(a10, "setIssuedAt");
        }
      }
      class eW {
        #g;
        #h;
        #i;
        #c;
        #l;
        #m;
        #n;
        #o;
        constructor(a10 = {}) {
          this.#o = new eV(a10);
        }
        setIssuer(a10) {
          return this.#o.iss = a10, this;
        }
        setSubject(a10) {
          return this.#o.sub = a10, this;
        }
        setAudience(a10) {
          return this.#o.aud = a10, this;
        }
        setJti(a10) {
          return this.#o.jti = a10, this;
        }
        setNotBefore(a10) {
          return this.#o.nbf = a10, this;
        }
        setExpirationTime(a10) {
          return this.#o.exp = a10, this;
        }
        setIssuedAt(a10) {
          return this.#o.iat = a10, this;
        }
        setProtectedHeader(a10) {
          return dt(this.#c, "setProtectedHeader"), this.#c = a10, this;
        }
        setKeyManagementParameters(a10) {
          return dt(this.#i, "setKeyManagementParameters"), this.#i = a10, this;
        }
        setContentEncryptionKey(a10) {
          return dt(this.#g, "setContentEncryptionKey"), this.#g = a10, this;
        }
        setInitializationVector(a10) {
          return dt(this.#h, "setInitializationVector"), this.#h = a10, this;
        }
        replicateIssuerAsHeader() {
          return this.#l = true, this;
        }
        replicateSubjectAsHeader() {
          return this.#m = true, this;
        }
        replicateAudienceAsHeader() {
          return this.#n = true, this;
        }
        async encrypt(a10, b10) {
          let c10 = new eK(this.#o.data());
          return this.#c && (this.#l || this.#m || this.#n) && (this.#c = { ...this.#c, iss: this.#l ? this.#o.iss : void 0, sub: this.#m ? this.#o.sub : void 0, aud: this.#n ? this.#o.aud : void 0 }), c10.setProtectedHeader(this.#c), this.#h && c10.setInitializationVector(this.#h), this.#g && c10.setContentEncryptionKey(this.#g), this.#i && c10.setKeyManagementParameters(this.#i), c10.encrypt(a10, b10);
        }
      }
      async function eX(a10, b10, c10, d10) {
        let e10, f10, g10, [h10, i10, j2] = c10, [k2, l2, m2, n2, o2] = b10, { encrypted_key: p2, header: q2, unprotected: r2 } = a10;
        if (void 0 !== q2 || void 0 !== r2) {
          if (!dq(k2, q2, r2)) throw new dC("JWE Protected, JWE Unprotected Header, and JWE Per-Recipient Unprotected Header Parameter names must be disjoint");
          e10 = { ...k2, ...q2, ...r2 };
        } else e10 = k2 ?? {};
        if (eD(dC, eB, j2?.crit, k2, e10), void 0 !== e10.zip && "DEF" !== e10.zip) throw new dA('Unsupported JWE "zip" (Compression Algorithm) Header Parameter value.');
        if (void 0 !== e10.zip && !k2?.zip) throw new dC('JWE "zip" (Compression Algorithm) Header Parameter MUST be in a protected header.');
        let { alg: s2, enc: t2 } = e10;
        if ("string" != typeof s2 || !s2) throw new dC("missing JWE Algorithm (alg) in JWE Header");
        if ("string" != typeof t2 || !t2) throw new dC("missing JWE Encryption Algorithm (enc) in JWE Header");
        if (h10 && !h10.has(s2) || !h10 && s2.startsWith("PBES2")) throw new dz('"alg" (Algorithm) Header Parameter value not allowed');
        if (i10 && !i10.has(t2)) throw new dz('"enc" (Encryption Algorithm) Header Parameter value not allowed');
        let u2 = em(t2);
        void 0 !== p2 && (f10 = du(p2, "encrypted_key", dC));
        let v2 = false;
        "function" == typeof d10 && (d10 = await d10(k2, a10), v2 = true);
        let w2 = el(s2), x2 = await d7("dir" === s2 ? u2 : w2, d10, "decrypt");
        try {
          g10 = await ez(s2, u2, x2, f10, e10, j2);
        } catch (a11) {
          if (a11 instanceof TypeError || a11 instanceof dC || a11 instanceof dA) throw a11;
          g10 = dS(u2);
        }
        let y2 = await d1(u2, g10, l2, m2, n2, o2);
        if ("DEF" === e10.zip) {
          let a11 = j2?.maxDecompressedLength ?? 25e4;
          if (0 === a11) throw new dA('JWE "zip" (Compression Algorithm) Header Parameter is not supported.');
          if (a11 !== 1 / 0 && (!Number.isSafeInteger(a11) || a11 < 1)) throw TypeError("maxDecompressedLength must be 0, a positive safe integer, or Infinity");
          y2 = await eG(y2, a11).catch((a12) => {
            if (a12 instanceof dC) throw a12;
            throw new dC("Failed to decompress plaintext", { cause: a12 });
          });
        }
        return [y2, k2, x2, v2];
      }
      async function eY(a10, b10, c10) {
        return eX(a10, function(a11) {
          let b11, { protected: c11, ciphertext: d10, iv: e10, tag: f10, aad: g10 } = a11;
          c11 && (b11 = function(a12, b12, c12) {
            let d11;
            try {
              d11 = JSON.parse(df.decode(dm(a12)));
            } catch {
              throw new b12(c12);
            }
            if (!dp(d11)) throw new b12(c12);
            return d11;
          }(c11, dC, "JWE Protected Header is invalid"));
          let h10 = void 0 !== c11 ? dk(c11) : new Uint8Array();
          return [b11, du(d10, "ciphertext", dC), void 0 !== e10 ? du(e10, "iv", dC) : void 0, void 0 !== f10 ? du(f10, "tag", dC) : void 0, void 0 !== g10 ? dg(h10, dk("."), function(a12, b12) {
            try {
              return dk(a12);
            } catch {
              throw new b12("The aad is not a valid base64url string");
            }
          }(g10, dC)) : h10];
        }(a10), b10, c10);
      }
      async function eZ(a10, b10, c10) {
        if (a10 instanceof Uint8Array && (a10 = de.decode(a10)), "string" != typeof a10) throw new dC("Compact JWE must be a string or Uint8Array");
        let { 0: d10, 1: e10, 2: f10, 3: g10, 4: h10, length: i10 } = a10.split(".");
        if (5 !== i10) throw new dC("Invalid Compact JWE");
        return eY({ ciphertext: g10, iv: f10 || void 0, protected: d10, tag: h10 || void 0, encrypted_key: e10 || void 0 }, b10, c10);
      }
      async function e$(a10, b10, c10) {
        let d10 = await eZ(a10, [c10 && eC("keyManagementAlgorithms", c10.keyManagementAlgorithms), c10 && eC("contentEncryptionAlgorithms", c10.contentEncryptionAlgorithms), c10], b10), e10 = d10[1], f10 = function(a11, b11, c11 = {}) {
          var d11, e11;
          let f11;
          try {
            f11 = JSON.parse(df.decode(b11));
          } catch {
          }
          if (!dp(f11)) throw new dD("JWT Claims Set must be a top-level JSON object");
          let { typ: g11 } = c11;
          if (g11 && ("string" != typeof a11.typ || eS(a11.typ) !== eS(g11))) throw new dx('unexpected "typ" JWT header value', f11, "typ", eO);
          let { requiredClaims: h10 = [], issuer: i10, subject: j2, audience: k2, maxTokenAge: l2 } = c11, m2 = [...h10];
          for (let a12 of (void 0 !== l2 && m2.push("iat"), void 0 !== k2 && m2.push("aud"), void 0 !== j2 && m2.push("sub"), void 0 !== i10 && m2.push("iss"), new Set(m2.reverse()))) if (!Object.hasOwn(f11, a12)) throw new dx(`missing required "${a12}" claim`, f11, a12, "missing");
          void 0 === i10 || (Array.isArray(i10) ? i10 : [i10]).includes(f11.iss) || eU(f11, "iss"), void 0 !== j2 && f11.sub !== j2 && eU(f11, "sub"), void 0 === k2 || (d11 = f11.aud, e11 = "string" == typeof k2 ? [k2] : k2, "string" == typeof d11 ? e11.includes(d11) : !!Array.isArray(d11) && e11.some((a12) => d11.includes(a12))) || eU(f11, "aud");
          let { clockTolerance: n2 } = c11, o2 = 0;
          if ("string" == typeof n2) o2 = eP(n2);
          else if (void 0 !== n2) {
            if ("number" != typeof n2) throw TypeError("Invalid clockTolerance option type");
            o2 = n2;
          }
          eQ("clockTolerance option", o2);
          let { currentDate: p2 } = c11, q2 = eQ("currentDate option", eL(p2 || /* @__PURE__ */ new Date())), r2 = eT(f11, "iat", void 0 !== l2), s2 = eT(f11, "nbf");
          if (void 0 !== s2 && s2 > q2 + o2) throw new dx('"nbf" claim timestamp check failed', f11, "nbf", eO);
          let t2 = eT(f11, "exp");
          if (void 0 !== t2 && t2 <= q2 - o2) throw new dy('"exp" claim timestamp check failed', f11, "exp", eO);
          if (void 0 !== l2) {
            let a12 = q2 - r2;
            if (a12 - o2 > ("number" == typeof l2 ? l2 : eP(l2))) throw new dy('"iat" claim timestamp check failed (too far in the past)', f11, "iat", eO);
            if (a12 < 0 - o2) throw new dx('"iat" claim timestamp check failed (it should be in the past)', f11, "iat", eO);
          }
          return f11;
        }(e10, d10[0], c10);
        if (void 0 !== e10.iss && e10.iss !== f10.iss) throw new dx('replicated "iss" claim header parameter mismatch', f10, "iss", "mismatch");
        if (void 0 !== e10.sub && e10.sub !== f10.sub) throw new dx('replicated "sub" claim header parameter mismatch', f10, "sub", "mismatch");
        if (void 0 !== e10.aud && JSON.stringify(e10.aud) !== JSON.stringify(f10.aud)) throw new dx('replicated "aud" claim header parameter mismatch', f10, "aud", "mismatch");
        let g10 = { payload: f10, protectedHeader: e10 };
        return "function" == typeof b10 ? { ...g10, key: d10[2] } : g10;
      }
      let e_ = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/, e0 = /^("?)[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]*\1$/, e1 = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i, e2 = /^[\u0020-\u003A\u003D-\u007E]*$/, e3 = Object.prototype.toString, e4 = ((k = function() {
      }).prototype = /* @__PURE__ */ Object.create(null), k);
      function e5(a10, b10) {
        let c10 = new e4(), d10 = a10.length;
        if (d10 < 2) return c10;
        let e10 = b10?.decode || e9, f10 = 0;
        do {
          let b11 = a10.indexOf("=", f10);
          if (-1 === b11) break;
          let g10 = a10.indexOf(";", f10), h10 = -1 === g10 ? d10 : g10;
          if (b11 > h10) {
            f10 = a10.lastIndexOf(";", b11 - 1) + 1;
            continue;
          }
          let i10 = e6(a10, f10, b11), j2 = e7(a10, b11, i10), k2 = a10.slice(i10, j2);
          if (void 0 === c10[k2]) {
            let d11 = e6(a10, b11 + 1, h10), f11 = e7(a10, h10, d11), g11 = e10(a10.slice(d11, f11));
            c10[k2] = g11;
          }
          f10 = h10 + 1;
        } while (f10 < d10);
        return c10;
      }
      function e6(a10, b10, c10) {
        do {
          let c11 = a10.charCodeAt(b10);
          if (32 !== c11 && 9 !== c11) return b10;
        } while (++b10 < c10);
        return c10;
      }
      function e7(a10, b10, c10) {
        for (; b10 > c10; ) {
          let c11 = a10.charCodeAt(--b10);
          if (32 !== c11 && 9 !== c11) return b10 + 1;
        }
        return c10;
      }
      function e8(a10, b10, c10) {
        let d10 = c10?.encode || encodeURIComponent;
        if (!e_.test(a10)) throw TypeError(`argument name is invalid: ${a10}`);
        let e10 = d10(b10);
        if (!e0.test(e10)) throw TypeError(`argument val is invalid: ${b10}`);
        let f10 = a10 + "=" + e10;
        if (!c10) return f10;
        if (void 0 !== c10.maxAge) {
          if (!Number.isInteger(c10.maxAge)) throw TypeError(`option maxAge is invalid: ${c10.maxAge}`);
          f10 += "; Max-Age=" + c10.maxAge;
        }
        if (c10.domain) {
          if (!e1.test(c10.domain)) throw TypeError(`option domain is invalid: ${c10.domain}`);
          f10 += "; Domain=" + c10.domain;
        }
        if (c10.path) {
          if (!e2.test(c10.path)) throw TypeError(`option path is invalid: ${c10.path}`);
          f10 += "; Path=" + c10.path;
        }
        if (c10.expires) {
          var g10;
          if (g10 = c10.expires, "[object Date]" !== e3.call(g10) || !Number.isFinite(c10.expires.valueOf())) throw TypeError(`option expires is invalid: ${c10.expires}`);
          f10 += "; Expires=" + c10.expires.toUTCString();
        }
        if (c10.httpOnly && (f10 += "; HttpOnly"), c10.secure && (f10 += "; Secure"), c10.partitioned && (f10 += "; Partitioned"), c10.priority) switch ("string" == typeof c10.priority ? c10.priority.toLowerCase() : void 0) {
          case "low":
            f10 += "; Priority=Low";
            break;
          case "medium":
            f10 += "; Priority=Medium";
            break;
          case "high":
            f10 += "; Priority=High";
            break;
          default:
            throw TypeError(`option priority is invalid: ${c10.priority}`);
        }
        if (c10.sameSite) switch ("string" == typeof c10.sameSite ? c10.sameSite.toLowerCase() : c10.sameSite) {
          case true:
          case "strict":
            f10 += "; SameSite=Strict";
            break;
          case "lax":
            f10 += "; SameSite=Lax";
            break;
          case "none":
            f10 += "; SameSite=None";
            break;
          default:
            throw TypeError(`option sameSite is invalid: ${c10.sameSite}`);
        }
        return f10;
      }
      function e9(a10) {
        if (-1 === a10.indexOf("%")) return a10;
        try {
          return decodeURIComponent(a10);
        } catch (b10) {
          return a10;
        }
      }
      let { q: fa } = o, fb = "A256CBC-HS512";
      async function fc(a10) {
        let { token: b10 = {}, secret: c10, maxAge: d10 = 2592e3, salt: e10 } = a10, f10 = Array.isArray(c10) ? c10 : [c10], g10 = await fe(fb, f10[0], e10), h10 = await dO({ kty: "oct", k: dn(g10) }, `sha${g10.byteLength << 3}`);
        return await new eW(b10).setProtectedHeader({ alg: "dir", enc: fb, kid: h10 }).setIssuedAt().setExpirationTime((Date.now() / 1e3 | 0) + d10).setJti(crypto.randomUUID()).encrypt(g10);
      }
      async function fd(a10) {
        let { token: b10, secret: c10, salt: d10 } = a10, e10 = Array.isArray(c10) ? c10 : [c10];
        if (!b10) return null;
        let { payload: f10 } = await e$(b10, async ({ kid: a11, enc: b11 }) => {
          for (let c11 of e10) {
            let e11 = await fe(b11, c11, d10);
            if (void 0 === a11 || a11 === await dO({ kty: "oct", k: dn(e11) }, `sha${e11.byteLength << 3}`)) return e11;
          }
          throw Error("no matching decryption secret");
        }, { clockTolerance: 15, keyManagementAlgorithms: ["dir"], contentEncryptionAlgorithms: [fb, "A256GCM"] });
        return f10;
      }
      async function fe(a10, b10, c10) {
        let d10;
        switch (a10) {
          case "A256CBC-HS512":
            d10 = 64;
            break;
          case "A256GCM":
            d10 = 32;
            break;
          default:
            throw Error("Unsupported JWT Content Encryption Algorithm");
        }
        return await dc("sha256", b10, c10, `Auth.js Generated Encryption Key (${c10})`, d10);
      }
      async function ff({ options: a10, paramValue: b10, cookieValue: c10 }) {
        let { url: d10, callbacks: e10 } = a10, f10 = d10.origin;
        return b10 ? f10 = await e10.redirect({ url: b10, baseUrl: d10.origin }) : c10 && (f10 = await e10.redirect({ url: c10, baseUrl: d10.origin })), { callbackUrl: f10, callbackUrlCookie: f10 !== c10 ? f10 : void 0 };
      }
      let fg = "\x1B[31m", fh = "\x1B[0m", fi = { error(a10) {
        let b10 = a10 instanceof cv ? a10.type : a10.name;
        if (console.error(`${fg}[auth][error]${fh} ${b10}: ${a10.message}`), a10.cause && "object" == typeof a10.cause && "err" in a10.cause && a10.cause.err instanceof Error) {
          let { err: b11, ...c10 } = a10.cause;
          console.error(`${fg}[auth][cause]${fh}:`, b11.stack), c10 && console.error(`${fg}[auth][details]${fh}:`, JSON.stringify(c10, null, 2));
        } else a10.stack && console.error(a10.stack.replace(/.*/, "").substring(1));
      }, warn(a10) {
        console.warn(`\x1B[33m[auth][warn][${a10}]${fh}`, "Read more: https://warnings.authjs.dev");
      }, debug(a10, b10) {
        console.log(`\x1B[90m[auth][debug]:${fh} ${a10}`, JSON.stringify(b10, null, 2));
      } };
      function fj(a10) {
        let b10 = { ...fi };
        return a10.debug || (b10.debug = () => {
        }), a10.logger?.error && (b10.error = a10.logger.error), a10.logger?.warn && (b10.warn = a10.logger.warn), a10.logger?.debug && (b10.debug = a10.logger.debug), a10.logger ?? (a10.logger = b10), b10;
      }
      let fk = ["providers", "session", "csrf", "signin", "signout", "callback", "verify-request", "error", "webauthn-options"], { q: fl, l: fm } = o;
      async function fn(a10) {
        if (!("body" in a10) || !a10.body || "POST" !== a10.method) return;
        let b10 = a10.headers.get("content-type");
        return b10?.includes("application/json") ? await a10.json() : b10?.includes("application/x-www-form-urlencoded") ? Object.fromEntries(new URLSearchParams(await a10.text())) : void 0;
      }
      async function fo(a10, b10) {
        try {
          if ("GET" !== a10.method && "POST" !== a10.method) throw new cS("Only GET and POST requests are supported");
          b10.basePath ?? (b10.basePath = "/auth");
          let c10 = new URL(a10.url), { action: d10, providerId: e10 } = function(a11, b11) {
            let c11 = a11.match(RegExp(`^${b11}(.+)`));
            if (null === c11) throw new cS(`Cannot parse action at ${a11}`);
            let d11 = c11.at(-1).replace(/^\//, "").split("/").filter(Boolean);
            if (1 !== d11.length && 2 !== d11.length) throw new cS(`Cannot parse action at ${a11}`);
            let [e11, f10] = d11;
            if (!fk.includes(e11) || f10 && !["signin", "callback", "webauthn-options"].includes(e11)) throw new cS(`Cannot parse action at ${a11}`);
            return { action: e11, providerId: "undefined" == f10 ? void 0 : f10 };
          }(c10.pathname, b10.basePath);
          return { url: c10, action: d10, providerId: e10, method: a10.method, headers: Object.fromEntries(a10.headers), body: a10.body ? await fn(a10) : void 0, cookies: fl(a10.headers.get("cookie") ?? "") ?? {}, error: c10.searchParams.get("error") ?? void 0, query: Object.fromEntries(c10.searchParams) };
        } catch (d10) {
          let c10 = fj(b10);
          c10.error(d10), c10.debug("request", a10);
        }
      }
      function fp(a10) {
        let b10 = new Headers(a10.headers);
        a10.cookies?.forEach((a11) => {
          let { name: c11, value: d11, options: e10 } = a11, f10 = fm(c11, d11, e10);
          b10.has("Set-Cookie") ? b10.append("Set-Cookie", f10) : b10.set("Set-Cookie", f10);
        });
        let c10 = a10.body;
        "application/json" === b10.get("content-type") ? c10 = JSON.stringify(a10.body) : "application/x-www-form-urlencoded" === b10.get("content-type") && (c10 = new URLSearchParams(a10.body).toString());
        let d10 = new Response(c10, { headers: b10, status: a10.redirect ? 302 : a10.status ?? 200 });
        return a10.redirect && d10.headers.set("Location", a10.redirect), d10;
      }
      async function fq(a10) {
        let b10 = new TextEncoder().encode(a10);
        return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", b10))).map((a11) => a11.toString(16).padStart(2, "0")).join("").toString();
      }
      function fr(a10) {
        return Array.from(crypto.getRandomValues(new Uint8Array(a10))).reduce((a11, b10) => a11 + ("0" + b10.toString(16)).slice(-2), "");
      }
      async function fs({ options: a10, cookieValue: b10, isPost: c10, bodyValue: d10 }) {
        if (b10) {
          let [e11, f11] = b10.split("|");
          if (f11 === await fq(`${e11}${a10.secret}`)) return { csrfTokenVerified: c10 && e11 === d10, csrfToken: e11 };
        }
        let e10 = fr(32), f10 = await fq(`${e10}${a10.secret}`);
        return { cookie: `${e10}|${f10}`, csrfToken: e10 };
      }
      function ft(a10, b10) {
        if (!b10) throw new cX(`CSRF token was missing during an action ${a10}`);
      }
      function fu(a10) {
        return null !== a10 && "object" == typeof a10;
      }
      function fv(a10, ...b10) {
        if (!b10.length) return a10;
        let c10 = b10.shift();
        if (fu(a10) && fu(c10)) for (let b11 in c10) fu(c10[b11]) ? (fu(a10[b11]) || (a10[b11] = Array.isArray(c10[b11]) ? [] : {}), fv(a10[b11], c10[b11])) : void 0 !== c10[b11] && (a10[b11] = c10[b11]);
        return fv(a10, ...b10);
      }
      let fw = Symbol("skip-csrf-check"), fx = Symbol("return-type-raw"), fy = Symbol("custom-fetch"), fz = Symbol("conform-internal"), fA = (a10) => fC({ id: a10.sub ?? a10.id ?? crypto.randomUUID(), name: a10.name ?? a10.nickname ?? a10.preferred_username, email: a10.email, image: a10.picture }), fB = (a10) => fC({ access_token: a10.access_token, id_token: a10.id_token, refresh_token: a10.refresh_token, expires_at: a10.expires_at, scope: a10.scope, token_type: a10.token_type, session_state: a10.session_state });
      function fC(a10) {
        let b10 = {};
        for (let [c10, d10] of Object.entries(a10)) void 0 !== d10 && (b10[c10] = d10);
        return b10;
      }
      function fD(a10, b10) {
        if (!a10 && b10) return;
        if ("string" == typeof a10) return { url: new URL(a10) };
        let c10 = new URL(a10?.url ?? "https://authjs.dev");
        if (a10?.params != null) for (let [b11, d10] of Object.entries(a10.params)) "claims" === b11 && (d10 = JSON.stringify(d10)), c10.searchParams.set(b11, String(d10));
        return { url: c10, request: a10?.request, conform: a10?.conform, ...a10?.clientPrivateKey ? { clientPrivateKey: a10?.clientPrivateKey } : null };
      }
      let fE = { signIn: () => true, redirect: ({ url: a10, baseUrl: b10 }) => a10.startsWith("/") ? `${b10}${a10}` : new URL(a10).origin === b10 ? a10 : b10, session: ({ session: a10 }) => ({ user: { name: a10.user?.name, email: a10.user?.email, image: a10.user?.image }, expires: a10.expires?.toISOString?.() ?? a10.expires }), jwt: ({ token: a10 }) => a10 };
      async function fF({ authOptions: a10, providerId: b10, action: c10, url: d10, cookies: e10, callbackUrl: f10, csrfToken: g10, csrfDisabled: h10, isPost: i10 }) {
        var j2, k2;
        let l2 = fj(a10), { providers: m2, provider: n2 } = function(a11) {
          let { providerId: b11, config: c11 } = a11, d11 = new URL(c11.basePath ?? "/auth", a11.url.origin), e11 = c11.providers.map((a12) => {
            let b12 = "function" == typeof a12 ? a12() : a12, { options: e12, ...f12 } = b12, g11 = e12?.id ?? f12.id, h11 = fv(f12, e12, { signinUrl: `${d11}/signin/${g11}`, callbackUrl: `${d11}/callback/${g11}` });
            if ("oauth" === b12.type || "oidc" === b12.type) {
              var i11;
              let a13, b13, d12, f13;
              h11.redirectProxyUrl ?? (h11.redirectProxyUrl = e12?.redirectProxyUrl ?? c11.redirectProxyUrl);
              let g12 = ((i11 = h11).issuer && (i11.wellKnown ?? (i11.wellKnown = `${i11.issuer}/.well-known/openid-configuration`)), (a13 = fD(i11.authorization, i11.issuer)) && !a13.url?.searchParams.has("scope") && a13.url.searchParams.set("scope", "openid profile email"), b13 = fD(i11.token, i11.issuer), d12 = fD(i11.userinfo, i11.issuer), f13 = i11.checks ?? ["pkce"], i11.redirectProxyUrl && (f13.includes("state") || f13.push("state"), i11.redirectProxyUrl = `${i11.redirectProxyUrl}/callback/${i11.id}`), { ...i11, authorization: a13, token: b13, checks: f13, userinfo: d12, profile: i11.profile ?? fA, account: i11.account ?? fB });
              return g12.authorization?.url.searchParams.get("response_mode") === "form_post" && delete g12.redirectProxyUrl, g12[fy] ?? (g12[fy] = e12?.[fy]), g12;
            }
            return h11;
          }), f11 = e11.find(({ id: a12 }) => a12 === b11);
          if (b11 && !f11) {
            let a12 = e11.map((a13) => a13.id).join(", ");
            throw Error(`Provider with id "${b11}" not found. Available providers: [${a12}].`);
          }
          return { providers: e11, provider: f11 };
        }({ url: d10, providerId: b10, config: a10 }), o2 = false;
        if ((n2?.type === "oauth" || n2?.type === "oidc") && n2.redirectProxyUrl) try {
          o2 = new URL(n2.redirectProxyUrl).origin === d10.origin;
        } catch {
          throw TypeError(`redirectProxyUrl must be a valid URL. Received: ${n2.redirectProxyUrl}`);
        }
        let p2 = { debug: false, pages: {}, theme: { colorScheme: "auto", logo: "", brandColor: "", buttonText: "" }, ...a10, url: d10, action: c10, provider: n2, cookies: fv(ct(a10.useSecureCookies ?? "https:" === d10.protocol), a10.cookies), providers: m2, session: { strategy: a10.adapter ? "database" : "jwt", maxAge: 2592e3, updateAge: 86400, generateSessionToken: () => crypto.randomUUID(), ...a10.session }, jwt: { secret: a10.secret, maxAge: a10.session?.maxAge ?? 2592e3, encode: fc, decode: fd, ...a10.jwt }, events: (j2 = a10.events ?? {}, k2 = l2, Object.keys(j2).reduce((a11, b11) => (a11[b11] = async (...a12) => {
          try {
            let c11 = j2[b11];
            return await c11(...a12);
          } catch (a13) {
            k2.error(new cB(a13));
          }
        }, a11), {})), adapter: function(a11, b11) {
          if (a11) return Object.keys(a11).reduce((c11, d11) => (c11[d11] = async (...c12) => {
            try {
              b11.debug(`adapter_${d11}`, { args: c12 });
              let e11 = a11[d11];
              return await e11(...c12);
            } catch (c13) {
              let a12 = new cx(c13);
              throw b11.error(a12), a12;
            }
          }, c11), {});
        }(a10.adapter, l2), callbacks: { ...fE, ...a10.callbacks }, logger: l2, callbackUrl: d10.origin, isOnRedirectProxy: o2, experimental: { ...a10.experimental } }, q2 = [];
        if (h10) p2.csrfTokenVerified = true;
        else {
          let { csrfToken: a11, cookie: b11, csrfTokenVerified: c11 } = await fs({ options: p2, cookieValue: e10?.[p2.cookies.csrfToken.name], isPost: i10, bodyValue: g10 });
          p2.csrfToken = a11, p2.csrfTokenVerified = c11, b11 && q2.push({ name: p2.cookies.csrfToken.name, value: b11, options: p2.cookies.csrfToken.options });
        }
        let { callbackUrl: r2, callbackUrlCookie: s2 } = await ff({ options: p2, cookieValue: e10?.[p2.cookies.callbackUrl.name], paramValue: f10 });
        return p2.callbackUrl = r2, s2 && q2.push({ name: p2.cookies.callbackUrl.name, value: s2, options: p2.cookies.callbackUrl.options }), { options: p2, cookies: q2 };
      }
      var fG, fH, fI, fJ, fK, fL, fM, fN, fO, fP, fQ, fR, fS, fT, fU, fV, fW, fX, fY, fZ, f$, f_, f0, f1, f2, f3, f4, f5, f6, f7, f8, f9 = {}, ga = [], gb = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, gc = Array.isArray;
      function gd(a10, b10) {
        for (var c10 in b10) a10[c10] = b10[c10];
        return a10;
      }
      function ge(a10) {
        a10 && a10.parentNode && a10.parentNode.removeChild(a10);
      }
      function gf(a10, b10, c10, d10, e10) {
        var f10 = { type: a10, props: b10, key: c10, ref: d10, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, constructor: void 0, __v: null == e10 ? ++f1 : e10, __i: -1, __u: 0 };
        return null == e10 && null != f0.vnode && f0.vnode(f10), f10;
      }
      function gg(a10) {
        return a10.children;
      }
      function gh(a10, b10) {
        this.props = a10, this.context = b10;
      }
      function gi(a10, b10) {
        if (null == b10) return a10.__ ? gi(a10.__, a10.__i + 1) : null;
        for (var c10; b10 < a10.__k.length; b10++) if (null != (c10 = a10.__k[b10]) && null != c10.__e) return c10.__e;
        return "function" == typeof a10.type ? gi(a10) : null;
      }
      function gj(a10) {
        (!a10.__d && (a10.__d = true) && f2.push(a10) && !gk.__r++ || f3 !== f0.debounceRendering) && ((f3 = f0.debounceRendering) || f4)(gk);
      }
      function gk() {
        var a10, b10, c10, d10, e10, f10, g10, h10;
        for (f2.sort(f5); a10 = f2.shift(); ) a10.__d && (b10 = f2.length, d10 = void 0, f10 = (e10 = (c10 = a10).__v).__e, g10 = [], h10 = [], c10.__P && ((d10 = gd({}, e10)).__v = e10.__v + 1, f0.vnode && f0.vnode(d10), gp(c10.__P, d10, e10, c10.__n, c10.__P.namespaceURI, 32 & e10.__u ? [f10] : null, g10, null == f10 ? gi(e10) : f10, !!(32 & e10.__u), h10), d10.__v = e10.__v, d10.__.__k[d10.__i] = d10, function(a11, b11, c11) {
          b11.__d = void 0;
          for (var d11 = 0; d11 < c11.length; d11++) gq(c11[d11], c11[++d11], c11[++d11]);
          f0.__c && f0.__c(b11, a11), a11.some(function(b12) {
            try {
              a11 = b12.__h, b12.__h = [], a11.some(function(a12) {
                a12.call(b12);
              });
            } catch (a12) {
              f0.__e(a12, b12.__v);
            }
          });
        }(g10, d10, h10), d10.__e != f10 && function a11(b11) {
          var c11, d11;
          if (null != (b11 = b11.__) && null != b11.__c) {
            for (b11.__e = b11.__c.base = null, c11 = 0; c11 < b11.__k.length; c11++) if (null != (d11 = b11.__k[c11]) && null != d11.__e) {
              b11.__e = b11.__c.base = d11.__e;
              break;
            }
            return a11(b11);
          }
        }(d10)), f2.length > b10 && f2.sort(f5));
        gk.__r = 0;
      }
      function gl(a10, b10, c10, d10, e10, f10, g10, h10, i10, j2, k2) {
        var l2, m2, n2, o2, p2, q2 = d10 && d10.__k || ga, r2 = b10.length;
        for (c10.__d = i10, function(a11, b11, c11) {
          var d11, e11, f11, g11, h11, i11 = b11.length, j3 = c11.length, k3 = j3, l3 = 0;
          for (a11.__k = [], d11 = 0; d11 < i11; d11++) null != (e11 = b11[d11]) && "boolean" != typeof e11 && "function" != typeof e11 ? (g11 = d11 + l3, (e11 = a11.__k[d11] = "string" == typeof e11 || "number" == typeof e11 || "bigint" == typeof e11 || e11.constructor == String ? gf(null, e11, null, null, null) : gc(e11) ? gf(gg, { children: e11 }, null, null, null) : void 0 === e11.constructor && e11.__b > 0 ? gf(e11.type, e11.props, e11.key, e11.ref ? e11.ref : null, e11.__v) : e11).__ = a11, e11.__b = a11.__b + 1, f11 = null, -1 !== (h11 = e11.__i = function(a12, b12, c12, d12) {
            var e12 = a12.key, f12 = a12.type, g12 = c12 - 1, h12 = c12 + 1, i12 = b12[c12];
            if (null === i12 || i12 && e12 == i12.key && f12 === i12.type && 0 == (131072 & i12.__u)) return c12;
            if (d12 > +(null != i12 && 0 == (131072 & i12.__u))) for (; g12 >= 0 || h12 < b12.length; ) {
              if (g12 >= 0) {
                if ((i12 = b12[g12]) && 0 == (131072 & i12.__u) && e12 == i12.key && f12 === i12.type) return g12;
                g12--;
              }
              if (h12 < b12.length) {
                if ((i12 = b12[h12]) && 0 == (131072 & i12.__u) && e12 == i12.key && f12 === i12.type) return h12;
                h12++;
              }
            }
            return -1;
          }(e11, c11, g11, k3)) && (k3--, (f11 = c11[h11]) && (f11.__u |= 131072)), null == f11 || null === f11.__v ? (-1 == h11 && l3--, "function" != typeof e11.type && (e11.__u |= 65536)) : h11 !== g11 && (h11 == g11 - 1 ? l3-- : h11 == g11 + 1 ? l3++ : (h11 > g11 ? l3-- : l3++, e11.__u |= 65536))) : e11 = a11.__k[d11] = null;
          if (k3) for (d11 = 0; d11 < j3; d11++) null != (f11 = c11[d11]) && 0 == (131072 & f11.__u) && (f11.__e == a11.__d && (a11.__d = gi(f11)), function a12(b12, c12, d12) {
            var e12, f12;
            if (f0.unmount && f0.unmount(b12), (e12 = b12.ref) && (e12.current && e12.current !== b12.__e || gq(e12, null, c12)), null != (e12 = b12.__c)) {
              if (e12.componentWillUnmount) try {
                e12.componentWillUnmount();
              } catch (a13) {
                f0.__e(a13, c12);
              }
              e12.base = e12.__P = null;
            }
            if (e12 = b12.__k) for (f12 = 0; f12 < e12.length; f12++) e12[f12] && a12(e12[f12], c12, d12 || "function" != typeof b12.type);
            d12 || ge(b12.__e), b12.__c = b12.__ = b12.__e = b12.__d = void 0;
          }(f11, f11));
        }(c10, b10, q2), i10 = c10.__d, l2 = 0; l2 < r2; l2++) null != (n2 = c10.__k[l2]) && (m2 = -1 === n2.__i ? f9 : q2[n2.__i] || f9, n2.__i = l2, gp(a10, n2, m2, e10, f10, g10, h10, i10, j2, k2), o2 = n2.__e, n2.ref && m2.ref != n2.ref && (m2.ref && gq(m2.ref, null, n2), k2.push(n2.ref, n2.__c || o2, n2)), null == p2 && null != o2 && (p2 = o2), 65536 & n2.__u || m2.__k === n2.__k ? i10 = function a11(b11, c11, d11) {
          var e11, f11;
          if ("function" == typeof b11.type) {
            for (e11 = b11.__k, f11 = 0; e11 && f11 < e11.length; f11++) e11[f11] && (e11[f11].__ = b11, c11 = a11(e11[f11], c11, d11));
            return c11;
          }
          b11.__e != c11 && (c11 && b11.type && !d11.contains(c11) && (c11 = gi(b11)), d11.insertBefore(b11.__e, c11 || null), c11 = b11.__e);
          do
            c11 = c11 && c11.nextSibling;
          while (null != c11 && 8 === c11.nodeType);
          return c11;
        }(n2, i10, a10) : "function" == typeof n2.type && void 0 !== n2.__d ? i10 = n2.__d : o2 && (i10 = o2.nextSibling), n2.__d = void 0, n2.__u &= -196609);
        c10.__d = i10, c10.__e = p2;
      }
      function gm(a10, b10, c10) {
        "-" === b10[0] ? a10.setProperty(b10, null == c10 ? "" : c10) : a10[b10] = null == c10 ? "" : "number" != typeof c10 || gb.test(b10) ? c10 : c10 + "px";
      }
      function gn(a10, b10, c10, d10, e10) {
        var f10;
        a: if ("style" === b10) if ("string" == typeof c10) a10.style.cssText = c10;
        else {
          if ("string" == typeof d10 && (a10.style.cssText = d10 = ""), d10) for (b10 in d10) c10 && b10 in c10 || gm(a10.style, b10, "");
          if (c10) for (b10 in c10) d10 && c10[b10] === d10[b10] || gm(a10.style, b10, c10[b10]);
        }
        else if ("o" === b10[0] && "n" === b10[1]) f10 = b10 !== (b10 = b10.replace(/(PointerCapture)$|Capture$/i, "$1")), b10 = b10.toLowerCase() in a10 || "onFocusOut" === b10 || "onFocusIn" === b10 ? b10.toLowerCase().slice(2) : b10.slice(2), a10.l || (a10.l = {}), a10.l[b10 + f10] = c10, c10 ? d10 ? c10.u = d10.u : (c10.u = f6, a10.addEventListener(b10, f10 ? f8 : f7, f10)) : a10.removeEventListener(b10, f10 ? f8 : f7, f10);
        else {
          if ("http://www.w3.org/2000/svg" == e10) b10 = b10.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
          else if ("width" != b10 && "height" != b10 && "href" != b10 && "list" != b10 && "form" != b10 && "tabIndex" != b10 && "download" != b10 && "rowSpan" != b10 && "colSpan" != b10 && "role" != b10 && "popover" != b10 && b10 in a10) try {
            a10[b10] = null == c10 ? "" : c10;
            break a;
          } catch (a11) {
          }
          "function" == typeof c10 || (null == c10 || false === c10 && "-" !== b10[4] ? a10.removeAttribute(b10) : a10.setAttribute(b10, "popover" == b10 && 1 == c10 ? "" : c10));
        }
      }
      function go(a10) {
        return function(b10) {
          if (this.l) {
            var c10 = this.l[b10.type + a10];
            if (null == b10.t) b10.t = f6++;
            else if (b10.t < c10.u) return;
            return c10(f0.event ? f0.event(b10) : b10);
          }
        };
      }
      function gp(a10, b10, c10, d10, e10, f10, g10, h10, i10, j2) {
        var k2, l2, m2, n2, o2, p2, q2, r2, s2, t2, u2, v2, w2, x2, y2, z2, A2 = b10.type;
        if (void 0 !== b10.constructor) return null;
        128 & c10.__u && (i10 = !!(32 & c10.__u), f10 = [h10 = b10.__e = c10.__e]), (k2 = f0.__b) && k2(b10);
        a: if ("function" == typeof A2) try {
          if (r2 = b10.props, s2 = "prototype" in A2 && A2.prototype.render, t2 = (k2 = A2.contextType) && d10[k2.__c], u2 = k2 ? t2 ? t2.props.value : k2.__ : d10, c10.__c ? q2 = (l2 = b10.__c = c10.__c).__ = l2.__E : (s2 ? b10.__c = l2 = new A2(r2, u2) : (b10.__c = l2 = new gh(r2, u2), l2.constructor = A2, l2.render = gr), t2 && t2.sub(l2), l2.props = r2, l2.state || (l2.state = {}), l2.context = u2, l2.__n = d10, m2 = l2.__d = true, l2.__h = [], l2._sb = []), s2 && null == l2.__s && (l2.__s = l2.state), s2 && null != A2.getDerivedStateFromProps && (l2.__s == l2.state && (l2.__s = gd({}, l2.__s)), gd(l2.__s, A2.getDerivedStateFromProps(r2, l2.__s))), n2 = l2.props, o2 = l2.state, l2.__v = b10, m2) s2 && null == A2.getDerivedStateFromProps && null != l2.componentWillMount && l2.componentWillMount(), s2 && null != l2.componentDidMount && l2.__h.push(l2.componentDidMount);
          else {
            if (s2 && null == A2.getDerivedStateFromProps && r2 !== n2 && null != l2.componentWillReceiveProps && l2.componentWillReceiveProps(r2, u2), !l2.__e && (null != l2.shouldComponentUpdate && false === l2.shouldComponentUpdate(r2, l2.__s, u2) || b10.__v === c10.__v)) {
              for (b10.__v !== c10.__v && (l2.props = r2, l2.state = l2.__s, l2.__d = false), b10.__e = c10.__e, b10.__k = c10.__k, b10.__k.some(function(a11) {
                a11 && (a11.__ = b10);
              }), v2 = 0; v2 < l2._sb.length; v2++) l2.__h.push(l2._sb[v2]);
              l2._sb = [], l2.__h.length && g10.push(l2);
              break a;
            }
            null != l2.componentWillUpdate && l2.componentWillUpdate(r2, l2.__s, u2), s2 && null != l2.componentDidUpdate && l2.__h.push(function() {
              l2.componentDidUpdate(n2, o2, p2);
            });
          }
          if (l2.context = u2, l2.props = r2, l2.__P = a10, l2.__e = false, w2 = f0.__r, x2 = 0, s2) {
            for (l2.state = l2.__s, l2.__d = false, w2 && w2(b10), k2 = l2.render(l2.props, l2.state, l2.context), y2 = 0; y2 < l2._sb.length; y2++) l2.__h.push(l2._sb[y2]);
            l2._sb = [];
          } else do
            l2.__d = false, w2 && w2(b10), k2 = l2.render(l2.props, l2.state, l2.context), l2.state = l2.__s;
          while (l2.__d && ++x2 < 25);
          l2.state = l2.__s, null != l2.getChildContext && (d10 = gd(gd({}, d10), l2.getChildContext())), s2 && !m2 && null != l2.getSnapshotBeforeUpdate && (p2 = l2.getSnapshotBeforeUpdate(n2, o2)), gl(a10, gc(z2 = null != k2 && k2.type === gg && null == k2.key ? k2.props.children : k2) ? z2 : [z2], b10, c10, d10, e10, f10, g10, h10, i10, j2), l2.base = b10.__e, b10.__u &= -161, l2.__h.length && g10.push(l2), q2 && (l2.__E = l2.__ = null);
        } catch (a11) {
          if (b10.__v = null, i10 || null != f10) {
            for (b10.__u |= i10 ? 160 : 128; h10 && 8 === h10.nodeType && h10.nextSibling; ) h10 = h10.nextSibling;
            f10[f10.indexOf(h10)] = null, b10.__e = h10;
          } else b10.__e = c10.__e, b10.__k = c10.__k;
          f0.__e(a11, b10, c10);
        }
        else null == f10 && b10.__v === c10.__v ? (b10.__k = c10.__k, b10.__e = c10.__e) : b10.__e = function(a11, b11, c11, d11, e11, f11, g11, h11, i11) {
          var j3, k3, l3, m3, n3, o3, p3, q3 = c11.props, r3 = b11.props, s3 = b11.type;
          if ("svg" === s3 ? e11 = "http://www.w3.org/2000/svg" : "math" === s3 ? e11 = "http://www.w3.org/1998/Math/MathML" : e11 || (e11 = "http://www.w3.org/1999/xhtml"), null != f11) {
            for (j3 = 0; j3 < f11.length; j3++) if ((n3 = f11[j3]) && "setAttribute" in n3 == !!s3 && (s3 ? n3.localName === s3 : 3 === n3.nodeType)) {
              a11 = n3, f11[j3] = null;
              break;
            }
          }
          if (null == a11) {
            if (null === s3) return document.createTextNode(r3);
            a11 = document.createElementNS(e11, s3, r3.is && r3), h11 && (f0.__m && f0.__m(b11, f11), h11 = false), f11 = null;
          }
          if (null === s3) q3 === r3 || h11 && a11.data === r3 || (a11.data = r3);
          else {
            if (f11 = f11 && f_.call(a11.childNodes), q3 = c11.props || f9, !h11 && null != f11) for (q3 = {}, j3 = 0; j3 < a11.attributes.length; j3++) q3[(n3 = a11.attributes[j3]).name] = n3.value;
            for (j3 in q3) if (n3 = q3[j3], "children" == j3) ;
            else if ("dangerouslySetInnerHTML" == j3) l3 = n3;
            else if (!(j3 in r3)) {
              if ("value" == j3 && "defaultValue" in r3 || "checked" == j3 && "defaultChecked" in r3) continue;
              gn(a11, j3, null, n3, e11);
            }
            for (j3 in r3) n3 = r3[j3], "children" == j3 ? m3 = n3 : "dangerouslySetInnerHTML" == j3 ? k3 = n3 : "value" == j3 ? o3 = n3 : "checked" == j3 ? p3 = n3 : h11 && "function" != typeof n3 || q3[j3] === n3 || gn(a11, j3, n3, q3[j3], e11);
            if (k3) h11 || l3 && (k3.__html === l3.__html || k3.__html === a11.innerHTML) || (a11.innerHTML = k3.__html), b11.__k = [];
            else if (l3 && (a11.innerHTML = ""), gl(a11, gc(m3) ? m3 : [m3], b11, c11, d11, "foreignObject" === s3 ? "http://www.w3.org/1999/xhtml" : e11, f11, g11, f11 ? f11[0] : c11.__k && gi(c11, 0), h11, i11), null != f11) for (j3 = f11.length; j3--; ) ge(f11[j3]);
            h11 || (j3 = "value", "progress" === s3 && null == o3 ? a11.removeAttribute("value") : void 0 === o3 || o3 === a11[j3] && ("progress" !== s3 || o3) && ("option" !== s3 || o3 === q3[j3]) || gn(a11, j3, o3, q3[j3], e11), j3 = "checked", void 0 !== p3 && p3 !== a11[j3] && gn(a11, j3, p3, q3[j3], e11));
          }
          return a11;
        }(c10.__e, b10, c10, d10, e10, f10, g10, i10, j2);
        (k2 = f0.diffed) && k2(b10);
      }
      function gq(a10, b10, c10) {
        try {
          if ("function" == typeof a10) {
            var d10 = "function" == typeof a10.__u;
            d10 && a10.__u(), d10 && null == b10 || (a10.__u = a10(b10));
          } else a10.current = b10;
        } catch (a11) {
          f0.__e(a11, c10);
        }
      }
      function gr(a10, b10, c10) {
        return this.constructor(a10, c10);
      }
      f_ = ga.slice, f0 = { __e: function(a10, b10, c10, d10) {
        for (var e10, f10, g10; b10 = b10.__; ) if ((e10 = b10.__c) && !e10.__) try {
          if ((f10 = e10.constructor) && null != f10.getDerivedStateFromError && (e10.setState(f10.getDerivedStateFromError(a10)), g10 = e10.__d), null != e10.componentDidCatch && (e10.componentDidCatch(a10, d10 || {}), g10 = e10.__d), g10) return e10.__E = e10;
        } catch (b11) {
          a10 = b11;
        }
        throw a10;
      } }, f1 = 0, gh.prototype.setState = function(a10, b10) {
        var c10;
        c10 = null != this.__s && this.__s !== this.state ? this.__s : this.__s = gd({}, this.state), "function" == typeof a10 && (a10 = a10(gd({}, c10), this.props)), a10 && gd(c10, a10), null != a10 && this.__v && (b10 && this._sb.push(b10), gj(this));
      }, gh.prototype.forceUpdate = function(a10) {
        this.__v && (this.__e = true, a10 && this.__h.push(a10), gj(this));
      }, gh.prototype.render = gg, f2 = [], f4 = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, f5 = function(a10, b10) {
        return a10.__v.__b - b10.__v.__b;
      }, gk.__r = 0, f6 = 0, f7 = go(false), f8 = go(true);
      var gs = /[\s\n\\/='"\0<>]/, gt = /^(xlink|xmlns|xml)([A-Z])/, gu = /^accessK|^auto[A-Z]|^cell|^ch|^col|cont|cross|dateT|encT|form[A-Z]|frame|hrefL|inputM|maxL|minL|noV|playsI|popoverT|readO|rowS|src[A-Z]|tabI|useM|item[A-Z]/, gv = /^ac|^ali|arabic|basel|cap|clipPath$|clipRule$|color|dominant|enable|fill|flood|font|glyph[^R]|horiz|image|letter|lighting|marker[^WUH]|overline|panose|pointe|paint|rendering|shape|stop|strikethrough|stroke|text[^L]|transform|underline|unicode|units|^v[^i]|^w|^xH/, gw = /* @__PURE__ */ new Set(["draggable", "spellcheck"]), gx = /["&<]/;
      function gy(a10) {
        if (0 === a10.length || false === gx.test(a10)) return a10;
        for (var b10 = 0, c10 = 0, d10 = "", e10 = ""; c10 < a10.length; c10++) {
          switch (a10.charCodeAt(c10)) {
            case 34:
              e10 = "&quot;";
              break;
            case 38:
              e10 = "&amp;";
              break;
            case 60:
              e10 = "&lt;";
              break;
            default:
              continue;
          }
          c10 !== b10 && (d10 += a10.slice(b10, c10)), d10 += e10, b10 = c10 + 1;
        }
        return c10 !== b10 && (d10 += a10.slice(b10, c10)), d10;
      }
      var gz = {}, gA = /* @__PURE__ */ new Set(["animation-iteration-count", "border-image-outset", "border-image-slice", "border-image-width", "box-flex", "box-flex-group", "box-ordinal-group", "column-count", "fill-opacity", "flex", "flex-grow", "flex-negative", "flex-order", "flex-positive", "flex-shrink", "flood-opacity", "font-weight", "grid-column", "grid-row", "line-clamp", "line-height", "opacity", "order", "orphans", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-miterlimit", "stroke-opacity", "stroke-width", "tab-size", "widows", "z-index", "zoom"]), gB = /[A-Z]/g;
      function gC() {
        this.__d = true;
      }
      var gD, gE, gF, gG, gH = {}, gI = [], gJ = Array.isArray, gK = Object.assign;
      function gL(a10, b10) {
        var c10, d10 = a10.type, e10 = true;
        return a10.__c ? (e10 = false, (c10 = a10.__c).state = c10.__s) : c10 = new d10(a10.props, b10), a10.__c = c10, c10.__v = a10, c10.props = a10.props, c10.context = b10, c10.__d = true, null == c10.state && (c10.state = gH), null == c10.__s && (c10.__s = c10.state), d10.getDerivedStateFromProps ? c10.state = gK({}, c10.state, d10.getDerivedStateFromProps(c10.props, c10.state)) : e10 && c10.componentWillMount ? (c10.componentWillMount(), c10.state = c10.__s !== c10.state ? c10.__s : c10.state) : !e10 && c10.componentWillUpdate && c10.componentWillUpdate(), gF && gF(a10), c10.render(c10.props, c10.state, b10);
      }
      var gM = /* @__PURE__ */ new Set(["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"]), gN = 0;
      function gO(a10, b10, c10, d10, e10, f10) {
        b10 || (b10 = {});
        var g10, h10, i10 = b10;
        "ref" in b10 && (g10 = b10.ref, delete b10.ref);
        var j2 = { type: a10, props: i10, key: c10, ref: g10, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, constructor: void 0, __v: --gN, __i: -1, __u: 0, __source: e10, __self: f10 };
        if ("function" == typeof a10 && (g10 = a10.defaultProps)) for (h10 in g10) void 0 === i10[h10] && (i10[h10] = g10[h10]);
        return f0.vnode && f0.vnode(j2), j2;
      }
      async function gP(a10, b10) {
        let c10 = window.SimpleWebAuthnBrowser;
        async function d10(c11) {
          let d11 = new URL(`${a10}/webauthn-options/${b10}`);
          c11 && d11.searchParams.append("action", c11), f10().forEach((a11) => {
            d11.searchParams.append(a11.name, a11.value);
          });
          let e11 = await fetch(d11);
          return e11.ok ? e11.json() : void console.error("Failed to fetch options", e11);
        }
        function e10() {
          let a11 = `#${b10}-form`, c11 = document.querySelector(a11);
          if (!c11) throw Error(`Form '${a11}' not found`);
          return c11;
        }
        function f10() {
          return Array.from(e10().querySelectorAll("input[data-form-field]"));
        }
        async function g10(a11, b11) {
          let c11 = e10();
          if (a11) {
            let b12 = document.createElement("input");
            b12.type = "hidden", b12.name = "action", b12.value = a11, c11.appendChild(b12);
          }
          if (b11) {
            let a12 = document.createElement("input");
            a12.type = "hidden", a12.name = "data", a12.value = JSON.stringify(b11), c11.appendChild(a12);
          }
          return c11.submit();
        }
        async function h10(a11, b11) {
          let d11 = await c10.startAuthentication(a11, b11);
          return await g10("authenticate", d11);
        }
        async function i10(a11) {
          f10().forEach((a12) => {
            if (a12.required && !a12.value) throw Error(`Missing required field: ${a12.name}`);
          });
          let b11 = await c10.startRegistration(a11);
          return await g10("register", b11);
        }
        async function j2() {
          if (!c10.browserSupportsWebAuthnAutofill()) return;
          let a11 = await d10("authenticate");
          if (!a11) return void console.error("Failed to fetch option for autofill authentication");
          try {
            await h10(a11.options, true);
          } catch (a12) {
            console.error(a12);
          }
        }
        (async function() {
          let a11 = e10();
          if (!c10.browserSupportsWebAuthn()) {
            a11.style.display = "none";
            return;
          }
          a11 && a11.addEventListener("submit", async (a12) => {
            a12.preventDefault();
            let b11 = await d10(void 0);
            if (!b11) return void console.error("Failed to fetch options for form submission");
            if ("authenticate" === b11.action) try {
              await h10(b11.options, false);
            } catch (a13) {
              console.error(a13);
            }
            else if ("register" === b11.action) try {
              await i10(b11.options);
            } catch (a13) {
              console.error(a13);
            }
          });
        })(), j2();
      }
      let gQ = { default: "Unable to sign in.", Signin: "Try signing in with a different account.", OAuthSignin: "Try signing in with a different account.", OAuthCallbackError: "Try signing in with a different account.", OAuthCreateAccount: "Try signing in with a different account.", EmailCreateAccount: "Try signing in with a different account.", Callback: "Try signing in with a different account.", OAuthAccountNotLinked: "To confirm your identity, sign in with the same account you used originally.", EmailSignin: "The e-mail could not be sent.", CredentialsSignin: "Sign in failed. Check the details you provided are correct.", SessionRequired: "Please sign in to access this page." }, gR = `:root {
  --border-width: 1px;
  --border-radius: 0.5rem;
  --color-error: #c94b4b;
  --color-info: #157efb;
  --color-info-hover: #0f6ddb;
  --color-info-text: #fff;
}

.__next-auth-theme-auto,
.__next-auth-theme-light {
  --color-background: #ececec;
  --color-background-hover: rgba(236, 236, 236, 0.8);
  --color-background-card: #fff;
  --color-text: #000;
  --color-primary: #444;
  --color-control-border: #bbb;
  --color-button-active-background: #f9f9f9;
  --color-button-active-border: #aaa;
  --color-separator: #ccc;
  --provider-bg: #fff;
  --provider-bg-hover: color-mix(
    in srgb,
    var(--provider-brand-color) 30%,
    #fff
  );
}

.__next-auth-theme-dark {
  --color-background: #161b22;
  --color-background-hover: rgba(22, 27, 34, 0.8);
  --color-background-card: #0d1117;
  --color-text: #fff;
  --color-primary: #ccc;
  --color-control-border: #555;
  --color-button-active-background: #060606;
  --color-button-active-border: #666;
  --color-separator: #444;
  --provider-bg: #161b22;
  --provider-bg-hover: color-mix(
    in srgb,
    var(--provider-brand-color) 30%,
    #000
  );
}

.__next-auth-theme-dark img[src$="42-school.svg"],
  .__next-auth-theme-dark img[src$="apple.svg"],
  .__next-auth-theme-dark img[src$="boxyhq-saml.svg"],
  .__next-auth-theme-dark img[src$="eveonline.svg"],
  .__next-auth-theme-dark img[src$="github.svg"],
  .__next-auth-theme-dark img[src$="mailchimp.svg"],
  .__next-auth-theme-dark img[src$="medium.svg"],
  .__next-auth-theme-dark img[src$="okta.svg"],
  .__next-auth-theme-dark img[src$="patreon.svg"],
  .__next-auth-theme-dark img[src$="ping-id.svg"],
  .__next-auth-theme-dark img[src$="roblox.svg"],
  .__next-auth-theme-dark img[src$="threads.svg"],
  .__next-auth-theme-dark img[src$="wikimedia.svg"] {
    filter: invert(1);
  }

.__next-auth-theme-dark #submitButton {
    background-color: var(--provider-bg, var(--color-info));
  }

@media (prefers-color-scheme: dark) {
  .__next-auth-theme-auto {
    --color-background: #161b22;
    --color-background-hover: rgba(22, 27, 34, 0.8);
    --color-background-card: #0d1117;
    --color-text: #fff;
    --color-primary: #ccc;
    --color-control-border: #555;
    --color-button-active-background: #060606;
    --color-button-active-border: #666;
    --color-separator: #444;
    --provider-bg: #161b22;
    --provider-bg-hover: color-mix(
      in srgb,
      var(--provider-brand-color) 30%,
      #000
    );
  }
    .__next-auth-theme-auto img[src$="42-school.svg"],
    .__next-auth-theme-auto img[src$="apple.svg"],
    .__next-auth-theme-auto img[src$="boxyhq-saml.svg"],
    .__next-auth-theme-auto img[src$="eveonline.svg"],
    .__next-auth-theme-auto img[src$="github.svg"],
    .__next-auth-theme-auto img[src$="mailchimp.svg"],
    .__next-auth-theme-auto img[src$="medium.svg"],
    .__next-auth-theme-auto img[src$="okta.svg"],
    .__next-auth-theme-auto img[src$="patreon.svg"],
    .__next-auth-theme-auto img[src$="ping-id.svg"],
    .__next-auth-theme-auto img[src$="roblox.svg"],
    .__next-auth-theme-auto img[src$="threads.svg"],
    .__next-auth-theme-auto img[src$="wikimedia.svg"] {
      filter: invert(1);
    }
    .__next-auth-theme-auto #submitButton {
      background-color: var(--provider-bg, var(--color-info));
    }
}

html {
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: inherit;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--color-background);
  margin: 0;
  padding: 0;
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    "Noto Sans",
    sans-serif,
    "Apple Color Emoji",
    "Segoe UI Emoji",
    "Segoe UI Symbol",
    "Noto Color Emoji";
}

h1 {
  margin-bottom: 1.5rem;
  padding: 0 1rem;
  font-weight: 400;
  color: var(--color-text);
}

p {
  margin-bottom: 1.5rem;
  padding: 0 1rem;
  color: var(--color-text);
}

form {
  margin: 0;
  padding: 0;
}

label {
  font-weight: 500;
  text-align: left;
  margin-bottom: 0.25rem;
  display: block;
  color: var(--color-text);
}

input[type] {
  box-sizing: border-box;
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  border: var(--border-width) solid var(--color-control-border);
  background: var(--color-background-card);
  font-size: 1rem;
  border-radius: var(--border-radius);
  color: var(--color-text);
}

p {
  font-size: 1.1rem;
  line-height: 2rem;
}

a.button {
  text-decoration: none;
  line-height: 1rem;
}

a.button:link,
  a.button:visited {
    background-color: var(--color-background);
    color: var(--color-primary);
  }

button,
a.button {
  padding: 0.75rem 1rem;
  color: var(--provider-color, var(--color-primary));
  background-color: var(--provider-bg, var(--color-background));
  border: 1px solid #00000031;
  font-size: 0.9rem;
  height: 50px;
  border-radius: var(--border-radius);
  transition: background-color 250ms ease-in-out;
  font-weight: 300;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:is(button,a.button):hover {
    background-color: var(--provider-bg-hover, var(--color-background-hover));
    cursor: pointer;
  }

:is(button,a.button):active {
    cursor: pointer;
  }

:is(button,a.button) span {
    color: var(--provider-bg);
  }

#submitButton {
  color: var(--button-text-color, var(--color-info-text));
  background-color: var(--brand-color, var(--color-info));
  width: 100%;
}

#submitButton:hover {
    background-color: var(
      --button-hover-bg,
      var(--color-info-hover)
    ) !important;
  }

a.site {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 1rem;
  line-height: 2rem;
}

a.site:hover {
    text-decoration: underline;
  }

.page {
  position: absolute;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.page > div {
    text-align: center;
  }

.error a.button {
    padding-left: 2rem;
    padding-right: 2rem;
    margin-top: 0.5rem;
  }

.error .message {
    margin-bottom: 1.5rem;
  }

.signin input[type="text"] {
    margin-left: auto;
    margin-right: auto;
    display: block;
  }

.signin hr {
    display: block;
    border: 0;
    border-top: 1px solid var(--color-separator);
    margin: 2rem auto 1rem auto;
    overflow: visible;
  }

.signin hr::before {
      content: "or";
      background: var(--color-background-card);
      color: #888;
      padding: 0 0.4rem;
      position: relative;
      top: -0.7rem;
    }

.signin .error {
    background: #f5f5f5;
    font-weight: 500;
    border-radius: 0.3rem;
    background: var(--color-error);
  }

.signin .error p {
      text-align: left;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      line-height: 1.2rem;
      color: var(--color-info-text);
    }

.signin > div,
  .signin form {
    display: block;
  }

.signin > div input[type], .signin form input[type] {
      margin-bottom: 0.5rem;
    }

.signin > div button, .signin form button {
      width: 100%;
    }

.signin .provider + .provider {
    margin-top: 1rem;
  }

.logo {
  display: inline-block;
  max-width: 150px;
  margin: 1.25rem 0;
  max-height: 70px;
}

.card {
  background-color: var(--color-background-card);
  border-radius: 1rem;
  padding: 1.25rem 2rem;
}

.card .header {
    color: var(--color-primary);
  }

.card input[type]::-moz-placeholder {
    color: color-mix(
      in srgb,
      var(--color-text) 20%,
      var(--color-button-active-background)
    );
  }

.card input[type]::placeholder {
    color: color-mix(
      in srgb,
      var(--color-text) 20%,
      var(--color-button-active-background)
    );
  }

.card input[type] {
    background: color-mix(in srgb, var(--color-background-card) 95%, black);
  }

.section-header {
  color: var(--color-text);
}

@media screen and (min-width: 450px) {
  .card {
    margin: 2rem 0;
    width: 368px;
  }
}

@media screen and (max-width: 450px) {
  .card {
    margin: 1rem 0;
    width: 343px;
  }
}
`;
      function gS({ html: a10, title: b10, status: c10, cookies: d10, theme: e10, headTags: f10 }) {
        return { cookies: d10, status: c10, headers: { "Content-Type": "text/html" }, body: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${gR}</style><title>${b10}</title>${f10 ?? ""}</head><body class="__next-auth-theme-${e10?.colorScheme ?? "auto"}"><div class="page">${function(a11) {
          var b11 = f0.__s;
          f0.__s = true, gD = f0.__b, gE = f0.diffed, gF = f0.__r, gG = f0.unmount;
          var c11 = function(a12, b12, c12) {
            var d12, e11, f11, g10 = {};
            for (f11 in b12) "key" == f11 ? d12 = b12[f11] : "ref" == f11 ? e11 = b12[f11] : g10[f11] = b12[f11];
            if (arguments.length > 2 && (g10.children = arguments.length > 3 ? f_.call(arguments, 2) : c12), "function" == typeof a12 && null != a12.defaultProps) for (f11 in a12.defaultProps) void 0 === g10[f11] && (g10[f11] = a12.defaultProps[f11]);
            return gf(a12, g10, d12, e11, null);
          }(gg, null);
          c11.__k = [a11];
          try {
            var d11 = function a12(b12, c12, d12, e11, f11, g10, h10) {
              if (null == b12 || true === b12 || false === b12 || "" === b12) return "";
              var i10 = typeof b12;
              if ("object" != i10) return "function" == i10 ? "" : "string" == i10 ? gy(b12) : b12 + "";
              if (gJ(b12)) {
                var j2, k2 = "";
                f11.__k = b12;
                for (var l2 = 0; l2 < b12.length; l2++) {
                  var m2 = b12[l2];
                  if (null != m2 && "boolean" != typeof m2) {
                    var n2, o2 = a12(m2, c12, d12, e11, f11, g10, h10);
                    "string" == typeof o2 ? k2 += o2 : (j2 || (j2 = []), k2 && j2.push(k2), k2 = "", gJ(o2) ? (n2 = j2).push.apply(n2, o2) : j2.push(o2));
                  }
                }
                return j2 ? (k2 && j2.push(k2), j2) : k2;
              }
              if (void 0 !== b12.constructor) return "";
              b12.__ = f11, gD && gD(b12);
              var p2 = b12.type, q2 = b12.props;
              if ("function" == typeof p2) {
                var r2, s2, t2, u2 = c12;
                if (p2 === gg) {
                  if ("tpl" in q2) {
                    for (var v2 = "", w2 = 0; w2 < q2.tpl.length; w2++) if (v2 += q2.tpl[w2], q2.exprs && w2 < q2.exprs.length) {
                      var x2 = q2.exprs[w2];
                      if (null == x2) continue;
                      "object" == typeof x2 && (void 0 === x2.constructor || gJ(x2)) ? v2 += a12(x2, c12, d12, e11, b12, g10, h10) : v2 += x2;
                    }
                    return v2;
                  }
                  if ("UNSTABLE_comment" in q2) return "<!--" + gy(q2.UNSTABLE_comment) + "-->";
                  s2 = q2.children;
                } else {
                  if (null != (r2 = p2.contextType)) {
                    var y2 = c12[r2.__c];
                    u2 = y2 ? y2.props.value : r2.__;
                  }
                  var z2 = p2.prototype && "function" == typeof p2.prototype.render;
                  if (z2) s2 = gL(b12, u2), t2 = b12.__c;
                  else {
                    b12.__c = t2 = { __v: b12, context: u2, props: b12.props, setState: gC, forceUpdate: gC, __d: true, __h: [] };
                    for (var A2 = 0; t2.__d && A2++ < 25; ) t2.__d = false, gF && gF(b12), s2 = p2.call(t2, q2, u2);
                    t2.__d = true;
                  }
                  if (null != t2.getChildContext && (c12 = gK({}, c12, t2.getChildContext())), z2 && f0.errorBoundaries && (p2.getDerivedStateFromError || t2.componentDidCatch)) {
                    s2 = null != s2 && s2.type === gg && null == s2.key && null == s2.props.tpl ? s2.props.children : s2;
                    try {
                      return a12(s2, c12, d12, e11, b12, g10, h10);
                    } catch (f12) {
                      return p2.getDerivedStateFromError && (t2.__s = p2.getDerivedStateFromError(f12)), t2.componentDidCatch && t2.componentDidCatch(f12, gH), t2.__d ? (s2 = gL(b12, c12), null != (t2 = b12.__c).getChildContext && (c12 = gK({}, c12, t2.getChildContext())), a12(s2 = null != s2 && s2.type === gg && null == s2.key && null == s2.props.tpl ? s2.props.children : s2, c12, d12, e11, b12, g10, h10)) : "";
                    } finally {
                      gE && gE(b12), b12.__ = null, gG && gG(b12);
                    }
                  }
                }
                s2 = null != s2 && s2.type === gg && null == s2.key && null == s2.props.tpl ? s2.props.children : s2;
                try {
                  var B2 = a12(s2, c12, d12, e11, b12, g10, h10);
                  return gE && gE(b12), b12.__ = null, f0.unmount && f0.unmount(b12), B2;
                } catch (f12) {
                  if (!g10 && h10 && h10.onError) {
                    var C2 = h10.onError(f12, b12, function(f13) {
                      return a12(f13, c12, d12, e11, b12, g10, h10);
                    });
                    if (void 0 !== C2) return C2;
                    var D2 = f0.__e;
                    return D2 && D2(f12, b12), "";
                  }
                  if (!g10 || !f12 || "function" != typeof f12.then) throw f12;
                  return f12.then(function f13() {
                    try {
                      return a12(s2, c12, d12, e11, b12, g10, h10);
                    } catch (i11) {
                      if (!i11 || "function" != typeof i11.then) throw i11;
                      return i11.then(function() {
                        return a12(s2, c12, d12, e11, b12, g10, h10);
                      }, f13);
                    }
                  });
                }
              }
              var E2, F2 = "<" + p2, G2 = "";
              for (var H2 in q2) {
                var I2 = q2[H2];
                if ("function" != typeof I2 || "class" === H2 || "className" === H2) {
                  switch (H2) {
                    case "children":
                      E2 = I2;
                      continue;
                    case "key":
                    case "ref":
                    case "__self":
                    case "__source":
                      continue;
                    case "htmlFor":
                      if ("for" in q2) continue;
                      H2 = "for";
                      break;
                    case "className":
                      if ("class" in q2) continue;
                      H2 = "class";
                      break;
                    case "defaultChecked":
                      H2 = "checked";
                      break;
                    case "defaultSelected":
                      H2 = "selected";
                      break;
                    case "defaultValue":
                    case "value":
                      switch (H2 = "value", p2) {
                        case "textarea":
                          E2 = I2;
                          continue;
                        case "select":
                          e11 = I2;
                          continue;
                        case "option":
                          e11 != I2 || "selected" in q2 || (F2 += " selected");
                      }
                      break;
                    case "dangerouslySetInnerHTML":
                      G2 = I2 && I2.__html;
                      continue;
                    case "style":
                      "object" == typeof I2 && (I2 = function(a13) {
                        var b13 = "";
                        for (var c13 in a13) {
                          var d13 = a13[c13];
                          if (null != d13 && "" !== d13) {
                            var e12 = "-" == c13[0] ? c13 : gz[c13] || (gz[c13] = c13.replace(gB, "-$&").toLowerCase()), f12 = ";";
                            "number" != typeof d13 || e12.startsWith("--") || gA.has(e12) || (f12 = "px;"), b13 = b13 + e12 + ":" + d13 + f12;
                          }
                        }
                        return b13 || void 0;
                      }(I2));
                      break;
                    case "acceptCharset":
                      H2 = "accept-charset";
                      break;
                    case "httpEquiv":
                      H2 = "http-equiv";
                      break;
                    default:
                      if (gt.test(H2)) H2 = H2.replace(gt, "$1:$2").toLowerCase();
                      else {
                        if (gs.test(H2)) continue;
                        ("-" === H2[4] || gw.has(H2)) && null != I2 ? I2 += "" : d12 ? gv.test(H2) && (H2 = "panose1" === H2 ? "panose-1" : H2.replace(/([A-Z])/g, "-$1").toLowerCase()) : gu.test(H2) && (H2 = H2.toLowerCase());
                      }
                  }
                  null != I2 && false !== I2 && (F2 = true === I2 || "" === I2 ? F2 + " " + H2 : F2 + " " + H2 + '="' + ("string" == typeof I2 ? gy(I2) : I2 + "") + '"');
                }
              }
              if (gs.test(p2)) throw Error(p2 + " is not a valid HTML tag name in " + F2 + ">");
              if (G2 || ("string" == typeof E2 ? G2 = gy(E2) : null != E2 && false !== E2 && true !== E2 && (G2 = a12(E2, c12, "svg" === p2 || "foreignObject" !== p2 && d12, e11, b12, g10, h10))), gE && gE(b12), b12.__ = null, gG && gG(b12), !G2 && gM.has(p2)) return F2 + "/>";
              var J2 = "</" + p2 + ">", K2 = F2 + ">";
              return gJ(G2) ? [K2].concat(G2, [J2]) : "string" != typeof G2 ? [K2, G2, J2] : K2 + G2 + J2;
            }(a11, gH, false, void 0, c11, false, void 0);
            return gJ(d11) ? d11.join("") : d11;
          } catch (a12) {
            if (a12.then) throw Error('Use "renderToStringAsync" for suspenseful rendering.');
            throw a12;
          } finally {
            f0.__c && f0.__c(a11, gI), f0.__s = b11, gI.length = 0;
          }
        }(a10)}</div></body></html>` };
      }
      function gT(a10) {
        let { url: b10, theme: c10, query: d10, cookies: e10, pages: f10, providers: g10 } = a10;
        return { csrf: (a11, b11, c11) => a11 ? (b11.logger.warn("csrf-disabled"), c11.push({ name: b11.cookies.csrfToken.name, value: "", options: { ...b11.cookies.csrfToken.options, maxAge: 0 } }), { status: 404, cookies: c11 }) : { headers: { "Content-Type": "application/json", "Cache-Control": "private, no-cache, no-store", Expires: "0", Pragma: "no-cache" }, body: { csrfToken: b11.csrfToken }, cookies: c11 }, providers: (a11) => ({ headers: { "Content-Type": "application/json" }, body: a11.reduce((a12, { id: b11, name: c11, type: d11, signinUrl: e11, callbackUrl: f11 }) => (a12[b11] = { id: b11, name: c11, type: d11, signinUrl: e11, callbackUrl: f11 }, a12), {}) }), signin(b11, h10) {
          if (b11) throw new cS("Unsupported action");
          if (f10?.signIn) {
            let b12 = `${f10.signIn}${f10.signIn.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl: a10.callbackUrl ?? "/" })}`;
            return h10 && (b12 = `${b12}&${new URLSearchParams({ error: h10 })}`), { redirect: b12, cookies: e10 };
          }
          let i10 = g10?.find((a11) => "webauthn" === a11.type && a11.enableConditionalUI && !!a11.simpleWebAuthnBrowserVersion), j2 = "";
          if (i10) {
            let { simpleWebAuthnBrowserVersion: a11 } = i10;
            j2 = `<script src="https://unpkg.com/@simplewebauthn/browser@${a11}/dist/bundle/index.umd.min.js" crossorigin="anonymous"></script>`;
          }
          return gS({ cookies: e10, theme: c10, html: function(a11) {
            let { csrfToken: b12, providers: c11 = [], callbackUrl: d11, theme: e11, email: f11, error: g11 } = a11;
            "u" > typeof document && e11?.brandColor && document.documentElement.style.setProperty("--brand-color", e11.brandColor), "u" > typeof document && e11?.buttonText && document.documentElement.style.setProperty("--button-text-color", e11.buttonText);
            let h11 = g11 && (gQ[g11] ?? gQ.default), i11 = c11.find((a12) => "webauthn" === a12.type && a12.enableConditionalUI)?.id;
            return gO("div", { className: "signin", children: [e11?.brandColor && gO("style", { dangerouslySetInnerHTML: { __html: `:root {--brand-color: ${e11.brandColor}}` } }), e11?.buttonText && gO("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --button-text-color: ${e11.buttonText}
        }
      ` } }), gO("div", { className: "card", children: [h11 && gO("div", { className: "error", children: gO("p", { children: h11 }) }), e11?.logo && gO("img", { src: e11.logo, alt: "Logo", className: "logo" }), c11.map((a12, e12) => {
              let g12, h12, i12;
              ("oauth" === a12.type || "oidc" === a12.type) && ({ bg: g12 = "#fff", brandColor: h12, logo: i12 = `https://authjs.dev/img/providers/${a12.id}.svg` } = a12.style ?? {});
              let j3 = h12 ?? g12 ?? "#fff";
              return gO("div", { className: "provider", children: ["oauth" === a12.type || "oidc" === a12.type ? gO("form", { action: a12.signinUrl, method: "POST", children: [gO("input", { type: "hidden", name: "csrfToken", value: b12 }), d11 && gO("input", { type: "hidden", name: "callbackUrl", value: d11 }), gO("button", { type: "submit", className: "button", style: { "--provider-brand-color": j3 }, tabIndex: 0, children: [gO("span", { style: { filter: "invert(1) grayscale(1) brightness(1.3) contrast(9000)", "mix-blend-mode": "luminosity", opacity: 0.95 }, children: ["Sign in with ", a12.name] }), i12 && gO("img", { loading: "lazy", height: 24, src: i12 })] })] }) : null, ("email" === a12.type || "credentials" === a12.type || "webauthn" === a12.type) && e12 > 0 && "email" !== c11[e12 - 1].type && "credentials" !== c11[e12 - 1].type && "webauthn" !== c11[e12 - 1].type && gO("hr", {}), "email" === a12.type && gO("form", { action: a12.signinUrl, method: "POST", children: [gO("input", { type: "hidden", name: "csrfToken", value: b12 }), gO("label", { className: "section-header", htmlFor: `input-email-for-${a12.id}-provider`, children: "Email" }), gO("input", { id: `input-email-for-${a12.id}-provider`, autoFocus: true, type: "email", name: "email", value: f11, placeholder: "email@example.com", required: true }), gO("button", { id: "submitButton", type: "submit", tabIndex: 0, children: ["Sign in with ", a12.name] })] }), "credentials" === a12.type && gO("form", { action: a12.callbackUrl, method: "POST", children: [gO("input", { type: "hidden", name: "csrfToken", value: b12 }), Object.keys(a12.credentials).map((b13) => gO("div", { children: [gO("label", { className: "section-header", htmlFor: `input-${b13}-for-${a12.id}-provider`, children: a12.credentials[b13].label ?? b13 }), gO("input", { name: b13, id: `input-${b13}-for-${a12.id}-provider`, type: a12.credentials[b13].type ?? "text", placeholder: a12.credentials[b13].placeholder ?? "", ...a12.credentials[b13] })] }, `input-group-${a12.id}`)), gO("button", { id: "submitButton", type: "submit", tabIndex: 0, children: ["Sign in with ", a12.name] })] }), "webauthn" === a12.type && gO("form", { action: a12.callbackUrl, method: "POST", id: `${a12.id}-form`, children: [gO("input", { type: "hidden", name: "csrfToken", value: b12 }), Object.keys(a12.formFields).map((b13) => gO("div", { children: [gO("label", { className: "section-header", htmlFor: `input-${b13}-for-${a12.id}-provider`, children: a12.formFields[b13].label ?? b13 }), gO("input", { name: b13, "data-form-field": true, id: `input-${b13}-for-${a12.id}-provider`, type: a12.formFields[b13].type ?? "text", placeholder: a12.formFields[b13].placeholder ?? "", ...a12.formFields[b13] })] }, `input-group-${a12.id}`)), gO("button", { id: `submitButton-${a12.id}`, type: "submit", tabIndex: 0, children: ["Sign in with ", a12.name] })] }), ("email" === a12.type || "credentials" === a12.type || "webauthn" === a12.type) && e12 + 1 < c11.length && gO("hr", {})] }, a12.id);
            })] }), i11 && gO(gg, { children: gO("script", { dangerouslySetInnerHTML: { __html: `
const currentURL = window.location.href;
const authURL = currentURL.substring(0, currentURL.lastIndexOf('/'));
(${gP})(authURL, "${i11}");
` } }) })] });
          }({ csrfToken: a10.csrfToken, providers: a10.providers?.filter((a11) => ["email", "oauth", "oidc"].includes(a11.type) || "credentials" === a11.type && a11.credentials || "webauthn" === a11.type && a11.formFields || false), callbackUrl: a10.callbackUrl, theme: a10.theme, error: h10, ...d10 }), title: "Sign In", headTags: j2 });
        }, signout: () => f10?.signOut ? { redirect: f10.signOut, cookies: e10 } : gS({ cookies: e10, theme: c10, html: function(a11) {
          let { url: b11, csrfToken: c11, theme: d11 } = a11;
          return gO("div", { className: "signout", children: [d11?.brandColor && gO("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --brand-color: ${d11.brandColor}
        }
      ` } }), d11?.buttonText && gO("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --button-text-color: ${d11.buttonText}
        }
      ` } }), gO("div", { className: "card", children: [d11?.logo && gO("img", { src: d11.logo, alt: "Logo", className: "logo" }), gO("h1", { children: "Signout" }), gO("p", { children: "Are you sure you want to sign out?" }), gO("form", { action: b11?.toString(), method: "POST", children: [gO("input", { type: "hidden", name: "csrfToken", value: c11 }), gO("button", { id: "submitButton", type: "submit", children: "Sign out" })] })] })] });
        }({ csrfToken: a10.csrfToken, url: b10, theme: c10 }), title: "Sign Out" }), verifyRequest: (a11) => f10?.verifyRequest ? { redirect: `${f10.verifyRequest}${b10?.search ?? ""}`, cookies: e10 } : gS({ cookies: e10, theme: c10, html: function(a12) {
          let { url: b11, theme: c11 } = a12;
          return gO("div", { className: "verify-request", children: [c11.brandColor && gO("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --brand-color: ${c11.brandColor}
        }
      ` } }), gO("div", { className: "card", children: [c11.logo && gO("img", { src: c11.logo, alt: "Logo", className: "logo" }), gO("h1", { children: "Check your email" }), gO("p", { children: "A sign in link has been sent to your email address." }), gO("p", { children: gO("a", { className: "site", href: b11.origin, children: b11.host }) })] })] });
        }({ url: b10, theme: c10, ...a11 }), title: "Verify Request" }), error: (a11) => f10?.error ? { redirect: `${f10.error}${f10.error.includes("?") ? "&" : "?"}error=${a11}`, cookies: e10 } : gS({ cookies: e10, theme: c10, ...function(a12) {
          let { url: b11, error: c11 = "default", theme: d11 } = a12, e11 = `${b11}/signin`, f11 = { default: { status: 200, heading: "Error", message: gO("p", { children: gO("a", { className: "site", href: b11?.origin, children: b11?.host }) }) }, Configuration: { status: 500, heading: "Server error", message: gO("div", { children: [gO("p", { children: "There is a problem with the server configuration." }), gO("p", { children: "Check the server logs for more information." })] }) }, AccessDenied: { status: 403, heading: "Access Denied", message: gO("div", { children: [gO("p", { children: "You do not have permission to sign in." }), gO("p", { children: gO("a", { className: "button", href: e11, children: "Sign in" }) })] }) }, Verification: { status: 403, heading: "Unable to sign in", message: gO("div", { children: [gO("p", { children: "The sign in link is no longer valid." }), gO("p", { children: "It may have been used already or it may have expired." })] }), signin: gO("a", { className: "button", href: e11, children: "Sign in" }) } }, { status: g11, heading: h10, message: i10, signin: j2 } = f11[c11] ?? f11.default;
          return { status: g11, html: gO("div", { className: "error", children: [d11?.brandColor && gO("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --brand-color: ${d11?.brandColor}
        }
      ` } }), gO("div", { className: "card", children: [d11?.logo && gO("img", { src: d11?.logo, alt: "Logo", className: "logo" }), gO("h1", { children: h10 }), gO("div", { className: "message", children: i10 }), j2] })] }) };
        }({ url: b10, theme: c10, error: a11 }), title: "Error" }) };
      }
      function gU(a10, b10 = Date.now()) {
        return new Date(b10 + 1e3 * a10);
      }
      async function gV(a10, b10, c10, d10) {
        if (!c10?.providerAccountId || !c10.type) throw Error("Missing or invalid provider account");
        if (!["email", "oauth", "oidc", "webauthn"].includes(c10.type)) throw Error("Provider not supported");
        let { adapter: e10, jwt: f10, events: g10, session: { strategy: h10, generateSessionToken: i10 } } = d10;
        if (!e10) return { user: b10, account: c10 };
        let j2 = c10, { createUser: k2, updateUser: l2, getUser: m2, getUserByAccount: n2, getUserByEmail: o2, linkAccount: p2, createSession: q2, getSessionAndUser: r2, deleteSession: s2 } = e10, t2 = null, u2 = null, v2 = false, w2 = "jwt" === h10;
        if (a10) if (w2) try {
          let b11 = d10.cookies.sessionToken.name;
          (t2 = await f10.decode({ ...f10, token: a10, salt: b11 })) && "sub" in t2 && t2.sub && (u2 = await m2(t2.sub));
        } catch {
        }
        else {
          let b11 = await r2(a10);
          b11 && (t2 = b11.session, u2 = b11.user);
        }
        if ("email" === j2.type) {
          let c11 = await o2(b10.email);
          return c11 ? (u2?.id !== c11.id && !w2 && a10 && await s2(a10), u2 = await l2({ id: c11.id, emailVerified: /* @__PURE__ */ new Date() }), await g10.updateUser?.({ user: u2 })) : (u2 = await k2({ ...b10, emailVerified: /* @__PURE__ */ new Date() }), await g10.createUser?.({ user: u2 }), v2 = true), { session: t2 = w2 ? {} : await q2({ sessionToken: i10(), userId: u2.id, expires: gU(d10.session.maxAge) }), user: u2, isNewUser: v2 };
        }
        if ("webauthn" === j2.type) {
          let a11 = await n2({ providerAccountId: j2.providerAccountId, provider: j2.provider });
          if (a11) {
            if (u2) {
              if (a11.id === u2.id) {
                let a12 = { ...j2, userId: u2.id };
                return { session: t2, user: u2, isNewUser: v2, account: a12 };
              }
              throw new c0("The account is already associated with another user", { provider: j2.provider });
            }
            t2 = w2 ? {} : await q2({ sessionToken: i10(), userId: a11.id, expires: gU(d10.session.maxAge) });
            let b11 = { ...j2, userId: a11.id };
            return { session: t2, user: a11, isNewUser: v2, account: b11 };
          }
          {
            if (u2) {
              await p2({ ...j2, userId: u2.id }), await g10.linkAccount?.({ user: u2, account: j2, profile: b10 });
              let a13 = { ...j2, userId: u2.id };
              return { session: t2, user: u2, isNewUser: v2, account: a13 };
            }
            if (b10.email ? await o2(b10.email) : null) throw new c0("Another account already exists with the same e-mail address", { provider: j2.provider });
            u2 = await k2({ ...b10 }), await g10.createUser?.({ user: u2 }), await p2({ ...j2, userId: u2.id }), await g10.linkAccount?.({ user: u2, account: j2, profile: b10 }), t2 = w2 ? {} : await q2({ sessionToken: i10(), userId: u2.id, expires: gU(d10.session.maxAge) });
            let a12 = { ...j2, userId: u2.id };
            return { session: t2, user: u2, isNewUser: true, account: a12 };
          }
        }
        let x2 = await n2({ providerAccountId: j2.providerAccountId, provider: j2.provider });
        if (x2) {
          if (u2) {
            if (x2.id === u2.id) return { session: t2, user: u2, isNewUser: v2 };
            throw new cL("The account is already associated with another user", { provider: j2.provider });
          }
          return { session: t2 = w2 ? {} : await q2({ sessionToken: i10(), userId: x2.id, expires: gU(d10.session.maxAge) }), user: x2, isNewUser: v2 };
        }
        {
          let { provider: a11 } = d10, { type: c11, provider: e11, providerAccountId: f11, userId: h11, ...l3 } = j2;
          if (j2 = Object.assign(a11.account(l3) ?? {}, { providerAccountId: f11, provider: e11, type: c11, userId: h11 }), u2) return await p2({ ...j2, userId: u2.id }), await g10.linkAccount?.({ user: u2, account: j2, profile: b10 }), { session: t2, user: u2, isNewUser: v2 };
          let m3 = b10.email ? await o2(b10.email) : null;
          if (m3) {
            let a12 = d10.provider;
            if (a12?.allowDangerousEmailAccountLinking) u2 = m3, v2 = false;
            else throw new cL("Another account already exists with the same e-mail address", { provider: j2.provider });
          } else u2 = await k2({ ...b10, emailVerified: null }), v2 = true;
          return await g10.createUser?.({ user: u2 }), await p2({ ...j2, userId: u2.id }), await g10.linkAccount?.({ user: u2, account: j2, profile: b10 }), { session: t2 = w2 ? {} : await q2({ sessionToken: i10(), userId: u2.id, expires: gU(d10.session.maxAge) }), user: u2, isNewUser: v2 };
        }
      }
      function gW(a10, b10) {
        if (null == a10) return false;
        try {
          return a10 instanceof b10 || Object.getPrototypeOf(a10)[Symbol.toStringTag] === b10.prototype[Symbol.toStringTag];
        } catch {
          return false;
        }
      }
      ("u" < typeof navigator || !navigator.userAgent?.startsWith?.("Mozilla/5.0 ")) && (g = "oauth4webapi/v3.8.6");
      let gX = "ERR_INVALID_ARG_VALUE", gY = "ERR_INVALID_ARG_TYPE";
      function gZ(a10, b10, c10) {
        let d10 = TypeError(a10, { cause: c10 });
        return Object.assign(d10, { code: b10 }), d10;
      }
      let g$ = Symbol(), g_ = Symbol(), g0 = Symbol(), g1 = Symbol(), g2 = Symbol(), g3 = Symbol();
      Symbol();
      let g4 = new TextEncoder(), g5 = new TextDecoder();
      function g6(a10) {
        return "string" == typeof a10 ? g4.encode(a10) : g5.decode(a10);
      }
      function g7(a10) {
        return "string" == typeof a10 ? i(a10) : h(a10);
      }
      h = Uint8Array.prototype.toBase64 ? (a10) => (a10 instanceof ArrayBuffer && (a10 = new Uint8Array(a10)), a10.toBase64({ alphabet: "base64url", omitPadding: true })) : (a10) => {
        a10 instanceof ArrayBuffer && (a10 = new Uint8Array(a10));
        let b10 = [];
        for (let c10 = 0; c10 < a10.byteLength; c10 += 32768) b10.push(String.fromCharCode.apply(null, a10.subarray(c10, c10 + 32768)));
        return btoa(b10.join("")).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      }, i = Uint8Array.fromBase64 ? (a10) => {
        try {
          return Uint8Array.fromBase64(a10, { alphabet: "base64url" });
        } catch (a11) {
          throw gZ("The input to be decoded is not correctly encoded.", gX, a11);
        }
      } : (a10) => {
        try {
          let b10 = atob(a10.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "")), c10 = new Uint8Array(b10.length);
          for (let a11 = 0; a11 < b10.length; a11++) c10[a11] = b10.charCodeAt(a11);
          return c10;
        } catch (a11) {
          throw gZ("The input to be decoded is not correctly encoded.", gX, a11);
        }
      };
      class g8 extends Error {
        code;
        constructor(a10, b10) {
          super(a10, b10), this.name = this.constructor.name, this.code = h9, Error.captureStackTrace?.(this, this.constructor);
        }
      }
      class g9 extends Error {
        code;
        constructor(a10, b10) {
          super(a10, b10), this.name = this.constructor.name, b10?.code && (this.code = b10?.code), Error.captureStackTrace?.(this, this.constructor);
        }
      }
      function ha(a10, b10, c10) {
        return new g9(a10, { code: b10, cause: c10 });
      }
      function hb(a10) {
        return !(null === a10 || "object" != typeof a10 || Array.isArray(a10));
      }
      function hc(a10) {
        gW(a10, Headers) && (a10 = Object.fromEntries(a10.entries()));
        let b10 = new Headers(a10 ?? {});
        if (g && !b10.has("user-agent") && b10.set("user-agent", g), b10.has("authorization")) throw gZ('"options.headers" must not include the "authorization" header name', gX);
        return b10;
      }
      function hd(a10, b10) {
        if (void 0 !== b10) {
          if ("function" == typeof b10 && (b10 = b10(a10.href)), !(b10 instanceof AbortSignal)) throw gZ('"options.signal" must return or be an instance of AbortSignal', gY);
          return b10;
        }
      }
      function he(a10) {
        return a10.includes("//") ? a10.replace("//", "/") : a10;
      }
      async function hf(a10, b10, c10, d10) {
        if (!(a10 instanceof URL)) throw gZ(`"${b10}" must be an instance of URL`, gY);
        hv(a10, d10?.[g$] !== true);
        let e10 = c10(new URL(a10.href)), f10 = hc(d10?.headers);
        return f10.set("accept", "application/json"), (d10?.[g1] || fetch)(e10.href, { body: void 0, headers: Object.fromEntries(f10.entries()), method: "GET", redirect: "manual", signal: hd(e10, d10?.signal) });
      }
      async function hg(a10, b10) {
        return hf(a10, "issuerIdentifier", (a11) => {
          switch (b10?.algorithm) {
            case void 0:
            case "oidc":
              a11.pathname = he(`${a11.pathname}/.well-known/openid-configuration`);
              break;
            case "oauth2":
              !function(a12, b11, c10 = false) {
                "/" === a12.pathname ? a12.pathname = b11 : a12.pathname = he(`${b11}/${c10 ? a12.pathname : a12.pathname.replace(/(\/)$/, "")}`);
              }(a11, ".well-known/oauth-authorization-server");
              break;
            default:
              throw gZ('"options.algorithm" must be "oidc" (default), or "oauth2"', gX);
          }
          return a11;
        }, b10);
      }
      function hh(a10, b10, c10, d10, e10) {
        try {
          if ("number" != typeof a10 || !Number.isFinite(a10)) throw gZ(`${c10} must be a number`, gY, e10);
          if (a10 > 0) return;
          if (b10) {
            if (0 !== a10) throw gZ(`${c10} must be a non-negative number`, gX, e10);
            return;
          }
          throw gZ(`${c10} must be a positive number`, gX, e10);
        } catch (a11) {
          if (d10) throw ha(a11.message, d10, e10);
          throw a11;
        }
      }
      function hi(a10, b10, c10, d10) {
        try {
          if ("string" != typeof a10) throw gZ(`${b10} must be a string`, gY, d10);
          if (0 === a10.length) throw gZ(`${b10} must not be empty`, gX, d10);
        } catch (a11) {
          if (c10) throw ha(a11.message, c10, d10);
          throw a11;
        }
      }
      async function hj(a10, b10) {
        if (!(a10 instanceof URL) && a10 !== ix) throw gZ('"expectedIssuerIdentifier" must be an instance of URL', gY);
        if (!gW(b10, Response)) throw gZ('"response" must be an instance of Response', gY);
        if (200 !== b10.status) throw ha('"response" is not a conform Authorization Server Metadata response (unexpected HTTP status code)', ig, b10);
        ip(b10);
        let c10 = await iw(b10);
        if (hi(c10.issuer, '"response" body "issuer" property', id, { body: c10 }), a10 !== ix && new URL(c10.issuer).href !== a10.href) throw ha('"response" body "issuer" property does not match the expected value', il, { expected: a10.href, body: c10, attribute: "issuer" });
        return c10;
      }
      function hk(a10) {
        var b10 = a10, c10 = "application/json";
        if (hM(b10) !== c10) throw function(a11, ...b11) {
          let c11 = '"response" content-type must be ';
          if (b11.length > 2) {
            let a12 = b11.pop();
            c11 += `${b11.join(", ")}, or ${a12}`;
          } else 2 === b11.length ? c11 += `${b11[0]} or ${b11[1]}` : c11 += b11[0];
          return ha(c11, ie, a11);
        }(b10, c10);
      }
      function hl() {
        return g7(crypto.getRandomValues(new Uint8Array(32)));
      }
      async function hm(a10) {
        return hi(a10, "codeVerifier"), g7(await crypto.subtle.digest("SHA-256", g6(a10)));
      }
      function hn(a10) {
        let b10 = a10?.[g_];
        return "number" == typeof b10 && Number.isFinite(b10) ? b10 : 0;
      }
      function ho(a10) {
        let b10 = a10?.[g0];
        return "number" == typeof b10 && Number.isFinite(b10) && -1 !== Math.sign(b10) ? b10 : 30;
      }
      function hp() {
        return Math.floor(Date.now() / 1e3);
      }
      function hq(a10) {
        if ("object" != typeof a10 || null === a10) throw gZ('"as" must be an object', gY);
        hi(a10.issuer, '"as.issuer"');
      }
      function hr(a10) {
        if ("object" != typeof a10 || null === a10) throw gZ('"client" must be an object', gY);
        hi(a10.client_id, '"client.client_id"');
      }
      function hs(a10, b10) {
        let c10 = hp() + hn(b10);
        return { jti: hl(), aud: a10.issuer, exp: c10 + 60, iat: c10, nbf: c10, iss: b10.client_id, sub: b10.client_id };
      }
      async function ht(a10, b10, c10) {
        if (!c10.usages.includes("sign")) throw gZ('CryptoKey instances used for signing assertions must include "sign" in their "usages"', gX);
        let d10 = `${g7(g6(JSON.stringify(a10)))}.${g7(g6(JSON.stringify(b10)))}`, e10 = g7(await crypto.subtle.sign(function(a11) {
          switch (a11.algorithm.name) {
            case "ECDSA":
              return { name: a11.algorithm.name, hash: function(a12) {
                let { algorithm: b11 } = a12;
                switch (b11.namedCurve) {
                  case "P-256":
                    return "SHA-256";
                  case "P-384":
                    return "SHA-384";
                  case "P-521":
                    return "SHA-512";
                  default:
                    throw new g8("unsupported ECDSA namedCurve", { cause: a12 });
                }
              }(a11) };
            case "RSA-PSS":
              switch (iq(a11), a11.algorithm.hash.name) {
                case "SHA-256":
                case "SHA-384":
                case "SHA-512":
                  return { name: a11.algorithm.name, saltLength: parseInt(a11.algorithm.hash.name.slice(-3), 10) >> 3 };
                default:
                  throw new g8("unsupported RSA-PSS hash name", { cause: a11 });
              }
            case "RSASSA-PKCS1-v1_5":
              return iq(a11), a11.algorithm.name;
            case "ML-DSA-44":
            case "ML-DSA-65":
            case "ML-DSA-87":
            case "Ed25519":
              return a11.algorithm.name;
          }
          throw new g8("unsupported CryptoKey algorithm name", { cause: a11 });
        }(c10), c10, g6(d10)));
        return `${d10}.${e10}`;
      }
      let hu = URL.parse ? (a10, b10) => URL.parse(a10, b10) : (a10, b10) => {
        try {
          return new URL(a10, b10);
        } catch {
          return null;
        }
      };
      function hv(a10, b10) {
        if (b10 && "https:" !== a10.protocol) throw ha("only requests to HTTPS are allowed", ih, a10);
        if ("https:" !== a10.protocol && "http:" !== a10.protocol) throw ha("only HTTP and HTTPS requests are allowed", ii, a10);
      }
      function hw(a10, b10, c10, d10) {
        let e10;
        if ("string" != typeof a10 || !(e10 = hu(a10))) throw ha(`authorization server metadata does not contain a valid ${c10 ? `"as.mtls_endpoint_aliases.${b10}"` : `"as.${b10}"`}`, void 0 === a10 ? im : io, { attribute: c10 ? `mtls_endpoint_aliases.${b10}` : b10 });
        return hv(e10, d10), e10;
      }
      function hx(a10, b10, c10, d10) {
        return c10 && a10.mtls_endpoint_aliases && b10 in a10.mtls_endpoint_aliases ? hw(a10.mtls_endpoint_aliases[b10], b10, c10, d10) : hw(a10[b10], b10, c10, d10);
      }
      class hy extends Error {
        cause;
        code;
        error;
        status;
        error_description;
        response;
        constructor(a10, b10) {
          super(a10, b10), this.name = this.constructor.name, this.code = h8, this.cause = b10.cause, this.error = b10.cause.error, this.status = b10.response.status, this.error_description = b10.cause.error_description, Object.defineProperty(this, "response", { enumerable: false, value: b10.response }), Error.captureStackTrace?.(this, this.constructor);
        }
      }
      class hz extends Error {
        cause;
        code;
        error;
        error_description;
        constructor(a10, b10) {
          super(a10, b10), this.name = this.constructor.name, this.code = ia, this.cause = b10.cause, this.error = b10.cause.get("error"), this.error_description = b10.cause.get("error_description") ?? void 0, Error.captureStackTrace?.(this, this.constructor);
        }
      }
      class hA extends Error {
        cause;
        code;
        response;
        status;
        constructor(a10, b10) {
          super(a10, b10), this.name = this.constructor.name, this.code = h7, this.cause = b10.cause, this.status = b10.response.status, this.response = b10.response, Object.defineProperty(this, "response", { enumerable: false }), Error.captureStackTrace?.(this, this.constructor);
        }
      }
      let hB = "[a-zA-Z0-9!#$%&\\'\\*\\+\\-\\.\\^_`\\|~]+", hC = RegExp("^[,\\s]*(" + hB + ")"), hD = RegExp("^[,\\s]*(" + hB + ')\\s*=\\s*"((?:[^"\\\\]|\\\\[\\s\\S])*)"[,\\s]*(.*)'), hE = RegExp("^[,\\s]*" + ("(" + hB + ")\\s*=\\s*(") + hB + ")[,\\s]*(.*)"), hF = RegExp("^([a-zA-Z0-9\\-\\._\\~\\+\\/]+={0,2})(?:$|[,\\s])(.*)");
      async function hG(a10) {
        if (a10.status > 399 && a10.status < 500) {
          ip(a10), hk(a10);
          try {
            let b10 = await a10.clone().json();
            if (hb(b10) && "string" == typeof b10.error && b10.error.length) return b10;
          } catch {
          }
        }
      }
      async function hH(a10, b10, c10) {
        if (a10.status !== b10) {
          let b11;
          if (hU(a10), b11 = await hG(a10)) throw await a10.body?.cancel(), new hy("server responded with an error in the response body", { cause: b11, response: a10 });
          throw ha(`"response" is not a conform ${c10} response (unexpected HTTP status code)`, ig, a10);
        }
      }
      function hI(a10) {
        if (!hZ.has(a10)) throw gZ('"options.DPoP" is not a valid DPoPHandle', gX);
      }
      async function hJ(a10, b10, c10, d10, e10, f10) {
        if (hi(a10, '"accessToken"'), !(c10 instanceof URL)) throw gZ('"url" must be an instance of URL', gY);
        hv(c10, f10?.[g$] !== true), d10 = hc(d10), f10?.DPoP && (hI(f10.DPoP), await f10.DPoP.addProof(c10, d10, b10.toUpperCase(), a10)), d10.set("authorization", `${d10.has("dpop") ? "DPoP" : "Bearer"} ${a10}`);
        let g10 = await (f10?.[g1] || fetch)(c10.href, { duplex: gW(e10, ReadableStream) ? "half" : void 0, body: e10, headers: Object.fromEntries(d10.entries()), method: b10, redirect: "manual", signal: hd(c10, f10?.signal) });
        return f10?.DPoP?.cacheNonce(g10, c10), g10;
      }
      async function hK(a10, b10, c10, d10) {
        hq(a10), hr(b10);
        let e10 = hx(a10, "userinfo_endpoint", b10.use_mtls_endpoint_aliases, d10?.[g$] !== true), f10 = hc(d10?.headers);
        return b10.userinfo_signed_response_alg ? f10.set("accept", "application/jwt") : (f10.set("accept", "application/json"), f10.append("accept", "application/jwt")), hJ(c10, "GET", e10, f10, null, { ...d10, [g_]: hn(b10) });
      }
      let hL = Symbol();
      function hM(a10) {
        return a10.headers.get("content-type")?.split(";")[0];
      }
      async function hN(a10, b10, c10, d10, e10) {
        let f10;
        if (hq(a10), hr(b10), !gW(d10, Response)) throw gZ('"response" must be an instance of Response', gY);
        if (hU(d10), 200 !== d10.status) throw ha('"response" is not a conform UserInfo Endpoint response (unexpected HTTP status code)', ig, d10);
        if (ip(d10), "application/jwt" === hM(d10)) {
          let { claims: c11, jwt: g10 } = await ir(await d10.text(), is.bind(void 0, b10.userinfo_signed_response_alg, a10.userinfo_signing_alg_values_supported, void 0), hn(b10), ho(b10), e10?.[g3]).then(hV.bind(void 0, b10.client_id)).then(hX.bind(void 0, a10));
          hR.set(d10, g10), f10 = c11;
        } else {
          if (b10.userinfo_signed_response_alg) throw ha("JWT UserInfo Response expected", ib, d10);
          f10 = await iw(d10);
        }
        if (hi(f10.sub, '"response" body "sub" property', id, { body: f10 }), c10 === hL) ;
        else if (hi(c10, '"expectedSubject"'), f10.sub !== c10) throw ha('unexpected "response" body "sub" property value', il, { expected: c10, body: f10, attribute: "sub" });
        return f10;
      }
      async function hO(a10, b10, c10, d10, e10, f10, g10) {
        return await c10(a10, b10, e10, f10), f10.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8"), (g10?.[g1] || fetch)(d10.href, { body: e10, headers: Object.fromEntries(f10.entries()), method: "POST", redirect: "manual", signal: hd(d10, g10?.signal) });
      }
      async function hP(a10, b10, c10, d10, e10, f10) {
        let g10 = hx(a10, "token_endpoint", b10.use_mtls_endpoint_aliases, f10?.[g$] !== true);
        e10.set("grant_type", d10);
        let h10 = hc(f10?.headers);
        h10.set("accept", "application/json"), f10?.DPoP !== void 0 && (hI(f10.DPoP), await f10.DPoP.addProof(g10, h10, "POST"));
        let i10 = await hO(a10, b10, c10, g10, e10, h10, f10);
        return f10?.DPoP?.cacheNonce(i10, g10), i10;
      }
      let hQ = /* @__PURE__ */ new WeakMap(), hR = /* @__PURE__ */ new WeakMap();
      function hS(a10) {
        if (!a10.id_token) return;
        let b10 = hQ.get(a10);
        if (!b10) throw gZ('"ref" was already garbage collected or did not resolve from the proper sources', gX);
        return b10;
      }
      async function hT(a10, b10, c10, d10, e10, f10) {
        if (hq(a10), hr(b10), !gW(c10, Response)) throw gZ('"response" must be an instance of Response', gY);
        await hH(c10, 200, "Token Endpoint"), ip(c10);
        let g10 = await iw(c10);
        if (hi(g10.access_token, '"response" body "access_token" property', id, { body: g10 }), hi(g10.token_type, '"response" body "token_type" property', id, { body: g10 }), g10.token_type = g10.token_type.toLowerCase(), void 0 !== g10.expires_in) {
          let a11 = "number" != typeof g10.expires_in ? parseFloat(g10.expires_in) : g10.expires_in;
          hh(a11, true, '"response" body "expires_in" property', id, { body: g10 }), g10.expires_in = a11;
        }
        if (void 0 !== g10.refresh_token && hi(g10.refresh_token, '"response" body "refresh_token" property', id, { body: g10 }), void 0 !== g10.scope && "string" != typeof g10.scope) throw ha('"response" body "scope" property must be a string', id, { body: g10 });
        if (void 0 !== g10.id_token) {
          hi(g10.id_token, '"response" body "id_token" property', id, { body: g10 });
          let f11 = ["aud", "exp", "iat", "iss", "sub"];
          true === b10.require_auth_time && f11.push("auth_time"), void 0 !== b10.default_max_age && (hh(b10.default_max_age, true, '"client.default_max_age"'), f11.push("auth_time")), d10?.length && f11.push(...d10);
          let { claims: h10, jwt: i10 } = await ir(g10.id_token, is.bind(void 0, b10.id_token_signed_response_alg, a10.id_token_signing_alg_values_supported, "RS256"), hn(b10), ho(b10), e10).then(h1.bind(void 0, f11)).then(hY.bind(void 0, a10)).then(hW.bind(void 0, b10.client_id));
          if (Array.isArray(h10.aud) && 1 !== h10.aud.length) {
            if (void 0 === h10.azp) throw ha('ID Token "aud" (audience) claim includes additional untrusted audiences', ik, { claims: h10, claim: "aud" });
            if (h10.azp !== b10.client_id) throw ha('unexpected ID Token "azp" (authorized party) claim value', ik, { expected: b10.client_id, claims: h10, claim: "azp" });
          }
          void 0 !== h10.auth_time && hh(h10.auth_time, true, 'ID Token "auth_time" (authentication time)', id, { claims: h10 }), hR.set(c10, i10), hQ.set(g10, h10);
        }
        if (f10?.[g10.token_type] !== void 0) f10[g10.token_type](c10, g10);
        else if ("dpop" !== g10.token_type && "bearer" !== g10.token_type) throw new g8("unsupported `token_type` value", { cause: { body: g10 } });
        return g10;
      }
      function hU(a10) {
        let b10;
        if (b10 = function(a11) {
          if (!gW(a11, Response)) throw gZ('"response" must be an instance of Response', gY);
          let b11 = a11.headers.get("www-authenticate");
          if (null === b11) return;
          let c10 = [], d10 = b11;
          for (; d10; ) {
            let a12, b12 = d10.match(hC), e10 = b12?.["1"].toLowerCase();
            if (!e10) return;
            let f10 = d10.substring(b12[0].length);
            if (f10 && !f10.match(/^[\s,]/)) return;
            let g10 = f10.match(/^\s+(.*)$/), h10 = !!g10;
            d10 = g10 ? g10[1] : void 0;
            let i10 = {};
            if (h10) for (; d10; ) {
              let c11, e11;
              if (b12 = d10.match(hD)) {
                if ([, c11, e11, d10] = b12, e11.includes("\\")) try {
                  e11 = JSON.parse(`"${e11}"`);
                } catch {
                }
                i10[c11.toLowerCase()] = e11;
                continue;
              }
              if (b12 = d10.match(hE)) {
                [, c11, e11, d10] = b12, i10[c11.toLowerCase()] = e11;
                continue;
              }
              if (b12 = d10.match(hF)) {
                if (Object.keys(i10).length) break;
                [, a12, d10] = b12;
                break;
              }
              return;
            }
            else d10 = f10 || void 0;
            let j2 = { scheme: e10, parameters: i10 };
            a12 && (j2.token68 = a12), c10.push(j2);
          }
          if (c10.length) return c10;
        }(a10)) throw new hA("server responded with a challenge in the WWW-Authenticate HTTP Header", { cause: b10, response: a10 });
      }
      function hV(a10, b10) {
        return void 0 !== b10.claims.aud ? hW(a10, b10) : b10;
      }
      function hW(a10, b10) {
        if (Array.isArray(b10.claims.aud)) {
          if (!b10.claims.aud.includes(a10)) throw ha('unexpected JWT "aud" (audience) claim value', ik, { expected: a10, claims: b10.claims, claim: "aud" });
        } else if (b10.claims.aud !== a10) throw ha('unexpected JWT "aud" (audience) claim value', ik, { expected: a10, claims: b10.claims, claim: "aud" });
        return b10;
      }
      function hX(a10, b10) {
        return void 0 !== b10.claims.iss ? hY(a10, b10) : b10;
      }
      function hY(a10, b10) {
        let c10 = a10[iy]?.(b10) ?? a10.issuer;
        if (b10.claims.iss !== c10) throw ha('unexpected JWT "iss" (issuer) claim value', ik, { expected: c10, claims: b10.claims, claim: "iss" });
        return b10;
      }
      let hZ = /* @__PURE__ */ new WeakSet(), h$ = Symbol();
      async function h_(a10, b10, c10, d10, e10, f10, g10) {
        if (hq(a10), hr(b10), !hZ.has(d10)) throw gZ('"callbackParameters" must be an instance of URLSearchParams obtained from "validateAuthResponse()", or "validateJwtAuthResponse()', gX);
        hi(e10, '"redirectUri"');
        let h10 = it(d10, "code");
        if (!h10) throw ha('no authorization code in "callbackParameters"', id);
        let i10 = new URLSearchParams(g10?.additionalParameters);
        return i10.set("redirect_uri", e10), i10.set("code", h10), f10 !== h$ && (hi(f10, '"codeVerifier"'), i10.set("code_verifier", f10)), hP(a10, b10, c10, "authorization_code", i10, g10);
      }
      let h0 = { aud: "audience", c_hash: "code hash", client_id: "client id", exp: "expiration time", iat: "issued at", iss: "issuer", jti: "jwt id", nonce: "nonce", s_hash: "state hash", sub: "subject", ath: "access token hash", htm: "http method", htu: "http uri", cnf: "confirmation", auth_time: "authentication time" };
      function h1(a10, b10) {
        for (let c10 of a10) if (void 0 === b10.claims[c10]) throw ha(`JWT "${c10}" (${h0[c10]}) claim missing`, id, { claims: b10.claims });
        return b10;
      }
      let h2 = Symbol(), h3 = Symbol();
      async function h4(a10, b10, c10, d10) {
        return "string" == typeof d10?.expectedNonce || "number" == typeof d10?.maxAge || d10?.requireIdToken ? h5(a10, b10, c10, d10.expectedNonce, d10.maxAge, d10[g3], d10.recognizedTokenTypes) : h6(a10, b10, c10, d10?.[g3], d10?.recognizedTokenTypes);
      }
      async function h5(a10, b10, c10, d10, e10, f10, g10) {
        let h10 = [];
        switch (d10) {
          case void 0:
            d10 = h2;
            break;
          case h2:
            break;
          default:
            hi(d10, '"expectedNonce" argument'), h10.push("nonce");
        }
        switch (e10 ??= b10.default_max_age) {
          case void 0:
            e10 = h3;
            break;
          case h3:
            break;
          default:
            hh(e10, true, '"maxAge" argument'), h10.push("auth_time");
        }
        let i10 = await hT(a10, b10, c10, h10, f10, g10);
        hi(i10.id_token, '"response" body "id_token" property', id, { body: i10 });
        let j2 = hS(i10);
        if (e10 !== h3) {
          let a11 = hp() + hn(b10), c11 = ho(b10);
          if (j2.auth_time + e10 < a11 - c11) throw ha("too much time has elapsed since the last End-User authentication", ij, { claims: j2, now: a11, tolerance: c11, claim: "auth_time" });
        }
        if (d10 === h2) {
          if (void 0 !== j2.nonce) throw ha('unexpected ID Token "nonce" claim value', ik, { expected: void 0, claims: j2, claim: "nonce" });
        } else if (j2.nonce !== d10) throw ha('unexpected ID Token "nonce" claim value', ik, { expected: d10, claims: j2, claim: "nonce" });
        return i10;
      }
      async function h6(a10, b10, c10, d10, e10) {
        let f10 = await hT(a10, b10, c10, void 0, d10, e10), g10 = hS(f10);
        if (g10) {
          if (void 0 !== b10.default_max_age) {
            hh(b10.default_max_age, true, '"client.default_max_age"');
            let a11 = hp() + hn(b10), c11 = ho(b10);
            if (g10.auth_time + b10.default_max_age < a11 - c11) throw ha("too much time has elapsed since the last End-User authentication", ij, { claims: g10, now: a11, tolerance: c11, claim: "auth_time" });
          }
          if (void 0 !== g10.nonce) throw ha('unexpected ID Token "nonce" claim value', ik, { expected: void 0, claims: g10, claim: "nonce" });
        }
        return f10;
      }
      let h7 = "OAUTH_WWW_AUTHENTICATE_CHALLENGE", h8 = "OAUTH_RESPONSE_BODY_ERROR", h9 = "OAUTH_UNSUPPORTED_OPERATION", ia = "OAUTH_AUTHORIZATION_RESPONSE_ERROR", ib = "OAUTH_JWT_USERINFO_EXPECTED", ic = "OAUTH_PARSE_ERROR", id = "OAUTH_INVALID_RESPONSE", ie = "OAUTH_RESPONSE_IS_NOT_JSON", ig = "OAUTH_RESPONSE_IS_NOT_CONFORM", ih = "OAUTH_HTTP_REQUEST_FORBIDDEN", ii = "OAUTH_REQUEST_PROTOCOL_FORBIDDEN", ij = "OAUTH_JWT_TIMESTAMP_CHECK_FAILED", ik = "OAUTH_JWT_CLAIM_COMPARISON_FAILED", il = "OAUTH_JSON_ATTRIBUTE_COMPARISON_FAILED", im = "OAUTH_MISSING_SERVER_METADATA", io = "OAUTH_INVALID_SERVER_METADATA";
      function ip(a10) {
        if (a10.bodyUsed) throw gZ('"response" body has been used already', gX);
      }
      function iq(a10) {
        let { algorithm: b10 } = a10;
        if ("number" != typeof b10.modulusLength || b10.modulusLength < 2048) throw new g8(`unsupported ${b10.name} modulusLength`, { cause: a10 });
      }
      async function ir(a10, b10, c10, d10, e10) {
        let f10, g10, { 0: h10, 1: i10, length: j2 } = a10.split(".");
        if (5 === j2) if (void 0 !== e10) a10 = await e10(a10), { 0: h10, 1: i10, length: j2 } = a10.split(".");
        else throw new g8("JWE decryption is not configured", { cause: a10 });
        if (3 !== j2) throw ha("Invalid JWT", id, a10);
        try {
          f10 = JSON.parse(g6(g7(h10)));
        } catch (a11) {
          throw ha("failed to parse JWT Header body as base64url encoded JSON", ic, a11);
        }
        if (!hb(f10)) throw ha("JWT Header must be a top level object", id, a10);
        if (b10(f10), void 0 !== f10.crit) throw new g8('no JWT "crit" header parameter extensions are supported', { cause: { header: f10 } });
        try {
          g10 = JSON.parse(g6(g7(i10)));
        } catch (a11) {
          throw ha("failed to parse JWT Payload body as base64url encoded JSON", ic, a11);
        }
        if (!hb(g10)) throw ha("JWT Payload must be a top level object", id, a10);
        let k2 = hp() + c10;
        if (void 0 !== g10.exp) {
          if ("number" != typeof g10.exp) throw ha('unexpected JWT "exp" (expiration time) claim type', id, { claims: g10 });
          if (g10.exp <= k2 - d10) throw ha('unexpected JWT "exp" (expiration time) claim value, expiration is past current timestamp', ij, { claims: g10, now: k2, tolerance: d10, claim: "exp" });
        }
        if (void 0 !== g10.iat && "number" != typeof g10.iat) throw ha('unexpected JWT "iat" (issued at) claim type', id, { claims: g10 });
        if (void 0 !== g10.iss && "string" != typeof g10.iss) throw ha('unexpected JWT "iss" (issuer) claim type', id, { claims: g10 });
        if (void 0 !== g10.nbf) {
          if ("number" != typeof g10.nbf) throw ha('unexpected JWT "nbf" (not before) claim type', id, { claims: g10 });
          if (g10.nbf > k2 + d10) throw ha('unexpected JWT "nbf" (not before) claim value', ij, { claims: g10, now: k2, tolerance: d10, claim: "nbf" });
        }
        if (void 0 !== g10.aud && "string" != typeof g10.aud && !Array.isArray(g10.aud)) throw ha('unexpected JWT "aud" (audience) claim type', id, { claims: g10 });
        return { header: f10, claims: g10, jwt: a10 };
      }
      function is(a10, b10, c10, d10) {
        if (void 0 !== a10) {
          if ("string" == typeof a10 ? d10.alg !== a10 : !a10.includes(d10.alg)) throw ha('unexpected JWT "alg" header parameter', id, { header: d10, expected: a10, reason: "client configuration" });
          return;
        }
        if (Array.isArray(b10)) {
          if (!b10.includes(d10.alg)) throw ha('unexpected JWT "alg" header parameter', id, { header: d10, expected: b10, reason: "authorization server metadata" });
          return;
        }
        if (void 0 !== c10) {
          if ("string" == typeof c10 ? d10.alg !== c10 : "function" == typeof c10 ? !c10(d10.alg) : !c10.includes(d10.alg)) throw ha('unexpected JWT "alg" header parameter', id, { header: d10, expected: c10, reason: "default value" });
          return;
        }
        throw ha('missing client or server configuration to verify used JWT "alg" header parameter', void 0, { client: a10, issuer: b10, fallback: c10 });
      }
      function it(a10, b10) {
        let { 0: c10, length: d10 } = a10.getAll(b10);
        if (d10 > 1) throw ha(`"${b10}" parameter must be provided only once`, id);
        return c10;
      }
      let iu = Symbol(), iv = Symbol();
      async function iw(a10, b10 = hk) {
        let c10;
        try {
          c10 = await a10.json();
        } catch (c11) {
          throw b10(a10), ha('failed to parse "response" body as JSON', ic, c11);
        }
        if (!hb(c10)) throw ha('"response" body must be a top level object', id, { body: c10 });
        return c10;
      }
      let ix = Symbol(), iy = Symbol();
      async function iz(a10, b10, c10) {
        let { cookies: d10, logger: e10 } = c10, f10 = d10[a10], g10 = /* @__PURE__ */ new Date();
        g10.setTime(g10.getTime() + 9e5), e10.debug(`CREATE_${a10.toUpperCase()}`, { name: f10.name, payload: b10, COOKIE_TTL: 900, expires: g10 });
        let h10 = await fc({ ...c10.jwt, maxAge: 900, token: { value: b10, provider: c10.provider.id }, salt: f10.name }), i10 = { ...f10.options, expires: g10 };
        return { name: f10.name, value: h10, options: i10 };
      }
      async function iA(a10, b10, c10) {
        try {
          let { logger: d10, cookies: e10, jwt: f10 } = c10;
          if (d10.debug(`PARSE_${a10.toUpperCase()}`, { cookie: b10 }), !b10) throw new cF(`${a10} cookie was missing`);
          let g10 = await fd({ ...f10, token: b10, salt: e10[a10].name });
          if (!g10?.value) throw Error("Invalid cookie");
          if (g10.provider !== c10.provider?.id) throw Error(`${a10} cookie was created for a different provider than the one handling the callback`);
          return g10.value;
        } catch (b11) {
          throw new cF(`${a10} value could not be parsed`, { cause: b11 });
        }
      }
      function iB(a10, b10, c10) {
        let { logger: d10, cookies: e10 } = b10, f10 = e10[a10];
        d10.debug(`CLEAR_${a10.toUpperCase()}`, { cookie: f10 }), c10.push({ name: f10.name, value: "", options: { ...e10[a10].options, maxAge: 0 } });
      }
      function iC(a10, b10) {
        return async function(c10, d10, e10) {
          let { provider: f10, logger: g10 } = e10;
          if (!f10?.checks?.includes(a10)) return;
          let h10 = c10?.[e10.cookies[b10].name];
          g10.debug(`USE_${b10.toUpperCase()}`, { value: h10 });
          let i10 = await iA(b10, h10, e10);
          return iB(b10, e10, d10), i10;
        };
      }
      let iD = { async create(a10) {
        let b10 = hl(), c10 = await hm(b10);
        return { cookie: await iz("pkceCodeVerifier", b10, a10), value: c10 };
      }, use: iC("pkce", "pkceCodeVerifier") }, iE = "encodedState", iF = { async create(a10, b10) {
        let { provider: c10 } = a10;
        if (!c10.checks.includes("state")) {
          if (b10) throw new cF("State data was provided but the provider is not configured to use state");
          return;
        }
        let d10 = { origin: b10, random: hl() }, e10 = await fc({ secret: a10.jwt.secret, token: d10, salt: iE, maxAge: 900 });
        return { cookie: await iz("state", e10, a10), value: e10 };
      }, use: iC("state", "state"), async decode(a10, b10) {
        try {
          b10.logger.debug("DECODE_STATE", { state: a10 });
          let c10 = await fd({ secret: b10.jwt.secret, token: a10, salt: iE });
          if (c10) return c10;
          throw Error("Invalid state");
        } catch (a11) {
          throw new cF("State could not be decoded", { cause: a11 });
        }
      } }, iG = { async create(a10) {
        if (!a10.provider.checks.includes("nonce")) return;
        let b10 = hl();
        return { cookie: await iz("nonce", b10, a10), value: b10 };
      }, use: iC("nonce", "nonce") }, iH = "encodedWebauthnChallenge", iI = { create: async (a10, b10, c10) => ({ cookie: await iz("webauthnChallenge", await fc({ secret: a10.jwt.secret, token: { challenge: b10, registerData: c10 }, salt: iH, maxAge: 900 }), a10) }), async use(a10, b10, c10) {
        let d10 = b10?.[a10.cookies.webauthnChallenge.name], e10 = await iA("webauthnChallenge", d10, a10), f10 = await fd({ secret: a10.jwt.secret, token: e10, salt: iH });
        if (iB("webauthnChallenge", a10, c10), !f10) throw new cF("WebAuthn challenge was missing");
        return f10;
      } };
      function iJ(a10) {
        return encodeURIComponent(a10).replace(/%20/g, "+");
      }
      async function iK(a10, b10, c10) {
        var d10, e10;
        let f10, g10, h10, i10, j2, { logger: k2, provider: l2 } = c10, { token: m2, userinfo: n2 } = l2;
        if (m2?.url && "authjs.dev" !== m2.url.host || n2?.url && "authjs.dev" !== n2.url.host) f10 = { issuer: l2.issuer ?? "https://authjs.dev", token_endpoint: m2?.url.toString(), userinfo_endpoint: n2?.url.toString() };
        else {
          let a11 = new URL(l2.issuer), b11 = await hg(a11, { [g$]: true, [g1]: l2[fy] });
          if (!(f10 = await hj(a11, b11)).token_endpoint) throw TypeError("TODO: Authorization server did not provide a token endpoint.");
          if (!f10.userinfo_endpoint) throw TypeError("TODO: Authorization server did not provide a userinfo endpoint.");
        }
        let o2 = { client_id: l2.clientId, ...l2.client };
        switch (o2.token_endpoint_auth_method) {
          case void 0:
          case "client_secret_basic":
            g10 = (a11, b11, c11, d11) => {
              var e11, f11;
              let g11, h11, i11;
              d11.set("authorization", (e11 = l2.clientId, f11 = l2.clientSecret, g11 = iJ(e11), h11 = iJ(f11), i11 = btoa(`${g11}:${h11}`), `Basic ${i11}`));
            };
            break;
          case "client_secret_post":
            hi(d10 = l2.clientSecret, '"clientSecret"'), g10 = (a11, b11, c11, e11) => {
              c11.set("client_id", b11.client_id), c11.set("client_secret", d10);
            };
            break;
          case "client_secret_jwt":
            hi(e10 = l2.clientSecret, '"clientSecret"'), j2 = void 0, g10 = async (a11, b11, c11, d11) => {
              i10 ||= await crypto.subtle.importKey("raw", g6(e10), { hash: "SHA-256", name: "HMAC" }, false, ["sign"]);
              let f11 = { alg: "HS256" }, g11 = hs(a11, b11);
              j2?.(f11, g11);
              let h11 = `${g7(g6(JSON.stringify(f11)))}.${g7(g6(JSON.stringify(g11)))}`, k3 = await crypto.subtle.sign(i10.algorithm, i10, g6(h11));
              c11.set("client_id", b11.client_id), c11.set("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"), c11.set("client_assertion", `${h11}.${g7(new Uint8Array(k3))}`);
            };
            break;
          case "private_key_jwt":
            g10 = function(a11, b11) {
              let { key: c11, kid: d11 } = a11 instanceof CryptoKey ? { key: a11 } : a11?.key instanceof CryptoKey ? (void 0 !== a11.kid && hi(a11.kid, '"kid"'), { key: a11.key, kid: a11.kid }) : {};
              var e11 = '"clientPrivateKey.key"';
              if (!(c11 instanceof CryptoKey)) throw gZ(`${e11} must be a CryptoKey`, gY);
              if ("private" !== c11.type) throw gZ(`${e11} must be a private CryptoKey`, gX);
              return async (a12, e12, f11, g11) => {
                let h11 = { alg: function(a13) {
                  switch (a13.algorithm.name) {
                    case "RSA-PSS":
                      switch (a13.algorithm.hash.name) {
                        case "SHA-256":
                          return "PS256";
                        case "SHA-384":
                          return "PS384";
                        case "SHA-512":
                          return "PS512";
                        default:
                          throw new g8("unsupported RsaHashedKeyAlgorithm hash name", { cause: a13 });
                      }
                    case "RSASSA-PKCS1-v1_5":
                      switch (a13.algorithm.hash.name) {
                        case "SHA-256":
                          return "RS256";
                        case "SHA-384":
                          return "RS384";
                        case "SHA-512":
                          return "RS512";
                        default:
                          throw new g8("unsupported RsaHashedKeyAlgorithm hash name", { cause: a13 });
                      }
                    case "ECDSA":
                      switch (a13.algorithm.namedCurve) {
                        case "P-256":
                          return "ES256";
                        case "P-384":
                          return "ES384";
                        case "P-521":
                          return "ES512";
                        default:
                          throw new g8("unsupported EcKeyAlgorithm namedCurve", { cause: a13 });
                      }
                    case "Ed25519":
                    case "ML-DSA-44":
                    case "ML-DSA-65":
                    case "ML-DSA-87":
                      return a13.algorithm.name;
                    case "EdDSA":
                      return "Ed25519";
                    default:
                      throw new g8("unsupported CryptoKey algorithm name", { cause: a13 });
                  }
                }(c11), kid: d11 }, i11 = hs(a12, e12);
                b11?.[g2]?.(h11, i11), f11.set("client_id", e12.client_id), f11.set("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"), f11.set("client_assertion", await ht(h11, i11, c11));
              };
            }(l2.token.clientPrivateKey, { [g2](a11, b11) {
              b11.aud = [f10.issuer, f10.token_endpoint];
            } });
            break;
          case "none":
            g10 = (a11, b11, c11, d11) => {
              c11.set("client_id", b11.client_id);
            };
            break;
          default:
            throw Error("unsupported client authentication method");
        }
        let p2 = [], q2 = await iF.use(b10, p2, c10);
        try {
          h10 = function(a11, b11, c11, d11) {
            var e11;
            if (hq(a11), hr(b11), c11 instanceof URL && (c11 = c11.searchParams), !(c11 instanceof URLSearchParams)) throw gZ('"parameters" must be an instance of URLSearchParams, or URL', gY);
            if (it(c11, "response")) throw ha('"parameters" contains a JARM response, use validateJwtAuthResponse() instead of validateAuthResponse()', id, { parameters: c11 });
            let f11 = it(c11, "iss"), g11 = it(c11, "state");
            if (!f11 && a11.authorization_response_iss_parameter_supported) throw ha('response parameter "iss" (issuer) missing', id, { parameters: c11 });
            if (f11 && f11 !== a11.issuer) throw ha('unexpected "iss" (issuer) response parameter value', id, { expected: a11.issuer, parameters: c11 });
            switch (d11) {
              case void 0:
              case iv:
                if (void 0 !== g11) throw ha('unexpected "state" response parameter encountered', id, { expected: void 0, parameters: c11 });
                break;
              case iu:
                break;
              default:
                if (hi(d11, '"expectedState" argument'), g11 !== d11) throw ha(void 0 === g11 ? 'response parameter "state" missing' : 'unexpected "state" response parameter value', id, { expected: d11, parameters: c11 });
            }
            if (it(c11, "error")) throw new hz("authorization response from the server is an error", { cause: c11 });
            let h11 = it(c11, "id_token"), i11 = it(c11, "token");
            if (void 0 !== h11 || void 0 !== i11) throw new g8("implicit and hybrid flows are not supported");
            return e11 = new URLSearchParams(c11), hZ.add(e11), e11;
          }(f10, o2, new URLSearchParams(a10), l2.checks.includes("state") ? q2 : iu);
        } catch (a11) {
          if (a11 instanceof hz) {
            let b11 = { providerId: l2.id, ...Object.fromEntries(a11.cause.entries()) };
            throw k2.debug("OAuthCallbackError", b11), new cM("OAuth Provider returned an error", b11);
          }
          throw a11;
        }
        let r2 = await iD.use(b10, p2, c10), s2 = l2.callbackUrl;
        !c10.isOnRedirectProxy && l2.redirectProxyUrl && (s2 = l2.redirectProxyUrl);
        let t2 = await h_(f10, o2, g10, h10, s2, r2 ?? "decoy", { [g$]: true, [g1]: (...a11) => (l2.checks.includes("pkce") || a11[1].body.delete("code_verifier"), (l2[fy] ?? fetch)(...a11)) });
        l2.token?.conform && (t2 = await l2.token.conform(t2.clone()) ?? t2);
        let u2 = {}, v2 = "oidc" === l2.type;
        if (l2[fz]) switch (l2.id) {
          case "microsoft-entra-id":
          case "azure-ad": {
            let a11 = await t2.clone().json();
            if (a11.error) {
              let b12 = { providerId: l2.id, ...a11 };
              throw new cM(`OAuth Provider returned an error: ${a11.error}`, b12);
            }
            let { tid: b11 } = function(a12) {
              let b12, c11;
              if ("string" != typeof a12) throw new dD("JWTs must use Compact JWS serialization, JWT must be a string");
              let { 1: d11, length: e11 } = a12.split(".");
              if (5 === e11) throw new dD("Only JWTs using Compact JWS serialization can be decoded");
              if (3 !== e11) throw new dD("Invalid JWT");
              if (!d11) throw new dD("JWTs must contain a payload");
              try {
                b12 = dm(d11);
              } catch {
                throw new dD("Failed to base64url decode the payload");
              }
              try {
                c11 = JSON.parse(df.decode(b12));
              } catch {
                throw new dD("Failed to parse the decoded payload as JSON");
              }
              if (!dp(c11)) throw new dD("Invalid JWT Claims Set");
              return c11;
            }(a11.id_token);
            if ("string" == typeof b11) {
              let a12 = f10.issuer?.match(/microsoftonline\.com\/(\w+)\/v2\.0/)?.[1] ?? "common", c11 = new URL(f10.issuer.replace(a12, b11)), d11 = await hg(c11, { [g1]: l2[fy] });
              f10 = await hj(c11, d11);
            }
          }
        }
        let w2 = await h4(f10, o2, t2, { expectedNonce: await iG.use(b10, p2, c10), requireIdToken: v2 });
        if (v2) {
          let b11 = hS(w2);
          if (u2 = b11, l2[fz] && "apple" === l2.id) try {
            u2.user = JSON.parse(a10?.user);
          } catch {
          }
          if (false === l2.idToken) {
            let a11 = await hK(f10, o2, w2.access_token, { [g1]: l2[fy], [g$]: true });
            u2 = await hN(f10, o2, b11.sub, a11);
          }
        } else if (n2?.request) {
          let a11 = await n2.request({ tokens: w2, provider: l2 });
          a11 instanceof Object && (u2 = a11);
        } else if (n2?.url) {
          let a11 = await hK(f10, o2, w2.access_token, { [g1]: l2[fy], [g$]: true });
          u2 = await a11.json();
        } else throw TypeError("No userinfo endpoint configured");
        return w2.expires_in && (w2.expires_at = Math.floor(Date.now() / 1e3) + Number(w2.expires_in)), { ...await iL(u2, l2, w2, k2), profile: u2, cookies: p2 };
      }
      async function iL(a10, b10, c10, d10) {
        try {
          let d11 = await b10.profile(a10, c10);
          return { user: { ...d11, id: crypto.randomUUID(), email: d11.email?.toLowerCase() }, account: { ...c10, provider: b10.id, type: b10.type, providerAccountId: d11.id ?? crypto.randomUUID() } };
        } catch (c11) {
          d10.debug("getProfile error details", a10), d10.error(new cN(c11, { provider: b10.id }));
        }
      }
      var iM = c(356).Buffer;
      async function iN(a10, b10, c10, d10) {
        let e10 = await iS(a10, b10, c10), { cookie: f10 } = await iI.create(a10, e10.challenge, c10);
        return { status: 200, cookies: [...d10 ?? [], f10], body: { action: "register", options: e10 }, headers: { "Content-Type": "application/json" } };
      }
      async function iO(a10, b10, c10, d10) {
        let e10 = await iR(a10, b10, c10), { cookie: f10 } = await iI.create(a10, e10.challenge);
        return { status: 200, cookies: [...d10 ?? [], f10], body: { action: "authenticate", options: e10 }, headers: { "Content-Type": "application/json" } };
      }
      async function iP(a10, b10, c10) {
        let d10, { adapter: e10, provider: f10 } = a10, g10 = b10.body && "string" == typeof b10.body.data ? JSON.parse(b10.body.data) : void 0;
        if (!g10 || "object" != typeof g10 || !("id" in g10) || "string" != typeof g10.id) throw new cv("Invalid WebAuthn Authentication response");
        let h10 = iV(iU(g10.id)), i10 = await e10.getAuthenticator(h10);
        if (!i10) throw new cv(`WebAuthn authenticator not found in database: ${JSON.stringify({ credentialID: h10 })}`);
        let { challenge: j2 } = await iI.use(a10, b10.cookies, c10);
        try {
          var k2;
          let c11 = f10.getRelayingParty(a10, b10);
          d10 = await f10.simpleWebAuthn.verifyAuthenticationResponse({ ...f10.verifyAuthenticationOptions, expectedChallenge: j2, response: g10, authenticator: { ...k2 = i10, credentialDeviceType: k2.credentialDeviceType, transports: iW(k2.transports), credentialID: iU(k2.credentialID), credentialPublicKey: iU(k2.credentialPublicKey) }, expectedOrigin: c11.origin, expectedRPID: c11.id });
        } catch (a11) {
          throw new c_(a11);
        }
        let { verified: l2, authenticationInfo: m2 } = d10;
        if (!l2) throw new c_("WebAuthn authentication response could not be verified");
        try {
          let { newCounter: a11 } = m2;
          await e10.updateAuthenticatorCounter(i10.credentialID, a11);
        } catch (a11) {
          throw new cx(`Failed to update authenticator counter. This may cause future authentication attempts to fail. ${JSON.stringify({ credentialID: h10, oldCounter: i10.counter, newCounter: m2.newCounter })}`, a11);
        }
        let n2 = await e10.getAccount(i10.providerAccountId, f10.id);
        if (!n2) throw new cv(`WebAuthn account not found in database: ${JSON.stringify({ credentialID: h10, providerAccountId: i10.providerAccountId })}`);
        let o2 = await e10.getUser(n2.userId);
        if (!o2) throw new cv(`WebAuthn user not found in database: ${JSON.stringify({ credentialID: h10, providerAccountId: i10.providerAccountId, userID: n2.userId })}`);
        return { account: n2, user: o2 };
      }
      async function iQ(a10, b10, c10) {
        var d10;
        let e10, { provider: f10 } = a10, g10 = b10.body && "string" == typeof b10.body.data ? JSON.parse(b10.body.data) : void 0;
        if (!g10 || "object" != typeof g10 || !("id" in g10) || "string" != typeof g10.id) throw new cv("Invalid WebAuthn Registration response");
        let { challenge: h10, registerData: i10 } = await iI.use(a10, b10.cookies, c10);
        if (!i10) throw new cv("Missing user registration data in WebAuthn challenge cookie");
        try {
          let c11 = f10.getRelayingParty(a10, b10);
          e10 = await f10.simpleWebAuthn.verifyRegistrationResponse({ ...f10.verifyRegistrationOptions, expectedChallenge: h10, response: g10, expectedOrigin: c11.origin, expectedRPID: c11.id });
        } catch (a11) {
          throw new c_(a11);
        }
        if (!e10.verified || !e10.registrationInfo) throw new c_("WebAuthn registration response could not be verified");
        let j2 = { providerAccountId: iV(e10.registrationInfo.credentialID), provider: a10.provider.id, type: f10.type }, k2 = { providerAccountId: j2.providerAccountId, counter: e10.registrationInfo.counter, credentialID: iV(e10.registrationInfo.credentialID), credentialPublicKey: iV(e10.registrationInfo.credentialPublicKey), credentialBackedUp: e10.registrationInfo.credentialBackedUp, credentialDeviceType: e10.registrationInfo.credentialDeviceType, transports: (d10 = g10.response.transports, d10?.join(",")) };
        return { user: i10, account: j2, authenticator: k2 };
      }
      async function iR(a10, b10, c10) {
        let { provider: d10, adapter: e10 } = a10, f10 = c10 && c10.id ? await e10.listAuthenticatorsByUserId(c10.id) : null, g10 = d10.getRelayingParty(a10, b10);
        return await d10.simpleWebAuthn.generateAuthenticationOptions({ ...d10.authenticationOptions, rpID: g10.id, allowCredentials: f10?.map((a11) => ({ id: iU(a11.credentialID), type: "public-key", transports: iW(a11.transports) })) });
      }
      async function iS(a10, b10, c10) {
        let { provider: d10, adapter: e10 } = a10, f10 = c10.id ? await e10.listAuthenticatorsByUserId(c10.id) : null, g10 = fr(32), h10 = d10.getRelayingParty(a10, b10);
        return await d10.simpleWebAuthn.generateRegistrationOptions({ ...d10.registrationOptions, userID: g10, userName: c10.email, userDisplayName: c10.name ?? void 0, rpID: h10.id, rpName: h10.name, excludeCredentials: f10?.map((a11) => ({ id: iU(a11.credentialID), type: "public-key", transports: iW(a11.transports) })) });
      }
      function iT(a10) {
        let { provider: b10, adapter: c10 } = a10;
        if (!c10) throw new cH("An adapter is required for the WebAuthn provider");
        if (!b10 || "webauthn" !== b10.type) throw new cU("Provider must be WebAuthn");
        return { ...a10, provider: b10, adapter: c10 };
      }
      function iU(a10) {
        return new Uint8Array(iM.from(a10, "base64"));
      }
      function iV(a10) {
        return iM.from(a10).toString("base64");
      }
      function iW(a10) {
        return a10 ? a10.split(",") : void 0;
      }
      async function iX(a10, b10, c10, d10) {
        if (!b10.provider) throw new cU("Callback route called without provider");
        let { query: e10, body: f10, method: g10, headers: h10 } = a10, { provider: i10, adapter: j2, url: k2, callbackUrl: l2, pages: m2, jwt: n2, events: o2, callbacks: p2, session: { strategy: q2, maxAge: r2 }, logger: s2 } = b10, t2 = "jwt" === q2;
        try {
          if ("oauth" === i10.type || "oidc" === i10.type) {
            let g11, h11 = i10.authorization?.url.searchParams.get("response_mode") === "form_post" ? f10 : e10;
            if (b10.isOnRedirectProxy && h11?.state) {
              let a11 = await iF.decode(h11.state, b10);
              if (a11?.origin && new URL(a11.origin).origin !== b10.url.origin) {
                let b11 = `${a11.origin}?${new URLSearchParams(h11)}`;
                return s2.debug("Proxy redirecting to", b11), { redirect: b11, cookies: d10 };
              }
            }
            let q3 = await iK(h11, a10.cookies, b10);
            q3.cookies.length && d10.push(...q3.cookies), s2.debug("authorization result", q3);
            let { user: u2, account: v2, profile: w2 } = q3;
            if (!u2 || !v2 || !w2) return { redirect: `${k2}/signin`, cookies: d10 };
            if (j2) {
              let { getUserByAccount: a11 } = j2;
              g11 = await a11({ providerAccountId: v2.providerAccountId, provider: i10.id });
            }
            let x2 = await iY({ user: g11 ?? u2, account: v2, profile: w2 }, b10);
            if (x2) return { redirect: x2, cookies: d10 };
            let { user: y2, session: z2, isNewUser: A2 } = await gV(c10.value, u2, v2, b10);
            if (t2) {
              let a11 = { name: y2.name, email: y2.email, picture: y2.image, sub: y2.id?.toString() }, e11 = await p2.jwt({ token: a11, user: y2, account: v2, profile: w2, isNewUser: A2, trigger: A2 ? "signUp" : "signIn" });
              if (null === e11) d10.push(...c10.clean());
              else {
                let a12 = b10.cookies.sessionToken.name, f11 = await n2.encode({ ...n2, token: e11, salt: a12 }), g12 = /* @__PURE__ */ new Date();
                g12.setTime(g12.getTime() + 1e3 * r2);
                let h12 = c10.chunk(f11, { expires: g12 });
                d10.push(...h12);
              }
            } else d10.push({ name: b10.cookies.sessionToken.name, value: z2.sessionToken, options: { ...b10.cookies.sessionToken.options, expires: z2.expires } });
            if (await o2.signIn?.({ user: y2, account: v2, profile: w2, isNewUser: A2 }), A2 && m2.newUser) return { redirect: `${m2.newUser}${m2.newUser.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl: l2 })}`, cookies: d10 };
            return { redirect: l2, cookies: d10 };
          }
          if ("email" === i10.type) {
            let a11 = e10?.token, f11 = e10?.email;
            if (!a11) {
              let b11 = TypeError("Missing token. The sign-in URL was manually opened without token or the link was not sent correctly in the email.", { cause: { hasToken: !!a11 } });
              throw b11.name = "Configuration", b11;
            }
            let g11 = i10.secret ?? b10.secret, h11 = await j2.useVerificationToken({ identifier: f11, token: await fq(`${a11}${g11}`) }), k3 = !!h11, q3 = k3 && h11.expires.valueOf() < Date.now();
            if (!k3 || q3 || f11 && h11.identifier !== f11) throw new cW({ hasInvite: k3, expired: q3 });
            let { identifier: s3 } = h11, u2 = await j2.getUserByEmail(s3) ?? { id: crypto.randomUUID(), email: s3, emailVerified: null }, v2 = { providerAccountId: u2.email, userId: u2.id, type: "email", provider: i10.id }, w2 = await iY({ user: u2, account: v2 }, b10);
            if (w2) return { redirect: w2, cookies: d10 };
            let { user: x2, session: y2, isNewUser: z2 } = await gV(c10.value, u2, v2, b10);
            if (t2) {
              let a12 = { name: x2.name, email: x2.email, picture: x2.image, sub: x2.id?.toString() }, e11 = await p2.jwt({ token: a12, user: x2, account: v2, isNewUser: z2, trigger: z2 ? "signUp" : "signIn" });
              if (null === e11) d10.push(...c10.clean());
              else {
                let a13 = b10.cookies.sessionToken.name, f12 = await n2.encode({ ...n2, token: e11, salt: a13 }), g12 = /* @__PURE__ */ new Date();
                g12.setTime(g12.getTime() + 1e3 * r2);
                let h12 = c10.chunk(f12, { expires: g12 });
                d10.push(...h12);
              }
            } else d10.push({ name: b10.cookies.sessionToken.name, value: y2.sessionToken, options: { ...b10.cookies.sessionToken.options, expires: y2.expires } });
            if (await o2.signIn?.({ user: x2, account: v2, isNewUser: z2 }), z2 && m2.newUser) return { redirect: `${m2.newUser}${m2.newUser.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl: l2 })}`, cookies: d10 };
            return { redirect: l2, cookies: d10 };
          }
          if ("credentials" === i10.type && "POST" === g10) {
            let a11 = f10 ?? {};
            Object.entries(e10 ?? {}).forEach(([a12, b11]) => k2.searchParams.set(a12, b11));
            let j3 = await i10.authorize(a11, new Request(k2, { headers: h10, method: g10, body: JSON.stringify(f10) }));
            if (j3) j3.id = j3.id?.toString() ?? crypto.randomUUID();
            else throw new cD();
            let m3 = { providerAccountId: j3.id, type: "credentials", provider: i10.id }, q3 = await iY({ user: j3, account: m3, credentials: a11 }, b10);
            if (q3) return { redirect: q3, cookies: d10 };
            let s3 = { name: j3.name, email: j3.email, picture: j3.image, sub: j3.id }, t3 = await p2.jwt({ token: s3, user: j3, account: m3, isNewUser: false, trigger: "signIn" });
            if (null === t3) d10.push(...c10.clean());
            else {
              let a12 = b10.cookies.sessionToken.name, e11 = await n2.encode({ ...n2, token: t3, salt: a12 }), f11 = /* @__PURE__ */ new Date();
              f11.setTime(f11.getTime() + 1e3 * r2);
              let g11 = c10.chunk(e11, { expires: f11 });
              d10.push(...g11);
            }
            return await o2.signIn?.({ user: j3, account: m3 }), { redirect: l2, cookies: d10 };
          } else if ("webauthn" === i10.type && "POST" === g10) {
            let e11, f11, g11, h11 = a10.body?.action;
            if ("string" != typeof h11 || "authenticate" !== h11 && "register" !== h11) throw new cv("Invalid action parameter");
            let i11 = iT(b10);
            switch (h11) {
              case "authenticate": {
                let b11 = await iP(i11, a10, d10);
                e11 = b11.user, f11 = b11.account;
                break;
              }
              case "register": {
                let c11 = await iQ(b10, a10, d10);
                e11 = c11.user, f11 = c11.account, g11 = c11.authenticator;
              }
            }
            await iY({ user: e11, account: f11 }, b10);
            let { user: j3, isNewUser: k3, session: q3, account: s3 } = await gV(c10.value, e11, f11, b10);
            if (!s3) throw new cv("Error creating or finding account");
            if (g11 && j3.id && await i11.adapter.createAuthenticator({ ...g11, userId: j3.id }), t2) {
              let a11 = { name: j3.name, email: j3.email, picture: j3.image, sub: j3.id?.toString() }, e12 = await p2.jwt({ token: a11, user: j3, account: s3, isNewUser: k3, trigger: k3 ? "signUp" : "signIn" });
              if (null === e12) d10.push(...c10.clean());
              else {
                let a12 = b10.cookies.sessionToken.name, f12 = await n2.encode({ ...n2, token: e12, salt: a12 }), g12 = /* @__PURE__ */ new Date();
                g12.setTime(g12.getTime() + 1e3 * r2);
                let h12 = c10.chunk(f12, { expires: g12 });
                d10.push(...h12);
              }
            } else d10.push({ name: b10.cookies.sessionToken.name, value: q3.sessionToken, options: { ...b10.cookies.sessionToken.options, expires: q3.expires } });
            if (await o2.signIn?.({ user: j3, account: s3, isNewUser: k3 }), k3 && m2.newUser) return { redirect: `${m2.newUser}${m2.newUser.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl: l2 })}`, cookies: d10 };
            return { redirect: l2, cookies: d10 };
          }
          throw new cU(`Callback for provider type (${i10.type}) is not supported`);
        } catch (b11) {
          if (b11 instanceof cv) throw b11;
          let a11 = new cz(b11, { provider: i10.id });
          throw s2.debug("callback route error details", { method: g10, query: e10, body: f10 }), a11;
        }
      }
      async function iY(a10, b10) {
        let c10, { signIn: d10, redirect: e10 } = b10.callbacks;
        try {
          c10 = await d10(a10);
        } catch (a11) {
          if (a11 instanceof cv) throw a11;
          throw new cy(a11);
        }
        if (!c10) throw new cy("AccessDenied");
        if ("string" == typeof c10) return await e10({ url: c10, baseUrl: b10.url.origin });
      }
      async function iZ(a10, b10, c10, d10, e10) {
        let { adapter: f10, jwt: g10, events: h10, callbacks: i10, logger: j2, session: { strategy: k2, maxAge: l2 } } = a10, m2 = { body: null, headers: { "Content-Type": "application/json", ...!d10 && { "Cache-Control": "private, no-cache, no-store", Expires: "0", Pragma: "no-cache" } }, cookies: c10 }, n2 = b10.value;
        if (!n2) return m2;
        if ("jwt" === k2) {
          try {
            let c11 = a10.cookies.sessionToken.name, f11 = await g10.decode({ ...g10, token: n2, salt: c11 });
            if (!f11) throw Error("Invalid JWT");
            let j3 = await i10.jwt({ token: f11, ...d10 && { trigger: "update" }, session: e10 }), k3 = gU(l2);
            if (null !== j3) {
              let a11 = { user: { name: j3.name, email: j3.email, image: j3.picture }, expires: k3.toISOString() }, d11 = await i10.session({ session: a11, token: j3 });
              m2.body = d11;
              let e11 = await g10.encode({ ...g10, token: j3, salt: c11 }), f12 = b10.chunk(e11, { expires: k3 });
              m2.cookies?.push(...f12), await h10.session?.({ session: d11, token: j3 });
            } else m2.cookies?.push(...b10.clean());
          } catch (a11) {
            j2.error(new cG(a11)), m2.cookies?.push(...b10.clean());
          }
          return m2;
        }
        try {
          let { getSessionAndUser: c11, deleteSession: g11, updateSession: j3 } = f10, k3 = await c11(n2);
          if (k3 && k3.session.expires.valueOf() < Date.now() && (await g11(n2), k3 = null), k3) {
            let { user: b11, session: c12 } = k3, f11 = a10.session.updateAge, g12 = c12.expires.valueOf() - 1e3 * l2 + 1e3 * f11, o2 = gU(l2);
            g12 <= Date.now() && await j3({ sessionToken: n2, expires: o2 });
            let p2 = await i10.session({ session: { ...c12, user: b11 }, user: b11, newSession: e10, ...d10 ? { trigger: "update" } : {} });
            m2.body = p2, m2.cookies?.push({ name: a10.cookies.sessionToken.name, value: n2, options: { ...a10.cookies.sessionToken.options, expires: o2 } }), await h10.session?.({ session: p2 });
          } else n2 && m2.cookies?.push(...b10.clean());
        } catch (a11) {
          j2.error(new cO(a11));
        }
        return m2;
      }
      async function i$(a10, b10) {
        let c10, d10, { logger: e10, provider: f10 } = b10, g10 = f10.authorization?.url;
        if (!g10 || "authjs.dev" === g10.host) {
          let a11 = new URL(f10.issuer), b11 = await hg(a11, { [g1]: f10[fy], [g$]: true }), c11 = await hj(a11, b11).catch((b12) => {
            if (!(b12 instanceof TypeError) || "Invalid URL" !== b12.message) throw b12;
            throw TypeError(`Discovery request responded with an invalid issuer. expected: ${a11}`);
          });
          if (!c11.authorization_endpoint) throw TypeError("Authorization server did not provide an authorization endpoint.");
          g10 = new URL(c11.authorization_endpoint);
        }
        let h10 = g10.searchParams, i10 = f10.callbackUrl;
        !b10.isOnRedirectProxy && f10.redirectProxyUrl && (i10 = f10.redirectProxyUrl, d10 = f10.callbackUrl, e10.debug("using redirect proxy", { redirect_uri: i10, data: d10 }));
        let j2 = Object.assign({ response_type: "code", client_id: f10.clientId, redirect_uri: i10, ...f10.authorization?.params }, Object.fromEntries(f10.authorization?.url.searchParams ?? []), a10);
        for (let a11 in j2) h10.set(a11, j2[a11]);
        let k2 = [];
        f10.authorization?.url.searchParams.get("response_mode") === "form_post" && (b10.cookies.state.options.sameSite = "none", b10.cookies.state.options.secure = true, b10.cookies.nonce.options.sameSite = "none", b10.cookies.nonce.options.secure = true);
        let l2 = await iF.create(b10, d10);
        if (l2 && (h10.set("state", l2.value), k2.push(l2.cookie)), f10.checks?.includes("pkce")) if (c10 && !c10.code_challenge_methods_supported?.includes("S256")) "oidc" === f10.type && (f10.checks = ["nonce"]);
        else {
          let { value: a11, cookie: c11 } = await iD.create(b10);
          h10.set("code_challenge", a11), h10.set("code_challenge_method", "S256"), k2.push(c11);
        }
        let m2 = await iG.create(b10);
        return m2 && (h10.set("nonce", m2.value), k2.push(m2.cookie)), "oidc" !== f10.type || g10.searchParams.has("scope") || g10.searchParams.set("scope", "openid profile email"), e10.debug("authorization url is ready", { url: g10, cookies: k2, provider: f10 }), { redirect: g10.toString(), cookies: k2 };
      }
      async function i_(a10, b10) {
        let c10, { body: d10 } = a10, { provider: e10, callbacks: f10, adapter: g10 } = b10, h10 = (e10.normalizeIdentifier ?? function(a11) {
          if (!a11) throw Error("Missing email from request body.");
          let b11 = a11.normalize("NFKC").toLowerCase().trim();
          if (b11.includes('"')) throw Error("Invalid email address format.");
          let [c11, d11] = b11.split("@");
          if (!c11 || !d11 || 2 !== b11.split("@").length || !(d11 = d11.split(",")[0])) throw Error("Invalid email address format.");
          return `${c11}@${d11}`;
        })(d10?.email), i10 = { id: crypto.randomUUID(), email: h10, emailVerified: null }, j2 = await g10.getUserByEmail(h10) ?? i10, k2 = { providerAccountId: h10, userId: j2.id, type: "email", provider: e10.id };
        try {
          c10 = await f10.signIn({ user: j2, account: k2, email: { verificationRequest: true } });
        } catch (a11) {
          throw new cy(a11);
        }
        if (!c10) throw new cy("AccessDenied");
        if ("string" == typeof c10) return { redirect: await f10.redirect({ url: c10, baseUrl: b10.url.origin }) };
        let { callbackUrl: l2, theme: m2 } = b10, n2 = await e10.generateVerificationToken?.() ?? fr(32), o2 = new Date(Date.now() + (e10.maxAge ?? 86400) * 1e3), p2 = e10.secret ?? b10.secret, q2 = new URL(b10.basePath, b10.url.origin), r2 = e10.sendVerificationRequest({ identifier: h10, token: n2, expires: o2, url: `${q2}/callback/${e10.id}?${new URLSearchParams({ callbackUrl: l2, token: n2, email: h10 })}`, provider: e10, theme: m2, request: new Request(a10.url, { headers: a10.headers, method: a10.method, body: "POST" === a10.method ? JSON.stringify(a10.body ?? {}) : void 0 }) }), s2 = g10.createVerificationToken?.({ identifier: h10, token: await fq(`${n2}${p2}`), expires: o2 });
        return await Promise.all([r2, s2]), { redirect: `${q2}/verify-request?${new URLSearchParams({ provider: e10.id, type: e10.type })}` };
      }
      async function i0(a10, b10, c10) {
        let d10 = `${c10.url.origin}${c10.basePath}/signin`;
        if (!c10.provider) return { redirect: d10, cookies: b10 };
        switch (c10.provider.type) {
          case "oauth":
          case "oidc": {
            let { redirect: d11, cookies: e10 } = await i$(a10.query, c10);
            return e10 && b10.push(...e10), { redirect: d11, cookies: b10 };
          }
          case "email":
            return { ...await i_(a10, c10), cookies: b10 };
          default:
            return { redirect: d10, cookies: b10 };
        }
      }
      async function i1(a10, b10, c10) {
        let { jwt: d10, events: e10, callbackUrl: f10, logger: g10, session: h10 } = c10, i10 = b10.value;
        if (!i10) return { redirect: f10, cookies: a10 };
        try {
          if ("jwt" === h10.strategy) {
            let a11 = c10.cookies.sessionToken.name, b11 = await d10.decode({ ...d10, token: i10, salt: a11 });
            await e10.signOut?.({ token: b11 });
          } else {
            let a11 = await c10.adapter?.deleteSession(i10);
            await e10.signOut?.({ session: a11 });
          }
        } catch (a11) {
          g10.error(new cR(a11));
        }
        return a10.push(...b10.clean()), { redirect: f10, cookies: a10 };
      }
      async function i2(a10, b10) {
        let { adapter: c10, jwt: d10, session: { strategy: e10 } } = a10, f10 = b10.value;
        if (!f10) return null;
        if ("jwt" === e10) {
          let b11 = a10.cookies.sessionToken.name, c11 = await d10.decode({ ...d10, token: f10, salt: b11 });
          if (c11 && c11.sub) return { id: c11.sub, name: c11.name, email: c11.email, image: c11.picture };
        } else {
          let a11 = await c10?.getSessionAndUser(f10);
          if (a11) return a11.user;
        }
        return null;
      }
      async function i3(a10, b10, c10, d10) {
        let e10 = iT(b10), { provider: f10 } = e10, { action: g10 } = a10.query ?? {};
        if ("register" !== g10 && "authenticate" !== g10 && void 0 !== g10) return { status: 400, body: { error: "Invalid action" }, cookies: d10, headers: { "Content-Type": "application/json" } };
        let h10 = await i2(b10, c10), i10 = h10 ? { user: h10, exists: true } : await f10.getUserInfo(b10, a10), j2 = i10?.user;
        switch (function(a11, b11, c11) {
          let { user: d11, exists: e11 = false } = c11 ?? {};
          switch (a11) {
            case "authenticate":
              return "authenticate";
            case "register":
              if (d11 && b11 === e11) return "register";
              break;
            case void 0:
              if (!b11) if (!d11) return "authenticate";
              else if (e11) return "authenticate";
              else return "register";
          }
          return null;
        }(g10, !!h10, i10)) {
          case "authenticate":
            return iO(e10, a10, j2, d10);
          case "register":
            if ("string" == typeof j2?.email) return iN(e10, a10, j2, d10);
            break;
          default:
            return { status: 400, body: { error: "Invalid request" }, cookies: d10, headers: { "Content-Type": "application/json" } };
        }
      }
      async function i4(a10, b10) {
        let { action: c10, providerId: d10, error: e10, method: f10 } = a10, g10 = b10.skipCSRFCheck === fw, { options: h10, cookies: i10 } = await fF({ authOptions: b10, action: c10, providerId: d10, url: a10.url, callbackUrl: a10.body?.callbackUrl ?? a10.query?.callbackUrl, csrfToken: a10.body?.csrfToken, cookies: a10.cookies, isPost: "POST" === f10, csrfDisabled: g10 }), j2 = new cu(h10.cookies.sessionToken, a10.cookies, h10.logger);
        if ("GET" === f10) {
          let b11 = gT({ ...h10, query: a10.query, cookies: i10 });
          switch (c10) {
            case "callback":
              return await iX(a10, h10, j2, i10);
            case "csrf":
              return b11.csrf(g10, h10, i10);
            case "error":
              return b11.error(e10);
            case "providers":
              return b11.providers(h10.providers);
            case "session":
              return await iZ(h10, j2, i10);
            case "signin":
              return b11.signin(d10, e10);
            case "signout":
              return b11.signout();
            case "verify-request":
              return b11.verifyRequest();
            case "webauthn-options":
              return await i3(a10, h10, j2, i10);
          }
        } else {
          let { csrfTokenVerified: b11 } = h10;
          switch (c10) {
            case "callback":
              return "credentials" === h10.provider.type && ft(c10, b11), await iX(a10, h10, j2, i10);
            case "session":
              return ft(c10, b11), await iZ(h10, j2, i10, true, a10.body?.data);
            case "signin":
              return ft(c10, b11), await i0(a10, i10, h10);
            case "signout":
              return ft(c10, b11), await i1(i10, j2, h10);
          }
        }
        throw new cS(`Cannot handle action: ${c10}`);
      }
      function i5(a10, b10, c10, d10, e10) {
        let f10, g10 = e10?.basePath, h10 = d10.AUTH_URL ?? d10.NEXTAUTH_URL;
        if (h10) f10 = new URL(h10), g10 && "/" !== g10 && "/" !== f10.pathname && (f10.pathname !== g10 && fj(e10).warn("env-url-basepath-mismatch"), f10.pathname = "/");
        else {
          let a11 = c10.get("x-forwarded-host") ?? c10.get("host"), d11 = c10.get("x-forwarded-proto") ?? b10 ?? "https", e11 = d11.endsWith(":") ? d11 : d11 + ":";
          f10 = new URL(`${e11}//${a11}`);
        }
        let i10 = f10.toString().replace(/\/$/, "");
        if (g10) {
          let b11 = g10?.replace(/(^\/|\/$)/g, "") ?? "";
          return new URL(`${i10}/${b11}/${a10}`);
        }
        return new URL(`${i10}/${a10}`);
      }
      async function i6(a10, b10) {
        let c10 = fj(b10), d10 = await fo(a10, b10);
        if (!d10) return Response.json("Bad request.", { status: 400 });
        let e10 = function(a11, b11) {
          let { url: c11 } = a11, d11 = [];
          if (!c2 && b11.debug && d11.push("debug-enabled"), !b11.trustHost) return new cV(`Host must be trusted. URL was: ${a11.url}`);
          if (!b11.secret?.length) return new cK("Please define a `secret`");
          let e11 = a11.query?.callbackUrl;
          if (e11 && !c3(e11, c11.origin)) return new cC(`Invalid callback URL. Received: ${e11}`);
          let { callbackUrl: f11 } = ct(b11.useSecureCookies ?? "https:" === c11.protocol), g11 = a11.cookies?.[b11.cookies?.callbackUrl?.name ?? f11.name];
          if (g11 && !c3(g11, c11.origin)) return new cC(`Invalid callback URL. Received: ${g11}`);
          let h10 = false;
          for (let a12 of b11.providers) {
            let b12 = "function" == typeof a12 ? a12() : a12;
            if (("oauth" === b12.type || "oidc" === b12.type) && !(b12.issuer ?? b12.options?.issuer)) {
              let a13, { authorization: c12, token: d12, userinfo: e12 } = b12;
              if ("string" == typeof c12 || c12?.url ? "string" == typeof d12 || d12?.url ? "string" == typeof e12 || e12?.url || (a13 = "userinfo") : a13 = "token" : a13 = "authorization", a13) return new cE(`Provider "${b12.id}" is missing both \`issuer\` and \`${a13}\` endpoint config. At least one of them is required`);
            }
            if ("credentials" === b12.type) c4 = true;
            else if ("email" === b12.type) c5 = true;
            else if ("webauthn" === b12.type) {
              var i10;
              if (c6 = true, b12.simpleWebAuthnBrowserVersion && (i10 = b12.simpleWebAuthnBrowserVersion, !/^v\d+(?:\.\d+){0,2}$/.test(i10))) return new cv(`Invalid provider config for "${b12.id}": simpleWebAuthnBrowserVersion "${b12.simpleWebAuthnBrowserVersion}" must be a valid semver string.`);
              if (b12.enableConditionalUI) {
                if (h10) return new cZ("Multiple webauthn providers have 'enableConditionalUI' set to True. Only one provider can have this option enabled at a time");
                if (h10 = true, !Object.values(b12.formFields).some((a13) => a13.autocomplete && a13.autocomplete.toString().indexOf("webauthn") > -1)) return new c$(`Provider "${b12.id}" has 'enableConditionalUI' set to True, but none of its formFields have 'webauthn' in their autocomplete param`);
              }
            }
          }
          if (c4) {
            let a12 = b11.session?.strategy === "database", c12 = !b11.providers.some((a13) => "credentials" !== ("function" == typeof a13 ? a13() : a13).type);
            if (a12 && c12) return new cT("Signing in with credentials only supported if JWT strategy is enabled");
            if (b11.providers.some((a13) => {
              let b12 = "function" == typeof a13 ? a13() : a13;
              return "credentials" === b12.type && !b12.authorize;
            })) return new cJ("Must define an authorize() handler to use credentials authentication provider");
          }
          let { adapter: j2, session: k2 } = b11, l2 = [];
          if (c5 || k2?.strategy === "database" || !k2?.strategy && j2) if (c5) {
            if (!j2) return new cH("Email login requires an adapter");
            l2.push(...c7);
          } else {
            if (!j2) return new cH("Database session requires an adapter");
            l2.push(...c8);
          }
          if (c6) {
            if (!b11.experimental?.enableWebAuthn) return new c1("WebAuthn is an experimental feature. To enable it, set `experimental.enableWebAuthn` to `true` in your config");
            if (d11.push("experimental-webauthn"), !j2) return new cH("WebAuthn requires an adapter");
            l2.push(...c9);
          }
          if (j2) {
            let a12 = l2.filter((a13) => !(a13 in j2));
            if (a12.length) return new cI(`Required adapter methods were missing: ${a12.join(", ")}`);
          }
          return c2 || (c2 = true), d11;
        }(d10, b10);
        if (Array.isArray(e10)) e10.forEach(c10.warn);
        else if (e10) {
          if (c10.error(e10), !(/* @__PURE__ */ new Set(["signin", "signout", "error", "verify-request"])).has(d10.action) || "GET" !== d10.method) return Response.json({ message: "There was a problem with the server configuration. Check the server logs for more information." }, { status: 500 });
          let { pages: a11, theme: f11 } = b10, g11 = a11?.error && d10.url.searchParams.get("callbackUrl")?.startsWith(a11.error);
          if (!a11?.error || g11) return g11 && c10.error(new cA(`The error page ${a11?.error} should not require authentication`)), fp(gT({ theme: f11 }).error("Configuration"));
          let h10 = `${d10.url.origin}${a11.error}?error=Configuration`;
          return Response.redirect(h10);
        }
        let f10 = a10.headers?.has("X-Auth-Return-Redirect"), g10 = b10.raw === fx;
        try {
          let a11 = await i4(d10, b10);
          if (g10) return a11;
          let c11 = fp(a11), e11 = c11.headers.get("Location");
          if (!f10 || !e11) return c11;
          return Response.json({ url: e11 }, { headers: c11.headers });
        } catch (l2) {
          c10.error(l2);
          let e11 = l2 instanceof cv;
          if (e11 && g10 && !f10) throw l2;
          if ("POST" === a10.method && "session" === d10.action) return Response.json(null, { status: 400 });
          let h10 = new URLSearchParams({ error: l2 instanceof cv && cY.has(l2.type) ? l2.type : "Configuration" });
          l2 instanceof cD && h10.set("code", l2.code);
          let i10 = e11 && l2.kind || "error", j2 = b10.pages?.[i10] ?? `${b10.basePath}/${i10.toLowerCase()}`, k2 = `${d10.url.origin}${j2}?${h10}`;
          if (f10) return Response.json({ url: k2 });
          return Response.redirect(k2);
        }
      }
      c(990), "u" < typeof URLPattern || URLPattern;
      var i7 = c(345);
      class i8 extends Error {
        constructor(a10) {
          super(`Dynamic server usage: ${a10}`), this.description = a10, this.digest = "DYNAMIC_SERVER_USAGE";
        }
      }
      class i9 extends Error {
        constructor(...a10) {
          super(...a10), this.code = "NEXT_STATIC_GEN_BAILOUT";
        }
      }
      var ja = ((l = {})[l.Before = 1] = "Before", l[l.ShellStatic = 11] = "ShellStatic", l[l.Static = 13] = "Static", l[l.ShellRuntime = 21] = "ShellRuntime", l[l.Runtime = 23] = "Runtime", l[l.Dynamic = 30] = "Dynamic", l[l.Abandoned = 40] = "Abandoned", l);
      class jb extends Error {
        constructor(a10, b10) {
          super(`During prerendering, ${b10} rejects when the prerender is complete. Typically these errors are handled by React but if you move ${b10} to a different context by using \`setTimeout\`, \`after\`, or similar functions you may observe this error and you should handle it in that context. This occurred at route "${a10}".`), this.route = a10, this.expression = b10, this.digest = "HANGING_PROMISE_REJECTION";
        }
      }
      let jc = /* @__PURE__ */ new WeakMap();
      function jd(a10, b10, c10, d10) {
        return null !== d10 && function(a11) {
          var b11, c11 = a11, d11 = false;
          if ("prerender" === c11.type) {
            null == (b11 = c11.runtimeDataAccessed) || b11.resolve(true);
            let a12 = c11.shouldAttemptStaticPrefetch;
            null === a12 || d11 && c11.isFallbackUpgradeable || (a12.current = false);
          }
        }(d10), function(a11, b11) {
          if (a11.aborted) return Promise.reject(b11);
          {
            let c11 = new Promise((c12, d11) => {
              let e10 = d11.bind(null, b11), f10 = jc.get(a11);
              if (f10) f10.push(e10);
              else {
                let b12 = [e10];
                jc.set(a11, b12), a11.addEventListener("abort", () => {
                  for (let a12 = 0; a12 < b12.length; a12++) b12[a12]();
                }, { once: true });
              }
            });
            return c11.catch(je), c11;
          }
        }(a10, new jb(b10, c10));
      }
      function je() {
      }
      let jf = { sessionData: ja.ShellRuntime, staticLinkData: ja.Static, runtimeLinkData: ja.Runtime }, jg = "function" == typeof i7.unstable_postpone;
      function jh(a10, b10, c10) {
        let d10 = Object.defineProperty(new i8(`Route ${b10.route} couldn't be rendered statically because it used \`${a10}\`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error`), "__NEXT_ERROR_CODE", { value: "E558", enumerable: false, configurable: true });
        throw c10.revalidate = 0, b10.dynamicUsageDescription = a10, b10.dynamicUsageStack = d10.stack, d10;
      }
      function ji(a10) {
        switch (a10.type) {
          case "cache":
          case "unstable-cache":
          case "private-cache":
            return;
        }
      }
      function jj(a10, b10, c10) {
        (function() {
          if (!jg) throw Object.defineProperty(Error("Invariant: React.unstable_postpone is not defined. This suggests the wrong version of React was loaded. This is a bug in Next.js"), "__NEXT_ERROR_CODE", { value: "E224", enumerable: false, configurable: true });
        })(), c10 && c10.dynamicAccesses.push({ stack: c10.isDebugDynamicAccesses ? Error().stack : void 0, expression: b10 }), i7.unstable_postpone(jk(a10, b10));
      }
      function jk(a10, b10) {
        return `Route ${a10} needs to bail out of prerendering at this point because it used ${b10}. React throws this special object to indicate where. It should not be caught by your own try/catch. Learn more: https://nextjs.org/docs/messages/ppr-caught-error`;
      }
      if (false === ((m = jk("%%%", "^^^")).includes("needs to bail out of prerendering at this point because it used") && m.includes("Learn more: https://nextjs.org/docs/messages/ppr-caught-error"))) throw Object.defineProperty(Error("Invariant: isDynamicPostpone misidentified a postpone reason. This is a bug in Next.js"), "__NEXT_ERROR_CODE", { value: "E296", enumerable: false, configurable: true });
      RegExp("\\n\\s+at Suspense \\(<anonymous>\\)(?:(?!\\n\\s+at (?:body|div|main|section|article|aside|header|footer|nav|form|p|span|h1|h2|h3|h4|h5|h6) \\(<anonymous>\\))[\\s\\S])*?\\n\\s+at __next_root_layout_boundary__ \\([^\\n]*\\)"), RegExp("\\n\\s+at __next_metadata_boundary__[\\n\\s]"), RegExp("\\n\\s+at __next_viewport_boundary__[\\n\\s]"), RegExp("\\n\\s+at __next_outlet_boundary__[\\n\\s]"), RegExp("\\n\\s+at __next_instant_validation_boundary__[\\n\\s]"), RegExp("\\n\\s+at __next_instant_slot_(\\d+)__[\\n\\s]");
      let jl = ar();
      function jm(a10) {
        switch (a10.phase) {
          case "action":
          case "render":
            return true;
          case "after": {
            let a11 = jl.getStore();
            if (a11 && (a11.isAppRoute || a11.isAction)) return true;
            let b10 = br.getStore();
            if (b10) return "action" === b10.rootTaskSpawnPhase;
            return false;
          }
        }
      }
      function jn(a10) {
        let b10 = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
        if (!b10) return a10;
        let { origin: c10 } = new URL(b10), { href: d10, origin: e10 } = a10.nextUrl;
        return new aa(d10.replace(e10, c10), a10);
      }
      function jo(a10) {
        try {
          a10.secret ?? (a10.secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET);
          let b10 = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
          if (!b10) return;
          let { pathname: c10 } = new URL(b10);
          if ("/" === c10) return;
          a10.basePath || (a10.basePath = c10);
        } catch {
        } finally {
          a10.basePath || (a10.basePath = "/api/auth"), function(a11, b10, c10 = false) {
            try {
              let d10 = a11.AUTH_URL;
              d10 && (b10.basePath ? c10 || fj(b10).warn("env-url-basepath-redundant") : b10.basePath = new URL(d10).pathname);
            } catch {
            } finally {
              b10.basePath ?? (b10.basePath = "/auth");
            }
            if (!b10.secret?.length) {
              b10.secret = [];
              let c11 = a11.AUTH_SECRET;
              for (let d10 of (c11 && b10.secret.push(c11), [1, 2, 3])) {
                let c12 = a11[`AUTH_SECRET_${d10}`];
                c12 && b10.secret.unshift(c12);
              }
            }
            b10.redirectProxyUrl ?? (b10.redirectProxyUrl = a11.AUTH_REDIRECT_PROXY_URL), b10.trustHost ?? (b10.trustHost = !!(a11.AUTH_URL ?? a11.AUTH_TRUST_HOST ?? a11.VERCEL ?? a11.CF_PAGES ?? "production" !== a11.NODE_ENV)), b10.providers = b10.providers.map((b11) => {
              let { id: c11 } = "function" == typeof b11 ? b11({}) : b11, d10 = c11.toUpperCase().replace(/-/g, "_"), e10 = a11[`AUTH_${d10}_ID`], f10 = a11[`AUTH_${d10}_SECRET`], g10 = a11[`AUTH_${d10}_ISSUER`], h10 = a11[`AUTH_${d10}_KEY`], i10 = "function" == typeof b11 ? b11({ clientId: e10, clientSecret: f10, issuer: g10, apiKey: h10 }) : b11;
              return "oauth" === i10.type || "oidc" === i10.type ? (i10.clientId ?? (i10.clientId = e10), i10.clientSecret ?? (i10.clientSecret = f10), i10.issuer ?? (i10.issuer = g10)) : "email" === i10.type && (i10.apiKey ?? (i10.apiKey = h10)), i10;
            });
          }(process.env, a10, true);
        }
      }
      let jp = { current: null }, jq = "function" == typeof i7.cache ? i7.cache : (a10) => a10, jr = console.warn;
      function js(a10) {
        return function(...b10) {
          jr(a10(...b10));
        };
      }
      function jt() {
        let a10 = "cookies", b10 = as.getStore(), c10 = a5.getStore();
        if (b10) {
          if (c10 && !jm(c10)) throw Object.defineProperty(Error(`Route ${b10.route} used \`cookies()\` inside \`after()\` while rendering. This is not supported. If you need this data inside an \`after()\` callback, use \`cookies()\` outside of the callback. See more info here: https://nextjs.org/docs/app/api-reference/functions/after`), "__NEXT_ERROR_CODE", { value: "E1381", enumerable: false, configurable: true });
          if (b10.forceStatic) return jv(au.seal(new $.RequestCookies(new Headers({}))));
          if (b10.dynamicShouldError) throw Object.defineProperty(new i9(`Route ${b10.route} with \`dynamic = "error"\` couldn't be rendered statically because it used \`cookies()\`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`), "__NEXT_ERROR_CODE", { value: "E849", enumerable: false, configurable: true });
          if (c10) switch (c10.type) {
            case "cache":
              let f10 = Object.defineProperty(Error(`Route ${b10.route} used \`cookies()\` inside "use cache". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use \`cookies()\` outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`), "__NEXT_ERROR_CODE", { value: "E831", enumerable: false, configurable: true });
              throw Error.captureStackTrace(f10, jt), b10.invalidDynamicUsageError ??= f10, f10;
            case "unstable-cache":
              throw Object.defineProperty(Error(`Route ${b10.route} used \`cookies()\` inside a function cached with \`unstable_cache()\`. Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use \`cookies()\` outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`), "__NEXT_ERROR_CODE", { value: "E846", enumerable: false, configurable: true });
            case "generate-static-params":
              throw Object.defineProperty(Error(`Route ${b10.route} used \`cookies()\` inside \`generateStaticParams\`. This is not supported because \`generateStaticParams\` runs at build time without an HTTP request. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context`), "__NEXT_ERROR_CODE", { value: "E1123", enumerable: false, configurable: true });
            case "prerender":
              var d10 = b10, e10 = c10;
              let g10 = ju.get(e10);
              if (g10) return g10;
              let h10 = jd(e10.renderSignal, d10.route, "`cookies()`", e10);
              return ju.set(e10, h10), h10;
            case "prerender-client":
            case "validation-client":
              let i10 = "`cookies`";
              throw Object.defineProperty(new ba(`${i10} must not be used within a Client Component. Next.js should be preventing ${i10} from being included in Client Components statically, but did not in this case.`), "__NEXT_ERROR_CODE", { value: "E1037", enumerable: false, configurable: true });
            case "prerender-ppr":
              return jj(b10.route, a10, c10.dynamicTracking);
            case "prerender-legacy":
              return jh(a10, b10, c10);
            case "prerender-runtime": {
              let { stagedRendering: a11 } = c10;
              if (a11) return a11.delayUntilStage(jf.sessionData, "cookies", c10.cookies);
              return jv(c10.cookies);
            }
            case "private-cache":
              return jv(c10.cookies);
            case "request":
              let j2;
              if (ji(c10), j2 = ax(c10) ? c10.userspaceMutableCookies : c10.cookies, !c10.asyncApiPromises) return jv(j2);
              if (j2 === c10.mutableCookies) return c10.asyncApiPromises.mutableCookies;
              return c10.asyncApiPromises.cookies;
          }
        }
        a6(a10);
      }
      jq((a10) => {
        try {
          jr(jp.current);
        } finally {
          jp.current = null;
        }
      });
      let ju = /* @__PURE__ */ new WeakMap();
      function jv(a10) {
        let b10 = ju.get(a10);
        if (b10) return b10;
        let c10 = Promise.resolve(a10);
        return ju.set(a10, c10), c10;
      }
      function jw() {
        let a10 = "headers", b10 = as.getStore(), c10 = a5.getStore();
        if (b10) {
          if (c10 && !jm(c10)) throw Object.defineProperty(Error(`Route ${b10.route} used \`headers()\` inside \`after()\` while rendering. This is not supported. If you need this data inside an \`after()\` callback, use \`headers()\` outside of the callback. See more info here: https://nextjs.org/docs/app/api-reference/functions/after`), "__NEXT_ERROR_CODE", { value: "E1378", enumerable: false, configurable: true });
          if (b10.forceStatic) return jy(an.seal(new Headers({})));
          if (c10) switch (c10.type) {
            case "cache": {
              let a11 = Object.defineProperty(Error(`Route ${b10.route} used \`headers()\` inside "use cache". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use \`headers()\` outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`), "__NEXT_ERROR_CODE", { value: "E833", enumerable: false, configurable: true });
              throw Error.captureStackTrace(a11, jw), b10.invalidDynamicUsageError ??= a11, a11;
            }
            case "unstable-cache":
              throw Object.defineProperty(Error(`Route ${b10.route} used \`headers()\` inside a function cached with \`unstable_cache()\`. Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use \`headers()\` outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`), "__NEXT_ERROR_CODE", { value: "E838", enumerable: false, configurable: true });
            case "generate-static-params":
              throw Object.defineProperty(Error(`Route ${b10.route} used \`headers()\` inside \`generateStaticParams\`. This is not supported because \`generateStaticParams\` runs at build time without an HTTP request. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context`), "__NEXT_ERROR_CODE", { value: "E1134", enumerable: false, configurable: true });
          }
          if (b10.dynamicShouldError) throw Object.defineProperty(new i9(`Route ${b10.route} with \`dynamic = "error"\` couldn't be rendered statically because it used \`headers()\`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`), "__NEXT_ERROR_CODE", { value: "E828", enumerable: false, configurable: true });
          if (c10) switch (c10.type) {
            case "prerender":
              var d10 = b10, e10 = c10;
              let f10 = jx.get(e10);
              if (f10) return f10;
              let g10 = jd(e10.renderSignal, d10.route, "`headers()`", e10);
              return jx.set(e10, g10), g10;
            case "prerender-client":
            case "validation-client":
              let h10 = "`headers`";
              throw Object.defineProperty(new ba(`${h10} must not be used within a client component. Next.js should be preventing ${h10} from being included in client components statically, but did not in this case.`), "__NEXT_ERROR_CODE", { value: "E1017", enumerable: false, configurable: true });
            case "prerender-ppr":
              return jj(b10.route, a10, c10.dynamicTracking);
            case "prerender-legacy":
              return jh(a10, b10, c10);
            case "prerender-runtime": {
              let { stagedRendering: a11 } = c10;
              if (a11) return a11.delayUntilStage(jf.sessionData, "headers", c10.headers);
              return jy(c10.headers);
            }
            case "private-cache":
              return jy(c10.headers);
            case "request":
              if (ji(c10), c10.asyncApiPromises) return c10.asyncApiPromises.headers;
              return jy(c10.headers);
          }
        }
        a6(a10);
      }
      js(function(a10, b10) {
        let c10 = a10 ? `Route "${a10}" ` : "This route ";
        return Object.defineProperty(Error(`${c10}used ${b10}. \`cookies()\` returns a Promise and must be unwrapped with \`await\` or \`React.use()\` before accessing its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`), "__NEXT_ERROR_CODE", { value: "E830", enumerable: false, configurable: true });
      });
      let jx = /* @__PURE__ */ new WeakMap();
      function jy(a10) {
        let b10 = jx.get(a10);
        if (b10) return b10;
        let c10 = Promise.resolve(a10);
        return jx.set(a10, c10), c10;
      }
      async function jz(a10, b10) {
        return i6(new Request(i5("session", a10.get("x-forwarded-proto"), a10, process.env, b10), { headers: { cookie: a10.get("cookie") ?? "" } }), { ...b10, callbacks: { ...b10.callbacks, async session(...a11) {
          let c10 = await b10.callbacks?.session?.(...a11) ?? { ...a11[0].session, expires: a11[0].session.expires?.toISOString?.() ?? a11[0].session.expires };
          return { user: a11[0].user ?? a11[0].token, ...c10 };
        } } });
      }
      async function jA(a10) {
        return a10.ok ? await a10.json() : null;
      }
      function jB(a10) {
        return "function" == typeof a10;
      }
      function jC(a10, b10) {
        return "function" == typeof a10 ? async (...c10) => {
          if (!c10.length) {
            let c11 = await jw(), d11 = await a10(void 0);
            return b10?.(d11), jz(c11, d11).then(jA);
          }
          if (c10[0] instanceof Request) {
            let d11 = c10[0], e11 = c10[1], f11 = await a10(d11);
            return b10?.(f11), jD([d11, e11], f11);
          }
          if (jB(c10[0])) {
            let d11 = c10[0];
            return async (...c11) => {
              let e11 = await a10(c11[0]);
              return b10?.(e11), jD(c11, e11, d11);
            };
          }
          let d10 = "req" in c10[0] ? c10[0].req : c10[0], e10 = "res" in c10[0] ? c10[0].res : c10[1], f10 = await a10(d10);
          return b10?.(f10), jz(new Headers(d10.headers), f10).then(async (a11) => {
            let b11 = await jA(a11);
            for (let b12 of a11.headers.getSetCookie()) "headers" in e10 ? e10.headers.append("set-cookie", b12) : e10.appendHeader("set-cookie", b12);
            return b11;
          });
        } : (...b11) => {
          if (!b11.length) return Promise.resolve(jw()).then((b12) => jz(b12, a10).then(jA));
          if (b11[0] instanceof Request) return jD([b11[0], b11[1]], a10);
          if (jB(b11[0])) {
            let c11 = b11[0];
            return async (...b12) => jD(b12, a10, c11).then((a11) => a11);
          }
          let c10 = "req" in b11[0] ? b11[0].req : b11[0], d10 = "res" in b11[0] ? b11[0].res : b11[1];
          return jz(new Headers(c10.headers), a10).then(async (a11) => {
            let b12 = await jA(a11);
            for (let b13 of a11.headers.getSetCookie()) "headers" in d10 ? d10.headers.append("set-cookie", b13) : d10.appendHeader("set-cookie", b13);
            return b12;
          });
        };
      }
      async function jD(a10, b10, c10) {
        let d10 = jn(a10[0]), e10 = await jz(d10.headers, b10), f10 = await jA(e10), g10 = true;
        b10.callbacks?.authorized && (g10 = await b10.callbacks.authorized({ request: d10, auth: f10 }));
        let h10 = af.next?.();
        if (g10 instanceof Response) {
          var i10, j2, k2;
          let a11, c11;
          h10 = g10;
          let e11 = g10.headers.get("Location"), { pathname: f11 } = d10.nextUrl;
          e11 && (i10 = f11, j2 = new URL(e11).pathname, k2 = b10, a11 = j2.replace(`${i10}/`, ""), c11 = Object.values(k2.pages ?? {}), (jE.has(a11) || c11.includes(j2)) && j2 === i10) && (g10 = true);
        } else if (c10) d10.auth = f10, h10 = await c10(d10, a10[1]) ?? af.next();
        else if (!g10) {
          let a11 = b10.pages?.signIn ?? `${b10.basePath}/signin`;
          if (d10.nextUrl.pathname !== a11) {
            let b11 = d10.nextUrl.clone();
            b11.pathname = a11, b11.searchParams.set("callbackUrl", d10.nextUrl.href), h10 = af.redirect(b11);
          }
        }
        let l2 = new Response(h10?.body, h10);
        for (let a11 of e10.headers.getSetCookie()) l2.headers.append("set-cookie", a11);
        return l2;
      }
      js(function(a10, b10) {
        let c10 = a10 ? `Route "${a10}" ` : "This route ";
        return Object.defineProperty(Error(`${c10}used ${b10}. \`headers()\` returns a Promise and must be unwrapped with \`await\` or \`React.use()\` before accessing its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`), "__NEXT_ERROR_CODE", { value: "E836", enumerable: false, configurable: true });
      }), /* @__PURE__ */ new WeakMap(), js(function(a10, b10) {
        let c10 = a10 ? `Route "${a10}" ` : "This route ";
        return Object.defineProperty(Error(`${c10}used ${b10}. \`draftMode()\` returns a Promise and must be unwrapped with \`await\` or \`React.use()\` before accessing its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`), "__NEXT_ERROR_CODE", { value: "E835", enumerable: false, configurable: true });
      });
      let jE = /* @__PURE__ */ new Set(["providers", "session", "csrf", "signin", "signout", "callback", "verify-request", "error"]);
      var jF = ((n = {})[n.SeeOther = 303] = "SeeOther", n[n.TemporaryRedirect = 307] = "TemporaryRedirect", n[n.PermanentRedirect = 308] = "PermanentRedirect", n);
      let jG = "NEXT_REDIRECT";
      function jH(a10, b10) {
        throw function(a11, b11, c10 = jF.TemporaryRedirect) {
          let d10 = Object.defineProperty(Error(jG), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
          return d10.digest = `${jG};${b11};${a11};${c10};`, d10;
        }(a10, b10 ??= jl?.getStore()?.isAction ? "push" : "replace", jF.TemporaryRedirect);
      }
      async function jI(a10, b10 = {}, c10, d10) {
        let e10 = new Headers(await jw()), { redirect: f10 = true, redirectTo: g10, ...h10 } = b10 instanceof FormData ? Object.fromEntries(b10) : b10, i10 = g10?.toString() ?? e10.get("Referer") ?? "/", j2 = i5("signin", e10.get("x-forwarded-proto"), e10, process.env, d10);
        if (!a10) return j2.searchParams.append("callbackUrl", i10), f10 && jH(j2.toString()), j2.toString();
        let k2 = `${j2}/${a10}?${new URLSearchParams(c10)}`, l2 = {};
        for (let b11 of d10.providers) {
          let { options: c11, ...d11 } = "function" == typeof b11 ? b11() : b11, e11 = c11?.id ?? d11.id;
          if (e11 === a10) {
            l2 = { id: e11, type: c11?.type ?? d11.type };
            break;
          }
        }
        if (!l2.id) {
          let a11 = `${j2}?${new URLSearchParams({ callbackUrl: i10 })}`;
          return f10 && jH(a11), a11;
        }
        "credentials" === l2.type && (k2 = k2.replace("signin", "callback")), e10.set("Content-Type", "application/x-www-form-urlencoded");
        let m2 = new Request(k2, { method: "POST", headers: e10, body: new URLSearchParams({ ...h10, callbackUrl: i10 }) }), n2 = await i6(m2, { ...d10, raw: fx, skipCSRFCheck: fw }), o2 = await jt();
        for (let a11 of n2?.cookies ?? []) o2.set(a11.name, a11.value, a11.options);
        let p2 = (n2 instanceof Response ? n2.headers.get("Location") : n2.redirect) ?? k2;
        return f10 ? jH(p2) : p2;
      }
      async function jJ(a10, b10) {
        let c10 = new Headers(await jw());
        c10.set("Content-Type", "application/x-www-form-urlencoded");
        let d10 = i5("signout", c10.get("x-forwarded-proto"), c10, process.env, b10), e10 = new URLSearchParams({ callbackUrl: a10?.redirectTo ?? c10.get("Referer") ?? "/" }), f10 = new Request(d10, { method: "POST", headers: c10, body: e10 }), g10 = await i6(f10, { ...b10, raw: fx, skipCSRFCheck: fw }), h10 = await jt();
        for (let a11 of g10?.cookies ?? []) h10.set(a11.name, a11.value, a11.options);
        return a10?.redirect ?? true ? jH(g10.redirect) : g10;
      }
      async function jK(a10, b10) {
        let c10 = new Headers(await jw());
        c10.set("Content-Type", "application/json");
        let d10 = new Request(i5("session", c10.get("x-forwarded-proto"), c10, process.env, b10), { method: "POST", headers: c10, body: JSON.stringify({ data: a10 }) }), e10 = await i6(d10, { ...b10, raw: fx, skipCSRFCheck: fw }), f10 = await jt();
        for (let a11 of e10?.cookies ?? []) f10.set(a11.name, a11.value, a11.options);
        return e10.body;
      }
      Object.values({ NOT_FOUND: 404, FORBIDDEN: 403, UNAUTHORIZED: 401 }), Symbol.for("react.postpone");
      let { auth: jL } = function(a10) {
        if ("function" == typeof a10) {
          let b11 = async (b12) => {
            let c10 = await a10(b12);
            return jo(c10), i6(jn(b12), c10);
          };
          return { handlers: { GET: b11, POST: b11 }, auth: jC(a10, (a11) => jo(a11)), signIn: async (b12, c10, d10) => {
            let e10 = await a10(void 0);
            return jo(e10), jI(b12, c10, d10, e10);
          }, signOut: async (b12) => {
            let c10 = await a10(void 0);
            return jo(c10), jJ(b12, c10);
          }, unstable_update: async (b12) => {
            let c10 = await a10(void 0);
            return jo(c10), jK(b12, c10);
          } };
        }
        jo(a10);
        let b10 = (b11) => i6(jn(b11), a10);
        return { handlers: { GET: b10, POST: b10 }, auth: jC(a10), signIn: (b11, c10, d10) => jI(b11, c10, d10, a10), signOut: (b11) => jJ(b11, a10), unstable_update: (b11) => jK(b11, a10) };
      }({ trustHost: true, session: { strategy: "jwt" }, pages: { signIn: "/login" }, providers: [], callbacks: { jwt: ({ token: a10, user: b10 }) => (b10 && (a10.id = b10.id, a10.mnv = b10.mnv, a10.fullName = b10.fullName, a10.position = b10.position, a10.department = b10.department, a10.role = b10.role), a10), session({ session: a10, token: b10 }) {
        if (a10.user) {
          let c10 = a10.user;
          c10.id = b10.id, c10.mnv = b10.mnv, c10.fullName = b10.fullName, c10.position = b10.position, c10.department = b10.department, c10.role = b10.role;
        }
        return a10;
      } } }), jM = jL((a10) => {
        let { pathname: b10 } = a10.nextUrl;
        if (!(b10.startsWith("/dashboard") || b10.startsWith("/admin"))) return af.next();
        if (!a10.auth) {
          let c10 = new URL("/login", a10.nextUrl.origin);
          return c10.searchParams.set("callbackUrl", b10), af.redirect(c10);
        }
        return af.next();
      }), jN = { matcher: ["/dashboard/:path*", "/admin/:path*"] }, jO = { ...p }, jP = "/src/middleware", jQ = (0, jO.middleware || jO.default);
      class jR extends Error {
        constructor(a10) {
          super(a10), Object.defineProperty(this, "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true }), this.stack = "";
        }
      }
      if ("function" != typeof jQ) throw new jR(`The Middleware file "${jP}" must export a function named \`middleware\` or a default function.`);
      let jS = async (a10) => bI({ ...a10, IncrementalCache: cq, incrementalCacheHandler: null, page: jP, handler: async (...a11) => {
        try {
          return await jQ(...a11);
        } catch (e10) {
          let b10 = a11[0], c10 = new URL(b10.url), d10 = c10.pathname + c10.search;
          throw await t(e10, { path: d10, method: b10.method, headers: Object.fromEntries(b10.headers.entries()) }, { routerKind: "Pages Router", routePath: "/proxy", routeType: "proxy", revalidateReason: void 0 }), e10;
        }
      } });
      async function jT(a10, b10) {
        let c10 = await jS({ request: { url: a10.url, method: a10.method, headers: I(a10.headers), nextConfig: { basePath: "", i18n: "", trailingSlash: false, experimental: { cacheLife: { default: { stale: 300, revalidate: 900, expire: 4294967294 }, seconds: { stale: 30, revalidate: 1, expire: 60 }, minutes: { stale: 300, revalidate: 60, expire: 3600 }, hours: { stale: 300, revalidate: 3600, expire: 86400 }, days: { stale: 300, revalidate: 86400, expire: 604800 }, weeks: { stale: 300, revalidate: 604800, expire: 2592e3 }, max: { stale: 300, revalidate: 2592e3, expire: 31536e3 } }, authInterrupts: false, clientParamParsingOrigins: [] } }, page: { name: jP }, body: "GET" !== a10.method && "HEAD" !== a10.method ? a10.body ?? void 0 : void 0, waitUntil: b10.waitUntil, requestMeta: b10.requestMeta, signal: b10.signal || new AbortController().signal } });
        return null == b10.waitUntil || b10.waitUntil.call(b10, c10.waitUntil), c10.response;
      }
      let jU = jS;
    }, 232: (a) => {
      (() => {
        "use strict";
        var b = { 234: (a2) => {
          var b2 = Object.prototype.hasOwnProperty, c2 = "~";
          function d2() {
          }
          function e2(a3, b3, c3) {
            this.fn = a3, this.context = b3, this.once = c3 || false;
          }
          function f(a3, b3, d3, f2, g2) {
            if ("function" != typeof d3) throw TypeError("The listener must be a function");
            var h2 = new e2(d3, f2 || a3, g2), i = c2 ? c2 + b3 : b3;
            return a3._events[i] ? a3._events[i].fn ? a3._events[i] = [a3._events[i], h2] : a3._events[i].push(h2) : (a3._events[i] = h2, a3._eventsCount++), a3;
          }
          function g(a3, b3) {
            0 == --a3._eventsCount ? a3._events = new d2() : delete a3._events[b3];
          }
          function h() {
            this._events = new d2(), this._eventsCount = 0;
          }
          Object.create && (d2.prototype = /* @__PURE__ */ Object.create(null), new d2().__proto__ || (c2 = false)), h.prototype.eventNames = function() {
            var a3, d3, e3 = [];
            if (0 === this._eventsCount) return e3;
            for (d3 in a3 = this._events) b2.call(a3, d3) && e3.push(c2 ? d3.slice(1) : d3);
            return Object.getOwnPropertySymbols ? e3.concat(Object.getOwnPropertySymbols(a3)) : e3;
          }, h.prototype.listeners = function(a3) {
            var b3 = c2 ? c2 + a3 : a3, d3 = this._events[b3];
            if (!d3) return [];
            if (d3.fn) return [d3.fn];
            for (var e3 = 0, f2 = d3.length, g2 = Array(f2); e3 < f2; e3++) g2[e3] = d3[e3].fn;
            return g2;
          }, h.prototype.listenerCount = function(a3) {
            var b3 = c2 ? c2 + a3 : a3, d3 = this._events[b3];
            return d3 ? d3.fn ? 1 : d3.length : 0;
          }, h.prototype.emit = function(a3, b3, d3, e3, f2, g2) {
            var h2 = c2 ? c2 + a3 : a3;
            if (!this._events[h2]) return false;
            var i, j, k = this._events[h2], l = arguments.length;
            if (k.fn) {
              switch (k.once && this.removeListener(a3, k.fn, void 0, true), l) {
                case 1:
                  return k.fn.call(k.context), true;
                case 2:
                  return k.fn.call(k.context, b3), true;
                case 3:
                  return k.fn.call(k.context, b3, d3), true;
                case 4:
                  return k.fn.call(k.context, b3, d3, e3), true;
                case 5:
                  return k.fn.call(k.context, b3, d3, e3, f2), true;
                case 6:
                  return k.fn.call(k.context, b3, d3, e3, f2, g2), true;
              }
              for (j = 1, i = Array(l - 1); j < l; j++) i[j - 1] = arguments[j];
              k.fn.apply(k.context, i);
            } else {
              var m, n = k.length;
              for (j = 0; j < n; j++) switch (k[j].once && this.removeListener(a3, k[j].fn, void 0, true), l) {
                case 1:
                  k[j].fn.call(k[j].context);
                  break;
                case 2:
                  k[j].fn.call(k[j].context, b3);
                  break;
                case 3:
                  k[j].fn.call(k[j].context, b3, d3);
                  break;
                case 4:
                  k[j].fn.call(k[j].context, b3, d3, e3);
                  break;
                default:
                  if (!i) for (m = 1, i = Array(l - 1); m < l; m++) i[m - 1] = arguments[m];
                  k[j].fn.apply(k[j].context, i);
              }
            }
            return true;
          }, h.prototype.on = function(a3, b3, c3) {
            return f(this, a3, b3, c3, false);
          }, h.prototype.once = function(a3, b3, c3) {
            return f(this, a3, b3, c3, true);
          }, h.prototype.removeListener = function(a3, b3, d3, e3) {
            var f2 = c2 ? c2 + a3 : a3;
            if (!this._events[f2]) return this;
            if (!b3) return g(this, f2), this;
            var h2 = this._events[f2];
            if (h2.fn) h2.fn !== b3 || e3 && !h2.once || d3 && h2.context !== d3 || g(this, f2);
            else {
              for (var i = 0, j = [], k = h2.length; i < k; i++) (h2[i].fn !== b3 || e3 && !h2[i].once || d3 && h2[i].context !== d3) && j.push(h2[i]);
              j.length ? this._events[f2] = 1 === j.length ? j[0] : j : g(this, f2);
            }
            return this;
          }, h.prototype.removeAllListeners = function(a3) {
            var b3;
            return a3 ? (b3 = c2 ? c2 + a3 : a3, this._events[b3] && g(this, b3)) : (this._events = new d2(), this._eventsCount = 0), this;
          }, h.prototype.off = h.prototype.removeListener, h.prototype.addListener = h.prototype.on, h.prefixed = c2, h.EventEmitter = h, a2.exports = h;
        }, 274: (a2) => {
          a2.exports = (a3, b2) => (b2 = b2 || (() => {
          }), a3.then((a4) => new Promise((a5) => {
            a5(b2());
          }).then(() => a4), (a4) => new Promise((a5) => {
            a5(b2());
          }).then(() => {
            throw a4;
          })));
        }, 294: (a2, b2) => {
          Object.defineProperty(b2, "__esModule", { value: true }), b2.default = function(a3, b3, c2) {
            let d2 = 0, e2 = a3.length;
            for (; e2 > 0; ) {
              let f = e2 / 2 | 0, g = d2 + f;
              0 >= c2(a3[g], b3) ? (d2 = ++g, e2 -= f + 1) : e2 = f;
            }
            return d2;
          };
        }, 838: (a2, b2, c2) => {
          Object.defineProperty(b2, "__esModule", { value: true });
          let d2 = c2(294);
          class e2 {
            constructor() {
              this._queue = [];
            }
            enqueue(a3, b3) {
              let c3 = { priority: (b3 = Object.assign({ priority: 0 }, b3)).priority, run: a3 };
              if (this.size && this._queue[this.size - 1].priority >= b3.priority) return void this._queue.push(c3);
              let e3 = d2.default(this._queue, c3, (a4, b4) => b4.priority - a4.priority);
              this._queue.splice(e3, 0, c3);
            }
            dequeue() {
              let a3 = this._queue.shift();
              return null == a3 ? void 0 : a3.run;
            }
            filter(a3) {
              return this._queue.filter((b3) => b3.priority === a3.priority).map((a4) => a4.run);
            }
            get size() {
              return this._queue.length;
            }
          }
          b2.default = e2;
        }, 138: (a2, b2, c2) => {
          let d2 = c2(274);
          class e2 extends Error {
            constructor(a3) {
              super(a3), this.name = "TimeoutError";
            }
          }
          let f = (a3, b3, c3) => new Promise((f2, g) => {
            if ("number" != typeof b3 || b3 < 0) throw TypeError("Expected `milliseconds` to be a positive number");
            if (b3 === 1 / 0) return void f2(a3);
            let h = setTimeout(() => {
              if ("function" == typeof c3) {
                try {
                  f2(c3());
                } catch (a4) {
                  g(a4);
                }
                return;
              }
              let d3 = "string" == typeof c3 ? c3 : `Promise timed out after ${b3} milliseconds`, h2 = c3 instanceof Error ? c3 : new e2(d3);
              "function" == typeof a3.cancel && a3.cancel(), g(h2);
            }, b3);
            d2(a3.then(f2, g), () => {
              clearTimeout(h);
            });
          });
          a2.exports = f, a2.exports.default = f, a2.exports.TimeoutError = e2;
        } }, c = {};
        function d(a2) {
          var e2 = c[a2];
          if (void 0 !== e2) return e2.exports;
          var f = c[a2] = { exports: {} }, g = true;
          try {
            b[a2](f, f.exports, d), g = false;
          } finally {
            g && delete c[a2];
          }
          return f.exports;
        }
        d.ab = "//";
        var e = {};
        (() => {
          Object.defineProperty(e, "__esModule", { value: true });
          let a2 = d(234), b2 = d(138), c2 = d(838), f = () => {
          }, g = new b2.TimeoutError();
          class h extends a2 {
            constructor(a3) {
              var b3, d2, e2, g2;
              if (super(), this._intervalCount = 0, this._intervalEnd = 0, this._pendingCount = 0, this._resolveEmpty = f, this._resolveIdle = f, !("number" == typeof (a3 = Object.assign({ carryoverConcurrencyCount: false, intervalCap: 1 / 0, interval: 0, concurrency: 1 / 0, autoStart: true, queueClass: c2.default }, a3)).intervalCap && a3.intervalCap >= 1)) throw TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${null != (d2 = null == (b3 = a3.intervalCap) ? void 0 : b3.toString()) ? d2 : ""}\` (${typeof a3.intervalCap})`);
              if (void 0 === a3.interval || !(Number.isFinite(a3.interval) && a3.interval >= 0)) throw TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${null != (g2 = null == (e2 = a3.interval) ? void 0 : e2.toString()) ? g2 : ""}\` (${typeof a3.interval})`);
              this._carryoverConcurrencyCount = a3.carryoverConcurrencyCount, this._isIntervalIgnored = a3.intervalCap === 1 / 0 || 0 === a3.interval, this._intervalCap = a3.intervalCap, this._interval = a3.interval, this._queue = new a3.queueClass(), this._queueClass = a3.queueClass, this.concurrency = a3.concurrency, this._timeout = a3.timeout, this._throwOnTimeout = true === a3.throwOnTimeout, this._isPaused = false === a3.autoStart;
            }
            get _doesIntervalAllowAnother() {
              return this._isIntervalIgnored || this._intervalCount < this._intervalCap;
            }
            get _doesConcurrentAllowAnother() {
              return this._pendingCount < this._concurrency;
            }
            _next() {
              this._pendingCount--, this._tryToStartAnother(), this.emit("next");
            }
            _resolvePromises() {
              this._resolveEmpty(), this._resolveEmpty = f, 0 === this._pendingCount && (this._resolveIdle(), this._resolveIdle = f, this.emit("idle"));
            }
            _onResumeInterval() {
              this._onInterval(), this._initializeIntervalIfNeeded(), this._timeoutId = void 0;
            }
            _isIntervalPaused() {
              let a3 = Date.now();
              if (void 0 === this._intervalId) {
                let b3 = this._intervalEnd - a3;
                if (!(b3 < 0)) return void 0 === this._timeoutId && (this._timeoutId = setTimeout(() => {
                  this._onResumeInterval();
                }, b3)), true;
                this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
              }
              return false;
            }
            _tryToStartAnother() {
              if (0 === this._queue.size) return this._intervalId && clearInterval(this._intervalId), this._intervalId = void 0, this._resolvePromises(), false;
              if (!this._isPaused) {
                let a3 = !this._isIntervalPaused();
                if (this._doesIntervalAllowAnother && this._doesConcurrentAllowAnother) {
                  let b3 = this._queue.dequeue();
                  return !!b3 && (this.emit("active"), b3(), a3 && this._initializeIntervalIfNeeded(), true);
                }
              }
              return false;
            }
            _initializeIntervalIfNeeded() {
              this._isIntervalIgnored || void 0 !== this._intervalId || (this._intervalId = setInterval(() => {
                this._onInterval();
              }, this._interval), this._intervalEnd = Date.now() + this._interval);
            }
            _onInterval() {
              0 === this._intervalCount && 0 === this._pendingCount && this._intervalId && (clearInterval(this._intervalId), this._intervalId = void 0), this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0, this._processQueue();
            }
            _processQueue() {
              for (; this._tryToStartAnother(); ) ;
            }
            get concurrency() {
              return this._concurrency;
            }
            set concurrency(a3) {
              if (!("number" == typeof a3 && a3 >= 1)) throw TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${a3}\` (${typeof a3})`);
              this._concurrency = a3, this._processQueue();
            }
            async add(a3, c3 = {}) {
              return new Promise((d2, e2) => {
                let f2 = async () => {
                  this._pendingCount++, this._intervalCount++;
                  try {
                    let f3 = void 0 === this._timeout && void 0 === c3.timeout ? a3() : b2.default(Promise.resolve(a3()), void 0 === c3.timeout ? this._timeout : c3.timeout, () => {
                      (void 0 === c3.throwOnTimeout ? this._throwOnTimeout : c3.throwOnTimeout) && e2(g);
                    });
                    d2(await f3);
                  } catch (a4) {
                    e2(a4);
                  }
                  this._next();
                };
                this._queue.enqueue(f2, c3), this._tryToStartAnother(), this.emit("add");
              });
            }
            async addAll(a3, b3) {
              return Promise.all(a3.map(async (a4) => this.add(a4, b3)));
            }
            start() {
              return this._isPaused && (this._isPaused = false, this._processQueue()), this;
            }
            pause() {
              this._isPaused = true;
            }
            clear() {
              this._queue = new this._queueClass();
            }
            async onEmpty() {
              if (0 !== this._queue.size) return new Promise((a3) => {
                let b3 = this._resolveEmpty;
                this._resolveEmpty = () => {
                  b3(), a3();
                };
              });
            }
            async onIdle() {
              if (0 !== this._pendingCount || 0 !== this._queue.size) return new Promise((a3) => {
                let b3 = this._resolveIdle;
                this._resolveIdle = () => {
                  b3(), a3();
                };
              });
            }
            get size() {
              return this._queue.size;
            }
            sizeBy(a3) {
              return this._queue.filter(a3).length;
            }
            get pending() {
              return this._pendingCount;
            }
            get isPaused() {
              return this._isPaused;
            }
            get timeout() {
              return this._timeout;
            }
            set timeout(a3) {
              this._timeout = a3;
            }
          }
          e.default = h;
        })(), a.exports = e;
      })();
    }, 259: (a) => {
      (() => {
        "use strict";
        "u" > typeof __nccwpck_require__ && (__nccwpck_require__.ab = "//");
        var b = {};
        (() => {
          function a2(a3, b2) {
            void 0 === b2 && (b2 = {});
            for (var c2 = function(a4) {
              for (var b3 = [], c3 = 0; c3 < a4.length; ) {
                var d3 = a4[c3];
                if ("*" === d3 || "+" === d3 || "?" === d3) {
                  b3.push({ type: "MODIFIER", index: c3, value: a4[c3++] });
                  continue;
                }
                if ("\\" === d3) {
                  b3.push({ type: "ESCAPED_CHAR", index: c3++, value: a4[c3++] });
                  continue;
                }
                if ("{" === d3) {
                  b3.push({ type: "OPEN", index: c3, value: a4[c3++] });
                  continue;
                }
                if ("}" === d3) {
                  b3.push({ type: "CLOSE", index: c3, value: a4[c3++] });
                  continue;
                }
                if (":" === d3) {
                  for (var e2 = "", f3 = c3 + 1; f3 < a4.length; ) {
                    var g3 = a4.charCodeAt(f3);
                    if (g3 >= 48 && g3 <= 57 || g3 >= 65 && g3 <= 90 || g3 >= 97 && g3 <= 122 || 95 === g3) {
                      e2 += a4[f3++];
                      continue;
                    }
                    break;
                  }
                  if (!e2) throw TypeError("Missing parameter name at ".concat(c3));
                  b3.push({ type: "NAME", index: c3, value: e2 }), c3 = f3;
                  continue;
                }
                if ("(" === d3) {
                  var h3 = 1, i2 = "", f3 = c3 + 1;
                  if ("?" === a4[f3]) throw TypeError('Pattern cannot start with "?" at '.concat(f3));
                  for (; f3 < a4.length; ) {
                    if ("\\" === a4[f3]) {
                      i2 += a4[f3++] + a4[f3++];
                      continue;
                    }
                    if (")" === a4[f3]) {
                      if (0 == --h3) {
                        f3++;
                        break;
                      }
                    } else if ("(" === a4[f3] && (h3++, "?" !== a4[f3 + 1])) throw TypeError("Capturing groups are not allowed at ".concat(f3));
                    i2 += a4[f3++];
                  }
                  if (h3) throw TypeError("Unbalanced pattern at ".concat(c3));
                  if (!i2) throw TypeError("Missing pattern at ".concat(c3));
                  b3.push({ type: "PATTERN", index: c3, value: i2 }), c3 = f3;
                  continue;
                }
                b3.push({ type: "CHAR", index: c3, value: a4[c3++] });
              }
              return b3.push({ type: "END", index: c3, value: "" }), b3;
            }(a3), d2 = b2.prefixes, f2 = void 0 === d2 ? "./" : d2, g2 = b2.delimiter, h2 = void 0 === g2 ? "/#?" : g2, i = [], j = 0, k = 0, l = "", m = function(a4) {
              if (k < c2.length && c2[k].type === a4) return c2[k++].value;
            }, n = function(a4) {
              var b3 = m(a4);
              if (void 0 !== b3) return b3;
              var d3 = c2[k], e2 = d3.type, f3 = d3.index;
              throw TypeError("Unexpected ".concat(e2, " at ").concat(f3, ", expected ").concat(a4));
            }, o = function() {
              for (var a4, b3 = ""; a4 = m("CHAR") || m("ESCAPED_CHAR"); ) b3 += a4;
              return b3;
            }, p = function(a4) {
              for (var b3 = 0; b3 < h2.length; b3++) {
                var c3 = h2[b3];
                if (a4.indexOf(c3) > -1) return true;
              }
              return false;
            }, q = function(a4) {
              var b3 = i[i.length - 1], c3 = a4 || (b3 && "string" == typeof b3 ? b3 : "");
              if (b3 && !c3) throw TypeError('Must have text between two parameters, missing text after "'.concat(b3.name, '"'));
              return !c3 || p(c3) ? "[^".concat(e(h2), "]+?") : "(?:(?!".concat(e(c3), ")[^").concat(e(h2), "])+?");
            }; k < c2.length; ) {
              var r = m("CHAR"), s = m("NAME"), t = m("PATTERN");
              if (s || t) {
                var u = r || "";
                -1 === f2.indexOf(u) && (l += u, u = ""), l && (i.push(l), l = ""), i.push({ name: s || j++, prefix: u, suffix: "", pattern: t || q(u), modifier: m("MODIFIER") || "" });
                continue;
              }
              var v = r || m("ESCAPED_CHAR");
              if (v) {
                l += v;
                continue;
              }
              if (l && (i.push(l), l = ""), m("OPEN")) {
                var u = o(), w = m("NAME") || "", x = m("PATTERN") || "", y = o();
                n("CLOSE"), i.push({ name: w || (x ? j++ : ""), pattern: w && !x ? q(u) : x, prefix: u, suffix: y, modifier: m("MODIFIER") || "" });
                continue;
              }
              n("END");
            }
            return i;
          }
          function c(a3, b2) {
            void 0 === b2 && (b2 = {});
            var c2 = f(b2), d2 = b2.encode, e2 = void 0 === d2 ? function(a4) {
              return a4;
            } : d2, g2 = b2.validate, h2 = void 0 === g2 || g2, i = a3.map(function(a4) {
              if ("object" == typeof a4) return new RegExp("^(?:".concat(a4.pattern, ")$"), c2);
            });
            return function(b3) {
              for (var c3 = "", d3 = 0; d3 < a3.length; d3++) {
                var f2 = a3[d3];
                if ("string" == typeof f2) {
                  c3 += f2;
                  continue;
                }
                var g3 = b3 ? b3[f2.name] : void 0, j = "?" === f2.modifier || "*" === f2.modifier, k = "*" === f2.modifier || "+" === f2.modifier;
                if (Array.isArray(g3)) {
                  if (!k) throw TypeError('Expected "'.concat(f2.name, '" to not repeat, but got an array'));
                  if (0 === g3.length) {
                    if (j) continue;
                    throw TypeError('Expected "'.concat(f2.name, '" to not be empty'));
                  }
                  for (var l = 0; l < g3.length; l++) {
                    var m = e2(g3[l], f2);
                    if (h2 && !i[d3].test(m)) throw TypeError('Expected all "'.concat(f2.name, '" to match "').concat(f2.pattern, '", but got "').concat(m, '"'));
                    c3 += f2.prefix + m + f2.suffix;
                  }
                  continue;
                }
                if ("string" == typeof g3 || "number" == typeof g3) {
                  var m = e2(String(g3), f2);
                  if (h2 && !i[d3].test(m)) throw TypeError('Expected "'.concat(f2.name, '" to match "').concat(f2.pattern, '", but got "').concat(m, '"'));
                  c3 += f2.prefix + m + f2.suffix;
                  continue;
                }
                if (!j) {
                  var n = k ? "an array" : "a string";
                  throw TypeError('Expected "'.concat(f2.name, '" to be ').concat(n));
                }
              }
              return c3;
            };
          }
          function d(a3, b2, c2) {
            void 0 === c2 && (c2 = {});
            var d2 = c2.decode, e2 = void 0 === d2 ? function(a4) {
              return a4;
            } : d2;
            return function(c3) {
              var d3 = a3.exec(c3);
              if (!d3) return false;
              for (var f2 = d3[0], g2 = d3.index, h2 = /* @__PURE__ */ Object.create(null), i = 1; i < d3.length; i++) !function(a4) {
                if (void 0 !== d3[a4]) {
                  var c4 = b2[a4 - 1];
                  "*" === c4.modifier || "+" === c4.modifier ? h2[c4.name] = d3[a4].split(c4.prefix + c4.suffix).map(function(a5) {
                    return e2(a5, c4);
                  }) : h2[c4.name] = e2(d3[a4], c4);
                }
              }(i);
              return { path: f2, index: g2, params: h2 };
            };
          }
          function e(a3) {
            return a3.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
          }
          function f(a3) {
            return a3 && a3.sensitive ? "" : "i";
          }
          function g(a3, b2, c2) {
            void 0 === c2 && (c2 = {});
            for (var d2 = c2.strict, g2 = void 0 !== d2 && d2, h2 = c2.start, i = c2.end, j = c2.encode, k = void 0 === j ? function(a4) {
              return a4;
            } : j, l = c2.delimiter, m = c2.endsWith, n = "[".concat(e(void 0 === m ? "" : m), "]|$"), o = "[".concat(e(void 0 === l ? "/#?" : l), "]"), p = void 0 === h2 || h2 ? "^" : "", q = 0; q < a3.length; q++) {
              var r = a3[q];
              if ("string" == typeof r) p += e(k(r));
              else {
                var s = e(k(r.prefix)), t = e(k(r.suffix));
                if (r.pattern) if (b2 && b2.push(r), s || t) if ("+" === r.modifier || "*" === r.modifier) {
                  var u = "*" === r.modifier ? "?" : "";
                  p += "(?:".concat(s, "((?:").concat(r.pattern, ")(?:").concat(t).concat(s, "(?:").concat(r.pattern, "))*)").concat(t, ")").concat(u);
                } else p += "(?:".concat(s, "(").concat(r.pattern, ")").concat(t, ")").concat(r.modifier);
                else {
                  if ("+" === r.modifier || "*" === r.modifier) throw TypeError('Can not repeat "'.concat(r.name, '" without a prefix and suffix'));
                  p += "(".concat(r.pattern, ")").concat(r.modifier);
                }
                else p += "(?:".concat(s).concat(t, ")").concat(r.modifier);
              }
            }
            if (void 0 === i || i) g2 || (p += "".concat(o, "?")), p += c2.endsWith ? "(?=".concat(n, ")") : "$";
            else {
              var v = a3[a3.length - 1], w = "string" == typeof v ? o.indexOf(v[v.length - 1]) > -1 : void 0 === v;
              g2 || (p += "(?:".concat(o, "(?=").concat(n, "))?")), w || (p += "(?=".concat(o, "|").concat(n, ")"));
            }
            return new RegExp(p, f(c2));
          }
          function h(b2, c2, d2) {
            if (b2 instanceof RegExp) {
              var e2;
              if (!c2) return b2;
              for (var i = /\((?:\?<(.*?)>)?(?!\?)/g, j = 0, k = i.exec(b2.source); k; ) c2.push({ name: k[1] || j++, prefix: "", suffix: "", modifier: "", pattern: "" }), k = i.exec(b2.source);
              return b2;
            }
            return Array.isArray(b2) ? (e2 = b2.map(function(a3) {
              return h(a3, c2, d2).source;
            }), new RegExp("(?:".concat(e2.join("|"), ")"), f(d2))) : g(a2(b2, d2), c2, d2);
          }
          Object.defineProperty(b, "__esModule", { value: true }), b.pathToRegexp = b.tokensToRegexp = b.regexpToFunction = b.match = b.tokensToFunction = b.compile = b.parse = void 0, b.parse = a2, b.compile = function(b2, d2) {
            return c(a2(b2, d2), d2);
          }, b.tokensToFunction = c, b.match = function(a3, b2) {
            var c2 = [];
            return d(h(a3, c2, b2), c2, b2);
          }, b.regexpToFunction = d, b.tokensToRegexp = g, b.pathToRegexp = h;
        })(), a.exports = b;
      })();
    }, 318: (a, b, c) => {
      "use strict";
      var d = c(356).Buffer;
      Object.defineProperty(b, "__esModule", { value: true });
      var e = { handleFetch: function() {
        return j;
      }, interceptFetch: function() {
        return k;
      }, reader: function() {
        return h;
      } };
      for (var f in e) Object.defineProperty(b, f, { enumerable: true, get: e[f] });
      let g = c(643), h = { url: (a2) => a2.url, header: (a2, b2) => a2.headers.get(b2) };
      async function i(a2, b2) {
        let { url: c2, method: e2, headers: f2, body: g2, cache: h2, credentials: i2, integrity: j2, mode: k2, redirect: l, referrer: m, referrerPolicy: n } = b2;
        return { testData: a2, api: "fetch", request: { url: c2, method: e2, headers: [...Array.from(f2), ["next-test-stack", function() {
          let a3 = (Error().stack ?? "").split("\n");
          for (let b3 = 1; b3 < a3.length; b3++) if (a3[b3].length > 0) {
            a3 = a3.slice(b3);
            break;
          }
          return (a3 = (a3 = (a3 = a3.filter((a4) => !a4.includes("/next/dist/"))).slice(0, 5)).map((a4) => a4.replace("webpack-internal:///(rsc)/", "").trim())).join("    ");
        }()]], body: g2 ? d.from(await b2.arrayBuffer()).toString("base64") : null, cache: h2, credentials: i2, integrity: j2, mode: k2, redirect: l, referrer: m, referrerPolicy: n } };
      }
      async function j(a2, b2) {
        let c2 = (0, g.getTestReqInfo)(b2, h);
        if (!c2) return a2(b2);
        let { testData: e2, proxyPort: f2 } = c2, j2 = await i(e2, b2), k2 = await a2(`http://localhost:${f2}`, { method: "POST", body: JSON.stringify(j2), headers: { "next-test-internal": "1" }, next: { internal: true } });
        if (!k2.ok) throw Object.defineProperty(Error(`Proxy request failed: ${k2.status}`), "__NEXT_ERROR_CODE", { value: "E146", enumerable: false, configurable: true });
        let l = await k2.json(), { api: m } = l;
        switch (m) {
          case "continue":
            return a2(b2);
          case "abort":
          case "unhandled":
            throw Object.defineProperty(Error(`Proxy request aborted [${b2.method} ${b2.url}]`), "__NEXT_ERROR_CODE", { value: "E145", enumerable: false, configurable: true });
          case "fetch":
            return function(a3) {
              let { status: b3, headers: c3, body: e3 } = a3.response;
              return new Response(e3 ? d.from(e3, "base64") : null, { status: b3, headers: new Headers(c3) });
            }(l);
          default:
            return m;
        }
      }
      function k(a2) {
        return c.g.fetch = function(b2, c2) {
          var d2;
          return (null == c2 || null == (d2 = c2.next) ? void 0 : d2.internal) ? a2(b2, c2) : j(a2, new Request(b2, c2));
        }, () => {
          c.g.fetch = a2;
        };
      }
    }, 345: (a, b, c) => {
      "use strict";
      a.exports = c(417);
    }, 356: (a) => {
      "use strict";
      a.exports = (init_node_buffer(), __toCommonJS(node_buffer_exports));
    }, 417: (a, b) => {
      "use strict";
      var c = { H: null, A: null };
      function d(a2) {
        var b2 = "https://react.dev/errors/" + a2;
        if (1 < arguments.length) {
          b2 += "?args[]=" + encodeURIComponent(arguments[1]);
          for (var c2 = 2; c2 < arguments.length; c2++) b2 += "&args[]=" + encodeURIComponent(arguments[c2]);
        }
        return "Minified React error #" + a2 + "; visit " + b2 + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
      }
      var e = Array.isArray;
      function f() {
      }
      var g = Symbol.for("react.transitional.element"), h = Symbol.for("react.portal"), i = Symbol.for("react.fragment"), j = Symbol.for("react.strict_mode"), k = Symbol.for("react.profiler"), l = Symbol.for("react.forward_ref"), m = Symbol.for("react.suspense"), n = Symbol.for("react.memo"), o = Symbol.for("react.lazy"), p = Symbol.for("react.activity"), q = Symbol.for("react.view_transition"), r = Symbol.iterator, s = Object.prototype.hasOwnProperty, t = Object.assign;
      function u(a2, b2, c2) {
        var d2 = c2.ref;
        return { $$typeof: g, type: a2, key: b2, ref: void 0 !== d2 ? d2 : null, props: c2 };
      }
      function v(a2) {
        return "object" == typeof a2 && null !== a2 && a2.$$typeof === g;
      }
      var w = /\/+/g;
      function x(a2, b2) {
        var c2, d2;
        return "object" == typeof a2 && null !== a2 && null != a2.key ? (c2 = "" + a2.key, d2 = { "=": "=0", ":": "=2" }, "$" + c2.replace(/[=:]/g, function(a3) {
          return d2[a3];
        })) : b2.toString(36);
      }
      function y(a2, b2, c2) {
        if (null == a2) return a2;
        var i2 = [], j2 = 0;
        return !function a3(b3, c3, i3, j3, k2) {
          var l2, m2, n2, p2 = typeof b3;
          ("undefined" === p2 || "boolean" === p2) && (b3 = null);
          var q2 = false;
          if (null === b3) q2 = true;
          else switch (p2) {
            case "bigint":
            case "string":
            case "number":
              q2 = true;
              break;
            case "object":
              switch (b3.$$typeof) {
                case g:
                case h:
                  q2 = true;
                  break;
                case o:
                  return a3((q2 = b3._init)(b3._payload), c3, i3, j3, k2);
              }
          }
          if (q2) return k2 = k2(b3), q2 = "" === j3 ? "." + x(b3, 0) : j3, e(k2) ? (i3 = "", null != q2 && (i3 = q2.replace(w, "$&/") + "/"), a3(k2, c3, i3, "", function(a4) {
            return a4;
          })) : null != k2 && (v(k2) && (l2 = k2, m2 = i3 + (null == k2.key || b3 && b3.key === k2.key ? "" : ("" + k2.key).replace(w, "$&/") + "/") + q2, k2 = u(l2.type, m2, l2.props)), c3.push(k2)), 1;
          q2 = 0;
          var s2 = "" === j3 ? "." : j3 + ":";
          if (e(b3)) for (var t2 = 0; t2 < b3.length; t2++) p2 = s2 + x(j3 = b3[t2], t2), q2 += a3(j3, c3, i3, p2, k2);
          else if ("function" == typeof (t2 = null === (n2 = b3) || "object" != typeof n2 ? null : "function" == typeof (n2 = r && n2[r] || n2["@@iterator"]) ? n2 : null)) for (b3 = t2.call(b3), t2 = 0; !(j3 = b3.next()).done; ) p2 = s2 + x(j3 = j3.value, t2++), q2 += a3(j3, c3, i3, p2, k2);
          else if ("object" === p2) {
            if ("function" == typeof b3.then) return a3(function(a4) {
              switch (a4.status) {
                case "fulfilled":
                  return a4.value;
                case "rejected":
                  throw a4.reason;
                default:
                  switch ("string" == typeof a4.status ? a4.then(f, f) : (a4.status = "pending", a4.then(function(b4) {
                    "pending" === a4.status && (a4.status = "fulfilled", a4.value = b4);
                  }, function(b4) {
                    "pending" === a4.status && (a4.status = "rejected", a4.reason = b4);
                  })), a4.status) {
                    case "fulfilled":
                      return a4.value;
                    case "rejected":
                      throw a4.reason;
                  }
              }
              throw a4;
            }(b3), c3, i3, j3, k2);
            throw Error(d(31, "[object Object]" === (c3 = String(b3)) ? "object with keys {" + Object.keys(b3).join(", ") + "}" : c3));
          }
          return q2;
        }(a2, i2, "", "", function(a3) {
          return b2.call(c2, a3, j2++);
        }), i2;
      }
      function z(a2) {
        if (-1 === a2._status) {
          var b2 = (0, a2._result)();
          b2.then(function(c2) {
            (0 === a2._status || -1 === a2._status) && (a2._status = 1, a2._result = c2, void 0 === b2.status && (b2.status = "fulfilled", b2.value = c2));
          }, function(c2) {
            (0 === a2._status || -1 === a2._status) && (a2._status = 2, a2._result = c2, void 0 === b2.status && (b2.status = "rejected", b2.reason = c2));
          }), -1 === a2._status && (a2._status = 0, a2._result = b2);
        }
        if (1 === a2._status) return a2._result.default;
        throw a2._result;
      }
      function A() {
        return /* @__PURE__ */ new WeakMap();
      }
      function B() {
        return { s: 0, v: void 0, o: null, p: null };
      }
      b.Activity = p, b.Children = { map: y, forEach: function(a2, b2, c2) {
        y(a2, function() {
          b2.apply(this, arguments);
        }, c2);
      }, count: function(a2) {
        var b2 = 0;
        return y(a2, function() {
          b2++;
        }), b2;
      }, toArray: function(a2) {
        return y(a2, function(a3) {
          return a3;
        }) || [];
      }, only: function(a2) {
        if (!v(a2)) throw Error(d(143));
        return a2;
      } }, b.Fragment = i, b.Profiler = k, b.StrictMode = j, b.Suspense = m, b.ViewTransition = q, b.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = c, b.cache = function(a2) {
        return function() {
          var b2 = c.A;
          if (!b2) return a2.apply(null, arguments);
          var d2 = b2.getCacheForType(A);
          void 0 === (b2 = d2.get(a2)) && (b2 = B(), d2.set(a2, b2)), d2 = 0;
          for (var e2 = arguments.length; d2 < e2; d2++) {
            var f2 = arguments[d2];
            if ("function" == typeof f2 || "object" == typeof f2 && null !== f2) {
              var g2 = b2.o;
              null === g2 && (b2.o = g2 = /* @__PURE__ */ new WeakMap()), void 0 === (b2 = g2.get(f2)) && (b2 = B(), g2.set(f2, b2));
            } else null === (g2 = b2.p) && (b2.p = g2 = /* @__PURE__ */ new Map()), void 0 === (b2 = g2.get(f2)) && (b2 = B(), g2.set(f2, b2));
          }
          if (1 === b2.s) return b2.v;
          if (2 === b2.s) throw b2.v;
          try {
            var h2 = a2.apply(null, arguments);
            return (d2 = b2).s = 1, d2.v = h2;
          } catch (a3) {
            throw (h2 = b2).s = 2, h2.v = a3, a3;
          }
        };
      }, b.cacheSignal = function() {
        var a2 = c.A;
        return a2 ? a2.cacheSignal() : null;
      }, b.captureOwnerStack = function() {
        return null;
      }, b.cloneElement = function(a2, b2, c2) {
        if (null == a2) throw Error(d(267, a2));
        var e2 = t({}, a2.props), f2 = a2.key;
        if (null != b2) for (g2 in void 0 !== b2.key && (f2 = "" + b2.key), b2) s.call(b2, g2) && "key" !== g2 && "__self" !== g2 && "__source" !== g2 && ("ref" !== g2 || void 0 !== b2.ref) && (e2[g2] = b2[g2]);
        var g2 = arguments.length - 2;
        if (1 === g2) e2.children = c2;
        else if (1 < g2) {
          for (var h2 = Array(g2), i2 = 0; i2 < g2; i2++) h2[i2] = arguments[i2 + 2];
          e2.children = h2;
        }
        return u(a2.type, f2, e2);
      }, b.createElement = function(a2, b2, c2) {
        var d2, e2 = {}, f2 = null;
        if (null != b2) for (d2 in void 0 !== b2.key && (f2 = "" + b2.key), b2) s.call(b2, d2) && "key" !== d2 && "__self" !== d2 && "__source" !== d2 && (e2[d2] = b2[d2]);
        var g2 = arguments.length - 2;
        if (1 === g2) e2.children = c2;
        else if (1 < g2) {
          for (var h2 = Array(g2), i2 = 0; i2 < g2; i2++) h2[i2] = arguments[i2 + 2];
          e2.children = h2;
        }
        if (a2 && a2.defaultProps) for (d2 in g2 = a2.defaultProps) void 0 === e2[d2] && (e2[d2] = g2[d2]);
        return u(a2, f2, e2);
      }, b.createRef = function() {
        return { current: null };
      }, b.forwardRef = function(a2) {
        return { $$typeof: l, render: a2 };
      }, b.isValidElement = v, b.lazy = function(a2) {
        return { $$typeof: o, _payload: { _status: -1, _result: a2 }, _init: z };
      }, b.memo = function(a2, b2) {
        return { $$typeof: n, type: a2, compare: void 0 === b2 ? null : b2 };
      }, b.use = function(a2) {
        return c.H.use(a2);
      }, b.useCallback = function(a2, b2) {
        return c.H.useCallback(a2, b2);
      }, b.useDebugValue = function() {
      }, b.useId = function() {
        return c.H.useId();
      }, b.useMemo = function(a2, b2) {
        return c.H.useMemo(a2, b2);
      }, b.version = "19.3.0-canary-cbb046ab-20260731";
    }, 446: (a, b, c) => {
      (() => {
        "use strict";
        let b2, d, e, f, g;
        var h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x = { 912: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.ContextAPI = void 0;
          let d2 = c2(108), e2 = c2(221), f2 = c2(44), g2 = "context", h2 = new d2.NoopContextManager();
          class i2 {
            static getInstance() {
              return this._instance || (this._instance = new i2()), this._instance;
            }
            setGlobalContextManager(a3) {
              return (0, e2.registerGlobal)(g2, a3, f2.DiagAPI.instance());
            }
            active() {
              return this._getContextManager().active();
            }
            with(a3, b4, c3, ...d3) {
              return this._getContextManager().with(a3, b4, c3, ...d3);
            }
            bind(a3, b4) {
              return this._getContextManager().bind(a3, b4);
            }
            _getContextManager() {
              return (0, e2.getGlobal)(g2) || h2;
            }
            disable() {
              this._getContextManager().disable(), (0, e2.unregisterGlobal)(g2, f2.DiagAPI.instance());
            }
          }
          b3.ContextAPI = i2;
        }, 44: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.DiagAPI = void 0;
          let d2 = c2(757), e2 = c2(412), f2 = c2(711), g2 = c2(221);
          class h2 {
            constructor() {
              function a3(a4) {
                return function(...b5) {
                  let c3 = (0, g2.getGlobal)("diag");
                  if (c3) return c3[a4](...b5);
                };
              }
              const b4 = this;
              b4.setLogger = (a4, c3 = { logLevel: f2.DiagLogLevel.INFO }) => {
                var d3, h3, i2;
                if (a4 === b4) {
                  let a5 = Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
                  return b4.error(null != (d3 = a5.stack) ? d3 : a5.message), false;
                }
                "number" == typeof c3 && (c3 = { logLevel: c3 });
                let j2 = (0, g2.getGlobal)("diag"), k2 = (0, e2.createLogLevelDiagLogger)(null != (h3 = c3.logLevel) ? h3 : f2.DiagLogLevel.INFO, a4);
                if (j2 && !c3.suppressOverrideMessage) {
                  let a5 = null != (i2 = Error().stack) ? i2 : "<failed to generate stacktrace>";
                  j2.warn(`Current logger will be overwritten from ${a5}`), k2.warn(`Current logger will overwrite one already registered from ${a5}`);
                }
                return (0, g2.registerGlobal)("diag", k2, b4, true);
              }, b4.disable = () => {
                (0, g2.unregisterGlobal)("diag", b4);
              }, b4.createComponentLogger = (a4) => new d2.DiagComponentLogger(a4), b4.verbose = a3("verbose"), b4.debug = a3("debug"), b4.info = a3("info"), b4.warn = a3("warn"), b4.error = a3("error");
            }
            static instance() {
              return this._instance || (this._instance = new h2()), this._instance;
            }
          }
          b3.DiagAPI = h2;
        }, 262: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.MetricsAPI = void 0;
          let d2 = c2(586), e2 = c2(221), f2 = c2(44), g2 = "metrics";
          class h2 {
            static getInstance() {
              return this._instance || (this._instance = new h2()), this._instance;
            }
            setGlobalMeterProvider(a3) {
              return (0, e2.registerGlobal)(g2, a3, f2.DiagAPI.instance());
            }
            getMeterProvider() {
              return (0, e2.getGlobal)(g2) || d2.NOOP_METER_PROVIDER;
            }
            getMeter(a3, b4, c3) {
              return this.getMeterProvider().getMeter(a3, b4, c3);
            }
            disable() {
              (0, e2.unregisterGlobal)(g2, f2.DiagAPI.instance());
            }
          }
          b3.MetricsAPI = h2;
        }, 25: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.PropagationAPI = void 0;
          let d2 = c2(221), e2 = c2(19), f2 = c2(92), g2 = c2(398), h2 = c2(504), i2 = c2(44), j2 = "propagation", k2 = new e2.NoopTextMapPropagator();
          class l2 {
            constructor() {
              this.createBaggage = h2.createBaggage, this.getBaggage = g2.getBaggage, this.getActiveBaggage = g2.getActiveBaggage, this.setBaggage = g2.setBaggage, this.deleteBaggage = g2.deleteBaggage;
            }
            static getInstance() {
              return this._instance || (this._instance = new l2()), this._instance;
            }
            setGlobalPropagator(a3) {
              return (0, d2.registerGlobal)(j2, a3, i2.DiagAPI.instance());
            }
            inject(a3, b4, c3 = f2.defaultTextMapSetter) {
              return this._getGlobalPropagator().inject(a3, b4, c3);
            }
            extract(a3, b4, c3 = f2.defaultTextMapGetter) {
              return this._getGlobalPropagator().extract(a3, b4, c3);
            }
            fields() {
              return this._getGlobalPropagator().fields();
            }
            disable() {
              (0, d2.unregisterGlobal)(j2, i2.DiagAPI.instance());
            }
            _getGlobalPropagator() {
              return (0, d2.getGlobal)(j2) || k2;
            }
          }
          b3.PropagationAPI = l2;
        }, 397: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.TraceAPI = void 0;
          let d2 = c2(221), e2 = c2(498), f2 = c2(477), g2 = c2(793), h2 = c2(44), i2 = "trace";
          class j2 {
            constructor() {
              this._proxyTracerProvider = new e2.ProxyTracerProvider(), this.wrapSpanContext = f2.wrapSpanContext, this.isSpanContextValid = f2.isSpanContextValid, this.deleteSpan = g2.deleteSpan, this.getSpan = g2.getSpan, this.getActiveSpan = g2.getActiveSpan, this.getSpanContext = g2.getSpanContext, this.setSpan = g2.setSpan, this.setSpanContext = g2.setSpanContext;
            }
            static getInstance() {
              return this._instance || (this._instance = new j2()), this._instance;
            }
            setGlobalTracerProvider(a3) {
              let b4 = (0, d2.registerGlobal)(i2, this._proxyTracerProvider, h2.DiagAPI.instance());
              return b4 && this._proxyTracerProvider.setDelegate(a3), b4;
            }
            getTracerProvider() {
              return (0, d2.getGlobal)(i2) || this._proxyTracerProvider;
            }
            getTracer(a3, b4) {
              return this.getTracerProvider().getTracer(a3, b4);
            }
            disable() {
              (0, d2.unregisterGlobal)(i2, h2.DiagAPI.instance()), this._proxyTracerProvider = new e2.ProxyTracerProvider();
            }
          }
          b3.TraceAPI = j2;
        }, 398: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.deleteBaggage = b3.setBaggage = b3.getActiveBaggage = b3.getBaggage = void 0;
          let d2 = c2(912), e2 = (0, c2(23).createContextKey)("OpenTelemetry Baggage Key");
          function f2(a3) {
            return a3.getValue(e2) || void 0;
          }
          b3.getBaggage = f2, b3.getActiveBaggage = function() {
            return f2(d2.ContextAPI.getInstance().active());
          }, b3.setBaggage = function(a3, b4) {
            return a3.setValue(e2, b4);
          }, b3.deleteBaggage = function(a3) {
            return a3.deleteValue(e2);
          };
        }, 152: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.BaggageImpl = void 0;
          class c2 {
            constructor(a3) {
              this._entries = a3 ? new Map(a3) : /* @__PURE__ */ new Map();
            }
            getEntry(a3) {
              let b4 = this._entries.get(a3);
              if (b4) return Object.assign({}, b4);
            }
            getAllEntries() {
              return Array.from(this._entries.entries()).map(([a3, b4]) => [a3, b4]);
            }
            setEntry(a3, b4) {
              let d2 = new c2(this._entries);
              return d2._entries.set(a3, b4), d2;
            }
            removeEntry(a3) {
              let b4 = new c2(this._entries);
              return b4._entries.delete(a3), b4;
            }
            removeEntries(...a3) {
              let b4 = new c2(this._entries);
              for (let c3 of a3) b4._entries.delete(c3);
              return b4;
            }
            clear() {
              return new c2();
            }
          }
          b3.BaggageImpl = c2;
        }, 647: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.baggageEntryMetadataSymbol = void 0, b3.baggageEntryMetadataSymbol = Symbol("BaggageEntryMetadata");
        }, 504: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.baggageEntryMetadataFromString = b3.createBaggage = void 0;
          let d2 = c2(44), e2 = c2(152), f2 = c2(647), g2 = d2.DiagAPI.instance();
          b3.createBaggage = function(a3 = {}) {
            return new e2.BaggageImpl(new Map(Object.entries(a3)));
          }, b3.baggageEntryMetadataFromString = function(a3) {
            return "string" != typeof a3 && (g2.error(`Cannot create baggage metadata from unknown type: ${typeof a3}`), a3 = ""), { __TYPE__: f2.baggageEntryMetadataSymbol, toString: () => a3 };
          };
        }, 778: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.context = void 0, b3.context = c2(912).ContextAPI.getInstance();
        }, 108: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NoopContextManager = void 0;
          let d2 = c2(23);
          class e2 {
            active() {
              return d2.ROOT_CONTEXT;
            }
            with(a3, b4, c3, ...d3) {
              return b4.call(c3, ...d3);
            }
            bind(a3, b4) {
              return b4;
            }
            enable() {
              return this;
            }
            disable() {
              return this;
            }
          }
          b3.NoopContextManager = e2;
        }, 23: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.ROOT_CONTEXT = b3.createContextKey = void 0, b3.createContextKey = function(a3) {
            return Symbol.for(a3);
          };
          class c2 {
            constructor(a3) {
              const b4 = this;
              b4._currentContext = a3 ? new Map(a3) : /* @__PURE__ */ new Map(), b4.getValue = (a4) => b4._currentContext.get(a4), b4.setValue = (a4, d2) => {
                let e2 = new c2(b4._currentContext);
                return e2._currentContext.set(a4, d2), e2;
              }, b4.deleteValue = (a4) => {
                let d2 = new c2(b4._currentContext);
                return d2._currentContext.delete(a4), d2;
              };
            }
          }
          b3.ROOT_CONTEXT = new c2();
        }, 304: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.diag = void 0, b3.diag = c2(44).DiagAPI.instance();
        }, 757: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.DiagComponentLogger = void 0;
          let d2 = c2(221);
          class e2 {
            constructor(a3) {
              this._namespace = a3.namespace || "DiagComponentLogger";
            }
            debug(...a3) {
              return f2("debug", this._namespace, a3);
            }
            error(...a3) {
              return f2("error", this._namespace, a3);
            }
            info(...a3) {
              return f2("info", this._namespace, a3);
            }
            warn(...a3) {
              return f2("warn", this._namespace, a3);
            }
            verbose(...a3) {
              return f2("verbose", this._namespace, a3);
            }
          }
          function f2(a3, b4, c3) {
            let e3 = (0, d2.getGlobal)("diag");
            if (e3) return c3.unshift(b4), e3[a3](...c3);
          }
          b3.DiagComponentLogger = e2;
        }, 83: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.DiagConsoleLogger = void 0;
          let c2 = [{ n: "error", c: "error" }, { n: "warn", c: "warn" }, { n: "info", c: "info" }, { n: "debug", c: "debug" }, { n: "verbose", c: "trace" }];
          class d2 {
            constructor() {
              for (let a3 = 0; a3 < c2.length; a3++) this[c2[a3].n] = /* @__PURE__ */ function(a4) {
                return function(...b4) {
                  if (console) {
                    let c3 = console[a4];
                    if ("function" != typeof c3 && (c3 = console.log), "function" == typeof c3) return c3.apply(console, b4);
                  }
                };
              }(c2[a3].c);
            }
          }
          b3.DiagConsoleLogger = d2;
        }, 412: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.createLogLevelDiagLogger = void 0;
          let d2 = c2(711);
          b3.createLogLevelDiagLogger = function(a3, b4) {
            function c3(c4, d3) {
              let e2 = b4[c4];
              return "function" == typeof e2 && a3 >= d3 ? e2.bind(b4) : function() {
              };
            }
            return a3 < d2.DiagLogLevel.NONE ? a3 = d2.DiagLogLevel.NONE : a3 > d2.DiagLogLevel.ALL && (a3 = d2.DiagLogLevel.ALL), b4 = b4 || {}, { error: c3("error", d2.DiagLogLevel.ERROR), warn: c3("warn", d2.DiagLogLevel.WARN), info: c3("info", d2.DiagLogLevel.INFO), debug: c3("debug", d2.DiagLogLevel.DEBUG), verbose: c3("verbose", d2.DiagLogLevel.VERBOSE) };
          };
        }, 711: (a2, b3) => {
          var c2;
          Object.defineProperty(b3, "__esModule", { value: true }), b3.DiagLogLevel = void 0, (c2 = b3.DiagLogLevel || (b3.DiagLogLevel = {}))[c2.NONE = 0] = "NONE", c2[c2.ERROR = 30] = "ERROR", c2[c2.WARN = 50] = "WARN", c2[c2.INFO = 60] = "INFO", c2[c2.DEBUG = 70] = "DEBUG", c2[c2.VERBOSE = 80] = "VERBOSE", c2[c2.ALL = 9999] = "ALL";
        }, 221: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.unregisterGlobal = b3.getGlobal = b3.registerGlobal = void 0;
          let d2 = c2(678), e2 = c2(652), f2 = c2(662), g2 = e2.VERSION.split(".")[0], h2 = Symbol.for(`opentelemetry.js.api.${g2}`), i2 = d2._globalThis;
          b3.registerGlobal = function(a3, b4, c3, d3 = false) {
            var f3;
            let g3 = i2[h2] = null != (f3 = i2[h2]) ? f3 : { version: e2.VERSION };
            if (!d3 && g3[a3]) {
              let b5 = Error(`@opentelemetry/api: Attempted duplicate registration of API: ${a3}`);
              return c3.error(b5.stack || b5.message), false;
            }
            if (g3.version !== e2.VERSION) {
              let b5 = Error(`@opentelemetry/api: Registration of version v${g3.version} for ${a3} does not match previously registered API v${e2.VERSION}`);
              return c3.error(b5.stack || b5.message), false;
            }
            return g3[a3] = b4, c3.debug(`@opentelemetry/api: Registered a global for ${a3} v${e2.VERSION}.`), true;
          }, b3.getGlobal = function(a3) {
            var b4, c3;
            let d3 = null == (b4 = i2[h2]) ? void 0 : b4.version;
            if (d3 && (0, f2.isCompatible)(d3)) return null == (c3 = i2[h2]) ? void 0 : c3[a3];
          }, b3.unregisterGlobal = function(a3, b4) {
            b4.debug(`@opentelemetry/api: Unregistering a global for ${a3} v${e2.VERSION}.`);
            let c3 = i2[h2];
            c3 && delete c3[a3];
          };
        }, 662: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.isCompatible = b3._makeCompatibilityCheck = void 0;
          let d2 = c2(652), e2 = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
          function f2(a3) {
            let b4 = /* @__PURE__ */ new Set([a3]), c3 = /* @__PURE__ */ new Set(), d3 = a3.match(e2);
            if (!d3) return () => false;
            let f3 = { major: +d3[1], minor: +d3[2], patch: +d3[3], prerelease: d3[4] };
            if (null != f3.prerelease) return function(b5) {
              return b5 === a3;
            };
            function g2(a4) {
              return c3.add(a4), false;
            }
            return function(a4) {
              if (b4.has(a4)) return true;
              if (c3.has(a4)) return false;
              let d4 = a4.match(e2);
              if (!d4) return g2(a4);
              let h2 = { major: +d4[1], minor: +d4[2], patch: +d4[3], prerelease: d4[4] };
              if (null != h2.prerelease || f3.major !== h2.major) return g2(a4);
              if (0 === f3.major) return f3.minor === h2.minor && f3.patch <= h2.patch ? (b4.add(a4), true) : g2(a4);
              return f3.minor <= h2.minor ? (b4.add(a4), true) : g2(a4);
            };
          }
          b3._makeCompatibilityCheck = f2, b3.isCompatible = f2(d2.VERSION);
        }, 120: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.metrics = void 0, b3.metrics = c2(262).MetricsAPI.getInstance();
        }, 532: (a2, b3) => {
          var c2;
          Object.defineProperty(b3, "__esModule", { value: true }), b3.ValueType = void 0, (c2 = b3.ValueType || (b3.ValueType = {}))[c2.INT = 0] = "INT", c2[c2.DOUBLE = 1] = "DOUBLE";
        }, 440: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.createNoopMeter = b3.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = b3.NOOP_OBSERVABLE_GAUGE_METRIC = b3.NOOP_OBSERVABLE_COUNTER_METRIC = b3.NOOP_UP_DOWN_COUNTER_METRIC = b3.NOOP_HISTOGRAM_METRIC = b3.NOOP_COUNTER_METRIC = b3.NOOP_METER = b3.NoopObservableUpDownCounterMetric = b3.NoopObservableGaugeMetric = b3.NoopObservableCounterMetric = b3.NoopObservableMetric = b3.NoopHistogramMetric = b3.NoopUpDownCounterMetric = b3.NoopCounterMetric = b3.NoopMetric = b3.NoopMeter = void 0;
          class c2 {
            createHistogram(a3, c3) {
              return b3.NOOP_HISTOGRAM_METRIC;
            }
            createCounter(a3, c3) {
              return b3.NOOP_COUNTER_METRIC;
            }
            createUpDownCounter(a3, c3) {
              return b3.NOOP_UP_DOWN_COUNTER_METRIC;
            }
            createObservableGauge(a3, c3) {
              return b3.NOOP_OBSERVABLE_GAUGE_METRIC;
            }
            createObservableCounter(a3, c3) {
              return b3.NOOP_OBSERVABLE_COUNTER_METRIC;
            }
            createObservableUpDownCounter(a3, c3) {
              return b3.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
            }
            addBatchObservableCallback(a3, b4) {
            }
            removeBatchObservableCallback(a3) {
            }
          }
          b3.NoopMeter = c2;
          class d2 {
          }
          b3.NoopMetric = d2;
          class e2 extends d2 {
            add(a3, b4) {
            }
          }
          b3.NoopCounterMetric = e2;
          class f2 extends d2 {
            add(a3, b4) {
            }
          }
          b3.NoopUpDownCounterMetric = f2;
          class g2 extends d2 {
            record(a3, b4) {
            }
          }
          b3.NoopHistogramMetric = g2;
          class h2 {
            addCallback(a3) {
            }
            removeCallback(a3) {
            }
          }
          b3.NoopObservableMetric = h2;
          class i2 extends h2 {
          }
          b3.NoopObservableCounterMetric = i2;
          class j2 extends h2 {
          }
          b3.NoopObservableGaugeMetric = j2;
          class k2 extends h2 {
          }
          b3.NoopObservableUpDownCounterMetric = k2, b3.NOOP_METER = new c2(), b3.NOOP_COUNTER_METRIC = new e2(), b3.NOOP_HISTOGRAM_METRIC = new g2(), b3.NOOP_UP_DOWN_COUNTER_METRIC = new f2(), b3.NOOP_OBSERVABLE_COUNTER_METRIC = new i2(), b3.NOOP_OBSERVABLE_GAUGE_METRIC = new j2(), b3.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new k2(), b3.createNoopMeter = function() {
            return b3.NOOP_METER;
          };
        }, 586: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NOOP_METER_PROVIDER = b3.NoopMeterProvider = void 0;
          let d2 = c2(440);
          class e2 {
            getMeter(a3, b4, c3) {
              return d2.NOOP_METER;
            }
          }
          b3.NoopMeterProvider = e2, b3.NOOP_METER_PROVIDER = new e2();
        }, 678: function(a2, b3, c2) {
          var d2 = this && this.__createBinding || (Object.create ? function(a3, b4, c3, d3) {
            void 0 === d3 && (d3 = c3), Object.defineProperty(a3, d3, { enumerable: true, get: function() {
              return b4[c3];
            } });
          } : function(a3, b4, c3, d3) {
            void 0 === d3 && (d3 = c3), a3[d3] = b4[c3];
          }), e2 = this && this.__exportStar || function(a3, b4) {
            for (var c3 in a3) "default" === c3 || Object.prototype.hasOwnProperty.call(b4, c3) || d2(b4, a3, c3);
          };
          Object.defineProperty(b3, "__esModule", { value: true }), e2(c2(59), b3);
        }, 460: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3._globalThis = void 0, b3._globalThis = "object" == typeof globalThis ? globalThis : c.g;
        }, 59: function(a2, b3, c2) {
          var d2 = this && this.__createBinding || (Object.create ? function(a3, b4, c3, d3) {
            void 0 === d3 && (d3 = c3), Object.defineProperty(a3, d3, { enumerable: true, get: function() {
              return b4[c3];
            } });
          } : function(a3, b4, c3, d3) {
            void 0 === d3 && (d3 = c3), a3[d3] = b4[c3];
          }), e2 = this && this.__exportStar || function(a3, b4) {
            for (var c3 in a3) "default" === c3 || Object.prototype.hasOwnProperty.call(b4, c3) || d2(b4, a3, c3);
          };
          Object.defineProperty(b3, "__esModule", { value: true }), e2(c2(460), b3);
        }, 27: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.propagation = void 0, b3.propagation = c2(25).PropagationAPI.getInstance();
        }, 19: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NoopTextMapPropagator = void 0;
          class c2 {
            inject(a3, b4) {
            }
            extract(a3, b4) {
              return a3;
            }
            fields() {
              return [];
            }
          }
          b3.NoopTextMapPropagator = c2;
        }, 92: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.defaultTextMapSetter = b3.defaultTextMapGetter = void 0, b3.defaultTextMapGetter = { get(a3, b4) {
            if (null != a3) return a3[b4];
          }, keys: (a3) => null == a3 ? [] : Object.keys(a3) }, b3.defaultTextMapSetter = { set(a3, b4, c2) {
            null != a3 && (a3[b4] = c2);
          } };
        }, 816: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.trace = void 0, b3.trace = c2(397).TraceAPI.getInstance();
        }, 374: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NonRecordingSpan = void 0;
          let d2 = c2(546);
          class e2 {
            constructor(a3 = d2.INVALID_SPAN_CONTEXT) {
              this._spanContext = a3;
            }
            spanContext() {
              return this._spanContext;
            }
            setAttribute(a3, b4) {
              return this;
            }
            setAttributes(a3) {
              return this;
            }
            addEvent(a3, b4) {
              return this;
            }
            setStatus(a3) {
              return this;
            }
            updateName(a3) {
              return this;
            }
            end(a3) {
            }
            isRecording() {
              return false;
            }
            recordException(a3, b4) {
            }
          }
          b3.NonRecordingSpan = e2;
        }, 637: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NoopTracer = void 0;
          let d2 = c2(912), e2 = c2(793), f2 = c2(374), g2 = c2(477), h2 = d2.ContextAPI.getInstance();
          class i2 {
            startSpan(a3, b4, c3 = h2.active()) {
              var d3;
              if (null == b4 ? void 0 : b4.root) return new f2.NonRecordingSpan();
              let i3 = c3 && (0, e2.getSpanContext)(c3);
              return "object" == typeof (d3 = i3) && "string" == typeof d3.spanId && "string" == typeof d3.traceId && "number" == typeof d3.traceFlags && (0, g2.isSpanContextValid)(i3) ? new f2.NonRecordingSpan(i3) : new f2.NonRecordingSpan();
            }
            startActiveSpan(a3, b4, c3, d3) {
              let f3, g3, i3;
              if (arguments.length < 2) return;
              2 == arguments.length ? i3 = b4 : 3 == arguments.length ? (f3 = b4, i3 = c3) : (f3 = b4, g3 = c3, i3 = d3);
              let j2 = null != g3 ? g3 : h2.active(), k2 = this.startSpan(a3, f3, j2), l2 = (0, e2.setSpan)(j2, k2);
              return h2.with(l2, i3, void 0, k2);
            }
          }
          b3.NoopTracer = i2;
        }, 76: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NoopTracerProvider = void 0;
          let d2 = c2(637);
          class e2 {
            getTracer(a3, b4, c3) {
              return new d2.NoopTracer();
            }
          }
          b3.NoopTracerProvider = e2;
        }, 779: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.ProxyTracer = void 0;
          let d2 = new (c2(637)).NoopTracer();
          class e2 {
            constructor(a3, b4, c3, d3) {
              this._provider = a3, this.name = b4, this.version = c3, this.options = d3;
            }
            startSpan(a3, b4, c3) {
              return this._getTracer().startSpan(a3, b4, c3);
            }
            startActiveSpan(a3, b4, c3, d3) {
              let e3 = this._getTracer();
              return Reflect.apply(e3.startActiveSpan, e3, arguments);
            }
            _getTracer() {
              if (this._delegate) return this._delegate;
              let a3 = this._provider.getDelegateTracer(this.name, this.version, this.options);
              return a3 ? (this._delegate = a3, this._delegate) : d2;
            }
          }
          b3.ProxyTracer = e2;
        }, 498: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.ProxyTracerProvider = void 0;
          let d2 = c2(779), e2 = new (c2(76)).NoopTracerProvider();
          class f2 {
            getTracer(a3, b4, c3) {
              var e3;
              return null != (e3 = this.getDelegateTracer(a3, b4, c3)) ? e3 : new d2.ProxyTracer(this, a3, b4, c3);
            }
            getDelegate() {
              var a3;
              return null != (a3 = this._delegate) ? a3 : e2;
            }
            setDelegate(a3) {
              this._delegate = a3;
            }
            getDelegateTracer(a3, b4, c3) {
              var d3;
              return null == (d3 = this._delegate) ? void 0 : d3.getTracer(a3, b4, c3);
            }
          }
          b3.ProxyTracerProvider = f2;
        }, 312: (a2, b3) => {
          var c2;
          Object.defineProperty(b3, "__esModule", { value: true }), b3.SamplingDecision = void 0, (c2 = b3.SamplingDecision || (b3.SamplingDecision = {}))[c2.NOT_RECORD = 0] = "NOT_RECORD", c2[c2.RECORD = 1] = "RECORD", c2[c2.RECORD_AND_SAMPLED = 2] = "RECORD_AND_SAMPLED";
        }, 793: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.getSpanContext = b3.setSpanContext = b3.deleteSpan = b3.setSpan = b3.getActiveSpan = b3.getSpan = void 0;
          let d2 = c2(23), e2 = c2(374), f2 = c2(912), g2 = (0, d2.createContextKey)("OpenTelemetry Context Key SPAN");
          function h2(a3) {
            return a3.getValue(g2) || void 0;
          }
          function i2(a3, b4) {
            return a3.setValue(g2, b4);
          }
          b3.getSpan = h2, b3.getActiveSpan = function() {
            return h2(f2.ContextAPI.getInstance().active());
          }, b3.setSpan = i2, b3.deleteSpan = function(a3) {
            return a3.deleteValue(g2);
          }, b3.setSpanContext = function(a3, b4) {
            return i2(a3, new e2.NonRecordingSpan(b4));
          }, b3.getSpanContext = function(a3) {
            var b4;
            return null == (b4 = h2(a3)) ? void 0 : b4.spanContext();
          };
        }, 285: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.TraceStateImpl = void 0;
          let d2 = c2(240);
          class e2 {
            constructor(a3) {
              this._internalState = /* @__PURE__ */ new Map(), a3 && this._parse(a3);
            }
            set(a3, b4) {
              let c3 = this._clone();
              return c3._internalState.has(a3) && c3._internalState.delete(a3), c3._internalState.set(a3, b4), c3;
            }
            unset(a3) {
              let b4 = this._clone();
              return b4._internalState.delete(a3), b4;
            }
            get(a3) {
              return this._internalState.get(a3);
            }
            serialize() {
              return this._keys().reduce((a3, b4) => (a3.push(b4 + "=" + this.get(b4)), a3), []).join(",");
            }
            _parse(a3) {
              !(a3.length > 512) && (this._internalState = a3.split(",").reverse().reduce((a4, b4) => {
                let c3 = b4.trim(), e3 = c3.indexOf("=");
                if (-1 !== e3) {
                  let f2 = c3.slice(0, e3), g2 = c3.slice(e3 + 1, b4.length);
                  (0, d2.validateKey)(f2) && (0, d2.validateValue)(g2) && a4.set(f2, g2);
                }
                return a4;
              }, /* @__PURE__ */ new Map()), this._internalState.size > 32 && (this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, 32))));
            }
            _keys() {
              return Array.from(this._internalState.keys()).reverse();
            }
            _clone() {
              let a3 = new e2();
              return a3._internalState = new Map(this._internalState), a3;
            }
          }
          b3.TraceStateImpl = e2;
        }, 240: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.validateValue = b3.validateKey = void 0;
          let c2 = "[_0-9a-z-*/]", d2 = `[a-z]${c2}{0,255}`, e2 = `[a-z0-9]${c2}{0,240}@[a-z]${c2}{0,13}`, f2 = RegExp(`^(?:${d2}|${e2})$`), g2 = /^[ -~]{0,255}[!-~]$/, h2 = /,|=/;
          b3.validateKey = function(a3) {
            return f2.test(a3);
          }, b3.validateValue = function(a3) {
            return g2.test(a3) && !h2.test(a3);
          };
        }, 87: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.createTraceState = void 0;
          let d2 = c2(285);
          b3.createTraceState = function(a3) {
            return new d2.TraceStateImpl(a3);
          };
        }, 546: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.INVALID_SPAN_CONTEXT = b3.INVALID_TRACEID = b3.INVALID_SPANID = void 0;
          let d2 = c2(731);
          b3.INVALID_SPANID = "0000000000000000", b3.INVALID_TRACEID = "00000000000000000000000000000000", b3.INVALID_SPAN_CONTEXT = { traceId: b3.INVALID_TRACEID, spanId: b3.INVALID_SPANID, traceFlags: d2.TraceFlags.NONE };
        }, 613: (a2, b3) => {
          var c2;
          Object.defineProperty(b3, "__esModule", { value: true }), b3.SpanKind = void 0, (c2 = b3.SpanKind || (b3.SpanKind = {}))[c2.INTERNAL = 0] = "INTERNAL", c2[c2.SERVER = 1] = "SERVER", c2[c2.CLIENT = 2] = "CLIENT", c2[c2.PRODUCER = 3] = "PRODUCER", c2[c2.CONSUMER = 4] = "CONSUMER";
        }, 477: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.wrapSpanContext = b3.isSpanContextValid = b3.isValidSpanId = b3.isValidTraceId = void 0;
          let d2 = c2(546), e2 = c2(374), f2 = /^([0-9a-f]{32})$/i, g2 = /^[0-9a-f]{16}$/i;
          function h2(a3) {
            return f2.test(a3) && a3 !== d2.INVALID_TRACEID;
          }
          function i2(a3) {
            return g2.test(a3) && a3 !== d2.INVALID_SPANID;
          }
          b3.isValidTraceId = h2, b3.isValidSpanId = i2, b3.isSpanContextValid = function(a3) {
            return h2(a3.traceId) && i2(a3.spanId);
          }, b3.wrapSpanContext = function(a3) {
            return new e2.NonRecordingSpan(a3);
          };
        }, 854: (a2, b3) => {
          var c2;
          Object.defineProperty(b3, "__esModule", { value: true }), b3.SpanStatusCode = void 0, (c2 = b3.SpanStatusCode || (b3.SpanStatusCode = {}))[c2.UNSET = 0] = "UNSET", c2[c2.OK = 1] = "OK", c2[c2.ERROR = 2] = "ERROR";
        }, 731: (a2, b3) => {
          var c2;
          Object.defineProperty(b3, "__esModule", { value: true }), b3.TraceFlags = void 0, (c2 = b3.TraceFlags || (b3.TraceFlags = {}))[c2.NONE = 0] = "NONE", c2[c2.SAMPLED = 1] = "SAMPLED";
        }, 652: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.VERSION = void 0, b3.VERSION = "1.6.0";
        } }, y = {};
        function z(a2) {
          var b3 = y[a2];
          if (void 0 !== b3) return b3.exports;
          var c2 = y[a2] = { exports: {} }, d2 = true;
          try {
            x[a2].call(c2.exports, c2, c2.exports, z), d2 = false;
          } finally {
            d2 && delete y[a2];
          }
          return c2.exports;
        }
        z.ab = "//";
        var A = {};
        Object.defineProperty(A, "__esModule", { value: true }), A.trace = A.propagation = A.metrics = A.diag = A.context = A.INVALID_SPAN_CONTEXT = A.INVALID_TRACEID = A.INVALID_SPANID = A.isValidSpanId = A.isValidTraceId = A.isSpanContextValid = A.createTraceState = A.TraceFlags = A.SpanStatusCode = A.SpanKind = A.SamplingDecision = A.ProxyTracerProvider = A.ProxyTracer = A.defaultTextMapSetter = A.defaultTextMapGetter = A.ValueType = A.createNoopMeter = A.DiagLogLevel = A.DiagConsoleLogger = A.ROOT_CONTEXT = A.createContextKey = A.baggageEntryMetadataFromString = void 0, h = z(504), Object.defineProperty(A, "baggageEntryMetadataFromString", { enumerable: true, get: function() {
          return h.baggageEntryMetadataFromString;
        } }), i = z(23), Object.defineProperty(A, "createContextKey", { enumerable: true, get: function() {
          return i.createContextKey;
        } }), Object.defineProperty(A, "ROOT_CONTEXT", { enumerable: true, get: function() {
          return i.ROOT_CONTEXT;
        } }), j = z(83), Object.defineProperty(A, "DiagConsoleLogger", { enumerable: true, get: function() {
          return j.DiagConsoleLogger;
        } }), k = z(711), Object.defineProperty(A, "DiagLogLevel", { enumerable: true, get: function() {
          return k.DiagLogLevel;
        } }), l = z(440), Object.defineProperty(A, "createNoopMeter", { enumerable: true, get: function() {
          return l.createNoopMeter;
        } }), m = z(532), Object.defineProperty(A, "ValueType", { enumerable: true, get: function() {
          return m.ValueType;
        } }), n = z(92), Object.defineProperty(A, "defaultTextMapGetter", { enumerable: true, get: function() {
          return n.defaultTextMapGetter;
        } }), Object.defineProperty(A, "defaultTextMapSetter", { enumerable: true, get: function() {
          return n.defaultTextMapSetter;
        } }), o = z(779), Object.defineProperty(A, "ProxyTracer", { enumerable: true, get: function() {
          return o.ProxyTracer;
        } }), p = z(498), Object.defineProperty(A, "ProxyTracerProvider", { enumerable: true, get: function() {
          return p.ProxyTracerProvider;
        } }), q = z(312), Object.defineProperty(A, "SamplingDecision", { enumerable: true, get: function() {
          return q.SamplingDecision;
        } }), r = z(613), Object.defineProperty(A, "SpanKind", { enumerable: true, get: function() {
          return r.SpanKind;
        } }), s = z(854), Object.defineProperty(A, "SpanStatusCode", { enumerable: true, get: function() {
          return s.SpanStatusCode;
        } }), t = z(731), Object.defineProperty(A, "TraceFlags", { enumerable: true, get: function() {
          return t.TraceFlags;
        } }), u = z(87), Object.defineProperty(A, "createTraceState", { enumerable: true, get: function() {
          return u.createTraceState;
        } }), v = z(477), Object.defineProperty(A, "isSpanContextValid", { enumerable: true, get: function() {
          return v.isSpanContextValid;
        } }), Object.defineProperty(A, "isValidTraceId", { enumerable: true, get: function() {
          return v.isValidTraceId;
        } }), Object.defineProperty(A, "isValidSpanId", { enumerable: true, get: function() {
          return v.isValidSpanId;
        } }), w = z(546), Object.defineProperty(A, "INVALID_SPANID", { enumerable: true, get: function() {
          return w.INVALID_SPANID;
        } }), Object.defineProperty(A, "INVALID_TRACEID", { enumerable: true, get: function() {
          return w.INVALID_TRACEID;
        } }), Object.defineProperty(A, "INVALID_SPAN_CONTEXT", { enumerable: true, get: function() {
          return w.INVALID_SPAN_CONTEXT;
        } }), b2 = z(778), Object.defineProperty(A, "context", { enumerable: true, get: function() {
          return b2.context;
        } }), d = z(304), Object.defineProperty(A, "diag", { enumerable: true, get: function() {
          return d.diag;
        } }), e = z(120), Object.defineProperty(A, "metrics", { enumerable: true, get: function() {
          return e.metrics;
        } }), f = z(27), Object.defineProperty(A, "propagation", { enumerable: true, get: function() {
          return f.propagation;
        } }), g = z(816), Object.defineProperty(A, "trace", { enumerable: true, get: function() {
          return g.trace;
        } }), A.default = { context: b2.context, diag: d.diag, metrics: e.metrics, propagation: f.propagation, trace: g.trace }, a.exports = A;
      })();
    }, 521: (a) => {
      "use strict";
      a.exports = (init_node_async_hooks(), __toCommonJS(node_async_hooks_exports));
    }, 643: (a, b, c) => {
      "use strict";
      Object.defineProperty(b, "__esModule", { value: true });
      var d = { getTestReqInfo: function() {
        return i;
      }, withRequest: function() {
        return h;
      } };
      for (var e in d) Object.defineProperty(b, e, { enumerable: true, get: d[e] });
      let f = new (c(521)).AsyncLocalStorage();
      function g(a2, b2) {
        let c2 = b2.header(a2, "next-test-proxy-port");
        if (!c2) return;
        let d2 = b2.url(a2);
        return { url: d2, proxyPort: Number(c2), testData: b2.header(a2, "next-test-data") || "" };
      }
      function h(a2, b2, c2) {
        let d2 = g(a2, b2);
        return d2 ? f.run(d2, c2) : c2();
      }
      function i(a2, b2) {
        let c2 = f.getStore();
        return c2 || (a2 && b2 ? g(a2, b2) : void 0);
      }
    }, 654: (a, b, c) => {
      "use strict";
      a.exports = c(42);
    }, 852: (a) => {
      (() => {
        "use strict";
        "u" > typeof __nccwpck_require__ && (__nccwpck_require__.ab = "//");
        var b, c, d, e, f = {};
        f.parse = function(a2, c2) {
          if ("string" != typeof a2) throw TypeError("argument str must be a string");
          for (var e2 = {}, f2 = a2.split(d), g = (c2 || {}).decode || b, h = 0; h < f2.length; h++) {
            var i = f2[h], j = i.indexOf("=");
            if (!(j < 0)) {
              var k = i.substr(0, j).trim(), l = i.substr(++j, i.length).trim();
              '"' == l[0] && (l = l.slice(1, -1)), void 0 == e2[k] && (e2[k] = function(a3, b2) {
                try {
                  return b2(a3);
                } catch (b3) {
                  return a3;
                }
              }(l, g));
            }
          }
          return e2;
        }, f.serialize = function(a2, b2, d2) {
          var f2 = d2 || {}, g = f2.encode || c;
          if ("function" != typeof g) throw TypeError("option encode is invalid");
          if (!e.test(a2)) throw TypeError("argument name is invalid");
          var h = g(b2);
          if (h && !e.test(h)) throw TypeError("argument val is invalid");
          var i = a2 + "=" + h;
          if (null != f2.maxAge) {
            var j = f2.maxAge - 0;
            if (isNaN(j) || !isFinite(j)) throw TypeError("option maxAge is invalid");
            i += "; Max-Age=" + Math.floor(j);
          }
          if (f2.domain) {
            if (!e.test(f2.domain)) throw TypeError("option domain is invalid");
            i += "; Domain=" + f2.domain;
          }
          if (f2.path) {
            if (!e.test(f2.path)) throw TypeError("option path is invalid");
            i += "; Path=" + f2.path;
          }
          if (f2.expires) {
            if ("function" != typeof f2.expires.toUTCString) throw TypeError("option expires is invalid");
            i += "; Expires=" + f2.expires.toUTCString();
          }
          if (f2.httpOnly && (i += "; HttpOnly"), f2.secure && (i += "; Secure"), f2.sameSite) switch ("string" == typeof f2.sameSite ? f2.sameSite.toLowerCase() : f2.sameSite) {
            case true:
            case "strict":
              i += "; SameSite=Strict";
              break;
            case "lax":
              i += "; SameSite=Lax";
              break;
            case "none":
              i += "; SameSite=None";
              break;
            default:
              throw TypeError("option sameSite is invalid");
          }
          return i;
        }, b = decodeURIComponent, c = encodeURIComponent, d = /; */, e = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/, a.exports = f;
      })();
    }, 918: (a) => {
      "use strict";
      var b = Object.defineProperty, c = Object.getOwnPropertyDescriptor, d = Object.getOwnPropertyNames, e = Object.prototype.hasOwnProperty, f = {}, g = { RequestCookies: () => n, ResponseCookies: () => o, parseCookie: () => j, parseSetCookie: () => k, stringifyCookie: () => i };
      for (var h in g) b(f, h, { get: g[h], enumerable: true });
      function i(a2) {
        var b2;
        let c2 = ["path" in a2 && a2.path && `Path=${a2.path}`, "expires" in a2 && (a2.expires || 0 === a2.expires) && `Expires=${("number" == typeof a2.expires ? new Date(a2.expires) : a2.expires).toUTCString()}`, "maxAge" in a2 && "number" == typeof a2.maxAge && `Max-Age=${a2.maxAge}`, "domain" in a2 && a2.domain && `Domain=${a2.domain}`, "secure" in a2 && a2.secure && "Secure", "httpOnly" in a2 && a2.httpOnly && "HttpOnly", "sameSite" in a2 && a2.sameSite && `SameSite=${a2.sameSite}`, "partitioned" in a2 && a2.partitioned && "Partitioned", "priority" in a2 && a2.priority && `Priority=${a2.priority}`].filter(Boolean), d2 = `${a2.name}=${encodeURIComponent(null != (b2 = a2.value) ? b2 : "")}`;
        return 0 === c2.length ? d2 : `${d2}; ${c2.join("; ")}`;
      }
      function j(a2) {
        let b2 = /* @__PURE__ */ new Map();
        for (let c2 of a2.split(/; */)) {
          if (!c2) continue;
          let a3 = c2.indexOf("=");
          if (-1 === a3) {
            b2.set(c2, "true");
            continue;
          }
          let [d2, e2] = [c2.slice(0, a3), c2.slice(a3 + 1)];
          try {
            b2.set(d2, decodeURIComponent(null != e2 ? e2 : "true"));
          } catch {
          }
        }
        return b2;
      }
      function k(a2) {
        if (!a2) return;
        let [[b2, c2], ...d2] = j(a2), { domain: e2, expires: f2, httponly: g2, maxage: h2, path: i2, samesite: k2, secure: n2, partitioned: o2, priority: p } = Object.fromEntries(d2.map(([a3, b3]) => [a3.toLowerCase().replace(/-/g, ""), b3]));
        {
          var q, r, s = { name: b2, value: decodeURIComponent(c2), domain: e2, ...f2 && { expires: new Date(f2) }, ...g2 && { httpOnly: true }, ..."string" == typeof h2 && { maxAge: Number(h2) }, path: i2, ...k2 && { sameSite: l.includes(q = (q = k2).toLowerCase()) ? q : void 0 }, ...n2 && { secure: true }, ...p && { priority: m.includes(r = (r = p).toLowerCase()) ? r : void 0 }, ...o2 && { partitioned: true } };
          let a3 = {};
          for (let b3 in s) s[b3] && (a3[b3] = s[b3]);
          return a3;
        }
      }
      a.exports = ((a2, f2, g2) => {
        if (f2 && "object" == typeof f2 || "function" == typeof f2) for (let h2 of d(f2)) e.call(a2, h2) || void 0 === h2 || b(a2, h2, { get: () => f2[h2], enumerable: !(g2 = c(f2, h2)) || g2.enumerable });
        return a2;
      })(b({}, "__esModule", { value: true }), f);
      var l = ["strict", "lax", "none"], m = ["low", "medium", "high"], n = class {
        constructor(a2) {
          this._parsed = /* @__PURE__ */ new Map(), this._headers = a2;
          const b2 = a2.get("cookie");
          if (b2) for (const [a3, c2] of j(b2)) this._parsed.set(a3, { name: a3, value: c2 });
        }
        [Symbol.iterator]() {
          return this._parsed[Symbol.iterator]();
        }
        get size() {
          return this._parsed.size;
        }
        get(...a2) {
          let b2 = "string" == typeof a2[0] ? a2[0] : a2[0].name;
          return this._parsed.get(b2);
        }
        getAll(...a2) {
          var b2;
          let c2 = Array.from(this._parsed);
          if (!a2.length) return c2.map(([a3, b3]) => b3);
          let d2 = "string" == typeof a2[0] ? a2[0] : null == (b2 = a2[0]) ? void 0 : b2.name;
          return c2.filter(([a3]) => a3 === d2).map(([a3, b3]) => b3);
        }
        has(a2) {
          return this._parsed.has(a2);
        }
        set(...a2) {
          let [b2, c2] = 1 === a2.length ? [a2[0].name, a2[0].value] : a2, d2 = this._parsed;
          return d2.set(b2, { name: b2, value: c2 }), this._headers.set("cookie", Array.from(d2).map(([a3, b3]) => i(b3)).join("; ")), this;
        }
        delete(a2) {
          let b2 = this._parsed, c2 = Array.isArray(a2) ? a2.map((a3) => b2.delete(a3)) : b2.delete(a2);
          return this._headers.set("cookie", Array.from(b2).map(([a3, b3]) => i(b3)).join("; ")), c2;
        }
        clear() {
          return this.delete(Array.from(this._parsed.keys())), this;
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return `RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
        }
        toString() {
          return [...this._parsed.values()].map((a2) => `${a2.name}=${encodeURIComponent(a2.value)}`).join("; ");
        }
      }, o = class {
        constructor(a2) {
          var b2, c2, d2;
          this._parsed = /* @__PURE__ */ new Map(), this._headers = a2;
          const e2 = null != (d2 = null != (c2 = null == (b2 = a2.getSetCookie) ? void 0 : b2.call(a2)) ? c2 : a2.get("set-cookie")) ? d2 : [];
          for (const a3 of Array.isArray(e2) ? e2 : function(a4) {
            if (!a4) return [];
            var b3, c3, d3, e3, f2, g2 = [], h2 = 0;
            function i2() {
              for (; h2 < a4.length && /\s/.test(a4.charAt(h2)); ) h2 += 1;
              return h2 < a4.length;
            }
            for (; h2 < a4.length; ) {
              for (b3 = h2, f2 = false; i2(); ) if ("," === (c3 = a4.charAt(h2))) {
                for (d3 = h2, h2 += 1, i2(), e3 = h2; h2 < a4.length && "=" !== (c3 = a4.charAt(h2)) && ";" !== c3 && "," !== c3; ) h2 += 1;
                h2 < a4.length && "=" === a4.charAt(h2) ? (f2 = true, h2 = e3, g2.push(a4.substring(b3, d3)), b3 = h2) : h2 = d3 + 1;
              } else h2 += 1;
              (!f2 || h2 >= a4.length) && g2.push(a4.substring(b3, a4.length));
            }
            return g2;
          }(e2)) {
            const b3 = k(a3);
            b3 && this._parsed.set(b3.name, b3);
          }
        }
        get(...a2) {
          let b2 = "string" == typeof a2[0] ? a2[0] : a2[0].name;
          return this._parsed.get(b2);
        }
        getAll(...a2) {
          var b2;
          let c2 = Array.from(this._parsed.values());
          if (!a2.length) return c2;
          let d2 = "string" == typeof a2[0] ? a2[0] : null == (b2 = a2[0]) ? void 0 : b2.name;
          return c2.filter((a3) => a3.name === d2);
        }
        has(a2) {
          return this._parsed.has(a2);
        }
        set(...a2) {
          let [b2, c2, d2] = 1 === a2.length ? [a2[0].name, a2[0].value, a2[0]] : a2, e2 = this._parsed;
          return e2.set(b2, function(a3 = { name: "", value: "" }) {
            return "number" == typeof a3.expires && (a3.expires = new Date(a3.expires)), a3.maxAge && (a3.expires = new Date(Date.now() + 1e3 * a3.maxAge)), (null === a3.path || void 0 === a3.path) && (a3.path = "/"), a3;
          }({ name: b2, value: c2, ...d2 })), function(a3, b3) {
            for (let [, c3] of (b3.delete("set-cookie"), a3)) {
              let a4 = i(c3);
              b3.append("set-cookie", a4);
            }
          }(e2, this._headers), this;
        }
        delete(...a2) {
          let [b2, c2] = "string" == typeof a2[0] ? [a2[0]] : [a2[0].name, a2[0]];
          return this.set({ ...c2, name: b2, value: "", expires: /* @__PURE__ */ new Date(0) });
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return `ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
        }
        toString() {
          return [...this._parsed.values()].map(i).join("; ");
        }
      };
    }, 987: (a, b, c) => {
      "use strict";
      Object.defineProperty(b, "__esModule", { value: true });
      var d = { interceptTestApis: function() {
        return h;
      }, wrapRequestHandler: function() {
        return i;
      } };
      for (var e in d) Object.defineProperty(b, e, { enumerable: true, get: d[e] });
      let f = c(643), g = c(318);
      function h() {
        return (0, g.interceptFetch)(c.g.fetch);
      }
      function i(a2) {
        return (b2, c2) => (0, f.withRequest)(b2, g.reader, () => a2(b2, c2));
      }
    }, 990: (a, b, c) => {
      var d, e = { 943: function(e2, f2) {
        !function(g2) {
          "use strict";
          var h = "function", i = "undefined", j = "object", k = "string", l = "major", m = "model", n = "name", o = "type", p = "vendor", q = "version", r = "architecture", s = "console", t = "mobile", u = "tablet", v = "smarttv", w = "wearable", x = "embedded", y = "Amazon", z = "Apple", A = "ASUS", B = "BlackBerry", C = "Browser", D = "Chrome", E = "Firefox", F = "Google", G = "Huawei", H = "Microsoft", I = "Motorola", J = "Opera", K = "Samsung", L = "Sharp", M = "Sony", N = "Xiaomi", O = "Zebra", P = "Facebook", Q = "Chromium OS", R = "Mac OS", S = function(a2, b2) {
            var c2 = {};
            for (var d2 in a2) b2[d2] && b2[d2].length % 2 == 0 ? c2[d2] = b2[d2].concat(a2[d2]) : c2[d2] = a2[d2];
            return c2;
          }, T = function(a2) {
            for (var b2 = {}, c2 = 0; c2 < a2.length; c2++) b2[a2[c2].toUpperCase()] = a2[c2];
            return b2;
          }, U = function(a2, b2) {
            return typeof a2 === k && -1 !== V(b2).indexOf(V(a2));
          }, V = function(a2) {
            return a2.toLowerCase();
          }, W = function(a2, b2) {
            if (typeof a2 === k) return a2 = a2.replace(/^\s\s*/, ""), typeof b2 === i ? a2 : a2.substring(0, 350);
          }, X = function(a2, b2) {
            for (var c2, d2, e3, f3, g3, i2, k2 = 0; k2 < b2.length && !g3; ) {
              var l2 = b2[k2], m2 = b2[k2 + 1];
              for (c2 = d2 = 0; c2 < l2.length && !g3 && l2[c2]; ) if (g3 = l2[c2++].exec(a2)) for (e3 = 0; e3 < m2.length; e3++) i2 = g3[++d2], typeof (f3 = m2[e3]) === j && f3.length > 0 ? 2 === f3.length ? typeof f3[1] == h ? this[f3[0]] = f3[1].call(this, i2) : this[f3[0]] = f3[1] : 3 === f3.length ? typeof f3[1] !== h || f3[1].exec && f3[1].test ? this[f3[0]] = i2 ? i2.replace(f3[1], f3[2]) : void 0 : this[f3[0]] = i2 ? f3[1].call(this, i2, f3[2]) : void 0 : 4 === f3.length && (this[f3[0]] = i2 ? f3[3].call(this, i2.replace(f3[1], f3[2])) : void 0) : this[f3] = i2 || void 0;
              k2 += 2;
            }
          }, Y = function(a2, b2) {
            for (var c2 in b2) if (typeof b2[c2] === j && b2[c2].length > 0) {
              for (var d2 = 0; d2 < b2[c2].length; d2++) if (U(b2[c2][d2], a2)) return "?" === c2 ? void 0 : c2;
            } else if (U(b2[c2], a2)) return "?" === c2 ? void 0 : c2;
            return a2;
          }, Z = { ME: "4.90", "NT 3.11": "NT3.51", "NT 4.0": "NT4.0", 2e3: "NT 5.0", XP: ["NT 5.1", "NT 5.2"], Vista: "NT 6.0", 7: "NT 6.1", 8: "NT 6.2", 8.1: "NT 6.3", 10: ["NT 6.4", "NT 10.0"], RT: "ARM" }, $ = { browser: [[/\b(?:crmo|crios)\/([\w\.]+)/i], [q, [n, "Chrome"]], [/edg(?:e|ios|a)?\/([\w\.]+)/i], [q, [n, "Edge"]], [/(opera mini)\/([-\w\.]+)/i, /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i, /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i], [n, q], [/opios[\/ ]+([\w\.]+)/i], [q, [n, J + " Mini"]], [/\bopr\/([\w\.]+)/i], [q, [n, J]], [/(kindle)\/([\w\.]+)/i, /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i, /(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i, /(ba?idubrowser)[\/ ]?([\w\.]+)/i, /(?:ms|\()(ie) ([\w\.]+)/i, /(flock|rockmelt|midori|epiphany|silk|skyfire|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|qq|duckduckgo)\/([-\w\.]+)/i, /(heytap|ovi)browser\/([\d\.]+)/i, /(weibo)__([\d\.]+)/i], [n, q], [/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i], [q, [n, "UC" + C]], [/microm.+\bqbcore\/([\w\.]+)/i, /\bqbcore\/([\w\.]+).+microm/i], [q, [n, "WeChat(Win) Desktop"]], [/micromessenger\/([\w\.]+)/i], [q, [n, "WeChat"]], [/konqueror\/([\w\.]+)/i], [q, [n, "Konqueror"]], [/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i], [q, [n, "IE"]], [/ya(?:search)?browser\/([\w\.]+)/i], [q, [n, "Yandex"]], [/(avast|avg)\/([\w\.]+)/i], [[n, /(.+)/, "$1 Secure " + C], q], [/\bfocus\/([\w\.]+)/i], [q, [n, E + " Focus"]], [/\bopt\/([\w\.]+)/i], [q, [n, J + " Touch"]], [/coc_coc\w+\/([\w\.]+)/i], [q, [n, "Coc Coc"]], [/dolfin\/([\w\.]+)/i], [q, [n, "Dolphin"]], [/coast\/([\w\.]+)/i], [q, [n, J + " Coast"]], [/miuibrowser\/([\w\.]+)/i], [q, [n, "MIUI " + C]], [/fxios\/([-\w\.]+)/i], [q, [n, E]], [/\bqihu|(qi?ho?o?|360)browser/i], [[n, "360 " + C]], [/(oculus|samsung|sailfish|huawei)browser\/([\w\.]+)/i], [[n, /(.+)/, "$1 " + C], q], [/(comodo_dragon)\/([\w\.]+)/i], [[n, /_/g, " "], q], [/(electron)\/([\w\.]+) safari/i, /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i, /m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i], [n, q], [/(metasr)[\/ ]?([\w\.]+)/i, /(lbbrowser)/i, /\[(linkedin)app\]/i], [n], [/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i], [[n, P], q], [/(kakao(?:talk|story))[\/ ]([\w\.]+)/i, /(naver)\(.*?(\d+\.[\w\.]+).*\)/i, /safari (line)\/([\w\.]+)/i, /\b(line)\/([\w\.]+)\/iab/i, /(chromium|instagram)[\/ ]([-\w\.]+)/i], [n, q], [/\bgsa\/([\w\.]+) .*safari\//i], [q, [n, "GSA"]], [/musical_ly(?:.+app_?version\/|_)([\w\.]+)/i], [q, [n, "TikTok"]], [/headlesschrome(?:\/([\w\.]+)| )/i], [q, [n, D + " Headless"]], [/ wv\).+(chrome)\/([\w\.]+)/i], [[n, D + " WebView"], q], [/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i], [q, [n, "Android " + C]], [/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i], [n, q], [/version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i], [q, [n, "Mobile Safari"]], [/version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i], [q, n], [/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i], [n, [q, Y, { "1.0": "/8", 1.2: "/1", 1.3: "/3", "2.0": "/412", "2.0.2": "/416", "2.0.3": "/417", "2.0.4": "/419", "?": "/" }]], [/(webkit|khtml)\/([\w\.]+)/i], [n, q], [/(navigator|netscape\d?)\/([-\w\.]+)/i], [[n, "Netscape"], q], [/mobile vr; rv:([\w\.]+)\).+firefox/i], [q, [n, E + " Reality"]], [/ekiohf.+(flow)\/([\w\.]+)/i, /(swiftfox)/i, /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i, /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i, /(firefox)\/([\w\.]+)/i, /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i, /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i, /(links) \(([\w\.]+)/i, /panasonic;(viera)/i], [n, q], [/(cobalt)\/([\w\.]+)/i], [n, [q, /master.|lts./, ""]]], cpu: [[/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i], [[r, "amd64"]], [/(ia32(?=;))/i], [[r, V]], [/((?:i[346]|x)86)[;\)]/i], [[r, "ia32"]], [/\b(aarch64|arm(v?8e?l?|_?64))\b/i], [[r, "arm64"]], [/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i], [[r, "armhf"]], [/windows (ce|mobile); ppc;/i], [[r, "arm"]], [/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i], [[r, /ower/, "", V]], [/(sun4\w)[;\)]/i], [[r, "sparc"]], [/((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i], [[r, V]]], device: [[/\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i], [m, [p, K], [o, u]], [/\b((?:s[cgp]h|gt|sm)-\w+|sc[g-]?[\d]+a?|galaxy nexus)/i, /samsung[- ]([-\w]+)/i, /sec-(sgh\w+)/i], [m, [p, K], [o, t]], [/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i], [m, [p, z], [o, t]], [/\((ipad);[-\w\),; ]+apple/i, /applecoremedia\/[\w\.]+ \((ipad)/i, /\b(ipad)\d\d?,\d\d?[;\]].+ios/i], [m, [p, z], [o, u]], [/(macintosh);/i], [m, [p, z]], [/\b(sh-?[altvz]?\d\d[a-ekm]?)/i], [m, [p, L], [o, t]], [/\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i], [m, [p, G], [o, u]], [/(?:huawei|honor)([-\w ]+)[;\)]/i, /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i], [m, [p, G], [o, t]], [/\b(poco[\w ]+)(?: bui|\))/i, /\b; (\w+) build\/hm\1/i, /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i, /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i, /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i], [[m, /_/g, " "], [p, N], [o, t]], [/\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i], [[m, /_/g, " "], [p, N], [o, u]], [/; (\w+) bui.+ oppo/i, /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i], [m, [p, "OPPO"], [o, t]], [/vivo (\w+)(?: bui|\))/i, /\b(v[12]\d{3}\w?[at])(?: bui|;)/i], [m, [p, "Vivo"], [o, t]], [/\b(rmx[12]\d{3})(?: bui|;|\))/i], [m, [p, "Realme"], [o, t]], [/\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i, /\bmot(?:orola)?[- ](\w*)/i, /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i], [m, [p, I], [o, t]], [/\b(mz60\d|xoom[2 ]{0,2}) build\//i], [m, [p, I], [o, u]], [/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i], [m, [p, "LG"], [o, u]], [/(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i, /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i, /\blg-?([\d\w]+) bui/i], [m, [p, "LG"], [o, t]], [/(ideatab[-\w ]+)/i, /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i], [m, [p, "Lenovo"], [o, u]], [/(?:maemo|nokia).*(n900|lumia \d+)/i, /nokia[-_ ]?([-\w\.]*)/i], [[m, /_/g, " "], [p, "Nokia"], [o, t]], [/(pixel c)\b/i], [m, [p, F], [o, u]], [/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i], [m, [p, F], [o, t]], [/droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i], [m, [p, M], [o, t]], [/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i], [[m, "Xperia Tablet"], [p, M], [o, u]], [/ (kb2005|in20[12]5|be20[12][59])\b/i, /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i], [m, [p, "OnePlus"], [o, t]], [/(alexa)webm/i, /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i, /(kf[a-z]+)( bui|\)).+silk\//i], [m, [p, y], [o, u]], [/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i], [[m, /(.+)/g, "Fire Phone $1"], [p, y], [o, t]], [/(playbook);[-\w\),; ]+(rim)/i], [m, p, [o, u]], [/\b((?:bb[a-f]|st[hv])100-\d)/i, /\(bb10; (\w+)/i], [m, [p, B], [o, t]], [/(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i], [m, [p, A], [o, u]], [/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i], [m, [p, A], [o, t]], [/(nexus 9)/i], [m, [p, "HTC"], [o, u]], [/(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i, /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i, /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i], [p, [m, /_/g, " "], [o, t]], [/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i], [m, [p, "Acer"], [o, u]], [/droid.+; (m[1-5] note) bui/i, /\bmz-([-\w]{2,})/i], [m, [p, "Meizu"], [o, t]], [/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[-_ ]?([-\w]*)/i, /(hp) ([\w ]+\w)/i, /(asus)-?(\w+)/i, /(microsoft); (lumia[\w ]+)/i, /(lenovo)[-_ ]?([-\w]+)/i, /(jolla)/i, /(oppo) ?([\w ]+) bui/i], [p, m, [o, t]], [/(kobo)\s(ereader|touch)/i, /(archos) (gamepad2?)/i, /(hp).+(touchpad(?!.+tablet)|tablet)/i, /(kindle)\/([\w\.]+)/i, /(nook)[\w ]+build\/(\w+)/i, /(dell) (strea[kpr\d ]*[\dko])/i, /(le[- ]+pan)[- ]+(\w{1,9}) bui/i, /(trinity)[- ]*(t\d{3}) bui/i, /(gigaset)[- ]+(q\w{1,9}) bui/i, /(vodafone) ([\w ]+)(?:\)| bui)/i], [p, m, [o, u]], [/(surface duo)/i], [m, [p, H], [o, u]], [/droid [\d\.]+; (fp\du?)(?: b|\))/i], [m, [p, "Fairphone"], [o, t]], [/(u304aa)/i], [m, [p, "AT&T"], [o, t]], [/\bsie-(\w*)/i], [m, [p, "Siemens"], [o, t]], [/\b(rct\w+) b/i], [m, [p, "RCA"], [o, u]], [/\b(venue[\d ]{2,7}) b/i], [m, [p, "Dell"], [o, u]], [/\b(q(?:mv|ta)\w+) b/i], [m, [p, "Verizon"], [o, u]], [/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i], [m, [p, "Barnes & Noble"], [o, u]], [/\b(tm\d{3}\w+) b/i], [m, [p, "NuVision"], [o, u]], [/\b(k88) b/i], [m, [p, "ZTE"], [o, u]], [/\b(nx\d{3}j) b/i], [m, [p, "ZTE"], [o, t]], [/\b(gen\d{3}) b.+49h/i], [m, [p, "Swiss"], [o, t]], [/\b(zur\d{3}) b/i], [m, [p, "Swiss"], [o, u]], [/\b((zeki)?tb.*\b) b/i], [m, [p, "Zeki"], [o, u]], [/\b([yr]\d{2}) b/i, /\b(dragon[- ]+touch |dt)(\w{5}) b/i], [[p, "Dragon Touch"], m, [o, u]], [/\b(ns-?\w{0,9}) b/i], [m, [p, "Insignia"], [o, u]], [/\b((nxa|next)-?\w{0,9}) b/i], [m, [p, "NextBook"], [o, u]], [/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i], [[p, "Voice"], m, [o, t]], [/\b(lvtel\-)?(v1[12]) b/i], [[p, "LvTel"], m, [o, t]], [/\b(ph-1) /i], [m, [p, "Essential"], [o, t]], [/\b(v(100md|700na|7011|917g).*\b) b/i], [m, [p, "Envizen"], [o, u]], [/\b(trio[-\w\. ]+) b/i], [m, [p, "MachSpeed"], [o, u]], [/\btu_(1491) b/i], [m, [p, "Rotor"], [o, u]], [/(shield[\w ]+) b/i], [m, [p, "Nvidia"], [o, u]], [/(sprint) (\w+)/i], [p, m, [o, t]], [/(kin\.[onetw]{3})/i], [[m, /\./g, " "], [p, H], [o, t]], [/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i], [m, [p, O], [o, u]], [/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i], [m, [p, O], [o, t]], [/smart-tv.+(samsung)/i], [p, [o, v]], [/hbbtv.+maple;(\d+)/i], [[m, /^/, "SmartTV"], [p, K], [o, v]], [/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i], [[p, "LG"], [o, v]], [/(apple) ?tv/i], [p, [m, z + " TV"], [o, v]], [/crkey/i], [[m, D + "cast"], [p, F], [o, v]], [/droid.+aft(\w)( bui|\))/i], [m, [p, y], [o, v]], [/\(dtv[\);].+(aquos)/i, /(aquos-tv[\w ]+)\)/i], [m, [p, L], [o, v]], [/(bravia[\w ]+)( bui|\))/i], [m, [p, M], [o, v]], [/(mitv-\w{5}) bui/i], [m, [p, N], [o, v]], [/Hbbtv.*(technisat) (.*);/i], [p, m, [o, v]], [/\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i, /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i], [[p, W], [m, W], [o, v]], [/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i], [[o, v]], [/(ouya)/i, /(nintendo) ([wids3utch]+)/i], [p, m, [o, s]], [/droid.+; (shield) bui/i], [m, [p, "Nvidia"], [o, s]], [/(playstation [345portablevi]+)/i], [m, [p, M], [o, s]], [/\b(xbox(?: one)?(?!; xbox))[\); ]/i], [m, [p, H], [o, s]], [/((pebble))app/i], [p, m, [o, w]], [/(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i], [m, [p, z], [o, w]], [/droid.+; (glass) \d/i], [m, [p, F], [o, w]], [/droid.+; (wt63?0{2,3})\)/i], [m, [p, O], [o, w]], [/(quest( 2| pro)?)/i], [m, [p, P], [o, w]], [/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i], [p, [o, x]], [/(aeobc)\b/i], [m, [p, y], [o, x]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i], [m, [o, t]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i], [m, [o, u]], [/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i], [[o, u]], [/(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i], [[o, t]], [/(android[-\w\. ]{0,9});.+buil/i], [m, [p, "Generic"]]], engine: [[/windows.+ edge\/([\w\.]+)/i], [q, [n, "EdgeHTML"]], [/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i], [q, [n, "Blink"]], [/(presto)\/([\w\.]+)/i, /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i, /ekioh(flow)\/([\w\.]+)/i, /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i, /(icab)[\/ ]([23]\.[\d\.]+)/i, /\b(libweb)/i], [n, q], [/rv\:([\w\.]{1,9})\b.+(gecko)/i], [q, n]], os: [[/microsoft (windows) (vista|xp)/i], [n, q], [/(windows) nt 6\.2; (arm)/i, /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i, /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i], [n, [q, Y, Z]], [/(win(?=3|9|n)|win 9x )([nt\d\.]+)/i], [[n, "Windows"], [q, Y, Z]], [/ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i, /ios;fbsv\/([\d\.]+)/i, /cfnetwork\/.+darwin/i], [[q, /_/g, "."], [n, "iOS"]], [/(mac os x) ?([\w\. ]*)/i, /(macintosh|mac_powerpc\b)(?!.+haiku)/i], [[n, R], [q, /_/g, "."]], [/droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i], [q, n], [/(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i, /(blackberry)\w*\/([\w\.]*)/i, /(tizen|kaios)[\/ ]([\w\.]+)/i, /\((series40);/i], [n, q], [/\(bb(10);/i], [q, [n, B]], [/(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i], [q, [n, "Symbian"]], [/mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i], [q, [n, E + " OS"]], [/web0s;.+rt(tv)/i, /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i], [q, [n, "webOS"]], [/watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i], [q, [n, "watchOS"]], [/crkey\/([\d\.]+)/i], [q, [n, D + "cast"]], [/(cros) [\w]+(?:\)| ([\w\.]+)\b)/i], [[n, Q], q], [/panasonic;(viera)/i, /(netrange)mmh/i, /(nettv)\/(\d+\.[\w\.]+)/i, /(nintendo|playstation) ([wids345portablevuch]+)/i, /(xbox); +xbox ([^\);]+)/i, /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i, /(mint)[\/\(\) ]?(\w*)/i, /(mageia|vectorlinux)[; ]/i, /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i, /(hurd|linux) ?([\w\.]*)/i, /(gnu) ?([\w\.]*)/i, /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i, /(haiku) (\w+)/i], [n, q], [/(sunos) ?([\w\.\d]*)/i], [[n, "Solaris"], q], [/((?:open)?solaris)[-\/ ]?([\w\.]*)/i, /(aix) ((\d)(?=\.|\)| )[\w\.])*/i, /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i, /(unix) ?([\w\.]*)/i], [n, q]] }, _ = function(a2, b2) {
            if (typeof a2 === j && (b2 = a2, a2 = void 0), !(this instanceof _)) return new _(a2, b2).getResult();
            var c2 = typeof g2 !== i && g2.navigator ? g2.navigator : void 0, d2 = a2 || (c2 && c2.userAgent ? c2.userAgent : ""), e3 = c2 && c2.userAgentData ? c2.userAgentData : void 0, f3 = b2 ? S($, b2) : $, s2 = c2 && c2.userAgent == d2;
            return this.getBrowser = function() {
              var a3, b3 = {};
              return b3[n] = void 0, b3[q] = void 0, X.call(b3, d2, f3.browser), b3[l] = typeof (a3 = b3[q]) === k ? a3.replace(/[^\d\.]/g, "").split(".")[0] : void 0, s2 && c2 && c2.brave && typeof c2.brave.isBrave == h && (b3[n] = "Brave"), b3;
            }, this.getCPU = function() {
              var a3 = {};
              return a3[r] = void 0, X.call(a3, d2, f3.cpu), a3;
            }, this.getDevice = function() {
              var a3 = {};
              return a3[p] = void 0, a3[m] = void 0, a3[o] = void 0, X.call(a3, d2, f3.device), s2 && !a3[o] && e3 && e3.mobile && (a3[o] = t), s2 && "Macintosh" == a3[m] && c2 && typeof c2.standalone !== i && c2.maxTouchPoints && c2.maxTouchPoints > 2 && (a3[m] = "iPad", a3[o] = u), a3;
            }, this.getEngine = function() {
              var a3 = {};
              return a3[n] = void 0, a3[q] = void 0, X.call(a3, d2, f3.engine), a3;
            }, this.getOS = function() {
              var a3 = {};
              return a3[n] = void 0, a3[q] = void 0, X.call(a3, d2, f3.os), s2 && !a3[n] && e3 && "Unknown" != e3.platform && (a3[n] = e3.platform.replace(/chrome os/i, Q).replace(/macos/i, R)), a3;
            }, this.getResult = function() {
              return { ua: this.getUA(), browser: this.getBrowser(), engine: this.getEngine(), os: this.getOS(), device: this.getDevice(), cpu: this.getCPU() };
            }, this.getUA = function() {
              return d2;
            }, this.setUA = function(a3) {
              return d2 = typeof a3 === k && a3.length > 350 ? W(a3, 350) : a3, this;
            }, this.setUA(d2), this;
          };
          _.VERSION = "1.0.35", _.BROWSER = T([n, q, l]), _.CPU = T([r]), _.DEVICE = T([m, p, o, s, t, v, u, w, x]), _.ENGINE = _.OS = T([n, q]), typeof f2 !== i ? (e2.exports && (f2 = e2.exports = _), f2.UAParser = _) : c.amdO ? void 0 === (d = function() {
            return _;
          }.call(b, c, b, a)) || (a.exports = d) : typeof g2 !== i && (g2.UAParser = _);
          var aa = typeof g2 !== i && (g2.jQuery || g2.Zepto);
          if (aa && !aa.ua) {
            var ab = new _();
            aa.ua = ab.getResult(), aa.ua.get = function() {
              return ab.getUA();
            }, aa.ua.set = function(a2) {
              ab.setUA(a2);
              var b2 = ab.getResult();
              for (var c2 in b2) aa.ua[c2] = b2[c2];
            };
          }
        }("object" == typeof window ? window : this);
      } }, f = {};
      function g(a2) {
        var b2 = f[a2];
        if (void 0 !== b2) return b2.exports;
        var c2 = f[a2] = { exports: {} }, d2 = true;
        try {
          e[a2].call(c2.exports, c2, c2.exports, g), d2 = false;
        } finally {
          d2 && delete f[a2];
        }
        return c2.exports;
      }
      g.ab = "//", a.exports = g(943);
    } }, (a) => {
      var b = a(a.s = 202);
      (_ENTRIES = "u" < typeof _ENTRIES ? {} : _ENTRIES)["middleware_src/middleware"] = b;
    }]);
  }
});

// node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js
var edgeFunctionHandler_exports = {};
__export(edgeFunctionHandler_exports, {
  default: () => edgeFunctionHandler
});
async function edgeFunctionHandler(request) {
  const path3 = new URL(request.url).pathname;
  const routes = globalThis._ROUTES;
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(path3);
  } catch {
  }
  const correspondingRoute = routes.find((route) => route.regex.some((r) => {
    const regex = new RegExp(r);
    return regex.test(path3) || decodedPath !== void 0 && regex.test(decodedPath);
  }));
  if (!correspondingRoute) {
    throw new Error(`No route found for ${request.url}`);
  }
  const entry = await self._ENTRIES[`middleware_${correspondingRoute.name}`];
  const result = await entry.default({
    page: correspondingRoute.page,
    request: {
      ...request,
      page: {
        name: correspondingRoute.name
      }
    }
  });
  globalThis.__openNextAls.getStore()?.pendingPromiseRunner.add(result.waitUntil);
  const response = result.response;
  return response;
}
var init_edgeFunctionHandler = __esm({
  "node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js"() {
    globalThis._ENTRIES = {};
    globalThis.self = globalThis;
    globalThis._ROUTES = [{ "name": "src/middleware", "page": "/", "regex": ["^(?:\\/(_next\\/data\\/[^/]{1,}))?\\/dashboard(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\.json|\\.rsc|\\.segments\\/.+\\.segment\\.rsc)?[\\/#\\?]?$", "^(?:\\/(_next\\/data\\/[^/]{1,}))?\\/admin(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\.json|\\.rsc|\\.segments\\/.+\\.segment\\.rsc)?[\\/#\\?]?$"] }];
    require_edge_runtime_webpack();
    require_middleware();
  }
});

// node_modules/@opennextjs/aws/dist/utils/promise.js
init_logger();

// node_modules/@opennextjs/aws/dist/utils/requestCache.js
var RequestCache = class {
  _caches = /* @__PURE__ */ new Map();
  /**
   * Returns the Map registered under `key`.
   * If no Map exists yet for that key, a new empty Map is created, stored, and returned.
   * Repeated calls with the same key always return the **same** Map instance.
   */
  getOrCreate(key) {
    let cache = this._caches.get(key);
    if (!cache) {
      cache = /* @__PURE__ */ new Map();
      this._caches.set(key, cache);
    }
    return cache;
  }
};

// node_modules/@opennextjs/aws/dist/utils/promise.js
var DetachedPromise = class {
  resolve;
  reject;
  promise;
  constructor() {
    let resolve;
    let reject;
    this.promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    this.resolve = resolve;
    this.reject = reject;
  }
};
var DetachedPromiseRunner = class {
  promises = [];
  withResolvers() {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    return detachedPromise;
  }
  add(promise) {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    promise.then(detachedPromise.resolve, detachedPromise.reject);
  }
  async await() {
    debug(`Awaiting ${this.promises.length} detached promises`);
    const results = await Promise.allSettled(this.promises.map((p) => p.promise));
    const rejectedPromises = results.filter((r) => r.status === "rejected");
    rejectedPromises.forEach((r) => {
      error(r.reason);
    });
  }
};
async function awaitAllDetachedPromise() {
  const store = globalThis.__openNextAls.getStore();
  const promisesToAwait = store?.pendingPromiseRunner.await() ?? Promise.resolve();
  if (store?.waitUntil) {
    store.waitUntil(promisesToAwait);
    return;
  }
  await promisesToAwait;
}
function provideNextAfterProvider() {
  const NEXT_REQUEST_CONTEXT_SYMBOL = Symbol.for("@next/request-context");
  const VERCEL_REQUEST_CONTEXT_SYMBOL = Symbol.for("@vercel/request-context");
  const store = globalThis.__openNextAls.getStore();
  const waitUntil = store?.waitUntil ?? ((promise) => store?.pendingPromiseRunner.add(promise));
  const nextAfterContext = {
    get: () => ({
      waitUntil
    })
  };
  globalThis[NEXT_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  if (process.env.EMULATE_VERCEL_REQUEST_CONTEXT) {
    globalThis[VERCEL_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  }
}
function runWithOpenNextRequestContext({ isISRRevalidation, waitUntil, requestId = Math.random().toString(36) }, fn) {
  return globalThis.__openNextAls.run({
    requestId,
    pendingPromiseRunner: new DetachedPromiseRunner(),
    isISRRevalidation,
    waitUntil,
    writtenTags: /* @__PURE__ */ new Set(),
    requestCache: new RequestCache()
  }, async () => {
    provideNextAfterProvider();
    let result;
    try {
      result = await fn();
    } finally {
      await awaitAllDetachedPromise();
    }
    return result;
  });
}

// node_modules/@opennextjs/aws/dist/adapters/middleware.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/resolve.js
async function resolveConverter(converter2) {
  if (typeof converter2 === "function") {
    return converter2();
  }
  const m_1 = await Promise.resolve().then(() => (init_edge(), edge_exports));
  return m_1.default;
}
async function resolveWrapper(wrapper) {
  if (typeof wrapper === "function") {
    return wrapper();
  }
  const m_1 = await Promise.resolve().then(() => (init_cloudflare_edge(), cloudflare_edge_exports));
  return m_1.default;
}
async function resolveOriginResolver(originResolver) {
  if (typeof originResolver === "function") {
    return originResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_pattern_env(), pattern_env_exports));
  return m_1.default;
}
async function resolveAssetResolver(assetResolver) {
  if (typeof assetResolver === "function") {
    return assetResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_dummy(), dummy_exports));
  return m_1.default;
}
async function resolveProxyRequest(proxyRequest) {
  if (typeof proxyRequest === "function") {
    return proxyRequest();
  }
  const m_1 = await Promise.resolve().then(() => (init_fetch(), fetch_exports));
  return m_1.default;
}

// node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
async function createGenericHandler(handler3) {
  const config = await import("./open-next.config.mjs").then((m) => m.default);
  globalThis.openNextConfig = config;
  const handlerConfig = config[handler3.type];
  const override = handlerConfig && "override" in handlerConfig ? handlerConfig.override : void 0;
  const converter2 = await resolveConverter(override?.converter);
  const { name, wrapper } = await resolveWrapper(override?.wrapper);
  debug("Using wrapper", name);
  return wrapper(handler3.handler, converter2);
}

// node_modules/@opennextjs/aws/dist/core/routing/util.js
import crypto2 from "node:crypto";
import { parse as parseQs, stringify as stringifyQs } from "node:querystring";

// node_modules/@opennextjs/aws/dist/adapters/config/index.js
init_logger();
import path from "node:path";
globalThis.__dirname ??= "";
var NEXT_DIR = path.join(__dirname, ".next");
var OPEN_NEXT_DIR = path.join(__dirname, ".open-next");
debug({ NEXT_DIR, OPEN_NEXT_DIR });
var NextConfig = { "env": {}, "typescript": { "ignoreBuildErrors": false }, "typedRoutes": false, "distDir": ".next", "cleanDistDir": true, "assetPrefix": "", "cacheMaxMemorySize": 52428800, "configOrigin": "next.config.ts", "useFileSystemPublicRoutes": true, "generateEtags": true, "pageExtensions": ["tsx", "ts", "jsx", "js"], "instrumentationClientInject": [], "poweredByHeader": true, "compress": true, "images": { "deviceSizes": [640, 750, 828, 1080, 1200, 1920, 2048, 3840], "imageSizes": [32, 48, 64, 96, 128, 256, 384], "path": "/_next/image", "loader": "default", "loaderFile": "", "domains": [], "disableStaticImages": false, "minimumCacheTTL": 14400, "formats": ["image/webp"], "maximumRedirects": 3, "maximumResponseBody": 5e7, "dangerouslyAllowLocalIP": false, "dangerouslyAllowSVG": false, "contentSecurityPolicy": "script-src 'none'; frame-src 'none'; sandbox;", "contentDispositionType": "attachment", "localPatterns": [{ "pathname": "**", "search": "" }], "remotePatterns": [], "qualities": [75], "unoptimized": false, "customCacheHandler": false }, "devIndicators": { "position": "bottom-left" }, "onDemandEntries": { "maxInactiveAge": 6e4, "pagesBufferLength": 5 }, "basePath": "", "sassOptions": {}, "trailingSlash": false, "i18n": null, "productionBrowserSourceMaps": false, "excludeDefaultMomentLocales": true, "reactProductionProfiling": false, "reactStrictMode": null, "reactMaxHeadersLength": 6e3, "httpAgentOptions": { "keepAlive": true }, "logging": { "serverFunctions": true, "browserToTerminal": "warn" }, "compiler": {}, "expireTime": 31536e3, "staticPageGenerationTimeout": 60, "output": "standalone", "modularizeImports": { "@mui/icons-material": { "transform": "@mui/icons-material/{{member}}" }, "lodash": { "transform": "lodash/{{member}}" } }, "outputFileTracingRoot": "D:\\Work\\KG1\\landing-portal", "enablePrerenderSourceMaps": true, "cacheComponents": false, "cacheLife": { "default": { "stale": 300, "revalidate": 900, "expire": 4294967294 }, "seconds": { "stale": 30, "revalidate": 1, "expire": 60 }, "minutes": { "stale": 300, "revalidate": 60, "expire": 3600 }, "hours": { "stale": 300, "revalidate": 3600, "expire": 86400 }, "days": { "stale": 300, "revalidate": 86400, "expire": 604800 }, "weeks": { "stale": 300, "revalidate": 604800, "expire": 2592e3 }, "max": { "stale": 300, "revalidate": 2592e3, "expire": 31536e3 } }, "cacheHandlers": {}, "experimental": { "appNewScrollHandler": true, "coldCacheBadge": false, "devValidationWorker": true, "useSkewCookie": false, "cssChunking": true, "multiZoneDraftMode": false, "appNavFailHandling": false, "prerenderEarlyExit": true, "serverMinification": true, "linkNoTouchStart": false, "caseSensitiveRoutes": false, "cachedNavigations": false, "dynamicOnHover": false, "useOffline": false, "varyParams": true, "optimisticRouting": true, "instrumentationClientRouterTransitionEvents": false, "prefetchInlining": { "maxSize": 2048, "maxBundleSize": 10240 }, "preloadEntriesOnStart": true, "clientRouterFilter": true, "clientRouterFilterRedirects": false, "fetchCacheKeyPrefix": "", "proxyPrefetch": "flexible", "optimisticClientCache": true, "manualClientBasePath": false, "cpus": 11, "memoryBasedWorkersCount": false, "imgOptConcurrency": null, "imgOptOperationCache": null, "imgOptTimeoutInSeconds": 7, "imgOptMaxInputPixels": 268402689, "imgOptSequentialRead": null, "isrFlushToDisk": true, "workerThreads": false, "optimizeCss": false, "nextScriptWorkers": false, "scrollRestoration": false, "externalDir": false, "devMemoryThresholdRestart": true, "disableOptimizedLoading": false, "gzipSize": true, "craCompat": false, "esmExternals": true, "fullySpecified": false, "swcTraceProfiling": false, "forceSwcTransforms": false, "requestInsights": false, "largePageDataBytes": 128e3, "typedEnv": false, "parallelServerCompiles": false, "parallelServerBuildTraces": false, "ppr": false, "authInterrupts": false, "webpackMemoryOptimizations": false, "optimizeServerReact": true, "strictRouteTypes": false, "useTypeScriptCli": true, "removeUncaughtErrorAndRejectionListeners": false, "validateRSCRequestHeaders": true, "staleTimes": { "dynamic": 0, "static": 300 }, "reactDebugChannel": true, "serverComponentsHmrCache": true, "serverComponentsHmrCancellation": false, "staticGenerationMaxConcurrency": 8, "staticGenerationMinPagesPerWorker": 25, "transitionIndicator": false, "gestureTransition": false, "inlineCss": false, "useCache": false, "globalNotFound": false, "browserDebugInfoInTerminal": "warn", "lockDistDir": true, "proxyClientMaxBodySize": 10485760, "hideLogsAfterAbort": false, "mcpServer": true, "turbopackFileSystemCacheForDev": true, "turbopackFileSystemCacheForBuild": true, "turbopackInferModuleSideEffects": true, "turbopackPluginRuntimeStrategy": "childProcesses", "turbopackMemoryEvictionMode": "auto", "optimizePackageImports": ["lucide-react", "date-fns", "lodash-es", "ramda", "antd", "react-bootstrap", "ahooks", "@ant-design/icons", "@headlessui/react", "@headlessui-float/react", "@heroicons/react/20/solid", "@heroicons/react/24/solid", "@heroicons/react/24/outline", "@visx/visx", "@tremor/react", "rxjs", "@mui/material", "@mui/icons-material", "recharts", "react-use", "effect", "@effect/schema", "@effect/platform", "@effect/platform-node", "@effect/platform-browser", "@effect/platform-bun", "@effect/sql", "@effect/sql-mssql", "@effect/sql-mysql2", "@effect/sql-pg", "@effect/sql-sqlite-node", "@effect/sql-sqlite-bun", "@effect/sql-sqlite-wasm", "@effect/sql-sqlite-react-native", "@effect/rpc", "@effect/rpc-http", "@effect/typeclass", "@effect/experimental", "@effect/opentelemetry", "@material-ui/core", "@material-ui/icons", "@tabler/icons-react", "mui-core", "react-icons/ai", "react-icons/bi", "react-icons/bs", "react-icons/cg", "react-icons/ci", "react-icons/di", "react-icons/fa", "react-icons/fa6", "react-icons/fc", "react-icons/fi", "react-icons/gi", "react-icons/go", "react-icons/gr", "react-icons/hi", "react-icons/hi2", "react-icons/im", "react-icons/io", "react-icons/io5", "react-icons/lia", "react-icons/lib", "react-icons/lu", "react-icons/md", "react-icons/pi", "react-icons/ri", "react-icons/rx", "react-icons/si", "react-icons/sl", "react-icons/tb", "react-icons/tfi", "react-icons/ti", "react-icons/vsc", "react-icons/wi"], "useCacheTimeout": 54, "instantInsights": { "validationLevel": "warning" }, "trustHostHeader": false, "isExperimentalCompile": false }, "htmlLimitedBots": "[\\w-]+-Google|Google-[\\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight", "bundlePagesRouterDependencies": false, "configFileName": "next.config.ts", "serverExternalPackages": ["better-sqlite3", "@prisma/adapter-better-sqlite3"], "outputFileTracingExcludes": { "*": ["node_modules/next/dist/compiled/@vercel/og/**"] }, "turbopack": { "resolveAlias": { "@/lib/prisma-runtime": "./src/lib/prisma-runtime.local.ts" }, "root": "D:\\Work\\KG1\\landing-portal" }, "repoRoot": "D:\\Work\\KG1\\landing-portal", "distDirRoot": ".next", "supportsImmutableAssets": false };
var BuildId = "a_sXZrFUsZqSZ7XlTNUlZ";
var RoutesManifest = { "basePath": "", "rewrites": { "beforeFiles": [], "afterFiles": [], "fallback": [] }, "redirects": [{ "source": "/:path+/", "destination": "/:path+", "internal": true, "priority": true, "statusCode": 308, "regex": "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))/$" }], "routes": { "static": [{ "page": "/", "regex": "^/(?:/)?$", "routeKeys": {}, "namedRegex": "^/(?:/)?$" }, { "page": "/_global-error", "regex": "^/_global\\-error(?:/)?$", "routeKeys": {}, "namedRegex": "^/_global\\-error(?:/)?$" }, { "page": "/_not-found", "regex": "^/_not\\-found(?:/)?$", "routeKeys": {}, "namedRegex": "^/_not\\-found(?:/)?$" }, { "page": "/admin", "regex": "^/admin(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin(?:/)?$" }, { "page": "/admin/announcements", "regex": "^/admin/announcements(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/announcements(?:/)?$" }, { "page": "/admin/categories", "regex": "^/admin/categories(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/categories(?:/)?$" }, { "page": "/admin/employees", "regex": "^/admin/employees(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/employees(?:/)?$" }, { "page": "/admin/failure-categories", "regex": "^/admin/failure\\-categories(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/failure\\-categories(?:/)?$" }, { "page": "/admin/incidents", "regex": "^/admin/incidents(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/incidents(?:/)?$" }, { "page": "/admin/issues", "regex": "^/admin/issues(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/issues(?:/)?$" }, { "page": "/admin/machines", "regex": "^/admin/machines(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/machines(?:/)?$" }, { "page": "/api/admin/export", "regex": "^/api/admin/export(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/admin/export(?:/)?$" }, { "page": "/api/admin/upload", "regex": "^/api/admin/upload(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/admin/upload(?:/)?$" }, { "page": "/api/admin/users", "regex": "^/api/admin/users(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/admin/users(?:/)?$" }, { "page": "/api/admin/zalo-groups", "regex": "^/api/admin/zalo\\-groups(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/admin/zalo\\-groups(?:/)?$" }, { "page": "/api/admin/zalo-logs", "regex": "^/api/admin/zalo\\-logs(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/admin/zalo\\-logs(?:/)?$" }, { "page": "/api/ai/analyze-5m1e", "regex": "^/api/ai/analyze\\-5m1e(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/ai/analyze\\-5m1e(?:/)?$" }, { "page": "/api/announcements", "regex": "^/api/announcements(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/announcements(?:/)?$" }, { "page": "/api/categories", "regex": "^/api/categories(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/categories(?:/)?$" }, { "page": "/api/cron/escalate", "regex": "^/api/cron/escalate(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/cron/escalate(?:/)?$" }, { "page": "/api/employees", "regex": "^/api/employees(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/employees(?:/)?$" }, { "page": "/api/events", "regex": "^/api/events(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/events(?:/)?$" }, { "page": "/api/failure-categories", "regex": "^/api/failure\\-categories(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/failure\\-categories(?:/)?$" }, { "page": "/api/health", "regex": "^/api/health(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/health(?:/)?$" }, { "page": "/api/issue-failure-categories", "regex": "^/api/issue\\-failure\\-categories(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/issue\\-failure\\-categories(?:/)?$" }, { "page": "/api/issues", "regex": "^/api/issues(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/issues(?:/)?$" }, { "page": "/api/machines", "regex": "^/api/machines(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/machines(?:/)?$" }, { "page": "/api/mobile/categories", "regex": "^/api/mobile/categories(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/mobile/categories(?:/)?$" }, { "page": "/api/mobile/chat-groups", "regex": "^/api/mobile/chat\\-groups(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/mobile/chat\\-groups(?:/)?$" }, { "page": "/api/mobile/employees/search", "regex": "^/api/mobile/employees/search(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/mobile/employees/search(?:/)?$" }, { "page": "/api/mobile/failure-categories", "regex": "^/api/mobile/failure\\-categories(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/mobile/failure\\-categories(?:/)?$" }, { "page": "/api/mobile/incidents", "regex": "^/api/mobile/incidents(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/mobile/incidents(?:/)?$" }, { "page": "/api/mobile/issue-failure-categories", "regex": "^/api/mobile/issue\\-failure\\-categories(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/mobile/issue\\-failure\\-categories(?:/)?$" }, { "page": "/api/mobile/issues", "regex": "^/api/mobile/issues(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/mobile/issues(?:/)?$" }, { "page": "/api/mobile/login", "regex": "^/api/mobile/login(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/mobile/login(?:/)?$" }, { "page": "/api/mobile/me", "regex": "^/api/mobile/me(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/mobile/me(?:/)?$" }, { "page": "/api/mobile/me/password", "regex": "^/api/mobile/me/password(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/mobile/me/password(?:/)?$" }, { "page": "/api/mobile/notifications", "regex": "^/api/mobile/notifications(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/mobile/notifications(?:/)?$" }, { "page": "/api/mobile/part-categories", "regex": "^/api/mobile/part\\-categories(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/mobile/part\\-categories(?:/)?$" }, { "page": "/api/mobile/push-token", "regex": "^/api/mobile/push\\-token(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/mobile/push\\-token(?:/)?$" }, { "page": "/api/mobile/upload", "regex": "^/api/mobile/upload(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/mobile/upload(?:/)?$" }, { "page": "/api/part-categories", "regex": "^/api/part\\-categories(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/part\\-categories(?:/)?$" }, { "page": "/api/seed", "regex": "^/api/seed(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/seed(?:/)?$" }, { "page": "/api/sizes", "regex": "^/api/sizes(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/sizes(?:/)?$" }, { "page": "/api/upload", "regex": "^/api/upload(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/upload(?:/)?$" }, { "page": "/api/workshops", "regex": "^/api/workshops(?:/)?$", "routeKeys": {}, "namedRegex": "^/api/workshops(?:/)?$" }, { "page": "/dashboard", "regex": "^/dashboard(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard(?:/)?$" }, { "page": "/dashboard/admin/cms-settings", "regex": "^/dashboard/admin/cms\\-settings(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard/admin/cms\\-settings(?:/)?$" }, { "page": "/dashboard/admin/preventive-maintenance", "regex": "^/dashboard/admin/preventive\\-maintenance(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard/admin/preventive\\-maintenance(?:/)?$" }, { "page": "/dashboard/admin/sizes", "regex": "^/dashboard/admin/sizes(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard/admin/sizes(?:/)?$" }, { "page": "/dashboard/admin/workshops", "regex": "^/dashboard/admin/workshops(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard/admin/workshops(?:/)?$" }, { "page": "/dashboard/admin/zalo", "regex": "^/dashboard/admin/zalo(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard/admin/zalo(?:/)?$" }, { "page": "/dashboard/bi", "regex": "^/dashboard/bi(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard/bi(?:/)?$" }, { "page": "/dashboard/logs", "regex": "^/dashboard/logs(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard/logs(?:/)?$" }, { "page": "/dashboard/report", "regex": "^/dashboard/report(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard/report(?:/)?$" }, { "page": "/dashboard/training", "regex": "^/dashboard/training(?:/)?$", "routeKeys": {}, "namedRegex": "^/dashboard/training(?:/)?$" }, { "page": "/favicon.ico", "regex": "^/favicon\\.ico(?:/)?$", "routeKeys": {}, "namedRegex": "^/favicon\\.ico(?:/)?$" }, { "page": "/login", "regex": "^/login(?:/)?$", "routeKeys": {}, "namedRegex": "^/login(?:/)?$" }], "dynamic": [{ "page": "/api/announcements/[id]", "regex": "^/api/announcements/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/announcements/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/auth/[...nextauth]", "regex": "^/api/auth/(.+?)(?:/)?$", "routeKeys": { "nxtPnextauth": "nxtPnextauth" }, "namedRegex": "^/api/auth/(?<nxtPnextauth>.+?)(?:/)?$" }, { "page": "/api/categories/[id]", "regex": "^/api/categories/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/categories/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/employees/[id]", "regex": "^/api/employees/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/employees/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/failure-categories/[id]", "regex": "^/api/failure\\-categories/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/failure\\-categories/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/files/[key]", "regex": "^/api/files/([^/]+?)(?:/)?$", "routeKeys": { "nxtPkey": "nxtPkey" }, "namedRegex": "^/api/files/(?<nxtPkey>[^/]+?)(?:/)?$" }, { "page": "/api/issue-failure-categories/[id]", "regex": "^/api/issue\\-failure\\-categories/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/issue\\-failure\\-categories/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/issues/[id]/verify", "regex": "^/api/issues/([^/]+?)/verify(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/issues/(?<nxtPid>[^/]+?)/verify(?:/)?$" }, { "page": "/api/machines/[id]", "regex": "^/api/machines/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/machines/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/machines/[id]/qrcode", "regex": "^/api/machines/([^/]+?)/qrcode(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/machines/(?<nxtPid>[^/]+?)/qrcode(?:/)?$" }, { "page": "/api/mobile/announcements/[id]", "regex": "^/api/mobile/announcements/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/mobile/announcements/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/mobile/chat-groups/[id]", "regex": "^/api/mobile/chat\\-groups/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/mobile/chat\\-groups/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/mobile/chat-groups/[id]/members", "regex": "^/api/mobile/chat\\-groups/([^/]+?)/members(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/mobile/chat\\-groups/(?<nxtPid>[^/]+?)/members(?:/)?$" }, { "page": "/api/mobile/chat-groups/[id]/messages", "regex": "^/api/mobile/chat\\-groups/([^/]+?)/messages(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/mobile/chat\\-groups/(?<nxtPid>[^/]+?)/messages(?:/)?$" }, { "page": "/api/mobile/incidents/[id]/accept", "regex": "^/api/mobile/incidents/([^/]+?)/accept(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/mobile/incidents/(?<nxtPid>[^/]+?)/accept(?:/)?$" }, { "page": "/api/mobile/incidents/[id]/complete", "regex": "^/api/mobile/incidents/([^/]+?)/complete(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/mobile/incidents/(?<nxtPid>[^/]+?)/complete(?:/)?$" }, { "page": "/api/mobile/issues/[id]", "regex": "^/api/mobile/issues/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/mobile/issues/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/mobile/issues/[id]/assign", "regex": "^/api/mobile/issues/([^/]+?)/assign(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/mobile/issues/(?<nxtPid>[^/]+?)/assign(?:/)?$" }, { "page": "/api/mobile/issues/[id]/root-cause", "regex": "^/api/mobile/issues/([^/]+?)/root\\-cause(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/mobile/issues/(?<nxtPid>[^/]+?)/root\\-cause(?:/)?$" }, { "page": "/api/mobile/issues/[id]/submissions", "regex": "^/api/mobile/issues/([^/]+?)/submissions(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/mobile/issues/(?<nxtPid>[^/]+?)/submissions(?:/)?$" }, { "page": "/api/mobile/machines/[code]", "regex": "^/api/mobile/machines/([^/]+?)(?:/)?$", "routeKeys": { "nxtPcode": "nxtPcode" }, "namedRegex": "^/api/mobile/machines/(?<nxtPcode>[^/]+?)(?:/)?$" }, { "page": "/api/mobile/notifications/invitations/[id]/accept", "regex": "^/api/mobile/notifications/invitations/([^/]+?)/accept(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/mobile/notifications/invitations/(?<nxtPid>[^/]+?)/accept(?:/)?$" }, { "page": "/api/mobile/notifications/invitations/[id]/reject", "regex": "^/api/mobile/notifications/invitations/([^/]+?)/reject(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/mobile/notifications/invitations/(?<nxtPid>[^/]+?)/reject(?:/)?$" }, { "page": "/api/mobile/notifications/ratings/[id]/submit", "regex": "^/api/mobile/notifications/ratings/([^/]+?)/submit(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/mobile/notifications/ratings/(?<nxtPid>[^/]+?)/submit(?:/)?$" }, { "page": "/api/mobile/tasks/[id]/accept", "regex": "^/api/mobile/tasks/([^/]+?)/accept(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/mobile/tasks/(?<nxtPid>[^/]+?)/accept(?:/)?$" }, { "page": "/api/mobile/tasks/[id]/complete", "regex": "^/api/mobile/tasks/([^/]+?)/complete(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/mobile/tasks/(?<nxtPid>[^/]+?)/complete(?:/)?$" }, { "page": "/api/mobile/tasks/[id]/verify", "regex": "^/api/mobile/tasks/([^/]+?)/verify(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/mobile/tasks/(?<nxtPid>[^/]+?)/verify(?:/)?$" }, { "page": "/api/part-categories/[id]", "regex": "^/api/part\\-categories/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/part\\-categories/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/upload/[key]", "regex": "^/api/upload/([^/]+?)(?:/)?$", "routeKeys": { "nxtPkey": "nxtPkey" }, "namedRegex": "^/api/upload/(?<nxtPkey>[^/]+?)(?:/)?$" }, { "page": "/dashboard/categories/[status]", "regex": "^/dashboard/categories/([^/]+?)(?:/)?$", "routeKeys": { "nxtPstatus": "nxtPstatus" }, "namedRegex": "^/dashboard/categories/(?<nxtPstatus>[^/]+?)(?:/)?$" }], "data": { "static": [], "dynamic": [] } }, "locales": [] };
var ConfigHeaders = [];
var PrerenderManifest = { "version": 4, "routes": { "/_global-error": { "routeType": "page", "response": "complete", "compute": "static", "htmlSize": 8891, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/_global-error", "dataRoute": "/_global-error.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/_not-found": { "initialStatus": 404, "routeType": "page", "response": "complete", "compute": "static", "htmlSize": 7066, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/_not-found", "dataRoute": "/_not-found.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/favicon.ico": { "initialHeaders": { "cache-control": "public, max-age=0, must-revalidate", "content-type": "image/x-icon", "x-next-cache-tags": "_N_T_/layout,_N_T_/favicon.ico/layout,_N_T_/favicon.ico/route,_N_T_/favicon.ico" }, "routeType": "route", "response": "complete", "compute": "static", "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/favicon.ico", "dataRoute": null, "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/login": { "routeType": "page", "response": "complete", "compute": "static", "htmlSize": 7940, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/login", "dataRoute": "/login.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] } }, "dynamicRoutes": {}, "notFoundRoutes": [], "preview": { "previewModeId": "e8b2e005d2815a560b6ec99d8996ee1c", "previewModeSigningKey": "4cfaaae9efe152ac129d46a0476ddae13d672b3f672cbad53e3a113f61d2d029", "previewModeEncryptionKey": "cd431856ddc9fcf4e7d5b2e4bcd3ef2d5e614d60dcd3118fab4f9db3ac8ccb81" } };
var MiddlewareManifest = { "version": 3, "middleware": { "/": { "files": ["server/edge-runtime-webpack.js", "server/src/middleware.js"], "entrypoint": "server/src/middleware.js", "name": "src/middleware", "page": "/", "matchers": [{ "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?\\/dashboard(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\.json|\\.rsc|\\.segments\\/.+\\.segment\\.rsc)?[\\/#\\?]?$", "originalSource": "/dashboard/:path*" }, { "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?\\/admin(?:\\/((?:[^\\/#\\?]+?)(?:\\/(?:[^\\/#\\?]+?))*))?(\\.json|\\.rsc|\\.segments\\/.+\\.segment\\.rsc)?[\\/#\\?]?$", "originalSource": "/admin/:path*" }], "wasm": [], "assets": [], "env": { "__NEXT_BUILD_ID": "a_sXZrFUsZqSZ7XlTNUlZ", "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY": "gSXiYWN+WV8oP7oXAyCUYQJIzhY0u/T3mN3ApHDMyX4=", "__NEXT_PREVIEW_MODE_ID": "e8b2e005d2815a560b6ec99d8996ee1c", "__NEXT_PREVIEW_MODE_SIGNING_KEY": "4cfaaae9efe152ac129d46a0476ddae13d672b3f672cbad53e3a113f61d2d029", "__NEXT_PREVIEW_MODE_ENCRYPTION_KEY": "cd431856ddc9fcf4e7d5b2e4bcd3ef2d5e614d60dcd3118fab4f9db3ac8ccb81" } } }, "functions": {}, "sortedMiddleware": ["/"] };
var AppPathRoutesManifest = { "/_not-found/page": "/_not-found", "/_global-error/page": "/_global-error", "/api/admin/export/route": "/api/admin/export", "/api/admin/upload/route": "/api/admin/upload", "/api/admin/users/route": "/api/admin/users", "/api/admin/zalo-groups/route": "/api/admin/zalo-groups", "/api/admin/zalo-logs/route": "/api/admin/zalo-logs", "/api/ai/analyze-5m1e/route": "/api/ai/analyze-5m1e", "/api/announcements/[id]/route": "/api/announcements/[id]", "/api/announcements/route": "/api/announcements", "/api/categories/[id]/route": "/api/categories/[id]", "/api/categories/route": "/api/categories", "/api/cron/escalate/route": "/api/cron/escalate", "/api/employees/[id]/route": "/api/employees/[id]", "/api/employees/route": "/api/employees", "/api/events/route": "/api/events", "/api/failure-categories/[id]/route": "/api/failure-categories/[id]", "/api/failure-categories/route": "/api/failure-categories", "/api/files/[key]/route": "/api/files/[key]", "/api/health/route": "/api/health", "/api/issue-failure-categories/[id]/route": "/api/issue-failure-categories/[id]", "/api/issue-failure-categories/route": "/api/issue-failure-categories", "/api/issues/[id]/verify/route": "/api/issues/[id]/verify", "/api/issues/route": "/api/issues", "/api/machines/[id]/qrcode/route": "/api/machines/[id]/qrcode", "/api/machines/[id]/route": "/api/machines/[id]", "/api/machines/route": "/api/machines", "/api/mobile/announcements/[id]/route": "/api/mobile/announcements/[id]", "/api/mobile/categories/route": "/api/mobile/categories", "/api/mobile/chat-groups/[id]/members/route": "/api/mobile/chat-groups/[id]/members", "/api/mobile/chat-groups/[id]/messages/route": "/api/mobile/chat-groups/[id]/messages", "/api/mobile/chat-groups/[id]/route": "/api/mobile/chat-groups/[id]", "/api/mobile/chat-groups/route": "/api/mobile/chat-groups", "/api/mobile/employees/search/route": "/api/mobile/employees/search", "/api/mobile/failure-categories/route": "/api/mobile/failure-categories", "/api/mobile/incidents/[id]/accept/route": "/api/mobile/incidents/[id]/accept", "/api/mobile/incidents/[id]/complete/route": "/api/mobile/incidents/[id]/complete", "/api/mobile/incidents/route": "/api/mobile/incidents", "/api/mobile/issue-failure-categories/route": "/api/mobile/issue-failure-categories", "/api/mobile/issues/[id]/assign/route": "/api/mobile/issues/[id]/assign", "/api/mobile/issues/[id]/root-cause/route": "/api/mobile/issues/[id]/root-cause", "/api/mobile/issues/[id]/route": "/api/mobile/issues/[id]", "/api/mobile/issues/[id]/submissions/route": "/api/mobile/issues/[id]/submissions", "/api/mobile/issues/route": "/api/mobile/issues", "/api/mobile/login/route": "/api/mobile/login", "/api/mobile/machines/[code]/route": "/api/mobile/machines/[code]", "/api/mobile/me/password/route": "/api/mobile/me/password", "/api/mobile/me/route": "/api/mobile/me", "/api/mobile/notifications/invitations/[id]/accept/route": "/api/mobile/notifications/invitations/[id]/accept", "/api/mobile/notifications/invitations/[id]/reject/route": "/api/mobile/notifications/invitations/[id]/reject", "/api/mobile/notifications/ratings/[id]/submit/route": "/api/mobile/notifications/ratings/[id]/submit", "/api/mobile/notifications/route": "/api/mobile/notifications", "/api/mobile/part-categories/route": "/api/mobile/part-categories", "/api/mobile/push-token/route": "/api/mobile/push-token", "/api/mobile/tasks/[id]/accept/route": "/api/mobile/tasks/[id]/accept", "/api/mobile/tasks/[id]/complete/route": "/api/mobile/tasks/[id]/complete", "/api/mobile/tasks/[id]/verify/route": "/api/mobile/tasks/[id]/verify", "/api/mobile/upload/route": "/api/mobile/upload", "/api/part-categories/[id]/route": "/api/part-categories/[id]", "/api/part-categories/route": "/api/part-categories", "/api/seed/route": "/api/seed", "/api/sizes/route": "/api/sizes", "/api/upload/[key]/route": "/api/upload/[key]", "/api/upload/route": "/api/upload", "/api/workshops/route": "/api/workshops", "/favicon.ico/route": "/favicon.ico", "/api/auth/[...nextauth]/route": "/api/auth/[...nextauth]", "/login/page": "/login", "/page": "/", "/admin/announcements/page": "/admin/announcements", "/admin/categories/page": "/admin/categories", "/admin/employees/page": "/admin/employees", "/admin/failure-categories/page": "/admin/failure-categories", "/admin/incidents/page": "/admin/incidents", "/admin/issues/page": "/admin/issues", "/admin/machines/page": "/admin/machines", "/admin/page": "/admin", "/dashboard/admin/cms-settings/page": "/dashboard/admin/cms-settings", "/dashboard/admin/preventive-maintenance/page": "/dashboard/admin/preventive-maintenance", "/dashboard/admin/sizes/page": "/dashboard/admin/sizes", "/dashboard/admin/workshops/page": "/dashboard/admin/workshops", "/dashboard/admin/zalo/page": "/dashboard/admin/zalo", "/dashboard/bi/page": "/dashboard/bi", "/dashboard/categories/[status]/page": "/dashboard/categories/[status]", "/dashboard/logs/page": "/dashboard/logs", "/dashboard/page": "/dashboard", "/dashboard/report/page": "/dashboard/report", "/dashboard/training/page": "/dashboard/training" };
var FunctionsConfigManifest = { "version": 1, "functions": {} };
var PagesManifest = { "/404": "pages/404.html", "/500": "pages/500.html" };
process.env.NEXT_BUILD_ID = BuildId;
process.env.OPEN_NEXT_BUILD_ID = NextConfig.deploymentId ?? BuildId;
process.env.NEXT_PREVIEW_MODE_ID = PrerenderManifest?.preview?.previewModeId;

// node_modules/@opennextjs/aws/dist/http/openNextResponse.js
init_logger();
init_util();
import { Transform } from "node:stream";

// node_modules/@opennextjs/aws/dist/core/routing/util.js
init_util();
init_logger();
import { ReadableStream as ReadableStream3 } from "node:stream/web";

// node_modules/@opennextjs/aws/dist/utils/binary.js
var commonBinaryMimeTypes = /* @__PURE__ */ new Set([
  "application/octet-stream",
  // Docs
  "application/epub+zip",
  "application/msword",
  "application/pdf",
  "application/rtf",
  "application/vnd.amazon.ebook",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Fonts
  "font/otf",
  "font/woff",
  "font/woff2",
  // Images
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/vnd.microsoft.icon",
  "image/webp",
  // Audio
  "audio/3gpp",
  "audio/aac",
  "audio/basic",
  "audio/flac",
  "audio/mpeg",
  "audio/ogg",
  "audio/wavaudio/webm",
  "audio/x-aiff",
  "audio/x-midi",
  "audio/x-wav",
  // Video
  "video/3gpp",
  "video/mp2t",
  "video/mpeg",
  "video/ogg",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  // Archives
  "application/java-archive",
  "application/vnd.apple.installer+xml",
  "application/x-7z-compressed",
  "application/x-apple-diskimage",
  "application/x-bzip",
  "application/x-bzip2",
  "application/x-gzip",
  "application/x-java-archive",
  "application/x-rar-compressed",
  "application/x-tar",
  "application/x-zip",
  "application/zip",
  // Serialized data
  "application/x-protobuf"
]);
function isBinaryContentType(contentType) {
  if (!contentType)
    return false;
  const value = contentType.split(";")[0];
  return commonBinaryMimeTypes.has(value);
}

// node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
init_stream();
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/i18n/accept-header.js
function parse(raw, preferences, options) {
  const lowers = /* @__PURE__ */ new Map();
  const header = raw.replace(/[ \t]/g, "");
  if (preferences) {
    let pos = 0;
    for (const preference of preferences) {
      const lower = preference.toLowerCase();
      lowers.set(lower, { orig: preference, pos: pos++ });
      if (options.prefixMatch) {
        const parts2 = lower.split("-");
        while (parts2.pop(), parts2.length > 0) {
          const joined = parts2.join("-");
          if (!lowers.has(joined)) {
            lowers.set(joined, { orig: preference, pos: pos++ });
          }
        }
      }
    }
  }
  const parts = header.split(",");
  const selections = [];
  const map = /* @__PURE__ */ new Set();
  for (let i = 0; i < parts.length; ++i) {
    const part = parts[i];
    if (!part) {
      continue;
    }
    const params = part.split(";");
    if (params.length > 2) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const token = params[0].toLowerCase();
    if (!token) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const selection = { token, pos: i, q: 1 };
    if (preferences && lowers.has(token)) {
      selection.pref = lowers.get(token).pos;
    }
    map.add(selection.token);
    if (params.length === 2) {
      const q = params[1];
      const [key, value] = q.split("=");
      if (!value || key !== "q" && key !== "Q") {
        throw new Error(`Invalid ${options.type} header`);
      }
      const score = Number.parseFloat(value);
      if (score === 0) {
        continue;
      }
      if (Number.isFinite(score) && score <= 1 && score >= 1e-3) {
        selection.q = score;
      }
    }
    selections.push(selection);
  }
  selections.sort((a, b) => {
    if (b.q !== a.q) {
      return b.q - a.q;
    }
    if (b.pref !== a.pref) {
      if (a.pref === void 0) {
        return 1;
      }
      if (b.pref === void 0) {
        return -1;
      }
      return a.pref - b.pref;
    }
    return a.pos - b.pos;
  });
  const values = selections.map((selection) => selection.token);
  if (!preferences || !preferences.length) {
    return values;
  }
  const preferred = [];
  for (const selection of values) {
    if (selection === "*") {
      for (const [preference, value] of lowers) {
        if (!map.has(preference)) {
          preferred.push(value.orig);
        }
      }
    } else {
      const lower = selection.toLowerCase();
      if (lowers.has(lower)) {
        preferred.push(lowers.get(lower).orig);
      }
    }
  }
  return preferred;
}
function acceptLanguage(header = "", preferences) {
  return parse(header, preferences, {
    type: "accept-language",
    prefixMatch: true
  })[0] || void 0;
}

// node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
function isLocalizedPath(path3) {
  return NextConfig.i18n?.locales.includes(path3.split("/")[1].toLowerCase()) ?? false;
}
function getLocaleFromCookie(cookies) {
  const i18n = NextConfig.i18n;
  const nextLocale = cookies.NEXT_LOCALE?.toLowerCase();
  return nextLocale ? i18n?.locales.find((locale) => nextLocale === locale.toLowerCase()) : void 0;
}
function detectDomainLocale({ hostname, detectedLocale }) {
  const i18n = NextConfig.i18n;
  const domains = i18n?.domains;
  if (!domains) {
    return;
  }
  const lowercasedLocale = detectedLocale?.toLowerCase();
  for (const domain of domains) {
    const domainHostname = domain.domain.split(":", 1)[0].toLowerCase();
    if (hostname === domainHostname || lowercasedLocale === domain.defaultLocale.toLowerCase() || domain.locales?.some((locale) => lowercasedLocale === locale.toLowerCase())) {
      return domain;
    }
  }
}
function detectLocale(internalEvent, i18n) {
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  if (i18n.localeDetection === false) {
    return domainLocale?.defaultLocale ?? i18n.defaultLocale;
  }
  const cookiesLocale = getLocaleFromCookie(internalEvent.cookies);
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  debug({
    cookiesLocale,
    preferredLocale,
    defaultLocale: i18n.defaultLocale,
    domainLocale
  });
  return domainLocale?.defaultLocale ?? cookiesLocale ?? preferredLocale ?? i18n.defaultLocale;
}
function localizePath(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n) {
    return internalEvent.rawPath;
  }
  if (isLocalizedPath(internalEvent.rawPath)) {
    return internalEvent.rawPath;
  }
  const detectedLocale = detectLocale(internalEvent, i18n);
  return `/${detectedLocale}${internalEvent.rawPath}`;
}
function handleLocaleRedirect(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n || i18n.localeDetection === false || internalEvent.rawPath !== "/") {
    return false;
  }
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  const detectedLocale = detectLocale(internalEvent, i18n);
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  const preferredDomain = detectDomainLocale({
    detectedLocale: preferredLocale
  });
  if (domainLocale && preferredDomain) {
    const isPDomain = preferredDomain.domain === domainLocale.domain;
    const isPLocale = preferredDomain.defaultLocale === preferredLocale;
    if (!isPDomain || !isPLocale) {
      const scheme = `http${preferredDomain.http ? "" : "s"}`;
      const rlocale = isPLocale ? "" : preferredLocale;
      return {
        type: "core",
        statusCode: 307,
        headers: {
          Location: `${scheme}://${preferredDomain.domain}/${rlocale}`
        },
        body: emptyReadableStream(),
        isBase64Encoded: false
      };
    }
  }
  const defaultLocale = domainLocale?.defaultLocale ?? i18n.defaultLocale;
  if (detectedLocale.toLowerCase() !== defaultLocale.toLowerCase()) {
    const nextUrl = constructNextUrl(internalEvent.url, `/${detectedLocale}${NextConfig.trailingSlash ? "/" : ""}`);
    const queryString = convertToQueryString(internalEvent.query);
    return {
      type: "core",
      statusCode: 307,
      headers: {
        Location: `${nextUrl}${queryString}`
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}

// node_modules/@opennextjs/aws/dist/core/routing/queue.js
function generateShardId(rawPath, maxConcurrency, prefix) {
  let a = cyrb128(rawPath);
  let t = a += 1831565813;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  const randomFloat = ((t ^ t >>> 14) >>> 0) / 4294967296;
  const randomInt = Math.floor(randomFloat * maxConcurrency);
  return `${prefix}-${randomInt}`;
}
function generateMessageGroupId(rawPath) {
  const maxConcurrency = Number.parseInt(process.env.MAX_REVALIDATE_CONCURRENCY ?? "10");
  return generateShardId(rawPath, maxConcurrency, "revalidate");
}
function cyrb128(str) {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ h1 >>> 18, 597399067);
  h2 = Math.imul(h4 ^ h2 >>> 22, 2869860233);
  h3 = Math.imul(h1 ^ h3 >>> 17, 951274213);
  h4 = Math.imul(h2 ^ h4 >>> 19, 2716044179);
  h1 ^= h2 ^ h3 ^ h4, h2 ^= h1, h3 ^= h1, h4 ^= h1;
  return h1 >>> 0;
}

// node_modules/@opennextjs/aws/dist/core/routing/util.js
function isExternal(url, host) {
  if (!url)
    return false;
  const pattern = /^https?:\/\//;
  if (!pattern.test(url))
    return false;
  if (host) {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.host !== host;
    } catch {
      return !url.includes(host);
    }
  }
  return true;
}
function convertFromQueryString(query) {
  if (query === "")
    return {};
  const queryParts = query.split("&");
  return getQueryFromIterator(queryParts.map((p) => {
    const [key, value] = p.split("=");
    return [key, value];
  }));
}
function getUrlParts(url, isExternal2) {
  if (!isExternal2) {
    const regex2 = /\/([^?]*)\??(.*)/;
    const match3 = url.match(regex2);
    return {
      hostname: "",
      pathname: match3?.[1] ? `/${match3[1]}` : url,
      protocol: "",
      queryString: match3?.[2] ?? ""
    };
  }
  const regex = /^(https?:)\/\/?([^\/\s]+)(\/[^?]*)?(\?.*)?/;
  const match2 = url.match(regex);
  if (!match2) {
    throw new Error(`Invalid external URL: ${url}`);
  }
  return {
    protocol: match2[1] ?? "https:",
    hostname: match2[2],
    pathname: match2[3] ?? "",
    queryString: match2[4]?.slice(1) ?? ""
  };
}
function constructNextUrl(baseUrl, path3) {
  const nextBasePath = NextConfig.basePath ?? "";
  const url = new URL(`${nextBasePath}${path3}`, baseUrl);
  return url.href;
}
function convertToQueryString(query) {
  const queryStrings = [];
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => queryStrings.push(`${key}=${entry}`));
    } else {
      queryStrings.push(`${key}=${value}`);
    }
  });
  return queryStrings.length > 0 ? `?${queryStrings.join("&")}` : "";
}
function getMiddlewareMatch(middlewareManifest2, functionsManifest) {
  if (functionsManifest?.functions?.["/_middleware"]) {
    return functionsManifest.functions["/_middleware"].matchers?.map(({ regexp }) => new RegExp(regexp)) ?? [/.*/];
  }
  const rootMiddleware = middlewareManifest2.middleware["/"];
  if (!rootMiddleware?.matchers)
    return [];
  return rootMiddleware.matchers.map(({ regexp }) => new RegExp(regexp));
}
function escapeRegex(str, { isPath } = {}) {
  const result = str.replaceAll("(.)", "_\xB51_").replaceAll("(..)", "_\xB52_").replaceAll("(...)", "_\xB53_");
  return isPath ? result : result.replaceAll("+", "_\xB54_");
}
function unescapeRegex(str) {
  return str.replaceAll("_\xB51_", "(.)").replaceAll("_\xB52_", "(..)").replaceAll("_\xB53_", "(...)").replaceAll("_\xB54_", "+");
}
function convertBodyToReadableStream(method, body) {
  if (method === "GET" || method === "HEAD")
    return void 0;
  if (!body)
    return void 0;
  return new ReadableStream3({
    start(controller) {
      controller.enqueue(body);
      controller.close();
    }
  });
}
var CommonHeaders;
(function(CommonHeaders2) {
  CommonHeaders2["CACHE_CONTROL"] = "cache-control";
  CommonHeaders2["NEXT_CACHE"] = "x-nextjs-cache";
})(CommonHeaders || (CommonHeaders = {}));
function normalizeLocationHeader(location, baseUrl, encodeQuery = false) {
  if (!URL.canParse(location)) {
    return location;
  }
  const locationURL = new URL(location);
  const origin = new URL(baseUrl).origin;
  let search = locationURL.search;
  if (encodeQuery && search) {
    search = `?${stringifyQs(parseQs(search.slice(1)))}`;
  }
  const href = `${locationURL.origin}${locationURL.pathname}${search}${locationURL.hash}`;
  if (locationURL.origin === origin) {
    return href.slice(origin.length);
  }
  return href;
}

// node_modules/@opennextjs/aws/dist/core/routingHandler.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
import { createHash } from "node:crypto";
init_stream();

// node_modules/@opennextjs/aws/dist/utils/cache.js
init_logger();

// node_modules/@opennextjs/aws/dist/utils/semver.js
function compareSemver(v1, operator, v2) {
  let versionDiff = 0;
  if (v1 === "latest") {
    versionDiff = 1;
  } else {
    if (/^[^\d]/.test(v1)) {
      v1 = v1.substring(1);
    }
    if (/^[^\d]/.test(v2)) {
      v2 = v2.substring(1);
    }
    const [major1, minor1 = 0, patch1 = 0] = v1.split(".").map(Number);
    const [major2, minor2 = 0, patch2 = 0] = v2.split(".").map(Number);
    if (Number.isNaN(major1) || Number.isNaN(major2)) {
      throw new Error("The major version is required.");
    }
    if (major1 !== major2) {
      versionDiff = major1 - major2;
    } else if (minor1 !== minor2) {
      versionDiff = minor1 - minor2;
    } else if (patch1 !== patch2) {
      versionDiff = patch1 - patch2;
    }
  }
  switch (operator) {
    case "=":
      return versionDiff === 0;
    case ">=":
      return versionDiff >= 0;
    case "<=":
      return versionDiff <= 0;
    case ">":
      return versionDiff > 0;
    case "<":
      return versionDiff < 0;
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}

// node_modules/@opennextjs/aws/dist/utils/cache.js
async function isStale(key, tags, lastModified) {
  if (!compareSemver(globalThis.nextVersion, ">=", "16.0.0")) {
    return false;
  }
  if (globalThis.openNextConfig.dangerous?.disableTagCache) {
    return false;
  }
  if (globalThis.tagCache.mode === "nextMode") {
    return tags.length === 0 ? false : await globalThis.tagCache.isStale?.(tags, lastModified) ?? false;
  }
  return await globalThis.tagCache.isStale?.(key, lastModified) ?? false;
}
async function hasBeenRevalidated(key, tags, cacheEntry) {
  if (globalThis.openNextConfig.dangerous?.disableTagCache) {
    return false;
  }
  const value = cacheEntry.value;
  if (!value) {
    return true;
  }
  if ("type" in cacheEntry && cacheEntry.type === "page") {
    return false;
  }
  const lastModified = cacheEntry.lastModified ?? Date.now();
  if (globalThis.tagCache.mode === "nextMode") {
    return tags.length === 0 ? false : await globalThis.tagCache.hasBeenRevalidated(tags, lastModified);
  }
  const _lastModified = await globalThis.tagCache.getLastModified(key, lastModified);
  return _lastModified === -1;
}
function getTagsFromValue(value) {
  if (!value) {
    return [];
  }
  try {
    const cacheTags = value.meta?.headers?.["x-next-cache-tags"]?.split(",") ?? [];
    delete value.meta?.headers?.["x-next-cache-tags"];
    return cacheTags;
  } catch (e) {
    return [];
  }
}

// node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
init_logger();
var CACHE_ONE_YEAR = 60 * 60 * 24 * 365;
var CACHE_ONE_MONTH = 60 * 60 * 24 * 30;
var VARY_HEADER = "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Next-Url";
var NEXT_SEGMENT_PREFETCH_HEADER = "next-router-segment-prefetch";
var NEXT_PRERENDER_HEADER = "x-nextjs-prerender";
var NEXT_POSTPONED_HEADER = "x-nextjs-postponed";
async function computeCacheControl(path3, body, host, revalidate, lastModified, isStaleFromTagCache = false) {
  let finalRevalidate = CACHE_ONE_YEAR;
  const existingRoute = Object.entries(PrerenderManifest?.routes ?? {}).find((p) => p[0] === path3)?.[1];
  if (revalidate === void 0 && existingRoute) {
    finalRevalidate = existingRoute.initialRevalidateSeconds === false ? CACHE_ONE_YEAR : existingRoute.initialRevalidateSeconds;
  } else if (revalidate !== void 0) {
    finalRevalidate = revalidate === false ? CACHE_ONE_YEAR : revalidate;
  }
  const age = Math.round((Date.now() - (lastModified ?? 0)) / 1e3);
  const hash = (str) => createHash("md5").update(str).digest("hex");
  const etag = hash(body);
  if (revalidate === 0) {
    return {
      "cache-control": "private, no-cache, no-store, max-age=0, must-revalidate",
      "x-opennext-cache": "ERROR",
      etag
    };
  }
  const isSSG = finalRevalidate === CACHE_ONE_YEAR;
  const remainingTtl = Math.max(finalRevalidate - age, 1);
  const isStaleFromTime = !isSSG && remainingTtl === 1;
  const isStale2 = isStaleFromTime || isStaleFromTagCache;
  if (!isSSG || isStaleFromTagCache) {
    const sMaxAge = isStaleFromTagCache ? 1 : remainingTtl;
    debug("sMaxAge", {
      finalRevalidate,
      age,
      lastModified,
      revalidate,
      isStaleFromTagCache
    });
    if (isStale2) {
      let url = NextConfig.trailingSlash ? `${path3}/` : path3;
      if (NextConfig.basePath) {
        url = `${NextConfig.basePath}${url}`;
      }
      await globalThis.queue.send({
        MessageBody: {
          host,
          url,
          eTag: etag,
          lastModified: lastModified ?? Date.now()
        },
        MessageDeduplicationId: hash(`${path3}-${lastModified}-${etag}`),
        MessageGroupId: generateMessageGroupId(path3)
      });
    }
    return {
      "cache-control": `s-maxage=${sMaxAge}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
      "x-opennext-cache": isStale2 ? "STALE" : "HIT",
      etag
    };
  }
  return {
    "cache-control": `s-maxage=${CACHE_ONE_YEAR}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
    "x-opennext-cache": "HIT",
    etag
  };
}
function getBodyForAppRouter(event, cachedValue) {
  if (cachedValue.type !== "app") {
    throw new Error("getBodyForAppRouter called with non-app cache value");
  }
  try {
    const segmentHeader = `${event.headers[NEXT_SEGMENT_PREFETCH_HEADER]}`;
    const isSegmentResponse = Boolean(segmentHeader) && segmentHeader in (cachedValue.segmentData || {}) && !NextConfig.experimental?.prefetchInlining;
    const body = isSegmentResponse ? cachedValue.segmentData[segmentHeader] : cachedValue.rsc;
    return {
      body,
      additionalHeaders: isSegmentResponse ? { [NEXT_PRERENDER_HEADER]: "1", [NEXT_POSTPONED_HEADER]: "2" } : {}
    };
  } catch (e) {
    error("Error while getting body for app router from cache:", e);
    return { body: cachedValue.rsc, additionalHeaders: {} };
  }
}
async function generateResult(event, localizedPath, cachedValue, lastModified, isStaleFromTagCache = false) {
  debug("Returning result from experimental cache");
  let body = "";
  let type = "application/octet-stream";
  let isDataRequest = false;
  let additionalHeaders = {};
  if (cachedValue.type === "app") {
    isDataRequest = event.headers.rsc === "1";
    if (isDataRequest) {
      const { body: appRouterBody, additionalHeaders: appHeaders } = getBodyForAppRouter(event, cachedValue);
      body = appRouterBody;
      additionalHeaders = appHeaders;
    } else {
      body = cachedValue.html;
    }
    type = isDataRequest ? "text/x-component" : "text/html; charset=utf-8";
  } else if (cachedValue.type === "page") {
    isDataRequest = Boolean(event.query.__nextDataReq);
    body = isDataRequest ? JSON.stringify(cachedValue.json) : cachedValue.html;
    type = isDataRequest ? "application/json" : "text/html; charset=utf-8";
  } else {
    throw new Error("generateResult called with unsupported cache value type, only 'app' and 'page' are supported");
  }
  const cacheControl = await computeCacheControl(localizedPath, body, event.headers.host, cachedValue.revalidate, lastModified, isStaleFromTagCache);
  return {
    type: "core",
    // Sometimes other status codes can be cached, like 404. For these cases, we should return the correct status code
    // Also set the status code to the rewriteStatusCode if defined
    // This can happen in handleMiddleware in routingHandler.
    // `NextResponse.rewrite(url, { status: xxx})
    // The rewrite status code should take precedence over the cached one
    statusCode: event.rewriteStatusCode ?? cachedValue.meta?.status ?? 200,
    body: toReadableStream(body, false),
    isBase64Encoded: false,
    headers: {
      ...cacheControl,
      "content-type": type,
      ...cachedValue.meta?.headers,
      vary: VARY_HEADER,
      ...additionalHeaders
    }
  };
}
function escapePathDelimiters(segment, escapeEncoded) {
  return segment.replace(new RegExp(`([/#?]${escapeEncoded ? "|%(2f|23|3f|5c)" : ""})`, "gi"), (char) => encodeURIComponent(char));
}
function decodePathParams(pathname) {
  return pathname.split("/").map((segment) => escapePathDelimiters(decodeURIComponent(segment), true)).join("/");
}
async function cacheInterceptor(event) {
  if (Boolean(event.headers["next-action"]) || Boolean(event.headers["x-prerender-revalidate"]))
    return event;
  const cookies = event.headers.cookie || "";
  const hasPreviewData = cookies.includes("__prerender_bypass") || cookies.includes("__next_preview_data");
  if (hasPreviewData) {
    debug("Preview mode detected, passing through to handler");
    return event;
  }
  let localizedPath = localizePath(event);
  if (NextConfig.basePath) {
    localizedPath = localizedPath.replace(NextConfig.basePath, "");
  }
  localizedPath = localizedPath.replace(/\/$/, "");
  try {
    localizedPath = decodePathParams(localizedPath) || "/";
  } catch {
    return event;
  }
  const cacheKey = localizedPath === "/" ? "/index" : localizedPath;
  debug("Checking cache for", localizedPath, PrerenderManifest);
  const isISR = Object.keys(PrerenderManifest?.routes ?? {}).includes(localizedPath) || Object.values(PrerenderManifest?.dynamicRoutes ?? {}).some((dr) => new RegExp(dr.routeRegex).test(localizedPath));
  debug("isISR", isISR);
  if (isISR) {
    try {
      const cachedData = await globalThis.incrementalCache.get(cacheKey);
      debug("cached data in interceptor", cachedData);
      if (!cachedData?.value) {
        return event;
      }
      const tags = getTagsFromValue(cachedData.value);
      if (cachedData.value?.type === "app" || cachedData.value?.type === "route") {
        const _hasBeenRevalidated = cachedData.shouldBypassTagCache ? false : await hasBeenRevalidated(cacheKey, tags, cachedData);
        if (_hasBeenRevalidated) {
          return event;
        }
      }
      const _isStale = cachedData.shouldBypassTagCache ? false : await isStale(cacheKey, tags, cachedData.lastModified ?? Date.now());
      const host = event.headers.host;
      switch (cachedData?.value?.type) {
        case "app":
        case "page":
          return generateResult(event, localizedPath, cachedData.value, cachedData.lastModified, _isStale);
        case "redirect": {
          const cacheControl = await computeCacheControl(localizedPath, "", host, cachedData.value.revalidate, cachedData.lastModified, _isStale);
          return {
            type: "core",
            statusCode: cachedData.value.meta?.status ?? 307,
            body: emptyReadableStream(),
            headers: {
              ...cachedData.value.meta?.headers ?? {},
              ...cacheControl
            },
            isBase64Encoded: false
          };
        }
        case "route": {
          const cacheControl = await computeCacheControl(localizedPath, cachedData.value.body, host, cachedData.value.revalidate, cachedData.lastModified, _isStale);
          const isBinary = isBinaryContentType(String(cachedData.value.meta?.headers?.["content-type"]));
          return {
            type: "core",
            statusCode: event.rewriteStatusCode ?? cachedData.value.meta?.status ?? 200,
            body: toReadableStream(cachedData.value.body, isBinary),
            headers: {
              ...cacheControl,
              ...cachedData.value.meta?.headers,
              vary: VARY_HEADER
            },
            isBase64Encoded: isBinary
          };
        }
        default:
          return event;
      }
    } catch (e) {
      debug("Error while fetching cache", e);
      return event;
    }
  }
  return event;
}

// node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
function parse2(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path3 = "";
  var tryConsume = function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  };
  var mustConsume = function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  };
  var consumeText = function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  };
  var isSafe = function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  };
  var safePattern = function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  };
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path3 += prefix;
        prefix = "";
      }
      if (path3) {
        result.push(path3);
        path3 = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path3 += value;
      continue;
    }
    if (path3) {
      result.push(path3);
      path3 = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
function compile(str, options) {
  return tokensToFunction(parse2(str, options), options);
}
function tokensToFunction(tokens, options) {
  if (options === void 0) {
    options = {};
  }
  var reFlags = flags(options);
  var _a = options.encode, encode = _a === void 0 ? function(x) {
    return x;
  } : _a, _b = options.validate, validate = _b === void 0 ? true : _b;
  var matches = tokens.map(function(token) {
    if (typeof token === "object") {
      return new RegExp("^(?:".concat(token.pattern, ")$"), reFlags);
    }
  });
  return function(data) {
    var path3 = "";
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (typeof token === "string") {
        path3 += token;
        continue;
      }
      var value = data ? data[token.name] : void 0;
      var optional = token.modifier === "?" || token.modifier === "*";
      var repeat = token.modifier === "*" || token.modifier === "+";
      if (Array.isArray(value)) {
        if (!repeat) {
          throw new TypeError('Expected "'.concat(token.name, '" to not repeat, but got an array'));
        }
        if (value.length === 0) {
          if (optional)
            continue;
          throw new TypeError('Expected "'.concat(token.name, '" to not be empty'));
        }
        for (var j = 0; j < value.length; j++) {
          var segment = encode(value[j], token);
          if (validate && !matches[i].test(segment)) {
            throw new TypeError('Expected all "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
          }
          path3 += token.prefix + segment + token.suffix;
        }
        continue;
      }
      if (typeof value === "string" || typeof value === "number") {
        var segment = encode(String(value), token);
        if (validate && !matches[i].test(segment)) {
          throw new TypeError('Expected "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
        }
        path3 += token.prefix + segment + token.suffix;
        continue;
      }
      if (optional)
        continue;
      var typeOfMessage = repeat ? "an array" : "a string";
      throw new TypeError('Expected "'.concat(token.name, '" to be ').concat(typeOfMessage));
    }
    return path3;
  };
}
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path3 = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    };
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path: path3, index, params };
  };
}
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
function regexpToRegexp(path3, keys) {
  if (!keys)
    return path3;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path3.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path3.source);
  }
  return path3;
}
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path3) {
    return pathToRegexp(path3, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
function stringToRegexp(path3, keys, options) {
  return tokensToRegexp(parse2(path3, options), keys, options);
}
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
function pathToRegexp(path3, keys, options) {
  if (path3 instanceof RegExp)
    return regexpToRegexp(path3, keys);
  if (Array.isArray(path3))
    return arrayToRegexp(path3, keys, options);
  return stringToRegexp(path3, keys, options);
}

// node_modules/@opennextjs/aws/dist/utils/normalize-path.js
import path2 from "node:path";
function normalizeRepeatedSlashes(url) {
  const urlNoQuery = url.host + url.pathname;
  return `${url.protocol}//${urlNoQuery.replace(/\\/g, "/").replace(/\/\/+/g, "/")}${url.search}`;
}

// node_modules/@opennextjs/aws/dist/core/routing/matcher.js
init_stream();
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/routeMatcher.js
var optionalLocalePrefixRegex = `^/(?:${RoutesManifest.locales.map((locale) => `${locale}/?`).join("|")})?`;
var optionalBasepathPrefixRegex = RoutesManifest.basePath ? `^${RoutesManifest.basePath}/?` : "^/";
var optionalPrefix = optionalLocalePrefixRegex.replace("^/", optionalBasepathPrefixRegex);
function routeMatcher(routeDefinitions) {
  const regexp = routeDefinitions.map((route) => ({
    page: route.page,
    regexp: new RegExp(route.regex.replace("^/", optionalPrefix))
  }));
  const appPathsSet = /* @__PURE__ */ new Set();
  const routePathsSet = /* @__PURE__ */ new Set();
  for (const [k, v] of Object.entries(AppPathRoutesManifest)) {
    if (k.endsWith("page")) {
      appPathsSet.add(v);
    } else if (k.endsWith("route")) {
      routePathsSet.add(v);
    }
  }
  return function matchRoute(path3) {
    const foundRoutes = regexp.filter((route) => route.regexp.test(path3));
    return foundRoutes.map((foundRoute) => {
      let routeType = "page";
      if (appPathsSet.has(foundRoute.page)) {
        routeType = "app";
      } else if (routePathsSet.has(foundRoute.page)) {
        routeType = "route";
      }
      return {
        route: foundRoute.page,
        type: routeType
      };
    });
  };
}
var staticRouteMatcher = routeMatcher([
  ...RoutesManifest.routes.static,
  ...getStaticAPIRoutes()
]);
var dynamicRouteMatcher = routeMatcher(RoutesManifest.routes.dynamic);
function getStaticAPIRoutes() {
  const createRouteDefinition = (route) => ({
    page: route,
    regex: `^${route}(?:/)?$`
  });
  const dynamicRoutePages = new Set(RoutesManifest.routes.dynamic.map(({ page }) => page));
  const pagesStaticAPIRoutes = Object.keys(PagesManifest).filter((route) => route.startsWith("/api/") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  const appPathsStaticAPIRoutes = Object.values(AppPathRoutesManifest).filter((route) => (route.startsWith("/api/") || route === "/api") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  return [...pagesStaticAPIRoutes, ...appPathsStaticAPIRoutes];
}

// node_modules/@opennextjs/aws/dist/core/routing/matcher.js
var routeHasMatcher = (headers, cookies, query) => (redirect) => {
  switch (redirect.type) {
    case "header":
      return !!headers?.[redirect.key.toLowerCase()] && new RegExp(redirect.value ?? "").test(headers[redirect.key.toLowerCase()] ?? "");
    case "cookie":
      return !!cookies?.[redirect.key] && new RegExp(redirect.value ?? "").test(cookies[redirect.key] ?? "");
    case "query":
      return query[redirect.key] && Array.isArray(redirect.value) ? redirect.value.reduce((prev, current) => prev || new RegExp(current).test(query[redirect.key]), false) : new RegExp(redirect.value ?? "").test(query[redirect.key] ?? "");
    case "host":
      return headers?.host !== "" && new RegExp(redirect.value ?? "").test(headers.host);
    default:
      return false;
  }
};
function checkHas(matcher, has, inverted = false) {
  return has ? has.reduce((acc, cur) => {
    if (acc === false)
      return false;
    return inverted ? !matcher(cur) : matcher(cur);
  }, true) : true;
}
var getParamsFromSource = (source) => (value) => {
  debug("value", value);
  const _match = source(value);
  return _match ? _match.params : {};
};
var computeParamHas = (headers, cookies, query) => (has) => {
  if (!has.value)
    return {};
  const matcher = new RegExp(`^${has.value}$`);
  const fromSource = (value) => {
    const matches = value.match(matcher);
    return matches?.groups ?? {};
  };
  switch (has.type) {
    case "header":
      return fromSource(headers[has.key.toLowerCase()] ?? "");
    case "cookie":
      return fromSource(cookies[has.key] ?? "");
    case "query":
      return Array.isArray(query[has.key]) ? fromSource(query[has.key].join(",")) : fromSource(query[has.key] ?? "");
    case "host":
      return fromSource(headers.host ?? "");
  }
};
function convertMatch(match2, toDestination, destination) {
  if (!match2) {
    return destination;
  }
  const { params } = match2;
  const isUsingParams = Object.keys(params).length > 0;
  return isUsingParams ? toDestination(params) : destination;
}
function getNextConfigHeaders(event, configHeaders) {
  if (!configHeaders) {
    return {};
  }
  const matcher = routeHasMatcher(event.headers, event.cookies, event.query);
  const requestHeaders = {};
  const localizedRawPath = localizePath(event);
  for (const { headers, has, missing, regex, source, locale } of configHeaders) {
    const path3 = locale === false ? event.rawPath : localizedRawPath;
    if (new RegExp(regex).test(path3) && checkHas(matcher, has) && checkHas(matcher, missing, true)) {
      const fromSource = match(source);
      const _match = fromSource(path3);
      headers.forEach((h) => {
        try {
          const key = convertMatch(_match, compile(h.key), h.key);
          const value = convertMatch(_match, compile(h.value), h.value);
          requestHeaders[key] = value;
        } catch {
          debug(`Error matching header ${h.key} with value ${h.value}`);
          requestHeaders[h.key] = h.value;
        }
      });
    }
  }
  return requestHeaders;
}
function handleRewrites(event, rewrites) {
  const { rawPath, headers, query, cookies, url } = event;
  const localizedRawPath = localizePath(event);
  const matcher = routeHasMatcher(headers, cookies, query);
  const computeHas = computeParamHas(headers, cookies, query);
  const rewrite = rewrites.find((route) => {
    const path3 = route.locale === false ? rawPath : localizedRawPath;
    return new RegExp(route.regex).test(path3) && checkHas(matcher, route.has) && checkHas(matcher, route.missing, true);
  });
  let finalQuery = query;
  let rewrittenUrl = url;
  const isExternalRewrite = isExternal(rewrite?.destination);
  debug("isExternalRewrite", isExternalRewrite);
  if (rewrite) {
    const { pathname, protocol, hostname, queryString } = getUrlParts(rewrite.destination, isExternalRewrite);
    const pathToUse = rewrite.locale === false ? rawPath : localizedRawPath;
    debug("urlParts", { pathname, protocol, hostname, queryString });
    const toDestinationPath = compile(escapeRegex(pathname, { isPath: true }));
    const toDestinationHost = compile(escapeRegex(hostname));
    const toDestinationQuery = compile(escapeRegex(queryString));
    const params = {
      // params for the source
      ...getParamsFromSource(match(escapeRegex(rewrite.source, { isPath: true })))(pathToUse),
      // params for the has
      ...rewrite.has?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {}),
      // params for the missing
      ...rewrite.missing?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {})
    };
    const isUsingParams = Object.keys(params).length > 0;
    let rewrittenQuery = queryString;
    let rewrittenHost = hostname;
    let rewrittenPath = pathname;
    if (isUsingParams) {
      rewrittenPath = unescapeRegex(toDestinationPath(params));
      rewrittenHost = unescapeRegex(toDestinationHost(params));
      rewrittenQuery = unescapeRegex(toDestinationQuery(params));
    }
    if (NextConfig.i18n && !isExternalRewrite) {
      const strippedPathLocale = rewrittenPath.replace(new RegExp(`^/(${NextConfig.i18n.locales.join("|")})`), "");
      if (strippedPathLocale.startsWith("/api/")) {
        rewrittenPath = strippedPathLocale;
      }
    }
    rewrittenUrl = isExternalRewrite ? `${protocol}//${rewrittenHost}${rewrittenPath}` : new URL(rewrittenPath, event.url).href;
    finalQuery = {
      ...query,
      ...convertFromQueryString(rewrittenQuery)
    };
    rewrittenUrl += convertToQueryString(finalQuery);
    debug("rewrittenUrl", { rewrittenUrl, finalQuery, isUsingParams });
  }
  return {
    internalEvent: {
      ...event,
      query: finalQuery,
      rawPath: new URL(rewrittenUrl).pathname,
      url: rewrittenUrl
    },
    __rewrite: rewrite,
    isExternalRewrite
  };
}
function handleRepeatedSlashRedirect(event) {
  if (event.rawPath.match(/(\\|\/\/)/)) {
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: normalizeRepeatedSlashes(new URL(event.url))
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}
function handleTrailingSlashRedirect(event) {
  const url = new URL(event.rawPath, "http://localhost");
  if (
    // Someone is trying to redirect to a different origin, let's not do that
    url.host !== "localhost" || NextConfig.skipTrailingSlashRedirect || // We should not apply trailing slash redirect to API routes
    event.rawPath.startsWith("/api/")
  ) {
    return false;
  }
  const emptyBody = emptyReadableStream();
  if (NextConfig.trailingSlash && !(event.query.__nextDataReq === "1") && !event.rawPath.endsWith("/") && !event.rawPath.match(/[\w-]+\.[\w]+$/g)) {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0]}/${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  if (!NextConfig.trailingSlash && event.rawPath.endsWith("/") && event.rawPath !== "/") {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0].replace(/\/$/, "")}${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  return false;
}
function handleRedirects(event, redirects) {
  const repeatedSlashRedirect = handleRepeatedSlashRedirect(event);
  if (repeatedSlashRedirect)
    return repeatedSlashRedirect;
  const trailingSlashRedirect = handleTrailingSlashRedirect(event);
  if (trailingSlashRedirect)
    return trailingSlashRedirect;
  const localeRedirect = handleLocaleRedirect(event);
  if (localeRedirect)
    return localeRedirect;
  const { internalEvent, __rewrite } = handleRewrites(event, redirects.filter((r) => !r.internal));
  if (__rewrite && !__rewrite.internal) {
    return {
      type: event.type,
      statusCode: __rewrite.statusCode ?? 308,
      headers: {
        Location: internalEvent.url
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
}
function fixDataPage(internalEvent, buildId) {
  const { rawPath, query } = internalEvent;
  const basePath = NextConfig.basePath ?? "";
  const dataPattern = `${basePath}/_next/data/${buildId}`;
  if (rawPath.startsWith("/_next/data") && !rawPath.startsWith(dataPattern)) {
    return {
      type: internalEvent.type,
      statusCode: 404,
      body: toReadableStream("{}"),
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false
    };
  }
  if (rawPath.startsWith(dataPattern) && rawPath.endsWith(".json")) {
    const newPath = `${basePath}${rawPath.slice(dataPattern.length, -".json".length).replace(/^\/index$/, "/")}`;
    query.__nextDataReq = "1";
    return {
      ...internalEvent,
      rawPath: newPath,
      query,
      headers: {
        ...internalEvent.headers,
        "x-nextjs-data": "1"
      },
      url: new URL(`${newPath}${convertToQueryString(query)}`, internalEvent.url).href
    };
  }
  return internalEvent;
}
function handleFallbackFalse(internalEvent, prerenderManifest) {
  const { rawPath } = internalEvent;
  const { dynamicRoutes = {}, routes = {} } = prerenderManifest ?? {};
  const prerenderedFallbackRoutes = Object.entries(dynamicRoutes).filter(([, { fallback }]) => fallback === false);
  const routeFallback = prerenderedFallbackRoutes.some(([, { routeRegex }]) => {
    const routeRegexExp = new RegExp(routeRegex);
    return routeRegexExp.test(rawPath);
  });
  const locales = NextConfig.i18n?.locales;
  const routesAlreadyHaveLocale = locales?.includes(rawPath.split("/")[1]) || // If we don't use locales, we don't need to add the default locale
  locales === void 0;
  let localizedPath = routesAlreadyHaveLocale ? rawPath : `/${NextConfig.i18n?.defaultLocale}${rawPath}`;
  if (
    // Not if localizedPath is "/" tho, because that would not make it find `isPregenerated` below since it would be try to match an empty string.
    localizedPath !== "/" && NextConfig.trailingSlash && localizedPath.endsWith("/")
  ) {
    localizedPath = localizedPath.slice(0, -1);
  }
  const matchedStaticRoute = staticRouteMatcher(localizedPath);
  const prerenderedFallbackRoutesName = prerenderedFallbackRoutes.map(([name]) => name);
  const matchedDynamicRoute = dynamicRouteMatcher(localizedPath).filter(({ route }) => !prerenderedFallbackRoutesName.includes(route));
  const isPregenerated = Object.keys(routes).includes(localizedPath);
  if (routeFallback && !isPregenerated && matchedStaticRoute.length === 0 && matchedDynamicRoute.length === 0) {
    return {
      event: {
        ...internalEvent,
        rawPath: "/404",
        url: constructNextUrl(internalEvent.url, "/404"),
        headers: {
          ...internalEvent.headers,
          "x-invoke-status": "404"
        }
      },
      isISR: false
    };
  }
  return {
    event: internalEvent,
    isISR: routeFallback || isPregenerated
  };
}

// node_modules/@opennextjs/aws/dist/core/routing/middleware.js
init_stream();
init_utils();
var middlewareManifest = MiddlewareManifest;
var functionsConfigManifest = FunctionsConfigManifest;
var middleMatch = getMiddlewareMatch(middlewareManifest, functionsConfigManifest);
var REDIRECTS = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function defaultMiddlewareLoader() {
  return Promise.resolve().then(() => (init_edgeFunctionHandler(), edgeFunctionHandler_exports));
}
async function handleMiddleware(internalEvent, initialSearch, middlewareLoader = defaultMiddlewareLoader) {
  const headers = internalEvent.headers;
  if (headers["x-isr"] && headers["x-prerender-revalidate"] === PrerenderManifest?.preview?.previewModeId)
    return internalEvent;
  const normalizedPath = localizePath(internalEvent);
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(normalizedPath);
  } catch {
  }
  const hasMatch = middleMatch.some((r) => r.test(normalizedPath) || decodedPath !== void 0 && r.test(decodedPath));
  if (!hasMatch)
    return internalEvent;
  const initialUrl = new URL(normalizedPath, internalEvent.url);
  initialUrl.search = initialSearch;
  const url = initialUrl.href;
  const middleware = await middlewareLoader();
  const result = await middleware.default({
    // `geo` is pre Next 15.
    geo: {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: decodeURIComponent(headers["x-open-next-city"]),
      country: headers["x-open-next-country"],
      region: headers["x-open-next-region"],
      latitude: headers["x-open-next-latitude"],
      longitude: headers["x-open-next-longitude"]
    },
    headers,
    method: internalEvent.method || "GET",
    nextConfig: {
      basePath: NextConfig.basePath,
      i18n: NextConfig.i18n,
      trailingSlash: NextConfig.trailingSlash
    },
    url,
    body: convertBodyToReadableStream(internalEvent.method, internalEvent.body)
  });
  const statusCode = result.status;
  const responseHeaders = result.headers;
  const reqHeaders = {};
  const resHeaders = {};
  const filteredHeaders = [
    "x-middleware-override-headers",
    "x-middleware-next",
    "x-middleware-rewrite",
    // We need to drop `content-encoding` because it will be decoded
    "content-encoding"
  ];
  const xMiddlewareKey = "x-middleware-request-";
  responseHeaders.forEach((value, key) => {
    if (key.startsWith(xMiddlewareKey)) {
      const k = key.substring(xMiddlewareKey.length);
      reqHeaders[k] = value;
    } else {
      if (filteredHeaders.includes(key.toLowerCase()))
        return;
      if (key.toLowerCase() === "set-cookie") {
        resHeaders[key] = resHeaders[key] ? [...resHeaders[key], value] : [value];
      } else if (REDIRECTS.has(statusCode) && key.toLowerCase() === "location") {
        resHeaders[key] = normalizeLocationHeader(value, internalEvent.url);
      } else {
        resHeaders[key] = value;
      }
    }
  });
  const rewriteUrl = responseHeaders.get("x-middleware-rewrite");
  let isExternalRewrite = false;
  let middlewareQuery = internalEvent.query;
  let newUrl = internalEvent.url;
  if (rewriteUrl) {
    newUrl = rewriteUrl;
    if (isExternal(newUrl, internalEvent.headers.host)) {
      isExternalRewrite = true;
    } else {
      const rewriteUrlObject = new URL(rewriteUrl);
      middlewareQuery = getQueryFromSearchParams(rewriteUrlObject.searchParams);
      if ("__nextDataReq" in internalEvent.query) {
        middlewareQuery.__nextDataReq = internalEvent.query.__nextDataReq;
      }
    }
  }
  if (!rewriteUrl && !responseHeaders.get("x-middleware-next")) {
    const body = result.body ?? emptyReadableStream();
    return {
      type: internalEvent.type,
      statusCode,
      headers: resHeaders,
      body,
      isBase64Encoded: false
    };
  }
  return {
    responseHeaders: resHeaders,
    url: newUrl,
    rawPath: new URL(newUrl).pathname,
    type: internalEvent.type,
    headers: { ...internalEvent.headers, ...reqHeaders },
    body: internalEvent.body,
    method: internalEvent.method,
    query: middlewareQuery,
    cookies: internalEvent.cookies,
    remoteAddress: internalEvent.remoteAddress,
    isExternalRewrite,
    rewriteStatusCode: rewriteUrl && !isExternalRewrite ? statusCode : void 0
  };
}

// node_modules/@opennextjs/aws/dist/core/routingHandler.js
var MIDDLEWARE_HEADER_PREFIX = "x-middleware-response-";
var MIDDLEWARE_HEADER_PREFIX_LEN = MIDDLEWARE_HEADER_PREFIX.length;
var INTERNAL_HEADER_PREFIX = "x-opennext-";
var INTERNAL_HEADER_INITIAL_URL = `${INTERNAL_HEADER_PREFIX}initial-url`;
var INTERNAL_HEADER_LOCALE = `${INTERNAL_HEADER_PREFIX}locale`;
var INTERNAL_HEADER_RESOLVED_ROUTES = `${INTERNAL_HEADER_PREFIX}resolved-routes`;
var INTERNAL_HEADER_REWRITE_STATUS_CODE = `${INTERNAL_HEADER_PREFIX}rewrite-status-code`;
var INTERNAL_EVENT_REQUEST_ID = `${INTERNAL_HEADER_PREFIX}request-id`;
var geoHeaderToNextHeader = {
  "x-open-next-city": "x-vercel-ip-city",
  "x-open-next-country": "x-vercel-ip-country",
  "x-open-next-region": "x-vercel-ip-country-region",
  "x-open-next-latitude": "x-vercel-ip-latitude",
  "x-open-next-longitude": "x-vercel-ip-longitude"
};
var NEXT_INTERNAL_HEADERS = [
  "x-middleware-rewrite",
  "x-middleware-redirect",
  "x-middleware-set-cookie",
  "x-middleware-skip",
  "x-middleware-override-headers",
  "x-middleware-next",
  "x-now-route-matches",
  "x-matched-path",
  "x-nextjs-data",
  "x-next-resume-state-length"
];
function applyMiddlewareHeaders(eventOrResult, middlewareHeaders) {
  const isResult = isInternalResult(eventOrResult);
  const headers = eventOrResult.headers;
  const keyPrefix = isResult ? "" : MIDDLEWARE_HEADER_PREFIX;
  Object.entries(middlewareHeaders).forEach(([key, value]) => {
    if (value) {
      headers[keyPrefix + key] = Array.isArray(value) ? value.join(",") : value;
    }
  });
}
async function routingHandler(event, { assetResolver }) {
  try {
    for (const [openNextGeoName, nextGeoName] of Object.entries(geoHeaderToNextHeader)) {
      const value = event.headers[openNextGeoName];
      if (value) {
        event.headers[nextGeoName] = value;
      }
    }
    for (const key of Object.keys(event.headers)) {
      const lowerCaseKey = key.toLowerCase();
      if (lowerCaseKey.startsWith(INTERNAL_HEADER_PREFIX) || lowerCaseKey.startsWith(MIDDLEWARE_HEADER_PREFIX) || NEXT_INTERNAL_HEADERS.includes(lowerCaseKey)) {
        delete event.headers[key];
      }
    }
    let headers = getNextConfigHeaders(event, ConfigHeaders);
    let eventOrResult = fixDataPage(event, BuildId);
    if (isInternalResult(eventOrResult)) {
      return eventOrResult;
    }
    const redirect = handleRedirects(eventOrResult, RoutesManifest.redirects);
    if (redirect) {
      redirect.headers.Location = normalizeLocationHeader(redirect.headers.Location, event.url, true);
      debug("redirect", redirect);
      return redirect;
    }
    const middlewareEventOrResult = await handleMiddleware(
      eventOrResult,
      // We need to pass the initial search without any decoding
      // TODO: we'd need to refactor InternalEvent to include the initial querystring directly
      // Should be done in another PR because it is a breaking change
      new URL(event.url).search
    );
    if (isInternalResult(middlewareEventOrResult)) {
      return middlewareEventOrResult;
    }
    const middlewareHeadersPrioritized = globalThis.openNextConfig.dangerous?.middlewareHeadersOverrideNextConfigHeaders ?? false;
    if (middlewareHeadersPrioritized) {
      headers = {
        ...headers,
        ...middlewareEventOrResult.responseHeaders
      };
    } else {
      headers = {
        ...middlewareEventOrResult.responseHeaders,
        ...headers
      };
    }
    let isExternalRewrite = middlewareEventOrResult.isExternalRewrite ?? false;
    eventOrResult = middlewareEventOrResult;
    if (!isExternalRewrite) {
      const beforeRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.beforeFiles);
      eventOrResult = beforeRewrite.internalEvent;
      isExternalRewrite = beforeRewrite.isExternalRewrite;
      if (!isExternalRewrite) {
        const assetResult = await assetResolver?.maybeGetAssetResult?.(eventOrResult);
        if (assetResult) {
          applyMiddlewareHeaders(assetResult, headers);
          return assetResult;
        }
      }
    }
    const foundStaticRoute = staticRouteMatcher(eventOrResult.rawPath);
    const isStaticRoute = !isExternalRewrite && foundStaticRoute.length > 0;
    if (!(isStaticRoute || isExternalRewrite)) {
      const afterRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.afterFiles);
      eventOrResult = afterRewrite.internalEvent;
      isExternalRewrite = afterRewrite.isExternalRewrite;
    }
    let isISR = false;
    if (!isExternalRewrite) {
      const fallbackResult = handleFallbackFalse(eventOrResult, PrerenderManifest);
      eventOrResult = fallbackResult.event;
      isISR = fallbackResult.isISR;
    }
    const foundDynamicRoute = dynamicRouteMatcher(eventOrResult.rawPath);
    const isDynamicRoute = !isExternalRewrite && foundDynamicRoute.length > 0;
    if (!(isDynamicRoute || isStaticRoute || isExternalRewrite)) {
      const fallbackRewrites = handleRewrites(eventOrResult, RoutesManifest.rewrites.fallback);
      eventOrResult = fallbackRewrites.internalEvent;
      isExternalRewrite = fallbackRewrites.isExternalRewrite;
    }
    const isNextImageRoute = eventOrResult.rawPath.startsWith("/_next/image");
    const isRouteFoundBeforeAllRewrites = isStaticRoute || isDynamicRoute || isExternalRewrite;
    if (!(isRouteFoundBeforeAllRewrites || isNextImageRoute || // We need to check again once all rewrites have been applied
    staticRouteMatcher(eventOrResult.rawPath).length > 0 || dynamicRouteMatcher(eventOrResult.rawPath).length > 0)) {
      eventOrResult = {
        ...eventOrResult,
        rawPath: "/404",
        url: constructNextUrl(eventOrResult.url, "/404"),
        headers: {
          ...eventOrResult.headers,
          "x-middleware-response-cache-control": "private, no-cache, no-store, max-age=0, must-revalidate"
        }
      };
    }
    if (globalThis.openNextConfig.dangerous?.enableCacheInterception && !isInternalResult(eventOrResult)) {
      debug("Cache interception enabled");
      eventOrResult = await cacheInterceptor(eventOrResult);
      if (isInternalResult(eventOrResult)) {
        applyMiddlewareHeaders(eventOrResult, headers);
        return eventOrResult;
      }
    }
    applyMiddlewareHeaders(eventOrResult, headers);
    const resolvedRoutes = [
      ...foundStaticRoute,
      ...foundDynamicRoute
    ];
    debug("resolvedRoutes", resolvedRoutes);
    return {
      internalEvent: eventOrResult,
      isExternalRewrite,
      origin: false,
      isISR,
      resolvedRoutes,
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(eventOrResult, NextConfig.i18n) : void 0,
      rewriteStatusCode: middlewareEventOrResult.rewriteStatusCode
    };
  } catch (e) {
    error("Error in routingHandler", e);
    return {
      internalEvent: {
        type: "core",
        method: "GET",
        rawPath: "/500",
        url: constructNextUrl(event.url, "/500"),
        headers: {
          ...event.headers
        },
        query: event.query,
        cookies: event.cookies,
        remoteAddress: event.remoteAddress
      },
      isExternalRewrite: false,
      origin: false,
      isISR: false,
      resolvedRoutes: [],
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(event, NextConfig.i18n) : void 0
    };
  }
}
function isInternalResult(eventOrResult) {
  return eventOrResult != null && "statusCode" in eventOrResult;
}

// node_modules/@opennextjs/aws/dist/adapters/middleware.js
globalThis.internalFetch = fetch;
globalThis.__openNextAls = new AsyncLocalStorage();
var defaultHandler = async (internalEvent, options) => {
  const middlewareConfig = globalThis.openNextConfig.middleware;
  const originResolver = await resolveOriginResolver(middlewareConfig?.originResolver);
  const externalRequestProxy = await resolveProxyRequest(middlewareConfig?.override?.proxyExternalRequest);
  const assetResolver = await resolveAssetResolver(middlewareConfig?.assetResolver);
  const requestId = Math.random().toString(36);
  return runWithOpenNextRequestContext({
    isISRRevalidation: internalEvent.headers["x-isr"] === "1",
    waitUntil: options?.waitUntil,
    requestId
  }, async () => {
    const result = await routingHandler(internalEvent, { assetResolver });
    if ("internalEvent" in result) {
      debug("Middleware intercepted event", internalEvent);
      if (!result.isExternalRewrite) {
        const origin = await originResolver.resolve(result.internalEvent.rawPath);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_HEADER_INITIAL_URL]: internalEvent.url,
              [INTERNAL_HEADER_RESOLVED_ROUTES]: JSON.stringify(result.resolvedRoutes),
              [INTERNAL_EVENT_REQUEST_ID]: requestId,
              [INTERNAL_HEADER_REWRITE_STATUS_CODE]: String(result.rewriteStatusCode)
            }
          },
          isExternalRewrite: result.isExternalRewrite,
          origin,
          isISR: result.isISR,
          initialURL: result.initialURL,
          resolvedRoutes: result.resolvedRoutes
        };
      }
      try {
        return externalRequestProxy.proxy(result.internalEvent);
      } catch (e) {
        error("External request failed.", e);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_EVENT_REQUEST_ID]: requestId
            },
            rawPath: "/500",
            url: constructNextUrl(result.internalEvent.url, "/500"),
            method: "GET"
          },
          // On error we need to rewrite to the 500 page which is an internal rewrite
          isExternalRewrite: false,
          origin: false,
          isISR: result.isISR,
          initialURL: result.internalEvent.url,
          resolvedRoutes: [{ route: "/500", type: "page" }]
        };
      }
    }
    if (process.env.OPEN_NEXT_REQUEST_ID_HEADER || globalThis.openNextDebug) {
      result.headers[INTERNAL_EVENT_REQUEST_ID] = requestId;
    }
    debug("Middleware response", result);
    return result;
  });
};
var handler2 = await createGenericHandler({
  handler: defaultHandler,
  type: "middleware"
});
var middleware_default = {
  fetch: handler2
};
export {
  middleware_default as default,
  handler2 as handler
};
