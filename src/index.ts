'use strict'

// @ts-ignore
import SVGIcon2SVGFontStream from 'svgicons2svgfont'
// @ts-ignore
import SVGIconsDirStream from 'svgicons2svgfont/src/iconsdir'
// @ts-ignore
import defaultMetadataProvider from 'svgicons2svgfont/src/metadata'
import log from 'fancy-log'
import glob from 'glob'
import PluginError from 'plugin-error'
import Stream, { Readable } from 'readable-stream'
import Vinyl from 'vinyl'

namespace svgicons2svgfont {
  export interface Glyph {
    name: string
    unicode: {}
    color?: string
  }

  export interface Options {
    startUnicode?: number
    prependUnicode?: boolean
    fileName?: string
    fontName: string
    log?: (msg: string) => void
    metadataProvider?: (filePath: String, cb: (error: any, metadata: any) => void) => void
    error: (this: Readable, error: string) => void
    callback: (glyphs: Glyph[]) => void
  }
}
const svgicons2svgfont = (globs: string | string[], options: svgicons2svgfont.Options) => {
  // const inputStream = new Stream.Transform({ objectMode: true })
  const resultStream = new Stream.Readable({ objectMode: true })

  options.startUnicode = options.startUnicode || 0xea01
  options.prependUnicode = !!options.prependUnicode
  options.fileName = options.fileName || options.fontName

  if ((options as any).appendUnicode) {
    throw new PluginError(
      'svgicons2svgfont',
      'The "appendUnicode" option was renamed to "prependUnicode".' +
        ' See https://github.com/nfroidure/gulp-svgicons2svgfont/issues/33',
    )
  }

  if (!options.fontName) {
    throw new PluginError('svgicons2svgfont', 'Missing options.fontName')
  }

  options.log =
    options.log ||
    function(...args) {
      log('gulp-svgicons2svgfont:', ...args)
    }

  // Emit event containing codepoint mapping
  options.callback = function(glyphs) {
    resultStream.emit(
      'glyphs',
      glyphs.map(glyph => {
        const finalGlyph: svgicons2svgfont.Glyph = {
          name: glyph.name,
          unicode: glyph.unicode,
        }

        if (glyph.color) {
          finalGlyph.color = glyph.color
        }
        return finalGlyph
      }),
    )
  }

  options.error =
    options.error ||
    function(error: string) {
      this.emit('error', new PluginError('svgicons2svgfont', error))
    }
  options.metadataProvider =
    options.metadataProvider ||
    defaultMetadataProvider({
      startUnicode: options.startUnicode,
      prependUnicode: options.prependUnicode,
    })

  const globsArray: string[] = 'string' == typeof globs ? [globs] : globs
  const fontStream = new SVGIconsDirStream(
    ([] as string[]).concat.apply([], globsArray.map(g => glob.sync(g))),
    options,
  ).pipe(new SVGIcon2SVGFontStream(options))
  const fontVinyl = new Vinyl({
    contents: fontStream,
  })
  resultStream.push(fontVinyl)
  resultStream.push(null)
  return resultStream
}
export = svgicons2svgfont
