var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var Config = require('./module/util/Config');
var Sticker = require('./module/Sticker');

var config = Config.get( 'config.yml' );

var application = express();
application.use( bodyParser.json({ limit: '10mb' }) );
application.use( express.static( __dirname + 'asset' ) );
application.set('views', __dirname + '/view' );

application.get( '/', function( req, res ){
	res.render( 'capture.ejs' );
});

application.post( '/stick', function( req, res ){
    res.setHeader('Content-Type', 'application/json');

    if( req.body.picture == undefined ){
        return res.send( JSON.stringify({
            status: false,
			error: 'Une erreur est survenue, veuillez réessayer plus tard.',
        }));
    }

    var sticker = new Sticker( req.body.picture, config );
    sticker.build( function( err, data ){
		if( err ){
			return res.send( JSON.stringify({
	            status: false,
				error: err,
	        }));
		}

		return res.send( JSON.stringify({
			status: true,
			picture: data
		}));
    });
});

var server = http.createServer( application );
server.listen( config.host.port, config.host.address );
