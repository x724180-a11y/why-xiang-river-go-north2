// types/index.ts
export interface HeritageItem {
  id: number | string;
  name: string;
  nameEn: string;
  country: string;
  description?: string;
  imgSrc?: string;
  isProcedural?: boolean;
}
