import type { AutomatedPayrollCalculationInput } from './types';

export interface PayrollCalculationResult {
    baseSalaryPay: number;
    overtimePay: number;
    holidayPay: number;
    nightWorkPay: number;
    childAllowance: number;
    housingAllowance: number;
    foodAllowance: number;
    grossPay: number;
    insuranceDeduction: number;
    taxDeduction: number;
    latenessDeduction: number;
    netPay: number;
}

/**
 * Calculates the monthly payroll for an employee based on Iranian labor laws.
 * This function is a reliable, deterministic replacement for the AI-based calculation.
 * @param input - The payroll calculation inputs.
 * @returns The calculated payroll details.
 */
export function calculatePayroll(input: AutomatedPayrollCalculationInput): PayrollCalculationResult {
    // 1. Calculate Hourly Rate (assuming 220 working hours in a month as standard)
    const hourlyRate = input.baseSalaryOfMonth / 220;

    // 2. Calculate Pay Components
    const baseSalaryPay = input.totalHoursWorked * hourlyRate;
    const overtimePay = input.totalOvertimeHours * hourlyRate * input.overtimeMultiplier;
    const holidayPay = input.totalHolidayHours * hourlyRate * input.holidayWorkMultiplier;
    const nightWorkPay = input.totalNightWorkHours * hourlyRate * input.nightWorkMultiplier;

    // 3. Calculate Total Allowances
    const totalChildAllowance = input.childrenCount * input.childAllowance;
    const housingAllowance = input.housingAllowance;
    const foodAllowance = input.foodAllowance;

    // 4. Calculate Gross Pay
    const grossPay =
        baseSalaryPay +
        overtimePay +
        holidayPay +
        nightWorkPay +
        totalChildAllowance +
        housingAllowance +
        foodAllowance;

    // 5. Calculate Lateness Deduction
    let latenessDeduction = 0;
    try {
        const [defaultH, defaultM] = (input.defaultEntryTime || '00:00').split(':').map(Number);
        const [entryH, entryM] = (input.entryTime || '00:00').split(':').map(Number);
        
        const defaultDate = new Date(0, 0, 0, defaultH, defaultM);
        const entryDate = new Date(0, 0, 0, entryH, entryM);
        
        const latenessInMinutes = (entryDate.getTime() - defaultDate.getTime()) / (1000 * 60);

        if (latenessInMinutes > input.maxAllowedLateness) {
            latenessDeduction = input.latenessPenaltyAmount;
        }
    } catch(e) {
        console.error("Error calculating lateness:", e);
        latenessDeduction = 0;
    }


    // 6. Calculate Other Deductions
    // Insurance is often calculated on base salary + fixed allowances, but law can vary.
    // Simplified here to be based on a portion of earnings that are subject to insurance.
    const insuranceSubjectIncome = baseSalaryPay + overtimePay + nightWorkPay + holidayPay; 
    const insuranceDeduction = insuranceSubjectIncome * (input.insuranceDeductionPercentage / 100);

    // Simplified tax calculation. Real tax is progressive (stepped).
    const taxDeduction = grossPay > 0 ? grossPay * (input.taxDeductionPercentage / 100) : 0;

    // 7. Calculate Net Pay
    const totalDeductions =
        insuranceDeduction +
        taxDeduction +
        latenessDeduction +
        input.otherDeductions;

    const netPay = grossPay - totalDeductions;

    return {
        baseSalaryPay,
        overtimePay,
        holidayPay,
        nightWorkPay,
        childAllowance: totalChildAllowance,
        housingAllowance,
        foodAllowance,
        grossPay,
        insuranceDeduction,
        taxDeduction,
        latenessDeduction,
        netPay: netPay > 0 ? netPay : 0, // Net pay cannot be negative
    };
}
