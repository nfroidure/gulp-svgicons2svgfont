var svgicons2svgfont = require('svgicons2svgfont');
var gutil = require('gulp-util');
var Stream = require('readable-stream');
var Fs = require('fs');
var path = require('path');
var plexer = require('plexer');

module.exports = function(options) {
  var filesBuffer = [];
  var streamsBuffer = [];
  var firstFile = null;
  var metadataProvider;

  options = options || {};
  options.ignoreExt = options.ignoreExt || false;
  options.startUnicode = options.startUnicode ||  0xEA01;
  options.appendUnicode = !!options.appendUnicode;

  if(!options.fontName) {
    throw new gutil.PluginError('svgicons2svgfont', 'Missing options.fontName');
  }

  options.log = options.log || function() {
    gutil.log.apply(gutil, ['gulp-svgicons2svgfont:'].concat(
      [].slice.call(arguments, 0).concat()));
  };

  // Emit event containing codepoint mapping
  options.callback = function(glyphs) {
    stream.emit('glyphs', glyphs.map(function(glyph) {
      return {
        name: glyph.name,
        unicode: glyph.unicode
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

  metadataProvider = options.metadataProvider || require('svgicons2svgfont/src/metadata')({
    startUnicode: options.startUnicode,
    appendUnicode: options.appendUnicode
  });

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

    // Generating the font
    if(!firstFile) {
      fontStream = svgicons2svgfont(options);
      fontStream.on('error', function (error) {
        outputStream.emit('error', error);
      });
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

    // Wrap icons for the underlying lib
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
    metadataProvider(file.path, function(err, theMetadata) {
      if(err) {
        fontStream.emit('error', err);
      }
      iconStream.metadata = theMetadata;

      done();
    });
    filesBuffer.push(file);
    streamsBuffer.push(iconStream);
  };

  inputStream._flush  = function _gulpSVGIcons2SVGFontFlush(done) {
    if(!firstFile) {
      outputStream.end();
    } else {

      streamsBuffer.forEach(function(iconStream) {
        fontStream.write(iconStream);
      });
      fontStream.end();
    }
    done();
  };

  return stream;
};
