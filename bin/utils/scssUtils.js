const colors = require('colors');
const fs = require('fs');
const thematic = require('sass-thematic');
const util = require('util');

if (process.env.NODE_ENV !== 'test') {
    var console = {};
    console.log = function(){};
}

const scssUtils = {
    getScssFileName(pathToComponent, appConfig) {
        return new Promise((resolve, reject) => {
            let newPathToStylesheet = pathToComponent.replace(appConfig.pathToComponents, appConfig.pathToStylesheets);
            let pathStringToArray = newPathToStylesheet.split('.');
            pathStringToArray[pathStringToArray.length - 1] = appConfig.stylesheetExt; // Handles if ext === 'css' or 'scss'
            resolve(pathStringToArray.join('.'));
        })
    },
    loadCssFile(filePath, appConfig) {
        return new Promise((resolve, reject) => {
            if (!filePath) {
                return reject({
                    Error: 'No path to file provided'
                })
            }

            return scssUtils.getScssFileName(filePath, appConfig)
            .then((pathToScssFile) => {
                if (!appConfig.stylesheetsFileList[pathToScssFile]) {
                    return reject({
                        Error: 'Error: SCSS file not found.'
                    });
                }
                return fs.readFile(pathToScssFile, 'utf8', (err, data) => {
                    if (err) {
                        if (err.code === 'ENOENT') {
                            return reject({
                                Error: 'Error: SCSS file not found.'
                            });
                        } else {
                            console.log(err);
                            return reject(err);
                        }
                    }

                    resolve(data);
                })
            })
            .catch((err) => {
                console.log('An error occurred', err);
            })
        })
    },
    parseCss(input) {
        return new Promise((resolve, reject) => {
            let cssNodes = {};

            if (!input) {
                return reject({
                    Error: 'CSS file contains no content'
                })
            }

            // Remove '@import ...' statements in SCSS files:
            let cleanCss = input.replace(/\@import.*$/gm, '');

            try {
                if (cleanCss.length === 0) {
                    return reject({
                        Error: 'CSS file contains no content'
                    })
                } else {
                    cssNodes = thematic.parseASTSync({
                        data: cleanCss,
                        varsData: '',
                        varsRemoval: true,
                        template: true
                    });
                }
            } catch (e) {
                console.log('Error: An error occurred', e);
                return reject(e);
            }

            resolve(cssNodes);
        })
    },
    extractCssRules(rulesObj, appConfig) {
        return new Promise((resolve, reject) => {
            let foundClasses = [];
            let foundIds = [];
            let initNestedLevel;
            let foundNestedRules = false; // On initial load, make sure we always reset the foundNestedRules variable.
            let foundLines = {};    // line numbers that rules are found on, used for checking nesting.

            let rulesIterator = (rulesObj) => {
                if (!rulesObj) {
                    return;
                }

                return rulesObj.forEach((obj) => {
                    if (obj.type === 'class' || obj.type === 'id') {
                        let selector = obj.content[0].content;
                        let type = obj.type;

                        // check exclusions rules.
                        if (type === 'class' && appConfig.exclusions.classes.indexOf(selector) > -1) {
                            return;
                        } else if (type === 'id' && appConfig.exclusions.ids.indexOf(selector) > -1) {
                            return;
                        }

                        // Sets the initial column to track for determining whether a rule is nested.
                        if (!initNestedLevel) {
                            initNestedLevel = obj.start.column
                        }


                        if (!foundLines[obj.start.line] && obj.start.column === initNestedLevel) {
                            // non-nested
                            // console.log('non-nested');
                            foundLines[obj.start.line] = true;
                        } else if (foundLines[obj.start.line] && obj.start.column !== initNestedLevel) {
                            // non-nested
                            // This handles the case where multiple css rules are on the same line. e.g.:
                            // .SomeClassName, .someOtherClassName {}
                            // console.log('non-nested [already found]');
                        } else {
                            // nested
                            // console.log('nested!');
                            foundNestedRules = true;
                        }

                        if (obj.type === 'class') {
                            foundClasses.push(obj.content[0].content);
                        }

                        if (obj.type === 'id') {
                            foundIds.push(obj.content[0].content);
                        }

                        return;
                    }

                    if (Array.isArray(obj.content)) {
                        rulesIterator(obj.content);
                    }
                })
            }

            rulesIterator(rulesObj);

            resolve({
                foundNestedRules,
                foundIds,
                foundClasses
            })
        })
    },
    loadCssAndGetData(filePath, appConfig) {
        return new Promise((resolve, reject) => {
            scssUtils.loadCssFile(filePath, appConfig)
            .then((loadedFile) => {
                return scssUtils.parseCss(loadedFile)
            })
            .then((parsedRulesObj) => {
                return scssUtils.extractCssRules(parsedRulesObj, appConfig)
            })
            .then((extractedRules) => {
                resolve(extractedRules)
            })
            .catch((err) => {
                reject(err);
            })
        })
    }
}

module.exports = scssUtils;
