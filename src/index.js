'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
// @ts-ignore
var svgicons2svgfont_1 = __importDefault(require("svgicons2svgfont"));
// @ts-ignore
var iconsdir_1 = __importDefault(require("svgicons2svgfont/src/iconsdir"));
// @ts-ignore
var metadata_1 = __importDefault(require("svgicons2svgfont/src/metadata"));
var fancy_log_1 = __importDefault(require("fancy-log"));
var glob_1 = __importDefault(require("glob"));
var plugin_error_1 = __importDefault(require("plugin-error"));
var readable_stream_1 = __importDefault(require("readable-stream"));
var vinyl_1 = __importDefault(require("vinyl"));
var svgicons2svgfont = function (globs, options) {
    // const inputStream = new Stream.Transform({ objectMode: true })
    var resultStream = new readable_stream_1.default.Readable({ objectMode: true });
    options.startUnicode = options.startUnicode || 0xea01;
    options.prependUnicode = !!options.prependUnicode;
    options.fileName = options.fileName || options.fontName;
    if (options.appendUnicode) {
        throw new plugin_error_1.default('svgicons2svgfont', 'The "appendUnicode" option was renamed to "prependUnicode".' +
            ' See https://github.com/nfroidure/gulp-svgicons2svgfont/issues/33');
    }
    if (!options.fontName) {
        throw new plugin_error_1.default('svgicons2svgfont', 'Missing options.fontName');
    }
    options.log =
        options.log ||
            function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                fancy_log_1.default.apply(void 0, ['gulp-svgicons2svgfont:'].concat(args));
            };
    // Emit event containing codepoint mapping
    options.callback = function (glyphs) {
        resultStream.emit('glyphs', glyphs.map(function (glyph) {
            var finalGlyph = {
                name: glyph.name,
                unicode: glyph.unicode,
            };
            if (glyph.color) {
                finalGlyph.color = glyph.color;
            }
            return finalGlyph;
        }));
    };
    options.error =
        options.error ||
            function (error) {
                this.emit('error', new plugin_error_1.default('svgicons2svgfont', error));
            };
    options.metadataProvider =
        options.metadataProvider ||
            metadata_1.default({
                startUnicode: options.startUnicode,
                prependUnicode: options.prependUnicode,
            });
    var globsArray = 'string' == typeof globs ? [globs] : globs;
    var fontStream = new iconsdir_1.default([].concat.apply([], globsArray.map(function (g) { return glob_1.default.sync(g); })), options).pipe(new svgicons2svgfont_1.default(options));
    var fontVinyl = new vinyl_1.default({
        contents: fontStream,
    });
    resultStream.push(fontVinyl);
    resultStream.push(null);
    return resultStream;
};
module.exports = svgicons2svgfont;
