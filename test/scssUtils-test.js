process.env.NODE_ENV = 'test';
const assert = require('assert');
const scssUtils = require('../bin/utils/scssUtils.js');

var resetRequireCache = function() {
    delete require.cache[require.resolve('../bin/utils/appUtils.js')];
}

const scssWithNoNesting = `
    @import '_includes.scss';

    .SomeClass {
        font-size: 42px;
    }

    #SomeId {
        font-size: 42px;
    }

    .multiRulesOnOneLine-one, .multiRulesOnOneLine-two {
        font-size: 42px;
    }
`;

const scssWithNestedRules = `
.SomeClass {
    font-size: 42px;
}

.someClassWithNestedRules {
    font-size: 42px;
    .nestedClass-one {
        font-size: 42px;
    }
    .nestedClass-two {
        font-size: 42px;
    }
}
`;

describe('scssUtils', () => {
    describe('parseCss()', () => {
        it('should properly parse css', () => {
            return scssUtils.parseCss(scssWithNoNesting)
            .then((result) => {
                assert.equal('stylesheet', result.type);
            })
        });

        it('should handle css with no content', () => {
            return scssUtils.parseCss()
            .catch((err) => {
                assert.equal('CSS file contains no content', err.Error);
            })
        });

        it('should handle empty css', () => {
            const scssWithOnlyImport = `@import 'some_file.scss';`

            return scssUtils.parseCss(scssWithOnlyImport)
            .catch((err) => {
                assert.equal('CSS file contains no content', err.Error);
            })

            scssUtils.parseCss('')
            .catch((err) => {
                assert.equal('CSS file contains no content', err.Error);
            })

            scssUtils.parseCss()
            .catch((err) => {
                assert.equal('CSS file contains no content', err.Error);
            })
        });
    });

    describe('extractCssRules()', () => {
        it('should handle error when no rules are provided', () => {
            return scssUtils.extractCssRules()
            .catch((err) => {
                assert.equal(undefined, err);
            })
        });

        it('should find all classes and ids in scss file', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');

            return scssUtils.parseCss(scssWithNoNesting)
            .then((parsedRulesObj) => {
                return scssUtils.extractCssRules(parsedRulesObj, appUtils.getConfig())
            })
            .then((extractedRules) => {
                assert.equal(false, extractedRules.foundNestedRules);

                assert.equal('SomeClass', extractedRules.foundClasses[0]);
                assert.equal('multiRulesOnOneLine-one', extractedRules.foundClasses[1]);
                assert.equal('multiRulesOnOneLine-two', extractedRules.foundClasses[2]);
                assert.equal(-1, extractedRules.foundClasses.indexOf('this-class-does-not-exist'));

                assert.equal('SomeId', extractedRules.foundIds[0]);
                assert.equal(-1, extractedRules.foundIds.indexOf('this-id-does-not-exist'));
            })
            .catch((err) => {
                console.log(err);
            })
        });

        it('should not find nested classes if none exist', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');

            return scssUtils.parseCss(scssWithNoNesting)
            .then((parsedRulesObj) => {
                return scssUtils.extractCssRules(parsedRulesObj, appUtils.getConfig())
            })
            .then((extractedRules) => {
                assert.equal(false, extractedRules.foundNestedRules);
            })
            .catch((err) => {
                console.log(err);
            })
        });

        it('should find nested classes if they exist', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');

            return scssUtils.parseCss(scssWithNestedRules)
            .then((parsedRulesObj) => {
                return scssUtils.extractCssRules(parsedRulesObj, appUtils.getConfig())
            })
            .then((extractedRules) => {
                assert.equal(true, extractedRules.foundNestedRules);
            })
            .catch((err) => {
                console.log(err);
            })
        });
    })

    describe('getScssFileName()', () => {
        it('should automatically generate path to scss file', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            const pathToHmlComponent = '/path/to/project/component.js';

            appUtils.updateComponentPath('/path/to/project/');
            appUtils.updateStyleSheetPath('/path/to/project/');

            return scssUtils.getScssFileName(pathToHmlComponent, appUtils.getConfig())
            .then((pathToScssFile) => {
                assert.equal('/path/to/project/component.scss', pathToScssFile);
            })
        })
    })

    describe('loadCssFile()', () => {
        it('should load scss file', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            const filePath = __dirname + '/mockData/myComponent.js';
            const stylesheetPath = __dirname + '/mockData/myComponent.scss';

            appUtils.addToFileList('component', filePath);
            appUtils.addToFileList('stylesheet', stylesheetPath);
            appUtils.updateComponentPath(__dirname + '/mockData/');
            appUtils.updateStyleSheetPath(__dirname + '/mockData/');

            return scssUtils.loadCssFile(filePath, appUtils.getConfig())
            .then((result) => {
                assert.equal(true, result.length > 0);
            })
        })

        it('should handle error when css file not provided', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');

            return scssUtils.loadCssFile()
            .catch((err) => {
                assert.equal('No path to file provided', err.Error);
            })
        })

        it('should handle error when css file not found', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            const filePath = __dirname + '/mockData/myComponent-does-not-exist.js';

            return scssUtils.loadCssFile(filePath, appUtils.getConfig())
            .catch((err) => {
                assert.equal('Error: SCSS file not found.', err.Error);
            })
        })
    })

    describe('loadCssAndGetData()', () => {
        it('should load all rules given path to html component', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            const filePath = __dirname + '/mockData/myComponent.js';
            const stylesheetPath = __dirname + '/mockData/';

            appUtils.addToFileList('component', filePath);
            appUtils.addToFileList('stylesheet', stylesheetPath + 'myComponent.scss');
            appUtils.updateComponentPath(__dirname + '/mockData/');
            appUtils.updateStyleSheetPath(__dirname + '/mockData/');

            return scssUtils.loadCssAndGetData(filePath, appUtils.getConfig())
            .then((extractedRules) => {
                assert.equal(true, extractedRules.foundNestedRules);

                assert.equal('SomeClass', extractedRules.foundClasses[0]);
                assert.equal('SomeOtherClass', extractedRules.foundClasses[1]);
                assert.equal('someRandomClassName', extractedRules.foundClasses[2]);
                assert.equal(-1, extractedRules.foundClasses.indexOf('this-class-does-not-exist'));

                assert.equal('someRandomId', extractedRules.foundIds[0]);
                assert.equal(-1, extractedRules.foundIds.indexOf('this-id-does-not-exist'));
            })
            .catch((err) => {
                console.log('An error occurred:', err);
            })
        })

        it('should find matching stylesheets in another folder', () => {
            resetRequireCache();
            const appUtils = require('../bin/utils/appUtils.js');
            const filePath = __dirname + '/mockData/myComponentTwo.js';
            const stylesheetPath = __dirname + '/mockData/stylesheets/';

            appUtils.addToFileList('component', filePath);
            appUtils.addToFileList('stylesheet', stylesheetPath + 'myComponentTwo.scss');
            appUtils.updateComponentPath(__dirname + '/mockData/');
            appUtils.updateStyleSheetPath(__dirname + '/mockData/stylesheets');

            return scssUtils.loadCssAndGetData(filePath, appUtils.getConfig())
            .then((extractedRules) => {
                assert.equal(true, extractedRules.foundNestedRules);
                assert.equal(1, extractedRules.foundIds.length);
                assert.equal(3, extractedRules.foundClasses.length);
            })

        })
    })
});
