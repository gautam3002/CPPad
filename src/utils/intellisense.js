// Registers enhanced C++ intellisense in Monaco
export function registerCppIntellisense(monaco) {
  const CPP_KEYWORDS = [
    "auto","break","case","catch","class","const","constexpr","continue",
    "default","delete","do","else","enum","explicit","extern","false","for",
    "friend","goto","if","inline","mutable","namespace","new","noexcept",
    "nullptr","operator","override","private","protected","public","return",
    "sizeof","static","static_assert","static_cast","struct","switch",
    "template","this","throw","true","try","typedef","typeid","typename",
    "union","using","virtual","volatile","while",
  ];

  const STL_COMPLETIONS = [
    // Containers
    { label: "vector",       detail: "std::vector<T>",          doc: "Dynamic array" },
    { label: "map",          detail: "std::map<K,V>",           doc: "Sorted key-value map (RB tree)" },
    { label: "unordered_map",detail: "std::unordered_map<K,V>", doc: "Hash map O(1) average" },
    { label: "set",          detail: "std::set<T>",             doc: "Sorted unique elements" },
    { label: "unordered_set",detail: "std::unordered_set<T>",   doc: "Hash set O(1) average" },
    { label: "multiset",     detail: "std::multiset<T>",        doc: "Sorted set with duplicates" },
    { label: "queue",        detail: "std::queue<T>",           doc: "FIFO queue" },
    { label: "deque",        detail: "std::deque<T>",           doc: "Double-ended queue" },
    { label: "stack",        detail: "std::stack<T>",           doc: "LIFO stack" },
    { label: "priority_queue",detail:"std::priority_queue<T>",  doc: "Max-heap by default" },
    { label: "pair",         detail: "std::pair<A,B>",          doc: "Two values. Access: .first .second" },
    { label: "tuple",        detail: "std::tuple<...>",         doc: "Multiple values. Use get<N>(t)" },
    { label: "string",       detail: "std::string",             doc: "Dynamic string" },
    { label: "array",        detail: "std::array<T,N>",         doc: "Fixed size array" },
    { label: "bitset",       detail: "std::bitset<N>",          doc: "Fixed-size bit array" },
    // Algorithms
    { label: "sort",         detail: "sort(begin, end)",        doc: "Sort range in O(n log n)" },
    { label: "reverse",      detail: "reverse(begin, end)",     doc: "Reverse range in place" },
    { label: "lower_bound",  detail: "lower_bound(begin, end, val)", doc: "First element >= val" },
    { label: "upper_bound",  detail: "upper_bound(begin, end, val)", doc: "First element > val" },
    { label: "binary_search",detail: "binary_search(begin, end, val)", doc: "Returns true if val exists" },
    { label: "max_element",  detail: "max_element(begin, end)", doc: "Iterator to max element" },
    { label: "min_element",  detail: "min_element(begin, end)", doc: "Iterator to min element" },
    { label: "accumulate",   detail: "accumulate(begin, end, init)", doc: "Sum of range" },
    { label: "count",        detail: "count(begin, end, val)",  doc: "Count occurrences of val" },
    { label: "find",         detail: "find(begin, end, val)",   doc: "Iterator to first val" },
    { label: "unique",       detail: "unique(begin, end)",      doc: "Remove consecutive duplicates" },
    { label: "next_permutation", detail: "next_permutation(begin, end)", doc: "Advance to next permutation" },
    { label: "fill",         detail: "fill(begin, end, val)",   doc: "Fill range with val" },
    { label: "iota",         detail: "iota(begin, end, start)", doc: "Fill with increasing values" },
    { label: "max",          detail: "max(a, b)",               doc: "Return larger of a, b" },
    { label: "min",          detail: "min(a, b)",               doc: "Return smaller of a, b" },
    { label: "swap",         detail: "swap(a, b)",              doc: "Swap two values" },
    { label: "abs",          detail: "abs(x)",                  doc: "Absolute value" },
    { label: "gcd",          detail: "gcd(a, b)",               doc: "Greatest common divisor (C++17)" },
    { label: "lcm",          detail: "lcm(a, b)",               doc: "Least common multiple (C++17)" },
    { label: "__gcd",        detail: "__gcd(a, b)",             doc: "GCD (GNU extension)" },
    // I/O
    { label: "cout",         detail: "std::cout",               doc: "Standard output stream" },
    { label: "cin",          detail: "std::cin",                doc: "Standard input stream" },
    { label: "endl",         detail: "std::endl",               doc: "Newline + flush (use '\\n' for speed)" },
    { label: "printf",       detail: "printf(fmt, ...)",        doc: "C-style formatted output" },
    { label: "scanf",        detail: "scanf(fmt, ...)",         doc: "C-style formatted input" },
    // Types
    { label: "int",          detail: "int",                     doc: "32-bit integer" },
    { label: "long long",    detail: "long long",               doc: "64-bit integer. Max: 9.2e18" },
    { label: "double",       detail: "double",                  doc: "64-bit float" },
    { label: "bool",         detail: "bool",                    doc: "Boolean: true / false" },
    { label: "char",         detail: "char",                    doc: "Single character / 8-bit int" },
    { label: "size_t",       detail: "size_t",                  doc: "Unsigned size type" },
  ];

  // CP-specific code snippets as completions
  const CP_SNIPPETS = [
    {
      label: "pbds",
      detail: "Policy-based ordered set",
      insertText: `#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>
using namespace __gnu_pbds;
typedef tree<int,null_type,less<int>,rb_tree_tag,tree_order_statistics_node_update> ordered_set;
// ordered_set s; s.insert(x); s.order_of_key(x); *s.find_by_order(k);`,
    },
    {
      label: "forloop",
      detail: "for (int i = 0; i < n; i++)",
      insertText: "for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t$0\n}",
      insertTextRules: 4, // InsertAsSnippet
    },
    {
      label: "forn",
      detail: "for (int i = 0; i < n; i++) shorthand",
      insertText: "for (int i = 0; i < ${1:n}; i++) $0",
      insertTextRules: 4,
    },
    {
      label: "vii",
      detail: "vector<pair<int,int>>",
      insertText: "vector<pair<int,int>>",
    },
    {
      label: "pii",
      detail: "pair<int,int>",
      insertText: "pair<int,int>",
    },
    {
      label: "ll",
      detail: "long long",
      insertText: "long long",
    },
    {
      label: "MOD",
      detail: "const long long MOD = 1e9+7",
      insertText: "const long long MOD = 1e9 + 7;",
    },
    {
      label: "INF",
      detail: "const long long INF = 1e18",
      insertText: "const long long INF = 1e18;",
    },
  ];

  // Register completion provider for C++
  monaco.languages.registerCompletionItemProvider("cpp", {
    triggerCharacters: [".", "::", "<", " ", "#"],
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions = [
        // Keywords
        ...CPP_KEYWORDS.map((kw) => ({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
          range,
        })),
        // STL completions
        ...STL_COMPLETIONS.map((item) => ({
          label: item.label,
          kind: monaco.languages.CompletionItemKind.Function,
          detail: item.detail,
          documentation: item.doc,
          insertText: item.label,
          range,
        })),
        // CP snippets
        ...CP_SNIPPETS.map((s) => ({
          label: s.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          detail: s.detail,
          insertText: s.insertText,
          insertTextRules: s.insertTextRules || monaco.languages.CompletionItemInsertTextRule.None,
          range,
        })),
      ];

      return { suggestions };
    },
  });

  // Hover provider — show docs on hover for STL items
  monaco.languages.registerHoverProvider("cpp", {
    provideHover: (model, position) => {
      const word = model.getWordAtPosition(position);
      if (!word) return null;
      const match = STL_COMPLETIONS.find((s) => s.label === word.word);
      if (!match) return null;
      return {
        contents: [
          { value: `**${match.detail}**` },
          { value: match.doc },
        ],
      };
    },
  });
}