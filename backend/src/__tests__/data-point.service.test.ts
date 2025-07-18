jest.mock('@prisma/client', () => ({ PrismaClient: jest.fn(() => ({})) }));

import { roundToStartOfDay, parseThreshold } from '../services/data-point.service';

describe('roundToStartOfDay', () => {
  it('rounds a date to midnight', () => {
    const date = new Date('2024-04-20T15:30:45Z');
    const result = roundToStartOfDay(date);
    expect(result.getUTCHours()).toBe(0);
    expect(result.getUTCMinutes()).toBe(0);
    expect(result.getUTCSeconds()).toBe(0);
  });
});

describe('parseThreshold', () => {
  it('parses numeric threshold from string', () => {
    expect(parseThreshold('>5')).toBe(5);
    expect(parseThreshold('%>10')).toBe(10);
  });
});
