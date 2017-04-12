process.env.NODE_ENV = 'running';
const assert = require('assert');
const colors = require('colors');
const isEqual = require('lodash.isequal');

// Since we store a number of config variables inside appUtils,
// this removes the module at the beginning of each test so we
// can reset things.
// TODO: Probably should improve how we handle storing these config options.
var resetRequireCache = function() {
    delete require.cache[require.resolve('../bin/utils/appUtils.js')];
}

describe('appUtils', () => {
    describe('updateExlusions()', () => {
        it('should not find exclusions file if none exists', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            const foundExclusionsFile = appUtils.updateExlusions();

            assert.equal(undefined, foundExclusionsFile);
        });

        it('should find exclusions file if it exists', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            const linkToExclusionsFile = __dirname + '/mockData/scss-away.exclude.js';
            const foundExclusionsFile = appUtils.updateExlusions(linkToExclusionsFile);

            assert.equal(1, foundExclusionsFile.classes.length);
            assert.equal(1, foundExclusionsFile.ids.length);
        });
    })

    describe('addToFileList()', () => {
        it('should add components to internal file object', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            const testFile1 = 'file1.js';
            const testFile2 = 'file2.js';

            assert.equal(undefined, appUtils.getConfig().componentsFileList[testFile1]);
            appUtils.addToFileList('component', testFile1);
            assert.equal(true, appUtils.getConfig().componentsFileList[testFile1]);

            assert.equal(undefined, appUtils.getConfig().componentsFileList[testFile2]);
            appUtils.addToFileList('component', testFile2);
            assert.equal(true, appUtils.getConfig().componentsFileList[testFile2]);
        });

        it('should add stylesheets to internal file object', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            const testFile1 = 'file1.scss';
            const testFile2 = 'file2.scss';

            assert.equal(undefined, appUtils.getConfig().stylesheetsFileList[testFile1]);
            appUtils.addToFileList('stylesheet', testFile1);
            assert.equal(true, appUtils.getConfig().stylesheetsFileList[testFile1]);

            assert.equal(undefined, appUtils.getConfig().stylesheetsFileList[testFile2]);
            appUtils.addToFileList('stylesheet', testFile2);
            assert.equal(true, appUtils.getConfig().stylesheetsFileList[testFile2]);
        });
    })

    describe('updateComponentPath()', () => {
        it('should update path for components', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            const testPath = '/path/to/components/';

            assert.equal(null, appUtils.getConfig().pathToComponents);
            appUtils.updateComponentPath(testPath);
            assert.equal(null, appUtils.getConfig().pathToStylesheets);
            assert.equal(testPath, appUtils.getConfig().pathToComponents);
        });
    });

    describe('updateStyleSheetPath()', () => {
        it('should update path for stylesheets', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            const testPath = '/path/to/stylesheets/';

            assert.equal(null, appUtils.getConfig().pathToStylesheets);
            appUtils.updateStyleSheetPath(testPath);
            assert.equal(null, appUtils.getConfig().pathToComponents);
            assert.equal(testPath, appUtils.getConfig().pathToStylesheets);
        });
    });

    describe('updateStyleSheetExt()', () => {
        it('should update stylesheet extension', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            const testExt = 'css';

            assert.equal('scss', appUtils.getConfig().stylesheetExt);
            appUtils.updateStyleSheetExt(testExt);
            assert.equal('css', appUtils.getConfig().stylesheetExt);
        });
    });

    describe('getConfig()', () => {
        it('should get initial config object', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            const initConfig = {
                exclusions: {
                    ids: [],
                    classes: [],
                    files: []
                },
                pathToComponents: null,
                pathToStylesheets: null,
                stylesheetExt: 'scss',
                componentsFileList: {},
                stylesheetsFileList: {},

                stats: {
                    scssFilesFound: 0,
                    jsFilesWithErrors: 0,
                    scssFilesWithErrors: 0,
                    totalErrors: 0
                }
            }

            assert.equal(true, isEqual(initConfig, appUtils.getConfig()));
        });

        it('should show updated config object', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            const initConfig = {
                exclusions: {
                    ids: [],
                    classes: [],
                    files: []
                },
                pathToComponents: null,
                pathToStylesheets: null,
                stylesheetExt: 'scss',
                componentsFileList: {},
                stylesheetsFileList: {},

                stats: {
                    scssFilesFound: 0,
                    jsFilesWithErrors: 0,
                    scssFilesWithErrors: 0,
                    totalErrors: 0
                }
            }

            const updatedConfig = {
                exclusions: {
                    ids: [],
                    classes: [],
                    files: []
                },
                pathToComponents: '/path/to/components/',
                pathToStylesheets: '/path/to/stylesheets/',
                stylesheetExt: 'css',
                componentsFileList: {},
                stylesheetsFileList: {},

                stats: {
                    scssFilesFound: 0,
                    jsFilesWithErrors: 0,
                    scssFilesWithErrors: 0,
                    totalErrors: 0
                }
            }

            const testPathToComponents = '/path/to/components/';
            const testPathToStylesheets = '/path/to/stylesheets/';

            assert.equal(true, isEqual(initConfig, appUtils.getConfig()));
            appUtils.updateComponentPath(testPathToComponents);
            appUtils.updateStyleSheetPath(testPathToStylesheets);
            appUtils.updateStyleSheetExt('css');
            assert.equal(true, isEqual(updatedConfig, appUtils.getConfig()));
        });
    });

    describe('validatePath()', () => {
        it('should return nothing if no path provided', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');

            assert.equal(undefined, appUtils.validatePath());
        });

        it('should return path if provided', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            let testPath = 'path/to/component/';

            assert.equal(testPath, appUtils.validatePath(testPath));
        });

        it('should add trailing slash to path if not provided', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            const testPath = 'path/to/component';
            const matchPath = 'path/to/component/';

            assert.equal(matchPath, appUtils.validatePath(testPath));
        });
    });

    describe('getStats()', () => {
        it('should return the stats object', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            const matchStats = {
                scssFilesFound: 0,
                jsFilesWithErrors: 0,
                scssFilesWithErrors: 0,
                totalErrors: 0
            }

            assert.equal(true, isEqual(appUtils.getStats(), matchStats));
        });
    });

    describe('updateStats()', () => {
        it('should update app stats and return correct values', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            const matchStats = {
                scssFilesFound: 2,
                jsFilesWithErrors: 0,
                scssFilesWithErrors: 1,
                totalErrors: 0
            }

            appUtils.updateStats('scssFilesFound');
            appUtils.updateStats('scssFilesFound');
            appUtils.updateStats('scssFilesWithErrors');
            assert.equal(true, isEqual(appUtils.getStats(), matchStats));
        });
    });

    describe('getFileList()', () => {
        it('should handle error when folder does not exist', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            const pathToComponents = __dirname + '/folderDoesNotExist/';
            const listOfFiles = appUtils.getFileList('components', pathToComponents);
            assert.equal('Error - Folder not found:', listOfFiles);
        })

        it('should get all components found in a path', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            const pathToComponents = __dirname + '/mockData/';
            const file1 = pathToComponents + 'myComponent.js';
            const file2 = pathToComponents + 'myComponentTwo.js';
            const file3 = pathToComponents + 'componentDoesNotExist.js';

            appUtils.updateComponentPath(pathToComponents);
            const listOfFiles = appUtils.getFileList('components', appUtils.getConfig().pathToComponents);

            assert.equal(2, listOfFiles.length);
            assert.equal(file1, listOfFiles[0]);
            assert.equal(file2, listOfFiles[1]);
            assert.equal(-1, listOfFiles.indexOf(file3));

            assert.equal(true, appUtils.getConfig().componentsFileList[file1]);
            assert.equal(true, appUtils.getConfig().componentsFileList[file2]);
            assert.equal(undefined, appUtils.getConfig().componentsFileList[file3]);
        });

        it('should get all stylesheets found in a path', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            const pathToStylesheets = __dirname + '/mockData/';
            const scssFile1 = pathToStylesheets + 'myComponent.scss';
            const scssFile2 = pathToStylesheets + 'stylesheets/myComponentTwo.scss';
            const scssFile3 = pathToStylesheets + 'stylesheetsDoesNotExist.js';

            appUtils.updateStyleSheetPath(pathToStylesheets);
            const listOfFiles = appUtils.getFileList('stylesheets', appUtils.getConfig().pathToStylesheets);

            assert.equal(2, listOfFiles.length);
            assert.equal(scssFile1, listOfFiles[0]);
            assert.equal(scssFile2, listOfFiles[1]);
            assert.equal(-1, listOfFiles.indexOf(scssFile3));

            assert.equal(true, appUtils.getConfig().stylesheetsFileList[scssFile1]);
            assert.equal(true, appUtils.getConfig().stylesheetsFileList[scssFile2]);
            assert.equal(undefined, appUtils.getConfig().stylesheetsFileList[scssFile3]);
        });
    });

    describe('analyzeCss()', () => {
        it('should handle error if no file path is provided', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');

            return appUtils.analyzeCss()
            .catch((err) => {
                assert.equal('No path to file provided', err.Error);
            })
        });

        it('should silently handle error if file is not found', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            let pathToFile = '/path/does/not/exist/styelsheet.js';

            return appUtils.analyzeCss(pathToFile)
            .then((result) => {
                assert.equal(true, result);
            })
        });

        it('should recognize file is in exclusions list', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            let filePath = 'thisFileIsExcluded.js';
            let exclusionsFile = __dirname + '/mockData/scss-away.exclude.js';

            appUtils.updateExlusions(exclusionsFile);

            return appUtils.analyzeCss(filePath)
            .then((result) => {
                assert.equal(true, result);
            })
        });

        it('successfully parse css results for a given component', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            const pathToComponents = __dirname + '/mockData/';
            appUtils.updateComponentPath(pathToComponents);
            appUtils.updateStyleSheetPath(pathToComponents);
            let fileList = appUtils.getFileList('components', appUtils.getConfig().pathToComponents);
            appUtils.getFileList('stylesheets', appUtils.getConfig().pathToStylesheets);

            const matchCssOutput = [
                `${pathToComponents}myComponent.scss`.yellow,
                '[Warning] Found nested SCSS.'.yellow,
                '[Error] Orphan Classes:'.red,
                '  .selectorHasNestedRules'.red,
                '  .nested-property'.red,
                '  .second-nested-property'.red,
                '  .wutwut'.red,
                'Orphan Ids:'.red,
                '  #randomIdDoesNotExistInHtml'.red,
                '  #nestedRandomIdDoesNotExist'.red
            ]

            const matchHtmlOutput =  [
                `${pathToComponents}myComponent.js`.yellow,
                '[Error] Orphan Classes:'.red,
                '  .anotherClass'.red,
                '  .title-bar'.red,
                '[OK] All ids found'.green
            ];

            return appUtils.analyzeCss(fileList[0])
            .then((result) => {
                let cssOutput = result.analyzeCssOutput;
                let htmlOutput = result.analyzeHtmlOutput;

                assert.equal(true, isEqual(cssOutput, matchCssOutput));
                assert.equal(true, isEqual(htmlOutput, matchHtmlOutput));
            })
            .catch((err) => {
                console.log('err', err);
                assert.fail(err);
            })
        });


    });
});
