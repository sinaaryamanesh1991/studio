'use server';

/**
 * @fileOverview An automated payroll calculation AI agent based on Iranian Labor Law.
 *
 * - automatedPayrollCalculation - A function that handles the payroll calculation process.
 * - AutomatedPayrollCalculationInput - The input type for the automatedPayrollCalculation function.
 * - AutomatedPayrollCalculationOutput - The return type for the automatedPayrollCalculation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input schema reflecting all necessary data for a comprehensive payroll calculation
const AutomatedPayrollCalculationInputSchema = z.object({
  baseSalaryOfMonth: z.number().describe("The base salary for a full month as per labor law."),
  totalHoursWorked: z.number().describe("Total regular hours worked by the employee in the month."),
  totalOvertimeHours: z.number().describe("Total overtime hours worked."),
  totalHolidayHours: z.number().describe("Total hours worked on official holidays or Fridays."),
  totalNightWorkHours: z.number().describe("Total hours worked during the night shift (22:00-06:00)."),
  
  // Multipliers from settings
  overtimeMultiplier: z.number().describe("Multiplier for overtime (e.g., 1.4)."),
  holidayWorkMultiplier: z.number().describe("Multiplier for holiday work (e.g., 1.9)."),
  nightWorkMultiplier: z.number().describe("Multiplier for night work (e.g., 1.35)."),

  // Allowances from settings
  housingAllowance: z.number().describe("Monthly housing allowance."),
  foodAllowance: z.number().describe("Monthly food allowance (bon kharobar)."),
  childAllowance: z.number().describe("Monthly child allowance (haghe olad) per child."),
  childrenCount: z.number().describe("The number of children the employee has."),

  // Deductions and Penalties
  insuranceDeductionPercentage: z.number().describe("Employee's share of insurance deduction percentage (e.g., 7)."),
  maxAllowedLateness: z.number().describe("Maximum allowed lateness in minutes before penalty."),
  latenessPenaltyAmount: z.number().describe("Deduction amount if lateness exceeds the allowed limit."),
  otherDeductions: z.number().describe("Any other deductions to be applied."),
  entryTime: z.string().describe("The employee's typical actual entry time in HH:MM format for a sample day to check for lateness."),
  defaultEntryTime: z.string().describe("The company's default entry time in HH:MM format."),
});
export type AutomatedPayrollCalculationInput = z.infer<typeof AutomatedPayrollCalculationInputSchema>;

// Output schema to provide a detailed breakdown of the payslip
const AutomatedPayrollCalculationOutputSchema = z.object({
  baseSalaryPay: z.number().describe("Calculated portion of base salary for hours worked."),
  overtimePay: z.number().describe("Total pay for overtime hours."),
  holidayPay: z.number().describe("Total pay for holiday work hours."),
  nightWorkPay: z.number().describe("Total pay for night work hours."),
  childAllowance: z.number().describe("Total calculated child allowance."),
  housingAllowance: z.number().describe("Housing allowance amount."),
  foodAllowance: z.number().describe("Food allowance amount."),
  
  grossPay: z.number().describe("Total earnings before any deductions (sum of all pays and allowances)."),
  
  insuranceDeduction: z.number().describe("Calculated insurance deduction amount."),
  taxDeduction: z.number().describe("Calculated progressive tax deduction amount."),
  latenessDeduction: z.number().describe("Deduction applied for being late."),
  
  netPay: z.number().describe("Final take-home pay after all deductions."),
});
export type AutomatedPayrollCalculationOutput = z.infer<typeof AutomatedPayrollCalculationOutputSchema>;


export async function automatedPayrollCalculation(input: AutomatedPayrollCalculationInput): Promise<AutomatedPayrollCalculationOutput> {
  return automatedPayrollCalculationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedPayrollCalculationPrompt',
  input: {schema: AutomatedPayrollCalculationInputSchema},
  output: {schema: AutomatedPayrollCalculationOutputSchema},
  prompt: `You are an expert Iranian payroll specialist. Your task is to calculate an employee's detailed monthly salary based on the provided data. Assume a standard 30-day month and 220 working hours per month for converting monthly salary to hourly rate.

**Calculation Steps:**

1.  **Calculate Hourly Rate:**
    *   Hourly Rate = \`baseSalaryOfMonth\` / 220.

2.  **Calculate Pay Components:**
    *   \`baseSalaryPay\` = \`totalHoursWorked\` * Hourly Rate.
    *   \`overtimePay\` = \`totalOvertimeHours\` * Hourly Rate * \`overtimeMultiplier\`.
    *   \`holidayPay\` = \`totalHolidayHours\` * Hourly Rate * \`holidayWorkMultiplier\`.
    *   \`nightWorkPay\` = \`totalNightWorkHours\` * Hourly Rate * \`nightWorkMultiplier\`.

3.  **Calculate Total Allowances:**
    *   Total \`childAllowance\` = \`childrenCount\` * \`childAllowance\`.
    *   \`housingAllowance\` and \`foodAllowance\` are fixed monthly amounts.

4.  **Calculate Gross Pay:**
    *   \`grossPay\` = \`baseSalaryPay\` + \`overtimePay\` + \`holidayPay\` + \`nightWorkPay\` + Total \`childAllowance\` + \`housingAllowance\` + \`foodAllowance\`.

5.  **Calculate Lateness Deduction:**
    *   Calculate the difference in minutes between the employee's 'entryTime' and the 'defaultEntryTime'.
    *   If this difference is positive and greater than 'maxAllowedLateness', then \`latenessDeduction\` is equal to \`latenessPenaltyAmount\`.
    *   Otherwise, \`latenessDeduction\` is 0.

6.  **Calculate Other Deductions:**
    *   \`insuranceDeduction\` = (\`baseSalaryPay\` + \`overtimePay\`) * (\`insuranceDeductionPercentage\` / 100).  (Insurance is often calculated on base + overtime).
    *   **Progressive Tax:** Calculate the monthly tax based on the estimated annual income (\`grossPay\` * 12).
        *   Annual Income up to 1,440,000,000 IRR is exempt.
        *   From 1,440,000,001 to 1,980,000,000 IRR is 10%.
        *   From 1,980,000,001 to 3,240,000,000 IRR is 15%.
        *   From 3,240,000,001 to 4,800,000,000 IRR is 20%.
        *   Over 4,800,000,000 IRR is 30%.
        *   Calculate the annual tax based on these brackets and then divide by 12 for the monthly \`taxDeduction\`.

7.  **Calculate Net Pay:**
    *   \`netPay\` = \`grossPay\` - (\`insuranceDeduction\` + \`taxDeduction\` + \`latenessDeduction\` + \`otherDeductions\`).

Return the final calculated values for all fields in the output schema.

**Input Data:**
\`\`\`json
{{{json input}}}
\`\`\`
`,
});

const automatedPayrollCalculationFlow = ai.defineFlow(
  {
    name: 'automatedPayrollCalculationFlow',
    inputSchema: AutomatedPayrollCalculationInputSchema,
    outputSchema: AutomatedPayrollCalculationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
