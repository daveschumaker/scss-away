let assert = require('assert');
const appUtils = require('../bin/utils/appUtils.js');
let htmlUtils = require('../bin/utils/htmlUtils.js');

let html = `
    <div className="someRandomClassName anotherClass" id="someRandomId">
        <h1 className="title-bar">
            THIS IS A FAKE TEST COMPONENT
        </h1>
    </div>
`;

describe('htmlUtils', () => {
    describe('extractClassNames()', () => {
        it('should find all classes in component', () => {
            return htmlUtils.extractClassNames(html, appUtils.getConfig())
            .then((foundClasses) => {
                assert.equal('someRandomClassName', foundClasses[0]);
                assert.equal('anotherClass', foundClasses[1]);
                assert.equal('title-bar', foundClasses[2]);
                assert.equal(-1, foundClasses.indexOf('this-class-does-not-exist'));
            })
        });
    });

    describe('extractIds()', () => {
        it('should find all ids in component', () => {
            return htmlUtils.extractIds(html, appUtils.getConfig())
            .then((foundIds) => {
                assert.equal('someRandomId', foundIds[0]);
                assert.equal(-1, foundIds.indexOf('this-id-does-not-exist'));
            })
        });
    });

    describe('loadHtml()', () => {
        it('should return error when file is not found', () => {
            let filePath = __dirname + '/mockData/fileDoesNotExist.js';

            return htmlUtils.loadHtml(filePath)
            .catch((err) => {
                assert.equal('Error: File not found', err.Error);
            })
        });

        it('should return error when file path is not provided', () => {
            return htmlUtils.loadHtml()
            .catch((err) => {
                assert.equal('Error: Provide an absolute path to a file.', err.Error);
            })
        });

        it('should import contents of file and extract classes and ids', () => {
            let filePath = __dirname + '/mockData/myComponent.js';

            return htmlUtils.loadHtml(filePath, appUtils.getConfig())
            .then((fileResults) => {
                assert.equal('someRandomClassName', fileResults.foundClasses[0]);
                assert.equal('anotherClass', fileResults.foundClasses[1]);
                assert.equal('title-bar', fileResults.foundClasses[2]);
                assert.equal('random-content', fileResults.foundClasses[3]);
                assert.equal('SomeClass', fileResults.foundClasses[4]);
                assert.equal('SomeOtherClass', fileResults.foundClasses[5]);
                assert.equal(-1, fileResults.foundClasses.indexOf('this-class-does-not-exist'));

                assert.equal('someRandomId', fileResults.foundIds[0]);
                assert.equal(-1, fileResults.foundIds.indexOf('this-id-does-not-exist'));
            })
        });
    });
});
