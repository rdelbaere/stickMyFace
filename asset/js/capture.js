$(document).ready( function(){
    loadDevice();

    $('.stick').click( function(){
        takePicture();
        return false;
    });
});

function loadDevice(){
    var config = {
        'video': true,
        'audio': false,
    };
    navigator.getUserMedia = (
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia
    );

    navigator.getUserMedia( config, function( stream ){

        var vendor = window.URL || window.webkitURL;
        $('#camera').attr( 'src' , vendor.createObjectURL(stream) );
        $('#camera').get(0).play();

    }, function( err ){
        console.log('Failed to load device');
    });
}

function takePicture(){
    var renderer = $('#renderer').get(0);
    var camera = $('#camera').get(0);

    renderer.getContext('2d').drawImage( camera, 0, 0, 640, 480 );
    var base64 = renderer.toDataURL('image/png');

    stickPicture( base64 );
}

function stickPicture( base64 ){
    $.ajax({
        type: 'post',
        url: 'stick',
        contentType: 'application/json',
        data: JSON.stringify({
            picture: base64,
        })
    }).done( function( response ){
        if( response.status ){
            showResult( response.picture );
        }else{

        }
    });
}

function showResult( picture ){
    $('.mirror-picture').attr( 'src', picture );
    $('.mirror').fadeIn();
}
