var colors = require('colors');
var fs = require('fs');
var appStats = require('./appStats.js');
var htmlUtils = require('./htmlUtils.js');
var scssUtils = require('./scssUtils.js');

var appUtils = {
    getFileList(dir, filelist) {
        // Handle instance where user forgets to provide a trailing slash on the folder name.
        let dirArray = dir.split('');
        if (dirArray[dirArray.length - 1] !== '/') {
            dirArray.push('/');
        }
        dir = dirArray.join('');

        var fs = fs || require('fs')
        var files = fs.readdirSync(dir);

        filelist = filelist || [];
        files.forEach(function(file) {
            if (fs.statSync(dir + file).isDirectory()) {
                filelist = appUtils.getFileList(dir + file + '/', filelist);
            } else {
                if (file.split('.')[1] === 'jsx') {
                    filelist.push(dir + file);
                }
            }
        });

        return filelist;
    },
    analyzeFile(filePath) {
        return new Promise((resolve, reject) => {
            let foundNestedRules = false;
            let htmlAttribs = {};
            let missingClasses = [];
            let missingIds = [];
            let scssSelectors = {};
            let scssPath;

            return scssUtils.getScssFileName(filePath)
            .then((pathToScss) => {
                scssPath = pathToScss;
                return scssUtils.loadCssAndGetData(filePath)
            })
            .then((cssResults) => {
                scssSelectors = cssResults;
                foundNestedRules = cssResults.foundNestedRules;
                return htmlUtils.loadHtml(filePath);
            }).then((htmlResults) => {
                htmlAttribs = htmlResults;
                return scssUtils.checkClassNamesExist(scssSelectors, htmlAttribs, filePath)
            }).then((classNames) => {
                missingClasses = classNames;
                return scssUtils.checkIdsExist(scssSelectors, htmlAttribs, filePath);
            }).then((ids) => {
                missingIds = ids.missingIds;

                if (!missingIds) {
                    missingIds = [];
                }

                if (!missingClasses) {
                    missingClasses = [];
                }

                if ((missingClasses.length === 0 && missingIds.length === 0 && !foundNestedRules) ||
                    (missingClasses.length === 0 && ids.noIdsFound && !foundNestedRules)
                ) {
                    // For now, hide output for optimized files.
                    // console.log(`\n${scssPath}`.yellow);
                    // console.log('[OK] All classes and ids found'.green);
                    return resolve(true);
                } else {
                    console.log(`\n${scssPath}`.yellow);
                }

                if (foundNestedRules || missingClasses.lenght > 0 || missingIds.length > 0) {
                    appStats.updateStats('scssFilesWithErrors');
                }

                if (foundNestedRules) {
                    console.log('[Warning] Found nested SCSS.'.yellow);
                }

                if (missingClasses.length > 0) {
                    console.log('[Error] Orphan Classes:'.red);
                    missingClasses.forEach((className) => {
                        console.log(`  .${className}`.red);
                    });
                } else {
                    console.log('[OK] All classes found'.green);
                }

                if (missingIds && missingIds.length > 0) {
                    console.log('Orphan Ids:'.red);
                    missingIds.forEach((missingId) => {
                        console.log(`  #${missingId}`.red);
                    });
                } else if (ids.noIdsFound) {
                    // Hide output when no ids were found in the SCSS file.
                } else {
                    // TODO: Should make sure we don't show this unless we actually found Id's
                    console.log('[OK] All ids found'.green);
                }

                return resolve(true);
            }).catch((err = {}) => {
                if (err.Error === 'Error: SCSS file not found.') {
                    // Probably hide this error since a number of components may not have associated scss files.
                    // console.log('[OK] SCSS file not found'.yellow);
                } else if (err.Error === 'CSS file contains no content') {
                    console.log(`\n${scssPath}`.yellow);
                    console.log(`[Warning] No content in scss file`.yellow);
                } else {
                    console.log(err);
                }
                return resolve(true);
            })
        })
    }
};

module.exports = appUtils;
