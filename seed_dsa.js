import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import fs from 'fs'

// Load env from .env.local
const envConfig = dotenv.parse(fs.readFileSync('.env.local'))
for (const k in envConfig) { process.env[k] = envConfig[k] }

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const GITHUB_TOKEN = process.env.VITE_GITHUB_TOKEN
const USER_ID = "YOUR_USER_ID" // You need to provide your user ID

const dsaData = [
  {
    title: "Two Sum",
    language: "java",
    visibility: "public",
    tags: ["array", "hashmap", "easy"],
    description: "Find two numbers such that they add up to a specific target.",
    code: `import java.util.HashMap;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}`
  },
  {
    title: "Reverse Linked List",
    language: "java",
    visibility: "public",
    tags: ["linked-list", "recursion", "easy"],
    description: "Classic iterative approach to reversing a singly linked list.",
    code: `class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode nextTemp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextTemp;
        }
        return prev;
    }
}`
  },
  {
    title: "Merge Intervals",
    language: "java",
    visibility: "public",
    tags: ["sorting", "array", "medium"],
    description: "Efficiently merge overlapping intervals in O(n log n).",
    code: `import java.util.*;

class Solution {
    public int[][] merge(int[][] intervals) {
        if (intervals.length <= 1) return intervals;
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> result = new ArrayList<>();
        int[] currentInterval = intervals[0];
        result.add(currentInterval);
        for (int[] interval : intervals) {
            if (interval[0] <= currentInterval[1]) {
                currentInterval[1] = Math.max(currentInterval[1], interval[1]);
            } else {
                currentInterval = interval;
                result.add(currentInterval);
            }
        }
        return result.toArray(new int[result.size()][]);
    }
}`
  },
  {
    title: "LRU Cache",
    language: "java",
    visibility: "public",
    tags: ["design", "doubly-linked-list", "hard"],
    description: "Least Recently Used (LRU) Cache design using HashMap + Doubly Linked List.",
    code: `import java.util.HashMap;

class LRUCache {
    class Node {
        int key, value;
        Node prev, next;
        Node(int k, int v) { key = k; value = v; }
    }
    private final int capacity;
    private final HashMap<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0), tail = new Node(0, 0);

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail; tail.prev = head;
    }
    
    public int get(int key) {
        if (map.containsKey(key)) {
            Node node = map.get(key);
            remove(node); insert(node);
            return node.value;
        }
        return -1;
    }
    
    public void put(int key, int value) {
        if (map.containsKey(key)) remove(map.get(key));
        if (map.size() == capacity) remove(tail.prev);
        insert(new Node(key, value));
    }

    private void remove(Node node) {
        map.remove(node.key);
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void insert(Node node) {
        map.put(node.key, node);
        node.next = head.next;
        node.next.prev = node;
        head.next = node;
        node.prev = head;
    }
}`
  }
];

async function seed() {
  console.log("🚀 Starting Seed Process...");
  const authHeader = GITHUB_TOKEN.startsWith('github_pat_') ? `Bearer ${GITHUB_TOKEN}` : `token ${GITHUB_TOKEN}`;

  for (const s of dsaData) {
    try {
      console.log(`📦 Creating Gist for [${s.title}]...`);
      // 1. Create Gist
      const gistRes = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: `Snipx: ${s.title}`,
          public: false,
          files: { 'snippet.txt': { content: s.code } }
        })
      });
      const gist = await gistRes.json();
      if (!gist.id) throw new Error(JSON.stringify(gist));

      // 2. Insert into Supabase
      console.log(`💾 Saving metadata to Supabase...`);
      const { error } = await supabase.from('snippets').insert({
        user_id: USER_ID,
        title: s.title,
        description: s.description,
        language: s.language,
        visibility: s.visibility,
        tags: s.tags,
        gist_id: gist.id,
        code_preview: s.code.substring(0, 200),
        share_token: Math.random().toString(36).substring(2, 15)
      });

      if (error) console.error(`❌ DB Error for ${s.title}:`, error.message);
      else console.log(`✅ [${s.title}] Migrated Successfully.`);
    } catch (err) {
      console.error(`❌ Failed ${s.title}:`, err.message);
    }
  }
  console.log("\n✨ Seed Finished!");
}

if (USER_ID === "YOUR_USER_ID") {
    console.error("⚠️ PLEASE EDIT seed_dsa.js AND PUT YOUR USER_ID FIRST!");
} else {
    seed();
}
