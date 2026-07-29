// Calorie recommendation based on Mifflin-St Jeor equation
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: string
): number {
  if (gender === "male") {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.55));
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getBMICategory(bmi: number): {
  label: string;
  color: string;
} {
  if (bmi < 18.5) return { label: "Underweight", color: "text-blue-500" };
  if (bmi < 25) return { label: "Normal", color: "text-brand-500" };
  if (bmi < 30) return { label: "Overweight", color: "text-amber-500" };
  return { label: "Obese", color: "text-red-500" };
}

export function getWeightGoalCalories(
  tdee: number,
  goal: "lose" | "maintain" | "gain"
): number {
  switch (goal) {
    case "lose":
      return tdee - 500; // ~0.5 kg per week
    case "gain":
      return tdee + 300; // ~0.3 kg per week
    default:
      return tdee;
  }
}

export function calculateMacros(totalCalories: number): {
  protein: number;
  carbs: number;
  fat: number;
} {
  // 30% protein, 45% carbs, 25% fat
  const protein = Math.round((totalCalories * 0.3) / 4);
  const carbs = Math.round((totalCalories * 0.45) / 4);
  const fat = Math.round((totalCalories * 0.25) / 9);
  return { protein, carbs, fat };
}

// Format date for display
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function todayRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
  return { start, end };
}

export function getWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday start
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}
