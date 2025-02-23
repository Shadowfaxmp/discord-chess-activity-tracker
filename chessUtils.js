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

export async function fetchUserMostRecentGame(username) {
    const mostRecentGames = await fetchPlayerRecentGames(username);
    return mostRecentGames.games[mostRecentGames.games.length-1];
}

export function get_game_result(player, game) {
    if (game.black.username === player && game.black.result === "win" || game.white.username === player && game.white.result === "win") {
        return "win"
    } else if((game.black.username === player && (game.black.result === "checkmated" || game.black.result === "resigned" || game.black.result === "timeout" || game.black.result === "abandoned" || game.black.result === "lose")) ||
        (game.white.username === player && (game.white.result === "checkmated" || game.white.result === "resigned" || game.white.result === "timeout" || game.white.result === "abandoned" || game.white.result === "lose"))) {
        return "loss"
    } else {
        return "draw"
    }
}

export function getRandomWinMsg(timeControl, username, ratingChange, newRating, gameUrl) {
    const randomWinMessages = [
        `${username} just lost ${Math.abs(ratingChange)} points in ${timeControl} rating. New ${timeControl} rating: ${newRating}`,
        `Boom! ${username} just leveled up by ${Math.abs(ratingChange)} points in ${timeControl}. New rating: ${newRating}. Who needs Stockfish?`,
        `Look out, ${username} just gained ${Math.abs(ratingChange)} points and now rocking a ${newRating} ${timeControl} rating!`,
        `${username} just bullied an orphan for ${Math.abs(ratingChange)} points of ${timeControl} rating. New ${timeControl} rating: ${newRating}. Was it worth it?`,
        `${username} isn't beating the cheating allegations. ${username.charAt(0).toUpperCase() + username.slice(1).toLowerCase()} just got +${Math.abs(ratingChange)} ${timeControl} rating`
    ];

    return randomWinMessages[Math.floor(Math.random() * randomWinMessages.length)] + `\nCheck out the game here! ${gameUrl}`;
}

export function getRandomLoseMsg(timeControl, username, ratingChange, newRating, gameUrl) {
    const randomLoseMessages = [
        `${username} just lost to a small child. Lost ${Math.abs(ratingChange)} points in ${timeControl} rating. New ${timeControl} rating: ${newRating}`,
        `${username} just threw again. Lost ${Math.abs(ratingChange)} points in ${timeControl} rating. New ${timeControl} rating: ${newRating}`,
        `${username} just lost ${Math.abs(ratingChange)} points in ${timeControl} rating. Maybe it's time to consider retirement... New ${timeControl} rating: ${newRating}`,
        `There are three guarantees in life: death, taxes, and ${username} losing ${timeControl} games. ${username} lost ${ratingChange} ${timeControl} rating. (New rating: ${newRating})`,
        `Not many things are certain in life, but one thing definitely is — ${username} losing chess games. ${username} just lost ${ratingChange} ${timeControl} rating. New ${timeControl} rating: ${newRating}`,
    ];
    return randomLoseMessages[Math.floor(Math.random() * randomLoseMessages.length)] + `\nCheck out the game here! ${gameUrl}`;
}

export function getRandomDrawMsg(timeControl, username, ratingChange, newRating, gameUrl) {
    const randomDrawMessages = [
        `A tale as old as time: ${username} couldn't close the game. A draw in ${timeControl}. Rating change: ${ratingChange}. New rating: ${newRating}.`,
        `Two titans clashed... and neither won. ${username} drew a ${timeControl} game. Rating change: ${ratingChange}. New rating: ${newRating}.`,
        `Not a win, not a loss, just a whole lot of wasted time. ${username} drew in ${timeControl}. New rating: ${newRating}.`,
        `Some say a draw is just a loss without consequences. ${username} couldn't decide today. Rating change: ${ratingChange}. New rating: ${newRating}.`,
        `50 moves, 3 blunders, 2 missed mates, and a stalemate. ${username} secures the most unsatisfying result in chess: a draw. Rating change: ${ratingChange}. New rating: ${newRating}.`,
        `It's not about winning or losing, it's about sending a message. ${username} just drew a ${timeControl} game. New rating: ${newRating}.`,
        `You either die a hero or live long enough to see yourself draw. ${username} with a ${timeControl} draw. Rating change: ${ratingChange}. New rating: ${newRating}.`,
        `Another draw? ${username} might be allergic to winning. ${timeControl} game ends in a tie. New rating: ${newRating}.`,
        `Somewhere, a chess coach just sighed. ${username} drew in ${timeControl}. New rating: ${newRating}.`,
        `A draw? Really? ${username} out here making sure nobody has fun. New rating: ${newRating}.`,
    ];
    return randomDrawMessages[Math.floor(Math.random() * randomDrawMessages.length)] + `\nCheck out the game here! ${gameUrl}`;
}