const assert = require('assert');
const isEqual = require('lodash.isequal');

// Since we store a number of config variables inside appUtils,
// this removes the module at the beginning of each test so we
// can reset things.
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

                scssFilesFound: 0,
                jsFilesWithErrors: 0,
                scssFilesWithErrors: 0,
                totalErrors: 0
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

                scssFilesFound: 0,
                jsFilesWithErrors: 0,
                scssFilesWithErrors: 0,
                totalErrors: 0
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

                scssFilesFound: 0,
                jsFilesWithErrors: 0,
                scssFilesWithErrors: 0,
                totalErrors: 0
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
            let testPath = 'path/to/component';
            let matchPath = 'path/to/component/';

            assert.equal(matchPath, appUtils.validatePath(testPath));
        });
    });
});
