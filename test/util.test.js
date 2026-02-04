const util = require('../miniprogram/utils/util.js');

describe('Utility Functions', () => {
  test('calculateAge should return correct string', () => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    
    // Formatting date as YYYY-MM-DD
    const formatDate = (d) => d.toISOString().split('T')[0];

    expect(util.calculateAge(formatDate(oneMonthAgo))).toContain('1个月');
    expect(util.calculateAge(formatDate(oneYearAgo))).toContain('1岁0个月');
  });

  test('calculateAge handles future dates', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(util.calculateAge(future.toISOString().split('T')[0])).toBe('未出生');
  });
});
