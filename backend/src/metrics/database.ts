import { supabase } from '../utils/supabase';
import { AggregatedMetrics, Anomaly } from '../types/metrics';
import { logger } from '../utils/logger';
import { env } from '../utils/env';

export async function storeMetrics(metrics: AggregatedMetrics): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('metrics')
      .insert([{
        ...metrics,
        device_id: env.DEVICE_ID
      }]);

    if (error) throw error;
    return true;
  } catch (error) {
    logger.error('Failed to store metrics:', error);
    return false;
  }
}

export async function getLatestMetrics() {
  try {
    const { data, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('device_id', env.DEVICE_ID)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    // Return the first item or null if array is empty
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    logger.error('Failed to fetch latest metrics:', error);
    return null;
  }
}

export async function getMetricsHistory(hours: number = 1) {
  try {
    const { data, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('device_id', env.DEVICE_ID)
      .gte('created_at', new Date(Date.now() - hours * 3600000).toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Failed to fetch metrics history:', error);
    return [];
  }
}

export async function storeAnomalies(anomaly: Anomaly): Promise<number | null> {
  try {
    // Exclude id from the insert since it should be auto-generated
    const { id, ...anomalyData } = anomaly;

    const { data, error } = await supabase
      .from('anomalies')
      .insert([{
        ...anomalyData,
        device_id: env.DEVICE_ID
      }])
      .select('id')
      .single();

    if (error) throw error;
    return data?.id || null;
  } catch (error) {
    logger.error('Failed to store anomaly:', error);
    return null;
  }
}

export async function storeInsight(anomalyId: number, insight: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('insights')
      .insert([{
        anomaly_id: anomalyId,
        root_cause: insight.rootCause,
        recommendations: insight.recommendations,
        status: insight.status,
        device_id: env.DEVICE_ID
      }]);

    if (error) throw error;
    return true;
  } catch (error) {
    logger.error('Failed to store insight:', error);
    return false;
  }
}

export async function getAnomalies(limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from('anomalies')
      .select(`
        *,
        insights(root_cause, recommendations, status)
      `)
      .eq('device_id', env.DEVICE_ID)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Failed to fetch anomalies:', error);
    return [];
  }
}

export async function getRules() {
  try {
    const { data, error } = await supabase
      .from('rules')
      .select('*')
      .eq('device_id', env.DEVICE_ID)
      .eq('enabled', true);

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Failed to fetch rules:', error);
    return [];
  }
}
