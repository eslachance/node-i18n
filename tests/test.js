const I18n = require("../app");
const fs = require("fs");

// Prepare bundles
let bundles = {
  "fr": {
    currency: "CAD",
    locale: "fr-FR",
    strings: {}
  },
  "de": {
    currency: "EUR",
    locale: "de-DE",
    strings: {}
  },
  "zh": {
    currency: "CNY",
    locale: "zh-Hant-CN",
    strings: {}
  }
};

// Get strings from localized JSON files
for(const lang in bundles) {
  let bundleContents = JSON.parse(fs.readFileSync(`./locs/${bundles[lang].locale}.json`, 'utf8'));
  bundles[lang].strings = bundleContents;
}

// Example Data
let name = 'Bob';
let amount = 1234.56;

I18n.init({bundles: bundles, defaultCurrency: 'USD'});

I18n.use('fr');
console.log(I18n.translate `Hello ${name}, you have ${amount}:c in your bank account.`);

I18n.use('de');
console.log(I18n.translate `Hello ${name}, you have ${amount}:c in your bank account.`);

I18n.use('zh');
console.log(I18n.translate `Hello ${name}, you have ${amount}:c in your bank account.`);