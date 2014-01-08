var fs = require('fs')
  , gulp = require('gulp')
  , gutil = require('gulp-util')
  , es = require('event-stream')
  , svgicons2svgfont = require('../src/index')
  , assert = require('assert')
;


describe('gulp-svgicons2svgfont', function() {

  describe('in stream mode', function() {

    it('should work with cleanicons', function(done) {
      gulp.src(__dirname + '/fixtures/cleanicons/*.svg', {buffer: false})
        .pipe(svgicons2svgfont({
          fontName: 'cleanicons'
        })).on('data', function(file) {
          assert.equal(file.isStream(), true);
          file.pipe(es.wait(function(err, data) {
            assert.equal(err, undefined);
            assert.equal(
              data,
              fs.readFileSync(__dirname + '/expected/test-cleanicons-font.svg', 'utf8')
            );
            done();
          }));
        });
    });

    it('should work with prefixedicons (stream)', function(done) {
      gulp.src(__dirname + '/fixtures/prefixedicons/*.svg', {buffer: false})
        .pipe(svgicons2svgfont({
          fontName: 'prefixedicons'
        })).on('data', function(file) {
          assert.equal(file.isStream(), true);
          file.pipe(es.wait(function(err, data) {
            assert.equal(err, undefined);
            assert.equal(
              data,
              fs.readFileSync(__dirname + '/expected/test-prefixedicons-font.svg', 'utf8')
            );
            done();
          }));
        });
    });

    it('should work with originalicons (stream)', function(done) {
      gulp.src(__dirname + '/fixtures/originalicons/*.svg', {buffer: false})
        .pipe(svgicons2svgfont({
          fontName: 'originalicons'
        })).on('data', function(file) {
          assert.equal(file.isStream(), true);
          file.pipe(es.wait(function(err, data) {
            assert.equal(err, undefined);
            assert.equal(
              data,
              fs.readFileSync(__dirname + '/expected/test-originalicons-font.svg', 'utf8')
            );
            done();
          }));
        });
    });

    it('should work with unprefixed icons (stream)', function(done) {
      gulp.src(__dirname + '/fixtures/unprefixedicons/*.svg', {buffer: false})
        .pipe(gulp.dest(__dirname + '/results/unprefixedicons/'))
        .pipe(es.wait(function() {
          gulp.src(__dirname + '/results/unprefixedicons/*.svg', {buffer: false})
            .pipe(svgicons2svgfont({
              fontName: 'unprefixedicons',
              appendCodepoints: true
            }))
            .pipe(gulp.dest(__dirname + '/results/'))
            .on('data', function(file) {
              assert.equal(fs.existsSync(__dirname
                + '/results/unprefixedicons/uE001-arrow-down.svg'), true);
              assert.equal(
                fs.readFileSync(__dirname + '/results/unprefixedicons/uE001-arrow-down.svg', 'utf8'),
                fs.readFileSync(__dirname + '/fixtures/unprefixedicons/arrow-down.svg', 'utf8')
              );
              assert.equal(fs.existsSync(__dirname
                + '/results/unprefixedicons/uE002-arrow-left.svg'), true);
              assert.equal(
                fs.readFileSync(__dirname + '/results/unprefixedicons/uE002-arrow-left.svg', 'utf8'),
                fs.readFileSync(__dirname + '/fixtures/unprefixedicons/arrow-left.svg', 'utf8')
              );
              assert.equal(fs.existsSync(__dirname
                + '/results/unprefixedicons/uE003-arrow-right.svg'), true);
              assert.equal(
                fs.readFileSync(__dirname + '/results/unprefixedicons/uE003-arrow-right.svg', 'utf8'),
                fs.readFileSync(__dirname + '/fixtures/unprefixedicons/arrow-right.svg', 'utf8')
              );
              assert.equal(fs.existsSync(__dirname
                + '/results/unprefixedicons/uE004-arrow-up.svg'), true);
              assert.equal(
                fs.readFileSync(__dirname + '/results/unprefixedicons/uE004-arrow-up.svg', 'utf8'),
                fs.readFileSync(__dirname + '/fixtures/unprefixedicons/arrow-up.svg', 'utf8')
              );
              assert.equal(file.isStream(), true);
              file.pipe(es.wait(function(err, data) {
                assert.equal(err, undefined);
                assert.equal(
                  data,
                  fs.readFileSync(__dirname + '/expected/test-unprefixedicons-font.svg', 'utf8')
                );
                fs.unlinkSync(__dirname + '/results/unprefixedicons/uE001-arrow-down.svg');
                fs.unlinkSync(__dirname + '/results/unprefixedicons/uE002-arrow-left.svg');
                fs.unlinkSync(__dirname + '/results/unprefixedicons/uE003-arrow-right.svg');
                fs.unlinkSync(__dirname + '/results/unprefixedicons/uE004-arrow-up.svg');
                fs.rmdirSync(__dirname + '/results/unprefixedicons/');
                fs.unlinkSync(__dirname + '/results/unprefixedicons.svg');
                fs.rmdirSync(__dirname + '/results/');
                done();
              }));
            });
        }));
    });

  });


  describe('in buffer mode', function() {

    it('should work with cleanicons', function(done) {
      gulp.src('tests/fixtures/cleanicons/*.svg', {buffer: true})
        .pipe(svgicons2svgfont({
          fontName: 'cleanicons'
        })).on('data', function(file) {
            assert.equal(file.isBuffer(), true);
            assert.equal(
              file.contents.toString('utf8'),
              fs.readFileSync(__dirname + '/expected/test-cleanicons-font.svg')
            );
            done();
        });
    });

    it('should work with prefixedicons', function(done) {
      gulp.src(__dirname + '/fixtures/prefixedicons/*.svg', {buffer: true})
        .pipe(svgicons2svgfont({
          fontName: 'prefixedicons'
        })).on('data', function(file) {
            assert.equal(file.isBuffer(), true);
            assert.equal(
              file.contents.toString('utf8'),
              fs.readFileSync(__dirname + '/expected/test-prefixedicons-font.svg','utf8')
            );
            done();
        });
    });

    it('should work with originalicons', function(done) {
      gulp.src(__dirname + '/fixtures/originalicons/*.svg', {buffer: true})
        .pipe(svgicons2svgfont({
          fontName: 'originalicons'
        })).on('data', function(file) {
            assert.equal(file.isBuffer(), true);
            assert.equal(
              file.contents.toString('utf8'),
              fs.readFileSync(__dirname + '/expected/test-originalicons-font.svg')
            );
            done();
        });
    });

  });


  describe('Using gulp.dest in buffer mode', function() {

    it('should work with cleanicons', function(done) {
      gulp.src(__dirname + '/fixtures/cleanicons/*.svg', {buffer: true})
        .pipe(svgicons2svgfont({
          fontName: 'cleanicons'
        }))
        .pipe(gulp.dest(__dirname + '/results/'))
        .on('end', function() {
            assert.equal(
              fs.readFileSync(__dirname + '/results/cleanicons.svg',{
                encoding: 'utf-8'
              }),
              fs.readFileSync(__dirname + '/expected/test-cleanicons-font.svg',{
                encoding: 'utf-8'
              })
            );
            fs.unlinkSync(__dirname + '/results/cleanicons.svg');
            fs.rmdirSync(__dirname + '/results/');
            done();
        });
    });

    it('should work with unprefixed icons (stream)', function(done) {
      gulp.src(__dirname + '/fixtures/unprefixedicons/*.svg', {buffer: true})
        .pipe(gulp.dest(__dirname + '/results/unprefixedicons/'))
        .pipe(es.wait(function() {
          gulp.src(__dirname + '/results/unprefixedicons/*.svg', {buffer: true})
            .pipe(svgicons2svgfont({
              fontName: 'unprefixedicons',
              appendCodepoints: true
            }))
            .pipe(gulp.dest(__dirname + '/results/'))
            .on('data', function(file) {
              assert.equal(fs.existsSync(__dirname
                + '/results/unprefixedicons/uE001-arrow-down.svg'), true);
              assert.equal(
                fs.readFileSync(__dirname + '/results/unprefixedicons/uE001-arrow-down.svg', 'utf8'),
                fs.readFileSync(__dirname + '/fixtures/unprefixedicons/arrow-down.svg', 'utf8')
              );
              assert.equal(fs.existsSync(__dirname
                + '/results/unprefixedicons/uE002-arrow-left.svg'), true);
              assert.equal(
                fs.readFileSync(__dirname + '/results/unprefixedicons/uE002-arrow-left.svg', 'utf8'),
                fs.readFileSync(__dirname + '/fixtures/unprefixedicons/arrow-left.svg', 'utf8')
              );
              assert.equal(fs.existsSync(__dirname
                + '/results/unprefixedicons/uE003-arrow-right.svg'), true);
              assert.equal(
                fs.readFileSync(__dirname + '/results/unprefixedicons/uE003-arrow-right.svg', 'utf8'),
                fs.readFileSync(__dirname + '/fixtures/unprefixedicons/arrow-right.svg', 'utf8')
              );
              assert.equal(fs.existsSync(__dirname
                + '/results/unprefixedicons/uE004-arrow-up.svg'), true);
              assert.equal(
                fs.readFileSync(__dirname + '/results/unprefixedicons/uE004-arrow-up.svg', 'utf8'),
                fs.readFileSync(__dirname + '/fixtures/unprefixedicons/arrow-up.svg', 'utf8')
              );
              assert.equal(file.isBuffer(), true);
              file.pipe(es.wait(function(err, data) {
                assert.equal(err, undefined);
                assert.equal(
                  data,
                  fs.readFileSync(__dirname + '/expected/test-unprefixedicons-font.svg', 'utf8')
                );
                fs.unlinkSync(__dirname + '/results/unprefixedicons/uE001-arrow-down.svg');
                fs.unlinkSync(__dirname + '/results/unprefixedicons/uE002-arrow-left.svg');
                fs.unlinkSync(__dirname + '/results/unprefixedicons/uE003-arrow-right.svg');
                fs.unlinkSync(__dirname + '/results/unprefixedicons/uE004-arrow-up.svg');
                fs.rmdirSync(__dirname + '/results/unprefixedicons/');
                fs.unlinkSync(__dirname + '/results/unprefixedicons.svg');
                fs.rmdirSync(__dirname + '/results/');
                done();
              }));
            });
        }));
    });

  });


});
