// src/constants/uiText.ts —— 中英文完美支持
export const UI_TEXT = {
  zh: {
    title: '为什么湘江北去？',
    subtitle: '因为世界上所有的水都是湘江之水，包括泪水',
    back: '返回',
    history: '历史',
    related: '相关遗址',
    reimagine: '重想象此地',
    prompt: '用文字描述你想看到的样子...',
    generate: '生成',
    generating: '生成中...',
    download: '下载'
  },
  en: {
    title: 'Why Does the Xiang River Flow North?',
    subtitle: 'Because all water in the world is Xiang River water — including tears',
    back: 'Back',
    history: 'History',
    related: 'Related Sites',
    reimagine: 'Reimagine This Place',
    prompt: 'Describe what you want to see...',
    generate: 'Generate',
    generating: 'Generating...',
    download: 'Download'
  }
} as const;

export type Language = 'zh' | 'en';
