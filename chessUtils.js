//API link for game archive of a player
//https://api.chess.com/pub/player/shadowfaxknight/games/2025/02

export async function fetchPlayerRecentGames(userName) {
    const url = `https://api.chess.com/pub/player/${userName.toLowerCase()}/games/2025/02`;

    return await getResponse(url);
}

export async function fetchUserStats(userName) {
    const url = `https://api.chess.com/pub/player/${userName.toLowerCase()}/stats`;

    return await getResponse(url);
}

export async function fetchUserProfile(username) {
    const url = `https://api.chess.com/pub/player/${username.toLowerCase()}`;

    return await getResponse(url);
}

async function getResponse(link) {
    try {
        const response = await fetch(link);
        return response.json();
    } catch (error) {
        console.log(error);
        return null;
    }
}

export function getRandomWinMsg(timeControl, username, ratingChange, newRating) {
    const randomWinMessages = [
        `${username} just lost ${Math.abs(ratingChange)} points in ${timeControl} rating. New ${timeControl} rating: ${newRating}`,
        `Boom! ${username} just leveled up by ${Math.abs(ratingChange)} points in ${timeControl}. New rating: ${newRating}. Who needs Stockfish?`,
        `Look out, ${username} just gained ${Math.abs(ratingChange)} points and now rocking a ${newRating} ${timeControl} rating!`,
        `${username} just bullied an orphan for ${Math.abs(ratingChange)} points of ${timeControl} rating. New ${timeControl} rating: ${newRating}. Was it worth it?`,
        `${username} isn't beating the cheating allegations. ${username.charAt(0).toUpperCase() + username.slice(1).toLowerCase()} just got +${Math.abs(ratingChange)} ${timeControl} rating`
    ];

    return randomWinMessages[Math.floor(Math.random() * randomWinMessages.length)];
}

export function getRandomLoseMsg(timeControl, username, ratingChange, newRating) {
    const randomLoseMessages = [
        `${username} just lost to a small child. Lost ${Math.abs(ratingChange)} points in ${timeControl} rating. New ${timeControl} rating: ${newRating}`,
        `${username} just threw again. Lost ${Math.abs(ratingChange)} points in ${timeControl} rating. New ${timeControl} rating: ${newRating}`,
        `${username} just lost ${Math.abs(ratingChange)} points in ${timeControl} rating. Maybe it's time to consider retirement... New ${timeControl} rating: ${newRating}`,
        `There are three guarantees in life: death, taxes, and ${username} losing ${timeControl} games. ${username} lost ${ratingChange} ${timeControl} rating. (New rating: ${newRating})`,
        `Not many things are certain in life, but one thing definitely is — ${username} losing chess games. ${username} just lost ${ratingChange} ${timeControl} rating. New ${timeControl} rating: ${newRating}`,
    ];
    return randomLoseMessages[Math.floor(Math.random() * randomLoseMessages.length)];
}