import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const LINK_ACCOUNT = {
  name: 'link_account',
  description: 'A command to add your account to the discord server!',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const SET_CHESS_ACTIVITY_CHANNEL = {
  name: 'set_chess_activity_channel',
  description: 'The channel this is sent in will be designated for chess activity',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const LEADERBOARD = {
  name: 'leaderboard',
  description: 'Display club leaderboard',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
  options: [
    {
      name: 'metric',
      description: 'Statistic to sort by',
      type: 3,
      required: true,
      choices: [
        { name: 'rating', value: 'rating' },
        { name: 'games_played', value: 'games_played' },
        { name: 'games_won', value: 'games_won' },
      ],
    },
    {
      name: 'period',
      description: 'Time period',
      type: 3,
      required: false,
      choices: [
        { name: 'day', value: 'day' },
        { name: 'week', value: 'week' },
        { name: 'month', value: 'month' },
      ],
    },
  ],
};

const ALL_COMMANDS = [TEST_COMMAND, LINK_ACCOUNT, SET_CHESS_ACTIVITY_CHANNEL, LEADERBOARD];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS)
