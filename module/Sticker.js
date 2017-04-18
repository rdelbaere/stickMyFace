var AWS = require('aws-sdk');
var Jimp = require('jimp');

var Sticker = function( origin, config ){
    this.origin = origin;
    this.buffer = new Buffer( this.origin.split(',')[1], 'base64');

    AWS.config.credentials = {
        accessKeyId: config.aws.key,
        secretAccessKey: config.aws.secret,
    };
    AWS.config.region = config.aws.region;

    this.rekognition = new AWS.Rekognition({apiVersion: '2016-06-27'});
}

Sticker.prototype.build = function( callback ){
    this.callback = callback;

    var params = {
        Attributes: [ 'ALL' ],
        Image: {
            Bytes: this.buffer,
        },
    };

    var self = this;
    this.rekognition.detectFaces(params, function( err, data ){
        if( err ){
            console.log( err );
        }

        if( data.FaceDetails.length == 0 ){
            return self.callback( 'Aucun visage n\'a été détecté sur cette photo, veuillez réessayer plus tard.', false );
        }

        self.extractEmotions( data );
    });
}

Sticker.prototype.extractEmotions = function( data ){
    this.faces = [];

    for( var i in data.FaceDetails ){
        var face = data.FaceDetails[ i ];

        if( face.Emotions != undefined && face.Emotions.length > 0 ){
            this.addStick( face );
        }
    }

    if( this.faces.length == 0 ){
        return this.callback( false );
    }

    this.loadPicture();
}

Sticker.prototype.addStick = function( face ){
    this.faces.push({
        emotion: face.Emotions[0].Type.toLowerCase(),
        box: {
            x: face.BoundingBox.Left,
            y: face.BoundingBox.Top,
            width: face.BoundingBox.Width,
            height: face.BoundingBox.Height,
            rotation: face.Pose.Roll,
        }
    });
}

Sticker.prototype.loadPicture = function(){
    var self = this;
    Jimp.read( this.buffer ).then( function( picture ){
        self.sticksPicture( picture );
    }).catch( function( err ){
        console.log( err );
        self.callback( 'Une erreur est survenue, veuillez réessayer plus tard.', false );
    });
}

Sticker.prototype.sticksPicture = function( picture ){
    var proccessed = 0;
    var self = this;
    for( var i in this.faces ){
        this.stickPicture( this.faces[ i ], picture, function(){
            proccessed++;

            if( self.faces.length == proccessed ){
                self.encode( picture );
            }
        });
    }
}

Sticker.prototype.stickPicture = function( face, picture, callback ){
    var stick = __dirname + '/../asset/img/emoji/' + face.emotion + '.png';

    Jimp.read( stick ).then( function( sticker ){
        sticker.resize(
            picture.bitmap.width * face.box.width,
            picture.bitmap.height * face.box.height
        ).rotate( face.box.rotation, true );

        picture.composite(
            sticker,
            picture.bitmap.width * face.box.x,
            picture.bitmap.height * face.box.y
        );

        callback();
    }).catch( function( err ){
        console.log( err );
        callback();
    });
}

Sticker.prototype.encode = function( picture ){
    var self = this;

    picture.getBase64( Jimp.MIME_JPEG, function( err, b64 ){
        if( err ){
            console.log( err );
            return self.callback( 'Une erreur est survenue, veuillez réessayer plus tard.', false );
        }

        self.callback( false, b64 );
    });
}

module.exports = Sticker;
