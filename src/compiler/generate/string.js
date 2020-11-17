const { match } = require("assert");

// 空格
const hasSpace = /\s/;

// 下划线，短横，点分隔符
const hasSeparator = /(_|-|\.|:)/;

// 驼峰
const hasCamel = /[a-z][A-Z]|[A-Z][a-z]/;

// 分隔符
const separator = /[\W_]+(.|$)/g;

// 驼峰匹配
const camel = /(.)([A-Z]+)/g;

// 转常量格式
function toConstant(str) {
  return toUderscore(str).toUpperCase();
}

// 转下划线格式
function toUderscore(str) {
  return toSpace(str).replace(/\s/g, "_")
}

// 转小驼峰
function toCamel(str) {
  return toSpace(str).replace(/\s(\w)/g, function (_match, match) {
    return match.toUpperCase();
  })
}


// 转大驼峰
function toPascal(str) {
  return toSpace(str).replace(/(?:^|\s)(\w)/g, function (_match, match) {
    return match.toUpperCase();
  })
}
// 转空格格式
function toSpace(str) {
  return clean(str).replace(/[\W_]+(.|$)/g, function (_match, match) {
    return match ? " " + match : "";
  })
}

// 转中横线
function toHyphenate(str) {
  return toSpace(str).replace(/\s/g, "-")
}
// 清除分隔符
function cleanSeparate(str) {
  return str.replace(separator, function (_match, match) {
    return match ? " " + match : ""
  })
}

// 清除驼峰
function cleanCamel(str) {
  return str.replace(camel, function (_match, previous, uppers) {
    return previous + " " + uppers.toLowerCase().split("").join("")
  })
}
// 清除格式
function clean(str) {
  if (hasSpace.test(str)) return str.toLowerCase();
  if (hasSeparator.test(str)) return cleanSeparate(str).toLowerCase();
  if (hasCamel.test(str)) return cleanCamel(str).toLowerCase();
  return str.toLowerCase();
}

module.exports = {
  toConstant,
  toCamel,
  toPascal,
  toHyphenate
}