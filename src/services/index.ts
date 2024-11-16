import type { DuckDuckGoConfig } from './base';
import { SearchService } from './search';
import { ImageService } from './images';
import { VideoService } from './videos';
import { NewsService } from './news';

export class DuckDuckGoService {
  private searchService: SearchService;
  private imageService: ImageService;
  private videoService: VideoService;
  private newsService: NewsService;

  constructor(config: DuckDuckGoConfig = {}) {
    this.searchService = new SearchService(config);
    this.imageService = new ImageService(config);
    this.videoService = new VideoService(config);
    this.newsService = new NewsService(config);
  }

  async search(...args: Parameters<SearchService['search']>) {
    return this.searchService.search(...args);
  }

  async searchImages(...args: Parameters<ImageService['searchImages']>) {
    return this.imageService.searchImages(...args);
  }

  async searchVideos(...args: Parameters<VideoService['searchVideos']>) {
    return this.videoService.searchVideos(...args);
  }

  async searchNews(...args: Parameters<NewsService['searchNews']>) {
    return this.newsService.searchNews(...args);
  }

  async close() {
    await Promise.all([
      this.searchService.close(),
      this.imageService.close(),
      this.videoService.close(),
      this.newsService.close(),
    ]);
  }
}

export type { DuckDuckGoConfig } from './base';
export type { ImageResult } from './images';
export type { VideoResult } from './videos';
export type { NewsResult } from './news'; 