import { describe, beforeEach, afterEach, test, expect } from '@jest/globals';
import { Readable } from 'node:stream';
import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import type Vinyl from 'vinyl';

import gulp from 'gulp';
import { rimraf } from 'rimraf';
import { mkdirp } from 'mkdirp';

import assert from 'assert';
import StreamTest from 'streamtest';

import { svgicons2svgfont } from '../index.js';
import { getMetadataService } from 'svgicons2svgfont';

describe('gulp-svgicons2svgfont', () => {
  beforeEach(async () => {
    await mkdirp(join('fixtures', 'results'));
  });

  afterEach(async () => {
    await rimraf(join('fixtures', 'results'));
  });

  describe('must emit an error', () => {
    test('when a glyph is bad', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();

      try {
        await Promise.all([
          new Promise<void>((resolve, reject) => {
            svgicons2svgfont(join('fixtures', 'icons', 'invalidicon.svg'), {
              fontName: 'unprefixedicons',
            })
              .on('error', (err) => {
                reject(err);
              })
              .pipe(stream);
          }),
          result,
        ]);

        throw new Error('E_UNEXPECTED');
      } catch (err) {
        expect((err as Error).message).toEqual(
          'Non-whitespace before first tag.\nLine: 0\nColumn: 1\nChar: F',
        );
      }
    });
  });

  describe('in stream mode', () => {
    test('should work with cleanicons', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();
      const [contentStream1, contentResult1] = StreamTest.toChunks();

      svgicons2svgfont(join('fixtures', 'icons', 'cleanicons', '*.svg'), {
        fontName: 'cleanicons',
        startUnicode: 0xe001,
      }).pipe(stream);

      const files = await result;

      expect(files.length).toEqual(1);
      expect(files[0].isStream()).toEqual(true);

      (files[0].contents as Readable).pipe(contentStream1);

      expect(Buffer.concat(await contentResult1).toString()).toEqual(
        await readFile(
          join('fixtures', 'expected', 'test-cleanicons-font.svg'),
          'utf-8',
        ),
      );
    });

    test('should work with the metadataProvider option', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();
      const [contentStream1, contentResult1] = StreamTest.toChunks();

      svgicons2svgfont(join('fixtures', 'icons', 'cleanicons', '*.svg'), {
        fontName: 'cleanicons',
        metadataProvider: getMetadataService({
          startUnicode: 0xe001,
        }),
      }).pipe(stream);

      const files = await result;

      expect(files.length).toEqual(1);
      expect(files[0].isStream()).toEqual(true);

      (files[0].contents as Readable).pipe(contentStream1);

      expect(Buffer.concat(await contentResult1).toString()).toEqual(
        await readFile(
          join('fixtures', 'expected', 'test-cleanicons-font.svg'),
          'utf-8',
        ),
      );
    });

    test('should work with prefixedicons', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();
      const [contentStream1, contentResult1] = StreamTest.toChunks();

      svgicons2svgfont(join('fixtures', 'icons', 'prefixedicons', '*.svg'), {
        fontName: 'prefixedicons',
        startUnicode: 0xe001,
      }).pipe(stream);

      const files = await result;

      expect(files.length).toEqual(1);
      expect(files[0].isStream()).toEqual(true);

      (files[0].contents as Readable).pipe(contentStream1);

      expect(Buffer.concat(await contentResult1).toString()).toEqual(
        await readFile(
          join('fixtures', 'expected', 'test-prefixedicons-font.svg'),
          'utf-8',
        ),
      );
    });

    test('should work with originalicons', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();
      const [contentStream1, contentResult1] = StreamTest.toChunks();

      svgicons2svgfont(join('fixtures', 'icons', 'originalicons', '*.svg'), {
        fontName: 'originalicons',
      }).pipe(stream);

      const files = await result;

      expect(files.length).toEqual(1);
      expect(files[0].isStream()).toEqual(true);

      (files[0].contents as Readable).pipe(contentStream1);

      expect(Buffer.concat(await contentResult1).toString()).toEqual(
        await readFile(
          join('fixtures', 'expected', 'test-originalicons-font.svg'),
          'utf-8',
        ),
      );
    });

    describe('more', () => {
      beforeEach(async () => {
        await new Promise((resolve, reject) =>
          gulp
            .src(join('fixtures', 'icons', 'unprefixedicons', '*.svg'))
            .pipe(gulp.dest(join('fixtures', 'results', 'unprefixedicons')))
            .on('error', reject)
            .on('end', resolve),
        );
      });

      test('should work with unprefixed icons and the prependUnicode option', async () => {
        const [stream, result] = StreamTest.toObjects<Vinyl>();
        const [contentStream1, contentResult1] = StreamTest.toChunks();

        svgicons2svgfont(
          join('fixtures', 'results', 'unprefixedicons', '*.svg'),
          {
            fontName: 'unprefixedicons',
            prependUnicode: true,
          },
        ).pipe(stream);

        const files = await result;

        expect(files.length).toEqual(1);
        expect(files[0].isStream()).toEqual(true);

        (files[0].contents as Readable).pipe(contentStream1);

        expect(Buffer.concat(await contentResult1).toString()).toEqual(
          await readFile(
            join('fixtures', 'expected', 'test-unprefixedicons-font.svg'),
            'utf-8',
          ),
        );

        const expectedRenames = {
          'arrow-down.svg': 'uEA01-arrow-down.svg',
          'arrow-left.svg': 'uEA02-arrow-left.svg',
          'arrow-right.svg': 'uEA03-arrow-right.svg',
          'arrow-up.svg': 'uEA04-arrow-up.svg',
        };

        for (const oldFile of Object.keys(expectedRenames)) {
          const newFile = expectedRenames[oldFile];
          const newFilePath = join(
            'fixtures',
            'results',
            'unprefixedicons',
            newFile,
          );

          expect(await readFile(newFilePath)).toBeTruthy();
          expect(
            await readFile(
              join('fixtures', 'results', 'unprefixedicons', newFile),
              'utf8',
            ),
          ).toEqual(
            await readFile(
              join('fixtures', 'icons', 'unprefixedicons', oldFile),
              'utf8',
            ),
          );
        }
      });
    });

    describe('more2', () => {
      beforeEach(async () => {
        await new Promise((resolve, reject) =>
          gulp
            .src(join('fixtures', 'icons', 'unicons', '*.svg'))
            .pipe(gulp.dest(join('fixtures', 'results', 'unicons')))
            .on('error', reject)
            .on('end', resolve),
        );
      });

      test('should work with mixed icons and the prependUnicode option', async () => {
        const [stream, result] = StreamTest.toObjects<Vinyl>();
        const [contentStream1, contentResult1] = StreamTest.toChunks();

        svgicons2svgfont(join('fixtures', 'results', 'unicons', '*.svg'), {
          fontName: 'unicons',
          prependUnicode: true,
        }).pipe(stream);

        const files = await result;

        expect(files.length).toEqual(1);
        expect(files[0].isStream()).toEqual(true);

        (files[0].contents as Readable).pipe(contentStream1);

        expect(Buffer.concat(await contentResult1).toString()).toEqual(
          await readFile(
            join('fixtures', 'expected', 'test-unicons-font.svg'),
            'utf-8',
          ),
        );

        const expectedRenames = {
          'uEA01-twitter.svg': 'uEA01-twitter.svg',
          'facebook.svg': 'uEA02-facebook.svg',
        };

        for (const oldFile of Object.keys(expectedRenames)) {
          const newFile = expectedRenames[oldFile];
          const newFilePath = join(
            'fixtures',
            'results',
            'unicons',
            newFile,
          );

          expect(await readFile(newFilePath)).toBeTruthy();
          expect(
            await readFile(
              join('fixtures', 'results', 'unicons', newFile),
              'utf8',
            ),
          ).toEqual(
            await readFile(
              join('fixtures', 'icons', 'unicons', oldFile),
              'utf8',
            ),
          );
        }
      });
    });

    test('should emit an event with the codepoint mapping', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();
      const [contentStream1, contentResult1] = StreamTest.toChunks();

      let codepoints;

      svgicons2svgfont(join('fixtures', 'icons', 'cleanicons', '*.svg'), {
        fontName: 'cleanicons',
        startUnicode: 0xe001,
      })
        .on('glyphs', (c) => {
          codepoints = c;
        })
        .pipe(stream);

      const files = await result;

      expect(files.length).toEqual(1);
      expect(files[0].isStream()).toEqual(true);

      (files[0].contents as Readable).pipe(contentStream1);

      expect(Buffer.concat(await contentResult1).toString()).toEqual(
        await readFile(
          join('fixtures', 'expected', 'test-cleanicons-font.svg'),
          'utf-8',
        ),
      );

      expect(codepoints).toEqual(
        JSON.parse(
          (
            await readFile(join('fixtures', 'expected', 'test-codepoints.json'))
          ).toString(),
        ),
      );
    });

    test('should support filename change', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();
      const [contentStream1, contentResult1] = StreamTest.toChunks();

      svgicons2svgfont(join('fixtures', 'icons', 'cleanicons', '*.svg'), {
        fontName: 'cleanicons',
        fileName: 'newName',
        startUnicode: 0xe001,
      }).pipe(stream);

      const files = await result;

      expect(files.length).toEqual(1);
      expect(files[0].isStream()).toEqual(true);
      expect(files[0].path).toContain('newName.svg');

      (files[0].contents as Readable).pipe(contentStream1);

      expect(Buffer.concat(await contentResult1).toString()).toEqual(
        await readFile(
          join('fixtures', 'expected', 'test-cleanicons-font.svg'),
          'utf-8',
        ),
      );
    });
  });

  describe('must throw error', () => {
    test('when no fontname is given', () => {
      assert.throws(() => {
        svgicons2svgfont(
          ...([] as unknown as [
            string,
            {
              fontName: string;
            },
          ]),
        );
      });
    });

    test('when using old options', () => {
      assert.throws(() => {
        svgicons2svgfont(
          ...([
            {
              appendUnicode: true,
            },
          ] as unknown as [
            string,
            {
              fontName: string;
            },
          ]),
        );
      });
    });
  });
});
