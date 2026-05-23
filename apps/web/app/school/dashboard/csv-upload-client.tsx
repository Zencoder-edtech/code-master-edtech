// =============================================================================
// CSV Upload Client — School Bulk Student Import (Client Component)
// =============================================================================
// Interactive client component for the school dashboard that allows teachers
// to bulk-import students by uploading a CSV file.
//
// CSV Format Expected:
//   name, email/phone, age
//   Alex S., alex@school.edu, 12
//   Becca T., becca@school.edu, 14
//
// Upload Flow:
//   1. Teacher selects a .csv file via the file picker
//   2. Client-side parses the CSV into structured student objects
//   3. Sends parsed data to POST /api/school/bulk-create
//   4. Shows success/error feedback
//
// Also provides a "Download Consent Report" button that opens
// GET /api/school/consent-report?schoolId=... in a new tab.
// =============================================================================

'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, Download, CheckCircle, AlertTriangle } from 'lucide-react';

interface CSVUploadClientProps {
  schoolId: string;
}

export default function CSVUploadClient({ schoolId }: CSVUploadClientProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]!);
      setStatus('idle'); // Reset status on new file
    }
  };

  const processCSV = async () => {
    if (!file) return;

    setIsUploading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const text = await file.text();
      // Basic CSV Parse (supports comma separated, respects newlines)
      // Expecting cols: name, email/phone, age
      const rows = text.split('\n').map(row => row.trim()).filter(row => row.length > 0);
      
      // Assume first row might be headers
      const dataRows = (rows[0] ?? '').toLowerCase().includes('name') ? rows.slice(1) : rows;

      const students = dataRows.map(row => {
        // split by comma, handling potential spaces
        const cols = row.split(',').map(c => c.trim());
        return {
          name: cols[0] || '',
          contact: cols[1] || '',
          age: parseInt(cols[2] || '0', 10),
        };
      }).filter(s => s.name && s.contact); // require basic validation

      if (students.length === 0) {
        throw new Error("No valid student data found in the CSV. Make sure you use format: name, email/phone, age");
      }

      // Send to server action / api
      const response = await fetch('/api/school/bulk-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schoolId,
          students,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload students');
      }

      setStatus('success');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (err: unknown) {
      console.error(err);
      setStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during parsing.';
      setErrorMessage(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadConsentReport = async () => {
    try {
      // In a real app we'd fetch this from the database via an API route
      // For MVP, we will hit an endpoint that generates a CSV of users for this School ID
      window.open(`/api/school/consent-report?schoolId=${schoolId}`, '_blank');
    } catch (error) {
      console.error('Error downloading report', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="bg-zinc-950 border border-zinc-800 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center">
        <div className="h-16 w-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-4">
          <UploadCloud className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-medium mb-1">Upload Class List</h3>
        <p className="text-zinc-400 text-sm mb-6 max-w-md">
          Upload a CSV file containing <span className="font-semibold text-zinc-300">name, email/phone, and age</span>. We&apos;ll auto-create their verified accounts.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            id="csv-upload"
          />
          <label htmlFor="csv-upload">
            <Button variant="outline" className="cursor-pointer" asChild>
              <span>{file ? file.name : "Choose CSV File"}</span>
            </Button>
          </label>
          <Button 
            onClick={processCSV} 
            disabled={!file || isUploading}
            className="w-full sm:w-auto"
          >
            {isUploading ? "Processing..." : "Upload & Create Accounts"}
          </Button>
        </div>

        {status === 'success' && (
          <div className="mt-6 flex items-center text-green-500 bg-green-500/10 px-4 py-3 rounded-lg text-sm">
            <CheckCircle className="h-5 w-5 mr-2" />
            Students successfully imported & accounts created!
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6 flex items-center text-red-500 bg-red-500/10 px-4 py-3 rounded-lg text-sm">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {errorMessage}
          </div>
        )}
      </div>

      {/* Action Divider */}
      <div className="h-px bg-zinc-800 w-full" />

      {/* Reports Section */}
      <div className="flex items-center justify-between bg-blue-600/10 border border-blue-500/20 rounded-xl p-6">
        <div>
          <h4 className="text-blue-100 font-medium mb-1">Bulk Consent Report</h4>
          <p className="text-blue-200/60 text-sm">Download a verified list of students with parental consent (DPDP compliant).</p>
        </div>
        <Button onClick={handleDownloadConsentReport} className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg">
          <Download className="h-4 w-4 mr-2" />
          Download CSV
        </Button>
      </div>
    </div>
  );
}
