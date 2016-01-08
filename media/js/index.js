/*jslint browser: true, node : true*/
/*jslint devel : true*/
/*global $, document, this, Materialize*/
$(document).ready(function () {
  var socket, channels, listChannel;
  //socket = io();
  socket = io.connect('http://localhost:1234');
  socket.on('list channel', function (data) {
    listChannel = '<h3 class="title">List of channels</h3><ul id="listChannel">';
    $.each(data.data, function (index, channel) {
      listChannel = listChannel + '<li>' + channel + '</li>';
    });
    listChannel = listChannel + '</ul>';
    $("#parentListChannel").html(listChannel);
    setInterval(function (){
      Materialize.showStaggeredList('#listChannel');
    }, 2500);
  });
  $("#nickname").on('change paste keyup', function () {
    if ($.trim($(this).val()) === "") {
      $("#connection").attr('disabled', "true");
    } else {
      $("#connection").removeAttr('disabled');
    }
  });
  if ($("#remember").is(':checked') === false) {
    $("#userMood").html('<i class="medium material-icons">mood_bad</i>');
  } else {
    $("#userMood").html('<i class="medium material-icons">mood</i>');
  }
  $("#remember").change(function () {
    if ($(this).is(':checked') === false) {
      $("#userMood").html('<i class="medium material-icons">mood_bad</i>');
    } else {
      $("#userMood").html('<i class="medium material-icons">mood</i>');
    }
  });
  $('#connection').click(function () {
    if ($.trim($('#nickname').val()) !== "") {
      socket.emit('user connection', {nickname: $.trim($('#nickname').val()), channel: $("#channel").val(), remember: $('#remember').is(':checked')});
      $('#nickname').val('');
      $('#channel').val('');
    }
  });
  socket.on('user connection', function (data) {
    if (data.error === null) {
      $("#username").html(data.data.nickname);
      $('#countUser').html('There are <span id="numUsers">' + data.data.userLength + '</span> users in the entire irc');
      socket.emit('all channel');
    } else {
      Materialize.toast('<p class="alert-failed">' + data.error + '<p>', 2000, 'rounded alert-failed');
    }
  });
  socket.on('all channel', function (data){
    if (data.error === null) {
      channels = '';
      $.each(data.data, function (index, object) {
        channels = channels + '<li><strong id="' + object.channelName + '">' + object.channelName + '<div class="mui-divider"></div><span class="channelUserLength">' + object.users.length + ' User(s)</span></strong><ul class="users">';
        if (object.users.length === 0) {
          channels = channels + '<li>No user</li></ul>';
        } else {
          $.each(object.users, function (num, user) {
            channels = channels + '<li><a href="#" class="mui-btn mui-btn--flat channel_in_' + object.channelName + '">' + user + '</a></li>';
          });
          channels = channels + '</ul></li>';
        }
      });
      $('#channels').html(channels);
      $('strong', '#sidedrawer').next().hide();
      $('strong', '#sidedrawer').on('click', function() {
        $(this).next().slideToggle(200);
      });
    } else {
      Materialize.toast('<p class="alert-failed">' + data.error + '<p>', 4000, 'rounded alert-failed');
    }
  });
  socket.on('new user', function (data) {
    if ($("#username").html() !== "") {
      Materialize.toast('<p class="alert-success">New user connected<p>', 1000, 'rounded alert-success');
      if (data.data.channel === $('#channelName').html()) {
        $("#allMessage").append('<div class="messageEvent"><span class="usernameEvent">' + data.data.nickname + '</span> is connected to this channel</div><div class="mui-divider"></div>')
        console.log(data.data.nickname + ' c"est connecter dans le channel ' + data.data.channel);
      }
      $('#countUser').html('There are <span id="numUsers">' + data.data.userLength + '</span> users in the entire irc');
      socket.emit('all channel');
    }
  });
  socket.on('get channel', function (data) {
    if ($("#username").html() !== "") {
      $("#usernameChannelName").html('You are in the channel <span id="channelName">' + data.data.channelName + '</span>');
      $("#theBody").html('<div class="mui-panel" id="thePanel"><div id="welcomeChannel">Welcome to the channel ' + data.data.channelName + ' !!</div><div class="mui-divider"></div><div id="allMessage"></div><div class="mui-panel" id="messageSender"><div class="input-field col s12"><i class="material-icons prefix">chat</i><textarea name="message" id="message" maxlength="140" length="140" class="materialize-textarea"></textarea><label for="message">Message</label><button class="btn waves-effect waves-light btn-flat" id="sendMessage" disabled="true">Send<i class="material-icons right">send</i></button></div></div></div><div class="mui-panel" id="thePersonnalPanel"><div id="personnalWelcome">Welcome to your personnal chatting room !! Click on the channel\'s name to display all the users who are in this channel ans click on one of them to chat personally with him !!</div><div class="mui-divider"></div><div class="mui-panel" id="personnalMessageSender"><div class="input-field col s12"><i class="material-icons prefix">chat</i><textarea name="personnalMessage" id="personnalMessage" maxlength="140" length="140" class="materialize-textarea"></textarea><label for="personnalMessage">Personnal message</label><button class="btn waves-effect waves-light btn-flat" id="sendPersonnalMessage" disabled="true">Send<i class="material-icons right">send</i></button></div></div></div>');
      $('textarea#message').characterCounter();
      $("#message").on('change paste keyup', function () {
        if ($.trim($(this).val()) === "") {
          $("#sendMessage").attr('disabled', "true");
        } else {
          $("#sendMessage").removeAttr('disabled');
        }
      });
      $("#personnalMessage").on('change paste keyup', function () {
        if ($.trim($(this).val()) === "") {
          $("#sendPersonnalMessage").attr('disabled', "true");
        } else {
          $("#sendPersonnalMessage").removeAttr('disabled');
        }
      });
      $("#sendMessage").click(function () {
        socket.emit('sendMessage', {nickname: $('#username').html(), to: null, channel: $('#channelName').html(), message: $('#message').val()});
        $("#message").val('');
      });
    }
  });
  socket.on('receiveMessage', function (data) {
    if ($("#username").html() !== "") {
      if ($('#channelName').html() === data.data.channel) {
        $('#allMessage').append('<div><span class="chatNickname">' + data.data.nickname + '</span> : <span class="chatMessage">' + data.data.message + '</span></div><div class="mui-divider"></div>');
      }
    }
  });
});