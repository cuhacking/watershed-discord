import { Client, TextChannel } from 'discord.js';
import { config } from 'dotenv';
import { Channel } from './constants';
import express from 'express';

// Load env variables
config();

const client = new Client();

client.on('ready', () => {
  console.log(`Logged in as ${client?.user?.tag}!`);
});

client.on('message', (msg) => {});

const app = express()
app.use(express.json())

app.post('/announce', async (req, res) => {
  const channel = client.channels.cache.get(Channel.Announcements) as TextChannel;
  const {message} = req.body;
  console.log(`Sending "${message}" to channel ${Channel.Announcements}.`);
  await channel.send(message);
  res.send({status: 'SENT', message});
})

client.login(process.env.TOKEN);
app.listen(process.env.PORT || 80);

