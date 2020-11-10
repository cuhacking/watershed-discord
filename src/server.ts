import {Client} from 'discord.js';
import { config } from 'dotenv';

// Load env variables
config();

const client = new Client();

client.on('ready', () => {
  console.log(`Logged in as ${client?.user?.tag}!`);
});

client.on('message', (msg) => {
});

client.login(process.env.TOKEN);
