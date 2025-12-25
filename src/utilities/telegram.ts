export const sendTelegramMessage = async (message: string) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_GROUP_ID;

  if (!token || !chatId) {
    console.warn("⚠️ Telegram Bot Token or Group ID is missing.");
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const body = {
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Failed to send Telegram message:", errorData);
    } else {
      console.log("✅ Telegram notification sent successfully.");
    }
  } catch (error) {
    console.error("❌ Error sending Telegram message:", error);
  }
};
