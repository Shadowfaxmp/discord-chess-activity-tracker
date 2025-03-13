import {getGameLengthFromPGN, getOpeningName} from "./chess_utils.js";

export function getRandomWinMsg(timeControl, username, ratingChange, newRating, game, loss_type) {
    console.log(loss_type)
    let randomWinMessages;
    if(loss_type === "abandoned") {
        randomWinMessages = [
            `Dang! **${username}** beat their opponent so hard they rage quit! **${username}** gained ${ratingChange} points and now has a ${newRating} rating`,
            `Did their opponent disconnect? Because there's no way **${username}** actually won! They now have a ${newRating} ${timeControl} rating after gaining ${ratingChange} points!`,
            `What's this? A rage quit? **${username}** just made their opponent rage quit with their amazing accuracy. They now have a ${newRating} rating after gaining ${ratingChange} points!`,
            `It looks like **${username}**'s opponent lost their wifi! But a win is a win! **${username}** just gain ${ratingChange} in a ${timeControl} game.`
        ]
    } else if(loss_type === "resigned") {
        randomWinMessages = [
            `Dang! **${username}** beat their opponent so hard they rage quit! **${username}** gained ${ratingChange} points and now has a ${newRating} rating`,
            `What's this? A rage quit? **${username}** just made their opponent resign with their amazing accuracy. They now have a ${newRating} rating after gaining ${ratingChange} points!`,
            `**${username}** was beating their opponent so hard they decided to resign. New rating is ${newRating} after gaining ${ratingChange} points!`,
        ]
    } else {
        randomWinMessages = [
            `Boom 💥! **${username}** just leveled up by ${ratingChange} points in ${timeControl}. New rating: ${newRating}. Who needs Stockfish?`,
            `Look out 🤨, **${username}** just gained ${ratingChange} points and now rocking a ${newRating} ${timeControl} rating!`,
            `**${username}** just bullied an orphan for ${ratingChange} points of ${timeControl} rating. New ${timeControl} rating: ${newRating}. Was it worth it?`,
            `**${username}** isn't beating the cheating allegations. ${username.charAt(0).toUpperCase() + username.slice(1).toLowerCase()} just got +${ratingChange} ${timeControl} rating`,
            `Democracy? Who needs democracy when **${username}**’s king remains uncaptured! ${ratingChange} gloriously won from ${timeControl} will be bestowed to this new kingdom.`,
            `The smell of victory has been bestowed upon **${username}**, who has just received ${ratingChange} in ${timeControl} rating.`,
            `What’s this I see 😳? **${username}** just got ${ratingChange} in a ${timeControl} game? New rating is ${newRating}, wonderful!`,
            `Winner winner, **${username}** received ${ratingChange} in a ${timeControl} game! Now have some chicken.`,
            `Get out the fireworks; **${username}** got a ${ratingChange} points in a ${timeControl} game!`,
            `**${username}** pleased the Hokie Bird with a win from a ${timeControl} game earning ${ratingChange} points. UVA be seething.`,
            `Off with their head 🔪! **${username}** just sent another king to the guillotine, gaining ${ratingChange} points in ${timeControl}. New rating: ${newRating}. Vive la révolution!`
        ];
    }

    return format_message(randomWinMessages[Math.floor(Math.random() * randomWinMessages.length)], game, username, 0x630031, newRating)
}


export function getRandomLoseMsg(timeControl, username, ratingChange, newRating, game, loss_type) {
    console.log(loss_type)
    let randomLoseMessages;
    if(loss_type === "abandoned") {
        randomLoseMessages = [
            `Ragequit detected? **${username}** just quit their game losing ${ratingChange} points! New ${timeControl} rating: ${newRating}`,
            `Did you lose your wifi? **${username}** just lost ${Math.abs(ratingChange)} ${timeControl} points after disconnecting. New Rating: ${newRating}`,
            `Run outta bandwidth? **${username}** just disconnected losing ${Math.abs(ratingChange)} ${timeControl} points. New Rating: ${newRating}`,
            `**${username}** is taking Gothom's advice of never resigning - by just disconnecting their games instead... **${username}** just lost ${Math.abs(ratingChange)} ${timeControl} points. New Rating: ${newRating}`
        ];

    } else {
        randomLoseMessages = [
            `**${username}** just lost to a small child 🫢. Lost ${Math.abs(ratingChange)} points in ${timeControl} rating. New ${timeControl} rating: ${newRating}`,
            `**${username}** just threw again 😂. Lost ${Math.abs(ratingChange)} points in ${timeControl} rating. New ${timeControl} rating: ${newRating}`,
            `**${username}** just lost ${Math.abs(ratingChange)} points in ${timeControl} rating. Maybe it's time to consider retirement... New ${timeControl} rating: ${newRating}`,
            `There are three guarantees in life: death 💀, taxes 💰, and **${username}** losing ${timeControl} games 🤮. **${username}** lost ${ratingChange} ${timeControl} rating. (New rating: ${newRating})`,
            `Not many things are certain in life, but one thing definitely is — **${username}** losing chess games. **${username}** just lost ${ratingChange} ${timeControl} rating. New ${timeControl} rating: ${newRating}`,
            `Someone’s king just got beheaded! **${username}** decided to lose ${Math.abs(ratingChange)} points and send their ruler to the guillotine in a ${timeControl} game. Now their rating is a measly ${newRating}.`,
            `${username.charAt(0).toUpperCase() + username.slice(1).toLowerCase()} seems to decide that being good at chess is for losers. Instead, losing ${ratingChange} in a ${timeControl} game is the new cool now.`,
            `It’s sad trombone time 🎺, because **${username}** just dropped ${ratingChange} in a ${timeControl} game.`,
            `**${username}** be slurping on that loser juice 🧃. Filled with at least ${ratingChange} in a ${timeControl} game, this mixture will guarantee everyone knows you’ve lost your match.`,
            `No need for a funeral, **${username}** already dug their own grave 🪦. The will? A ${ratingChange} in a ${timeControl} game. New rating: ${newRating}`,
            `**${username}** displeased the Hokie Bird 🐦 by having a loss in a ${timeControl} game. What are you, a UVA student? New rating: ${newRating}`
        ];
    }

    return format_message(randomLoseMessages[Math.floor(Math.random() * randomLoseMessages.length)], game, username, 0xCF4420, newRating);
}

export function getRandomDrawMsg(timeControl, username, ratingChange, newRating, game) {
    const randomDrawMessages = [
        `A tale as old as time: **${username}** couldn't close the game. A draw in ${timeControl}. Rating change: ${ratingChange}.`,
        `Two titans clashed... and neither won. **${username}** drew a ${timeControl} game. Rating change: ${ratingChange}.`,
        `Not a win, not a loss, just a whole lot of wasted time. **${username}** drew in ${timeControl}.`,
        `Some say a draw is just a loss without consequences. **${username}** couldn't decide today. Rating change: ${ratingChange}.`,
        `50 moves, 3 blunders, 2 missed mates, and a stalemate. **${username}** secures the most unsatisfying result in chess: a draw. Rating change: ${ratingChange}.`,
        `It's not about winning or losing, it's about sending a message. **${username}** just drew a ${timeControl} game.`,
        `You either die a hero or live long enough to see yourself draw. **${username}** just got ${ratingChange} points with a ${timeControl} draw.`,
        `Another draw? **${username}** might be allergic to winning. ${timeControl} game ends in a tie.`,
        `Somewhere, a chess coach just sighed. **${username}** drew in ${timeControl}.`,
        `A draw? Really? **${username}** out here making sure nobody has fun.`,
        `Congratulations to **${username}**, who managed to snatch a stalemate from the jaws of defeat with a rating of ${newRating} from a ${timeControl} game.!`,
        `Well, **${username}** didn’t win, but at least they didn’t lose either. Current rating: ${newRating}.`,
        `At least you didn’t lose your king, **${username}**. The monarchy goes on, with a rating of ${newRating}.`,
        `Tal once said "To play for a draw, at any rate with white, is to some degree a crime against chess."\nSo someone needs to arrest **${username}**`
    ];

    return format_message(randomDrawMessages[Math.floor(Math.random() * randomDrawMessages.length)], game, username, 0xFFFFFF, newRating);
}

function game_info(game, username, newRating) {

    //const accuracy = username === game.white.username ? game.accuracies.white : game.accuracies.black;
    return `
        > - Opening: ${getOpeningName(game.eco)}
        > - Number of moves: ${getGameLengthFromPGN(game.pgn)}
        > - New Rating: ${newRating}
        ### Click below to see analysis of the game!`;
}

function format_message(message, game, username, color = 0x630031, newRating) {
    console.log(`Format Message: ${message}`);
    const profile_url = `https://www.chess.com/member/${username.toLowerCase()}`;
    return JSON.stringify({
        embeds: [
            {
                title: message,
                description: game_info(game, username, newRating),
                color: color
            }
        ],
        components: [
            {
                type: 1, // An action for the buttons
                components: [
                    {
                        type: 2,       // A button
                        label: "Game Link",
                        style: 5,      // 5 is the 'Link' style
                        url: game.url   // The actual link
                    },
                    {
                        type: 2,
                        label: `View ${username}'s Profile`,
                        style: 5,
                        url: profile_url
                    },
                    {
                        type: 2,
                        label: `See Opening`,
                        style: 5,
                        url: game.eco
                    }
                ]
            }
        ]
    });
}