# node-i18n
`node-i18n` makes the attempt of being a very *clean* and *simple* internationalization/localization module. It does not, however, do anything remotely "advanced" such as proper capitalization, conjugation or pluralization. If you require this, please check out [i18next](http://i18next.com/). I find it too complex and ugly to use, but it *is* absolutely more complete!

To make the use of the module as simple as possible, we take advantage of the functionalities present in ES6 Tagged Template Literals. This is because you can easily apply a function (tag) to template literals by calling it before: 

```js
const capitalize = (string) => {
	return string.toUpperCase();
}

console.log(capitalize `This is an example string.`);
// output: THIS IS AN EXAMPLE STRING
```

> Note that you need `node.js` version `6.x` or higher to use this module. It *will not* work in `node 0.12`. It was about time to updated anyway, right?

##Setup

The configuration will need to contain the translation strings for each language, in the following format: 

```js
let bundles = {
  "fr": {
    currency: "CAD",
    locale: "fr-FR",
    strings: {
      "This is a string": "Ceci est une chaîne"
    }
  },
  "de": {
    currency: "EUR",
    locale: "de-DE",
    strings: {
      "This is a string": "Dies ist ein String"
    }
  },
  "zh": {
    currency: "CNY",
    locale: "zh-Hant-CN",
    strings: {
      "This is a string": "这是一个字符串"
    }
  }
};
```

This bundle can be captured from a JSON file or build from multiple sources. For instance in my test, I load each language from its own file: 

```js
for(const lang in bundles) {
  let bundleContents = JSON.parse(fs.readFileSync(`./locs/${bundles[lang].locale}.json`, 'utf8'));
  bundles[lang].strings = bundleContents;
}
```


### Usage

Using node-i18n is a simple question of initializing the module, setting up a language, and using it on a string.

```js
const I18n = require("node-i18n");
const fs = require("fs");

const bundles = require("./bundles.js");

I18n.init({bundles: bundles, defaultCurrency: 'USD'});

// Example string usage, including variable and currency.
let name = 'Bob';
let amount = 1234.56;

I18n.use('fr');
console.log(I18n.translate `Hello ${name}, you have ${amount}:c in your bank account.`);

I18n.use('de');
console.log(I18n.translate `Hello ${name}, you have ${amount}:c in your bank account.`);

I18n.use('zh');
console.log(I18n.translate `Hello ${name}, you have ${amount}:c in your bank account.`);
```

> If a language bundle is called with `I18n.use()` the language *must* exist within the bundle. However, if the translation key does not exist, the default is returned with no localization. In the example above, english would be used.


## Module Reference

### I18n.init({initOptions})

Initializes `node-i18n` with the provided options. At least one bundle must be provided.

#### Parameters

- **bundles** : An object containing a property for each supported language, including properties and translation strings.
- **defaultCurrency**: The default currency to use if none is specified in a bundle.

### I18n.use(lang)

Defines the language bundle used in the next uses of `I18n.translate`. Can be used as many times as necessary, will change the language every time. 

> Will fail if `I18n.init()` has not been run.

#### Parameters

- **lang**: The language of the bundle (the key in the bundles object).

### I18n.translate `Template Literal`

Executes the localization of the template literal following the function. Looks up the template literal as a translation key, returns the processed template literal in its own language if no result is found for the key.


## String Building

Alright so now you need to know how to actually build your translation matrix, right? Let's do that. 

> In all below example, assume the language bundle is `fr` and that we also have an `en` language bundle where the key and value are identical.

First, a simple static string: 

```JSON
strings: {
  "This is a string": "Ceci est une chaîne"
}
```

Easy enough, right? Key on the left, translated result on the right. 

Well what about variables? You have those, right? In Template Literals, this is called *Expression Interpolation*. So the following expression is valid as a template literal: 

```js
const myTL = `This string contains a variable ${var}, and can do math: ${2+2}`;
console.log(I18n.translate myTL);
```

In `node-i18n`, we can use replace any expression with a numbered placeholder, as such: 

```json
strings: {
  "This string contains a variable {0}, and can do math: {1}": "Cette chaîne contient une variable {0} et peut faire des mathématiques: {1}"
}
```

As you can see, {0} and {1} represent the 2 expressions. Those can actually be used in any order that you want, since they are numbered.  Let's see how: 

```json
strings: {
  "It's a {0} {1}!": "C'est un(e) {1} {0}(e)"
}
```

Which will result in: 
```js
const subject = "car";
const qualifier = "blue";

I18n.use("en");
console.log(I18n.translate `It's a ${qualifier} ${subject}!`);
// It's a blue car!

I18n.use("fr");
console.log(I18n.translate `It's a ${qualifier} ${subject}!`);
// C'est un(e) car blue(e)!
```

Is this a bad example? Yes. Absolutely, because the actual values we provide are not translated, so it looks weird. BUT, we can actually go around this. Because a template literal can contain another template literal! Look at this awesomeness: 

```json
strings: {
  "It's a {0} {1}!": "C'est un(e) {1} {0}(e)",
  "blue": "bleu",
  "car": "auto"
}
```

```js
I18n.use("fr");
console.log(I18n.translate `It's a ${I18n.translate qualifier} ${I18n.translate subject}!`);
// C'est un(e) auto bleu(e)!
```

Yes I know, it's still imperfect because nothing is done to detect or fix gender in the strings. Nor does this library do proper pluralization.

**One last thing**: The `:c` tag added to any literal defines it as a currency and will appropriately prefix/suffix the key with the appropriate currency tag. Look at the default example at the top of this file for example, where `${currency}:c` is turned into `CA$1,234.56`, `€1,234.56` or `CN¥1,234.5` depending on the language bundle. This uses the native `Number.toLocaleString()` function in JavaScript.
