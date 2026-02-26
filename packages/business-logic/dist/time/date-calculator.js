"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateCalculator = exports.RecurrenceFrequency = void 0;
var RecurrenceFrequency;
(function (RecurrenceFrequency) {
    RecurrenceFrequency["MONTHLY"] = "monthly";
    RecurrenceFrequency["QUARTERLY"] = "quarterly";
    RecurrenceFrequency["YEARLY"] = "yearly";
})(RecurrenceFrequency || (exports.RecurrenceFrequency = RecurrenceFrequency = {}));
class DateCalculator {
    /**
     * Calculate next date based on frequency
     */
    static getNextDate(currentDate, frequency) {
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
    static isOverdueBy(dueDate, daysOverdue, currentDate = new Date()) {
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
    static getDaysOverdue(dueDate, currentDate = new Date()) {
        const diffTime = currentDate.getTime() - dueDate.getTime();
        if (diffTime <= 0)
            return 0;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
}
exports.DateCalculator = DateCalculator;
//# sourceMappingURL=date-calculator.js.map