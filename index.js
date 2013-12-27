var svgicons2svgfont = require('svgicons2svgfont')
  , es = require('event-stream')
  , Path = require('path')
  , gutil = require('gulp-util')
  , PassThrough = require('stream').PassThrough
;

module.exports = function(options) {
  var files = []
    , usedCodePoints = []
    , curCodepoint = 0xE001
  ;

  options = options || {};

  if (!options.fontName) {
    throw new Error("Missing options.fontName for gulp-svgicons2svgfont");
  }
  options.log = function() {
    gutil.log.apply(gutil, ['gulp-svgicons2svgfont: '].concat(
      [].slice.call(arguments, 0).concat()));
  };
  options.error = function() {
    gutil.log.apply(gutil, ['gulp-svgicons2svgfont: '].concat(
      [].slice.call(arguments, 0).concat()));
  };

  // Collecting icons
  function bufferContents(file) {
    files.push(file);
  }

  // Generating the font
  function endStream() {
    var _that = this;

    // No icons, exit
    if (files.length === 0) return this.emit('end');

    // Create the font file
    var joinedFile = new gutil.File({
      cwd: files[0].cwd,
      base: files[0].base,
      path: Path.join(files[0].base, options.fontName) + '.svg',
      contents: svgicons2svgfont(files.map(function(file) {
        // Creating an object for each icon
        var matches = Path.basename(file.path).match(/^(?:u([0-9a-f]{4})\-)?(.*).svg$/i)
          , glyph = {
            name: matches[2],
            codepoint: 0,
            file: file.path,
            stream: file.pipe(new PassThrough())
          };
        if(matches&&matches[1]) {
          glyph.codepoint = parseInt(matches[1], 16);
          usedCodePoints.push(glyph.codepoint);
          return glyph;
        }
        return glyph;
      }).map(function(glyph){
        if(0 === glyph.codepoint) {
          do {
            glyph.codepoint = curCodepoint++;
          } while(-1 !== usedCodePoints.indexOf(glyph.codepoint))
          usedCodePoints.push(glyph.codepoint);
          if(options.appendCodepoints) {
            glyph.stream.on('end', function() {
              Fs.rename(glyph.file, Path.dirname(glyph.file) + '/'
                + 'u' + glyph.codepoint.toString(16).toUpperCase()
                + '-' + glyph.name + '.svg',
                function(err) {
                  if(err) {
                    gutil.log("Could not save codepoint: "
                      + 'u' + i.toString(16).toUpperCase()
                      +' for ' + glyph.name + '.svg');
                  } else {
                    gutil.log("Saved codepoint: "
                      + 'u' + glyph.codepoint.toString(16).toUpperCase()
                      +' for ' + glyph.name + '.svg');
                  }
                }
              );
            });
          }
        }
        return glyph;
      }), options)
    });
    if(files[0].isBuffer()) {
      joinedFile.contents.pipe(es.wait(function(err, data) {
        joinedFile.contents = new Buffer(data);
        _that.emit('data', joinedFile);
        _that.emit('end');
      }));
    } else {
      this.emit('data', joinedFile);
      this.emit('end');
    }
  }

  return es.through(bufferContents, endStream);
};
