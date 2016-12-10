const typeInfoRegex = /^:([a-z])(\((.+)\))?/;

var I18n = {
  init({bundles, defaultCurrency}) {
    I18n.bundles = bundles;
    I18n.defaultCurrency = defaultCurrency;
  },
  
  use (lang) {
    I18n.lang = lang;
    I18n.locale = I18n.bundles[lang].locale;
    I18n.currency = I18n.bundles[lang].currency;
  },
  
  translate(literals, ...values) {
    let translationKey = I18n._buildKey(literals);
    let translationString = I18n.bundles[I18n.lang].strings[translationKey];

    if (translationString) {
      let typeInfoForValues = literals.slice(1).map(I18n._extractTypeInfo);
      let localizedValues = values.map((v, i) => I18n._localize(v, typeInfoForValues[i]));
      return I18n._buildMessage(translationString, ...localizedValues);
    }

    console.log(`Missing translation key in ${module.parent.filename}:\n${translationKey}`)
    return I18n._buildMessage(translationKey, ...values);
  },
  
  bundleFromLocale (locale) {
    for(const lang in I18n.bundles) {
      const bundle = I18n.bundles[lang];
      if(bundle.locale === locale)
        return lang;
    }
    return null;
  },

  _localizers: {
    s /*string*/: v => v.toLocaleString(I18n.locale),
    c /*currency*/: (v, currency) => (
      v.toLocaleString(I18n.locale, {
        style: 'currency',
        currency: I18n.currency || I18n.defaultCurrency
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

module.exports.init = I18n.init;
module.exports.use = I18n.use;
module.exports.translate = I18n.translate;
module.exports.bundleFromLocale = I18n.bundleFromLocale;

/***
 * USAGE

let bundles = {
  "fr": {
    currency: "CAD",
    locale: "fr-FR",
    strings: {
      'Hello {0}, you have {1} in your bank account.': 'Bonjour {0}, vous avez {1} dans votre compte bancaire.'
    }
  },
  "de": {
    currency: "EUR",
    locale: "de-DE",
    strings: {
      'Hello {0}, you have {1} in your bank account.': 'Hallo {0}, Sie haben {1} auf Ihrem Bankkonto.'
    }
  },
  "zh": {
    currency: "CNY",
    locale: "zh-Hant-CN",
    strings: {
      'Hello {0}, you have {1} in your bank account.': '你好{0}，你有{1}在您的銀行帳戶。'
    }
  }
};

let name = 'Bob';
let amount = 1234.56;
let i18n;

I18n.init({bundles: bundles, defaultCurrency: 'USD'});

I18n.use('fr');
console.log(I18n.translate `Hello ${name}, you have ${amount}:c in your bank account.`);

I18n.use('de');
console.log(I18n.translate `Hello ${name}, you have ${amount}:c in your bank account.`);

I18n.use('zh');
console.log(I18n.translate `Hello ${name}, you have ${amount}:c in your bank account.`);

***/