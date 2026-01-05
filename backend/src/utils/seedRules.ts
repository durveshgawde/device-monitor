import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';
import { env } from '../utils/env';

const DEFAULT_RULES = [
    {
        name: 'cpu_overload',
        condition: 'cpu_percent',
        threshold: 80,
        severity: 'HIGH'
    },
    {
        name: 'memory_critical',
        condition: 'memory_percent',
        threshold: 90,
        severity: 'CRITICAL'
    },
    {
        name: 'high_disk_usage',
        condition: 'disk_percent',
        threshold: 90,
        severity: 'WARNING'
    }
];

export async function seedDefaultRules(): Promise<void> {
    try {
        // Check if rules already exist for this device
        const { data: existingRules, error: fetchError } = await supabase
            .from('rules')
            .select('name')
            .eq('device_id', env.DEVICE_ID);

        if (fetchError) {
            logger.error('Failed to check existing rules:', fetchError);
            return;
        }

        const existingNames = existingRules?.map(r => r.name) || [];

        // Only insert rules that don't exist
        const newRules = DEFAULT_RULES.filter(rule => !existingNames.includes(rule.name));

        if (newRules.length === 0) {
            logger.info(`📋 All default rules already exist (${existingRules?.length} rules)`);
            return;
        }

        // Insert new default rules
        const rulesToInsert = newRules.map(rule => ({
            ...rule,
            device_id: env.DEVICE_ID
        }));

        const { error: insertError } = await supabase
            .from('rules')
            .insert(rulesToInsert);

        if (insertError) {
            logger.error('Failed to seed default rules:', insertError);
            return;
        }

        logger.info(`✅ Seeded ${newRules.length} default rules`);
    } catch (error) {
        logger.error('Error seeding default rules:', error);
    }
}
