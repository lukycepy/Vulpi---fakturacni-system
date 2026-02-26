export enum RecurrenceFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export class DateCalculator {
  /**
   * Calculate next date based on frequency
   */
  static getNextDate(currentDate: Date, frequency: RecurrenceFrequency): Date {
    const nextDate = new Date(currentDate);
    
    switch (frequency) {
      case RecurrenceFrequency.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case RecurrenceFrequency.QUARTERLY:
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case RecurrenceFrequency.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    return nextDate;
  }

  /**
   * Check if invoice is overdue by specific days
   * @param dueDate Invoice due date
   * @param daysOverdue Number of days after due date to check
   * @param currentDate Current date (default now)
   */
  static isOverdueBy(dueDate: Date, daysOverdue: number, currentDate: Date = new Date()): boolean {
    const checkDate = new Date(dueDate);
    checkDate.setDate(checkDate.getDate() + daysOverdue);
    
    // Normalize to start of day for comparison
    const normalizedCheck = new Date(checkDate.setHours(0, 0, 0, 0));
    const normalizedCurrent = new Date(currentDate.setHours(0, 0, 0, 0));

    return normalizedCurrent.getTime() === normalizedCheck.getTime();
  }

  /**
   * Calculate days overdue
   */
  static getDaysOverdue(dueDate: Date, currentDate: Date = new Date()): number {
    const diffTime = currentDate.getTime() - dueDate.getTime();
    if (diffTime <= 0) return 0;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
}
