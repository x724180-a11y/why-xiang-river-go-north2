// data/heritageData.ts 
import { HeritageItem } from '../types';

export const heritageItems: HeritageItem[] = [
  // UNESCO World Heritage Sites 
  {
    id: 1,
    name: '故宫',
    nameEn: 'Forbidden City',
    country: '中国',
    description: '明清两代皇宫建筑群，世界最大古代宫殿建筑群，象征中国帝王权力。',
    lat: 39.9163,
    lng: 116.3971,
    images: [
      'https://whc.unesco.org/uploads/thumbs/site_0439_0001-1000-1500-20180427151305.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/The_Hall_of_Supreme_Harmony%2C_Forbidden_City.jpg/1280px-The_Hall_of_Supreme_Harmony%2C_Forbidden_City.jpg',
      'https://images.unsplash.com/photo-1582201362267-3ffe9212f33a?w=800',
      'https://www.gettyimages.com/detail/photo/forbidden-city-royalty-free-image/157597870'
    ],
    isProcedural: false,
    quote: '海内存知己，天涯若比邻。'
  },
  {
    id: 2,
    name: '泰姬陵',
    nameEn: 'Taj Mahal',
    country: '印度',
    description: '莫卧儿帝国的白色大理石陵墓，象征永恒的爱，伊斯兰建筑杰作。',
    lat: 27.1751,
    lng: 78.0421,
    images: [
      'https://whc.unesco.org/uploads/thumbs/site_0252_0001-1000-1500-20180427145747.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Taj_Mahal%2C_Agra%2C_India.jpg/1280px-Taj_Mahal%2C_Agra%2C_India.jpg',
      'https://images.unsplash.com/photo-1564507592333-89c54e4c4e5a?w=800',
      'https://www.gettyimages.com/detail/photo/taj-mahal-royalty-free-image/157597871'
    ],
    isProcedural: false,
    quote: '爱是永恒的建筑。'
  },
  {
    id: 3,
    name: '埃菲尔铁塔',
    nameEn: 'Eiffel Tower',
    country: '法国',
    description: '巴黎铁塔，象征浪漫与工程奇迹，19世纪工业革命标志。',
    lat: 48.8584,
    lng: 2.2945,
    images: [
      'https://whc.unesco.org/uploads/thumbs/site_0600_0001-1000-1500-20180427151503.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Eiffel_Tower_Paris_July_2013-2.jpg/1280px-Eiffel_Tower_Paris_July_2013-2.jpg',
      'https://images.unsplash.com/photo-1540889921-7185b936e762?w=800',
      'https://www.gettyimages.com/detail/photo/eiffel-tower-royalty-free-image/157597872'
    ],
    isProcedural: false,
    quote: '巴黎是爱之城。'
  },
  {
    id: 4,
    name: '万里长城',
    nameEn: 'Great Wall of China',
    country: '中国',
    description: '古代防御工事，绵延万里，象征中国工程智慧。',
    lat: 40.3592,
    lng: 116.0073,
    images: [
      'https://whc.unesco.org/uploads/thumbs/site_0438_0001-1000-1500-20180427151252.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Great_Wall_of_China_at_Jinshanling.jpg/1280px-Great_Wall_of_China_at_Jinshanling.jpg',
      'https://images.unsplash.com/photo-1540889921-7185b936e762?w=800',
      'https://www.gettyimages.com/detail/photo/great-wall-of-china-royalty-free-image/157597873'
    ],
    isProcedural: false,
    quote: '不到长城非好汉。'
  },
  {
    id: 5,
    name: '吉萨金字塔',
    nameEn: 'Pyramids of Giza',
    country: '埃及',
    description: '古埃及法老陵墓，建筑奇迹之一。',
    lat: 29.9792,
    lng: 31.1342,
    images: [
      'https://whc.unesco.org/uploads/thumbs/site_0086_0001-1000-1500-20180427143758.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Pyramids_of_Giza_2014-06-11.jpg/1280px-Pyramids_of_Giza_2014-06-11.jpg',
      'https://images.unsplash.com/photo-1544716246-9e92b00a8eb1?w=800',
      'https://www.gettyimages.com/detail/photo/pyramids-of-giza-royalty-free-image/157597874'
    ],
    isProcedural: false,
    quote: '永恒的守望者。'
  },
  
  
  {
    id: 55,
    name: '瑜伽',
    nameEn: 'Yoga',
    country: '印度',
    description: '古老的身体、心灵和精神实践，UNESCO 非物质遗产。',
    lat: 28.6139,
    lng: 77.2090,
    images: [
      'https://ich.unesco.org/uploads/elements/2016_2/yoga/01-yoga-1.jpg',
      'https://images.unsplash.com/photo-1544716246-9e92b00a8eb1?w=800',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Yoga_in_Varkala%2C_India.jpg/1280px-Yoga_in_Varkala%2C_India.jpg',
      'https://www.gettyimages.com/detail/photo/yoga-practice-royalty-free-image/157597875'
    ],
    isProcedural: false,
    quote: '瑜伽是心灵的宁静。'
  }
];

export default heritageItems;
