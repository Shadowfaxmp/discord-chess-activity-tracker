import {fetchUserStats} from "./chessUtils.js";
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
                const current_blitz_rating = profile.chess_blitz.last.rating;
                const last_blitz_rating = ratings.get(currentUser).chess_blitz.last.rating;
                if(current_blitz_rating !== last_blitz_rating) {
                    console.log(`Current rating ${last_blitz_rating} -- Last Cached rating ${last_blitz_rating}`)
                    const rating_change = current_blitz_rating - last_blitz_rating;
                    if(current_blitz_rating < last_blitz_rating) {
                        console.log(`${currentUser} just lost ${Math.abs(rating_change)} points in blitz rating`);
                        await sendMessageToChannel(channel_id, `${currentUser} just lost ${Math.abs(rating_change)} points in blitz rating. New blitz rating: ${current_blitz_rating}`);
                    } else {
                        console.log(`${currentUser} just gained ${rating_change} in blitz rating`);
                        await sendMessageToChannel(channel_id, `${currentUser} just gained ${rating_change} in blitz rating! New blitz rating: ${current_blitz_rating}`);
                    }
                    ratings.set(currentUser, profile);
                } else {
                    console.log('No rating change');
                }
            } catch (error) {
                console.log(error);
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