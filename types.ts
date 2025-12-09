export interface HeritageItem {
  id: string;
  nameZh: string;
  nameEn: string;
  location: string; 
  country: string;
  continent: 'Asia' | 'Europe' | 'Africa' | 'Americas' | 'Oceania' | 'Antarctica';
  coordinates: { lat: number; lng: number };
  category: 'Tangible' | 'Intangible' | 'Mixed' | 'Natural';
  descriptionZh: string;
  descriptionEn: string;
  imageUrl: string;
  era: string;
  isProcedural?: boolean; // For filler particles
}

export type Language = 'zh' | 'en';

export interface PoemEntry {
  line: string;
  translation: string;
  author: string;
  year?: string;
  lang?: string;
}

export type PoetryDatabase = Record<string, PoemEntry[]>;

// Visualizer specific
export interface ParticleData {
  position: [number, number, number];
  velocity: [number, number, number];
  item: HeritageItem;
  phase: number;
}
