import { Client, TextChannel, Intents } from "discord.js";
import { config } from "dotenv";
import express from "express";
import fetch from "node-fetch";

const HELP = `Change Location:
- \`!cabin\`
- \`!forest\`
- \`!lake\`
Other Commands:
- \`!progress\` – see your progress
- \`!question\` - get current question
- \`!help\` – see this message

Once you solve a challenge, simply send me the solution code to move on to the next challenge.`;

// Load env variables
config();
const client = new Client();

client.on("ready", () => {
  console.log(`Logged in as ${client?.user?.tag}!`);
});

const TRACKS = ["Cabin", "Forest", "Lake"];

const app = express();
app.use(express.json());

async function messageChannel(channelId, message) {
  const channel = client.channels.cache.get(channelId) as TextChannel;
  console.log(`Sending "${message}" to channel #${channelId}.`);
  await channel.send(message);
}

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

client.on("message", async (message) => {
  const userId = message.author.id;

  async function switchTracks(track: number) {
    const resp = await fetch(api("switchTracks"), {
      body: JSON.stringify({ userId, track }),
      method: "post",
      headers: { "Content-Type": "application/json" },
    });

    // todo handle complete track
    if (resp.ok) return true;

    message.reply("You have to type !start first!");
  }

  async function getQuestion() {
    const resp = await fetch(api(`question/${userId}`));

    if (!resp.ok) return;

    const question = await resp.text();
    if (question) {
      message.reply(question);
    }
  }

  const prefix = "!";
  if (message.channel.type == "dm") {
    if (message.content.startsWith(prefix)) {
      const content = message.content.replace(prefix, "");
      let resp;
      switch (content) {
        case "help":
          message.reply(HELP);
          break;
        case "cabin":
          if (await switchTracks(0)) {
            message.reply("Cozy up, you went indoors into the Cabin!");
          }
          getQuestion();
          break;
        case "forest":
          if (await switchTracks(1)) {
            message.reply(
              "You have stepped foot into the forest, be careful not to get lost!"
            );
            getQuestion();
          }
          break;
        case "lake":
          if (await switchTracks(2)) {
            message.reply("Watch your step, you're on the frozen lake!");
          }
          getQuestion();
          break;
        case "progress":
          resp = await fetch(api(`progress/${userId}`));
          if (resp.ok) {
            const tracks = await resp.json();
            message.reply(
              `Your progress:\n\n${formatProgress(tracks, 0)}${formatProgress(
                tracks,
                1
              )}${formatProgress(tracks, 2)}`
            );
          }
          break;
        case "question":
          getQuestion();
          break;
        case "start":
          resp = await fetch(api("start"), {
            body: JSON.stringify({ userId }),
            method: "post",
            headers: { "Content-Type": "application/json" },
          });
          switch (resp.status) {
            case 200:
              message.reply(
                "So you have decided to help me, great! To start, run one of the following commands commands to visit any of the three locations: `!cabin`, `!forest`, `!lake`. Each location will have challenges you need to solve.\n\nOnce you solve a challenge, simply send me the solution code to move on to the next challenge. Type `!progress` to view your progress and `!help` for available commands."
              );
              break;
            case 403:
              message.reply("You've already started!");
              break;
            default:
              console.log(resp.status);
              message.reply(
                "You need to link your discord on https://2021.cuhacking.com/"
              );
              break;
          }
          break;
        default:
          message.reply(
            "That's not a valid command. Type `!help` to see available commands."
          );
          break;
      }
    } else {
      if (!message.author.bot) {
        const resp = await fetch(api("submit"), {
          body: JSON.stringify({ userId, answer: message.content }),
          method: "post",
          headers: { "Content-Type": "application/json" },
        });

        if (resp.status === 403 || resp.status === 404) {
          return message.reply("You have to type !start first!");
        }

        if (resp.status === 405) {
          return message.reply(
            "You already completed this location! To switch locations, type `!cabin`, `!lake`, or `!forest.`"
          );
        }

        if (resp.ok) {
          message.reply("That is correct!");
          messageChannel(
            process.env.RAVENS_QUEST_LOG_CHANNEL_ID,
            `<@${message.author.id}> has submitted code: ${message.content}`
          );
          const { nextQuestion, allComplete } = await resp.json();
          if (allComplete) {
            messageChannel(
              process.env.RAVENS_QUEST_LOG_CHANNEL_ID,
              `<@${message.author.id}> has completed all the challenges.`
            );
            return message.reply(
              "Congratulations, you have finished all challenges! You win!"
            );
          }

          if (!nextQuestion) {
            message.reply(
              "Congratulations, you have finished all the challenges in this location! To switch locations, type `!cabin`, `!lake`, or `!forest.`"
            );
          } else {
            message.reply(`Next challenge: ${nextQuestion}`);
          }
        } else {
          message.reply("Sorry, wrong answer.");
        }
      }
    }
  }
});

function api(endpoint: string) {
  return process.env.RAVENS_QUEST_API + endpoint;
}

function formatProgress(tracks: any, track: number) {
  const val = tracks[`track${track}`];
  if (val === "Completed") {
    return `${TRACKS[track]}: Complete!\n`;
  }

  return `${TRACKS[track]}: Completed ${Number(val)}/4\n`;
}

client.login(process.env.TOKEN);
app.listen(process.env.PORT || 80);
