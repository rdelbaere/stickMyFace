var fs = require('fs');
var yaml = require('js-yaml');

var Config = {};

Config.get = function( path ){
    var file = fs.readFileSync( __dirname + '/../../' + path );
    var params = yaml.load( file );
    return params;
}

module.exports = Config;
