function toHumanReadable(num: number): string {
  // Converts numbers to human-readable format: 1,234 -> 1.23k, 1,000,000 -> 1m, etc.
  const absNum = Math.abs(num);

  if (absNum < 1000) {
    return num.toString();
  }

  const units = [
    { value: 1_000_000_000_000, symbol: "t" },
    { value: 1_000_000_000, symbol: "b" },
    { value: 1_000_000, symbol: "m" },
    { value: 1_000, symbol: "k" },
  ];

  for (const unit of units) {
    if (absNum >= unit.value) {
      const formatted = (num / unit.value).toFixed(
        absNum < unit.value * 10 ? 2 : absNum < unit.value * 100 ? 1 : 0,
      );
      return `${formatted}${unit.symbol}`;
    }
  }

  return num.toLocaleString();
}

export { toHumanReadable };
