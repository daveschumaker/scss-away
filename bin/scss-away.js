#!/usr/bin/env node

'use strict';

require('babel-register')({
    presets: ['es2015', 'stage-0']
});
const colors = require('colors');
const appUtils = require('./utils/appUtils.js');
const parseArgs = require('minimist');
const scriptArgs = parseArgs(process.argv.slice(2));
const projectPath = appUtils.updateComponentPath(scriptArgs.path);   // Absolute path to project directory
const timestart = Date.now() / 1000;
let stylesheetPath;

if (scriptArgs.css) {
    stylesheetPath = appUtils.updateStyleSheetPath(scriptArgs.css);
} else {
    stylesheetPath = appUtils.updateStyleSheetPath(scriptArgs.path);
}

if (scriptArgs.ext) {
    appUtils.updateStyleSheetExt(scriptArgs.ext);
}

// Check for exclusions file
appUtils.updateExlusions();

console.log('--=== SCSS Away v.0.3.0 ===--\n'.underline.yellow);
if (!projectPath) {
    console.log('Exiting: No valid path to project folder provided.'.yellow);
    console.log('Use: --path /location/of/project/folder/'.yellow);
    process.exit(0);
} else {
    console.log(`Analyzing project folder: ${projectPath}`.yellow);
    let fileList = appUtils.getFileList('components', projectPath);
    appUtils.getFileList('stylesheets', stylesheetPath);
    let totalComponentsFound = fileList.length - 1;

    Promise.all(fileList.map((component) => {
        return appUtils.analyzeCss(component)
        .then((result) => {
        })
    }))
    .then((result) => {
        const timeend = Date.now() / 1000;
        console.log('\nStatistics:'.yellow);
        console.log(`Process took ${(timeend - timestart).toFixed(2)} seconds.`.yellow);
        console.log(`Total components found in ${projectPath}: ${totalComponentsFound}`.yellow);
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
