# ⚡ CPPad

A fast, minimal code editor built for Competitive Programming.

🔗 **Live:** [cppad.vercel.app](https://cppad.vercel.app)

***

## Features

### Editor
- Monaco Editor — the same engine powering VS Code
- Syntax highlighting for C++, Python, and Java
- Auto bracket matching and bracket pair colorization
- Real clang-format code formatting via WASM (`Cmd+S`)
- Code snippets — one starter template per language + create your own
- Multiple themes — GitHub Dark, Monokai, Dracula, Nord, One Dark Pro, and more
- Adjustable font size

### Run & Judge
- Compile & Run via Judge0 CE — real remote execution
- C++ (GCC 14) with C++11 / C++14 / C++17 / C++20 / C++23 variants
- Python 3.8 – 3.14 and Java 13 / 17
- Configurable compiler options per language (`-O2`, `-std=c++17`, etc.)
- Execution time and memory shown after each run
- Verdict badges — AC / WA / TLE / CE / RE

### Test Cases
- Add multiple input/output test cases per problem
- Run all test cases at once
- Auto AC / WA verdict when expected output is provided
- Collapsible test case panels

### Utilities
- Share — encode your code into a URL and copy to clipboard
- Download — save your code as a local file
- Keyboard shortcuts reference panel
- Persistent state — code, input, and language saved across sessions

***

## Getting Started

```bash
git clone https://github.com/gautam3002/CPPad.git
cd CPPad
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

***

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd+B` / `F5` | Compile & Run |
| `Cmd+S` | Format code (clang-format) |
| `Cmd+L` | Select entire line |
| `Cmd+Shift+K` | Delete entire line |
| `Cmd+/` | Toggle line comment |
| `Cmd+D` | Select next occurrence |
| `Cmd+Shift+S` | Open Snippets |
| `Alt+↑ / Alt+↓` | Move line up / down |
| `Fn+Shift+← / →` | Select to line start / end (Mac) |

***

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool |
| Monaco Editor | Code editor engine |
| Judge0 CE API | Remote code execution |
| @wasm-fmt/clang-format | C++ formatting via WASM |
| Tailwind CSS v4 | Styling |
| Lucide React | Icons |
| react-hot-toast | Notifications |

***

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── SnippetPanel.jsx
│   ├── TestCases.jsx
│   └── ShortcutsModal.jsx
├── hooks/
│   └── useKeyboardShortcuts.js
├── utils/
│   ├── judge0.js
│   ├── formatter.js
│   ├── themes.js
│   ├── intellisense.js
│   └── platform.js
├── constants/
│   └── snippets.js
└── App.jsx
```

***

## License

MIT
