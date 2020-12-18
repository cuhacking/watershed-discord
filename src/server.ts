import { Client, TextChannel, Intents } from "discord.js";
import { config } from "dotenv";
import express from "express";

// Load env variables
config();
const client = new Client();

client.on("ready", () => {
  console.log(`Logged in as ${client?.user?.tag}!`);
});

const app = express();
app.use(express.json());

app.post("/announce", async (req, res) => {
  const { message, channel: channelName, id } = req.body;

  let channel = null;
  if (id) {
    channel = client.channels.cache.get(id) as TextChannel;
  }

  if (channelName) {
    channel = client.channels.cache.find((channel) => {
      if (channel.type === "text") {
        return (channel as TextChannel).name === channelName;
      }

      return false;
    }) as TextChannel;
  }

  if (!channel) {
    return res
      .status(404)
      .send({ status: "NOT FOUND", channel: id || channelName });
  }

  console.log(`Sending "${message}" to channel #${id || channelName}.`);

  await channel.send(message);
  res.send({ status: "SUCCESS", message, channel: id || channelName });
});

app.post("/upgrade", async (req, res) => {
  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  const { id, user: tag, roleId } = req.body;
  const role = guild.roles.cache.get(roleId);

  await guild.members.fetch();
  let user = null;
  if (tag) {
    user = guild.members.cache.find((member) => member.user.tag === tag);
  }

  if (id) {
    user = guild.members.cache.get(id);
  }

  if (!user) {
    return res.status(404).send({ status: "NOT FOUND", user: id || tag });
  }

  console.log(`Upgrading user "${id || tag}" to role ${process.env.ROLE_ID}.`);
  await user.roles.add(role);
  res.send({ status: "SUCCESS", user: id || tag });
});

client.login(process.env.TOKEN);
app.listen(process.env.PORT || 80);
