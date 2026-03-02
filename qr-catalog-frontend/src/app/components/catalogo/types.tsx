// components/catalogo/types.ts
export interface Look {
  _id: string;
  name: string;
  images: string[];
  is_active: boolean;
  month: string;
  year: number;
  likes: number;
  dislikes: number;
  views: number;
  comments: Array<{
    rating: number;
    comment: string;
    date: string;
  }>;
}

export interface HistoricalCollection {
  id: string;
  month: string;
  year: number;
  looks: Look[];
}

export interface ActiveCatalog {
  type: 'current' | 'historical';
  index: number;
  title: string;
  month?: string;
  year?: number;
}