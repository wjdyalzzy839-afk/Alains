const express = require("express");
const OpenAI = require("openai");
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
    aiConfigured: Boolean(process.env.OPENAI_API_KEY)
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

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "مفتاح الذكاء الاصطناعي غير مضبوط في إعدادات الخادم."
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await client.responses.create({
      model: "gpt-5-mini",
      instructions:
        "أنت Alains، مساعد شخصي ذكي. أجب باللغة العربية بوضوح وودّ، وساعد المستخدم في أسئلته ومهامه.",
      input: message.trim()
    });

    res.json({
      reply: response.output_text || "لم أتمكن من إنشاء رد. حاول مرة أخرى."
    });
  } catch (error) {
    console.error("Alains AI error:", error.message);

    res.status(500).json({
      error: "تعذر الحصول على رد الآن. تحقق من إعدادات الخادم وحاول مجددًا."
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
