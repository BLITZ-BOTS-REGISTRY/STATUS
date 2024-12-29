import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ActivityType } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Set your bot's status with activity type and custom text"),

  action: async (client, interaction, config) => {
    if (!config.bot_owner_id) {
      console.log("Error: bot_owner_id is not specified in the configuration file.");
      await interaction.reply({
        content: "The bot is not properly configured. Please contact the administrator.",
        ephemeral: true,
      });
      return;
    }

    if (isNaN(config.bot_owner_id)) {
      await interaction.reply({
        content: "The bot_owner_id must be a valid number. Please check your configuration.",
        ephemeral: true,
      });
      return;
    }

    if (interaction.user.id !== config.bot_owner_id) {
      await interaction.reply({
        content: "You are not authorized to use this command.",
        ephemeral: true,
      });
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId("status-modal")
      .setTitle("Set Bot Status");

    const activityTypeInput = new TextInputBuilder()
      .setCustomId("activity-type")
      .setLabel("Activity Type")
      .setPlaceholder("Choose from: playing, listening, watching, custom")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const statusInput = new TextInputBuilder()
      .setCustomId("status")
      .setLabel("Status")
      .setPlaceholder("Choose from: online, dnd, idle, offline")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const customTextInput = new TextInputBuilder()
      .setCustomId("custom-text")
      .setLabel("Custom Text")
      .setPlaceholder("Enter your custom status text")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    const activityTypeRow = new ActionRowBuilder<TextInputBuilder>().addComponents(activityTypeInput);
    const statusRow = new ActionRowBuilder<TextInputBuilder>().addComponents(statusInput);
    const customTextRow = new ActionRowBuilder<TextInputBuilder>().addComponents(customTextInput);

    modal.addComponents(activityTypeRow, statusRow, customTextRow);

    await interaction.showModal(modal);
    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isModalSubmit()) return;
    
      if (interaction.customId === "status-modal") {
        const activityType = interaction.fields.getTextInputValue("activity-type").toLowerCase();
        const status = interaction.fields.getTextInputValue("status").toLowerCase();
        const customText = interaction.fields.getTextInputValue("custom-text");
    
        const validActivityTypes = ["playing", "listening", "watching", "custom"];
        const validStatuses = ["online", "dnd", "idle", "offline"];
    
        if (!validActivityTypes.includes(activityType)) {
          await interaction.reply({
            content: `Invalid activity type! Please choose one of: ${validActivityTypes.join(", ")}`,
            ephemeral: true,
          });
          return;
        }
    
        if (!validStatuses.includes(status)) {
          await interaction.reply({
            content: `Invalid status! Please choose one of: ${validStatuses.join(", ")}`,
            ephemeral: true,
          });
          return;
        }
    
        let activityTypeEnum;
        switch (activityType) {
          case "playing":
            activityTypeEnum = ActivityType.Playing;
            break;
          case "listening":
            activityTypeEnum = ActivityType.Listening;
            break;
          case "watching":
            activityTypeEnum = ActivityType.Watching;
            break;
          case "custom":
            activityTypeEnum = ActivityType.Custom;
            break;
          default:
            activityTypeEnum = ActivityType.Playing; 
        }
    
        await client.user.setActivity(customText, {
          type: activityTypeEnum,
        });
        await client.user.setStatus(status);
    
        await interaction.reply({
          content: `Your bot's status has been updated:\n**Activity Type:** ${activityType}\n**Status:** ${status}\n**Text:** ${customText || "None"}`,
          ephemeral: true,
        });
      }
    });
    
  },
};