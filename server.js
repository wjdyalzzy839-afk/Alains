const express = require("express");
const path = require("path");

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    aiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body?.message;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "اكتب رسالتك أولاً."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "مفتاح Gemini غير مضبوط في إعدادات الخادم."
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "أنت Alains، مساعد شخصي ذكي. تحدث باللغة العربية بوضوح وود، وساعد المستخدم في أسئلته ومهامه."
            }]
          },
          contents: [{
            role: "user",
            parts: [{ text: message.trim() }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);
      return res.status(502).json({
        error: "تعذر الحصول على رد من Gemini. حاول مرة أخرى."
      });
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("")
      .trim();

    res.json({
      reply: reply || "لم أتمكن من إنشاء رد. حاول مرة أخرى."
    });

  } catch (error) {
    console.error("Alains server error:", error.message);

    res.status(500).json({
      error: "حدث خطأ في الاتصال. حاول مرة أخرى."
    });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Alains server running on port ${PORT}`);
  });
}

module.exports = app;
