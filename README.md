<h1 align="center">Assembly Language Mastery: From Zero to Hero</h1>

<p align="center">
  <strong>The Definitive Guide to x86-64, ARM64, RISC-V, and MIPS Low-Level Engineering</strong><br />
  49 chapters · 9 learning levels · ~714 pages · 48 hours of reading
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#table-of-contents">Table of Contents</a> ·
  <a href="#getting-started">Getting Started</a> ·
  <a href="#deploying-to-github-pages">Deploy to GitHub Pages</a> ·
  <a href="#tech-stack">Tech Stack</a>
</p>

---

An interactive ebook and publication-grade PDF platform for mastering Assembly language across
four major architectures. Includes professional diagrams, architectural schematics, an interactive
laboratory, search, font/theme controls, and a print-ready book view.

## Features

- **Interactive Ebook Reader** — searchable table of contents, chapter navigation, adjustable font size, and serif/sans/mono reading modes.
- **Interactive Laboratory** — hands-on terminal experiments tied to each chapter.
- **Print-Ready Publication View** — a certified print/production layout (~714 pages) with `Print / Export to PDF` support.
- **Professional Diagrams** — CPU architecture schematics, memory maps, pipeline diagrams, and ISA comparisons.
- **Dark / Light Theme** — comfortable reading in any environment.

## Table of Contents

> 49 chapters organized into 9 progressive levels.

### Level 1 — Foundations
*The Hardware-Software Interface & Machine Code Roots*

| # | Chapter |
|---|---------|
| 1 | Introduction to Assembly Language and Computer Architecture |
| 2 | Data Representation: Binary, Hexadecimal, and Two's Complement |
| 3 | CPU Registers, Memory, and the Stack |
| 4 | Assemblers, Linkers, and the Build Process |
| 5 | Basic Instructions and Simple Programs |

### Level 2 — Core Assembly Programming
*Registers, Memory Addressing & Fundamental Control Flow*

| # | Chapter |
|---|---------|
| 6 | Data Movement and Addressing Modes |
| 7 | Arithmetic and Logical Instructions |
| 8 | Control Flow: Comparisons, Branches, and Loops |
| 9 | Arrays, Strings, and Memory Operations |
| 10 | Procedures, Calling Conventions, and the Stack Frame |
| 11 | Recursion and Local Variables |

### Level 3 — Intermediate Assembly
*Pointers, Data Structures, SIMD & Operating System Interfaces*

| # | Chapter |
|---|---------|
| 12 | Advanced Addressing Modes and Pointers |
| 13 | Structures and Memory Manipulation |
| 14 | Floating-Point and SIMD Instructions |
| 15 | Macros and Modular Programming |
| 16 | System Calls and Interaction with the OS |
| 17 | Debugging with GDB and Other Tools |

### Level 4 — Advanced Assembly
*Microarchitecture, ABI Nuances & Concurrency*

| # | Chapter |
|---|---------|
| 18 | CPU Architecture Deep Dive: Pipelines, Caches, Branch Prediction |
| 19 | ABI Details and Register Allocation |
| 20 | Inline Assembly and Integration with C/C++ |
| 21 | Performance Optimization Techniques |
| 22 | Atomic Operations, Multithreading, and Concurrency |

### Level 5 — Low-Level Systems & Reverse Engineering
*Binary Anatomy, Disassembly & Binary Analysis*

| # | Chapter |
|---|---------|
| 23 | Executable Formats: ELF and PE |
| 24 | Disassembly and Reading Compiler-Generated Assembly |
| 25 | Stack Frames, Prologues, and Epilogues |
| 26 | Reverse Engineering Fundamentals |
| 27 | Understanding Optimized Binaries and Basic Malware Analysis |

### Level 6 — Advanced Projects
*Seven Production-Grade Capstones Written in Pure Assembly*

| # | Chapter |
|---|---------|
| 28 | Project 1: Command-Line Calculator |
| 29 | Project 2: String Manipulation Library |
| 30 | Project 3: Array and Sorting Utilities |
| 31 | Project 4: File I/O and Custom Memory Routines |
| 32 | Project 5: Integrating Assembly with C |
| 33 | Project 6: Mini Virtual Machine |
| 34 | Project 7: Low-Level Systems Project |

### Level 7 — Embedded Systems & Real-Time Assembly
*Bare-Metal ARM Cortex-M & Peripheral Control*

| # | Chapter |
|---|---------|
| 35 | Introduction to Embedded Systems and Microcontrollers |
| 36 | Memory-Mapped I/O and Peripheral Control |
| 37 | Interrupt Handling and Real-Time Constraints |
| 38 | Low-Power and Bare-Metal Programming |
| 39 | Bootloaders and Firmware Development |

### Level 8 — Security & Binary Exploitation
*Offensive Shellcoding, ROP Chains & Defensive Hardening*

| # | Chapter |
|---|---------|
| 40 | Shellcoding and Payload Development |
| 41 | Buffer Overflows and Memory Corruption |
| 42 | Return-Oriented Programming (ROP) and Code Reuse |
| 43 | Anti-Debugging and Anti-Analysis Techniques |
| 44 | Secure Coding and Defensive Assembly |

### Level 9 — Cross-Platform & Alternative Architectures
*ARM64, RISC-V, MIPS & Unified Portable Assembly*

| # | Chapter |
|---|---------|
| 45 | ARM Assembly Essentials |
| 46 | RISC-V Assembly |
| 47 | MIPS and Other Architectures |
| 48 | Comparing Architectures: ISA Design and Trade-offs |
| 49 | Writing Portable Assembly Code |

## Metadata

| | |
|---|---|
| Title | Assembly Language Mastery: From Zero to Hero |
| Subtitle | The Definitive Guide to x86-64, ARM64, RISC-V, and MIPS Low-Level Engineering |
| Author | Systems Engineering Academy |
| Edition | First Global Edition (2026) |
| ISBN | 978-0-987654-32-1 |
| Pages | ~714 |

## Getting Started

**Prerequisites:** Node.js (v18+) and npm.

```bash
npm install
npm run dev        # start the development server on http://localhost:3000
npm run build      # production build into `dist/`
npm run preview    # preview the production build
```

## Deploying to GitHub Pages

The repo is configured to build under the `/Assembly-Language-Mastery-From-Zero-to-Hero/`
base path so assets resolve correctly on GitHub Pages.

1. **Enable GitHub Actions as the Pages source**
   Repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. **Push to `main`** — the included `.github/workflows/deploy.yml` builds the app and deploys `dist/` to Pages automatically.
3. Your site will be live at `https://<username>.github.io/Assembly-Language-Mastery-From-Zero-to-Hero/`.

## Tech Stack

- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS 4** for styling
- **lucide-react** icons, **motion** for animations

## License

Educational content. All rights reserved.