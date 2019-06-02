import Stream, { Readable } from 'readable-stream';
declare namespace svgicons2svgfont {
    interface Glyph {
        name: string;
        unicode: {};
        color?: string;
    }
    interface Options {
        startUnicode?: number;
        prependUnicode?: boolean;
        fileName?: string;
        fontName: string;
        log?: (msg: string) => void;
        metadataProvider?: (filePath: String, cb: (error: any, metadata: any) => void) => void;
        error: (this: Readable, error: string) => void;
        callback: (glyphs: Glyph[]) => void;
    }
}
declare const svgicons2svgfont: (globs: string | string[], options: svgicons2svgfont.Options) => Stream.Readable;
export = svgicons2svgfont;
