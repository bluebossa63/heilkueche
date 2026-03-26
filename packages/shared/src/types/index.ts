export interface Recipe {
  id: string;
  title: string;
  description: string;
  category: RecipeCategory;
  imageUrl?: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: NutritionInfo;
  estimatedCostEur: number;
  tags: string[];
  healthTags: HealthTag[];
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export type RecipeCategory =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'dessert'
  | 'smoothie';

export type HealthTag =
  | 'herzfreundlich'
  | 'blutzuckerfreundlich'
  | 'entzuendungshemmend'
  | 'eisenreich'
  | 'cholesterinsenkend'
  | 'verdauungsfoerdernd'
  | 'kalorienarm'
  | 'migraenefreundlich';

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
  estimatedCostEur?: number;
  openFoodFactsId?: string;
}

export interface NutritionInfo {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
}

export interface HealthCondition {
  id: string;
  name: string;
  description: string;
  whatToEat: string[];
  whatToAvoid: string[];
  tips: string[];
  icon: string;
  tags: HealthTag[];
}

export interface MealPlan {
  id: string;
  userId: string;
  weekStart: string; // ISO date
  days: DayPlan[];
}

export interface DayPlan {
  date: string;
  breakfast?: Recipe;
  lunch?: Recipe;
  dinner?: Recipe;
  snacks: Recipe[];
  totalNutrition: NutritionInfo;
  totalCostEur: number;
}

export interface ShoppingListItem {
  ingredient: Ingredient;
  recipeIds: string[];
  purchased: boolean;
  category: ShoppingCategory;
}

export type ShoppingCategory =
  | 'produce'
  | 'dairy'
  | 'meat'
  | 'grains'
  | 'pantry'
  | 'frozen'
  | 'other';

export interface Comment {
  id: string;
  recipeId: string;
  userId: string;
  parentId?: string;
  body: string;
  likes: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  dietaryPreferences: string[];
  healthConditions: string[];
  savedRecipeIds: string[];
  createdAt: string;
}

export interface WissenArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  icon: string;
  createdAt: string;
}
