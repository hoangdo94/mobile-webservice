var pushbots = require('pushbots');

function sendPushNotification(userId, data) {
  var Pushbots = new pushbots.api({
    id: '5735edbd4a9efa91a18b4567',
    secret: 'd22ee26a74cf0e4e2290ef9ecae502f6'
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
