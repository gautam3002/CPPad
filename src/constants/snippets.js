export const CPP_TEMPLATE = `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Your code here
    
    return 0;
}`;

export const PYTHON_TEMPLATE = `import sys
input = sys.stdin.readline

def main():
    # Your code here
    pass

if __name__ == "__main__":
    main()`;

export const JAVA_TEMPLATE = `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        // Your code here
        
    }
}`;

// One starter snippet per language — rest are user-created
export const DEFAULT_SNIPPETS = {
  cpp:    [{ id: "default-cpp",    name: "CP Template", code: CPP_TEMPLATE,    isDefault: true }],
  python: [{ id: "default-py",     name: "CP Template", code: PYTHON_TEMPLATE, isDefault: true }],
  java:   [{ id: "default-java",   name: "CP Template", code: JAVA_TEMPLATE,   isDefault: true }],
};

export const THEMES = [
  { label: "GitHub Dark",     value: "github-dark" },
  { label: "Monokai",         value: "monokai" },
  { label: "Dracula",         value: "dracula" },
  { label: "One Dark Pro",    value: "one-dark-pro" },
  { label: "Nord",            value: "nord" },
  { label: "Cobalt",          value: "cobalt" },
  { label: "Cobalt 2",        value: "cobalt2" },
  { label: "Tomorrow Night",  value: "tomorrow-night" },
  { label: "Clouds Midnight", value: "clouds-midnight" },
  { label: "Solarized Dark",  value: "solarized-dark" },
  { label: "Solarized Light", value: "solarized-light" },
  { label: "Ayu Dark",        value: "ayu-dark" },
  { label: "VS Dark",         value: "vs-dark" },
  { label: "VS Light",        value: "light" },
];

export const FONT_SIZES = [12, 13, 14, 15, 16, 18, 20];

export const LANGUAGES = [
  {
    label: "C++17 -O2 (GCC 14)",
    value: "105",
    compilerOptions: "-std=c++17 -O2",
    monacoLang: "cpp",
    ext: "cpp",
    template: "cpp",
  },
  {
    label: "C++20 -O2 (GCC 14)",
    value: "105",
    compilerOptions: "-std=c++20 -O2",
    monacoLang: "cpp",
    ext: "cpp",
    template: "cpp",
  },
  {
    label: "C++23 -O2 (GCC 14)",
    value: "105",
    compilerOptions: "-std=c++23 -O2",
    monacoLang: "cpp",
    ext: "cpp",
    template: "cpp",
  },
  {
    label: "C++17 (no opt)",
    value: "105",
    compilerOptions: "-std=c++17",
    monacoLang: "cpp",
    ext: "cpp",
    template: "cpp",
  },
  {
    label: "C++14 -O2",
    value: "105",
    compilerOptions: "-std=c++14 -O2",
    monacoLang: "cpp",
    ext: "cpp",
    template: "cpp",
  },
  {
    label: "C++11 -O2",
    value: "105",
    compilerOptions: "-std=c++11 -O2",
    monacoLang: "cpp",
    ext: "cpp",
    template: "cpp",
  },
  {
    label: "C++17 -O2 (GCC 9)",
    value: "54",
    compilerOptions: "-std=c++17 -O2",
    monacoLang: "cpp",
    ext: "cpp",
    template: "cpp",
  },
  {
    label: "Python 3.14",
    value: "113",
    compilerOptions: "",
    monacoLang: "python",
    ext: "py",
    template: "python",
  },
  {
    label: "Python 3.12",
    value: "100",
    compilerOptions: "",
    monacoLang: "python",
    ext: "py",
    template: "python",
  },
  {
    label: "Python 3.11",
    value: "92",
    compilerOptions: "",
    monacoLang: "python",
    ext: "py",
    template: "python",
  },
  {
    label: "Python 3.8",
    value: "71",
    compilerOptions: "",
    monacoLang: "python",
    ext: "py",
    template: "python",
  },
  {
    label: "Java 17 (JDK 17)",
    value: "91",
    compilerOptions: "",
    monacoLang: "java",
    ext: "java",
    template: "java",
  },
  {
    label: "Java 13 (OpenJDK)",
    value: "62",
    compilerOptions: "",
    monacoLang: "java",
    ext: "java",
    template: "java",
  },
];