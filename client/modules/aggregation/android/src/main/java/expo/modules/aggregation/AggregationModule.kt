package expo.modules.aggregation

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AggregationModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AggregationModule")

    Function("aggregateAndConvert") { items: List<Map<String, Any>>, targetUnit: String ->
      // Robust example: aggregating amounts for specific items and formatting
      val aggregatedData = mutableMapOf<String, Double>()
      
      for (item in items) {
        val name = item["name"] as? String ?: continue
        val amount = (item["amount"] as? Number)?.toDouble() ?: continue
        val unit = item["unit"] as? String ?: continue
        
        // Convert everything to a base unit (e.g., grams) for aggregation
        val amountInBase = convertToBaseUnit(amount, unit)
        
        aggregatedData[name] = aggregatedData.getOrDefault(name, 0.0) + amountInBase
      }
      
      // Convert aggregated base amounts to the target unit and format
      val resultStrings = mutableListOf<String>()
      for ((name, baseAmount) in aggregatedData) {
        val finalAmount = convertFromBaseUnit(baseAmount, targetUnit)
        resultStrings.add(String.format("%s: %.2f %s", name, finalAmount, targetUnit))
      }
      
      resultStrings.joinToString("\n")
    }
  }

  private fun convertToBaseUnit(amount: Double, unit: String): Double {
    return when (unit.lowercase()) {
      "oz", "ounce", "ounces" -> amount * 28.3495
      "kg", "kilogram", "kilograms" -> amount * 1000.0
      "lb", "lbs", "pound", "pounds" -> amount * 453.592
      "g", "gram", "grams" -> amount
      else -> amount
    }
  }

  private fun convertFromBaseUnit(amount: Double, targetUnit: String): Double {
    return when (targetUnit.lowercase()) {
      "oz", "ounce", "ounces" -> amount / 28.3495
      "kg", "kilogram", "kilograms" -> amount / 1000.0
      "lb", "lbs", "pound", "pounds" -> amount / 453.592
      "g", "gram", "grams" -> amount
      else -> amount
    }
  }
}
