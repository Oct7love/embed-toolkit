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
];
