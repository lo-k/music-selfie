// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require turbolinks
//= require_tree .
//= require bootstrap-sprockets

$(document).ready( function() {

  $('.waiting-animation').hide();

// ---------------------- VIDEO SETUP ----------------------

  $('.submit-upload').hide();
  $('.record-box').css("height", 0);
  
  // hide all buttons
  $('#record-button').hide();
  $('#stop-recording-button').hide();
  $('#upload-button').hide();
  $('#cancel-button').hide();

  var accepted_vid_formats = 
    [
      "video/avi",          // .avi
      "video/msvideo",      // .avi
      "video/x-msvideo",    // .avi
      "video/quicktime",    // .mov
      "video/mp4",          // .mp4
      "audio/mpeg",         // .mpg
      "audio/x-ms-wmv",     // .wmv
    ]

// ------------------- MOBILE DISPLAY CHANGES ---------------

  var mobile = onMobileDevice();

  if (mobile) {
    $('#video-upload').children('span').removeClass('glyphicon-upload');    
    $('#video-upload').children('span').addClass('glyphicon-facetime-video');
    $('#video-upload').children('h4').hide();
    
    // Video capture is taken care of with 
    // single button on mobile ^
    $('#video-capture').hide();
    $('.file-formats').hide();
  } 

  function onMobileDevice() { 
   if( navigator.userAgent.match(/Android/i)
   || navigator.userAgent.match(/webOS/i)
   || navigator.userAgent.match(/iPhone/i)
   || navigator.userAgent.match(/iPad/i)
   || navigator.userAgent.match(/iPod/i)
   || navigator.userAgent.match(/BlackBerry/i)
   || navigator.userAgent.match(/Windows Phone/i)
   ){
      return true;
    }
   else {
      return false;
    }
  }

// ---------------------- UPLOADING A VIDEO ----------------------

  // "Upload Video" Button Triggers Input Select
  $('#video-upload').click(function() {
    var fileInput = $('input:file');
    fileInput.click();
  });

  // File Input Validations
  $('input:file').change(function() {

      var empty = false;
      
      if ($('input[type="file"]').val() == '') {
        empty = true;
      };

      var file_type = $('input[type="file"]')[0].files[0].type
      var file_size = $('input[type="file"]')[0].files[0].size
      var max_size = 31457280

      // if no file is selected
      if (empty) {
        $('.submit-upload').attr('disabled', 'disabled'); 
        $('.submit-upload').hide();

      // if the file is not the correct format
      } else if ($.inArray(file_type, accepted_vid_formats) < 0) {
        console.log('wrong file type');
        console.log(file_type);
        $('.submit-upload').attr('disabled', 'disabled');
        $('.error-message').html('Incorrect file type');
        $('.submit-upload').hide();
      
      // if the file is too large
      } else if (file_size > max_size) {
        console.log('file too large');
        console.log(file_size)
        $('.submit-upload').attr('disabled', 'disabled');
        $('.error-message').html('File too large');
  
      // file is ok for upload
      } else {
        console.log('file okay');
        console.log(file_type);
        console.log(file_size);
        $('.submit-upload').removeAttr('disabled');
        $('.submit-upload').show(); 
        $('.error-message').html('');
      }
  });

  // Start animation after submitting the form

  // $('form').on("submit", function(event) {
  $('.submit-upload').on("click", function(event) {
    event.preventDefault();

    console.log('submitted file');

    setTimeout(function() { 
      $('.main-content').hide();   
      $('.waiting-animation').show();
      $('.waiting-animation > h4').addClass('animate');
      $('#e1, #e2, #e3, #e4').addClass('animate');
    }, 10);

    setTimeout(firstDelayMsg, 60000);
    setTimeout(secondDelayMsg, 120000);
    
    setTimeout(function() {
      $('form').submit();
    }, 1000);

  });

  var firstDelayMsg = function() {
    $('.waiting-animation > h4').html('Geez your video has a lot of emotions...');
  }

  var secondDelayMsg = function() {
    $('.waiting-animation > h4').html('Too many people music selfie-ing (selfy-ing?). Sorry for the delay...');
  }

// ---------------------- WEBCAM VIDEO ----------------------

  // config
  var videoWidth = 380;
  var videoHeight = 280;

  // setup
  var stream;
  var video_recorder = null;
  var recording = false;
  var playing = false;
  var formData = null;
  var video_blob;

  // set the video options
  var videoOptions = {
    type: "video",
    video: {
      width: videoWidth,
      height: videoHeight
    },
    canvas: {
      width: videoWidth,
      height: videoHeight
    }
  };

  var setUpVideo = function() { 
    navigator.getUserMedia({audio: false, video: { mandatory: {}, optional: []}}, function(pStream) {

      stream = pStream;
      // setup video
      video = $("video.recorder")[0];
      $("video.recorder").removeAttr("controls");

      video.src = window.URL.createObjectURL(stream);
      video.width = videoWidth;
      video.height = videoHeight;

      // show player
      $("video.recorder").show();

      // reset timer
      $('#minutes').html('00');
      $('#seconds').html('00');

      // show start and cancel buttons
      $('.video-control-buttons').show();
      $('#record-button').show();
      $('#cancel-button').show();

      // hide stop and upload buttons
      $('#stop-recording-button').hide();
      $('#upload-button').hide();

    }, function(){})
  };

  var startRecording = function() {
    video_recorder = RecordRTC(stream, videoOptions);
    startTimer();

    // remove prior recorded video if one is shown
    $("#video-player").remove();

    // display video recorder with timer controls
    $("video.recorder").show();
    $("video.recorder").attr("controls", "controls");
    
    // hide record button
    $("#record-button").hide();

    // show stop button
    $('#stop-recording-button').show();

    // start recording
    video_recorder.startRecording();
    recording = true;
  }

  var timer;

  function startTimer() {
    var sec = 0;

    function pad (val) { 
      return val > 9 ? val : "0" + val; 
    }

    timer = setInterval( function(){
      $("#seconds").html(pad(++sec%60));
      $("#minutes").html(pad(parseInt(sec/60,10)));
    }, 1000);
  }

  var stopRecording = function() {
    // stop recording and turn off camera stream
    video_recorder.stopRecording();
    stream.stop();
    recording = false;
    clearInterval(timer);

    // set form data
    formData = new FormData();
    video_blob = video_recorder.getBlob();
    formData.append("video", video_blob);

    // add player for recorded video
    var video_player = document.createElement("video");
    video_player.id = "video-player";
    video_player.src = URL.createObjectURL(video_blob);
    video_player.controls = "controls";
    $("#player").append(video_player);
    // $("#blob").val(URL.createObjectURL(video_blob));

    // hide recorder
    $("video.recorder").hide();

    // hide stop button
    $("#stop-recording-button").hide();

    // show upload button
    $("#upload-button").show();
  }

  var cancelVideo = function() {
    // stop recording & turn off stream
    if (recording) {
      video_recorder.stopRecording();
      recording = false; 
    }

    stream.stop();

    // hide recorder and clear player
    $("video.recorder").hide();
    $("#video-player").remove();

    // hide all buttons
    $('#record-button').hide();
    $('#stop-recording-button').hide();
    $('#upload-button').hide();
    $('#cancel-button').hide();
  }

// Event Handlers ----------------------------------

  // Set up video stream
  $('#video-capture').click(function() {
    $('.file-formats').hide();
    // animate .submit-choices height to 0
    $('.submit-choices').animate({ height: 0 }, 500)
    // animate .record-box height to auto?
    $('.record-box').animate({ height: 500 }, 500)

    setUpVideo();
  });

  // Start recording
  $('#record-button').click(function() {
    startRecording();
  });

  // Stop recording
  $('#stop-recording-button').click(function() {
    stopRecording();
  });

  // Upload recorded video
  $("#upload-button").click(function(){
    console.log('uploading');

    displayAnimation();

    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
      if (request.readyState == 4 && request.status == 200) {
          console.log('request completed');

          var html = request.responseText
          $('.upload-page').hide();
          $('.playlist-results').html(html);
        }
    };

    var data = new FormData();
    data.append('video', video_blob);

    request.open('POST', "/playlist");
    request.send(data);
  });

  function displayAnimation() {
    $('.main-content').hide();
    $('.waiting-animation').show();
    $('.waiting-animation > h4').addClass('animate');
    $('#e1, #e2, #e3, #e4').addClass('animate');
    setTimeout(firstDelayMsg, 60000);
    setTimeout(secondDelayMsg, 120000);
  }

  // function postVideo(video_obj) {
  //   // console.log("form_data = " + form_data);
  //   console.log("posting");
  //   console.log(video_obj);
    
  //   var data = new FormData();
  //   data.append('video', video_obj);
    
  //   $.ajax({
  //     type: "POST",
  //     url: '/playlist',
  //     data: data,
  //     success: function(data) {
  //       console.log(data);
  //     }
  //   });
  // }

  $('#cancel-button').click(function() {
    cancelVideo();

    $('.file-formats').show();
    // animate .submit-choices height to 0
    $('.submit-choices').animate({ height: 240 }, 500)
    // animate .record-box height to auto?
    $('.record-box').animate({ height: 0 }, 500)

  });
})