/**
 * Policy Engine - ABAC (Attribute-Based Access Control)
 * Evaluates complex permission policies with contextual conditions
 * Inspired by AWS IAM Policy Engine
 */

/* eslint-disable no-console, @typescript-eslint/no-explicit-any, class-methods-use-this */

import type { Permission } from './types';

/**
 * Policy effect
 */
export enum PolicyEffect {
  ALLOW = 'Allow',
  DENY = 'Deny',
}

/**
 * Policy statement (AWS IAM style)
 */
export interface PolicyStatement {
  effect: PolicyEffect;
  action: Permission | Permission[] | '*';
  resource?: string | string[];
  condition?: PolicyCondition;
}

/**
 * Policy document
 */
export interface Policy {
  version: string;
  id?: string;
  statement: PolicyStatement[];
}

/**
 * Condition operators
 */
export interface PolicyCondition {
  // Numeric conditions
  NumericEquals?: Record<string, number>;
  NumericNotEquals?: Record<string, number>;
  NumericLessThan?: Record<string, number>;
  NumericLessThanEquals?: Record<string, number>;
  NumericGreaterThan?: Record<string, number>;
  NumericGreaterThanEquals?: Record<string, number>;

  // String conditions
  StringEquals?: Record<string, string>;
  StringNotEquals?: Record<string, string>;
  StringLike?: Record<string, string>;

  // Boolean conditions
  Bool?: Record<string, boolean>;

  // Date/Time conditions
  DateEquals?: Record<string, string>;
  DateNotEquals?: Record<string, string>;
  DateLessThan?: Record<string, string>;
  DateGreaterThan?: Record<string, string>;

  // Array conditions
  ArrayContains?: Record<string, any>;
}

/**
 * Evaluation context
 */
export interface EvaluationContext {
  pluginId: string;
  resource?: string;
  timestamp: number;
  user?: {
    id: string;
    roles: string[];
  };
  request?: {
    ip?: string;
    userAgent?: string;
  };
  custom?: Record<string, any>;
}

/**
 * Evaluation result
 */
export interface EvaluationResult {
  allowed: boolean;
  explicitDeny: boolean;
  matchedStatements: PolicyStatement[];
  reason?: string;
}

/**
 * Policy Engine
 */
export class PolicyEngine {
  private policies = new Map<string, Policy>();

  /**
   * Register a policy
   */
  registerPolicy(pluginId: string, policy: Policy): void {
    this.policies.set(pluginId, policy);
    console.log(`[PolicyEngine] Registered policy for plugin: ${pluginId}`);
  }

  /**
   * Evaluate if an action is allowed
   * Default deny + explicit deny wins
   */
  evaluate(pluginId: string, action: Permission, context: EvaluationContext): EvaluationResult {
    const policy = this.policies.get(pluginId);

    if (!policy) {
      return {
        allowed: false,
        explicitDeny: false,
        matchedStatements: [],
        reason: 'No policy found for plugin',
      };
    }

    const matchedStatements: PolicyStatement[] = [];
    let hasAllow = false;
    let hasDeny = false;

    // Evaluate each statement
    policy.statement.forEach(statement => {
      if (this.matchesAction(statement.action, action)) {
        if (this.matchesResource(statement.resource, context.resource)) {
          if (this.evaluateCondition(statement.condition, context)) {
            matchedStatements.push(statement);

            if (statement.effect === PolicyEffect.ALLOW) {
              hasAllow = true;
            } else if (statement.effect === PolicyEffect.DENY) {
              hasDeny = true;
            }
          }
        }
      }
    });

    // Explicit deny wins
    if (hasDeny) {
      return {
        allowed: false,
        explicitDeny: true,
        matchedStatements,
        reason: 'Explicit deny in policy',
      };
    }

    // Must have explicit allow
    if (hasAllow) {
      return {
        allowed: true,
        explicitDeny: false,
        matchedStatements,
      };
    }

    // Default deny
    return {
      allowed: false,
      explicitDeny: false,
      matchedStatements,
      reason: 'No explicit allow found',
    };
  }

  /**
   * Check if action matches statement action
   */
  private matchesAction(
    statementAction: Permission | Permission[] | '*',
    action: Permission
  ): boolean {
    if (statementAction === '*') {
      return true;
    }

    if (Array.isArray(statementAction)) {
      return statementAction.includes(action);
    }

    return statementAction === action;
  }

  /**
   * Check if resource matches statement resource
   */
  private matchesResource(
    statementResource: string | string[] | undefined,
    contextResource: string | undefined
  ): boolean {
    if (!statementResource) {
      return true; // No resource restriction
    }

    if (!contextResource) {
      return false; // Statement requires resource but none provided
    }

    if (statementResource === '*') {
      return true;
    }

    if (Array.isArray(statementResource)) {
      return statementResource.some(r => this.matchResourcePattern(r, contextResource));
    }

    return this.matchResourcePattern(statementResource, contextResource);
  }

  /**
   * Match resource pattern (supports wildcards)
   */
  private matchResourcePattern(pattern: string, resource: string): boolean {
    const regexPattern = pattern.replace(/\*/g, '.*').replace(/\?/g, '.');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(resource);
  }

  /**
   * Evaluate policy conditions
   */
  private evaluateCondition(
    condition: PolicyCondition | undefined,
    context: EvaluationContext
  ): boolean {
    if (!condition) {
      return true; // No conditions = always true
    }

    // Evaluate all condition operators (AND logic)
    const results: boolean[] = [];

    // Numeric conditions
    if (condition.NumericEquals) {
      results.push(this.evaluateNumericEquals(condition.NumericEquals, context));
    }
    if (condition.NumericGreaterThan) {
      results.push(this.evaluateNumericGreaterThan(condition.NumericGreaterThan, context));
    }
    if (condition.NumericLessThan) {
      results.push(this.evaluateNumericLessThan(condition.NumericLessThan, context));
    }

    // String conditions
    if (condition.StringEquals) {
      results.push(this.evaluateStringEquals(condition.StringEquals, context));
    }

    // Boolean conditions
    if (condition.Bool) {
      results.push(this.evaluateBool(condition.Bool, context));
    }

    // Date conditions
    if (condition.DateGreaterThan) {
      results.push(this.evaluateDateGreaterThan(condition.DateGreaterThan, context));
    }
    if (condition.DateLessThan) {
      results.push(this.evaluateDateLessThan(condition.DateLessThan, context));
    }

    // All conditions must be true
    return results.every(r => r === true);
  }

  /**
   * Evaluate numeric equals condition
   */
  private evaluateNumericEquals(
    condition: Record<string, number>,
    context: EvaluationContext
  ): boolean {
    return Object.entries(condition).every(([key, expectedValue]) => {
      const actualValue = this.getContextValue(key, context);
      return typeof actualValue === 'number' && actualValue === expectedValue;
    });
  }

  /**
   * Evaluate numeric greater than condition
   */
  private evaluateNumericGreaterThan(
    condition: Record<string, number>,
    context: EvaluationContext
  ): boolean {
    return Object.entries(condition).every(([key, expectedValue]) => {
      const actualValue = this.getContextValue(key, context);
      return typeof actualValue === 'number' && actualValue > expectedValue;
    });
  }

  /**
   * Evaluate numeric less than condition
   */
  private evaluateNumericLessThan(
    condition: Record<string, number>,
    context: EvaluationContext
  ): boolean {
    return Object.entries(condition).every(([key, expectedValue]) => {
      const actualValue = this.getContextValue(key, context);
      return typeof actualValue === 'number' && actualValue < expectedValue;
    });
  }

  /**
   * Evaluate string equals condition
   */
  private evaluateStringEquals(
    condition: Record<string, string>,
    context: EvaluationContext
  ): boolean {
    return Object.entries(condition).every(([key, expectedValue]) => {
      const actualValue = this.getContextValue(key, context);
      return actualValue === expectedValue;
    });
  }

  /**
   * Evaluate boolean condition
   */
  private evaluateBool(condition: Record<string, boolean>, context: EvaluationContext): boolean {
    return Object.entries(condition).every(([key, expectedValue]) => {
      const actualValue = this.getContextValue(key, context);
      return actualValue === expectedValue;
    });
  }

  /**
   * Evaluate date greater than condition
   */
  private evaluateDateGreaterThan(
    condition: Record<string, string>,
    context: EvaluationContext
  ): boolean {
    return Object.entries(condition).every(([key, expectedValue]) => {
      const actualValue = this.getContextValue(key, context);
      const actualDate = new Date(actualValue as string).getTime();
      const expectedDate = new Date(expectedValue).getTime();
      return actualDate > expectedDate;
    });
  }

  /**
   * Evaluate date less than condition
   */
  private evaluateDateLessThan(
    condition: Record<string, string>,
    context: EvaluationContext
  ): boolean {
    return Object.entries(condition).every(([key, expectedValue]) => {
      const actualValue = this.getContextValue(key, context);
      const actualDate = new Date(actualValue as string).getTime();
      const expectedDate = new Date(expectedValue).getTime();
      return actualDate < expectedDate;
    });
  }

  /**
   * Get value from context using dot notation (e.g., "time:hour", "user.id")
   */
  private getContextValue(key: string, context: EvaluationContext): any {
    // Special context variables
    if (key === 'time:hour') {
      return new Date(context.timestamp).getHours();
    }
    if (key === 'time:day') {
      return new Date(context.timestamp).getDay();
    }
    if (key === 'time:timestamp') {
      return context.timestamp;
    }

    // Navigate nested objects
    const parts = key.split(/[.:]/);
    let value: any = context;

    parts.forEach(part => {
      if (value && typeof value === 'object') {
        value = value[part];
      }
    });

    return value;
  }

  /**
   * Remove policy for a plugin
   */
  removePolicy(pluginId: string): void {
    this.policies.delete(pluginId);
    console.log(`[PolicyEngine] Removed policy for plugin: ${pluginId}`);
  }

  /**
   * Get policy for a plugin
   */
  getPolicy(pluginId: string): Policy | undefined {
    return this.policies.get(pluginId);
  }
}
