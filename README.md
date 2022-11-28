WebKit inspector from Ultralight. Bundling scripts that are meant to bundle this thing into a single js and css file rather than shipping 1000+ files.

## Building

If you want to update the bundled inspector in `dist/`, just do `npm install`, `npm install --global gulp-cli` and then run `gulp`. The contents of `dist/` folder go into `./package/Data/inspector` folder on the package repo.
