import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import express from 'express';
import { InteractionType, InteractionResponseType, MessageComponentTypes, verifyKeyMiddleware,} from 'discord-interactions';
import {getRandomEmoji} from './utils.js';
import {get_chess_profile, get_most_recent_game} from "./chess_utils.js";
import {check_for_updates} from './check_for_updates.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT;

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
  //await sendMessageToChannel(process.env.ACITVITY_CHANNEL_ID, 'Chess Bot starting...');
  await check_for_updates(process.env.ACITVITY_CHANNEL_ID);
});



app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

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
      //sendUpdateMessages(req.body.channel.id);
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
      let userChessInfo = await get_chess_profile(userInput);
      const userMostRecentGame = await get_most_recent_game(userInput);
      console.log(userMostRecentGame);
      console.log(userChessInfo);
        if (userChessInfo != null) {

          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `The link account command is currently unavailable`,
              flags: 64,
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

export async function send_message_to_channel(channelId, message) {
  const DISCORD_TOKEN = process.env.DISCORD_TOKEN; // Ensure the bot token is available via environment variables
  const url = `https://discord.com/api/v10/channels/${channelId}/messages`;

  console.log(`Attempting to send message to channel: ${channelId}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: message,
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


app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
