/**
 * Priority Styles Utility
 * 
 * Provides styling utilities for priority levels (low, medium, high)
 */

export interface PriorityStyles {
  bg: string;
  text: string;
}

/**
 * Get CSS variables for a given priority level
 * @param priority - The priority level ("low", "medium", or "high")
 * @returns Object containing background and text color CSS variables
 */
export function getPriorityStyles(priority: string): PriorityStyles {
  switch (priority) {
    case "medium":
      return {
        bg: "var(--priority-medium-bg)",
        text: "var(--priority-medium-text)",
      };
    case "high":
      return {
        bg: "var(--priority-high-bg)",
        text: "var(--priority-high-text)",
      };
    case "low":
    default:
      return {
        bg: "var(--priority-low-bg)",
        text: "var(--priority-low-text)",
      };
  }
}
