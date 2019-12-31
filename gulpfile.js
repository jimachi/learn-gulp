const {
  src, dest, watch, series, parallel,
} = require('gulp');
const loadPlugins = require('gulp-load-plugins');

const $ = loadPlugins();
const pkg = require('./package.json');

const { sizes } = pkg['gulp-config'];
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync');

const server = browserSync.create();
const isProd = process.env.NODE_ENV === 'production';

function icon(done) {
  // eslint-disable-next-line no-restricted-syntax
  for (const size of sizes) {
    const width = size[0];
    const height = size[1];
    src('./tanuki.jpg')
      .pipe(
        $.imageResize({
          width: 100,
          height: 100,
          crop: true,
          uppscale: false,
        }),
      )
      .pipe($.imagemin())
      .pipe($.rename(`favicon-${width}x${height}.png`))
      .pipe(dest('./dist/images/icon'));
    done();
  }
}

function styles() {
  return src('./src/sass/main.scss')
    .pipe($.if(!isProd, $.sourcemaps.init()))
    .pipe($.sass())
    .pipe($.postcss([
      autoprefixer(),
    ]))
    .pipe($.if(!isProd, $.sourcemaps.write('.')))
    .pipe(dest('./dist/css/'));
}

function scripts() {
  return src('./src/js/*.js')
    .pipe($.if(isProd, $.sourcemaps.init()))
    .pipe($.babel())
    .pipe($.if(!isProd, $.sourcemaps.write('.')))
    .pipe(dest('./dist/js/'));
}

function lint() {
  return src('./src/js/*.js')
    .pipe($.eslint({ fix: true }))
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError())
    .pipe(dest('./src/js/'));
}

function startAppServer() {
  server.init({
    server: {
      baseDir: './dist',
    },
  });
  watch('./src/sass/*.scss', styles);
  watch('./src/**/*.scss').on('change', server.reload);
}

const serve = series(parallel(styles, series(lint, scripts)), startAppServer);

exports.icon = icon;
exports.styles = styles;
exports.scripts = scripts;
exports.lint = lint;
exports.serve = serve;
