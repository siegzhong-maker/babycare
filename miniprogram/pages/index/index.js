// index.js
const app = getApp()
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')
const { data: KNOWLEDGE_BASE } = require('../../data/knowledge_base.js') // Load Knowledge Base

const HIGH_FREQ_QUESTIONS = [
  '宝宝发烧39度怎么办？', '怎么给宝宝洗澡？', '宝宝一直哭怎么哄？',
  '新生儿多久喂一次？', '宝宝便秘怎么办？', '怎么接觉？',
  '红屁股怎么护理？', '宝宝吐奶正常吗？', '黄疸多久能退？',
  '宝宝多大长牙？', '什么时候开始抬头？', '怎么做排气操？',
  '肚脐出血怎么办？', '宝宝淹脖子怎么办？', '新生儿一天睡多久？',
  '辅食什么时候添加？', '宝宝不吃奶瓶怎么办？', '长湿疹了怎么办？',
  '三个月宝宝会翻身吗？', '怎么做抚触？'
];

Page({
  data: {
    statusBarHeight: 20,
    chatHistory: [],
    inputValue: '',
    suggestions: [],
    scrollToView: '',
    showModal: false,
    profile: {},
    ageStr: '',
    isLoading: false,
    worryTags: [] // Tags for Worry Wall
  },

  onLoad() {
    console.log('KNOWLEDGE_BASE loaded:', KNOWLEDGE_BASE);
    // Load tags from Knowledge Base
    const tags = (KNOWLEDGE_BASE || []).map(item => ({
      text: item.display_tag,
      id: item.id,
      query: item.tags[0] // Use first tag as query text
    }));

    // 使用 getWindowInfo 获取窗口信息（如状态栏高度），替代已废弃的 getSystemInfoSync
    const windowInfo = wx.getWindowInfo();
    this.setData({
      statusBarHeight: windowInfo.statusBarHeight,
      profile: app.globalData.userProfile,
      suggestions: this.getRandomSuggestions(3),
      worryTags: tags
    });
    this.updateAgeDisplay();
  },

  getRandomSuggestions(count) {
    // Simple shuffle
    const shuffled = [...HIGH_FREQ_QUESTIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  },

  updateAgeDisplay() {
    const age = util.calculateAge(this.data.profile.birth);
    this.setData({ ageStr: age });
  },

  handleInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  sendQuickMsg(e) {
    const text = e.currentTarget.dataset.text;
    this.setData({ inputValue: text });
    this.sendMessage();
  },

  // Handler for Worry Wall Tags
  handleTagTap(e) {
    const item = e.currentTarget.dataset.item;
    // Set specific input value or hidden intent
    this.setData({ inputValue: item.text }); // Use display text (with emoji) or item.text
    this.sendMessage(item.id); // Pass case ID explicitly if clicked from tag
  },

  // Helper: Find matching case from KB
  findMatchingCase(text) {
    // Simple keyword matching
    // Use .find() to avoid for..of babel runtime issues
    return KNOWLEDGE_BASE.find(kCase => {
      return kCase.tags.some(tag => text.includes(tag));
    }) || null;
  },

  async sendMessage(forceCaseId = null) {
    const text = this.data.inputValue.trim();
    if (!text || this.data.isLoading) return;

    // Add User Message
    const userMsg = { role: 'user', content: text };
    const history = this.data.chatHistory;
    history.push(userMsg);
    
    // Add Loading Placeholder
    const loadingMsg = { role: 'assistant', isLoading: true };
    history.push(loadingMsg);

    this.setData({
      chatHistory: history,
      inputValue: '',
      isLoading: true,
      scrollToView: 'scroll-bottom'
    });

    try {
      // Construct Context
      const age = util.calculateAge(this.data.profile.birth);
      
      // 1. Retrieval Step (MCP-like)
      let matchedCase = null;
      if (forceCaseId) {
        matchedCase = KNOWLEDGE_BASE.find(c => c.id === forceCaseId);
      } else {
        matchedCase = this.findMatchingCase(text);
      }

      // 2. Prompt Engineering with Context Injection
      let systemPrompt = `你是一位名叫“兜兜”的金牌月嫂。服务对象：${this.data.profile.name}，${this.data.profile.gender}，月龄${age}。
核心职责：安抚新手父母的焦虑，并提供基于“真实经验”的护理指导。

重要指令：
1. **专业经验**：你是经验丰富的月嫂，请直接基于你的专业知识和过往经验回答。**严禁编造虚构的宝宝案例或名字**。
2. **聚焦用户**：回复的主体必须是用户的宝宝（${this.data.profile.name}），不要提及无关的第三方。
3. **拒绝模棱两可**：不要给出一堆可能性，而是给出你认为最有效的**一种**解决方案。
4. **Wizard 模式 (SOP)**：如果涉及具体操作，返回 "action": "sop" 并提供步骤。
5. **安全底线**：遇到医疗急症（发烧>39度、惊厥、吐血等）必须建议就医。

数据格式：纯JSON。
{
  "reply": "话术...",
  "action": "none" 或 "sop", 
  "sopData": { 
    "title": "SOP标题",
    "preps": ["准备项1", "准备项2"],
    "steps": [
      { "title": "步骤标题(必填)", "desc": "步骤详情(必填)" }
    ]
  },
  "suggestions": ["用户可能会追问的短问题1", "用户可能会追问的短问题2"]
}
(注意：suggestions 字段必须是【用户视角的追问】，例如 '飞机抱怎么做？'、'多久能好？'，而不是你的建议操作或长句。控制在2个以内)`;

      // Inject Case if found
      if (matchedCase) {
        systemPrompt += `\n\n【月嫂经验知识库 - 请参考此方案进行解答】
CASE_TAG: ${matchedCase.tags.join(', ')}
SOLUTION: ${matchedCase.solution}
WARNING: ${matchedCase.warning}
(请将此解决方案内化为你的专业建议，语气要亲切笃定)`;
      } else {
         systemPrompt += `\n\n(未匹配到特定知识库，请基于你的专业月嫂知识进行解答)`;
      }

      const messages = [
        { role: "system", content: systemPrompt },
        // Simple context window: last 4 messages excluding loading
        ...history.filter(m => !m.isLoading).slice(-4) 
      ];

      const resContent = await api.sendChat(messages);
      const aiData = api.safeParseJSON(resContent);

      // Replace Loading with Real Response
      const newHistory = this.data.chatHistory.filter(m => !m.isLoading);
      
      const aiMsg = {
        role: 'assistant',
        reply: aiData.reply || "阿姨有点忙，没听清，能再说一遍吗？",
        action: aiData.action,
        sopData: aiData.sopData
      };
      
      newHistory.push(aiMsg);

      this.setData({
        chatHistory: newHistory,
        isLoading: false,
        suggestions: aiData.suggestions && aiData.suggestions.length > 0 ? aiData.suggestions : this.data.suggestions,
        scrollToView: 'scroll-bottom' // Scroll again
      });

    } catch (err) {
      console.error("Chat Error:", err);
      const errMsg = err.message || err.errMsg || "未知错误";
      const newHistory = this.data.chatHistory.filter(m => !m.isLoading);
      
      // 用户友好提示 + 调试信息
      newHistory.push({ 
        role: 'assistant', 
        reply: `网络开小差了，兜兜没听清 😣\n\n(错误信息: ${errMsg})\n请检查网络连接后重试。` 
      });
      
      this.setData({
        chatHistory: newHistory,
        isLoading: false,
        scrollToView: 'scroll-bottom'
      });
    }
  },

  // Profile Logic
  showProfile() { this.setData({ showModal: true }); },
  closeProfile() { this.setData({ showModal: false }); },
  stopProp() {},
  
  bindName(e) { this.setData({ 'profile.name': e.detail.value }); },
  bindDate(e) { 
    this.setData({ 'profile.birth': e.detail.value });
    this.updateAgeDisplay();
  },
  setGender(e) {
    this.setData({ 'profile.gender': e.currentTarget.dataset.g });
  },
  
  saveProfile() {
    app.globalData.userProfile = this.data.profile;
    this.closeProfile();
    wx.showToast({ title: '已保存', icon: 'success' });
    // Clear history to refresh context? Maybe optional.
    // this.setData({ chatHistory: [] });
  }
})
