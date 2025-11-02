'use server';

/**
 * @fileOverview An automated payroll calculation AI agent.
 *
 * - automatedPayrollCalculation - A function that handles the payroll calculation process.
 * - AutomatedPayrollCalculationInput - The input type for the automatedPayrollCalculation function.
 * - AutomatedPayrollCalculationOutput - The return type for the automatedPayrollCalculation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomatedPayrollCalculationInputSchema = z.object({
  hourlyRate: z.number().describe("The employee's hourly rate."),
  defaultEntryTime: z.string().describe("The company's default entry time in HH:MM format."),
  entryTime: z.string().describe("The employee's actual entry time in HH:MM format."),
  exitTime: z.string().describe("The employee's exit time in HH:MM format."),
  overtimeHours: z.number().describe('The number of overtime hours the employee worked.'),
  overtimeMultiplier: z.number().describe('The multiplier for overtime pay (e.g., 1.4 or 1.5).'),
  holidayPay: z.number().describe('The amount of holiday pay the employee is entitled to.'),
  deductions: z.number().describe("The total amount of other deductions from the employee's pay."),
  maxAllowedLateness: z.number().describe("Maximum allowed lateness in minutes before a penalty is applied."),
  latenessPenaltyAmount: z.number().describe("The deduction amount if the employee is late beyond the allowed minutes."),
});
export type AutomatedPayrollCalculationInput = z.infer<typeof AutomatedPayrollCalculationInputSchema>;

const AutomatedPayrollCalculationOutputSchema = z.object({
  hoursWorked: z.number().describe('The calculated number of regular hours the employee worked.'),
  grossPay: z.number().describe("The employee's gross pay before deductions."),
  netPay: z.number().describe("The employee's net pay after deductions."),
  overtimePay: z.number().describe('The amount of pay the employee earned from overtime hours.'),
  latenessDeduction: z.number().describe('The deduction applied for being late.'),
});
export type AutomatedPayrollCalculationOutput = z.infer<typeof AutomatedPayrollCalculationOutputSchema>;

export async function automatedPayrollCalculation(input: AutomatedPayrollCalculationInput): Promise<AutomatedPayrollCalculationOutput> {
  return automatedPayrollCalculationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedPayrollCalculationPrompt',
  input: {schema: AutomatedPayrollCalculationInputSchema},
  output: {schema: AutomatedPayrollCalculationOutputSchema},
  prompt: `You are an expert payroll specialist. Your task is to calculate an employee's pay based on the provided data.

Follow these steps precisely:
1.  **Calculate Hours Worked**: Determine the total hours worked based on the difference between 'entryTime' and 'exitTime'.
2.  **Calculate Lateness**:
    a. Find the difference in minutes between the employee's 'entryTime' and the 'defaultEntryTime'.
    b. If this difference is positive and greater than 'maxAllowedLateness', the employee is late. The 'latenessDeduction' is equal to 'latenessPenaltyAmount'.
    c. Otherwise, 'latenessDeduction' is 0.
3.  **Calculate Overtime Pay**: Overtime Pay = overtimeHours * hourlyRate * overtimeMultiplier.
4.  **Calculate Gross Pay**: Gross Pay = (hoursWorked * hourlyRate) + holidayPay + Overtime Pay.
5.  **Calculate Net Pay**: Net Pay = Gross Pay - other 'deductions' - 'latenessDeduction'.

Return the final calculated values for hoursWorked, grossPay, netPay, overtimePay, and latenessDeduction.

Here is the data:
Hourly Rate: {{{hourlyRate}}}
Default Entry Time: {{{defaultEntryTime}}}
Actual Entry Time: {{{entryTime}}}
Exit Time: {{{exitTime}}}
Overtime Hours: {{{overtimeHours}}}
Overtime Multiplier: {{{overtimeMultiplier}}}
Holiday Pay: {{{holidayPay}}}
Other Deductions: {{{deductions}}}
Max Allowed Lateness (minutes): {{{maxAllowedLateness}}}
Lateness Penalty Amount: {{{latenessPenaltyAmount}}}
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
