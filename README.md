# gulp-svgicons2svgfont [![NPM version](https://badge.fury.io/js/gulp-svgicons2svgfont.png)](https://npmjs.org/package/gulp-svgicons2svgfont) [![Build status](https://api.travis-ci.org/nfroidure/gulp-svgiconstosvgfont.png)](https://travis-ci.org/nfroidure/gulp-svgicons2svgfont)
> Create an SVG font from several SVG icons with [Gulp](http://gulpjs.com/).

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
    .pipe(gulp.dest('www/font/'));
});
```

Every icon must be prefixed with it's codepoint. The `appendCodepoints` option
 allows to do it automatically. Then, in your own CSS, you just have to use
 the corresponding codepoint to display your icon. See this
 [sample less mixin](https://github.com/ChtiJS/chtijs.francejs.org/blob/master/documents/less/_icons.less)
 for a real world usage.

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

Allow to append codepoints to icon files in order to always keep the same codepoints.
