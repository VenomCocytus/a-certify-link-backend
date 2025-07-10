/**
 * Parse number with fallback to default value
 */
export function parseNumber(value: string | undefined, defaultValue: number): number {
    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

export const parseIntOrDefault = (value: string | undefined, defaultValue: number): number => {
    if (!value) return defaultValue;
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
};