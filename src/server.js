import Discord from 'discord.js';
import { config } from 'dotenv';

// Load env variables
config();

const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client?.user?.tag}!`);
});

client.on('message', (msg) => {
});

client.login(process.env.TOKEN);
