const assert = require('assert');

describe.only('appUtils', () => {
    describe('updateExlusions()', () => {
        it('should not find exclusions file if none exists', () => {
            const appUtils = require('../bin/utils/appUtils.js');

            let foundExclusionsFile = appUtils.updateExlusions();
            assert.equal(undefined, foundExclusionsFile);
        })
    })
});
