export const selectors = {
  search: {
    resultItem: [
      'article[id^="r1-"]',
      'article.yQDlj3B5DI5YO8c8Ulio.CpkrTDP54mqzpuCSn1Fa.SKlplDuh9FjtDprgoMxk',
    ],
    title: [
      'h2 a',
      'h2.LnpumSThxEWMIsDdAT17.CXMyPcQ6nDv47DKFeywM a',
    ],
    snippet: [
      'div.E2eLOJr8HctVnDOTM8fs div span.kY2IgmnCmOGjharHErah',
      'div.OgdwYG6KE2qthn9XQWFC span.kY2IgmnCmOGjharHErah',
    ],
    url: [
      'h2 a',
      'div.pAgARfGNTRe_uaK72TAD a.Rn_JXVtoPVAFyGkcaXyK',
    ],
    domain: [
      'div.OHr0VX9IuNcv6iakvT6A',
      'div.mwuQiMOjmFJ5vmN6Vcqw.SgSTKoqQXa0tEszD2zWF span',
    ],
  },
  images: {
    resultItem: [
      'div.tile.tile--img.has-detail',
      'div.tile--img',
    ],
    title: [
      'a.tile--img__sub',
      'span.tile--img__title',
    ],
    imageUrl: [
      'img.tile--img__img',
      'img.tile__media__img',
      'img.js-lazyload',
    ],
    pageUrl: [
      'a.tile--img__sub',
      'a.tile__link',
    ],
    dimensions: [
      'div.tile--img__dimensions',
      'span.tile--img__dimensions',
    ],
  },
  videos: {
    resultItem: [
      'div.tile.tile--c--w.tile--vid.has-detail.opt--t-xxs',
      'div.tile--vid',
    ],
    title: [
      'h6.tile__title.tile__title--2 a',
      'h6.tile__title a',
    ],
    body: [
      'div.tile__body',
      'div.tile__count',
    ],
    duration: [
      'div.image-labels span.image-labels__label',
      'span.image-labels__label',
    ],
    thumbnail: [
      'img.tile__media__img',
      'img.js-lazyload',
    ],
  },
  news: {
    resultItem: [
      'div.result.result--news',
      'div.result.result--news.result--img.result--url-above-snippet',
    ],
    title: [
      'h2.result__title a.result__a',
      'h2.result__title a',
    ],
    source: [
      'a.result__url',
      'span.result__extras__url a.result__url',
    ],
    snippet: [
      'div.result__snippet',
      'div.result__body div.result__snippet',
    ],
    time: [
      'span.result__timestamp',
      'time.result__timestamp',
    ],
  },
};
