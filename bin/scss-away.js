#!/usr/bin/env node

'use strict';

require('babel-register')({
    presets: ['es2015', 'stage-0']
});
let colors = require('colors');
let appUtils = require('./utils/appUtils.js');
let parseArgs = require('minimist');
let scriptArgs = parseArgs(process.argv.slice(2));
const timestart = Date.now() / 1000;

console.log(parseArgs(process.argv.slice(2)));
let projectPath = appUtils.updateComponentPath(scriptArgs.path);   // Absolute path to project directory
if (scriptArgs.css) {
    appUtils.updateStyleSheetPath(scriptArgs.css);
} else {
    appUtils.updateStyleSheetPath(scriptArgs.path);
}

console.log(appUtils.getConfig());

console.log('--=== SCSS Away v.0.3.0 ===--\n'.underline.yellow);
if (!projectPath) {
    console.log('Exiting: No valid path to project folder provided.'.yellow);
    console.log('Use: --path /location/of/project/folder/'.yellow);
    process.exit(0);
} else {
    console.log(`Analyzing project folder: ${projectPath}`.yellow);
    let fileList = appUtils.getFileList(projectPath)
    let totalFilesFound = fileList.length - 1;
    let matchedScssFiles = 0;

    Promise.all(fileList.map((component) => {
        return appUtils.analyzeCss(component)
        .then((result) => {
            matchedScssFiles++;
        })
    }))
    .then((result) => {
        const timeend = Date.now() / 1000;
        console.log('\nStatistics:'.yellow);
        console.log(`Process took ${(timeend - timestart).toFixed(2)} seconds.`.yellow);
        console.log(`Total components found in ${projectPath}: ${totalFilesFound}`.yellow);
        console.log(`SCSS files matched: ${appUtils.getStats().scssFilesFound}`.yellow);
        console.log(`SCSS files with errors: ${appUtils.getStats().scssFilesWithErrors}`.yellow);
        console.log(`JS files with errors: ${appUtils.getStats().jsFilesWithErrors}`.yellow);
        process.exit(0);
    })
    .catch((err) => {
        console.log('Oops. An error occurred:', err);
        process.exit(0);
    })
}
