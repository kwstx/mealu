import sys
import json
import logging
import time
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
    
    locked_slots = input_data.get('locked_slots', {})
    excluded_recipes = input_data.get('excluded_recipes', [])
    
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

    # 5. Lock slots
    for s_idx, r_id in locked_slots.items():
        if r_id in x and s_idx in x[r_id]:
            prob += x[r_id][s_idx] == 1, f"Lock_{s_idx}_{r_id}"

    # 6. Exclude recipes
    for r_id in excluded_recipes:
        if r_id in x:
            prob += lpSum(x[r_id][s] for s in slots) == 0, f"Exclude_{r_id}"

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
    start_time = time.time()
    prob.solve(PULP_CBC_CMD(msg=False, timeLimit=30))
    solve_time = time.time() - start_time
    
    if prob.status != 1: # 1 is optimal
        return {
            "status": LpStatus[prob.status],
            "success": False,
            "message": "Could not find an optimal meal plan.",
            "solve_time_seconds": solve_time
        }
        
    # --- Explanation Trace (Before Local Search) ---
    binding_constraints = []
    for name, c in prob.constraints.items():
        try:
            val = value(c)
            if val is not None and abs(val) < 1e-5:
                binding_constraints.append(name)
        except:
            pass

    objective_contributions = {
        "preference_score_component": float(value(total_score)) if value(total_score) else 0.0,
        "waste_penalty_component": float(value(total_waste)) if value(total_waste) else 0.0,
        "distinct_ingredients_penalty": float(value(distinct_count)) if value(distinct_count) else 0.0,
        "total_objective": float(value(prob.objective)) if value(prob.objective) else 0.0
    }

    explanation_trace = {
        "binding_constraints": binding_constraints,
        "objective_contributions": objective_contributions
    }

    # --- Format Initial Output ---
    selected_slots = {}
    for r in recipes:
        for s in slots:
            if value(x[r['id']][s]) == 1.0:
                selected_slots[s] = r['id']
                
    # --- Secondary Local-Search Pass ---
    import math
    def compute_plan_metrics(plan: Dict[str, str]):
        req_ingr = {}
        day_nutrients = {d: {} for d in days}
        total_score_val = 0.0
        
        for s_idx, r_id in plan.items():
            r_obj = next((rc for rc in recipes if rc['id'] == r_id), None)
            if not r_obj: continue
            
            total_score_val += r_obj.get('preference_score', 0)
            
            for i_id, qty in r_obj.get('ingredients_dict', {}).items():
                req_ingr[i_id] = req_ingr.get(i_id, 0) + (qty * household_size)
                
            d_prefix = s_idx.split('_')[0] if '_' in s_idx else s_idx
            for nut in daily_nutrition_bounds.keys():
                day_nutrients[d_prefix][nut] = day_nutrients[d_prefix].get(nut, 0) + (r_obj.get('nutrition', {}).get(nut, 0) * household_size)

        for d_prefix, nuts in day_nutrients.items():
            for nut, bounds in daily_nutrition_bounds.items():
                val_nut = nuts.get(nut, 0)
                if bounds.get('min') is not None and val_nut < bounds['min'] * household_size - 1e-5:
                    return None
                if bounds.get('max') is not None and val_nut > bounds['max'] * household_size + 1e-5:
                    return None

        distinct = 0
        cost = 0.0
        waste_penalty_val = 0.0
        for i_id, req in req_ingr.items():
            if req > 0:
                distinct += 1
                ing = next((ig for ig in ingredients if ig['id'] == i_id), None)
                if not ing: continue
                pkg_size = ing.get('package_size', 1.0)
                pkgs = math.ceil(req / pkg_size)
                cost += pkgs * ing.get('unit_price', 0)
                waste_penalty_val += (pkgs * pkg_size) - req
                
        if cost > budget + 1e-5:
            return None
            
        objective_val = (weight_score * total_score_val) - (weight_waste * waste_penalty_val) - (weight_distinct * distinct)
        return {"cost": cost, "distinct": distinct, "objective": objective_val, "waste": waste_penalty_val, "score": total_score_val, "req_ingr": req_ingr}

    current_metrics = compute_plan_metrics(selected_slots)
    local_search_swaps = 0
    
    if current_metrics:
        improved = True
        while improved:
            improved = False
            for s_idx in slots:
                current_r = selected_slots[s_idx]
                best_swap_r = current_r
                best_obj = current_metrics['objective']
                best_metrics = None
                
                for r_obj in recipes:
                    if r_obj['id'] == current_r: continue
                    proposed = selected_slots.copy()
                    proposed[s_idx] = r_obj['id']
                    
                    metrics = compute_plan_metrics(proposed)
                    if metrics and metrics['objective'] > best_obj + 1e-5:
                        best_obj = metrics['objective']
                        best_swap_r = r_obj['id']
                        best_metrics = metrics
                
                if best_swap_r != current_r:
                    selected_slots[s_idx] = best_swap_r
                    current_metrics = best_metrics
                    local_search_swaps += 1
                    improved = True
                    break

    explanation_trace["local_search_swaps"] = local_search_swaps
    if current_metrics:
        explanation_trace["final_objective_contributions"] = {
            "preference_score_component": current_metrics["score"],
            "waste_penalty_component": current_metrics["waste"],
            "distinct_ingredients_penalty": current_metrics["distinct"],
            "total_objective": current_metrics["objective"]
        }

    # --- Build Final Shopping List ---
    shopping_list = []
    total_cost = 0.0
    final_req = current_metrics["req_ingr"] if current_metrics else {}
    
    for ing in ingredients:
        req_qty = final_req.get(ing['id'], 0)
        if req_qty > 0:
            pkg_size = ing.get('package_size', 1.0)
            packages = math.ceil(req_qty / pkg_size)
            cost = packages * ing.get('unit_price', 0)
            total_cost += cost
            
            shopping_list.append({
                "ingredient_id": ing['id'],
                "packages": packages,
                "package_size": pkg_size,
                "required_quantity": req_qty,
                "waste": (packages * pkg_size) - req_qty,
                "unit": ing.get('unit', ''),
                "cost": cost
            })
            
    # --- Alternatives Generation ---
    alternatives = {}
    if current_metrics:
        for s_idx in slots:
            current_r = selected_slots.get(s_idx)
            slot_alts = []
            for r_obj in recipes:
                if r_obj['id'] == current_r: continue
                # Skip excluded recipes from alternatives
                if r_obj['id'] in excluded_recipes: continue
                
                proposed = selected_slots.copy()
                proposed[s_idx] = r_obj['id']
                metrics = compute_plan_metrics(proposed)
                if metrics:
                    slot_alts.append({
                        "recipe_id": r_obj['id'],
                        "objective": metrics['objective'],
                        "cost": metrics['cost'],
                        "score": metrics['score']
                    })
            slot_alts.sort(key=lambda a: a['objective'], reverse=True)
            alternatives[s_idx] = slot_alts[:3]

    return {
        "status": LpStatus[prob.status],
        "success": True,
        "selected_slots": selected_slots,
        "shopping_list": shopping_list,
        "total_cost": total_cost,
        "alternatives": alternatives,
        "explanation_trace": explanation_trace,
        "solve_time_seconds": solve_time
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
