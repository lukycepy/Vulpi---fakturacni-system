export declare enum RecurrenceFrequency {
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    YEARLY = "yearly"
}
export declare class DateCalculator {
    /**
     * Calculate next date based on frequency
     */
    static getNextDate(currentDate: Date, frequency: RecurrenceFrequency): Date;
    /**
     * Check if invoice is overdue by specific days
     * @param dueDate Invoice due date
     * @param daysOverdue Number of days after due date to check
     * @param currentDate Current date (default now)
     */
    static isOverdueBy(dueDate: Date, daysOverdue: number, currentDate?: Date): boolean;
    /**
     * Calculate days overdue
     */
    static getDaysOverdue(dueDate: Date, currentDate?: Date): number;
}
//# sourceMappingURL=date-calculator.d.ts.map