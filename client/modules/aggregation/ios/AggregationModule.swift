import ExpoModulesCore

public class AggregationModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AggregationModule")

    Function("aggregateAndConvert") { (items: [[String: Any]], targetUnit: String) -> String in
      // Robust example: aggregating amounts for specific items and formatting
      // Assume each item has "name", "amount" (Double), and "unit" (String)
      var aggregatedData = [String: Double]()
      
      for item in items {
        guard let name = item["name"] as? String,
              let amount = item["amount"] as? Double,
              let unit = item["unit"] as? String else {
          continue
        }
        
        // Convert everything to a base unit (e.g., grams) for aggregation
        let amountInBase = convertToBaseUnit(amount: amount, unit: unit)
        
        if let existing = aggregatedData[name] {
          aggregatedData[name] = existing + amountInBase
        } else {
          aggregatedData[name] = amountInBase
        }
      }
      
      // Convert aggregated base amounts to the target unit and format
      var resultStrings = [String]()
      for (name, baseAmount) in aggregatedData {
        let finalAmount = convertFromBaseUnit(amount: baseAmount, targetUnit: targetUnit)
        resultStrings.append(String(format: "%@: %.2f %@", name, finalAmount, targetUnit))
      }
      
      return resultStrings.joined(separator: "\n")
    }
  }
  
  // Helper for unit conversion (example logic)
  private func convertToBaseUnit(amount: Double, unit: String) -> Double {
    let lowerUnit = unit.lowercased()
    switch lowerUnit {
    case "oz", "ounce", "ounces":
      return amount * 28.3495
    case "kg", "kilogram", "kilograms":
      return amount * 1000.0
    case "lb", "lbs", "pound", "pounds":
      return amount * 453.592
    case "g", "gram", "grams":
      return amount
    default:
      // Unknown unit, return as-is or handle differently
      return amount
    }
  }
  
  private func convertFromBaseUnit(amount: Double, targetUnit: String) -> Double {
    let lowerUnit = targetUnit.lowercased()
    switch lowerUnit {
    case "oz", "ounce", "ounces":
      return amount / 28.3495
    case "kg", "kilogram", "kilograms":
      return amount / 1000.0
    case "lb", "lbs", "pound", "pounds":
      return amount / 453.592
    case "g", "gram", "grams":
      return amount
    default:
      return amount
    }
  }
}
