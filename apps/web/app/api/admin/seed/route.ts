// =============================================================================
// Admin Seed API — POST /api/admin/seed
// Seeds database with sample data based on requested preset:
//   - "python-fundamentals"
//   - "javascript-algorithms"
//   - "clean-wipe"
// =============================================================================
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '../verify';

export async function POST(req: Request) {
  const denied = await verifyAdmin();
  if (denied) return denied;

  let preset = 'python-fundamentals';
  try {
    const body = await req.json();
    if (body.preset) preset = body.preset;
  } catch {
    // fallback if no body provided
  }

  try {
    // -------------------------------------------------------------------------
    // PRESET: Clean Wipe
    // -------------------------------------------------------------------------
    if (preset === 'clean-wipe') {
      await prisma.submission.deleteMany({});
      await prisma.mCQ.deleteMany({});
      await prisma.problem.deleteMany({});
      await prisma.topic.deleteMany({});
      await prisma.course.deleteMany({});
      await prisma.user.deleteMany({
        where: {
          NOT: {
            email: 'polampallisaivardhan1423@gmail.com', // preserve super admin
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: '🧹 Successfully wiped all course material, problems, submissions, and non-admin users.',
        seeded: { courses: 0, topics: 0, mcqs: 0, problems: 0, users: 0 },
      });
    }

    // -------------------------------------------------------------------------
    // PRESET: JavaScript Algorithms
    // -------------------------------------------------------------------------
    if (preset === 'javascript-algorithms') {
      const course = await prisma.course.upsert({
        where: { slug: 'javascript-algorithms' },
        update: {},
        create: {
          name: 'JavaScript Algorithms',
          slug: 'javascript-algorithms',
          language: 'javascript',
          description: 'Master advanced data structures and core algorithmic logic in Modern JavaScript.',
          isPublished: true,
          order: 1,
        },
      });

      const topicsData = [
        {
          title: 'JavaScript Basics & Scopes',
          slug: 'js-basics',
          description: 'Understand let, const, block scoping, and template literals.',
          conceptHtml: '<h2 class="text-2xl font-bold mb-4">let vs const</h2><p class="mb-4">Use <code>const</code> by default, and <code>let</code> only when variables reassign.</p><pre class="bg-zinc-800 p-4 rounded-xl mb-6 overflow-x-auto"><code>const name = "Alice";\nlet score = 90;\nscore += 5;</code></pre><h2 class="text-2xl font-bold mb-4">Template Literals</h2><p>Use backticks for string interpolation: <code>`Hello, ${name}`</code></p>',
          videoUrl: 'https://www.youtube.com/watch?v=c-I5S_zTwAc',
          order: 0,
        },
        {
          title: 'Arrays & Functional Iteration',
          slug: 'js-arrays',
          description: 'Learn map, filter, and reduce arrays manipulation.',
          conceptHtml: '<h2 class="text-2xl font-bold mb-4">Array Mapping</h2><p class="mb-4">Transforms items in a list without mutation.</p><pre class="bg-zinc-800 p-4 rounded-xl mb-6 overflow-x-auto"><code>const doubled = [1, 2, 3].map(x => x * 2); // [2, 4, 6]</code></pre>',
          videoUrl: 'https://www.youtube.com/watch?v=R8rmfD9Y5-c',
          order: 1,
        },
        {
          title: 'Recursion Callstacks',
          slug: 'js-recursion',
          description: 'Understand base cases, recursive stacks, and mathematical factorials.',
          conceptHtml: '<h2 class="text-2xl font-bold mb-4">Recursion</h2><p class="mb-4">A function calling itself until hitting a base case.</p><pre class="bg-zinc-800 p-4 rounded-xl mb-6 overflow-x-auto"><code>function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}</code></pre>',
          videoUrl: 'https://www.youtube.com/watch?v=k7-N8R0-3xs',
          order: 2,
        },
      ];

      const topics = [];
      for (const t of topicsData) {
        const topic = await prisma.topic.upsert({
          where: { courseId_slug: { courseId: course.id, slug: t.slug } },
          update: { title: t.title, description: t.description, conceptHtml: t.conceptHtml, videoUrl: t.videoUrl, order: t.order },
          create: { courseId: course.id, ...t, isPublished: true },
        });
        topics.push(topic);
      }

      const mcqsByTopic = [
        // Basics
        [
          { question: 'Which keyword prevents reassignment?', options: ['const', 'let', 'var', 'def'], correctIndex: 0, explanation: 'const binds a value and prevents reassignment of the variable identifier.' },
          { question: 'What is block scope?', options: ['Variables isolated inside {}', 'Variables isolated inside functions', 'Global variables', 'None of these'], correctIndex: 0, explanation: 'let and const are block scoped, restricted to the closest enclosing curly braces {}' },
          { question: 'Which is correct string interpolation?', options: ['`Hello ${name}`', '"Hello ${name}"', "'Hello ${name}'", 'Hello + name'], correctIndex: 0, explanation: 'Template literals require backticks to interpolate variables.' },
        ],
        // Arrays
        [
          { question: 'Which method returns a new filtered array?', options: ['filter()', 'map()', 'forEach()', 'push()'], correctIndex: 0, explanation: 'filter() returns a new array with elements passing the logic check.' },
          { question: 'Does map() mutate the original array?', options: ['No', 'Yes', 'Depends on strict mode', 'Only in browser environments'], correctIndex: 0, explanation: 'map() is pure and does not mutate the original array.' },
          { question: 'What does reduce() do?', options: ['Reduces list to a single value', 'Deletes half the items', 'Combines two arrays', 'Sorts elements'], correctIndex: 0, explanation: 'reduce() accumulates all array values into a single resolved result.' },
        ],
        // Recursion
        [
          { question: 'What is a base case?', options: ['The termination condition', 'The starting input', 'An infinite loop catch', 'The function wrapper'], correctIndex: 0, explanation: 'A base case determines when a recursive function terminates.' },
          { question: 'What happens without a base case?', options: ['Maximum call stack size exceeded', 'Returns undefined', 'Wipes the disk', 'Runs successfully'], correctIndex: 0, explanation: 'An infinite loop of recursive calls triggers a call stack overflow error.' },
          { question: 'What is stack memory used for?', options: ['Tracking active function executions', 'Storing array indexes', 'Managing database transactions', 'Static image loading'], correctIndex: 0, explanation: 'Stack memory records active execution contexts and local parameter data.' },
        ],
      ];

      for (let i = 0; i < topics.length; i++) {
        const topic = topics[i]!;
        await prisma.mCQ.deleteMany({ where: { topicId: topic.id } });
        for (let j = 0; j < mcqsByTopic[i]!.length; j++) {
          const m = mcqsByTopic[i]![j]!;
          await prisma.mCQ.create({
            data: { topicId: topic.id, question: m.question, options: m.options, correctIndex: m.correctIndex, explanation: m.explanation, order: j },
          });
        }
      }

      const problemsByTopic = [
        // Basics
        [
          { title: 'Variable Addition', description: 'Create const first=10 and let second=20, add them and print the total.', starterCode: 'const first = 10;\nlet second = 20;\n// Print sum\n', solutionCode: 'const first = 10;\nlet second = 20;\nconsole.log(first + second);', difficulty: 'fill_blank', testCases: [{ input: '', expected: '30' }] },
          { title: 'Template Greeting', description: 'Make variable name="Bob" and console.log greeting formatted: Hello, Bob!', starterCode: 'const name = "Bob";\n// Log template string greeting\n', solutionCode: 'const name = "Bob";\nconsole.log(`Hello, ${name}!`);', difficulty: 'full_code', testCases: [{ input: '', expected: 'Hello, Bob!' }] },
          { title: 'Boolean Flip', description: 'Print the inverse of isOnline variable (which is false).', starterCode: 'const isOnline = false;\n// Print inverse\nconsole.log(!isOnline);', solutionCode: 'const isOnline = false;\nconsole.log(!isOnline);', difficulty: 'hard', testCases: [{ input: '', expected: 'true' }] },
        ],
        // Arrays
        [
          { title: 'Double Numbers Array', description: 'Print the map doubling result of [2, 4, 6].', starterCode: 'const nums = [2, 4, 6];\n// Log doubled array\nconsole.log(nums.map(x => x * 2));', solutionCode: 'const nums = [2, 4, 6];\nconsole.log(nums.map(x => x * 2));', difficulty: 'fill_blank', testCases: [{ input: '', expected: '[ 4, 8, 12 ]' }] },
          { title: 'Filter Odd Numbers', description: 'Log the array containing only even values from [1, 2, 3, 4, 5, 6].', starterCode: 'const items = [1, 2, 3, 4, 5, 6];\n// Log filtered list\n', solutionCode: 'const items = [1, 2, 3, 4, 5, 6];\nconsole.log(items.filter(x => x % 2 === 0));', difficulty: 'full_code', testCases: [{ input: '', expected: '[ 2, 4, 6 ]' }] },
          { title: 'Array Sum Accumulation', description: 'Use reduce to print sum of [10, 20, 30].', starterCode: 'const values = [10, 20, 30];\n// Log reduce total\n', solutionCode: 'const values = [10, 20, 30];\nconsole.log(values.reduce((a, b) => a + b, 0));', difficulty: 'hard', testCases: [{ input: '', expected: '60' }] },
        ],
        // Recursion
        [
          { title: 'Recursive Factorial', description: 'Implement recursive fact(n) function. Print fact(5).', starterCode: 'function fact(n) {\n  if (n <= 1) return 1;\n  return n * fact(n - 1);\n}\nconsole.log(fact(5));', solutionCode: 'function fact(n) {\n  if (n <= 1) return 1;\n  return n * fact(n - 1);\n}\nconsole.log(fact(5));', difficulty: 'fill_blank', testCases: [{ input: '', expected: '120' }] },
          { title: 'Recursive Countdown', description: 'Write countdown(n) logging numbers down to 1.', starterCode: 'function countdown(n) {\n  // Print countdown recursive\n}\ncountdown(3);', solutionCode: 'function countdown(n) {\n  if (n < 1) return;\n  console.log(n);\n  countdown(n - 1);\n}\ncountdown(3);', difficulty: 'full_code', testCases: [{ input: '', expected: '3\n2\n1' }] },
          { title: 'Recursive Power Checker', description: 'Implement power(base, exp) return base to power exp. Log power(2, 4).', starterCode: 'function power(base, exp) {\n  // recursion logic\n}\nconsole.log(power(2, 4));', solutionCode: 'function power(base, exp) {\n  if (exp === 0) return 1;\n  return base * power(base, exp - 1);\n}\nconsole.log(power(2, 4));', difficulty: 'hard', testCases: [{ input: '', expected: '16' }] },
        ],
      ];

      for (let i = 0; i < topics.length; i++) {
        const topic = topics[i]!;
        await prisma.problem.deleteMany({ where: { topicId: topic.id } });
        for (let j = 0; j < problemsByTopic[i]!.length; j++) {
          const p = problemsByTopic[i]![j]!;
          await prisma.problem.create({
            data: { topicId: topic.id, ...p, hints: [], language: 'javascript', order: j },
          });
        }
      }

      // Seed Sample JS Users
      const usersData = [
        { email: 'dan@codemaster.dev', name: 'Dan Abrams', age: 19, role: 'student' },
        { email: 'jenny@codemaster.dev', name: 'Jenny Miller', age: 15, role: 'student' },
      ];

      for (const u of usersData) {
        await prisma.user.upsert({
          where: { email: u.email },
          update: { name: u.name, age: u.age, role: u.role },
          create: { ...u, isMinor: u.age < 18 },
        });
      }

      return NextResponse.json({
        success: true,
        seeded: {
          courses: 1,
          topics: topics.length,
          mcqs: topics.length * 3,
          problems: topics.length * 3,
          users: usersData.length,
        },
      });
    }

    // -------------------------------------------------------------------------
    // DEFAULT PRESET: Python Fundamentals
    // -------------------------------------------------------------------------
    const course = await prisma.course.upsert({
      where: { slug: 'python-fundamentals' },
      update: {},
      create: {
        name: 'Python Fundamentals',
        slug: 'python-fundamentals',
        language: 'python',
        description: 'Master the basics of Python including Variables, Loops, Conditionals, and Functions.',
        isPublished: true,
        order: 0,
      },
    });

    const topicsData = [
      {
        title: 'Variables & Data Types',
        slug: 'variables-data-types',
        description: 'Learn about variables, strings, numbers, and booleans in Python.',
        conceptHtml: '<h2 class="text-2xl font-bold mb-4">Variables</h2><p class="mb-4">Variables store data. In Python, you don\'t need to declare a type.</p><pre class="bg-zinc-800 p-4 rounded-xl mb-6 overflow-x-auto"><code>name = "Alice"\nage = 25\nis_student = True</code></pre><h2 class="text-2xl font-bold mb-4">Data Types</h2><p><strong>str</strong> = text, <strong>int</strong> = whole number, <strong>float</strong> = decimal, <strong>bool</strong> = True/False</p>',
        videoUrl: 'https://www.youtube.com/watch?v=cQT33yu9pY8',
        order: 0,
      },
      {
        title: 'Loops in Python',
        slug: 'loops',
        description: 'Learn for and while loops with practical examples.',
        conceptHtml: '<h2 class="text-2xl font-bold mb-4">For Loop</h2><p class="mb-4">Used when you know how many times to repeat.</p><pre class="bg-zinc-800 p-4 rounded-xl mb-6 overflow-x-auto"><code>for i in range(5):\n    print(i)</code></pre><h2 class="text-2xl font-bold mb-4">While Loop</h2><p class="mb-4">Used when you want to repeat until a condition is false.</p><pre class="bg-zinc-800 p-4 rounded-xl mb-6 overflow-x-auto"><code>count = 0\nwhile count < 5:\n    print(count)\n    count += 1</code></pre>',
        videoUrl: 'https://www.youtube.com/watch?v=KWgYha0clzw',
        order: 1,
      },
      {
        title: 'Functions',
        slug: 'functions',
        description: 'Define reusable blocks of code with functions.',
        conceptHtml: '<h2 class="text-2xl font-bold mb-4">Defining Functions</h2><p class="mb-4">Use the <code>def</code> keyword to create a function.</p><pre class="bg-zinc-800 p-4 rounded-xl mb-6 overflow-x-auto"><code>def greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("Alice"))</code></pre><h2 class="text-2xl font-bold mb-4">Parameters & Return</h2><p>Functions can take parameters and return values using the <code>return</code> keyword.</p>',
        videoUrl: 'https://www.youtube.com/watch?v=9Os0o3wzS_I',
        order: 2,
      },
    ];

    const topics = [];
    for (const t of topicsData) {
      const topic = await prisma.topic.upsert({
        where: { courseId_slug: { courseId: course.id, slug: t.slug } },
        update: { title: t.title, description: t.description, conceptHtml: t.conceptHtml, videoUrl: t.videoUrl, order: t.order },
        create: { courseId: course.id, ...t, isPublished: true },
      });
      topics.push(topic);
    }

    const mcqsByTopic = [
      // Variables
      [
        { question: 'What type is the value 42 in Python?', options: ['int', 'str', 'float', 'bool'], correctIndex: 0, explanation: '42 is a whole number, which is an int (integer) in Python.' },
        { question: 'Which is a valid variable name?', options: ['my_var', '2name', 'my-var', 'class'], correctIndex: 0, explanation: 'Variable names can contain letters, numbers, and underscores. They cannot start with a number or use reserved words.' },
        { question: 'What does type("hello") return?', options: ["<class 'str'>", "<class 'int'>", "<class 'list'>", "<class 'bool'>"], correctIndex: 0, explanation: '"hello" is a string (str) in Python.' },
      ],
      // Loops
      [
        { question: 'What does range(5) generate?', options: ['0, 1, 2, 3, 4', '1, 2, 3, 4, 5', '0, 1, 2, 3, 4, 5', '1, 2, 3, 4'], correctIndex: 0, explanation: 'range(5) generates 0 through 4. The end value (5) is excluded.' },
        { question: 'Which loop to use when you know exact iterations?', options: ['for loop', 'while loop', 'do-while loop', 'repeat loop'], correctIndex: 0, explanation: 'A for loop is ideal when you know how many times to iterate.' },
        { question: 'What happens if you forget to increment a while counter?', options: ['Infinite loop', 'Runs once', 'Python auto-increments', 'Syntax error'], correctIndex: 0, explanation: 'Without incrementing, the condition stays True forever, creating an infinite loop.' },
      ],
      // Functions
      [
        { question: 'Which keyword defines a function?', options: ['def', 'func', 'function', 'define'], correctIndex: 0, explanation: 'Python uses the "def" keyword to define functions.' },
        { question: 'What does return do?', options: ['Sends a value back to the caller', 'Prints output', 'Stops the program', 'Creates a variable'], correctIndex: 0, explanation: 'return sends a value back to wherever the function was called from.' },
        { question: 'What happens if a function has no return statement?', options: ['Returns None', 'Returns 0', 'Throws an error', 'Returns empty string'], correctIndex: 0, explanation: 'Functions without return implicitly return None.' },
      ],
    ];

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i]!;
      await prisma.mCQ.deleteMany({ where: { topicId: topic.id } });
      for (let j = 0; j < mcqsByTopic[i]!.length; j++) {
        const m = mcqsByTopic[i]![j]!;
        await prisma.mCQ.create({
          data: { topicId: topic.id, question: m.question, options: m.options, correctIndex: m.correctIndex, explanation: m.explanation, order: j },
        });
      }
    }

    const problemsByTopic = [
      // Variables
      [
        { title: 'Swap Two Variables', description: 'Given two variables a=5 and b=10, swap their values and print both.', starterCode: 'a = 5\nb = 10\n# Swap a and b\n\nprint(a)\nprint(b)', solutionCode: 'a = 5\nb = 10\na, b = b, a\nprint(a)\nprint(b)', difficulty: 'fill_blank', testCases: [{ input: '', expected: '10\n5' }] },
        { title: 'String Concatenation', description: 'Create variables first_name and last_name, concatenate them with a space, and print the full name.', starterCode: 'first_name = "John"\nlast_name = "Doe"\n# Create full_name\n\nprint(full_name)', solutionCode: 'first_name = "John"\nlast_name = "Doe"\nfull_name = first_name + " " + last_name\nprint(full_name)', difficulty: 'full_code', testCases: [{ input: '', expected: 'John Doe' }] },
        { title: 'Type Checker', description: 'Write a program that prints the type of: 42, 3.14, "hello", True — each on a new line.', starterCode: '# Print the type of each value\nprint(type(42))\nprint(type(3.14))\nprint(type("hello"))\nprint(type(True))', solutionCode: 'print(type(42))\nprint(type(3.14))\nprint(type("hello"))\nprint(type(True))', difficulty: 'hard', testCases: [{ input: '', expected: "<class 'int'>\n<class 'float'>\n<class 'str'>\n<class 'bool'>" }] },
      ],
      // Loops
      [
        { title: 'Print 1 to 5', description: 'Use a for loop to print numbers 1 through 5.', starterCode: '# Print 1 to 5\nfor i in range(1, ___):\n    print(i)', solutionCode: 'for i in range(1, 6):\n    print(i)', difficulty: 'fill_blank', testCases: [{ input: '', expected: '1\n2\n3\n4\n5' }] },
        { title: 'Sum of 1 to 10', description: 'Calculate the sum of numbers 1 to 10 using a while loop. Print the total.', starterCode: 'total = 0\ni = 1\nwhile i <= 10:\n    total += i\n    i += 1\nprint(total)', solutionCode: 'total = 0\ni = 1\nwhile i <= 10:\n    total += i\n    i += 1\nprint(total)', difficulty: 'full_code', testCases: [{ input: '', expected: '55' }] },
        { title: 'FizzBuzz (1 to 20)', description: 'Print numbers 1 to 20. For multiples of 3 print "Fizz", multiples of 5 print "Buzz", both print "FizzBuzz".', starterCode: 'for i in range(1, 21):\n    if i % 15 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)', solutionCode: 'for i in range(1, 21):\n    if i % 15 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)', difficulty: 'hard', testCases: [{ input: '', expected: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz' }] },
      ],
      // Functions
      [
        { title: 'Double a Number', description: 'Write a function double(n) that returns n * 2. Print double(5).', starterCode: 'def double(n):\n    return ___\n\nprint(double(5))', solutionCode: 'def double(n):\n    return n * 2\n\nprint(double(5))', difficulty: 'fill_blank', testCases: [{ input: '', expected: '10' }] },
        { title: 'Max of Three', description: 'Write a function max_of_three(a, b, c) that returns the largest. Print max_of_three(3, 7, 2).', starterCode: 'def max_of_three(a, b, c):\n    # Your code here\n    pass\n\nprint(max_of_three(3, 7, 2))', solutionCode: 'def max_of_three(a, b, c):\n    return max(a, b, c)\n\nprint(max_of_three(3, 7, 2))', difficulty: 'full_code', testCases: [{ input: '', expected: '7' }] },
        { title: 'Fibonacci Generator', description: 'Write a function fibonacci(n) that prints the first n Fibonacci numbers. Call fibonacci(8).', starterCode: 'def fibonacci(n):\n    # Your code here\n    pass\n\nfibonacci(8)', solutionCode: 'def fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        print(a)\n        a, b = b, a + b\n\nfibonacci(8)', difficulty: 'hard', testCases: [{ input: '', expected: '0\n1\n1\n2\n3\n5\n8\n13' }] },
      ],
    ];

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i]!;
      await prisma.problem.deleteMany({ where: { topicId: topic.id } });
      for (let j = 0; j < problemsByTopic[i]!.length; j++) {
        const p = problemsByTopic[i]!.length > j ? problemsByTopic[i]![j]! : null;
        if (p) {
          await prisma.problem.create({
            data: { topicId: topic.id, ...p, hints: [], language: 'python', order: j },
          });
        }
      }
    }

    const usersData = [
      { email: 'alice@codemaster.dev', name: 'Alice Johnson', age: 16, role: 'student' },
      { email: 'bob@codemaster.dev', name: 'Bob Smith', age: 14, role: 'student' },
      { email: 'charlie@codemaster.dev', name: 'Charlie Brown', age: 22, role: 'student' },
      { email: 'diana@codemaster.dev', name: 'Diana Ross', age: 30, role: 'teacher' },
      { email: 'eve@codemaster.dev', name: 'Eve Williams', age: 12, role: 'student' },
    ];

    for (const u of usersData) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: { name: u.name, age: u.age, role: u.role },
        create: { ...u, isMinor: u.age < 18 },
      });
    }

    return NextResponse.json({
      success: true,
      seeded: {
        courses: 1,
        topics: topics.length,
        mcqs: topics.length * 3,
        problems: topics.length * 3,
        users: usersData.length,
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seeding failed: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
