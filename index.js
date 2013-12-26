var svgicons2svgfont = require('svgicons2svgfont')
  , es = require('event-stream')
  , Path = require('path')
  , gutil = require('gulp-util')
  , PassThrough = require('stream').PassThrough
;

module.exports = function(destination, options) {
  var files = []
    , usedCodePoints = []
    , curCodepoint = 0xE001
  ;

  options = options || {};

  if (!options.font) {
    throw new Error("Missing font name option for gulp-svgicons2svgfont");
  }

  // Collecting icons
  function bufferContents(file){
    files.push(file);
  }

  // Generating the font
  function endStream(){

    var fontDestination = Path.join(files[0].base, destination, options.font)
      + '.svg';

    // No icons, exit
    if (files.length === 0) return this.emit('end');

    // Create the font file
    var joinedFile = new gutil.File({
      cwd: files[0].cwd,
      base: files[0].base,
      path: fontDestination,
      contents: svgicons2svgfont(files.map(function(file) {
        // Creating an object for each icon
        var matches = Path.basename(file.path).match(/^(?:u([0-9a-f]{4})\-)?(.*).svg$/i)
          , th = file.pipe(new PassThrough())
          , glyph = {
            name: matches[2],
            codepoint: 0,
            file: file.path,
            stream: th
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
                    error("Could not save codepoint: " + 'u'
                      + i.toString(16).toUpperCase() +' for ' + glyph.name + '.svg');
                  } else {
                    log("Saved codepoint: "
                      + 'u' + glyph.codepoint.toString(16).toUpperCase()
                      +' for ' + glyph.name + '.svg');
                  }
                }
              );
            });
          }
        }
        return glyph;
      }), {
        fontName: options.font,
        log: function() {
          gutil.log.apply(gutil, ['gulp-svgicons2svgfont: '].concat(
            [].slice.call(arguments, 0).concat()));
        },
        error: function() {
          gutil.log.apply(gutil, ['gulp-svgicons2svgfont: '].concat(
            [].slice.call(arguments, 0).concat()));
        }
      })
    });

    this.emit('data', joinedFile);
    this.emit('end');
  }

  return es.through(bufferContents, endStream);
};
