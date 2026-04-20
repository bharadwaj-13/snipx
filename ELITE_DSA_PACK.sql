-- =========================================================
-- SNIPX ELITE DSA PACK (REPAIRED)
-- =========================================================

DO $$
DECLARE
    target_user_id UUID := 'e266c649-bf2f-4aa6-87f7-902cdefb287a'; -- <--- UPDATE THIS IF NEEDED
    lc_col_id UUID;
BEGIN

-- 1. Create Elite Collection
INSERT INTO public.collections (user_id, name, description, visibility, is_pinned)
VALUES 
  (target_user_id, 'LeetCode Blueprint', 'The defining solutions for the top most common interview questions.', 'public', true)
RETURNING id INTO lc_col_id;

-- 2. Bulk Insert Solutions
INSERT INTO public.snippets (user_id, collection_id, title, description, code, language, visibility, tags) VALUES 
(target_user_id, lc_col_id, 'Two Sum', 'O(n) solution using a Hash Map.', 'def twoSum(nums, target):\n    prevMap = {} # val : index\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in prevMap:\n            return [prevMap[diff], i]\n        prevMap[n] = i', 'python', 'public', '{arrays, hashmap}'),

(target_user_id, lc_col_id, 'Best Time to Buy/Sell Stock', 'Sliding window approach to find max profit.', 'def maxProfit(prices):\n    res = 0\n    l = 0\n    for r in range(1, len(prices)):\n        if prices[r] < prices[l]:\n            l = r\n        res = max(res, prices[r] - prices[l])\n    return res', 'python', 'public', '{sliding-window, arrays}'),

(target_user_id, lc_col_id, 'Valid Anagram', 'Counting characters with a frequency map.', 'def isAnagram(s, t):\n    if len(s) != len(t): return False\n    count = {}\n    for char in s: count[char] = count.get(char, 0) + 1\n    for char in t:\n        if char not in count or count[char] == 0: return False\n        count[char] -= 1\n    return True', 'python', 'public', '{strings, hashmap}'),

(target_user_id, lc_col_id, 'Valid Palindrome', 'Two pointers meeting in the middle.', 'def isPalindrome(s):\n    l, r = 0, len(s) - 1\n    while l < r:\n        while l < r and not s[l].isalnum(): l += 1\n        while r > l and not s[r].isalnum(): r -= 1\n        if s[l].lower() != s[r].lower(): return False\n        l, r = l + 1, r - 1\n    return True', 'python', 'public', '{two-pointers, easy}'),

(target_user_id, lc_col_id, 'Valid Parentheses', 'Using a stack to match opening and closing brackets.', 'def isValid(s):\n    Map = {")": "(", "]": "[", "}": "{"}\n    stack = []\n    for c in s:\n        if c not in Map:\n            stack.append(c)\n            continue\n        if not stack or stack[-1] != Map[c]:\n            return False\n        stack.pop()\n    return not stack', 'python', 'public', '{stack, fundamentals}'),

(target_user_id, lc_col_id, 'Binary Search', 'Standard iterative binary search.', 'def search(nums, target):\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        m = l + ((r - l) // 2)\n        if nums[m] > target:\n            r = m - 1\n        elif nums[m] < target:\n            l = m + 1\n        else:\n            return m\n    return -1', 'python', 'public', '{binary-search}'),

(target_user_id, lc_col_id, 'Reverse Linked List', 'Iterative pointer manipulation.', 'def reverseList(head):\n    prev, curr = None, head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev', 'python', 'public', '{linked-list}'),

(target_user_id, lc_col_id, 'Merge Two Sorted Lists', 'Recursive or iterative merging.', 'def mergeTwoLists(l1, l2):\n    dummy = ListNode()\n    tail = dummy\n    while l1 and l2:\n        if l1.val < l2.val:\n            tail.next = l1\n            l1 = l1.next\n        else:\n            tail.next = l2\n            l2 = l2.next\n        tail = tail.next\n    tail.next = l1 or l2\n    return dummy.next', 'python', 'public', '{linked-list}'),

(target_user_id, lc_col_id, 'Invert Binary Tree', 'The famous Homebrew interview question.', 'def invertTree(root):\n    if not root: return None\n    root.left, root.right = invertTree(root.right), invertTree(root.left)\n    return root', 'python', 'public', '{trees, recursion}'),

(target_user_id, lc_col_id, 'Maximum Depth of Binary Tree', 'Simple recursive DFS.', 'def maxDepth(root):\n    if not root: return 0\n    return 1 + max(maxDepth(root.left), maxDepth(root.right))', 'python', 'public', '{trees, DFS}'),

(target_user_id, lc_col_id, 'Diameter of Binary Tree', 'DFS returning height while updating diameter.', 'def diameterOfBinaryTree(root):\n    res = [0]\n    def dfs(curr):\n        if not curr: return -1\n        left = dfs(curr.left)\n        right = dfs(curr.right)\n        res[0] = max(res[0], 2 + left + right)\n        return 1 + max(left, right)\n    dfs(root)\n    return res[0]', 'python', 'public', '{trees, optimization}'),

(target_user_id, lc_col_id, 'Climbing Stairs', 'O(n) time, O(1) space Fibonacci pattern.', 'def climbStairs(n):\n    one, two = 1, 1\n    for i in range(n - 1):\n        temp = one\n        one = one + two\n        two = temp\n    return one', 'python', 'public', '{dynamic-programming}'),

(target_user_id, lc_col_id, 'Single Number', 'Using XOR to find the non-duplicate element.', 'def singleNumber(nums):\n    res = 0\n    for n in nums: res ^= n\n    return res', 'python', 'public', '{bit-manipulation}');

END $$;
