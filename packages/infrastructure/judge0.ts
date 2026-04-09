// =============================================================================
// Judge0 Client — Code Execution Engine Integration
// =============================================================================
// This module provides a simple client for communicating with the Judge0 CE
// code execution engine running on the user's Oracle Cloud VM.
//
// How it works:
//   1. Sends a POST to /submissions with source code and language ID
//   2. Uses ?wait=true so Judge0 waits for execution to finish
//   3. Returns the result (stdout, stderr, status, compile_output)
//
// Language IDs (Judge0):
//   71 = Python 3
//   63 = JavaScript (Node.js)
//   54 = C++
//   62 = Java
//
// Note: This is in packages/infrastructure/ and is NOT currently used
// by the web app. The web app has its own API route (app/api/execute/route.ts)
// that handles Judge0 communication server-side.
// =============================================================================

const JUDGE0_URL = process.env.JUDGE0_URL ?? '';

/** Payload sent to Judge0 for code execution */
interface SubmissionPayload {
  source_code: string;
  language_id: number;
  stdin?: string;
}

/** Result returned from Judge0 after execution */
interface SubmissionResult {
  stdout: string | null;
  stderr: string | null;
  status: { id: number; description: string };
  compile_output: string | null;
  time: string | null;
  memory: number | null;
}

export const judge0Client = {
  /**
   * Submit code for execution and wait for results.
   * Uses ?wait=true to avoid polling.
   *
   * @param payload — source code, language ID, and optional stdin
   * @returns The execution result from Judge0
   */
  async submit(payload: SubmissionPayload): Promise<SubmissionResult> {
    if (!JUDGE0_URL) {
      throw new Error('JUDGE0_URL environment variable is not set');
    }

    // Submit with wait=true for synchronous execution
    const res = await fetch(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      throw new Error(`Judge0 error: ${res.status} ${res.statusText}`);
    }

    return res.json();
  },
};