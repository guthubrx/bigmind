/**
 * FR: Fonction utilitaire pour combiner les classes CSS
 * EN: Utility function to combine CSS classes
 */

export function cn(...classes: Array<string | undefined | null | false | 0 | ''>): string {
  return classes.filter(Boolean).join(' ');
}