const OneSignal = require("@onesignal/node-onesignal");
const mongoose = require("mongoose");
const Device = mongoose.model("Device");
const Notification = mongoose.model("Notification");
const User = mongoose.model("User");
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;

const ONESIGNAL_REST_API_KEY = {
  getToken() {
    return process.env.ONESIGNAL_REST_API_KEY;
  }
};
const configuration = OneSignal.createConfiguration({

  restApiKey: process.env.ONESIGNAL_REST_API_KEY,
  authMethods: {
    rest_api_key: { tokenProvider: ONESIGNAL_REST_API_KEY }
  }
});
const client = new OneSignal.DefaultApi(configuration);

async function sendNotification(content, player_ids, title,notifictone) {
  try {
    const notification = new OneSignal.Notification();
    notification.app_id = ONESIGNAL_APP_ID;
    notification.include_subscription_ids = player_ids;
    notification.contents = {
      en: content,
    };
    if (title) {
      notification.headings = {
        en: title,
      };
    }
    if (notifictone) {
      notification.ios_sound=`ordersreceived.wav`;
      notification.android_sound='ordersreceived';
      notification.android_channel_id='12231fc9-0051-4da5-a143-af0f1afb70f6'
    } else{
      notification.ios_sound=`drivernotif.wav`;
      notification.android_sound='drivernotif';
      notification.android_channel_id='1f916eb4-0392-4d8c-9616-8ac7008a729a'
    }
    notification.name = "Bodmass";
    return await client.createNotification(notification);
  } catch (err) {
    console.log("error in send notification", content);
    console.error("error in send notification", err);
  }
}
async function findDevices(user) {
  const devices = await Device.find({ user });
  return devices.map((d) => d.player_id);
}

module.exports = {
  notify: async (user,title,content,notifictone) => {
    const player_ids = await findDevices(user);
    // console.log('player_ids====>', player_ids)
    const notObj = { for: user, description: content, title: title };
    console.log('notobj',notObj)
    await Notification.create(notObj);
    return sendNotification(content, player_ids, title,notifictone);
  },
  notifyAllUser: async (users, content, job = null, title) => {
    
    // if (!title) {
    //   const offer = await OFFER.findById(job);
    //   title = offer.offername;
    // }
    const devices = await User.find();
    console.log("devices===========>", devices);
    const player_ids = devices.map((d) => d._id);

    const notObj = { for: player_ids, description: content, title: title };
    if (job) notObj.invited_for = job;
    await Notification.create(notObj);

    return;
    // sendNotification(content, player_ids, title);
  },
};
