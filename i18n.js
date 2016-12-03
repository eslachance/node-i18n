// This module is based on a blog post entitled "i18n with tagged
// template strings in ECMAScript 6" by Jack Hsu:
// http://jaysoo.ca/2014/03/20/i18n-with-es6-template-strings/

// It requires Node 6.X to run, and will not function on earlier versions!


// Matches optional type annotations in i18n strings.
// e.g. i18n`This is a number ${x}:n(2)` formats x as number
//      with two fractional digits.
const typeInfoRegex = /^:([a-z])(\((.+)\))?/;

var I18n = {
  use({locale, defaultCurrency, messageBundle}) {
    I18n.locale = locale;
    I18n.defaultCurrency = defaultCurrency;
    I18n.messageBundle = messageBundle;
    return I18n.translate;
  },

  translate(literals, ...values) {
    let translationKey = I18n._buildKey(literals);
    let translationString = I18n.messageBundle[translationKey];

    if (translationString) {
      let typeInfoForValues = literals.slice(1).map(I18n._extractTypeInfo);
      let localizedValues = values.map((v, i) => I18n._localize(v, typeInfoForValues[i]));
      return I18n._buildMessage(translationString, ...localizedValues);
    }

    return I18n._buildMessage(translationKey, ...values);
  },

  _localizers: {
    s /*string*/: v => v.toLocaleString(I18n.locale),
    c /*currency*/: (v, currency) => (
      v.toLocaleString(I18n.locale, {
        style: 'currency',
        currency: currency || I18n.defaultCurrency
      })
    ),
    n /*number*/: (v, fractionalDigits) => (
      v.toLocaleString(I18n.locale, {
        minimumFractionDigits: fractionalDigits,
        maximumFractionDigits: fractionalDigits
      })
    )
  },

  _extractTypeInfo(literal) {
    let match = typeInfoRegex.exec(literal);
    if (match) {
      return {type: match[1], options: match[3]};
    } else {
      return {type: 's', options: ''};
    }
  },

  _localize(value, {type, options}) {
    return I18n._localizers[type](value, options);
  },

  // e.g. I18n._buildKey(['', ' has ', ':c in the']) == '{0} has {1} in the bank'
  _buildKey(literals) {
    let stripType = s => s.replace(typeInfoRegex, '');
    let lastPartialKey = stripType(literals[literals.length - 1]);
    let prependPartialKey = (memo, curr, i) => `${stripType(curr)}{${i}}${memo}`;

    return literals.slice(0, -1).reduceRight(prependPartialKey, lastPartialKey);
  },

  // e.g. I18n._formatStrings('{0} {1}!', 'hello', 'world') == 'hello world!'
  _buildMessage(str, ...values) {
    return str.replace(/{(\d)}/g, (_, index) => values[Number(index)]);
  }
};

module.exports = I18n;
module.exports.use = I18n.use;