const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.post('/suggest', protect, async (req, res) => {
  try {
    const { taskType, subject } = req.body;
    if (!subject) return res.status(400).json({ error: 'Subject required' });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 1000,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: `You are a college task assistant. Generate 3 task title and description suggestions for a ${taskType} about "${subject}".
Return ONLY a JSON array, no markdown, no explanation:
[
  {"title": "...", "description": "..."},
  {"title": "...", "description": "..."},
  {"title": "...", "description": "..."}
]`
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.choices[0].message.content.trim()
      .replace(/```json|```/g, '').trim();

    const suggestions = JSON.parse(text);
    res.json({ success: true, suggestions });

  } catch (err) {
    console.error('AI error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;