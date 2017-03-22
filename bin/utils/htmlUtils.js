const fs = require('fs');

if (process.env.NODE_ENV !== 'test') {
    var console = {};
    console.log = function(){};
}

const htmlUtils = {
    extractClassNames(input, appConfig) {
        return new Promise((resolve, reject) => {
            let foundClasses = [];

            // In React components, we often use the 'classnames' module to build an object with multiple
            // class names depending on certain criteria. We import this module as 'cx'. This loop looks
            // for the existence of 'cx({ ... })'
            let regExForCx = /cx\(([\s\S]*?)\)/g;
            let cxMatch;
            do {
                cxMatch = regExForCx.exec(input);
                if (cxMatch) {
                    let cleanCx = cxMatch[0].replace(/cx\(\{/i, '');
                    cleanCx = cleanCx.replace(/\}\)/i, '');
                    let cxProps = cleanCx.split(',');

                    cxProps.forEach((prop) => {
                        let cxClass = prop.trim();
                        let getKey = cxClass.split(':')[0];
                        getKey = getKey.replace(/\'/g, '');
                        // check for rule exclusions
                        if (appConfig.exclusions.classes.indexOf(getKey) === -1) {
                            foundClasses.push(getKey);
                        }
                    })
                }
            } while (cxMatch);

            // This looks for 'className=" ... "' found in React components.
            let regExForClassNames = /className="(.*?)"/g;
            let classNameMatch;
            do {
                classNameMatch = regExForClassNames.exec(input);
                if (classNameMatch) {
                    let cleanClasses = classNameMatch[0].replace(/className=/i, '');
                    cleanClasses = cleanClasses.replace(/"/g, '');
                    cleanClasses = cleanClasses.split(' ');
                    cleanClasses.forEach((className) => {
                        // check for rule exclusions
                        if (appConfig.exclusions.classes.indexOf(className) === -1) {
                            foundClasses.push(className);
                        }
                    });
                }
            } while (classNameMatch);

            // This looks for 'class=" ... "' found in normal HTML documents components.
            let regExForClasses = /class="(.*?)"/g;
            let classesMatch;
            do {
                classesMatch = regExForClasses.exec(input);
                if (classesMatch) {
                    let cleanClasses = classesMatch[0].replace(/class=/i, '');
                    cleanClasses = cleanClasses.replace(/"/g, '');
                    cleanClasses = cleanClasses.split(' ');
                    cleanClasses.forEach((className) => {
                        // check for rule exclusions
                        if (appConfig.exclusions.classes.indexOf(className) === -1) {
                            foundClasses.push(className);
                        }
                    });
                }
            } while (classesMatch);

            resolve(foundClasses);
        })
    },
    extractIds(input, appConfig) {
        return new Promise((resolve, reject) => {
            let foundIds = [];

            let redExForIds = /id="(.*?)"/g;
            let idMatch;
            do {
                idMatch = redExForIds.exec(input);
                if (idMatch) {
                    let cleanId = idMatch[0].replace(/id=/i, '');
                    cleanId = cleanId.replace(/"/g, '');
                    if (appConfig.exclusions.ids.indexOf(cleanId) === -1) {
                        foundIds.push(cleanId);
                    }
                }
            } while (idMatch);

            resolve(foundIds);
        })
    },
    loadHtml(filePath, appConfig) {
        return new Promise((resolve, reject) => {
            let foundClasses = [];
            let foundIds = [];

            if (!filePath) {
                return reject({
                    Error: 'Error: Provide an absolute path to a file.'
                })
            }

            return fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        return reject({
                            Error: 'Error: File not found'
                        });
                    } else {
                        console.log('An error occurred.', err);
                        return reject(err);
                    }
                }

                htmlUtils.extractClassNames(data, appConfig)
                .then((extractedClassNames) => {
                    foundClasses = extractedClassNames;
                    return htmlUtils.extractIds(data, appConfig)
                })
                .then((extractedIds) => {
                    foundIds = extractedIds;

                    resolve({
                        foundClasses,
                        foundIds
                    })
                })
                .catch((err) => {
                    console.log('An error occurred.', err);
                    reject(err);
                })
            });
        })
    }
};

module.exports = htmlUtils;
