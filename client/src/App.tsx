import React, { useState, useEffect } from 'react';
import './index.css';

interface Recipe {
  id: string;
  title: string;
  calories: number;
}

interface Alternative {
  recipe_id: string;
  objective: number;
  cost: number;
}

interface PlanResult {
  status: string;
  success: boolean;
  selected_slots: Record<string, string>;
  shopping_list: any[];
  total_cost: number;
  alternatives: Record<string, Alternative[]>;
}

function App() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [lockedSlots, setLockedSlots] = useState<Record<string, string>>({});
  const [excludedRecipes, setExcludedRecipes] = useState<string[]>([]);
  const [budget, setBudget] = useState(150);

  const generatePlan = async () => {
    setLoading(true);
    try {
      // Mocked endpoint call; in reality, would fetch from localhost:3000/api/plans/generate
      // Using mock data for demonstration
      await new Promise(r => setTimeout(r, 1500));
      const mockResult: PlanResult = {
        status: "Optimal",
        success: true,
        selected_slots: {
          "1_breakfast": "r1", "1_lunch": "r2", "1_dinner": "r3",
          "2_breakfast": "r4", "2_lunch": "r5", "2_dinner": "r6",
          "3_breakfast": "r1", "3_lunch": "r2", "3_dinner": "r7"
        },
        total_cost: 135.50,
        shopping_list: [
          { ingredient_id: "i1", name: "Oats", aisle: "Breakfast", cost: 5.0, packages: 1 },
          { ingredient_id: "i2", name: "Chicken Breast", aisle: "Meat", cost: 15.0, packages: 2 },
          { ingredient_id: "i3", name: "Broccoli", aisle: "Produce", cost: 4.5, packages: 3 }
        ],
        alternatives: {
          "1_dinner": [{ recipe_id: "r8", objective: 95, cost: 12.0 }]
        }
      };
      setPlan(mockResult);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const adjustPlan = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      // In reality: POST /api/plans/:id/adjust
      generatePlan(); // mock re-generating
    } finally {
      setLoading(false);
    }
  };

  const handleLock = (slot: string, recipeId: string) => {
    setLockedSlots(prev => {
      const newLocks = { ...prev };
      if (newLocks[slot]) delete newLocks[slot];
      else newLocks[slot] = recipeId;
      return newLocks;
    });
  };

  const handleExclude = (recipeId: string) => {
    setExcludedRecipes(prev => [...prev, recipeId]);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Mealu Optimizer</h1>
        <div>
          <input 
            type="number" 
            value={budget} 
            onChange={(e) => setBudget(Number(e.target.value))} 
            style={{ padding: '0.5rem', borderRadius: '8px', marginRight: '1rem', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'white' }} 
            title="Weekly Budget"
          />
          <button className="btn-primary" onClick={Object.keys(lockedSlots).length > 0 || excludedRecipes.length > 0 ? adjustPlan : generatePlan}>
            {plan ? "Re-Optimize" : "Generate Weekly Plan"}
          </button>
        </div>
      </header>

      {loading ? (
        <div className="loader">
          <div className="spinner"></div>
          <p>Running optimization engine... finding the best meals within budget.</p>
        </div>
      ) : plan ? (
        <div className="dashboard-grid">
          <div className="main-content">
            <div className="card">
              <h2>Meal Calendar</h2>
              <div className="calendar-grid">
                {[1, 2, 3].map(day => (
                  <div key={day} className="day-column">
                    <div className="day-header">Day {day}</div>
                    {['breakfast', 'lunch', 'dinner'].map(meal => {
                      const slot = `${day}_${meal}`;
                      const recipeId = plan.selected_slots[slot];
                      const isLocked = !!lockedSlots[slot];
                      const hasAlts = plan.alternatives && plan.alternatives[slot] && plan.alternatives[slot].length > 0;
                      
                      return (
                        <div 
                          key={slot} 
                          className={`meal-slot ${isLocked ? 'locked' : ''}`}
                        >
                          <div className="meal-title">{meal.charAt(0).toUpperCase() + meal.slice(1)}</div>
                          <div style={{ color: 'var(--text-muted)' }}>Recipe {recipeId}</div>
                          
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button 
                              onClick={() => handleLock(slot, recipeId)}
                              style={{ background: 'transparent', border: '1px solid var(--border-color)', color: isLocked ? 'var(--accent-color)' : 'var(--text-muted)', cursor: 'pointer', borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem' }}
                            >
                              {isLocked ? '🔒 Locked' : 'Lock'}
                            </button>
                            <button 
                              onClick={() => handleExclude(recipeId)}
                              style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--error-color)', cursor: 'pointer', borderRadius: '4px', padding: '2px 6px', fontSize: '0.7rem' }}
                            >
                              Exclude
                            </button>
                          </div>
                          
                          {hasAlts && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                              <div style={{ color: 'var(--primary-color)' }}>Substitutions:</div>
                              {plan.alternatives[slot].map(alt => (
                                <div key={alt.recipe_id} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  <span>{alt.recipe_id}</span>
                                  <span>${alt.cost.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sidebar">
            <div className="card">
              <h2>Cost Breakdown</h2>
              <div className="cost-breakdown">
                <div className="cost-row">
                  <span>Target Budget</span>
                  <span>${budget.toFixed(2)}</span>
                </div>
                <div className="cost-row">
                  <span>Estimated Total</span>
                  <span style={{ color: plan.total_cost <= budget ? 'var(--accent-color)' : 'var(--error-color)' }}>
                    ${plan.total_cost.toFixed(2)}
                  </span>
                </div>
                <div className="cost-total">
                  <span>Remaining</span>
                  <span>${(budget - plan.total_cost).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h2>Shopping List</h2>
              {['Produce', 'Meat', 'Breakfast'].map(aisle => {
                const items = plan.shopping_list.filter(i => i.aisle === aisle);
                if (items.length === 0) return null;
                return (
                  <div key={aisle} className="aisle-section">
                    <div className="aisle-header">{aisle}</div>
                    {items.map(item => (
                      <div key={item.ingredient_id} className="shopping-item">
                        <span>{item.packages}x {item.name}</span>
                        <span>${item.cost.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h2 style={{ color: 'var(--text-muted)' }}>No plan active. Set your budget and generate!</h2>
        </div>
      )}
    </div>
  );
}

export default App;
