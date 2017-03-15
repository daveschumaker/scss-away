var fs = require('fs');

var htmlUtils = {
    extractClassNames(input) {
        return new Promise((resolve, reject) => {
            let foundClasses = [];

            // In React components, we often use the 'classnames' module to build an object with multiple
            // class names depending on certain criteria. We import this module as 'cx'. This loop looks
            // for the existence of 'cx({ ... })'
            var regExForCx = /cx\(([\s\S]*?)\)/g;
            var cxMatch;
            do {
                cxMatch = regExForCx.exec(input);
                if (cxMatch) {
                    var cleanCx = cxMatch[0].replace(/cx\(\{/i, '');
                    cleanCx = cleanCx.replace(/\}\)/i, '');
                    var cxProps = cleanCx.split(',');

                    cxProps.forEach((prop) => {
                        var cxClass = prop.trim();
                        var getKey = cxClass.split(':')[0];
                        getKey = getKey.replace(/\'/g, '');
                        foundClasses.push(getKey);
                    })
                }
            } while (cxMatch);

            // This looks for 'className=" ... "' found in React components.
            var regExForClassNames = /className="(.*?)"/g;
            var classNameMatch;
            do {
                classNameMatch = regExForClassNames.exec(input);
                if (classNameMatch) {
                    var cleanClasses = classNameMatch[0].replace(/className=/i, '');
                    cleanClasses = cleanClasses.replace(/"/g, '');
                    cleanClasses = cleanClasses.split(' ');
                    foundClasses = foundClasses.concat(cleanClasses)
                }
            } while (classNameMatch);

            // This looks for 'class=" ... "' found in normal HTML documents components.
            var regExForClasses = /class="(.*?)"/g;
            var classesMatch;
            do {
                classesMatch = regExForClasses.exec(input);
                if (classesMatch) {
                    var cleanClasses = classesMatch[0].replace(/class=/i, '');
                    cleanClasses = cleanClasses.replace(/"/g, '');
                    cleanClasses = cleanClasses.split(' ');
                    foundClasses = foundClasses.concat(cleanClasses)
                }
            } while (classesMatch);

            resolve(foundClasses);
        })
    },
    extractIds(input) {
        return new Promise((resolve, reject) => {
            let foundIds = [];

            var redExForIds = /id="(.*?)"/g;
            var idMatch;
            do {
                idMatch = redExForIds.exec(input);
                if (idMatch) {
                    var cleanId = idMatch[0].replace(/id=/i, '');
                    cleanId = cleanId.replace(/"/g, '');
                    foundIds.push(cleanId)
                }
            } while (idMatch);

            resolve(foundIds);
        })
    },
    loadHtml(filePath) {
        return new Promise((resolve, reject) => {
            let foundClasses = [];
            let foundIds = [];

            if (!filePath) {
                return reject({
                    Error: 'Error: Provide an absolute path to a file.'
                })
            }

            return fs.readFile(filePath, 'utf8', function(err, data) {
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

                htmlUtils.extractClassNames(data)
                .then((extractedClassNames) => {
                    foundClasses = extractedClassNames;
                    return htmlUtils.extractIds(data)
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
