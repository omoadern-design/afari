interface AnomalyInput {
  amount: number;
  category: string;
  merchantName?: string;
  date: Date;
  userId: string;
  recentExpenses?: Array<{ amount: number; category: string; date: Date; merchantName?: string }>;
}

interface AnomalyResult {
  score: number; // 0.0–1.0
  reasons: string[];
  isAnomaly: boolean;
}

export function detectAnomaly(input: AnomalyInput): AnomalyResult {
  const reasons: string[] = [];
  let score = 0;

  const { amount, category, merchantName, date, recentExpenses = [] } = input;

  // 1. Amount vs rolling average for this category
  const categoryExpenses = recentExpenses.filter((e) => e.category === category);
  if (categoryExpenses.length >= 3) {
    const avg = categoryExpenses.reduce((s, e) => s + e.amount, 0) / categoryExpenses.length;
    if (amount > avg * 3) {
      score += 0.4;
      reasons.push(`Amount is ${(amount / avg).toFixed(1)}x above your average for ${category.toLowerCase().replace(/_/g, " ")}`);
    } else if (amount > avg * 2) {
      score += 0.2;
      reasons.push(`Amount is ${(amount / avg).toFixed(1)}x above your average for ${category.toLowerCase().replace(/_/g, " ")}`);
    }
  }

  // 2. Weekend/holiday transaction for corporate categories
  const dayOfWeek = date.getDay();
  const corpCategories = ["CONFERENCE", "OFFICE_SUPPLIES", "COMMUNICATION"];
  if ((dayOfWeek === 0 || dayOfWeek === 6) && corpCategories.includes(category)) {
    score += 0.15;
    reasons.push(`Corporate expense submitted on ${dayOfWeek === 0 ? "Sunday" : "Saturday"}`);
  }

  // 3. Duplicate amount+merchant within recent expenses (7 days)
  const sevenDaysAgo = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
  const duplicates = recentExpenses.filter(
    (e) =>
      e.merchantName === merchantName &&
      Math.abs(e.amount - amount) < 0.01 &&
      new Date(e.date) >= sevenDaysAgo
  );
  if (duplicates.length > 0) {
    score += 0.35;
    reasons.push(`Possible duplicate: same amount and merchant within the last 7 days`);
  }

  // 4. Round number amounts over $500 (potential fraud signal)
  if (amount >= 500 && amount % 100 === 0) {
    score += 0.1;
    reasons.push(`Round-number amount over $500 may require additional verification`);
  }

  // 5. Very large single expense
  if (amount > 5000) {
    score += 0.3;
    reasons.push(`Unusually large expense ($${amount.toLocaleString()})`);
  } else if (amount > 2000) {
    score += 0.15;
    reasons.push(`High-value expense ($${amount.toLocaleString()}) flagged for review`);
  }

  score = Math.min(score, 1.0);

  return {
    score: Math.round(score * 100) / 100,
    reasons,
    isAnomaly: score >= 0.3,
  };
}

interface RecommendationContext {
  type: "FLIGHT" | "HOTEL" | "CAR";
  results: Array<{ id: string; policyResult: string; price?: number; nightlyRate?: number; dailyRate?: number }>;
  userHistory?: Array<{ type: string; totalAmount: number }>;
}

export function rankRecommendations(ctx: RecommendationContext): string[] {
  // Return IDs of top 3 recommended results
  const scored = ctx.results.map((r) => {
    let score = 0;

    // Policy compliance is highest priority
    if (r.policyResult === "IN_POLICY") score += 50;
    else if (r.policyResult === "OUT_OF_POLICY") score += 20;
    else if (r.policyResult === "REQUIRES_APPROVAL") score += 10;

    // Price-based scoring (lower is better)
    const price = r.price ?? r.nightlyRate ?? r.dailyRate ?? 0;
    const allPrices = ctx.results.map((x) => x.price ?? x.nightlyRate ?? x.dailyRate ?? 0);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    if (maxPrice > minPrice) {
      score += ((maxPrice - price) / (maxPrice - minPrice)) * 30;
    }

    return { id: r.id, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => r.id);
}
