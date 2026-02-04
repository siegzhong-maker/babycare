const api = require('../miniprogram/utils/api.js');

// Mock wx global
global.wx = {
  request: jest.fn()
};

describe('API Service', () => {
  beforeEach(() => {
    global.wx.request.mockClear();
  });

  test('sendChat calls wx.request with correct params', async () => {
    const mockSuccess = {
      statusCode: 200,
      data: {
        choices: [{ message: { content: '{"reply":"Hello"}' } }]
      }
    };
    
    global.wx.request.mockImplementation((opts) => {
      opts.success(mockSuccess);
    });

    const messages = [{ role: 'user', content: 'Hi' }];
    const res = await api.sendChat(messages);
    
    expect(global.wx.request).toHaveBeenCalled();
    expect(res).toBe('{"reply":"Hello"}');
  });

  test('safeParseJSON cleans markdown', () => {
    const raw = '```json\n{"reply": "hi"}\n```';
    const parsed = api.safeParseJSON(raw);
    expect(parsed.reply).toBe('hi');
  });

  test('safeParseJSON handles broken JSON gracefully', () => {
    const broken = '{"reply": "oops", "action": "sop"'; // Missing closing brace
    const parsed = api.safeParseJSON(broken);
    expect(parsed.reply).toBe('oops');
    // It should successfully recover 'sop' action even if JSON is broken
    expect(parsed.action).toBe('sop'); 
  });
});
