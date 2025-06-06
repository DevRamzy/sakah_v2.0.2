export interface Image {
  id?: string;
  url?: string;
  path?: string;
  storagePath?: string;
  isPrimary?: boolean;
  alt?: string;
  caption?: string;
  order?: number;
}

export interface ProcessedImage {
  id: string;
  url: string;
  isPrimary: boolean;
  alt?: string;
  thumbnail?: string;
}