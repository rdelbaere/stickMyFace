$(document).ready( function(){
    loadDevice();

    $('.stick').click( function(){
        takePicture();
        return false;
    });

    $('.mirror-picture__close').click( function(){
        closeMirror();
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
        $('.stick').show();
    }, function( err ){
        $('.error').html("Malheureusement votre navigateur ne permet pas d'accéder à la caméra de votre appareil.").fadeIn();
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
    $('.mirror, .mirror-loading').fadeIn();

    $.ajax({
        type: 'post',
        url: 'stickMyFace/stick',
        contentType: 'application/json',
        data: JSON.stringify({
            picture: base64,
        })
    }).done( function( response ){
        if( response.status ){
            showResult( response.picture );
        }else{
            closeMirror();
            showError( response.error );
        }
    });
}

var inError = false;
function showError( error ){
    if( !inError ){
        inError = true;

        $('.error').html( error ).fadeIn();
        setTimeout( function(){
            $('.error').fadeOut();
            inError = false;
        }, 5000 );
    }
}

function showResult( picture ){
    $('.mirror-loading').hide();
    $('.mirror-picture__diplay').attr( 'src', picture );
    $('.mirror-picture__download').attr( 'href', picture );
    $('.mirror-picture').fadeIn();
}

function closeMirror(){
    $('.mirror, .mirror-loading, .mirror-picture').hide();
}
