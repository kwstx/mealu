import { create } from 'zustand';
import type { DayData } from '../components/WeeklyCalendar';

interface PlanState {
  days: DayData[];
  setDays: (days: DayData[]) => void;
  getTotalCost: () => number;
  getTotalCalories: () => number;
}

const dummyDays: DayData[] = Array.from({ length: 7 }).map((_, i) => ({
  id: `day-${i}`,
  date: new Date(Date.now() + i * 86400000),
  meals: [
    { id: `m-${i}-1`, type: 'breakfast', title: 'Oatmeal', calories: 300, cost: 2.50 },
    { id: `m-${i}-2`, type: 'lunch', title: 'Chicken Salad', calories: 450, cost: 5.75 },
    { id: `m-${i}-3`, type: 'dinner', title: 'Grilled Salmon', calories: 600, cost: 12.00 },
    { id: `m-${i}-4`, type: 'snack', title: 'Apple & Almonds', calories: 150, cost: 1.50 },
  ],
}));

export const usePlanStore = create<PlanState>((set, get) => ({
  days: dummyDays,
  setDays: (days) => set({ days }),
  getTotalCost: () => {
    return get().days.reduce((totalCost, day) => {
      return totalCost + day.meals.reduce((mealCost, meal) => mealCost + (meal.cost || 0), 0);
    }, 0);
  },
  getTotalCalories: () => {
    return get().days.reduce((totalCals, day) => {
      return totalCals + day.meals.reduce((mealCals, meal) => mealCals + (meal.calories || 0), 0);
    }, 0);
  },
}));
