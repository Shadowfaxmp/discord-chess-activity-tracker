//API link for game archive of a player
//https://api.chess.com/pub/player/shadowfaxknight/games/2025/02

export async function get_chess_recent_games(userName) {
    const currentTime = new Date();
    let year = currentTime.getFullYear();
    let month = currentTime.getMonth() + 1; // getMonth() returns 0-based index
    const formattedMonth = month.toString().padStart(2, '0'); // Ensure two-digit format

    const url = `https://api.chess.com/pub/player/${userName.toLowerCase()}/games/${year}/${formattedMonth}`;

    try {
        const response = await getResponse(url);

        // Ensure response is valid
        if (!response || typeof response !== "object" || !response.games) {
            console.error("Invalid API response:", response);
            return { games: [] }; // Return an empty object with `games` array to avoid undefined errors
        }

        return response; // Should be in format { games: [...] }
    } catch (error) {
        console.error(`Error fetching recent games for ${userName}:`, error);
        return { games: [] };
    }
}

    export async function get_most_recent_game(username) {
    const mostRecentGames = await get_chess_recent_games(username);

    if (mostRecentGames.games && mostRecentGames.games.length > 0) {
        return mostRecentGames.games[mostRecentGames.games.length - 1]; // Get last game in the list
    } else {
        return ``;
    }
}


export async function get_chess_stats(userName) {
    const url = `https://api.chess.com/pub/player/${userName.toLowerCase()}/stats`;

    return await getResponse(url);
}

export async function get_chess_profile(username) {
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

export function get_game_result(player, game) {
    console.log(game);
    //If the player is black and they win
    if ((game.black.username.toLowerCase() === player.toLowerCase() && game.black.result === "win")) {
        return {
            result: "win",
            loss_type: game.white.result
        };
    } else if (game.white.username.toLowerCase() === player.toLowerCase() && game.white.result === "win"){
        //If the player is white and they win
        return {
            result: "win",
            loss_type: game.black.result
        };
    } else if(game.black.username.toLowerCase() === player.toLowerCase() && ["checkmated", "resigned", "timeout", "abandoned", "lose"].includes(game.black.result)) {
        return {
            result: "loss",
            loss_type: game.black.result
        };
    } else if(game.white.username.toLowerCase() === player.toLowerCase() && ["checkmated", "resigned", "timeout", "abandoned", "lose"].includes(game.white.result)) {
        return {
          result:  "loss",
          loss_type: game.white.result
        };
    } else {
        return {
            result: "draw",
            loss_type: null
        };
    }
}

function extractMoveText(pgn) {
    const parts = pgn.split('\n\n');
    return parts.length > 1 ? parts.slice(1).join('\n').trim() : pgn.trim();
}

/**
 * Parses a PGN string to find the last move number in the game.
 *
 * @param {string} pgn - The full PGN string.
 * @returns {number} - The final move number in the game.
 */
export function getGameLengthFromPGN(pgn) {
    // Extract the moves section from the PGN.
    const moveText = extractMoveText(pgn);

    // Remove annotations/comments inside curly braces (even multiline).
    const cleanedMoveText = moveText.replace(/\{[\s\S]+?\}/g, '');

    // Regex to match move numbers: matches either "1." (white move) or "1..." (black move).
    const regex = /(\d+)\.(\.\.)?/g;
    let lastMoveNumber = 0;
    let match;

    // Loop through all matches and capture the number.
    while ((match = regex.exec(cleanedMoveText)) !== null) {
        lastMoveNumber = parseInt(match[1], 10);
    }

    return lastMoveNumber;
}

export function getOpeningName(url) {
    // This regex matches the substring after '/openings/' up to the first "-<digit>"
    const regex = /\/openings\/(.*?)(?=-\d)/;
    const match = url.match(regex);

    let openingSlug;
    if (match && match[1]) {
        openingSlug = match[1];
    } else {
        // Fallback: if the pattern isn't found, take everything after '/openings/'
        const parts = url.split('/openings/');
        openingSlug = parts[1] || "";
    }

    // Replace hyphens with spaces to format the opening name properly.
    const openingName = openingSlug.split('-').join(' ');

    return openingName.trim();
}