
import { HeritageItem, PoetryDatabase } from './types';

// Curated Top-Tier Sites
export const FEATURED_HERITAGE_ITEMS: HeritageItem[] = [
  {
    id: 'cn-1',
    nameZh: '万里长城',
    nameEn: 'The Great Wall',
    location: 'Beijing / Northern China',
    country: 'China',
    continent: 'Asia',
    coordinates: { lat: 40.4319, lng: 116.5704 },
    category: 'Tangible',
    descriptionZh: '横跨中国北部的古代军事防御工程，人类历史上最宏大的建筑奇迹之一。宛如巨龙蜿蜒于崇山峻岭之间，守护着古老文明的疆土。',
    descriptionEn: 'A series of fortifications made of stone, brick, tampered earth, wood, and other materials, generally built along an east-to-west line across the historical northern borders of China.',
    imageUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=2070&auto=format&fit=crop',
    era: '7th Century BC - 1644 AD'
  },
  {
    id: 'eg-1',
    nameZh: '吉萨金字塔群',
    nameEn: 'Pyramids of Giza',
    location: 'Giza, Greater Cairo',
    country: 'Egypt',
    continent: 'Africa',
    coordinates: { lat: 29.9792, lng: 31.1342 },
    category: 'Tangible',
    descriptionZh: '古埃及法老的陵墓，古代世界七大奇迹中唯一尚存的建筑。它们在沙漠中静默，诉说着永恒的渴望。',
    descriptionEn: 'The Giza Pyramid Complex, also called the Giza Necropolis, is the site on the Giza Plateau in Greater Cairo, Egypt that includes the Great Pyramid of Giza, the Pyramid of Khafre, and the Pyramid of Menkaure.',
    imageUrl: 'https://images.unsplash.com/photo-1539650116455-251d9a04a2f4?q=80&w=1974&auto=format&fit=crop',
    era: 'c. 2580–2560 BC'
  },
  {
    id: 'it-1',
    nameZh: '罗马斗兽场',
    nameEn: 'Colosseum',
    location: 'Rome, Lazio',
    country: 'Italy',
    continent: 'Europe',
    coordinates: { lat: 41.8902, lng: 12.4922 },
    category: 'Tangible',
    descriptionZh: '罗马帝国时期最大的圆形剧场，见证了角斗士的生死搏杀与帝国的兴衰。永恒之城的象征。',
    descriptionEn: 'An oval amphitheatre in the centre of the city of Rome, Italy, just east of the Roman Forum. It is the largest ancient amphitheatre ever built, and is still the largest standing amphitheatre in the world today.',
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1996&auto=format&fit=crop',
    era: '70–80 AD'
  },
  {
    id: 'in-1',
    nameZh: '泰姬陵',
    nameEn: 'Taj Mahal',
    location: 'Agra, Uttar Pradesh',
    country: 'India',
    continent: 'Asia',
    coordinates: { lat: 27.1751, lng: 78.0421 },
    category: 'Tangible',
    descriptionZh: '莫卧儿皇帝沙·贾汗为纪念爱妻而建的白色大理石陵墓。一滴爱的泪珠，凝固在永恒的时间面颊上。',
    descriptionEn: 'An ivory-white marble mausoleum on the southern bank of the river Yamuna in the Indian city of Agra. It was commissioned in 1632 by the Mughal emperor Shah Jahan to house the tomb of his favorite wife.',
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1776&auto=format&fit=crop',
    era: '1632–1653 AD'
  },
  {
    id: 'pe-1',
    nameZh: '马丘比丘',
    nameEn: 'Machu Picchu',
    location: 'Cusco Region',
    country: 'Peru',
    continent: 'Americas',
    coordinates: { lat: -13.1631, lng: -72.5450 },
    category: 'Tangible',
    descriptionZh: '印加帝国的遗迹，被称为“失落的印加城市”。云端的城市，太阳的子民。',
    descriptionEn: 'A 15th-century Inca citadel, located in the Eastern Cordillera of southern Peru on a 2,430-metre (7,970 ft) mountain ridge.',
    imageUrl: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=2076&auto=format&fit=crop',
    era: 'c. 1450 AD'
  },
  {
    id: 'kh-1',
    nameZh: '吴哥窟',
    nameEn: 'Angkor Wat',
    location: 'Siem Reap',
    country: 'Cambodia',
    continent: 'Asia',
    coordinates: { lat: 13.4125, lng: 103.8667 },
    category: 'Tangible',
    descriptionZh: '世界上最大的宗教建筑群，高棉帝国建筑艺术的巅峰。石头的微笑隐藏着诸神的秘密。',
    descriptionEn: 'A temple complex in Cambodia and the largest religious monument in the world. Originally constructed as a Hindu temple dedicated to the god Vishnu, it was gradually transformed into a Buddhist temple.',
    imageUrl: 'https://images.unsplash.com/photo-1600520611035-8a27863702a8?q=80&w=2069&auto=format&fit=crop',
    era: '12th Century'
  },
  {
    id: 'jo-1',
    nameZh: '佩特拉',
    nameEn: 'Petra',
    location: 'Ma\'an Governorate',
    country: 'Jordan',
    continent: 'Asia',
    coordinates: { lat: 30.3285, lng: 35.4444 },
    category: 'Tangible',
    descriptionZh: '玫瑰红色的城市，从岩石中雕刻而成。沙漠中的奇迹，纳巴泰人的宝藏。',
    descriptionEn: 'A historical and archaeological city in southern Jordan. It is famous for its rock-cut architecture and water conduit system.',
    imageUrl: 'https://images.unsplash.com/photo-1579606864177-33a59828d090?q=80&w=2070&auto=format&fit=crop',
    era: 'c. 312 BC'
  },
  {
    id: 'fr-1',
    nameZh: '凡尔赛宫',
    nameEn: 'Palace of Versailles',
    location: 'Versailles',
    country: 'France',
    continent: 'Europe',
    coordinates: { lat: 48.8049, lng: 2.1204 },
    category: 'Tangible',
    descriptionZh: '法国绝对君主制的象征，以其奢华的装饰和宏大的花园而闻名。镜厅中的光影，折射出权力的辉煌。',
    descriptionEn: 'A former royal residence located in Versailles, about 12 miles west of Paris, France. The palace is owned by the French Republic.',
    imageUrl: 'https://images.unsplash.com/photo-1565060169113-585a0657c79e?q=80&w=2070&auto=format&fit=crop',
    era: '1682 AD'
  },
  {
    id: 'gr-1',
    nameZh: '雅典卫城',
    nameEn: 'Acropolis of Athens',
    location: 'Athens',
    country: 'Greece',
    continent: 'Europe',
    coordinates: { lat: 37.9715, lng: 23.7257 },
    category: 'Tangible',
    descriptionZh: '古希腊文明的象征，包含帕特农神庙等著名建筑。西方文明的摇篮，理性的光辉。',
    descriptionEn: 'An ancient citadel located on a rocky outcrop above the city of Athens and contains the remains of several ancient buildings of great architectural and historic significance.',
    imageUrl: 'https://images.unsplash.com/photo-1541270941907-3d714398c25e?q=80&w=1935&auto=format&fit=crop',
    era: '5th Century BC'
  },
  {
    id: 'mx-1',
    nameZh: '奇琴伊察',
    nameEn: 'Chichen Itza',
    location: 'Yucatán',
    country: 'Mexico',
    continent: 'Americas',
    coordinates: { lat: 20.6843, lng: -88.5678 },
    category: 'Tangible',
    descriptionZh: '玛雅文明的伟大城市，库库尔坎金字塔见证了精妙的天文历法。羽蛇神的降临之地。',
    descriptionEn: 'A large pre-Columbian city built by the Maya people of the Terminal Classic period.',
    imageUrl: 'https://images.unsplash.com/photo-1518638150340-f706e8403698?q=80&w=2025&auto=format&fit=crop',
    era: 'c. 600–1200 AD'
  }
];

// Generate procedural items to fill the river to 1248 particles
const generateProceduralItems = (count: number): HeritageItem[] => {
  const fillers: HeritageItem[] = [];
  const continents = ['Asia', 'Europe', 'Africa', 'Americas', 'Oceania'] as const;
  
  for (let i = 0; i < count; i++) {
    fillers.push({
      id: `proc-${i}`,
      nameZh: '未名遗产',
      nameEn: 'Unrecorded Heritage',
      location: 'Unknown',
      country: 'Unknown',
      continent: continents[Math.floor(Math.random() * continents.length)],
      coordinates: { lat: 0, lng: 0 },
      category: 'Tangible',
      descriptionZh: '历史长河中的璀璨星辰。',
      descriptionEn: 'A shining star in the river of history.',
      imageUrl: 'https://picsum.photos/seed/history/1600/900',
      era: 'Ancient',
      isProcedural: true
    });
  }
  return fillers;
};

// Combine real and procedural
export const HERITAGE_ITEMS: HeritageItem[] = [
  ...FEATURED_HERITAGE_ITEMS,
  ...generateProceduralItems(1200 - FEATURED_HERITAGE_ITEMS.length)
];

export const POETRY_DATABASE: PoetryDatabase = {
  'China': [
    { line: '大江东去，浪淘尽，千古风流人物。', translation: 'The Great River flows east, washing away the gallant heroes of antiquity.', author: 'Su Shi', year: '1082 AD', lang: 'zh' },
    { line: '秦时明月汉时关。', translation: 'The moon of Qin times shines on the pass of Han.', author: 'Wang Changling', year: '740 AD', lang: 'zh' }
  ],
  'Egypt': [
    { line: 'I have seen the desert become a mirror of the sky.', translation: '我看过沙漠变成天空的镜子。', author: 'Nizar Qabbani', year: 'Modern', lang: 'ar' },
    { line: 'All the world fears Time, but Time fears the Pyramids.', translation: '世人皆惧时间，而时间独惧金字塔。', author: 'Arab Proverb', year: 'Ancient', lang: 'ar' }
  ],
  'Italy': [
    { line: 'Roma, non basta una vita.', translation: 'Rome, a lifetime is not enough.', author: 'Italian Saying', year: 'Traditional', lang: 'it' },
    { line: 'Every stone has a story to tell.', translation: '每一块石头都有故事。', author: 'Cicero', year: '1st Century BC', lang: 'la' }
  ],
  'India': [
    { line: 'Like a teardrop on the cheek of time.', translation: '如时间面颊上的一滴泪。', author: 'Rabindranath Tagore', year: '1905', lang: 'bn' }
  ],
  'Peru': [
    { line: 'High reef of the human dawn.', translation: '人类黎明的高礁。', author: 'Pablo Neruda', year: '1945', lang: 'es' }
  ],
  'Cambodia': [
    { line: 'Silence is the language of God.', translation: '沉默是神的语言。', author: 'Khmer Proverb', year: 'Traditional', lang: 'km' }
  ],
  'Greece': [
    { line: 'Wisdom begins in wonder.', translation: '智慧始于惊奇。', author: 'Socrates', year: '400 BC', lang: 'gr' }
  ],
  'France': [
    { line: 'Paris is a moveable feast.', translation: '巴黎是一席流动的盛宴。', author: 'Ernest Hemingway', year: '1964', lang: 'en' }
  ],
  'Mexico': [
    { line: 'The sun is the father of all life.', translation: '太阳是万物之父。', author: 'Mayan Belief', year: 'Ancient', lang: 'myn' }
  ],
  'default': [
    { line: 'History is a philosophy teaching by examples.', translation: '历史是以榜样进行教导的哲学。', author: 'Thucydides', year: '400 BC', lang: 'gr' }
  ]
};

export const UI_TEXT = {
  zh: {
    title: '为什么湘江北去？',
    subtitle: '世界遗产永恒之河',
    loading: '正在唤醒历史...',
    location: '地理坐标',
    back: '返回长河',
    reimagine: 'AI 意象重塑',
    create: '创意工坊',
    prompt: '描述你心中的历史景象...',
    promptPlaceholder: '在此描述你的创意灵感...',
    generate: '开始重塑',
    generating: '绘制中...',
    download: '收藏影像',
    history: '历史回响',
    related: '同域遗产'
  },
  en: {
    title: 'Why Does the Xiang River Flow North?',
    subtitle: 'Eternal River of World Heritage',
    loading: 'Awakening History...',
    location: 'Coordinates',
    back: 'Return to River',
    reimagine: 'AI Reimagination',
    create: 'Creative Studio',
    prompt: 'Describe your vision of history...',
    promptPlaceholder: 'Describe your creative inspiration here...',
    generate: 'Reimagine',
    generating: 'Painting...',
    download: 'Collect Visual',
    history: 'Echoes of History',
    related: 'Regional Sites'
  }
};
