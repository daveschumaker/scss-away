#!/usr/bin/env node

'use strict';

require('babel-register')({
    presets: ['es2015', 'stage-0']
});
let colors = require('colors');
let appUtils = require('./utils/appUtils.js');
let appStats = require('./utils/appStats.js');
let folderPath = process.argv.slice(2); // Gets absolute path to directory to analyze
const timestart = Date.now() / 1000;

console.log('--=== SCSS Away v.0.1 ===--'.underline.yellow);
if (folderPath.length === 0) {
    console.log('Exiting: No absolute path to project folder provided.'.yellow);
    process.exit(0);
} else {
    console.log(`Analyzing project folder: ${folderPath[0]}`.yellow);
    let fileList = appUtils.getFileList(folderPath[0])
    let totalFilesFound = fileList.length - 1;
    let matchedScssFiles = 0;

    Promise.all(fileList.map((component) => {
        return appUtils.analyzeFile(component)
        .then((result) => {
            matchedScssFiles++;
        })
    }))
    .then((result) => {
        const timeend = Date.now() / 1000;
        console.log('\nStatistics:'.yellow);
        console.log(`Process took ${(timeend - timestart).toFixed(2)} seconds.`.yellow);
        console.log(`Total components found in ${folderPath[0]}: ${totalFilesFound}`.yellow);
        console.log(`SCSS files matched: ${appStats.getStats().scssFilesFound}`.yellow);
        console.log(`SCSS files with errors: ${appStats.getStats().scssFilesWithErrors}`.yellow);
        process.exit(0);
    })
    .catch((err) => {
        console.log('Oops. An error occurred:', err);
        process.exit(0);
    })
}
