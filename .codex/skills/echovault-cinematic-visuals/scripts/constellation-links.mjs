/** Performance-safe constellation link calculations for EchoVault memory maps. */
export function distanceSquared(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function buildConstellationLinks(points, options = {}) {
  const {
    maxDistance = 180,
    maxLinksPerPoint = 3,
    minAffinity = 0,
    affinity = (a, b) => Math.min(a.affinity ?? 1, b.affinity ?? 1),
  } = options;
  const maxDistanceSq = maxDistance * maxDistance;
  const counts = new Map();
  const links = [];

  for (let i = 0; i < points.length; i += 1) {
    const candidates = [];
    for (let j = i + 1; j < points.length; j += 1) {
      const score = affinity(points[i], points[j]);
      if (score < minAffinity) continue;
      const d2 = distanceSquared(points[i], points[j]);
      if (d2 <= maxDistanceSq) candidates.push({ from: i, to: j, d2, score });
    }
    candidates.sort((a, b) => b.score - a.score || a.d2 - b.d2);
    for (const link of candidates) {
      if ((counts.get(link.from) || 0) >= maxLinksPerPoint) break;
      if ((counts.get(link.to) || 0) >= maxLinksPerPoint) continue;
      counts.set(link.from, (counts.get(link.from) || 0) + 1);
      counts.set(link.to, (counts.get(link.to) || 0) + 1);
      links.push({ ...link, opacity: Math.max(0.08, Math.min(0.48, link.score * (1 - link.d2 / maxDistanceSq))) });
    }
  }
  return links;
}

export function drawConstellationLinks(ctx, points, links, { color = '148, 163, 255', width = 1 } = {}) {
  ctx.save();
  ctx.lineWidth = width;
  for (const link of links) {
    const a = points[link.from];
    const b = points[link.to];
    ctx.strokeStyle = `rgba(${color}, ${link.opacity.toFixed(3)})`;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();
}
