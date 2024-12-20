import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "npm:discord.js";

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
      .setLabel("Activity Type (playing, listening, watching, etc.)")
      .setPlaceholder("Choose from: playing, listening, watching, competing")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const statusInput = new TextInputBuilder()
      .setCustomId("status")
      .setLabel("Status (online, dnd, idle, offline, custom)")
      .setPlaceholder("Choose from: online, dnd, idle, offline, custom")
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
  },
  onInteraction: async (interaction, client) => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === "status-modal") {
      const activityType = interaction.fields.getTextInputValue("activity-type").toLowerCase();
      const status = interaction.fields.getTextInputValue("status").toLowerCase();
      const customText = interaction.fields.getTextInputValue("custom-text");

      const validActivityTypes = ["playing", "listening", "watching", "competing"];
      const validStatuses = ["online", "dnd", "idle", "offline", "custom"];

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

      try {
        const presenceOptions = {
          activities: [
            {
              name: customText || "No activity set",
              type: activityType.toUpperCase(),
            },
          ],
          status: status.toUpperCase(),
        };

        await client.user.setPresence(presenceOptions);

        await interaction.reply({
          content: `Your bot's status has been updated:\n**Activity Type:** ${activityType}\n**Status:** ${status}\n**Text:** ${customText || "None"}`,
          ephemeral: true,
        });
      } catch (error) {
        console.error("Error setting bot presence:", error);
        await interaction.reply({
          content: "An error occurred while updating the bot's status.",
          ephemeral: true,
        });
      }
    }
  },
};
