const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
  AUD: "A$",
  CAD: "C$",
};

export function formatCurrency(amount: number, currency = "GBP"): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency + " ";
  return symbol + amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatHours(decimal: number): string {
  if (decimal < 1) {
    const mins = Math.round(decimal * 60);
    return mins + "m";
  }
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatHoursShort(decimal: number): string {
  return decimal.toFixed(1) + "h";
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateISO(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

/** Generate next invoice number: INV-YYYY-NNNN (increment per user handled in app) */
export function generateInvoiceNumber(sequence: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(4, "0");
  return `INV-${year}-${padded}`;
}
