export interface FileKey {
  id: string;
}

export interface File extends FileKey {
  filename: string;
  timestamp: string;
  type: string;
  size: number;
  url: string;
}