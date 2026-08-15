import { requireNativeModule } from 'expo-modules-core';

interface AggregationModuleType {
  /**
   * Aggregates and converts an array of ingredient items natively.
   * @param items Array of ingredient items with amounts and units.
   * @param targetUnit The target unit to convert to (e.g., 'g', 'oz', 'ml').
   * @returns A pre-formatted string that the UI can render directly.
   */
  aggregateAndConvert(items: any[], targetUnit: string): string;
}

const AggregationModule = requireNativeModule<AggregationModuleType>('AggregationModule');

export default AggregationModule;
