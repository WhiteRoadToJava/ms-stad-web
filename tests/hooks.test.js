/**
 * Checks that every React hook a component uses is one it imported.
 *
 * Vite does not catch this. It bundles per module and never resolves a bare
 * identifier, so a missing hook import builds cleanly and throws
 * "useCallback is not defined" the first time someone opens the page. That
 * has now happened three times in this project, twice on the server and once
 * here, always from the same kind of careless edit.
 *
 * Run with: npm test
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const HOOKS = [
  'useState',
  'useEffect',
  'useMemo',
  'useCallback',
  'useRef',
  'useReducer',
  'useContext',
  'useId',
  'useLayoutEffect',
  'useTranslation',
  'useLocation',
  'useNavigate',
  'useParams',
  'useSearchParams',
  'useAuth',
];

const walk = (directory) =>
  readdirSync(directory).flatMap((entry) => {
    const full = path.join(directory, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.jsx?$/.test(full) ? [full] : [];
  });

/** Names the file brought in, plus the ones it declares itself. */
const namesAvailableIn = (source) => {
  const available = new Set();

  for (const match of source.matchAll(/import\s+\{([^}]+)\}\s+from/g)) {
    for (const name of match[1].split(',')) {
      available.add(name.trim().split(/\s+as\s+/).pop().trim());
    }
  }

  for (const match of source.matchAll(/import\s+(\w+)[,\s]/g)) available.add(match[1]);
  for (const match of source.matchAll(/(?:const|let|function|class)\s+(\w+)/g)) {
    available.add(match[1]);
  }

  return available;
};

describe('every hook is imported where it is used', () => {
  for (const file of walk(path.join(root, 'src'))) {
    const name = path.relative(root, file).split(path.sep).join('/');
    const source = readFileSync(file, 'utf8');

    // Import lines are dropped first, so importing a hook does not count as
    // using it.
    const body = source.replace(/^import[\s\S]*?from\s+'[^']+';$/gm, '');
    const available = namesAvailableIn(source);

    const missing = HOOKS.filter(
      (hook) => new RegExp(`\\b${hook}\\s*\\(`).test(body) && !available.has(hook),
    );

    it(name, () => {
      assert.deepEqual(missing, [], `${name} uses ${missing.join(', ')} without importing`);
    });
  }
});
