
'use server';
/**
 * @fileOverview A flow to export work entries to Google Sheets.
 *
 * - exportToSheet - A function that handles the export process.
 * - ExportToSheetInput - The input type for the exportToSheet function.
 * - ExportToSheetOutput - The return type for the exportToSheet function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import type { WorkEntry } from '@/types';

// Define the input schema for the work entries
const WorkEntrySchema = z.object({
  id: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  lunchBreak: z.number(),
  hourlyRate: z.number(),
  workHours: z.number(),
  earnings: z.number(),
  paid: z.boolean(),
});

const ExportToSheetInputSchema = z.array(WorkEntrySchema);
export type ExportToSheetInput = z.infer<typeof ExportToSheetInputSchema>;

const ExportToSheetOutputSchema = z.object({
  spreadsheetUrl: z.string().optional(),
});
export type ExportToSheetOutput = z.infer<typeof ExportToSheetOutputSchema>;

async function getAuth() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  return client;
}

export async function exportToSheet(input: ExportToSheetInput): Promise<ExportToSheetOutput> {
  return exportToSheetFlow(input);
}

const exportToSheetFlow = ai.defineFlow(
  {
    name: 'exportToSheetFlow',
    inputSchema: ExportToSheetInputSchema,
    outputSchema: ExportToSheetOutputSchema,
  },
  async (entries) => {
    try {
      const auth = await getAuth();
      const sheets = google.sheets({ version: 'v4', auth });

      const spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `TimeWise Paid Work Log Export - ${new Date().toLocaleString()}`,
          },
        },
      });

      const spreadsheetId = spreadsheet.data.spreadsheetId;
      if (!spreadsheetId) {
        throw new Error('Failed to create spreadsheet.');
      }

      const headers = [
        'Date',
        'Start Time',
        'End Time',
        'Lunch Break (min)',
        'Work Hours',
        'Hourly Rate ($)',
        'Earnings ($)',
      ];

      const rows = entries.map((entry) => [
        entry.date,
        entry.startTime,
        entry.endTime,
        entry.lunchBreak,
        entry.workHours,
        entry.hourlyRate,
        entry.earnings,
      ]);

      const data = [headers, ...rows];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: data,
        },
      });

      return {
        spreadsheetUrl: spreadsheet.data.spreadsheetUrl,
      };
    } catch (error) {
      console.error('Error exporting to Google Sheets:', error);
      // In a real app, you might want to throw a more specific error
      // or handle it in a way that provides more context to the user.
      throw new Error('Failed to export to Google Sheets.');
    }
  }
);
