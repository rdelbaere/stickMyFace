var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var Config = require('./module/util/Config.js');

var config = Config.get( 'config.yml' );

var application = express();
application.use( bodyParser.json() );
application.use( express.static( 'asset' ) );
application.set('views', __dirname + '/view' );

application.get( '/', function( req, res ){
	res.render( 'capture.ejs' );
});

var server = http.createServer( application );
server.listen( config.host.port, config.host.address );
