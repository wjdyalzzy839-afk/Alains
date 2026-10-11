const express = require("express");
const OpenAI = require("openai");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// عرض واجهة Alains الرئيسية
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// اختبار الخادم
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Alains AI Server is working!"
  });
});

// محادثة الذكاء الاصطناعي
app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "الرجاء كتابة رسالة أولاً."
      });
    }

    const response = await client.responses.create({
      model: "gpt-5-mini",
      instructions:
        "أنت Alains، مساعد شخصي ذكي. تحدث باللغة العربية بشكل واضح وودود، وساعد المستخدم في مهامه وأسئلته.",
      input: message.trim()
    });

    res.json({
      reply: response.output_text || "لم أتمكن من إنشاء رد. حاول مرة أخرى."
    });

  } catch (error) {
    console.error("Alains AI error:", error.message);

    res.status(500).json({
      error: "تعذر الحصول على رد من الذكاء الاصطناعي. حاول مرة أخرى."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Alains AI server running on port ${PORT}`);
});
