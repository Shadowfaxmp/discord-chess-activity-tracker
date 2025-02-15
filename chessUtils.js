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
