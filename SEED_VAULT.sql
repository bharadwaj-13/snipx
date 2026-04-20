-- =========================================================
-- SNIPX SEED VAULT: ATTRACTIVE PUBLIC CONTENT
-- 1. Replace 'YOUR_USER_ID_HERE' with your actual User ID from Supabase Auth.
-- 2. Run this in the SQL Editor.
-- =========================================================

DO $$
DECLARE
    target_user_id UUID := '1d5d825f-46fc-4ee7-8d55-5e2e61807a03'; -- <--- UPDATE THIS
    algo_col_id UUID;
    react_col_id UUID;
BEGIN

-- 1. Create Public Directories
INSERT INTO public.collections (user_id, name, description, visibility, is_pinned)
VALUES 
  (target_user_id, 'Bitwise & Performance', 'Elite low-level optimizations and performance wizardry.', 'public', true)
RETURNING id INTO algo_col_id;

INSERT INTO public.collections (user_id, name, description, visibility, is_pinned)
VALUES 
  (target_user_id, 'Modern React Hooks', 'Battle-tested custom hooks for production React apps.', 'public', true)
RETURNING id INTO react_col_id;

-- 2. Insert Bitwise Magic
INSERT INTO public.snippets (user_id, collection_id, title, description, code, language, visibility, tags)
VALUES (
  target_user_id, 
  algo_col_id, 
  'Fast Inverse Square Root (Quake III)', 
  'The legendary optimization from Quake III. Approximates 1/sqrt(x) with incredible speed using bit manipulation.', 
  '#include <cmath>\n\nfloat Q_rsqrt(float number) {\n  long i;\n  float x2, y;\n  const float threehalfs = 1.5F;\n\n  x2 = number * 0.5F;\n  y  = number;\n  i  = * ( long * ) &y;                       // evil floating point bit level hacking\n  i  = 0x5f3759df - ( i >> 1 );              // what the f***?\n  y  = * ( float * ) &i;\n  y  = y * ( threehalfs - ( x2 * y * y ) );   // 1st iteration\n  // y  = y * ( threehalfs - ( x2 * y * y ) );   // 2nd iteration, this can be removed\n\n  return y;\n}', 
  'cpp', 
  'public', 
  '{math, optimization, legendary}'
);

INSERT INTO public.snippets (user_id, collection_id, title, description, code, language, visibility, tags)
VALUES (
  target_user_id, 
  algo_col_id, 
  'Brian Kernighan’s Algorithm', 
  'The most efficient way to count set bits (1s) in an integer by clearing the least significant set bit.', 
  'int countSetBits(int n) {\n  int count = 0;\n  while (n > 0) {\n    n &= (n - 1);\n    count++;\n  }\n  return count;\n}\n\n// Complexity: O(number of set bits)', 
  'cpp', 
  'public', 
  '{bitwise, binary, efficient}'
);

-- 3. Insert DSA Core
INSERT INTO public.snippets (user_id, collection_id, title, description, code, language, visibility, tags)
VALUES (
  target_user_id, 
  algo_col_id, 
  'Dijkstra Shortest Path (Python)', 
  'Clean implementation of Dijkstra using a priority queue (heapq).', 
  'import heapq\n\ndef dijkstra(graph, start):\n    queue = [(0, start)]\n    distances = {node: float(''inf'') for node in graph}\n    distances[start] = 0\n\n    while queue:\n        current_dist, current_node = heapq.heappop(queue)\n\n        if current_dist > distances[current_node]:\n            continue\n\n        for neighbor, weight in graph[current_node].items():\n            distance = current_dist + weight\n            if distance < distances[neighbor]:\n                distances[neighbor] = distance\n                heapq.heappush(queue, (distance, neighbor))\n\n    return distances', 
  'python', 
  'public', 
  '{graphs, dsa, search}'
);

-- 4. Insert React Mastery
INSERT INTO public.snippets (user_id, collection_id, title, description, code, language, visibility, tags)
VALUES (
  target_user_id, 
  react_col_id, 
  'useLocalStorage Hook', 
  'A production-ready hook for syncing state with LocalStorage with full type safety.', 
  'import { useState } from ''react'';\n\nfunction useLocalStorage(key, initialValue) {\n  const [storedValue, setStoredValue] = useState(() => {\n    try {\n      const item = window.localStorage.getItem(key);\n      return item ? JSON.parse(item) : initialValue;\n    } catch (error) {\n      console.error(error);\n      return initialValue;\n    }\n  });\n\n  const setValue = (value) => {\n    try {\n      const valueToStore = value instanceof Function ? value(storedValue) : value;\n      setStoredValue(valueToStore);\n      window.localStorage.setItem(key, JSON.stringify(valueToStore));\n    } catch (error) {\n      console.error(error);\n    }\n  };\n\n  return [storedValue, setValue];\n}', 
  'javascript', 
  'public', 
  '{react, hooks, frontend}'
);

INSERT INTO public.snippets (user_id, collection_id, title, description, code, language, visibility, tags)
VALUES (
  target_user_id, 
  react_col_id, 
  'Atomic useTheme Implementation', 
  'Minimalist theme switcher implementation using CSS variables and local storage.', 
  'const useTheme = () => {\n  const [theme, setTheme] = useState(''dark'');\n\n  const toggleTheme = () => {\n    const newTheme = theme === ''dark'' ? ''light'' : ''dark'';\n    setTheme(newTheme);\n    document.documentElement.setAttribute(''data-theme'', newTheme);\n  };\n\n  return { theme, toggleTheme };\n};', 
  'javascript', 
  'public', 
  '{react, theme, css}'
);

END $$;
