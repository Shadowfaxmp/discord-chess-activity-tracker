import {fetchUserStats, getRandomWinMsg, getRandomLoseMsg} from "./chessUtils.js";
import {sendMessageToChannel} from "./app.js";
import * as console from "node:console";

export async function sendUpdateMessages(channel_id, dbUsers) {

    console.log('sending updates');
    let ratings = await getInitialStats(dbUsers);
    const checkAndSendUpdates = async () => {
        for (const user of dbUsers) {
            const currentUser = user.chess_username;

            try {
                const profile = await fetchUserStats(currentUser);
                const timeControls = ['chess_blitz', 'chess_bullet', 'chess_rapid'];

                for (const type of timeControls) {
                    const currentRating = profile[type].last.rating;
                    const lastRating = ratings.get(currentUser)[type].last.rating;

                    if (currentRating !== lastRating) {
                        const ratingChange = currentRating - lastRating;
                        console.log(`Current ${type} rating: ${currentRating} -- Last cached rating: ${lastRating}`);

                        if (currentRating < lastRating) {
                            console.log(`${currentUser} just lost ${Math.abs(ratingChange)} points in ${type} rating`);
                            await sendMessageToChannel(channel_id, getRandomLoseMsg(type, currentUser, ratingChange, currentRating));
                        } else {
                            console.log(`${currentUser} just gained ${ratingChange} points in ${type} rating`);
                            await sendMessageToChannel(channel_id, getRandomWinMsg(type, currentUser, ratingChange, currentRating));
                        }
                        // Update the cached profile once a change is detected.
                        ratings.set(currentUser, profile);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    await checkAndSendUpdates(); // Initial check

    setInterval(async () => {
        await checkAndSendUpdates(); // Recheck every 10 seconds
    }, 10000);
}
async function getInitialStats(dbUsers) {
    const ratings = new Map;
    for (const user of dbUsers) {
        ratings.set(user.chess_username, await fetchUserStats(user.chess_username));
    }
    return ratings;
}