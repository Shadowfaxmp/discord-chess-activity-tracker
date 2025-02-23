import {fetchUserStats, getRandomWinMsg, getRandomLoseMsg, fetchUserMostRecentGame, get_game_result} from "./chessUtils.js";
import {sendMessageToChannel, updateRatings, getUserRating} from "./app.js";
import * as console from "node:console";

export async function sendUpdateMessages(channel_id, dbUsers) {
    console.log('sending updates');
    await get_most_recent_stats(dbUsers);
    const checkAndSendUpdates = async () => {
        console.log('Checking for changes');
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
                    const time_control = mostRecentGame.time_class;
                    let ratingChange = 0;
                    let new_rating = 0;

                    if(time_control === "rapid") {

                        ratingChange = newRatings.chess_rapid - lastRating.chess_rapid;
                        new_rating = newRatings.chess_rapid;

                    } else if (time_control === "blitz") {

                        ratingChange = newRatings.chess_blitz - lastRating.chess_blitz;
                        new_rating = newRatings.chess_blitz;

                    } else if (time_control === "bullet") {

                        ratingChange = newRatings.chess_bullet - lastRating.chess_bullet;
                        new_rating = newRatings.chess_bullet;

                    }

                    const game_result = get_game_result(user.chess_username, mostRecentGame);

                    if (game_result === "loss") {
                        console.log(`${currentUser} just lost ${Math.abs(ratingChange)} points in ${time_control} rating`);
                        await sendMessageToChannel(channel_id, getRandomLoseMsg(time_control, currentUser, ratingChange, new_rating, mostRecentGame.url));
                    } else if(game_result === "win"){
                        console.log(`${currentUser} just gained ${ratingChange} points in ${time_control} rating`);
                        await sendMessageToChannel(channel_id, getRandomWinMsg(time_control, currentUser, ratingChange, new_rating, mostRecentGame.url));
                    } else if(game_result === "draw") {
                        await sendMessageToChannel(channel_id, getRandomWinMsg(time_control, currentUser, ratingChange, new_rating, mostRecentGame.url));
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