/**
 * Server does not format numbers, so we need to do it here.
 * This is used to round the value and percentage to a maximum of 2 decimal places by default
 * @param value
 * @param returnString defaults to false
 * @param decimalPlaces defaults to 2
 * @returns
 */
export function handleDecimal(value: number | undefined, decimalPlaces = 2) {
  if (!value) return undefined;
  // Check if we have a number that needs to be formatted
  const strRep = value.toString();
  const formattedValue =
    strRep.includes('.') && strRep.length - strRep.indexOf('.') - 1 > decimalPlaces ? value.toFixed(decimalPlaces) : value;
  // Use + Unary operator for a number value
  return +formattedValue;
}
