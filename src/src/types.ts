export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sources?: string[];
}

export interface Document {
  id: string;
  name: string;
  size: number;
  text: string;
  chunks: string[];
  status: 'processing' | 'ready' | 'error';
}

export interface SearchResult {
  text: string;
  docName: string;
  score: number;
}
