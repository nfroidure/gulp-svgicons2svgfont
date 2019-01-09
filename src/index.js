'use strict';

const streamifier = require('streamifier');
const SVGIcon2SVGFontStream = require('svgicons2svgfont');
const log = require('fancy-log');
const Vinyl = require('vinyl');
const PluginError = require('plugin-error');
const Stream = require('readable-stream');
const path = require('path');
const defaultMetadataProvider = require('svgicons2svgfont/src/metadata');
const fileSorter = require('svgicons2svgfont/src/filesorter');

module.exports = (options) => {
  const inputStream = new Stream.Transform({ objectMode: true });
  let fontStream;
  let filesBuffer = [];

  options = options || {};
  options.ignoreExt = options.ignoreExt || false;
  options.startUnicode = options.startUnicode || 0xEA01;
  options.prependUnicode = !!options.prependUnicode;
  options.fileName = options.fileName || options.fontName;

  if(options.appendUnicode) {
    throw new PluginError(
      'svgicons2svgfont',
      'The "appendUnicode" option was renamed to "prependUnicode".' +
      ' See https://github.com/nfroidure/gulp-svgicons2svgfont/issues/33'
    );
  }

  if(!options.fontName) {
    throw new PluginError('svgicons2svgfont', 'Missing options.fontName');
  }

  options.log = options.log || function(...args) {
    log('gulp-svgicons2svgfont:', ...args);
  };

  // Emit event containing codepoint mapping
  options.callback = function(glyphs) {
    inputStream.emit('glyphs', glyphs.map((glyph) => {
      const finalGlyph = {
        name: glyph.name,
        unicode: glyph.unicode,
      };

      if(glyph.color) {
        finalGlyph.color = glyph.color;
      }
      return finalGlyph;
    }));
  };

  options.error = options.error || function(...args) {
    this.emit('error', new PluginError('svgicons2svgfont', args));
  };

  const metadataProvider = options.metadataProvider || defaultMetadataProvider({
    startUnicode: options.startUnicode,
    prependUnicode: options.prependUnicode,
  });

  inputStream._transform = function _gulpSVGIcons2SVGFontTransform(file, unused, done) {
    // When null just pass through
    if(file.isNull()) {
      this.push(file); done();
      return;
    }

    // If the ext doesn't match, pass it through
    if((!options.ignoreExt) && '.svg' !== path.extname(file.path)) {
      this.push(file); done();
      return;
    }

    filesBuffer.push(file);

    done();
  };

  inputStream._flush = function _gulpSVGIcons2SVGFontFlush(done) {
    // Sorting files
    filesBuffer = filesBuffer.sort((fileA, fileB) => fileSorter(fileA.path, fileB.path));

    // check if there is still a file in the buffer, if yes write it to the
    // fontstream, otherwise close it and call done();
    const writeFile = () => {
      const file = filesBuffer.shift();
      if(file) {
        if(!fontStream) {

          // Generating the font
          fontStream = new SVGIcon2SVGFontStream(options);
          fontStream.on('error', (err) => {
            this.emit('error', err);
          });
          // Create the font file
          const fontFile = new Vinyl({
            cwd: file.cwd,
            base: file.base,
            path: `${path.join(file.base, options.fileName)}.svg`,
            contents: fontStream,
          });

          this.push(fontFile);
        }

        const iconStream = file.isBuffer() ?
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          streamifier.createReadStream(file.contents) :
          file.contents;

        metadataProvider(file.path, (err, metadata) => {
          if(err) {
            fontStream.emit('error', err);
          }
          iconStream.metadata = metadata;
          fontStream.write(iconStream);

          writeFile();
        });
      } else {
        if(fontStream) {
          fontStream.end();
        }
        // eslint-disable-next-line callback-return
        done();
      }
    };

    writeFile();
  };

  return inputStream;
};
