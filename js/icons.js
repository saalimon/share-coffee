// Line icons — 24×24 grid, stroked with currentColor.

const P = {
  ratio: '<circle cx="7" cy="7" r="2.6"/><circle cx="17" cy="17" r="2.6"/><path d="M19 5 5 19"/>',
  timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.6 2.2M9.5 2.5h5M12 2.5V6M18.5 6.5l1.5-1.5"/>',
  book: '<path d="M5 5.2A2.2 2.2 0 0 1 7.2 3H19v14.5H7.2A2.2 2.2 0 0 0 5 19.7z"/><path d="M5 19.7A1.3 1.3 0 0 0 6.3 21H19M9 7.5h6M9 11h4"/>',
  tools: '<path d="M4 6.5h9M17 6.5h3M4 12h3M11 12h9M4 17.5h11M19 17.5h1"/><circle cx="15" cy="6.5" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17.5" r="2"/>',
  share: '<path d="M12 15V3.5M7.5 8 12 3.5 16.5 8M5 12.5V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  copy: '<rect x="8.5" y="8.5" width="12" height="12" rx="2.5"/><path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  arrowUpRight: '<path d="M7 17 17 7M8 7h9v9"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  swap: '<path d="M7 7h12l-3.5-3.5M17 17H5l3.5 3.5"/>',
  reset: '<path d="M4 4v5h5"/><path d="M5.2 15a7.5 7.5 0 1 0 .7-6.6L4 9"/>',
  skip: '<path d="M6 5.5v13l9-6.5z"/><path d="M18.5 5.5v13"/>',
  flag: '<path d="M5 21V4M5 4.5h11.5l-2.5 4 2.5 4H5"/>',
  sound: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  vibrate: '<rect x="8" y="3.5" width="8" height="17" rx="2"/><path d="M4.5 8.5v7M19.5 8.5v7M2 10.5v3M22 10.5v3"/>',
  count: '<circle cx="12" cy="12" r="8.5"/><path d="M10 9.5c.4-.9 1.2-1.5 2.2-1.5 1.3 0 2.3.9 2.3 2s-1 2-2.3 2c1.3 0 2.3.9 2.3 2s-1 2-2.3 2c-1 0-1.8-.6-2.2-1.5"/>',
  lock: '<rect x="5" y="11" width="14" height="9.5" rx="2.5"/><path class="shackle" d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12.5A1.6 1.6 0 0 0 8.6 21h6.8a1.6 1.6 0 0 0 1.6-1.5L18 7M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"/>',
  download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 20h14"/>',
  save: '<path d="M6 3.5h9.5L19.5 7.5V19a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V5A1.5 1.5 0 0 1 6 3.5z"/><path d="M8 3.5v5h7v-5M8 20.5v-6h8v6"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7.3l3-3a4 4 0 0 0-5.7-5.6l-1.5 1.5"/><path d="M14 10a4 4 0 0 0-5.7-.3l-3 3a4 4 0 0 0 5.7 5.6l1.5-1.5"/>',
  qr: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5zM14 20h.01M20 14h.01"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.2"/>',
  sparkle: '<path d="M12 3.5 13.8 10 20.5 12l-6.7 2-1.8 6.5-1.8-6.5L3.5 12l6.7-2z"/>',
  bean: '<g transform="rotate(35 12 12)"><ellipse cx="12" cy="12" rx="6.5" ry="9"/><path d="M12 3c-2.4 2.9 2.4 6.1 0 9s2.4 6.1 0 9"/></g>',
  thermo: '<path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z"/><path d="M12 9v8"/>',
  grind: '<circle cx="6" cy="16" r="1"/><circle cx="11" cy="15" r="1.6"/><circle cx="17" cy="14" r="2.4"/><path d="M3.5 20h17"/><path d="M8 5.5h8l-1.2 4H9.2z"/>',
  coin: '<circle cx="12" cy="12" r="8.5"/><path d="M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.4 0-2.5.8-2.5 2s1.1 1.6 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1.1 0-2-.4-2.5-1.2M12 6.5V8M12 16v1.5"/>',
  drop: '<path d="M12 3.5s6 6.4 6 10.7a6 6 0 0 1-12 0c0-4.3 6-10.7 6-10.7z"/>',
  calendar: '<rect x="4" y="5" width="16" height="15.5" rx="2.5"/><path d="M4 9.5h16M8.5 3v4M15.5 3v4"/>',
  scale: '<path d="M3.5 20.5h17M6 20.5l1.5-7h9l1.5 7M12 13.5V6M8 6h8"/>',

  // brew methods
  v60: '<path d="M3.5 4.5h17l-6.2 9.5H9.7z"/><path d="M9.5 14v1.8h5V14M6.5 20.5h11M7.5 17.5h9l-.6 3H8.1z"/>',
  chemex: '<path d="M6.5 3.5h11l-4.3 7.5 4.6 8.4a.8.8 0 0 1-.7 1.1H6.9a.8.8 0 0 1-.7-1.1l4.6-8.4z"/><path d="M10.3 9.6h3.4v2.8h-3.4z"/>',
  kalita: '<path d="M3.5 5.5h17l-4 8.5h-9z"/><path d="M8 5.5 10 14M12 5.5V14M16 5.5 14 14M6 18.5h12M7.5 14v4.5M16.5 14v4.5"/>',
  clever: '<path d="M3 4.5h18M4.5 6.5h15l-4.2 9H8.7z"/><path d="M10.5 15.5v2.5h3v-2.5M7 21h10"/>',
  press: '<path d="M6 7.5h11v12a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 6 19.5z"/><path d="M17 10h1.8a1.2 1.2 0 0 1 1.2 1.2v5.6a1.2 1.2 0 0 1-1.2 1.2H17M11.5 2.5v5M9 2.5h5M6 12h11"/>',
  aeropress: '<path d="M7 2.5h10M9 2.5v4M15 2.5v4M7.5 6.5h9v11h-9zM5.5 17.5h13v3h-13zM7.5 10h9"/>',
  espresso: '<path d="M5 9.5h11v4.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 11h1.5a2.2 2.2 0 0 1 0 4.4H16M3.5 21.5h15M9 3c-.9 1.2.9 2.3 0 3.5M12.5 3c-.9 1.2.9 2.3 0 3.5"/>',
  moka: '<path d="M8.5 3h7l1 4.5h-9z"/><path d="M7.5 7.5 6.5 12h11l-1-4.5M6.5 12l1.5 8.5h8l1.5-8.5M17 8.5l3 1.2v3.6L17 14.5M12 1v2"/>',
  coldbrew: '<path d="M7 3.5h10M7.5 3.5v2L6 8v11.5A1.5 1.5 0 0 0 7.5 21h9a1.5 1.5 0 0 0 1.5-1.5V8l-1.5-2.5v-2"/><path d="M9 12.5h2.8v2.8H9zM12.8 15h2.8v2.8h-2.8z"/>',
  iced: '<path d="M5.5 5h13l-1.6 14.6a1.6 1.6 0 0 1-1.6 1.4H8.7a1.6 1.6 0 0 1-1.6-1.4z"/><path d="M8.5 9.5h3v3h-3zM12.5 12.5h3v3h-3zM14 5l2.5-3"/>',
  cup: '<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3.5c-.8 1 .8 2 0 3M11.5 3.5c-.8 1 .8 2 0 3"/>',
};

export function icon(name, cls = '') {
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${P[name] || P.cup}</svg>`;
}

/** Icon whose paths "draw" in (Vivus-style) — uses pathLength normalisation */
export function drawIcon(name, cls = '') {
  const markup = (P[name] || P.cup).replace(/<(path|ellipse|circle|rect)\b/g, '<$1 pathLength="1" class="draw"');
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${markup}</svg>`;
}
