import { Client, TextChannel, Intents } from "discord.js";
import { config } from "dotenv";
import express from "express";

// Load env variables
config();
const client = new Client();

client.on("ready", () => {
  console.log(`Logged in as ${client?.user?.tag}!`);
});

client.on("message", async (message) => {
  const prefix = "!";
  if (message.channel.type == "dm") {
    if (message.content.startsWith(prefix)) {
      const content = message.content.replace(prefix, "");
      switch (content) {
        case "help":
          message.reply(
            "The commands to visit the three locations are: !cabin, !forest, !lake. Once you solve a challenge, simply send me the solution code to move on to the next challenge!"
          );
          break;
        case "cabin":
          message.reply("Cozy up, you went indoors into the Cabin!");
          break;
        case "forest":
          message.reply(
            "You have stepped foot into the forest, be careful not to get lost!"
          );
          break;
        case "lake":
          message.reply("Watch your step, you're on the frozen lake!");
          break;
        case "start":
          message.reply(
            "So you have decided to help me, great! The commands to visit the three locations are: !cabin, !forest, !lake. Each location will have challenges you need to solve.\n\nOnce you solve a challenge, simply send me the solution code to move on to the next challenge! "
          );
          break;
        default:
          message.reply(
            "That's not a valid command. Type !help to see available commands."
          );
          break;
      }
    } else {
      if (!message.author.bot) {
        // Check answer
        message.reply("That is correct!");
      }
    }
  }
});

client.login(process.env.TOKEN);
