# Developing with Webpack

In `Getting Started` we set up a minimal Webpack based build. Hitting `npm run build` all the time will get boring eventually. In addition refreshing browser manually is annoying. We can get rid of both of these problems if we do a bit more configuration work.

## Setting Up `webpack-dev-server`

As a first step, hit `npm i webpack-dev-server --save-dev` at project root. This will add Webpack development server we'll be relying upon.

In addition we'll need to tweak `package.json` *scripts* section to include it. Here's the basic idea:

**package.json**

```json
{
  "scripts": {
    "build": "webpack",
    "dev": "webpack-dev-server --config webpack.development.js --devtool eval --progress --colors --hot --content-base build"
  }
}
```

**webpack.development.js**

```javascript
var path = require('path');

module.exports = {
  entry: [
    'webpack/hot/dev-server',
    path.resolve(__dirname, 'app/main.js')
  ],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
};
```

**build/index.html**

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8"/>
  </head>
  <body>
    <div id="app"></div>

    <script src="http://localhost:8080/webpack-dev-server.js"></script>
    <script src="bundle.js"></script>
  </body>
</html>
```

When you run `npm run dev` from your terminal it will execute the command stated as a value on the **dev** property. This is what it does:

1. `webpack-dev-server` - Starts a web service on `localhost:8080`
2. `--config webpack.development.js` - Points at custom development configuration we'll set up later
3. `--devtool eval` - Creates source urls for your code. Making you able to pinpoint by filename and line number where any errors are thrown
4. `--progress` - Will show progress of bundling your application
5. `--colors` - Colors in the terminal!
6. '--hot' - Enable hot module loading
7. `--content-base build` - Points to the output directory configured

To recap, when you run `npm run dev` this will fire up the webservice, watch for file changes and automatically rebundle your application when any file changes occur.

Go to **http://localhost:8080** and you should see something. If you want to use some other port than 8080, you can pass `--port` parameter (ie. `--port 4000`) to *webpack-dev-server*.

T> Alternatively we can run the application from **http://localhost:8080/webpack-dev-server/bundle** instead of root. It provides an iframe showing a status bar that indicates the status of the rebundling process. You can alternatively examine your browser log for the same information and possible errors.

## Automatic Browser Refresh

When **webpack-dev-server** is running it will watch your files for changes. When that happens it rebundles your project and notifies browsers listening to refresh. If you try modifying **app/component.js** you should see the changes propagate to your browser now.

We can easily extend the approach to work with CSS. Webpack allows us to modify CSS without forcing a full refresh. Let's see how to achieve that next.

## Loading CSS

In order to load CSS to project, we'll need to use a couple of loaders. To get started, invoke `npm i css-loader style-loader --save-dev`. Now that we have the loaders we need, we'll need to make sure Webpack is aware of them. It's time to configure.

**webpack.development.js**

```javascript
var path = require('path');

module.exports = {
  entry: [
    'webpack/hot/dev-server',
    path.resolve(__dirname, 'app/main.js')
  ],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ['style', 'css']
      }
    ]
  }
};
```

The configuration we added tells Webpack that whenever it meets some file ending with `css` it should invoke the power of loaders in this specific order. This is done by matching against `test` regular expression.

Loaders are evaluated from right to left. In this case it will pass a possible CSS file to *css-loader* first and to *style-loader* after that. *css-loader* will resolve `@import` and `url` statements of our CSS files. *style-loader* deals with `require` statements in our JavaScript. Similar approach works with CSS preprocessors.

We are missing just one bit, the actual CSS itself:

**app/stylesheets/main.css**

```css
body {
  background: cornsilk;
}
```

In addition we'll need to make Webpack aware of this file:

**app/main.js**

```
require('./stylesheets/main.css');

...
```

Hit `npm run dev` now and point your browser to *localhost:8080* provided you are using the default port.

To see the magic in action, you should open up *main.css* and change the background color to something nice like `lime` (`background: lime`). Develop styles as needed. Experiment.

In order to make our normal build (`npm run build`) work with CSS, you could attach that *module* bit to `webpack.config.js` too. Given it can be cumbersome to maintain configuration like this, I'll show you a nicer way.

## Sharing Common Configuration

If we don't structure our configuration in a smart way, it will become easy to make mistakes. We'll want to avoid unnecessary duplication. Given Webpack configuration is just JavaScript, there are many ways to approach the problem. As long as we generate the structure Webpack expects, we should be fine.

One way to do this is to keep configuration within a single file and expose it from there via small wrappers for Webpack to consume. The advantage of this approach is that you can see all the bits and pieces and how they relate to each other from single place. The wrappers cause a little bit of extra work but it's not a bad price to pay for some clarity.

We can adapt this approach to our project quite easily. First of all let's set up a structure like this:

- /config
  - index.js - This is where the configuration goes
  - build.js - Build configuration exposed to Webpack
  - develop.js - Development configuration exposed to Webpack
  - merge.js - A merge utility we'll be using to avoid duplication

Those *build.js* and *develop.js* simply point at our *index.js*. To give you an idea, they can simply look like this:

**config/build.js**

```javascript
// use `develop` for the other
module.exports = require('./').build;
```

Our *index.js* is more complex as it will have to contain all of our configuration. We'll implement a little helper using lodash so install it (`npm i lodash --save-dev`). Here's the full source:

**config/index.js**

```javascript
var path = require('path');
var merge = require('./merge');

var ROOT_PATH = path.resolve(__dirname, '..');

var common = {
  entry: [path.join(ROOT_PATH, 'app/main.js')],
  output: {
    path: path.resolve(ROOT_PATH, 'build'),
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ['style', 'css']
      }
    ]
  },
};

var mergeConfig = merge.bind(null, common);

exports.build = mergeConfig({});

exports.develop = mergeConfig({
  entry: ['webpack/hot/dev-server']
});
```

**config/merge.js**

```javascript
var _ = require('lodash');

module.exports = function(source, target) {
  return _.merge(target, source, joinArrays);

  // concat possible arrays
  function joinArrays(a, b) {
    if(_.isArray(a) && _.isArray(b)) {
      return a.concat(b);
    }
    if(_.isPlainObject(a) && _.isPlainObject(b)) {
      return _.merge(a, b, joinArrays);
    }

    return a;
  }
};
```

The common configuration has been separated to a section of its own. In this case `build` configuration is actually the same as `common` configuration. We do a little tweak for `develop` case. As you can see the configuration is quite easy to follow this way.

To make everything work again, we'll need to tweak our `package.json` **scripts** section like this:

```json
{
  "scripts": {
    "build": "webpack --config config/build",
    "dev": "webpack-dev-server --config config/develop --devtool eval --progress --colors --hot --content-base build"
  }
}
```

You can also eliminate those old configuration files at the project root while at it.

If everything went fine, the old commands should work still. Now we have something a little tidier together that's possible to grow even further with minimal work.

## Setting Up ESLint

A little discipline goes a long way in programming. Linting is one of those techniques that will simplify your life a lot at a minimal cost. You can fix potential problems before they escalate into actual issues. It won't replace testing but will definitely help. It is possible to integrate this process into your editor/IDE.

[ESLint](http://eslint.org/) is a recent linting solution for JavaScript. It builds on top of ideas presented by JSLint and JSHint. Most importantly it allows you to develop custom rules. As a result a nice set of rules have been developed for React in form of [eslint-plugin-react](https://www.npmjs.com/package/eslint-plugin-react).

### Connecting ESlint with `package.json`

In order to integrate ESLint with our project, we'll need to do a couple of little tweaks. To get it installed, invoke `npm i babel-eslint eslint eslint-plugin-react --save-dev`. That will add ESLint and the plugin we want to use as our project development dependency. Next we'll need to do some configuration to make linting work in our project.

**package.json**

```json
"scripts": {
  ...
  "lint": "eslint . --ext .js --ext .jsx"
}
...
```

This will trigger ESlint against all JS and JSX files of our project. That's definitely too much so we'll need to restrict it. Set up *.eslintignore* to the project root like this:

**.eslintignore**

```bash
node_modules/
build/
```

Next we'll need to activate [babel-eslint](https://www.npmjs.com/package/babel-eslint) so that ESLint works with our Babel code. In addition we need to activate React specific rules and set up a couple of our own. You can adjust these to your liking. You'll find more information about the rules at [the official rule documentation](http://eslint.org/docs/rules/).

**.eslintrc**

```json
{
  "parser": "babel-eslint",
  "env": {
    "browser": true,
    "node": true
  },
  "plugins": [
    "react"
  ],
  "ecmaFeatures": {
    "jsx": true
  },
  "rules": {
    "no-unused-vars": false,
    "no-underscore-dangle": false,
    "no-use-before-define": false,
    "quotes": [2, "single"],
    "comma-dangle": "always",
    "react/jsx-boolean-value": 1,
    "react/jsx-quotes": 1,
    "react/jsx-no-undef": 1,
    "react/jsx-uses-react": 1,
    "react/jsx-uses-vars": 1,
    "react/no-did-mount-set-state": 1,
    "react/no-did-update-set-state": 1,
    "react/no-multi-comp": 1,
    "react/no-unknown-property": 1,
    "react/react-in-jsx-scope": 1,
    "react/self-closing-comp": 1,
    "react/wrap-multilines": 1
  }
}
```

If you hit `npm run lint` now, you should get some errors and warnings to fix depending on the rules you have set up. Go ahead and fix them. You can check [the book site](https://github.com/survivejs/webpack) for potential fixes if you get stuck.

### Connecting ESlint with Webpack

We can make Webpack emit ESLint messages for us by using [eslint-loader](https://www.npmjs.com/package/eslint-loader). Hit `npm i eslint-loader --save-dev` to add it to the project. We also need to tweak our development configuration to include it. Add the following section to it:

**config/index.js**

```
exports.develop = mergeConfig({
  entry: ['webpack/hot/dev-server'],
  module: {
    preLoaders: [
      {
        test: /\.jsx?$/,
        loader: 'eslint',
        include: path.join(ROOT_PATH, 'app'),
      }
    ],
  },
});
```

We are using `preLoaders` section here as we want to play it safe. This section is executed before `loaders` get triggered.

If you execute `npm run dev` now and break some linting rule while developing, you should see that in terminal output.

### Customizing ESlint

Sometimes you'll want to skip certain rules per file or per line. Consider the following examples:

```javascript
// everything
/* eslint-disable */
...
/* eslint-enable */
```

```javascript
// specific rule
/* eslint-disable no-unused-vars */
...
/* eslint-enable no-unused-vars */
```

```javascript
// tweaking a rule
/* eslint no-comma-dangle:1 */
```

```javascript
// disable rule per line
alert('foo'); // eslint-disable-line no-alert
```

### ESlint Resources

Besides the official documentation available at [eslint.org](http://eslint.org/), you should check out the following blog posts:

* [Lint Like It’s 2015](https://medium.com/@dan_abramov/lint-like-it-s-2015-6987d44c5b48) - This post by Dan Abramov shows how to get ESlint work well with Sublime Text.
* [Detect Problems in JavaScript Automatically with ESLint](http://davidwalsh.name/eslint) - A good tutorial on the topic.
* [Understanding the Real Advantages of Using ESLint](http://rangle.io/blog/understanding-the-real-advantages-of-using-eslint/) - Evan Schultz's post digs into details.

## Conclusion

In this chapter you learned how to go beyond a basic Webpack configuration. Webpack's development server is a powerful feature that has even more in store. We also learned how to organize our configuration more effectively. Next we'll delve deeper as we discuss hot module reloading and React in the next chapter.
