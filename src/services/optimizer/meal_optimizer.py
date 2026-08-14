import sys
import json
import logging
from typing import List, Dict, Any
from pulp import (
    LpProblem, LpMaximize, LpVariable, lpSum, LpBinary, LpInteger,
    PULP_CBC_CMD, LpStatus, value
)

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def solve_meal_plan(input_data: Dict[str, Any]) -> Dict[str, Any]:
    # Extract input
    budget = input_data.get('budget', 0)
    household_size = input_data.get('household_size', 1)
    slots = input_data.get('slots', [])  # e.g. ["1_breakfast", "1_lunch", "1_dinner", "2_dinner", ...]
    recipes = input_data.get('recipes', [])
    ingredients = input_data.get('ingredients', [])
    daily_nutrition_bounds = input_data.get('daily_nutrition_bounds', {})
    
    # Weightings for multi-objective
    weight_score = input_data.get('weight_score', 10.0)
    weight_waste = input_data.get('weight_waste', 0.1)
    weight_distinct = input_data.get('weight_distinct', 1.0)
    
    # Initialize Problem
    prob = LpProblem("Meal_Planning_Optimization", LpMaximize)
    
    # --- Decision Variables ---
    
    # x[r][s] = 1 if recipe r is chosen for slot s
    x = {}
    for r in recipes:
        x[r['id']] = {}
        for s in slots:
            x[r['id']][s] = LpVariable(f"x_{r['id']}_{s}", cat=LpBinary)
            
    # p[i] = number of packages bought for ingredient i
    p = {}
    # b[i] = 1 if ingredient i is bought at all (for minimizing distinct ingredients)
    b = {}
    
    for ing in ingredients:
        p[ing['id']] = LpVariable(f"p_{ing['id']}", lowBound=0, cat=LpInteger)
        b[ing['id']] = LpVariable(f"b_{ing['id']}", cat=LpBinary)
        
    # --- Constraints ---
    
    # 1. Exactly one recipe per slot
    for s in slots:
        prob += lpSum(x[r['id']][s] for r in recipes) == 1, f"One_recipe_per_slot_{s}"
        
    # 2. Package size and quantity constraints
    # Q_i = total quantity required for ingredient i
    for ing in ingredients:
        i_id = ing['id']
        pkg_size = ing.get('package_size', 1.0)
        
        # Calculate required quantity based on selected recipes
        req_qty = lpSum(
            (r.get('ingredients_dict', {}).get(i_id, 0) * household_size) * x[r['id']][s]
            for r in recipes for s in slots
        )
        
        # Packages bought must cover the required quantity
        prob += p[i_id] * pkg_size >= req_qty, f"Min_packages_{i_id}"
        
        # Link b[i] to p[i]: p[i] <= M * b[i]
        # M is a large number. Assuming we won't need more than 1000 packages of anything for a week.
        M = 1000
        prob += p[i_id] <= M * b[i_id], f"Link_b_{i_id}"
        
    # 3. Budget constraint
    prob += lpSum(p[ing['id']] * ing.get('unit_price', 0) for ing in ingredients) <= budget, "Budget"
    
    # 4. Daily Nutritional Constraints
    # Group slots by day based on prefix (e.g. "1_breakfast" -> "1")
    days = list(set([s.split('_')[0] for s in slots if '_' in s]))
    for d in days:
        day_slots = [s for s in slots if s.startswith(f"{d}_")]
        
        for nutrient, bounds in daily_nutrition_bounds.items():
            min_val = bounds.get('min')
            max_val = bounds.get('max')
            
            # Daily nutrient sum
            day_nutrient = lpSum(
                (r.get('nutrition', {}).get(nutrient, 0) * household_size) * x[r['id']][s]
                for r in recipes for s in day_slots
            )
            
            if min_val is not None:
                prob += day_nutrient >= min_val * household_size, f"Min_{nutrient}_day_{d}"
            if max_val is not None:
                prob += day_nutrient <= max_val * household_size, f"Max_{nutrient}_day_{d}"

    # --- Objective Function ---
    
    # Maximize Preference Score
    total_score = lpSum(
        r.get('preference_score', 0) * x[r['id']][s]
        for r in recipes for s in slots
    )
    
    # Minimize Waste (total packages bought size - required size)
    # Since we want to maximize, we subtract waste penalty
    total_waste = lpSum(
        (p[ing['id']] * ing.get('package_size', 1.0) - lpSum(
            (r.get('ingredients_dict', {}).get(ing['id'], 0) * household_size) * x[r['id']][s]
            for r in recipes for s in slots
        ))
        for ing in ingredients
    )
    
    # Minimize Distinct Ingredients
    distinct_count = lpSum(b[ing['id']] for ing in ingredients)
    
    prob += (weight_score * total_score) - (weight_waste * total_waste) - (weight_distinct * distinct_count)
    
    # --- Solve ---
    # msg=False suppresses output, timeLimit prevents hanging on very hard problems
    prob.solve(PULP_CBC_CMD(msg=False, timeLimit=30))
    
    if prob.status != 1: # 1 is optimal
        return {
            "status": LpStatus[prob.status],
            "success": False,
            "message": "Could not find an optimal meal plan."
        }
        
    # --- Format Output ---
    selected_slots = {}
    for r in recipes:
        for s in slots:
            if value(x[r['id']][s]) == 1.0:
                selected_slots[s] = r['id']
                
    shopping_list = []
    total_cost = 0.0
    for ing in ingredients:
        packages = int(value(p[ing['id']]))
        if packages > 0:
            cost = packages * ing.get('unit_price', 0)
            total_cost += cost
            
            req_qty = sum(
                (r.get('ingredients_dict', {}).get(ing['id'], 0) * household_size)
                for r in recipes if value(x[r['id']][s]) == 1.0 for s in slots
            )
            
            shopping_list.append({
                "ingredient_id": ing['id'],
                "packages": packages,
                "package_size": ing.get('package_size', 1.0),
                "required_quantity": req_qty,
                "waste": packages * ing.get('package_size', 1.0) - req_qty,
                "unit": ing.get('unit', ''),
                "cost": cost
            })
            
    return {
        "status": LpStatus[prob.status],
        "success": True,
        "selected_slots": selected_slots,
        "shopping_list": shopping_list,
        "total_cost": total_cost
    }

if __name__ == "__main__":
    try:
        input_json = sys.stdin.read()
        if not input_json:
            sys.exit(0)
            
        data = json.loads(input_json)
        
        # Pre-process recipes to map ingredient lists to dicts for faster lpSum lookups
        for r in data.get('recipes', []):
            r['ingredients_dict'] = {
                ing['ingredient_id']: ing['quantity'] 
                for ing in r.get('ingredients', [])
            }
            
        result = solve_meal_plan(data)
        print(json.dumps(result))
    except Exception as e:
        logging.error(f"Optimization error: {str(e)}")
        print(json.dumps({"success": False, "message": str(e)}))
        sys.exit(1)
