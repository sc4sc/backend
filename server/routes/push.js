const {Expo} = require('expo-server-sdk');
const expo = new Expo();

async function checkAlarmResult(tickets) {
    let receiptIds = [];
    for (let ticket of tickets) {
        // NOTE: Not all tickets have IDs; for example, tickets for notifications
        // that could not be enqueued will have error information and no receipt ID.
        if (ticket.id) {
            receiptIds.push(ticket.id);
        }
    }

    let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    (async () => {
        // Like sending notifications, there are different strategies you could use
        // to retrieve batches of receipts from the Expo service.
        for (let chunk of receiptIdChunks) {
            try {
            let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
            console.log(receipts);

            // The receipts specify whether Apple or Google successfully received the
            // notification and information about an error, if one occurred.
            for (let receipt of receipts) {
                if (receipt.status === 'ok') {
                    continue;
                } else if (receipt.status === 'error') {
                    console.error(`There was an error sending a notification: ${receipt.message}`);
                    if (receipt.details && receipt.details.error) {
                        // The error codes are listed in the Expo documentation:
                        // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
                        // You must handle the errors appropriately.
                        if (receipt.details.error === "MessageRateExceeded") {

                        } else {
                            console.error(`The error code is ${receipt.details.error}`);
                        }
                    }
                }
            }
            } catch (error) {
                console.error(error);
            }
        }
    })();
}

exports.push = function(title, type, building, pushTokenList) {

    // Create the messages that you want to send to clents
    var messages = [];
    for (let pushToken of pushTokenList) {
        // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

        // Check that all your push tokens appear to be valid Expo push tokens
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            continue;
        };

        // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
        messages.push({
            to: pushToken,
            sound: 'default',
            priority: "high",
            title: title,
            body: building+"에서 "+type+" 발생",
        });
    };

    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    (async () => {
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
        try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log(ticketChunk);
            tickets.push(...ticketChunk);
            // NOTE: If a ticket contains an error code in ticket.details.error, you
            // must handle it appropriately. The error codes are listed in the Expo
            // documentation:
            // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
        } catch (error) {
            console.error(error, "PUSH ALARM FAIL");
        }
    }
    })();

};