// =============================================================================
// SubmitCodeUseCase — Application Layer Use Case
// =============================================================================
// Handles the end-to-end flow of a student submitting code for a problem:
//   1. Creates a PENDING submission record
//   2. Sends the code to Judge0 for execution
//   3. Updates the submission with the result (ACCEPTED / WRONG_ANSWER / ERROR)
//   4. Returns the execution output to the caller
//
// Dependencies (injected via constructor):
//   submissionRepo — saves and updates submission records in the database
//   judge0Client   — executes code on the Judge0 engine
//
// Judge0 Status Codes:
//   3 = Accepted (code ran successfully)
//   Other = Wrong Answer, Runtime Error, Time Limit Exceeded, etc.
//
// Note: Currently not imported by the web app. The learn page calls
// /api/execute directly for MVP simplicity.
// =============================================================================

/** Interface for the submission repository */
interface SubmissionRepo {
  create(data: {
    userId: string;
    problemId: string;
    code: string;
  }): Promise<{ id: string }>;
  update(
    id: string,
    data: { status: string; output: string }
  ): Promise<void>;
}

/** Interface for the code execution client */
interface Judge0Client {
  submit(payload: {
    source_code: string;
    language_id: number;
    stdin: string;
  }): Promise<{
    status: { id: number };
    stdout: string | null;
    stderr: string | null;
  }>;
}

export class SubmitCodeUseCase {
  constructor(
    private submissionRepo: SubmissionRepo,
    private judge0Client: Judge0Client
  ) {}

  /**
   * Submits code for execution and records the result.
   * @param userId    — the authenticated user's ID
   * @param problemId — the ID of the problem being solved
   * @param code      — the student's source code
   * @returns The execution status and output
   */
  async execute(
    userId: string,
    problemId: string,
    code: string
  ): Promise<{ status: string; output: string }> {
    // Step 1: Save a pending submission to the database
    const submission = await this.submissionRepo.create({
      userId,
      problemId,
      code,
    });

    // Step 2: Send code to Judge0 for execution
    const result = await this.judge0Client.submit({
      source_code: code,
      language_id: 71, // Python 3
      stdin: '', // TODO: add test case input
    });

    // Step 3: Determine status from Judge0 response
    // Status ID 3 = "Accepted" (successful execution)
    const status = result.status.id === 3 ? 'ACCEPTED' : 'WRONG_ANSWER';
    const output = result.stdout ?? result.stderr ?? 'No output';

    // Step 4: Update the submission record with results
    await this.submissionRepo.update(submission.id, { status, output });

    return { status, output };
  }
}