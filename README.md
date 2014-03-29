# gulp-svgicons2svgfont
> Create an SVG font from several SVG icons with [Gulp](http://gulpjs.com/).

[![NPM version](https://badge.fury.io/js/gulp-svgicons2svgfont.png)](https://npmjs.org/package/gulp-svgicons2svgfont) [![Build status](https://secure.travis-ci.org/nfroidure/gulp-svgicons2svgfont.png)](https://travis-ci.org/nfroidure/gulp-svgicons2svgfont) [![Dependency Status](https://david-dm.org/nfroidure/gulp-svgicons2svgfont.png)](https://david-dm.org/nfroidure/gulp-svgicons2svgfont) [![devDependency Status](https://david-dm.org/nfroidure/gulp-svgicons2svgfont/dev-status.png)](https://david-dm.org/nfroidure/gulp-svgicons2svgfont#info=devDependencies) [![Coverage Status](https://coveralls.io/repos/nfroidure/gulp-svgicons2svgfont/badge.png?branch=master)](https://coveralls.io/r/nfroidure/gulp-svgicons2svgfont?branch=master) [![Code Climate](https://codeclimate.com/github/nfroidure/gulp-svgicons2svgfont.png)](https://codeclimate.com/github/nfroidure/gulp-svgicons2svgfont)

## Usage

First, install `gulp-svgicons2svgfont` as a development dependency:

```shell
npm install --save-dev gulp-svgicons2svgfont
```

Then, add it to your `gulpfile.js`:

```javascript
var svgicons2svgfont = require('gulp-svgicons2svgfont');

gulp.task('Iconfont', function(){
  gulp.src(['assets/icons/*.svg'])
    .pipe(svgicons2svgfont({
      fontName: 'myfont'
     }))
    .on('codepoints', function(codepoints) {
      console.log(codepoints);
      // Here generate CSS/SCSS  for your codepoints ...
    })
    .pipe(gulp.dest('www/font/'));
});
```

Every icon must be prefixed with it's codepoint. The `appendCodepoints` option
 allows to do it automatically. Then, in your own CSS, you just have to use
 the corresponding codepoint to display your icon. See this
 [sample less mixin](https://github.com/ChtiJS/chtijs.francejs.org/blob/master/documents/less/_icons.less)
 for a real world usage.

The plugin stream emits a `codepoints` event letting you do whatever you want
 with them.

Please report icons to font issues to the `svgicons2svgfont` repository on wich
 this plugin depends.

## API

### svgicons2svgfont(options)

#### options.fontName
Type: `String`
Default value: `'iconfont'`

A string value that is used to name your font-family (required).

#### options.fixedWidth
Type: `Boolean`
Default value: `false`

Creates a monospace font of the width of the largest input icon.

#### options.fontHeight
Type: `Number`

The ouputted font height (defaults to the height of the highest input icon).

#### options.descent
Type: `Number`
Default value: `0`

The font descent. It is usefull to fix the font baseline yourself.

The ascent formula is : ascent = fontHeight - descent.

#### options.appendCodepoints
Type: `Boolean`
Default value: `false`

Allow to append codepoints to icon files in order to always keep the same
 codepoints.

#### options.ignoreExt
Type: `Boolean`
Default value: `false`

Set to true to also convert read icons that doesn't have the .svg extension.

## Stats

[![NPM](https://nodei.co/npm/gulp-svgicons2svgfont.png?downloads=true&stars=true)](https://nodei.co/npm/gulp-svgicons2svgfont/)
[![NPM](https://nodei.co/npm-dl/gulp-svgicons2svgfont.png)](https://nodei.co/npm/gulp-svgicons2svgfont/)

