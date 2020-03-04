import { OPMResourceManifests } from '@omnia/pm/models';

'use strict';

var gulp = require('gulp')
    , rename = require('gulp-rename')
    , injectStringReplace = require('gulp-string-replace')
    , del = require('del');


gulp.task('package-@omnia/pm', function (cb) {
    del.sync('wwwroot/packages/pm/');
    gulp.src("client/packages/pm/**")
        .pipe(gulp.dest("wwwroot/packages/pm"))
        .on('end', function () {
            let processing = 4;
            let complete = () => {
                --processing;
                if (processing === 0) {
                    cb();
                }
            }
            gulp
                .src([
                    `node_modules/@omnia/tooling-vue/internal-do-not-import-from-here/wcdefinitions.json`
                ])
                .pipe(gulp.dest('wwwroot/packages/pm/internal-do-not-import-from-here'))
                .on('end', complete)
            gulp
                .src([
                    `node_modules/@omnia/tooling-vue/internal-do-not-import-from-here/output_manifests/*_${OPMResourceManifests.FxCore}.manifest.json`
                ])
                .pipe(rename('omnia.pm.fx.manifest.json'))
                .pipe(injectStringReplace('./client/fx', './node_modules/@omnia/pm'))
                .pipe(gulp.dest('wwwroot/packages/pm/internal-do-not-import-from-here/manifests'))
                .on('end', complete)
            gulp
                .src([
                    'client/fx/**/*.d.ts'
                ])
                .pipe(gulp.dest('wwwroot/packages/pm/internal-do-not-import-from-here'))
                .on('end', complete)
            gulp
                .src([
                    'client/fx/models/**/*.js'
                ])
                .pipe(gulp.dest('wwwroot/packages/pm/internal-do-not-import-from-here/models'))
                .on('end', complete)
        });
});