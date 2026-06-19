/**
 * One-time (or after command changes) registration of Discord slash commands.
 * Usage: npx tsx scripts/discord-register-commands.ts
 */
import "dotenv/config";

const API_BASE = "https://discord.com/api/v10";

async function main() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const appId = process.env.DISCORD_CLIENT_ID;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!token || !appId || !guildId) {
    throw new Error("DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID required");
  }

  const commands = [
    {
      name: "redeem",
      description: "Redeem your GIKSN contributor access token",
      options: [
        {
          type: 3,
          name: "token",
          description: "Access token from onboarding or invite email",
          required: true,
        },
      ],
    },
  ];

  const response = await fetch(
    `${API_BASE}/applications/${appId}/guilds/${guildId}/commands`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
    }
  );

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Failed (${response.status}): ${text}`);
  }

  console.log("Discord commands registered:", text);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});