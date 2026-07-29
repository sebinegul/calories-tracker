import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {});
const prisma = new PrismaClient({ adapter });

const keralaFoods = [
  // Breakfast
  { name: "Puttu", nameLocal: "പുട്ട്", category: "breakfast", caloriesPer100: 98, proteinPer100: 2.1, carbsPer100: 21, fatPer100: 0.5, fiberPer100: 1.8, defaultServing: 2, servingUnit: "piece" },
  { name: "Kadala Curry", nameLocal: "കടല കറി", category: "breakfast", caloriesPer100: 120, proteinPer100: 7, carbsPer100: 16, fatPer100: 3.5, fiberPer100: 4, defaultServing: 1, servingUnit: "cup" },
  { name: "Appam", nameLocal: "അപ്പം", category: "breakfast", caloriesPer100: 140, proteinPer100: 2.5, carbsPer100: 28, fatPer100: 2.5, fiberPer100: 0.5, defaultServing: 2, servingUnit: "piece" },
  { name: "Idiyappam", nameLocal: "ഇടിയപ്പം", category: "breakfast", caloriesPer100: 110, proteinPer100: 2, carbsPer100: 24, fatPer100: 0.5, fiberPer100: 0.5, defaultServing: 3, servingUnit: "piece" },
  { name: "Palada Payasam", nameLocal: "പാലട പായസം", category: "breakfast", caloriesPer100: 180, proteinPer100: 4, carbsPer100: 32, fatPer100: 4, fiberPer100: 0.2, defaultServing: 1, servingUnit: "bowl" },

  // Lunch
  { name: "Kerala Sadya (Full Meal)", nameLocal: "സദ്യ", category: "lunch", caloriesPer100: 250, proteinPer100: 8, carbsPer100: 40, fatPer100: 8, fiberPer100: 3, defaultServing: 1, servingUnit: "plate" },
  { name: "Avial", nameLocal: "അവിയൽ", category: "lunch", caloriesPer100: 85, proteinPer100: 2.5, carbsPer100: 8, fatPer100: 5, fiberPer100: 3, defaultServing: 1, servingUnit: "cup" },
  { name: "Sambar", nameLocal: "സാമ്പാർ", category: "lunch", caloriesPer100: 65, proteinPer100: 3, carbsPer100: 10, fatPer100: 1.5, fiberPer100: 2.5, defaultServing: 1, servingUnit: "cup" },
  { name: "Rasam", nameLocal: "രസം", category: "lunch", caloriesPer100: 30, proteinPer100: 1.5, carbsPer100: 5, fatPer100: 0.5, fiberPer100: 0.5, defaultServing: 1, servingUnit: "cup" },
  { name: "Kerala Parotta", nameLocal: "പറോട്ട", category: "lunch", caloriesPer100: 290, proteinPer100: 6, carbsPer100: 42, fatPer100: 11, fiberPer100: 1, defaultServing: 1, servingUnit: "piece" },
  { name: "Beef Ularthiyathu", nameLocal: "ബീഫ് ഉലർത്തിയത്", category: "lunch", caloriesPer100: 220, proteinPer100: 25, carbsPer100: 3, fatPer100: 12, fiberPer100: 0.5, defaultServing: 1, servingUnit: "cup" },
  { name: "Malabar Fish Curry", nameLocal: "മീൻ കറി", category: "lunch", caloriesPer100: 140, proteinPer100: 18, carbsPer100: 3, fatPer100: 7, fiberPer100: 0.5, defaultServing: 1, servingUnit: "cup" },
  { name: "Kerala Chicken Curry", nameLocal: "കോഴി കറി", category: "lunch", caloriesPer100: 180, proteinPer100: 20, carbsPer100: 4, fatPer100: 10, fiberPer100: 0.5, defaultServing: 1, servingUnit: "cup" },
  { name: "Chemmeen (Prawn) Curry", nameLocal: "കൊമ്മൻ കറി", category: "lunch", caloriesPer100: 150, proteinPer100: 20, carbsPer100: 3, fatPer100: 7, fiberPer100: 0.5, defaultServing: 1, servingUnit: "cup" },
  { name: "Mattar Paneer", nameLocal: "മട്ടർ പനീർ", category: "lunch", caloriesPer100: 160, proteinPer100: 9, carbsPer100: 10, fatPer100: 10, fiberPer100: 2, defaultServing: 1, servingUnit: "cup" },
  { name: "Kerala-style Thoran", nameLocal: "തോരൻ", category: "lunch", caloriesPer100: 70, proteinPer100: 3, carbsPer100: 8, fatPer100: 3.5, fiberPer100: 3, defaultServing: 1, servingUnit: "cup" },
  { name: "Kootu Curry", nameLocal: "കൂട്ട് കറി", category: "lunch", caloriesPer100: 90, proteinPer100: 4, carbsPer100: 12, fatPer100: 3, fiberPer100: 3, defaultServing: 1, servingUnit: "cup" },
  { name: "Malabar Biriyani", nameLocal: "മലബാർ ബിരിയാണി", category: "lunch", caloriesPer100: 210, proteinPer100: 12, carbsPer100: 28, fatPer100: 7, fiberPer100: 0.5, defaultServing: 1, servingUnit: "plate" },

  // Snacks
  { name: "Banana Chips (Upperi)", nameLocal: "ഉപ്പേരി", category: "snack", caloriesPer100: 520, proteinPer100: 2, carbsPer100: 55, fatPer100: 35, fiberPer100: 3, defaultServing: 1, servingUnit: "handful" },
  { name: "Uzhunnu Vada", nameLocal: "ഉഴുന്നു വട", category: "snack", caloriesPer100: 200, proteinPer100: 10, carbsPer100: 22, fatPer100: 9, fiberPer100: 3, defaultServing: 2, servingUnit: "piece" },
  { name: "Parippu Vada", nameLocal: "പരിപ്പ് വട", category: "snack", caloriesPer100: 220, proteinPer100: 10, carbsPer100: 25, fatPer100: 10, fiberPer100: 2, defaultServing: 2, servingUnit: "piece" },
  { name: "Kozhukkatta", nameLocal: "കൊഴുക്കട്ട", category: "snack", caloriesPer100: 160, proteinPer100: 3, carbsPer100: 32, fatPer100: 2, fiberPer100: 1, defaultServing: 3, servingUnit: "piece" },
  { name: "Unniyappam", nameLocal: "ഉണ്ണിയപ്പം", category: "snack", caloriesPer100: 190, proteinPer100: 4, carbsPer100: 28, fatPer100: 7, fiberPer100: 1, defaultServing: 3, servingUnit: "piece" },
  { name: "Pazham Pori (Ethakka Appam)", nameLocal: "പഴം പൊരി", category: "snack", caloriesPer100: 240, proteinPer100: 3, carbsPer100: 35, fatPer100: 12, fiberPer100: 2, defaultServing: 2, servingUnit: "piece" },
  { name: "Mutta Mala", nameLocal: "മുട്ടമാല", category: "snack", caloriesPer100: 180, proteinPer100: 8, carbsPer100: 20, fatPer100: 8, fiberPer100: 0, defaultServing: 1, servingUnit: "cup" },

  // Dinner
  { name: "Choru (Steamed Rice)", nameLocal: "ചോറ്", category: "dinner", caloriesPer100: 130, proteinPer100: 2.7, carbsPer100: 28, fatPer100: 0.3, fiberPer100: 0.4, defaultServing: 1, servingUnit: "cup" },
  { name: "Kanji (Rice Porridge)", nameLocal: "കഞ്ഞി", category: "dinner", caloriesPer100: 70, proteinPer100: 1.5, carbsPer100: 15, fatPer100: 0.2, fiberPer100: 0.3, defaultServing: 1, servingUnit: "bowl" },
  { name: "Kappa (Tapioca)", nameLocal: "കപ്പ", category: "dinner", caloriesPer100: 120, proteinPer100: 1, carbsPer100: 28, fatPer100: 0.2, fiberPer100: 1.5, defaultServing: 1, servingUnit: "cup" },
  { name: "Meen Pollichathu", nameLocal: "മീൻ പൊള്ളിച്ചത്", category: "dinner", caloriesPer100: 160, proteinPer100: 22, carbsPer100: 2, fatPer100: 8, fiberPer100: 0.5, defaultServing: 1, servingUnit: "piece" },
  { name: "Kozhi Porichathu (Chicken Fry)", nameLocal: "കോഴി പൊരിച്ചത്", category: "dinner", caloriesPer100: 250, proteinPer100: 22, carbsPer100: 5, fatPer100: 17, fiberPer100: 0.5, defaultServing: 1, servingUnit: "cup" },
  { name: "Kerala Egg Roast", nameLocal: "മുട്ട റോസ്റ്റ്", category: "dinner", caloriesPer100: 170, proteinPer100: 12, carbsPer100: 3, fatPer100: 13, fiberPer100: 0.5, defaultServing: 2, servingUnit: "piece" },
  { name: "Kerala Prawn Roast", nameLocal: "കൊമ്മൻ റോസ്റ്റ്", category: "dinner", caloriesPer100: 180, proteinPer100: 22, carbsPer100: 5, fatPer100: 9, fiberPer100: 0.5, defaultServing: 1, servingUnit: "cup" },
];

async function main() {
  console.log(`Seeding ${keralaFoods.length} Kerala cuisine items...`);

  // Check if Kerala foods already exist
  const existingKeralaCount = await prisma.foodItem.count({
    where: { isSouthIndian: true, name: { in: keralaFoods.map(f => f.name) } },
  });

  if (existingKeralaCount >= keralaFoods.length) {
    console.log(`Kerala foods already seeded (${existingKeralaCount} items found), skipping.`);
    return;
  }

  // Only add items that don't exist yet
  let added = 0;
  for (const food of keralaFoods) {
    const existing = await prisma.foodItem.findFirst({
      where: { name: food.name, isSouthIndian: true },
    });
    if (!existing) {
      await prisma.foodItem.create({ data: { ...food, isSouthIndian: true } });
      added++;
    }
  }

  const total = await prisma.foodItem.count();
  console.log(`Added ${added} new Kerala items. Total food items: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
