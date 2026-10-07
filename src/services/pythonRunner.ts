import { ExecutionResult } from '../types';

export class PythonRunner {
  /**
   * Executes Python code inside the local client sandbox.
   * Emulates Python 3 runtime, NumPy arrays, Pandas DataFrames, and Matplotlib plotting.
   */
  public static async executeCode(
    code: string,
    testAssertions?: {
      description: string;
      expectedOutputSubstring?: string;
      testAssertionCode?: string;
    }[]
  ): Promise<ExecutionResult> {
    const startTime = performance.now();
    const stdoutLines: string[] = [];
    const stderrLines: string[] = [];
    let chartOutput: ExecutionResult['chartOutput'] = undefined;

    try {
      // Clean and normalize lines
      const lines = code.split('\n');

      // Environment state
      const scope: Record<string, unknown> = {};

      // Simulated modules
      const simulatedNp = {
        array: (arr: number[]) => ({
          _type: 'ndarray',
          data: arr,
          shape: [arr.length],
          sum: () => arr.reduce((a, b) => a + b, 0),
          mean: () => arr.reduce((a, b) => a + b, 0) / arr.length,
          min: () => Math.min(...arr),
          max: () => Math.max(...arr),
          toString: () => `array([${arr.join(', ')}])`,
        }),
        mean: (arr: number[] | { data: number[] }) => {
          const list = Array.isArray(arr) ? arr : arr.data;
          return list.reduce((a, b) => a + b, 0) / list.length;
        },
        sum: (arr: number[] | { data: number[] }) => {
          const list = Array.isArray(arr) ? arr : arr.data;
          return list.reduce((a, b) => a + b, 0);
        },
        std: (arr: number[] | { data: number[] }) => {
          const list = Array.isArray(arr) ? arr : arr.data;
          const avg = list.reduce((a, b) => a + b, 0) / list.length;
          const variance = list.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / list.length;
          return Math.sqrt(variance);
        },
      };

      const simulatedPd = {
        DataFrame: (data: Record<string, unknown[]>) => {
          const columns = Object.keys(data);
          const rowCount = columns.length > 0 ? (data[columns[0]]?.length || 0) : 0;
          return {
            _type: 'DataFrame',
            columns,
            data,
            shape: [rowCount, columns.length],
            head: (n = 5) => {
              const rows: (string | number)[][] = [];
              for (let i = 0; i < Math.min(n, rowCount); i++) {
                rows.push(columns.map((col) => (data[col] as (string | number)[])[i] ?? ''));
              }
              return { columns, rows };
            },
            describe: () => {
              return `Data Summary: ${rowCount} rows, ${columns.length} columns: [${columns.join(', ')}]`;
            },
            fillna: (val: unknown) => {
              const cleaned: Record<string, unknown[]> = {};
              columns.forEach((col) => {
                cleaned[col] = (data[col] || []).map((v) => (v === null || v === undefined || v === 'NaN' || Number.isNaN(v) ? val : v));
              });
              return simulatedPd.DataFrame(cleaned);
            },
            toString: () => {
              let res = columns.join(' | ') + '\n' + columns.map(() => '---').join(' | ') + '\n';
              for (let i = 0; i < Math.min(5, rowCount); i++) {
                res += columns.map((col) => String((data[col] as unknown[])[i])).join(' | ') + '\n';
              }
              return res.trim();
            },
          };
        },
      };

      const currentPlot = {
        title: 'PyQuest Chart Output',
        type: 'bar' as 'bar' | 'line' | 'scatter' | 'table',
        labels: [] as string[],
        values: [] as number[],
      };

      const simulatedPlt = {
        title: (t: string) => {
          currentPlot.title = t;
        },
        xlabel: () => {},
        ylabel: () => {},
        bar: (x: string[] | number[], y: number[]) => {
          currentPlot.type = 'bar';
          currentPlot.labels = (x || []).map(String);
          currentPlot.values = y || [];
        },
        plot: (x: string[] | number[], y: number[]) => {
          currentPlot.type = 'line';
          currentPlot.labels = (x || []).map(String);
          currentPlot.values = y || [];
        },
        scatter: (x: number[], y: number[]) => {
          currentPlot.type = 'scatter';
          currentPlot.labels = (x || []).map(String);
          currentPlot.values = y || [];
        },
        show: () => {
          if (currentPlot.labels.length > 0 || currentPlot.values.length > 0) {
            chartOutput = {
              type: currentPlot.type,
              title: currentPlot.title,
              labels: [...currentPlot.labels],
              values: [...currentPlot.values],
            };
          }
        },
      };

      // Built-in print emulator
      const customPrint = (...args: unknown[]) => {
        const text = args
          .map((arg) => {
            if (arg === null) return 'None';
            if (arg === undefined) return 'None';
            if (typeof arg === 'boolean') return arg ? 'True' : 'False';
            if (typeof arg === 'object' && arg !== null) {
              if ('_type' in arg && (arg as { _type: string })._type === 'DataFrame') {
                return (arg as { toString: () => string }).toString();
              }
              if ('_type' in arg && (arg as { _type: string })._type === 'ndarray') {
                return (arg as { toString: () => string }).toString();
              }
            }
            return String(arg);
          })
          .join(' ');
        stdoutLines.push(text);
      };

      // Python execution loop
      let inForLoop = false;
      let loopVar = '';
      let loopItems: unknown[] = [];
      let loopBody: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip blank lines & comments
        if (!trimmed || trimmed.startsWith('#')) {
          continue;
        }

        // For loop start: e.g. "for i in range(5):" or "for item in items:"
        const forMatch = trimmed.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+(.+):$/);
        if (forMatch) {
          inForLoop = true;
          loopVar = forMatch[1];
          const iterableExpr = forMatch[2];

          if (iterableExpr.startsWith('range(') && iterableExpr.endsWith(')')) {
            const rangeArg = iterableExpr.slice(6, -1).trim();
            const count = parseInt(rangeArg, 10) || 5;
            loopItems = Array.from({ length: count }, (_, idx) => idx);
          } else {
            // resolve variable
            const items = scope[iterableExpr] || [];
            loopItems = Array.isArray(items) ? items : [0, 1, 2];
          }
          loopBody = [];
          continue;
        }

        // If in for loop, collect indented body
        if (inForLoop) {
          if (line.startsWith('    ') || line.startsWith('\t')) {
            loopBody.push(line.trim());
            // If it's the last line of the file, execute loop
            if (i === lines.length - 1) {
              executeLoop();
            }
            continue;
          } else {
            // Finished loop body, execute it
            executeLoop();
            inForLoop = false;
          }
        }

        // Helper to execute collected loop body
        function executeLoop() {
          for (const item of loopItems) {
            scope[loopVar] = item;
            for (const bodyLine of loopBody) {
              executeSingleStatement(bodyLine);
            }
          }
        }

        executeSingleStatement(trimmed);
      }

      function executeSingleStatement(stmt: string) {
        // Handle imports
        if (stmt.startsWith('import ') || stmt.startsWith('from ')) {
          if (stmt.includes('numpy')) scope['np'] = simulatedNp;
          if (stmt.includes('pandas')) scope['pd'] = simulatedPd;
          if (stmt.includes('matplotlib')) scope['plt'] = simulatedPlt;
          return;
        }

        // Handle plt.show()
        if (stmt.startsWith('plt.show(')) {
          simulatedPlt.show();
          return;
        }

        // Handle plt.bar(...), plt.plot(...), plt.title(...)
        const pltCall = stmt.match(/^plt\.([a-zA-Z]+)\((.*)\)$/);
        if (pltCall) {
          const method = pltCall[1];
          const rawArgs = pltCall[2];
          if (method === 'title') {
            simulatedPlt.title(rawArgs.replace(/['"]/g, ''));
          } else if (method === 'bar' || method === 'plot' || method === 'scatter') {
            const parts = splitArgs(rawArgs);
            const xVal = evalPyExpression(parts[0], scope);
            const yVal = evalPyExpression(parts[1], scope);
            if (method === 'bar') simulatedPlt.bar(xVal as string[], yVal as number[]);
            if (method === 'plot') simulatedPlt.plot(xVal as string[], yVal as number[]);
            if (method === 'scatter') simulatedPlt.scatter(xVal as number[], yVal as number[]);
          }
          return;
        }

        // Handle print(...)
        const printMatch = stmt.match(/^print\((.*)\)$/);
        if (printMatch) {
          const rawInside = printMatch[1];
          const args = splitArgs(rawInside).map((arg) => evalPyExpression(arg.trim(), scope));
          customPrint(...args);
          return;
        }

        // Handle assignments: var_name = expression
        const assignMatch = stmt.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
        if (assignMatch) {
          const varName = assignMatch[1];
          const expr = assignMatch[2];
          const value = evalPyExpression(expr, scope);
          scope[varName] = value;
          return;
        }

        // Handle function call or expression
        evalPyExpression(stmt, scope);
      }

      // Check test assertions if provided
      let passedCount = 0;
      const totalCount = testAssertions?.length || 0;

      if (testAssertions && testAssertions.length > 0) {
        testAssertions.forEach((tc) => {
          let testPassed = false;
          const joinedStdout = stdoutLines.join('\n');

          if (tc.expectedOutputSubstring) {
            if (joinedStdout.toLowerCase().includes(tc.expectedOutputSubstring.toLowerCase())) {
              testPassed = true;
            }
          }

          if (tc.testAssertionCode) {
            try {
              const res = evalPyExpression(tc.testAssertionCode, scope);
              if (res === true || res === 'True') testPassed = true;
            } catch {
              // failed
            }
          }

          if (testPassed) {
            passedCount++;
          }
        });
      }

      const executionTimeMs = Math.round(performance.now() - startTime);

      return {
        success: stderrLines.length === 0,
        stdout: stdoutLines.join('\n'),
        stderr: stderrLines.join('\n'),
        executionTimeMs,
        chartOutput,
        passedAssertions: passedCount,
        totalAssertions: totalCount,
      };
    } catch (err) {
      const executionTimeMs = Math.round(performance.now() - startTime);
      return {
        success: false,
        stdout: stdoutLines.join('\n'),
        stderr: (err as Error).message || 'SyntaxError: Invalid Python statement',
        executionTimeMs,
        passedAssertions: 0,
        totalAssertions: testAssertions?.length || 0,
      };
    }
  }
}

// Utility to safely evaluate Python expression subset in browser sandbox
function evalPyExpression(expr: string, scope: Record<string, unknown>): unknown {
  const trimmed = expr.trim();

  // Boolean / None literals
  if (trimmed === 'True') return true;
  if (trimmed === 'False') return false;
  if (trimmed === 'None') return null;

  // Number literal
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  // String literal ('hello' or "hello")
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }

  // List literal: [1, 2, 3] or ['a', 'b']
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return [];
    return splitArgs(inner).map((item) => evalPyExpression(item.trim(), scope));
  }

  // Dictionary literal: {"a": 1, "b": 2}
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return {};
    const obj: Record<string, unknown> = {};
    const pairs = splitArgs(inner);
    pairs.forEach((p) => {
      const idx = p.indexOf(':');
      if (idx !== -1) {
        const key = evalPyExpression(p.slice(0, idx).trim(), scope) as string;
        const val = evalPyExpression(p.slice(idx + 1).trim(), scope);
        obj[key] = val;
      }
    });
    return obj;
  }

  // Variable lookup
  if (/^[a-zA-Z_]\w*$/.test(trimmed)) {
    if (trimmed in scope) {
      return scope[trimmed];
    }
    return trimmed;
  }

  // Function or method calls:
  // e.g. np.array([1, 2, 3])
  if (trimmed.startsWith('np.array(') && trimmed.endsWith(')')) {
    const inner = trimmed.slice(9, -1).trim();
    const evaluated = evalPyExpression(inner, scope) as number[];
    const np = scope['np'] as { array: (arr: number[]) => unknown };
    if (np && typeof np.array === 'function') {
      return np.array(evaluated);
    }
    return evaluated;
  }

  // pd.DataFrame(...)
  if (trimmed.startsWith('pd.DataFrame(') && trimmed.endsWith(')')) {
    const inner = trimmed.slice(13, -1).trim();
    const evaluated = evalPyExpression(inner, scope) as Record<string, unknown[]>;
    const pd = scope['pd'] as { DataFrame: (data: Record<string, unknown[]>) => unknown };
    if (pd && typeof pd.DataFrame === 'function') {
      return pd.DataFrame(evaluated);
    }
    return evaluated;
  }

  // len(obj)
  if (trimmed.startsWith('len(') && trimmed.endsWith(')')) {
    const inner = trimmed.slice(4, -1).trim();
    const val = evalPyExpression(inner, scope);
    if (Array.isArray(val) || typeof val === 'string') return val.length;
    return 0;
  }

  // Math operators like a + b, a * b, a / b
  const binOpMatch = trimmed.match(/^(.+?)\s*([\+\-\*\/%])\s*(.+)$/);
  if (binOpMatch) {
    const left = evalPyExpression(binOpMatch[1], scope);
    const op = binOpMatch[2];
    const right = evalPyExpression(binOpMatch[3], scope);
    if (typeof left === 'number' && typeof right === 'number') {
      switch (op) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': return right !== 0 ? left / right : 0;
        case '%': return left % right;
      }
    }
    if (typeof left === 'string' && op === '+') {
      return left + String(right);
    }
  }

  // Equality comparison: a == b
  const eqMatch = trimmed.match(/^(.+?)\s*(==|!=|>|<|>=|<=)\s*(.+)$/);
  if (eqMatch) {
    const left = evalPyExpression(eqMatch[1], scope);
    const op = eqMatch[2];
    const right = evalPyExpression(eqMatch[3], scope);
    switch (op) {
      case '==': return left == right;
      case '!=': return left != right;
      case '>': return Number(left) > Number(right);
      case '<': return Number(left) < Number(right);
      case '>=': return Number(left) >= Number(right);
      case '<=': return Number(left) <= Number(right);
    }
  }

  return trimmed;
}

// Split comma-separated arguments while respecting strings and brackets
function splitArgs(input: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuote: string | null = null;
  let bracketDepth = 0;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (inQuote) {
      current += ch;
      if (ch === inQuote && input[i - 1] !== '\\') {
        inQuote = null;
      }
    } else {
      if (ch === '"' || ch === "'") {
        inQuote = ch;
        current += ch;
      } else if (ch === '[' || ch === '(' || ch === '{') {
        bracketDepth++;
        current += ch;
      } else if (ch === ']' || ch === ')' || ch === '}') {
        bracketDepth--;
        current += ch;
      } else if (ch === ',' && bracketDepth === 0) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }

  if (current.trim()) {
    result.push(current.trim());
  }

  return result;
}
