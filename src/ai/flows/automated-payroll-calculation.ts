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
  entryTime: z.string().describe("The employee's entry time in HH:MM format."),
  exitTime: z.string().describe("The employee's exit time in HH:MM format."),
  overtimeHours: z.number().describe('The number of overtime hours the employee worked.'),
  holidayPay: z.number().describe('The amount of holiday pay the employee is entitled to.'),
  deductions: z.number().describe("The total amount of deductions from the employee's pay."),
});
export type AutomatedPayrollCalculationInput = z.infer<typeof AutomatedPayrollCalculationInputSchema>;

const AutomatedPayrollCalculationOutputSchema = z.object({
  hoursWorked: z.number().describe('The calculated number of regular hours the employee worked.'),
  grossPay: z.number().describe("The employee's gross pay before deductions."),
  netPay: z.number().describe("The employee's net pay after deductions."),
  overtimePay: z.number().describe('The amount of pay the employee earned from overtime hours.'),
});
export type AutomatedPayrollCalculationOutput = z.infer<typeof AutomatedPayrollCalculationOutputSchema>;

export async function automatedPayrollCalculation(input: AutomatedPayrollCalculationInput): Promise<AutomatedPayrollCalculationOutput> {
  return automatedPayrollCalculationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedPayrollCalculationPrompt',
  input: {schema: AutomatedPayrollCalculationInputSchema},
  output: {schema: AutomatedPayrollCalculationOutputSchema},
  prompt: `You are an expert payroll specialist. First, calculate the total hours worked based on the entry and exit times.
The time is in HH:MM format. The difference between exitTime and entryTime is the hoursWorked.

Then, calculate the employee's payroll based on the following information:

Hourly Rate: {{{hourlyRate}}}
Entry Time: {{{entryTime}}}
Exit Time: {{{exitTime}}}
Overtime Hours: {{{overtimeHours}}}
Holiday Pay: {{{holidayPay}}}
Deductions: {{{deductions}}}

- Calculate 'hoursWorked' from the entry and exit times.
- Gross Pay = (hoursWorked * hourlyRate) + holidayPay + overtimePay.
- Overtime Pay = overtimeHours * hourlyRate * 1.5 (assuming a 1.5x rate).
- Net Pay = Gross Pay - deductions.

Return the calculated hoursWorked, grossPay, netPay, and overtimePay.`,
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
