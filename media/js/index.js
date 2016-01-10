/*jslint browser: true, node : true*/
/*jslint devel : true*/
/*global $, document, this, Materialize*/
$(document).ready(function () {
  var socket, channels, listChannel, keyboardShortcuts, arrayKeyboardShortcuts, countMessage, listChannelsButton, i;
  countMessage = 0;
  arrayKeyboardShortcuts = [];
  listChannelsButton = [];
  //socket = io();
  socket = io.connect('http://localhost:1234');
  function displayMessage (nickname, message, selectorDisplayMessage, selectorToScroll) {
    if (countMessage >= 50) {
      $(selectorDisplayMessage).html('');
    }
    $(selectorDisplayMessage).append('<span class="chatNickname">' + nickname + '</span> : <span class="chatMessage">' + message + '</span><div class="mui-divider"></div>');
    $(selectorDisplayMessage).niceScroll({cursorwidth: '10px'});
    $(selectorDisplayMessage).getNiceScroll().resize();
    $(selectorToScroll).animate({ scrollTop: 1000000 }, "slow");
    countMessage = countMessage + 1;
  }
  function displayShortcut (array, trigger, data, selectorDisplayShortcut, selectorToScroll) {
    "use strict";
    var shortcuts;
    if (countMessage >= 50) {
      $(selectorDisplayMessage).html('');
    }
    shortcuts = '';
    array = [];
    if (trigger === "connection") {
      $.each(data, function (index, keyboardShortcuts) {
        array.push(keyboardShortcuts.name);
      });
    } else {
      $.each(data, function (index, keyboardShortcuts) {
        shortcuts = shortcuts + '<span class="shortcutName">' + keyboardShortcuts.name + '</span><br><span class="shortcutPattern">' + keyboardShortcuts.pattern +'</span><br><span class="shortcutDescription">' + keyboardShortcuts.description + '</span><br>';
      });
      shortcuts = shortcuts + '<div class="mui-divider"></div>';
      $(selectorDisplayShortcut).html(shortcuts);
      $(selectorDisplayShortcut).niceScroll({cursorwidth: '10px'});
      $(selectorDisplayShortcut).getNiceScroll().resize();
      $(selectorToScroll).animate({ scrollTop: 1000000 }, "slow");
    }
    countMessage = countMessage + 1;
  }
  function checkDuplicateChannel (channel) {
    "use stric";
    var duplicateChannel, i, varReturn;
    duplicateChannel = false;
    if (listChannelsButton.length > 0) {
      for (i = 0; i < listChannelsButton.length; i = i + 1) {
        if (listChannelsButton[i].channelName === channel) {
          duplicateChannel = true;
          break;
        }
      }
      if (duplicateChannel === false) {
        listChannelsButton.push({channelName: channel});
      }
    } else {
      listChannelsButton.push({channelName: channel});
    }
    return duplicateChannel;
  }
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
      socket.emit('allShortcuts', {nickname: data.data.nickname, trigger: "connection"});
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
      $('strong', '#sidedrawer').click(function () {
        $(this).next().slideToggle(200);
        socket.emit('goInChannel', {nickname: $("#username").html(), channel: $(this).attr('id')});
      });
    } else {
      Materialize.toast('<p class="alert-failed">' + data.error + '<p>', 4000, 'rounded alert-failed');
    }
  });
  socket.on('new user', function (data) {
    if ($("#username").html() !== "") {
      Materialize.toast('<p class="alert-success">New user connected<p>', 1000, 'rounded alert-success');
      if (data.data.channel === $('#channelName').html()) {
        $("#allMessage").append('<div class="messageEvent"><span class="usernameEvent">' + data.data.nickname + '</span> is connected to this channel</div><div class="mui-divider"></div>');
      }
      $('#countUser').html('There are <span id="numUsers">' + data.data.userLength + '</span> users in the entire irc');
      socket.emit('all channel');
    }
  });
  socket.on('get channel', function (data) {
    if ($("#username").html() !== "") {
      $("#usernameChannelName").html('You are currently in the channel <span id="channelName">' + data.data.channelName + '</span>');
      $("#theBody").html('<div class="row"><div class="mui-panel col s6" id="thePanel"><div id="allMessage"><div id="welcomeChannel">Welcome to the channel ' + data.data.channelName + ' !!</div><div class="mui-divider"></div></div></div><div class="mui-panel col s6" id="thePersonnalPanel"><div id="personnalWelcome">Welcome to your personnal chatting room !! Click on the channel\'s name to display all the users who are in this channel ans click on one of them to chat personally with him !!</div><div class="mui-divider"></div></div></div><div class="row"><div class="mui-panel"><div class="input-field col s12"><i class="material-icons prefix">chat</i><textarea name="message" id="message" maxlength="140" length="140" class="materialize-textarea"></textarea><label for="message">Message</label><button class="btn waves-effect waves-light btn-flat" id="sendMessage" disabled="true">Send<i class="material-icons right">send</i></button></div></div></div><div class="row"><div class=" mui-panel col s12"><h4>List of channel where you are joined</h4><h5>Click one of them to chat in this channel</h5><ul id="channelsButton"><li><button class="mui-btn mui-btn--raised channelButton">' + data.data.channelName + '</button></li></ul></div></div>');
      checkDuplicateChannel(data.data.channelName);
      $("#allMessage").niceScroll({cursorwidth: '10px'});
      $('#channelsButton').niceScroll({cursorwidth: '10px'});
      $('textarea#message').characterCounter();
      $("#message").on('change paste keyup', function () {
        if ($.trim($(this).val()) === "") {
          $("#sendMessage").attr('disabled', "true");
        } else {
          $("#sendMessage").removeAttr('disabled');
        }
      });
      $("#sendMessage").click(function () {
        keyboardShortcuts = false;
        //verifier que le shortcut est dans arrayShortcut
        switch($.trim($("#message").val()).substr(0, 5)) {
          case "/msg":
          keyboardShortcuts = true;
          //msg to someone
          break;
          case "/nick":
          keyboardShortcuts = true;
          if ($.trim($.trim($("#message").val()).substr(5)).length < 16) {
            socket.emit('change nickname', {oldNickname : $('#username').html(), newNickname: $.trim($.trim($("#message").val()).substr(5))});
          } else {
            $("#allMessage").append('<div class="messageEvent">You can\'t change your nickname !! New nickname too long (max 15 charracters)</div><div class="mui-divider"></div>');
          }
          break;
          case "/list":
          keyboardShortcuts = true;
          //list channel
          break;
          case "/join":
          keyboardShortcuts = true;
          //change channel
          break;
          case "/part":
          keyboardShortcuts = true;
          //leave channel
          break;
          //$('#allMessage').append('<div class="messageError">Unknown keyboard shortcuts !! To have the full list of keyboard shortcuts, tap /allShortcuts !!</div><div class="mui-divider"></div>');
        }
        if ($.trim($("#message").val()).substr(0, 13) === "/allShortcuts") {
          keyboardShortcuts = true;
          socket.emit('allShortcuts', {nickname: $('#username').html(), trigger: "message"});
        }
        if (keyboardShortcuts === false) {
          socket.emit('sendMessage', {nickname: $('#username').html(), to: null, channel: $('#channelName').html(), message: $.trim($('#message').val())});
        }
        $("#message").val('');
        $("#sendMessage").attr('disabled', "true");
      });
    }
  });
  socket.on('receiveMessage', function (data) {
    if ($("#username").html() !== "") {
      if ($('#channelName').html() === data.data.channel) {
        displayMessage(data.data.nickname, data.data.message, "#allMessage", "#allMessage");
      }
    }
  });
  socket.on('allShortcuts', function (data) {
    displayShortcut(arrayKeyboardShortcuts,  data.trigger, data.data, "#allMessage", "#allMessage");
  });
  socket.on('goInChannel', function (data) {
    if ($('#username').html() !== "") {
      if (data.error === null) {
        if (data.nickname === $('#username').html()) {
          $('#channelName').html(data.channel);
          $('#allMessage').html('<div id="welcomeChannel">Welcome to the channel ' + data.channel + ' !!</div><div class="mui-divider"></div>');
          if (checkDuplicateChannel(data.channel) === false) {
            $('#channelsButton').append('<li><button class="mui-btn mui-btn--raised channelButton">' + data.channel + '</button></li>');
            $('#channelsButton').niceScroll({cursorwidth: '10px'});
            $('#channelsButton').getNiceScroll().resize();
            $('#channelsButton').animate({ scrollTop: 1000000 }, "slow");
          }
        } else {
          if (data.channel === $('#channelName').html()) {
            $("#allMessage").append('<div class="messageEvent"><span class="usernameEvent">' + data.nickname + '</span> is connected to this channel</div><div class="mui-divider"></div>');
          }
        }
        $('.channelButton').click(function () {
          socket.emit('goInChannel', {nickname: $("#username").html(), channel: $(this).text()});
        });
        socket.emit("all channel");
      }
    }
  });
  socket.on('change nickname', function (data) {
    if ($('#username').html() !== "") {
      if (data.error === null) {
        if (data.data.oldNickname === $('#username').html()) {
          $('#username').html(data.data.newNickname);
          $('#allMessage').append('<div class="messageEvent">You change your nickname to <span class="usernameEvent">' + data.data.newNickname + '</span></div>');
        } else {
          $.each(data.data.allChannel, function (index, channel) {
            if (channel.channelName === $('#channelName').html()) {
              $.each(channel.users, function (num, user) {
                if (user === data.data.newNickname) {
                  $('#allMessage').append('<div class="messageEvent"><span class="usernameEvent">' + data.data.oldNickname + '</span> change his nickname to <span class="usernameEvent">' + data.data.newNickname + '</span></div>');
                  return;//break fait planter jquery car illegal statement dans un $.each();
                }
              });
            }
          });
        }
        socket.emit("all channel");
      }
    }
  });
  setInterval(function (){
    Materialize.showStaggeredList('#channelsButton');
  }, 2500);
});