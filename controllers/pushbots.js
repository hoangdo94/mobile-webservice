var pushbots = require('pushbots');

function sendPushNotification(userId, data) {
  var Pushbots = new pushbots.api({
    id: '',
    secret: ''
  });

  if (data.message) {
    Pushbots.setMessage(data.message);
  }

  if (data.fields) {
    Pushbots.customFields(data.fields);
  }

  if (data.title) {
    Pushbots.customNotificationTitle(data.title);
  }

  Pushbots.sendByAlias(userId);

  Pushbots.push(function(response) {
    console.log('Pushbots', response);
  });

}

module.exports = {
  sendPushNotification: sendPushNotification
};
