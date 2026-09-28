/** Split diamond: two opposing probes around the sample. */
export const BRAND_PATH = 'M13 4 2 17l11 13M21 4 32 17 21 30M17 12l5 5-5 5-5-5Z';
export const brandSvg = (color = '#c4afff') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34"><path d="${BRAND_PATH}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter"/></svg>`;
