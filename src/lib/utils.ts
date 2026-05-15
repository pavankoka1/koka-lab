export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function parseHex(hex: string) {
  const h = hex.replace("#", "");
  const v =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const parse = (s: string) => {
    const n = parseInt(s, 16);
    return Number.isNaN(n) ? 0 : n;
  };
  return { r: parse(v.slice(0, 2)), g: parse(v.slice(2, 4)), b: parse(v.slice(4, 6)) };
}

export function hostnameOf(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}
