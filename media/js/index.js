/*jslint browser: true, node : true*/
/*jslint devel : true*/
/*global $, document, this, Materialize*/
$(document).ready(function () {
  var socket, channels, listChannel, keyboardShortcuts, arrayKeyboardShortcuts, countMessage, listChannelsButton, i, listChannels, j, arrayMsg, to, emoticon, gifSearch, notification, userNum;
  to = "";
  arrayMsg = [];
  countMessage = 0;
  arrayKeyboardShortcuts = [];
  listChannelsButton = [];
  socket = io();
  $.extend({
    playSound: function(){
      return $(
        '<audio autoplay="autoplay" style="display:none;">'
          + '<source src="' + arguments[0] + '.mp3" />'
          + '<source src="' + arguments[0] + '.ogg" />'
          + '<embed src="' + arguments[0] + '.mp3" hidden="true" autostart="true" loop="false" class="playSound" />'
        + '</audio>'
      ).appendTo('body');
    }
  });
  //socket = io.connect('http://localhost:1234');
  function displayMessage (nickname, message, to, selectorDisplayMessage, selectorToScroll) {
    "use strict";
    var toNickname;
    message = message.replace(/:emoticon:/g, '<img src="img/emoticon.png" alt="emoticon" />');
    message = message.replace(/:D/g, '<img src="img/emoticon.png" alt="emoticon" />');
    message = message.replace(/:-D/g, '<img src="img/emoticon.png" alt="emoticon" />');
    message = message.replace(/:emoticon-cool:/g, '<img src="img/emoticon-cool.png" alt="emoticon-cool" />');
    message = message.replace(/:emoticon-devil:/g, '<img src="img/emoticon-devil.png" alt="emoticon-devil" />');
    message = message.replace(/>:\)/g, '<img src="img/emoticon-devil.png" alt="emoticon-devil" />');
    message = message.replace(/>:-\)/g, '<img src="img/emoticon-devil.png" alt="emoticon-devil" />');
    message = message.replace(/:emoticon-happy:/g, '<img src="img/emoticon-happy.png" alt="emoticon-happy" />');
    message = message.replace(/:\)/g, '<img src="img/emoticon-happy.png" alt="emoticon-happy" />');
    message = message.replace(/:-\)/g, '<img src="img/emoticon-happy.png" alt="emoticon-happy" />');
    message = message.replace(/:emoticon-neutral:/g, '<img src="img/emoticon-neutral.png" alt="emoticon-neutral" />');
    message = message.replace(/:\|/g, '<img src="img/emoticon-neutral.png" alt="emoticon-neutral" />');
    message = message.replace(/:-\|/g, '<img src="img/emoticon-neutral.png" alt="emoticon-neutral" />');
    message = message.replace(/:emoticon-poop:/g, '<img src="img/emoticon-poop.png" alt="emoticon-poop" />');
    message = message.replace(/:poop:/g, '<img src="img/emoticon-poop.png" alt="emoticon-poop" />');
    message = message.replace(/:emoticon-sad:/g, '<img src="img/emoticon-sad.png" alt="emoticon-sad" />');
    message = message.replace(/:\(/g, '<img src="img/emoticon-sad.png" alt="emoticon-sad" />');
    message = message.replace(/:-\(/g, '<img src="img/emoticon-sad.png" alt="emoticon-sad" />');
    message = message.replace(/:'\(/g, '<img src="img/emoticon-sad.png" alt="emoticon-sad" />');
    message = message.replace(/:emoticon-tongue:/g, '<img src="img/emoticon-tongue.png" alt="emoticon-tongue" />');
    message = message.replace(/:p/g, '<img src="img/emoticon-tongue.png" alt="emoticon-tongue" />');
    message = message.replace(/:-p/g, '<img src="img/emoticon-tongue.png" alt="emoticon-tongue" />');
    message = message.replace(/:P/g, '<img src="img/emoticon-tongue.png" alt="emoticon-tongue" />');
    message = message.replace(/:-P/g, '<img src="img/emoticon-tongue.png" alt="emoticon-tongue" />');
    message = message.replace(/:gif:/g, '<img src="img/gif.png" alt="gif" />');
    if (countMessage >= 50) {
      $(selectorDisplayMessage).html('');
      countMessage = 0;
    }
    if (to !== null) {
      toNickname = '[to <span class="usernameEvent">' + to + '</span>]';
    } else {
      toNickname = '';
    }
    $(selectorDisplayMessage).append('<span class="chatNickname">' + nickname + '</span> ' + toNickname + ' : <span class="chatMessage">' + message + '</span><div class="mui-divider"></div>');
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
      countMessage = 0;
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
  function displayGifList (searchSelector, gifListSelector, offsetSearch) {
    "use strict";
    var gifList;
    gifSearch = $.trim($(searchSelector).val());
    gifSearch = gifSearch.replace(/[^\w\s]/g, '');
    gifSearch = gifSearch.replace(/ /g, '+');
    $.getJSON('http://api.giphy.com/v1/gifs/search?q=' + gifSearch + '&limit=10&offset=' + offsetSearch + '&api_key=dc6zaTOxFJmzC', function (json, textStatus) {
      if (textStatus === "success") {
        if (json.data.length > 0) {
          gifList = '<div class="mui-panel">';
          $.each(json.data, function (number, gif) {
            gifList = gifList + '<img class="responsive-img gifs" src="' + gif.images.original.url + '" alt="' + gifSearch + '" />';
            if (number % 2 === 1) {
              gifList = gifList + '<div class="mui-divider"></div>';
            }
          });
          gifList = gifList + '<i class="large material-icons" id="more">expand_more</i>';
          gifList = gifList + '</div>';
          $(gifListSelector).html(gifList);
          $('#more').click(function () {
            displayGifList(searchSelector, gifListSelector, (offsetSearch + json.data.length));
          });
          $('.gifs').click(function () {
            $('#listGif').closeModal();
            $('#sendGif').append('<div id="sendGifModal" class="modal modal-fixed-footer"><div class="modal-content"><h4>Send the Gif</h4><p>You can choose to send the gif to the current channel or to send as a personal message to an user</p><p><img id="trueGifSend" src="' + $(this).attr('src') + '" alt="' + gifSearch + '" /></p><div class="row"><div class="input-field"><i class="material-icons prefix">perm_identity</i><input name="gifSendNickname" id="gifSendNickname" type="text" maxlength="15" length="15"><label for="gifSendNickname">Nickname</label></div></div></div><div class="modal-footer"><a href="#" class="waves-effect btn-flat gifSendChoice">Current Channel</a><a href="#" class="waves-effect btn-flat gifSendChoice" id="gifSendPersonnal" disabled="true">Personal Message</a><a href="#" class="waves-effect btn-flat gifSendChoice">Cancel</a></div></div>');
            $('#sendGifModal').openModal();
            $('.gifSendChoice').click(function () {
              switch($(this).text()) {
                case "Current Channel":
                $('#sendGifModal').closeModal();
                socket.emit('sendMessage', {nickname: $('#username').html(), to: null, channel: $('#channelName').html(), message: '<img class="gifs" src="' + $('#trueGifSend').attr('src') + '" alt="' + $('#trueGifSend').attr('alt') + '" />'});
                break;
                case "Personal Message":
                $('#sendGifModal').closeModal();
                socket.emit('sendMessage', {nickname: $('#username').html(), to: $.trim($('#gifSendNickname').val()), channel: null, message: '<img class="gifs" src="' + $('#trueGifSend').attr('src') + '" alt="' + $('#trueGifSend').attr('alt') + '" />'});
                break;
                case "Cancel":
                $('#sendGifModal').closeModal();
                $('#listGif').openModal();
                break;
              }
            });
          });
        } else {
          $(gifListSelector).html('<div class="mui-panel">No gif found !!</div>');
        }
      }
    });
  }
  function sendMessage () {
    "use strict";
    keyboardShortcuts = false;
    if ($.trim($('#message').val()).substr(0, 4) === "/msg") {
      keyboardShortcuts = true;
      if ($.trim($.trim($("#message").val()).substr(5)).split(':').length > 1) {
        if ($.trim($.trim($("#message").val()).substr(5)).split(':')[1] !== "") {
          arrayMsg = $.trim($.trim($("#message").val()).substr(5)).split(':');
          to = arrayMsg[0].trim();
          arrayMsg.splice(0, 1);
          socket.emit('sendMessage', {nickname: $('#username').html(), to: to, channel: null, message: arrayMsg.join(" ")});
          arrayMsg = [];
          to = "";
        } else {
          Materialize.toast('<p class="alert-failed">You can\'t send empty message to ' + $.trim($.trim($("#message").val()).substr(5)).split(':')[0] + ' !!<p>', 2000, 'rounded alert-failed');
          }
        } else {
          if ($.trim($.trim($("#message").val()).substr(5)).split(':')[0] !== "") {
            socket.emit('sendMessage', {nickname: $('#username').html(), to: null, channel: $('#channelName').html(), message: $.trim($.trim($("#message").val()).substr(5))});
          } else {
            Materialize.toast('<p class="alert-failed">You can\'t send empty message !!<p>', 2000, 'rounded alert-failed');
          }
        }
      }
      switch($.trim($("#message").val()).substr(0, 5)) {
        case "/nick":
        keyboardShortcuts = true;
        if ($.trim($.trim($("#message").val()).substr(5)).length < 16) {
          socket.emit('change nickname', {oldNickname : $('#username').html(), newNickname: $.trim($.trim($("#message").val()).substr(5))});
        } else {
          $("#allMessage_" + $('#channelName').html()).append('<div class="messageEvent">You can\'t change your nickname !! New nickname too long (max 15 charracters)</div><div class="mui-divider"></div>');
          $('#allMessage_' +  $('#channelName').html()).niceScroll({cursorwidth: '10px'});
          $('#allMessage_' +  $('#channelName').html()).getNiceScroll().resize();
          $('#allMessage_' +  $('#channelName').html()).animate({ scrollTop: 1000000 }, "slow");
        }
        break;
        case "/list":
        keyboardShortcuts = true;
        socket.emit('listChannel', {channelName: $.trim($.trim($("#message").val()).substr(5))});
        break;
        case "/join":
        keyboardShortcuts = true;
        socket.emit('goInChannel', {nickname: $("#username").html(), channel: $.trim($.trim($("#message").val()).substr(5)), fromChannel: $('#channelName').html()});
        break;
        case "/part":
        keyboardShortcuts = true;
        socket.emit('leaveChannel', {nickname: $('#username').html(), channel: $('#channelName').html()});
        break;
        case "/help":
        keyboardShortcuts = true;
        socket.emit('allShortcuts', {nickname: $('#username').html(), trigger: "message"});
        break;
      }
      if ($.trim($("#message").val()).substr(0, 6) === "/users") {
        keyboardShortcuts = true;
        socket.emit('getUserCurrentChannel', {nickname: $('#username').html(), channel: $('#channelName').html()});
      } else if ($.trim($("#message").val()).substr(0, 11) === "/addChannel") {
        keyboardShortcuts = true;
        if ($.trim($.trim($("#message").val()).substr(11)) === "") {
          $('#allMessage_' + $('#channelName').html()).append('<div class="messageEvent">You can\'t add an empty channel !!</div><div class="mui-divider"></div>');
          $('#allMessage_' +  $('#channelName').html()).niceScroll({cursorwidth: '10px'});
          $('#allMessage_' +  $('#channelName').html()).getNiceScroll().resize();
          $('#allMessage_' +  $('#channelName').html()).animate({ scrollTop: 1000000 }, "slow");
        } else {
          socket.emit('addChannel', {nickname: $('#username').html(), channelName: $.trim($.trim($("#message").val()).substr(11)), fromChannel: $('#channelName').html()});
        }
      } else if ($.trim($("#message").val()).substr(0, 13) === "/allShortcuts") {
        keyboardShortcuts = true;
        socket.emit('allShortcuts', {nickname: $('#username').html(), trigger: "message"});
      } else if (keyboardShortcuts === false) {
        socket.emit('sendMessage', {nickname: $('#username').html(), to: null, channel: $('#channelName').html(), message: $.trim($('#message').val())});
      }
      $("#message").val('');
      $("#sendMessage").attr('disabled', "true");
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
  $('#notifButton').click(function () {
    if ($(this).attr('active') === "yes") {
      $(this).attr('active', 'no');
      $('#notifIcon').html('volume_off');
    } else {
      $(this).attr('active', 'yes');
      $('#notifIcon').html('volume_up');
    }
  });
  $("#remember").change(function () {
    if ($(this).is(':checked') === false) {
      $("#userMood").html('<i class="medium material-icons">mood_bad</i>');
    } else {
      $("#userMood").html('<i class="medium material-icons">mood</i>');
    }
  });
  $('#nickname').keydown(function () {
    if (event.keyCode == 13) {
      if ($.trim($(this).val()) !== "") {
        if ($.trim($('#nickname').val()).match(/ /i) === null && $.trim($('#nickname').val()).match(/:/i) === null) {
          socket.emit('user connection', {nickname: $.trim($('#nickname').val()), channel: $("#channel").val(), remember: $('#remember').is(':checked')});
          $('#nickname').val('');
          $('#channel').val('');
        } else {
          Materialize.toast('<p class="alert-failed">You can\'t have space or : in your nickname !!<p>', 2000, 'rounded alert-failed');
        }
      }
    }
  });
  $('#channel').keydown(function () {
    if (event.keyCode == 13) {
      if ($.trim($('#nickname').val()) !== "") {
        if ($.trim($('#nickname').val()).match(/ /i) === null && $.trim($('#nickname').val()).match(/:/i) === null) {
          socket.emit('user connection', {nickname: $.trim($('#nickname').val()), channel: $("#channel").val(), remember: $('#remember').is(':checked')});
          $('#nickname').val('');
          $('#channel').val('');
        } else {
          Materialize.toast('<p class="alert-failed">You can\'t have space or : in your nickname !!<p>', 2000, 'rounded alert-failed');
        }
      }
    }
  });
  $('#connection').click(function () {
    if ($.trim($('#nickname').val()) !== "") {
      if ($.trim($('#nickname').val()).match(/ /i) === null && $.trim($('#nickname').val()).match(/:/i) === null) {
        socket.emit('user connection', {nickname: $.trim($('#nickname').val()), channel: $("#channel").val(), remember: $('#remember').is(':checked')});
        $('#nickname').val('');
        $('#channel').val('');
      } else {
        Materialize.toast('<p class="alert-failed">You can\'t have space or : in your nickname !!<p>', 2000, 'rounded alert-failed');
      }
    }
  });
  socket.on('user connection', function (data) {
    if (data.error === null) {
      $("#username").html(data.data.nickname);
      $('#countUser').html('There are <span id="numUsers">' + data.data.userLength + '</span> users in the entire irc');
      $('#theBody').html('<div class="row"><div class="mui-panel col s6" id="thePanel"></div><div class="mui-panel col s6" id="thePersonnalPanel"><div id="allPersonnalMessage"><div id="personnalWelcome">Welcome to your personnal chatting room !! Click on the channel\'s name to display all the users who are in this channel ans click on one of them to chat personally with him !!</div><div class="mui-divider"></div></div></div></div><div class="row"><div class="mui-panel"><div class="input-field col s12"><i class="material-icons prefix">chat</i><input type="text" name="message" id="message" maxlength="140" length="140"><label for="message">Message</label><button class="btn waves-effect waves-light btn-flat" id="sendMessage" disabled="true">Send<i class="material-icons right">send</i></button></div><a class="waves-effect waves-light btn modal-trigger" href="#listGif" id="gifButton"><i class="material-icons">gif</i> by Giphy</a><a class="dropdown-button btn smileyButton" data-beloworigin="true" href="#" data-activates="smiley">Add Smiley</a><ul id="smiley" class="dropdown-content"><li id="emoticon" class="emoticons"><a href="#"><img src="img/emoticon.png" alt="emoticon" />:emoticon:</a></li><li id="emoticon-cool" class="emoticons"><a href="#"><img src="img/emoticon-cool.png" alt="emoticon-cool" />:emoticon-cool:</a></li><li id="emoticon-devil" class="emoticons"><a href="#"><img src="img/emoticon-devil.png" alt="emoticon-devil" />:emoticon-devil:</a></li><li id="emoticon-happy" class="emoticons"><a href="#"><img src="img/emoticon-happy.png" alt="emoticon-happy" />:emoticon-happy:</a></li><li id="emoticon-neutral" class="emoticons"><a href="#"><img src="img/emoticon-neutral.png" alt="emoticon-neutral" />:emoticon-neutral:</a></li><li id="emoticon-poop" class="emoticons"><a href="#"><img src="img/emoticon-poop.png" alt="emoticon-poop" />:emoticon-poop:</a></li><li id="emoticon-sad" class="emoticons"><a href="#"><img src="img/emoticon-sad.png" alt="emoticon-sad" />:emoticon-sad:</a></li><li id="emoticon-tongue" class="emoticons"><a href="#"><img src="img/emoticon-tongue.png" alt="emoticon-tongue" />:emoticon-tongue:</a></li></ul><div id="listGif" class="modal bottom-sheet"><div class="modal-content"><h4>Type a text and Giphy will find a gif version of that !!</h4><h5>Click on the image to send to the channel or as a personal message</h5><p><img src="img/giphy.png" alt="powered by giphy" /></p><div class="row"><div class="input-field col s12"><i class="material-icons prefix">gif</i><input id="gifName" type="text"><label for="gifName">Gif Name</label></div></div><div id="gifList"></div></div></div></div></div><div id="sendGif"></div><div class="row"><div class=" mui-panel col s12"><h4>List of channel where you are joined</h4><h5>Click one of them to chat in this channel</h5><ul id="channelsButton"></ul></div></div><audio id="notification" preload="auto"><source src="sound/notification.ogg"></source>This browser does not support the HTML5 audio tag.</audio>');
      $('#thePanel').append('<div class="allMessageChannelActive" id="allMessage_' + $('#channelName').html() + '"><div id="welcomeChannel">Welcome to the channel ' + data.data.channel + ' !!</div><div class="mui-divider"></div></div>');
      $('#channelsButton').append('<li><button class="mui-btn mui-btn--raised channelButton channelButton_' + data.data.channel + '">' + data.data.channel + '</button></li>');
      $('#allMessage_' +  $('#channelName').html()).niceScroll({cursorwidth: '10px'});
      $('#allMessage_' +  $('#channelName').html()).getNiceScroll().resize();
      $('#allMessage_' +  $('#channelName').html()).animate({ scrollTop: 1000000 }, "slow");
      $("#message").on('change paste keyup', function () {
        if ($.trim($(this).val()) === "") {
          $("#sendMessage").attr('disabled', "true");
        } else {
          $("#sendMessage").removeAttr('disabled');
        }
      });
      $('#message').keydown(function () {
        if (event.keyCode == 13) {
          if ($.trim($(this).val()) !== "") {
            sendMessage();
          }
        }
      });
      $("#sendMessage").click(function () {
        sendMessage();
      });
      notification = $('#notification')[0];
      $('.dropdown-button').dropdown({
        inDuration: 300,
        outDuration: 225,
        constrain_width: true,
        hover: false,
        gutter: 0,
        belowOrigin: false,
        alignment: 'left'
        });
      $('.modal-trigger').leanModal();
      $('#gifName').on('change paste keyup',function () {
        displayGifList('#gifName', '#gifList', 0);
      });
      $('.emoticons').click(function () {
        emoticon = $(this).text();
        $('#message').val($('#message').val() + emoticon);
      });
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
        channels = channels + '<li><strong id="' + object.channelName + '">' + object.channelName + '<div class="mui-divider"></div><span class="channelUserLength">' + object.users.length + ' User(s)</span><div id="notif_' + object.channelName + '"></div></strong><ul class="users">';
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
        socket.emit('goInChannel', {nickname: $("#username").html(), channel: $(this).attr('id'), fromChannel: $('#channelName').html()});
      });
    } else {
      Materialize.toast('<p class="alert-failed">' + data.error + '<p>', 4000, 'rounded alert-failed');
    }
  });
  socket.on('new user', function (data) {
    if ($("#username").html() !== "") {
      Materialize.toast('<p class="alert-success">New user connected<p>', 1000, 'rounded alert-success');
      if (data.data.channel === $('#channelName').html()) {
        $("#allMessage_" + $('#channelName').html()).append('<div class="messageEvent"><span class="usernameEvent">' + data.data.nickname + '</span> is connected to this channel</div><div class="mui-divider"></div>');
      }
      $('#countUser').html('There are <span id="numUsers">' + data.data.userLength + '</span> users in the entire irc');
      socket.emit('all channel');
    }
  });
  socket.on('get channel', function (data) {
    if ($("#username").html() !== "") {
      $("#usernameChannelName").html('You are currently in the channel <span id="channelName">' + data.data.channelName + '</span>');
      if (checkDuplicateChannel(data.data.channelName) === false) {
        $('#thePanel').children('div').removeClass('allMessageChannelActive');
        $('#thePanel').children('div').removeClass('allMessageChannel');
        $('#thePanel').children('div').addClass('allMessageChannel');
        $('#thePanel').append('<div class="allMessageChannelActive" id="allMessage_' + $('#channelName').html() + '"><div id="welcomeChannel">Welcome to the channel ' + data.data.channelName + ' !!</div><div class="mui-divider"></div></div>');
        $('#channelsButton').append('<li><button class="mui-btn mui-btn--raised channelButton channelButton_' + data.data.channelName + '">' + data.data.channelName + '</button></li>');
        $('#channelsButton').niceScroll({cursorwidth: '10px'});
        $('#channelsButton').getNiceScroll().resize();
        $('#channelsButton').animate({ scrollTop: 1000000 }, "slow");
        $('#allMessage_' +  $('#channelName').html()).niceScroll({cursorwidth: '10px'});
        $('#allMessage_' +  $('#channelName').html()).getNiceScroll().resize();
        $('#allMessage_' +  $('#channelName').html()).animate({ scrollTop: 1000000 }, "slow");
        $('#allMessage_' + $('#channelName').html()).css('z-index', '999');
      } else {
        $('#thePanel').children('div').removeClass('allMessageChannelActive');
        $('#thePanel').children('div').removeClass('allMessageChannel');
        $('#thePanel').children('div').addClass('allMessageChannel');
        $('#allMessage_' + $('#channelName').html()).removeClass('allMessageChannel');
        $('#allMessage_' + $('#channelName').html()).removeClass('allMessageChannelActive');
        $('#allMessage_' + $('#channelName').html()).addClass('allMessageChannelActive');
        $('#allMessage_' +  $('#channelName').html()).niceScroll({cursorwidth: '10px'});
        $('#allMessage_' +  $('#channelName').html()).getNiceScroll().resize();
        $('#allMessage_' +  $('#channelName').html()).animate({ scrollTop: 1000000 }, "slow");
        $('#allMessage_' + $('#channelName').html()).css('z-index', '999');
      }
      notification = $('#notification')[0];
      $('.dropdown-button').dropdown({
        inDuration: 300,
        outDuration: 225,
        constrain_width: true,
        hover: false,
        gutter: 0,
        belowOrigin: false,
        alignment: 'left'
        });
      $('.modal-trigger').leanModal();
      $('#gifName').on('change paste keyup',function () {
        displayGifList('#gifName', '#gifList', 0);
      });
      $('.emoticons').click(function () {
        emoticon = $(this).text();
        $('#message').val($('#message').val() + emoticon);
      });
      $("#message").on('change paste keyup', function () {
        if ($.trim($(this).val()) === "") {
          $("#sendMessage").attr('disabled', "true");
        } else {
          $("#sendMessage").removeAttr('disabled');
        }
      });
      $("#sendMessage").click(function () {
        sendMessage();
      });
    }
  });
  socket.on('receiveMessage', function (data) {
    if ($("#username").html() !== "") {
      if (data.error === null) {
        if (data.data.userCheckLeave === false) {
          if (data.data.to === $('#username').html()) {
            displayMessage(data.data.nickname, data.data.message, data.data.to, "#allPersonnalMessage", "#allPersonnalMessage");
            if ($('#notifButton').attr('active') === "yes") {
              notification.play();
            }
          } else if ($('#channelName').html() === data.data.channel && data.data.to === $("#username").html()) {
            displayMessage(data.data.nickname, data.data.message, data.data.to, "#allPersonnalMessage", "#allPersonnalMessage");
            if ($('#notifButton').attr('active') === "yes") {
              notification.play();
            }
          } else if (data.data.nickname === $('#username').html() && data.data.to !== null) {
            displayMessage(data.data.nickname, data.data.message, data.data.to, "#allPersonnalMessage", "#allPersonnalMessage");
            if ($('#notifButton').attr('active') === "yes") {
              notification.play();
            }
          } else if ($('#channelName').html() === data.data.channel && data.data.to === null) {
            displayMessage(data.data.nickname, data.data.message, data.data.to, "#allMessage_" + $('#channelName').html(), "#allMessage_" + $('#channelName').html());
            if ($('#notifButton').attr('active') === "yes") {
              notification.play();
            }
          } else {
            for (k = 0; k < listChannelsButton.length; k = k + 1) {
              if (listChannelsButton[k].channelName === data.data.channel) {
                displayMessage(data.data.nickname, data.data.message, data.data.to, "#allMessage_" + data.data.channel, "#allMessage_" + data.data.channel);
                break;
              }
            }
          }
        }
      }
    }
  });
  socket.on('allShortcuts', function (data) {
    displayShortcut(arrayKeyboardShortcuts,  data.trigger, data.data, "#allMessage_" + $('#channelName').html(), "#allMessage_" + $('#channelName').html());
  });
  socket.on('goInChannel', function (data) {
    if ($('#username').html() !== "") {
      if (data.error === null) {
        if (data.nickname === $('#username').html()) {
          $('#channelName').html(data.channel);
          if (checkDuplicateChannel(data.channel) === false) {
            $('#thePanel').children('div').removeClass('allMessageChannelActive');
            $('#thePanel').children('div').removeClass('allMessageChannel');
            $('#thePanel').children('div').addClass('allMessageChannel');
            $('#thePanel').append('<div class="allMessageChannelActive" id="allMessage_' + $('#channelName').html() + '"><div id="welcomeChannel">Welcome to the channel ' + data.channel + ' !!</div><div class="mui-divider"></div></div>');
            $('#channelsButton').append('<li><button class="mui-btn mui-btn--raised channelButton channelButton_' + data.channel + '">' + data.channel + '</button></li>');
            $('#channelsButton').niceScroll({cursorwidth: '10px'});
            $('#channelsButton').getNiceScroll().resize();
            $('#channelsButton').animate({ scrollTop: 1000000 }, "slow");
            $('#allMessage_' + $('#channelName').html()).removeClass('allMessageChannel');
            $('#allMessage_' + $('#channelName').html()).removeClass('allMessageChannelActive');
            $('#allMessage_' + $('#channelName').html()).addClass('allMessageChannelActive');
            $('#allMessage_' +  $('#channelName').html()).niceScroll({cursorwidth: '10px'});
            $('#allMessage_' +  $('#channelName').html()).getNiceScroll().resize();
            $('#allMessage_' +  $('#channelName').html()).animate({ scrollTop: 1000000 }, "slow");
            $('#allMessage_' + $('#channelName').html()).css('z-index', '999');
          } else {
            $('#thePanel').children('div').removeClass('allMessageChannelActive');
            $('#thePanel').children('div').removeClass('allMessageChannel');
            $('#thePanel').children('div').addClass('allMessageChannel');
            $('#allMessage_' + $('#channelName').html()).removeClass('allMessageChannel');
            $('#allMessage_' + $('#channelName').html()).removeClass('allMessageChannelActive');
            $('#allMessage_' + $('#channelName').html()).addClass('allMessageChannelActive');
            $('#allMessage_' +  $('#channelName').html()).niceScroll({cursorwidth: '10px'});
            $('#allMessage_' +  $('#channelName').html()).getNiceScroll().resize();
            $('#allMessage_' +  $('#channelName').html()).animate({ scrollTop: 1000000 }, "slow");
            $('#allMessage_' + $('#channelName').html()).css('z-index', '999');
          }
          notification = $('#notification')[0];
          $('.dropdown-button').dropdown({
            inDuration: 300,
            outDuration: 225,
            constrain_width: true,
            hover: false,
            gutter: 0,
            belowOrigin: false,
            alignment: 'left'
            });
          $('.modal-trigger').leanModal();
          $('#gifName').on('change paste keyup',function () {
            displayGifList('#gifName', '#gifList', 0);
          });
          $('.emoticons').click(function () {
            emoticon = $(this).text();
            $('#message').val($('#message').val() + emoticon);
          });
        } else {
          if (data.channel === $('#channelName').html()) {
            $("#allMessage_" + $('#channelName').html()).append('<div class="messageEvent"><span class="usernameEvent">' + data.nickname + '</span> is connected to this channel</div><div class="mui-divider"></div>');
            $('#allMessage_' +  $('#channelName').html()).niceScroll({cursorwidth: '10px'});
            $('#allMessage_' +  $('#channelName').html()).getNiceScroll().resize();
            $('#allMessage_' +  $('#channelName').html()).animate({ scrollTop: 1000000 }, "slow");
          } else if (data.fromChannel === $('#channelName').html()) {
            $('#allMessage_' + $('#channelName').html()).append('<div class="messageEvent"><span class="usernameEvent">' + data.nickname + '</span> go to another channel !!</div><div class="mui-divider"></div>');
            $('#allMessage_' +  $('#channelName').html()).niceScroll({cursorwidth: '10px'});
            $('#allMessage_' +  $('#channelName').html()).getNiceScroll().resize();
            $('#allMessage_' +  $('#channelName').html()).animate({ scrollTop: 1000000 }, "slow");
          }
        }
        $('.channelButton').click(function () {
          socket.emit('goInChannel', {nickname: $("#username").html(), channel: $(this).text(), fromChannel: $('#channelName').html()});
        });
        socket.emit("all channel");
      } else {
        if (data.error === "channel not found !!") {
          if (data.data.nickname === $('#username').html()) {
            if ($('#channelName').html() !== "") {
              $('#allMessage_' + $('#channelName').html()).append('<div class="messageEvent">The channel <span class="usernameEvent">' + data.data.channel + '</span> wasn\'t found !!</div><div class="mui-divider"></div>');
              $('#allMessage_' + $('#channelName').html()).niceScroll({cursorwidth: '10px'});
              $('#allMessage_' + $('#channelName').html()).getNiceScroll().resize();
              $('#allMessage_' + $('#channelName').html()).animate({ scrollTop: 1000000 }, "slow");
            } else {
              $('.allMessageChannelActive').append('<div class="messageEvent">The channel <span class="usernameEvent">' + data.data.channel + '</span> wasn\'t found !!</div><div class="mui-divider"></div>');
              $('.allMessageChannelActive').niceScroll({cursorwidth: '10px'});
              $('.allMessageChannelActive').getNiceScroll().resize();
              $('.allMessageChannelActive').animate({ scrollTop: 1000000 }, "slow");
            }
          }
        }
      }
    }
  });
  socket.on('change nickname', function (data) {
    if ($('#username').html() !== "") {
      if (data.error === null) {
        if (data.data.oldNickname === $('#username').html()) {
          $('#username').html(data.data.newNickname);
          $('#allMessage_' + $('#channelName').html()).append('<div class="messageEvent">You change your nickname to <span class="usernameEvent">' + data.data.newNickname + '</span></div><div class="mui-divider"></div>');
          $('#allMessage_' + $('#channelName').html()).niceScroll({cursorwidth: '10px'});
          $('#allMessage_' + $('#channelName').html()).getNiceScroll().resize();
          $('#allMessage_' + $('#channelName').html()).animate({ scrollTop: 1000000 }, "slow");
        } else {
          $.each(data.data.allChannel, function (index, channel) {
            if (channel.channelName === $('#channelName').html()) {
              $.each(channel.users, function (num, user) {
                if (user === data.data.newNickname) {
                  if ($('#channelName').html() !== "") {
                    $('#allMessage_' + $('#channelName').html()).append('<div class="messageEvent"><span class="usernameEvent">' + data.data.oldNickname + '</span> change his nickname to <span class="usernameEvent">' + data.data.newNickname + '</span></div><div class="mui-divider"></div>');
                    $('#allMessage_' + $('#channelName').html()).niceScroll({cursorwidth: '10px'});
                    $('#allMessage_' + $('#channelName').html()).getNiceScroll().resize();
                    $('#allMessage_' + $('#channelName').html()).animate({ scrollTop: 1000000 }, "slow");
                  } else {
                    $('.allMessageChannelActive').append('<div class="messageEvent">The channel <span class="usernameEvent">' + data.data.channel + '</span> wasn\'t found !!</div><div class="mui-divider"></div>');
                    $('.allMessageChannelActive').niceScroll({cursorwidth: '10px'});
                    $('.allMessageChannelActive').getNiceScroll().resize();
                    $('.allMessageChannelActive').animate({ scrollTop: 1000000 }, "slow");
                  }
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
  socket.on('listChannel', function (data) {
    listChannels = '';
    if ($('#username').html() !== "") {
      if (data.data.channelName === "") {
        listChannels = '<div class="messageEvent">Here all channels :<br>';
        $.each(data.data.listChannel, function (index, channel) {
          listChannels = listChannels + '<span class="usernameEvent">' + channel + '</span><br>';
        });
        listChannels = listChannels + '</div><div class="mui-divider"></div>';
        if ($('#channelName').html() !== "") {
          $('#allMessage_' + $('#channelName').html()).append(listChannels);
          $('#allMessage_' + $('#channelName').html()).niceScroll({cursorwidth: '10px'});
          $('#allMessage_' + $('#channelName').html()).getNiceScroll().resize();
          $('#allMessage_' + $('#channelName').html()).animate({ scrollTop: 1000000 }, "slow");
        } else {
          $('.allMessageChannelActive').append(listChannels);
          $('.allMessageChannelActive').niceScroll({cursorwidth: '10px'});
          $('.allMessageChannelActive').getNiceScroll().resize();
          $('.allMessageChannelActive').animate({ scrollTop: 1000000 }, "slow");
        }
        listChannels = '';
      } else {
        if (data.data.listChannel.length === 0) {
          $('#allMessage_' + $('#channelName').html()).append('<div class="messageEvent">No channel found with <span class="usernameEvent">' + data.data.channelName + '</span> :(</div><div class="mui-divider"></div>');
          $('#allMessage_' + $('#channelName').html()).niceScroll({cursorwidth: '10px'});
          $('#allMessage_' + $('#channelName').html()).getNiceScroll().resize();
          $('#allMessage_' + $('#channelName').html()).animate({ scrollTop: 1000000 }, "slow");
        } else {
          listChannels = '';
          listChannels = '<div class="messageEvent">Here are the channels that contain <span class="usernameEvent">' + data.data.channelName + '</span> :<br>';
          $.each(data.data.listChannel, function (index, channel) {
            listChannels = listChannels + '<span class="usernameEvent">' + channel + '</span><br>';
          });
          listChannels = listChannels + '</div><div class="mui-divider"></div>';
          listChannels = '';
          if ($('#channelName').html() !== "") {
            $('#allMessage_' + $('#channelName').html()).append(listChannels);
            $('#allMessage_' + $('#channelName').html()).niceScroll({cursorwidth: '10px'});
            $('#allMessage_' + $('#channelName').html()).getNiceScroll().resize();
            $('#allMessage_' + $('#channelName').html()).animate({ scrollTop: 1000000 }, "slow");
          } else {
            $('.allMessageChannelActive').append(listChannels);
            $('.allMessageChannelActive').niceScroll({cursorwidth: '10px'});
            $('.allMessageChannelActive').getNiceScroll().resize();
            $('.allMessageChannelActive').animate({ scrollTop: 1000000 }, "slow");
          }
        }
      }
    }
  });
  socket.on('getUserCurrentChannel', function (data) {
    if ($('#username').html() !== "") {
      if (data.error === null) {
        listUserCurrentChannel = '';
        listUserCurrentChannel = listUserCurrentChannel + '<div class="messageEvent">Here are all users in the channel <span class="usernameEvent">' + $("#channelName").html() + '</span> :<br>';
        $.each(data.data, function (index, nickname) {
          listUserCurrentChannel = listUserCurrentChannel + '<span class="usernameEvent">' + nickname + '</span><br>';
        });
        listUserCurrentChannel = listUserCurrentChannel + '</div><div class="mui-divider"></div>';
        $('#allMessage_' + $('#channelName').html()).append(listUserCurrentChannel);
        listUserCurrentChannel = '';
        $('#allMessage_' + $('#channelName').html()).niceScroll({cursorwidth: '10px'});
        $('#allMessage_' + $('#channelName').html()).getNiceScroll().resize();
        $('#allMessage_' + $('#channelName').html()).animate({ scrollTop: 1000000 }, "slow");
      }
    }
  });
  socket.on('leaveChannel', function (data) {
    if ($('#username').html() !== "") {
      if (data.error === null) {
        if (data.data.nickname === $('#username').html()) {
          if ($('.channelButton_' + data.data.channel).text() === data.data.channel) {
            $('.channelButton_' + data.data.channel).remove();
            if ($('.channelButton').length > 0) {
              $("#channelName").html($('.channelButton')[$('.channelButton').length - 1].innerHTML);
            } else {
              $('#allMessage_' + $('#channelName').html()).append('<div class="messageEvent">You are in any channel now, you can\'t send message to user, leave a channel and list all users until you join another channel</div><div class="mui-divider"></div>');
              $('#allMessage_' +  $('#channelName').html()).niceScroll({cursorwidth: '10px'});
              $('#allMessage_' +  $('#channelName').html()).getNiceScroll().resize();
              $('#allMessage_' +  $('#channelName').html()).animate({ scrollTop: 1000000 }, "slow");
              $('#channelName').html('');
              $('#sendMessage').attr('disabled', 'true');
            }
          }
        } else {
          if (data.data.channel === $('#channelName').html()) {
            $('#allMessage_' + $('#channelName').html()).append('<div class="messageEvent"><span class="usernameEvent">' + data.data.nickname + '</span> left the channel</div><div class="mui-divider"></div>');
            $('#allMessage_' +  $('#channelName').html()).niceScroll({cursorwidth: '10px'});
            $('#allMessage_' +  $('#channelName').html()).getNiceScroll().resize();
            $('#allMessage_' +  $('#channelName').html()).animate({ scrollTop: 1000000 }, "slow");
          }
        }
        socket.emit('all channel');
      }
    }
  });
  socket.on('addChannel', function (data) {
    if ($('#username').html() !== "") {
      if (data.error === null) {
        socket.emit('all channel');
        if (data.data.nickname === $('#username').html()) {
          socket.emit('goInChannel', {nickname: $("#username").html(), channel: data.data.channelName, fromChannel: $('#channelName').html()});
          $('#channelsButton').append('<li><button class="mui-btn mui-btn--raised channelButton channelButton_' + data.data.channelName + '">' + data.data.channelName + '</button></li>');
          $('#channelsButton').niceScroll({cursorwidth: '10px'});
          $('#channelsButton').getNiceScroll().resize();
          $('#channelsButton').animate({ scrollTop: 1000000 }, "slow");
        } else if (data.data.fromChannel === $('#channelName').html()) {
          $('#allMessage_' + $('#channelName').html()).append('<div class="messageEvent"><span class="usernameEvent">' + data.data.nickname + '</span> create the channel <span class="usernameEvent">' + data.data.channelName + '</span></div><div class="mui-divider"></div>');
          $('#allMessage_' +  $('#channelName').html()).niceScroll({cursorwidth: '10px'});
          $('#allMessage_' +  $('#channelName').html()).getNiceScroll().resize();
          $('#allMessage_' +  $('#channelName').html()).animate({ scrollTop: 1000000 }, "slow");
        }
      }
    }
  });
  setInterval(function (){
    Materialize.showStaggeredList('#channelsButton');
  }, 2500);
  $(window).bind('beforeunload', function (){
    if ($('#username').html() !== "") {
      socket.emit('leaveIRC', {nickname: $('#username').html(), channelName: $('#channelName').html()});
    }
  });
  socket.on('leaveIRC', function (data) {
    if ($('#username').html() !== "") {
      userNum = $('#numUsers').html() - 1;
      $('#numUsers').html(userNum);
      socket.emit('all channel');
      if ($('#channelName').html() === data.data.channelName) {
        $('#allMessage_' + $('#channelName').html()).append('<div class="messageEvent"><span class="usernameEvent">' + data.data.nickname + '</span> quit the IRC !!</div><div class="mui-divider"></div>');
        $('#allMessage_' +  $('#channelName').html()).niceScroll({cursorwidth: '10px'});
        $('#allMessage_' +  $('#channelName').html()).getNiceScroll().resize();
        $('#allMessage_' +  $('#channelName').html()).animate({ scrollTop: 1000000 }, "slow");
      }
    }
  });
});