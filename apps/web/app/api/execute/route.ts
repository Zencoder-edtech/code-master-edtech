// =============================================================================
// Judge0 Code Execution API Route — POST /api/execute
// =============================================================================
// This server-side API route proxies code execution requests to the Judge0
// engine running on the user's Oracle Cloud VM.
//
// Why a server-side route?
//   - Keeps the JUDGE0_URL secret (not exposed to the browser)
//   - Allows us to add rate limiting, auth checks, and logging later
//   - The browser only sees /api/execute, not the raw VM IP
//
// Request body:
//   { code: string, language_id?: number }
//   language_id defaults to 71 (Python 3)
//
// Response:
//   { stdout, stderr, status, compile_output }
//
// Judge0 ?wait=true:
//   Makes Judge0 wait until execution is complete before responding,
//   so we don't need to implement polling logic. Simpler for MVP.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';

const JUDGE0_URL = process.env.JUDGE0_URL;

export async function POST(request: NextRequest) {
  // Validate that JUDGE0_URL is configured
  if (!JUDGE0_URL) {
    return NextResponse.json(
      {
        stdout: null,
        stderr: 'Judge0 is not configured. Set JUDGE0_URL in your environment.',
        status: { id: 0, description: 'Configuration Error' },
        compile_output: null,
      },
      { status: 503 }
    );
  }

  try {
    // Parse the incoming request body
    const { code, language_id = 71 } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        {
          stdout: null,
          stderr: 'No code provided',
          status: { id: 0, description: 'Bad Request' },
          compile_output: null,
        },
        { status: 400 }
      );
    }

    // Submit to Judge0 with ?wait=true for synchronous execution
    // base64_encoded=false means we send plain text source code
    const judge0Response = await fetch(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_code: code,
          language_id,
          stdin: '',
        }),
      }
    );

    if (!judge0Response.ok) {
      return NextResponse.json(
        {
          stdout: null,
          stderr: `Judge0 returned ${judge0Response.status}: ${judge0Response.statusText}`,
          status: { id: 0, description: 'Judge0 Error' },
          compile_output: null,
        },
        { status: 502 }
      );
    }

    // Return the Judge0 result directly to the client
    const result = await judge0Response.json();

    return NextResponse.json({
      stdout: result.stdout ?? null,
      stderr: result.stderr ?? null,
      status: result.status ?? { id: 0, description: 'Unknown' },
      compile_output: result.compile_output ?? null,
    });
  } catch {
    return NextResponse.json(
      {
        stdout: null,
        stderr: 'Failed to execute code. Please try again.',
        status: { id: 0, description: 'Internal Error' },
        compile_output: null,
      },
      { status: 500 }
    );
  }
}
