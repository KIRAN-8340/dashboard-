
import { SupplyChainData, ClusterPoint, RegressionPoint } from '../types';

/**
 * Simple Linear Regression (y = mx + b)
 */
export const calculateLinearRegression = (data: { x: number, y: number }[]): RegressionPoint[] => {
  const n = data.length;
  if (n === 0) return [];

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (const p of data) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
  }

  const denominator = (n * sumX2 - sumX * sumX);
  if (denominator === 0) return data.map(p => ({ ...p, predictedY: p.y }));

  const m = (n * sumXY - sumX * sumY) / denominator;
  const b = (sumY - m * sumX) / n;

  return data.map(p => ({
    ...p,
    predictedY: m * p.x + b
  }));
};

/**
 * Basic K-Means Clustering (1D clustering for Lead Time vs Cost)
 */
export const performKMeans = (data: SupplyChainData[], k: number = 3): ClusterPoint[] => {
  if (data.length === 0) return [];

  // Normalize and prepare points
  let points = data.map(d => ({
    x: d.leadTime,
    y: d.cost,
    cluster: 0,
    label: d.supplier
  }));

  // Simple initialization: pick k random points
  let centroids = points.slice(0, k).map(p => ({ x: p.x, y: p.y }));

  // Run for 10 iterations (sufficient for this demo scale)
  for (let iter = 0; iter < 10; iter++) {
    // Assignment
    points = points.map(p => {
      let minDist = Infinity;
      let cluster = 0;
      centroids.forEach((c, idx) => {
        const dist = Math.sqrt(Math.pow(p.x - c.x, 2) + Math.pow(p.y - c.y, 2));
        if (dist < minDist) {
          minDist = dist;
          cluster = idx;
        }
      });
      return { ...p, cluster };
    });

    // Update centroids
    for (let i = 0; i < k; i++) {
      const clusterPoints = points.filter(p => p.cluster === i);
      if (clusterPoints.length > 0) {
        centroids[i] = {
          x: clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length,
          y: clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length,
        };
      }
    }
  }

  return points;
};

export const getMovingAverage = (data: number[], window: number = 7): number[] => {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const subset = data.slice(start, i + 1);
    const avg = subset.reduce((a, b) => a + b, 0) / subset.length;
    result.push(avg);
  }
  return result;
};
