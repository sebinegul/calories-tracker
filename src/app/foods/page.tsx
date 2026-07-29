"use client";

import { useEffect, useState } from "react";

type FoodItem = {
  id: string;
  name: string;
  nameLocal: string | null;
  category: string | null;
  caloriesPer100: number;
  proteinPer100: number;
  carbsPer100: number;
  fatPer100: number;
  fiberPer100: number;
  defaultServing: number;
  servingUnit: string;
};

const categories = ["all", "breakfast", "lunch", "snack"];

export default function FoodsPage() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FoodItem | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (query) params.set("q", query);

    fetch(`/api/foods?${params}`)
      .then((r) => r.json())
      .then((data) => setFoods(data.foods));
  }, [category, query]);

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Food Database</h1>
      <p className="text-xs text-zinc-500">50+ South Indian dishes with nutrition data</p>

      {/* Search + Category filter */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search foods..."
          className="flex-1 h-10 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        />
      </div>

      <div className="flex gap-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 h-8 rounded-lg text-[10px] font-medium capitalize transition-all ${
              category === cat
                ? "bg-brand-600 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Food grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {foods.map((food) => (
          <button
            key={food.id}
            onClick={() => setSelected(selected?.id === food.id ? null : food)}
            className={`text-left bg-white dark:bg-zinc-900 rounded-xl border p-3 card-shadow-hover transition-all ${
              selected?.id === food.id
                ? "border-brand-400 dark:border-brand-600 ring-1 ring-brand-400/30"
                : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{food.name}</p>
                {food.nameLocal && (
                  <p className="text-[10px] text-zinc-400">{food.nameLocal}</p>
                )}
              </div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {Math.round(food.caloriesPer100)} kcal
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-zinc-500">
              <span>🥩 {food.proteinPer100}g</span>
              <span>🍚 {food.carbsPer100}g</span>
              <span>🧈 {food.fatPer100}g</span>
              <span className="capitalize text-brand-600 dark:text-brand-400">
                {food.servingUnit === "tbsp" ? "per tbsp" : `per ${food.servingUnit}`}
              </span>
            </div>
          </button>
        ))}
      </div>

      {foods.length === 0 && (
        <div className="text-center py-8 text-sm text-zinc-400">
          No foods found. Try a different search.
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 card-shadow">
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">{selected.name}</h3>
          {selected.nameLocal && (
            <p className="text-xs text-zinc-400 mb-3">{selected.nameLocal}</p>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { label: "Calories", value: `${Math.round(selected.caloriesPer100)} kcal/100g`, color: "text-amber-600" },
              { label: "Protein", value: `${selected.proteinPer100}g`, color: "text-blue-600" },
              { label: "Carbs", value: `${selected.carbsPer100}g`, color: "text-orange-600" },
              { label: "Fat", value: `${selected.fatPer100}g`, color: "text-red-600" },
              { label: "Fiber", value: `${selected.fiberPer100}g`, color: "text-brand-600" },
              { label: "Serving", value: `1 ${selected.servingUnit} = ${Math.round(selected.caloriesPer100 / 100 * selected.defaultServing)} kcal`, color: "text-zinc-600" },
            ].map((stat) => (
              <div key={stat.label} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5">
                <span className="text-[10px] text-zinc-400">{stat.label}</span>
                <p className={`text-sm font-bold ${stat.color} dark:opacity-90`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
