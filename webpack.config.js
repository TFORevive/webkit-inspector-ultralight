const path = require('path');
const MergeIntoSingleFilePlugin = require("webpack-merge-and-include-globally");
  
// webpack will spit errors, but we don't care, since we don't use bundle.js, but simply main.js from the plugin which works fine!
// especially that apparently some of the input JS files have already been ran through webpack...

module.exports = {
    mode: "none",
    //entry: [path.resolve(__dirname, './dist/main.js')],
    entry: [path.resolve(__dirname, './dist/main.css')],
    devtool: 'cheap-module-source-map',
    output: {
        filename: 'bundle.js',
        //filename: 'bundle.css',
        path: path.resolve(__dirname, './dist'),
    },
    resolve: {
        extensions: ['.js', '.css', '.png', '.svg'],
        alias: {
            Images: path.resolve(__dirname, './inspector/Images')
        }
    },
    plugins: [
        new MergeIntoSingleFilePlugin({
            files: [
                {
                    // "vendor.js": [
                    //     "node_modules/jquery/dist/jquery.min.js",
                    //     //  will work too
                    //     //  "node_modules/jquery/**/*.min.js",
                    //     "node_modules/moment/moment.js",
                    //     "node_modules/moment/locale/cs.js",
                    //     "node_modules/moment/locale/de.js",
                    //     "node_modules/moment/locale/nl.js",
                    //     "node_modules/toastr/build/toastr.min.js"
                    // ],
                    // "vendor.css": [
                    //     "node_modules/toastr/build/toastr.min.css"
                    // ]
                    src: [
                        //"inspector/**/*"
                        "inspector/CodeMirror.js",
                        "inspector/Esprima.js",
                        "inspector/Workers/Formatter/FormatterUtilities.js",
                        "inspector/Workers/Formatter/FormatterContentBuilder.js",
                        "inspector/Workers/Formatter/FormatterWorker.js",
                        "inspector/Workers/Formatter/ESTreeWalker.js",
                        "inspector/Workers/Formatter/EsprimaFormatter.js",
                        "inspector/Workers/HeapSnapshot/HeapSnapshot.js",
                        "inspector/Workers/HeapSnapshot/HeapSnapshotWorker.js",
                        "inspector/Main.js",
                        "inspector/Protocol/Legacy/7.0/InspectorBackendCommands.js",
                    ],
                    dest: "main.js",
                },
                {
                    src: [
                        "inspector/CodeMirror.css",
                        "inspector/Main.css",
                    ],
                    dest: "main.css",
                }
            ]
        }),
        plugins: [new ExtractTextWebpackPlugin("styles.css")],
    ],
    module: {
        rules: [
            {
            test: /\.svg/,
            loader:  "svg-url-loader",
            },
            {
                test: /\.(png|jpg|gif)$/i,
                loader: 'url-loader'
                  },
                  {
                    test: /\.css$/i,
                    loader: "css-loader",
                    options: {
                        url: true
                    }
                  },
                  /*{
                    test: /\.css$/,
                    use: ExtractTextWebpackPlugin.extract({
                        loader: "css-loader",
                      options: {
                        url: true
                    }
                    }),
                  },*/
        ],
      },
};