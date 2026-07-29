import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {});
const prisma = new PrismaClient({ adapter });

const southIndianFoods = [
  // Breakfast
  { name: "Idli", nameLocal: "ಇಡ್ಲಿ", category: "breakfast", caloriesPer100: 78, proteinPer100: 2.2, carbsPer100: 16.5, fatPer100: 0.1, fiberPer100: 1.5, defaultServing: 1, servingUnit: "piece" },
  { name: "Dosa (Plain)", nameLocal: "ದೋಸೆ", category: "breakfast", caloriesPer100: 132, proteinPer100: 3.1, carbsPer100: 26.9, fatPer100: 1.8, fiberPer100: 0.8, defaultServing: 1, servingUnit: "piece" },
  { name: "Masala Dosa", nameLocal: "ಮಸಾಲ ದೋಸೆ", category: "breakfast", caloriesPer100: 168, proteinPer100: 3.5, carbsPer100: 28, fatPer100: 4.5, fiberPer100: 1.2, defaultServing: 1, servingUnit: "piece" },
  { name: "Vada", nameLocal: "ವಡೆ", category: "breakfast", caloriesPer100: 215, proteinPer100: 5.5, carbsPer100: 24, fatPer100: 11, fiberPer100: 2.0, defaultServing: 2, servingUnit: "pieces" },
  { name: "Uttapam", nameLocal: "ಉತ್ತಪ್ಪಂ", category: "breakfast", caloriesPer100: 145, proteinPer100: 4.2, carbsPer100: 24, fatPer100: 3.8, fiberPer100: 1.5, defaultServing: 1, servingUnit: "piece" },
  { name: "Pongal (Ven)", nameLocal: "ಪೊಂಗಲ್", category: "breakfast", caloriesPer100: 196, proteinPer100: 4.1, carbsPer100: 32, fatPer100: 5.5, fiberPer100: 1.0, defaultServing: 1, servingUnit: "cup" },
  { name: "Upma", nameLocal: "ಉಪ್ಪಿಟ್ಟು", category: "breakfast", caloriesPer100: 189, proteinPer100: 4.0, carbsPer100: 34, fatPer100: 4.2, fiberPer100: 1.8, defaultServing: 1, servingUnit: "cup" },
  { name: "Rava Dosa", nameLocal: "ರವೆ ದೋಸೆ", category: "breakfast", caloriesPer100: 155, proteinPer100: 3.2, carbsPer100: 26, fatPer100: 4.0, fiberPer100: 0.5, defaultServing: 1, servingUnit: "piece" },
  { name: "Chapati", nameLocal: "ಚಪಾತಿ", category: "lunch", caloriesPer100: 120, proteinPer100: 3.5, carbsPer100: 21, fatPer100: 2.8, fiberPer100: 2.5, defaultServing: 1, servingUnit: "piece" },
  { name: "Poori", nameLocal: "ಪೂರಿ", category: "lunch", caloriesPer100: 260, proteinPer100: 4.0, carbsPer100: 34, fatPer100: 12, fiberPer100: 1.0, defaultServing: 2, servingUnit: "pieces" },
  { name: "Parotta (Malabar)", nameLocal: "ಪರೊಟ್ಟಾ", category: "lunch", caloriesPer100: 298, proteinPer100: 5.2, carbsPer100: 38, fatPer100: 14, fiberPer100: 0.8, defaultServing: 1, servingUnit: "piece" },
  { name: "Appam", nameLocal: "ಅಪ್ಪಂ", category: "breakfast", caloriesPer100: 140, proteinPer100: 2.8, carbsPer100: 26, fatPer100: 3.0, fiberPer100: 0.5, defaultServing: 2, servingUnit: "pieces" },
  { name: "White Rice (Steamed)", nameLocal: "ಅನ್ನ", category: "lunch", caloriesPer100: 130, proteinPer100: 2.7, carbsPer100: 28, fatPer100: 0.3, fiberPer100: 0.4, defaultServing: 1, servingUnit: "cup" },
  { name: "Lemon Rice", nameLocal: "ನಿಂಬೆ ಅನ್ನ", category: "lunch", caloriesPer100: 178, proteinPer100: 3.0, carbsPer100: 32, fatPer100: 4.5, fiberPer100: 0.6, defaultServing: 1, servingUnit: "cup" },
  { name: "Tomato Rice", nameLocal: "ಟೊಮೇಟೊ ಅನ್ನ", category: "lunch", caloriesPer100: 175, proteinPer100: 3.0, carbsPer100: 31, fatPer100: 4.2, fiberPer100: 0.8, defaultServing: 1, servingUnit: "cup" },
  { name: "Curd Rice (Thayir Sadam)", nameLocal: "ಮೊಸರನ್ನ", category: "lunch", caloriesPer100: 152, proteinPer100: 4.5, carbsPer100: 24, fatPer100: 4.0, fiberPer100: 0.3, defaultServing: 1, servingUnit: "cup" },
  { name: "Bisi Bele Bath", nameLocal: "ಬಿಸಿಬೇಳೆಬಾತ್", category: "lunch", caloriesPer100: 165, proteinPer100: 5.0, carbsPer100: 28, fatPer100: 3.5, fiberPer100: 2.0, defaultServing: 1, servingUnit: "cup" },
  { name: "Puliyogare (Tamarind Rice)", nameLocal: "ಪುಲಿಯೋಗರೆ", category: "lunch", caloriesPer100: 185, proteinPer100: 3.2, carbsPer100: 33, fatPer100: 4.8, fiberPer100: 0.8, defaultServing: 1, servingUnit: "cup" },
  { name: "Vegetable Biryani", nameLocal: "ತರಕಾರಿ ಬಿರಿಯಾನಿ", category: "lunch", caloriesPer100: 163, proteinPer100: 4.0, carbsPer100: 28, fatPer100: 4.0, fiberPer100: 1.5, defaultServing: 1, servingUnit: "plate" },
  { name: "Chicken Biryani", nameLocal: "ಚಿಕನ್ ಬಿರಿಯಾನಿ", category: "lunch", caloriesPer100: 195, proteinPer100: 8.5, carbsPer100: 26, fatPer100: 6.0, fiberPer100: 0.5, defaultServing: 1, servingUnit: "plate" },
  { name: "Egg Biryani", nameLocal: "ಎಗ್ ಬಿರಿಯಾನಿ", category: "lunch", caloriesPer100: 180, proteinPer100: 7.0, carbsPer100: 27, fatPer100: 5.0, fiberPer100: 0.4, defaultServing: 1, servingUnit: "plate" },
  { name: "Sambar", nameLocal: "ಸಾಂಬಾರ್", category: "lunch", caloriesPer100: 56, proteinPer100: 3.0, carbsPer100: 8.5, fatPer100: 1.2, fiberPer100: 3.0, defaultServing: 1, servingUnit: "cup" },
  { name: "Rasam", nameLocal: "ರಸಂ", category: "lunch", caloriesPer100: 28, proteinPer100: 1.5, carbsPer100: 4.5, fatPer100: 0.5, fiberPer100: 0.5, defaultServing: 1, servingUnit: "cup" },
  { name: "Dal Tadka", nameLocal: "ತಡ್ಕಾ ದಾಲ್", category: "lunch", caloriesPer100: 110, proteinPer100: 6.0, carbsPer100: 14, fatPer100: 3.5, fiberPer100: 3.5, defaultServing: 1, servingUnit: "cup" },
  { name: "Avial", nameLocal: "ಅವಿಯಲ್", category: "lunch", caloriesPer100: 85, proteinPer100: 2.0, carbsPer100: 8, fatPer100: 5.0, fiberPer100: 2.5, defaultServing: 1, servingUnit: "cup" },
  { name: "Cabbage Thoran", nameLocal: "ಎಲೆಕೋಸು ಥೋರನ್", category: "lunch", caloriesPer100: 60, proteinPer100: 2.0, carbsPer100: 7, fatPer100: 3.0, fiberPer100: 2.5, defaultServing: 1, servingUnit: "cup" },
  { name: "Beans Poriyal", nameLocal: "ಬೀನ್ಸ್ ಪೋರಿಯಲ್", category: "lunch", caloriesPer100: 70, proteinPer100: 2.5, carbsPer100: 8, fatPer100: 3.5, fiberPer100: 2.8, defaultServing: 1, servingUnit: "cup" },
  { name: "Aloo Gobi", nameLocal: "ಆಲೂ ಗೋಬಿ", category: "lunch", caloriesPer100: 85, proteinPer100: 2.0, carbsPer100: 10, fatPer100: 4.0, fiberPer100: 2.0, defaultServing: 1, servingUnit: "cup" },
  { name: "Paneer Butter Masala", nameLocal: "ಪನೀರ್ ಬಟರ್ ಮಸಾಲಾ", category: "lunch", caloriesPer100: 195, proteinPer100: 8.0, carbsPer100: 8, fatPer100: 15, fiberPer100: 1.5, defaultServing: 1, servingUnit: "cup" },
  { name: "Chicken Curry (South Indian)", nameLocal: "ಕೋಳಿ ಸಾರು", category: "lunch", caloriesPer100: 150, proteinPer100: 12, carbsPer100: 5, fatPer100: 9, fiberPer100: 0.5, defaultServing: 1, servingUnit: "cup" },
  { name: "Fish Curry (Meen Curry)", nameLocal: "ಮೀನ್ ಕರಿ", category: "lunch", caloriesPer100: 140, proteinPer100: 15, carbsPer100: 3, fatPer100: 8, fiberPer100: 0.3, defaultServing: 1, servingUnit: "cup" },
  { name: "Egg Curry", nameLocal: "ಮೊಟ್ಟೆ ಕರಿ", category: "lunch", caloriesPer100: 130, proteinPer100: 8.0, carbsPer100: 4, fatPer100: 9, fiberPer100: 0.5, defaultServing: 1, servingUnit: "cup" },
  { name: "Coconut Chutney", nameLocal: "ತೆಂಗಿನ ಚಟ್ನಿ", category: "snack", caloriesPer100: 168, proteinPer100: 1.5, carbsPer100: 8, fatPer100: 15, fiberPer100: 3.0, defaultServing: 2, servingUnit: "tbsp" },
  { name: "Tomato Chutney", nameLocal: "ಟೊಮೇಟೊ ಚಟ್ನಿ", category: "snack", caloriesPer100: 48, proteinPer100: 1.0, carbsPer100: 8, fatPer100: 1.5, fiberPer100: 1.0, defaultServing: 2, servingUnit: "tbsp" },
  { name: "Mint Chutney", nameLocal: "ಪುದೀನಾ ಚಟ್ನಿ", category: "snack", caloriesPer100: 35, proteinPer100: 1.0, carbsPer100: 5, fatPer100: 1.5, fiberPer100: 1.5, defaultServing: 2, servingUnit: "tbsp" },
  { name: "Peanut Chutney", nameLocal: "ಕಡಲೇಕಾಯಿ ಚಟ್ನಿ", category: "snack", caloriesPer100: 220, proteinPer100: 8.0, carbsPer100: 12, fatPer100: 16, fiberPer100: 3.0, defaultServing: 2, servingUnit: "tbsp" },
  { name: "Pappad", nameLocal: "ಪಾಪಡ್", category: "snack", caloriesPer100: 350, proteinPer100: 18, carbsPer100: 40, fatPer100: 12, fiberPer100: 1.0, defaultServing: 1, servingUnit: "piece" },
  { name: "Samosa", nameLocal: "ಸಮೋಸಾ", category: "snack", caloriesPer100: 260, proteinPer100: 5.0, carbsPer100: 30, fatPer100: 14, fiberPer100: 1.5, defaultServing: 1, servingUnit: "piece" },
  { name: "Bajji (Chilli)", nameLocal: "ಮೆಣಸಿನಕಾಯಿ ಬಜ್ಜಿ", category: "snack", caloriesPer100: 210, proteinPer100: 4.0, carbsPer100: 22, fatPer100: 12, fiberPer100: 2.0, defaultServing: 2, servingUnit: "pieces" },
  { name: "Payasam / Kheer", nameLocal: "ಪಾಯಸ", category: "snack", caloriesPer100: 160, proteinPer100: 4.0, carbsPer100: 25, fatPer100: 5.0, fiberPer100: 0.5, defaultServing: 1, servingUnit: "cup" },
  { name: "Rava Kesari", nameLocal: "ರವೆ ಕೇಸರಿ", category: "snack", caloriesPer100: 280, proteinPer100: 3.0, carbsPer100: 48, fatPer100: 9.0, fiberPer100: 0.5, defaultServing: 1, servingUnit: "piece" },
  { name: "Mysore Pak", nameLocal: "ಮೈಸೂರು ಪಾಕ್", category: "snack", caloriesPer100: 480, proteinPer100: 5.0, carbsPer100: 45, fatPer100: 32, fiberPer100: 0.3, defaultServing: 1, servingUnit: "piece" },
  { name: "Coconut Ladoo", nameLocal: "ತೆಂಗಿನ ಲಾಡು", category: "snack", caloriesPer100: 370, proteinPer100: 3.5, carbsPer100: 35, fatPer100: 25, fiberPer100: 4.0, defaultServing: 1, servingUnit: "piece" },
  { name: "Filter Coffee", nameLocal: "ಫಿಲ್ಟರ್ ಕಾಫಿ", category: "breakfast", caloriesPer100: 18, proteinPer100: 0.5, carbsPer100: 2.5, fatPer100: 0.5, fiberPer100: 0, defaultServing: 1, servingUnit: "cup" },
  { name: "Masala Chai", nameLocal: "ಮಸಾಲಾ ಚಾ", category: "breakfast", caloriesPer100: 40, proteinPer100: 1.0, carbsPer100: 5, fatPer100: 2.0, fiberPer100: 0, defaultServing: 1, servingUnit: "cup" },
  { name: "Buttermilk (Neer Majjige)", nameLocal: "ಮಜ್ಜಿಗೆ", category: "lunch", caloriesPer100: 30, proteinPer100: 2.0, carbsPer100: 4, fatPer100: 0.5, fiberPer100: 0, defaultServing: 1, servingUnit: "cup" },
  { name: "Tender Coconut Water", nameLocal: "ಎಳನೀರು", category: "snack", caloriesPer100: 19, proteinPer100: 0.2, carbsPer100: 3.7, fatPer100: 0.2, fiberPer100: 0, defaultServing: 1, servingUnit: "glass" },
  { name: "Lassi (Sweet)", nameLocal: "ಲಸ್ಸಿ", category: "snack", caloriesPer100: 80, proteinPer100: 2.5, carbsPer100: 12, fatPer100: 2.8, fiberPer100: 0, defaultServing: 1, servingUnit: "glass" },
  { name: "Banana (Robusta)", nameLocal: "ಬಾಳೆಹಣ್ಣು", category: "snack", caloriesPer100: 89, proteinPer100: 1.1, carbsPer100: 23, fatPer100: 0.3, fiberPer100: 2.6, defaultServing: 1, servingUnit: "piece" },
  { name: "Mango (Alphonso)", nameLocal: "ಮಾವಿನ ಹಣ್ಣು", category: "snack", caloriesPer100: 60, proteinPer100: 0.8, carbsPer100: 15, fatPer100: 0.4, fiberPer100: 1.6, defaultServing: 1, servingUnit: "piece" },
  { name: "Papaya", nameLocal: "ಪಪ್ಪಾಯಿ", category: "snack", caloriesPer100: 43, proteinPer100: 0.5, carbsPer100: 11, fatPer100: 0.1, fiberPer100: 1.7, defaultServing: 1, servingUnit: "cup" },
  { name: "Guava", nameLocal: "ಪೇರಳೆ", category: "snack", caloriesPer100: 68, proteinPer100: 2.6, carbsPer100: 14, fatPer100: 0.6, fiberPer100: 5.4, defaultServing: 1, servingUnit: "piece" },
  { name: "Jackfruit", nameLocal: "ಹಲಸಿನ ಹಣ್ಣು", category: "snack", caloriesPer100: 95, proteinPer100: 1.7, carbsPer100: 23, fatPer100: 0.6, fiberPer100: 1.5, defaultServing: 1, servingUnit: "cup" },
];

async function main() {
  console.log(`Seeding ${southIndianFoods.length} South Indian food items...`);

  const existing = await prisma.foodItem.count();
  if (existing > 0) {
    console.log(`Database already has ${existing} items, skipping seed.`);
    return;
  }

  for (const food of southIndianFoods) {
    await prisma.foodItem.create({ data: { ...food, isSouthIndian: true } });
  }

  const total = await prisma.foodItem.count();
  console.log(`Seed complete! ${total} food items in DB.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
