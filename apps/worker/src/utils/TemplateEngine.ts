/**
 * Enhanced Template Engine for n8n Agentic
 * Supports accessing data from any previous node in the workflow
 */

export interface TemplateContext {
  input: any; // Current node's input data
  fullDataPacket: Record<string, any>; // All previous node outputs
  trigger: any; // Trigger data
}

export class TemplateEngine {
  /**
   * Process template string with enhanced data access
   * @param template Template string with {{}} placeholders
   * @param context Template context with input and full data packet
   * @returns Processed string with resolved values
   */
  static process(template: string, context: TemplateContext): string {
    if (!template || typeof template !== 'string') {
      return template;
    }

    return template.replace(/\{\{([^}]+)\}\}/g, (match: string, path: string) => {
      try {
        const value = this.resolvePath(path.trim(), context);
        return this.formatValue(value);
      } catch (error) {
        console.warn(`Template resolution failed for path "${path}":`, error);
        return match; // Return original template if resolution fails
      }
    });
  }

  /**
   * Resolve a path to a value in the template context
   * @param path Path to resolve (e.g., "nodeId.field", "$json", "trigger.data")
   * @param context Template context
   * @returns Resolved value
   */
  private static resolvePath(path: string, context: TemplateContext): any {
    // Handle special variables
    if (path === '$json') {
      return context.input;
    }
    
    if (path === '$trigger') {
      return context.trigger;
    }

    if (path === '$all') {
      return context.fullDataPacket;
    }

    // Handle node-specific data access (e.g., "nodeId.field")
    if (path.includes('.')) {
      const parts = path.split('.');
      const firstPart = parts[0];
      
      // Check if first part is a node ID in the data packet
      if (context.fullDataPacket[firstPart]) {
        const nodeData = context.fullDataPacket[firstPart];
        const remainingPath = parts.slice(1).join('.');
        
        if (remainingPath === 'output') {
          return nodeData.output;
        }
        
        if (remainingPath === 'handle') {
          return nodeData.handle;
        }
        
        // Access nested properties in the node's output
        return this.getNestedValue(nodeData.output, remainingPath);
      }
      
      // Check if it's trigger data
      if (firstPart === 'trigger') {
        const remainingPath = parts.slice(1).join('.');
        return this.getNestedValue(context.trigger, remainingPath);
      }
      
      // Default to current input data
      return this.getNestedValue(context.input, path);
    }

    // Simple path - try current input first, then full data packet
    let value = this.getNestedValue(context.input, path);
    if (value === undefined) {
      value = this.getNestedValue(context.fullDataPacket, path);
    }
    
    return value;
  }

  /**
   * Get nested value from an object using dot notation
   * @param obj Object to traverse
   * @param path Dot-separated path
   * @returns Value at path or undefined
   */
  private static getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    
    return path.split('.').reduce((acc, part) => {
      if (acc === null || acc === undefined) return undefined;
      
      // Handle array access (e.g., "items[0]")
      if (part.includes('[') && part.includes(']')) {
        const [key, indexStr] = part.split('[');
        const index = parseInt(indexStr.replace(']', ''), 10);
        
        if (key) {
          const array = acc[key];
          return Array.isArray(array) ? array[index] : undefined;
        } else {
          return Array.isArray(acc) ? acc[index] : undefined;
        }
      }
      
      return acc[part];
    }, obj);
  }

  /**
   * Format a value for template output
   * @param value Value to format
   * @returns Formatted string
   */
  private static formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (typeof value === 'string') {
      return value;
    }
    
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    
    return String(value);
  }

  /**
   * Get available data sources for a template context
   * @param context Template context
   * @returns Object with available data sources
   */
  static getAvailableData(context: TemplateContext): {
    trigger: any;
    input: any;
    nodes: Record<string, any>;
    special: {
      $json: any;
      $trigger: any;
      $all: any;
    };
  } {
    const nodes: Record<string, any> = {};
    
    for (const [nodeId, nodeData] of Object.entries(context.fullDataPacket)) {
      if (nodeId !== 'trigger') {
        nodes[nodeId] = {
          output: nodeData.output,
          handle: nodeData.handle
        };
      }
    }

    return {
      trigger: context.trigger,
      input: context.input,
      nodes,
      special: {
        $json: context.input,
        $trigger: context.trigger,
        $all: context.fullDataPacket
      }
    };
  }

  /**
   * Validate template syntax
   * @param template Template string to validate
   * @returns Object with validation results
   */
  static validate(template: string): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!template || typeof template !== 'string') {
      return { isValid: true, errors, warnings };
    }

    // Check for unmatched braces
    const openBraces = (template.match(/\{\{/g) || []).length;
    const closeBraces = (template.match(/\}\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      errors.push('Unmatched template braces {{ or }}');
    }

    // Check for empty template expressions
    const emptyExpressions = template.match(/\{\{\s*\}\}/g);
    if (emptyExpressions) {
      warnings.push('Empty template expressions found: {{}}');
    }

    // Check for malformed expressions
    const malformed = template.match(/\{[^{]|\}[^}]/g);
    if (malformed) {
      errors.push('Malformed template expressions found');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
