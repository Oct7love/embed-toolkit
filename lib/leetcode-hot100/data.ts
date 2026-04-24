/**
 * LeetCode Hot 100 — MVP 10 题数据集 × 10 语言（v1.5.2）
 *
 * 口径约束（v1.5 planning + v1.5.2 扩展）：
 * - description 为"这类题要解决什么"自改写，≤ 120 字符，不照抄 LeetCode 官方题面
 * - 10 种语言：C / C++ / Python / Java / JavaScript / TypeScript / Go / Rust / Kotlin / Swift
 * - 每语言函数签名严格匹配 LeetCode 官方提供的 starter 模板（直接贴去提交框可编译）
 * - C：仅 stdlib，不用 bits/stdc++.h；自写哈希表 / 动态数组保持 O(n) 性质
 * - C++17：标准库 include，class Solution
 * - Python：3.9+，typing.List/Dict/Optional
 * - Java：java.util.*，class Solution
 * - JavaScript：LeetCode 经典 `var name = function(...)` 风格
 * - TypeScript：5+，function 形式 + 类型注解
 * - Go：1.20+，标准库
 * - Rust：2021 edition，impl Solution { pub fn ... }；ownership 复杂时允许在
 *   注释里说明妥协（如 Linked List 题需 Box<ListNode> 解构）
 * - Kotlin：1.9+，class Solution { fun ... }
 * - Swift：5+，class Solution { func ... }
 * - approach 至少 3 段，空行分隔：本质思路 / 实现要点 / 陷阱或对比
 *
 * 自检策略（每批必做）：随机抽 3 道不同难度的题人工通读 10 语言代码，
 * 验证函数签名 / 算法逻辑 / 明显语法错。问题立即修，不掩盖。
 */

import type { Problem } from "@/types/leetcode-hot100";

export const PROBLEMS: Problem[] = [
  /* ============================================================== */
  /*  1. Two Sum (Easy)                                              */
  /* ============================================================== */
  {
    id: 1,
    slug: "two-sum",
    titleZh: "两数之和",
    titleEn: "Two Sum",
    difficulty: "easy",
    tags: ["数组", "哈希表"],
    description: "数组里找一对元素，和等于目标值，返回它们的下标。",
    officialUrl: "https://leetcode.cn/problems/two-sum/",
    approach: `本质：把"找配对"降维为"查缺项"。需要 a + b = target，固定 a 后缺的就是 target - a，问题变成"之前有没有见过这个值"。一次遍历 + 哈希表即可。

实现要点：边遍历边把 (值 → 下标) 塞进 unordered_map / dict。对当前元素 x，先查 target - x 是否已在表里；在，就直接返回；不在，再把 x 塞进去。顺序不能反，否则 target = 2 * x 时会自己跟自己配对。

陷阱与对比：朴素双循环 O(n²) 在 n 较大（10⁴）时必超时。哈希表方案 O(n) 但引入 O(n) 额外空间换时间。如果输入已排序，还可以用双指针 O(n) + O(1) 空间。`,
    solutions: {
      c: {
        code: `#include <stdlib.h>
#include <string.h>

/* 自写开链哈希表：LeetCode C 没有标准 hashmap */
#define TBL_SIZE 16384
struct Node { int key; int val; struct Node *next; };

static unsigned hash(int k) {
    return (unsigned)(k * 0x9E3779B1u) & (TBL_SIZE - 1);
}

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    struct Node **tbl = (struct Node**)calloc(TBL_SIZE, sizeof(struct Node*));
    int* ans = (int*)malloc(2 * sizeof(int));
    *returnSize = 0;
    for (int i = 0; i < numsSize; ++i) {
        int need = target - nums[i];
        for (struct Node *p = tbl[hash(need)]; p; p = p->next) {
            if (p->key == need) {
                ans[0] = p->val; ans[1] = i;
                *returnSize = 2;
                goto done;
            }
        }
        struct Node *node = (struct Node*)malloc(sizeof(struct Node));
        node->key = nums[i]; node->val = i;
        node->next = tbl[hash(nums[i])];
        tbl[hash(nums[i])] = node;
    }
done:
    for (int i = 0; i < TBL_SIZE; ++i) {
        struct Node *p = tbl[i];
        while (p) { struct Node *n = p->next; free(p); p = n; }
    }
    free(tbl);
    return ans;
}`,
      },
      cpp: {
        code: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen; // 值 -> 下标
        for (int i = 0; i < (int)nums.size(); ++i) {
            int need = target - nums[i];
            auto it = seen.find(need);
            if (it != seen.end()) {
                return {it->second, i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
      },
      python: {
        code: `from typing import List, Dict

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen: Dict[int, int] = {}  # 值 -> 下标
        for i, x in enumerate(nums):
            need = target - x
            if need in seen:
                return [seen[need], i]
            seen[x] = i
        return []`,
      },
      java: {
        code: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (seen.containsKey(need)) {
                return new int[]{seen.get(need), i};
            }
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}`,
      },
      javascript: {
        code: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const need = target - nums[i];
        if (seen.has(need)) return [seen.get(need), i];
        seen.set(nums[i], i);
    }
    return [];
};`,
      },
      typescript: {
        code: `function twoSum(nums: number[], target: number): number[] {
    const seen = new Map<number, number>();
    for (let i = 0; i < nums.length; i++) {
        const need = target - nums[i];
        if (seen.has(need)) return [seen.get(need)!, i];
        seen.set(nums[i], i);
    }
    return [];
}`,
      },
      go: {
        code: `func twoSum(nums []int, target int) []int {
    seen := make(map[int]int)
    for i, x := range nums {
        if j, ok := seen[target-x]; ok {
            return []int{j, i}
        }
        seen[x] = i
    }
    return nil
}`,
      },
      rust: {
        code: `use std::collections::HashMap;

impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        let mut seen: HashMap<i32, i32> = HashMap::new();
        for (i, &x) in nums.iter().enumerate() {
            if let Some(&j) = seen.get(&(target - x)) {
                return vec![j, i as i32];
            }
            seen.insert(x, i as i32);
        }
        vec![]
    }
}`,
      },
      kotlin: {
        code: `class Solution {
    fun twoSum(nums: IntArray, target: Int): IntArray {
        val seen = HashMap<Int, Int>()
        for (i in nums.indices) {
            val need = target - nums[i]
            seen[need]?.let { return intArrayOf(it, i) }
            seen[nums[i]] = i
        }
        return intArrayOf()
    }
}`,
      },
      swift: {
        code: `class Solution {
    func twoSum(_ nums: [Int], _ target: Int) -> [Int] {
        var seen: [Int: Int] = [:]
        for (i, x) in nums.enumerated() {
            if let j = seen[target - x] { return [j, i] }
            seen[x] = i
        }
        return []
    }
}`,
      },
    },
    complexity: { time: "O(n)", space: "O(n)" },
    keyPoints: "哈希表以空间换时间，把 O(n²) 双循环降到 O(n) 单次遍历。",
  },

  /* ============================================================== */
  /*  3. Longest Substring Without Repeating Characters (Medium)     */
  /* ============================================================== */
  {
    id: 3,
    slug: "longest-substring-without-repeating-characters",
    titleZh: "无重复字符的最长子串",
    titleEn: "Longest Substring Without Repeating Characters",
    difficulty: "medium",
    tags: ["字符串", "滑动窗口", "哈希表"],
    description: "求最长子串长度，其中每个字符最多出现一次。",
    officialUrl:
      "https://leetcode.cn/problems/longest-substring-without-repeating-characters/",
    approach: `本质：维护一个"合法窗口"——窗口内无重复。右端无脑扩张，一旦遇到重复就把左端缩到重复点的下一位，整个过程每个字符只被左右指针各扫一次，线性时间。

实现要点：用 map 记录"每个字符上次出现的下标"。扩张右端 r 时，若 s[r] 已在 map 且上次位置 ≥ 当前左端 l，就把 l 跳到 map[s[r]] + 1。否则 l 不动。每步更新答案 max(ans, r - l + 1)。

陷阱与对比：暴力枚举所有子串 + 判重 O(n³)。优化为"枚举左端 + 右扫停" O(n²)。滑动窗口 O(n) 的关键是"左端只向右移，永不回退"。另一个常见错是跳左端时忘了比较 map 里记录的位置是否还在窗口内（已经被挤出去就不该再跳）。`,
    solutions: {
      c: {
        code: `#include <string.h>

int lengthOfLongestSubstring(char* s) {
    int last[128];                      // ASCII 字符 -> 上次出现下标
    for (int i = 0; i < 128; ++i) last[i] = -1;
    int ans = 0, l = 0;
    int n = (int)strlen(s);
    for (int r = 0; r < n; ++r) {
        unsigned char c = (unsigned char)s[r];
        if (last[c] >= l) l = last[c] + 1;
        last[c] = r;
        if (r - l + 1 > ans) ans = r - l + 1;
    }
    return ans;
}`,
      },
      cpp: {
        code: `#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> last; // 字符 -> 上次出现下标
        int ans = 0, l = 0;
        for (int r = 0; r < (int)s.size(); ++r) {
            auto it = last.find(s[r]);
            if (it != last.end() && it->second >= l) {
                l = it->second + 1;
            }
            last[s[r]] = r;
            ans = max(ans, r - l + 1);
        }
        return ans;
    }
};`,
      },
      python: {
        code: `from typing import Dict

class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        last: Dict[str, int] = {}  # 字符 -> 上次出现下标
        ans = 0
        l = 0
        for r, ch in enumerate(s):
            if ch in last and last[ch] >= l:
                l = last[ch] + 1
            last[ch] = r
            if r - l + 1 > ans:
                ans = r - l + 1
        return ans`,
      },
      java: {
        code: `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> last = new HashMap<>();
        int ans = 0, l = 0;
        for (int r = 0; r < s.length(); r++) {
            char c = s.charAt(r);
            if (last.containsKey(c) && last.get(c) >= l) {
                l = last.get(c) + 1;
            }
            last.put(c, r);
            ans = Math.max(ans, r - l + 1);
        }
        return ans;
    }
}`,
      },
      javascript: {
        code: `/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
    const last = new Map();
    let ans = 0, l = 0;
    for (let r = 0; r < s.length; r++) {
        const c = s[r];
        if (last.has(c) && last.get(c) >= l) {
            l = last.get(c) + 1;
        }
        last.set(c, r);
        if (r - l + 1 > ans) ans = r - l + 1;
    }
    return ans;
};`,
      },
      typescript: {
        code: `function lengthOfLongestSubstring(s: string): number {
    const last = new Map<string, number>();
    let ans = 0, l = 0;
    for (let r = 0; r < s.length; r++) {
        const c = s[r];
        const prev = last.get(c);
        if (prev !== undefined && prev >= l) {
            l = prev + 1;
        }
        last.set(c, r);
        if (r - l + 1 > ans) ans = r - l + 1;
    }
    return ans;
}`,
      },
      go: {
        code: `func lengthOfLongestSubstring(s string) int {
    last := make(map[byte]int)
    ans, l := 0, 0
    for r := 0; r < len(s); r++ {
        c := s[r]
        if prev, ok := last[c]; ok && prev >= l {
            l = prev + 1
        }
        last[c] = r
        if r-l+1 > ans {
            ans = r - l + 1
        }
    }
    return ans
}`,
      },
      rust: {
        code: `use std::collections::HashMap;

impl Solution {
    pub fn length_of_longest_substring(s: String) -> i32 {
        let mut last: HashMap<u8, i32> = HashMap::new();
        let bytes = s.as_bytes();
        let mut ans = 0i32;
        let mut l = 0i32;
        for r in 0..bytes.len() as i32 {
            let c = bytes[r as usize];
            if let Some(&prev) = last.get(&c) {
                if prev >= l { l = prev + 1; }
            }
            last.insert(c, r);
            if r - l + 1 > ans { ans = r - l + 1; }
        }
        ans
    }
}`,
      },
      kotlin: {
        code: `class Solution {
    fun lengthOfLongestSubstring(s: String): Int {
        val last = HashMap<Char, Int>()
        var ans = 0
        var l = 0
        for (r in s.indices) {
            val c = s[r]
            val prev = last[c]
            if (prev != null && prev >= l) l = prev + 1
            last[c] = r
            if (r - l + 1 > ans) ans = r - l + 1
        }
        return ans
    }
}`,
      },
      swift: {
        code: `class Solution {
    func lengthOfLongestSubstring(_ s: String) -> Int {
        let chars = Array(s)
        var last: [Character: Int] = [:]
        var ans = 0, l = 0
        for r in 0..<chars.count {
            let c = chars[r]
            if let prev = last[c], prev >= l {
                l = prev + 1
            }
            last[c] = r
            if r - l + 1 > ans { ans = r - l + 1 }
        }
        return ans
    }
}`,
      },
    },
    complexity: { time: "O(n)", space: "O(Σ) —— Σ 为字符集大小" },
    keyPoints: "滑动窗口 + 哈希记录位置，左端只进不退是 O(n) 的关键。",
  },

  /* ============================================================== */
  /*  5. Longest Palindromic Substring (Medium)                      */
  /* ============================================================== */
  {
    id: 5,
    slug: "longest-palindromic-substring",
    titleZh: "最长回文子串",
    titleEn: "Longest Palindromic Substring",
    difficulty: "medium",
    tags: ["字符串", "DP", "双指针"],
    description: "找字符串里最长的回文子串，返回子串本身。",
    officialUrl: "https://leetcode.cn/problems/longest-palindromic-substring/",
    approach: `本质：回文以"中心"为对称轴往两侧扩散。以每个位置为中心往左右伸展，能走多远就是以它为中心的最长回文。枚举所有中心（共 2n-1 个：每个字符 + 每对相邻字符之间），取最长。

实现要点：写一个 expand(l, r) 双指针函数，从 (l, r) 向外扩，返回扩到无法扩时的回文区间。主循环对每个 i 做两次：expand(i, i) 处理奇数长度，expand(i, i+1) 处理偶数长度。记录最长区间的起止下标。

陷阱与对比：朴素枚举全部子串 + 判回文 O(n³)。DP 做 dp[i][j] 表示 s[i..j] 是否回文，O(n²) 时间 O(n²) 空间。中心扩展法 O(n²) 时间 O(1) 空间，更优。Manacher 算法可以做到 O(n) 但代码复杂，面试里能写出中心扩展已经够了。`,
    solutions: {
      c: {
        code: `#include <string.h>
#include <stdlib.h>

static void expand(const char* s, int n, int l, int r, int* outL, int* outR) {
    while (l >= 0 && r < n && s[l] == s[r]) { --l; ++r; }
    *outL = l + 1; *outR = r - 1;
}

char* longestPalindrome(char* s) {
    int n = (int)strlen(s);
    if (n == 0) { char* r = (char*)malloc(1); r[0] = '\\0'; return r; }
    int bestL = 0, bestR = 0;
    for (int i = 0; i < n; ++i) {
        int l1, r1, l2, r2;
        expand(s, n, i, i, &l1, &r1);
        expand(s, n, i, i + 1, &l2, &r2);
        if (r1 - l1 > bestR - bestL) { bestL = l1; bestR = r1; }
        if (r2 - l2 > bestR - bestL) { bestL = l2; bestR = r2; }
    }
    int len = bestR - bestL + 1;
    char* ans = (char*)malloc(len + 1);
    memcpy(ans, s + bestL, len);
    ans[len] = '\\0';
    return ans;
}`,
      },
      cpp: {
        code: `#include <string>
using namespace std;

class Solution {
public:
    string longestPalindrome(string s) {
        int n = (int)s.size();
        if (n == 0) return "";
        int bestL = 0, bestR = 0;
        for (int i = 0; i < n; ++i) {
            auto [l1, r1] = expand(s, i, i);
            auto [l2, r2] = expand(s, i, i + 1);
            if (r1 - l1 > bestR - bestL) { bestL = l1; bestR = r1; }
            if (r2 - l2 > bestR - bestL) { bestL = l2; bestR = r2; }
        }
        return s.substr(bestL, bestR - bestL + 1);
    }
private:
    pair<int,int> expand(const string& s, int l, int r) {
        while (l >= 0 && r < (int)s.size() && s[l] == s[r]) { --l; ++r; }
        return {l + 1, r - 1}; // 回退一步得到合法回文区间
    }
};`,
      },
      python: {
        code: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        if not s:
            return ""
        best_l, best_r = 0, 0

        def expand(l: int, r: int) -> tuple[int, int]:
            while l >= 0 and r < len(s) and s[l] == s[r]:
                l -= 1
                r += 1
            return l + 1, r - 1

        for i in range(len(s)):
            for l, r in (expand(i, i), expand(i, i + 1)):
                if r - l > best_r - best_l:
                    best_l, best_r = l, r
        return s[best_l:best_r + 1]`,
      },
      java: {
        code: `class Solution {
    public String longestPalindrome(String s) {
        if (s == null || s.isEmpty()) return "";
        int bestL = 0, bestR = 0;
        for (int i = 0; i < s.length(); i++) {
            int[] a = expand(s, i, i);
            int[] b = expand(s, i, i + 1);
            if (a[1] - a[0] > bestR - bestL) { bestL = a[0]; bestR = a[1]; }
            if (b[1] - b[0] > bestR - bestL) { bestL = b[0]; bestR = b[1]; }
        }
        return s.substring(bestL, bestR + 1);
    }
    private int[] expand(String s, int l, int r) {
        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) { l--; r++; }
        return new int[]{l + 1, r - 1};
    }
}`,
      },
      javascript: {
        code: `/**
 * @param {string} s
 * @return {string}
 */
var longestPalindrome = function(s) {
    if (!s) return "";
    let bestL = 0, bestR = 0;
    const expand = (l, r) => {
        while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
        return [l + 1, r - 1];
    };
    for (let i = 0; i < s.length; i++) {
        for (const [l, r] of [expand(i, i), expand(i, i + 1)]) {
            if (r - l > bestR - bestL) { bestL = l; bestR = r; }
        }
    }
    return s.substring(bestL, bestR + 1);
};`,
      },
      typescript: {
        code: `function longestPalindrome(s: string): string {
    if (!s) return "";
    let bestL = 0, bestR = 0;
    const expand = (l: number, r: number): [number, number] => {
        while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
        return [l + 1, r - 1];
    };
    for (let i = 0; i < s.length; i++) {
        for (const [l, r] of [expand(i, i), expand(i, i + 1)]) {
            if (r - l > bestR - bestL) { bestL = l; bestR = r; }
        }
    }
    return s.substring(bestL, bestR + 1);
}`,
      },
      go: {
        code: `func longestPalindrome(s string) string {
    if len(s) == 0 {
        return ""
    }
    bestL, bestR := 0, 0
    expand := func(l, r int) (int, int) {
        for l >= 0 && r < len(s) && s[l] == s[r] {
            l--
            r++
        }
        return l + 1, r - 1
    }
    for i := 0; i < len(s); i++ {
        l1, r1 := expand(i, i)
        l2, r2 := expand(i, i+1)
        if r1-l1 > bestR-bestL {
            bestL, bestR = l1, r1
        }
        if r2-l2 > bestR-bestL {
            bestL, bestR = l2, r2
        }
    }
    return s[bestL : bestR+1]
}`,
      },
      rust: {
        code: `impl Solution {
    pub fn longest_palindrome(s: String) -> String {
        let bytes = s.as_bytes();
        if bytes.is_empty() { return String::new(); }
        let n = bytes.len() as i32;
        let mut best_l = 0i32;
        let mut best_r = 0i32;
        let expand = |mut l: i32, mut r: i32| -> (i32, i32) {
            while l >= 0 && r < n && bytes[l as usize] == bytes[r as usize] {
                l -= 1; r += 1;
            }
            (l + 1, r - 1)
        };
        for i in 0..n {
            for &(l, r) in &[expand(i, i), expand(i, i + 1)] {
                if r - l > best_r - best_l {
                    best_l = l; best_r = r;
                }
            }
        }
        s[best_l as usize..(best_r + 1) as usize].to_string()
    }
}`,
      },
      kotlin: {
        code: `class Solution {
    fun longestPalindrome(s: String): String {
        if (s.isEmpty()) return ""
        var bestL = 0
        var bestR = 0
        fun expand(li: Int, ri: Int): IntArray {
            var l = li; var r = ri
            while (l >= 0 && r < s.length && s[l] == s[r]) { l--; r++ }
            return intArrayOf(l + 1, r - 1)
        }
        for (i in s.indices) {
            for (a in arrayOf(expand(i, i), expand(i, i + 1))) {
                if (a[1] - a[0] > bestR - bestL) { bestL = a[0]; bestR = a[1] }
            }
        }
        return s.substring(bestL, bestR + 1)
    }
}`,
      },
      swift: {
        code: `class Solution {
    func longestPalindrome(_ s: String) -> String {
        let chars = Array(s)
        if chars.isEmpty { return "" }
        var bestL = 0, bestR = 0
        func expand(_ li: Int, _ ri: Int) -> (Int, Int) {
            var l = li, r = ri
            while l >= 0 && r < chars.count && chars[l] == chars[r] {
                l -= 1; r += 1
            }
            return (l + 1, r - 1)
        }
        for i in 0..<chars.count {
            for (l, r) in [expand(i, i), expand(i, i + 1)] {
                if r - l > bestR - bestL { bestL = l; bestR = r }
            }
        }
        return String(chars[bestL...bestR])
    }
}`,
      },
    },
    complexity: { time: "O(n²)", space: "O(1)" },
    keyPoints: "以中心扩展法同时处理奇偶长度，O(1) 额外空间胜过 O(n²) DP。",
  },

  /* ============================================================== */
  /*  11. Container With Most Water (Medium)                         */
  /* ============================================================== */
  {
    id: 11,
    slug: "container-with-most-water",
    titleZh: "盛最多水的容器",
    titleEn: "Container With Most Water",
    difficulty: "medium",
    tags: ["数组", "双指针", "贪心"],
    description: "一排竖线，选两根做容器两壁，求最大盛水面积。",
    officialUrl: "https://leetcode.cn/problems/container-with-most-water/",
    approach: `本质：面积 = min(height[l], height[r]) × (r - l)。宽度由下标决定，高度被短板限制。要面积大，要么宽，要么都高。

实现要点：双指针从两端往中间收。每步算一下面积，谁矮谁往里挪。道理：短板已经决定了当前宽度下的最大可能面积，保留它没有意义（宽度只会变小，高度上限仍是它自己，面积必然变小）；把短板挪动才有机会换到更高的板。

陷阱与对比：朴素枚举所有 (i, j) 对是 O(n²)，n = 10⁵ 时超时。贪心双指针 O(n) 是这题的正解。要能说清"为什么移动短板是安全的"——这是面试的加分点，本质是每次都排除了"以短板为某侧"的全部剩余候选方案。`,
    solutions: {
      c: {
        code: `int maxArea(int* height, int heightSize) {
    int l = 0, r = heightSize - 1;
    int ans = 0;
    while (l < r) {
        int h = height[l] < height[r] ? height[l] : height[r];
        int area = h * (r - l);
        if (area > ans) ans = area;
        if (height[l] < height[r]) ++l;
        else --r;
    }
    return ans;
}`,
      },
      cpp: {
        code: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxArea(vector<int>& height) {
        int l = 0, r = (int)height.size() - 1;
        int ans = 0;
        while (l < r) {
            int h = min(height[l], height[r]);
            ans = max(ans, h * (r - l));
            if (height[l] < height[r]) ++l; else --r;
        }
        return ans;
    }
};`,
      },
      python: {
        code: `from typing import List

class Solution:
    def maxArea(self, height: List[int]) -> int:
        l, r = 0, len(height) - 1
        ans = 0
        while l < r:
            h = height[l] if height[l] < height[r] else height[r]
            if h * (r - l) > ans:
                ans = h * (r - l)
            if height[l] < height[r]:
                l += 1
            else:
                r -= 1
        return ans`,
      },
      java: {
        code: `class Solution {
    public int maxArea(int[] height) {
        int l = 0, r = height.length - 1;
        int ans = 0;
        while (l < r) {
            int h = Math.min(height[l], height[r]);
            ans = Math.max(ans, h * (r - l));
            if (height[l] < height[r]) l++; else r--;
        }
        return ans;
    }
}`,
      },
      javascript: {
        code: `/**
 * @param {number[]} height
 * @return {number}
 */
var maxArea = function(height) {
    let l = 0, r = height.length - 1;
    let ans = 0;
    while (l < r) {
        const h = Math.min(height[l], height[r]);
        ans = Math.max(ans, h * (r - l));
        if (height[l] < height[r]) l++; else r--;
    }
    return ans;
};`,
      },
      typescript: {
        code: `function maxArea(height: number[]): number {
    let l = 0, r = height.length - 1;
    let ans = 0;
    while (l < r) {
        const h = Math.min(height[l], height[r]);
        ans = Math.max(ans, h * (r - l));
        if (height[l] < height[r]) l++; else r--;
    }
    return ans;
}`,
      },
      go: {
        code: `func maxArea(height []int) int {
    l, r := 0, len(height)-1
    ans := 0
    for l < r {
        h := height[l]
        if height[r] < h {
            h = height[r]
        }
        if area := h * (r - l); area > ans {
            ans = area
        }
        if height[l] < height[r] {
            l++
        } else {
            r--
        }
    }
    return ans
}`,
      },
      rust: {
        code: `impl Solution {
    pub fn max_area(height: Vec<i32>) -> i32 {
        let mut l = 0usize;
        let mut r = height.len() - 1;
        let mut ans = 0i32;
        while l < r {
            let h = height[l].min(height[r]);
            ans = ans.max(h * (r - l) as i32);
            if height[l] < height[r] { l += 1; } else { r -= 1; }
        }
        ans
    }
}`,
      },
      kotlin: {
        code: `class Solution {
    fun maxArea(height: IntArray): Int {
        var l = 0
        var r = height.size - 1
        var ans = 0
        while (l < r) {
            val h = minOf(height[l], height[r])
            ans = maxOf(ans, h * (r - l))
            if (height[l] < height[r]) l++ else r--
        }
        return ans
    }
}`,
      },
      swift: {
        code: `class Solution {
    func maxArea(_ height: [Int]) -> Int {
        var l = 0, r = height.count - 1, ans = 0
        while l < r {
            let h = min(height[l], height[r])
            ans = max(ans, h * (r - l))
            if height[l] < height[r] { l += 1 } else { r -= 1 }
        }
        return ans
    }
}`,
      },
    },
    complexity: { time: "O(n)", space: "O(1)" },
    keyPoints: "双指针 + 贪心：短板挪动，面试必答「为什么这样贪心是正确的」。",
  },

  /* ============================================================== */
  /*  15. 3Sum (Medium)                                              */
  /* ============================================================== */
  {
    id: 15,
    slug: "3sum",
    titleZh: "三数之和",
    titleEn: "3Sum",
    difficulty: "medium",
    tags: ["数组", "双指针", "排序"],
    description: "数组里找所有不重复的三元组，使其和为 0。",
    officialUrl: "https://leetcode.cn/problems/3sum/",
    approach: `本质：固定一个数 a，剩下变成"两数之和 = -a"。把数组排序后，外层 for 枚举 a，内层用有序数组的双指针 O(n) 找所有配对，总时间 O(n²)。

实现要点：排序是前提。外层 i 从 0 到 n-3，内层 l = i+1, r = n-1。sum = a + b + c 与 0 比较：小了 l 右移，大了 r 左移，等了记录答案后 l 右移 + r 左移。去重的关键：外层 i 跳过与前一位相同的值；内层记录答案后把 l 和 r 分别跳过相同值。不要先去重外层元素后再从原数组做内层，会遗漏解。

陷阱与对比：哈希表做"固定 a 查 b"需要额外处理三元组重复，代码量和常数都比双指针差。朴素三重循环 O(n³)，n = 3000 时超时。排序 + 双指针是"n² 枚举 + 一次排序"的经典模板，kSum 递推都能套。`,
    solutions: {
      c: {
        code: `#include <stdlib.h>

static int cmp(const void* a, const void* b) {
    return *(const int*)a - *(const int*)b;
}

int** threeSum(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {
    qsort(nums, numsSize, sizeof(int), cmp);
    int cap = 16;
    int** ans = (int**)malloc(cap * sizeof(int*));
    int* cols = (int*)malloc(cap * sizeof(int));
    int cnt = 0;
    for (int i = 0; i + 2 < numsSize; ++i) {
        if (nums[i] > 0) break;
        if (i > 0 && nums[i] == nums[i-1]) continue;
        int l = i + 1, r = numsSize - 1;
        while (l < r) {
            int s = nums[i] + nums[l] + nums[r];
            if (s < 0) ++l;
            else if (s > 0) --r;
            else {
                if (cnt == cap) {
                    cap *= 2;
                    ans = (int**)realloc(ans, cap * sizeof(int*));
                    cols = (int*)realloc(cols, cap * sizeof(int));
                }
                int* tri = (int*)malloc(3 * sizeof(int));
                tri[0] = nums[i]; tri[1] = nums[l]; tri[2] = nums[r];
                ans[cnt] = tri;
                cols[cnt] = 3;
                cnt++;
                while (l < r && nums[l] == nums[l+1]) ++l;
                while (l < r && nums[r] == nums[r-1]) --r;
                ++l; --r;
            }
        }
    }
    *returnSize = cnt;
    *returnColumnSizes = cols;
    return ans;
}`,
      },
      cpp: {
        code: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        int n = (int)nums.size();
        vector<vector<int>> ans;
        for (int i = 0; i + 2 < n; ++i) {
            if (nums[i] > 0) break;                    // 最小已正，和必 > 0
            if (i > 0 && nums[i] == nums[i-1]) continue; // 外层去重
            int l = i + 1, r = n - 1;
            while (l < r) {
                int s = nums[i] + nums[l] + nums[r];
                if (s < 0) ++l;
                else if (s > 0) --r;
                else {
                    ans.push_back({nums[i], nums[l], nums[r]});
                    while (l < r && nums[l] == nums[l+1]) ++l; // 内层去重
                    while (l < r && nums[r] == nums[r-1]) --r;
                    ++l; --r;
                }
            }
        }
        return ans;
    }
};`,
      },
      python: {
        code: `from typing import List

class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        n = len(nums)
        ans: List[List[int]] = []
        for i in range(n - 2):
            if nums[i] > 0:
                break
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            l, r = i + 1, n - 1
            while l < r:
                s = nums[i] + nums[l] + nums[r]
                if s < 0:
                    l += 1
                elif s > 0:
                    r -= 1
                else:
                    ans.append([nums[i], nums[l], nums[r]])
                    while l < r and nums[l] == nums[l + 1]:
                        l += 1
                    while l < r and nums[r] == nums[r - 1]:
                        r -= 1
                    l += 1
                    r -= 1
        return ans`,
      },
      java: {
        code: `import java.util.*;

class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        int n = nums.length;
        List<List<Integer>> ans = new ArrayList<>();
        for (int i = 0; i + 2 < n; i++) {
            if (nums[i] > 0) break;
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int l = i + 1, r = n - 1;
            while (l < r) {
                int s = nums[i] + nums[l] + nums[r];
                if (s < 0) l++;
                else if (s > 0) r--;
                else {
                    ans.add(Arrays.asList(nums[i], nums[l], nums[r]));
                    while (l < r && nums[l] == nums[l + 1]) l++;
                    while (l < r && nums[r] == nums[r - 1]) r--;
                    l++; r--;
                }
            }
        }
        return ans;
    }
}`,
      },
      javascript: {
        code: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum = function(nums) {
    nums.sort((a, b) => a - b);
    const ans = [];
    const n = nums.length;
    for (let i = 0; i + 2 < n; i++) {
        if (nums[i] > 0) break;
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        let l = i + 1, r = n - 1;
        while (l < r) {
            const s = nums[i] + nums[l] + nums[r];
            if (s < 0) l++;
            else if (s > 0) r--;
            else {
                ans.push([nums[i], nums[l], nums[r]]);
                while (l < r && nums[l] === nums[l + 1]) l++;
                while (l < r && nums[r] === nums[r - 1]) r--;
                l++; r--;
            }
        }
    }
    return ans;
};`,
      },
      typescript: {
        code: `function threeSum(nums: number[]): number[][] {
    nums.sort((a, b) => a - b);
    const ans: number[][] = [];
    const n = nums.length;
    for (let i = 0; i + 2 < n; i++) {
        if (nums[i] > 0) break;
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        let l = i + 1, r = n - 1;
        while (l < r) {
            const s = nums[i] + nums[l] + nums[r];
            if (s < 0) l++;
            else if (s > 0) r--;
            else {
                ans.push([nums[i], nums[l], nums[r]]);
                while (l < r && nums[l] === nums[l + 1]) l++;
                while (l < r && nums[r] === nums[r - 1]) r--;
                l++; r--;
            }
        }
    }
    return ans;
}`,
      },
      go: {
        code: `import "sort"

func threeSum(nums []int) [][]int {
    sort.Ints(nums)
    n := len(nums)
    var ans [][]int
    for i := 0; i+2 < n; i++ {
        if nums[i] > 0 {
            break
        }
        if i > 0 && nums[i] == nums[i-1] {
            continue
        }
        l, r := i+1, n-1
        for l < r {
            s := nums[i] + nums[l] + nums[r]
            if s < 0 {
                l++
            } else if s > 0 {
                r--
            } else {
                ans = append(ans, []int{nums[i], nums[l], nums[r]})
                for l < r && nums[l] == nums[l+1] {
                    l++
                }
                for l < r && nums[r] == nums[r-1] {
                    r--
                }
                l++
                r--
            }
        }
    }
    return ans
}`,
      },
      rust: {
        code: `impl Solution {
    pub fn three_sum(mut nums: Vec<i32>) -> Vec<Vec<i32>> {
        nums.sort();
        let n = nums.len();
        let mut ans: Vec<Vec<i32>> = Vec::new();
        let mut i = 0;
        while i + 2 < n {
            if nums[i] > 0 { break; }
            if i > 0 && nums[i] == nums[i - 1] { i += 1; continue; }
            let (mut l, mut r) = (i + 1, n - 1);
            while l < r {
                let s = nums[i] + nums[l] + nums[r];
                if s < 0 { l += 1; }
                else if s > 0 { r -= 1; }
                else {
                    ans.push(vec![nums[i], nums[l], nums[r]]);
                    while l < r && nums[l] == nums[l + 1] { l += 1; }
                    while l < r && nums[r] == nums[r - 1] { r -= 1; }
                    l += 1; r -= 1;
                }
            }
            i += 1;
        }
        ans
    }
}`,
      },
      kotlin: {
        code: `class Solution {
    fun threeSum(nums: IntArray): List<List<Int>> {
        nums.sort()
        val n = nums.size
        val ans = mutableListOf<List<Int>>()
        var i = 0
        while (i + 2 < n) {
            if (nums[i] > 0) break
            if (i > 0 && nums[i] == nums[i - 1]) { i++; continue }
            var l = i + 1; var r = n - 1
            while (l < r) {
                val s = nums[i] + nums[l] + nums[r]
                when {
                    s < 0 -> l++
                    s > 0 -> r--
                    else -> {
                        ans.add(listOf(nums[i], nums[l], nums[r]))
                        while (l < r && nums[l] == nums[l + 1]) l++
                        while (l < r && nums[r] == nums[r - 1]) r--
                        l++; r--
                    }
                }
            }
            i++
        }
        return ans
    }
}`,
      },
      swift: {
        code: `class Solution {
    func threeSum(_ nums: [Int]) -> [[Int]] {
        let a = nums.sorted()
        let n = a.count
        var ans: [[Int]] = []
        var i = 0
        while i + 2 < n {
            if a[i] > 0 { break }
            if i > 0 && a[i] == a[i - 1] { i += 1; continue }
            var l = i + 1, r = n - 1
            while l < r {
                let s = a[i] + a[l] + a[r]
                if s < 0 { l += 1 }
                else if s > 0 { r -= 1 }
                else {
                    ans.append([a[i], a[l], a[r]])
                    while l < r && a[l] == a[l + 1] { l += 1 }
                    while l < r && a[r] == a[r - 1] { r -= 1 }
                    l += 1; r -= 1
                }
            }
            i += 1
        }
        return ans
    }
}`,
      },
    },
    complexity: { time: "O(n²)", space: "O(1) —— 排序是就地的，不含答案本身" },
    keyPoints: "排序 + 外层枚举 + 内层双指针 + 三处去重。kSum 通用模板起点。",
  },

  /* ============================================================== */
  /*  20. Valid Parentheses (Easy)                                   */
  /* ============================================================== */
  {
    id: 20,
    slug: "valid-parentheses",
    titleZh: "有效的括号",
    titleEn: "Valid Parentheses",
    difficulty: "easy",
    tags: ["栈", "字符串"],
    description: "判定括号序列是否合法（三种括号类型、正确嵌套配对）。",
    officialUrl: "https://leetcode.cn/problems/valid-parentheses/",
    approach: `本质：括号匹配是"后进先出"的典型栈应用。遇到左括号压栈，遇到右括号看栈顶是否是对应左括号——是则弹栈继续，不是或栈空则直接判非法。

实现要点：用 map 存"右 → 左"配对查询。循环每个字符：左括号直接 push；右括号先判栈空（此时非法），再判栈顶是否匹配（不匹配非法），匹配则 pop。扫完后栈必须为空才合法（否则有多余左括号）。

陷阱与对比：有人试图用计数器（count '(' - count ')'）判合法，在单括号类型时能用，但混合 "([)]" 会误判。栈方案必须显式维护顺序。空字符串通常算合法（视题意而定，LeetCode 官方视为合法）。`,
    solutions: {
      c: {
        code: `#include <stdbool.h>
#include <string.h>
#include <stdlib.h>

bool isValid(char* s) {
    int n = (int)strlen(s);
    char* st = (char*)malloc(n + 1);
    int top = 0;
    for (int i = 0; i < n; ++i) {
        char c = s[i];
        if (c == '(' || c == '[' || c == '{') {
            st[top++] = c;
        } else {
            if (top == 0) { free(st); return false; }
            char l = st[--top];
            if ((c == ')' && l != '(') ||
                (c == ']' && l != '[') ||
                (c == '}' && l != '{')) {
                free(st);
                return false;
            }
        }
    }
    bool ok = (top == 0);
    free(st);
    return ok;
}`,
      },
      cpp: {
        code: `#include <string>
#include <stack>
#include <unordered_map>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        unordered_map<char, char> pair_ = {{')','('}, {']','['}, {'}','{'}};
        stack<char> st;
        for (char c : s) {
            if (c == '(' || c == '[' || c == '{') {
                st.push(c);
            } else {
                if (st.empty() || st.top() != pair_[c]) return false;
                st.pop();
            }
        }
        return st.empty();
    }
};`,
      },
      python: {
        code: `class Solution:
    def isValid(self, s: str) -> bool:
        pair = {")": "(", "]": "[", "}": "{"}
        stack: list[str] = []
        for c in s:
            if c in "([{":
                stack.append(c)
            else:
                if not stack or stack[-1] != pair[c]:
                    return False
                stack.pop()
        return not stack`,
      },
      java: {
        code: `import java.util.ArrayDeque;
import java.util.Deque;

class Solution {
    public boolean isValid(String s) {
        Deque<Character> st = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') {
                st.push(c);
            } else {
                if (st.isEmpty()) return false;
                char l = st.pop();
                if ((c == ')' && l != '(') ||
                    (c == ']' && l != '[') ||
                    (c == '}' && l != '{')) return false;
            }
        }
        return st.isEmpty();
    }
}`,
      },
      javascript: {
        code: `/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    const pair = { ")": "(", "]": "[", "}": "{" };
    const stack = [];
    for (const c of s) {
        if (c === "(" || c === "[" || c === "{") {
            stack.push(c);
        } else {
            if (stack.length === 0 || stack[stack.length - 1] !== pair[c]) {
                return false;
            }
            stack.pop();
        }
    }
    return stack.length === 0;
};`,
      },
      typescript: {
        code: `function isValid(s: string): boolean {
    const pair: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
    const stack: string[] = [];
    for (const c of s) {
        if (c === "(" || c === "[" || c === "{") {
            stack.push(c);
        } else {
            if (stack.length === 0 || stack[stack.length - 1] !== pair[c]) {
                return false;
            }
            stack.pop();
        }
    }
    return stack.length === 0;
}`,
      },
      go: {
        code: `func isValid(s string) bool {
    pair := map[byte]byte{')': '(', ']': '[', '}': '{'}
    stack := make([]byte, 0, len(s))
    for i := 0; i < len(s); i++ {
        c := s[i]
        if c == '(' || c == '[' || c == '{' {
            stack = append(stack, c)
        } else {
            if len(stack) == 0 || stack[len(stack)-1] != pair[c] {
                return false
            }
            stack = stack[:len(stack)-1]
        }
    }
    return len(stack) == 0
}`,
      },
      rust: {
        code: `impl Solution {
    pub fn is_valid(s: String) -> bool {
        let mut stack: Vec<char> = Vec::new();
        for c in s.chars() {
            match c {
                '(' | '[' | '{' => stack.push(c),
                ')' => if stack.pop() != Some('(') { return false; },
                ']' => if stack.pop() != Some('[') { return false; },
                '}' => if stack.pop() != Some('{') { return false; },
                _ => {}
            }
        }
        stack.is_empty()
    }
}`,
      },
      kotlin: {
        code: `class Solution {
    fun isValid(s: String): Boolean {
        val stack = ArrayDeque<Char>()
        val pair = mapOf(')' to '(', ']' to '[', '}' to '{')
        for (c in s) {
            if (c == '(' || c == '[' || c == '{') {
                stack.addLast(c)
            } else {
                if (stack.isEmpty() || stack.last() != pair[c]) return false
                stack.removeLast()
            }
        }
        return stack.isEmpty()
    }
}`,
      },
      swift: {
        code: `class Solution {
    func isValid(_ s: String) -> Bool {
        let pair: [Character: Character] = [")": "(", "]": "[", "}": "{"]
        var stack: [Character] = []
        for c in s {
            if c == "(" || c == "[" || c == "{" {
                stack.append(c)
            } else {
                if stack.isEmpty || stack.last! != pair[c]! { return false }
                stack.removeLast()
            }
        }
        return stack.isEmpty
    }
}`,
      },
    },
    complexity: { time: "O(n)", space: "O(n)" },
    keyPoints: "栈 LIFO 天然匹配括号嵌套。计数器法在多种括号混合时失效。",
  },

  /* ============================================================== */
  /*  21. Merge Two Sorted Lists (Easy)                              */
  /* ============================================================== */
  {
    id: 21,
    slug: "merge-two-sorted-lists",
    titleZh: "合并两个有序链表",
    titleEn: "Merge Two Sorted Lists",
    difficulty: "easy",
    tags: ["链表", "递归"],
    description: "两个升序链表合并为一个升序链表，返回新链表头。",
    officialUrl: "https://leetcode.cn/problems/merge-two-sorted-lists/",
    approach: `本质：双指针同时扫两个链表，每次把较小节点接到结果尾。因为两链表本身有序，只要局部挑小即可保证结果整体有序。

实现要点：用哑结点（dummy）简化"第一个节点"的特殊处理。维护 tail 指向当前结果末尾，循环比较 l1.val 和 l2.val，挑小的接到 tail.next，对应指针前进一步。跳出循环时把尚未遍历完的那个链表整体接在 tail 后（不要漏）。

陷阱与对比：不用 dummy 会让"选 l1 或 l2 作为初始头"这段代码产生分支膨胀。纯递归也能做（每次返回"较小的 + 递归合并剩下"），代码更短但 O(n + m) 栈空间；迭代 O(1) 空间更稳。拷贝节点会生成新链表、多用 O(n+m) 空间，通常只需重排原节点指针。`,
    solutions: {
      c: {
        code: `#include <stdlib.h>

struct ListNode {
    int val;
    struct ListNode *next;
};

struct ListNode* mergeTwoLists(struct ListNode* list1, struct ListNode* list2) {
    struct ListNode dummy;
    dummy.next = NULL;
    struct ListNode* tail = &dummy;
    while (list1 && list2) {
        if (list1->val <= list2->val) {
            tail->next = list1; list1 = list1->next;
        } else {
            tail->next = list2; list2 = list2->next;
        }
        tail = tail->next;
    }
    tail->next = list1 ? list1 : list2;
    return dummy.next;
}`,
      },
      cpp: {
        code: `#include <cstddef>

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *n) : val(x), next(n) {}
};

class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        ListNode dummy;
        ListNode* tail = &dummy;
        while (list1 && list2) {
            if (list1->val <= list2->val) {
                tail->next = list1; list1 = list1->next;
            } else {
                tail->next = list2; list2 = list2->next;
            }
            tail = tail->next;
        }
        tail->next = list1 ? list1 : list2; // 接剩下的
        return dummy.next;
    }
};`,
      },
      python: {
        code: `from typing import Optional

class ListNode:
    def __init__(self, val: int = 0, next: "Optional[ListNode]" = None):
        self.val = val
        self.next = next

class Solution:
    def mergeTwoLists(
        self,
        list1: Optional[ListNode],
        list2: Optional[ListNode],
    ) -> Optional[ListNode]:
        dummy = ListNode()
        tail = dummy
        while list1 and list2:
            if list1.val <= list2.val:
                tail.next = list1
                list1 = list1.next
            else:
                tail.next = list2
                list2 = list2.next
            tail = tail.next
        tail.next = list1 if list1 else list2
        return dummy.next`,
      },
      java: {
        code: `// Definition for singly-linked list (LeetCode 提供):
// public class ListNode {
//     int val; ListNode next;
//     ListNode() {}
//     ListNode(int val) { this.val = val; }
//     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
// }
class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        ListNode dummy = new ListNode();
        ListNode tail = dummy;
        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) {
                tail.next = list1; list1 = list1.next;
            } else {
                tail.next = list2; list2 = list2.next;
            }
            tail = tail.next;
        }
        tail.next = (list1 != null) ? list1 : list2;
        return dummy.next;
    }
}`,
      },
      javascript: {
        code: `/**
 * Definition for singly-linked list:
 * function ListNode(val, next) {
 *     this.val = (val === undefined ? 0 : val);
 *     this.next = (next === undefined ? null : next);
 * }
 *
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
var mergeTwoLists = function(list1, list2) {
    const dummy = { val: 0, next: null };
    let tail = dummy;
    while (list1 && list2) {
        if (list1.val <= list2.val) {
            tail.next = list1; list1 = list1.next;
        } else {
            tail.next = list2; list2 = list2.next;
        }
        tail = tail.next;
    }
    tail.next = list1 || list2;
    return dummy.next;
};`,
      },
      typescript: {
        code: `class ListNode {
    val: number;
    next: ListNode | null;
    constructor(val?: number, next?: ListNode | null) {
        this.val = val ?? 0;
        this.next = next ?? null;
    }
}

function mergeTwoLists(
    list1: ListNode | null,
    list2: ListNode | null
): ListNode | null {
    const dummy = new ListNode();
    let tail = dummy;
    while (list1 && list2) {
        if (list1.val <= list2.val) {
            tail.next = list1; list1 = list1.next;
        } else {
            tail.next = list2; list2 = list2.next;
        }
        tail = tail.next;
    }
    tail.next = list1 ?? list2;
    return dummy.next;
}`,
      },
      go: {
        code: `// Definition for singly-linked list (LeetCode 提供):
// type ListNode struct {
//     Val  int
//     Next *ListNode
// }
func mergeTwoLists(list1 *ListNode, list2 *ListNode) *ListNode {
    dummy := &ListNode{}
    tail := dummy
    for list1 != nil && list2 != nil {
        if list1.Val <= list2.Val {
            tail.Next = list1
            list1 = list1.Next
        } else {
            tail.Next = list2
            list2 = list2.Next
        }
        tail = tail.Next
    }
    if list1 != nil {
        tail.Next = list1
    } else {
        tail.Next = list2
    }
    return dummy.Next
}`,
      },
      rust: {
        code: `// LeetCode Rust 链表节点用 Option<Box<ListNode>>，必须用 take() 转移所有权。
// Definition for singly-linked list:
// #[derive(PartialEq, Eq, Clone, Debug)]
// pub struct ListNode {
//     pub val: i32,
//     pub next: Option<Box<ListNode>>,
// }
// impl ListNode {
//     #[inline]
//     fn new(val: i32) -> Self { ListNode { next: None, val } }
// }
impl Solution {
    pub fn merge_two_lists(
        list1: Option<Box<ListNode>>,
        mut list2: Option<Box<ListNode>>,
    ) -> Option<Box<ListNode>> {
        let mut dummy = Box::new(ListNode::new(0));
        let mut tail = &mut dummy;
        let mut l1 = list1;
        while let (Some(a), Some(b)) = (l1.as_ref(), list2.as_ref()) {
            if a.val <= b.val {
                let mut node = l1.take().unwrap();
                l1 = node.next.take();
                tail.next = Some(node);
            } else {
                let mut node = list2.take().unwrap();
                list2 = node.next.take();
                tail.next = Some(node);
            }
            tail = tail.next.as_mut().unwrap();
        }
        tail.next = if l1.is_some() { l1 } else { list2 };
        dummy.next
    }
}`,
        comment:
          "Rust ownership 限制：必须用 take() 把 Option<Box> 取出再嫁接，否则借用检查不通过。",
      },
      kotlin: {
        code: `// Definition for singly-linked list (LeetCode 提供):
// class ListNode(var \`val\`: Int) {
//     var next: ListNode? = null
// }
class Solution {
    fun mergeTwoLists(list1: ListNode?, list2: ListNode?): ListNode? {
        val dummy = ListNode(0)
        var tail = dummy
        var l1 = list1
        var l2 = list2
        while (l1 != null && l2 != null) {
            if (l1.\`val\` <= l2.\`val\`) {
                tail.next = l1; l1 = l1.next
            } else {
                tail.next = l2; l2 = l2.next
            }
            tail = tail.next!!
        }
        tail.next = l1 ?: l2
        return dummy.next
    }
}`,
      },
      swift: {
        code: `// Definition for singly-linked list (LeetCode 提供):
// public class ListNode {
//     public var val: Int
//     public var next: ListNode?
//     public init() { self.val = 0; self.next = nil }
//     public init(_ val: Int) { self.val = val; self.next = nil }
//     public init(_ val: Int, _ next: ListNode?) { self.val = val; self.next = next }
// }
class Solution {
    func mergeTwoLists(_ list1: ListNode?, _ list2: ListNode?) -> ListNode? {
        let dummy = ListNode()
        var tail = dummy
        var l1 = list1
        var l2 = list2
        while let a = l1, let b = l2 {
            if a.val <= b.val {
                tail.next = a; l1 = a.next
            } else {
                tail.next = b; l2 = b.next
            }
            tail = tail.next!
        }
        tail.next = l1 ?? l2
        return dummy.next
    }
}`,
      },
    },
    complexity: { time: "O(n + m)", space: "O(1)" },
    keyPoints: "哑结点消除首节点分支，迭代 O(1) 空间优于递归 O(n+m) 栈。",
  },

  /* ============================================================== */
  /*  53. Maximum Subarray (Medium)                                  */
  /* ============================================================== */
  {
    id: 53,
    slug: "maximum-subarray",
    titleZh: "最大子数组和",
    titleEn: "Maximum Subarray",
    difficulty: "medium",
    tags: ["数组", "DP"],
    description: "在整数数组里找一段连续子数组，使其元素之和最大。",
    officialUrl: "https://leetcode.cn/problems/maximum-subarray/",
    approach: `本质：Kadane 算法 / 一维 DP。设 f(i) = "以 i 结尾的最大子数组和"，则 f(i) = max(nums[i], f(i-1) + nums[i])——要么和前面拼，要么独立重开。答案是所有 f(i) 的最大值。

实现要点：只需滚动变量 cur 存 f(i-1)。循环里 cur = max(nums[i], cur + nums[i])，同时 ans = max(ans, cur)。cur 初始化为 nums[0]，ans 也是。注意数组全为负数时答案是最大的那个负数，不是 0，所以答案初始化不能设 0。

陷阱与对比：朴素枚举起点 + 终点 + 求和 O(n³)。前缀和 + 枚举 O(n²)。Kadane O(n) 是最优。分治法 O(n log n) 能做但不划算。面试追问通常是"返回子数组本身"——需要额外记录每次 cur 重开的起点。`,
    solutions: {
      c: {
        code: `int maxSubArray(int* nums, int numsSize) {
    int cur = nums[0], ans = nums[0];
    for (int i = 1; i < numsSize; ++i) {
        cur = nums[i] + (cur > 0 ? cur : 0);
        if (cur > ans) ans = cur;
    }
    return ans;
}`,
      },
      cpp: {
        code: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int cur = nums[0], ans = nums[0];
        for (int i = 1; i < (int)nums.size(); ++i) {
            cur = max(nums[i], cur + nums[i]);
            ans = max(ans, cur);
        }
        return ans;
    }
};`,
      },
      python: {
        code: `from typing import List

class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        cur = ans = nums[0]
        for i in range(1, len(nums)):
            cur = nums[i] if cur < 0 else cur + nums[i]
            if cur > ans:
                ans = cur
        return ans`,
      },
      java: {
        code: `class Solution {
    public int maxSubArray(int[] nums) {
        int cur = nums[0], ans = nums[0];
        for (int i = 1; i < nums.length; i++) {
            cur = Math.max(nums[i], cur + nums[i]);
            ans = Math.max(ans, cur);
        }
        return ans;
    }
}`,
      },
      javascript: {
        code: `/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
    let cur = nums[0], ans = nums[0];
    for (let i = 1; i < nums.length; i++) {
        cur = Math.max(nums[i], cur + nums[i]);
        ans = Math.max(ans, cur);
    }
    return ans;
};`,
      },
      typescript: {
        code: `function maxSubArray(nums: number[]): number {
    let cur = nums[0], ans = nums[0];
    for (let i = 1; i < nums.length; i++) {
        cur = Math.max(nums[i], cur + nums[i]);
        ans = Math.max(ans, cur);
    }
    return ans;
}`,
      },
      go: {
        code: `func maxSubArray(nums []int) int {
    cur, ans := nums[0], nums[0]
    for i := 1; i < len(nums); i++ {
        if cur < 0 {
            cur = nums[i]
        } else {
            cur += nums[i]
        }
        if cur > ans {
            ans = cur
        }
    }
    return ans
}`,
      },
      rust: {
        code: `impl Solution {
    pub fn max_sub_array(nums: Vec<i32>) -> i32 {
        let mut cur = nums[0];
        let mut ans = nums[0];
        for i in 1..nums.len() {
            cur = nums[i].max(cur + nums[i]);
            ans = ans.max(cur);
        }
        ans
    }
}`,
      },
      kotlin: {
        code: `class Solution {
    fun maxSubArray(nums: IntArray): Int {
        var cur = nums[0]
        var ans = nums[0]
        for (i in 1 until nums.size) {
            cur = maxOf(nums[i], cur + nums[i])
            ans = maxOf(ans, cur)
        }
        return ans
    }
}`,
      },
      swift: {
        code: `class Solution {
    func maxSubArray(_ nums: [Int]) -> Int {
        var cur = nums[0], ans = nums[0]
        for i in 1..<nums.count {
            cur = max(nums[i], cur + nums[i])
            ans = max(ans, cur)
        }
        return ans
    }
}`,
      },
    },
    complexity: { time: "O(n)", space: "O(1)" },
    keyPoints: "Kadane：以 i 结尾的最大和只依赖前一位，滚动变量 O(1) 空间。",
  },

  /* ============================================================== */
  /*  70. Climbing Stairs (Easy)                                     */
  /* ============================================================== */
  {
    id: 70,
    slug: "climbing-stairs",
    titleZh: "爬楼梯",
    titleEn: "Climbing Stairs",
    difficulty: "easy",
    tags: ["DP", "递推"],
    description: "每次上 1 或 2 阶，问爬 n 阶楼梯的不同方法数。",
    officialUrl: "https://leetcode.cn/problems/climbing-stairs/",
    approach: `本质：到第 n 阶的方法数 = 从第 n-1 阶跨 1 来 + 从第 n-2 阶跨 2 来。这就是斐波那契 f(n) = f(n-1) + f(n-2)，边界 f(1) = 1, f(2) = 2。

实现要点：只需滚动两个变量 a = f(n-2), b = f(n-1)，每步 c = a + b，然后 a = b, b = c。O(1) 空间。n = 1 / 2 可以直接返回或放进循环基底让循环统一处理。

陷阱与对比：直接递归 T(n) = T(n-1) + T(n-2) 是指数时间，n = 30 就明显卡。加记忆化就是 DP 的雏形 O(n) 时间 O(n) 空间。进一步滚动优化到 O(1) 空间。真要炫技可以写矩阵快速幂 O(log n)，但面试过度。`,
    solutions: {
      c: {
        code: `int climbStairs(int n) {
    if (n <= 2) return n;
    int a = 1, b = 2;
    for (int i = 3; i <= n; ++i) {
        int c = a + b;
        a = b;
        b = c;
    }
    return b;
}`,
      },
      cpp: {
        code: `class Solution {
public:
    int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; ++i) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }
};`,
      },
      python: {
        code: `class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n
        a, b = 1, 2
        for _ in range(3, n + 1):
            a, b = b, a + b
        return b`,
      },
      java: {
        code: `class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }
}`,
      },
      javascript: {
        code: `/**
 * @param {number} n
 * @return {number}
 */
var climbStairs = function(n) {
    if (n <= 2) return n;
    let a = 1, b = 2;
    for (let i = 3; i <= n; i++) {
        const c = a + b;
        a = b;
        b = c;
    }
    return b;
};`,
      },
      typescript: {
        code: `function climbStairs(n: number): number {
    if (n <= 2) return n;
    let a = 1, b = 2;
    for (let i = 3; i <= n; i++) {
        const c = a + b;
        a = b;
        b = c;
    }
    return b;
}`,
      },
      go: {
        code: `func climbStairs(n int) int {
    if n <= 2 {
        return n
    }
    a, b := 1, 2
    for i := 3; i <= n; i++ {
        a, b = b, a+b
    }
    return b
}`,
      },
      rust: {
        code: `impl Solution {
    pub fn climb_stairs(n: i32) -> i32 {
        if n <= 2 { return n; }
        let (mut a, mut b) = (1, 2);
        for _ in 3..=n {
            let c = a + b;
            a = b;
            b = c;
        }
        b
    }
}`,
      },
      kotlin: {
        code: `class Solution {
    fun climbStairs(n: Int): Int {
        if (n <= 2) return n
        var a = 1
        var b = 2
        for (i in 3..n) {
            val c = a + b
            a = b
            b = c
        }
        return b
    }
}`,
      },
      swift: {
        code: `class Solution {
    func climbStairs(_ n: Int) -> Int {
        if n <= 2 { return n }
        var a = 1, b = 2
        for _ in 3...n {
            let c = a + b
            a = b
            b = c
        }
        return b
    }
}`,
      },
    },
    complexity: { time: "O(n)", space: "O(1)" },
    keyPoints: "斐波那契递推。DP 启蒙题，理解「当前状态只依赖常数个前置状态」。",
  },

  /* ============================================================== */
  /*  206. Reverse Linked List (Easy)                                */
  /* ============================================================== */
  {
    id: 206,
    slug: "reverse-linked-list",
    titleZh: "反转链表",
    titleEn: "Reverse Linked List",
    difficulty: "easy",
    tags: ["链表", "双指针", "递归"],
    description: "原地反转单链表，返回新头节点。",
    officialUrl: "https://leetcode.cn/problems/reverse-linked-list/",
    approach: `本质：逐节点把 next 指针翻方向。维护三指针 prev / curr / next，先用 next 记住原来的下一个（不记就断了），再把 curr.next 指向 prev，最后把 prev 和 curr 都前进一步。

实现要点：prev 初始为 nullptr（反转后这就是新尾的 next）。循环条件 curr != nullptr。四行内核：next = curr.next; curr.next = prev; prev = curr; curr = next; 退出后 prev 指向新头。

陷阱与对比：不保存 next 直接改 curr.next，下一步没法往后走。递归方案代码更短（反转子链后让 head.next.next = head; head.next = nullptr）但 O(n) 栈空间，迭代 O(1) 更通用。带头节点的双向链表题型也是这套思路的推广。`,
    solutions: {
      c: {
        code: `struct ListNode {
    int val;
    struct ListNode *next;
};

struct ListNode* reverseList(struct ListNode* head) {
    struct ListNode *prev = NULL, *curr = head;
    while (curr) {
        struct ListNode *next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
      },
      cpp: {
        code: `#include <cstddef>

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *n) : val(x), next(n) {}
};

class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        ListNode* curr = head;
        while (curr) {
            ListNode* next = curr->next;
            curr->next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
};`,
      },
      python: {
        code: `from typing import Optional

class ListNode:
    def __init__(self, val: int = 0, next: "Optional[ListNode]" = None):
        self.val = val
        self.next = next

class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev: Optional[ListNode] = None
        curr = head
        while curr is not None:
            nxt = curr.next
            curr.next = prev
            prev = curr
            curr = nxt
        return prev`,
      },
      java: {
        code: `class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null, curr = head;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
}`,
      },
      javascript: {
        code: `/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function(head) {
    let prev = null, curr = head;
    while (curr) {
        const next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
};`,
      },
      typescript: {
        code: `function reverseList(head: ListNode | null): ListNode | null {
    let prev: ListNode | null = null;
    let curr: ListNode | null = head;
    while (curr) {
        const next: ListNode | null = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
      },
      go: {
        code: `func reverseList(head *ListNode) *ListNode {
    var prev *ListNode
    curr := head
    for curr != nil {
        next := curr.Next
        curr.Next = prev
        prev = curr
        curr = next
    }
    return prev
}`,
      },
      rust: {
        code: `// Rust 链表也用 Option<Box<ListNode>>，take() 取出再重组。
impl Solution {
    pub fn reverse_list(head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
        let mut prev: Option<Box<ListNode>> = None;
        let mut curr = head;
        while let Some(mut node) = curr {
            let next = node.next.take();
            node.next = prev;
            prev = Some(node);
            curr = next;
        }
        prev
    }
}`,
        comment: "Rust ownership: take() 把 next 取出转移所有权，再嫁接到 prev 链上。",
      },
      kotlin: {
        code: `class Solution {
    fun reverseList(head: ListNode?): ListNode? {
        var prev: ListNode? = null
        var curr = head
        while (curr != null) {
            val next = curr.next
            curr.next = prev
            prev = curr
            curr = next
        }
        return prev
    }
}`,
      },
      swift: {
        code: `class Solution {
    func reverseList(_ head: ListNode?) -> ListNode? {
        var prev: ListNode? = nil
        var curr = head
        while let node = curr {
            let next = node.next
            node.next = prev
            prev = node
            curr = next
        }
        return prev
    }
}`,
      },
    },
    complexity: { time: "O(n)", space: "O(1)" },
    keyPoints: "三指针迭代：先存 next，再改 curr.next，最后推进。",
  },

  /* ============================================================== */
  /*  17. Letter Combinations of a Phone Number (Medium)             */
  /* ============================================================== */
  {
    id: 17,
    slug: "letter-combinations-of-a-phone-number",
    titleZh: "电话号码的字母组合",
    titleEn: "Letter Combinations of a Phone Number",
    difficulty: "medium",
    tags: ["回溯", "字符串", "哈希表"],
    description: "数字串（2-9）按九宫格映射到字母，输出所有可能的字母组合。",
    officialUrl: "https://leetcode.cn/problems/letter-combinations-of-a-phone-number/",
    approach: `本质：每个数字对应一组候选字母，n 个数字就要做 n 层选择，每层从该数字对应的 3-4 个字母里挑一个。这是典型的"多叉树枚举"，回溯就是按层 DFS 每条路径。

实现要点：先建数字到字母的映射表（'2'->"abc" 等）。回溯函数维护一个当前路径 path 和当前层下标 idx。idx == digits.length 时把 path 加进结果；否则取 digits[idx] 对应的字母集合，每个字母 push、递归、pop。空串特判直接返回空数组。

陷阱与对比：BFS 队列也能做，但代码更长。乘积式枚举（笛卡尔积）写起来不如回溯通用，且无法附带剪枝。规模上限 4^4 = 256 很小，不需要剪枝优化。注意 path 容量预分配可以省掉小开销。`,
    solutions: {
      c: {
        code: `#include <stdlib.h>
#include <string.h>

static const char* MAP[10] = {
    "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"
};

static void dfs(const char* digits, int idx, int n,
                char* path, char** ans, int* cnt, int* cap) {
    if (idx == n) {
        if (*cnt == *cap) {
            *cap *= 2;
            ans = (char**)realloc(ans, (*cap) * sizeof(char*));
        }
        char* s = (char*)malloc(n + 1);
        memcpy(s, path, n);
        s[n] = '\\0';
        ans[*cnt] = s;
        (*cnt)++;
        return;
    }
    const char* letters = MAP[digits[idx] - '0'];
    for (int i = 0; letters[i]; ++i) {
        path[idx] = letters[i];
        dfs(digits, idx + 1, n, path, ans, cnt, cap);
    }
}

char** letterCombinations(char* digits, int* returnSize) {
    int n = (int)strlen(digits);
    if (n == 0) { *returnSize = 0; return (char**)malloc(0); }
    int cap = 16;
    char** ans = (char**)malloc(cap * sizeof(char*));
    char* path = (char*)malloc(n + 1);
    int cnt = 0;
    /* dfs may realloc; pass through by re-fetch is awkward in C, use static cap large enough */
    /* 简化：用足够大初始 cap = 4^n 上限 */
    free(ans);
    cap = 1;
    for (int i = 0; i < n; ++i) cap *= 4;
    ans = (char**)malloc(cap * sizeof(char*));
    dfs(digits, 0, n, path, ans, &cnt, &cap);
    free(path);
    *returnSize = cnt;
    return ans;
}`,
      },
      cpp: {
        code: `#include <vector>
#include <string>
using namespace std;

class Solution {
    static constexpr const char* MAP[10] = {
        "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"
    };
    void dfs(const string& digits, int idx, string& path, vector<string>& ans) {
        if (idx == (int)digits.size()) { ans.push_back(path); return; }
        for (char c : string(MAP[digits[idx] - '0'])) {
            path.push_back(c);
            dfs(digits, idx + 1, path, ans);
            path.pop_back();
        }
    }
public:
    vector<string> letterCombinations(string digits) {
        vector<string> ans;
        if (digits.empty()) return ans;
        string path;
        path.reserve(digits.size());
        dfs(digits, 0, path, ans);
        return ans;
    }
};`,
      },
      python: {
        code: `from typing import List

class Solution:
    MAP = {
        "2": "abc", "3": "def", "4": "ghi", "5": "jkl",
        "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz",
    }

    def letterCombinations(self, digits: str) -> List[str]:
        if not digits:
            return []
        ans: List[str] = []
        path: List[str] = []

        def dfs(idx: int) -> None:
            if idx == len(digits):
                ans.append("".join(path))
                return
            for c in Solution.MAP[digits[idx]]:
                path.append(c)
                dfs(idx + 1)
                path.pop()

        dfs(0)
        return ans`,
      },
      java: {
        code: `import java.util.*;

class Solution {
    private static final String[] MAP = {
        "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"
    };

    public List<String> letterCombinations(String digits) {
        List<String> ans = new ArrayList<>();
        if (digits.isEmpty()) return ans;
        dfs(digits, 0, new StringBuilder(), ans);
        return ans;
    }

    private void dfs(String digits, int idx, StringBuilder path, List<String> ans) {
        if (idx == digits.length()) {
            ans.add(path.toString());
            return;
        }
        for (char c : MAP[digits.charAt(idx) - '0'].toCharArray()) {
            path.append(c);
            dfs(digits, idx + 1, path, ans);
            path.deleteCharAt(path.length() - 1);
        }
    }
}`,
      },
      javascript: {
        code: `/**
 * @param {string} digits
 * @return {string[]}
 */
var letterCombinations = function(digits) {
    if (!digits) return [];
    const MAP = {
        "2": "abc", "3": "def", "4": "ghi", "5": "jkl",
        "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz",
    };
    const ans = [];
    const path = [];
    const dfs = (idx) => {
        if (idx === digits.length) { ans.push(path.join("")); return; }
        for (const c of MAP[digits[idx]]) {
            path.push(c);
            dfs(idx + 1);
            path.pop();
        }
    };
    dfs(0);
    return ans;
};`,
      },
      typescript: {
        code: `function letterCombinations(digits: string): string[] {
    if (!digits) return [];
    const MAP: Record<string, string> = {
        "2": "abc", "3": "def", "4": "ghi", "5": "jkl",
        "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz",
    };
    const ans: string[] = [];
    const path: string[] = [];
    const dfs = (idx: number): void => {
        if (idx === digits.length) { ans.push(path.join("")); return; }
        for (const c of MAP[digits[idx]]) {
            path.push(c);
            dfs(idx + 1);
            path.pop();
        }
    };
    dfs(0);
    return ans;
}`,
      },
      go: {
        code: `func letterCombinations(digits string) []string {
    if len(digits) == 0 {
        return []string{}
    }
    m := map[byte]string{
        '2': "abc", '3': "def", '4': "ghi", '5': "jkl",
        '6': "mno", '7': "pqrs", '8': "tuv", '9': "wxyz",
    }
    var ans []string
    path := make([]byte, 0, len(digits))
    var dfs func(int)
    dfs = func(idx int) {
        if idx == len(digits) {
            ans = append(ans, string(path))
            return
        }
        for i := 0; i < len(m[digits[idx]]); i++ {
            path = append(path, m[digits[idx]][i])
            dfs(idx + 1)
            path = path[:len(path)-1]
        }
    }
    dfs(0)
    return ans
}`,
      },
      rust: {
        code: `impl Solution {
    pub fn letter_combinations(digits: String) -> Vec<String> {
        if digits.is_empty() { return vec![]; }
        let map: [&str; 10] = [
            "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz",
        ];
        let bytes: Vec<usize> = digits.bytes().map(|b| (b - b'0') as usize).collect();
        let mut ans: Vec<String> = Vec::new();
        let mut path: Vec<u8> = Vec::with_capacity(bytes.len());
        fn dfs(idx: usize, bytes: &[usize], map: &[&str; 10],
               path: &mut Vec<u8>, ans: &mut Vec<String>) {
            if idx == bytes.len() {
                ans.push(String::from_utf8(path.clone()).unwrap());
                return;
            }
            for &c in map[bytes[idx]].as_bytes() {
                path.push(c);
                dfs(idx + 1, bytes, map, path, ans);
                path.pop();
            }
        }
        dfs(0, &bytes, &map, &mut path, &mut ans);
        ans
    }
}`,
      },
      kotlin: {
        code: `class Solution {
    private val map = mapOf(
        '2' to "abc", '3' to "def", '4' to "ghi", '5' to "jkl",
        '6' to "mno", '7' to "pqrs", '8' to "tuv", '9' to "wxyz",
    )

    fun letterCombinations(digits: String): List<String> {
        if (digits.isEmpty()) return emptyList()
        val ans = mutableListOf<String>()
        val path = StringBuilder()
        fun dfs(idx: Int) {
            if (idx == digits.length) { ans.add(path.toString()); return }
            for (c in map[digits[idx]]!!) {
                path.append(c)
                dfs(idx + 1)
                path.deleteCharAt(path.length - 1)
            }
        }
        dfs(0)
        return ans
    }
}`,
      },
      swift: {
        code: `class Solution {
    func letterCombinations(_ digits: String) -> [String] {
        if digits.isEmpty { return [] }
        let map: [Character: String] = [
            "2": "abc", "3": "def", "4": "ghi", "5": "jkl",
            "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz",
        ]
        let arr = Array(digits)
        var ans: [String] = []
        var path: [Character] = []
        func dfs(_ idx: Int) {
            if idx == arr.count { ans.append(String(path)); return }
            for c in map[arr[idx]]! {
                path.append(c)
                dfs(idx + 1)
                path.removeLast()
            }
        }
        dfs(0)
        return ans
    }
}`,
      },
    },
    complexity: { time: "O(4^n · n)", space: "O(n) 递归栈" },
    keyPoints: "数字到字母映射表 + 回溯按层 DFS，path 增删保持当前路径状态。",
  },

  /* ============================================================== */
  /*  19. Remove Nth Node From End of List (Medium)                  */
  /* ============================================================== */
  {
    id: 19,
    slug: "remove-nth-node-from-end-of-list",
    titleZh: "删除链表的倒数第 N 个结点",
    titleEn: "Remove Nth Node From End of List",
    difficulty: "medium",
    tags: ["链表", "双指针"],
    description: "单链表里删除倒数第 n 个节点，返回新头节点。",
    officialUrl: "https://leetcode.cn/problems/remove-nth-node-from-end-of-list/",
    approach: `本质：链表无法随机访问，要在一次遍历内定位倒数第 n 个节点，用快慢指针保持 n 步差距。快指针先走 n 步，再两个一起走，快指针到尾时慢指针正好停在被删节点的前一个。

实现要点：dummy 哑节点指向 head，能统一处理"删除头节点"的边界。fast 从 dummy 出发先走 n 步，slow 从 dummy 出发；然后两者同步前进直到 fast.next == null。此时 slow.next 就是要删的节点，slow.next = slow.next.next 即可。最后返回 dummy.next。

陷阱与对比：两次遍历（先求长度 L 再删第 L-n+1 个）也可，但题目鼓励一次遍历。fast 不用 dummy 起步会让"删头"特例难处理。n 一定合法（题目保证），不需要边界检查；但 fast 走 n 步前要确认非空，工程代码会加防御。`,
    solutions: {
      c: {
        code: `#include <stdlib.h>

struct ListNode {
    int val;
    struct ListNode *next;
};

struct ListNode* removeNthFromEnd(struct ListNode* head, int n) {
    struct ListNode dummy;
    dummy.next = head;
    struct ListNode *fast = &dummy, *slow = &dummy;
    for (int i = 0; i < n; ++i) fast = fast->next;
    while (fast->next) { fast = fast->next; slow = slow->next; }
    struct ListNode* del = slow->next;
    slow->next = del->next;
    free(del);
    return dummy.next;
}`,
      },
      cpp: {
        code: `#include <cstddef>

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *n) : val(x), next(n) {}
};

class Solution {
public:
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        ListNode dummy(0, head);
        ListNode *fast = &dummy, *slow = &dummy;
        for (int i = 0; i < n; ++i) fast = fast->next;
        while (fast->next) { fast = fast->next; slow = slow->next; }
        ListNode* del = slow->next;
        slow->next = del->next;
        delete del;
        return dummy.next;
    }
};`,
      },
      python: {
        code: `from typing import Optional

class ListNode:
    def __init__(self, val: int = 0, next: "Optional[ListNode]" = None):
        self.val = val
        self.next = next

class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        fast: Optional[ListNode] = dummy
        slow: Optional[ListNode] = dummy
        for _ in range(n):
            assert fast is not None
            fast = fast.next
        while fast and fast.next:
            fast = fast.next
            assert slow is not None
            slow = slow.next
        assert slow is not None and slow.next is not None
        slow.next = slow.next.next
        return dummy.next`,
      },
      java: {
        code: `// Definition for singly-linked list (LeetCode 提供):
// public class ListNode {
//     int val; ListNode next;
//     ListNode() {}
//     ListNode(int val) { this.val = val; }
//     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
// }
class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode dummy = new ListNode(0, head);
        ListNode fast = dummy, slow = dummy;
        for (int i = 0; i < n; i++) fast = fast.next;
        while (fast.next != null) { fast = fast.next; slow = slow.next; }
        slow.next = slow.next.next;
        return dummy.next;
    }
}`,
      },
      javascript: {
        code: `/**
 * Definition for singly-linked list:
 * function ListNode(val, next) {
 *     this.val = (val === undefined ? 0 : val);
 *     this.next = (next === undefined ? null : next);
 * }
 *
 * @param {ListNode} head
 * @param {number} n
 * @return {ListNode}
 */
var removeNthFromEnd = function(head, n) {
    const dummy = { val: 0, next: head };
    let fast = dummy, slow = dummy;
    for (let i = 0; i < n; i++) fast = fast.next;
    while (fast.next) { fast = fast.next; slow = slow.next; }
    slow.next = slow.next.next;
    return dummy.next;
};`,
      },
      typescript: {
        code: `class ListNode {
    val: number;
    next: ListNode | null;
    constructor(val?: number, next?: ListNode | null) {
        this.val = val ?? 0;
        this.next = next ?? null;
    }
}

function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
    const dummy = new ListNode(0, head);
    let fast: ListNode | null = dummy;
    let slow: ListNode = dummy;
    for (let i = 0; i < n; i++) fast = fast!.next;
    while (fast!.next) { fast = fast!.next; slow = slow.next!; }
    slow.next = slow.next!.next;
    return dummy.next;
}`,
      },
      go: {
        code: `// Definition for singly-linked list (LeetCode 提供):
// type ListNode struct {
//     Val  int
//     Next *ListNode
// }
func removeNthFromEnd(head *ListNode, n int) *ListNode {
    dummy := &ListNode{Next: head}
    fast, slow := dummy, dummy
    for i := 0; i < n; i++ {
        fast = fast.Next
    }
    for fast.Next != nil {
        fast = fast.Next
        slow = slow.Next
    }
    slow.Next = slow.Next.Next
    return dummy.Next
}`,
      },
      rust: {
        code: `// LeetCode Rust 链表节点：
// #[derive(PartialEq, Eq, Clone, Debug)]
// pub struct ListNode {
//     pub val: i32,
//     pub next: Option<Box<ListNode>>,
// }
// impl ListNode {
//     #[inline] fn new(val: i32) -> Self { ListNode { next: None, val } }
// }
impl Solution {
    pub fn remove_nth_from_end(head: Option<Box<ListNode>>, n: i32) -> Option<Box<ListNode>> {
        // 先求长度避免双指针在 Box 链上的可变借用冲突
        let mut len = 0;
        {
            let mut p = head.as_ref();
            while let Some(node) = p { len += 1; p = node.next.as_ref(); }
        }
        let target = len - n; // 要删的节点下标（从 0 起）
        let mut dummy = Box::new(ListNode { val: 0, next: head });
        let mut cur = &mut dummy;
        for _ in 0..target {
            cur = cur.next.as_mut().unwrap();
        }
        let next = cur.next.as_mut().unwrap().next.take();
        cur.next = next;
        dummy.next
    }
}`,
        comment:
          "Rust ownership 妥协：双指针在 Option<Box<ListNode>> 上同时可变借用很难，先扫一遍求长度再单指针走 target 步删除。",
      },
      kotlin: {
        code: `// Definition for singly-linked list (LeetCode 提供):
// class ListNode(var \`val\`: Int) {
//     var next: ListNode? = null
// }
class Solution {
    fun removeNthFromEnd(head: ListNode?, n: Int): ListNode? {
        val dummy = ListNode(0).apply { next = head }
        var fast: ListNode? = dummy
        var slow: ListNode? = dummy
        for (i in 0 until n) fast = fast?.next
        while (fast?.next != null) {
            fast = fast.next
            slow = slow?.next
        }
        slow?.next = slow?.next?.next
        return dummy.next
    }
}`,
      },
      swift: {
        code: `// Definition for singly-linked list (LeetCode 提供):
// public class ListNode {
//     public var val: Int
//     public var next: ListNode?
//     public init() { self.val = 0; self.next = nil }
//     public init(_ val: Int) { self.val = val; self.next = nil }
//     public init(_ val: Int, _ next: ListNode?) { self.val = val; self.next = next }
// }
class Solution {
    func removeNthFromEnd(_ head: ListNode?, _ n: Int) -> ListNode? {
        let dummy = ListNode(0, head)
        var fast: ListNode? = dummy
        var slow: ListNode? = dummy
        for _ in 0..<n { fast = fast?.next }
        while fast?.next != nil {
            fast = fast?.next
            slow = slow?.next
        }
        slow?.next = slow?.next?.next
        return dummy.next
    }
}`,
      },
    },
    complexity: { time: "O(n)", space: "O(1)" },
    keyPoints: "快慢指针保持 n 步差 + dummy 节点统一头尾删除分支。",
  },

  /* ============================================================== */
  /*  22. Generate Parentheses (Medium)                              */
  /* ============================================================== */
  {
    id: 22,
    slug: "generate-parentheses",
    titleZh: "括号生成",
    titleEn: "Generate Parentheses",
    difficulty: "medium",
    tags: ["回溯", "字符串", "DP"],
    description: "n 对括号生成所有合法（正确闭合）的括号字符串。",
    officialUrl: "https://leetcode.cn/problems/generate-parentheses/",
    approach: `本质：生成长度 2n 的二叉决策树（每位选 ( 或 )），合法性等价"任意前缀 ( 数 ≥ ) 数 且总数各 n"。回溯按 open/close 计数剪枝远比"先生成 2^(2n) 再过滤"高效。

实现要点：递归参数 (path, open, close)。两条剪枝：open < n 才能放 (；close < open 才能放 )（保证任意前缀 ( ≥ )）。当 path 长度 == 2n 时收集答案。用 StringBuilder / list 拼接 + 回退减少字符串拷贝。

陷阱与对比：先穷举 2^(2n) 个候选再过滤合法的，时间 4^n 级，n=8 已经卡。回溯剪枝产出的就是 Catalan 数 C(n)，远小于 4^n。DP 解法 dp[n] = ((dp[i]) dp[n-1-i]) 也行，但代码不如回溯直观。`,
    solutions: {
      c: {
        code: `#include <stdlib.h>
#include <string.h>

static void dfs(int n, int open, int close, char* path, int len,
                char** ans, int* cnt) {
    if (len == 2 * n) {
        char* s = (char*)malloc(2 * n + 1);
        memcpy(s, path, 2 * n);
        s[2 * n] = '\\0';
        ans[(*cnt)++] = s;
        return;
    }
    if (open < n) {
        path[len] = '(';
        dfs(n, open + 1, close, path, len + 1, ans, cnt);
    }
    if (close < open) {
        path[len] = ')';
        dfs(n, open, close + 1, path, len + 1, ans, cnt);
    }
}

char** generateParenthesis(int n, int* returnSize) {
    /* Catalan(n) 上限，n ≤ 8 时 1430 足够，分配 5000 安全 */
    char** ans = (char**)malloc(5000 * sizeof(char*));
    char* path = (char*)malloc(2 * n + 1);
    int cnt = 0;
    dfs(n, 0, 0, path, 0, ans, &cnt);
    free(path);
    *returnSize = cnt;
    return ans;
}`,
      },
      cpp: {
        code: `#include <vector>
#include <string>
using namespace std;

class Solution {
    void dfs(int n, int open, int close, string& path, vector<string>& ans) {
        if ((int)path.size() == 2 * n) { ans.push_back(path); return; }
        if (open < n) {
            path.push_back('(');
            dfs(n, open + 1, close, path, ans);
            path.pop_back();
        }
        if (close < open) {
            path.push_back(')');
            dfs(n, open, close + 1, path, ans);
            path.pop_back();
        }
    }
public:
    vector<string> generateParenthesis(int n) {
        vector<string> ans;
        string path;
        path.reserve(2 * n);
        dfs(n, 0, 0, path, ans);
        return ans;
    }
};`,
      },
      python: {
        code: `from typing import List

class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        ans: List[str] = []
        path: List[str] = []

        def dfs(open_cnt: int, close_cnt: int) -> None:
            if len(path) == 2 * n:
                ans.append("".join(path))
                return
            if open_cnt < n:
                path.append("(")
                dfs(open_cnt + 1, close_cnt)
                path.pop()
            if close_cnt < open_cnt:
                path.append(")")
                dfs(open_cnt, close_cnt + 1)
                path.pop()

        dfs(0, 0)
        return ans`,
      },
      java: {
        code: `import java.util.*;

class Solution {
    public List<String> generateParenthesis(int n) {
        List<String> ans = new ArrayList<>();
        dfs(n, 0, 0, new StringBuilder(), ans);
        return ans;
    }

    private void dfs(int n, int open, int close, StringBuilder path, List<String> ans) {
        if (path.length() == 2 * n) { ans.add(path.toString()); return; }
        if (open < n) {
            path.append('(');
            dfs(n, open + 1, close, path, ans);
            path.deleteCharAt(path.length() - 1);
        }
        if (close < open) {
            path.append(')');
            dfs(n, open, close + 1, path, ans);
            path.deleteCharAt(path.length() - 1);
        }
    }
}`,
      },
      javascript: {
        code: `/**
 * @param {number} n
 * @return {string[]}
 */
var generateParenthesis = function(n) {
    const ans = [];
    const path = [];
    const dfs = (open, close) => {
        if (path.length === 2 * n) { ans.push(path.join("")); return; }
        if (open < n) {
            path.push("(");
            dfs(open + 1, close);
            path.pop();
        }
        if (close < open) {
            path.push(")");
            dfs(open, close + 1);
            path.pop();
        }
    };
    dfs(0, 0);
    return ans;
};`,
      },
      typescript: {
        code: `function generateParenthesis(n: number): string[] {
    const ans: string[] = [];
    const path: string[] = [];
    const dfs = (open: number, close: number): void => {
        if (path.length === 2 * n) { ans.push(path.join("")); return; }
        if (open < n) {
            path.push("(");
            dfs(open + 1, close);
            path.pop();
        }
        if (close < open) {
            path.push(")");
            dfs(open, close + 1);
            path.pop();
        }
    };
    dfs(0, 0);
    return ans;
}`,
      },
      go: {
        code: `func generateParenthesis(n int) []string {
    var ans []string
    path := make([]byte, 0, 2*n)
    var dfs func(open, close int)
    dfs = func(open, close int) {
        if len(path) == 2*n {
            ans = append(ans, string(path))
            return
        }
        if open < n {
            path = append(path, '(')
            dfs(open+1, close)
            path = path[:len(path)-1]
        }
        if close < open {
            path = append(path, ')')
            dfs(open, close+1)
            path = path[:len(path)-1]
        }
    }
    dfs(0, 0)
    return ans
}`,
      },
      rust: {
        code: `impl Solution {
    pub fn generate_parenthesis(n: i32) -> Vec<String> {
        let mut ans: Vec<String> = Vec::new();
        let mut path: Vec<u8> = Vec::with_capacity((2 * n) as usize);
        fn dfs(n: i32, open: i32, close: i32, path: &mut Vec<u8>, ans: &mut Vec<String>) {
            if path.len() as i32 == 2 * n {
                ans.push(String::from_utf8(path.clone()).unwrap());
                return;
            }
            if open < n {
                path.push(b'(');
                dfs(n, open + 1, close, path, ans);
                path.pop();
            }
            if close < open {
                path.push(b')');
                dfs(n, open, close + 1, path, ans);
                path.pop();
            }
        }
        dfs(n, 0, 0, &mut path, &mut ans);
        ans
    }
}`,
      },
      kotlin: {
        code: `class Solution {
    fun generateParenthesis(n: Int): List<String> {
        val ans = mutableListOf<String>()
        val path = StringBuilder()
        fun dfs(open: Int, close: Int) {
            if (path.length == 2 * n) { ans.add(path.toString()); return }
            if (open < n) {
                path.append('(')
                dfs(open + 1, close)
                path.deleteCharAt(path.length - 1)
            }
            if (close < open) {
                path.append(')')
                dfs(open, close + 1)
                path.deleteCharAt(path.length - 1)
            }
        }
        dfs(0, 0)
        return ans
    }
}`,
      },
      swift: {
        code: `class Solution {
    func generateParenthesis(_ n: Int) -> [String] {
        var ans: [String] = []
        var path: [Character] = []
        func dfs(_ open: Int, _ close: Int) {
            if path.count == 2 * n { ans.append(String(path)); return }
            if open < n {
                path.append("(")
                dfs(open + 1, close)
                path.removeLast()
            }
            if close < open {
                path.append(")")
                dfs(open, close + 1)
                path.removeLast()
            }
        }
        dfs(0, 0)
        return ans
    }
}`,
      },
    },
    complexity: { time: "O(C(n)) ≈ O(4^n / √n)", space: "O(n) 递归栈" },
    keyPoints: "open/close 双计数剪枝：open < n 可加左，close < open 才能加右。",
  },

  /* ============================================================== */
  /*  23. Merge k Sorted Lists (Hard)                                */
  /* ============================================================== */
  {
    id: 23,
    slug: "merge-k-sorted-lists",
    titleZh: "合并 K 个升序链表",
    titleEn: "Merge k Sorted Lists",
    difficulty: "hard",
    tags: ["链表", "分治", "堆"],
    description: "k 个升序链表合并为一个升序链表，返回新链表头。",
    officialUrl: "https://leetcode.cn/problems/merge-k-sorted-lists/",
    approach: `本质：把"合并 2 个有序链表"扩展到 k 个。两两分治合并是最稳的写法：第 1 轮合并 k/2 对、第 2 轮 k/4 对…共 log k 轮，每轮总节点数 N，总时间 O(N log k)。

实现要点：写一个 mergeTwo(a, b) 子过程（哑节点 + 双指针）；外层循环每次把 lists[i] 和 lists[i + step] 合并到 lists[i]，step 翻倍直到 step ≥ k。最终 lists[0] 即答案。空数组、单链表都能被这个框架自然处理。

陷阱与对比：朴素逐个合并 O(N · k)，k=10⁴ 时被卡。最小堆方案 O(N log k) 同样最优，但不是所有语言都自带堆（C/JS/Swift 要自写），分治在每语言都易写。把所有节点 val 倒进数组排序再串成链表 O(N log N) 也行但破坏了"链表合并"的考点。`,
    solutions: {
      c: {
        code: `#include <stdlib.h>

struct ListNode {
    int val;
    struct ListNode *next;
};

static struct ListNode* mergeTwo(struct ListNode* a, struct ListNode* b) {
    struct ListNode dummy;
    dummy.next = NULL;
    struct ListNode* tail = &dummy;
    while (a && b) {
        if (a->val <= b->val) { tail->next = a; a = a->next; }
        else                  { tail->next = b; b = b->next; }
        tail = tail->next;
    }
    tail->next = a ? a : b;
    return dummy.next;
}

struct ListNode* mergeKLists(struct ListNode** lists, int listsSize) {
    if (listsSize == 0) return NULL;
    int step = 1;
    while (step < listsSize) {
        for (int i = 0; i + step < listsSize; i += 2 * step) {
            lists[i] = mergeTwo(lists[i], lists[i + step]);
        }
        step *= 2;
    }
    return lists[0];
}`,
      },
      cpp: {
        code: `#include <vector>
#include <cstddef>
using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *n) : val(x), next(n) {}
};

class Solution {
    ListNode* mergeTwo(ListNode* a, ListNode* b) {
        ListNode dummy;
        ListNode* tail = &dummy;
        while (a && b) {
            if (a->val <= b->val) { tail->next = a; a = a->next; }
            else                  { tail->next = b; b = b->next; }
            tail = tail->next;
        }
        tail->next = a ? a : b;
        return dummy.next;
    }
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        int n = (int)lists.size();
        if (n == 0) return nullptr;
        int step = 1;
        while (step < n) {
            for (int i = 0; i + step < n; i += 2 * step) {
                lists[i] = mergeTwo(lists[i], lists[i + step]);
            }
            step *= 2;
        }
        return lists[0];
    }
};`,
      },
      python: {
        code: `from typing import List, Optional

class ListNode:
    def __init__(self, val: int = 0, next: "Optional[ListNode]" = None):
        self.val = val
        self.next = next

class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        if not lists:
            return None
        n = len(lists)
        step = 1
        while step < n:
            for i in range(0, n - step, 2 * step):
                lists[i] = self._merge_two(lists[i], lists[i + step])
            step *= 2
        return lists[0]

    def _merge_two(
        self,
        a: Optional[ListNode],
        b: Optional[ListNode],
    ) -> Optional[ListNode]:
        dummy = ListNode()
        tail = dummy
        while a and b:
            if a.val <= b.val:
                tail.next = a; a = a.next
            else:
                tail.next = b; b = b.next
            tail = tail.next
        tail.next = a if a else b
        return dummy.next`,
      },
      java: {
        code: `// Definition for singly-linked list (LeetCode 提供):
// public class ListNode {
//     int val; ListNode next;
//     ListNode() {}
//     ListNode(int val) { this.val = val; }
//     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
// }
class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        int n = lists.length;
        if (n == 0) return null;
        int step = 1;
        while (step < n) {
            for (int i = 0; i + step < n; i += 2 * step) {
                lists[i] = mergeTwo(lists[i], lists[i + step]);
            }
            step *= 2;
        }
        return lists[0];
    }

    private ListNode mergeTwo(ListNode a, ListNode b) {
        ListNode dummy = new ListNode();
        ListNode tail = dummy;
        while (a != null && b != null) {
            if (a.val <= b.val) { tail.next = a; a = a.next; }
            else                { tail.next = b; b = b.next; }
            tail = tail.next;
        }
        tail.next = (a != null) ? a : b;
        return dummy.next;
    }
}`,
      },
      javascript: {
        code: `/**
 * Definition for singly-linked list:
 * function ListNode(val, next) {
 *     this.val = (val === undefined ? 0 : val);
 *     this.next = (next === undefined ? null : next);
 * }
 *
 * @param {ListNode[]} lists
 * @return {ListNode}
 */
var mergeKLists = function(lists) {
    const n = lists.length;
    if (n === 0) return null;
    const mergeTwo = (a, b) => {
        const dummy = { val: 0, next: null };
        let tail = dummy;
        while (a && b) {
            if (a.val <= b.val) { tail.next = a; a = a.next; }
            else                { tail.next = b; b = b.next; }
            tail = tail.next;
        }
        tail.next = a || b;
        return dummy.next;
    };
    let step = 1;
    while (step < n) {
        for (let i = 0; i + step < n; i += 2 * step) {
            lists[i] = mergeTwo(lists[i], lists[i + step]);
        }
        step *= 2;
    }
    return lists[0];
};`,
      },
      typescript: {
        code: `class ListNode {
    val: number;
    next: ListNode | null;
    constructor(val?: number, next?: ListNode | null) {
        this.val = val ?? 0;
        this.next = next ?? null;
    }
}

function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
    const n = lists.length;
    if (n === 0) return null;
    const mergeTwo = (a: ListNode | null, b: ListNode | null): ListNode | null => {
        const dummy = new ListNode();
        let tail = dummy;
        while (a && b) {
            if (a.val <= b.val) { tail.next = a; a = a.next; }
            else                { tail.next = b; b = b.next; }
            tail = tail.next;
        }
        tail.next = a ?? b;
        return dummy.next;
    };
    let step = 1;
    while (step < n) {
        for (let i = 0; i + step < n; i += 2 * step) {
            lists[i] = mergeTwo(lists[i], lists[i + step]);
        }
        step *= 2;
    }
    return lists[0];
}`,
      },
      go: {
        code: `// Definition for singly-linked list (LeetCode 提供):
// type ListNode struct {
//     Val  int
//     Next *ListNode
// }
func mergeKLists(lists []*ListNode) *ListNode {
    n := len(lists)
    if n == 0 {
        return nil
    }
    mergeTwo := func(a, b *ListNode) *ListNode {
        dummy := &ListNode{}
        tail := dummy
        for a != nil && b != nil {
            if a.Val <= b.Val {
                tail.Next = a
                a = a.Next
            } else {
                tail.Next = b
                b = b.Next
            }
            tail = tail.Next
        }
        if a != nil {
            tail.Next = a
        } else {
            tail.Next = b
        }
        return dummy.Next
    }
    step := 1
    for step < n {
        for i := 0; i+step < n; i += 2 * step {
            lists[i] = mergeTwo(lists[i], lists[i+step])
        }
        step *= 2
    }
    return lists[0]
}`,
      },
      rust: {
        code: `// LeetCode Rust 链表节点：Option<Box<ListNode>>
impl Solution {
    pub fn merge_k_lists(lists: Vec<Option<Box<ListNode>>>) -> Option<Box<ListNode>> {
        let mut lists = lists;
        let n = lists.len();
        if n == 0 { return None; }
        let mut step = 1;
        while step < n {
            let mut i = 0;
            while i + step < n {
                let b = lists[i + step].take();
                let a = lists[i].take();
                lists[i] = Self::merge_two(a, b);
                i += 2 * step;
            }
            step *= 2;
        }
        lists[0].take()
    }

    fn merge_two(
        mut a: Option<Box<ListNode>>,
        mut b: Option<Box<ListNode>>,
    ) -> Option<Box<ListNode>> {
        let mut dummy = Box::new(ListNode::new(0));
        let mut tail = &mut dummy;
        while a.is_some() && b.is_some() {
            let take_a = a.as_ref().unwrap().val <= b.as_ref().unwrap().val;
            if take_a {
                let mut node = a.take().unwrap();
                a = node.next.take();
                tail.next = Some(node);
            } else {
                let mut node = b.take().unwrap();
                b = node.next.take();
                tail.next = Some(node);
            }
            tail = tail.next.as_mut().unwrap();
        }
        tail.next = if a.is_some() { a } else { b };
        dummy.next
    }
}`,
        comment:
          "Rust ownership 妥协：用 take() 把 lists[i] 取出再嫁接，避免同时可变借用两个 slot。",
      },
      kotlin: {
        code: `// Definition for singly-linked list (LeetCode 提供):
// class ListNode(var \`val\`: Int) {
//     var next: ListNode? = null
// }
class Solution {
    fun mergeKLists(lists: Array<ListNode?>): ListNode? {
        val n = lists.size
        if (n == 0) return null
        var step = 1
        while (step < n) {
            var i = 0
            while (i + step < n) {
                lists[i] = mergeTwo(lists[i], lists[i + step])
                i += 2 * step
            }
            step *= 2
        }
        return lists[0]
    }

    private fun mergeTwo(a0: ListNode?, b0: ListNode?): ListNode? {
        val dummy = ListNode(0)
        var tail = dummy
        var a = a0; var b = b0
        while (a != null && b != null) {
            if (a.\`val\` <= b.\`val\`) { tail.next = a; a = a.next }
            else                       { tail.next = b; b = b.next }
            tail = tail.next!!
        }
        tail.next = a ?: b
        return dummy.next
    }
}`,
      },
      swift: {
        code: `// Definition for singly-linked list (LeetCode 提供):
// public class ListNode {
//     public var val: Int
//     public var next: ListNode?
//     public init() { self.val = 0; self.next = nil }
//     public init(_ val: Int) { self.val = val; self.next = nil }
//     public init(_ val: Int, _ next: ListNode?) { self.val = val; self.next = next }
// }
class Solution {
    func mergeKLists(_ lists: [ListNode?]) -> ListNode? {
        var lists = lists
        let n = lists.count
        if n == 0 { return nil }
        var step = 1
        while step < n {
            var i = 0
            while i + step < n {
                lists[i] = mergeTwo(lists[i], lists[i + step])
                i += 2 * step
            }
            step *= 2
        }
        return lists[0]
    }

    private func mergeTwo(_ a0: ListNode?, _ b0: ListNode?) -> ListNode? {
        let dummy = ListNode()
        var tail = dummy
        var a = a0, b = b0
        while let na = a, let nb = b {
            if na.val <= nb.val { tail.next = na; a = na.next }
            else                { tail.next = nb; b = nb.next }
            tail = tail.next!
        }
        tail.next = a ?? b
        return dummy.next
    }
}`,
      },
    },
    complexity: { time: "O(N log k)", space: "O(1) 额外（不算原节点）" },
    keyPoints: "两两分治合并：log k 轮，每轮线性扫所有节点。",
  },

  /* ============================================================== */
  /*  24. Swap Nodes in Pairs (Medium)                               */
  /* ============================================================== */
  {
    id: 24,
    slug: "swap-nodes-in-pairs",
    titleZh: "两两交换链表中的节点",
    titleEn: "Swap Nodes in Pairs",
    difficulty: "medium",
    tags: ["链表", "递归"],
    description: "把链表中相邻每两个节点两两交换位置，返回新头。",
    officialUrl: "https://leetcode.cn/problems/swap-nodes-in-pairs/",
    approach: `本质：每次操作三个指针——前驱 prev、第一个 a、第二个 b。把 a 和 b 互换后，prev 指向 b，a 指向 b 原来的下一个，b 指向 a；然后 prev 推进到 a（即新的尾），继续下一对。

实现要点：用 dummy 节点充当初始 prev。循环条件：prev.next != null 且 prev.next.next != null（保证后面还有完整一对）。三指针赋值要小心顺序：先存 a.next = b.next，再 b.next = a，再 prev.next = b，最后 prev = a 推进。

陷阱与对比：递归写法 swap(head) = b -> swap(b.next原)，代码极短（4 行）但 O(n) 栈空间。迭代 O(1) 空间面试更稳。容易写错的就是指针顺序——稍微交换一下顺序就会断链。可以画图验证。`,
    solutions: {
      c: {
        code: `#include <stdlib.h>

struct ListNode {
    int val;
    struct ListNode *next;
};

struct ListNode* swapPairs(struct ListNode* head) {
    struct ListNode dummy;
    dummy.next = head;
    struct ListNode* prev = &dummy;
    while (prev->next && prev->next->next) {
        struct ListNode* a = prev->next;
        struct ListNode* b = a->next;
        a->next = b->next;
        b->next = a;
        prev->next = b;
        prev = a;
    }
    return dummy.next;
}`,
      },
      cpp: {
        code: `#include <cstddef>

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *n) : val(x), next(n) {}
};

class Solution {
public:
    ListNode* swapPairs(ListNode* head) {
        ListNode dummy(0, head);
        ListNode* prev = &dummy;
        while (prev->next && prev->next->next) {
            ListNode* a = prev->next;
            ListNode* b = a->next;
            a->next = b->next;
            b->next = a;
            prev->next = b;
            prev = a;
        }
        return dummy.next;
    }
};`,
      },
      python: {
        code: `from typing import Optional

class ListNode:
    def __init__(self, val: int = 0, next: "Optional[ListNode]" = None):
        self.val = val
        self.next = next

class Solution:
    def swapPairs(self, head: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        prev = dummy
        while prev.next and prev.next.next:
            a = prev.next
            b = a.next
            a.next = b.next
            b.next = a
            prev.next = b
            prev = a
        return dummy.next`,
      },
      java: {
        code: `// Definition for singly-linked list (LeetCode 提供):
// public class ListNode {
//     int val; ListNode next;
//     ListNode() {}
//     ListNode(int val) { this.val = val; }
//     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
// }
class Solution {
    public ListNode swapPairs(ListNode head) {
        ListNode dummy = new ListNode(0, head);
        ListNode prev = dummy;
        while (prev.next != null && prev.next.next != null) {
            ListNode a = prev.next;
            ListNode b = a.next;
            a.next = b.next;
            b.next = a;
            prev.next = b;
            prev = a;
        }
        return dummy.next;
    }
}`,
      },
      javascript: {
        code: `/**
 * Definition for singly-linked list:
 * function ListNode(val, next) {
 *     this.val = (val === undefined ? 0 : val);
 *     this.next = (next === undefined ? null : next);
 * }
 *
 * @param {ListNode} head
 * @return {ListNode}
 */
var swapPairs = function(head) {
    const dummy = { val: 0, next: head };
    let prev = dummy;
    while (prev.next && prev.next.next) {
        const a = prev.next;
        const b = a.next;
        a.next = b.next;
        b.next = a;
        prev.next = b;
        prev = a;
    }
    return dummy.next;
};`,
      },
      typescript: {
        code: `class ListNode {
    val: number;
    next: ListNode | null;
    constructor(val?: number, next?: ListNode | null) {
        this.val = val ?? 0;
        this.next = next ?? null;
    }
}

function swapPairs(head: ListNode | null): ListNode | null {
    const dummy = new ListNode(0, head);
    let prev: ListNode = dummy;
    while (prev.next && prev.next.next) {
        const a = prev.next;
        const b = a.next!;
        a.next = b.next;
        b.next = a;
        prev.next = b;
        prev = a;
    }
    return dummy.next;
}`,
      },
      go: {
        code: `// Definition for singly-linked list (LeetCode 提供):
// type ListNode struct {
//     Val  int
//     Next *ListNode
// }
func swapPairs(head *ListNode) *ListNode {
    dummy := &ListNode{Next: head}
    prev := dummy
    for prev.Next != nil && prev.Next.Next != nil {
        a := prev.Next
        b := a.Next
        a.Next = b.Next
        b.Next = a
        prev.Next = b
        prev = a
    }
    return dummy.Next
}`,
      },
      rust: {
        code: `// LeetCode Rust 链表节点：Option<Box<ListNode>>
impl Solution {
    pub fn swap_pairs(head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
        // 递归写法在 Rust 上比迭代易处理 ownership：
        // swap(head) = b -> a -> swap(rest)
        match head {
            None => None,
            Some(mut a) => match a.next.take() {
                None => Some(a),
                Some(mut b) => {
                    a.next = Self::swap_pairs(b.next.take());
                    b.next = Some(a);
                    Some(b)
                }
            }
        }
    }
}`,
        comment:
          "Rust 用递归而非迭代：迭代里需要同时持有 prev/a/b 三个 Box 的可变借用，借用检查不通过；递归靠 take() 转移所有权天然干净。",
      },
      kotlin: {
        code: `// Definition for singly-linked list (LeetCode 提供):
// class ListNode(var \`val\`: Int) {
//     var next: ListNode? = null
// }
class Solution {
    fun swapPairs(head: ListNode?): ListNode? {
        val dummy = ListNode(0).apply { next = head }
        var prev: ListNode = dummy
        while (prev.next != null && prev.next!!.next != null) {
            val a = prev.next!!
            val b = a.next!!
            a.next = b.next
            b.next = a
            prev.next = b
            prev = a
        }
        return dummy.next
    }
}`,
      },
      swift: {
        code: `// Definition for singly-linked list (LeetCode 提供):
// public class ListNode {
//     public var val: Int
//     public var next: ListNode?
//     public init() { self.val = 0; self.next = nil }
//     public init(_ val: Int) { self.val = val; self.next = nil }
//     public init(_ val: Int, _ next: ListNode?) { self.val = val; self.next = next }
// }
class Solution {
    func swapPairs(_ head: ListNode?) -> ListNode? {
        let dummy = ListNode(0, head)
        var prev: ListNode = dummy
        while prev.next != nil && prev.next?.next != nil {
            let a = prev.next!
            let b = a.next!
            a.next = b.next
            b.next = a
            prev.next = b
            prev = a
        }
        return dummy.next
    }
}`,
      },
    },
    complexity: { time: "O(n)", space: "O(1)" },
    keyPoints: "dummy + 三指针严格顺序：先断 a.next，再 b.next=a，最后 prev.next=b。",
  },

  /* ============================================================== */
  /*  33. Search in Rotated Sorted Array (Medium)                    */
  /* ============================================================== */
  {
    id: 33,
    slug: "search-in-rotated-sorted-array",
    titleZh: "搜索旋转排序数组",
    titleEn: "Search in Rotated Sorted Array",
    difficulty: "medium",
    tags: ["数组", "二分查找"],
    description: "升序数组在某点被旋转过，O(log n) 内查找目标值的下标。",
    officialUrl: "https://leetcode.cn/problems/search-in-rotated-sorted-array/",
    approach: `本质：旋转后数组被分成两段升序子数组，但用二分仍可，因为任意 mid 把数组切两半后，至少有一半是完整有序的，可以直接判断 target 是否落在那一半范围内。

实现要点：l, r 标准二分。每轮算 mid，先看 nums[mid] 是否命中；否则比较 nums[l] 和 nums[mid]：若 nums[l] <= nums[mid]，左半段有序——target 是否在 [nums[l], nums[mid]) 决定走左还是右；否则右半段有序——target 是否在 (nums[mid], nums[r]] 决定。

陷阱与对比：必须用 <=（不是 <）判左半有序，否则 l == mid 单元素的边界出错。target 范围比较要左闭右开 / 左开右闭对应清楚。线性扫 O(n) 当然能做但浪费"有序"信息。有重复元素的版本（81 题）需特殊处理 nums[l] == nums[mid] 的情况，本题元素唯一。`,
    solutions: {
      c: {
        code: `int search(int* nums, int numsSize, int target) {
    int l = 0, r = numsSize - 1;
    while (l <= r) {
        int mid = l + (r - l) / 2;
        if (nums[mid] == target) return mid;
        if (nums[l] <= nums[mid]) {
            if (nums[l] <= target && target < nums[mid]) r = mid - 1;
            else l = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[r]) l = mid + 1;
            else r = mid - 1;
        }
    }
    return -1;
}`,
      },
      cpp: {
        code: `#include <vector>
using namespace std;

class Solution {
public:
    int search(vector<int>& nums, int target) {
        int l = 0, r = (int)nums.size() - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] == target) return mid;
            if (nums[l] <= nums[mid]) {
                if (nums[l] <= target && target < nums[mid]) r = mid - 1;
                else l = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[r]) l = mid + 1;
                else r = mid - 1;
            }
        }
        return -1;
    }
};`,
      },
      python: {
        code: `from typing import List

class Solution:
    def search(self, nums: List[int], target: int) -> int:
        l, r = 0, len(nums) - 1
        while l <= r:
            mid = (l + r) // 2
            if nums[mid] == target:
                return mid
            if nums[l] <= nums[mid]:  # 左半段有序
                if nums[l] <= target < nums[mid]:
                    r = mid - 1
                else:
                    l = mid + 1
            else:                     # 右半段有序
                if nums[mid] < target <= nums[r]:
                    l = mid + 1
                else:
                    r = mid - 1
        return -1`,
      },
      java: {
        code: `class Solution {
    public int search(int[] nums, int target) {
        int l = 0, r = nums.length - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] == target) return mid;
            if (nums[l] <= nums[mid]) {
                if (nums[l] <= target && target < nums[mid]) r = mid - 1;
                else l = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[r]) l = mid + 1;
                else r = mid - 1;
            }
        }
        return -1;
    }
}`,
      },
      javascript: {
        code: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var search = function(nums, target) {
    let l = 0, r = nums.length - 1;
    while (l <= r) {
        const mid = (l + r) >> 1;
        if (nums[mid] === target) return mid;
        if (nums[l] <= nums[mid]) {
            if (nums[l] <= target && target < nums[mid]) r = mid - 1;
            else l = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[r]) l = mid + 1;
            else r = mid - 1;
        }
    }
    return -1;
};`,
      },
      typescript: {
        code: `function search(nums: number[], target: number): number {
    let l = 0, r = nums.length - 1;
    while (l <= r) {
        const mid = (l + r) >> 1;
        if (nums[mid] === target) return mid;
        if (nums[l] <= nums[mid]) {
            if (nums[l] <= target && target < nums[mid]) r = mid - 1;
            else l = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[r]) l = mid + 1;
            else r = mid - 1;
        }
    }
    return -1;
}`,
      },
      go: {
        code: `func search(nums []int, target int) int {
    l, r := 0, len(nums)-1
    for l <= r {
        mid := (l + r) / 2
        if nums[mid] == target {
            return mid
        }
        if nums[l] <= nums[mid] {
            if nums[l] <= target && target < nums[mid] {
                r = mid - 1
            } else {
                l = mid + 1
            }
        } else {
            if nums[mid] < target && target <= nums[r] {
                l = mid + 1
            } else {
                r = mid - 1
            }
        }
    }
    return -1
}`,
      },
      rust: {
        code: `impl Solution {
    pub fn search(nums: Vec<i32>, target: i32) -> i32 {
        let (mut l, mut r) = (0_i32, nums.len() as i32 - 1);
        while l <= r {
            let mid = l + (r - l) / 2;
            let m = mid as usize;
            if nums[m] == target { return mid; }
            if nums[l as usize] <= nums[m] {
                if nums[l as usize] <= target && target < nums[m] { r = mid - 1; }
                else                                               { l = mid + 1; }
            } else {
                if nums[m] < target && target <= nums[r as usize] { l = mid + 1; }
                else                                               { r = mid - 1; }
            }
        }
        -1
    }
}`,
      },
      kotlin: {
        code: `class Solution {
    fun search(nums: IntArray, target: Int): Int {
        var l = 0; var r = nums.size - 1
        while (l <= r) {
            val mid = (l + r) ushr 1
            if (nums[mid] == target) return mid
            if (nums[l] <= nums[mid]) {
                if (nums[l] <= target && target < nums[mid]) r = mid - 1 else l = mid + 1
            } else {
                if (nums[mid] < target && target <= nums[r]) l = mid + 1 else r = mid - 1
            }
        }
        return -1
    }
}`,
      },
      swift: {
        code: `class Solution {
    func search(_ nums: [Int], _ target: Int) -> Int {
        var l = 0, r = nums.count - 1
        while l <= r {
            let mid = (l + r) / 2
            if nums[mid] == target { return mid }
            if nums[l] <= nums[mid] {
                if nums[l] <= target && target < nums[mid] { r = mid - 1 }
                else                                       { l = mid + 1 }
            } else {
                if nums[mid] < target && target <= nums[r] { l = mid + 1 }
                else                                       { r = mid - 1 }
            }
        }
        return -1
    }
}`,
      },
    },
    complexity: { time: "O(log n)", space: "O(1)" },
    keyPoints: "二分时先判断哪一半有序（nums[l] <= nums[mid]），再看 target 是否落在该半。",
  },

  /* ============================================================== */
  /*  34. Find First and Last Position of Element in Sorted Array    */
  /* ============================================================== */
  {
    id: 34,
    slug: "find-first-and-last-position-of-element-in-sorted-array",
    titleZh: "在排序数组中查找元素的第一个和最后一个位置",
    titleEn: "Find First and Last Position of Element in Sorted Array",
    difficulty: "medium",
    tags: ["数组", "二分查找"],
    description: "有序数组里返回目标值首尾下标，没有返回 [-1, -1]。",
    officialUrl: "https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/",
    approach: `本质：两次二分分别求 lower_bound（第一个 >= target）和 upper_bound（第一个 > target）。前者就是首位置；后者减 1 是末位置；判 lower_bound 是否真等于 target 决定是否返回 [-1, -1]。

实现要点：写一个统一 lowerBound(target)：当 nums[mid] < target 时 l = mid + 1，否则 r = mid，循环 while l < r，结束后 l 是第一个不小于 target 的位置。upperBound(target) 等价 lowerBound(target + 1)。两次调用分别得 lo 和 hi - 1。

陷阱与对比：朴素 O(n) 线扫当然能做但浪费有序。用闭区间 [l, r] 二分也可但循环条件、收缩量更易写错；左闭右开 [l, r) 模板（while l < r, r = mid）最不容易出错。要小心 lo == n 或 nums[lo] != target 的"未命中"边界。`,
    solutions: {
      c: {
        code: `#include <stdlib.h>

static int lowerBound(int* nums, int n, int target) {
    int l = 0, r = n;
    while (l < r) {
        int mid = l + (r - l) / 2;
        if (nums[mid] < target) l = mid + 1;
        else r = mid;
    }
    return l;
}

int* searchRange(int* nums, int numsSize, int target, int* returnSize) {
    int* ans = (int*)malloc(2 * sizeof(int));
    *returnSize = 2;
    int lo = lowerBound(nums, numsSize, target);
    int hi = lowerBound(nums, numsSize, target + 1) - 1;
    if (lo == numsSize || nums[lo] != target) {
        ans[0] = -1; ans[1] = -1;
    } else {
        ans[0] = lo; ans[1] = hi;
    }
    return ans;
}`,
      },
      cpp: {
        code: `#include <vector>
using namespace std;

class Solution {
    int lowerBound(vector<int>& nums, int target) {
        int l = 0, r = (int)nums.size();
        while (l < r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] < target) l = mid + 1;
            else r = mid;
        }
        return l;
    }
public:
    vector<int> searchRange(vector<int>& nums, int target) {
        int lo = lowerBound(nums, target);
        int hi = lowerBound(nums, target + 1) - 1;
        if (lo == (int)nums.size() || nums[lo] != target) return {-1, -1};
        return {lo, hi};
    }
};`,
      },
      python: {
        code: `from typing import List

class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        def lower_bound(t: int) -> int:
            l, r = 0, len(nums)
            while l < r:
                mid = (l + r) // 2
                if nums[mid] < t:
                    l = mid + 1
                else:
                    r = mid
            return l

        lo = lower_bound(target)
        hi = lower_bound(target + 1) - 1
        if lo == len(nums) or nums[lo] != target:
            return [-1, -1]
        return [lo, hi]`,
      },
      java: {
        code: `class Solution {
    public int[] searchRange(int[] nums, int target) {
        int lo = lowerBound(nums, target);
        int hi = lowerBound(nums, target + 1) - 1;
        if (lo == nums.length || nums[lo] != target) return new int[]{-1, -1};
        return new int[]{lo, hi};
    }

    private int lowerBound(int[] nums, int target) {
        int l = 0, r = nums.length;
        while (l < r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] < target) l = mid + 1;
            else r = mid;
        }
        return l;
    }
}`,
      },
      javascript: {
        code: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var searchRange = function(nums, target) {
    const lowerBound = (t) => {
        let l = 0, r = nums.length;
        while (l < r) {
            const mid = (l + r) >> 1;
            if (nums[mid] < t) l = mid + 1;
            else r = mid;
        }
        return l;
    };
    const lo = lowerBound(target);
    const hi = lowerBound(target + 1) - 1;
    if (lo === nums.length || nums[lo] !== target) return [-1, -1];
    return [lo, hi];
};`,
      },
      typescript: {
        code: `function searchRange(nums: number[], target: number): number[] {
    const lowerBound = (t: number): number => {
        let l = 0, r = nums.length;
        while (l < r) {
            const mid = (l + r) >> 1;
            if (nums[mid] < t) l = mid + 1;
            else r = mid;
        }
        return l;
    };
    const lo = lowerBound(target);
    const hi = lowerBound(target + 1) - 1;
    if (lo === nums.length || nums[lo] !== target) return [-1, -1];
    return [lo, hi];
}`,
      },
      go: {
        code: `func searchRange(nums []int, target int) []int {
    lowerBound := func(t int) int {
        l, r := 0, len(nums)
        for l < r {
            mid := (l + r) / 2
            if nums[mid] < t {
                l = mid + 1
            } else {
                r = mid
            }
        }
        return l
    }
    lo := lowerBound(target)
    hi := lowerBound(target+1) - 1
    if lo == len(nums) || nums[lo] != target {
        return []int{-1, -1}
    }
    return []int{lo, hi}
}`,
      },
      rust: {
        code: `impl Solution {
    pub fn search_range(nums: Vec<i32>, target: i32) -> Vec<i32> {
        fn lower_bound(nums: &[i32], t: i32) -> i32 {
            let (mut l, mut r) = (0_i32, nums.len() as i32);
            while l < r {
                let mid = l + (r - l) / 2;
                if nums[mid as usize] < t { l = mid + 1; } else { r = mid; }
            }
            l
        }
        let lo = lower_bound(&nums, target);
        let hi = lower_bound(&nums, target + 1) - 1;
        if lo == nums.len() as i32 || nums[lo as usize] != target {
            return vec![-1, -1];
        }
        vec![lo, hi]
    }
}`,
      },
      kotlin: {
        code: `class Solution {
    fun searchRange(nums: IntArray, target: Int): IntArray {
        fun lowerBound(t: Int): Int {
            var l = 0; var r = nums.size
            while (l < r) {
                val mid = (l + r) ushr 1
                if (nums[mid] < t) l = mid + 1 else r = mid
            }
            return l
        }
        val lo = lowerBound(target)
        val hi = lowerBound(target + 1) - 1
        if (lo == nums.size || nums[lo] != target) return intArrayOf(-1, -1)
        return intArrayOf(lo, hi)
    }
}`,
      },
      swift: {
        code: `class Solution {
    func searchRange(_ nums: [Int], _ target: Int) -> [Int] {
        func lowerBound(_ t: Int) -> Int {
            var l = 0, r = nums.count
            while l < r {
                let mid = (l + r) / 2
                if nums[mid] < t { l = mid + 1 } else { r = mid }
            }
            return l
        }
        let lo = lowerBound(target)
        let hi = lowerBound(target + 1) - 1
        if lo == nums.count || nums[lo] != target { return [-1, -1] }
        return [lo, hi]
    }
}`,
      },
    },
    complexity: { time: "O(log n)", space: "O(1)" },
    keyPoints: "lower_bound(t) 与 lower_bound(t+1) 两次二分定首尾边界。",
  },

  /* ============================================================== */
  /*  39. Combination Sum (Medium)                                   */
  /* ============================================================== */
  {
    id: 39,
    slug: "combination-sum",
    titleZh: "组合总和",
    titleEn: "Combination Sum",
    difficulty: "medium",
    tags: ["回溯", "数组"],
    description: "正整数集合（可重复使用同一数）里找所有和为 target 的组合。",
    officialUrl: "https://leetcode.cn/problems/combination-sum/",
    approach: `本质：从 candidates 里挑若干个（同一个可挑多次）凑成 target，要求组合（无序），不要排列。回溯 + 起始下标 start 控制"只往后选"避免重复组合。

实现要点：dfs(start, remain)。remain == 0 收答案；remain < 0 剪掉。循环 i 从 start 到 n-1：把 candidates[i] 加进 path，递归 dfs(i, remain - candidates[i])（注意是 i 不是 i+1，允许重选自己），递归回退弹出。candidates 排序后还能 remain - candidates[i] < 0 即 break 提前剪。

陷阱与对比：dfs 调用传 i + 1 会变成"每个数最多选一次"（这是 40 题）。dfs 传 0 会枚举到重复组合 [2,3] 与 [3,2]。题目允许重复使用，所以传 i。candidates 元素本身互不相同，所以无需去重相同元素。`,
    solutions: {
      c: {
        code: `#include <stdlib.h>
#include <string.h>

static void dfs(int* cand, int n, int start, int remain,
                int* path, int pathLen,
                int*** ans, int** cols, int* cnt, int* cap) {
    if (remain == 0) {
        if (*cnt == *cap) {
            *cap *= 2;
            *ans = (int**)realloc(*ans, (*cap) * sizeof(int*));
            *cols = (int*)realloc(*cols, (*cap) * sizeof(int));
        }
        int* row = (int*)malloc(pathLen * sizeof(int));
        memcpy(row, path, pathLen * sizeof(int));
        (*ans)[*cnt] = row;
        (*cols)[*cnt] = pathLen;
        (*cnt)++;
        return;
    }
    for (int i = start; i < n; ++i) {
        if (cand[i] > remain) continue;
        path[pathLen] = cand[i];
        dfs(cand, n, i, remain - cand[i], path, pathLen + 1, ans, cols, cnt, cap);
    }
}

int** combinationSum(int* candidates, int candidatesSize, int target,
                     int* returnSize, int** returnColumnSizes) {
    int cap = 16;
    int** ans = (int**)malloc(cap * sizeof(int*));
    int* cols = (int*)malloc(cap * sizeof(int));
    int* path = (int*)malloc(target * sizeof(int)); /* 上限 target/min ≤ target */
    int cnt = 0;
    dfs(candidates, candidatesSize, 0, target, path, 0, &ans, &cols, &cnt, &cap);
    free(path);
    *returnSize = cnt;
    *returnColumnSizes = cols;
    return ans;
}`,
      },
      cpp: {
        code: `#include <vector>
using namespace std;

class Solution {
    void dfs(vector<int>& cand, int start, int remain,
             vector<int>& path, vector<vector<int>>& ans) {
        if (remain == 0) { ans.push_back(path); return; }
        for (int i = start; i < (int)cand.size(); ++i) {
            if (cand[i] > remain) continue;
            path.push_back(cand[i]);
            dfs(cand, i, remain - cand[i], path, ans); // 同一元素可重选 -> 传 i
            path.pop_back();
        }
    }
public:
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        vector<vector<int>> ans;
        vector<int> path;
        dfs(candidates, 0, target, path, ans);
        return ans;
    }
};`,
      },
      python: {
        code: `from typing import List

class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        ans: List[List[int]] = []
        path: List[int] = []

        def dfs(start: int, remain: int) -> None:
            if remain == 0:
                ans.append(path[:])
                return
            for i in range(start, len(candidates)):
                if candidates[i] > remain:
                    continue
                path.append(candidates[i])
                dfs(i, remain - candidates[i])  # 允许重选当前元素
                path.pop()

        dfs(0, target)
        return ans`,
      },
      java: {
        code: `import java.util.*;

class Solution {
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> ans = new ArrayList<>();
        dfs(candidates, 0, target, new ArrayDeque<>(), ans);
        return ans;
    }

    private void dfs(int[] cand, int start, int remain,
                     Deque<Integer> path, List<List<Integer>> ans) {
        if (remain == 0) { ans.add(new ArrayList<>(path)); return; }
        for (int i = start; i < cand.length; i++) {
            if (cand[i] > remain) continue;
            path.push(cand[i]);
            dfs(cand, i, remain - cand[i], path, ans);
            path.pop();
        }
    }
}`,
      },
      javascript: {
        code: `/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
var combinationSum = function(candidates, target) {
    const ans = [];
    const path = [];
    const dfs = (start, remain) => {
        if (remain === 0) { ans.push([...path]); return; }
        for (let i = start; i < candidates.length; i++) {
            if (candidates[i] > remain) continue;
            path.push(candidates[i]);
            dfs(i, remain - candidates[i]);
            path.pop();
        }
    };
    dfs(0, target);
    return ans;
};`,
      },
      typescript: {
        code: `function combinationSum(candidates: number[], target: number): number[][] {
    const ans: number[][] = [];
    const path: number[] = [];
    const dfs = (start: number, remain: number): void => {
        if (remain === 0) { ans.push([...path]); return; }
        for (let i = start; i < candidates.length; i++) {
            if (candidates[i] > remain) continue;
            path.push(candidates[i]);
            dfs(i, remain - candidates[i]);
            path.pop();
        }
    };
    dfs(0, target);
    return ans;
}`,
      },
      go: {
        code: `func combinationSum(candidates []int, target int) [][]int {
    var ans [][]int
    var path []int
    var dfs func(start, remain int)
    dfs = func(start, remain int) {
        if remain == 0 {
            tmp := make([]int, len(path))
            copy(tmp, path)
            ans = append(ans, tmp)
            return
        }
        for i := start; i < len(candidates); i++ {
            if candidates[i] > remain {
                continue
            }
            path = append(path, candidates[i])
            dfs(i, remain-candidates[i])
            path = path[:len(path)-1]
        }
    }
    dfs(0, target)
    return ans
}`,
      },
      rust: {
        code: `impl Solution {
    pub fn combination_sum(candidates: Vec<i32>, target: i32) -> Vec<Vec<i32>> {
        let mut ans: Vec<Vec<i32>> = Vec::new();
        let mut path: Vec<i32> = Vec::new();
        fn dfs(cand: &[i32], start: usize, remain: i32,
               path: &mut Vec<i32>, ans: &mut Vec<Vec<i32>>) {
            if remain == 0 { ans.push(path.clone()); return; }
            for i in start..cand.len() {
                if cand[i] > remain { continue; }
                path.push(cand[i]);
                dfs(cand, i, remain - cand[i], path, ans);
                path.pop();
            }
        }
        dfs(&candidates, 0, target, &mut path, &mut ans);
        ans
    }
}`,
      },
      kotlin: {
        code: `class Solution {
    fun combinationSum(candidates: IntArray, target: Int): List<List<Int>> {
        val ans = mutableListOf<List<Int>>()
        val path = mutableListOf<Int>()
        fun dfs(start: Int, remain: Int) {
            if (remain == 0) { ans.add(path.toList()); return }
            for (i in start until candidates.size) {
                if (candidates[i] > remain) continue
                path.add(candidates[i])
                dfs(i, remain - candidates[i])
                path.removeAt(path.size - 1)
            }
        }
        dfs(0, target)
        return ans
    }
}`,
      },
      swift: {
        code: `class Solution {
    func combinationSum(_ candidates: [Int], _ target: Int) -> [[Int]] {
        var ans: [[Int]] = []
        var path: [Int] = []
        func dfs(_ start: Int, _ remain: Int) {
            if remain == 0 { ans.append(path); return }
            for i in start..<candidates.count {
                if candidates[i] > remain { continue }
                path.append(candidates[i])
                dfs(i, remain - candidates[i])
                path.removeLast()
            }
        }
        dfs(0, target)
        return ans
    }
}`,
      },
    },
    complexity: { time: "O(S) S 为合法组合数总长度", space: "O(target) 递归深度" },
    keyPoints: "回溯递归传 i（不是 i+1）允许重选；start 参数避免组合重复枚举。",
  },

  /* ============================================================== */
  /*  42. Trapping Rain Water (Hard)                                 */
  /* ============================================================== */
  {
    id: 42,
    slug: "trapping-rain-water",
    titleZh: "接雨水",
    titleEn: "Trapping Rain Water",
    difficulty: "hard",
    tags: ["数组", "双指针", "单调栈", "DP"],
    description: "高度数组表示柱子，下雨后能接住多少单位的雨水。",
    officialUrl: "https://leetcode.cn/problems/trapping-rain-water/",
    approach: `本质：每一格的接水量 = min(左侧最高柱, 右侧最高柱) - 该格高度（负值取 0）。难点是高效求出每格的左右最大值。双指针让两边同时收缩，O(n) 时间 O(1) 空间最优。

实现要点：l, r 从两端往中间走，维护 leftMax 和 rightMax。每步比较 height[l] 和 height[r]：哪边小，哪边的最高柱就是已经确定的"瓶颈"——它不会被另一边 push 高（另一边更高）。低的那边累计 max - height[i] 然后指针推进。

陷阱与对比：先用两次扫求 leftMax[] 和 rightMax[] 数组再求和，O(n) 时间但 O(n) 空间。单调栈解法 O(n) 也可，按行（横向）累计水量，思路更绕。双指针是经典最优解，关键是能讲清"为什么处理较低那侧是安全的"——因为另一侧 max 已经 ≥ 它，瓶颈就是较低侧的 max。`,
    solutions: {
      c: {
        code: `int trap(int* height, int heightSize) {
    int l = 0, r = heightSize - 1;
    int leftMax = 0, rightMax = 0;
    int ans = 0;
    while (l < r) {
        if (height[l] < height[r]) {
            if (height[l] >= leftMax) leftMax = height[l];
            else ans += leftMax - height[l];
            ++l;
        } else {
            if (height[r] >= rightMax) rightMax = height[r];
            else ans += rightMax - height[r];
            --r;
        }
    }
    return ans;
}`,
      },
      cpp: {
        code: `#include <vector>
using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        int l = 0, r = (int)height.size() - 1;
        int leftMax = 0, rightMax = 0, ans = 0;
        while (l < r) {
            if (height[l] < height[r]) {
                if (height[l] >= leftMax) leftMax = height[l];
                else ans += leftMax - height[l];
                ++l;
            } else {
                if (height[r] >= rightMax) rightMax = height[r];
                else ans += rightMax - height[r];
                --r;
            }
        }
        return ans;
    }
};`,
      },
      python: {
        code: `from typing import List

class Solution:
    def trap(self, height: List[int]) -> int:
        l, r = 0, len(height) - 1
        left_max = right_max = 0
        ans = 0
        while l < r:
            if height[l] < height[r]:
                if height[l] >= left_max:
                    left_max = height[l]
                else:
                    ans += left_max - height[l]
                l += 1
            else:
                if height[r] >= right_max:
                    right_max = height[r]
                else:
                    ans += right_max - height[r]
                r -= 1
        return ans`,
      },
      java: {
        code: `class Solution {
    public int trap(int[] height) {
        int l = 0, r = height.length - 1;
        int leftMax = 0, rightMax = 0, ans = 0;
        while (l < r) {
            if (height[l] < height[r]) {
                if (height[l] >= leftMax) leftMax = height[l];
                else ans += leftMax - height[l];
                l++;
            } else {
                if (height[r] >= rightMax) rightMax = height[r];
                else ans += rightMax - height[r];
                r--;
            }
        }
        return ans;
    }
}`,
      },
      javascript: {
        code: `/**
 * @param {number[]} height
 * @return {number}
 */
var trap = function(height) {
    let l = 0, r = height.length - 1;
    let leftMax = 0, rightMax = 0, ans = 0;
    while (l < r) {
        if (height[l] < height[r]) {
            if (height[l] >= leftMax) leftMax = height[l];
            else ans += leftMax - height[l];
            l++;
        } else {
            if (height[r] >= rightMax) rightMax = height[r];
            else ans += rightMax - height[r];
            r--;
        }
    }
    return ans;
};`,
      },
      typescript: {
        code: `function trap(height: number[]): number {
    let l = 0, r = height.length - 1;
    let leftMax = 0, rightMax = 0, ans = 0;
    while (l < r) {
        if (height[l] < height[r]) {
            if (height[l] >= leftMax) leftMax = height[l];
            else ans += leftMax - height[l];
            l++;
        } else {
            if (height[r] >= rightMax) rightMax = height[r];
            else ans += rightMax - height[r];
            r--;
        }
    }
    return ans;
}`,
      },
      go: {
        code: `func trap(height []int) int {
    l, r := 0, len(height)-1
    leftMax, rightMax, ans := 0, 0, 0
    for l < r {
        if height[l] < height[r] {
            if height[l] >= leftMax {
                leftMax = height[l]
            } else {
                ans += leftMax - height[l]
            }
            l++
        } else {
            if height[r] >= rightMax {
                rightMax = height[r]
            } else {
                ans += rightMax - height[r]
            }
            r--
        }
    }
    return ans
}`,
      },
      rust: {
        code: `impl Solution {
    pub fn trap(height: Vec<i32>) -> i32 {
        let (mut l, mut r) = (0_usize, height.len().saturating_sub(1));
        let (mut left_max, mut right_max, mut ans) = (0_i32, 0_i32, 0_i32);
        while l < r {
            if height[l] < height[r] {
                if height[l] >= left_max { left_max = height[l]; }
                else                     { ans += left_max - height[l]; }
                l += 1;
            } else {
                if height[r] >= right_max { right_max = height[r]; }
                else                      { ans += right_max - height[r]; }
                r -= 1;
            }
        }
        ans
    }
}`,
      },
      kotlin: {
        code: `class Solution {
    fun trap(height: IntArray): Int {
        var l = 0; var r = height.size - 1
        var leftMax = 0; var rightMax = 0; var ans = 0
        while (l < r) {
            if (height[l] < height[r]) {
                if (height[l] >= leftMax) leftMax = height[l]
                else ans += leftMax - height[l]
                l++
            } else {
                if (height[r] >= rightMax) rightMax = height[r]
                else ans += rightMax - height[r]
                r--
            }
        }
        return ans
    }
}`,
      },
      swift: {
        code: `class Solution {
    func trap(_ height: [Int]) -> Int {
        var l = 0, r = height.count - 1
        var leftMax = 0, rightMax = 0, ans = 0
        while l < r {
            if height[l] < height[r] {
                if height[l] >= leftMax { leftMax = height[l] }
                else                    { ans += leftMax - height[l] }
                l += 1
            } else {
                if height[r] >= rightMax { rightMax = height[r] }
                else                     { ans += rightMax - height[r] }
                r -= 1
            }
        }
        return ans
    }
}`,
      },
    },
    complexity: { time: "O(n)", space: "O(1)" },
    keyPoints: "双指针 + leftMax/rightMax 同步收缩：处理较低那侧总安全。",
  },

  /* ============================================================== */
  /*  46. Permutations (Medium)                                      */
  /* ============================================================== */
  {
    id: 46,
    slug: "permutations",
    titleZh: "全排列",
    titleEn: "Permutations",
    difficulty: "medium",
    tags: ["回溯", "数组"],
    description: "互不相同的整数数组返回所有可能的全排列。",
    officialUrl: "https://leetcode.cn/problems/permutations/",
    approach: `本质：n 个不同元素的全排列共 n! 个，每次从尚未用过的元素里挑一个放到当前位置。回溯模板：path + used 数组 + dfs。

实现要点：dfs(path)。当 path.size == n 收答案。否则循环每个 i：若 used[i] 跳过；否则 used[i] = true、path.push(nums[i])、递归、回退（pop + used[i] = false）。used 数组比"在 path 里查找元素是否已用"快 n 倍。

陷阱与对比：交换法（每次把 nums[i] 与 nums[start] 交换 + 递归 start+1）也是经典实现，省去 used 数组但破坏原数组顺序。元素有重复时（47 题）需要"同层去重"：先排序，循环里跳过 i > start && nums[i] == nums[i-1] && !used[i-1]。本题无重复，最简单模板即可。`,
    solutions: {
      c: {
        code: `#include <stdlib.h>
#include <string.h>

static void dfs(int* nums, int n, int* path, int pathLen, int* used,
                int*** ans, int** cols, int* cnt, int* cap) {
    if (pathLen == n) {
        if (*cnt == *cap) {
            *cap *= 2;
            *ans = (int**)realloc(*ans, (*cap) * sizeof(int*));
            *cols = (int*)realloc(*cols, (*cap) * sizeof(int));
        }
        int* row = (int*)malloc(n * sizeof(int));
        memcpy(row, path, n * sizeof(int));
        (*ans)[*cnt] = row;
        (*cols)[*cnt] = n;
        (*cnt)++;
        return;
    }
    for (int i = 0; i < n; ++i) {
        if (used[i]) continue;
        used[i] = 1;
        path[pathLen] = nums[i];
        dfs(nums, n, path, pathLen + 1, used, ans, cols, cnt, cap);
        used[i] = 0;
    }
}

int** permute(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {
    int cap = 16;
    int** ans = (int**)malloc(cap * sizeof(int*));
    int* cols = (int*)malloc(cap * sizeof(int));
    int* path = (int*)malloc(numsSize * sizeof(int));
    int* used = (int*)calloc(numsSize, sizeof(int));
    int cnt = 0;
    dfs(nums, numsSize, path, 0, used, &ans, &cols, &cnt, &cap);
    free(path);
    free(used);
    *returnSize = cnt;
    *returnColumnSizes = cols;
    return ans;
}`,
      },
      cpp: {
        code: `#include <vector>
using namespace std;

class Solution {
    void dfs(vector<int>& nums, vector<int>& path, vector<bool>& used,
             vector<vector<int>>& ans) {
        if (path.size() == nums.size()) { ans.push_back(path); return; }
        for (int i = 0; i < (int)nums.size(); ++i) {
            if (used[i]) continue;
            used[i] = true;
            path.push_back(nums[i]);
            dfs(nums, path, used, ans);
            path.pop_back();
            used[i] = false;
        }
    }
public:
    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int>> ans;
        vector<int> path;
        vector<bool> used(nums.size(), false);
        dfs(nums, path, used, ans);
        return ans;
    }
};`,
      },
      python: {
        code: `from typing import List

class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        ans: List[List[int]] = []
        path: List[int] = []
        used = [False] * len(nums)

        def dfs() -> None:
            if len(path) == len(nums):
                ans.append(path[:])
                return
            for i in range(len(nums)):
                if used[i]:
                    continue
                used[i] = True
                path.append(nums[i])
                dfs()
                path.pop()
                used[i] = False

        dfs()
        return ans`,
      },
      java: {
        code: `import java.util.*;

class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> ans = new ArrayList<>();
        boolean[] used = new boolean[nums.length];
        dfs(nums, new ArrayDeque<>(), used, ans);
        return ans;
    }

    private void dfs(int[] nums, Deque<Integer> path, boolean[] used,
                     List<List<Integer>> ans) {
        if (path.size() == nums.length) { ans.add(new ArrayList<>(path)); return; }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            path.addLast(nums[i]);
            dfs(nums, path, used, ans);
            path.removeLast();
            used[i] = false;
        }
    }
}`,
      },
      javascript: {
        code: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function(nums) {
    const ans = [];
    const path = [];
    const used = new Array(nums.length).fill(false);
    const dfs = () => {
        if (path.length === nums.length) { ans.push([...path]); return; }
        for (let i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            path.push(nums[i]);
            dfs();
            path.pop();
            used[i] = false;
        }
    };
    dfs();
    return ans;
};`,
      },
      typescript: {
        code: `function permute(nums: number[]): number[][] {
    const ans: number[][] = [];
    const path: number[] = [];
    const used: boolean[] = new Array(nums.length).fill(false);
    const dfs = (): void => {
        if (path.length === nums.length) { ans.push([...path]); return; }
        for (let i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            path.push(nums[i]);
            dfs();
            path.pop();
            used[i] = false;
        }
    };
    dfs();
    return ans;
}`,
      },
      go: {
        code: `func permute(nums []int) [][]int {
    var ans [][]int
    var path []int
    used := make([]bool, len(nums))
    var dfs func()
    dfs = func() {
        if len(path) == len(nums) {
            tmp := make([]int, len(path))
            copy(tmp, path)
            ans = append(ans, tmp)
            return
        }
        for i := 0; i < len(nums); i++ {
            if used[i] {
                continue
            }
            used[i] = true
            path = append(path, nums[i])
            dfs()
            path = path[:len(path)-1]
            used[i] = false
        }
    }
    dfs()
    return ans
}`,
      },
      rust: {
        code: `impl Solution {
    pub fn permute(nums: Vec<i32>) -> Vec<Vec<i32>> {
        let n = nums.len();
        let mut ans: Vec<Vec<i32>> = Vec::new();
        let mut path: Vec<i32> = Vec::with_capacity(n);
        let mut used = vec![false; n];
        fn dfs(nums: &[i32], path: &mut Vec<i32>, used: &mut [bool],
               ans: &mut Vec<Vec<i32>>) {
            if path.len() == nums.len() { ans.push(path.clone()); return; }
            for i in 0..nums.len() {
                if used[i] { continue; }
                used[i] = true;
                path.push(nums[i]);
                dfs(nums, path, used, ans);
                path.pop();
                used[i] = false;
            }
        }
        dfs(&nums, &mut path, &mut used, &mut ans);
        ans
    }
}`,
      },
      kotlin: {
        code: `class Solution {
    fun permute(nums: IntArray): List<List<Int>> {
        val ans = mutableListOf<List<Int>>()
        val path = mutableListOf<Int>()
        val used = BooleanArray(nums.size)
        fun dfs() {
            if (path.size == nums.size) { ans.add(path.toList()); return }
            for (i in nums.indices) {
                if (used[i]) continue
                used[i] = true
                path.add(nums[i])
                dfs()
                path.removeAt(path.size - 1)
                used[i] = false
            }
        }
        dfs()
        return ans
    }
}`,
      },
      swift: {
        code: `class Solution {
    func permute(_ nums: [Int]) -> [[Int]] {
        var ans: [[Int]] = []
        var path: [Int] = []
        var used = [Bool](repeating: false, count: nums.count)
        func dfs() {
            if path.count == nums.count { ans.append(path); return }
            for i in 0..<nums.count {
                if used[i] { continue }
                used[i] = true
                path.append(nums[i])
                dfs()
                path.removeLast()
                used[i] = false
            }
        }
        dfs()
        return ans
    }
}`,
      },
    },
    complexity: { time: "O(n · n!)", space: "O(n) 递归 + used 数组" },
    keyPoints: "回溯 + used 数组防重复选；path 长度等于 n 时收答案。",
  },
];
