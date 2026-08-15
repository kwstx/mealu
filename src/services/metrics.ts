import client from 'prom-client';

const register = new client.Registry();

client.collectDefaultMetrics({ register });

export const optimizationSolveTime = new client.Histogram({
  name: 'meal_optimization_solve_time_seconds',
  help: 'Time taken to run the python optimizer in seconds',
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30]
});
register.registerMetric(optimizationSolveTime);

export const optimizationOptimalityGap = new client.Gauge({
  name: 'meal_optimization_optimality_gap',
  help: 'Optimality gap reported by the solver'
});
register.registerMetric(optimizationOptimalityGap);

export const optimizationInfeasibleCount = new client.Counter({
  name: 'meal_optimization_infeasible_count',
  help: 'Number of times the solver reported infeasibility'
});
register.registerMetric(optimizationInfeasibleCount);

export const optimizationBindingConstraints = new client.Histogram({
    name: 'meal_optimization_binding_constraints',
    help: 'Number of binding constraints in a successful solve',
    buckets: [10, 50, 100, 500, 1000]
});
register.registerMetric(optimizationBindingConstraints);

export { register };
