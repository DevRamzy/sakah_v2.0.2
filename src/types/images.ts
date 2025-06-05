export interface Image {
  id?: string;
  url?: string;
  path?: string;
  storagePath?: string;
  isPrimary?: boolean;
  caption?: string;
  order?: number;
}

export interface ProcessedImage extends Image {
  isPrimary: boolean;
  thumbnail?: string;
}
