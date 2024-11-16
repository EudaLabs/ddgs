import { DuckDuckGoService } from '../src/services';
import { DuckDuckGoError } from '../src/errors';
import type { VideoResult } from '../src/services/videos';

describe('DuckDuckGoService - Videos', () => {
  let ddg: DuckDuckGoService;
  let videoResults: VideoResult[];

  beforeAll(async () => {
    ddg = new DuckDuckGoService();
    videoResults = await ddg.searchVideos('test');
  });

  afterAll(async () => {
    await ddg.close();
  });

  it('should return basic video results', () => {
    expect(videoResults.length).toBeGreaterThan(0);
    expect(videoResults[0]).toMatchObject({
      title: expect.any(String),
      url: expect.stringMatching(/^https?:\/\//),
    });
  });

  it('should include video metadata when available', () => {
    const firstResult = videoResults[0];
    
    if (firstResult.duration) {
      expect(firstResult.duration).toMatch(/^(\d+:)?\d+:\d+$/);
    }
    if (firstResult.views) {
      expect(firstResult.views).toMatch(/\d+K?M?\s*views/);
    }
    if (firstResult.thumbnailUrl) {
      expect(firstResult.thumbnailUrl).toMatch(/^https?:\/\//);
    }
  });

  it('should validate video result structure', () => {
    for (const result of videoResults) {
      expect(result).toMatchObject({
        title: expect.any(String),
        url: expect.stringMatching(/^https?:\/\//),
      });

      if (result.thumbnailUrl) {
        expect(result.thumbnailUrl).toMatch(/^https?:\/\//);
      }
      if (result.duration) {
        expect(result.duration).toMatch(/^(\d+:)?\d+:\d+$/);
      }
      if (result.views) {
        expect(result.views).toMatch(/\d+K?M?\s*views/);
      }
    }
  });

  it('should return unique results', () => {
    const uniqueUrls = new Set(videoResults.map(r => r.url));
    expect(uniqueUrls.size).toBe(videoResults.length);
  });

  it('should handle empty queries', async () => {
    await expect(ddg.searchVideos('')).rejects.toThrow(DuckDuckGoError);
  });

  it('should handle invalid queries', async () => {
    await expect(ddg.searchVideos('   ')).rejects.toThrow(DuckDuckGoError);
  });

  it('should handle timeouts', async () => {
    const shortTimeoutService = new DuckDuckGoService({ timeout: 1 });
    await expect(shortTimeoutService.searchVideos('test')).rejects.toThrow();
  });
}); 