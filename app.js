import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  MessageComponentTypes,
  verifyKeyMiddleware,
} from 'discord-interactions';
import {getRandomEmoji} from './utils.js';
import {fetchUserProfile} from "./chessUtils.js";
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import {sendUpdateMessages} from './sendUpdateMessages.js';

const db = await open({
  filename: './chess_users.db',
  driver: sqlite3.Database
});
// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT;

//Create database to store usernames
await db.exec(`CREATE TABLE IF NOT EXISTS users (
  chess_username TEXT PRIMARY KEY,
  discord_id TEXT,
  chess_url TEXT,
  last_online INTEGER
)`);

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Ensure the bot is logged in
client.login(process.env.DISCORD_TOKEN);
// Wait until the bot is ready before using it
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  await sendMessageToChannel(process.env.ACITVITY_CHANNEL_ID, 'Chess Bot starting...')
  await sendUpdateMessages(process.env.ACITVITY_CHANNEL_ID, await getStoredUsers());
});



app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }



  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: `hello world ${getRandomEmoji()}`,
        },
      });
    }


    if(name === 'link_account' && id) {
      return res.send({
        type: InteractionResponseType.MODAL,
        data: {
          custom_id: 'chess.com_username_input_modal',
          title: 'Enter Your Chess.com Username',
          components: [
            {
              // Text inputs must be inside of an action component
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  // See https://discord.com/developers/docs/interactions/message-components#text-inputs-text-input-structure
                  type: MessageComponentTypes.INPUT_TEXT,
                  custom_id: 'chess.com_username_input_modal',
                  style: 1,
                  label: 'Note: only enter your own username',
                },
              ],
            },
          ],
        },
      });
    }

    if(name === 'set_chess_activity_channel' && id) {
      console.log(req.body.channel.id);
      sendUpdateMessages(req.body.channel.id);
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: `Set channel succeeded`,
        },
      });
    }
    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  if (type === InteractionType.MODAL_SUBMIT) {
    // custom_id of modal
    const modalId = data.custom_id;
    // user ID of member who filled out modal

    const userId = req.body.member.user.id;

    if (modalId === 'chess.com_username_input_modal') {
      let modalValues = '';
      let userInput = '';
      // Get value of text inputs
      for (let action of data.components) {
        let inputComponent = action.components[0];
        modalValues += `${inputComponent.custom_id}: ${inputComponent.value}\n`;
        userInput += `${inputComponent.value}`;
      }

      //Try to fetch usernames chess.com information
      let userChessInfo = await fetchUserProfile(userInput);

      console.log(userChessInfo);
        if (userChessInfo != null) {

            // Store the new username even if the same discord_id already exists
            await db.run(
                `INSERT INTO users (chess_username, discord_id, chess_url, last_online)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(chess_username) DO UPDATE 
                    SET discord_id = excluded.discord_id, 
                        chess_url = excluded.chess_url,
                        last_online = excluded.last_online`,
                [userChessInfo.username, userId, userChessInfo.url, userChessInfo.last_online]
            );

          console.log(`Stored/Updated ${userId} -> ${userChessInfo.username}`);
          await getStoredUsers();

          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `<@${userId}> linked their Chess.com account!\n<@${userId}> is ${userChessInfo.username} on Chess.com, why don't you go add them as a friend ${userChessInfo.url}?`,
            },
          });
        } else {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `Error verifying your Chess.com account. Ensure your username (${userInput}) is spelled correctly and try again.`,
              flags: 64,
            },
          });
        }
    }
  }

  /**
   * Handle requests from interactive components
   * See https://discord.com/developers/docs/interactions/message-components#responding-to-a-component-interaction
   */
  if (type === InteractionType.MESSAGE_COMPONENT) {
    // custom_id set in payload when sending message component
    //const componentId = data.custom_id;

  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

export async function sendMessageToChannel(channelId, message) {
  const DISCORD_TOKEN = process.env.DISCORD_TOKEN; // Ensure the bot token is available via environment variables
  const url = `https://discord.com/api/v10/channels/${channelId}/messages`;
  console.log(client.guilds.cache.map(guild => guild.id));
  console.log(`Attempting to send message to channel: ${channelId}`);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error sending message:', errorData);
    } else {
      console.log('Message sent successfully!');
    }
  } catch (error) {
    console.error('Error in sendMessageToChannel:', error);
  }
}

async function getStoredUsers() {
  try {
    const rows = await db.all("SELECT * FROM users");
    console.log("Stored Chess.com Users:", rows);
    return rows;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
