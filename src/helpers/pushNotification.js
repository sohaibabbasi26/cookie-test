const { Op, Sequelize } = require("sequelize");
const firebaseAdmin = require("../configurations/firebaseConfig");
const {
  getTimeZone,
  getCurrentTimeForTimezone,
  getCurrentDayForTimezone,
  formatDateForTimezone,
} = require("./timezoneHelpers");
const { Reminders, User, Notification } = require("../models/associations");

const sendNotification = async (pushNotification, tokens, title, body) => {
  console.log(pushNotification, "push");
  const results = [];

  if (pushNotification) {
    console.log(tokens, "tokens");

    for (const token of tokens) {

      console.log("[Message]:",{
        notification: {
          title,
          body: "You had a reminder set up for now!",
        },
        token,
      });
      const message = {
        notification: {
          title,
          body: "You had a reminder set up for now!",
        },
        token,
      };

      try {
        const response = await firebaseAdmin.messaging().send(message);
        console.log(`Notification sent successfully to ${token}:`, response);
        results.push({ token, success: true, response });
      } catch (error) {
        console.error(`Error sending notification to ${token}:`, error);
        results.push({ token, success: false, error });
      }
    }

    const notificationCreationQuery = await Notification.create({
      userId: body?.userId,
      title: "Reminder! Daily Affirmation",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus mollis, libero sed fermentum bibendum.",
      type: "new",
    });

    console.log("[NOTIFICATION CREATED FOR USER]:", notificationCreationQuery);
    console.log(`Notification sent successfully`);
  } else {
    console.log("notification off");
    results.push({ success: false });
  }
  return results;
};

async function checkAndSendReminders() {
  try {
    const uniqueTimezones = await User.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("timezone")), "timezone"],
      ],
      raw: true,
    });

    console.log(
      `Processing reminders for ${uniqueTimezones.length} different timezones`,
      uniqueTimezones
    );

    for (const { timezone } of uniqueTimezones) {
      console.log(timezone, "timezone");

      const currentTime = getCurrentTimeForTimezone(timezone || "Asia/Karachi");
      const currentDay = getCurrentDayForTimezone(timezone || "Asia/Karachi");
      const today = formatDateForTimezone(timezone || "Asia/Karachi");

      console.log(
        `Checking timezone: ${timezone} - Time: ${currentTime}, Day: ${currentDay}`
      );

      const reminders = await Reminders.findAll({
        where: {
          isActive: true,
          time: currentTime,
          [Op.or]: [
            { specificDate: today },
            {
              [Op.or]: [
                { repeatType: { [Op.ne]: "" } },
                { repeatDays: { [Op.contains]: [currentDay] } },
              ],
            },
          ],
        },
        include: [
          {
            model: User,
            as: "user", 
            where: { timezone: timezone },
            // attributes: ["userId", "name", "notificationEnability"],
          },
        ],
      });

      console.log(
        `Found ${reminders.length} reminders for timezone ${timezone}`
      );

      for (const reminder of reminders) {
        try {
          const user = reminder.user;
          console.log(
            "[USER has enabled the push notifications]:",
            user?.notificationEnability
          );
          console.log("[fcm token list]:", user?.fcmToken);
          console.log("[reminder]:",reminder);
  
          if (user?.notificationEnability) {
            await sendNotification(
              user.notificationEnability,
              user?.fcmToken,
              `Reminder! Daily Affirmation`,
              user
            );
          }
        } catch (error) {
          console.error(
            `Error sending notification for reminder ${reminder.reminderId}:`,
            error
          );
        }
      }
    }

    return {
      status: 200,
      message: "Reminder check completed for all timezones",
    };
  } catch (error) {
    console.error("Error in checkAndSendReminders:", error);
    return {
      status: 500,
      error: error.message,
    };
  }
}

module.exports = { sendNotification, checkAndSendReminders };
