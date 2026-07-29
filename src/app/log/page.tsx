"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type FoodItem = {
  id: string;
  name: string;
  nameLocal: string | null;
  category: string | null;
  caloriesPer100: number;
  proteinPer100: number;
  carbsPer100: number;
  fatPer100: number;
  defaultServing: number;
  servingUnit: string;
};

type DetectedFood = {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export default function LogPage() {
  const router = useRouter();
  const [user, setUser] = useState<unknown>(null);
  const [mode, setMode] = useState<"photo" | "manual">("photo");
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [customName, setCustomName] = useState("");
  const [portionSize, setPortionSize] = useState(1);
  const [mealType, setMealType] = useState("breakfast");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [detectedFoods, setDetectedFoods] = useState<DetectedFood[]>([]);
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) router.push("/login");
        else setUser(data.user);
      });
    fetch("/api/foods")
      .then((r) => r.json())
      .then((data) => setFoods(data.foods));
  }, [router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setAnalyzing(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();

      if (data.items && data.items.length > 0) {
        setDetectedFoods(data.items);
        toast.success(`Detected ${data.items.length} food item(s)`);
      } else {
        toast(data.message || "Could not identify food. Try manual entry.");
        setMode("manual");
      }
    } catch {
      toast.error("Analysis failed. Try manual entry.");
      setMode("manual");
    } finally {
      setAnalyzing(false);
    }
  };

  const logFood = async (foodName: string, calories: number, protein = 0, carbs = 0, fat = 0) => {
    setLogging(true);
    try {
      const body = {
        foodItemId: selectedFood?.id || null,
        customFoodName: foodName,
        portionSize,
        servingUnit: selectedFood?.servingUnit || "serving",
        mealType,
        imageUrl: imagePreview,
      };

      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to log");
      toast.success(`${foodName} logged!`);
      reset();
      router.refresh();
    } catch {
      toast.error("Failed to log meal");
    } finally {
      setLogging(false);
    }
  };

  const reset = () => {
    setImagePreview(null);
    setDetectedFoods([]);
    setSelectedFood(null);
    setSearch("");
    setCustomName("");
    setPortionSize(1);
  };

  const filteredFoods = foods.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.nameLocal && f.nameLocal.includes(search))
  );

  if (!user) return null;

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Log Meal</h1>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
        <button
          onClick={() => setMode("photo")}
          className={`flex-1 h-9 rounded-lg text-xs font-medium transition-all ${
            mode === "photo"
              ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
              : "text-zinc-500"
          }`}
        >
          📷 Photo
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`flex-1 h-9 rounded-lg text-xs font-medium transition-all ${
            mode === "manual"
              ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
              : "text-zinc-500"
          }`}
        >
          ✏️ Manual
        </button>
      </div>

      {/* Photo Mode */}
      {mode === "photo" && (
        <div className="space-y-3">
          <label className="flex flex-col items-center justify-center h-40 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer hover:border-brand-400 transition-colors">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="h-full object-contain rounded-xl" />
            ) : (
              <div className="text-center">
                <span className="text-2xl">📸</span>
                <p className="text-xs text-zinc-500 mt-2">Tap to take or upload a photo</p>
                <p className="text-[10px] text-zinc-400 mt-1">AI will identify the food</p>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
          </label>

          {analyzing && (
            <div className="flex items-center justify-center gap-2 py-4">
              <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-zinc-500">Analyzing food...</span>
            </div>
          )}

          {detectedFoods.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Detected Foods</h2>
              {detectedFoods.map((item, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 card-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{item.name}</p>
                      <p className="text-[10px] text-zinc-400">{item.portion}</p>
                    </div>
                    <span className="text-sm font-bold text-amber-600">{Math.round(item.calories)} kcal</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-500">
                    <span>P: {item.protein}g</span>
                    <span>C: {item.carbs}g</span>
                    <span>F: {item.fat}g</span>
                  </div>
                </div>
              ))}

              {/* Meal selector */}
              <div className="space-y-3 mt-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">Meal Type</label>
                  <div className="flex gap-1">
                    {["breakfast", "lunch", "dinner", "snack"].map((mt) => (
                      <button
                        key={mt}
                        onClick={() => setMealType(mt)}
                        className={`flex-1 h-8 rounded-lg text-[10px] font-medium capitalize transition-all ${
                          mealType === mt
                            ? "bg-brand-600 text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {mt}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    const totalCals = detectedFoods.reduce((s: number, f: DetectedFood) => s + f.calories, 0);
                    const totalP = detectedFoods.reduce((s: number, f: DetectedFood) => s + f.protein, 0);
                    const totalC = detectedFoods.reduce((s: number, f: DetectedFood) => s + f.carbs, 0);
                    const totalF = detectedFoods.reduce((s: number, f: DetectedFood) => s + f.fat, 0);
                    logFood(
                      detectedFoods.map((f) => f.name).join(" + "),
                      totalCals,
                      totalP,
                      totalC,
                      totalF
                    );
                  }}
                  disabled={logging}
                  className="w-full h-10 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {logging ? "Logging..." : `Log Meal (${Math.round(detectedFoods.reduce((s: number, f: DetectedFood) => s + f.calories, 0))} kcal)`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Mode */}
      {mode === "manual" && (
        <div className="space-y-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 card-shadow">
          {/* Search food */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
              Search Food
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedFood(null);
              }}
              placeholder="Type food name..."
              className="w-full h-10 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>

          {/* Food list */}
          {search && filteredFoods.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredFoods.slice(0, 20).map((food) => (
                <button
                  key={food.id}
                  onClick={() => {
                    setSelectedFood(food);
                    setCustomName(food.name);
                    setSearch(food.name);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedFood?.id === food.id
                      ? "bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <span className="font-medium">{food.name}</span>
                  <span className="text-[10px] text-zinc-400 ml-2">
                    {Math.round(food.caloriesPer100)} kcal/100g
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Selected food details */}
          {selectedFood && (
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 space-y-2">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{selectedFood.name}</p>
              <div className="grid grid-cols-3 gap-2 text-[10px] text-zinc-500">
                <span>🍚 {Math.round(selectedFood.caloriesPer100)} kcal/100g</span>
                <span>🥩 P: {selectedFood.proteinPer100}g</span>
                <span>🍚 C: {selectedFood.carbsPer100}g</span>
              </div>

              {/* Portion size */}
              <div>
                <label className="block text-[10px] text-zinc-500 mb-1">
                  Portion size: {portionSize}x ({Math.round(selectedFood.caloriesPer100 / 100 * selectedFood.defaultServing * portionSize)} kcal)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPortionSize(Math.max(0.25, portionSize - 0.25))}
                    className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    {portionSize}
                  </span>
                  <button
                    onClick={() => setPortionSize(Math.min(10, portionSize + 0.25))}
                    className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-sm font-bold"
                  >
                    +
                  </button>
                  <span className="text-[10px] text-zinc-400 ml-1">{selectedFood.servingUnit}(s)</span>
                </div>
              </div>
            </div>
          )}

          {/* Custom name */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
              Food Name
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g., Homemade Dosa"
              className="w-full h-10 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>

          {/* Meal type */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">Meal Type</label>
            <div className="flex gap-1">
              {["breakfast", "lunch", "dinner", "snack"].map((mt) => (
                <button
                  key={mt}
                  onClick={() => setMealType(mt)}
                  className={`flex-1 h-8 rounded-lg text-[10px] font-medium capitalize transition-all ${
                    mealType === mt
                      ? "bg-brand-600 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {mt}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={() => {
              if (!customName) {
                toast.error("Enter a food name");
                return;
              }
              logFood(customName, selectedFood
                ? Math.round(selectedFood.caloriesPer100 / 100 * selectedFood.defaultServing * portionSize)
                : 0
              );
            }}
            disabled={logging || !customName}
            className="w-full h-10 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {logging ? "Logging..." : "Log Meal"}
          </button>
        </div>
      )}
    </div>
  );
}
