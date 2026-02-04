const API_KEY = "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";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
// PRD Recommended Model
const MODEL_NAME = "google/gemini-3-flash-preview";

function sendChat(messages) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API_URL,
      method: 'POST',
      timeout: 60000, // 60s timeout for AI generation
      header: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/silas/baby-care', // Required by OpenRouter
        'X-Title': 'DouZhidao' // Required by OpenRouter
      },
      data: {
        model: MODEL_NAME,
        messages: messages,
        temperature: 0.7
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.choices) {
          resolve(res.data.choices[0].message.content);
        } else {
          reject(new Error(res.data.error ? res.data.error.message : 'Unknown Error'));
        }
      },
      fail: (err) => {
        console.error("API Request Failed:", err);
        if (err.errMsg && err.errMsg.indexOf('timeout') > -1) {
          reject(new Error('请求超时，请检查网络或稍后再试'));
        } else {
          reject(err);
        }
      }
    });
  });
}

// JSON Parsing helper (from prototype)
function safeParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    // 1. Basic cleanup for markdown
    let cleanStr = str.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/, "").trim();
    try {
      return JSON.parse(cleanStr);
    } catch (e1) {
       // 2. Try extracting substring from first { to last }
       const firstOpen = str.indexOf('{');
       const lastClose = str.lastIndexOf('}');
       if (firstOpen !== -1 && lastClose > firstOpen) {
          const jsonCandidate = str.substring(firstOpen, lastClose + 1);
          try {
            return JSON.parse(jsonCandidate);
          } catch (e2) {}
       }

      console.warn("Direct JSON parse failed, trying fallback extraction", str);
      
      // Fallback extraction
      let reply = str;
      let action = 'none';
      let sopData = null;
      let suggestions = [];
      
      const replyMatch = str.match(/"reply"\s*:\s*"(.*?)(?=",|})/s);
      if (replyMatch) reply = replyMatch[1];
      else {
         // Try to strip JSON artifacts if it's just a raw string
         if (str.trim().startsWith('{') && str.trim().endsWith('}')) {
             // It was a failed JSON, maybe we can't extract reply easily if it's complex
         } else {
             reply = str; // Treat as plain text
         }
      }
      
      if (str.includes('"action": "sop"') || str.includes('"action":"sop"')) {
        action = 'sop';
      }
      
      // Try to extract suggestions
      const suggMatch = str.match(/"suggestions"\s*:\s*\[(.*?)\]/s);
      if (suggMatch) {
          try {
              suggestions = JSON.parse(`[${suggMatch[1]}]`);
          } catch (e) {}
      }

      return {
        reply: reply,
        action: action, 
        sopData: sopData,
        suggestions: suggestions
      };
    }
  }
}

module.exports = {
  sendChat,
  safeParseJSON
}
