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
                if (file.split('.')[1] === 'jsx' || file.split('.')[1] === 'js') {
                    filelist.push(dir + file);
                }
            }
        });

        return filelist;
    },
    analyzeCss(filePath) {
        return new Promise((resolve, reject) => {
            let foundNestedRules = false;
            let htmlAttribs = {};
            let missingClasses = {};
            let missingIds = {};
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
                return appUtils.checkClassNamesExist(scssSelectors, htmlAttribs)
            }).then((verifyClassesObj) => {
                missingClasses = verifyClassesObj;
                return appUtils.checkIdsExist(scssSelectors, htmlAttribs);
            }).then((verifyIdsObj) => {
                missingIds = verifyIdsObj;
                return appUtils.analyzeHtml({
                    htmlAttribs,
                    scssSelectors,
                    filePath
                })
            }).then(() => {
                appUtils.displayOutput({
                    type: 'css',
                    foundNestedRules,
                    missingClasses,
                    missingIds
                }, scssPath);

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
    },
    analyzeHtml(contentToAnalyze) {
        return new Promise((resolve, reject) => {
            let htmlAttribs = contentToAnalyze.htmlAttribs;
            let scssSelectors = contentToAnalyze.scssSelectors;
            let missingClasses = {};
            let missingIds = {};

            return appUtils.checkClassNamesExist(htmlAttribs, scssSelectors)
            .then((verifyClassesObj) => {
                missingClasses = verifyClassesObj;
                return appUtils.checkIdsExist(htmlAttribs, scssSelectors)
            })
            .then((verifyIdsObj) => {
                missingIds = verifyIdsObj;

                appUtils.displayOutput({
                    type: 'html',
                    missingClasses,
                    missingIds
                }, contentToAnalyze.filePath);

                return resolve(true);
            })
            .catch((err) => {
                console.log('Error in analyzeHtml', err);
                return resolve(true);
            })
        })
    },
    checkClassNamesExist(masterObj, compareObj) {
        return new Promise((resolve, reject) => {
            let missingClasses = [];

            if (masterObj.foundClasses.length === 0) {
                return resolve({
                    noClassesFound: true,
                    classes: missingClasses
                });
            }

            masterObj.foundClasses.forEach((cssClassName) => {
                let classNameWasFound = false;
                compareObj.foundClasses.find((htmlClassName) => {
                    if (htmlClassName === cssClassName) {
                        classNameWasFound = true;
                    }
                })

                if (!classNameWasFound) {
                    missingClasses.push(cssClassName);
                }
            })

            return resolve({
                noClassesFound: false,
                classes: missingClasses
            });
        })
    },
    checkIdsExist(masterObj, compareObj) {
        return new Promise((resolve, reject) => {
            let missingIds = [];

            if (masterObj.foundIds.length === 0) {
                return resolve({
                    noIdsFound: true,
                    ids: missingIds
                });
            }

            masterObj.foundIds.forEach((cssId) => {
                let idWasFound = false;
                compareObj.foundIds.find((htmlId) => {
                    if (htmlId === cssId) {
                        idWasFound = true;
                    }
                })

                if (!idWasFound) {
                    missingIds.push(cssId);
                }
            })

            return resolve({
                noIdsFound: false,
                ids: missingIds
            });
        })
    },
    displayOutput(rulesObj, filePath) {
        let foundNestedRules = rulesObj.type === 'css' ? rulesObj.foundNestedRules : false;
        let noClassesFound = rulesObj.missingClasses.noClassesFound;
        let noIdsFound = rulesObj.missingIds.noIdsFound;
        let missingClasses = rulesObj.missingClasses.classes;
        let missingIds = rulesObj.missingIds.ids;

        if ((missingClasses.length === 0 && missingIds.length === 0 && !foundNestedRules) ||
            (missingClasses.length === 0 && noIdsFound && !foundNestedRules)
        ) {
            // For now, hide output for optimized files.
            // console.log(`\n${filePath}`.yellow);
            // console.log('[OK] All classes and ids found'.green);
            return;
        } else {
            console.log(`\n${filePath}`.yellow);
        }

        if (rulesObj.type === 'css' && (foundNestedRules || missingClasses.length > 0 || missingIds.length > 0)) {
            appStats.updateStats('scssFilesWithErrors');
        } else if (rulesObj.type === 'html' && (missingClasses.length > 0 || missingIds.length > 0)) {
            appStats.updateStats('jsFilesWithErrors');
        }

        if (rulesObj.type === 'css' && foundNestedRules) {
            console.log('[Warning] Found nested SCSS.'.yellow);
        }

        if (missingClasses.length > 0) {
            console.log('[Error] Orphan Classes:'.red);
            missingClasses.forEach((className) => {
                console.log(`  .${className}`.red);
            });
        } else if (!noClassesFound) {
            // Hide output when no classes were found in the HTML / SCSS file.
            console.log('[OK] All classes found'.green);
        }

        if (missingIds && missingIds.length > 0) {
            console.log('Orphan Ids:'.red);
            missingIds.forEach((missingId) => {
                console.log(`  #${missingId}`.red);
            });
        } else if (!noIdsFound) {
            // Hide output when no ids were found in the HTML / SCSS file.
            console.log('[OK] All ids found'.green);
        }
    }
};

module.exports = appUtils;
