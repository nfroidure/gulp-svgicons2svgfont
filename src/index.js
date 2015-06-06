var svgicons2svgfont = require('svgicons2svgfont');
var gutil = require('gulp-util');
var Stream = require('readable-stream');
var Fs = require('fs');
var path = require('path');
var plexer = require('plexer');

module.exports = function(options) {
  var files = [];
  var usedCodePoints = [];
  var curCodepoint;
  var firstFile = null;

  options = options || {};
  options.ignoreExt = options.ignoreExt || false;
  curCodepoint = options.startCodepoint ||  0xE001;

  if(!options.fontName) {
    throw new gutil.PluginError('svgicons2svgfont', 'Missing options.fontName');
  }

  options.log = options.log || function() {
    gutil.log.apply(gutil, ['gulp-svgicons2svgfont:'].concat(
      [].slice.call(arguments, 0).concat()));
  };

  // Emit event containing codepoint mapping
  options.callback = function(glyphs) {
    stream.emit('codepoints', glyphs.map(function(glyph) {
      return {
        name: glyph.name,
        codepoint: glyph.unicode.charCodeAt(0)
      };
    }));
  };
  var inputStream = new Stream.Transform({objectMode: true});
  var outputStream = new Stream.PassThrough({objectMode: true});
  var stream = plexer({objectMode: true}, inputStream, outputStream);
  var fontStream;

  options.error = options.error || function() {
    stream.emit('error', new PluginError('svgicons2svgfont',
      [].slice.call(arguments, 0).concat()));
  };

  inputStream._transform  = function _gulpSVGIcons2SVGFontTransform(file, unused, done) {
    // When null just pass through
    if(file.isNull()) {
      outputStream.write(file); done();
      return;
    }

    // If the ext doesn't match, pass it through
    if((!options.ignoreExt) && '.svg' !== path.extname(file.path)) {
      outputStream.write(file); done();
      return;
    }

    // Wrap icons for the underlying lib
    var matches = path.basename(file.path)
      .match(/^(?:u([0-9a-f]{4,6})\-)?(.*).svg$/i);
    var metadata = {
      name: matches[2],
      unicode: ''
    };
    if(matches && matches[1]) {
      metadata.unicode = String.fromCharCode(parseInt(matches[1], 16));
      usedCodePoints.push(metadata.unicode);
    } else {
      do {
        metadata.unicode = String.fromCharCode(curCodepoint++);
      } while(-1 !== usedCodePoints.indexOf(metadata.unicode));
      usedCodePoints.push(metadata.unicode);
      if(options.appendCodepoints) {
        Fs.rename(file.path, path.dirname(file.path) + '/' +
          'u' + metadata.unicode.charCodeAt(0).toString(16).toUpperCase() +
          '-' + metadata.name + '.svg',
          function(err) {
            if(err) {
              gutil.log('Could not save codepoint: ' +
                'u' + metadata.unicode.charCodeAt(0).toString(16).toUpperCase() +
                ' for ' + metadata.name + '.svg');
            } else {
              gutil.log('Saved codepoint: ' +
                'u' + metadata.unicode.charCodeAt(0).toString(16).toUpperCase() +
                ' for ' + metadata.name + '.svg');
            }
          }
        );
      }
    }

    // Generating the font
    if(!firstFile) {
      fontStream = svgicons2svgfont(options);
      firstFile = file;
      // Create the font file
      var joinedFile = new gutil.File({
        cwd: firstFile.cwd,
        base: firstFile.base,
        path: path.join(firstFile.base, options.fontName) + '.svg'
      });

      // Giving the font back to the stream
      if(firstFile.isBuffer()) {
        var buf = new Buffer('');
        fontStream.on('data', function(chunk) {
          buf = Buffer.concat([buf, chunk], buf.length + chunk.length);
        });
        fontStream.on('end', function() {
          joinedFile.contents = buf;
          outputStream.push(joinedFile);
          outputStream.end();
        });
      } else {
        joinedFile.contents = fontStream;
        outputStream.push(joinedFile);
        fontStream.on('end', function() {
          outputStream.end();
        });
      }
    }
    var iconStream;
    if(file.isBuffer()) {
      iconStream = new Stream.PassThrough();
      setImmediate(function(argument) {
        iconStream.write(file.contents);
        iconStream.end();
      });
    } else {
      iconStream = file.contents;
    }
    iconStream.metadata = metadata;
    fontStream.write(iconStream);

    done();
  };

  inputStream._flush  = function _gulpSVGIcons2SVGFontFlush(done) {
    if(!firstFile) {
      outputStream.end();
    } else {
      fontStream.end();
    }
    done();
  };

  return stream;
};
