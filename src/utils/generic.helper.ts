/**
 * Parse number with fallback to default value
 */
export function parseNumber(value: string | undefined, defaultValue: number): number {
    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
}