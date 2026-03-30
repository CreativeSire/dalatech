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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// netlify/functions/node_modules/bcryptjs/dist/bcrypt.js
var require_bcrypt = __commonJS({
  "netlify/functions/node_modules/bcryptjs/dist/bcrypt.js"(exports2, module2) {
    (function(global, factory) {
      if (typeof define === "function" && define["amd"])
        define([], factory);
      else if (typeof require === "function" && typeof module2 === "object" && module2 && module2["exports"])
        module2["exports"] = factory();
      else
        (global["dcodeIO"] = global["dcodeIO"] || {})["bcrypt"] = factory();
    })(exports2, function() {
      "use strict";
      var bcrypt = {};
      var randomFallback = null;
      function random(len) {
        if (typeof module2 !== "undefined" && module2 && module2["exports"])
          try {
            return require("crypto")["randomBytes"](len);
          } catch (e) {
          }
        try {
          var a;
          (self["crypto"] || self["msCrypto"])["getRandomValues"](a = new Uint32Array(len));
          return Array.prototype.slice.call(a);
        } catch (e) {
        }
        if (!randomFallback)
          throw Error("Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative");
        return randomFallback(len);
      }
      var randomAvailable = false;
      try {
        random(1);
        randomAvailable = true;
      } catch (e) {
      }
      randomFallback = null;
      bcrypt.setRandomFallback = function(random2) {
        randomFallback = random2;
      };
      bcrypt.genSaltSync = function(rounds, seed_length) {
        rounds = rounds || GENSALT_DEFAULT_LOG2_ROUNDS;
        if (typeof rounds !== "number")
          throw Error("Illegal arguments: " + typeof rounds + ", " + typeof seed_length);
        if (rounds < 4)
          rounds = 4;
        else if (rounds > 31)
          rounds = 31;
        var salt = [];
        salt.push("$2a$");
        if (rounds < 10)
          salt.push("0");
        salt.push(rounds.toString());
        salt.push("$");
        salt.push(base64_encode(random(BCRYPT_SALT_LEN), BCRYPT_SALT_LEN));
        return salt.join("");
      };
      bcrypt.genSalt = function(rounds, seed_length, callback) {
        if (typeof seed_length === "function")
          callback = seed_length, seed_length = void 0;
        if (typeof rounds === "function")
          callback = rounds, rounds = void 0;
        if (typeof rounds === "undefined")
          rounds = GENSALT_DEFAULT_LOG2_ROUNDS;
        else if (typeof rounds !== "number")
          throw Error("illegal arguments: " + typeof rounds);
        function _async(callback2) {
          nextTick(function() {
            try {
              callback2(null, bcrypt.genSaltSync(rounds));
            } catch (err) {
              callback2(err);
            }
          });
        }
        if (callback) {
          if (typeof callback !== "function")
            throw Error("Illegal callback: " + typeof callback);
          _async(callback);
        } else
          return new Promise(function(resolve, reject) {
            _async(function(err, res) {
              if (err) {
                reject(err);
                return;
              }
              resolve(res);
            });
          });
      };
      bcrypt.hashSync = function(s, salt) {
        if (typeof salt === "undefined")
          salt = GENSALT_DEFAULT_LOG2_ROUNDS;
        if (typeof salt === "number")
          salt = bcrypt.genSaltSync(salt);
        if (typeof s !== "string" || typeof salt !== "string")
          throw Error("Illegal arguments: " + typeof s + ", " + typeof salt);
        return _hash(s, salt);
      };
      bcrypt.hash = function(s, salt, callback, progressCallback) {
        function _async(callback2) {
          if (typeof s === "string" && typeof salt === "number")
            bcrypt.genSalt(salt, function(err, salt2) {
              _hash(s, salt2, callback2, progressCallback);
            });
          else if (typeof s === "string" && typeof salt === "string")
            _hash(s, salt, callback2, progressCallback);
          else
            nextTick(callback2.bind(this, Error("Illegal arguments: " + typeof s + ", " + typeof salt)));
        }
        if (callback) {
          if (typeof callback !== "function")
            throw Error("Illegal callback: " + typeof callback);
          _async(callback);
        } else
          return new Promise(function(resolve, reject) {
            _async(function(err, res) {
              if (err) {
                reject(err);
                return;
              }
              resolve(res);
            });
          });
      };
      function safeStringCompare(known, unknown) {
        var right = 0, wrong = 0;
        for (var i = 0, k = known.length; i < k; ++i) {
          if (known.charCodeAt(i) === unknown.charCodeAt(i))
            ++right;
          else
            ++wrong;
        }
        if (right < 0)
          return false;
        return wrong === 0;
      }
      bcrypt.compareSync = function(s, hash) {
        if (typeof s !== "string" || typeof hash !== "string")
          throw Error("Illegal arguments: " + typeof s + ", " + typeof hash);
        if (hash.length !== 60)
          return false;
        return safeStringCompare(bcrypt.hashSync(s, hash.substr(0, hash.length - 31)), hash);
      };
      bcrypt.compare = function(s, hash, callback, progressCallback) {
        function _async(callback2) {
          if (typeof s !== "string" || typeof hash !== "string") {
            nextTick(callback2.bind(this, Error("Illegal arguments: " + typeof s + ", " + typeof hash)));
            return;
          }
          if (hash.length !== 60) {
            nextTick(callback2.bind(this, null, false));
            return;
          }
          bcrypt.hash(s, hash.substr(0, 29), function(err, comp) {
            if (err)
              callback2(err);
            else
              callback2(null, safeStringCompare(comp, hash));
          }, progressCallback);
        }
        if (callback) {
          if (typeof callback !== "function")
            throw Error("Illegal callback: " + typeof callback);
          _async(callback);
        } else
          return new Promise(function(resolve, reject) {
            _async(function(err, res) {
              if (err) {
                reject(err);
                return;
              }
              resolve(res);
            });
          });
      };
      bcrypt.getRounds = function(hash) {
        if (typeof hash !== "string")
          throw Error("Illegal arguments: " + typeof hash);
        return parseInt(hash.split("$")[2], 10);
      };
      bcrypt.getSalt = function(hash) {
        if (typeof hash !== "string")
          throw Error("Illegal arguments: " + typeof hash);
        if (hash.length !== 60)
          throw Error("Illegal hash length: " + hash.length + " != 60");
        return hash.substring(0, 29);
      };
      var nextTick = typeof process !== "undefined" && process && typeof process.nextTick === "function" ? typeof setImmediate === "function" ? setImmediate : process.nextTick : setTimeout;
      function stringToBytes2(str) {
        var out = [], i = 0;
        utfx.encodeUTF16toUTF8(function() {
          if (i >= str.length)
            return null;
          return str.charCodeAt(i++);
        }, function(b) {
          out.push(b);
        });
        return out;
      }
      var BASE64_CODE = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
      var BASE64_INDEX = [
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        0,
        1,
        54,
        55,
        56,
        57,
        58,
        59,
        60,
        61,
        62,
        63,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        28,
        29,
        30,
        31,
        32,
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        53,
        -1,
        -1,
        -1,
        -1,
        -1
      ];
      var stringFromCharCode = String.fromCharCode;
      function base64_encode(b, len) {
        var off = 0, rs = [], c1, c2;
        if (len <= 0 || len > b.length)
          throw Error("Illegal len: " + len);
        while (off < len) {
          c1 = b[off++] & 255;
          rs.push(BASE64_CODE[c1 >> 2 & 63]);
          c1 = (c1 & 3) << 4;
          if (off >= len) {
            rs.push(BASE64_CODE[c1 & 63]);
            break;
          }
          c2 = b[off++] & 255;
          c1 |= c2 >> 4 & 15;
          rs.push(BASE64_CODE[c1 & 63]);
          c1 = (c2 & 15) << 2;
          if (off >= len) {
            rs.push(BASE64_CODE[c1 & 63]);
            break;
          }
          c2 = b[off++] & 255;
          c1 |= c2 >> 6 & 3;
          rs.push(BASE64_CODE[c1 & 63]);
          rs.push(BASE64_CODE[c2 & 63]);
        }
        return rs.join("");
      }
      function base64_decode(s, len) {
        var off = 0, slen = s.length, olen = 0, rs = [], c1, c2, c3, c4, o, code;
        if (len <= 0)
          throw Error("Illegal len: " + len);
        while (off < slen - 1 && olen < len) {
          code = s.charCodeAt(off++);
          c1 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
          code = s.charCodeAt(off++);
          c2 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
          if (c1 == -1 || c2 == -1)
            break;
          o = c1 << 2 >>> 0;
          o |= (c2 & 48) >> 4;
          rs.push(stringFromCharCode(o));
          if (++olen >= len || off >= slen)
            break;
          code = s.charCodeAt(off++);
          c3 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
          if (c3 == -1)
            break;
          o = (c2 & 15) << 4 >>> 0;
          o |= (c3 & 60) >> 2;
          rs.push(stringFromCharCode(o));
          if (++olen >= len || off >= slen)
            break;
          code = s.charCodeAt(off++);
          c4 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
          o = (c3 & 3) << 6 >>> 0;
          o |= c4;
          rs.push(stringFromCharCode(o));
          ++olen;
        }
        var res = [];
        for (off = 0; off < olen; off++)
          res.push(rs[off].charCodeAt(0));
        return res;
      }
      var utfx = function() {
        "use strict";
        var utfx2 = {};
        utfx2.MAX_CODEPOINT = 1114111;
        utfx2.encodeUTF8 = function(src, dst) {
          var cp = null;
          if (typeof src === "number")
            cp = src, src = function() {
              return null;
            };
          while (cp !== null || (cp = src()) !== null) {
            if (cp < 128)
              dst(cp & 127);
            else if (cp < 2048)
              dst(cp >> 6 & 31 | 192), dst(cp & 63 | 128);
            else if (cp < 65536)
              dst(cp >> 12 & 15 | 224), dst(cp >> 6 & 63 | 128), dst(cp & 63 | 128);
            else
              dst(cp >> 18 & 7 | 240), dst(cp >> 12 & 63 | 128), dst(cp >> 6 & 63 | 128), dst(cp & 63 | 128);
            cp = null;
          }
        };
        utfx2.decodeUTF8 = function(src, dst) {
          var a, b, c, d, fail = function(b2) {
            b2 = b2.slice(0, b2.indexOf(null));
            var err = Error(b2.toString());
            err.name = "TruncatedError";
            err["bytes"] = b2;
            throw err;
          };
          while ((a = src()) !== null) {
            if ((a & 128) === 0)
              dst(a);
            else if ((a & 224) === 192)
              (b = src()) === null && fail([a, b]), dst((a & 31) << 6 | b & 63);
            else if ((a & 240) === 224)
              ((b = src()) === null || (c = src()) === null) && fail([a, b, c]), dst((a & 15) << 12 | (b & 63) << 6 | c & 63);
            else if ((a & 248) === 240)
              ((b = src()) === null || (c = src()) === null || (d = src()) === null) && fail([a, b, c, d]), dst((a & 7) << 18 | (b & 63) << 12 | (c & 63) << 6 | d & 63);
            else
              throw RangeError("Illegal starting byte: " + a);
          }
        };
        utfx2.UTF16toUTF8 = function(src, dst) {
          var c1, c2 = null;
          while (true) {
            if ((c1 = c2 !== null ? c2 : src()) === null)
              break;
            if (c1 >= 55296 && c1 <= 57343) {
              if ((c2 = src()) !== null) {
                if (c2 >= 56320 && c2 <= 57343) {
                  dst((c1 - 55296) * 1024 + c2 - 56320 + 65536);
                  c2 = null;
                  continue;
                }
              }
            }
            dst(c1);
          }
          if (c2 !== null)
            dst(c2);
        };
        utfx2.UTF8toUTF16 = function(src, dst) {
          var cp = null;
          if (typeof src === "number")
            cp = src, src = function() {
              return null;
            };
          while (cp !== null || (cp = src()) !== null) {
            if (cp <= 65535)
              dst(cp);
            else
              cp -= 65536, dst((cp >> 10) + 55296), dst(cp % 1024 + 56320);
            cp = null;
          }
        };
        utfx2.encodeUTF16toUTF8 = function(src, dst) {
          utfx2.UTF16toUTF8(src, function(cp) {
            utfx2.encodeUTF8(cp, dst);
          });
        };
        utfx2.decodeUTF8toUTF16 = function(src, dst) {
          utfx2.decodeUTF8(src, function(cp) {
            utfx2.UTF8toUTF16(cp, dst);
          });
        };
        utfx2.calculateCodePoint = function(cp) {
          return cp < 128 ? 1 : cp < 2048 ? 2 : cp < 65536 ? 3 : 4;
        };
        utfx2.calculateUTF8 = function(src) {
          var cp, l = 0;
          while ((cp = src()) !== null)
            l += utfx2.calculateCodePoint(cp);
          return l;
        };
        utfx2.calculateUTF16asUTF8 = function(src) {
          var n = 0, l = 0;
          utfx2.UTF16toUTF8(src, function(cp) {
            ++n;
            l += utfx2.calculateCodePoint(cp);
          });
          return [n, l];
        };
        return utfx2;
      }();
      Date.now = Date.now || function() {
        return +/* @__PURE__ */ new Date();
      };
      var BCRYPT_SALT_LEN = 16;
      var GENSALT_DEFAULT_LOG2_ROUNDS = 10;
      var BLOWFISH_NUM_ROUNDS = 16;
      var MAX_EXECUTION_TIME = 100;
      var P_ORIG = [
        608135816,
        2242054355,
        320440878,
        57701188,
        2752067618,
        698298832,
        137296536,
        3964562569,
        1160258022,
        953160567,
        3193202383,
        887688300,
        3232508343,
        3380367581,
        1065670069,
        3041331479,
        2450970073,
        2306472731
      ];
      var S_ORIG = [
        3509652390,
        2564797868,
        805139163,
        3491422135,
        3101798381,
        1780907670,
        3128725573,
        4046225305,
        614570311,
        3012652279,
        134345442,
        2240740374,
        1667834072,
        1901547113,
        2757295779,
        4103290238,
        227898511,
        1921955416,
        1904987480,
        2182433518,
        2069144605,
        3260701109,
        2620446009,
        720527379,
        3318853667,
        677414384,
        3393288472,
        3101374703,
        2390351024,
        1614419982,
        1822297739,
        2954791486,
        3608508353,
        3174124327,
        2024746970,
        1432378464,
        3864339955,
        2857741204,
        1464375394,
        1676153920,
        1439316330,
        715854006,
        3033291828,
        289532110,
        2706671279,
        2087905683,
        3018724369,
        1668267050,
        732546397,
        1947742710,
        3462151702,
        2609353502,
        2950085171,
        1814351708,
        2050118529,
        680887927,
        999245976,
        1800124847,
        3300911131,
        1713906067,
        1641548236,
        4213287313,
        1216130144,
        1575780402,
        4018429277,
        3917837745,
        3693486850,
        3949271944,
        596196993,
        3549867205,
        258830323,
        2213823033,
        772490370,
        2760122372,
        1774776394,
        2652871518,
        566650946,
        4142492826,
        1728879713,
        2882767088,
        1783734482,
        3629395816,
        2517608232,
        2874225571,
        1861159788,
        326777828,
        3124490320,
        2130389656,
        2716951837,
        967770486,
        1724537150,
        2185432712,
        2364442137,
        1164943284,
        2105845187,
        998989502,
        3765401048,
        2244026483,
        1075463327,
        1455516326,
        1322494562,
        910128902,
        469688178,
        1117454909,
        936433444,
        3490320968,
        3675253459,
        1240580251,
        122909385,
        2157517691,
        634681816,
        4142456567,
        3825094682,
        3061402683,
        2540495037,
        79693498,
        3249098678,
        1084186820,
        1583128258,
        426386531,
        1761308591,
        1047286709,
        322548459,
        995290223,
        1845252383,
        2603652396,
        3431023940,
        2942221577,
        3202600964,
        3727903485,
        1712269319,
        422464435,
        3234572375,
        1170764815,
        3523960633,
        3117677531,
        1434042557,
        442511882,
        3600875718,
        1076654713,
        1738483198,
        4213154764,
        2393238008,
        3677496056,
        1014306527,
        4251020053,
        793779912,
        2902807211,
        842905082,
        4246964064,
        1395751752,
        1040244610,
        2656851899,
        3396308128,
        445077038,
        3742853595,
        3577915638,
        679411651,
        2892444358,
        2354009459,
        1767581616,
        3150600392,
        3791627101,
        3102740896,
        284835224,
        4246832056,
        1258075500,
        768725851,
        2589189241,
        3069724005,
        3532540348,
        1274779536,
        3789419226,
        2764799539,
        1660621633,
        3471099624,
        4011903706,
        913787905,
        3497959166,
        737222580,
        2514213453,
        2928710040,
        3937242737,
        1804850592,
        3499020752,
        2949064160,
        2386320175,
        2390070455,
        2415321851,
        4061277028,
        2290661394,
        2416832540,
        1336762016,
        1754252060,
        3520065937,
        3014181293,
        791618072,
        3188594551,
        3933548030,
        2332172193,
        3852520463,
        3043980520,
        413987798,
        3465142937,
        3030929376,
        4245938359,
        2093235073,
        3534596313,
        375366246,
        2157278981,
        2479649556,
        555357303,
        3870105701,
        2008414854,
        3344188149,
        4221384143,
        3956125452,
        2067696032,
        3594591187,
        2921233993,
        2428461,
        544322398,
        577241275,
        1471733935,
        610547355,
        4027169054,
        1432588573,
        1507829418,
        2025931657,
        3646575487,
        545086370,
        48609733,
        2200306550,
        1653985193,
        298326376,
        1316178497,
        3007786442,
        2064951626,
        458293330,
        2589141269,
        3591329599,
        3164325604,
        727753846,
        2179363840,
        146436021,
        1461446943,
        4069977195,
        705550613,
        3059967265,
        3887724982,
        4281599278,
        3313849956,
        1404054877,
        2845806497,
        146425753,
        1854211946,
        1266315497,
        3048417604,
        3681880366,
        3289982499,
        290971e4,
        1235738493,
        2632868024,
        2414719590,
        3970600049,
        1771706367,
        1449415276,
        3266420449,
        422970021,
        1963543593,
        2690192192,
        3826793022,
        1062508698,
        1531092325,
        1804592342,
        2583117782,
        2714934279,
        4024971509,
        1294809318,
        4028980673,
        1289560198,
        2221992742,
        1669523910,
        35572830,
        157838143,
        1052438473,
        1016535060,
        1802137761,
        1753167236,
        1386275462,
        3080475397,
        2857371447,
        1040679964,
        2145300060,
        2390574316,
        1461121720,
        2956646967,
        4031777805,
        4028374788,
        33600511,
        2920084762,
        1018524850,
        629373528,
        3691585981,
        3515945977,
        2091462646,
        2486323059,
        586499841,
        988145025,
        935516892,
        3367335476,
        2599673255,
        2839830854,
        265290510,
        3972581182,
        2759138881,
        3795373465,
        1005194799,
        847297441,
        406762289,
        1314163512,
        1332590856,
        1866599683,
        4127851711,
        750260880,
        613907577,
        1450815602,
        3165620655,
        3734664991,
        3650291728,
        3012275730,
        3704569646,
        1427272223,
        778793252,
        1343938022,
        2676280711,
        2052605720,
        1946737175,
        3164576444,
        3914038668,
        3967478842,
        3682934266,
        1661551462,
        3294938066,
        4011595847,
        840292616,
        3712170807,
        616741398,
        312560963,
        711312465,
        1351876610,
        322626781,
        1910503582,
        271666773,
        2175563734,
        1594956187,
        70604529,
        3617834859,
        1007753275,
        1495573769,
        4069517037,
        2549218298,
        2663038764,
        504708206,
        2263041392,
        3941167025,
        2249088522,
        1514023603,
        1998579484,
        1312622330,
        694541497,
        2582060303,
        2151582166,
        1382467621,
        776784248,
        2618340202,
        3323268794,
        2497899128,
        2784771155,
        503983604,
        4076293799,
        907881277,
        423175695,
        432175456,
        1378068232,
        4145222326,
        3954048622,
        3938656102,
        3820766613,
        2793130115,
        2977904593,
        26017576,
        3274890735,
        3194772133,
        1700274565,
        1756076034,
        4006520079,
        3677328699,
        720338349,
        1533947780,
        354530856,
        688349552,
        3973924725,
        1637815568,
        332179504,
        3949051286,
        53804574,
        2852348879,
        3044236432,
        1282449977,
        3583942155,
        3416972820,
        4006381244,
        1617046695,
        2628476075,
        3002303598,
        1686838959,
        431878346,
        2686675385,
        1700445008,
        1080580658,
        1009431731,
        832498133,
        3223435511,
        2605976345,
        2271191193,
        2516031870,
        1648197032,
        4164389018,
        2548247927,
        300782431,
        375919233,
        238389289,
        3353747414,
        2531188641,
        2019080857,
        1475708069,
        455242339,
        2609103871,
        448939670,
        3451063019,
        1395535956,
        2413381860,
        1841049896,
        1491858159,
        885456874,
        4264095073,
        4001119347,
        1565136089,
        3898914787,
        1108368660,
        540939232,
        1173283510,
        2745871338,
        3681308437,
        4207628240,
        3343053890,
        4016749493,
        1699691293,
        1103962373,
        3625875870,
        2256883143,
        3830138730,
        1031889488,
        3479347698,
        1535977030,
        4236805024,
        3251091107,
        2132092099,
        1774941330,
        1199868427,
        1452454533,
        157007616,
        2904115357,
        342012276,
        595725824,
        1480756522,
        206960106,
        497939518,
        591360097,
        863170706,
        2375253569,
        3596610801,
        1814182875,
        2094937945,
        3421402208,
        1082520231,
        3463918190,
        2785509508,
        435703966,
        3908032597,
        1641649973,
        2842273706,
        3305899714,
        1510255612,
        2148256476,
        2655287854,
        3276092548,
        4258621189,
        236887753,
        3681803219,
        274041037,
        1734335097,
        3815195456,
        3317970021,
        1899903192,
        1026095262,
        4050517792,
        356393447,
        2410691914,
        3873677099,
        3682840055,
        3913112168,
        2491498743,
        4132185628,
        2489919796,
        1091903735,
        1979897079,
        3170134830,
        3567386728,
        3557303409,
        857797738,
        1136121015,
        1342202287,
        507115054,
        2535736646,
        337727348,
        3213592640,
        1301675037,
        2528481711,
        1895095763,
        1721773893,
        3216771564,
        62756741,
        2142006736,
        835421444,
        2531993523,
        1442658625,
        3659876326,
        2882144922,
        676362277,
        1392781812,
        170690266,
        3921047035,
        1759253602,
        3611846912,
        1745797284,
        664899054,
        1329594018,
        3901205900,
        3045908486,
        2062866102,
        2865634940,
        3543621612,
        3464012697,
        1080764994,
        553557557,
        3656615353,
        3996768171,
        991055499,
        499776247,
        1265440854,
        648242737,
        3940784050,
        980351604,
        3713745714,
        1749149687,
        3396870395,
        4211799374,
        3640570775,
        1161844396,
        3125318951,
        1431517754,
        545492359,
        4268468663,
        3499529547,
        1437099964,
        2702547544,
        3433638243,
        2581715763,
        2787789398,
        1060185593,
        1593081372,
        2418618748,
        4260947970,
        69676912,
        2159744348,
        86519011,
        2512459080,
        3838209314,
        1220612927,
        3339683548,
        133810670,
        1090789135,
        1078426020,
        1569222167,
        845107691,
        3583754449,
        4072456591,
        1091646820,
        628848692,
        1613405280,
        3757631651,
        526609435,
        236106946,
        48312990,
        2942717905,
        3402727701,
        1797494240,
        859738849,
        992217954,
        4005476642,
        2243076622,
        3870952857,
        3732016268,
        765654824,
        3490871365,
        2511836413,
        1685915746,
        3888969200,
        1414112111,
        2273134842,
        3281911079,
        4080962846,
        172450625,
        2569994100,
        980381355,
        4109958455,
        2819808352,
        2716589560,
        2568741196,
        3681446669,
        3329971472,
        1835478071,
        660984891,
        3704678404,
        4045999559,
        3422617507,
        3040415634,
        1762651403,
        1719377915,
        3470491036,
        2693910283,
        3642056355,
        3138596744,
        1364962596,
        2073328063,
        1983633131,
        926494387,
        3423689081,
        2150032023,
        4096667949,
        1749200295,
        3328846651,
        309677260,
        2016342300,
        1779581495,
        3079819751,
        111262694,
        1274766160,
        443224088,
        298511866,
        1025883608,
        3806446537,
        1145181785,
        168956806,
        3641502830,
        3584813610,
        1689216846,
        3666258015,
        3200248200,
        1692713982,
        2646376535,
        4042768518,
        1618508792,
        1610833997,
        3523052358,
        4130873264,
        2001055236,
        3610705100,
        2202168115,
        4028541809,
        2961195399,
        1006657119,
        2006996926,
        3186142756,
        1430667929,
        3210227297,
        1314452623,
        4074634658,
        4101304120,
        2273951170,
        1399257539,
        3367210612,
        3027628629,
        1190975929,
        2062231137,
        2333990788,
        2221543033,
        2438960610,
        1181637006,
        548689776,
        2362791313,
        3372408396,
        3104550113,
        3145860560,
        296247880,
        1970579870,
        3078560182,
        3769228297,
        1714227617,
        3291629107,
        3898220290,
        166772364,
        1251581989,
        493813264,
        448347421,
        195405023,
        2709975567,
        677966185,
        3703036547,
        1463355134,
        2715995803,
        1338867538,
        1343315457,
        2802222074,
        2684532164,
        233230375,
        2599980071,
        2000651841,
        3277868038,
        1638401717,
        4028070440,
        3237316320,
        6314154,
        819756386,
        300326615,
        590932579,
        1405279636,
        3267499572,
        3150704214,
        2428286686,
        3959192993,
        3461946742,
        1862657033,
        1266418056,
        963775037,
        2089974820,
        2263052895,
        1917689273,
        448879540,
        3550394620,
        3981727096,
        150775221,
        3627908307,
        1303187396,
        508620638,
        2975983352,
        2726630617,
        1817252668,
        1876281319,
        1457606340,
        908771278,
        3720792119,
        3617206836,
        2455994898,
        1729034894,
        1080033504,
        976866871,
        3556439503,
        2881648439,
        1522871579,
        1555064734,
        1336096578,
        3548522304,
        2579274686,
        3574697629,
        3205460757,
        3593280638,
        3338716283,
        3079412587,
        564236357,
        2993598910,
        1781952180,
        1464380207,
        3163844217,
        3332601554,
        1699332808,
        1393555694,
        1183702653,
        3581086237,
        1288719814,
        691649499,
        2847557200,
        2895455976,
        3193889540,
        2717570544,
        1781354906,
        1676643554,
        2592534050,
        3230253752,
        1126444790,
        2770207658,
        2633158820,
        2210423226,
        2615765581,
        2414155088,
        3127139286,
        673620729,
        2805611233,
        1269405062,
        4015350505,
        3341807571,
        4149409754,
        1057255273,
        2012875353,
        2162469141,
        2276492801,
        2601117357,
        993977747,
        3918593370,
        2654263191,
        753973209,
        36408145,
        2530585658,
        25011837,
        3520020182,
        2088578344,
        530523599,
        2918365339,
        1524020338,
        1518925132,
        3760827505,
        3759777254,
        1202760957,
        3985898139,
        3906192525,
        674977740,
        4174734889,
        2031300136,
        2019492241,
        3983892565,
        4153806404,
        3822280332,
        352677332,
        2297720250,
        60907813,
        90501309,
        3286998549,
        1016092578,
        2535922412,
        2839152426,
        457141659,
        509813237,
        4120667899,
        652014361,
        1966332200,
        2975202805,
        55981186,
        2327461051,
        676427537,
        3255491064,
        2882294119,
        3433927263,
        1307055953,
        942726286,
        933058658,
        2468411793,
        3933900994,
        4215176142,
        1361170020,
        2001714738,
        2830558078,
        3274259782,
        1222529897,
        1679025792,
        2729314320,
        3714953764,
        1770335741,
        151462246,
        3013232138,
        1682292957,
        1483529935,
        471910574,
        1539241949,
        458788160,
        3436315007,
        1807016891,
        3718408830,
        978976581,
        1043663428,
        3165965781,
        1927990952,
        4200891579,
        2372276910,
        3208408903,
        3533431907,
        1412390302,
        2931980059,
        4132332400,
        1947078029,
        3881505623,
        4168226417,
        2941484381,
        1077988104,
        1320477388,
        886195818,
        18198404,
        3786409e3,
        2509781533,
        112762804,
        3463356488,
        1866414978,
        891333506,
        18488651,
        661792760,
        1628790961,
        3885187036,
        3141171499,
        876946877,
        2693282273,
        1372485963,
        791857591,
        2686433993,
        3759982718,
        3167212022,
        3472953795,
        2716379847,
        445679433,
        3561995674,
        3504004811,
        3574258232,
        54117162,
        3331405415,
        2381918588,
        3769707343,
        4154350007,
        1140177722,
        4074052095,
        668550556,
        3214352940,
        367459370,
        261225585,
        2610173221,
        4209349473,
        3468074219,
        3265815641,
        314222801,
        3066103646,
        3808782860,
        282218597,
        3406013506,
        3773591054,
        379116347,
        1285071038,
        846784868,
        2669647154,
        3771962079,
        3550491691,
        2305946142,
        453669953,
        1268987020,
        3317592352,
        3279303384,
        3744833421,
        2610507566,
        3859509063,
        266596637,
        3847019092,
        517658769,
        3462560207,
        3443424879,
        370717030,
        4247526661,
        2224018117,
        4143653529,
        4112773975,
        2788324899,
        2477274417,
        1456262402,
        2901442914,
        1517677493,
        1846949527,
        2295493580,
        3734397586,
        2176403920,
        1280348187,
        1908823572,
        3871786941,
        846861322,
        1172426758,
        3287448474,
        3383383037,
        1655181056,
        3139813346,
        901632758,
        1897031941,
        2986607138,
        3066810236,
        3447102507,
        1393639104,
        373351379,
        950779232,
        625454576,
        3124240540,
        4148612726,
        2007998917,
        544563296,
        2244738638,
        2330496472,
        2058025392,
        1291430526,
        424198748,
        50039436,
        29584100,
        3605783033,
        2429876329,
        2791104160,
        1057563949,
        3255363231,
        3075367218,
        3463963227,
        1469046755,
        985887462
      ];
      var C_ORIG = [
        1332899944,
        1700884034,
        1701343084,
        1684370003,
        1668446532,
        1869963892
      ];
      function _encipher(lr, off, P, S) {
        var n, l = lr[off], r = lr[off + 1];
        l ^= P[0];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[1];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[2];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[3];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[4];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[5];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[6];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[7];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[8];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[9];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[10];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[11];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[12];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[13];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[14];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[15];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[16];
        lr[off] = r ^ P[BLOWFISH_NUM_ROUNDS + 1];
        lr[off + 1] = l;
        return lr;
      }
      function _streamtoword(data, offp) {
        for (var i = 0, word = 0; i < 4; ++i)
          word = word << 8 | data[offp] & 255, offp = (offp + 1) % data.length;
        return { key: word, offp };
      }
      function _key(key, P, S) {
        var offset = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
        for (var i = 0; i < plen; i++)
          sw = _streamtoword(key, offset), offset = sw.offp, P[i] = P[i] ^ sw.key;
        for (i = 0; i < plen; i += 2)
          lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
        for (i = 0; i < slen; i += 2)
          lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
      }
      function _ekskey(data, key, P, S) {
        var offp = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
        for (var i = 0; i < plen; i++)
          sw = _streamtoword(key, offp), offp = sw.offp, P[i] = P[i] ^ sw.key;
        offp = 0;
        for (i = 0; i < plen; i += 2)
          sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
        for (i = 0; i < slen; i += 2)
          sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
      }
      function _crypt(b, salt, rounds, callback, progressCallback) {
        var cdata = C_ORIG.slice(), clen = cdata.length, err;
        if (rounds < 4 || rounds > 31) {
          err = Error("Illegal number of rounds (4-31): " + rounds);
          if (callback) {
            nextTick(callback.bind(this, err));
            return;
          } else
            throw err;
        }
        if (salt.length !== BCRYPT_SALT_LEN) {
          err = Error("Illegal salt length: " + salt.length + " != " + BCRYPT_SALT_LEN);
          if (callback) {
            nextTick(callback.bind(this, err));
            return;
          } else
            throw err;
        }
        rounds = 1 << rounds >>> 0;
        var P, S, i = 0, j;
        if (Int32Array) {
          P = new Int32Array(P_ORIG);
          S = new Int32Array(S_ORIG);
        } else {
          P = P_ORIG.slice();
          S = S_ORIG.slice();
        }
        _ekskey(salt, b, P, S);
        function next() {
          if (progressCallback)
            progressCallback(i / rounds);
          if (i < rounds) {
            var start = Date.now();
            for (; i < rounds; ) {
              i = i + 1;
              _key(b, P, S);
              _key(salt, P, S);
              if (Date.now() - start > MAX_EXECUTION_TIME)
                break;
            }
          } else {
            for (i = 0; i < 64; i++)
              for (j = 0; j < clen >> 1; j++)
                _encipher(cdata, j << 1, P, S);
            var ret = [];
            for (i = 0; i < clen; i++)
              ret.push((cdata[i] >> 24 & 255) >>> 0), ret.push((cdata[i] >> 16 & 255) >>> 0), ret.push((cdata[i] >> 8 & 255) >>> 0), ret.push((cdata[i] & 255) >>> 0);
            if (callback) {
              callback(null, ret);
              return;
            } else
              return ret;
          }
          if (callback)
            nextTick(next);
        }
        if (typeof callback !== "undefined") {
          next();
        } else {
          var res;
          while (true)
            if (typeof (res = next()) !== "undefined")
              return res || [];
        }
      }
      function _hash(s, salt, callback, progressCallback) {
        var err;
        if (typeof s !== "string" || typeof salt !== "string") {
          err = Error("Invalid string / salt: Not a string");
          if (callback) {
            nextTick(callback.bind(this, err));
            return;
          } else
            throw err;
        }
        var minor, offset;
        if (salt.charAt(0) !== "$" || salt.charAt(1) !== "2") {
          err = Error("Invalid salt version: " + salt.substring(0, 2));
          if (callback) {
            nextTick(callback.bind(this, err));
            return;
          } else
            throw err;
        }
        if (salt.charAt(2) === "$")
          minor = String.fromCharCode(0), offset = 3;
        else {
          minor = salt.charAt(2);
          if (minor !== "a" && minor !== "b" && minor !== "y" || salt.charAt(3) !== "$") {
            err = Error("Invalid salt revision: " + salt.substring(2, 4));
            if (callback) {
              nextTick(callback.bind(this, err));
              return;
            } else
              throw err;
          }
          offset = 4;
        }
        if (salt.charAt(offset + 2) > "$") {
          err = Error("Missing salt rounds");
          if (callback) {
            nextTick(callback.bind(this, err));
            return;
          } else
            throw err;
        }
        var r1 = parseInt(salt.substring(offset, offset + 1), 10) * 10, r2 = parseInt(salt.substring(offset + 1, offset + 2), 10), rounds = r1 + r2, real_salt = salt.substring(offset + 3, offset + 25);
        s += minor >= "a" ? "\0" : "";
        var passwordb = stringToBytes2(s), saltb = base64_decode(real_salt, BCRYPT_SALT_LEN);
        function finish(bytes) {
          var res = [];
          res.push("$2");
          if (minor >= "a")
            res.push(minor);
          res.push("$");
          if (rounds < 10)
            res.push("0");
          res.push(rounds.toString());
          res.push("$");
          res.push(base64_encode(saltb, saltb.length));
          res.push(base64_encode(bytes, C_ORIG.length * 4 - 1));
          return res.join("");
        }
        if (typeof callback == "undefined")
          return finish(_crypt(passwordb, saltb, rounds));
        else {
          _crypt(passwordb, saltb, rounds, function(err2, bytes) {
            if (err2)
              callback(err2, null);
            else
              callback(null, finish(bytes));
          }, progressCallback);
        }
      }
      bcrypt.encodeBase64 = base64_encode;
      bcrypt.decodeBase64 = base64_decode;
      return bcrypt;
    });
  }
});

// netlify/functions/node_modules/bcryptjs/index.js
var require_bcryptjs = __commonJS({
  "netlify/functions/node_modules/bcryptjs/index.js"(exports2, module2) {
    module2.exports = require_bcrypt();
  }
});

// netlify/functions/node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS({
  "netlify/functions/node_modules/safe-buffer/index.js"(exports2, module2) {
    var buffer = require("buffer");
    var Buffer2 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module2.exports = buffer;
    } else {
      copyProps(buffer, exports2);
      exports2.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer2(arg, encodingOrOffset, length);
    }
    SafeBuffer.prototype = Object.create(Buffer2.prototype);
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer2(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer2(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// netlify/functions/node_modules/jws/lib/data-stream.js
var require_data_stream = __commonJS({
  "netlify/functions/node_modules/jws/lib/data-stream.js"(exports2, module2) {
    var Buffer2 = require_safe_buffer().Buffer;
    var Stream = require("stream");
    var util = require("util");
    function DataStream(data) {
      this.buffer = null;
      this.writable = true;
      this.readable = true;
      if (!data) {
        this.buffer = Buffer2.alloc(0);
        return this;
      }
      if (typeof data.pipe === "function") {
        this.buffer = Buffer2.alloc(0);
        data.pipe(this);
        return this;
      }
      if (data.length || typeof data === "object") {
        this.buffer = data;
        this.writable = false;
        process.nextTick(function() {
          this.emit("end", data);
          this.readable = false;
          this.emit("close");
        }.bind(this));
        return this;
      }
      throw new TypeError("Unexpected data type (" + typeof data + ")");
    }
    util.inherits(DataStream, Stream);
    DataStream.prototype.write = function write(data) {
      this.buffer = Buffer2.concat([this.buffer, Buffer2.from(data)]);
      this.emit("data", data);
    };
    DataStream.prototype.end = function end(data) {
      if (data)
        this.write(data);
      this.emit("end", data);
      this.emit("close");
      this.writable = false;
      this.readable = false;
    };
    module2.exports = DataStream;
  }
});

// netlify/functions/node_modules/ecdsa-sig-formatter/src/param-bytes-for-alg.js
var require_param_bytes_for_alg = __commonJS({
  "netlify/functions/node_modules/ecdsa-sig-formatter/src/param-bytes-for-alg.js"(exports2, module2) {
    "use strict";
    function getParamSize(keySize) {
      var result = (keySize / 8 | 0) + (keySize % 8 === 0 ? 0 : 1);
      return result;
    }
    var paramBytesForAlg = {
      ES256: getParamSize(256),
      ES384: getParamSize(384),
      ES512: getParamSize(521)
    };
    function getParamBytesForAlg(alg) {
      var paramBytes = paramBytesForAlg[alg];
      if (paramBytes) {
        return paramBytes;
      }
      throw new Error('Unknown algorithm "' + alg + '"');
    }
    module2.exports = getParamBytesForAlg;
  }
});

// netlify/functions/node_modules/ecdsa-sig-formatter/src/ecdsa-sig-formatter.js
var require_ecdsa_sig_formatter = __commonJS({
  "netlify/functions/node_modules/ecdsa-sig-formatter/src/ecdsa-sig-formatter.js"(exports2, module2) {
    "use strict";
    var Buffer2 = require_safe_buffer().Buffer;
    var getParamBytesForAlg = require_param_bytes_for_alg();
    var MAX_OCTET = 128;
    var CLASS_UNIVERSAL = 0;
    var PRIMITIVE_BIT = 32;
    var TAG_SEQ = 16;
    var TAG_INT = 2;
    var ENCODED_TAG_SEQ = TAG_SEQ | PRIMITIVE_BIT | CLASS_UNIVERSAL << 6;
    var ENCODED_TAG_INT = TAG_INT | CLASS_UNIVERSAL << 6;
    function base64Url(base64) {
      return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }
    function signatureAsBuffer(signature) {
      if (Buffer2.isBuffer(signature)) {
        return signature;
      } else if ("string" === typeof signature) {
        return Buffer2.from(signature, "base64");
      }
      throw new TypeError("ECDSA signature must be a Base64 string or a Buffer");
    }
    function derToJose(signature, alg) {
      signature = signatureAsBuffer(signature);
      var paramBytes = getParamBytesForAlg(alg);
      var maxEncodedParamLength = paramBytes + 1;
      var inputLength = signature.length;
      var offset = 0;
      if (signature[offset++] !== ENCODED_TAG_SEQ) {
        throw new Error('Could not find expected "seq"');
      }
      var seqLength = signature[offset++];
      if (seqLength === (MAX_OCTET | 1)) {
        seqLength = signature[offset++];
      }
      if (inputLength - offset < seqLength) {
        throw new Error('"seq" specified length of "' + seqLength + '", only "' + (inputLength - offset) + '" remaining');
      }
      if (signature[offset++] !== ENCODED_TAG_INT) {
        throw new Error('Could not find expected "int" for "r"');
      }
      var rLength = signature[offset++];
      if (inputLength - offset - 2 < rLength) {
        throw new Error('"r" specified length of "' + rLength + '", only "' + (inputLength - offset - 2) + '" available');
      }
      if (maxEncodedParamLength < rLength) {
        throw new Error('"r" specified length of "' + rLength + '", max of "' + maxEncodedParamLength + '" is acceptable');
      }
      var rOffset = offset;
      offset += rLength;
      if (signature[offset++] !== ENCODED_TAG_INT) {
        throw new Error('Could not find expected "int" for "s"');
      }
      var sLength = signature[offset++];
      if (inputLength - offset !== sLength) {
        throw new Error('"s" specified length of "' + sLength + '", expected "' + (inputLength - offset) + '"');
      }
      if (maxEncodedParamLength < sLength) {
        throw new Error('"s" specified length of "' + sLength + '", max of "' + maxEncodedParamLength + '" is acceptable');
      }
      var sOffset = offset;
      offset += sLength;
      if (offset !== inputLength) {
        throw new Error('Expected to consume entire buffer, but "' + (inputLength - offset) + '" bytes remain');
      }
      var rPadding = paramBytes - rLength, sPadding = paramBytes - sLength;
      var dst = Buffer2.allocUnsafe(rPadding + rLength + sPadding + sLength);
      for (offset = 0; offset < rPadding; ++offset) {
        dst[offset] = 0;
      }
      signature.copy(dst, offset, rOffset + Math.max(-rPadding, 0), rOffset + rLength);
      offset = paramBytes;
      for (var o = offset; offset < o + sPadding; ++offset) {
        dst[offset] = 0;
      }
      signature.copy(dst, offset, sOffset + Math.max(-sPadding, 0), sOffset + sLength);
      dst = dst.toString("base64");
      dst = base64Url(dst);
      return dst;
    }
    function countPadding(buf, start, stop) {
      var padding = 0;
      while (start + padding < stop && buf[start + padding] === 0) {
        ++padding;
      }
      var needsSign = buf[start + padding] >= MAX_OCTET;
      if (needsSign) {
        --padding;
      }
      return padding;
    }
    function joseToDer(signature, alg) {
      signature = signatureAsBuffer(signature);
      var paramBytes = getParamBytesForAlg(alg);
      var signatureBytes = signature.length;
      if (signatureBytes !== paramBytes * 2) {
        throw new TypeError('"' + alg + '" signatures must be "' + paramBytes * 2 + '" bytes, saw "' + signatureBytes + '"');
      }
      var rPadding = countPadding(signature, 0, paramBytes);
      var sPadding = countPadding(signature, paramBytes, signature.length);
      var rLength = paramBytes - rPadding;
      var sLength = paramBytes - sPadding;
      var rsBytes = 1 + 1 + rLength + 1 + 1 + sLength;
      var shortLength = rsBytes < MAX_OCTET;
      var dst = Buffer2.allocUnsafe((shortLength ? 2 : 3) + rsBytes);
      var offset = 0;
      dst[offset++] = ENCODED_TAG_SEQ;
      if (shortLength) {
        dst[offset++] = rsBytes;
      } else {
        dst[offset++] = MAX_OCTET | 1;
        dst[offset++] = rsBytes & 255;
      }
      dst[offset++] = ENCODED_TAG_INT;
      dst[offset++] = rLength;
      if (rPadding < 0) {
        dst[offset++] = 0;
        offset += signature.copy(dst, offset, 0, paramBytes);
      } else {
        offset += signature.copy(dst, offset, rPadding, paramBytes);
      }
      dst[offset++] = ENCODED_TAG_INT;
      dst[offset++] = sLength;
      if (sPadding < 0) {
        dst[offset++] = 0;
        signature.copy(dst, offset, paramBytes);
      } else {
        signature.copy(dst, offset, paramBytes + sPadding);
      }
      return dst;
    }
    module2.exports = {
      derToJose,
      joseToDer
    };
  }
});

// netlify/functions/node_modules/buffer-equal-constant-time/index.js
var require_buffer_equal_constant_time = __commonJS({
  "netlify/functions/node_modules/buffer-equal-constant-time/index.js"(exports2, module2) {
    "use strict";
    var Buffer2 = require("buffer").Buffer;
    var SlowBuffer = require("buffer").SlowBuffer;
    module2.exports = bufferEq;
    function bufferEq(a, b) {
      if (!Buffer2.isBuffer(a) || !Buffer2.isBuffer(b)) {
        return false;
      }
      if (a.length !== b.length) {
        return false;
      }
      var c = 0;
      for (var i = 0; i < a.length; i++) {
        c |= a[i] ^ b[i];
      }
      return c === 0;
    }
    bufferEq.install = function() {
      Buffer2.prototype.equal = SlowBuffer.prototype.equal = function equal(that) {
        return bufferEq(this, that);
      };
    };
    var origBufEqual = Buffer2.prototype.equal;
    var origSlowBufEqual = SlowBuffer.prototype.equal;
    bufferEq.restore = function() {
      Buffer2.prototype.equal = origBufEqual;
      SlowBuffer.prototype.equal = origSlowBufEqual;
    };
  }
});

// netlify/functions/node_modules/jwa/index.js
var require_jwa = __commonJS({
  "netlify/functions/node_modules/jwa/index.js"(exports2, module2) {
    var Buffer2 = require_safe_buffer().Buffer;
    var crypto6 = require("crypto");
    var formatEcdsa = require_ecdsa_sig_formatter();
    var util = require("util");
    var MSG_INVALID_ALGORITHM = '"%s" is not a valid algorithm.\n  Supported algorithms are:\n  "HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "PS256", "PS384", "PS512", "ES256", "ES384", "ES512" and "none".';
    var MSG_INVALID_SECRET = "secret must be a string or buffer";
    var MSG_INVALID_VERIFIER_KEY = "key must be a string or a buffer";
    var MSG_INVALID_SIGNER_KEY = "key must be a string, a buffer or an object";
    var supportsKeyObjects = typeof crypto6.createPublicKey === "function";
    if (supportsKeyObjects) {
      MSG_INVALID_VERIFIER_KEY += " or a KeyObject";
      MSG_INVALID_SECRET += "or a KeyObject";
    }
    function checkIsPublicKey(key) {
      if (Buffer2.isBuffer(key)) {
        return;
      }
      if (typeof key === "string") {
        return;
      }
      if (!supportsKeyObjects) {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
      if (typeof key !== "object") {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
      if (typeof key.type !== "string") {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
      if (typeof key.asymmetricKeyType !== "string") {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
      if (typeof key.export !== "function") {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
    }
    function checkIsPrivateKey(key) {
      if (Buffer2.isBuffer(key)) {
        return;
      }
      if (typeof key === "string") {
        return;
      }
      if (typeof key === "object") {
        return;
      }
      throw typeError(MSG_INVALID_SIGNER_KEY);
    }
    function checkIsSecretKey(key) {
      if (Buffer2.isBuffer(key)) {
        return;
      }
      if (typeof key === "string") {
        return key;
      }
      if (!supportsKeyObjects) {
        throw typeError(MSG_INVALID_SECRET);
      }
      if (typeof key !== "object") {
        throw typeError(MSG_INVALID_SECRET);
      }
      if (key.type !== "secret") {
        throw typeError(MSG_INVALID_SECRET);
      }
      if (typeof key.export !== "function") {
        throw typeError(MSG_INVALID_SECRET);
      }
    }
    function fromBase64(base64) {
      return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }
    function toBase64(base64url) {
      base64url = base64url.toString();
      var padding = 4 - base64url.length % 4;
      if (padding !== 4) {
        for (var i = 0; i < padding; ++i) {
          base64url += "=";
        }
      }
      return base64url.replace(/\-/g, "+").replace(/_/g, "/");
    }
    function typeError(template) {
      var args = [].slice.call(arguments, 1);
      var errMsg = util.format.bind(util, template).apply(null, args);
      return new TypeError(errMsg);
    }
    function bufferOrString(obj) {
      return Buffer2.isBuffer(obj) || typeof obj === "string";
    }
    function normalizeInput(thing) {
      if (!bufferOrString(thing))
        thing = JSON.stringify(thing);
      return thing;
    }
    function createHmacSigner(bits) {
      return function sign(thing, secret) {
        checkIsSecretKey(secret);
        thing = normalizeInput(thing);
        var hmac = crypto6.createHmac("sha" + bits, secret);
        var sig = (hmac.update(thing), hmac.digest("base64"));
        return fromBase64(sig);
      };
    }
    var bufferEqual;
    var timingSafeEqual = "timingSafeEqual" in crypto6 ? function timingSafeEqual2(a, b) {
      if (a.byteLength !== b.byteLength) {
        return false;
      }
      return crypto6.timingSafeEqual(a, b);
    } : function timingSafeEqual2(a, b) {
      if (!bufferEqual) {
        bufferEqual = require_buffer_equal_constant_time();
      }
      return bufferEqual(a, b);
    };
    function createHmacVerifier(bits) {
      return function verify(thing, signature, secret) {
        var computedSig = createHmacSigner(bits)(thing, secret);
        return timingSafeEqual(Buffer2.from(signature), Buffer2.from(computedSig));
      };
    }
    function createKeySigner(bits) {
      return function sign(thing, privateKey) {
        checkIsPrivateKey(privateKey);
        thing = normalizeInput(thing);
        var signer = crypto6.createSign("RSA-SHA" + bits);
        var sig = (signer.update(thing), signer.sign(privateKey, "base64"));
        return fromBase64(sig);
      };
    }
    function createKeyVerifier(bits) {
      return function verify(thing, signature, publicKey) {
        checkIsPublicKey(publicKey);
        thing = normalizeInput(thing);
        signature = toBase64(signature);
        var verifier = crypto6.createVerify("RSA-SHA" + bits);
        verifier.update(thing);
        return verifier.verify(publicKey, signature, "base64");
      };
    }
    function createPSSKeySigner(bits) {
      return function sign(thing, privateKey) {
        checkIsPrivateKey(privateKey);
        thing = normalizeInput(thing);
        var signer = crypto6.createSign("RSA-SHA" + bits);
        var sig = (signer.update(thing), signer.sign({
          key: privateKey,
          padding: crypto6.constants.RSA_PKCS1_PSS_PADDING,
          saltLength: crypto6.constants.RSA_PSS_SALTLEN_DIGEST
        }, "base64"));
        return fromBase64(sig);
      };
    }
    function createPSSKeyVerifier(bits) {
      return function verify(thing, signature, publicKey) {
        checkIsPublicKey(publicKey);
        thing = normalizeInput(thing);
        signature = toBase64(signature);
        var verifier = crypto6.createVerify("RSA-SHA" + bits);
        verifier.update(thing);
        return verifier.verify({
          key: publicKey,
          padding: crypto6.constants.RSA_PKCS1_PSS_PADDING,
          saltLength: crypto6.constants.RSA_PSS_SALTLEN_DIGEST
        }, signature, "base64");
      };
    }
    function createECDSASigner(bits) {
      var inner = createKeySigner(bits);
      return function sign() {
        var signature = inner.apply(null, arguments);
        signature = formatEcdsa.derToJose(signature, "ES" + bits);
        return signature;
      };
    }
    function createECDSAVerifer(bits) {
      var inner = createKeyVerifier(bits);
      return function verify(thing, signature, publicKey) {
        signature = formatEcdsa.joseToDer(signature, "ES" + bits).toString("base64");
        var result = inner(thing, signature, publicKey);
        return result;
      };
    }
    function createNoneSigner() {
      return function sign() {
        return "";
      };
    }
    function createNoneVerifier() {
      return function verify(thing, signature) {
        return signature === "";
      };
    }
    module2.exports = function jwa(algorithm) {
      var signerFactories = {
        hs: createHmacSigner,
        rs: createKeySigner,
        ps: createPSSKeySigner,
        es: createECDSASigner,
        none: createNoneSigner
      };
      var verifierFactories = {
        hs: createHmacVerifier,
        rs: createKeyVerifier,
        ps: createPSSKeyVerifier,
        es: createECDSAVerifer,
        none: createNoneVerifier
      };
      var match = algorithm.match(/^(RS|PS|ES|HS)(256|384|512)$|^(none)$/);
      if (!match)
        throw typeError(MSG_INVALID_ALGORITHM, algorithm);
      var algo = (match[1] || match[3]).toLowerCase();
      var bits = match[2];
      return {
        sign: signerFactories[algo](bits),
        verify: verifierFactories[algo](bits)
      };
    };
  }
});

// netlify/functions/node_modules/jws/lib/tostring.js
var require_tostring = __commonJS({
  "netlify/functions/node_modules/jws/lib/tostring.js"(exports2, module2) {
    var Buffer2 = require("buffer").Buffer;
    module2.exports = function toString(obj) {
      if (typeof obj === "string")
        return obj;
      if (typeof obj === "number" || Buffer2.isBuffer(obj))
        return obj.toString();
      return JSON.stringify(obj);
    };
  }
});

// netlify/functions/node_modules/jws/lib/sign-stream.js
var require_sign_stream = __commonJS({
  "netlify/functions/node_modules/jws/lib/sign-stream.js"(exports2, module2) {
    var Buffer2 = require_safe_buffer().Buffer;
    var DataStream = require_data_stream();
    var jwa = require_jwa();
    var Stream = require("stream");
    var toString = require_tostring();
    var util = require("util");
    function base64url(string, encoding) {
      return Buffer2.from(string, encoding).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }
    function jwsSecuredInput(header, payload, encoding) {
      encoding = encoding || "utf8";
      var encodedHeader = base64url(toString(header), "binary");
      var encodedPayload = base64url(toString(payload), encoding);
      return util.format("%s.%s", encodedHeader, encodedPayload);
    }
    function jwsSign(opts) {
      var header = opts.header;
      var payload = opts.payload;
      var secretOrKey = opts.secret || opts.privateKey;
      var encoding = opts.encoding;
      var algo = jwa(header.alg);
      var securedInput = jwsSecuredInput(header, payload, encoding);
      var signature = algo.sign(securedInput, secretOrKey);
      return util.format("%s.%s", securedInput, signature);
    }
    function SignStream(opts) {
      var secret = opts.secret;
      secret = secret == null ? opts.privateKey : secret;
      secret = secret == null ? opts.key : secret;
      if (/^hs/i.test(opts.header.alg) === true && secret == null) {
        throw new TypeError("secret must be a string or buffer or a KeyObject");
      }
      var secretStream = new DataStream(secret);
      this.readable = true;
      this.header = opts.header;
      this.encoding = opts.encoding;
      this.secret = this.privateKey = this.key = secretStream;
      this.payload = new DataStream(opts.payload);
      this.secret.once("close", function() {
        if (!this.payload.writable && this.readable)
          this.sign();
      }.bind(this));
      this.payload.once("close", function() {
        if (!this.secret.writable && this.readable)
          this.sign();
      }.bind(this));
    }
    util.inherits(SignStream, Stream);
    SignStream.prototype.sign = function sign() {
      try {
        var signature = jwsSign({
          header: this.header,
          payload: this.payload.buffer,
          secret: this.secret.buffer,
          encoding: this.encoding
        });
        this.emit("done", signature);
        this.emit("data", signature);
        this.emit("end");
        this.readable = false;
        return signature;
      } catch (e) {
        this.readable = false;
        this.emit("error", e);
        this.emit("close");
      }
    };
    SignStream.sign = jwsSign;
    module2.exports = SignStream;
  }
});

// netlify/functions/node_modules/jws/lib/verify-stream.js
var require_verify_stream = __commonJS({
  "netlify/functions/node_modules/jws/lib/verify-stream.js"(exports2, module2) {
    var Buffer2 = require_safe_buffer().Buffer;
    var DataStream = require_data_stream();
    var jwa = require_jwa();
    var Stream = require("stream");
    var toString = require_tostring();
    var util = require("util");
    var JWS_REGEX = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;
    function isObject(thing) {
      return Object.prototype.toString.call(thing) === "[object Object]";
    }
    function safeJsonParse(thing) {
      if (isObject(thing))
        return thing;
      try {
        return JSON.parse(thing);
      } catch (e) {
        return void 0;
      }
    }
    function headerFromJWS(jwsSig) {
      var encodedHeader = jwsSig.split(".", 1)[0];
      return safeJsonParse(Buffer2.from(encodedHeader, "base64").toString("binary"));
    }
    function securedInputFromJWS(jwsSig) {
      return jwsSig.split(".", 2).join(".");
    }
    function signatureFromJWS(jwsSig) {
      return jwsSig.split(".")[2];
    }
    function payloadFromJWS(jwsSig, encoding) {
      encoding = encoding || "utf8";
      var payload = jwsSig.split(".")[1];
      return Buffer2.from(payload, "base64").toString(encoding);
    }
    function isValidJws(string) {
      return JWS_REGEX.test(string) && !!headerFromJWS(string);
    }
    function jwsVerify(jwsSig, algorithm, secretOrKey) {
      if (!algorithm) {
        var err = new Error("Missing algorithm parameter for jws.verify");
        err.code = "MISSING_ALGORITHM";
        throw err;
      }
      jwsSig = toString(jwsSig);
      var signature = signatureFromJWS(jwsSig);
      var securedInput = securedInputFromJWS(jwsSig);
      var algo = jwa(algorithm);
      return algo.verify(securedInput, signature, secretOrKey);
    }
    function jwsDecode(jwsSig, opts) {
      opts = opts || {};
      jwsSig = toString(jwsSig);
      if (!isValidJws(jwsSig))
        return null;
      var header = headerFromJWS(jwsSig);
      if (!header)
        return null;
      var payload = payloadFromJWS(jwsSig);
      if (header.typ === "JWT" || opts.json)
        payload = JSON.parse(payload, opts.encoding);
      return {
        header,
        payload,
        signature: signatureFromJWS(jwsSig)
      };
    }
    function VerifyStream(opts) {
      opts = opts || {};
      var secretOrKey = opts.secret;
      secretOrKey = secretOrKey == null ? opts.publicKey : secretOrKey;
      secretOrKey = secretOrKey == null ? opts.key : secretOrKey;
      if (/^hs/i.test(opts.algorithm) === true && secretOrKey == null) {
        throw new TypeError("secret must be a string or buffer or a KeyObject");
      }
      var secretStream = new DataStream(secretOrKey);
      this.readable = true;
      this.algorithm = opts.algorithm;
      this.encoding = opts.encoding;
      this.secret = this.publicKey = this.key = secretStream;
      this.signature = new DataStream(opts.signature);
      this.secret.once("close", function() {
        if (!this.signature.writable && this.readable)
          this.verify();
      }.bind(this));
      this.signature.once("close", function() {
        if (!this.secret.writable && this.readable)
          this.verify();
      }.bind(this));
    }
    util.inherits(VerifyStream, Stream);
    VerifyStream.prototype.verify = function verify() {
      try {
        var valid = jwsVerify(this.signature.buffer, this.algorithm, this.key.buffer);
        var obj = jwsDecode(this.signature.buffer, this.encoding);
        this.emit("done", valid, obj);
        this.emit("data", valid);
        this.emit("end");
        this.readable = false;
        return valid;
      } catch (e) {
        this.readable = false;
        this.emit("error", e);
        this.emit("close");
      }
    };
    VerifyStream.decode = jwsDecode;
    VerifyStream.isValid = isValidJws;
    VerifyStream.verify = jwsVerify;
    module2.exports = VerifyStream;
  }
});

// netlify/functions/node_modules/jws/index.js
var require_jws = __commonJS({
  "netlify/functions/node_modules/jws/index.js"(exports2) {
    var SignStream = require_sign_stream();
    var VerifyStream = require_verify_stream();
    var ALGORITHMS = [
      "HS256",
      "HS384",
      "HS512",
      "RS256",
      "RS384",
      "RS512",
      "PS256",
      "PS384",
      "PS512",
      "ES256",
      "ES384",
      "ES512"
    ];
    exports2.ALGORITHMS = ALGORITHMS;
    exports2.sign = SignStream.sign;
    exports2.verify = VerifyStream.verify;
    exports2.decode = VerifyStream.decode;
    exports2.isValid = VerifyStream.isValid;
    exports2.createSign = function createSign(opts) {
      return new SignStream(opts);
    };
    exports2.createVerify = function createVerify(opts) {
      return new VerifyStream(opts);
    };
  }
});

// netlify/functions/node_modules/jsonwebtoken/decode.js
var require_decode = __commonJS({
  "netlify/functions/node_modules/jsonwebtoken/decode.js"(exports2, module2) {
    var jws = require_jws();
    module2.exports = function(jwt, options) {
      options = options || {};
      var decoded = jws.decode(jwt, options);
      if (!decoded) {
        return null;
      }
      var payload = decoded.payload;
      if (typeof payload === "string") {
        try {
          var obj = JSON.parse(payload);
          if (obj !== null && typeof obj === "object") {
            payload = obj;
          }
        } catch (e) {
        }
      }
      if (options.complete === true) {
        return {
          header: decoded.header,
          payload,
          signature: decoded.signature
        };
      }
      return payload;
    };
  }
});

// netlify/functions/node_modules/jsonwebtoken/lib/JsonWebTokenError.js
var require_JsonWebTokenError = __commonJS({
  "netlify/functions/node_modules/jsonwebtoken/lib/JsonWebTokenError.js"(exports2, module2) {
    var JsonWebTokenError = function(message, error) {
      Error.call(this, message);
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
      this.name = "JsonWebTokenError";
      this.message = message;
      if (error)
        this.inner = error;
    };
    JsonWebTokenError.prototype = Object.create(Error.prototype);
    JsonWebTokenError.prototype.constructor = JsonWebTokenError;
    module2.exports = JsonWebTokenError;
  }
});

// netlify/functions/node_modules/jsonwebtoken/lib/NotBeforeError.js
var require_NotBeforeError = __commonJS({
  "netlify/functions/node_modules/jsonwebtoken/lib/NotBeforeError.js"(exports2, module2) {
    var JsonWebTokenError = require_JsonWebTokenError();
    var NotBeforeError = function(message, date) {
      JsonWebTokenError.call(this, message);
      this.name = "NotBeforeError";
      this.date = date;
    };
    NotBeforeError.prototype = Object.create(JsonWebTokenError.prototype);
    NotBeforeError.prototype.constructor = NotBeforeError;
    module2.exports = NotBeforeError;
  }
});

// netlify/functions/node_modules/jsonwebtoken/lib/TokenExpiredError.js
var require_TokenExpiredError = __commonJS({
  "netlify/functions/node_modules/jsonwebtoken/lib/TokenExpiredError.js"(exports2, module2) {
    var JsonWebTokenError = require_JsonWebTokenError();
    var TokenExpiredError = function(message, expiredAt) {
      JsonWebTokenError.call(this, message);
      this.name = "TokenExpiredError";
      this.expiredAt = expiredAt;
    };
    TokenExpiredError.prototype = Object.create(JsonWebTokenError.prototype);
    TokenExpiredError.prototype.constructor = TokenExpiredError;
    module2.exports = TokenExpiredError;
  }
});

// netlify/functions/node_modules/ms/index.js
var require_ms = __commonJS({
  "netlify/functions/node_modules/ms/index.js"(exports2, module2) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module2.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse2(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse2(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// netlify/functions/node_modules/jsonwebtoken/lib/timespan.js
var require_timespan = __commonJS({
  "netlify/functions/node_modules/jsonwebtoken/lib/timespan.js"(exports2, module2) {
    var ms = require_ms();
    module2.exports = function(time, iat) {
      var timestamp = iat || Math.floor(Date.now() / 1e3);
      if (typeof time === "string") {
        var milliseconds = ms(time);
        if (typeof milliseconds === "undefined") {
          return;
        }
        return Math.floor(timestamp + milliseconds / 1e3);
      } else if (typeof time === "number") {
        return timestamp + time;
      } else {
        return;
      }
    };
  }
});

// netlify/functions/node_modules/semver/internal/constants.js
var require_constants = __commonJS({
  "netlify/functions/node_modules/semver/internal/constants.js"(exports2, module2) {
    "use strict";
    var SEMVER_SPEC_VERSION = "2.0.0";
    var MAX_LENGTH = 256;
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
    9007199254740991;
    var MAX_SAFE_COMPONENT_LENGTH = 16;
    var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
    var RELEASE_TYPES = [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ];
    module2.exports = {
      MAX_LENGTH,
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_SAFE_INTEGER,
      RELEASE_TYPES,
      SEMVER_SPEC_VERSION,
      FLAG_INCLUDE_PRERELEASE: 1,
      FLAG_LOOSE: 2
    };
  }
});

// netlify/functions/node_modules/semver/internal/debug.js
var require_debug = __commonJS({
  "netlify/functions/node_modules/semver/internal/debug.js"(exports2, module2) {
    "use strict";
    var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
    };
    module2.exports = debug;
  }
});

// netlify/functions/node_modules/semver/internal/re.js
var require_re = __commonJS({
  "netlify/functions/node_modules/semver/internal/re.js"(exports2, module2) {
    "use strict";
    var {
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_LENGTH
    } = require_constants();
    var debug = require_debug();
    exports2 = module2.exports = {};
    var re = exports2.re = [];
    var safeRe = exports2.safeRe = [];
    var src = exports2.src = [];
    var safeSrc = exports2.safeSrc = [];
    var t = exports2.t = {};
    var R = 0;
    var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
    var safeRegexReplacements = [
      ["\\s", 1],
      ["\\d", MAX_LENGTH],
      [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
    ];
    var makeSafeRegex = (value) => {
      for (const [token, max] of safeRegexReplacements) {
        value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
      }
      return value;
    };
    var createToken = (name, value, isGlobal) => {
      const safe = makeSafeRegex(value);
      const index = R++;
      debug(name, index, value);
      t[name] = index;
      src[index] = value;
      safeSrc[index] = safe;
      re[index] = new RegExp(value, isGlobal ? "g" : void 0);
      safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
    };
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
    createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
    createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
    createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIER]})`);
    createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
    createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
    createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
    createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
    createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
    createToken("FULL", `^${src[t.FULLPLAIN]}$`);
    createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
    createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
    createToken("GTLT", "((?:<|>)?=?)");
    createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
    createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
    createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COERCEPLAIN", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
    createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
    createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?(?:${src[t.BUILD]})?(?:$|[^\\d])`);
    createToken("COERCERTL", src[t.COERCE], true);
    createToken("COERCERTLFULL", src[t.COERCEFULL], true);
    createToken("LONETILDE", "(?:~>?)");
    createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
    exports2.tildeTrimReplace = "$1~";
    createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
    createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("LONECARET", "(?:\\^)");
    createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
    exports2.caretTrimReplace = "$1^";
    createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
    createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
    createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
    createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
    exports2.comparatorTrimReplace = "$1$2$3";
    createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
    createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
    createToken("STAR", "(<|>)?=?\\s*\\*");
    createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }
});

// netlify/functions/node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS({
  "netlify/functions/node_modules/semver/internal/parse-options.js"(exports2, module2) {
    "use strict";
    var looseOption = Object.freeze({ loose: true });
    var emptyOpts = Object.freeze({});
    var parseOptions = (options) => {
      if (!options) {
        return emptyOpts;
      }
      if (typeof options !== "object") {
        return looseOption;
      }
      return options;
    };
    module2.exports = parseOptions;
  }
});

// netlify/functions/node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS({
  "netlify/functions/node_modules/semver/internal/identifiers.js"(exports2, module2) {
    "use strict";
    var numeric = /^[0-9]+$/;
    var compareIdentifiers = (a, b) => {
      if (typeof a === "number" && typeof b === "number") {
        return a === b ? 0 : a < b ? -1 : 1;
      }
      const anum = numeric.test(a);
      const bnum = numeric.test(b);
      if (anum && bnum) {
        a = +a;
        b = +b;
      }
      return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
    };
    var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
    module2.exports = {
      compareIdentifiers,
      rcompareIdentifiers
    };
  }
});

// netlify/functions/node_modules/semver/classes/semver.js
var require_semver = __commonJS({
  "netlify/functions/node_modules/semver/classes/semver.js"(exports2, module2) {
    "use strict";
    var debug = require_debug();
    var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
    var { safeRe: re, t } = require_re();
    var parseOptions = require_parse_options();
    var { compareIdentifiers } = require_identifiers();
    var SemVer = class _SemVer {
      constructor(version2, options) {
        options = parseOptions(options);
        if (version2 instanceof _SemVer) {
          if (version2.loose === !!options.loose && version2.includePrerelease === !!options.includePrerelease) {
            return version2;
          } else {
            version2 = version2.version;
          }
        } else if (typeof version2 !== "string") {
          throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version2}".`);
        }
        if (version2.length > MAX_LENGTH) {
          throw new TypeError(
            `version is longer than ${MAX_LENGTH} characters`
          );
        }
        debug("SemVer", version2, options);
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        const m = version2.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
        if (!m) {
          throw new TypeError(`Invalid Version: ${version2}`);
        }
        this.raw = version2;
        this.major = +m[1];
        this.minor = +m[2];
        this.patch = +m[3];
        if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
          throw new TypeError("Invalid major version");
        }
        if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
          throw new TypeError("Invalid minor version");
        }
        if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
          throw new TypeError("Invalid patch version");
        }
        if (!m[4]) {
          this.prerelease = [];
        } else {
          this.prerelease = m[4].split(".").map((id) => {
            if (/^[0-9]+$/.test(id)) {
              const num = +id;
              if (num >= 0 && num < MAX_SAFE_INTEGER) {
                return num;
              }
            }
            return id;
          });
        }
        this.build = m[5] ? m[5].split(".") : [];
        this.format();
      }
      format() {
        this.version = `${this.major}.${this.minor}.${this.patch}`;
        if (this.prerelease.length) {
          this.version += `-${this.prerelease.join(".")}`;
        }
        return this.version;
      }
      toString() {
        return this.version;
      }
      compare(other) {
        debug("SemVer.compare", this.version, this.options, other);
        if (!(other instanceof _SemVer)) {
          if (typeof other === "string" && other === this.version) {
            return 0;
          }
          other = new _SemVer(other, this.options);
        }
        if (other.version === this.version) {
          return 0;
        }
        return this.compareMain(other) || this.comparePre(other);
      }
      compareMain(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.major < other.major) {
          return -1;
        }
        if (this.major > other.major) {
          return 1;
        }
        if (this.minor < other.minor) {
          return -1;
        }
        if (this.minor > other.minor) {
          return 1;
        }
        if (this.patch < other.patch) {
          return -1;
        }
        if (this.patch > other.patch) {
          return 1;
        }
        return 0;
      }
      comparePre(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.prerelease.length && !other.prerelease.length) {
          return -1;
        } else if (!this.prerelease.length && other.prerelease.length) {
          return 1;
        } else if (!this.prerelease.length && !other.prerelease.length) {
          return 0;
        }
        let i = 0;
        do {
          const a = this.prerelease[i];
          const b = other.prerelease[i];
          debug("prerelease compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      compareBuild(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        let i = 0;
        do {
          const a = this.build[i];
          const b = other.build[i];
          debug("build compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      // preminor will bump the version up to the next minor release, and immediately
      // down to pre-release. premajor and prepatch work the same way.
      inc(release, identifier, identifierBase) {
        if (release.startsWith("pre")) {
          if (!identifier && identifierBase === false) {
            throw new Error("invalid increment argument: identifier is empty");
          }
          if (identifier) {
            const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
            if (!match || match[1] !== identifier) {
              throw new Error(`invalid identifier: ${identifier}`);
            }
          }
        }
        switch (release) {
          case "premajor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor = 0;
            this.major++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "preminor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "prepatch":
            this.prerelease.length = 0;
            this.inc("patch", identifier, identifierBase);
            this.inc("pre", identifier, identifierBase);
            break;
          case "prerelease":
            if (this.prerelease.length === 0) {
              this.inc("patch", identifier, identifierBase);
            }
            this.inc("pre", identifier, identifierBase);
            break;
          case "release":
            if (this.prerelease.length === 0) {
              throw new Error(`version ${this.raw} is not a prerelease`);
            }
            this.prerelease.length = 0;
            break;
          case "major":
            if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
              this.major++;
            }
            this.minor = 0;
            this.patch = 0;
            this.prerelease = [];
            break;
          case "minor":
            if (this.patch !== 0 || this.prerelease.length === 0) {
              this.minor++;
            }
            this.patch = 0;
            this.prerelease = [];
            break;
          case "patch":
            if (this.prerelease.length === 0) {
              this.patch++;
            }
            this.prerelease = [];
            break;
          case "pre": {
            const base = Number(identifierBase) ? 1 : 0;
            if (this.prerelease.length === 0) {
              this.prerelease = [base];
            } else {
              let i = this.prerelease.length;
              while (--i >= 0) {
                if (typeof this.prerelease[i] === "number") {
                  this.prerelease[i]++;
                  i = -2;
                }
              }
              if (i === -1) {
                if (identifier === this.prerelease.join(".") && identifierBase === false) {
                  throw new Error("invalid increment argument: identifier already exists");
                }
                this.prerelease.push(base);
              }
            }
            if (identifier) {
              let prerelease = [identifier, base];
              if (identifierBase === false) {
                prerelease = [identifier];
              }
              if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
                if (isNaN(this.prerelease[1])) {
                  this.prerelease = prerelease;
                }
              } else {
                this.prerelease = prerelease;
              }
            }
            break;
          }
          default:
            throw new Error(`invalid increment argument: ${release}`);
        }
        this.raw = this.format();
        if (this.build.length) {
          this.raw += `+${this.build.join(".")}`;
        }
        return this;
      }
    };
    module2.exports = SemVer;
  }
});

// netlify/functions/node_modules/semver/functions/parse.js
var require_parse = __commonJS({
  "netlify/functions/node_modules/semver/functions/parse.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var parse2 = (version2, options, throwErrors = false) => {
      if (version2 instanceof SemVer) {
        return version2;
      }
      try {
        return new SemVer(version2, options);
      } catch (er) {
        if (!throwErrors) {
          return null;
        }
        throw er;
      }
    };
    module2.exports = parse2;
  }
});

// netlify/functions/node_modules/semver/functions/valid.js
var require_valid = __commonJS({
  "netlify/functions/node_modules/semver/functions/valid.js"(exports2, module2) {
    "use strict";
    var parse2 = require_parse();
    var valid = (version2, options) => {
      const v = parse2(version2, options);
      return v ? v.version : null;
    };
    module2.exports = valid;
  }
});

// netlify/functions/node_modules/semver/functions/clean.js
var require_clean = __commonJS({
  "netlify/functions/node_modules/semver/functions/clean.js"(exports2, module2) {
    "use strict";
    var parse2 = require_parse();
    var clean = (version2, options) => {
      const s = parse2(version2.trim().replace(/^[=v]+/, ""), options);
      return s ? s.version : null;
    };
    module2.exports = clean;
  }
});

// netlify/functions/node_modules/semver/functions/inc.js
var require_inc = __commonJS({
  "netlify/functions/node_modules/semver/functions/inc.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var inc = (version2, release, options, identifier, identifierBase) => {
      if (typeof options === "string") {
        identifierBase = identifier;
        identifier = options;
        options = void 0;
      }
      try {
        return new SemVer(
          version2 instanceof SemVer ? version2.version : version2,
          options
        ).inc(release, identifier, identifierBase).version;
      } catch (er) {
        return null;
      }
    };
    module2.exports = inc;
  }
});

// netlify/functions/node_modules/semver/functions/diff.js
var require_diff = __commonJS({
  "netlify/functions/node_modules/semver/functions/diff.js"(exports2, module2) {
    "use strict";
    var parse2 = require_parse();
    var diff = (version1, version2) => {
      const v12 = parse2(version1, null, true);
      const v2 = parse2(version2, null, true);
      const comparison = v12.compare(v2);
      if (comparison === 0) {
        return null;
      }
      const v1Higher = comparison > 0;
      const highVersion = v1Higher ? v12 : v2;
      const lowVersion = v1Higher ? v2 : v12;
      const highHasPre = !!highVersion.prerelease.length;
      const lowHasPre = !!lowVersion.prerelease.length;
      if (lowHasPre && !highHasPre) {
        if (!lowVersion.patch && !lowVersion.minor) {
          return "major";
        }
        if (lowVersion.compareMain(highVersion) === 0) {
          if (lowVersion.minor && !lowVersion.patch) {
            return "minor";
          }
          return "patch";
        }
      }
      const prefix = highHasPre ? "pre" : "";
      if (v12.major !== v2.major) {
        return prefix + "major";
      }
      if (v12.minor !== v2.minor) {
        return prefix + "minor";
      }
      if (v12.patch !== v2.patch) {
        return prefix + "patch";
      }
      return "prerelease";
    };
    module2.exports = diff;
  }
});

// netlify/functions/node_modules/semver/functions/major.js
var require_major = __commonJS({
  "netlify/functions/node_modules/semver/functions/major.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var major = (a, loose) => new SemVer(a, loose).major;
    module2.exports = major;
  }
});

// netlify/functions/node_modules/semver/functions/minor.js
var require_minor = __commonJS({
  "netlify/functions/node_modules/semver/functions/minor.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var minor = (a, loose) => new SemVer(a, loose).minor;
    module2.exports = minor;
  }
});

// netlify/functions/node_modules/semver/functions/patch.js
var require_patch = __commonJS({
  "netlify/functions/node_modules/semver/functions/patch.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var patch = (a, loose) => new SemVer(a, loose).patch;
    module2.exports = patch;
  }
});

// netlify/functions/node_modules/semver/functions/prerelease.js
var require_prerelease = __commonJS({
  "netlify/functions/node_modules/semver/functions/prerelease.js"(exports2, module2) {
    "use strict";
    var parse2 = require_parse();
    var prerelease = (version2, options) => {
      const parsed = parse2(version2, options);
      return parsed && parsed.prerelease.length ? parsed.prerelease : null;
    };
    module2.exports = prerelease;
  }
});

// netlify/functions/node_modules/semver/functions/compare.js
var require_compare = __commonJS({
  "netlify/functions/node_modules/semver/functions/compare.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
    module2.exports = compare;
  }
});

// netlify/functions/node_modules/semver/functions/rcompare.js
var require_rcompare = __commonJS({
  "netlify/functions/node_modules/semver/functions/rcompare.js"(exports2, module2) {
    "use strict";
    var compare = require_compare();
    var rcompare = (a, b, loose) => compare(b, a, loose);
    module2.exports = rcompare;
  }
});

// netlify/functions/node_modules/semver/functions/compare-loose.js
var require_compare_loose = __commonJS({
  "netlify/functions/node_modules/semver/functions/compare-loose.js"(exports2, module2) {
    "use strict";
    var compare = require_compare();
    var compareLoose = (a, b) => compare(a, b, true);
    module2.exports = compareLoose;
  }
});

// netlify/functions/node_modules/semver/functions/compare-build.js
var require_compare_build = __commonJS({
  "netlify/functions/node_modules/semver/functions/compare-build.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var compareBuild = (a, b, loose) => {
      const versionA = new SemVer(a, loose);
      const versionB = new SemVer(b, loose);
      return versionA.compare(versionB) || versionA.compareBuild(versionB);
    };
    module2.exports = compareBuild;
  }
});

// netlify/functions/node_modules/semver/functions/sort.js
var require_sort = __commonJS({
  "netlify/functions/node_modules/semver/functions/sort.js"(exports2, module2) {
    "use strict";
    var compareBuild = require_compare_build();
    var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
    module2.exports = sort;
  }
});

// netlify/functions/node_modules/semver/functions/rsort.js
var require_rsort = __commonJS({
  "netlify/functions/node_modules/semver/functions/rsort.js"(exports2, module2) {
    "use strict";
    var compareBuild = require_compare_build();
    var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
    module2.exports = rsort;
  }
});

// netlify/functions/node_modules/semver/functions/gt.js
var require_gt = __commonJS({
  "netlify/functions/node_modules/semver/functions/gt.js"(exports2, module2) {
    "use strict";
    var compare = require_compare();
    var gt = (a, b, loose) => compare(a, b, loose) > 0;
    module2.exports = gt;
  }
});

// netlify/functions/node_modules/semver/functions/lt.js
var require_lt = __commonJS({
  "netlify/functions/node_modules/semver/functions/lt.js"(exports2, module2) {
    "use strict";
    var compare = require_compare();
    var lt = (a, b, loose) => compare(a, b, loose) < 0;
    module2.exports = lt;
  }
});

// netlify/functions/node_modules/semver/functions/eq.js
var require_eq = __commonJS({
  "netlify/functions/node_modules/semver/functions/eq.js"(exports2, module2) {
    "use strict";
    var compare = require_compare();
    var eq = (a, b, loose) => compare(a, b, loose) === 0;
    module2.exports = eq;
  }
});

// netlify/functions/node_modules/semver/functions/neq.js
var require_neq = __commonJS({
  "netlify/functions/node_modules/semver/functions/neq.js"(exports2, module2) {
    "use strict";
    var compare = require_compare();
    var neq = (a, b, loose) => compare(a, b, loose) !== 0;
    module2.exports = neq;
  }
});

// netlify/functions/node_modules/semver/functions/gte.js
var require_gte = __commonJS({
  "netlify/functions/node_modules/semver/functions/gte.js"(exports2, module2) {
    "use strict";
    var compare = require_compare();
    var gte = (a, b, loose) => compare(a, b, loose) >= 0;
    module2.exports = gte;
  }
});

// netlify/functions/node_modules/semver/functions/lte.js
var require_lte = __commonJS({
  "netlify/functions/node_modules/semver/functions/lte.js"(exports2, module2) {
    "use strict";
    var compare = require_compare();
    var lte = (a, b, loose) => compare(a, b, loose) <= 0;
    module2.exports = lte;
  }
});

// netlify/functions/node_modules/semver/functions/cmp.js
var require_cmp = __commonJS({
  "netlify/functions/node_modules/semver/functions/cmp.js"(exports2, module2) {
    "use strict";
    var eq = require_eq();
    var neq = require_neq();
    var gt = require_gt();
    var gte = require_gte();
    var lt = require_lt();
    var lte = require_lte();
    var cmp = (a, op, b, loose) => {
      switch (op) {
        case "===":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a === b;
        case "!==":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a !== b;
        case "":
        case "=":
        case "==":
          return eq(a, b, loose);
        case "!=":
          return neq(a, b, loose);
        case ">":
          return gt(a, b, loose);
        case ">=":
          return gte(a, b, loose);
        case "<":
          return lt(a, b, loose);
        case "<=":
          return lte(a, b, loose);
        default:
          throw new TypeError(`Invalid operator: ${op}`);
      }
    };
    module2.exports = cmp;
  }
});

// netlify/functions/node_modules/semver/functions/coerce.js
var require_coerce = __commonJS({
  "netlify/functions/node_modules/semver/functions/coerce.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var parse2 = require_parse();
    var { safeRe: re, t } = require_re();
    var coerce = (version2, options) => {
      if (version2 instanceof SemVer) {
        return version2;
      }
      if (typeof version2 === "number") {
        version2 = String(version2);
      }
      if (typeof version2 !== "string") {
        return null;
      }
      options = options || {};
      let match = null;
      if (!options.rtl) {
        match = version2.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
      } else {
        const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
        let next;
        while ((next = coerceRtlRegex.exec(version2)) && (!match || match.index + match[0].length !== version2.length)) {
          if (!match || next.index + next[0].length !== match.index + match[0].length) {
            match = next;
          }
          coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
        }
        coerceRtlRegex.lastIndex = -1;
      }
      if (match === null) {
        return null;
      }
      const major = match[2];
      const minor = match[3] || "0";
      const patch = match[4] || "0";
      const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : "";
      const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
      return parse2(`${major}.${minor}.${patch}${prerelease}${build}`, options);
    };
    module2.exports = coerce;
  }
});

// netlify/functions/node_modules/semver/internal/lrucache.js
var require_lrucache = __commonJS({
  "netlify/functions/node_modules/semver/internal/lrucache.js"(exports2, module2) {
    "use strict";
    var LRUCache = class {
      constructor() {
        this.max = 1e3;
        this.map = /* @__PURE__ */ new Map();
      }
      get(key) {
        const value = this.map.get(key);
        if (value === void 0) {
          return void 0;
        } else {
          this.map.delete(key);
          this.map.set(key, value);
          return value;
        }
      }
      delete(key) {
        return this.map.delete(key);
      }
      set(key, value) {
        const deleted = this.delete(key);
        if (!deleted && value !== void 0) {
          if (this.map.size >= this.max) {
            const firstKey = this.map.keys().next().value;
            this.delete(firstKey);
          }
          this.map.set(key, value);
        }
        return this;
      }
    };
    module2.exports = LRUCache;
  }
});

// netlify/functions/node_modules/semver/classes/range.js
var require_range = __commonJS({
  "netlify/functions/node_modules/semver/classes/range.js"(exports2, module2) {
    "use strict";
    var SPACE_CHARACTERS = /\s+/g;
    var Range = class _Range {
      constructor(range, options) {
        options = parseOptions(options);
        if (range instanceof _Range) {
          if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
            return range;
          } else {
            return new _Range(range.raw, options);
          }
        }
        if (range instanceof Comparator) {
          this.raw = range.value;
          this.set = [[range]];
          this.formatted = void 0;
          return this;
        }
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        this.raw = range.trim().replace(SPACE_CHARACTERS, " ");
        this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
        if (!this.set.length) {
          throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
        }
        if (this.set.length > 1) {
          const first = this.set[0];
          this.set = this.set.filter((c) => !isNullSet(c[0]));
          if (this.set.length === 0) {
            this.set = [first];
          } else if (this.set.length > 1) {
            for (const c of this.set) {
              if (c.length === 1 && isAny(c[0])) {
                this.set = [c];
                break;
              }
            }
          }
        }
        this.formatted = void 0;
      }
      get range() {
        if (this.formatted === void 0) {
          this.formatted = "";
          for (let i = 0; i < this.set.length; i++) {
            if (i > 0) {
              this.formatted += "||";
            }
            const comps = this.set[i];
            for (let k = 0; k < comps.length; k++) {
              if (k > 0) {
                this.formatted += " ";
              }
              this.formatted += comps[k].toString().trim();
            }
          }
        }
        return this.formatted;
      }
      format() {
        return this.range;
      }
      toString() {
        return this.range;
      }
      parseRange(range) {
        const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
        const memoKey = memoOpts + ":" + range;
        const cached = cache.get(memoKey);
        if (cached) {
          return cached;
        }
        const loose = this.options.loose;
        const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
        range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
        debug("hyphen replace", range);
        range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
        debug("comparator trim", range);
        range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
        debug("tilde trim", range);
        range = range.replace(re[t.CARETTRIM], caretTrimReplace);
        debug("caret trim", range);
        let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
        if (loose) {
          rangeList = rangeList.filter((comp) => {
            debug("loose invalid filter", comp, this.options);
            return !!comp.match(re[t.COMPARATORLOOSE]);
          });
        }
        debug("range list", rangeList);
        const rangeMap = /* @__PURE__ */ new Map();
        const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
        for (const comp of comparators) {
          if (isNullSet(comp)) {
            return [comp];
          }
          rangeMap.set(comp.value, comp);
        }
        if (rangeMap.size > 1 && rangeMap.has("")) {
          rangeMap.delete("");
        }
        const result = [...rangeMap.values()];
        cache.set(memoKey, result);
        return result;
      }
      intersects(range, options) {
        if (!(range instanceof _Range)) {
          throw new TypeError("a Range is required");
        }
        return this.set.some((thisComparators) => {
          return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
            return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options);
              });
            });
          });
        });
      }
      // if ANY of the sets match ALL of its comparators, then pass
      test(version2) {
        if (!version2) {
          return false;
        }
        if (typeof version2 === "string") {
          try {
            version2 = new SemVer(version2, this.options);
          } catch (er) {
            return false;
          }
        }
        for (let i = 0; i < this.set.length; i++) {
          if (testSet(this.set[i], version2, this.options)) {
            return true;
          }
        }
        return false;
      }
    };
    module2.exports = Range;
    var LRU = require_lrucache();
    var cache = new LRU();
    var parseOptions = require_parse_options();
    var Comparator = require_comparator();
    var debug = require_debug();
    var SemVer = require_semver();
    var {
      safeRe: re,
      t,
      comparatorTrimReplace,
      tildeTrimReplace,
      caretTrimReplace
    } = require_re();
    var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
    var isNullSet = (c) => c.value === "<0.0.0-0";
    var isAny = (c) => c.value === "";
    var isSatisfiable = (comparators, options) => {
      let result = true;
      const remainingComparators = comparators.slice();
      let testComparator = remainingComparators.pop();
      while (result && remainingComparators.length) {
        result = remainingComparators.every((otherComparator) => {
          return testComparator.intersects(otherComparator, options);
        });
        testComparator = remainingComparators.pop();
      }
      return result;
    };
    var parseComparator = (comp, options) => {
      comp = comp.replace(re[t.BUILD], "");
      debug("comp", comp, options);
      comp = replaceCarets(comp, options);
      debug("caret", comp);
      comp = replaceTildes(comp, options);
      debug("tildes", comp);
      comp = replaceXRanges(comp, options);
      debug("xrange", comp);
      comp = replaceStars(comp, options);
      debug("stars", comp);
      return comp;
    };
    var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
    var replaceTildes = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
    };
    var replaceTilde = (comp, options) => {
      const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("tilde", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
        } else if (pr) {
          debug("replaceTilde pr", pr);
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
        }
        debug("tilde return", ret);
        return ret;
      });
    };
    var replaceCarets = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
    };
    var replaceCaret = (comp, options) => {
      debug("caret", comp, options);
      const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
      const z = options.includePrerelease ? "-0" : "";
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("caret", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          if (M === "0") {
            ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
          }
        } else if (pr) {
          debug("replaceCaret pr", pr);
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
          }
        } else {
          debug("no pr");
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
          }
        }
        debug("caret return", ret);
        return ret;
      });
    };
    var replaceXRanges = (comp, options) => {
      debug("replaceXRanges", comp, options);
      return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
    };
    var replaceXRange = (comp, options) => {
      comp = comp.trim();
      const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
      return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
        debug("xRange", comp, ret, gtlt, M, m, p, pr);
        const xM = isX(M);
        const xm = xM || isX(m);
        const xp = xm || isX(p);
        const anyX = xp;
        if (gtlt === "=" && anyX) {
          gtlt = "";
        }
        pr = options.includePrerelease ? "-0" : "";
        if (xM) {
          if (gtlt === ">" || gtlt === "<") {
            ret = "<0.0.0-0";
          } else {
            ret = "*";
          }
        } else if (gtlt && anyX) {
          if (xm) {
            m = 0;
          }
          p = 0;
          if (gtlt === ">") {
            gtlt = ">=";
            if (xm) {
              M = +M + 1;
              m = 0;
              p = 0;
            } else {
              m = +m + 1;
              p = 0;
            }
          } else if (gtlt === "<=") {
            gtlt = "<";
            if (xm) {
              M = +M + 1;
            } else {
              m = +m + 1;
            }
          }
          if (gtlt === "<") {
            pr = "-0";
          }
          ret = `${gtlt + M}.${m}.${p}${pr}`;
        } else if (xm) {
          ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
        } else if (xp) {
          ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
        }
        debug("xRange return", ret);
        return ret;
      });
    };
    var replaceStars = (comp, options) => {
      debug("replaceStars", comp, options);
      return comp.trim().replace(re[t.STAR], "");
    };
    var replaceGTE0 = (comp, options) => {
      debug("replaceGTE0", comp, options);
      return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
    };
    var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
      if (isX(fM)) {
        from = "";
      } else if (isX(fm)) {
        from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
      } else if (isX(fp)) {
        from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
      } else if (fpr) {
        from = `>=${from}`;
      } else {
        from = `>=${from}${incPr ? "-0" : ""}`;
      }
      if (isX(tM)) {
        to = "";
      } else if (isX(tm)) {
        to = `<${+tM + 1}.0.0-0`;
      } else if (isX(tp)) {
        to = `<${tM}.${+tm + 1}.0-0`;
      } else if (tpr) {
        to = `<=${tM}.${tm}.${tp}-${tpr}`;
      } else if (incPr) {
        to = `<${tM}.${tm}.${+tp + 1}-0`;
      } else {
        to = `<=${to}`;
      }
      return `${from} ${to}`.trim();
    };
    var testSet = (set, version2, options) => {
      for (let i = 0; i < set.length; i++) {
        if (!set[i].test(version2)) {
          return false;
        }
      }
      if (version2.prerelease.length && !options.includePrerelease) {
        for (let i = 0; i < set.length; i++) {
          debug(set[i].semver);
          if (set[i].semver === Comparator.ANY) {
            continue;
          }
          if (set[i].semver.prerelease.length > 0) {
            const allowed = set[i].semver;
            if (allowed.major === version2.major && allowed.minor === version2.minor && allowed.patch === version2.patch) {
              return true;
            }
          }
        }
        return false;
      }
      return true;
    };
  }
});

// netlify/functions/node_modules/semver/classes/comparator.js
var require_comparator = __commonJS({
  "netlify/functions/node_modules/semver/classes/comparator.js"(exports2, module2) {
    "use strict";
    var ANY = Symbol("SemVer ANY");
    var Comparator = class _Comparator {
      static get ANY() {
        return ANY;
      }
      constructor(comp, options) {
        options = parseOptions(options);
        if (comp instanceof _Comparator) {
          if (comp.loose === !!options.loose) {
            return comp;
          } else {
            comp = comp.value;
          }
        }
        comp = comp.trim().split(/\s+/).join(" ");
        debug("comparator", comp, options);
        this.options = options;
        this.loose = !!options.loose;
        this.parse(comp);
        if (this.semver === ANY) {
          this.value = "";
        } else {
          this.value = this.operator + this.semver.version;
        }
        debug("comp", this);
      }
      parse(comp) {
        const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
        const m = comp.match(r);
        if (!m) {
          throw new TypeError(`Invalid comparator: ${comp}`);
        }
        this.operator = m[1] !== void 0 ? m[1] : "";
        if (this.operator === "=") {
          this.operator = "";
        }
        if (!m[2]) {
          this.semver = ANY;
        } else {
          this.semver = new SemVer(m[2], this.options.loose);
        }
      }
      toString() {
        return this.value;
      }
      test(version2) {
        debug("Comparator.test", version2, this.options.loose);
        if (this.semver === ANY || version2 === ANY) {
          return true;
        }
        if (typeof version2 === "string") {
          try {
            version2 = new SemVer(version2, this.options);
          } catch (er) {
            return false;
          }
        }
        return cmp(version2, this.operator, this.semver, this.options);
      }
      intersects(comp, options) {
        if (!(comp instanceof _Comparator)) {
          throw new TypeError("a Comparator is required");
        }
        if (this.operator === "") {
          if (this.value === "") {
            return true;
          }
          return new Range(comp.value, options).test(this.value);
        } else if (comp.operator === "") {
          if (comp.value === "") {
            return true;
          }
          return new Range(this.value, options).test(comp.semver);
        }
        options = parseOptions(options);
        if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
          return false;
        }
        if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
          return false;
        }
        if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
          return true;
        }
        if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
          return true;
        }
        if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
          return true;
        }
        if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
          return true;
        }
        if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
          return true;
        }
        return false;
      }
    };
    module2.exports = Comparator;
    var parseOptions = require_parse_options();
    var { safeRe: re, t } = require_re();
    var cmp = require_cmp();
    var debug = require_debug();
    var SemVer = require_semver();
    var Range = require_range();
  }
});

// netlify/functions/node_modules/semver/functions/satisfies.js
var require_satisfies = __commonJS({
  "netlify/functions/node_modules/semver/functions/satisfies.js"(exports2, module2) {
    "use strict";
    var Range = require_range();
    var satisfies = (version2, range, options) => {
      try {
        range = new Range(range, options);
      } catch (er) {
        return false;
      }
      return range.test(version2);
    };
    module2.exports = satisfies;
  }
});

// netlify/functions/node_modules/semver/ranges/to-comparators.js
var require_to_comparators = __commonJS({
  "netlify/functions/node_modules/semver/ranges/to-comparators.js"(exports2, module2) {
    "use strict";
    var Range = require_range();
    var toComparators = (range, options) => new Range(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
    module2.exports = toComparators;
  }
});

// netlify/functions/node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = __commonJS({
  "netlify/functions/node_modules/semver/ranges/max-satisfying.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var Range = require_range();
    var maxSatisfying = (versions, range, options) => {
      let max = null;
      let maxSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!max || maxSV.compare(v) === -1) {
            max = v;
            maxSV = new SemVer(max, options);
          }
        }
      });
      return max;
    };
    module2.exports = maxSatisfying;
  }
});

// netlify/functions/node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = __commonJS({
  "netlify/functions/node_modules/semver/ranges/min-satisfying.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var Range = require_range();
    var minSatisfying = (versions, range, options) => {
      let min = null;
      let minSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!min || minSV.compare(v) === 1) {
            min = v;
            minSV = new SemVer(min, options);
          }
        }
      });
      return min;
    };
    module2.exports = minSatisfying;
  }
});

// netlify/functions/node_modules/semver/ranges/min-version.js
var require_min_version = __commonJS({
  "netlify/functions/node_modules/semver/ranges/min-version.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var Range = require_range();
    var gt = require_gt();
    var minVersion = (range, loose) => {
      range = new Range(range, loose);
      let minver = new SemVer("0.0.0");
      if (range.test(minver)) {
        return minver;
      }
      minver = new SemVer("0.0.0-0");
      if (range.test(minver)) {
        return minver;
      }
      minver = null;
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let setMin = null;
        comparators.forEach((comparator) => {
          const compver = new SemVer(comparator.semver.version);
          switch (comparator.operator) {
            case ">":
              if (compver.prerelease.length === 0) {
                compver.patch++;
              } else {
                compver.prerelease.push(0);
              }
              compver.raw = compver.format();
            case "":
            case ">=":
              if (!setMin || gt(compver, setMin)) {
                setMin = compver;
              }
              break;
            case "<":
            case "<=":
              break;
            default:
              throw new Error(`Unexpected operation: ${comparator.operator}`);
          }
        });
        if (setMin && (!minver || gt(minver, setMin))) {
          minver = setMin;
        }
      }
      if (minver && range.test(minver)) {
        return minver;
      }
      return null;
    };
    module2.exports = minVersion;
  }
});

// netlify/functions/node_modules/semver/ranges/valid.js
var require_valid2 = __commonJS({
  "netlify/functions/node_modules/semver/ranges/valid.js"(exports2, module2) {
    "use strict";
    var Range = require_range();
    var validRange = (range, options) => {
      try {
        return new Range(range, options).range || "*";
      } catch (er) {
        return null;
      }
    };
    module2.exports = validRange;
  }
});

// netlify/functions/node_modules/semver/ranges/outside.js
var require_outside = __commonJS({
  "netlify/functions/node_modules/semver/ranges/outside.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var Range = require_range();
    var satisfies = require_satisfies();
    var gt = require_gt();
    var lt = require_lt();
    var lte = require_lte();
    var gte = require_gte();
    var outside = (version2, range, hilo, options) => {
      version2 = new SemVer(version2, options);
      range = new Range(range, options);
      let gtfn, ltefn, ltfn, comp, ecomp;
      switch (hilo) {
        case ">":
          gtfn = gt;
          ltefn = lte;
          ltfn = lt;
          comp = ">";
          ecomp = ">=";
          break;
        case "<":
          gtfn = lt;
          ltefn = gte;
          ltfn = gt;
          comp = "<";
          ecomp = "<=";
          break;
        default:
          throw new TypeError('Must provide a hilo val of "<" or ">"');
      }
      if (satisfies(version2, range, options)) {
        return false;
      }
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let high = null;
        let low = null;
        comparators.forEach((comparator) => {
          if (comparator.semver === ANY) {
            comparator = new Comparator(">=0.0.0");
          }
          high = high || comparator;
          low = low || comparator;
          if (gtfn(comparator.semver, high.semver, options)) {
            high = comparator;
          } else if (ltfn(comparator.semver, low.semver, options)) {
            low = comparator;
          }
        });
        if (high.operator === comp || high.operator === ecomp) {
          return false;
        }
        if ((!low.operator || low.operator === comp) && ltefn(version2, low.semver)) {
          return false;
        } else if (low.operator === ecomp && ltfn(version2, low.semver)) {
          return false;
        }
      }
      return true;
    };
    module2.exports = outside;
  }
});

// netlify/functions/node_modules/semver/ranges/gtr.js
var require_gtr = __commonJS({
  "netlify/functions/node_modules/semver/ranges/gtr.js"(exports2, module2) {
    "use strict";
    var outside = require_outside();
    var gtr = (version2, range, options) => outside(version2, range, ">", options);
    module2.exports = gtr;
  }
});

// netlify/functions/node_modules/semver/ranges/ltr.js
var require_ltr = __commonJS({
  "netlify/functions/node_modules/semver/ranges/ltr.js"(exports2, module2) {
    "use strict";
    var outside = require_outside();
    var ltr = (version2, range, options) => outside(version2, range, "<", options);
    module2.exports = ltr;
  }
});

// netlify/functions/node_modules/semver/ranges/intersects.js
var require_intersects = __commonJS({
  "netlify/functions/node_modules/semver/ranges/intersects.js"(exports2, module2) {
    "use strict";
    var Range = require_range();
    var intersects = (r1, r2, options) => {
      r1 = new Range(r1, options);
      r2 = new Range(r2, options);
      return r1.intersects(r2, options);
    };
    module2.exports = intersects;
  }
});

// netlify/functions/node_modules/semver/ranges/simplify.js
var require_simplify = __commonJS({
  "netlify/functions/node_modules/semver/ranges/simplify.js"(exports2, module2) {
    "use strict";
    var satisfies = require_satisfies();
    var compare = require_compare();
    module2.exports = (versions, range, options) => {
      const set = [];
      let first = null;
      let prev = null;
      const v = versions.sort((a, b) => compare(a, b, options));
      for (const version2 of v) {
        const included = satisfies(version2, range, options);
        if (included) {
          prev = version2;
          if (!first) {
            first = version2;
          }
        } else {
          if (prev) {
            set.push([first, prev]);
          }
          prev = null;
          first = null;
        }
      }
      if (first) {
        set.push([first, null]);
      }
      const ranges = [];
      for (const [min, max] of set) {
        if (min === max) {
          ranges.push(min);
        } else if (!max && min === v[0]) {
          ranges.push("*");
        } else if (!max) {
          ranges.push(`>=${min}`);
        } else if (min === v[0]) {
          ranges.push(`<=${max}`);
        } else {
          ranges.push(`${min} - ${max}`);
        }
      }
      const simplified = ranges.join(" || ");
      const original = typeof range.raw === "string" ? range.raw : String(range);
      return simplified.length < original.length ? simplified : range;
    };
  }
});

// netlify/functions/node_modules/semver/ranges/subset.js
var require_subset = __commonJS({
  "netlify/functions/node_modules/semver/ranges/subset.js"(exports2, module2) {
    "use strict";
    var Range = require_range();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var satisfies = require_satisfies();
    var compare = require_compare();
    var subset = (sub, dom, options = {}) => {
      if (sub === dom) {
        return true;
      }
      sub = new Range(sub, options);
      dom = new Range(dom, options);
      let sawNonNull = false;
      OUTER:
        for (const simpleSub of sub.set) {
          for (const simpleDom of dom.set) {
            const isSub = simpleSubset(simpleSub, simpleDom, options);
            sawNonNull = sawNonNull || isSub !== null;
            if (isSub) {
              continue OUTER;
            }
          }
          if (sawNonNull) {
            return false;
          }
        }
      return true;
    };
    var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
    var minimumVersion = [new Comparator(">=0.0.0")];
    var simpleSubset = (sub, dom, options) => {
      if (sub === dom) {
        return true;
      }
      if (sub.length === 1 && sub[0].semver === ANY) {
        if (dom.length === 1 && dom[0].semver === ANY) {
          return true;
        } else if (options.includePrerelease) {
          sub = minimumVersionWithPreRelease;
        } else {
          sub = minimumVersion;
        }
      }
      if (dom.length === 1 && dom[0].semver === ANY) {
        if (options.includePrerelease) {
          return true;
        } else {
          dom = minimumVersion;
        }
      }
      const eqSet = /* @__PURE__ */ new Set();
      let gt, lt;
      for (const c of sub) {
        if (c.operator === ">" || c.operator === ">=") {
          gt = higherGT(gt, c, options);
        } else if (c.operator === "<" || c.operator === "<=") {
          lt = lowerLT(lt, c, options);
        } else {
          eqSet.add(c.semver);
        }
      }
      if (eqSet.size > 1) {
        return null;
      }
      let gtltComp;
      if (gt && lt) {
        gtltComp = compare(gt.semver, lt.semver, options);
        if (gtltComp > 0) {
          return null;
        } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
          return null;
        }
      }
      for (const eq of eqSet) {
        if (gt && !satisfies(eq, String(gt), options)) {
          return null;
        }
        if (lt && !satisfies(eq, String(lt), options)) {
          return null;
        }
        for (const c of dom) {
          if (!satisfies(eq, String(c), options)) {
            return false;
          }
        }
        return true;
      }
      let higher, lower;
      let hasDomLT, hasDomGT;
      let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
      let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
      if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
        needDomLTPre = false;
      }
      for (const c of dom) {
        hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
        hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
        if (gt) {
          if (needDomGTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
              needDomGTPre = false;
            }
          }
          if (c.operator === ">" || c.operator === ">=") {
            higher = higherGT(gt, c, options);
            if (higher === c && higher !== gt) {
              return false;
            }
          } else if (gt.operator === ">=" && !satisfies(gt.semver, String(c), options)) {
            return false;
          }
        }
        if (lt) {
          if (needDomLTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
              needDomLTPre = false;
            }
          }
          if (c.operator === "<" || c.operator === "<=") {
            lower = lowerLT(lt, c, options);
            if (lower === c && lower !== lt) {
              return false;
            }
          } else if (lt.operator === "<=" && !satisfies(lt.semver, String(c), options)) {
            return false;
          }
        }
        if (!c.operator && (lt || gt) && gtltComp !== 0) {
          return false;
        }
      }
      if (gt && hasDomLT && !lt && gtltComp !== 0) {
        return false;
      }
      if (lt && hasDomGT && !gt && gtltComp !== 0) {
        return false;
      }
      if (needDomGTPre || needDomLTPre) {
        return false;
      }
      return true;
    };
    var higherGT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
    };
    var lowerLT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
    };
    module2.exports = subset;
  }
});

// netlify/functions/node_modules/semver/index.js
var require_semver2 = __commonJS({
  "netlify/functions/node_modules/semver/index.js"(exports2, module2) {
    "use strict";
    var internalRe = require_re();
    var constants = require_constants();
    var SemVer = require_semver();
    var identifiers = require_identifiers();
    var parse2 = require_parse();
    var valid = require_valid();
    var clean = require_clean();
    var inc = require_inc();
    var diff = require_diff();
    var major = require_major();
    var minor = require_minor();
    var patch = require_patch();
    var prerelease = require_prerelease();
    var compare = require_compare();
    var rcompare = require_rcompare();
    var compareLoose = require_compare_loose();
    var compareBuild = require_compare_build();
    var sort = require_sort();
    var rsort = require_rsort();
    var gt = require_gt();
    var lt = require_lt();
    var eq = require_eq();
    var neq = require_neq();
    var gte = require_gte();
    var lte = require_lte();
    var cmp = require_cmp();
    var coerce = require_coerce();
    var Comparator = require_comparator();
    var Range = require_range();
    var satisfies = require_satisfies();
    var toComparators = require_to_comparators();
    var maxSatisfying = require_max_satisfying();
    var minSatisfying = require_min_satisfying();
    var minVersion = require_min_version();
    var validRange = require_valid2();
    var outside = require_outside();
    var gtr = require_gtr();
    var ltr = require_ltr();
    var intersects = require_intersects();
    var simplifyRange = require_simplify();
    var subset = require_subset();
    module2.exports = {
      parse: parse2,
      valid,
      clean,
      inc,
      diff,
      major,
      minor,
      patch,
      prerelease,
      compare,
      rcompare,
      compareLoose,
      compareBuild,
      sort,
      rsort,
      gt,
      lt,
      eq,
      neq,
      gte,
      lte,
      cmp,
      coerce,
      Comparator,
      Range,
      satisfies,
      toComparators,
      maxSatisfying,
      minSatisfying,
      minVersion,
      validRange,
      outside,
      gtr,
      ltr,
      intersects,
      simplifyRange,
      subset,
      SemVer,
      re: internalRe.re,
      src: internalRe.src,
      tokens: internalRe.t,
      SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
      RELEASE_TYPES: constants.RELEASE_TYPES,
      compareIdentifiers: identifiers.compareIdentifiers,
      rcompareIdentifiers: identifiers.rcompareIdentifiers
    };
  }
});

// netlify/functions/node_modules/jsonwebtoken/lib/asymmetricKeyDetailsSupported.js
var require_asymmetricKeyDetailsSupported = __commonJS({
  "netlify/functions/node_modules/jsonwebtoken/lib/asymmetricKeyDetailsSupported.js"(exports2, module2) {
    var semver = require_semver2();
    module2.exports = semver.satisfies(process.version, ">=15.7.0");
  }
});

// netlify/functions/node_modules/jsonwebtoken/lib/rsaPssKeyDetailsSupported.js
var require_rsaPssKeyDetailsSupported = __commonJS({
  "netlify/functions/node_modules/jsonwebtoken/lib/rsaPssKeyDetailsSupported.js"(exports2, module2) {
    var semver = require_semver2();
    module2.exports = semver.satisfies(process.version, ">=16.9.0");
  }
});

// netlify/functions/node_modules/jsonwebtoken/lib/validateAsymmetricKey.js
var require_validateAsymmetricKey = __commonJS({
  "netlify/functions/node_modules/jsonwebtoken/lib/validateAsymmetricKey.js"(exports2, module2) {
    var ASYMMETRIC_KEY_DETAILS_SUPPORTED = require_asymmetricKeyDetailsSupported();
    var RSA_PSS_KEY_DETAILS_SUPPORTED = require_rsaPssKeyDetailsSupported();
    var allowedAlgorithmsForKeys = {
      "ec": ["ES256", "ES384", "ES512"],
      "rsa": ["RS256", "PS256", "RS384", "PS384", "RS512", "PS512"],
      "rsa-pss": ["PS256", "PS384", "PS512"]
    };
    var allowedCurves = {
      ES256: "prime256v1",
      ES384: "secp384r1",
      ES512: "secp521r1"
    };
    module2.exports = function(algorithm, key) {
      if (!algorithm || !key)
        return;
      const keyType = key.asymmetricKeyType;
      if (!keyType)
        return;
      const allowedAlgorithms = allowedAlgorithmsForKeys[keyType];
      if (!allowedAlgorithms) {
        throw new Error(`Unknown key type "${keyType}".`);
      }
      if (!allowedAlgorithms.includes(algorithm)) {
        throw new Error(`"alg" parameter for "${keyType}" key type must be one of: ${allowedAlgorithms.join(", ")}.`);
      }
      if (ASYMMETRIC_KEY_DETAILS_SUPPORTED) {
        switch (keyType) {
          case "ec":
            const keyCurve = key.asymmetricKeyDetails.namedCurve;
            const allowedCurve = allowedCurves[algorithm];
            if (keyCurve !== allowedCurve) {
              throw new Error(`"alg" parameter "${algorithm}" requires curve "${allowedCurve}".`);
            }
            break;
          case "rsa-pss":
            if (RSA_PSS_KEY_DETAILS_SUPPORTED) {
              const length = parseInt(algorithm.slice(-3), 10);
              const { hashAlgorithm, mgf1HashAlgorithm, saltLength } = key.asymmetricKeyDetails;
              if (hashAlgorithm !== `sha${length}` || mgf1HashAlgorithm !== hashAlgorithm) {
                throw new Error(`Invalid key for this operation, its RSA-PSS parameters do not meet the requirements of "alg" ${algorithm}.`);
              }
              if (saltLength !== void 0 && saltLength > length >> 3) {
                throw new Error(`Invalid key for this operation, its RSA-PSS parameter saltLength does not meet the requirements of "alg" ${algorithm}.`);
              }
            }
            break;
        }
      }
    };
  }
});

// netlify/functions/node_modules/jsonwebtoken/lib/psSupported.js
var require_psSupported = __commonJS({
  "netlify/functions/node_modules/jsonwebtoken/lib/psSupported.js"(exports2, module2) {
    var semver = require_semver2();
    module2.exports = semver.satisfies(process.version, "^6.12.0 || >=8.0.0");
  }
});

// netlify/functions/node_modules/jsonwebtoken/verify.js
var require_verify = __commonJS({
  "netlify/functions/node_modules/jsonwebtoken/verify.js"(exports2, module2) {
    var JsonWebTokenError = require_JsonWebTokenError();
    var NotBeforeError = require_NotBeforeError();
    var TokenExpiredError = require_TokenExpiredError();
    var decode = require_decode();
    var timespan = require_timespan();
    var validateAsymmetricKey = require_validateAsymmetricKey();
    var PS_SUPPORTED = require_psSupported();
    var jws = require_jws();
    var { KeyObject, createSecretKey, createPublicKey } = require("crypto");
    var PUB_KEY_ALGS = ["RS256", "RS384", "RS512"];
    var EC_KEY_ALGS = ["ES256", "ES384", "ES512"];
    var RSA_KEY_ALGS = ["RS256", "RS384", "RS512"];
    var HS_ALGS = ["HS256", "HS384", "HS512"];
    if (PS_SUPPORTED) {
      PUB_KEY_ALGS.splice(PUB_KEY_ALGS.length, 0, "PS256", "PS384", "PS512");
      RSA_KEY_ALGS.splice(RSA_KEY_ALGS.length, 0, "PS256", "PS384", "PS512");
    }
    module2.exports = function(jwtString, secretOrPublicKey, options, callback) {
      if (typeof options === "function" && !callback) {
        callback = options;
        options = {};
      }
      if (!options) {
        options = {};
      }
      options = Object.assign({}, options);
      let done;
      if (callback) {
        done = callback;
      } else {
        done = function(err, data) {
          if (err)
            throw err;
          return data;
        };
      }
      if (options.clockTimestamp && typeof options.clockTimestamp !== "number") {
        return done(new JsonWebTokenError("clockTimestamp must be a number"));
      }
      if (options.nonce !== void 0 && (typeof options.nonce !== "string" || options.nonce.trim() === "")) {
        return done(new JsonWebTokenError("nonce must be a non-empty string"));
      }
      if (options.allowInvalidAsymmetricKeyTypes !== void 0 && typeof options.allowInvalidAsymmetricKeyTypes !== "boolean") {
        return done(new JsonWebTokenError("allowInvalidAsymmetricKeyTypes must be a boolean"));
      }
      const clockTimestamp = options.clockTimestamp || Math.floor(Date.now() / 1e3);
      if (!jwtString) {
        return done(new JsonWebTokenError("jwt must be provided"));
      }
      if (typeof jwtString !== "string") {
        return done(new JsonWebTokenError("jwt must be a string"));
      }
      const parts = jwtString.split(".");
      if (parts.length !== 3) {
        return done(new JsonWebTokenError("jwt malformed"));
      }
      let decodedToken;
      try {
        decodedToken = decode(jwtString, { complete: true });
      } catch (err) {
        return done(err);
      }
      if (!decodedToken) {
        return done(new JsonWebTokenError("invalid token"));
      }
      const header = decodedToken.header;
      let getSecret;
      if (typeof secretOrPublicKey === "function") {
        if (!callback) {
          return done(new JsonWebTokenError("verify must be called asynchronous if secret or public key is provided as a callback"));
        }
        getSecret = secretOrPublicKey;
      } else {
        getSecret = function(header2, secretCallback) {
          return secretCallback(null, secretOrPublicKey);
        };
      }
      return getSecret(header, function(err, secretOrPublicKey2) {
        if (err) {
          return done(new JsonWebTokenError("error in secret or public key callback: " + err.message));
        }
        const hasSignature = parts[2].trim() !== "";
        if (!hasSignature && secretOrPublicKey2) {
          return done(new JsonWebTokenError("jwt signature is required"));
        }
        if (hasSignature && !secretOrPublicKey2) {
          return done(new JsonWebTokenError("secret or public key must be provided"));
        }
        if (!hasSignature && !options.algorithms) {
          return done(new JsonWebTokenError('please specify "none" in "algorithms" to verify unsigned tokens'));
        }
        if (secretOrPublicKey2 != null && !(secretOrPublicKey2 instanceof KeyObject)) {
          try {
            secretOrPublicKey2 = createPublicKey(secretOrPublicKey2);
          } catch (_) {
            try {
              secretOrPublicKey2 = createSecretKey(typeof secretOrPublicKey2 === "string" ? Buffer.from(secretOrPublicKey2) : secretOrPublicKey2);
            } catch (_2) {
              return done(new JsonWebTokenError("secretOrPublicKey is not valid key material"));
            }
          }
        }
        if (!options.algorithms) {
          if (secretOrPublicKey2.type === "secret") {
            options.algorithms = HS_ALGS;
          } else if (["rsa", "rsa-pss"].includes(secretOrPublicKey2.asymmetricKeyType)) {
            options.algorithms = RSA_KEY_ALGS;
          } else if (secretOrPublicKey2.asymmetricKeyType === "ec") {
            options.algorithms = EC_KEY_ALGS;
          } else {
            options.algorithms = PUB_KEY_ALGS;
          }
        }
        if (options.algorithms.indexOf(decodedToken.header.alg) === -1) {
          return done(new JsonWebTokenError("invalid algorithm"));
        }
        if (header.alg.startsWith("HS") && secretOrPublicKey2.type !== "secret") {
          return done(new JsonWebTokenError(`secretOrPublicKey must be a symmetric key when using ${header.alg}`));
        } else if (/^(?:RS|PS|ES)/.test(header.alg) && secretOrPublicKey2.type !== "public") {
          return done(new JsonWebTokenError(`secretOrPublicKey must be an asymmetric key when using ${header.alg}`));
        }
        if (!options.allowInvalidAsymmetricKeyTypes) {
          try {
            validateAsymmetricKey(header.alg, secretOrPublicKey2);
          } catch (e) {
            return done(e);
          }
        }
        let valid;
        try {
          valid = jws.verify(jwtString, decodedToken.header.alg, secretOrPublicKey2);
        } catch (e) {
          return done(e);
        }
        if (!valid) {
          return done(new JsonWebTokenError("invalid signature"));
        }
        const payload = decodedToken.payload;
        if (typeof payload.nbf !== "undefined" && !options.ignoreNotBefore) {
          if (typeof payload.nbf !== "number") {
            return done(new JsonWebTokenError("invalid nbf value"));
          }
          if (payload.nbf > clockTimestamp + (options.clockTolerance || 0)) {
            return done(new NotBeforeError("jwt not active", new Date(payload.nbf * 1e3)));
          }
        }
        if (typeof payload.exp !== "undefined" && !options.ignoreExpiration) {
          if (typeof payload.exp !== "number") {
            return done(new JsonWebTokenError("invalid exp value"));
          }
          if (clockTimestamp >= payload.exp + (options.clockTolerance || 0)) {
            return done(new TokenExpiredError("jwt expired", new Date(payload.exp * 1e3)));
          }
        }
        if (options.audience) {
          const audiences = Array.isArray(options.audience) ? options.audience : [options.audience];
          const target = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
          const match = target.some(function(targetAudience) {
            return audiences.some(function(audience) {
              return audience instanceof RegExp ? audience.test(targetAudience) : audience === targetAudience;
            });
          });
          if (!match) {
            return done(new JsonWebTokenError("jwt audience invalid. expected: " + audiences.join(" or ")));
          }
        }
        if (options.issuer) {
          const invalid_issuer = typeof options.issuer === "string" && payload.iss !== options.issuer || Array.isArray(options.issuer) && options.issuer.indexOf(payload.iss) === -1;
          if (invalid_issuer) {
            return done(new JsonWebTokenError("jwt issuer invalid. expected: " + options.issuer));
          }
        }
        if (options.subject) {
          if (payload.sub !== options.subject) {
            return done(new JsonWebTokenError("jwt subject invalid. expected: " + options.subject));
          }
        }
        if (options.jwtid) {
          if (payload.jti !== options.jwtid) {
            return done(new JsonWebTokenError("jwt jwtid invalid. expected: " + options.jwtid));
          }
        }
        if (options.nonce) {
          if (payload.nonce !== options.nonce) {
            return done(new JsonWebTokenError("jwt nonce invalid. expected: " + options.nonce));
          }
        }
        if (options.maxAge) {
          if (typeof payload.iat !== "number") {
            return done(new JsonWebTokenError("iat required when maxAge is specified"));
          }
          const maxAgeTimestamp = timespan(options.maxAge, payload.iat);
          if (typeof maxAgeTimestamp === "undefined") {
            return done(new JsonWebTokenError('"maxAge" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'));
          }
          if (clockTimestamp >= maxAgeTimestamp + (options.clockTolerance || 0)) {
            return done(new TokenExpiredError("maxAge exceeded", new Date(maxAgeTimestamp * 1e3)));
          }
        }
        if (options.complete === true) {
          const signature = decodedToken.signature;
          return done(null, {
            header,
            payload,
            signature
          });
        }
        return done(null, payload);
      });
    };
  }
});

// netlify/functions/node_modules/lodash.includes/index.js
var require_lodash = __commonJS({
  "netlify/functions/node_modules/lodash.includes/index.js"(exports2, module2) {
    var INFINITY = 1 / 0;
    var MAX_SAFE_INTEGER = 9007199254740991;
    var MAX_INTEGER = 17976931348623157e292;
    var NAN = 0 / 0;
    var argsTag = "[object Arguments]";
    var funcTag = "[object Function]";
    var genTag = "[object GeneratorFunction]";
    var stringTag = "[object String]";
    var symbolTag = "[object Symbol]";
    var reTrim = /^\s+|\s+$/g;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsOctal = /^0o[0-7]+$/i;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    var freeParseInt = parseInt;
    function arrayMap(array, iteratee) {
      var index = -1, length = array ? array.length : 0, result = Array(length);
      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }
    function baseFindIndex(array, predicate, fromIndex, fromRight) {
      var length = array.length, index = fromIndex + (fromRight ? 1 : -1);
      while (fromRight ? index-- : ++index < length) {
        if (predicate(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }
    function baseIndexOf(array, value, fromIndex) {
      if (value !== value) {
        return baseFindIndex(array, baseIsNaN, fromIndex);
      }
      var index = fromIndex - 1, length = array.length;
      while (++index < length) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }
    function baseIsNaN(value) {
      return value !== value;
    }
    function baseTimes(n, iteratee) {
      var index = -1, result = Array(n);
      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }
    function baseValues(object, props) {
      return arrayMap(props, function(key) {
        return object[key];
      });
    }
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var objectToString = objectProto.toString;
    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    var nativeKeys = overArg(Object.keys, Object);
    var nativeMax = Math.max;
    function arrayLikeKeys(value, inherited) {
      var result = isArray(value) || isArguments(value) ? baseTimes(value.length, String) : [];
      var length = result.length, skipIndexes = !!length;
      for (var key in value) {
        if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == "length" || isIndex(key, length)))) {
          result.push(key);
        }
      }
      return result;
    }
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty.call(object, key) && key != "constructor") {
          result.push(key);
        }
      }
      return result;
    }
    function isIndex(value, length) {
      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length && (typeof value == "number" || reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
    }
    function isPrototype(value) {
      var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
      return value === proto;
    }
    function includes(collection, value, fromIndex, guard) {
      collection = isArrayLike(collection) ? collection : values(collection);
      fromIndex = fromIndex && !guard ? toInteger(fromIndex) : 0;
      var length = collection.length;
      if (fromIndex < 0) {
        fromIndex = nativeMax(length + fromIndex, 0);
      }
      return isString(collection) ? fromIndex <= length && collection.indexOf(value, fromIndex) > -1 : !!length && baseIndexOf(collection, value, fromIndex) > -1;
    }
    function isArguments(value) {
      return isArrayLikeObject(value) && hasOwnProperty.call(value, "callee") && (!propertyIsEnumerable.call(value, "callee") || objectToString.call(value) == argsTag);
    }
    var isArray = Array.isArray;
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value);
    }
    function isFunction(value) {
      var tag = isObject(value) ? objectToString.call(value) : "";
      return tag == funcTag || tag == genTag;
    }
    function isLength(value) {
      return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == "object" || type == "function");
    }
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isString(value) {
      return typeof value == "string" || !isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag;
    }
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
    }
    function toFinite(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }
      value = toNumber(value);
      if (value === INFINITY || value === -INFINITY) {
        var sign = value < 0 ? -1 : 1;
        return sign * MAX_INTEGER;
      }
      return value === value ? value : 0;
    }
    function toInteger(value) {
      var result = toFinite(value), remainder = result % 1;
      return result === result ? remainder ? result - remainder : result : 0;
    }
    function toNumber(value) {
      if (typeof value == "number") {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject(value)) {
        var other = typeof value.valueOf == "function" ? value.valueOf() : value;
        value = isObject(other) ? other + "" : other;
      }
      if (typeof value != "string") {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, "");
      var isBinary = reIsBinary.test(value);
      return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
    }
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }
    function values(object) {
      return object ? baseValues(object, keys(object)) : [];
    }
    module2.exports = includes;
  }
});

// netlify/functions/node_modules/lodash.isboolean/index.js
var require_lodash2 = __commonJS({
  "netlify/functions/node_modules/lodash.isboolean/index.js"(exports2, module2) {
    var boolTag = "[object Boolean]";
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    function isBoolean(value) {
      return value === true || value === false || isObjectLike(value) && objectToString.call(value) == boolTag;
    }
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    module2.exports = isBoolean;
  }
});

// netlify/functions/node_modules/lodash.isinteger/index.js
var require_lodash3 = __commonJS({
  "netlify/functions/node_modules/lodash.isinteger/index.js"(exports2, module2) {
    var INFINITY = 1 / 0;
    var MAX_INTEGER = 17976931348623157e292;
    var NAN = 0 / 0;
    var symbolTag = "[object Symbol]";
    var reTrim = /^\s+|\s+$/g;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsOctal = /^0o[0-7]+$/i;
    var freeParseInt = parseInt;
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    function isInteger(value) {
      return typeof value == "number" && value == toInteger(value);
    }
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == "object" || type == "function");
    }
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
    }
    function toFinite(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }
      value = toNumber(value);
      if (value === INFINITY || value === -INFINITY) {
        var sign = value < 0 ? -1 : 1;
        return sign * MAX_INTEGER;
      }
      return value === value ? value : 0;
    }
    function toInteger(value) {
      var result = toFinite(value), remainder = result % 1;
      return result === result ? remainder ? result - remainder : result : 0;
    }
    function toNumber(value) {
      if (typeof value == "number") {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject(value)) {
        var other = typeof value.valueOf == "function" ? value.valueOf() : value;
        value = isObject(other) ? other + "" : other;
      }
      if (typeof value != "string") {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, "");
      var isBinary = reIsBinary.test(value);
      return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
    }
    module2.exports = isInteger;
  }
});

// netlify/functions/node_modules/lodash.isnumber/index.js
var require_lodash4 = __commonJS({
  "netlify/functions/node_modules/lodash.isnumber/index.js"(exports2, module2) {
    var numberTag = "[object Number]";
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isNumber(value) {
      return typeof value == "number" || isObjectLike(value) && objectToString.call(value) == numberTag;
    }
    module2.exports = isNumber;
  }
});

// netlify/functions/node_modules/lodash.isplainobject/index.js
var require_lodash5 = __commonJS({
  "netlify/functions/node_modules/lodash.isplainobject/index.js"(exports2, module2) {
    var objectTag = "[object Object]";
    function isHostObject(value) {
      var result = false;
      if (value != null && typeof value.toString != "function") {
        try {
          result = !!(value + "");
        } catch (e) {
        }
      }
      return result;
    }
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var objectCtorString = funcToString.call(Object);
    var objectToString = objectProto.toString;
    var getPrototype = overArg(Object.getPrototypeOf, Object);
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isPlainObject(value) {
      if (!isObjectLike(value) || objectToString.call(value) != objectTag || isHostObject(value)) {
        return false;
      }
      var proto = getPrototype(value);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
      return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
    }
    module2.exports = isPlainObject;
  }
});

// netlify/functions/node_modules/lodash.isstring/index.js
var require_lodash6 = __commonJS({
  "netlify/functions/node_modules/lodash.isstring/index.js"(exports2, module2) {
    var stringTag = "[object String]";
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    var isArray = Array.isArray;
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isString(value) {
      return typeof value == "string" || !isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag;
    }
    module2.exports = isString;
  }
});

// netlify/functions/node_modules/lodash.once/index.js
var require_lodash7 = __commonJS({
  "netlify/functions/node_modules/lodash.once/index.js"(exports2, module2) {
    var FUNC_ERROR_TEXT = "Expected a function";
    var INFINITY = 1 / 0;
    var MAX_INTEGER = 17976931348623157e292;
    var NAN = 0 / 0;
    var symbolTag = "[object Symbol]";
    var reTrim = /^\s+|\s+$/g;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsOctal = /^0o[0-7]+$/i;
    var freeParseInt = parseInt;
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    function before(n, func) {
      var result;
      if (typeof func != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      n = toInteger(n);
      return function() {
        if (--n > 0) {
          result = func.apply(this, arguments);
        }
        if (n <= 1) {
          func = void 0;
        }
        return result;
      };
    }
    function once(func) {
      return before(2, func);
    }
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == "object" || type == "function");
    }
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
    }
    function toFinite(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }
      value = toNumber(value);
      if (value === INFINITY || value === -INFINITY) {
        var sign = value < 0 ? -1 : 1;
        return sign * MAX_INTEGER;
      }
      return value === value ? value : 0;
    }
    function toInteger(value) {
      var result = toFinite(value), remainder = result % 1;
      return result === result ? remainder ? result - remainder : result : 0;
    }
    function toNumber(value) {
      if (typeof value == "number") {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject(value)) {
        var other = typeof value.valueOf == "function" ? value.valueOf() : value;
        value = isObject(other) ? other + "" : other;
      }
      if (typeof value != "string") {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, "");
      var isBinary = reIsBinary.test(value);
      return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
    }
    module2.exports = once;
  }
});

// netlify/functions/node_modules/jsonwebtoken/sign.js
var require_sign = __commonJS({
  "netlify/functions/node_modules/jsonwebtoken/sign.js"(exports2, module2) {
    var timespan = require_timespan();
    var PS_SUPPORTED = require_psSupported();
    var validateAsymmetricKey = require_validateAsymmetricKey();
    var jws = require_jws();
    var includes = require_lodash();
    var isBoolean = require_lodash2();
    var isInteger = require_lodash3();
    var isNumber = require_lodash4();
    var isPlainObject = require_lodash5();
    var isString = require_lodash6();
    var once = require_lodash7();
    var { KeyObject, createSecretKey, createPrivateKey } = require("crypto");
    var SUPPORTED_ALGS = ["RS256", "RS384", "RS512", "ES256", "ES384", "ES512", "HS256", "HS384", "HS512", "none"];
    if (PS_SUPPORTED) {
      SUPPORTED_ALGS.splice(3, 0, "PS256", "PS384", "PS512");
    }
    var sign_options_schema = {
      expiresIn: { isValid: function(value) {
        return isInteger(value) || isString(value) && value;
      }, message: '"expiresIn" should be a number of seconds or string representing a timespan' },
      notBefore: { isValid: function(value) {
        return isInteger(value) || isString(value) && value;
      }, message: '"notBefore" should be a number of seconds or string representing a timespan' },
      audience: { isValid: function(value) {
        return isString(value) || Array.isArray(value);
      }, message: '"audience" must be a string or array' },
      algorithm: { isValid: includes.bind(null, SUPPORTED_ALGS), message: '"algorithm" must be a valid string enum value' },
      header: { isValid: isPlainObject, message: '"header" must be an object' },
      encoding: { isValid: isString, message: '"encoding" must be a string' },
      issuer: { isValid: isString, message: '"issuer" must be a string' },
      subject: { isValid: isString, message: '"subject" must be a string' },
      jwtid: { isValid: isString, message: '"jwtid" must be a string' },
      noTimestamp: { isValid: isBoolean, message: '"noTimestamp" must be a boolean' },
      keyid: { isValid: isString, message: '"keyid" must be a string' },
      mutatePayload: { isValid: isBoolean, message: '"mutatePayload" must be a boolean' },
      allowInsecureKeySizes: { isValid: isBoolean, message: '"allowInsecureKeySizes" must be a boolean' },
      allowInvalidAsymmetricKeyTypes: { isValid: isBoolean, message: '"allowInvalidAsymmetricKeyTypes" must be a boolean' }
    };
    var registered_claims_schema = {
      iat: { isValid: isNumber, message: '"iat" should be a number of seconds' },
      exp: { isValid: isNumber, message: '"exp" should be a number of seconds' },
      nbf: { isValid: isNumber, message: '"nbf" should be a number of seconds' }
    };
    function validate2(schema, allowUnknown, object, parameterName) {
      if (!isPlainObject(object)) {
        throw new Error('Expected "' + parameterName + '" to be a plain object.');
      }
      Object.keys(object).forEach(function(key) {
        const validator = schema[key];
        if (!validator) {
          if (!allowUnknown) {
            throw new Error('"' + key + '" is not allowed in "' + parameterName + '"');
          }
          return;
        }
        if (!validator.isValid(object[key])) {
          throw new Error(validator.message);
        }
      });
    }
    function validateOptions(options) {
      return validate2(sign_options_schema, false, options, "options");
    }
    function validatePayload(payload) {
      return validate2(registered_claims_schema, true, payload, "payload");
    }
    var options_to_payload = {
      "audience": "aud",
      "issuer": "iss",
      "subject": "sub",
      "jwtid": "jti"
    };
    var options_for_objects = [
      "expiresIn",
      "notBefore",
      "noTimestamp",
      "audience",
      "issuer",
      "subject",
      "jwtid"
    ];
    module2.exports = function(payload, secretOrPrivateKey, options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      } else {
        options = options || {};
      }
      const isObjectPayload = typeof payload === "object" && !Buffer.isBuffer(payload);
      const header = Object.assign({
        alg: options.algorithm || "HS256",
        typ: isObjectPayload ? "JWT" : void 0,
        kid: options.keyid
      }, options.header);
      function failure(err) {
        if (callback) {
          return callback(err);
        }
        throw err;
      }
      if (!secretOrPrivateKey && options.algorithm !== "none") {
        return failure(new Error("secretOrPrivateKey must have a value"));
      }
      if (secretOrPrivateKey != null && !(secretOrPrivateKey instanceof KeyObject)) {
        try {
          secretOrPrivateKey = createPrivateKey(secretOrPrivateKey);
        } catch (_) {
          try {
            secretOrPrivateKey = createSecretKey(typeof secretOrPrivateKey === "string" ? Buffer.from(secretOrPrivateKey) : secretOrPrivateKey);
          } catch (_2) {
            return failure(new Error("secretOrPrivateKey is not valid key material"));
          }
        }
      }
      if (header.alg.startsWith("HS") && secretOrPrivateKey.type !== "secret") {
        return failure(new Error(`secretOrPrivateKey must be a symmetric key when using ${header.alg}`));
      } else if (/^(?:RS|PS|ES)/.test(header.alg)) {
        if (secretOrPrivateKey.type !== "private") {
          return failure(new Error(`secretOrPrivateKey must be an asymmetric key when using ${header.alg}`));
        }
        if (!options.allowInsecureKeySizes && !header.alg.startsWith("ES") && secretOrPrivateKey.asymmetricKeyDetails !== void 0 && //KeyObject.asymmetricKeyDetails is supported in Node 15+
        secretOrPrivateKey.asymmetricKeyDetails.modulusLength < 2048) {
          return failure(new Error(`secretOrPrivateKey has a minimum key size of 2048 bits for ${header.alg}`));
        }
      }
      if (typeof payload === "undefined") {
        return failure(new Error("payload is required"));
      } else if (isObjectPayload) {
        try {
          validatePayload(payload);
        } catch (error) {
          return failure(error);
        }
        if (!options.mutatePayload) {
          payload = Object.assign({}, payload);
        }
      } else {
        const invalid_options = options_for_objects.filter(function(opt) {
          return typeof options[opt] !== "undefined";
        });
        if (invalid_options.length > 0) {
          return failure(new Error("invalid " + invalid_options.join(",") + " option for " + typeof payload + " payload"));
        }
      }
      if (typeof payload.exp !== "undefined" && typeof options.expiresIn !== "undefined") {
        return failure(new Error('Bad "options.expiresIn" option the payload already has an "exp" property.'));
      }
      if (typeof payload.nbf !== "undefined" && typeof options.notBefore !== "undefined") {
        return failure(new Error('Bad "options.notBefore" option the payload already has an "nbf" property.'));
      }
      try {
        validateOptions(options);
      } catch (error) {
        return failure(error);
      }
      if (!options.allowInvalidAsymmetricKeyTypes) {
        try {
          validateAsymmetricKey(header.alg, secretOrPrivateKey);
        } catch (error) {
          return failure(error);
        }
      }
      const timestamp = payload.iat || Math.floor(Date.now() / 1e3);
      if (options.noTimestamp) {
        delete payload.iat;
      } else if (isObjectPayload) {
        payload.iat = timestamp;
      }
      if (typeof options.notBefore !== "undefined") {
        try {
          payload.nbf = timespan(options.notBefore, timestamp);
        } catch (err) {
          return failure(err);
        }
        if (typeof payload.nbf === "undefined") {
          return failure(new Error('"notBefore" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'));
        }
      }
      if (typeof options.expiresIn !== "undefined" && typeof payload === "object") {
        try {
          payload.exp = timespan(options.expiresIn, timestamp);
        } catch (err) {
          return failure(err);
        }
        if (typeof payload.exp === "undefined") {
          return failure(new Error('"expiresIn" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'));
        }
      }
      Object.keys(options_to_payload).forEach(function(key) {
        const claim = options_to_payload[key];
        if (typeof options[key] !== "undefined") {
          if (typeof payload[claim] !== "undefined") {
            return failure(new Error('Bad "options.' + key + '" option. The payload already has an "' + claim + '" property.'));
          }
          payload[claim] = options[key];
        }
      });
      const encoding = options.encoding || "utf8";
      if (typeof callback === "function") {
        callback = callback && once(callback);
        jws.createSign({
          header,
          privateKey: secretOrPrivateKey,
          payload,
          encoding
        }).once("error", callback).once("done", function(signature) {
          if (!options.allowInsecureKeySizes && /^(?:RS|PS)/.test(header.alg) && signature.length < 256) {
            return callback(new Error(`secretOrPrivateKey has a minimum key size of 2048 bits for ${header.alg}`));
          }
          callback(null, signature);
        });
      } else {
        let signature = jws.sign({ header, payload, secret: secretOrPrivateKey, encoding });
        if (!options.allowInsecureKeySizes && /^(?:RS|PS)/.test(header.alg) && signature.length < 256) {
          throw new Error(`secretOrPrivateKey has a minimum key size of 2048 bits for ${header.alg}`);
        }
        return signature;
      }
    };
  }
});

// netlify/functions/node_modules/jsonwebtoken/index.js
var require_jsonwebtoken = __commonJS({
  "netlify/functions/node_modules/jsonwebtoken/index.js"(exports2, module2) {
    module2.exports = {
      decode: require_decode(),
      verify: require_verify(),
      sign: require_sign(),
      JsonWebTokenError: require_JsonWebTokenError(),
      NotBeforeError: require_NotBeforeError(),
      TokenExpiredError: require_TokenExpiredError()
    };
  }
});

// netlify/functions/node_modules/uuid/dist/esm-node/rng.js
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    import_crypto.default.randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}
var import_crypto, rnds8Pool, poolPtr;
var init_rng = __esm({
  "netlify/functions/node_modules/uuid/dist/esm-node/rng.js"() {
    import_crypto = __toESM(require("crypto"));
    rnds8Pool = new Uint8Array(256);
    poolPtr = rnds8Pool.length;
  }
});

// netlify/functions/node_modules/uuid/dist/esm-node/regex.js
var regex_default;
var init_regex = __esm({
  "netlify/functions/node_modules/uuid/dist/esm-node/regex.js"() {
    regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
  }
});

// netlify/functions/node_modules/uuid/dist/esm-node/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
var validate_default;
var init_validate = __esm({
  "netlify/functions/node_modules/uuid/dist/esm-node/validate.js"() {
    init_regex();
    validate_default = validate;
  }
});

// netlify/functions/node_modules/uuid/dist/esm-node/stringify.js
function unsafeStringify(arr, offset = 0) {
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}
function stringify(arr, offset = 0) {
  const uuid = unsafeStringify(arr, offset);
  if (!validate_default(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
var byteToHex, stringify_default;
var init_stringify = __esm({
  "netlify/functions/node_modules/uuid/dist/esm-node/stringify.js"() {
    init_validate();
    byteToHex = [];
    for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 256).toString(16).slice(1));
    }
    stringify_default = stringify;
  }
});

// netlify/functions/node_modules/uuid/dist/esm-node/v1.js
function v1(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node || _nodeId;
  let clockseq = options.clockseq !== void 0 ? options.clockseq : _clockseq;
  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || rng)();
    if (node == null) {
      node = _nodeId = [seedBytes[0] | 1, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }
    if (clockseq == null) {
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
    }
  }
  let msecs = options.msecs !== void 0 ? options.msecs : Date.now();
  let nsecs = options.nsecs !== void 0 ? options.nsecs : _lastNSecs + 1;
  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
  if (dt < 0 && options.clockseq === void 0) {
    clockseq = clockseq + 1 & 16383;
  }
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === void 0) {
    nsecs = 0;
  }
  if (nsecs >= 1e4) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }
  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;
  msecs += 122192928e5;
  const tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
  b[i++] = tl >>> 24 & 255;
  b[i++] = tl >>> 16 & 255;
  b[i++] = tl >>> 8 & 255;
  b[i++] = tl & 255;
  const tmh = msecs / 4294967296 * 1e4 & 268435455;
  b[i++] = tmh >>> 8 & 255;
  b[i++] = tmh & 255;
  b[i++] = tmh >>> 24 & 15 | 16;
  b[i++] = tmh >>> 16 & 255;
  b[i++] = clockseq >>> 8 | 128;
  b[i++] = clockseq & 255;
  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }
  return buf || unsafeStringify(b);
}
var _nodeId, _clockseq, _lastMSecs, _lastNSecs, v1_default;
var init_v1 = __esm({
  "netlify/functions/node_modules/uuid/dist/esm-node/v1.js"() {
    init_rng();
    init_stringify();
    _lastMSecs = 0;
    _lastNSecs = 0;
    v1_default = v1;
  }
});

// netlify/functions/node_modules/uuid/dist/esm-node/parse.js
function parse(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  let v;
  const arr = new Uint8Array(16);
  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 255;
  arr[2] = v >>> 8 & 255;
  arr[3] = v & 255;
  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 255;
  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 255;
  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 255;
  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
  arr[11] = v / 4294967296 & 255;
  arr[12] = v >>> 24 & 255;
  arr[13] = v >>> 16 & 255;
  arr[14] = v >>> 8 & 255;
  arr[15] = v & 255;
  return arr;
}
var parse_default;
var init_parse = __esm({
  "netlify/functions/node_modules/uuid/dist/esm-node/parse.js"() {
    init_validate();
    parse_default = parse;
  }
});

// netlify/functions/node_modules/uuid/dist/esm-node/v35.js
function stringToBytes(str) {
  str = unescape(encodeURIComponent(str));
  const bytes = [];
  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}
function v35(name, version2, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    var _namespace;
    if (typeof value === "string") {
      value = stringToBytes(value);
    }
    if (typeof namespace === "string") {
      namespace = parse_default(namespace);
    }
    if (((_namespace = namespace) === null || _namespace === void 0 ? void 0 : _namespace.length) !== 16) {
      throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
    }
    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 15 | version2;
    bytes[8] = bytes[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }
      return buf;
    }
    return unsafeStringify(bytes);
  }
  try {
    generateUUID.name = name;
  } catch (err) {
  }
  generateUUID.DNS = DNS;
  generateUUID.URL = URL2;
  return generateUUID;
}
var DNS, URL2;
var init_v35 = __esm({
  "netlify/functions/node_modules/uuid/dist/esm-node/v35.js"() {
    init_stringify();
    init_parse();
    DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    URL2 = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
  }
});

// netlify/functions/node_modules/uuid/dist/esm-node/md5.js
function md5(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return import_crypto2.default.createHash("md5").update(bytes).digest();
}
var import_crypto2, md5_default;
var init_md5 = __esm({
  "netlify/functions/node_modules/uuid/dist/esm-node/md5.js"() {
    import_crypto2 = __toESM(require("crypto"));
    md5_default = md5;
  }
});

// netlify/functions/node_modules/uuid/dist/esm-node/v3.js
var v3, v3_default;
var init_v3 = __esm({
  "netlify/functions/node_modules/uuid/dist/esm-node/v3.js"() {
    init_v35();
    init_md5();
    v3 = v35("v3", 48, md5_default);
    v3_default = v3;
  }
});

// netlify/functions/node_modules/uuid/dist/esm-node/native.js
var import_crypto3, native_default;
var init_native = __esm({
  "netlify/functions/node_modules/uuid/dist/esm-node/native.js"() {
    import_crypto3 = __toESM(require("crypto"));
    native_default = {
      randomUUID: import_crypto3.default.randomUUID
    };
  }
});

// netlify/functions/node_modules/uuid/dist/esm-node/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default;
var init_v4 = __esm({
  "netlify/functions/node_modules/uuid/dist/esm-node/v4.js"() {
    init_native();
    init_rng();
    init_stringify();
    v4_default = v4;
  }
});

// netlify/functions/node_modules/uuid/dist/esm-node/sha1.js
function sha1(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return import_crypto4.default.createHash("sha1").update(bytes).digest();
}
var import_crypto4, sha1_default;
var init_sha1 = __esm({
  "netlify/functions/node_modules/uuid/dist/esm-node/sha1.js"() {
    import_crypto4 = __toESM(require("crypto"));
    sha1_default = sha1;
  }
});

// netlify/functions/node_modules/uuid/dist/esm-node/v5.js
var v5, v5_default;
var init_v5 = __esm({
  "netlify/functions/node_modules/uuid/dist/esm-node/v5.js"() {
    init_v35();
    init_sha1();
    v5 = v35("v5", 80, sha1_default);
    v5_default = v5;
  }
});

// netlify/functions/node_modules/uuid/dist/esm-node/nil.js
var nil_default;
var init_nil = __esm({
  "netlify/functions/node_modules/uuid/dist/esm-node/nil.js"() {
    nil_default = "00000000-0000-0000-0000-000000000000";
  }
});

// netlify/functions/node_modules/uuid/dist/esm-node/version.js
function version(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  return parseInt(uuid.slice(14, 15), 16);
}
var version_default;
var init_version = __esm({
  "netlify/functions/node_modules/uuid/dist/esm-node/version.js"() {
    init_validate();
    version_default = version;
  }
});

// netlify/functions/node_modules/uuid/dist/esm-node/index.js
var esm_node_exports = {};
__export(esm_node_exports, {
  NIL: () => nil_default,
  parse: () => parse_default,
  stringify: () => stringify_default,
  v1: () => v1_default,
  v3: () => v3_default,
  v4: () => v4_default,
  v5: () => v5_default,
  validate: () => validate_default,
  version: () => version_default
});
var init_esm_node = __esm({
  "netlify/functions/node_modules/uuid/dist/esm-node/index.js"() {
    init_v1();
    init_v3();
    init_v4();
    init_v5();
    init_nil();
    init_version();
    init_validate();
    init_stringify();
    init_parse();
  }
});

// netlify/functions/auth.js
var require_auth = __commonJS({
  "netlify/functions/auth.js"(exports2) {
    var bcrypt = require_bcryptjs();
    var jwt = require_jsonwebtoken();
    var { v4: uuidv4 } = (init_esm_node(), __toCommonJS(esm_node_exports));
    var users = [];
    var JWT_SECRET = process.env.JWT_SECRET;
    function authUnavailable(headers2) {
      return {
        statusCode: 503,
        headers: headers2,
        body: JSON.stringify({
          message: "Authentication is not configured on this environment"
        })
      };
    }
    exports2.handler = async (event, context) => {
      const headers2 = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Content-Type": "application/json"
      };
      if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: headers2, body: "" };
      }
      const path = event.path.replace("/.netlify/functions/auth", "").replace("/api/auth", "");
      try {
        if (path === "/signup" && event.httpMethod === "POST") {
          if (!JWT_SECRET) {
            return authUnavailable(headers2);
          }
          const body = JSON.parse(event.body);
          const { userType, email, password, firstName, lastName, phone, companyName, storeName } = body;
          if (users.find((u) => u.email === email)) {
            return { statusCode: 409, headers: headers2, body: JSON.stringify({ message: "Email already registered" }) };
          }
          const passwordHash = await bcrypt.hash(password, 10);
          const userUuid = uuidv4();
          const newUser = {
            id: users.length + 1,
            uuid: userUuid,
            userType,
            email,
            passwordHash,
            firstName,
            lastName,
            phone,
            companyName: userType === "brand" ? companyName : null,
            storeName: userType === "retailer" ? storeName : null,
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          users.push(newUser);
          const token = jwt.sign({ userId: newUser.id, uuid: userUuid, email, userType }, JWT_SECRET, { expiresIn: "7d" });
          return {
            statusCode: 201,
            headers: headers2,
            body: JSON.stringify({
              message: "Account created successfully",
              token,
              user: { id: newUser.id, uuid: userUuid, email, userType, firstName, lastName }
            })
          };
        }
        if (path === "/login" && event.httpMethod === "POST") {
          if (!JWT_SECRET) {
            return authUnavailable(headers2);
          }
          const body = JSON.parse(event.body);
          const { email, password } = body;
          const user = users.find((u) => u.email === email);
          if (!user) {
            return { statusCode: 401, headers: headers2, body: JSON.stringify({ message: "Invalid credentials" }) };
          }
          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) {
            return { statusCode: 401, headers: headers2, body: JSON.stringify({ message: "Invalid credentials" }) };
          }
          const token = jwt.sign({ userId: user.id, uuid: user.uuid, email, userType: user.userType }, JWT_SECRET, { expiresIn: "7d" });
          return {
            statusCode: 200,
            headers: headers2,
            body: JSON.stringify({
              message: "Login successful",
              token,
              user: { id: user.id, uuid: user.uuid, email, userType: user.userType, firstName: user.firstName, lastName: user.lastName }
            })
          };
        }
        if (path === "/health" || path === "") {
          return {
            statusCode: 200,
            headers: headers2,
            body: JSON.stringify({ status: "OK", message: "Auth API is running", users: users.length })
          };
        }
        return { statusCode: 404, headers: headers2, body: JSON.stringify({ message: "Not found" }) };
      } catch (error) {
        console.error("Error:", error);
        return { statusCode: 500, headers: headers2, body: JSON.stringify({ message: "Server error", error: error.message }) };
      }
    };
  }
});

// netlify/functions/node_modules/@neondatabase/serverless/index.js
var require_serverless = __commonJS({
  "netlify/functions/node_modules/@neondatabase/serverless/index.js"(exports2, module2) {
    "use strict";
    var So = Object.create;
    var Te = Object.defineProperty;
    var Eo = Object.getOwnPropertyDescriptor;
    var Ao = Object.getOwnPropertyNames;
    var Co = Object.getPrototypeOf;
    var _o = Object.prototype.hasOwnProperty;
    var Io = (r, e, t) => e in r ? Te(r, e, { enumerable: true, configurable: true, writable: true, value: t }) : r[e] = t;
    var a = (r, e) => Te(r, "name", { value: e, configurable: true });
    var G = (r, e) => () => (r && (e = r(r = 0)), e);
    var T = (r, e) => () => (e || r((e = { exports: {} }).exports, e), e.exports);
    var te = (r, e) => {
      for (var t in e)
        Te(r, t, {
          get: e[t],
          enumerable: true
        });
    };
    var On = (r, e, t, n) => {
      if (e && typeof e == "object" || typeof e == "function")
        for (let i of Ao(e))
          !_o.call(r, i) && i !== t && Te(r, i, { get: () => e[i], enumerable: !(n = Eo(e, i)) || n.enumerable });
      return r;
    };
    var Ae = (r, e, t) => (t = r != null ? So(Co(r)) : {}, On(e || !r || !r.__esModule ? Te(t, "default", { value: r, enumerable: true }) : t, r));
    var O = (r) => On(Te({}, "__esModule", { value: true }), r);
    var E = (r, e, t) => Io(r, typeof e != "symbol" ? e + "" : e, t);
    var Nn = T((ft) => {
      "use strict";
      p();
      ft.byteLength = Po;
      ft.toByteArray = Ro;
      ft.fromByteArray = ko;
      var ue = [], re = [], To = typeof Uint8Array < "u" ? Uint8Array : Array, Qt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      for (Ce = 0, qn = Qt.length; Ce < qn; ++Ce)
        ue[Ce] = Qt[Ce], re[Qt.charCodeAt(Ce)] = Ce;
      var Ce, qn;
      re[45] = 62;
      re[95] = 63;
      function Qn(r) {
        var e = r.length;
        if (e % 4 > 0)
          throw new Error("Invalid string. Length must be a multiple of 4");
        var t = r.indexOf("=");
        t === -1 && (t = e);
        var n = t === e ? 0 : 4 - t % 4;
        return [t, n];
      }
      a(Qn, "getLens");
      function Po(r) {
        var e = Qn(r), t = e[0], n = e[1];
        return (t + n) * 3 / 4 - n;
      }
      a(Po, "byteLength");
      function Bo(r, e, t) {
        return (e + t) * 3 / 4 - t;
      }
      a(Bo, "_byteLength");
      function Ro(r) {
        var e, t = Qn(r), n = t[0], i = t[1], s = new To(Bo(r, n, i)), o = 0, u = i > 0 ? n - 4 : n, c;
        for (c = 0; c < u; c += 4)
          e = re[r.charCodeAt(c)] << 18 | re[r.charCodeAt(c + 1)] << 12 | re[r.charCodeAt(c + 2)] << 6 | re[r.charCodeAt(c + 3)], s[o++] = e >> 16 & 255, s[o++] = e >> 8 & 255, s[o++] = e & 255;
        return i === 2 && (e = re[r.charCodeAt(
          c
        )] << 2 | re[r.charCodeAt(c + 1)] >> 4, s[o++] = e & 255), i === 1 && (e = re[r.charCodeAt(c)] << 10 | re[r.charCodeAt(c + 1)] << 4 | re[r.charCodeAt(c + 2)] >> 2, s[o++] = e >> 8 & 255, s[o++] = e & 255), s;
      }
      a(Ro, "toByteArray");
      function Lo(r) {
        return ue[r >> 18 & 63] + ue[r >> 12 & 63] + ue[r >> 6 & 63] + ue[r & 63];
      }
      a(Lo, "tripletToBase64");
      function Fo(r, e, t) {
        for (var n, i = [], s = e; s < t; s += 3)
          n = (r[s] << 16 & 16711680) + (r[s + 1] << 8 & 65280) + (r[s + 2] & 255), i.push(Lo(n));
        return i.join("");
      }
      a(Fo, "encodeChunk");
      function ko(r) {
        for (var e, t = r.length, n = t % 3, i = [], s = 16383, o = 0, u = t - n; o < u; o += s)
          i.push(Fo(
            r,
            o,
            o + s > u ? u : o + s
          ));
        return n === 1 ? (e = r[t - 1], i.push(ue[e >> 2] + ue[e << 4 & 63] + "==")) : n === 2 && (e = (r[t - 2] << 8) + r[t - 1], i.push(ue[e >> 10] + ue[e >> 4 & 63] + ue[e << 2 & 63] + "=")), i.join("");
      }
      a(ko, "fromByteArray");
    });
    var Wn = T((Nt) => {
      p();
      Nt.read = function(r, e, t, n, i) {
        var s, o, u = i * 8 - n - 1, c = (1 << u) - 1, l = c >> 1, f = -7, y = t ? i - 1 : 0, g = t ? -1 : 1, A = r[e + y];
        for (y += g, s = A & (1 << -f) - 1, A >>= -f, f += u; f > 0; s = s * 256 + r[e + y], y += g, f -= 8)
          ;
        for (o = s & (1 << -f) - 1, s >>= -f, f += n; f > 0; o = o * 256 + r[e + y], y += g, f -= 8)
          ;
        if (s === 0)
          s = 1 - l;
        else {
          if (s === c)
            return o ? NaN : (A ? -1 : 1) * (1 / 0);
          o = o + Math.pow(2, n), s = s - l;
        }
        return (A ? -1 : 1) * o * Math.pow(2, s - n);
      };
      Nt.write = function(r, e, t, n, i, s) {
        var o, u, c, l = s * 8 - i - 1, f = (1 << l) - 1, y = f >> 1, g = i === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, A = n ? 0 : s - 1, C = n ? 1 : -1, D = e < 0 || e === 0 && 1 / e < 0 ? 1 : 0;
        for (e = Math.abs(e), isNaN(e) || e === 1 / 0 ? (u = isNaN(e) ? 1 : 0, o = f) : (o = Math.floor(Math.log(e) / Math.LN2), e * (c = Math.pow(2, -o)) < 1 && (o--, c *= 2), o + y >= 1 ? e += g / c : e += g * Math.pow(2, 1 - y), e * c >= 2 && (o++, c /= 2), o + y >= f ? (u = 0, o = f) : o + y >= 1 ? (u = (e * c - 1) * Math.pow(2, i), o = o + y) : (u = e * Math.pow(2, y - 1) * Math.pow(2, i), o = 0)); i >= 8; r[t + A] = u & 255, A += C, u /= 256, i -= 8)
          ;
        for (o = o << i | u, l += i; l > 0; r[t + A] = o & 255, A += C, o /= 256, l -= 8)
          ;
        r[t + A - C] |= D * 128;
      };
    });
    var si = T((Le) => {
      "use strict";
      p();
      var Wt = Nn(), Be = Wn(), jn = typeof Symbol == "function" && typeof Symbol.for == "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
      Le.Buffer = h;
      Le.SlowBuffer = Qo;
      Le.INSPECT_MAX_BYTES = 50;
      var ht = 2147483647;
      Le.kMaxLength = ht;
      h.TYPED_ARRAY_SUPPORT = Mo();
      !h.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
      function Mo() {
        try {
          let r = new Uint8Array(1), e = { foo: a(function() {
            return 42;
          }, "foo") };
          return Object.setPrototypeOf(e, Uint8Array.prototype), Object.setPrototypeOf(r, e), r.foo() === 42;
        } catch {
          return false;
        }
      }
      a(Mo, "typedArraySupport");
      Object.defineProperty(h.prototype, "parent", { enumerable: true, get: a(function() {
        if (h.isBuffer(this))
          return this.buffer;
      }, "get") });
      Object.defineProperty(h.prototype, "offset", { enumerable: true, get: a(function() {
        if (h.isBuffer(
          this
        ))
          return this.byteOffset;
      }, "get") });
      function pe(r) {
        if (r > ht)
          throw new RangeError('The value "' + r + '" is invalid for option "size"');
        let e = new Uint8Array(r);
        return Object.setPrototypeOf(e, h.prototype), e;
      }
      a(pe, "createBuffer");
      function h(r, e, t) {
        if (typeof r == "number") {
          if (typeof e == "string")
            throw new TypeError(
              'The "string" argument must be of type string. Received type number'
            );
          return Gt(r);
        }
        return Vn(r, e, t);
      }
      a(h, "Buffer");
      h.poolSize = 8192;
      function Vn(r, e, t) {
        if (typeof r == "string")
          return Do(r, e);
        if (ArrayBuffer.isView(r))
          return Oo(r);
        if (r == null)
          throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof r);
        if (ce(r, ArrayBuffer) || r && ce(r.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (ce(r, SharedArrayBuffer) || r && ce(
          r.buffer,
          SharedArrayBuffer
        )))
          return Ht(r, e, t);
        if (typeof r == "number")
          throw new TypeError('The "value" argument must not be of type number. Received type number');
        let n = r.valueOf && r.valueOf();
        if (n != null && n !== r)
          return h.from(n, e, t);
        let i = qo(r);
        if (i)
          return i;
        if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof r[Symbol.toPrimitive] == "function")
          return h.from(r[Symbol.toPrimitive]("string"), e, t);
        throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof r);
      }
      a(Vn, "from");
      h.from = function(r, e, t) {
        return Vn(r, e, t);
      };
      Object.setPrototypeOf(
        h.prototype,
        Uint8Array.prototype
      );
      Object.setPrototypeOf(h, Uint8Array);
      function zn(r) {
        if (typeof r != "number")
          throw new TypeError(
            '"size" argument must be of type number'
          );
        if (r < 0)
          throw new RangeError('The value "' + r + '" is invalid for option "size"');
      }
      a(zn, "assertSize");
      function Uo(r, e, t) {
        return zn(r), r <= 0 ? pe(r) : e !== void 0 ? typeof t == "string" ? pe(r).fill(e, t) : pe(r).fill(e) : pe(r);
      }
      a(Uo, "alloc");
      h.alloc = function(r, e, t) {
        return Uo(r, e, t);
      };
      function Gt(r) {
        return zn(r), pe(r < 0 ? 0 : Vt(r) | 0);
      }
      a(Gt, "allocUnsafe");
      h.allocUnsafe = function(r) {
        return Gt(
          r
        );
      };
      h.allocUnsafeSlow = function(r) {
        return Gt(r);
      };
      function Do(r, e) {
        if ((typeof e != "string" || e === "") && (e = "utf8"), !h.isEncoding(e))
          throw new TypeError("Unknown encoding: " + e);
        let t = Kn(r, e) | 0, n = pe(t), i = n.write(
          r,
          e
        );
        return i !== t && (n = n.slice(0, i)), n;
      }
      a(Do, "fromString");
      function jt(r) {
        let e = r.length < 0 ? 0 : Vt(r.length) | 0, t = pe(e);
        for (let n = 0; n < e; n += 1)
          t[n] = r[n] & 255;
        return t;
      }
      a(jt, "fromArrayLike");
      function Oo(r) {
        if (ce(r, Uint8Array)) {
          let e = new Uint8Array(r);
          return Ht(e.buffer, e.byteOffset, e.byteLength);
        }
        return jt(r);
      }
      a(Oo, "fromArrayView");
      function Ht(r, e, t) {
        if (e < 0 || r.byteLength < e)
          throw new RangeError('"offset" is outside of buffer bounds');
        if (r.byteLength < e + (t || 0))
          throw new RangeError('"length" is outside of buffer bounds');
        let n;
        return e === void 0 && t === void 0 ? n = new Uint8Array(r) : t === void 0 ? n = new Uint8Array(r, e) : n = new Uint8Array(
          r,
          e,
          t
        ), Object.setPrototypeOf(n, h.prototype), n;
      }
      a(Ht, "fromArrayBuffer");
      function qo(r) {
        if (h.isBuffer(r)) {
          let e = Vt(r.length) | 0, t = pe(e);
          return t.length === 0 || r.copy(t, 0, 0, e), t;
        }
        if (r.length !== void 0)
          return typeof r.length != "number" || Kt(r.length) ? pe(0) : jt(r);
        if (r.type === "Buffer" && Array.isArray(r.data))
          return jt(r.data);
      }
      a(qo, "fromObject");
      function Vt(r) {
        if (r >= ht)
          throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + ht.toString(16) + " bytes");
        return r | 0;
      }
      a(Vt, "checked");
      function Qo(r) {
        return +r != r && (r = 0), h.alloc(+r);
      }
      a(Qo, "SlowBuffer");
      h.isBuffer = a(function(e) {
        return e != null && e._isBuffer === true && e !== h.prototype;
      }, "isBuffer");
      h.compare = a(function(e, t) {
        if (ce(e, Uint8Array) && (e = h.from(e, e.offset, e.byteLength)), ce(t, Uint8Array) && (t = h.from(t, t.offset, t.byteLength)), !h.isBuffer(e) || !h.isBuffer(t))
          throw new TypeError(
            'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
          );
        if (e === t)
          return 0;
        let n = e.length, i = t.length;
        for (let s = 0, o = Math.min(n, i); s < o; ++s)
          if (e[s] !== t[s]) {
            n = e[s], i = t[s];
            break;
          }
        return n < i ? -1 : i < n ? 1 : 0;
      }, "compare");
      h.isEncoding = a(function(e) {
        switch (String(e).toLowerCase()) {
          case "hex":
          case "utf8":
          case "utf-8":
          case "ascii":
          case "latin1":
          case "binary":
          case "base64":
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return true;
          default:
            return false;
        }
      }, "isEncoding");
      h.concat = a(function(e, t) {
        if (!Array.isArray(e))
          throw new TypeError(
            '"list" argument must be an Array of Buffers'
          );
        if (e.length === 0)
          return h.alloc(0);
        let n;
        if (t === void 0)
          for (t = 0, n = 0; n < e.length; ++n)
            t += e[n].length;
        let i = h.allocUnsafe(t), s = 0;
        for (n = 0; n < e.length; ++n) {
          let o = e[n];
          if (ce(o, Uint8Array))
            s + o.length > i.length ? (h.isBuffer(o) || (o = h.from(o)), o.copy(i, s)) : Uint8Array.prototype.set.call(i, o, s);
          else if (h.isBuffer(o))
            o.copy(i, s);
          else
            throw new TypeError('"list" argument must be an Array of Buffers');
          s += o.length;
        }
        return i;
      }, "concat");
      function Kn(r, e) {
        if (h.isBuffer(r))
          return r.length;
        if (ArrayBuffer.isView(r) || ce(r, ArrayBuffer))
          return r.byteLength;
        if (typeof r != "string")
          throw new TypeError(
            'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof r
          );
        let t = r.length, n = arguments.length > 2 && arguments[2] === true;
        if (!n && t === 0)
          return 0;
        let i = false;
        for (; ; )
          switch (e) {
            case "ascii":
            case "latin1":
            case "binary":
              return t;
            case "utf8":
            case "utf-8":
              return $t(r).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return t * 2;
            case "hex":
              return t >>> 1;
            case "base64":
              return ii(r).length;
            default:
              if (i)
                return n ? -1 : $t(r).length;
              e = ("" + e).toLowerCase(), i = true;
          }
      }
      a(Kn, "byteLength");
      h.byteLength = Kn;
      function No(r, e, t) {
        let n = false;
        if ((e === void 0 || e < 0) && (e = 0), e > this.length || ((t === void 0 || t > this.length) && (t = this.length), t <= 0) || (t >>>= 0, e >>>= 0, t <= e))
          return "";
        for (r || (r = "utf8"); ; )
          switch (r) {
            case "hex":
              return Zo(this, e, t);
            case "utf8":
            case "utf-8":
              return Zn(this, e, t);
            case "ascii":
              return Ko(this, e, t);
            case "latin1":
            case "binary":
              return Yo(
                this,
                e,
                t
              );
            case "base64":
              return Vo(this, e, t);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return Jo(
                this,
                e,
                t
              );
            default:
              if (n)
                throw new TypeError("Unknown encoding: " + r);
              r = (r + "").toLowerCase(), n = true;
          }
      }
      a(
        No,
        "slowToString"
      );
      h.prototype._isBuffer = true;
      function _e(r, e, t) {
        let n = r[e];
        r[e] = r[t], r[t] = n;
      }
      a(_e, "swap");
      h.prototype.swap16 = a(function() {
        let e = this.length;
        if (e % 2 !== 0)
          throw new RangeError("Buffer size must be a multiple of 16-bits");
        for (let t = 0; t < e; t += 2)
          _e(this, t, t + 1);
        return this;
      }, "swap16");
      h.prototype.swap32 = a(function() {
        let e = this.length;
        if (e % 4 !== 0)
          throw new RangeError("Buffer size must be a multiple of 32-bits");
        for (let t = 0; t < e; t += 4)
          _e(this, t, t + 3), _e(this, t + 1, t + 2);
        return this;
      }, "swap32");
      h.prototype.swap64 = a(
        function() {
          let e = this.length;
          if (e % 8 !== 0)
            throw new RangeError("Buffer size must be a multiple of 64-bits");
          for (let t = 0; t < e; t += 8)
            _e(this, t, t + 7), _e(this, t + 1, t + 6), _e(this, t + 2, t + 5), _e(this, t + 3, t + 4);
          return this;
        },
        "swap64"
      );
      h.prototype.toString = a(function() {
        let e = this.length;
        return e === 0 ? "" : arguments.length === 0 ? Zn(
          this,
          0,
          e
        ) : No.apply(this, arguments);
      }, "toString");
      h.prototype.toLocaleString = h.prototype.toString;
      h.prototype.equals = a(function(e) {
        if (!h.isBuffer(e))
          throw new TypeError("Argument must be a Buffer");
        return this === e ? true : h.compare(this, e) === 0;
      }, "equals");
      h.prototype.inspect = a(function() {
        let e = "", t = Le.INSPECT_MAX_BYTES;
        return e = this.toString("hex", 0, t).replace(/(.{2})/g, "$1 ").trim(), this.length > t && (e += " ... "), "<Buffer " + e + ">";
      }, "inspect");
      jn && (h.prototype[jn] = h.prototype.inspect);
      h.prototype.compare = a(function(e, t, n, i, s) {
        if (ce(e, Uint8Array) && (e = h.from(e, e.offset, e.byteLength)), !h.isBuffer(e))
          throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof e);
        if (t === void 0 && (t = 0), n === void 0 && (n = e ? e.length : 0), i === void 0 && (i = 0), s === void 0 && (s = this.length), t < 0 || n > e.length || i < 0 || s > this.length)
          throw new RangeError("out of range index");
        if (i >= s && t >= n)
          return 0;
        if (i >= s)
          return -1;
        if (t >= n)
          return 1;
        if (t >>>= 0, n >>>= 0, i >>>= 0, s >>>= 0, this === e)
          return 0;
        let o = s - i, u = n - t, c = Math.min(o, u), l = this.slice(
          i,
          s
        ), f = e.slice(t, n);
        for (let y = 0; y < c; ++y)
          if (l[y] !== f[y]) {
            o = l[y], u = f[y];
            break;
          }
        return o < u ? -1 : u < o ? 1 : 0;
      }, "compare");
      function Yn(r, e, t, n, i) {
        if (r.length === 0)
          return -1;
        if (typeof t == "string" ? (n = t, t = 0) : t > 2147483647 ? t = 2147483647 : t < -2147483648 && (t = -2147483648), t = +t, Kt(t) && (t = i ? 0 : r.length - 1), t < 0 && (t = r.length + t), t >= r.length) {
          if (i)
            return -1;
          t = r.length - 1;
        } else if (t < 0)
          if (i)
            t = 0;
          else
            return -1;
        if (typeof e == "string" && (e = h.from(
          e,
          n
        )), h.isBuffer(e))
          return e.length === 0 ? -1 : Hn(r, e, t, n, i);
        if (typeof e == "number")
          return e = e & 255, typeof Uint8Array.prototype.indexOf == "function" ? i ? Uint8Array.prototype.indexOf.call(r, e, t) : Uint8Array.prototype.lastIndexOf.call(r, e, t) : Hn(r, [e], t, n, i);
        throw new TypeError("val must be string, number or Buffer");
      }
      a(Yn, "bidirectionalIndexOf");
      function Hn(r, e, t, n, i) {
        let s = 1, o = r.length, u = e.length;
        if (n !== void 0 && (n = String(n).toLowerCase(), n === "ucs2" || n === "ucs-2" || n === "utf16le" || n === "utf-16le")) {
          if (r.length < 2 || e.length < 2)
            return -1;
          s = 2, o /= 2, u /= 2, t /= 2;
        }
        function c(f, y) {
          return s === 1 ? f[y] : f.readUInt16BE(y * s);
        }
        a(c, "read");
        let l;
        if (i) {
          let f = -1;
          for (l = t; l < o; l++)
            if (c(r, l) === c(e, f === -1 ? 0 : l - f)) {
              if (f === -1 && (f = l), l - f + 1 === u)
                return f * s;
            } else
              f !== -1 && (l -= l - f), f = -1;
        } else
          for (t + u > o && (t = o - u), l = t; l >= 0; l--) {
            let f = true;
            for (let y = 0; y < u; y++)
              if (c(r, l + y) !== c(e, y)) {
                f = false;
                break;
              }
            if (f)
              return l;
          }
        return -1;
      }
      a(Hn, "arrayIndexOf");
      h.prototype.includes = a(function(e, t, n) {
        return this.indexOf(
          e,
          t,
          n
        ) !== -1;
      }, "includes");
      h.prototype.indexOf = a(function(e, t, n) {
        return Yn(this, e, t, n, true);
      }, "indexOf");
      h.prototype.lastIndexOf = a(function(e, t, n) {
        return Yn(this, e, t, n, false);
      }, "lastIndexOf");
      function Wo(r, e, t, n) {
        t = Number(t) || 0;
        let i = r.length - t;
        n ? (n = Number(n), n > i && (n = i)) : n = i;
        let s = e.length;
        n > s / 2 && (n = s / 2);
        let o;
        for (o = 0; o < n; ++o) {
          let u = parseInt(e.substr(o * 2, 2), 16);
          if (Kt(u))
            return o;
          r[t + o] = u;
        }
        return o;
      }
      a(Wo, "hexWrite");
      function jo(r, e, t, n) {
        return pt($t(e, r.length - t), r, t, n);
      }
      a(jo, "utf8Write");
      function Ho(r, e, t, n) {
        return pt(ra(e), r, t, n);
      }
      a(
        Ho,
        "asciiWrite"
      );
      function $o(r, e, t, n) {
        return pt(ii(e), r, t, n);
      }
      a($o, "base64Write");
      function Go(r, e, t, n) {
        return pt(
          na(e, r.length - t),
          r,
          t,
          n
        );
      }
      a(Go, "ucs2Write");
      h.prototype.write = a(function(e, t, n, i) {
        if (t === void 0)
          i = "utf8", n = this.length, t = 0;
        else if (n === void 0 && typeof t == "string")
          i = t, n = this.length, t = 0;
        else if (isFinite(t))
          t = t >>> 0, isFinite(n) ? (n = n >>> 0, i === void 0 && (i = "utf8")) : (i = n, n = void 0);
        else
          throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
        let s = this.length - t;
        if ((n === void 0 || n > s) && (n = s), e.length > 0 && (n < 0 || t < 0) || t > this.length)
          throw new RangeError("Attempt to write outside buffer bounds");
        i || (i = "utf8");
        let o = false;
        for (; ; )
          switch (i) {
            case "hex":
              return Wo(this, e, t, n);
            case "utf8":
            case "utf-8":
              return jo(this, e, t, n);
            case "ascii":
            case "latin1":
            case "binary":
              return Ho(this, e, t, n);
            case "base64":
              return $o(this, e, t, n);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return Go(this, e, t, n);
            default:
              if (o)
                throw new TypeError("Unknown encoding: " + i);
              i = ("" + i).toLowerCase(), o = true;
          }
      }, "write");
      h.prototype.toJSON = a(function() {
        return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
      }, "toJSON");
      function Vo(r, e, t) {
        return e === 0 && t === r.length ? Wt.fromByteArray(r) : Wt.fromByteArray(r.slice(e, t));
      }
      a(Vo, "base64Slice");
      function Zn(r, e, t) {
        t = Math.min(r.length, t);
        let n = [], i = e;
        for (; i < t; ) {
          let s = r[i], o = null, u = s > 239 ? 4 : s > 223 ? 3 : s > 191 ? 2 : 1;
          if (i + u <= t) {
            let c, l, f, y;
            switch (u) {
              case 1:
                s < 128 && (o = s);
                break;
              case 2:
                c = r[i + 1], (c & 192) === 128 && (y = (s & 31) << 6 | c & 63, y > 127 && (o = y));
                break;
              case 3:
                c = r[i + 1], l = r[i + 2], (c & 192) === 128 && (l & 192) === 128 && (y = (s & 15) << 12 | (c & 63) << 6 | l & 63, y > 2047 && (y < 55296 || y > 57343) && (o = y));
                break;
              case 4:
                c = r[i + 1], l = r[i + 2], f = r[i + 3], (c & 192) === 128 && (l & 192) === 128 && (f & 192) === 128 && (y = (s & 15) << 18 | (c & 63) << 12 | (l & 63) << 6 | f & 63, y > 65535 && y < 1114112 && (o = y));
            }
          }
          o === null ? (o = 65533, u = 1) : o > 65535 && (o -= 65536, n.push(o >>> 10 & 1023 | 55296), o = 56320 | o & 1023), n.push(o), i += u;
        }
        return zo(n);
      }
      a(Zn, "utf8Slice");
      var $n = 4096;
      function zo(r) {
        let e = r.length;
        if (e <= $n)
          return String.fromCharCode.apply(String, r);
        let t = "", n = 0;
        for (; n < e; )
          t += String.fromCharCode.apply(String, r.slice(n, n += $n));
        return t;
      }
      a(zo, "decodeCodePointsArray");
      function Ko(r, e, t) {
        let n = "";
        t = Math.min(r.length, t);
        for (let i = e; i < t; ++i)
          n += String.fromCharCode(r[i] & 127);
        return n;
      }
      a(Ko, "asciiSlice");
      function Yo(r, e, t) {
        let n = "";
        t = Math.min(r.length, t);
        for (let i = e; i < t; ++i)
          n += String.fromCharCode(r[i]);
        return n;
      }
      a(Yo, "latin1Slice");
      function Zo(r, e, t) {
        let n = r.length;
        (!e || e < 0) && (e = 0), (!t || t < 0 || t > n) && (t = n);
        let i = "";
        for (let s = e; s < t; ++s)
          i += ia[r[s]];
        return i;
      }
      a(Zo, "hexSlice");
      function Jo(r, e, t) {
        let n = r.slice(e, t), i = "";
        for (let s = 0; s < n.length - 1; s += 2)
          i += String.fromCharCode(n[s] + n[s + 1] * 256);
        return i;
      }
      a(Jo, "utf16leSlice");
      h.prototype.slice = a(function(e, t) {
        let n = this.length;
        e = ~~e, t = t === void 0 ? n : ~~t, e < 0 ? (e += n, e < 0 && (e = 0)) : e > n && (e = n), t < 0 ? (t += n, t < 0 && (t = 0)) : t > n && (t = n), t < e && (t = e);
        let i = this.subarray(e, t);
        return Object.setPrototypeOf(i, h.prototype), i;
      }, "slice");
      function q(r, e, t) {
        if (r % 1 !== 0 || r < 0)
          throw new RangeError("offset is not uint");
        if (r + e > t)
          throw new RangeError("Trying to access beyond buffer length");
      }
      a(q, "checkOffset");
      h.prototype.readUintLE = h.prototype.readUIntLE = a(
        function(e, t, n) {
          e = e >>> 0, t = t >>> 0, n || q(e, t, this.length);
          let i = this[e], s = 1, o = 0;
          for (; ++o < t && (s *= 256); )
            i += this[e + o] * s;
          return i;
        },
        "readUIntLE"
      );
      h.prototype.readUintBE = h.prototype.readUIntBE = a(function(e, t, n) {
        e = e >>> 0, t = t >>> 0, n || q(
          e,
          t,
          this.length
        );
        let i = this[e + --t], s = 1;
        for (; t > 0 && (s *= 256); )
          i += this[e + --t] * s;
        return i;
      }, "readUIntBE");
      h.prototype.readUint8 = h.prototype.readUInt8 = a(
        function(e, t) {
          return e = e >>> 0, t || q(e, 1, this.length), this[e];
        },
        "readUInt8"
      );
      h.prototype.readUint16LE = h.prototype.readUInt16LE = a(function(e, t) {
        return e = e >>> 0, t || q(
          e,
          2,
          this.length
        ), this[e] | this[e + 1] << 8;
      }, "readUInt16LE");
      h.prototype.readUint16BE = h.prototype.readUInt16BE = a(function(e, t) {
        return e = e >>> 0, t || q(e, 2, this.length), this[e] << 8 | this[e + 1];
      }, "readUInt16BE");
      h.prototype.readUint32LE = h.prototype.readUInt32LE = a(function(e, t) {
        return e = e >>> 0, t || q(e, 4, this.length), (this[e] | this[e + 1] << 8 | this[e + 2] << 16) + this[e + 3] * 16777216;
      }, "readUInt32LE");
      h.prototype.readUint32BE = h.prototype.readUInt32BE = a(function(e, t) {
        return e = e >>> 0, t || q(e, 4, this.length), this[e] * 16777216 + (this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]);
      }, "readUInt32BE");
      h.prototype.readBigUInt64LE = be(a(function(e) {
        e = e >>> 0, Re(e, "offset");
        let t = this[e], n = this[e + 7];
        (t === void 0 || n === void 0) && Ve(e, this.length - 8);
        let i = t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24, s = this[++e] + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + n * 2 ** 24;
        return BigInt(i) + (BigInt(s) << BigInt(32));
      }, "readBigUInt64LE"));
      h.prototype.readBigUInt64BE = be(a(function(e) {
        e = e >>> 0, Re(e, "offset");
        let t = this[e], n = this[e + 7];
        (t === void 0 || n === void 0) && Ve(e, this.length - 8);
        let i = t * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e], s = this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + n;
        return (BigInt(i) << BigInt(
          32
        )) + BigInt(s);
      }, "readBigUInt64BE"));
      h.prototype.readIntLE = a(function(e, t, n) {
        e = e >>> 0, t = t >>> 0, n || q(
          e,
          t,
          this.length
        );
        let i = this[e], s = 1, o = 0;
        for (; ++o < t && (s *= 256); )
          i += this[e + o] * s;
        return s *= 128, i >= s && (i -= Math.pow(2, 8 * t)), i;
      }, "readIntLE");
      h.prototype.readIntBE = a(function(e, t, n) {
        e = e >>> 0, t = t >>> 0, n || q(e, t, this.length);
        let i = t, s = 1, o = this[e + --i];
        for (; i > 0 && (s *= 256); )
          o += this[e + --i] * s;
        return s *= 128, o >= s && (o -= Math.pow(2, 8 * t)), o;
      }, "readIntBE");
      h.prototype.readInt8 = a(function(e, t) {
        return e = e >>> 0, t || q(e, 1, this.length), this[e] & 128 ? (255 - this[e] + 1) * -1 : this[e];
      }, "readInt8");
      h.prototype.readInt16LE = a(function(e, t) {
        e = e >>> 0, t || q(
          e,
          2,
          this.length
        );
        let n = this[e] | this[e + 1] << 8;
        return n & 32768 ? n | 4294901760 : n;
      }, "readInt16LE");
      h.prototype.readInt16BE = a(function(e, t) {
        e = e >>> 0, t || q(e, 2, this.length);
        let n = this[e + 1] | this[e] << 8;
        return n & 32768 ? n | 4294901760 : n;
      }, "readInt16BE");
      h.prototype.readInt32LE = a(function(e, t) {
        return e = e >>> 0, t || q(e, 4, this.length), this[e] | this[e + 1] << 8 | this[e + 2] << 16 | this[e + 3] << 24;
      }, "readInt32LE");
      h.prototype.readInt32BE = a(function(e, t) {
        return e = e >>> 0, t || q(e, 4, this.length), this[e] << 24 | this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3];
      }, "readInt32BE");
      h.prototype.readBigInt64LE = be(a(function(e) {
        e = e >>> 0, Re(e, "offset");
        let t = this[e], n = this[e + 7];
        (t === void 0 || n === void 0) && Ve(e, this.length - 8);
        let i = this[e + 4] + this[e + 5] * 2 ** 8 + this[e + 6] * 2 ** 16 + (n << 24);
        return (BigInt(i) << BigInt(
          32
        )) + BigInt(t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24);
      }, "readBigInt64LE"));
      h.prototype.readBigInt64BE = be(a(function(e) {
        e = e >>> 0, Re(e, "offset");
        let t = this[e], n = this[e + 7];
        (t === void 0 || n === void 0) && Ve(e, this.length - 8);
        let i = (t << 24) + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e];
        return (BigInt(i) << BigInt(32)) + BigInt(
          this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + n
        );
      }, "readBigInt64BE"));
      h.prototype.readFloatLE = a(function(e, t) {
        return e = e >>> 0, t || q(e, 4, this.length), Be.read(this, e, true, 23, 4);
      }, "readFloatLE");
      h.prototype.readFloatBE = a(function(e, t) {
        return e = e >>> 0, t || q(e, 4, this.length), Be.read(this, e, false, 23, 4);
      }, "readFloatBE");
      h.prototype.readDoubleLE = a(function(e, t) {
        return e = e >>> 0, t || q(e, 8, this.length), Be.read(this, e, true, 52, 8);
      }, "readDoubleLE");
      h.prototype.readDoubleBE = a(function(e, t) {
        return e = e >>> 0, t || q(e, 8, this.length), Be.read(
          this,
          e,
          false,
          52,
          8
        );
      }, "readDoubleBE");
      function V(r, e, t, n, i, s) {
        if (!h.isBuffer(r))
          throw new TypeError('"buffer" argument must be a Buffer instance');
        if (e > i || e < s)
          throw new RangeError('"value" argument is out of bounds');
        if (t + n > r.length)
          throw new RangeError("Index out of range");
      }
      a(V, "checkInt");
      h.prototype.writeUintLE = h.prototype.writeUIntLE = a(function(e, t, n, i) {
        if (e = +e, t = t >>> 0, n = n >>> 0, !i) {
          let u = Math.pow(2, 8 * n) - 1;
          V(
            this,
            e,
            t,
            n,
            u,
            0
          );
        }
        let s = 1, o = 0;
        for (this[t] = e & 255; ++o < n && (s *= 256); )
          this[t + o] = e / s & 255;
        return t + n;
      }, "writeUIntLE");
      h.prototype.writeUintBE = h.prototype.writeUIntBE = a(function(e, t, n, i) {
        if (e = +e, t = t >>> 0, n = n >>> 0, !i) {
          let u = Math.pow(2, 8 * n) - 1;
          V(this, e, t, n, u, 0);
        }
        let s = n - 1, o = 1;
        for (this[t + s] = e & 255; --s >= 0 && (o *= 256); )
          this[t + s] = e / o & 255;
        return t + n;
      }, "writeUIntBE");
      h.prototype.writeUint8 = h.prototype.writeUInt8 = a(function(e, t, n) {
        return e = +e, t = t >>> 0, n || V(this, e, t, 1, 255, 0), this[t] = e & 255, t + 1;
      }, "writeUInt8");
      h.prototype.writeUint16LE = h.prototype.writeUInt16LE = a(function(e, t, n) {
        return e = +e, t = t >>> 0, n || V(this, e, t, 2, 65535, 0), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2;
      }, "writeUInt16LE");
      h.prototype.writeUint16BE = h.prototype.writeUInt16BE = a(function(e, t, n) {
        return e = +e, t = t >>> 0, n || V(this, e, t, 2, 65535, 0), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2;
      }, "writeUInt16BE");
      h.prototype.writeUint32LE = h.prototype.writeUInt32LE = a(function(e, t, n) {
        return e = +e, t = t >>> 0, n || V(
          this,
          e,
          t,
          4,
          4294967295,
          0
        ), this[t + 3] = e >>> 24, this[t + 2] = e >>> 16, this[t + 1] = e >>> 8, this[t] = e & 255, t + 4;
      }, "writeUInt32LE");
      h.prototype.writeUint32BE = h.prototype.writeUInt32BE = a(function(e, t, n) {
        return e = +e, t = t >>> 0, n || V(
          this,
          e,
          t,
          4,
          4294967295,
          0
        ), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4;
      }, "writeUInt32BE");
      function Jn(r, e, t, n, i) {
        ni(e, n, i, r, t, 7);
        let s = Number(e & BigInt(4294967295));
        r[t++] = s, s = s >> 8, r[t++] = s, s = s >> 8, r[t++] = s, s = s >> 8, r[t++] = s;
        let o = Number(e >> BigInt(32) & BigInt(4294967295));
        return r[t++] = o, o = o >> 8, r[t++] = o, o = o >> 8, r[t++] = o, o = o >> 8, r[t++] = o, t;
      }
      a(Jn, "wrtBigUInt64LE");
      function Xn(r, e, t, n, i) {
        ni(e, n, i, r, t, 7);
        let s = Number(e & BigInt(4294967295));
        r[t + 7] = s, s = s >> 8, r[t + 6] = s, s = s >> 8, r[t + 5] = s, s = s >> 8, r[t + 4] = s;
        let o = Number(e >> BigInt(32) & BigInt(4294967295));
        return r[t + 3] = o, o = o >> 8, r[t + 2] = o, o = o >> 8, r[t + 1] = o, o = o >> 8, r[t] = o, t + 8;
      }
      a(Xn, "wrtBigUInt64BE");
      h.prototype.writeBigUInt64LE = be(a(function(e, t = 0) {
        return Jn(this, e, t, BigInt(0), BigInt("0xffffffffffffffff"));
      }, "writeBigUInt64LE"));
      h.prototype.writeBigUInt64BE = be(a(function(e, t = 0) {
        return Xn(this, e, t, BigInt(0), BigInt(
          "0xffffffffffffffff"
        ));
      }, "writeBigUInt64BE"));
      h.prototype.writeIntLE = a(function(e, t, n, i) {
        if (e = +e, t = t >>> 0, !i) {
          let c = Math.pow(2, 8 * n - 1);
          V(this, e, t, n, c - 1, -c);
        }
        let s = 0, o = 1, u = 0;
        for (this[t] = e & 255; ++s < n && (o *= 256); )
          e < 0 && u === 0 && this[t + s - 1] !== 0 && (u = 1), this[t + s] = (e / o >> 0) - u & 255;
        return t + n;
      }, "writeIntLE");
      h.prototype.writeIntBE = a(function(e, t, n, i) {
        if (e = +e, t = t >>> 0, !i) {
          let c = Math.pow(2, 8 * n - 1);
          V(this, e, t, n, c - 1, -c);
        }
        let s = n - 1, o = 1, u = 0;
        for (this[t + s] = e & 255; --s >= 0 && (o *= 256); )
          e < 0 && u === 0 && this[t + s + 1] !== 0 && (u = 1), this[t + s] = (e / o >> 0) - u & 255;
        return t + n;
      }, "writeIntBE");
      h.prototype.writeInt8 = a(function(e, t, n) {
        return e = +e, t = t >>> 0, n || V(this, e, t, 1, 127, -128), e < 0 && (e = 255 + e + 1), this[t] = e & 255, t + 1;
      }, "writeInt8");
      h.prototype.writeInt16LE = a(function(e, t, n) {
        return e = +e, t = t >>> 0, n || V(this, e, t, 2, 32767, -32768), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2;
      }, "writeInt16LE");
      h.prototype.writeInt16BE = a(function(e, t, n) {
        return e = +e, t = t >>> 0, n || V(this, e, t, 2, 32767, -32768), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2;
      }, "writeInt16BE");
      h.prototype.writeInt32LE = a(function(e, t, n) {
        return e = +e, t = t >>> 0, n || V(
          this,
          e,
          t,
          4,
          2147483647,
          -2147483648
        ), this[t] = e & 255, this[t + 1] = e >>> 8, this[t + 2] = e >>> 16, this[t + 3] = e >>> 24, t + 4;
      }, "writeInt32LE");
      h.prototype.writeInt32BE = a(function(e, t, n) {
        return e = +e, t = t >>> 0, n || V(
          this,
          e,
          t,
          4,
          2147483647,
          -2147483648
        ), e < 0 && (e = 4294967295 + e + 1), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4;
      }, "writeInt32BE");
      h.prototype.writeBigInt64LE = be(a(function(e, t = 0) {
        return Jn(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
      }, "writeBigInt64LE"));
      h.prototype.writeBigInt64BE = be(
        a(function(e, t = 0) {
          return Xn(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
        }, "writeBigInt64BE")
      );
      function ei(r, e, t, n, i, s) {
        if (t + n > r.length)
          throw new RangeError("Index out of range");
        if (t < 0)
          throw new RangeError("Index out of range");
      }
      a(ei, "checkIEEE754");
      function ti(r, e, t, n, i) {
        return e = +e, t = t >>> 0, i || ei(r, e, t, 4, 34028234663852886e22, -34028234663852886e22), Be.write(r, e, t, n, 23, 4), t + 4;
      }
      a(
        ti,
        "writeFloat"
      );
      h.prototype.writeFloatLE = a(function(e, t, n) {
        return ti(this, e, t, true, n);
      }, "writeFloatLE");
      h.prototype.writeFloatBE = a(function(e, t, n) {
        return ti(this, e, t, false, n);
      }, "writeFloatBE");
      function ri(r, e, t, n, i) {
        return e = +e, t = t >>> 0, i || ei(r, e, t, 8, 17976931348623157e292, -17976931348623157e292), Be.write(
          r,
          e,
          t,
          n,
          52,
          8
        ), t + 8;
      }
      a(ri, "writeDouble");
      h.prototype.writeDoubleLE = a(function(e, t, n) {
        return ri(this, e, t, true, n);
      }, "writeDoubleLE");
      h.prototype.writeDoubleBE = a(function(e, t, n) {
        return ri(this, e, t, false, n);
      }, "writeDoubleBE");
      h.prototype.copy = a(function(e, t, n, i) {
        if (!h.isBuffer(e))
          throw new TypeError("argument should be a Buffer");
        if (n || (n = 0), !i && i !== 0 && (i = this.length), t >= e.length && (t = e.length), t || (t = 0), i > 0 && i < n && (i = n), i === n || e.length === 0 || this.length === 0)
          return 0;
        if (t < 0)
          throw new RangeError("targetStart out of bounds");
        if (n < 0 || n >= this.length)
          throw new RangeError("Index out of range");
        if (i < 0)
          throw new RangeError("sourceEnd out of bounds");
        i > this.length && (i = this.length), e.length - t < i - n && (i = e.length - t + n);
        let s = i - n;
        return this === e && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(t, n, i) : Uint8Array.prototype.set.call(e, this.subarray(n, i), t), s;
      }, "copy");
      h.prototype.fill = a(function(e, t, n, i) {
        if (typeof e == "string") {
          if (typeof t == "string" ? (i = t, t = 0, n = this.length) : typeof n == "string" && (i = n, n = this.length), i !== void 0 && typeof i != "string")
            throw new TypeError("encoding must be a string");
          if (typeof i == "string" && !h.isEncoding(i))
            throw new TypeError(
              "Unknown encoding: " + i
            );
          if (e.length === 1) {
            let o = e.charCodeAt(0);
            (i === "utf8" && o < 128 || i === "latin1") && (e = o);
          }
        } else
          typeof e == "number" ? e = e & 255 : typeof e == "boolean" && (e = Number(e));
        if (t < 0 || this.length < t || this.length < n)
          throw new RangeError("Out of range index");
        if (n <= t)
          return this;
        t = t >>> 0, n = n === void 0 ? this.length : n >>> 0, e || (e = 0);
        let s;
        if (typeof e == "number")
          for (s = t; s < n; ++s)
            this[s] = e;
        else {
          let o = h.isBuffer(e) ? e : h.from(
            e,
            i
          ), u = o.length;
          if (u === 0)
            throw new TypeError('The value "' + e + '" is invalid for argument "value"');
          for (s = 0; s < n - t; ++s)
            this[s + t] = o[s % u];
        }
        return this;
      }, "fill");
      var Pe = {};
      function zt(r, e, t) {
        var n;
        Pe[r] = (n = class extends t {
          constructor() {
            super(), Object.defineProperty(this, "message", { value: e.apply(this, arguments), writable: true, configurable: true }), this.name = `${this.name} [${r}]`, this.stack, delete this.name;
          }
          get code() {
            return r;
          }
          set code(s) {
            Object.defineProperty(
              this,
              "code",
              { configurable: true, enumerable: true, value: s, writable: true }
            );
          }
          toString() {
            return `${this.name} [${r}]: ${this.message}`;
          }
        }, a(n, "NodeError"), n);
      }
      a(zt, "E");
      zt("ERR_BUFFER_OUT_OF_BOUNDS", function(r) {
        return r ? `${r} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds";
      }, RangeError);
      zt(
        "ERR_INVALID_ARG_TYPE",
        function(r, e) {
          return `The "${r}" argument must be of type number. Received type ${typeof e}`;
        },
        TypeError
      );
      zt("ERR_OUT_OF_RANGE", function(r, e, t) {
        let n = `The value of "${r}" is out of range.`, i = t;
        return Number.isInteger(t) && Math.abs(t) > 2 ** 32 ? i = Gn(String(t)) : typeof t == "bigint" && (i = String(
          t
        ), (t > BigInt(2) ** BigInt(32) || t < -(BigInt(2) ** BigInt(32))) && (i = Gn(i)), i += "n"), n += ` It must be ${e}. Received ${i}`, n;
      }, RangeError);
      function Gn(r) {
        let e = "", t = r.length, n = r[0] === "-" ? 1 : 0;
        for (; t >= n + 4; t -= 3)
          e = `_${r.slice(t - 3, t)}${e}`;
        return `${r.slice(0, t)}${e}`;
      }
      a(Gn, "addNumericalSeparator");
      function Xo(r, e, t) {
        Re(e, "offset"), (r[e] === void 0 || r[e + t] === void 0) && Ve(e, r.length - (t + 1));
      }
      a(Xo, "checkBounds");
      function ni(r, e, t, n, i, s) {
        if (r > t || r < e) {
          let o = typeof e == "bigint" ? "n" : "", u;
          throw s > 3 ? e === 0 || e === BigInt(0) ? u = `>= 0${o} and < 2${o} ** ${(s + 1) * 8}${o}` : u = `>= -(2${o} ** ${(s + 1) * 8 - 1}${o}) and < 2 ** ${(s + 1) * 8 - 1}${o}` : u = `>= ${e}${o} and <= ${t}${o}`, new Pe.ERR_OUT_OF_RANGE("value", u, r);
        }
        Xo(n, i, s);
      }
      a(ni, "checkIntBI");
      function Re(r, e) {
        if (typeof r != "number")
          throw new Pe.ERR_INVALID_ARG_TYPE(e, "number", r);
      }
      a(Re, "validateNumber");
      function Ve(r, e, t) {
        throw Math.floor(r) !== r ? (Re(r, t), new Pe.ERR_OUT_OF_RANGE(t || "offset", "an integer", r)) : e < 0 ? new Pe.ERR_BUFFER_OUT_OF_BOUNDS() : new Pe.ERR_OUT_OF_RANGE(t || "offset", `>= ${t ? 1 : 0} and <= ${e}`, r);
      }
      a(Ve, "boundsError");
      var ea = /[^+/0-9A-Za-z-_]/g;
      function ta(r) {
        if (r = r.split("=")[0], r = r.trim().replace(ea, ""), r.length < 2)
          return "";
        for (; r.length % 4 !== 0; )
          r = r + "=";
        return r;
      }
      a(ta, "base64clean");
      function $t(r, e) {
        e = e || 1 / 0;
        let t, n = r.length, i = null, s = [];
        for (let o = 0; o < n; ++o) {
          if (t = r.charCodeAt(o), t > 55295 && t < 57344) {
            if (!i) {
              if (t > 56319) {
                (e -= 3) > -1 && s.push(239, 191, 189);
                continue;
              } else if (o + 1 === n) {
                (e -= 3) > -1 && s.push(239, 191, 189);
                continue;
              }
              i = t;
              continue;
            }
            if (t < 56320) {
              (e -= 3) > -1 && s.push(239, 191, 189), i = t;
              continue;
            }
            t = (i - 55296 << 10 | t - 56320) + 65536;
          } else
            i && (e -= 3) > -1 && s.push(239, 191, 189);
          if (i = null, t < 128) {
            if ((e -= 1) < 0)
              break;
            s.push(t);
          } else if (t < 2048) {
            if ((e -= 2) < 0)
              break;
            s.push(t >> 6 | 192, t & 63 | 128);
          } else if (t < 65536) {
            if ((e -= 3) < 0)
              break;
            s.push(t >> 12 | 224, t >> 6 & 63 | 128, t & 63 | 128);
          } else if (t < 1114112) {
            if ((e -= 4) < 0)
              break;
            s.push(t >> 18 | 240, t >> 12 & 63 | 128, t >> 6 & 63 | 128, t & 63 | 128);
          } else
            throw new Error("Invalid code point");
        }
        return s;
      }
      a($t, "utf8ToBytes");
      function ra(r) {
        let e = [];
        for (let t = 0; t < r.length; ++t)
          e.push(r.charCodeAt(t) & 255);
        return e;
      }
      a(
        ra,
        "asciiToBytes"
      );
      function na(r, e) {
        let t, n, i, s = [];
        for (let o = 0; o < r.length && !((e -= 2) < 0); ++o)
          t = r.charCodeAt(
            o
          ), n = t >> 8, i = t % 256, s.push(i), s.push(n);
        return s;
      }
      a(na, "utf16leToBytes");
      function ii(r) {
        return Wt.toByteArray(
          ta(r)
        );
      }
      a(ii, "base64ToBytes");
      function pt(r, e, t, n) {
        let i;
        for (i = 0; i < n && !(i + t >= e.length || i >= r.length); ++i)
          e[i + t] = r[i];
        return i;
      }
      a(pt, "blitBuffer");
      function ce(r, e) {
        return r instanceof e || r != null && r.constructor != null && r.constructor.name != null && r.constructor.name === e.name;
      }
      a(ce, "isInstance");
      function Kt(r) {
        return r !== r;
      }
      a(Kt, "numberIsNaN");
      var ia = function() {
        let r = "0123456789abcdef", e = new Array(256);
        for (let t = 0; t < 16; ++t) {
          let n = t * 16;
          for (let i = 0; i < 16; ++i)
            e[n + i] = r[t] + r[i];
        }
        return e;
      }();
      function be(r) {
        return typeof BigInt > "u" ? sa : r;
      }
      a(be, "defineBigIntMethod");
      function sa() {
        throw new Error("BigInt not supported");
      }
      a(sa, "BufferBigIntNotDefined");
    });
    var b;
    var v;
    var x;
    var d;
    var m;
    var p = G(() => {
      "use strict";
      b = globalThis, v = globalThis.setImmediate ?? ((r) => setTimeout(r, 0)), x = globalThis.clearImmediate ?? ((r) => clearTimeout(r)), d = typeof globalThis.Buffer == "function" && typeof globalThis.Buffer.allocUnsafe == "function" ? globalThis.Buffer : si().Buffer, m = globalThis.process ?? {};
      m.env ?? (m.env = {});
      try {
        m.nextTick(() => {
        });
      } catch {
        let e = Promise.resolve();
        m.nextTick = e.then.bind(e);
      }
    });
    var ve = T((Fl, Yt) => {
      "use strict";
      p();
      var Fe = typeof Reflect == "object" ? Reflect : null, oi = Fe && typeof Fe.apply == "function" ? Fe.apply : a(function(e, t, n) {
        return Function.prototype.apply.call(e, t, n);
      }, "ReflectApply"), dt;
      Fe && typeof Fe.ownKeys == "function" ? dt = Fe.ownKeys : Object.getOwnPropertySymbols ? dt = a(function(e) {
        return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e));
      }, "ReflectOwnKeys") : dt = a(function(e) {
        return Object.getOwnPropertyNames(e);
      }, "ReflectOwnKeys");
      function oa(r) {
        console && console.warn && console.warn(r);
      }
      a(
        oa,
        "ProcessEmitWarning"
      );
      var ui = Number.isNaN || a(function(e) {
        return e !== e;
      }, "NumberIsNaN");
      function B() {
        B.init.call(this);
      }
      a(B, "EventEmitter");
      Yt.exports = B;
      Yt.exports.once = la;
      B.EventEmitter = B;
      B.prototype._events = void 0;
      B.prototype._eventsCount = 0;
      B.prototype._maxListeners = void 0;
      var ai = 10;
      function yt(r) {
        if (typeof r != "function")
          throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof r);
      }
      a(yt, "checkListener");
      Object.defineProperty(B, "defaultMaxListeners", { enumerable: true, get: a(function() {
        return ai;
      }, "get"), set: a(
        function(r) {
          if (typeof r != "number" || r < 0 || ui(r))
            throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + r + ".");
          ai = r;
        },
        "set"
      ) });
      B.init = function() {
        (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) && (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0;
      };
      B.prototype.setMaxListeners = a(function(e) {
        if (typeof e != "number" || e < 0 || ui(e))
          throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + e + ".");
        return this._maxListeners = e, this;
      }, "setMaxListeners");
      function ci(r) {
        return r._maxListeners === void 0 ? B.defaultMaxListeners : r._maxListeners;
      }
      a(ci, "_getMaxListeners");
      B.prototype.getMaxListeners = a(function() {
        return ci(this);
      }, "getMaxListeners");
      B.prototype.emit = a(function(e) {
        for (var t = [], n = 1; n < arguments.length; n++)
          t.push(arguments[n]);
        var i = e === "error", s = this._events;
        if (s !== void 0)
          i = i && s.error === void 0;
        else if (!i)
          return false;
        if (i) {
          var o;
          if (t.length > 0 && (o = t[0]), o instanceof Error)
            throw o;
          var u = new Error("Unhandled error." + (o ? " (" + o.message + ")" : ""));
          throw u.context = o, u;
        }
        var c = s[e];
        if (c === void 0)
          return false;
        if (typeof c == "function")
          oi(c, this, t);
        else
          for (var l = c.length, f = di(c, l), n = 0; n < l; ++n)
            oi(f[n], this, t);
        return true;
      }, "emit");
      function li(r, e, t, n) {
        var i, s, o;
        if (yt(
          t
        ), s = r._events, s === void 0 ? (s = r._events = /* @__PURE__ */ Object.create(null), r._eventsCount = 0) : (s.newListener !== void 0 && (r.emit("newListener", e, t.listener ? t.listener : t), s = r._events), o = s[e]), o === void 0)
          o = s[e] = t, ++r._eventsCount;
        else if (typeof o == "function" ? o = s[e] = n ? [t, o] : [o, t] : n ? o.unshift(t) : o.push(t), i = ci(r), i > 0 && o.length > i && !o.warned) {
          o.warned = true;
          var u = new Error("Possible EventEmitter memory leak detected. " + o.length + " " + String(e) + " listeners added. Use emitter.setMaxListeners() to increase limit");
          u.name = "MaxListenersExceededWarning", u.emitter = r, u.type = e, u.count = o.length, oa(u);
        }
        return r;
      }
      a(li, "_addListener");
      B.prototype.addListener = a(function(e, t) {
        return li(this, e, t, false);
      }, "addListener");
      B.prototype.on = B.prototype.addListener;
      B.prototype.prependListener = a(function(e, t) {
        return li(this, e, t, true);
      }, "prependListener");
      function aa() {
        if (!this.fired)
          return this.target.removeListener(this.type, this.wrapFn), this.fired = true, arguments.length === 0 ? this.listener.call(this.target) : this.listener.apply(this.target, arguments);
      }
      a(aa, "onceWrapper");
      function fi(r, e, t) {
        var n = {
          fired: false,
          wrapFn: void 0,
          target: r,
          type: e,
          listener: t
        }, i = aa.bind(n);
        return i.listener = t, n.wrapFn = i, i;
      }
      a(fi, "_onceWrap");
      B.prototype.once = a(function(e, t) {
        return yt(t), this.on(e, fi(this, e, t)), this;
      }, "once");
      B.prototype.prependOnceListener = a(function(e, t) {
        return yt(t), this.prependListener(e, fi(this, e, t)), this;
      }, "prependOnceListener");
      B.prototype.removeListener = a(function(e, t) {
        var n, i, s, o, u;
        if (yt(t), i = this._events, i === void 0)
          return this;
        if (n = i[e], n === void 0)
          return this;
        if (n === t || n.listener === t)
          --this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : (delete i[e], i.removeListener && this.emit("removeListener", e, n.listener || t));
        else if (typeof n != "function") {
          for (s = -1, o = n.length - 1; o >= 0; o--)
            if (n[o] === t || n[o].listener === t) {
              u = n[o].listener, s = o;
              break;
            }
          if (s < 0)
            return this;
          s === 0 ? n.shift() : ua(n, s), n.length === 1 && (i[e] = n[0]), i.removeListener !== void 0 && this.emit("removeListener", e, u || t);
        }
        return this;
      }, "removeListener");
      B.prototype.off = B.prototype.removeListener;
      B.prototype.removeAllListeners = a(function(e) {
        var t, n, i;
        if (n = this._events, n === void 0)
          return this;
        if (n.removeListener === void 0)
          return arguments.length === 0 ? (this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0) : n[e] !== void 0 && (--this._eventsCount === 0 ? this._events = /* @__PURE__ */ Object.create(null) : delete n[e]), this;
        if (arguments.length === 0) {
          var s = Object.keys(n), o;
          for (i = 0; i < s.length; ++i)
            o = s[i], o !== "removeListener" && this.removeAllListeners(
              o
            );
          return this.removeAllListeners("removeListener"), this._events = /* @__PURE__ */ Object.create(null), this._eventsCount = 0, this;
        }
        if (t = n[e], typeof t == "function")
          this.removeListener(e, t);
        else if (t !== void 0)
          for (i = t.length - 1; i >= 0; i--)
            this.removeListener(e, t[i]);
        return this;
      }, "removeAllListeners");
      function hi(r, e, t) {
        var n = r._events;
        if (n === void 0)
          return [];
        var i = n[e];
        return i === void 0 ? [] : typeof i == "function" ? t ? [i.listener || i] : [i] : t ? ca(i) : di(i, i.length);
      }
      a(hi, "_listeners");
      B.prototype.listeners = a(function(e) {
        return hi(this, e, true);
      }, "listeners");
      B.prototype.rawListeners = a(function(e) {
        return hi(this, e, false);
      }, "rawListeners");
      B.listenerCount = function(r, e) {
        return typeof r.listenerCount == "function" ? r.listenerCount(e) : pi.call(r, e);
      };
      B.prototype.listenerCount = pi;
      function pi(r) {
        var e = this._events;
        if (e !== void 0) {
          var t = e[r];
          if (typeof t == "function")
            return 1;
          if (t !== void 0)
            return t.length;
        }
        return 0;
      }
      a(pi, "listenerCount");
      B.prototype.eventNames = a(function() {
        return this._eventsCount > 0 ? dt(this._events) : [];
      }, "eventNames");
      function di(r, e) {
        for (var t = new Array(e), n = 0; n < e; ++n)
          t[n] = r[n];
        return t;
      }
      a(di, "arrayClone");
      function ua(r, e) {
        for (; e + 1 < r.length; e++)
          r[e] = r[e + 1];
        r.pop();
      }
      a(ua, "spliceOne");
      function ca(r) {
        for (var e = new Array(r.length), t = 0; t < e.length; ++t)
          e[t] = r[t].listener || r[t];
        return e;
      }
      a(ca, "unwrapListeners");
      function la(r, e) {
        return new Promise(function(t, n) {
          function i(o) {
            r.removeListener(e, s), n(o);
          }
          a(i, "errorListener");
          function s() {
            typeof r.removeListener == "function" && r.removeListener("error", i), t([].slice.call(arguments));
          }
          a(s, "resolver"), yi(r, e, s, { once: true }), e !== "error" && fa(r, i, { once: true });
        });
      }
      a(la, "once");
      function fa(r, e, t) {
        typeof r.on == "function" && yi(r, "error", e, t);
      }
      a(
        fa,
        "addErrorHandlerIfEventEmitter"
      );
      function yi(r, e, t, n) {
        if (typeof r.on == "function")
          n.once ? r.once(e, t) : r.on(e, t);
        else if (typeof r.addEventListener == "function")
          r.addEventListener(e, a(function i(s) {
            n.once && r.removeEventListener(e, i), t(s);
          }, "wrapListener"));
        else
          throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof r);
      }
      a(yi, "eventTargetAgnosticAddListener");
    });
    var gi = {};
    te(gi, { Socket: () => se, isIP: () => ha });
    function ha(r) {
      return 0;
    }
    var wi;
    var mi;
    var S;
    var se;
    var ke = G(() => {
      "use strict";
      p();
      wi = Ae(ve(), 1);
      a(ha, "isIP");
      mi = /^[^.]+\./, S = class S2 extends wi.EventEmitter {
        constructor() {
          super(...arguments);
          E(this, "opts", {});
          E(this, "connecting", false);
          E(this, "pending", true);
          E(
            this,
            "writable",
            true
          );
          E(this, "encrypted", false);
          E(this, "authorized", false);
          E(this, "destroyed", false);
          E(this, "ws", null);
          E(this, "writeBuffer");
          E(this, "tlsState", 0);
          E(this, "tlsRead");
          E(this, "tlsWrite");
        }
        static get poolQueryViaFetch() {
          return S2.opts.poolQueryViaFetch ?? S2.defaults.poolQueryViaFetch;
        }
        static set poolQueryViaFetch(t) {
          S2.opts.poolQueryViaFetch = t;
        }
        static get fetchEndpoint() {
          return S2.opts.fetchEndpoint ?? S2.defaults.fetchEndpoint;
        }
        static set fetchEndpoint(t) {
          S2.opts.fetchEndpoint = t;
        }
        static get fetchConnectionCache() {
          return true;
        }
        static set fetchConnectionCache(t) {
          console.warn("The `fetchConnectionCache` option is deprecated (now always `true`)");
        }
        static get fetchFunction() {
          return S2.opts.fetchFunction ?? S2.defaults.fetchFunction;
        }
        static set fetchFunction(t) {
          S2.opts.fetchFunction = t;
        }
        static get webSocketConstructor() {
          return S2.opts.webSocketConstructor ?? S2.defaults.webSocketConstructor;
        }
        static set webSocketConstructor(t) {
          S2.opts.webSocketConstructor = t;
        }
        get webSocketConstructor() {
          return this.opts.webSocketConstructor ?? S2.webSocketConstructor;
        }
        set webSocketConstructor(t) {
          this.opts.webSocketConstructor = t;
        }
        static get wsProxy() {
          return S2.opts.wsProxy ?? S2.defaults.wsProxy;
        }
        static set wsProxy(t) {
          S2.opts.wsProxy = t;
        }
        get wsProxy() {
          return this.opts.wsProxy ?? S2.wsProxy;
        }
        set wsProxy(t) {
          this.opts.wsProxy = t;
        }
        static get coalesceWrites() {
          return S2.opts.coalesceWrites ?? S2.defaults.coalesceWrites;
        }
        static set coalesceWrites(t) {
          S2.opts.coalesceWrites = t;
        }
        get coalesceWrites() {
          return this.opts.coalesceWrites ?? S2.coalesceWrites;
        }
        set coalesceWrites(t) {
          this.opts.coalesceWrites = t;
        }
        static get useSecureWebSocket() {
          return S2.opts.useSecureWebSocket ?? S2.defaults.useSecureWebSocket;
        }
        static set useSecureWebSocket(t) {
          S2.opts.useSecureWebSocket = t;
        }
        get useSecureWebSocket() {
          return this.opts.useSecureWebSocket ?? S2.useSecureWebSocket;
        }
        set useSecureWebSocket(t) {
          this.opts.useSecureWebSocket = t;
        }
        static get forceDisablePgSSL() {
          return S2.opts.forceDisablePgSSL ?? S2.defaults.forceDisablePgSSL;
        }
        static set forceDisablePgSSL(t) {
          S2.opts.forceDisablePgSSL = t;
        }
        get forceDisablePgSSL() {
          return this.opts.forceDisablePgSSL ?? S2.forceDisablePgSSL;
        }
        set forceDisablePgSSL(t) {
          this.opts.forceDisablePgSSL = t;
        }
        static get disableSNI() {
          return S2.opts.disableSNI ?? S2.defaults.disableSNI;
        }
        static set disableSNI(t) {
          S2.opts.disableSNI = t;
        }
        get disableSNI() {
          return this.opts.disableSNI ?? S2.disableSNI;
        }
        set disableSNI(t) {
          this.opts.disableSNI = t;
        }
        static get disableWarningInBrowsers() {
          return S2.opts.disableWarningInBrowsers ?? S2.defaults.disableWarningInBrowsers;
        }
        static set disableWarningInBrowsers(t) {
          S2.opts.disableWarningInBrowsers = t;
        }
        get disableWarningInBrowsers() {
          return this.opts.disableWarningInBrowsers ?? S2.disableWarningInBrowsers;
        }
        set disableWarningInBrowsers(t) {
          this.opts.disableWarningInBrowsers = t;
        }
        static get pipelineConnect() {
          return S2.opts.pipelineConnect ?? S2.defaults.pipelineConnect;
        }
        static set pipelineConnect(t) {
          S2.opts.pipelineConnect = t;
        }
        get pipelineConnect() {
          return this.opts.pipelineConnect ?? S2.pipelineConnect;
        }
        set pipelineConnect(t) {
          this.opts.pipelineConnect = t;
        }
        static get subtls() {
          return S2.opts.subtls ?? S2.defaults.subtls;
        }
        static set subtls(t) {
          S2.opts.subtls = t;
        }
        get subtls() {
          return this.opts.subtls ?? S2.subtls;
        }
        set subtls(t) {
          this.opts.subtls = t;
        }
        static get pipelineTLS() {
          return S2.opts.pipelineTLS ?? S2.defaults.pipelineTLS;
        }
        static set pipelineTLS(t) {
          S2.opts.pipelineTLS = t;
        }
        get pipelineTLS() {
          return this.opts.pipelineTLS ?? S2.pipelineTLS;
        }
        set pipelineTLS(t) {
          this.opts.pipelineTLS = t;
        }
        static get rootCerts() {
          return S2.opts.rootCerts ?? S2.defaults.rootCerts;
        }
        static set rootCerts(t) {
          S2.opts.rootCerts = t;
        }
        get rootCerts() {
          return this.opts.rootCerts ?? S2.rootCerts;
        }
        set rootCerts(t) {
          this.opts.rootCerts = t;
        }
        wsProxyAddrForHost(t, n) {
          let i = this.wsProxy;
          if (i === void 0)
            throw new Error("No WebSocket proxy is configured. Please see https://github.com/neondatabase/serverless/blob/main/CONFIG.md#wsproxy-string--host-string-port-number--string--string");
          return typeof i == "function" ? i(t, n) : `${i}?address=${t}:${n}`;
        }
        setNoDelay() {
          return this;
        }
        setKeepAlive() {
          return this;
        }
        ref() {
          return this;
        }
        unref() {
          return this;
        }
        connect(t, n, i) {
          this.connecting = true, i && this.once("connect", i);
          let s = a(() => {
            this.connecting = false, this.pending = false, this.emit("connect"), this.emit("ready");
          }, "handleWebSocketOpen"), o = a((c, l = false) => {
            c.binaryType = "arraybuffer", c.addEventListener("error", (f) => {
              this.emit("error", f), this.emit("close");
            }), c.addEventListener("message", (f) => {
              if (this.tlsState === 0) {
                let y = d.from(f.data);
                this.emit("data", y);
              }
            }), c.addEventListener("close", () => {
              this.emit("close");
            }), l ? s() : c.addEventListener(
              "open",
              s
            );
          }, "configureWebSocket"), u;
          try {
            u = this.wsProxyAddrForHost(n, typeof t == "string" ? parseInt(t, 10) : t);
          } catch (c) {
            this.emit("error", c), this.emit("close");
            return;
          }
          try {
            let l = (this.useSecureWebSocket ? "wss:" : "ws:") + "//" + u;
            if (this.webSocketConstructor !== void 0)
              this.ws = new this.webSocketConstructor(l), o(this.ws);
            else
              try {
                this.ws = new WebSocket(l), o(this.ws);
              } catch {
                this.ws = new __unstable_WebSocket(l), o(this.ws);
              }
          } catch (c) {
            let f = (this.useSecureWebSocket ? "https:" : "http:") + "//" + u;
            fetch(f, { headers: { Upgrade: "websocket" } }).then(
              (y) => {
                if (this.ws = y.webSocket, this.ws == null)
                  throw c;
                this.ws.accept(), o(this.ws, true);
              }
            ).catch((y) => {
              this.emit(
                "error",
                new Error(`All attempts to open a WebSocket to connect to the database failed. Please refer to https://github.com/neondatabase/serverless/blob/main/CONFIG.md#websocketconstructor-typeof-websocket--undefined. Details: ${y}`)
              ), this.emit("close");
            });
          }
        }
        async startTls(t) {
          if (this.subtls === void 0)
            throw new Error(
              "For Postgres SSL connections, you must set `neonConfig.subtls` to the subtls library. See https://github.com/neondatabase/serverless/blob/main/CONFIG.md for more information."
            );
          this.tlsState = 1;
          let n = await this.subtls.TrustedCert.databaseFromPEM(this.rootCerts), i = new this.subtls.WebSocketReadQueue(this.ws), s = i.read.bind(i), o = this.rawWrite.bind(this), { read: u, write: c } = await this.subtls.startTls(t, n, s, o, { useSNI: !this.disableSNI, expectPreData: this.pipelineTLS ? new Uint8Array([83]) : void 0 });
          this.tlsRead = u, this.tlsWrite = c, this.tlsState = 2, this.encrypted = true, this.authorized = true, this.emit("secureConnection", this), this.tlsReadLoop();
        }
        async tlsReadLoop() {
          for (; ; ) {
            let t = await this.tlsRead();
            if (t === void 0)
              break;
            {
              let n = d.from(t);
              this.emit("data", n);
            }
          }
        }
        rawWrite(t) {
          if (!this.coalesceWrites) {
            this.ws && this.ws.send(t);
            return;
          }
          if (this.writeBuffer === void 0)
            this.writeBuffer = t, setTimeout(() => {
              this.ws && this.ws.send(this.writeBuffer), this.writeBuffer = void 0;
            }, 0);
          else {
            let n = new Uint8Array(
              this.writeBuffer.length + t.length
            );
            n.set(this.writeBuffer), n.set(t, this.writeBuffer.length), this.writeBuffer = n;
          }
        }
        write(t, n = "utf8", i = (s) => {
        }) {
          return t.length === 0 ? (i(), true) : (typeof t == "string" && (t = d.from(t, n)), this.tlsState === 0 ? (this.rawWrite(t), i()) : this.tlsState === 1 ? this.once("secureConnection", () => {
            this.write(
              t,
              n,
              i
            );
          }) : (this.tlsWrite(t), i()), true);
        }
        end(t = d.alloc(0), n = "utf8", i = () => {
        }) {
          return this.write(t, n, () => {
            this.ws.close(), i();
          }), this;
        }
        destroy() {
          return this.destroyed = true, this.end();
        }
      };
      a(S, "Socket"), E(S, "defaults", {
        poolQueryViaFetch: false,
        fetchEndpoint: a((t, n, i) => {
          let s;
          return i?.jwtAuth ? s = t.replace(mi, "apiauth.") : s = t.replace(mi, "api."), "https://" + s + "/sql";
        }, "fetchEndpoint"),
        fetchConnectionCache: true,
        fetchFunction: void 0,
        webSocketConstructor: void 0,
        wsProxy: a((t) => t + "/v2", "wsProxy"),
        useSecureWebSocket: true,
        forceDisablePgSSL: true,
        coalesceWrites: true,
        pipelineConnect: "password",
        subtls: void 0,
        rootCerts: "",
        pipelineTLS: false,
        disableSNI: false,
        disableWarningInBrowsers: false
      }), E(S, "opts", {});
      se = S;
    });
    var bi = {};
    te(bi, { parse: () => Zt });
    function Zt(r, e = false) {
      let { protocol: t } = new URL(r), n = "http:" + r.substring(
        t.length
      ), { username: i, password: s, host: o, hostname: u, port: c, pathname: l, search: f, searchParams: y, hash: g } = new URL(
        n
      );
      s = decodeURIComponent(s), i = decodeURIComponent(i), l = decodeURIComponent(l);
      let A = i + ":" + s, C = e ? Object.fromEntries(y.entries()) : f;
      return {
        href: r,
        protocol: t,
        auth: A,
        username: i,
        password: s,
        host: o,
        hostname: u,
        port: c,
        pathname: l,
        search: f,
        query: C,
        hash: g
      };
    }
    var Jt = G(() => {
      "use strict";
      p();
      a(Zt, "parse");
    });
    var rr = T((Ci) => {
      "use strict";
      p();
      Ci.parse = function(r, e) {
        return new tr(r, e).parse();
      };
      var vt = class vt2 {
        constructor(e, t) {
          this.source = e, this.transform = t || Ca, this.position = 0, this.entries = [], this.recorded = [], this.dimension = 0;
        }
        isEof() {
          return this.position >= this.source.length;
        }
        nextCharacter() {
          var e = this.source[this.position++];
          return e === "\\" ? { value: this.source[this.position++], escaped: true } : { value: e, escaped: false };
        }
        record(e) {
          this.recorded.push(
            e
          );
        }
        newEntry(e) {
          var t;
          (this.recorded.length > 0 || e) && (t = this.recorded.join(""), t === "NULL" && !e && (t = null), t !== null && (t = this.transform(t)), this.entries.push(t), this.recorded = []);
        }
        consumeDimensions() {
          if (this.source[0] === "[")
            for (; !this.isEof(); ) {
              var e = this.nextCharacter();
              if (e.value === "=")
                break;
            }
        }
        parse(e) {
          var t, n, i;
          for (this.consumeDimensions(); !this.isEof(); )
            if (t = this.nextCharacter(), t.value === "{" && !i)
              this.dimension++, this.dimension > 1 && (n = new vt2(this.source.substr(this.position - 1), this.transform), this.entries.push(n.parse(
                true
              )), this.position += n.position - 2);
            else if (t.value === "}" && !i) {
              if (this.dimension--, !this.dimension && (this.newEntry(), e))
                return this.entries;
            } else
              t.value === '"' && !t.escaped ? (i && this.newEntry(true), i = !i) : t.value === "," && !i ? this.newEntry() : this.record(t.value);
          if (this.dimension !== 0)
            throw new Error("array dimension not balanced");
          return this.entries;
        }
      };
      a(vt, "ArrayParser");
      var tr = vt;
      function Ca(r) {
        return r;
      }
      a(Ca, "identity");
    });
    var nr = T((Xl, _i) => {
      p();
      var _a = rr();
      _i.exports = { create: a(function(r, e) {
        return { parse: a(function() {
          return _a.parse(r, e);
        }, "parse") };
      }, "create") };
    });
    var Pi = T((rf, Ti) => {
      "use strict";
      p();
      var Ia = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?.*?( BC)?$/, Ta = /^(\d{1,})-(\d{2})-(\d{2})( BC)?$/, Pa = /([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/, Ba = /^-?infinity$/;
      Ti.exports = a(function(e) {
        if (Ba.test(e))
          return Number(e.replace("i", "I"));
        var t = Ia.exec(e);
        if (!t)
          return Ra(
            e
          ) || null;
        var n = !!t[8], i = parseInt(t[1], 10);
        n && (i = Ii(i));
        var s = parseInt(t[2], 10) - 1, o = t[3], u = parseInt(
          t[4],
          10
        ), c = parseInt(t[5], 10), l = parseInt(t[6], 10), f = t[7];
        f = f ? 1e3 * parseFloat(f) : 0;
        var y, g = La(e);
        return g != null ? (y = new Date(Date.UTC(i, s, o, u, c, l, f)), ir(i) && y.setUTCFullYear(i), g !== 0 && y.setTime(y.getTime() - g)) : (y = new Date(i, s, o, u, c, l, f), ir(i) && y.setFullYear(i)), y;
      }, "parseDate");
      function Ra(r) {
        var e = Ta.exec(r);
        if (e) {
          var t = parseInt(e[1], 10), n = !!e[4];
          n && (t = Ii(t));
          var i = parseInt(e[2], 10) - 1, s = e[3], o = new Date(t, i, s);
          return ir(
            t
          ) && o.setFullYear(t), o;
        }
      }
      a(Ra, "getDate");
      function La(r) {
        if (r.endsWith("+00"))
          return 0;
        var e = Pa.exec(r.split(" ")[1]);
        if (e) {
          var t = e[1];
          if (t === "Z")
            return 0;
          var n = t === "-" ? -1 : 1, i = parseInt(e[2], 10) * 3600 + parseInt(
            e[3] || 0,
            10
          ) * 60 + parseInt(e[4] || 0, 10);
          return i * n * 1e3;
        }
      }
      a(La, "timeZoneOffset");
      function Ii(r) {
        return -(r - 1);
      }
      a(Ii, "bcYearToNegativeYear");
      function ir(r) {
        return r >= 0 && r < 100;
      }
      a(ir, "is0To99");
    });
    var Ri = T((of, Bi) => {
      p();
      Bi.exports = ka;
      var Fa = Object.prototype.hasOwnProperty;
      function ka(r) {
        for (var e = 1; e < arguments.length; e++) {
          var t = arguments[e];
          for (var n in t)
            Fa.call(t, n) && (r[n] = t[n]);
        }
        return r;
      }
      a(ka, "extend");
    });
    var ki = T((cf, Fi) => {
      "use strict";
      p();
      var Ma = Ri();
      Fi.exports = De;
      function De(r) {
        if (!(this instanceof De))
          return new De(r);
        Ma(this, Va(r));
      }
      a(De, "PostgresInterval");
      var Ua = [
        "seconds",
        "minutes",
        "hours",
        "days",
        "months",
        "years"
      ];
      De.prototype.toPostgres = function() {
        var r = Ua.filter(this.hasOwnProperty, this);
        return this.milliseconds && r.indexOf("seconds") < 0 && r.push("seconds"), r.length === 0 ? "0" : r.map(function(e) {
          var t = this[e] || 0;
          return e === "seconds" && this.milliseconds && (t = (t + this.milliseconds / 1e3).toFixed(6).replace(
            /\.?0+$/,
            ""
          )), t + " " + e;
        }, this).join(" ");
      };
      var Da = { years: "Y", months: "M", days: "D", hours: "H", minutes: "M", seconds: "S" }, Oa = ["years", "months", "days"], qa = ["hours", "minutes", "seconds"];
      De.prototype.toISOString = De.prototype.toISO = function() {
        var r = Oa.map(t, this).join(""), e = qa.map(t, this).join("");
        return "P" + r + "T" + e;
        function t(n) {
          var i = this[n] || 0;
          return n === "seconds" && this.milliseconds && (i = (i + this.milliseconds / 1e3).toFixed(6).replace(
            /0+$/,
            ""
          )), i + Da[n];
        }
      };
      var sr = "([+-]?\\d+)", Qa = sr + "\\s+years?", Na = sr + "\\s+mons?", Wa = sr + "\\s+days?", ja = "([+-])?([\\d]*):(\\d\\d):(\\d\\d)\\.?(\\d{1,6})?", Ha = new RegExp([Qa, Na, Wa, ja].map(function(r) {
        return "(" + r + ")?";
      }).join("\\s*")), Li = { years: 2, months: 4, days: 6, hours: 9, minutes: 10, seconds: 11, milliseconds: 12 }, $a = ["hours", "minutes", "seconds", "milliseconds"];
      function Ga(r) {
        var e = r + "000000".slice(r.length);
        return parseInt(
          e,
          10
        ) / 1e3;
      }
      a(Ga, "parseMilliseconds");
      function Va(r) {
        if (!r)
          return {};
        var e = Ha.exec(r), t = e[8] === "-";
        return Object.keys(Li).reduce(function(n, i) {
          var s = Li[i], o = e[s];
          return !o || (o = i === "milliseconds" ? Ga(o) : parseInt(o, 10), !o) || (t && ~$a.indexOf(i) && (o *= -1), n[i] = o), n;
        }, {});
      }
      a(Va, "parse");
    });
    var Ui = T((hf, Mi) => {
      "use strict";
      p();
      Mi.exports = a(function(e) {
        if (/^\\x/.test(e))
          return new d(e.substr(
            2
          ), "hex");
        for (var t = "", n = 0; n < e.length; )
          if (e[n] !== "\\")
            t += e[n], ++n;
          else if (/[0-7]{3}/.test(e.substr(n + 1, 3)))
            t += String.fromCharCode(parseInt(e.substr(n + 1, 3), 8)), n += 4;
          else {
            for (var i = 1; n + i < e.length && e[n + i] === "\\"; )
              i++;
            for (var s = 0; s < Math.floor(i / 2); ++s)
              t += "\\";
            n += Math.floor(i / 2) * 2;
          }
        return new d(t, "binary");
      }, "parseBytea");
    });
    var ji = T((yf, Wi) => {
      p();
      var Ye = rr(), Ze = nr(), xt = Pi(), Oi = ki(), qi = Ui();
      function St(r) {
        return a(function(t) {
          return t === null ? t : r(t);
        }, "nullAllowed");
      }
      a(St, "allowNull");
      function Qi(r) {
        return r === null ? r : r === "TRUE" || r === "t" || r === "true" || r === "y" || r === "yes" || r === "on" || r === "1";
      }
      a(Qi, "parseBool");
      function za(r) {
        return r ? Ye.parse(r, Qi) : null;
      }
      a(za, "parseBoolArray");
      function Ka(r) {
        return parseInt(r, 10);
      }
      a(Ka, "parseBaseTenInt");
      function or(r) {
        return r ? Ye.parse(r, St(Ka)) : null;
      }
      a(or, "parseIntegerArray");
      function Ya(r) {
        return r ? Ye.parse(r, St(function(e) {
          return Ni(e).trim();
        })) : null;
      }
      a(Ya, "parseBigIntegerArray");
      var Za = a(function(r) {
        if (!r)
          return null;
        var e = Ze.create(r, function(t) {
          return t !== null && (t = lr(t)), t;
        });
        return e.parse();
      }, "parsePointArray"), ar = a(function(r) {
        if (!r)
          return null;
        var e = Ze.create(r, function(t) {
          return t !== null && (t = parseFloat(t)), t;
        });
        return e.parse();
      }, "parseFloatArray"), ne = a(function(r) {
        if (!r)
          return null;
        var e = Ze.create(r);
        return e.parse();
      }, "parseStringArray"), ur = a(function(r) {
        if (!r)
          return null;
        var e = Ze.create(
          r,
          function(t) {
            return t !== null && (t = xt(t)), t;
          }
        );
        return e.parse();
      }, "parseDateArray"), Ja = a(function(r) {
        if (!r)
          return null;
        var e = Ze.create(r, function(t) {
          return t !== null && (t = Oi(t)), t;
        });
        return e.parse();
      }, "parseIntervalArray"), Xa = a(function(r) {
        return r ? Ye.parse(r, St(qi)) : null;
      }, "parseByteAArray"), cr = a(function(r) {
        return parseInt(r, 10);
      }, "parseInteger"), Ni = a(function(r) {
        var e = String(r);
        return /^\d+$/.test(e) ? e : r;
      }, "parseBigInteger"), Di = a(function(r) {
        return r ? Ye.parse(r, St(JSON.parse)) : null;
      }, "parseJsonArray"), lr = a(
        function(r) {
          return r[0] !== "(" ? null : (r = r.substring(1, r.length - 1).split(","), { x: parseFloat(r[0]), y: parseFloat(
            r[1]
          ) });
        },
        "parsePoint"
      ), eu = a(function(r) {
        if (r[0] !== "<" && r[1] !== "(")
          return null;
        for (var e = "(", t = "", n = false, i = 2; i < r.length - 1; i++) {
          if (n || (e += r[i]), r[i] === ")") {
            n = true;
            continue;
          } else if (!n)
            continue;
          r[i] !== "," && (t += r[i]);
        }
        var s = lr(e);
        return s.radius = parseFloat(t), s;
      }, "parseCircle"), tu = a(function(r) {
        r(20, Ni), r(21, cr), r(23, cr), r(26, cr), r(700, parseFloat), r(701, parseFloat), r(16, Qi), r(1082, xt), r(1114, xt), r(1184, xt), r(
          600,
          lr
        ), r(651, ne), r(718, eu), r(1e3, za), r(1001, Xa), r(1005, or), r(1007, or), r(1028, or), r(1016, Ya), r(1017, Za), r(1021, ar), r(1022, ar), r(1231, ar), r(1014, ne), r(1015, ne), r(1008, ne), r(1009, ne), r(1040, ne), r(1041, ne), r(
          1115,
          ur
        ), r(1182, ur), r(1185, ur), r(1186, Oi), r(1187, Ja), r(17, qi), r(114, JSON.parse.bind(JSON)), r(3802, JSON.parse.bind(JSON)), r(199, Di), r(3807, Di), r(3907, ne), r(2951, ne), r(791, ne), r(1183, ne), r(1270, ne);
      }, "init");
      Wi.exports = { init: tu };
    });
    var $i = T((gf, Hi) => {
      "use strict";
      p();
      var z = 1e6;
      function ru(r) {
        var e = r.readInt32BE(0), t = r.readUInt32BE(
          4
        ), n = "";
        e < 0 && (e = ~e + (t === 0), t = ~t + 1 >>> 0, n = "-");
        var i = "", s, o, u, c, l, f;
        {
          if (s = e % z, e = e / z >>> 0, o = 4294967296 * s + t, t = o / z >>> 0, u = "" + (o - z * t), t === 0 && e === 0)
            return n + u + i;
          for (c = "", l = 6 - u.length, f = 0; f < l; f++)
            c += "0";
          i = c + u + i;
        }
        {
          if (s = e % z, e = e / z >>> 0, o = 4294967296 * s + t, t = o / z >>> 0, u = "" + (o - z * t), t === 0 && e === 0)
            return n + u + i;
          for (c = "", l = 6 - u.length, f = 0; f < l; f++)
            c += "0";
          i = c + u + i;
        }
        {
          if (s = e % z, e = e / z >>> 0, o = 4294967296 * s + t, t = o / z >>> 0, u = "" + (o - z * t), t === 0 && e === 0)
            return n + u + i;
          for (c = "", l = 6 - u.length, f = 0; f < l; f++)
            c += "0";
          i = c + u + i;
        }
        return s = e % z, o = 4294967296 * s + t, u = "" + o % z, n + u + i;
      }
      a(ru, "readInt8");
      Hi.exports = ru;
    });
    var Yi = T((xf, Ki) => {
      p();
      var nu = $i(), L = a(function(r, e, t, n, i) {
        t = t || 0, n = n || false, i = i || function(A, C, D) {
          return A * Math.pow(2, D) + C;
        };
        var s = t >> 3, o = a(function(A) {
          return n ? ~A & 255 : A;
        }, "inv"), u = 255, c = 8 - t % 8;
        e < c && (u = 255 << 8 - e & 255, c = e), t && (u = u >> t % 8);
        var l = 0;
        t % 8 + e >= 8 && (l = i(0, o(r[s]) & u, c));
        for (var f = e + t >> 3, y = s + 1; y < f; y++)
          l = i(l, o(
            r[y]
          ), 8);
        var g = (e + t) % 8;
        return g > 0 && (l = i(l, o(r[f]) >> 8 - g, g)), l;
      }, "parseBits"), zi = a(function(r, e, t) {
        var n = Math.pow(2, t - 1) - 1, i = L(r, 1), s = L(r, t, 1);
        if (s === 0)
          return 0;
        var o = 1, u = a(function(l, f, y) {
          l === 0 && (l = 1);
          for (var g = 1; g <= y; g++)
            o /= 2, (f & 1 << y - g) > 0 && (l += o);
          return l;
        }, "parsePrecisionBits"), c = L(r, e, t + 1, false, u);
        return s == Math.pow(
          2,
          t + 1
        ) - 1 ? c === 0 ? i === 0 ? 1 / 0 : -1 / 0 : NaN : (i === 0 ? 1 : -1) * Math.pow(2, s - n) * c;
      }, "parseFloatFromBits"), iu = a(function(r) {
        return L(r, 1) == 1 ? -1 * (L(r, 15, 1, true) + 1) : L(r, 15, 1);
      }, "parseInt16"), Gi = a(function(r) {
        return L(r, 1) == 1 ? -1 * (L(
          r,
          31,
          1,
          true
        ) + 1) : L(r, 31, 1);
      }, "parseInt32"), su = a(function(r) {
        return zi(r, 23, 8);
      }, "parseFloat32"), ou = a(function(r) {
        return zi(r, 52, 11);
      }, "parseFloat64"), au = a(function(r) {
        var e = L(r, 16, 32);
        if (e == 49152)
          return NaN;
        for (var t = Math.pow(1e4, L(r, 16, 16)), n = 0, i = [], s = L(r, 16), o = 0; o < s; o++)
          n += L(r, 16, 64 + 16 * o) * t, t /= 1e4;
        var u = Math.pow(10, L(
          r,
          16,
          48
        ));
        return (e === 0 ? 1 : -1) * Math.round(n * u) / u;
      }, "parseNumeric"), Vi = a(function(r, e) {
        var t = L(e, 1), n = L(
          e,
          63,
          1
        ), i = new Date((t === 0 ? 1 : -1) * n / 1e3 + 9466848e5);
        return r || i.setTime(i.getTime() + i.getTimezoneOffset() * 6e4), i.usec = n % 1e3, i.getMicroSeconds = function() {
          return this.usec;
        }, i.setMicroSeconds = function(s) {
          this.usec = s;
        }, i.getUTCMicroSeconds = function() {
          return this.usec;
        }, i;
      }, "parseDate"), Je = a(
        function(r) {
          for (var e = L(
            r,
            32
          ), t = L(r, 32, 32), n = L(r, 32, 64), i = 96, s = [], o = 0; o < e; o++)
            s[o] = L(r, 32, i), i += 32, i += 32;
          var u = a(function(l) {
            var f = L(r, 32, i);
            if (i += 32, f == 4294967295)
              return null;
            var y;
            if (l == 23 || l == 20)
              return y = L(r, f * 8, i), i += f * 8, y;
            if (l == 25)
              return y = r.toString(this.encoding, i >> 3, (i += f << 3) >> 3), y;
            console.log("ERROR: ElementType not implemented: " + l);
          }, "parseElement"), c = a(function(l, f) {
            var y = [], g;
            if (l.length > 1) {
              var A = l.shift();
              for (g = 0; g < A; g++)
                y[g] = c(l, f);
              l.unshift(A);
            } else
              for (g = 0; g < l[0]; g++)
                y[g] = u(f);
            return y;
          }, "parse");
          return c(s, n);
        },
        "parseArray"
      ), uu = a(function(r) {
        return r.toString("utf8");
      }, "parseText"), cu = a(function(r) {
        return r === null ? null : L(r, 8) > 0;
      }, "parseBool"), lu = a(function(r) {
        r(20, nu), r(21, iu), r(23, Gi), r(26, Gi), r(1700, au), r(700, su), r(701, ou), r(16, cu), r(1114, Vi.bind(null, false)), r(1184, Vi.bind(null, true)), r(1e3, Je), r(1007, Je), r(1016, Je), r(1008, Je), r(1009, Je), r(25, uu);
      }, "init");
      Ki.exports = { init: lu };
    });
    var Ji = T((Af, Zi) => {
      p();
      Zi.exports = {
        BOOL: 16,
        BYTEA: 17,
        CHAR: 18,
        INT8: 20,
        INT2: 21,
        INT4: 23,
        REGPROC: 24,
        TEXT: 25,
        OID: 26,
        TID: 27,
        XID: 28,
        CID: 29,
        JSON: 114,
        XML: 142,
        PG_NODE_TREE: 194,
        SMGR: 210,
        PATH: 602,
        POLYGON: 604,
        CIDR: 650,
        FLOAT4: 700,
        FLOAT8: 701,
        ABSTIME: 702,
        RELTIME: 703,
        TINTERVAL: 704,
        CIRCLE: 718,
        MACADDR8: 774,
        MONEY: 790,
        MACADDR: 829,
        INET: 869,
        ACLITEM: 1033,
        BPCHAR: 1042,
        VARCHAR: 1043,
        DATE: 1082,
        TIME: 1083,
        TIMESTAMP: 1114,
        TIMESTAMPTZ: 1184,
        INTERVAL: 1186,
        TIMETZ: 1266,
        BIT: 1560,
        VARBIT: 1562,
        NUMERIC: 1700,
        REFCURSOR: 1790,
        REGPROCEDURE: 2202,
        REGOPER: 2203,
        REGOPERATOR: 2204,
        REGCLASS: 2205,
        REGTYPE: 2206,
        UUID: 2950,
        TXID_SNAPSHOT: 2970,
        PG_LSN: 3220,
        PG_NDISTINCT: 3361,
        PG_DEPENDENCIES: 3402,
        TSVECTOR: 3614,
        TSQUERY: 3615,
        GTSVECTOR: 3642,
        REGCONFIG: 3734,
        REGDICTIONARY: 3769,
        JSONB: 3802,
        REGNAMESPACE: 4089,
        REGROLE: 4096
      };
    });
    var tt = T((et) => {
      p();
      var fu = ji(), hu = Yi(), pu = nr(), du = Ji();
      et.getTypeParser = yu;
      et.setTypeParser = mu;
      et.arrayParser = pu;
      et.builtins = du;
      var Xe = { text: {}, binary: {} };
      function Xi(r) {
        return String(r);
      }
      a(Xi, "noParse");
      function yu(r, e) {
        return e = e || "text", Xe[e] && Xe[e][r] || Xi;
      }
      a(yu, "getTypeParser");
      function mu(r, e, t) {
        typeof e == "function" && (t = e, e = "text"), Xe[e][r] = t;
      }
      a(mu, "setTypeParser");
      fu.init(function(r, e) {
        Xe.text[r] = e;
      });
      hu.init(function(r, e) {
        Xe.binary[r] = e;
      });
    });
    var At = T((Pf, es) => {
      "use strict";
      p();
      var wu = tt();
      function Et(r) {
        this._types = r || wu, this.text = {}, this.binary = {};
      }
      a(Et, "TypeOverrides");
      Et.prototype.getOverrides = function(r) {
        switch (r) {
          case "text":
            return this.text;
          case "binary":
            return this.binary;
          default:
            return {};
        }
      };
      Et.prototype.setTypeParser = function(r, e, t) {
        typeof e == "function" && (t = e, e = "text"), this.getOverrides(e)[r] = t;
      };
      Et.prototype.getTypeParser = function(r, e) {
        return e = e || "text", this.getOverrides(e)[r] || this._types.getTypeParser(r, e);
      };
      es.exports = Et;
    });
    function rt(r) {
      let e = 1779033703, t = 3144134277, n = 1013904242, i = 2773480762, s = 1359893119, o = 2600822924, u = 528734635, c = 1541459225, l = 0, f = 0, y = [
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
      ], g = a((I, w) => I >>> w | I << 32 - w, "rrot"), A = new Uint32Array(64), C = new Uint8Array(64), D = a(() => {
        for (let R = 0, j = 0; R < 16; R++, j += 4)
          A[R] = C[j] << 24 | C[j + 1] << 16 | C[j + 2] << 8 | C[j + 3];
        for (let R = 16; R < 64; R++) {
          let j = g(A[R - 15], 7) ^ g(A[R - 15], 18) ^ A[R - 15] >>> 3, fe = g(
            A[R - 2],
            17
          ) ^ g(A[R - 2], 19) ^ A[R - 2] >>> 10;
          A[R] = A[R - 16] + j + A[R - 7] + fe | 0;
        }
        let I = e, w = t, Z = n, W = i, J = s, X = o, oe = u, ae = c;
        for (let R = 0; R < 64; R++) {
          let j = g(J, 6) ^ g(J, 11) ^ g(J, 25), fe = J & X ^ ~J & oe, me = ae + j + fe + y[R] + A[R] | 0, Ge = g(I, 2) ^ g(
            I,
            13
          ) ^ g(I, 22), he = I & w ^ I & Z ^ w & Z, Ie = Ge + he | 0;
          ae = oe, oe = X, X = J, J = W + me | 0, W = Z, Z = w, w = I, I = me + Ie | 0;
        }
        e = e + I | 0, t = t + w | 0, n = n + Z | 0, i = i + W | 0, s = s + J | 0, o = o + X | 0, u = u + oe | 0, c = c + ae | 0, f = 0;
      }, "process"), Y = a((I) => {
        typeof I == "string" && (I = new TextEncoder().encode(I));
        for (let w = 0; w < I.length; w++)
          C[f++] = I[w], f === 64 && D();
        l += I.length;
      }, "add"), P = a(() => {
        if (C[f++] = 128, f == 64 && D(), f + 8 > 64) {
          for (; f < 64; )
            C[f++] = 0;
          D();
        }
        for (; f < 58; )
          C[f++] = 0;
        let I = l * 8;
        C[f++] = I / 1099511627776 & 255, C[f++] = I / 4294967296 & 255, C[f++] = I >>> 24, C[f++] = I >>> 16 & 255, C[f++] = I >>> 8 & 255, C[f++] = I & 255, D();
        let w = new Uint8Array(
          32
        );
        return w[0] = e >>> 24, w[1] = e >>> 16 & 255, w[2] = e >>> 8 & 255, w[3] = e & 255, w[4] = t >>> 24, w[5] = t >>> 16 & 255, w[6] = t >>> 8 & 255, w[7] = t & 255, w[8] = n >>> 24, w[9] = n >>> 16 & 255, w[10] = n >>> 8 & 255, w[11] = n & 255, w[12] = i >>> 24, w[13] = i >>> 16 & 255, w[14] = i >>> 8 & 255, w[15] = i & 255, w[16] = s >>> 24, w[17] = s >>> 16 & 255, w[18] = s >>> 8 & 255, w[19] = s & 255, w[20] = o >>> 24, w[21] = o >>> 16 & 255, w[22] = o >>> 8 & 255, w[23] = o & 255, w[24] = u >>> 24, w[25] = u >>> 16 & 255, w[26] = u >>> 8 & 255, w[27] = u & 255, w[28] = c >>> 24, w[29] = c >>> 16 & 255, w[30] = c >>> 8 & 255, w[31] = c & 255, w;
      }, "digest");
      return r === void 0 ? { add: Y, digest: P } : (Y(r), P());
    }
    var ts = G(() => {
      "use strict";
      p();
      a(rt, "sha256");
    });
    var U;
    var nt;
    var rs = G(() => {
      "use strict";
      p();
      U = class U2 {
        constructor() {
          E(this, "_dataLength", 0);
          E(this, "_bufferLength", 0);
          E(this, "_state", new Int32Array(4));
          E(this, "_buffer", new ArrayBuffer(68));
          E(this, "_buffer8");
          E(this, "_buffer32");
          this._buffer8 = new Uint8Array(this._buffer, 0, 68), this._buffer32 = new Uint32Array(this._buffer, 0, 17), this.start();
        }
        static hashByteArray(e, t = false) {
          return this.onePassHasher.start().appendByteArray(
            e
          ).end(t);
        }
        static hashStr(e, t = false) {
          return this.onePassHasher.start().appendStr(e).end(t);
        }
        static hashAsciiStr(e, t = false) {
          return this.onePassHasher.start().appendAsciiStr(e).end(t);
        }
        static _hex(e) {
          let t = U2.hexChars, n = U2.hexOut, i, s, o, u;
          for (u = 0; u < 4; u += 1)
            for (s = u * 8, i = e[u], o = 0; o < 8; o += 2)
              n[s + 1 + o] = t.charAt(i & 15), i >>>= 4, n[s + 0 + o] = t.charAt(
                i & 15
              ), i >>>= 4;
          return n.join("");
        }
        static _md5cycle(e, t) {
          let n = e[0], i = e[1], s = e[2], o = e[3];
          n += (i & s | ~i & o) + t[0] - 680876936 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[1] - 389564586 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[2] + 606105819 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[3] - 1044525330 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & s | ~i & o) + t[4] - 176418897 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[5] + 1200080426 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[6] - 1473231341 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[7] - 45705983 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & s | ~i & o) + t[8] + 1770035416 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[9] - 1958414417 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[10] - 42063 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[11] - 1990404162 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & s | ~i & o) + t[12] + 1804603682 | 0, n = (n << 7 | n >>> 25) + i | 0, o += (n & i | ~n & s) + t[13] - 40341101 | 0, o = (o << 12 | o >>> 20) + n | 0, s += (o & n | ~o & i) + t[14] - 1502002290 | 0, s = (s << 17 | s >>> 15) + o | 0, i += (s & o | ~s & n) + t[15] + 1236535329 | 0, i = (i << 22 | i >>> 10) + s | 0, n += (i & o | s & ~o) + t[1] - 165796510 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[6] - 1069501632 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[11] + 643717713 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[0] - 373897302 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i & o | s & ~o) + t[5] - 701558691 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[10] + 38016083 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[15] - 660478335 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[4] - 405537848 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i & o | s & ~o) + t[9] + 568446438 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[14] - 1019803690 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[3] - 187363961 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[8] + 1163531501 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i & o | s & ~o) + t[13] - 1444681467 | 0, n = (n << 5 | n >>> 27) + i | 0, o += (n & s | i & ~s) + t[2] - 51403784 | 0, o = (o << 9 | o >>> 23) + n | 0, s += (o & i | n & ~i) + t[7] + 1735328473 | 0, s = (s << 14 | s >>> 18) + o | 0, i += (s & n | o & ~n) + t[12] - 1926607734 | 0, i = (i << 20 | i >>> 12) + s | 0, n += (i ^ s ^ o) + t[5] - 378558 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[8] - 2022574463 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[11] + 1839030562 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[14] - 35309556 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (i ^ s ^ o) + t[1] - 1530992060 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[4] + 1272893353 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[7] - 155497632 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[10] - 1094730640 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (i ^ s ^ o) + t[13] + 681279174 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[0] - 358537222 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[3] - 722521979 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[6] + 76029189 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (i ^ s ^ o) + t[9] - 640364487 | 0, n = (n << 4 | n >>> 28) + i | 0, o += (n ^ i ^ s) + t[12] - 421815835 | 0, o = (o << 11 | o >>> 21) + n | 0, s += (o ^ n ^ i) + t[15] + 530742520 | 0, s = (s << 16 | s >>> 16) + o | 0, i += (s ^ o ^ n) + t[2] - 995338651 | 0, i = (i << 23 | i >>> 9) + s | 0, n += (s ^ (i | ~o)) + t[0] - 198630844 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[7] + 1126891415 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[14] - 1416354905 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[5] - 57434055 | 0, i = (i << 21 | i >>> 11) + s | 0, n += (s ^ (i | ~o)) + t[12] + 1700485571 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[3] - 1894986606 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[10] - 1051523 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[1] - 2054922799 | 0, i = (i << 21 | i >>> 11) + s | 0, n += (s ^ (i | ~o)) + t[8] + 1873313359 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[15] - 30611744 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[6] - 1560198380 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[13] + 1309151649 | 0, i = (i << 21 | i >>> 11) + s | 0, n += (s ^ (i | ~o)) + t[4] - 145523070 | 0, n = (n << 6 | n >>> 26) + i | 0, o += (i ^ (n | ~s)) + t[11] - 1120210379 | 0, o = (o << 10 | o >>> 22) + n | 0, s += (n ^ (o | ~i)) + t[2] + 718787259 | 0, s = (s << 15 | s >>> 17) + o | 0, i += (o ^ (s | ~n)) + t[9] - 343485551 | 0, i = (i << 21 | i >>> 11) + s | 0, e[0] = n + e[0] | 0, e[1] = i + e[1] | 0, e[2] = s + e[2] | 0, e[3] = o + e[3] | 0;
        }
        start() {
          return this._dataLength = 0, this._bufferLength = 0, this._state.set(U2.stateIdentity), this;
        }
        appendStr(e) {
          let t = this._buffer8, n = this._buffer32, i = this._bufferLength, s, o;
          for (o = 0; o < e.length; o += 1) {
            if (s = e.charCodeAt(o), s < 128)
              t[i++] = s;
            else if (s < 2048)
              t[i++] = (s >>> 6) + 192, t[i++] = s & 63 | 128;
            else if (s < 55296 || s > 56319)
              t[i++] = (s >>> 12) + 224, t[i++] = s >>> 6 & 63 | 128, t[i++] = s & 63 | 128;
            else {
              if (s = (s - 55296) * 1024 + (e.charCodeAt(++o) - 56320) + 65536, s > 1114111)
                throw new Error(
                  "Unicode standard supports code points up to U+10FFFF"
                );
              t[i++] = (s >>> 18) + 240, t[i++] = s >>> 12 & 63 | 128, t[i++] = s >>> 6 & 63 | 128, t[i++] = s & 63 | 128;
            }
            i >= 64 && (this._dataLength += 64, U2._md5cycle(this._state, n), i -= 64, n[0] = n[16]);
          }
          return this._bufferLength = i, this;
        }
        appendAsciiStr(e) {
          let t = this._buffer8, n = this._buffer32, i = this._bufferLength, s, o = 0;
          for (; ; ) {
            for (s = Math.min(e.length - o, 64 - i); s--; )
              t[i++] = e.charCodeAt(o++);
            if (i < 64)
              break;
            this._dataLength += 64, U2._md5cycle(this._state, n), i = 0;
          }
          return this._bufferLength = i, this;
        }
        appendByteArray(e) {
          let t = this._buffer8, n = this._buffer32, i = this._bufferLength, s, o = 0;
          for (; ; ) {
            for (s = Math.min(e.length - o, 64 - i); s--; )
              t[i++] = e[o++];
            if (i < 64)
              break;
            this._dataLength += 64, U2._md5cycle(this._state, n), i = 0;
          }
          return this._bufferLength = i, this;
        }
        getState() {
          let e = this._state;
          return { buffer: String.fromCharCode.apply(null, Array.from(this._buffer8)), buflen: this._bufferLength, length: this._dataLength, state: [e[0], e[1], e[2], e[3]] };
        }
        setState(e) {
          let t = e.buffer, n = e.state, i = this._state, s;
          for (this._dataLength = e.length, this._bufferLength = e.buflen, i[0] = n[0], i[1] = n[1], i[2] = n[2], i[3] = n[3], s = 0; s < t.length; s += 1)
            this._buffer8[s] = t.charCodeAt(s);
        }
        end(e = false) {
          let t = this._bufferLength, n = this._buffer8, i = this._buffer32, s = (t >> 2) + 1;
          this._dataLength += t;
          let o = this._dataLength * 8;
          if (n[t] = 128, n[t + 1] = n[t + 2] = n[t + 3] = 0, i.set(U2.buffer32Identity.subarray(s), s), t > 55 && (U2._md5cycle(this._state, i), i.set(U2.buffer32Identity)), o <= 4294967295)
            i[14] = o;
          else {
            let u = o.toString(16).match(/(.*?)(.{0,8})$/);
            if (u === null)
              return;
            let c = parseInt(
              u[2],
              16
            ), l = parseInt(u[1], 16) || 0;
            i[14] = c, i[15] = l;
          }
          return U2._md5cycle(this._state, i), e ? this._state : U2._hex(
            this._state
          );
        }
      };
      a(U, "Md5"), E(U, "stateIdentity", new Int32Array([1732584193, -271733879, -1732584194, 271733878])), E(U, "buffer32Identity", new Int32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])), E(U, "hexChars", "0123456789abcdef"), E(U, "hexOut", []), E(U, "onePassHasher", new U());
      nt = U;
    });
    var fr = {};
    te(fr, { createHash: () => bu, createHmac: () => vu, randomBytes: () => gu });
    function gu(r) {
      return crypto.getRandomValues(d.alloc(r));
    }
    function bu(r) {
      if (r === "sha256")
        return { update: a(function(e) {
          return { digest: a(
            function() {
              return d.from(rt(e));
            },
            "digest"
          ) };
        }, "update") };
      if (r === "md5")
        return { update: a(function(e) {
          return {
            digest: a(function() {
              return typeof e == "string" ? nt.hashStr(e) : nt.hashByteArray(e);
            }, "digest")
          };
        }, "update") };
      throw new Error(`Hash type '${r}' not supported`);
    }
    function vu(r, e) {
      if (r !== "sha256")
        throw new Error(`Only sha256 is supported (requested: '${r}')`);
      return { update: a(function(t) {
        return { digest: a(
          function() {
            typeof e == "string" && (e = new TextEncoder().encode(e)), typeof t == "string" && (t = new TextEncoder().encode(
              t
            ));
            let n = e.length;
            if (n > 64)
              e = rt(e);
            else if (n < 64) {
              let c = new Uint8Array(64);
              c.set(e), e = c;
            }
            let i = new Uint8Array(
              64
            ), s = new Uint8Array(64);
            for (let c = 0; c < 64; c++)
              i[c] = 54 ^ e[c], s[c] = 92 ^ e[c];
            let o = new Uint8Array(t.length + 64);
            o.set(i, 0), o.set(t, 64);
            let u = new Uint8Array(96);
            return u.set(s, 0), u.set(rt(o), 64), d.from(rt(u));
          },
          "digest"
        ) };
      }, "update") };
    }
    var hr = G(() => {
      "use strict";
      p();
      ts();
      rs();
      a(gu, "randomBytes");
      a(bu, "createHash");
      a(vu, "createHmac");
    });
    var it = T((Wf, pr) => {
      "use strict";
      p();
      pr.exports = {
        host: "localhost",
        user: m.platform === "win32" ? m.env.USERNAME : m.env.USER,
        database: void 0,
        password: null,
        connectionString: void 0,
        port: 5432,
        rows: 0,
        binary: false,
        max: 10,
        idleTimeoutMillis: 3e4,
        client_encoding: "",
        ssl: false,
        application_name: void 0,
        fallback_application_name: void 0,
        options: void 0,
        parseInputDatesAsUTC: false,
        statement_timeout: false,
        lock_timeout: false,
        idle_in_transaction_session_timeout: false,
        query_timeout: false,
        connect_timeout: 0,
        keepalives: 1,
        keepalives_idle: 0
      };
      var Oe = tt(), xu = Oe.getTypeParser(20, "text"), Su = Oe.getTypeParser(
        1016,
        "text"
      );
      pr.exports.__defineSetter__("parseInt8", function(r) {
        Oe.setTypeParser(20, "text", r ? Oe.getTypeParser(
          23,
          "text"
        ) : xu), Oe.setTypeParser(1016, "text", r ? Oe.getTypeParser(1007, "text") : Su);
      });
    });
    var st = T((Hf, is) => {
      "use strict";
      p();
      var Eu = (hr(), O(fr)), Au = it();
      function Cu(r) {
        var e = r.replace(
          /\\/g,
          "\\\\"
        ).replace(/"/g, '\\"');
        return '"' + e + '"';
      }
      a(Cu, "escapeElement");
      function ns(r) {
        for (var e = "{", t = 0; t < r.length; t++)
          t > 0 && (e = e + ","), r[t] === null || typeof r[t] > "u" ? e = e + "NULL" : Array.isArray(r[t]) ? e = e + ns(r[t]) : r[t] instanceof d ? e += "\\\\x" + r[t].toString("hex") : e += Cu(Ct(r[t]));
        return e = e + "}", e;
      }
      a(ns, "arrayString");
      var Ct = a(function(r, e) {
        if (r == null)
          return null;
        if (r instanceof d)
          return r;
        if (ArrayBuffer.isView(r)) {
          var t = d.from(r.buffer, r.byteOffset, r.byteLength);
          return t.length === r.byteLength ? t : t.slice(r.byteOffset, r.byteOffset + r.byteLength);
        }
        return r instanceof Date ? Au.parseInputDatesAsUTC ? Tu(r) : Iu(r) : Array.isArray(r) ? ns(r) : typeof r == "object" ? _u(r, e) : r.toString();
      }, "prepareValue");
      function _u(r, e) {
        if (r && typeof r.toPostgres == "function") {
          if (e = e || [], e.indexOf(r) !== -1)
            throw new Error('circular reference detected while preparing "' + r + '" for query');
          return e.push(r), Ct(r.toPostgres(Ct), e);
        }
        return JSON.stringify(r);
      }
      a(_u, "prepareObject");
      function N(r, e) {
        for (r = "" + r; r.length < e; )
          r = "0" + r;
        return r;
      }
      a(N, "pad");
      function Iu(r) {
        var e = -r.getTimezoneOffset(), t = r.getFullYear(), n = t < 1;
        n && (t = Math.abs(t) + 1);
        var i = N(t, 4) + "-" + N(r.getMonth() + 1, 2) + "-" + N(r.getDate(), 2) + "T" + N(
          r.getHours(),
          2
        ) + ":" + N(r.getMinutes(), 2) + ":" + N(r.getSeconds(), 2) + "." + N(r.getMilliseconds(), 3);
        return e < 0 ? (i += "-", e *= -1) : i += "+", i += N(Math.floor(e / 60), 2) + ":" + N(e % 60, 2), n && (i += " BC"), i;
      }
      a(Iu, "dateToString");
      function Tu(r) {
        var e = r.getUTCFullYear(), t = e < 1;
        t && (e = Math.abs(e) + 1);
        var n = N(e, 4) + "-" + N(r.getUTCMonth() + 1, 2) + "-" + N(r.getUTCDate(), 2) + "T" + N(r.getUTCHours(), 2) + ":" + N(r.getUTCMinutes(), 2) + ":" + N(r.getUTCSeconds(), 2) + "." + N(
          r.getUTCMilliseconds(),
          3
        );
        return n += "+00:00", t && (n += " BC"), n;
      }
      a(Tu, "dateToStringUTC");
      function Pu(r, e, t) {
        return r = typeof r == "string" ? { text: r } : r, e && (typeof e == "function" ? r.callback = e : r.values = e), t && (r.callback = t), r;
      }
      a(Pu, "normalizeQueryConfig");
      var dr = a(function(r) {
        return Eu.createHash("md5").update(r, "utf-8").digest("hex");
      }, "md5"), Bu = a(
        function(r, e, t) {
          var n = dr(e + r), i = dr(d.concat([d.from(n), t]));
          return "md5" + i;
        },
        "postgresMd5PasswordHash"
      );
      is.exports = {
        prepareValue: a(function(e) {
          return Ct(e);
        }, "prepareValueWrapper"),
        normalizeQueryConfig: Pu,
        postgresMd5PasswordHash: Bu,
        md5: dr
      };
    });
    var ot = {};
    te(ot, { default: () => ku });
    var ku;
    var at = G(() => {
      "use strict";
      p();
      ku = {};
    });
    var ds = T((nh, ps) => {
      "use strict";
      p();
      var wr = (hr(), O(fr));
      function Mu(r) {
        if (r.indexOf("SCRAM-SHA-256") === -1)
          throw new Error("SASL: Only mechanism SCRAM-SHA-256 is currently supported");
        let e = wr.randomBytes(
          18
        ).toString("base64");
        return { mechanism: "SCRAM-SHA-256", clientNonce: e, response: "n,,n=*,r=" + e, message: "SASLInitialResponse" };
      }
      a(Mu, "startSession");
      function Uu(r, e, t) {
        if (r.message !== "SASLInitialResponse")
          throw new Error(
            "SASL: Last message was not SASLInitialResponse"
          );
        if (typeof e != "string")
          throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string");
        if (typeof t != "string")
          throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: serverData must be a string");
        let n = qu(t);
        if (n.nonce.startsWith(r.clientNonce)) {
          if (n.nonce.length === r.clientNonce.length)
            throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
        } else
          throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
        var i = d.from(n.salt, "base64"), s = Wu(e, i, n.iteration), o = qe(s, "Client Key"), u = Nu(
          o
        ), c = "n=*,r=" + r.clientNonce, l = "r=" + n.nonce + ",s=" + n.salt + ",i=" + n.iteration, f = "c=biws,r=" + n.nonce, y = c + "," + l + "," + f, g = qe(u, y), A = hs(o, g), C = A.toString("base64"), D = qe(s, "Server Key"), Y = qe(D, y);
        r.message = "SASLResponse", r.serverSignature = Y.toString("base64"), r.response = f + ",p=" + C;
      }
      a(Uu, "continueSession");
      function Du(r, e) {
        if (r.message !== "SASLResponse")
          throw new Error("SASL: Last message was not SASLResponse");
        if (typeof e != "string")
          throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: serverData must be a string");
        let { serverSignature: t } = Qu(
          e
        );
        if (t !== r.serverSignature)
          throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match");
      }
      a(Du, "finalizeSession");
      function Ou(r) {
        if (typeof r != "string")
          throw new TypeError("SASL: text must be a string");
        return r.split("").map((e, t) => r.charCodeAt(t)).every((e) => e >= 33 && e <= 43 || e >= 45 && e <= 126);
      }
      a(Ou, "isPrintableChars");
      function ls(r) {
        return /^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(r);
      }
      a(ls, "isBase64");
      function fs(r) {
        if (typeof r != "string")
          throw new TypeError("SASL: attribute pairs text must be a string");
        return new Map(r.split(",").map((e) => {
          if (!/^.=/.test(e))
            throw new Error("SASL: Invalid attribute pair entry");
          let t = e[0], n = e.substring(2);
          return [t, n];
        }));
      }
      a(fs, "parseAttributePairs");
      function qu(r) {
        let e = fs(r), t = e.get("r");
        if (t) {
          if (!Ou(t))
            throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce must only contain printable characters");
        } else
          throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing");
        let n = e.get("s");
        if (n) {
          if (!ls(n))
            throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt must be base64");
        } else
          throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing");
        let i = e.get("i");
        if (i) {
          if (!/^[1-9][0-9]*$/.test(i))
            throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: invalid iteration count");
        } else
          throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing");
        let s = parseInt(i, 10);
        return { nonce: t, salt: n, iteration: s };
      }
      a(qu, "parseServerFirstMessage");
      function Qu(r) {
        let t = fs(r).get("v");
        if (t) {
          if (!ls(t))
            throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature must be base64");
        } else
          throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing");
        return { serverSignature: t };
      }
      a(Qu, "parseServerFinalMessage");
      function hs(r, e) {
        if (!d.isBuffer(r))
          throw new TypeError("first argument must be a Buffer");
        if (!d.isBuffer(e))
          throw new TypeError(
            "second argument must be a Buffer"
          );
        if (r.length !== e.length)
          throw new Error("Buffer lengths must match");
        if (r.length === 0)
          throw new Error("Buffers cannot be empty");
        return d.from(r.map((t, n) => r[n] ^ e[n]));
      }
      a(hs, "xorBuffers");
      function Nu(r) {
        return wr.createHash("sha256").update(r).digest();
      }
      a(Nu, "sha256");
      function qe(r, e) {
        return wr.createHmac("sha256", r).update(e).digest();
      }
      a(qe, "hmacSha256");
      function Wu(r, e, t) {
        for (var n = qe(
          r,
          d.concat([e, d.from([0, 0, 0, 1])])
        ), i = n, s = 0; s < t - 1; s++)
          n = qe(r, n), i = hs(i, n);
        return i;
      }
      a(Wu, "Hi");
      ps.exports = { startSession: Mu, continueSession: Uu, finalizeSession: Du };
    });
    var gr = {};
    te(gr, { join: () => ju });
    function ju(...r) {
      return r.join("/");
    }
    var br = G(() => {
      "use strict";
      p();
      a(
        ju,
        "join"
      );
    });
    var vr = {};
    te(vr, { stat: () => Hu });
    function Hu(r, e) {
      e(new Error("No filesystem"));
    }
    var xr = G(() => {
      "use strict";
      p();
      a(Hu, "stat");
    });
    var Sr = {};
    te(Sr, { default: () => $u });
    var $u;
    var Er = G(() => {
      "use strict";
      p();
      $u = {};
    });
    var ys = {};
    te(ys, { StringDecoder: () => Ar });
    var Cr;
    var Ar;
    var ms = G(() => {
      "use strict";
      p();
      Cr = class Cr {
        constructor(e) {
          E(this, "td");
          this.td = new TextDecoder(e);
        }
        write(e) {
          return this.td.decode(e, { stream: true });
        }
        end(e) {
          return this.td.decode(e);
        }
      };
      a(Cr, "StringDecoder");
      Ar = Cr;
    });
    var vs = T((ph, bs) => {
      "use strict";
      p();
      var { Transform: Gu } = (Er(), O(Sr)), { StringDecoder: Vu } = (ms(), O(ys)), Se = Symbol(
        "last"
      ), It = Symbol("decoder");
      function zu(r, e, t) {
        let n;
        if (this.overflow) {
          if (n = this[It].write(r).split(
            this.matcher
          ), n.length === 1)
            return t();
          n.shift(), this.overflow = false;
        } else
          this[Se] += this[It].write(r), n = this[Se].split(this.matcher);
        this[Se] = n.pop();
        for (let i = 0; i < n.length; i++)
          try {
            gs(this, this.mapper(n[i]));
          } catch (s) {
            return t(s);
          }
        if (this.overflow = this[Se].length > this.maxLength, this.overflow && !this.skipOverflow) {
          t(new Error(
            "maximum buffer reached"
          ));
          return;
        }
        t();
      }
      a(zu, "transform");
      function Ku(r) {
        if (this[Se] += this[It].end(), this[Se])
          try {
            gs(this, this.mapper(this[Se]));
          } catch (e) {
            return r(e);
          }
        r();
      }
      a(Ku, "flush");
      function gs(r, e) {
        e !== void 0 && r.push(e);
      }
      a(gs, "push");
      function ws(r) {
        return r;
      }
      a(ws, "noop");
      function Yu(r, e, t) {
        switch (r = r || /\r?\n/, e = e || ws, t = t || {}, arguments.length) {
          case 1:
            typeof r == "function" ? (e = r, r = /\r?\n/) : typeof r == "object" && !(r instanceof RegExp) && !r[Symbol.split] && (t = r, r = /\r?\n/);
            break;
          case 2:
            typeof r == "function" ? (t = e, e = r, r = /\r?\n/) : typeof e == "object" && (t = e, e = ws);
        }
        t = Object.assign({}, t), t.autoDestroy = true, t.transform = zu, t.flush = Ku, t.readableObjectMode = true;
        let n = new Gu(t);
        return n[Se] = "", n[It] = new Vu("utf8"), n.matcher = r, n.mapper = e, n.maxLength = t.maxLength, n.skipOverflow = t.skipOverflow || false, n.overflow = false, n._destroy = function(i, s) {
          this._writableState.errorEmitted = false, s(i);
        }, n;
      }
      a(Yu, "split");
      bs.exports = Yu;
    });
    var Es = T((mh, ye) => {
      "use strict";
      p();
      var xs = (br(), O(gr)), Zu = (Er(), O(Sr)).Stream, Ju = vs(), Ss = (at(), O(ot)), Xu = 5432, Tt = m.platform === "win32", ut = m.stderr, ec = 56, tc = 7, rc = 61440, nc = 32768;
      function ic(r) {
        return (r & rc) == nc;
      }
      a(ic, "isRegFile");
      var Qe = ["host", "port", "database", "user", "password"], _r = Qe.length, sc = Qe[_r - 1];
      function Ir() {
        var r = ut instanceof Zu && ut.writable === true;
        if (r) {
          var e = Array.prototype.slice.call(arguments).concat(`
`);
          ut.write(Ss.format.apply(Ss, e));
        }
      }
      a(Ir, "warn");
      Object.defineProperty(ye.exports, "isWin", { get: a(function() {
        return Tt;
      }, "get"), set: a(function(r) {
        Tt = r;
      }, "set") });
      ye.exports.warnTo = function(r) {
        var e = ut;
        return ut = r, e;
      };
      ye.exports.getFileName = function(r) {
        var e = r || m.env, t = e.PGPASSFILE || (Tt ? xs.join(e.APPDATA || "./", "postgresql", "pgpass.conf") : xs.join(e.HOME || "./", ".pgpass"));
        return t;
      };
      ye.exports.usePgPass = function(r, e) {
        return Object.prototype.hasOwnProperty.call(m.env, "PGPASSWORD") ? false : Tt ? true : (e = e || "<unkn>", ic(r.mode) ? r.mode & (ec | tc) ? (Ir('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less', e), false) : true : (Ir('WARNING: password file "%s" is not a plain file', e), false));
      };
      var oc = ye.exports.match = function(r, e) {
        return Qe.slice(0, -1).reduce(function(t, n, i) {
          return i == 1 && Number(r[n] || Xu) === Number(
            e[n]
          ) ? t && true : t && (e[n] === "*" || e[n] === r[n]);
        }, true);
      };
      ye.exports.getPassword = function(r, e, t) {
        var n, i = e.pipe(
          Ju()
        );
        function s(c) {
          var l = ac(c);
          l && uc(l) && oc(r, l) && (n = l[sc], i.end());
        }
        a(s, "onLine");
        var o = a(function() {
          e.destroy(), t(n);
        }, "onEnd"), u = a(function(c) {
          e.destroy(), Ir("WARNING: error on reading file: %s", c), t(
            void 0
          );
        }, "onErr");
        e.on("error", u), i.on("data", s).on("end", o).on("error", u);
      };
      var ac = ye.exports.parseLine = function(r) {
        if (r.length < 11 || r.match(/^\s+#/))
          return null;
        for (var e = "", t = "", n = 0, i = 0, s = 0, o = {}, u = false, c = a(
          function(f, y, g) {
            var A = r.substring(y, g);
            Object.hasOwnProperty.call(m.env, "PGPASS_NO_DEESCAPE") || (A = A.replace(/\\([:\\])/g, "$1")), o[Qe[f]] = A;
          },
          "addToObj"
        ), l = 0; l < r.length - 1; l += 1) {
          if (e = r.charAt(l + 1), t = r.charAt(
            l
          ), u = n == _r - 1, u) {
            c(n, i);
            break;
          }
          l >= 0 && e == ":" && t !== "\\" && (c(n, i, l + 1), i = l + 2, n += 1);
        }
        return o = Object.keys(o).length === _r ? o : null, o;
      }, uc = ye.exports.isValidEntry = function(r) {
        for (var e = { 0: function(o) {
          return o.length > 0;
        }, 1: function(o) {
          return o === "*" ? true : (o = Number(o), isFinite(o) && o > 0 && o < 9007199254740992 && Math.floor(o) === o);
        }, 2: function(o) {
          return o.length > 0;
        }, 3: function(o) {
          return o.length > 0;
        }, 4: function(o) {
          return o.length > 0;
        } }, t = 0; t < Qe.length; t += 1) {
          var n = e[t], i = r[Qe[t]] || "", s = n(i);
          if (!s)
            return false;
        }
        return true;
      };
    });
    var Cs = T((vh, Tr) => {
      "use strict";
      p();
      var bh = (br(), O(gr)), As = (xr(), O(vr)), Pt = Es();
      Tr.exports = function(r, e) {
        var t = Pt.getFileName();
        As.stat(t, function(n, i) {
          if (n || !Pt.usePgPass(i, t))
            return e(void 0);
          var s = As.createReadStream(
            t
          );
          Pt.getPassword(r, s, e);
        });
      };
      Tr.exports.warnTo = Pt.warnTo;
    });
    var _s = {};
    te(_s, { default: () => cc });
    var cc;
    var Is = G(() => {
      "use strict";
      p();
      cc = {};
    });
    var Ps = T((Eh, Ts) => {
      "use strict";
      p();
      var lc = (Jt(), O(bi)), Pr = (xr(), O(vr));
      function Br(r) {
        if (r.charAt(0) === "/") {
          var t = r.split(" ");
          return { host: t[0], database: t[1] };
        }
        var e = lc.parse(/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(r) ? encodeURI(r).replace(/\%25(\d\d)/g, "%$1") : r, true), t = e.query;
        for (var n in t)
          Array.isArray(t[n]) && (t[n] = t[n][t[n].length - 1]);
        var i = (e.auth || ":").split(":");
        if (t.user = i[0], t.password = i.splice(1).join(
          ":"
        ), t.port = e.port, e.protocol == "socket:")
          return t.host = decodeURI(e.pathname), t.database = e.query.db, t.client_encoding = e.query.encoding, t;
        t.host || (t.host = e.hostname);
        var s = e.pathname;
        if (!t.host && s && /^%2f/i.test(s)) {
          var o = s.split("/");
          t.host = decodeURIComponent(o[0]), s = o.splice(1).join("/");
        }
        switch (s && s.charAt(
          0
        ) === "/" && (s = s.slice(1) || null), t.database = s && decodeURI(s), (t.ssl === "true" || t.ssl === "1") && (t.ssl = true), t.ssl === "0" && (t.ssl = false), (t.sslcert || t.sslkey || t.sslrootcert || t.sslmode) && (t.ssl = {}), t.sslcert && (t.ssl.cert = Pr.readFileSync(t.sslcert).toString()), t.sslkey && (t.ssl.key = Pr.readFileSync(t.sslkey).toString()), t.sslrootcert && (t.ssl.ca = Pr.readFileSync(t.sslrootcert).toString()), t.sslmode) {
          case "disable": {
            t.ssl = false;
            break;
          }
          case "prefer":
          case "require":
          case "verify-ca":
          case "verify-full":
            break;
          case "no-verify": {
            t.ssl.rejectUnauthorized = false;
            break;
          }
        }
        return t;
      }
      a(Br, "parse");
      Ts.exports = Br;
      Br.parse = Br;
    });
    var Bt = T((_h, Ls) => {
      "use strict";
      p();
      var fc = (Is(), O(_s)), Rs = it(), Bs = Ps().parse, H = a(function(r, e, t) {
        return t === void 0 ? t = m.env["PG" + r.toUpperCase()] : t === false || (t = m.env[t]), e[r] || t || Rs[r];
      }, "val"), hc = a(function() {
        switch (m.env.PGSSLMODE) {
          case "disable":
            return false;
          case "prefer":
          case "require":
          case "verify-ca":
          case "verify-full":
            return true;
          case "no-verify":
            return { rejectUnauthorized: false };
        }
        return Rs.ssl;
      }, "readSSLConfigFromEnvironment"), Ne = a(function(r) {
        return "'" + ("" + r).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
      }, "quoteParamValue"), ie = a(function(r, e, t) {
        var n = e[t];
        n != null && r.push(t + "=" + Ne(n));
      }, "add"), Lr = class Lr {
        constructor(e) {
          e = typeof e == "string" ? Bs(e) : e || {}, e.connectionString && (e = Object.assign({}, e, Bs(e.connectionString))), this.user = H("user", e), this.database = H("database", e), this.database === void 0 && (this.database = this.user), this.port = parseInt(H("port", e), 10), this.host = H("host", e), Object.defineProperty(this, "password", {
            configurable: true,
            enumerable: false,
            writable: true,
            value: H("password", e)
          }), this.binary = H("binary", e), this.options = H("options", e), this.ssl = typeof e.ssl > "u" ? hc() : e.ssl, typeof this.ssl == "string" && this.ssl === "true" && (this.ssl = true), this.ssl === "no-verify" && (this.ssl = { rejectUnauthorized: false }), this.ssl && this.ssl.key && Object.defineProperty(this.ssl, "key", { enumerable: false }), this.client_encoding = H("client_encoding", e), this.replication = H("replication", e), this.isDomainSocket = !(this.host || "").indexOf("/"), this.application_name = H("application_name", e, "PGAPPNAME"), this.fallback_application_name = H("fallback_application_name", e, false), this.statement_timeout = H("statement_timeout", e, false), this.lock_timeout = H("lock_timeout", e, false), this.idle_in_transaction_session_timeout = H("idle_in_transaction_session_timeout", e, false), this.query_timeout = H("query_timeout", e, false), e.connectionTimeoutMillis === void 0 ? this.connect_timeout = m.env.PGCONNECT_TIMEOUT || 0 : this.connect_timeout = Math.floor(e.connectionTimeoutMillis / 1e3), e.keepAlive === false ? this.keepalives = 0 : e.keepAlive === true && (this.keepalives = 1), typeof e.keepAliveInitialDelayMillis == "number" && (this.keepalives_idle = Math.floor(e.keepAliveInitialDelayMillis / 1e3));
        }
        getLibpqConnectionString(e) {
          var t = [];
          ie(t, this, "user"), ie(t, this, "password"), ie(t, this, "port"), ie(t, this, "application_name"), ie(
            t,
            this,
            "fallback_application_name"
          ), ie(t, this, "connect_timeout"), ie(t, this, "options");
          var n = typeof this.ssl == "object" ? this.ssl : this.ssl ? { sslmode: this.ssl } : {};
          if (ie(t, n, "sslmode"), ie(t, n, "sslca"), ie(t, n, "sslkey"), ie(t, n, "sslcert"), ie(t, n, "sslrootcert"), this.database && t.push("dbname=" + Ne(this.database)), this.replication && t.push("replication=" + Ne(this.replication)), this.host && t.push("host=" + Ne(this.host)), this.isDomainSocket)
            return e(null, t.join(" "));
          this.client_encoding && t.push("client_encoding=" + Ne(this.client_encoding)), fc.lookup(this.host, function(i, s) {
            return i ? e(i, null) : (t.push("hostaddr=" + Ne(s)), e(null, t.join(" ")));
          });
        }
      };
      a(Lr, "ConnectionParameters");
      var Rr = Lr;
      Ls.exports = Rr;
    });
    var Ms = T((Ph, ks) => {
      "use strict";
      p();
      var pc = tt(), Fs = /^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/, kr = class kr {
        constructor(e, t) {
          this.command = null, this.rowCount = null, this.oid = null, this.rows = [], this.fields = [], this._parsers = void 0, this._types = t, this.RowCtor = null, this.rowAsArray = e === "array", this.rowAsArray && (this.parseRow = this._parseRowAsArray);
        }
        addCommandComplete(e) {
          var t;
          e.text ? t = Fs.exec(e.text) : t = Fs.exec(e.command), t && (this.command = t[1], t[3] ? (this.oid = parseInt(
            t[2],
            10
          ), this.rowCount = parseInt(t[3], 10)) : t[2] && (this.rowCount = parseInt(t[2], 10)));
        }
        _parseRowAsArray(e) {
          for (var t = new Array(
            e.length
          ), n = 0, i = e.length; n < i; n++) {
            var s = e[n];
            s !== null ? t[n] = this._parsers[n](s) : t[n] = null;
          }
          return t;
        }
        parseRow(e) {
          for (var t = {}, n = 0, i = e.length; n < i; n++) {
            var s = e[n], o = this.fields[n].name;
            s !== null ? t[o] = this._parsers[n](
              s
            ) : t[o] = null;
          }
          return t;
        }
        addRow(e) {
          this.rows.push(e);
        }
        addFields(e) {
          this.fields = e, this.fields.length && (this._parsers = new Array(e.length));
          for (var t = 0; t < e.length; t++) {
            var n = e[t];
            this._types ? this._parsers[t] = this._types.getTypeParser(n.dataTypeID, n.format || "text") : this._parsers[t] = pc.getTypeParser(n.dataTypeID, n.format || "text");
          }
        }
      };
      a(kr, "Result");
      var Fr = kr;
      ks.exports = Fr;
    });
    var qs = T((Lh, Os) => {
      "use strict";
      p();
      var { EventEmitter: dc } = ve(), Us = Ms(), Ds = st(), Ur = class Ur extends dc {
        constructor(e, t, n) {
          super(), e = Ds.normalizeQueryConfig(e, t, n), this.text = e.text, this.values = e.values, this.rows = e.rows, this.types = e.types, this.name = e.name, this.binary = e.binary, this.portal = e.portal || "", this.callback = e.callback, this._rowMode = e.rowMode, m.domain && e.callback && (this.callback = m.domain.bind(e.callback)), this._result = new Us(this._rowMode, this.types), this._results = this._result, this.isPreparedStatement = false, this._canceledDueToError = false, this._promise = null;
        }
        requiresPreparation() {
          return this.name || this.rows ? true : !this.text || !this.values ? false : this.values.length > 0;
        }
        _checkForMultirow() {
          this._result.command && (Array.isArray(this._results) || (this._results = [this._result]), this._result = new Us(this._rowMode, this.types), this._results.push(this._result));
        }
        handleRowDescription(e) {
          this._checkForMultirow(), this._result.addFields(e.fields), this._accumulateRows = this.callback || !this.listeners("row").length;
        }
        handleDataRow(e) {
          let t;
          if (!this._canceledDueToError) {
            try {
              t = this._result.parseRow(
                e.fields
              );
            } catch (n) {
              this._canceledDueToError = n;
              return;
            }
            this.emit("row", t, this._result), this._accumulateRows && this._result.addRow(t);
          }
        }
        handleCommandComplete(e, t) {
          this._checkForMultirow(), this._result.addCommandComplete(
            e
          ), this.rows && t.sync();
        }
        handleEmptyQuery(e) {
          this.rows && e.sync();
        }
        handleError(e, t) {
          if (this._canceledDueToError && (e = this._canceledDueToError, this._canceledDueToError = false), this.callback)
            return this.callback(e);
          this.emit("error", e);
        }
        handleReadyForQuery(e) {
          if (this._canceledDueToError)
            return this.handleError(
              this._canceledDueToError,
              e
            );
          if (this.callback)
            try {
              this.callback(null, this._results);
            } catch (t) {
              m.nextTick(() => {
                throw t;
              });
            }
          this.emit(
            "end",
            this._results
          );
        }
        submit(e) {
          if (typeof this.text != "string" && typeof this.name != "string")
            return new Error(
              "A query must have either text or a name. Supplying neither is unsupported."
            );
          let t = e.parsedStatements[this.name];
          return this.text && t && this.text !== t ? new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`) : this.values && !Array.isArray(this.values) ? new Error("Query values must be an array") : (this.requiresPreparation() ? this.prepare(e) : e.query(this.text), null);
        }
        hasBeenParsed(e) {
          return this.name && e.parsedStatements[this.name];
        }
        handlePortalSuspended(e) {
          this._getRows(e, this.rows);
        }
        _getRows(e, t) {
          e.execute({ portal: this.portal, rows: t }), t ? e.flush() : e.sync();
        }
        prepare(e) {
          this.isPreparedStatement = true, this.hasBeenParsed(e) || e.parse({ text: this.text, name: this.name, types: this.types });
          try {
            e.bind({ portal: this.portal, statement: this.name, values: this.values, binary: this.binary, valueMapper: Ds.prepareValue });
          } catch (t) {
            this.handleError(t, e);
            return;
          }
          e.describe({ type: "P", name: this.portal || "" }), this._getRows(e, this.rows);
        }
        handleCopyInResponse(e) {
          e.sendCopyFail("No source stream defined");
        }
        handleCopyData(e, t) {
        }
      };
      a(Ur, "Query");
      var Mr = Ur;
      Os.exports = Mr;
    });
    var hn = T((_) => {
      "use strict";
      p();
      Object.defineProperty(_, "__esModule", { value: true });
      _.NoticeMessage = _.DataRowMessage = _.CommandCompleteMessage = _.ReadyForQueryMessage = _.NotificationResponseMessage = _.BackendKeyDataMessage = _.AuthenticationMD5Password = _.ParameterStatusMessage = _.ParameterDescriptionMessage = _.RowDescriptionMessage = _.Field = _.CopyResponse = _.CopyDataMessage = _.DatabaseError = _.copyDone = _.emptyQuery = _.replicationStart = _.portalSuspended = _.noData = _.closeComplete = _.bindComplete = _.parseComplete = void 0;
      _.parseComplete = { name: "parseComplete", length: 5 };
      _.bindComplete = { name: "bindComplete", length: 5 };
      _.closeComplete = { name: "closeComplete", length: 5 };
      _.noData = { name: "noData", length: 5 };
      _.portalSuspended = { name: "portalSuspended", length: 5 };
      _.replicationStart = { name: "replicationStart", length: 4 };
      _.emptyQuery = { name: "emptyQuery", length: 4 };
      _.copyDone = { name: "copyDone", length: 4 };
      var Zr = class Zr extends Error {
        constructor(e, t, n) {
          super(e), this.length = t, this.name = n;
        }
      };
      a(Zr, "DatabaseError");
      var Dr = Zr;
      _.DatabaseError = Dr;
      var Jr = class Jr {
        constructor(e, t) {
          this.length = e, this.chunk = t, this.name = "copyData";
        }
      };
      a(Jr, "CopyDataMessage");
      var Or = Jr;
      _.CopyDataMessage = Or;
      var Xr = class Xr {
        constructor(e, t, n, i) {
          this.length = e, this.name = t, this.binary = n, this.columnTypes = new Array(i);
        }
      };
      a(Xr, "CopyResponse");
      var qr = Xr;
      _.CopyResponse = qr;
      var en = class en {
        constructor(e, t, n, i, s, o, u) {
          this.name = e, this.tableID = t, this.columnID = n, this.dataTypeID = i, this.dataTypeSize = s, this.dataTypeModifier = o, this.format = u;
        }
      };
      a(en, "Field");
      var Qr = en;
      _.Field = Qr;
      var tn = class tn {
        constructor(e, t) {
          this.length = e, this.fieldCount = t, this.name = "rowDescription", this.fields = new Array(this.fieldCount);
        }
      };
      a(tn, "RowDescriptionMessage");
      var Nr = tn;
      _.RowDescriptionMessage = Nr;
      var rn = class rn {
        constructor(e, t) {
          this.length = e, this.parameterCount = t, this.name = "parameterDescription", this.dataTypeIDs = new Array(this.parameterCount);
        }
      };
      a(rn, "ParameterDescriptionMessage");
      var Wr = rn;
      _.ParameterDescriptionMessage = Wr;
      var nn = class nn {
        constructor(e, t, n) {
          this.length = e, this.parameterName = t, this.parameterValue = n, this.name = "parameterStatus";
        }
      };
      a(nn, "ParameterStatusMessage");
      var jr = nn;
      _.ParameterStatusMessage = jr;
      var sn = class sn {
        constructor(e, t) {
          this.length = e, this.salt = t, this.name = "authenticationMD5Password";
        }
      };
      a(sn, "AuthenticationMD5Password");
      var Hr = sn;
      _.AuthenticationMD5Password = Hr;
      var on = class on {
        constructor(e, t, n) {
          this.length = e, this.processID = t, this.secretKey = n, this.name = "backendKeyData";
        }
      };
      a(on, "BackendKeyDataMessage");
      var $r = on;
      _.BackendKeyDataMessage = $r;
      var an = class an {
        constructor(e, t, n, i) {
          this.length = e, this.processId = t, this.channel = n, this.payload = i, this.name = "notification";
        }
      };
      a(an, "NotificationResponseMessage");
      var Gr = an;
      _.NotificationResponseMessage = Gr;
      var un = class un {
        constructor(e, t) {
          this.length = e, this.status = t, this.name = "readyForQuery";
        }
      };
      a(un, "ReadyForQueryMessage");
      var Vr = un;
      _.ReadyForQueryMessage = Vr;
      var cn = class cn {
        constructor(e, t) {
          this.length = e, this.text = t, this.name = "commandComplete";
        }
      };
      a(cn, "CommandCompleteMessage");
      var zr = cn;
      _.CommandCompleteMessage = zr;
      var ln = class ln {
        constructor(e, t) {
          this.length = e, this.fields = t, this.name = "dataRow", this.fieldCount = t.length;
        }
      };
      a(ln, "DataRowMessage");
      var Kr = ln;
      _.DataRowMessage = Kr;
      var fn = class fn {
        constructor(e, t) {
          this.length = e, this.message = t, this.name = "notice";
        }
      };
      a(fn, "NoticeMessage");
      var Yr = fn;
      _.NoticeMessage = Yr;
    });
    var Qs = T((Rt) => {
      "use strict";
      p();
      Object.defineProperty(Rt, "__esModule", { value: true });
      Rt.Writer = void 0;
      var dn = class dn {
        constructor(e = 256) {
          this.size = e, this.offset = 5, this.headerPosition = 0, this.buffer = d.allocUnsafe(e);
        }
        ensure(e) {
          if (this.buffer.length - this.offset < e) {
            let n = this.buffer, i = n.length + (n.length >> 1) + e;
            this.buffer = d.allocUnsafe(i), n.copy(
              this.buffer
            );
          }
        }
        addInt32(e) {
          return this.ensure(4), this.buffer[this.offset++] = e >>> 24 & 255, this.buffer[this.offset++] = e >>> 16 & 255, this.buffer[this.offset++] = e >>> 8 & 255, this.buffer[this.offset++] = e >>> 0 & 255, this;
        }
        addInt16(e) {
          return this.ensure(2), this.buffer[this.offset++] = e >>> 8 & 255, this.buffer[this.offset++] = e >>> 0 & 255, this;
        }
        addCString(e) {
          if (!e)
            this.ensure(1);
          else {
            let t = d.byteLength(e);
            this.ensure(t + 1), this.buffer.write(e, this.offset, "utf-8"), this.offset += t;
          }
          return this.buffer[this.offset++] = 0, this;
        }
        addString(e = "") {
          let t = d.byteLength(e);
          return this.ensure(t), this.buffer.write(e, this.offset), this.offset += t, this;
        }
        add(e) {
          return this.ensure(
            e.length
          ), e.copy(this.buffer, this.offset), this.offset += e.length, this;
        }
        join(e) {
          if (e) {
            this.buffer[this.headerPosition] = e;
            let t = this.offset - (this.headerPosition + 1);
            this.buffer.writeInt32BE(t, this.headerPosition + 1);
          }
          return this.buffer.slice(e ? 0 : 5, this.offset);
        }
        flush(e) {
          let t = this.join(e);
          return this.offset = 5, this.headerPosition = 0, this.buffer = d.allocUnsafe(this.size), t;
        }
      };
      a(dn, "Writer");
      var pn = dn;
      Rt.Writer = pn;
    });
    var Ws = T((Ft) => {
      "use strict";
      p();
      Object.defineProperty(Ft, "__esModule", { value: true });
      Ft.serialize = void 0;
      var yn = Qs(), F = new yn.Writer(), yc = a((r) => {
        F.addInt16(3).addInt16(0);
        for (let n of Object.keys(r))
          F.addCString(
            n
          ).addCString(r[n]);
        F.addCString("client_encoding").addCString("UTF8");
        let e = F.addCString("").flush(), t = e.length + 4;
        return new yn.Writer().addInt32(t).add(e).flush();
      }, "startup"), mc = a(() => {
        let r = d.allocUnsafe(
          8
        );
        return r.writeInt32BE(8, 0), r.writeInt32BE(80877103, 4), r;
      }, "requestSsl"), wc = a((r) => F.addCString(r).flush(
        112
      ), "password"), gc = a(function(r, e) {
        return F.addCString(r).addInt32(d.byteLength(e)).addString(e), F.flush(112);
      }, "sendSASLInitialResponseMessage"), bc = a(function(r) {
        return F.addString(r).flush(112);
      }, "sendSCRAMClientFinalMessage"), vc = a((r) => F.addCString(r).flush(81), "query"), Ns = [], xc = a((r) => {
        let e = r.name || "";
        e.length > 63 && (console.error("Warning! Postgres only supports 63 characters for query names."), console.error("You supplied %s (%s)", e, e.length), console.error("This can cause conflicts and silent errors executing queries"));
        let t = r.types || Ns, n = t.length, i = F.addCString(e).addCString(r.text).addInt16(n);
        for (let s = 0; s < n; s++)
          i.addInt32(t[s]);
        return F.flush(80);
      }, "parse"), We = new yn.Writer(), Sc = a(function(r, e) {
        for (let t = 0; t < r.length; t++) {
          let n = e ? e(r[t], t) : r[t];
          n == null ? (F.addInt16(0), We.addInt32(-1)) : n instanceof d ? (F.addInt16(
            1
          ), We.addInt32(n.length), We.add(n)) : (F.addInt16(0), We.addInt32(d.byteLength(n)), We.addString(n));
        }
      }, "writeValues"), Ec = a((r = {}) => {
        let e = r.portal || "", t = r.statement || "", n = r.binary || false, i = r.values || Ns, s = i.length;
        return F.addCString(e).addCString(t), F.addInt16(s), Sc(i, r.valueMapper), F.addInt16(s), F.add(We.flush()), F.addInt16(n ? 1 : 0), F.flush(66);
      }, "bind"), Ac = d.from([69, 0, 0, 0, 9, 0, 0, 0, 0, 0]), Cc = a((r) => {
        if (!r || !r.portal && !r.rows)
          return Ac;
        let e = r.portal || "", t = r.rows || 0, n = d.byteLength(e), i = 4 + n + 1 + 4, s = d.allocUnsafe(1 + i);
        return s[0] = 69, s.writeInt32BE(i, 1), s.write(e, 5, "utf-8"), s[n + 5] = 0, s.writeUInt32BE(t, s.length - 4), s;
      }, "execute"), _c = a(
        (r, e) => {
          let t = d.allocUnsafe(16);
          return t.writeInt32BE(16, 0), t.writeInt16BE(1234, 4), t.writeInt16BE(
            5678,
            6
          ), t.writeInt32BE(r, 8), t.writeInt32BE(e, 12), t;
        },
        "cancel"
      ), mn = a((r, e) => {
        let n = 4 + d.byteLength(e) + 1, i = d.allocUnsafe(1 + n);
        return i[0] = r, i.writeInt32BE(n, 1), i.write(e, 5, "utf-8"), i[n] = 0, i;
      }, "cstringMessage"), Ic = F.addCString("P").flush(68), Tc = F.addCString("S").flush(68), Pc = a((r) => r.name ? mn(68, `${r.type}${r.name || ""}`) : r.type === "P" ? Ic : Tc, "describe"), Bc = a((r) => {
        let e = `${r.type}${r.name || ""}`;
        return mn(67, e);
      }, "close"), Rc = a((r) => F.add(r).flush(100), "copyData"), Lc = a((r) => mn(102, r), "copyFail"), Lt = a((r) => d.from([r, 0, 0, 0, 4]), "codeOnlyBuffer"), Fc = Lt(72), kc = Lt(83), Mc = Lt(88), Uc = Lt(99), Dc = {
        startup: yc,
        password: wc,
        requestSsl: mc,
        sendSASLInitialResponseMessage: gc,
        sendSCRAMClientFinalMessage: bc,
        query: vc,
        parse: xc,
        bind: Ec,
        execute: Cc,
        describe: Pc,
        close: Bc,
        flush: a(
          () => Fc,
          "flush"
        ),
        sync: a(() => kc, "sync"),
        end: a(() => Mc, "end"),
        copyData: Rc,
        copyDone: a(() => Uc, "copyDone"),
        copyFail: Lc,
        cancel: _c
      };
      Ft.serialize = Dc;
    });
    var js = T((kt) => {
      "use strict";
      p();
      Object.defineProperty(kt, "__esModule", { value: true });
      kt.BufferReader = void 0;
      var Oc = d.allocUnsafe(0), gn = class gn {
        constructor(e = 0) {
          this.offset = e, this.buffer = Oc, this.encoding = "utf-8";
        }
        setBuffer(e, t) {
          this.offset = e, this.buffer = t;
        }
        int16() {
          let e = this.buffer.readInt16BE(this.offset);
          return this.offset += 2, e;
        }
        byte() {
          let e = this.buffer[this.offset];
          return this.offset++, e;
        }
        int32() {
          let e = this.buffer.readInt32BE(
            this.offset
          );
          return this.offset += 4, e;
        }
        uint32() {
          let e = this.buffer.readUInt32BE(this.offset);
          return this.offset += 4, e;
        }
        string(e) {
          let t = this.buffer.toString(this.encoding, this.offset, this.offset + e);
          return this.offset += e, t;
        }
        cstring() {
          let e = this.offset, t = e;
          for (; this.buffer[t++] !== 0; )
            ;
          return this.offset = t, this.buffer.toString(this.encoding, e, t - 1);
        }
        bytes(e) {
          let t = this.buffer.slice(this.offset, this.offset + e);
          return this.offset += e, t;
        }
      };
      a(gn, "BufferReader");
      var wn = gn;
      kt.BufferReader = wn;
    });
    var Gs = T((Mt) => {
      "use strict";
      p();
      Object.defineProperty(Mt, "__esModule", { value: true });
      Mt.Parser = void 0;
      var k = hn(), qc = js(), bn = 1, Qc = 4, Hs = bn + Qc, $s = d.allocUnsafe(0), xn = class xn {
        constructor(e) {
          if (this.buffer = $s, this.bufferLength = 0, this.bufferOffset = 0, this.reader = new qc.BufferReader(), e?.mode === "binary")
            throw new Error("Binary mode not supported yet");
          this.mode = e?.mode || "text";
        }
        parse(e, t) {
          this.mergeBuffer(e);
          let n = this.bufferOffset + this.bufferLength, i = this.bufferOffset;
          for (; i + Hs <= n; ) {
            let s = this.buffer[i], o = this.buffer.readUInt32BE(
              i + bn
            ), u = bn + o;
            if (u + i <= n) {
              let c = this.handlePacket(i + Hs, s, o, this.buffer);
              t(c), i += u;
            } else
              break;
          }
          i === n ? (this.buffer = $s, this.bufferLength = 0, this.bufferOffset = 0) : (this.bufferLength = n - i, this.bufferOffset = i);
        }
        mergeBuffer(e) {
          if (this.bufferLength > 0) {
            let t = this.bufferLength + e.byteLength;
            if (t + this.bufferOffset > this.buffer.byteLength) {
              let i;
              if (t <= this.buffer.byteLength && this.bufferOffset >= this.bufferLength)
                i = this.buffer;
              else {
                let s = this.buffer.byteLength * 2;
                for (; t >= s; )
                  s *= 2;
                i = d.allocUnsafe(s);
              }
              this.buffer.copy(i, 0, this.bufferOffset, this.bufferOffset + this.bufferLength), this.buffer = i, this.bufferOffset = 0;
            }
            e.copy(this.buffer, this.bufferOffset + this.bufferLength), this.bufferLength = t;
          } else
            this.buffer = e, this.bufferOffset = 0, this.bufferLength = e.byteLength;
        }
        handlePacket(e, t, n, i) {
          switch (t) {
            case 50:
              return k.bindComplete;
            case 49:
              return k.parseComplete;
            case 51:
              return k.closeComplete;
            case 110:
              return k.noData;
            case 115:
              return k.portalSuspended;
            case 99:
              return k.copyDone;
            case 87:
              return k.replicationStart;
            case 73:
              return k.emptyQuery;
            case 68:
              return this.parseDataRowMessage(e, n, i);
            case 67:
              return this.parseCommandCompleteMessage(
                e,
                n,
                i
              );
            case 90:
              return this.parseReadyForQueryMessage(e, n, i);
            case 65:
              return this.parseNotificationMessage(
                e,
                n,
                i
              );
            case 82:
              return this.parseAuthenticationResponse(e, n, i);
            case 83:
              return this.parseParameterStatusMessage(
                e,
                n,
                i
              );
            case 75:
              return this.parseBackendKeyData(e, n, i);
            case 69:
              return this.parseErrorMessage(e, n, i, "error");
            case 78:
              return this.parseErrorMessage(e, n, i, "notice");
            case 84:
              return this.parseRowDescriptionMessage(
                e,
                n,
                i
              );
            case 116:
              return this.parseParameterDescriptionMessage(e, n, i);
            case 71:
              return this.parseCopyInMessage(
                e,
                n,
                i
              );
            case 72:
              return this.parseCopyOutMessage(e, n, i);
            case 100:
              return this.parseCopyData(e, n, i);
            default:
              return new k.DatabaseError("received invalid response: " + t.toString(16), n, "error");
          }
        }
        parseReadyForQueryMessage(e, t, n) {
          this.reader.setBuffer(e, n);
          let i = this.reader.string(1);
          return new k.ReadyForQueryMessage(t, i);
        }
        parseCommandCompleteMessage(e, t, n) {
          this.reader.setBuffer(e, n);
          let i = this.reader.cstring();
          return new k.CommandCompleteMessage(t, i);
        }
        parseCopyData(e, t, n) {
          let i = n.slice(e, e + (t - 4));
          return new k.CopyDataMessage(t, i);
        }
        parseCopyInMessage(e, t, n) {
          return this.parseCopyMessage(
            e,
            t,
            n,
            "copyInResponse"
          );
        }
        parseCopyOutMessage(e, t, n) {
          return this.parseCopyMessage(e, t, n, "copyOutResponse");
        }
        parseCopyMessage(e, t, n, i) {
          this.reader.setBuffer(e, n);
          let s = this.reader.byte() !== 0, o = this.reader.int16(), u = new k.CopyResponse(t, i, s, o);
          for (let c = 0; c < o; c++)
            u.columnTypes[c] = this.reader.int16();
          return u;
        }
        parseNotificationMessage(e, t, n) {
          this.reader.setBuffer(e, n);
          let i = this.reader.int32(), s = this.reader.cstring(), o = this.reader.cstring();
          return new k.NotificationResponseMessage(t, i, s, o);
        }
        parseRowDescriptionMessage(e, t, n) {
          this.reader.setBuffer(
            e,
            n
          );
          let i = this.reader.int16(), s = new k.RowDescriptionMessage(t, i);
          for (let o = 0; o < i; o++)
            s.fields[o] = this.parseField();
          return s;
        }
        parseField() {
          let e = this.reader.cstring(), t = this.reader.uint32(), n = this.reader.int16(), i = this.reader.uint32(), s = this.reader.int16(), o = this.reader.int32(), u = this.reader.int16() === 0 ? "text" : "binary";
          return new k.Field(e, t, n, i, s, o, u);
        }
        parseParameterDescriptionMessage(e, t, n) {
          this.reader.setBuffer(e, n);
          let i = this.reader.int16(), s = new k.ParameterDescriptionMessage(t, i);
          for (let o = 0; o < i; o++)
            s.dataTypeIDs[o] = this.reader.int32();
          return s;
        }
        parseDataRowMessage(e, t, n) {
          this.reader.setBuffer(e, n);
          let i = this.reader.int16(), s = new Array(i);
          for (let o = 0; o < i; o++) {
            let u = this.reader.int32();
            s[o] = u === -1 ? null : this.reader.string(u);
          }
          return new k.DataRowMessage(t, s);
        }
        parseParameterStatusMessage(e, t, n) {
          this.reader.setBuffer(e, n);
          let i = this.reader.cstring(), s = this.reader.cstring();
          return new k.ParameterStatusMessage(
            t,
            i,
            s
          );
        }
        parseBackendKeyData(e, t, n) {
          this.reader.setBuffer(e, n);
          let i = this.reader.int32(), s = this.reader.int32();
          return new k.BackendKeyDataMessage(t, i, s);
        }
        parseAuthenticationResponse(e, t, n) {
          this.reader.setBuffer(
            e,
            n
          );
          let i = this.reader.int32(), s = { name: "authenticationOk", length: t };
          switch (i) {
            case 0:
              break;
            case 3:
              s.length === 8 && (s.name = "authenticationCleartextPassword");
              break;
            case 5:
              if (s.length === 12) {
                s.name = "authenticationMD5Password";
                let o = this.reader.bytes(4);
                return new k.AuthenticationMD5Password(t, o);
              }
              break;
            case 10:
              {
                s.name = "authenticationSASL", s.mechanisms = [];
                let o;
                do
                  o = this.reader.cstring(), o && s.mechanisms.push(o);
                while (o);
              }
              break;
            case 11:
              s.name = "authenticationSASLContinue", s.data = this.reader.string(t - 8);
              break;
            case 12:
              s.name = "authenticationSASLFinal", s.data = this.reader.string(t - 8);
              break;
            default:
              throw new Error("Unknown authenticationOk message type " + i);
          }
          return s;
        }
        parseErrorMessage(e, t, n, i) {
          this.reader.setBuffer(e, n);
          let s = {}, o = this.reader.string(1);
          for (; o !== "\0"; )
            s[o] = this.reader.cstring(), o = this.reader.string(1);
          let u = s.M, c = i === "notice" ? new k.NoticeMessage(t, u) : new k.DatabaseError(u, t, i);
          return c.severity = s.S, c.code = s.C, c.detail = s.D, c.hint = s.H, c.position = s.P, c.internalPosition = s.p, c.internalQuery = s.q, c.where = s.W, c.schema = s.s, c.table = s.t, c.column = s.c, c.dataType = s.d, c.constraint = s.n, c.file = s.F, c.line = s.L, c.routine = s.R, c;
        }
      };
      a(xn, "Parser");
      var vn = xn;
      Mt.Parser = vn;
    });
    var Sn = T((Ee) => {
      "use strict";
      p();
      Object.defineProperty(Ee, "__esModule", { value: true });
      Ee.DatabaseError = Ee.serialize = Ee.parse = void 0;
      var Nc = hn();
      Object.defineProperty(Ee, "DatabaseError", { enumerable: true, get: a(
        function() {
          return Nc.DatabaseError;
        },
        "get"
      ) });
      var Wc = Ws();
      Object.defineProperty(Ee, "serialize", {
        enumerable: true,
        get: a(function() {
          return Wc.serialize;
        }, "get")
      });
      var jc = Gs();
      function Hc(r, e) {
        let t = new jc.Parser();
        return r.on("data", (n) => t.parse(n, e)), new Promise((n) => r.on("end", () => n()));
      }
      a(Hc, "parse");
      Ee.parse = Hc;
    });
    var Vs = {};
    te(Vs, { connect: () => $c });
    function $c({ socket: r, servername: e }) {
      return r.startTls(e), r;
    }
    var zs = G(
      () => {
        "use strict";
        p();
        a($c, "connect");
      }
    );
    var Cn = T((tp, Zs) => {
      "use strict";
      p();
      var Ks = (ke(), O(gi)), Gc = ve().EventEmitter, { parse: Vc, serialize: Q } = Sn(), Ys = Q.flush(), zc = Q.sync(), Kc = Q.end(), An = class An extends Gc {
        constructor(e) {
          super(), e = e || {}, this.stream = e.stream || new Ks.Socket(), this._keepAlive = e.keepAlive, this._keepAliveInitialDelayMillis = e.keepAliveInitialDelayMillis, this.lastBuffer = false, this.parsedStatements = {}, this.ssl = e.ssl || false, this._ending = false, this._emitMessage = false;
          var t = this;
          this.on("newListener", function(n) {
            n === "message" && (t._emitMessage = true);
          });
        }
        connect(e, t) {
          var n = this;
          this._connecting = true, this.stream.setNoDelay(true), this.stream.connect(e, t), this.stream.once("connect", function() {
            n._keepAlive && n.stream.setKeepAlive(true, n._keepAliveInitialDelayMillis), n.emit("connect");
          });
          let i = a(function(s) {
            n._ending && (s.code === "ECONNRESET" || s.code === "EPIPE") || n.emit("error", s);
          }, "reportStreamError");
          if (this.stream.on("error", i), this.stream.on("close", function() {
            n.emit("end");
          }), !this.ssl)
            return this.attachListeners(
              this.stream
            );
          this.stream.once("data", function(s) {
            var o = s.toString("utf8");
            switch (o) {
              case "S":
                break;
              case "N":
                return n.stream.end(), n.emit("error", new Error("The server does not support SSL connections"));
              default:
                return n.stream.end(), n.emit("error", new Error("There was an error establishing an SSL connection"));
            }
            var u = (zs(), O(Vs));
            let c = { socket: n.stream };
            n.ssl !== true && (Object.assign(c, n.ssl), "key" in n.ssl && (c.key = n.ssl.key)), Ks.isIP(t) === 0 && (c.servername = t);
            try {
              n.stream = u.connect(c);
            } catch (l) {
              return n.emit(
                "error",
                l
              );
            }
            n.attachListeners(n.stream), n.stream.on("error", i), n.emit("sslconnect");
          });
        }
        attachListeners(e) {
          e.on(
            "end",
            () => {
              this.emit("end");
            }
          ), Vc(e, (t) => {
            var n = t.name === "error" ? "errorMessage" : t.name;
            this._emitMessage && this.emit("message", t), this.emit(n, t);
          });
        }
        requestSsl() {
          this.stream.write(Q.requestSsl());
        }
        startup(e) {
          this.stream.write(Q.startup(e));
        }
        cancel(e, t) {
          this._send(Q.cancel(e, t));
        }
        password(e) {
          this._send(Q.password(e));
        }
        sendSASLInitialResponseMessage(e, t) {
          this._send(Q.sendSASLInitialResponseMessage(e, t));
        }
        sendSCRAMClientFinalMessage(e) {
          this._send(Q.sendSCRAMClientFinalMessage(
            e
          ));
        }
        _send(e) {
          return this.stream.writable ? this.stream.write(e) : false;
        }
        query(e) {
          this._send(Q.query(e));
        }
        parse(e) {
          this._send(Q.parse(e));
        }
        bind(e) {
          this._send(Q.bind(e));
        }
        execute(e) {
          this._send(Q.execute(e));
        }
        flush() {
          this.stream.writable && this.stream.write(Ys);
        }
        sync() {
          this._ending = true, this._send(Ys), this._send(zc);
        }
        ref() {
          this.stream.ref();
        }
        unref() {
          this.stream.unref();
        }
        end() {
          if (this._ending = true, !this._connecting || !this.stream.writable) {
            this.stream.end();
            return;
          }
          return this.stream.write(Kc, () => {
            this.stream.end();
          });
        }
        close(e) {
          this._send(Q.close(e));
        }
        describe(e) {
          this._send(Q.describe(e));
        }
        sendCopyFromChunk(e) {
          this._send(Q.copyData(e));
        }
        endCopyFrom() {
          this._send(Q.copyDone());
        }
        sendCopyFail(e) {
          this._send(Q.copyFail(e));
        }
      };
      a(An, "Connection");
      var En = An;
      Zs.exports = En;
    });
    var eo = T((sp, Xs) => {
      "use strict";
      p();
      var Yc = ve().EventEmitter, ip = (at(), O(ot)), Zc = st(), _n = ds(), Jc = Cs(), Xc = At(), el = Bt(), Js = qs(), tl = it(), rl = Cn(), In = class In extends Yc {
        constructor(e) {
          super(), this.connectionParameters = new el(e), this.user = this.connectionParameters.user, this.database = this.connectionParameters.database, this.port = this.connectionParameters.port, this.host = this.connectionParameters.host, Object.defineProperty(
            this,
            "password",
            { configurable: true, enumerable: false, writable: true, value: this.connectionParameters.password }
          ), this.replication = this.connectionParameters.replication;
          var t = e || {};
          this._Promise = t.Promise || b.Promise, this._types = new Xc(t.types), this._ending = false, this._connecting = false, this._connected = false, this._connectionError = false, this._queryable = true, this.connection = t.connection || new rl({ stream: t.stream, ssl: this.connectionParameters.ssl, keepAlive: t.keepAlive || false, keepAliveInitialDelayMillis: t.keepAliveInitialDelayMillis || 0, encoding: this.connectionParameters.client_encoding || "utf8" }), this.queryQueue = [], this.binary = t.binary || tl.binary, this.processID = null, this.secretKey = null, this.ssl = this.connectionParameters.ssl || false, this.ssl && this.ssl.key && Object.defineProperty(this.ssl, "key", { enumerable: false }), this._connectionTimeoutMillis = t.connectionTimeoutMillis || 0;
        }
        _errorAllQueries(e) {
          let t = a((n) => {
            m.nextTick(() => {
              n.handleError(e, this.connection);
            });
          }, "enqueueError");
          this.activeQuery && (t(this.activeQuery), this.activeQuery = null), this.queryQueue.forEach(t), this.queryQueue.length = 0;
        }
        _connect(e) {
          var t = this, n = this.connection;
          if (this._connectionCallback = e, this._connecting || this._connected) {
            let i = new Error("Client has already been connected. You cannot reuse a client.");
            m.nextTick(
              () => {
                e(i);
              }
            );
            return;
          }
          this._connecting = true, this.connectionTimeoutHandle, this._connectionTimeoutMillis > 0 && (this.connectionTimeoutHandle = setTimeout(() => {
            n._ending = true, n.stream.destroy(new Error("timeout expired"));
          }, this._connectionTimeoutMillis)), this.host && this.host.indexOf("/") === 0 ? n.connect(this.host + "/.s.PGSQL." + this.port) : n.connect(this.port, this.host), n.on("connect", function() {
            t.ssl ? n.requestSsl() : n.startup(t.getStartupConf());
          }), n.on("sslconnect", function() {
            n.startup(t.getStartupConf());
          }), this._attachListeners(
            n
          ), n.once("end", () => {
            let i = this._ending ? new Error("Connection terminated") : new Error("Connection terminated unexpectedly");
            clearTimeout(this.connectionTimeoutHandle), this._errorAllQueries(i), this._ending || (this._connecting && !this._connectionError ? this._connectionCallback ? this._connectionCallback(i) : this._handleErrorEvent(i) : this._connectionError || this._handleErrorEvent(i)), m.nextTick(() => {
              this.emit("end");
            });
          });
        }
        connect(e) {
          if (e) {
            this._connect(e);
            return;
          }
          return new this._Promise((t, n) => {
            this._connect((i) => {
              i ? n(i) : t();
            });
          });
        }
        _attachListeners(e) {
          e.on("authenticationCleartextPassword", this._handleAuthCleartextPassword.bind(this)), e.on("authenticationMD5Password", this._handleAuthMD5Password.bind(this)), e.on("authenticationSASL", this._handleAuthSASL.bind(this)), e.on("authenticationSASLContinue", this._handleAuthSASLContinue.bind(this)), e.on("authenticationSASLFinal", this._handleAuthSASLFinal.bind(this)), e.on("backendKeyData", this._handleBackendKeyData.bind(this)), e.on("error", this._handleErrorEvent.bind(this)), e.on("errorMessage", this._handleErrorMessage.bind(this)), e.on("readyForQuery", this._handleReadyForQuery.bind(this)), e.on("notice", this._handleNotice.bind(this)), e.on("rowDescription", this._handleRowDescription.bind(this)), e.on("dataRow", this._handleDataRow.bind(this)), e.on("portalSuspended", this._handlePortalSuspended.bind(
            this
          )), e.on("emptyQuery", this._handleEmptyQuery.bind(this)), e.on("commandComplete", this._handleCommandComplete.bind(this)), e.on("parseComplete", this._handleParseComplete.bind(this)), e.on("copyInResponse", this._handleCopyInResponse.bind(this)), e.on("copyData", this._handleCopyData.bind(this)), e.on("notification", this._handleNotification.bind(this));
        }
        _checkPgPass(e) {
          let t = this.connection;
          typeof this.password == "function" ? this._Promise.resolve().then(() => this.password()).then((n) => {
            if (n !== void 0) {
              if (typeof n != "string") {
                t.emit("error", new TypeError(
                  "Password must be a string"
                ));
                return;
              }
              this.connectionParameters.password = this.password = n;
            } else
              this.connectionParameters.password = this.password = null;
            e();
          }).catch((n) => {
            t.emit("error", n);
          }) : this.password !== null ? e() : Jc(
            this.connectionParameters,
            (n) => {
              n !== void 0 && (this.connectionParameters.password = this.password = n), e();
            }
          );
        }
        _handleAuthCleartextPassword(e) {
          this._checkPgPass(() => {
            this.connection.password(this.password);
          });
        }
        _handleAuthMD5Password(e) {
          this._checkPgPass(
            () => {
              let t = Zc.postgresMd5PasswordHash(this.user, this.password, e.salt);
              this.connection.password(t);
            }
          );
        }
        _handleAuthSASL(e) {
          this._checkPgPass(() => {
            this.saslSession = _n.startSession(e.mechanisms), this.connection.sendSASLInitialResponseMessage(
              this.saslSession.mechanism,
              this.saslSession.response
            );
          });
        }
        _handleAuthSASLContinue(e) {
          _n.continueSession(
            this.saslSession,
            this.password,
            e.data
          ), this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
        }
        _handleAuthSASLFinal(e) {
          _n.finalizeSession(this.saslSession, e.data), this.saslSession = null;
        }
        _handleBackendKeyData(e) {
          this.processID = e.processID, this.secretKey = e.secretKey;
        }
        _handleReadyForQuery(e) {
          this._connecting && (this._connecting = false, this._connected = true, clearTimeout(this.connectionTimeoutHandle), this._connectionCallback && (this._connectionCallback(null, this), this._connectionCallback = null), this.emit("connect"));
          let { activeQuery: t } = this;
          this.activeQuery = null, this.readyForQuery = true, t && t.handleReadyForQuery(this.connection), this._pulseQueryQueue();
        }
        _handleErrorWhileConnecting(e) {
          if (!this._connectionError) {
            if (this._connectionError = true, clearTimeout(this.connectionTimeoutHandle), this._connectionCallback)
              return this._connectionCallback(e);
            this.emit("error", e);
          }
        }
        _handleErrorEvent(e) {
          if (this._connecting)
            return this._handleErrorWhileConnecting(e);
          this._queryable = false, this._errorAllQueries(e), this.emit("error", e);
        }
        _handleErrorMessage(e) {
          if (this._connecting)
            return this._handleErrorWhileConnecting(e);
          let t = this.activeQuery;
          if (!t) {
            this._handleErrorEvent(e);
            return;
          }
          this.activeQuery = null, t.handleError(
            e,
            this.connection
          );
        }
        _handleRowDescription(e) {
          this.activeQuery.handleRowDescription(e);
        }
        _handleDataRow(e) {
          this.activeQuery.handleDataRow(e);
        }
        _handlePortalSuspended(e) {
          this.activeQuery.handlePortalSuspended(this.connection);
        }
        _handleEmptyQuery(e) {
          this.activeQuery.handleEmptyQuery(this.connection);
        }
        _handleCommandComplete(e) {
          this.activeQuery.handleCommandComplete(e, this.connection);
        }
        _handleParseComplete(e) {
          this.activeQuery.name && (this.connection.parsedStatements[this.activeQuery.name] = this.activeQuery.text);
        }
        _handleCopyInResponse(e) {
          this.activeQuery.handleCopyInResponse(this.connection);
        }
        _handleCopyData(e) {
          this.activeQuery.handleCopyData(
            e,
            this.connection
          );
        }
        _handleNotification(e) {
          this.emit("notification", e);
        }
        _handleNotice(e) {
          this.emit("notice", e);
        }
        getStartupConf() {
          var e = this.connectionParameters, t = { user: e.user, database: e.database }, n = e.application_name || e.fallback_application_name;
          return n && (t.application_name = n), e.replication && (t.replication = "" + e.replication), e.statement_timeout && (t.statement_timeout = String(parseInt(e.statement_timeout, 10))), e.lock_timeout && (t.lock_timeout = String(parseInt(e.lock_timeout, 10))), e.idle_in_transaction_session_timeout && (t.idle_in_transaction_session_timeout = String(parseInt(e.idle_in_transaction_session_timeout, 10))), e.options && (t.options = e.options), t;
        }
        cancel(e, t) {
          if (e.activeQuery === t) {
            var n = this.connection;
            this.host && this.host.indexOf("/") === 0 ? n.connect(this.host + "/.s.PGSQL." + this.port) : n.connect(this.port, this.host), n.on("connect", function() {
              n.cancel(
                e.processID,
                e.secretKey
              );
            });
          } else
            e.queryQueue.indexOf(t) !== -1 && e.queryQueue.splice(e.queryQueue.indexOf(t), 1);
        }
        setTypeParser(e, t, n) {
          return this._types.setTypeParser(e, t, n);
        }
        getTypeParser(e, t) {
          return this._types.getTypeParser(e, t);
        }
        escapeIdentifier(e) {
          return '"' + e.replace(/"/g, '""') + '"';
        }
        escapeLiteral(e) {
          for (var t = false, n = "'", i = 0; i < e.length; i++) {
            var s = e[i];
            s === "'" ? n += s + s : s === "\\" ? (n += s + s, t = true) : n += s;
          }
          return n += "'", t === true && (n = " E" + n), n;
        }
        _pulseQueryQueue() {
          if (this.readyForQuery === true)
            if (this.activeQuery = this.queryQueue.shift(), this.activeQuery) {
              this.readyForQuery = false, this.hasExecuted = true;
              let e = this.activeQuery.submit(this.connection);
              e && m.nextTick(() => {
                this.activeQuery.handleError(e, this.connection), this.readyForQuery = true, this._pulseQueryQueue();
              });
            } else
              this.hasExecuted && (this.activeQuery = null, this.emit("drain"));
        }
        query(e, t, n) {
          var i, s, o, u, c;
          if (e == null)
            throw new TypeError(
              "Client was passed a null or undefined query"
            );
          return typeof e.submit == "function" ? (o = e.query_timeout || this.connectionParameters.query_timeout, s = i = e, typeof t == "function" && (i.callback = i.callback || t)) : (o = this.connectionParameters.query_timeout, i = new Js(e, t, n), i.callback || (s = new this._Promise((l, f) => {
            i.callback = (y, g) => y ? f(y) : l(g);
          }))), o && (c = i.callback, u = setTimeout(() => {
            var l = new Error("Query read timeout");
            m.nextTick(
              () => {
                i.handleError(l, this.connection);
              }
            ), c(l), i.callback = () => {
            };
            var f = this.queryQueue.indexOf(i);
            f > -1 && this.queryQueue.splice(f, 1), this._pulseQueryQueue();
          }, o), i.callback = (l, f) => {
            clearTimeout(u), c(l, f);
          }), this.binary && !i.binary && (i.binary = true), i._result && !i._result._types && (i._result._types = this._types), this._queryable ? this._ending ? (m.nextTick(() => {
            i.handleError(new Error("Client was closed and is not queryable"), this.connection);
          }), s) : (this.queryQueue.push(i), this._pulseQueryQueue(), s) : (m.nextTick(() => {
            i.handleError(new Error("Client has encountered a connection error and is not queryable"), this.connection);
          }), s);
        }
        ref() {
          this.connection.ref();
        }
        unref() {
          this.connection.unref();
        }
        end(e) {
          if (this._ending = true, !this.connection._connecting)
            if (e)
              e();
            else
              return this._Promise.resolve();
          if (this.activeQuery || !this._queryable ? this.connection.stream.destroy() : this.connection.end(), e)
            this.connection.once("end", e);
          else
            return new this._Promise((t) => {
              this.connection.once("end", t);
            });
        }
      };
      a(In, "Client");
      var Ut = In;
      Ut.Query = Js;
      Xs.exports = Ut;
    });
    var io = T((up, no) => {
      "use strict";
      p();
      var nl = ve().EventEmitter, to = a(function() {
      }, "NOOP"), ro = a((r, e) => {
        let t = r.findIndex(e);
        return t === -1 ? void 0 : r.splice(t, 1)[0];
      }, "removeWhere"), Bn = class Bn {
        constructor(e, t, n) {
          this.client = e, this.idleListener = t, this.timeoutId = n;
        }
      };
      a(Bn, "IdleItem");
      var Tn = Bn, Rn = class Rn {
        constructor(e) {
          this.callback = e;
        }
      };
      a(Rn, "PendingItem");
      var je = Rn;
      function il() {
        throw new Error("Release called on client which has already been released to the pool.");
      }
      a(il, "throwOnDoubleRelease");
      function Dt(r, e) {
        if (e)
          return { callback: e, result: void 0 };
        let t, n, i = a(function(o, u) {
          o ? t(o) : n(u);
        }, "cb"), s = new r(function(o, u) {
          n = o, t = u;
        }).catch((o) => {
          throw Error.captureStackTrace(o), o;
        });
        return { callback: i, result: s };
      }
      a(Dt, "promisify");
      function sl(r, e) {
        return a(function t(n) {
          n.client = e, e.removeListener("error", t), e.on("error", () => {
            r.log(
              "additional client error after disconnection due to error",
              n
            );
          }), r._remove(e), r.emit("error", n, e);
        }, "idleListener");
      }
      a(sl, "makeIdleListener");
      var Ln = class Ln extends nl {
        constructor(e, t) {
          super(), this.options = Object.assign({}, e), e != null && "password" in e && Object.defineProperty(this.options, "password", {
            configurable: true,
            enumerable: false,
            writable: true,
            value: e.password
          }), e != null && e.ssl && e.ssl.key && Object.defineProperty(this.options.ssl, "key", { enumerable: false }), this.options.max = this.options.max || this.options.poolSize || 10, this.options.min = this.options.min || 0, this.options.maxUses = this.options.maxUses || 1 / 0, this.options.allowExitOnIdle = this.options.allowExitOnIdle || false, this.options.maxLifetimeSeconds = this.options.maxLifetimeSeconds || 0, this.log = this.options.log || function() {
          }, this.Client = this.options.Client || t || ct().Client, this.Promise = this.options.Promise || b.Promise, typeof this.options.idleTimeoutMillis > "u" && (this.options.idleTimeoutMillis = 1e4), this._clients = [], this._idle = [], this._expired = /* @__PURE__ */ new WeakSet(), this._pendingQueue = [], this._endCallback = void 0, this.ending = false, this.ended = false;
        }
        _isFull() {
          return this._clients.length >= this.options.max;
        }
        _isAboveMin() {
          return this._clients.length > this.options.min;
        }
        _pulseQueue() {
          if (this.log("pulse queue"), this.ended) {
            this.log("pulse queue ended");
            return;
          }
          if (this.ending) {
            this.log("pulse queue on ending"), this._idle.length && this._idle.slice().map((t) => {
              this._remove(t.client);
            }), this._clients.length || (this.ended = true, this._endCallback());
            return;
          }
          if (!this._pendingQueue.length) {
            this.log("no queued requests");
            return;
          }
          if (!this._idle.length && this._isFull())
            return;
          let e = this._pendingQueue.shift();
          if (this._idle.length) {
            let t = this._idle.pop();
            clearTimeout(
              t.timeoutId
            );
            let n = t.client;
            n.ref && n.ref();
            let i = t.idleListener;
            return this._acquireClient(n, e, i, false);
          }
          if (!this._isFull())
            return this.newClient(e);
          throw new Error("unexpected condition");
        }
        _remove(e) {
          let t = ro(
            this._idle,
            (n) => n.client === e
          );
          t !== void 0 && clearTimeout(t.timeoutId), this._clients = this._clients.filter(
            (n) => n !== e
          ), e.end(), this.emit("remove", e);
        }
        connect(e) {
          if (this.ending) {
            let i = new Error("Cannot use a pool after calling end on the pool");
            return e ? e(i) : this.Promise.reject(i);
          }
          let t = Dt(this.Promise, e), n = t.result;
          if (this._isFull() || this._idle.length) {
            if (this._idle.length && m.nextTick(() => this._pulseQueue()), !this.options.connectionTimeoutMillis)
              return this._pendingQueue.push(new je(t.callback)), n;
            let i = a((u, c, l) => {
              clearTimeout(o), t.callback(u, c, l);
            }, "queueCallback"), s = new je(i), o = setTimeout(() => {
              ro(
                this._pendingQueue,
                (u) => u.callback === i
              ), s.timedOut = true, t.callback(new Error("timeout exceeded when trying to connect"));
            }, this.options.connectionTimeoutMillis);
            return o.unref && o.unref(), this._pendingQueue.push(s), n;
          }
          return this.newClient(new je(t.callback)), n;
        }
        newClient(e) {
          let t = new this.Client(this.options);
          this._clients.push(
            t
          );
          let n = sl(this, t);
          this.log("checking client timeout");
          let i, s = false;
          this.options.connectionTimeoutMillis && (i = setTimeout(() => {
            this.log("ending client due to timeout"), s = true, t.connection ? t.connection.stream.destroy() : t.end();
          }, this.options.connectionTimeoutMillis)), this.log("connecting new client"), t.connect((o) => {
            if (i && clearTimeout(i), t.on("error", n), o)
              this.log("client failed to connect", o), this._clients = this._clients.filter((u) => u !== t), s && (o = new Error("Connection terminated due to connection timeout", { cause: o })), this._pulseQueue(), e.timedOut || e.callback(o, void 0, to);
            else {
              if (this.log("new client connected"), this.options.maxLifetimeSeconds !== 0) {
                let u = setTimeout(() => {
                  this.log("ending client due to expired lifetime"), this._expired.add(t), this._idle.findIndex((l) => l.client === t) !== -1 && this._acquireClient(
                    t,
                    new je((l, f, y) => y()),
                    n,
                    false
                  );
                }, this.options.maxLifetimeSeconds * 1e3);
                u.unref(), t.once("end", () => clearTimeout(u));
              }
              return this._acquireClient(t, e, n, true);
            }
          });
        }
        _acquireClient(e, t, n, i) {
          i && this.emit("connect", e), this.emit("acquire", e), e.release = this._releaseOnce(e, n), e.removeListener("error", n), t.timedOut ? i && this.options.verify ? this.options.verify(e, e.release) : e.release() : i && this.options.verify ? this.options.verify(e, (s) => {
            if (s)
              return e.release(s), t.callback(s, void 0, to);
            t.callback(void 0, e, e.release);
          }) : t.callback(void 0, e, e.release);
        }
        _releaseOnce(e, t) {
          let n = false;
          return (i) => {
            n && il(), n = true, this._release(e, t, i);
          };
        }
        _release(e, t, n) {
          if (e.on("error", t), e._poolUseCount = (e._poolUseCount || 0) + 1, this.emit("release", n, e), n || this.ending || !e._queryable || e._ending || e._poolUseCount >= this.options.maxUses) {
            e._poolUseCount >= this.options.maxUses && this.log("remove expended client"), this._remove(e), this._pulseQueue();
            return;
          }
          if (this._expired.has(e)) {
            this.log("remove expired client"), this._expired.delete(e), this._remove(e), this._pulseQueue();
            return;
          }
          let s;
          this.options.idleTimeoutMillis && this._isAboveMin() && (s = setTimeout(() => {
            this.log("remove idle client"), this._remove(e);
          }, this.options.idleTimeoutMillis), this.options.allowExitOnIdle && s.unref()), this.options.allowExitOnIdle && e.unref(), this._idle.push(new Tn(
            e,
            t,
            s
          )), this._pulseQueue();
        }
        query(e, t, n) {
          if (typeof e == "function") {
            let s = Dt(this.Promise, e);
            return v(function() {
              return s.callback(new Error("Passing a function as the first parameter to pool.query is not supported"));
            }), s.result;
          }
          typeof t == "function" && (n = t, t = void 0);
          let i = Dt(this.Promise, n);
          return n = i.callback, this.connect((s, o) => {
            if (s)
              return n(s);
            let u = false, c = a((l) => {
              u || (u = true, o.release(l), n(l));
            }, "onError");
            o.once("error", c), this.log("dispatching query");
            try {
              o.query(e, t, (l, f) => {
                if (this.log("query dispatched"), o.removeListener(
                  "error",
                  c
                ), !u)
                  return u = true, o.release(l), l ? n(l) : n(void 0, f);
              });
            } catch (l) {
              return o.release(l), n(l);
            }
          }), i.result;
        }
        end(e) {
          if (this.log("ending"), this.ending) {
            let n = new Error("Called end on pool more than once");
            return e ? e(n) : this.Promise.reject(n);
          }
          this.ending = true;
          let t = Dt(this.Promise, e);
          return this._endCallback = t.callback, this._pulseQueue(), t.result;
        }
        get waitingCount() {
          return this._pendingQueue.length;
        }
        get idleCount() {
          return this._idle.length;
        }
        get expiredCount() {
          return this._clients.reduce((e, t) => e + (this._expired.has(t) ? 1 : 0), 0);
        }
        get totalCount() {
          return this._clients.length;
        }
      };
      a(Ln, "Pool");
      var Pn = Ln;
      no.exports = Pn;
    });
    var so = {};
    te(so, { default: () => ol });
    var ol;
    var oo = G(() => {
      "use strict";
      p();
      ol = {};
    });
    var ao = T((hp, al) => {
      al.exports = { name: "pg", version: "8.8.0", description: "PostgreSQL client - pure javascript & libpq with the same API", keywords: [
        "database",
        "libpq",
        "pg",
        "postgre",
        "postgres",
        "postgresql",
        "rdbms"
      ], homepage: "https://github.com/brianc/node-postgres", repository: { type: "git", url: "git://github.com/brianc/node-postgres.git", directory: "packages/pg" }, author: "Brian Carlson <brian.m.carlson@gmail.com>", main: "./lib", dependencies: { "buffer-writer": "2.0.0", "packet-reader": "1.0.0", "pg-connection-string": "^2.5.0", "pg-pool": "^3.5.2", "pg-protocol": "^1.5.0", "pg-types": "^2.1.0", pgpass: "1.x" }, devDependencies: {
        async: "2.6.4",
        bluebird: "3.5.2",
        co: "4.6.0",
        "pg-copy-streams": "0.3.0"
      }, peerDependencies: { "pg-native": ">=3.0.1" }, peerDependenciesMeta: { "pg-native": { optional: true } }, scripts: { test: "make test-all" }, files: ["lib", "SPONSORS.md"], license: "MIT", engines: { node: ">= 8.0.0" }, gitHead: "c99fb2c127ddf8d712500db2c7b9a5491a178655" };
    });
    var lo = T((pp, co) => {
      "use strict";
      p();
      var uo = ve().EventEmitter, ul = (at(), O(ot)), Fn = st(), He = co.exports = function(r, e, t) {
        uo.call(this), r = Fn.normalizeQueryConfig(r, e, t), this.text = r.text, this.values = r.values, this.name = r.name, this.callback = r.callback, this.state = "new", this._arrayMode = r.rowMode === "array", this._emitRowEvents = false, this.on("newListener", function(n) {
          n === "row" && (this._emitRowEvents = true);
        }.bind(this));
      };
      ul.inherits(He, uo);
      var cl = { sqlState: "code", statementPosition: "position", messagePrimary: "message", context: "where", schemaName: "schema", tableName: "table", columnName: "column", dataTypeName: "dataType", constraintName: "constraint", sourceFile: "file", sourceLine: "line", sourceFunction: "routine" };
      He.prototype.handleError = function(r) {
        var e = this.native.pq.resultErrorFields();
        if (e)
          for (var t in e) {
            var n = cl[t] || t;
            r[n] = e[t];
          }
        this.callback ? this.callback(r) : this.emit("error", r), this.state = "error";
      };
      He.prototype.then = function(r, e) {
        return this._getPromise().then(
          r,
          e
        );
      };
      He.prototype.catch = function(r) {
        return this._getPromise().catch(r);
      };
      He.prototype._getPromise = function() {
        return this._promise ? this._promise : (this._promise = new Promise(function(r, e) {
          this._once("end", r), this._once("error", e);
        }.bind(this)), this._promise);
      };
      He.prototype.submit = function(r) {
        this.state = "running";
        var e = this;
        this.native = r.native, r.native.arrayMode = this._arrayMode;
        var t = a(function(s, o, u) {
          if (r.native.arrayMode = false, v(function() {
            e.emit("_done");
          }), s)
            return e.handleError(s);
          e._emitRowEvents && (u.length > 1 ? o.forEach(
            (c, l) => {
              c.forEach((f) => {
                e.emit("row", f, u[l]);
              });
            }
          ) : o.forEach(function(c) {
            e.emit("row", c, u);
          })), e.state = "end", e.emit("end", u), e.callback && e.callback(null, u);
        }, "after");
        if (m.domain && (t = m.domain.bind(t)), this.name) {
          this.name.length > 63 && (console.error("Warning! Postgres only supports 63 characters for query names."), console.error("You supplied %s (%s)", this.name, this.name.length), console.error("This can cause conflicts and silent errors executing queries"));
          var n = (this.values || []).map(Fn.prepareValue);
          if (r.namedQueries[this.name]) {
            if (this.text && r.namedQueries[this.name] !== this.text) {
              let s = new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
              return t(s);
            }
            return r.native.execute(this.name, n, t);
          }
          return r.native.prepare(this.name, this.text, n.length, function(s) {
            return s ? t(s) : (r.namedQueries[e.name] = e.text, e.native.execute(e.name, n, t));
          });
        } else if (this.values) {
          if (!Array.isArray(
            this.values
          )) {
            let s = new Error("Query values must be an array");
            return t(s);
          }
          var i = this.values.map(Fn.prepareValue);
          r.native.query(this.text, i, t);
        } else
          r.native.query(this.text, t);
      };
    });
    var yo = T((wp, po) => {
      "use strict";
      p();
      var ll = (oo(), O(so)), fl = At(), mp = ao(), fo = ve().EventEmitter, hl = (at(), O(ot)), pl = Bt(), ho = lo(), K = po.exports = function(r) {
        fo.call(this), r = r || {}, this._Promise = r.Promise || b.Promise, this._types = new fl(r.types), this.native = new ll({ types: this._types }), this._queryQueue = [], this._ending = false, this._connecting = false, this._connected = false, this._queryable = true;
        var e = this.connectionParameters = new pl(r);
        this.user = e.user, Object.defineProperty(this, "password", { configurable: true, enumerable: false, writable: true, value: e.password }), this.database = e.database, this.host = e.host, this.port = e.port, this.namedQueries = {};
      };
      K.Query = ho;
      hl.inherits(K, fo);
      K.prototype._errorAllQueries = function(r) {
        let e = a((t) => {
          m.nextTick(() => {
            t.native = this.native, t.handleError(r);
          });
        }, "enqueueError");
        this._hasActiveQuery() && (e(this._activeQuery), this._activeQuery = null), this._queryQueue.forEach(e), this._queryQueue.length = 0;
      };
      K.prototype._connect = function(r) {
        var e = this;
        if (this._connecting) {
          m.nextTick(() => r(new Error("Client has already been connected. You cannot reuse a client.")));
          return;
        }
        this._connecting = true, this.connectionParameters.getLibpqConnectionString(function(t, n) {
          if (t)
            return r(t);
          e.native.connect(n, function(i) {
            if (i)
              return e.native.end(), r(i);
            e._connected = true, e.native.on("error", function(s) {
              e._queryable = false, e._errorAllQueries(s), e.emit("error", s);
            }), e.native.on("notification", function(s) {
              e.emit("notification", { channel: s.relname, payload: s.extra });
            }), e.emit("connect"), e._pulseQueryQueue(true), r();
          });
        });
      };
      K.prototype.connect = function(r) {
        if (r) {
          this._connect(r);
          return;
        }
        return new this._Promise((e, t) => {
          this._connect((n) => {
            n ? t(n) : e();
          });
        });
      };
      K.prototype.query = function(r, e, t) {
        var n, i, s, o, u;
        if (r == null)
          throw new TypeError("Client was passed a null or undefined query");
        if (typeof r.submit == "function")
          s = r.query_timeout || this.connectionParameters.query_timeout, i = n = r, typeof e == "function" && (r.callback = e);
        else if (s = this.connectionParameters.query_timeout, n = new ho(r, e, t), !n.callback) {
          let c, l;
          i = new this._Promise((f, y) => {
            c = f, l = y;
          }), n.callback = (f, y) => f ? l(f) : c(y);
        }
        return s && (u = n.callback, o = setTimeout(() => {
          var c = new Error(
            "Query read timeout"
          );
          m.nextTick(() => {
            n.handleError(c, this.connection);
          }), u(c), n.callback = () => {
          };
          var l = this._queryQueue.indexOf(n);
          l > -1 && this._queryQueue.splice(l, 1), this._pulseQueryQueue();
        }, s), n.callback = (c, l) => {
          clearTimeout(o), u(c, l);
        }), this._queryable ? this._ending ? (n.native = this.native, m.nextTick(() => {
          n.handleError(
            new Error("Client was closed and is not queryable")
          );
        }), i) : (this._queryQueue.push(n), this._pulseQueryQueue(), i) : (n.native = this.native, m.nextTick(() => {
          n.handleError(new Error("Client has encountered a connection error and is not queryable"));
        }), i);
      };
      K.prototype.end = function(r) {
        var e = this;
        this._ending = true, this._connected || this.once("connect", this.end.bind(this, r));
        var t;
        return r || (t = new this._Promise(function(n, i) {
          r = a((s) => s ? i(s) : n(), "cb");
        })), this.native.end(function() {
          e._errorAllQueries(new Error("Connection terminated")), m.nextTick(() => {
            e.emit("end"), r && r();
          });
        }), t;
      };
      K.prototype._hasActiveQuery = function() {
        return this._activeQuery && this._activeQuery.state !== "error" && this._activeQuery.state !== "end";
      };
      K.prototype._pulseQueryQueue = function(r) {
        if (this._connected && !this._hasActiveQuery()) {
          var e = this._queryQueue.shift();
          if (!e) {
            r || this.emit("drain");
            return;
          }
          this._activeQuery = e, e.submit(this);
          var t = this;
          e.once("_done", function() {
            t._pulseQueryQueue();
          });
        }
      };
      K.prototype.cancel = function(r) {
        this._activeQuery === r ? this.native.cancel(function() {
        }) : this._queryQueue.indexOf(r) !== -1 && this._queryQueue.splice(this._queryQueue.indexOf(r), 1);
      };
      K.prototype.ref = function() {
      };
      K.prototype.unref = function() {
      };
      K.prototype.setTypeParser = function(r, e, t) {
        return this._types.setTypeParser(
          r,
          e,
          t
        );
      };
      K.prototype.getTypeParser = function(r, e) {
        return this._types.getTypeParser(r, e);
      };
    });
    var kn = T((vp, mo) => {
      "use strict";
      p();
      mo.exports = yo();
    });
    var ct = T((Sp, lt) => {
      "use strict";
      p();
      var dl = eo(), yl = it(), ml = Cn(), wl = io(), { DatabaseError: gl } = Sn(), bl = a(
        (r) => {
          var e;
          return e = class extends wl {
            constructor(n) {
              super(n, r);
            }
          }, a(e, "BoundPool"), e;
        },
        "poolFactory"
      ), Mn = a(
        function(r) {
          this.defaults = yl, this.Client = r, this.Query = this.Client.Query, this.Pool = bl(this.Client), this._pools = [], this.Connection = ml, this.types = tt(), this.DatabaseError = gl;
        },
        "PG"
      );
      typeof m.env.NODE_PG_FORCE_NATIVE < "u" ? lt.exports = new Mn(kn()) : (lt.exports = new Mn(dl), Object.defineProperty(lt.exports, "native", {
        configurable: true,
        enumerable: false,
        get() {
          var r = null;
          try {
            r = new Mn(kn());
          } catch (e) {
            if (e.code !== "MODULE_NOT_FOUND")
              throw e;
          }
          return Object.defineProperty(lt.exports, "native", { value: r }), r;
        }
      }));
    });
    var Sl = {};
    te(Sl, {
      Client: () => $e,
      DatabaseError: () => le.DatabaseError,
      NeonDbError: () => de,
      NeonQueryPromise: () => xe,
      Pool: () => Ot,
      SqlTemplate: () => Me,
      UnsafeRawSql: () => Ue,
      _bundleExt: () => xl,
      defaults: () => le.defaults,
      escapeIdentifier: () => le.escapeIdentifier,
      escapeLiteral: () => le.escapeLiteral,
      neon: () => yr,
      neonConfig: () => se,
      types: () => le.types,
      warnIfBrowser: () => Ke
    });
    module2.exports = O(Sl);
    p();
    p();
    ke();
    Jt();
    p();
    var pa = Object.defineProperty;
    var da = Object.defineProperties;
    var ya = Object.getOwnPropertyDescriptors;
    var vi = Object.getOwnPropertySymbols;
    var ma = Object.prototype.hasOwnProperty;
    var wa = Object.prototype.propertyIsEnumerable;
    var xi = a(
      (r, e, t) => e in r ? pa(r, e, { enumerable: true, configurable: true, writable: true, value: t }) : r[e] = t,
      "__defNormalProp"
    );
    var ga = a((r, e) => {
      for (var t in e || (e = {}))
        ma.call(e, t) && xi(r, t, e[t]);
      if (vi)
        for (var t of vi(e))
          wa.call(e, t) && xi(r, t, e[t]);
      return r;
    }, "__spreadValues");
    var ba = a((r, e) => da(r, ya(e)), "__spreadProps");
    var va = 1008e3;
    var Si = new Uint8Array(
      new Uint16Array([258]).buffer
    )[0] === 2;
    var xa = new TextDecoder();
    var Xt = new TextEncoder();
    var mt = Xt.encode("0123456789abcdef");
    var wt = Xt.encode("0123456789ABCDEF");
    var Sa = Xt.encode("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");
    var Ei = Sa.slice();
    Ei[62] = 45;
    Ei[63] = 95;
    var ze;
    var gt;
    function Ea(r, { alphabet: e, scratchArr: t } = {}) {
      if (!ze)
        if (ze = new Uint16Array(256), gt = new Uint16Array(256), Si)
          for (let C = 0; C < 256; C++)
            ze[C] = mt[C & 15] << 8 | mt[C >>> 4], gt[C] = wt[C & 15] << 8 | wt[C >>> 4];
        else
          for (let C = 0; C < 256; C++)
            ze[C] = mt[C & 15] | mt[C >>> 4] << 8, gt[C] = wt[C & 15] | wt[C >>> 4] << 8;
      r.byteOffset % 4 !== 0 && (r = new Uint8Array(r));
      let n = r.length, i = n >>> 1, s = n >>> 2, o = t || new Uint16Array(n), u = new Uint32Array(
        r.buffer,
        r.byteOffset,
        s
      ), c = new Uint32Array(o.buffer, o.byteOffset, i), l = e === "upper" ? gt : ze, f = 0, y = 0, g;
      if (Si)
        for (; f < s; )
          g = u[f++], c[y++] = l[g >>> 8 & 255] << 16 | l[g & 255], c[y++] = l[g >>> 24] << 16 | l[g >>> 16 & 255];
      else
        for (; f < s; )
          g = u[f++], c[y++] = l[g >>> 24] << 16 | l[g >>> 16 & 255], c[y++] = l[g >>> 8 & 255] << 16 | l[g & 255];
      for (f <<= 2; f < n; )
        o[f] = l[r[f++]];
      return xa.decode(o.subarray(0, n));
    }
    a(Ea, "_toHex");
    function Aa(r, e = {}) {
      let t = "", n = r.length, i = va >>> 1, s = Math.ceil(n / i), o = new Uint16Array(s > 1 ? i : n);
      for (let u = 0; u < s; u++) {
        let c = u * i, l = c + i;
        t += Ea(r.subarray(c, l), ba(ga(
          {},
          e
        ), { scratchArr: o }));
      }
      return t;
    }
    a(Aa, "_toHexChunked");
    function Ai(r, e = {}) {
      return e.alphabet !== "upper" && typeof r.toHex == "function" ? r.toHex() : Aa(r, e);
    }
    a(Ai, "toHex");
    p();
    var bt = class bt2 {
      constructor(e, t) {
        this.strings = e;
        this.values = t;
      }
      toParameterizedQuery(e = { query: "", params: [] }) {
        let { strings: t, values: n } = this;
        for (let i = 0, s = t.length; i < s; i++)
          if (e.query += t[i], i < n.length) {
            let o = n[i];
            if (o instanceof Ue)
              e.query += o.sql;
            else if (o instanceof xe)
              if (o.queryData instanceof bt2)
                o.queryData.toParameterizedQuery(
                  e
                );
              else {
                if (o.queryData.params?.length)
                  throw new Error("This query is not composable");
                e.query += o.queryData.query;
              }
            else {
              let { params: u } = e;
              u.push(o), e.query += "$" + u.length, (o instanceof d || ArrayBuffer.isView(o)) && (e.query += "::bytea");
            }
          }
        return e;
      }
    };
    a(bt, "SqlTemplate");
    var Me = bt;
    var er = class er {
      constructor(e) {
        this.sql = e;
      }
    };
    a(er, "UnsafeRawSql");
    var Ue = er;
    p();
    function Ke() {
      typeof window < "u" && typeof document < "u" && typeof console < "u" && typeof console.warn == "function" && console.warn(`          
        ************************************************************
        *                                                          *
        *  WARNING: Running SQL directly from the browser can have *
        *  security implications. Even if your database is         *
        *  protected by Row-Level Security (RLS), use it at your   *
        *  own risk. This approach is great for fast prototyping,  *
        *  but ensure proper safeguards are in place to prevent    *
        *  misuse or execution of expensive SQL queries by your    *
        *  end users.                                              *
        *                                                          *
        *  If you've assessed the risks, suppress this message     *
        *  using the disableWarningInBrowsers configuration        *
        *  parameter.                                              *
        *                                                          *
        ************************************************************`);
    }
    a(Ke, "warnIfBrowser");
    ke();
    var us = Ae(At());
    var cs = Ae(st());
    var _t = class _t2 extends Error {
      constructor(t) {
        super(t);
        E(this, "name", "NeonDbError");
        E(this, "severity");
        E(this, "code");
        E(this, "detail");
        E(this, "hint");
        E(this, "position");
        E(this, "internalPosition");
        E(
          this,
          "internalQuery"
        );
        E(this, "where");
        E(this, "schema");
        E(this, "table");
        E(this, "column");
        E(this, "dataType");
        E(this, "constraint");
        E(this, "file");
        E(this, "line");
        E(this, "routine");
        E(this, "sourceError");
        "captureStackTrace" in Error && typeof Error.captureStackTrace == "function" && Error.captureStackTrace(this, _t2);
      }
    };
    a(
      _t,
      "NeonDbError"
    );
    var de = _t;
    var ss = "transaction() expects an array of queries, or a function returning an array of queries";
    var Ru = ["severity", "code", "detail", "hint", "position", "internalPosition", "internalQuery", "where", "schema", "table", "column", "dataType", "constraint", "file", "line", "routine"];
    function Lu(r) {
      return r instanceof d ? "\\x" + Ai(r) : r;
    }
    a(Lu, "encodeBuffersAsBytea");
    function os(r) {
      let { query: e, params: t } = r instanceof Me ? r.toParameterizedQuery() : r;
      return { query: e, params: t.map((n) => Lu((0, cs.prepareValue)(n))) };
    }
    a(os, "prepareQuery");
    function yr(r, {
      arrayMode: e,
      fullResults: t,
      fetchOptions: n,
      isolationLevel: i,
      readOnly: s,
      deferrable: o,
      authToken: u,
      disableWarningInBrowsers: c
    } = {}) {
      if (!r)
        throw new Error("No database connection string was provided to `neon()`. Perhaps an environment variable has not been set?");
      let l;
      try {
        l = Zt(r);
      } catch {
        throw new Error(
          "Database connection string provided to `neon()` is not a valid URL. Connection string: " + String(r)
        );
      }
      let { protocol: f, username: y, hostname: g, port: A, pathname: C } = l;
      if (f !== "postgres:" && f !== "postgresql:" || !y || !g || !C)
        throw new Error("Database connection string format for `neon()` should be: postgresql://user:password@host.tld/dbname?option=value");
      function D(P, ...I) {
        if (!(Array.isArray(P) && Array.isArray(P.raw) && Array.isArray(I)))
          throw new Error('This function can now be called only as a tagged-template function: sql`SELECT ${value}`, not sql("SELECT $1", [value], options). For a conventional function call with value placeholders ($1, $2, etc.), use sql.query("SELECT $1", [value], options).');
        return new xe(
          Y,
          new Me(P, I)
        );
      }
      a(D, "templateFn"), D.query = (P, I, w) => new xe(Y, { query: P, params: I ?? [] }, w), D.unsafe = (P) => new Ue(
        P
      ), D.transaction = async (P, I) => {
        if (typeof P == "function" && (P = P(D)), !Array.isArray(P))
          throw new Error(ss);
        P.forEach((W) => {
          if (!(W instanceof xe))
            throw new Error(ss);
        });
        let w = P.map((W) => W.queryData), Z = P.map((W) => W.opts ?? {});
        return Y(w, Z, I);
      };
      async function Y(P, I, w) {
        let { fetchEndpoint: Z, fetchFunction: W } = se, J = Array.isArray(
          P
        ) ? { queries: P.map((ee) => os(ee)) } : os(P), X = n ?? {}, oe = e ?? false, ae = t ?? false, R = i, j = s, fe = o;
        w !== void 0 && (w.fetchOptions !== void 0 && (X = { ...X, ...w.fetchOptions }), w.arrayMode !== void 0 && (oe = w.arrayMode), w.fullResults !== void 0 && (ae = w.fullResults), w.isolationLevel !== void 0 && (R = w.isolationLevel), w.readOnly !== void 0 && (j = w.readOnly), w.deferrable !== void 0 && (fe = w.deferrable)), I !== void 0 && !Array.isArray(I) && I.fetchOptions !== void 0 && (X = { ...X, ...I.fetchOptions });
        let me = u;
        !Array.isArray(I) && I?.authToken !== void 0 && (me = I.authToken);
        let Ge = typeof Z == "function" ? Z(g, A, { jwtAuth: me !== void 0 }) : Z, he = { "Neon-Connection-String": r, "Neon-Raw-Text-Output": "true", "Neon-Array-Mode": "true" }, Ie = await Fu(me);
        Ie && (he.Authorization = `Bearer ${Ie}`), Array.isArray(P) && (R !== void 0 && (he["Neon-Batch-Isolation-Level"] = R), j !== void 0 && (he["Neon-Batch-Read-Only"] = String(j)), fe !== void 0 && (he["Neon-Batch-Deferrable"] = String(fe))), c || se.disableWarningInBrowsers || Ke();
        let we;
        try {
          we = await (W ?? fetch)(Ge, { method: "POST", body: JSON.stringify(J), headers: he, ...X });
        } catch (ee) {
          let M = new de(
            `Error connecting to database: ${ee}`
          );
          throw M.sourceError = ee, M;
        }
        if (we.ok) {
          let ee = await we.json();
          if (Array.isArray(P)) {
            let M = ee.results;
            if (!Array.isArray(M))
              throw new de("Neon internal error: unexpected result format");
            return M.map(($, ge) => {
              let qt = I[ge] ?? {}, vo = qt.arrayMode ?? oe, xo = qt.fullResults ?? ae;
              return as(
                $,
                { arrayMode: vo, fullResults: xo, types: qt.types }
              );
            });
          } else {
            let M = I ?? {}, $ = M.arrayMode ?? oe, ge = M.fullResults ?? ae;
            return as(ee, { arrayMode: $, fullResults: ge, types: M.types });
          }
        } else {
          let { status: ee } = we;
          if (ee === 400) {
            let M = await we.json(), $ = new de(M.message);
            for (let ge of Ru)
              $[ge] = M[ge] ?? void 0;
            throw $;
          } else {
            let M = await we.text();
            throw new de(
              `Server error (HTTP status ${ee}): ${M}`
            );
          }
        }
      }
      return a(Y, "execute"), D;
    }
    a(yr, "neon");
    var mr = class mr {
      constructor(e, t, n) {
        this.execute = e;
        this.queryData = t;
        this.opts = n;
      }
      then(e, t) {
        return this.execute(this.queryData, this.opts).then(e, t);
      }
      catch(e) {
        return this.execute(this.queryData, this.opts).catch(e);
      }
      finally(e) {
        return this.execute(
          this.queryData,
          this.opts
        ).finally(e);
      }
    };
    a(mr, "NeonQueryPromise");
    var xe = mr;
    function as(r, {
      arrayMode: e,
      fullResults: t,
      types: n
    }) {
      let i = new us.default(n), s = r.fields.map((c) => c.name), o = r.fields.map((c) => i.getTypeParser(
        c.dataTypeID
      )), u = e === true ? r.rows.map((c) => c.map((l, f) => l === null ? null : o[f](l))) : r.rows.map((c) => Object.fromEntries(
        c.map((l, f) => [s[f], l === null ? null : o[f](l)])
      ));
      return t ? (r.viaNeonFetch = true, r.rowAsArray = e, r.rows = u, r._parsers = o, r._types = i, r) : u;
    }
    a(as, "processQueryResult");
    async function Fu(r) {
      if (typeof r == "string")
        return r;
      if (typeof r == "function")
        try {
          return await Promise.resolve(r());
        } catch (e) {
          let t = new de("Error getting auth token.");
          throw e instanceof Error && (t = new de(`Error getting auth token: ${e.message}`)), t;
        }
    }
    a(Fu, "getAuthToken");
    p();
    var go = Ae(ct());
    p();
    var wo = Ae(ct());
    var Un = class Un extends wo.Client {
      constructor(t) {
        super(t);
        this.config = t;
      }
      get neonConfig() {
        return this.connection.stream;
      }
      connect(t) {
        let { neonConfig: n } = this;
        n.forceDisablePgSSL && (this.ssl = this.connection.ssl = false), this.ssl && n.useSecureWebSocket && console.warn("SSL is enabled for both Postgres (e.g. ?sslmode=require in the connection string + forceDisablePgSSL = false) and the WebSocket tunnel (useSecureWebSocket = true). Double encryption will increase latency and CPU usage. It may be appropriate to disable SSL in the Postgres connection parameters or set forceDisablePgSSL = true.");
        let i = typeof this.config != "string" && this.config?.host !== void 0 || typeof this.config != "string" && this.config?.connectionString !== void 0 || m.env.PGHOST !== void 0, s = m.env.USER ?? m.env.USERNAME;
        if (!i && this.host === "localhost" && this.user === s && this.database === s && this.password === null)
          throw new Error(`No database host or connection string was set, and key parameters have default values (host: localhost, user: ${s}, db: ${s}, password: null). Is an environment variable missing? Alternatively, if you intended to connect with these parameters, please set the host to 'localhost' explicitly.`);
        let o = super.connect(t), u = n.pipelineTLS && this.ssl, c = n.pipelineConnect === "password";
        if (!u && !n.pipelineConnect)
          return o;
        let l = this.connection;
        if (u && l.on(
          "connect",
          () => l.stream.emit("data", "S")
        ), c) {
          l.removeAllListeners("authenticationCleartextPassword"), l.removeAllListeners("readyForQuery"), l.once("readyForQuery", () => l.on("readyForQuery", this._handleReadyForQuery.bind(this)));
          let f = this.ssl ? "sslconnect" : "connect";
          l.on(f, () => {
            this.neonConfig.disableWarningInBrowsers || Ke(), this._handleAuthCleartextPassword(), this._handleReadyForQuery();
          });
        }
        return o;
      }
      async _handleAuthSASLContinue(t) {
        if (typeof crypto > "u" || crypto.subtle === void 0 || crypto.subtle.importKey === void 0)
          throw new Error("Cannot use SASL auth when `crypto.subtle` is not defined");
        let n = crypto.subtle, i = this.saslSession, s = this.password, o = t.data;
        if (i.message !== "SASLInitialResponse" || typeof s != "string" || typeof o != "string")
          throw new Error(
            "SASL: protocol error"
          );
        let u = Object.fromEntries(o.split(",").map((M) => {
          if (!/^.=/.test(M))
            throw new Error(
              "SASL: Invalid attribute pair entry"
            );
          let $ = M[0], ge = M.substring(2);
          return [$, ge];
        })), c = u.r, l = u.s, f = u.i;
        if (!c || !/^[!-+--~]+$/.test(c))
          throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing/unprintable");
        if (!l || !/^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(l))
          throw new Error(
            "SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing/not base64"
          );
        if (!f || !/^[1-9][0-9]*$/.test(f))
          throw new Error(
            "SASL: SCRAM-SERVER-FIRST-MESSAGE: missing/invalid iteration count"
          );
        if (!c.startsWith(i.clientNonce))
          throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
        if (c.length === i.clientNonce.length)
          throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
        let y = parseInt(f, 10), g = d.from(l, "base64"), A = new TextEncoder(), C = A.encode(s), D = await n.importKey(
          "raw",
          C,
          { name: "HMAC", hash: { name: "SHA-256" } },
          false,
          ["sign"]
        ), Y = new Uint8Array(await n.sign("HMAC", D, d.concat(
          [g, d.from([0, 0, 0, 1])]
        ))), P = Y;
        for (var I = 0; I < y - 1; I++)
          Y = new Uint8Array(await n.sign("HMAC", D, Y)), P = d.from(
            P.map((M, $) => P[$] ^ Y[$])
          );
        let w = P, Z = await n.importKey(
          "raw",
          w,
          { name: "HMAC", hash: { name: "SHA-256" } },
          false,
          ["sign"]
        ), W = new Uint8Array(await n.sign("HMAC", Z, A.encode("Client Key"))), J = await n.digest(
          "SHA-256",
          W
        ), X = "n=*,r=" + i.clientNonce, oe = "r=" + c + ",s=" + l + ",i=" + y, ae = "c=biws,r=" + c, R = X + "," + oe + "," + ae, j = await n.importKey(
          "raw",
          J,
          { name: "HMAC", hash: { name: "SHA-256" } },
          false,
          ["sign"]
        );
        var fe = new Uint8Array(await n.sign(
          "HMAC",
          j,
          A.encode(R)
        )), me = d.from(W.map((M, $) => W[$] ^ fe[$])), Ge = me.toString("base64");
        let he = await n.importKey(
          "raw",
          w,
          { name: "HMAC", hash: { name: "SHA-256" } },
          false,
          ["sign"]
        ), Ie = await n.sign("HMAC", he, A.encode("Server Key")), we = await n.importKey("raw", Ie, { name: "HMAC", hash: { name: "SHA-256" } }, false, ["sign"]);
        var ee = d.from(
          await n.sign("HMAC", we, A.encode(R))
        );
        i.message = "SASLResponse", i.serverSignature = ee.toString("base64"), i.response = ae + ",p=" + Ge, this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
      }
    };
    a(
      Un,
      "NeonClient"
    );
    var $e = Un;
    ke();
    var bo = Ae(Bt());
    function vl(r, e) {
      if (e)
        return { callback: e, result: void 0 };
      let t, n, i = a(function(o, u) {
        o ? t(o) : n(u);
      }, "cb"), s = new r(function(o, u) {
        n = o, t = u;
      });
      return { callback: i, result: s };
    }
    a(vl, "promisify");
    var Dn = class Dn extends go.Pool {
      constructor() {
        super(...arguments);
        E(this, "Client", $e);
        E(this, "hasFetchUnsupportedListeners", false);
        E(this, "addListener", this.on);
      }
      on(t, n) {
        return t !== "error" && (this.hasFetchUnsupportedListeners = true), super.on(t, n);
      }
      query(t, n, i) {
        if (!se.poolQueryViaFetch || this.hasFetchUnsupportedListeners || typeof t == "function")
          return super.query(
            t,
            n,
            i
          );
        typeof n == "function" && (i = n, n = void 0);
        let s = vl(this.Promise, i);
        i = s.callback;
        try {
          let o = new bo.default(
            this.options
          ), u = encodeURIComponent, c = encodeURI, l = `postgresql://${u(o.user)}:${u(o.password)}@${u(o.host)}/${c(o.database)}`, f = typeof t == "string" ? t : t.text, y = n ?? t.values ?? [];
          yr(l, { fullResults: true, arrayMode: t.rowMode === "array" }).query(f, y, { types: t.types ?? this.options?.types }).then((A) => i(void 0, A)).catch((A) => i(
            A
          ));
        } catch (o) {
          i(o);
        }
        return s.result;
      }
    };
    a(Dn, "NeonPool");
    var Ot = Dn;
    ke();
    var le = Ae(ct());
    var xl = "js";
  }
});

// data/shop-seed.json
var require_shop_seed = __commonJS({
  "data/shop-seed.json"(exports2, module2) {
    module2.exports = {
      categories: [
        {
          slug: "drinks-yoghurt",
          name: "Drinks & Yoghurt",
          description: "Shelf-ready drinks, yoghurt, juice, and breakfast-led beverage lines gathered into one retail collection.",
          heroImage: "/assets/catalog/2026/3.webp",
          accent: "sunrise",
          sortOrder: 1
        },
        {
          slug: "body-care-wellness",
          name: "Body Care & Wellness",
          description: "Wellness-led essentials and personal care products arranged for cleaner category browsing.",
          heroImage: "/assets/catalog/2026/11.webp",
          accent: "clay",
          sortOrder: 2
        },
        {
          slug: "infant-child-care",
          name: "Infant & Child Care",
          description: "Family and child-focused products grouped for trusted everyday retail shopping.",
          heroImage: "/assets/catalog/2026/17.webp",
          accent: "gold",
          sortOrder: 3
        },
        {
          slug: "pantry-staples-flour",
          name: "Pantry Staples & Flour",
          description: "Pantry-building products, flour, cereals, and kitchen staples with strong household relevance.",
          heroImage: "/assets/catalog/2026/20.webp",
          accent: "sand",
          sortOrder: 4
        },
        {
          slug: "snacks-confectionery",
          name: "Snacks & Confectionery",
          description: "Snacks, confectionery, and impulse-friendly shelf products gathered into one browsing lane.",
          heroImage: "/assets/catalog/2026/29.webp",
          accent: "berry",
          sortOrder: 5
        },
        {
          slug: "spices-condiments",
          name: "Spices & Condiments",
          description: "Spices, seasonings, and cooking condiments presented with a cleaner premium-store feel.",
          heroImage: "/assets/catalog/2026/34.webp",
          accent: "spice",
          sortOrder: 6
        },
        {
          slug: "household-items",
          name: "Household Items",
          description: "Household essentials presented as a practical, shelf-ready home care collection.",
          heroImage: "/assets/catalog/2026/39.webp",
          accent: "forest",
          sortOrder: 7
        }
      ],
      products: [
        {
          slug: "cevo-exotic-assortment",
          name: "Cevo Exotic Assortment",
          categorySlug: "drinks-yoghurt",
          shortDescription: "A vibrant mix of exotic flavoured drinks. Bold taste, eye-catching packaging, and perfect for sharing.",
          description: "Cevo Exotic Assortment brings together a range of exotic flavoured drinks in one convenient pack. Bold, refreshing taste profiles and eye-catching packaging make it an easy grab for anyone looking for something a little different. Great for sharing, stocking the fridge, or enjoying on the go.",
          price: 8500,
          compareAtPrice: 9600,
          currency: "NGN",
          sku: "DRINK-004",
          badge: "Featured",
          stockStatus: "in_stock",
          featured: true,
          image: "/images/shop-products/catalog-product-4.webp",
          gallery: [
            "/images/shop-products/catalog-product-4.webp",
            "/assets/catalog/2026/4.webp"
          ],
          sortOrder: 1,
          catalogPage: 4
        },
        {
          slug: "felon-innovation-milk-drink",
          name: "Felon Innovation Milk Drink",
          categorySlug: "drinks-yoghurt",
          shortDescription: "A smooth, nutritious milk drink for any time of day. Great taste and real goodness in every sip.",
          description: "Felon Innovation Milk Drink is a smooth, creamy milk-based drink packed with nutrition. Whether you need a quick breakfast option or a satisfying snack, this drink delivers great taste and real goodness in every sip. Loved by both adults and kids.",
          price: 7800,
          compareAtPrice: 8600,
          currency: "NGN",
          sku: "DRINK-005",
          badge: "Fresh Pick",
          stockStatus: "in_stock",
          featured: false,
          image: "/images/shop-products/catalog-product-5.webp",
          gallery: [
            "/images/shop-products/catalog-product-5.webp",
            "/assets/catalog/2026/5.webp"
          ],
          sortOrder: 2,
          catalogPage: 5
        },
        {
          slug: "madala-juice-range",
          name: "Madala Juice Range",
          categorySlug: "drinks-yoghurt",
          shortDescription: "Fresh-tasting juice in a range of fruity flavours \u2014 made for everyday refreshment.",
          description: "Madala Juice brings fresh, fruity refreshment in a variety of flavours. Made with natural goodness and a clean taste profile, it is the kind of everyday drink that belongs in every household fridge. Light, satisfying, and great for the whole family.",
          price: 8200,
          compareAtPrice: 9e3,
          currency: "NGN",
          sku: "DRINK-006",
          badge: "Featured",
          stockStatus: "in_stock",
          featured: false,
          image: "/images/shop-products/catalog-product-6.webp",
          gallery: [
            "/images/shop-products/catalog-product-6.webp",
            "/assets/catalog/2026/6.webp"
          ],
          sortOrder: 3,
          catalogPage: 6
        },
        {
          slug: "orisirisi-catering-drinks",
          name: "Orisirisi Catering Drinks",
          categorySlug: "drinks-yoghurt",
          shortDescription: "A versatile drinks assortment for home, catering, and events. Crowd-pleasing flavours in one pack.",
          description: "Orisirisi Catering Drinks is a crowd-pleasing selection of drinks ideal for home, events, and catering use. With a range of popular flavours in generous quantities, it is the go-to choice when you need variety and reliability in one convenient order.",
          price: 9100,
          compareAtPrice: 9900,
          currency: "NGN",
          sku: "DRINK-007",
          badge: "Popular",
          stockStatus: "in_stock",
          featured: false,
          image: "/images/shop-products/catalog-product-7.webp",
          gallery: [
            "/images/shop-products/catalog-product-7.webp",
            "/assets/catalog/2026/7.webp"
          ],
          sortOrder: 4,
          catalogPage: 7
        },
        {
          slug: "wilsons-juice-co-range",
          name: "Wilson's Juice Co. Range",
          categorySlug: "drinks-yoghurt",
          shortDescription: "One of Nigeria's favourite juice brands \u2014 fruity, fresh, and full of flavour.",
          description: "Wilson's Juice Co. is one of Nigeria's most recognised juice brands. Fruity, fresh, and full of natural flavour, the Wilson's range has become a household staple trusted by families across Lagos and beyond. Stocked in over 300 stores for good reason.",
          price: 11200,
          compareAtPrice: 12400,
          currency: "NGN",
          sku: "DRINK-008",
          badge: "Best Seller",
          stockStatus: "in_stock",
          featured: true,
          image: "/images/shop-products/catalog-product-8.webp",
          gallery: [
            "/images/shop-products/catalog-product-8.webp",
            "/assets/catalog/2026/8.webp"
          ],
          sortOrder: 5,
          catalogPage: 8
        },
        {
          slug: "kezia-mixed-beverage-line",
          name: "Kezia Mixed Beverage Line",
          categorySlug: "drinks-yoghurt",
          shortDescription: "A premium mixed beverage selection across popular flavours \u2014 great alongside any meal.",
          description: "Kezia Mixed Beverage Line is a premium selection of drinks across a range of popular flavours. Whether enjoyed on its own or paired with a meal, the Kezia range brings quality taste and satisfying refreshment with every bottle.",
          price: 8800,
          compareAtPrice: 9500,
          currency: "NGN",
          sku: "DRINK-009",
          badge: "Featured",
          stockStatus: "in_stock",
          featured: false,
          image: "/images/shop-products/catalog-product-9.webp",
          gallery: [
            "/images/shop-products/catalog-product-9.webp",
            "/assets/catalog/2026/9.webp"
          ],
          sortOrder: 6,
          catalogPage: 9
        },
        {
          slug: "zayith-yogurt-selection",
          name: "Zayith Yogurt Selection",
          categorySlug: "drinks-yoghurt",
          shortDescription: "Smooth, creamy yoghurt in fruity flavours \u2014 naturally rich and great for breakfast.",
          description: "Zayith Yogurt is smooth, creamy, and available in a range of fruit flavours. Naturally rich in probiotics and made for everyday eating, it is a great choice for breakfast, a healthy snack, or as a treat any time of day.",
          price: 10400,
          compareAtPrice: 11600,
          currency: "NGN",
          sku: "DRINK-010",
          badge: "Trusted",
          stockStatus: "in_stock",
          featured: true,
          image: "/images/shop-products/catalog-product-10.webp",
          gallery: [
            "/images/shop-products/catalog-product-10.webp",
            "/assets/catalog/2026/10.webp"
          ],
          sortOrder: 7,
          catalogPage: 10
        },
        {
          slug: "aman-bless-wellness-range",
          name: "Aman-Bless Wellness Range",
          categorySlug: "body-care-wellness",
          shortDescription: "A trusted daily wellness and personal care collection for the whole family.",
          description: "Aman-Bless Wellness Range is a complete daily care collection designed for the whole family. From wellness essentials to personal care products, every item is gentle, effective, and made to support a healthier everyday routine.",
          price: 13200,
          compareAtPrice: 14500,
          currency: "NGN",
          sku: "BODY-003",
          badge: "Popular",
          stockStatus: "in_stock",
          featured: true,
          image: "/images/shop-products/catalog-product-12.webp",
          gallery: [
            "/images/shop-products/catalog-product-12.webp",
            "/assets/catalog/2026/12.webp"
          ],
          sortOrder: 8,
          catalogPage: 12
        },
        {
          slug: "biniowan-enterprises-care-kit",
          name: "Biniowan Enterprises Care Kit",
          categorySlug: "body-care-wellness",
          shortDescription: "Everyday personal care essentials \u2014 gentle on skin and great on price.",
          description: "Biniowan Enterprises Care Kit has everything you need for daily personal hygiene and skin care. Gentle formulas, practical packaging, and great value make this care kit a reliable choice for every household.",
          price: 12900,
          compareAtPrice: 13900,
          currency: "NGN",
          sku: "BODY-004",
          badge: "Featured",
          stockStatus: "in_stock",
          featured: false,
          image: "/images/shop-products/catalog-product-13.webp",
          gallery: [
            "/images/shop-products/catalog-product-13.webp",
            "/assets/catalog/2026/13.webp"
          ],
          sortOrder: 9,
          catalogPage: 13
        },
        {
          slug: "tosh-cocodia-wellness-drink",
          name: "Tosh Cocodia Wellness Drink",
          categorySlug: "body-care-wellness",
          shortDescription: "A refreshing coconut-based wellness drink \u2014 light, clean, and good for you.",
          description: "Tosh Cocodia Wellness Drink is a refreshing, coconut-based drink loaded with natural ingredients. Light and clean with a smooth natural flavour, it is the kind of wellness drink you can feel good about reaching for every day.",
          price: 7600,
          compareAtPrice: 8400,
          currency: "NGN",
          sku: "BODY-005",
          badge: "New In",
          stockStatus: "in_stock",
          featured: false,
          image: "/images/shop-products/catalog-product-14.webp",
          gallery: [
            "/images/shop-products/catalog-product-14.webp",
            "/assets/catalog/2026/14.webp"
          ],
          sortOrder: 10,
          catalogPage: 14
        },
        {
          slug: "respite-tea-duo",
          name: "Respite Tea Duo",
          categorySlug: "body-care-wellness",
          shortDescription: "Two calming tea blends in one set \u2014 perfect for winding down after a long day.",
          description: "Respite Tea Duo brings together two soothing tea blends in one convenient set. Made with natural ingredients and gentle flavour profiles, it is exactly what you need after a long day. Warm, calming, and completely natural.",
          price: 9400,
          compareAtPrice: 10200,
          currency: "NGN",
          sku: "BODY-006",
          badge: "Featured",
          stockStatus: "in_stock",
          featured: false,
          image: "/images/shop-products/catalog-product-15.webp",
          gallery: [
            "/images/shop-products/catalog-product-15.webp",
            "/assets/catalog/2026/15.webp"
          ],
          sortOrder: 11,
          catalogPage: 15
        },
        {
          slug: "whole-eats-africa-meditea",
          name: "Whole Eats Africa Meditea",
          categorySlug: "body-care-wellness",
          shortDescription: "An herbal wellness tea crafted from African botanicals \u2014 soothing and naturally made.",
          description: "Whole Eats Africa Meditea is an herbal wellness tea crafted from carefully selected African botanicals. Naturally brewed, gently flavoured, and rich in wellness benefits, it makes a wonderful addition to any healthy daily routine.",
          price: 11800,
          compareAtPrice: 12900,
          currency: "NGN",
          sku: "BODY-007",
          badge: "Top Rated",
          stockStatus: "in_stock",
          featured: true,
          image: "/images/shop-products/catalog-product-16.webp",
          gallery: [
            "/images/shop-products/catalog-product-16.webp",
            "/assets/catalog/2026/16.webp"
          ],
          sortOrder: 12,
          catalogPage: 16
        },
        {
          slug: "whole-eats-africa-infant-care",
          name: "Whole Eats Africa Infant Care",
          categorySlug: "infant-child-care",
          shortDescription: "Gentle natural infant care products formulated for sensitive baby skin.",
          description: "Whole Eats Africa Infant Care is a range of gentle, natural products designed specifically for babies' delicate skin. Formulated without harsh chemicals and trusted by parents who want only the best for their little ones from day one.",
          price: 14750,
          compareAtPrice: 15900,
          currency: "NGN",
          sku: "INFANT-002",
          badge: "Trusted",
          stockStatus: "in_stock",
          featured: true,
          image: "/images/shop-products/catalog-product-18.webp",
          gallery: [
            "/images/shop-products/catalog-product-18.webp",
            "/assets/catalog/2026/18.webp"
          ],
          sortOrder: 13,
          catalogPage: 18
        },
        {
          slug: "august-secrets-infant-range",
          name: "August Secrets Infant Range",
          categorySlug: "infant-child-care",
          shortDescription: "A premium infant care range made with safe, skin-friendly ingredients.",
          description: "August Secrets Infant Range is a premium collection of baby care products developed for sensitive infant skin. Safe ingredients, gentle formulas, and thoughtful packaging make it a go-to choice for parents who take no chances with their baby's care.",
          price: 15200,
          compareAtPrice: 16600,
          currency: "NGN",
          sku: "INFANT-003",
          badge: "Featured",
          stockStatus: "in_stock",
          featured: true,
          image: "/images/shop-products/catalog-product-19.webp",
          gallery: [
            "/images/shop-products/catalog-product-19.webp",
            "/assets/catalog/2026/19.webp"
          ],
          sortOrder: 14,
          catalogPage: 19
        },
        {
          slug: "atun-foods-pantry-pair",
          name: "Atun Foods Pantry Pair",
          categorySlug: "pantry-staples-flour",
          shortDescription: "Two pantry essentials in one pack \u2014 stock up on what your kitchen needs most.",
          description: "Atun Foods Pantry Pair brings together two everyday kitchen essentials in one convenient pack. Whether you are stocking up for the week or topping up the pantry, this duo gives you what you need at a value that makes sense.",
          price: 12500,
          compareAtPrice: 13600,
          currency: "NGN",
          sku: "PANTRY-004",
          badge: "Featured",
          stockStatus: "in_stock",
          featured: false,
          image: "/images/shop-products/catalog-product-21.webp",
          gallery: [
            "/images/shop-products/catalog-product-21.webp",
            "/assets/catalog/2026/21.webp"
          ],
          sortOrder: 15,
          catalogPage: 21
        },
        {
          slug: "cresso-life-pantry-line",
          name: "Cresso Life Pantry Line",
          categorySlug: "pantry-staples-flour",
          shortDescription: "Quality grains, cereals, and kitchen basics \u2014 reliable, affordable, and always in demand.",
          description: "Cresso Life Pantry Line is a well-rounded range of household food staples including grains, cereals, and kitchen basics. Reliable quality, practical sizing, and affordable pricing make it a consistent favourite in Nigerian households.",
          price: 13400,
          compareAtPrice: 14500,
          currency: "NGN",
          sku: "PANTRY-005",
          badge: "Popular",
          stockStatus: "in_stock",
          featured: false,
          image: "/images/shop-products/catalog-product-22.webp",
          gallery: [
            "/images/shop-products/catalog-product-22.webp",
            "/assets/catalog/2026/22.webp"
          ],
          sortOrder: 16,
          catalogPage: 22
        },
        {
          slug: "eti-farms-rice-choice",
          name: "Eti Farms Rice Choice",
          categorySlug: "pantry-staples-flour",
          shortDescription: "Premium quality rice from a trusted Nigerian farm brand \u2014 perfect for everyday cooking.",
          description: "Eti Farms Rice Choice delivers premium quality rice from one of Nigeria's trusted farm brands. Clean, well-milled, and consistently good, it is the kind of rice that earns a permanent spot in every family kitchen.",
          price: 14200,
          compareAtPrice: 15400,
          currency: "NGN",
          sku: "PANTRY-006",
          badge: "Featured",
          stockStatus: "in_stock",
          featured: false,
          image: "/images/shop-products/catalog-product-23.webp",
          gallery: [
            "/images/shop-products/catalog-product-23.webp",
            "/assets/catalog/2026/23.webp"
          ],
          sortOrder: 17,
          catalogPage: 23
        },
        {
          slug: "jkb-plantain-flour",
          name: "JKB Plantain Flour",
          categorySlug: "pantry-staples-flour",
          shortDescription: "Pure naturally milled plantain flour \u2014 great for swallow, porridge, and Nigerian dishes.",
          description: "JKB Plantain Flour is a pure, naturally milled flour made from quality plantain. Smooth texture and clean taste make it perfect for swallow, porridge, and a variety of Nigerian recipes. A kitchen staple for every home that loves traditional cooking.",
          price: 11600,
          compareAtPrice: 12400,
          currency: "NGN",
          sku: "PANTRY-007",
          badge: "Best Seller",
          stockStatus: "in_stock",
          featured: true,
          image: "/images/shop-products/catalog-product-24.webp",
          gallery: [
            "/images/shop-products/catalog-product-24.webp",
            "/assets/catalog/2026/24.webp"
          ],
          sortOrder: 18,
          catalogPage: 24
        },
        {
          slug: "mazara-cereal-selection",
          name: "Mazara Cereal Selection",
          categorySlug: "pantry-staples-flour",
          shortDescription: "A nutritious breakfast cereal range for the whole family \u2014 crunchy and full of flavour.",
          description: "Mazara Cereal Selection is a delicious range of breakfast cereals made to start your day right. Crunchy, flavourful, and nutritious, it is the kind of morning staple the whole family looks forward to. Great with milk, yoghurt, or straight from the box.",
          price: 12800,
          compareAtPrice: 13800,
          currency: "NGN",
          sku: "PANTRY-008",
          badge: "Featured",
          stockStatus: "in_stock",
          featured: false,
          image: "/images/shop-products/catalog-product-25.webp",
          gallery: [
            "/images/shop-products/catalog-product-25.webp",
            "/assets/catalog/2026/25.webp"
          ],
          sortOrder: 19,
          catalogPage: 25
        },
        {
          slug: "prothrive-grandios-range",
          name: "Prothrive Grandios Range",
          categorySlug: "pantry-staples-flour",
          shortDescription: "Protein-rich pantry staples for health-conscious households \u2014 nutritious and great-tasting.",
          description: "Prothrive Grandios Range is a premium collection of protein-rich pantry staples built for households that care about nutrition. Well-balanced, great-tasting, and made to support an active, health-forward lifestyle without sacrificing flavour.",
          price: 15800,
          compareAtPrice: 17200,
          currency: "NGN",
          sku: "PANTRY-009",
          badge: "Top Rated",
          stockStatus: "in_stock",
          featured: true,
          image: "/images/shop-products/catalog-product-26.webp",
          gallery: [
            "/images/shop-products/catalog-product-26.webp",
            "/assets/catalog/2026/26.webp"
          ],
          sortOrder: 20,
          catalogPage: 26
        },
        {
          slug: "tosh-cocodia-pantry-range",
          name: "Tosh Cocodia Pantry Range",
          categorySlug: "pantry-staples-flour",
          shortDescription: "A coconut-inspired pantry range \u2014 versatile, nutritious, and uniquely Nigerian.",
          description: "Tosh Cocodia Pantry Range brings natural coconut flavour into your everyday cooking. Versatile enough for soups, swallows, and baking, this uniquely Nigerian range adds a clean, natural depth to every dish while keeping your pantry stocked with something special.",
          price: 13800,
          compareAtPrice: 14900,
          currency: "NGN",
          sku: "PANTRY-010",
          badge: "Featured",
          stockStatus: "in_stock",
          featured: false,
          image: "/images/shop-products/catalog-product-27.webp",
          gallery: [
            "/images/shop-products/catalog-product-27.webp",
            "/assets/catalog/2026/27.webp"
          ],
          sortOrder: 21,
          catalogPage: 27
        },
        {
          slug: "zeef-rice-flour",
          name: "Zeef Rice Flour",
          categorySlug: "pantry-staples-flour",
          shortDescription: "Finely milled rice flour for swallow, thickening, and baking \u2014 smooth and great for everyday use.",
          description: "Zeef Rice Flour is a finely milled, high-quality rice flour suitable for swallow, thickening soups, and baking. Smooth texture, clean taste, and consistent quality make it a reliable everyday choice for Nigerian kitchens.",
          price: 9900,
          compareAtPrice: 10800,
          currency: "NGN",
          sku: "PANTRY-011",
          badge: "Popular",
          stockStatus: "in_stock",
          featured: false,
          image: "/images/shop-products/catalog-product-28.webp",
          gallery: [
            "/images/shop-products/catalog-product-28.webp",
            "/assets/catalog/2026/28.webp"
          ],
          sortOrder: 22,
          catalogPage: 28
        },
        {
          slug: "eloha-dates-range",
          name: "Eloha Dates Range",
          categorySlug: "snacks-confectionery",
          shortDescription: "Premium natural dates \u2014 naturally sweet, energy-boosting, and perfect for healthy snacking.",
          description: "Eloha Dates Range brings premium natural dates in a variety of sizes and selections. Naturally sweet, energy-boosting, and packed with nutrients, they are the perfect healthy snack for any time of day \u2014 at home, at work, or on the go.",
          price: 9300,
          compareAtPrice: 10100,
          currency: "NGN",
          sku: "SNACK-003",
          badge: "Best Seller",
          stockStatus: "in_stock",
          featured: true,
          image: "/images/shop-products/catalog-product-30.webp",
          gallery: [
            "/images/shop-products/catalog-product-30.webp",
            "/assets/catalog/2026/30.webp"
          ],
          sortOrder: 23,
          catalogPage: 30
        },
        {
          slug: "b-boon-snack-selection",
          name: "B-Boon Snack Selection",
          categorySlug: "snacks-confectionery",
          shortDescription: "A fun snack selection packed with popular flavours \u2014 great for all ages.",
          description: "B-Boon Snack Selection is a crowd-pleasing mix of snacks in popular flavours and textures. Great for kids, adults, lunchboxes, and afternoon cravings, it is the kind of snack variety pack that never lasts long once it is in the house.",
          price: 8800,
          compareAtPrice: 9600,
          currency: "NGN",
          sku: "SNACK-004",
          badge: "Featured",
          stockStatus: "in_stock",
          featured: false,
          image: "/images/shop-products/catalog-product-31.webp",
          gallery: [
            "/images/shop-products/catalog-product-31.webp",
            "/assets/catalog/2026/31.webp"
          ],
          sortOrder: 24,
          catalogPage: 31
        },
        {
          slug: "tosh-cocodia-snack-jar",
          name: "Tosh Cocodia Snack Jar",
          categorySlug: "snacks-confectionery",
          shortDescription: "Coconut-infused snacks in a convenient jar \u2014 light, crunchy, and naturally flavoured.",
          description: "Tosh Cocodia Snack Jar is a jar of light, crunchy snacks infused with natural coconut flavour. Easy to take anywhere and satisfying at any time, it is the perfect companion for healthy snacking that actually tastes great.",
          price: 8200,
          compareAtPrice: 8900,
          currency: "NGN",
          sku: "SNACK-005",
          badge: "New In",
          stockStatus: "in_stock",
          featured: false,
          image: "/images/shop-products/catalog-product-32.webp",
          gallery: [
            "/images/shop-products/catalog-product-32.webp",
            "/assets/catalog/2026/32.webp"
          ],
          sortOrder: 25,
          catalogPage: 32
        },
        {
          slug: "skiddo-foods-happy-treat",
          name: "Skiddo Foods Happy Treat",
          categorySlug: "snacks-confectionery",
          shortDescription: "A delightful treat the whole family looks forward to \u2014 fun flavours, great crunch.",
          description: "Skiddo Foods Happy Treat is a fun, delicious snack designed to bring a smile to everyone's face. Packed with great flavour and satisfying crunch, it works for kids and adults equally well \u2014 at home, school, or anywhere you need a pick-me-up.",
          price: 7600,
          compareAtPrice: 8300,
          currency: "NGN",
          sku: "SNACK-006",
          badge: "Top Rated",
          stockStatus: "in_stock",
          featured: true,
          image: "/images/shop-products/catalog-product-33.webp",
          gallery: [
            "/images/shop-products/catalog-product-33.webp",
            "/assets/catalog/2026/33.webp"
          ],
          sortOrder: 26,
          catalogPage: 33
        },
        {
          slug: "atun-foods-pepper-soup-spice",
          name: "Atun Foods Pepper Soup Spice",
          categorySlug: "spices-condiments",
          shortDescription: "Authentic Nigerian pepper soup spice blend \u2014 earthy, aromatic, and perfectly balanced.",
          description: "Atun Foods Pepper Soup Spice is an authentic Nigerian spice blend crafted for a truly rich pepper soup. Earthy, aromatic, and perfectly balanced, it brings the real flavour of Nigerian cooking to your pot every time \u2014 no guesswork, just great taste.",
          price: 8600,
          compareAtPrice: 9300,
          currency: "NGN",
          sku: "SPICE-003",
          badge: "Chef Pick",
          stockStatus: "in_stock",
          featured: true,
          image: "/images/shop-products/catalog-product-35.webp",
          gallery: [
            "/images/shop-products/catalog-product-35.webp",
            "/assets/catalog/2026/35.webp"
          ],
          sortOrder: 27,
          catalogPage: 35
        },
        {
          slug: "dizauregi-spice-range",
          name: "Dizauregi Spice Range",
          categorySlug: "spices-condiments",
          shortDescription: "A full range of Nigerian spices and seasonings for everyday cooking \u2014 bold flavour, clean ingredients.",
          description: "Dizauregi Spice Range covers the full spectrum of everyday Nigerian seasonings. Bold flavours, clean natural ingredients, and consistent quality make this range a kitchen staple for anyone who takes their cooking seriously.",
          price: 9100,
          compareAtPrice: 9800,
          currency: "NGN",
          sku: "SPICE-004",
          badge: "Featured",
          stockStatus: "in_stock",
          featured: false,
          image: "/images/shop-products/catalog-product-36.webp",
          gallery: [
            "/images/shop-products/catalog-product-36.webp",
            "/assets/catalog/2026/36.webp"
          ],
          sortOrder: 28,
          catalogPage: 36
        },
        {
          slug: "sooyah-food-spice-line",
          name: "Sooyah Food Spice Line",
          categorySlug: "spices-condiments",
          shortDescription: "Versatile Nigerian seasonings from soups to stews \u2014 bring out the best in every dish.",
          description: "Sooyah Food Spice Line is a versatile collection of seasonings and blends made for Nigerian kitchens. Whether you are making soup, stew, or rice, these spices know exactly what your dish needs to taste right.",
          price: 9400,
          compareAtPrice: 10200,
          currency: "NGN",
          sku: "SPICE-005",
          badge: "Popular",
          stockStatus: "in_stock",
          featured: false,
          image: "/images/shop-products/catalog-product-37.webp",
          gallery: [
            "/images/shop-products/catalog-product-37.webp",
            "/assets/catalog/2026/37.webp"
          ],
          sortOrder: 29,
          catalogPage: 37
        },
        {
          slug: "zeef-condiments-selection",
          name: "Zeef Condiments Selection",
          categorySlug: "spices-condiments",
          shortDescription: "Premium condiments for everyday cooking \u2014 flavourful, balanced, and made to elevate every meal.",
          description: "Zeef Condiments Selection is a premium range of condiments built to elevate everyday meals. Flavourful, well-balanced, and versatile, each product in the selection makes it easy to turn a good meal into a great one.",
          price: 9800,
          compareAtPrice: 10600,
          currency: "NGN",
          sku: "SPICE-006",
          badge: "Featured",
          stockStatus: "in_stock",
          featured: true,
          image: "/images/shop-products/catalog-product-38.webp",
          gallery: [
            "/images/shop-products/catalog-product-38.webp",
            "/assets/catalog/2026/38.webp"
          ],
          sortOrder: 30,
          catalogPage: 38
        },
        {
          slug: "kitchensmith-household-essentials",
          name: "Kitchensmith Household Essentials",
          categorySlug: "household-items",
          shortDescription: "Everything you need to keep your home running smoothly \u2014 practical and great value.",
          description: "Kitchensmith Household Essentials covers the practical items every home depends on. Durable, functional, and priced to make sense, this range keeps your household running smoothly without stretching the budget.",
          price: 6200,
          compareAtPrice: 7100,
          currency: "NGN",
          sku: "HOUSE-002",
          badge: "Home Pick",
          stockStatus: "in_stock",
          featured: true,
          image: "/images/shop-products/catalog-product-39.webp",
          gallery: [
            "/images/shop-products/catalog-product-39.webp",
            "/assets/catalog/2026/39.webp"
          ],
          sortOrder: 31,
          catalogPage: 39
        }
      ]
    };
  }
});

// netlify/functions/shop-store.js
var require_shop_store = __commonJS({
  "netlify/functions/shop-store.js"(exports2, module2) {
    var { neon } = require_serverless();
    var crypto6 = require("crypto");
    var seedPayload = require_shop_seed();
    var seedCategories = seedPayload.categories || [];
    var seedProducts = seedPayload.products || [];
    var fallbackStore = {
      initialized: false,
      categories: [],
      products: [],
      orders: []
    };
    var schemaReadyPromise;
    function getSqlClient() {
      const connectionString = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL || process.env.NEON_DATABASE_URL;
      if (!connectionString)
        return null;
      return neon(connectionString);
    }
    function safeParseJson(value, fallback) {
      if (!value)
        return fallback;
      if (Array.isArray(value))
        return value;
      try {
        return JSON.parse(value);
      } catch (error) {
        return fallback;
      }
    }
    function mapCategory(row) {
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        heroImage: row.hero_image,
        accent: row.accent,
        sortOrder: row.sort_order
      };
    }
    function mapProduct(row) {
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        categorySlug: row.category_slug,
        shortDescription: row.short_description,
        description: row.description,
        price: Number(row.price),
        compareAtPrice: row.compare_at_price !== null ? Number(row.compare_at_price) : null,
        currency: row.currency,
        sku: row.sku,
        badge: row.badge,
        stockStatus: row.stock_status,
        featured: Boolean(row.featured),
        image: row.image,
        gallery: safeParseJson(row.gallery, []),
        sortOrder: row.sort_order
      };
    }
    function ensureFallbackSeeded() {
      if (fallbackStore.initialized)
        return;
      fallbackStore.categories = seedCategories.map((category, index) => ({
        id: index + 1,
        ...category
      }));
      fallbackStore.products = seedProducts.map((product, index) => ({
        id: index + 1,
        ...product
      }));
      fallbackStore.initialized = true;
    }
    async function syncSeedData(sql) {
      for (const category of seedCategories) {
        await sql`
      INSERT INTO shop_categories (slug, name, description, hero_image, accent, sort_order)
      VALUES (${category.slug}, ${category.name}, ${category.description}, ${category.heroImage}, ${category.accent}, ${category.sortOrder})
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        hero_image = EXCLUDED.hero_image,
        accent = EXCLUDED.accent,
        sort_order = EXCLUDED.sort_order
    `;
      }
      for (const product of seedProducts) {
        await sql`
      INSERT INTO shop_products (
        slug, category_slug, name, short_description, description, price, compare_at_price,
        currency, sku, badge, stock_status, featured, image, gallery, sort_order, updated_at
      ) VALUES (
        ${product.slug}, ${product.categorySlug}, ${product.name}, ${product.shortDescription},
        ${product.description}, ${product.price}, ${product.compareAtPrice || null}, ${product.currency || "NGN"},
        ${product.sku || null}, ${product.badge || null}, ${product.stockStatus || "in_stock"},
        ${Boolean(product.featured)}, ${product.image || null}, ${JSON.stringify(product.gallery || [])},
        ${product.sortOrder || 0}, NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET
        category_slug = EXCLUDED.category_slug,
        name = EXCLUDED.name,
        short_description = EXCLUDED.short_description,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        compare_at_price = EXCLUDED.compare_at_price,
        currency = EXCLUDED.currency,
        sku = EXCLUDED.sku,
        badge = EXCLUDED.badge,
        stock_status = EXCLUDED.stock_status,
        featured = EXCLUDED.featured,
        image = EXCLUDED.image,
        gallery = EXCLUDED.gallery,
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW()
    `;
      }
      const categorySlugs = seedCategories.map((item) => item.slug);
      const productSlugs = seedProducts.map((item) => item.slug);
      if (productSlugs.length) {
        await sql`DELETE FROM shop_products WHERE NOT (slug = ANY(${productSlugs}))`;
      }
      if (categorySlugs.length) {
        await sql`DELETE FROM shop_categories WHERE NOT (slug = ANY(${categorySlugs}))`;
      }
    }
    async function ensureSchema() {
      const sql = getSqlClient();
      if (!sql) {
        ensureFallbackSeeded();
        return "fallback";
      }
      if (!schemaReadyPromise) {
        schemaReadyPromise = (async () => {
          await sql`
        CREATE TABLE IF NOT EXISTS shop_categories (
          id SERIAL PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          hero_image TEXT,
          accent TEXT,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
          await sql`
        CREATE TABLE IF NOT EXISTS shop_products (
          id SERIAL PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          category_slug TEXT NOT NULL REFERENCES shop_categories(slug) ON DELETE CASCADE,
          name TEXT NOT NULL,
          short_description TEXT,
          description TEXT,
          price NUMERIC(12,2) NOT NULL DEFAULT 0,
          compare_at_price NUMERIC(12,2),
          currency TEXT NOT NULL DEFAULT 'NGN',
          sku TEXT,
          badge TEXT,
          stock_status TEXT NOT NULL DEFAULT 'in_stock',
          featured BOOLEAN NOT NULL DEFAULT FALSE,
          image TEXT,
          gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
          await sql`
        CREATE TABLE IF NOT EXISTS shop_orders (
          id SERIAL PRIMARY KEY,
          order_number TEXT UNIQUE NOT NULL,
          checkout_type TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          customer_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          company_name TEXT,
          address_line_1 TEXT,
          address_line_2 TEXT,
          city TEXT,
          state TEXT,
          notes TEXT,
          subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
          currency TEXT NOT NULL DEFAULT 'NGN',
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
          await sql`
        CREATE TABLE IF NOT EXISTS shop_order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
          product_id INTEGER REFERENCES shop_products(id) ON DELETE SET NULL,
          product_name TEXT NOT NULL,
          product_slug TEXT,
          quantity INTEGER NOT NULL DEFAULT 1,
          unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
          image TEXT
        )
      `;
          await syncSeedData(sql);
        })();
      }
      await schemaReadyPromise;
      return "neon";
    }
    async function listCategories2() {
      const mode = await ensureSchema();
      if (mode === "fallback")
        return fallbackStore.categories;
      const sql = getSqlClient();
      const rows = await sql`SELECT * FROM shop_categories ORDER BY sort_order, name`;
      return rows.map(mapCategory);
    }
    async function listProducts2({ category, search, featured, limit } = {}) {
      const mode = await ensureSchema();
      if (mode === "fallback") {
        const categoriesBySlug2 = new Map(fallbackStore.categories.map((item) => [item.slug, item.name]));
        let items2 = [...fallbackStore.products];
        if (category)
          items2 = items2.filter((item) => item.categorySlug === category);
        if (search) {
          const query = search.toLowerCase();
          items2 = items2.filter(
            (item) => item.name.toLowerCase().includes(query) || item.shortDescription.toLowerCase().includes(query)
          );
        }
        if (featured)
          items2 = items2.filter((item) => item.featured);
        if (limit)
          items2 = items2.slice(0, limit);
        return items2.sort((a, b) => a.sortOrder - b.sortOrder).map((item) => ({ ...item, categoryName: categoriesBySlug2.get(item.categorySlug) || "Collection" }));
      }
      const sql = getSqlClient();
      const categories = await listCategories2();
      const categoriesBySlug = new Map(categories.map((item) => [item.slug, item.name]));
      const rows = await sql`SELECT * FROM shop_products ORDER BY featured DESC, sort_order, name`;
      let items = rows.map(mapProduct);
      if (category)
        items = items.filter((item) => item.categorySlug === category);
      if (search) {
        const query = search.toLowerCase();
        items = items.filter(
          (item) => item.name.toLowerCase().includes(query) || item.shortDescription.toLowerCase().includes(query)
        );
      }
      if (featured)
        items = items.filter((item) => item.featured);
      if (limit)
        items = items.slice(0, limit);
      return items.map((item) => ({ ...item, categoryName: categoriesBySlug.get(item.categorySlug) || "Collection" }));
    }
    async function getProductBySlug2(slug) {
      const mode = await ensureSchema();
      if (mode === "fallback") {
        const item = fallbackStore.products.find((product2) => product2.slug === slug) || null;
        if (!item)
          return null;
        const category2 = fallbackStore.categories.find((entry) => entry.slug === item.categorySlug);
        return { ...item, categoryName: category2?.name || "Collection" };
      }
      const sql = getSqlClient();
      const rows = await sql`SELECT * FROM shop_products WHERE slug = ${slug} LIMIT 1`;
      if (!rows.length)
        return null;
      const product = mapProduct(rows[0]);
      const categories = await listCategories2();
      const category = categories.find((entry) => entry.slug === product.categorySlug);
      return { ...product, categoryName: category?.name || "Collection" };
    }
    function generateOrderNumber(prefix) {
      const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
      const token = crypto6.randomBytes(3).toString("hex").toUpperCase();
      return `${prefix}-${stamp}-${token}`;
    }
    async function createOrder2(payload) {
      const mode = await ensureSchema();
      const orderNumber = generateOrderNumber(payload.checkoutType === "quote" ? "QTE" : "ORD");
      const subtotal = payload.items.reduce((sum, item) => sum + Number(item.unitPrice) * Number(item.quantity), 0);
      if (mode === "fallback") {
        const order = {
          id: fallbackStore.orders.length + 1,
          orderNumber,
          status: "pending",
          subtotal,
          currency: "NGN",
          ...payload
        };
        fallbackStore.orders.push(order);
        return { orderNumber, status: "pending" };
      }
      const sql = getSqlClient();
      const orderRows = await sql`
    INSERT INTO shop_orders (
      order_number, checkout_type, status, customer_name, email, phone, company_name,
      address_line_1, address_line_2, city, state, notes, subtotal, currency
    ) VALUES (
      ${orderNumber}, ${payload.checkoutType}, 'pending', ${payload.customerName}, ${payload.email},
      ${payload.phone}, ${payload.companyName || null}, ${payload.addressLine1 || null},
      ${payload.addressLine2 || null}, ${payload.city || null}, ${payload.state || null},
      ${payload.notes || null}, ${subtotal}, 'NGN'
    )
    RETURNING id
  `;
      const orderId = orderRows[0].id;
      for (const item of payload.items) {
        await sql`
      INSERT INTO shop_order_items (order_id, product_id, product_name, product_slug, quantity, unit_price, image)
      VALUES (
        ${orderId},
        ${item.productId || null},
        ${item.productName},
        ${item.productSlug || null},
        ${item.quantity},
        ${item.unitPrice},
        ${item.image || null}
      )
    `;
      }
      return { orderNumber, status: "pending" };
    }
    function requireAdmin2(event) {
      const provided = event.headers["x-admin-key"] || event.headers["X-Admin-Key"];
      const expected = process.env.SHOP_ADMIN_KEY;
      if (!expected)
        return false;
      return provided && provided === expected;
    }
    async function upsertProduct2(payload) {
      const mode = await ensureSchema();
      if (mode === "fallback") {
        const existing = fallbackStore.products.find((item) => item.slug === payload.slug);
        if (existing) {
          Object.assign(existing, payload);
          return existing;
        }
        const created = {
          id: fallbackStore.products.length + 1,
          featured: false,
          stockStatus: "in_stock",
          gallery: [],
          ...payload
        };
        fallbackStore.products.push(created);
        return created;
      }
      const sql = getSqlClient();
      await sql`
    INSERT INTO shop_products (
      slug, category_slug, name, short_description, description, price, compare_at_price, currency,
      sku, badge, stock_status, featured, image, gallery, sort_order, updated_at
    ) VALUES (
      ${payload.slug}, ${payload.categorySlug}, ${payload.name}, ${payload.shortDescription},
      ${payload.description}, ${payload.price}, ${payload.compareAtPrice || null}, ${payload.currency || "NGN"},
      ${payload.sku || null}, ${payload.badge || null}, ${payload.stockStatus || "in_stock"},
      ${Boolean(payload.featured)}, ${payload.image || null}, ${JSON.stringify(payload.gallery || [])},
      ${payload.sortOrder || 0}, NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
      category_slug = EXCLUDED.category_slug,
      name = EXCLUDED.name,
      short_description = EXCLUDED.short_description,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      compare_at_price = EXCLUDED.compare_at_price,
      currency = EXCLUDED.currency,
      sku = EXCLUDED.sku,
      badge = EXCLUDED.badge,
      stock_status = EXCLUDED.stock_status,
      featured = EXCLUDED.featured,
      image = EXCLUDED.image,
      gallery = EXCLUDED.gallery,
      sort_order = EXCLUDED.sort_order,
      updated_at = NOW()
  `;
      return getProductBySlug2(payload.slug);
    }
    module2.exports = {
      requireAdmin: requireAdmin2,
      listCategories: listCategories2,
      listProducts: listProducts2,
      getProductBySlug: getProductBySlug2,
      createOrder: createOrder2,
      upsertProduct: upsertProduct2,
      ensureSchema
    };
  }
});

// netlify/functions/api.js
var auth = require_auth();
var {
  requireAdmin,
  listCategories,
  listProducts,
  getProductBySlug,
  createOrder,
  upsertProduct
} = require_shop_store();
var headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Key",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Content-Type": "application/json"
};
function json(statusCode, body) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body)
  };
}
function isAdminConfigured() {
  return Boolean(process.env.SHOP_ADMIN_KEY);
}
exports.handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }
  const path = (event.path || "/").replace("/.netlify/functions/api", "").replace("/api", "") || "/";
  const normalizedPath = path.startsWith("/store") ? path.replace("/store", "/shop") : path;
  try {
    if (normalizedPath.startsWith("/auth")) {
      return auth.handler(event, context);
    }
    if (normalizedPath === "/shop/categories" && event.httpMethod === "GET") {
      const categories = await listCategories();
      return json(200, { categories });
    }
    if (normalizedPath === "/shop/products" && event.httpMethod === "GET") {
      const params = new URLSearchParams(
        event.rawQuery || new URL(event.rawUrl || "https://example.com").searchParams.toString() || ""
      );
      const products = await listProducts({
        category: params.get("category") || null,
        search: params.get("search") || null,
        featured: params.get("featured") === "true",
        limit: params.get("limit") ? Number(params.get("limit")) : null
      });
      return json(200, { products });
    }
    if (normalizedPath.startsWith("/shop/products/") && event.httpMethod === "GET") {
      const slug = normalizedPath.split("/").pop();
      const product = await getProductBySlug(slug);
      if (!product)
        return json(404, { message: "Product not found" });
      return json(200, { product });
    }
    if (normalizedPath === "/shop/orders" && event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      if (!body.customerName || !body.email || !body.phone || !Array.isArray(body.items) || body.items.length === 0) {
        return json(400, { message: "Missing required order fields" });
      }
      const result = await createOrder({
        checkoutType: body.checkoutType === "quote" ? "quote" : "manual",
        customerName: body.customerName,
        email: body.email,
        phone: body.phone,
        companyName: body.companyName,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2,
        city: body.city,
        state: body.state,
        notes: body.notes,
        items: body.items
      });
      return json(201, {
        message: body.checkoutType === "quote" ? "Quote request submitted" : "Order placed successfully",
        ...result
      });
    }
    if (normalizedPath === "/shop/admin/products" && event.httpMethod === "POST") {
      if (!isAdminConfigured()) {
        return json(503, { message: "Admin product editing is not configured on this environment" });
      }
      if (!requireAdmin(event))
        return json(401, { message: "Unauthorized" });
      const body = JSON.parse(event.body || "{}");
      if (!body.slug || !body.name || !body.categorySlug) {
        return json(400, { message: "Missing required product fields" });
      }
      const product = await upsertProduct(body);
      return json(200, { product, message: "Product saved successfully" });
    }
    return json(404, { message: "Not found" });
  } catch (error) {
    console.error("API error:", error);
    return json(500, { message: "Server error", error: error.message });
  }
};
/*! Bundled license information:

bcryptjs/dist/bcrypt.js:
  (**
   * @license bcrypt.js (c) 2013 Daniel Wirtz <dcode@dcode.io>
   * Released under the Apache License, Version 2.0
   * see: https://github.com/dcodeIO/bcrypt.js for details
   *)

safe-buffer/index.js:
  (*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)

@neondatabase/serverless/index.js:
  (*! Bundled license information:
  
  ieee754/index.js:
    (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)
  
  buffer/index.js:
    (*!
     * The buffer module from node.js, for the browser.
     *
     * @author   Feross Aboukhadijeh <https://feross.org>
     * @license  MIT
     *)
  *)
*/
//# sourceMappingURL=api.js.map
