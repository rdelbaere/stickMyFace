var AWS = require('aws-sdk');
var atob = require('atob');

var Sticker = function( origin, config ){
    this.origin = origin;

    AWS.config.credentials = {
        accessKeyId: config.aws.key,
        secretAccessKey: config.aws.secret,
    };
    AWS.config.region = config.aws.region;

    this.rekognition = new AWS.Rekognition({apiVersion: '2016-06-27'});
}

Sticker.prototype.build = function( callback ){
    var data = this.origin.split(',');
    var params = {
        Attributes: [ 'ALL' ],
        Image: {
            Bytes: new Buffer( data[1], 'base64'),
        },
    };

    this.rekognition.detectFaces(params, function( err, data ){
        if( err ){
            console.log( err );
        }

        callback( data );
    });
}

module.exports = Sticker;
