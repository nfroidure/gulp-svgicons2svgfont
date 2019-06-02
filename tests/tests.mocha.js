/* eslint max-nested-callbacks:0, security/detect-non-literal-fs-filename:0 */

'use strict'

const fs = require('fs')
const path = require('path')

const gulp = require('gulp')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')

const assert = require('assert')
const streamtest = require('streamtest')
const neatequal = require('neatequal')

const svgicons2svgfont = require('../src/index')
const defaultMetadataProvider = require('svgicons2svgfont/src/metadata')

const file2Str = (file, callback) => {
  if (file.isBuffer()) {
    // eslint-disable-next-line callback-return
    callback(file.contents.contents.toString('utf8'))
  } else {
    file.contents.pipe(
      streamtest.v2.toText((err2, text) => {
        if (err2) {
          throw new Error(err2)
        }
        callback(text)
      }),
    )
  }
}

describe('gulp-svgicons2svgfont', () => {
  beforeEach(done => {
    mkdirp(path.join(__dirname, 'results'), done)
  })

  afterEach(done => {
    rimraf(path.join(__dirname, 'results'), done)
  })

  describe('must emit an error', () => {
    it('when a glyph is bad', done => {
      svgicons2svgfont('fixtures/invalidicon.svg', {
        fontName: 'unprefixedicons',
      })
        .on('error', err => {
          assert.equal(err.message, 'Non-whitespace before first tag.\nLine: 0\nColumn: 1\nChar: o')
        })
        .pipe(
          streamtest.v2.toObjects(err => {
            if (err) {
              done(err)
              return
            }
            done()
          }),
        )
    })
  })

  describe('in stream mode', () => {
    it('should work with cleanicons', done => {
      svgicons2svgfont(path.join(__dirname, 'fixtures', 'cleanicons', '*.svg'), {
        fontName: 'cleanicons',
        startUnicode: 0xe001,
      }).pipe(
        streamtest.v2.toObjects((err, files) => {
          if (err) {
            done(err)
            return
          }
          assert.equal(files.length, 1)
          assert.equal(files[0].isStream(), true)
          file2Str(files[0], text => {
            assert.equal(text, fs.readFileSync(path.join(__dirname, 'expected', 'test-cleanicons-font.svg'), 'utf8'))
            done()
          })
        }),
      )
    })

    it('should work with the metadataProvider option', done => {
      svgicons2svgfont(path.join(__dirname, 'fixtures', 'cleanicons', '*.svg'), {
        fontName: 'cleanicons',
        metadataProvider: defaultMetadataProvider({
          startUnicode: 0xe001,
        }),
      }).pipe(
        streamtest.v2.toObjects((err, files) => {
          if (err) {
            done(err)
            return
          }
          assert.equal(files.length, 1)
          file2Str(files[0], text => {
            assert.equal(text, fs.readFileSync(path.join(__dirname, 'expected', 'test-cleanicons-font.svg'), 'utf8'))
            done()
          })
        }),
      )
    })

    it('should work with prefixedicons', done => {
      svgicons2svgfont(path.join(__dirname, 'fixtures', 'prefixedicons', '*.svg'), {
        fontName: 'prefixedicons',
        startUnicode: 0xe001,
      }).pipe(
        streamtest.v2.toObjects((err, files) => {
          if (err) {
            done(err)
            return
          }
          assert.equal(files.length, 1)
          file2Str(files[0], text => {
            assert.equal(text, fs.readFileSync(path.join(__dirname, 'expected', 'test-prefixedicons-font.svg'), 'utf8'))
            done()
          })
        }),
      )
    })

    it('should work with originalicons', done => {
      svgicons2svgfont(path.join(__dirname, 'fixtures', 'originalicons', '*.svg'), {
        fontName: 'originalicons',
      }).pipe(
        streamtest.v2.toObjects((err, files) => {
          if (err) {
            done(err)
            return
          }
          assert.equal(files.length, 1)
          file2Str(files[0], text => {
            assert.equal(text, fs.readFileSync(path.join(__dirname, 'expected', 'test-originalicons-font.svg'), 'utf8'))
            done()
          })
        }),
      )
    })

    describe('more', () => {
      beforeEach(done => {
        gulp
          .src(path.join(__dirname, 'fixtures', 'unprefixedicons', '*.svg'))
          .pipe(gulp.dest(path.join(__dirname, 'results', 'unprefixedicons')))
          .on('error', done)
          .on('end', done)
      })

      it('should work with unprefixed icons and the prependUnicode option', done => {
        svgicons2svgfont(path.join(__dirname, 'results', 'unprefixedicons', '*.svg'), {
          fontName: 'unprefixedicons',
          prependUnicode: true,
        }).pipe(
          streamtest.v2.toObjects((err, files) => {
            if (err) {
              done(err)
              return
            }
            assert.equal(files.length, 1)
            assert.equal(files[0].isStream(), true)
            const expectedRenames = {
              'arrow-down.svg': 'uEA01-arrow-down.svg',
              'arrow-left.svg': 'uEA02-arrow-left.svg',
              'arrow-right.svg': 'uEA03-arrow-right.svg',
              'arrow-up.svg': 'uEA04-arrow-up.svg',
            }

            for (const oldFile of Object.keys(expectedRenames)) {
              const newFile = expectedRenames[oldFile]
              const newFilePath = path.join(__dirname, 'results', 'unprefixedicons', newFile)

              assert.ok(fs.existsSync(newFilePath), newFilePath)
              assert.equal(
                fs.readFileSync(path.join(__dirname, 'results', 'unprefixedicons', newFile), 'utf8'),
                fs.readFileSync(path.join(__dirname, 'fixtures', 'unprefixedicons', oldFile), 'utf8'),
              )
            }
            file2Str(files[0], text => {
              assert.equal(
                text,
                fs.readFileSync(path.join(__dirname, 'expected', 'test-unprefixedicons-font.svg'), 'utf8'),
              )
              done()
            })
          }),
        )
      })
    })

    describe('more2', () => {
      beforeEach(done => {
        gulp
          .src(path.join(__dirname, 'fixtures', 'unicons', '*.svg'))
          .pipe(gulp.dest(path.join(__dirname, 'results', 'unicons')))
          .on('error', done)
          .on('end', done)
      })

      it('should work with mixed icons and the prependUnicode option', done => {
        svgicons2svgfont(path.join(__dirname, 'results', 'unicons', '*.svg'), {
          fontName: 'unicons',
          prependUnicode: true,
        })
          .on('error', done)
          .pipe(
            streamtest.v2.toObjects((err, files) => {
              if (err) {
                done(err)
                return
              }
              assert.equal(files.length, 1)
              assert.equal(files[0].isStream(), true)
              file2Str(files[0], text => {
                assert.equal(text, fs.readFileSync(path.join(__dirname, 'expected', 'test-unicons-font.svg'), 'utf8'))
                assert.equal(fs.existsSync(path.join(__dirname, 'results', 'unicons', 'uEA01-twitter.svg')), true)
                assert.equal(
                  fs.readFileSync(path.join(__dirname, 'results', 'unicons', 'uEA01-twitter.svg'), 'utf8'),
                  fs.readFileSync(path.join(__dirname, 'fixtures', 'unicons', 'uEA01-twitter.svg'), 'utf8'),
                )
                assert.equal(fs.existsSync(path.join(__dirname, 'results', 'unicons', 'uEA02-facebook.svg')), true)
                assert.equal(
                  fs.readFileSync(path.join(__dirname, 'results', 'unicons', 'uEA02-facebook.svg'), 'utf8'),
                  fs.readFileSync(path.join(__dirname, 'fixtures', 'unicons', 'facebook.svg'), 'utf8'),
                )
                done()
              })
            }),
          )
      })
    })

    it('should emit an event with the codepoint mapping', done => {
      let codepoints

      svgicons2svgfont(path.join(__dirname, 'fixtures', 'cleanicons', '*.svg'), {
        fontName: 'cleanicons',
        startUnicode: 0xe001,
      })
        .on('glyphs', c => {
          codepoints = c
        })
        .pipe(
          streamtest.v2.toObjects((err, files) => {
            if (err) {
              done(err)
              return
            }
            assert.equal(files.length, 1)
            assert.equal(files[0].isStream(), true)
            file2Str(files[0], text => {
              assert(codepoints)
              neatequal(
                codepoints,
                JSON.parse(fs.readFileSync(path.join(__dirname, 'expected', 'test-codepoints.json'), 'utf8')),
              )
              assert.equal(text, fs.readFileSync(path.join(__dirname, 'expected', 'test-cleanicons-font.svg'), 'utf8'))
              done()
            })
          }),
        )
    })

    it('should support filename change', done => {
      svgicons2svgfont(path.join(__dirname, 'fixtures', 'cleanicons', '*.svg'), {
        fontName: 'cleanicons',
        fileName: 'newName',
        startUnicode: 0xe001,
      }).pipe(
        streamtest.v2.toObjects((err, files) => {
          if (err) {
            done(err)
            return
          }
          assert.equal(files.length, 1)
          assert.equal(files[0].isStream(), true)
          assert(fs.statSync(__dirname, 'fixtures', 'cleanicons', 'newName.svg'))
          done()
        }),
      )
    })
  })

  describe('must throw error', () => {
    it('when no fontname is given', () => {
      assert.throws(() => {
        svgicons2svgfont()
      })
    })

    it('when using old options', () => {
      assert.throws(() => {
        svgicons2svgfont({
          appendUnicode: true,
        })
      })
    })
  })
})
