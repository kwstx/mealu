import { Worker, Job } from 'bullmq';
import { redisConnection } from '../db/redis';
import { spawn } from 'child_process';
import path from 'path';
import { query } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { io } from '../server';
import { 
  optimizationSolveTime, 
  optimizationInfeasibleCount, 
  optimizationBindingConstraints 
} from '../services/metrics';

export const optimizationWorker = new Worker('meal-optimization', async (job: Job) => {
  const { userId, payload, options, averageConfidence } = job.data;
  console.log(`Processing optimization job ${job.id} for user ${userId}`);
  
  try {
    const result = await new Promise<any>((resolve, reject) => {
      const scriptPath = path.join(__dirname, '..', 'services', 'optimizer', 'meal_optimizer.py');
      const pyProcess = spawn('python', [scriptPath]);
      
      let outputData = '';
      let errorData = '';

      pyProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      pyProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      pyProcess.on('close', (code) => {
        if (code !== 0) {
          console.error("Python Error Output:", errorData);
          return reject(new Error(`Optimizer process exited with code ${code}`));
        }
        
        try {
          const jsonResult = JSON.parse(outputData);
          resolve(jsonResult);
        } catch (err) {
          console.error("Failed to parse Python output:", outputData);
          reject(new Error('Failed to parse optimizer output'));
        }
      });

      pyProcess.stdin.write(JSON.stringify(payload));
      pyProcess.stdin.end();
    });

    if (result.solve_time_seconds) {
      optimizationSolveTime.observe(result.solve_time_seconds);
    }

    if (!result.success) {
      optimizationInfeasibleCount.inc();
      throw new Error(result.message || 'Optimization failed / Infeasible');
    }

    if (result.explanation_trace?.binding_constraints) {
      optimizationBindingConstraints.observe(result.explanation_trace.binding_constraints.length);
    }

    // Persist Results
    const mealPlanId = uuidv4();
    const optimizationMetadata = { 
      status: result.status, 
      generated_at: new Date(),
      explanation_trace: result.explanation_trace,
      price_confidence: averageConfidence
    };

    await query(`
      INSERT INTO meal_plans (id, user_id, start_date, end_date, estimated_total_cost, optimization_metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      mealPlanId, userId, options.startDate, options.endDate, result.total_cost, 
      JSON.stringify(optimizationMetadata)
    ]);

    const selectedRecipeIds = new Set<string>(Object.values(result.selected_slots) as string[]);
    for (const rId of selectedRecipeIds) {
      await query(`
        INSERT INTO meal_plan_recipes (meal_plan_id, recipe_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [mealPlanId, rId]);
    }

    for (const item of result.shopping_list) {
      await query(`
        INSERT INTO meal_plan_shopping_list (meal_plan_id, ingredient_id, aggregated_quantity, unit)
        VALUES ($1, $2, $3, $4)
      `, [mealPlanId, item.ingredient_id, item.packages, 'packages']);
    }

    // Notify client via WebSocket
    io.to(`job_${job.id}`).emit('job_completed', { mealPlanId, result });
    
    return { mealPlanId };

  } catch (err: any) {
    console.error(`Job ${job.id} failed:`, err.message);
    io.to(`job_${job.id}`).emit('job_failed', { error: err.message });
    throw err;
  }
}, { connection: redisConnection });

optimizationWorker.on('failed', (job, err) => {
  console.error(`Worker failed job ${job?.id}: ${err.message}`);
});
