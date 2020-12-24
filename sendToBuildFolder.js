const rimraf = require('rimraf');
const fs = require('fs');
const ncp = require('ncp').ncp;

// get package.json file for "homepage" attribute
let packageRaw = fs.readFileSync('package.json', 'utf8');
let packageConfig = JSON.parse(packageRaw);

// empty folder at homepage url
rimraf('../../Build' + packageConfig.homepage, {}, () => {

    // copy new build at folder at homepage url
    ncp('./build', '../../Build' + packageConfig.homepage, function (err) {
     if (err) {
       return console.error(err);
     }
     console.log('build copied!');
    });
});
