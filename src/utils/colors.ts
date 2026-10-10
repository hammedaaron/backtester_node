/**
 * Calculates transition color from Red -> Orange -> Amber -> Green
 * based on completion ratio (0.0 to 1.0+).
 */
export function getProgressHexColor(completed: number, goal: number): string {
  if (goal <= 0) return '#ef4444';
  const ratio = Math.max(0, Math.min(1, completed / goal));

  // Multi-stop color points:
  // 0.00: Red (#ef4444 -> [239, 68, 68])
  // 0.33: Orange (#f97316 -> [249, 115, 22])
  // 0.66: Amber (#f59e0b -> [245, 158, 11])
  // 1.00: Green (#10b981 -> [16, 185, 129])

  const stops = [
    { pos: 0.0, r: 239, g: 68, b: 68 }, // Red
    { pos: 0.33, r: 249, g: 115, b: 22 }, // Orange
    { pos: 0.66, r: 245, g: 158, b: 11 }, // Amber
    { pos: 1.0, r: 16, g: 185, b: 129 }, // Emerald Green
  ];

  for (let i = 0; i < stops.length - 1; i++) {
    const s1 = stops[i];
    const s2 = stops[i + 1];
    if (ratio >= s1.pos && ratio <= s2.pos) {
      const localRatio = (ratio - s1.pos) / (s2.pos - s1.pos);
      const r = Math.round(s1.r + (s2.r - s1.r) * localRatio);
      const g = Math.round(s1.g + (s2.g - s1.g) * localRatio);
      const b = Math.round(s1.b + (s2.b - s1.b) * localRatio);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  return '#10b981';
}

export function getProgressColorClass(completed: number, goal: number): string {
  if (goal <= 0) return 'text-red-500';
  const ratio = completed / goal;
  if (ratio >= 1.0) return 'text-emerald-400';
  if (ratio >= 0.70) return 'text-amber-400';
  if (ratio >= 0.35) return 'text-orange-400';
  return 'text-red-500';
}
