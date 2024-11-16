import { DuckDuckGoService } from '../src/services';
import { DuckDuckGoError } from '../src/errors';
import type { SearchResult } from '../src/types';

describe('DuckDuckGoService - Search', () => {
  let ddg: DuckDuckGoService;
  let searchResults: SearchResult[];

  beforeAll(async () => {
    ddg = new DuckDuckGoService();
    const { results } = await ddg.search('test');
    searchResults = results;
  });

  afterAll(async () => {
    await ddg.close();
  });

  it('should return valid search results', () => {
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0]).toMatchObject({
      title: expect.any(String),
      url: expect.stringMatching(/^https?:\/\//),
      snippet: expect.any(String),
      position: expect.any(Number),
      domain: expect.any(String),
    });
  });

  it('should validate search result structure', () => {
    for (const result of searchResults) {
      expect(result).toMatchObject({
        title: expect.any(String),
        url: expect.stringMatching(/^https?:\/\//),
        snippet: expect.any(String),
        position: expect.any(Number),
        domain: expect.any(String),
      });
    }
  });

  it('should return unique results', () => {
    const uniqueUrls = new Set(searchResults.map(r => r.url));
    expect(uniqueUrls.size).toBe(searchResults.length);
  });

  it('should handle empty queries', async () => {
    await expect(ddg.search('')).rejects.toThrow(DuckDuckGoError);
  });

  it('should handle invalid queries', async () => {
    await expect(ddg.search('   ')).rejects.toThrow(DuckDuckGoError);
  });

  it('should handle timeouts', async () => {
    const shortTimeoutService = new DuckDuckGoService({ timeout: 1 });
    await expect(shortTimeoutService.search('test')).rejects.toThrow();
  });
}); 