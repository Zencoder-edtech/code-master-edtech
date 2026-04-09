// =============================================================================
// Python Loops — Seed Data for Topic: "Loops in Python"
// =============================================================================
// This file contains hardcoded topic data used during development.
// In production, this data will live in Supabase and be fetched via the
// TopicRepository. For now, importing this directly avoids the need for
// a database query while we build the UI.
//
// Structure:
//   topic     — title, description, concept HTML, optional video
//   mcqs[]    — 3 multiple-choice questions with explanations
//   problems[] — 3 coding problems (easy → medium → hard)
// =============================================================================

import type { Topic, MCQ, Problem } from '@/types/learn';

// ---------------------------------------------------------------------------
// Topic Metadata + Concept Content
// The conceptHtml is rendered directly in the Concept tab using
// dangerouslySetInnerHTML. Keep it simple HTML for now.
// ---------------------------------------------------------------------------
export const pythonLoopsTopic: Topic = {
  id: 'loops-001',
  title: 'Loops in Python',
  description: 'Learn for, while loops with practical examples',
  conceptHtml: `
    <h2 class="text-2xl font-bold mb-4">For Loop</h2>
    <p class="mb-4">Used when you know how many times to repeat.</p>
    <pre class="bg-zinc-800 p-4 rounded-xl mb-6 overflow-x-auto"><code>for i in range(5):
    print(i)</code></pre>

    <h2 class="text-2xl font-bold mb-4">While Loop</h2>
    <p class="mb-4">Used when you want to repeat until a condition is false.</p>
    <pre class="bg-zinc-800 p-4 rounded-xl mb-6 overflow-x-auto"><code>count = 0
while count < 5:
    print(count)
    count += 1</code></pre>

    <h2 class="text-2xl font-bold mb-4">Key Difference</h2>
    <p><strong>for</strong> = known iterations. <strong>while</strong> = unknown iterations (repeat until condition fails).</p>
  `,
  videoUrl: 'https://www.youtube.com/embed/dEsEaJGYAZM', // placeholder
};

// ---------------------------------------------------------------------------
// MCQs — 3 Multiple Choice Questions
// Each has 4 options with exactly one correct answer.
// explanation is shown after the student selects an answer.
// ---------------------------------------------------------------------------
export const pythonLoopsMCQs: MCQ[] = [
  {
    id: 'mcq-1',
    question: 'What does range(5) generate?',
    options: [
      { text: '0, 1, 2, 3, 4', isCorrect: true },
      { text: '1, 2, 3, 4, 5', isCorrect: false },
      { text: '0, 1, 2, 3, 4, 5', isCorrect: false },
      { text: '1, 2, 3, 4', isCorrect: false },
    ],
    explanation:
      'range(5) generates numbers from 0 to 4 (5 is excluded). In Python, ranges always start at 0 by default.',
  },
  {
    id: 'mcq-2',
    question: 'Which loop should you use when you know the exact number of iterations?',
    options: [
      { text: 'for loop', isCorrect: true },
      { text: 'while loop', isCorrect: false },
      { text: 'do-while loop', isCorrect: false },
      { text: 'repeat loop', isCorrect: false },
    ],
    explanation:
      'A for loop is used when you know how many times to iterate (e.g., for i in range(10)). A while loop is used when the number of iterations depends on a condition.',
  },
  {
    id: 'mcq-3',
    question: 'What happens if you forget to increment the counter in a while loop?',
    options: [
      { text: 'Infinite loop — the program never stops', isCorrect: true },
      { text: 'The loop runs once', isCorrect: false },
      { text: 'Python auto-increments it', isCorrect: false },
      { text: 'Syntax error', isCorrect: false },
    ],
    explanation:
      'If the counter never changes, the while condition stays True forever, causing an infinite loop. Always update your loop variable!',
  },
];

// ---------------------------------------------------------------------------
// Problems — 3 Coding Challenges (easy → medium → hard)
// starterCode: pre-filled in the editor for the student to complete
// testCases: used to validate the student's output against expected results
// ---------------------------------------------------------------------------
export const pythonLoopsProblems: Problem[] = [
  {
    id: 'prob-1',
    title: 'Print numbers 1 to 5',
    description:
      'Use a for loop with range() to print numbers 1 through 5, each on a new line.',
    starterCode: '# Print numbers 1 to 5 using a for loop\nfor i in range(1, ___):\n    print(i)',
    difficulty: 'easy',
    testCases: [{ input: '', expected: '1\n2\n3\n4\n5' }],
  },
  {
    id: 'prob-2',
    title: 'Sum of first N numbers',
    description:
      'Write a program that calculates the sum of numbers from 1 to 10 using a while loop. Print only the final sum.',
    starterCode:
      '# Calculate sum of 1 to 10 using a while loop\ntotal = 0\ni = 1\nwhile i <= 10:\n    total += i\n    i += 1\nprint(total)',
    difficulty: 'medium',
    testCases: [{ input: '', expected: '55' }],
  },
  {
    id: 'prob-3',
    title: 'FizzBuzz (1 to 20)',
    description:
      'Print numbers 1 to 20. For multiples of 3, print "Fizz". For multiples of 5, print "Buzz". For multiples of both, print "FizzBuzz".',
    starterCode:
      '# FizzBuzz: 1 to 20\nfor i in range(1, 21):\n    if i % 15 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)',
    difficulty: 'hard',
    testCases: [
      {
        input: '',
        expected:
          '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz',
      },
    ],
  },
];