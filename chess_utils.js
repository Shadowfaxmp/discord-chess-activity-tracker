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
        const game = mostRecentGames.games[mostRecentGames.games.length - 1]; // Get last game in the list
        game.site = 'chess.com';
        return game;
    } else {
        return null;
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

function mapLichessStatus(status) {
    switch (status) {
        case 'timeout':
        case 'outoftime':
            return 'timeout';
        case 'resign':
            return 'resigned';
        case 'mate':
            return 'checkmated';
        case 'aborted':
            return 'abandoned';
        default:
            return status;
    }
}

export async function get_lichess_most_recent_game(username) {
    const url = `https://lichess.org/api/games/user/${username}?max=1&opening=true&pgnInJson=true&sort=dateDesc`;
    try {
        const response = await fetch(url, { headers: { 'Accept': 'application/x-ndjson' } });
        const text = await response.text();
        const line = text.trim().split('\n')[0];
        if (!line) {
            return null;
        }
        const data = JSON.parse(line);
        const { players, id, pgn, speed, winner, status } = data;
        let whiteResult, blackResult;
        if (winner === 'white') {
            whiteResult = 'win';
            blackResult = mapLichessStatus(status);
        } else if (winner === 'black') {
            whiteResult = mapLichessStatus(status);
            blackResult = 'win';
        } else {
            whiteResult = 'draw';
            blackResult = 'draw';
        }

        return {
            site: 'lichess',
            url: `https://lichess.org/${id}`,
            pgn: pgn,
            time_class: speed,
            white: {
                username: players?.white?.user?.name || 'anonymous',
                result: whiteResult,
            },
            black: {
                username: players?.black?.user?.name || 'anonymous',
                result: blackResult,
            },
        };
    } catch (error) {
        console.error(`Error fetching recent Lichess game for ${username}:`, error);
        return null;
    }
}

export async function get_lichess_stats(userName) {
    const url = `https://lichess.org/api/user/${userName}`;
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching Lichess stats for ${userName}:`, error);
        return null;
    }
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
    try {
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
    } catch (error) {
        console.log(`Error getting opening type:`);
        console.log(error);
        return `unknown`;
    }
}

export function getEcoUrl(game) {
    if (!game || typeof game.pgn !== 'string') {
        return '';
    }

    const match = game.pgn.match(/\[ECOUrl\s+"(.*?)"\]/);
    return match ? match[1] : '';
}