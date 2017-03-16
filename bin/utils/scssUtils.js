var appStats = require('./appStats.js');
var colors = require('colors');
var fs = require('fs');
var thematic = require('sass-thematic');
const util = require('util');

var scssUtils = {
    parseCss(input) {
        return new Promise((resolve, reject) => {
            var cssNodes = {};

            if (!input) {
                return reject({
                    Error: 'CSS file contains no content'
                })
            }

            // Remove '@import ...' statements in SCSS files:
            var cleanCss = input.replace(/\@import.*$/gm, '');

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
    extractCssRules(rulesObj) {
        return new Promise((resolve, reject) => {
            let foundClasses = [];
            let foundIds = [];
            let initNestedLevel;
            let foundNestedRules = false; // On initial load, make sure we always reset the foundNestedRules variable.
            let foundLines = {};    // line numbers that rules are found on, used for checking nesting.

            var rulesIterator = function(rulesObj) {
                if (!rulesObj) {
                    return;
                }

                return rulesObj.forEach((obj) => {
                    if (obj.type === 'class' || obj.type === 'id') {
                        let selector = obj.content[0].content;
                        let type = obj.type;

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
    loadCssFile(filePath) {
        return new Promise((resolve, reject) => {
            if (!filePath) {
                return reject({
                    Error: 'No path to file provided'
                })
            }

            return scssUtils.getScssFileName(filePath)
            .then((pathToScssFile) => {
                return fs.readFile(pathToScssFile, 'utf8', function(err, data) {
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

                    appStats.updateStats('scssFilesFound');
                    resolve(data);
                })
            })
            .catch((err) => {
                console.log('An error occurred', err);
            })
        })
    },
    loadCssAndGetData(filePath) {
        return new Promise((resolve, reject) => {
            scssUtils.loadCssFile(filePath)
            .then((loadedFile) => {
                return scssUtils.parseCss(loadedFile)
            })
            .then((parsedRulesObj) => {
                return scssUtils.extractCssRules(parsedRulesObj)
            })
            .then((extractedRules) => {
                resolve(extractedRules)
            })
            .catch((err) => {
                reject(err);
            })
        })
    },
    getScssFileName(pathToComponent) {
        return new Promise((resolve, reject) => {
            let pathStringToArray = pathToComponent.split('.');
            pathStringToArray[pathStringToArray.length - 1] = 'scss';
            resolve(pathStringToArray.join('.'));
        })
    }
}

module.exports = scssUtils;
