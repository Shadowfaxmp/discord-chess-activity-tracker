import {get_chess_stats, get_most_recent_game, get_game_result} from "./chessUtils.js";
import {getRandomWinMsg, getRandomLoseMsg, getRandomDrawMsg} from "./messages.js";
import {send_message_to_channel} from "./app.js";
import * as console from "node:console";
import { clubMembers } from "./club_members.js";





export async function check_for_updates(channel_id){
    console.log('Sending updates...');

    let userRatingsMap = await get_most_recent_stats();
    // Function to check for updates
    const checkAndSendUpdates = async () => {

        for (const username of clubMembers) {
            try {
                let most_recent_game = "";
                const profile = await get_chess_stats(username);
                const mostRecentGame = await get_most_recent_game(username);

                if (mostRecentGame && mostRecentGame.url) {
                    most_recent_game = mostRecentGame.url;
                }

                const newRatings = {
                    chess_bullet: profile?.chess_bullet?.last?.rating || 0,
                    chess_blitz: profile?.chess_blitz?.last?.rating || 0,
                    chess_rapid: profile?.chess_rapid?.last?.rating || 0,
                    recent_game: most_recent_game
                };

                const lastRating = userRatingsMap.get(username);

                if (!lastRating || newRatings.recent_game !== lastRating.recent_game) {

                    console.log(`New game detected for ${username}`);
                    // Determine the rating change
                    const time_control = mostRecentGame?.time_class;
                    let ratingChange = 0;
                    let new_rating = 0;

                    if (time_control === "rapid") {
                        ratingChange = newRatings.chess_rapid - (lastRating?.chess_rapid || 0);
                        new_rating = newRatings.chess_rapid;
                    } else if (time_control === "blitz") {
                        ratingChange = newRatings.chess_blitz - (lastRating?.chess_blitz || 0);
                        new_rating = newRatings.chess_blitz;
                    } else if (time_control === "bullet") {
                        ratingChange = newRatings.chess_bullet - (lastRating?.chess_bullet || 0);
                        new_rating = newRatings.chess_bullet;
                    }

                    const game_result = get_game_result(username, mostRecentGame);

                    if (game_result.result === "loss") {
                        console.log(`${username} lost ${Math.abs(ratingChange)} points in ${time_control}`);
                        await send_message_to_channel(channel_id, getRandomLoseMsg(time_control, username, ratingChange, new_rating, mostRecentGame.url, game_result.loss_type));
                    } else if (game_result.result === "win") {
                        console.log(`${username} gained ${ratingChange} points in ${time_control}`);
                        await send_message_to_channel(channel_id, getRandomWinMsg(time_control, username, ratingChange, new_rating, mostRecentGame.url, game_result.loss_type));
                    } else if (game_result.result === "draw") {
                        await send_message_to_channel(channel_id, getRandomDrawMsg(time_control, username, ratingChange, new_rating, mostRecentGame.url));
                    }

                    // Update hashmap with new ratings
                    userRatingsMap.set(username, newRatings);
                }

            } catch (error) {
                console.error(`Error processing ${username}:`, error);
            }
        }
    };

    await checkAndSendUpdates(); // Initial check

    setInterval(async () => {
        await checkAndSendUpdates(); // Recheck every 10 seconds
    }, 20000);
}


async function get_most_recent_stats() {

    let user_rating_map = new Map();

    for (const user of clubMembers) {
        let most_recent_game = ``; // Default to 0 in case of an error

        try {
            const mostRecentGame = await get_most_recent_game(user);
            if (mostRecentGame && mostRecentGame.url) {
                most_recent_game = mostRecentGame.url;
            }
        } catch (error) {
            console.error(`Error fetching most recent game for ${user}:`, error);
        }

        let userStats;
        try {
            userStats = await get_chess_stats(user);
        } catch (error) {
            console.error(`Error fetching stats for ${user}:`, error);
            continue; // Skip this user if stats can't be fetched
        }

        const userRatings = {
            chess_bullet: userStats?.chess_bullet?.last?.rating || 0,
            chess_blitz: userStats?.chess_blitz?.last?.rating || 0,
            chess_rapid: userStats?.chess_rapid?.last?.rating || 0,
            recent_game: most_recent_game
        };

        user_rating_map.set(user, userRatings);
    }
    return user_rating_map;
}
