// Base interface for common properties
interface BaseResult {
  title: string;
  url: string;
}

// Interface for general search results
export interface SearchResult extends BaseResult {
  snippet: string;
  position?: number;  // Search result position
  domain?: string;    // Extracted domain from URL
}

// Interface for image search results
export interface ImageResult extends BaseResult {
  imageUrl: string;
  dimensions: string;
  pageUrl: string;
  size?: string;      // Image file size if available
  format?: string;    // Image format/type
  thumbnail?: string; // Thumbnail URL if different from main image
}

// Interface for video search results
export interface VideoResult extends BaseResult {
  thumbnailUrl: string;
  duration: string;
  source: string;
  views: string;
  uploadDate?: string;  // Video upload date if available
  channel?: string;     // Channel/uploader information
}

// Interface for news search results
export interface NewsResult extends BaseResult {
  source: string;
  time: string;
  snippet: string;
  category?: string;    // News category if available
  imageUrl?: string;    // News article image if available
}

// Enhanced error response interface
export interface ErrorResponse {
  code: number;
  message: string;
  type: string;
  timestamp: number;
  details?: unknown;
}

// Configuration interface for service options
export interface DuckDuckGoConfig {
  cacheTTL?: number;
  timeout?: number;
  maxRetries?: number;
  language?: string;
  region?: string;
  safeSearch?: boolean;
}

// Search parameters interface
export interface SearchParams {
  query: string;
  type?: 'search' | 'images' | 'videos' | 'news';
  page?: number;
  limit?: number;
}

export interface AboutInfoboxItem {
  label: string;
  value: string;
}

export interface AboutExternalLink {
  title: string;
  url: string;
  icon?: string;
}

export interface AboutResult {
  title: string;
  subtitle: string;
  imageUrl: string;
  description: string;
  source: {
    name: string;
    url: string;
  };
  infobox: AboutInfoboxItem[];
  externalLinks: AboutExternalLink[];
}
