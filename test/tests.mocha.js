var fs = require('fs')
  , gulp = require('gulp')
  , gutil = require('gulp-util')
  , es = require('event-stream')
  , svgicons2svgfont = require('../index')
  , assert = require('assert')
;


describe('svgicons2svgfont', function() {

  it('should work with cleanicons', function(done) {
    gulp.src('test/fixtures/cleanicons/*.svg')
      .pipe(svgicons2svgfont({
        fontName: 'cleanicons'
      })).on('data', function(file) {
        file.pipe(es.wait(function(err, data) {
          assert.equal(err, undefined);
          assert.equal(
            data,
            fs.readFileSync('test/expected/test-cleanicons-font.svg', 'utf8')
          );
          done();
        }));
      });
  });

  it('should work with prefixedicons', function(done) {
    gulp.src('test/fixtures/prefixedicons/*.svg')
      .pipe(svgicons2svgfont({
        fontName: 'prefixedicons'
      })).on('data', function(file) {
        file.pipe(es.wait(function(err, data) {
          assert.equal(err, undefined);
          assert.equal(
            data,
            fs.readFileSync('test/expected/test-prefixedicons-font.svg', 'utf8')
          );
          done();
        }));
      });
  });

  it('should work with originalicons', function(done) {
    gulp.src('test/fixtures/originalicons/*.svg')
      .pipe(svgicons2svgfont({
        fontName: 'originalicons'
      })).on('data', function(file) {
        file.pipe(es.wait(function(err, data) {
          assert.equal(err, undefined);
          assert.equal(
            data,
            fs.readFileSync('test/expected/test-originalicons-font.svg', 'utf8')
          );
          done();
        }));
      });
  });

});
