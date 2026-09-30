// Fisher–Yates: every order of 0..n-1 equally likely (n! paths, one per order). Runs at the
// dispatch site, outside the reducer; the order travels in the action (D100).
// `random` is injectable so tests can walk every path.
export function shuffledOrder(n: number, random: () => number = Math.random): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1)); // 0..i inclusive
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
