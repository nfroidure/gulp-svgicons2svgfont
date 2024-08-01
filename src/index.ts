import {
  SVGIcons2SVGFontStream,
  SVGIconsDirStream,
  getMetadataService,
  type SVGIcons2SVGFontStreamOptions,
} from 'svgicons2svgfont';
import { glob } from 'glob';
import PluginError from 'plugin-error';
import { Readable } from 'node:stream';
import Vinyl from 'vinyl';

const PLUGIN_NAME = 'gulp-svgicons2svgfont';

export interface Glyph {
  name: string;
  unicode: string[];
  color?: string;
}

export type SVGIcons2SVGFontOptions = Partial<SVGIcons2SVGFontStreamOptions> & {
  startUnicode?: number;
  prependUnicode?: boolean;
  fileName?: string;
  fontName: string;
  metadataProvider?: ReturnType<typeof getMetadataService>;
  callback?: (glyphs: Glyph[]) => void;
};

export const svgicons2svgfont = (
  globs: string | string[],
  options: SVGIcons2SVGFontOptions,
) => {
  // const inputStream = new Stream.Transform({ objectMode: true })
  const resultStream = new Readable({ objectMode: true });

  options.startUnicode = options.startUnicode || 0xea01;
  options.prependUnicode = !!options.prependUnicode;
  options.fileName = options.fileName || options.fontName;

  if ((options as unknown as { appendUnicode: boolean }).appendUnicode) {
    throw new PluginError(
      'svgicons2svgfont',
      'The "appendUnicode" option was renamed to "prependUnicode".' +
        ' See https://github.com/nfroidure/gulp-svgicons2svgfont/issues/33',
    );
  }

  if (!options.fontName) {
    throw new PluginError('svgicons2svgfont', 'Missing options.fontName');
  }

  // Emit event containing codepoint mapping
  options.callback = function (glyphs) {
    resultStream.emit(
      'glyphs',
      glyphs.map((glyph) => {
        const finalGlyph: Glyph = {
          name: glyph.name,
          unicode: glyph.unicode,
        };

        if (glyph.color) {
          finalGlyph.color = glyph.color;
        }
        return finalGlyph;
      }),
    );
  };

  options.metadataProvider =
    options.metadataProvider ||
    getMetadataService({
      startUnicode: options.startUnicode,
      prependUnicode: options.prependUnicode,
    });

  const globsArray: string[] = 'string' == typeof globs ? [globs] : globs;
  const fontStream = new SVGIconsDirStream(
    globsArray
      .map((g) => glob.sync(g))
      .reduce((acc, item) => acc.concat(item), []),
    options,
  )
    .on('error', (err: Error) => {
      resultStream.emit('error', new PluginError(PLUGIN_NAME, err));
    })
    .pipe(
      new SVGIcons2SVGFontStream(options).on('error', (err: Error) => {
        resultStream.emit('error', new PluginError(PLUGIN_NAME, err));
      }),
    );
  const fontVinyl = new Vinyl({
    contents: fontStream,
    path: `${options.fileName}.svg`,
  });

  resultStream.push(fontVinyl);
  resultStream.push(null);
  return resultStream;
};
