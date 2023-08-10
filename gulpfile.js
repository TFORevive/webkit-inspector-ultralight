const fs = require("fs");
const gulp = require("gulp");
const concat = require("gulp-concat");
const replace = require("gulp-replace");
const svgToMiniDataURI = require("mini-svg-data-uri");
const DatauriParser = require("datauri/parser");
const datauriParser = new DatauriParser();
const { createGulpEsbuild } = require("gulp-esbuild");

gulp.task("scripts", async () => {
    const mainhtml = fs.readFileSync("inspector/Main.html").toString();
    const script_regex = /<script src="([^"]+)"><\/script>/g;
    const scripts = [...mainhtml.matchAll(script_regex)].map(match => match[1]).map(s => {
        if (s === "Protocol/LoadInspectorBackendCommands.js")
            s = "Protocol/InspectorBackendCommands.js";
        //if (s === "Base/LoadLocalizedStrings.js") // this is needed after all as it defines localize funcs themselves too
        //    s = "localizedStrings.js";
        return s;
    })
        .filter(s => s !== "WebKitAdditions/WebInspectorUI/WebInspectorUIAdditions.js")
        .map(s => "inspector/" + s);
    const gulpEsbuild = createGulpEsbuild({
        pipe: true,
    });

    return gulp.src(scripts)
        .pipe( replace(
            /\"Images\/([A-Za-z0-9\/]*)\.svg\"/g, (full, capture) => {
                //console.log(capture);
                return '"' + svgToMiniDataURI( fs.readFileSync("inspector/Images/" + capture + ".svg").toString() ) + '"';
        }) )
        .pipe( replace(
            /\"Images\/([A-Za-z0-9\/]*)\.png\"/g, (full, capture) => {
                //console.log(capture);
                return '"' + datauriParser.format( '.png', fs.readFileSync("inspector/Images/" + capture + ".png") ).content + '"';
        }) )
        .pipe( concat("main.js") )
        .pipe( replace( 'var WI = {};', 'var WI = { dontLocalizeUserInterface: true };') ) // don't bother loading localizations since they're English anyways
        .pipe( gulpEsbuild({
            minify: true,
            bundle: false,
            treeShaking: true,
            target: "safari16.4.1",
            legalComments: "none",
        }))
        .pipe( gulp.dest("dist/") );
});

gulp.task("css", () => {
    const postcss = require("gulp-postcss");
    const url = require("postcss-url");
    const cssnano = require("gulp-cssnano");

    const mainhtml = fs.readFileSync("inspector/Main.html").toString();
    const css_regex = /<link rel="stylesheet" href="([^"]+)">/g;
    const css_files = [...mainhtml.matchAll(css_regex)]
        .map(match => match[1])
        .filter(s => s !== "WebKitAdditions/WebInspectorUI/WebInspectorUIAdditions.css")
        .map(s => "inspector/" + s);

    return gulp.src(css_files)
        // NOTE: svg fragment in data uri SHOULD be supported like in chromium, but apparently isn't in webkit (hopefully in newer one it will be????)
        // https://bugs.webkit.org/show_bug.cgi?id=68089 <3
        .pipe( postcss([ url({ url: "inline", includeUriFragment: true, ignoreFragmentWarning: true }) ]) )
        .pipe( concat("main.css") )
        .pipe( cssnano() )
        .pipe( gulp.dest("dist/") );
});

gulp.task("copyImages", () => {
    // anything that couldn't be inlined...
    // TODO: there are around 5 svg images that cause the following error:
    // > Image type is svg and link contains #. Postcss-url cant handle svg fragments. SVG file fully inlined.
    // we could consider skipping their inlining and actually copy them?
    // merging this fix by ultralight could fix it though --> https://bugs.webkit.org/show_bug.cgi?id=68089
    return gulp.src([ /* nothing :D */ ])
        .pipe( gulp.dest("dist/Images/") );
});

gulp.task("copyHtml", () => {
    return gulp.src([
        "Main.html",
    ])
        .pipe( gulp.dest("dist/") );
});

gulp.task("default", gulp.parallel(["scripts", "css", "copyHtml"/*, "copyImages"*/]));
