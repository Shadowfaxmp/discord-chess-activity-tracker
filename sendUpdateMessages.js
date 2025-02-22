import {fetchUserStats, getRandomWinMsg, getRandomLoseMsg, fetchUserMostRecentGame} from "./chessUtils.js";
import {sendMessageToChannel, updateRatings, getUserRating} from "./app.js";
import * as console from "node:console";

export async function sendUpdateMessages(channel_id, dbUsers) {

    console.log('sending updates');
    await get_most_recent_stats(dbUsers);
    const checkAndSendUpdates = async () => {
        for (const user of dbUsers) {
            const currentUser = user.chess_username;

            try {
                const profile = await fetchUserStats(currentUser);

                const mostRecentGame = await fetchUserMostRecentGame(currentUser);
                const newRatings = {
                    chess_bullet: profile.chess_bullet.last.rating,
                    chess_blitz: profile.chess_blitz.last.rating,
                    chess_rapid: profile.chess_rapid.last.rating,
                    recent_game: mostRecentGame.url
                }

                const lastRating = await getUserRating(user.chess_username);

                if (newRatings.recent_game !== lastRating.recent_game) {
                    const ratingChange = currentRating - lastRating;
                    console.log(`Current ${type} rating: ${currentRating} -- Last cached rating: ${lastRating}`);

                        if (currentRating < lastRating) {
                            console.log(`${currentUser} just lost ${Math.abs(ratingChange)} points in ${type} rating`);
                            await sendMessageToChannel(channel_id, getRandomLoseMsg(mostRecentGame.time_class, currentUser, ratingChange, currentRating, mostRecentGame.url));
                        } else {
                            console.log(`${currentUser} just gained ${ratingChange} points in ${type} rating`);
                            await sendMessageToChannel(channel_id, getRandomWinMsg(mostRecentGame.time_class, currentUser, ratingChange, currentRating, mostRecentGame.url));
                        }
                        // Update the cached profile once a change is detected.
                        await updateRatings(user.chess_username, newRatings)
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
async function get_most_recent_stats(dbUsers) {
    for (const user of dbUsers) {
        const mostRecentGame = await fetchUserMostRecentGame(user.chess_username);
        const userStats = await fetchUserStats(user.chess_username);
        const userRatings = {
            chess_bullet: userStats.chess_bullet.last.rating,
            chess_blitz: userStats.chess_blitz.last.rating,
            chess_rapid: userStats.chess_rapid.last.rating,
            recent_game: mostRecentGame.url
        };

        updateRatings(user.chess_username, userRatings);
    }
}