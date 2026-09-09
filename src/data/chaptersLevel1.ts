import { Chapter } from '../types';

export const CHAPTERS_LEVEL_1: Chapter[] = [
  {
    "id": 1,
    "slug": "chapter-1-introduction",
    "level": 1,
    "levelTitle": "Foundations",
    "title": "Chapter 1: Introduction to Assembly Language and Computer Architecture",
    "subtitle": "From Machine Code to Silicon: Understanding the CPU Execution Cycle",
    "learningObjectives": [
      "Understand what Assembly Language is and why it exists.",
      "Differentiate between machine code, Assembly, and high-level languages.",
      "Comprehend the roles of assembler, compiler, linker, and loader.",
      "Grasp the basic architecture of a CPU: registers, ALU, control unit, and memory.",
      "Learn the instruction execution cycle (fetch-decode-execute).",
      "Understand the difference between RISC and CISC architectures.",
      "Become familiar with binary, hexadecimal, and endianness.",
      "Write and run your first simple Assembly program."
    ],
    "prerequisites": [
      "Basic familiarity with any high-level programming language (C, Python, etc.).",
      "Ability to use a terminal/command line.",
      "A Linux environment (physical, virtual machine, or WSL)."
    ],
    "keyConcepts": [
      "Assembly Language is a human-readable representation of machine code.",
      "Machine code consists of binary instructions executed directly by the CPU.",
      "Assembler translates Assembly source code into machine code.",
      "CPU has registers (fast storage), an ALU (arithmetic logic unit), and a control unit.",
      "Memory is addressed linearly and stores both data and instructions.",
      "Endianness determines byte order of multi-byte data."
    ],
    "diagramType": "cpu_architecture",
    "sections": [
      {
        "id": "sec-1-1",
        "title": "1.1 What is Assembly Language?",
        "content": "Assembly Language is the lowest-level human-readable programming language. Each Assembly instruction corresponds almost one-to-one with a machine instruction that the CPU can execute. For example, the Assembly instruction mov eax, 5 might be encoded as the machine code bytes B8 05 00 00 00 (in x86). The CPU fetches these bytes, decodes them as \"move immediate value 5 into register EAX\", and then executes that action.\n\nWhy does Assembly exist?\n- Direct hardware control: Access to special CPU instructions, I/O ports, and system registers.\n- Performance: Fine-tuned optimization for critical loops or embedded systems.\n- Understanding: To know how high-level code compiles and how the machine actually works.\n- Reverse engineering and security: Analyzing malware, exploits, and vulnerabilities.\n- Systems programming: Writing bootloaders, kernels, drivers, and low-level libraries."
      },
      {
        "id": "sec-1-1-1",
        "title": "1.1.1 Machine Code vs Assembly",
        "content": "Machine code is the binary representation of instructions that the CPU executes directly. Each instruction is a sequence of bits, often variable-length (x86) or fixed-length (ARM, RISC-V). Machine code is extremely difficult for humans to read or write.\n\nAssembly provides mnemonics (e.g., mov, add, jmp) and symbolic names for registers and memory addresses. An assembler converts these mnemonics and operands into the corresponding binary machine code.",
        "tableData": {
          "headers": [
            "Aspect",
            "Machine Code",
            "Assembly Language"
          ],
          "rows": [
            [
              "Readability",
              "Binary/hex",
              "Mnemonics, labels"
            ],
            [
              "Level",
              "Directly executed",
              "One-to-one mapping"
            ],
            [
              "Portability",
              "CPU-specific",
              "CPU-specific, but easier to read"
            ],
            [
              "Examples",
              "B8 05 00 00 00",
              "mov eax, 5"
            ]
          ]
        }
      },
      {
        "id": "sec-1-1-2",
        "title": "1.1.2 Assemblers, Compilers, Linkers, Loaders",
        "content": "To turn a program from source code (Assembly or high-level) into an executable, several tools work in sequence:\n\n1. Assembler: Converts Assembly source (.asm) into object file (.o) containing machine code and metadata (symbol table, relocation info). Examples: NASM, GAS, MASM.\n2. Compiler: Translates high-level language (C, C++) into Assembly, then uses an assembler to produce object files. Some compilers generate machine code directly (JIT).\n3. Linker: Combines one or more object files and libraries, resolves symbol references (e.g., function calls to external code), and produces an executable (or shared library). Examples: ld, gcc (invokes linker).\n4. Loader: The operating system component that loads the executable into memory, performs dynamic linking if needed, and starts execution. On Linux, the loader is part of the kernel and dynamic linker (ld.so).\n\nThe overall flow for a pure Assembly program:\n\n\nFor a C program:",
        "codeSnippets": [
          {
            "language": "text",
            "title": "1.1.2 Assemblers, Compilers, Linkers, Loaders — diagram / output",
            "code": "Assembly source (.asm) --> Assembler (nasm) --> Object file (.o) --> Linker (ld) --> Executable --> Loader (OS) --> Running process"
          },
          {
            "language": "text",
            "title": "1.1.2 Assemblers, Compilers, Linkers, Loaders — diagram / output",
            "code": "C source (.c) --> Compiler (gcc) --> Assembly (.s) --> Assembler --> Object file (.o) --> Linker --> Executable"
          }
        ]
      },
      {
        "id": "sec-1-1-3",
        "title": "1.1.3 Toolchain Requirements",
        "content": "For this course, install the following on a Linux system:\n- NASM: sudo apt install nasm (or equivalent)\n- GCC (for linking and C interop): sudo apt install gcc\n- GDB (debugger): sudo apt install gdb\n- Make (optional but useful): sudo apt install make\n\nWe will use NASM syntax, which is Intel-like, and 64-bit registers (e.g., rax, rsp, rdi). The object file format will be ELF64. The calling convention for system calls will be Linux’s syscall ABI, not the C library."
      },
      {
        "id": "sec-1-2",
        "title": "1.2 CPU Architecture Fundamentals",
        "content": "The Central Processing Unit (CPU) executes instructions and processes data. A modern CPU consists of several key components:\n\n- Registers: Small, extremely fast storage locations inside the CPU. They hold operands, addresses, and intermediate results. In x86-64, there are 16 general-purpose 64-bit registers, plus many special-purpose registers (instruction pointer, flags, segment registers, etc.).\n- Arithmetic Logic Unit (ALU): Performs arithmetic (add, subtract) and logic (AND, OR, XOR) operations on data from registers.\n- Control Unit (CU): Fetches instructions from memory, decodes them, and coordinates execution by generating control signals.\n- Cache: Small high-speed memory inside the CPU that stores frequently used data/instructions to reduce average memory access time.\n- Bus Interface: Connects CPU to main memory and I/O devices."
      },
      {
        "id": "sec-1-2-1",
        "title": "1.2.1 Instruction Cycle (Fetch-Decode-Execute)",
        "content": "The CPU executes programs by repeatedly performing the following steps:\n\n1. Fetch: The CPU reads the next instruction from memory. The Instruction Pointer (IP, named RIP in 64-bit mode) holds the memory address of the next instruction. After fetching, the IP is updated to point to the following instruction.\n2. Decode: The Control Unit interprets the fetched bits to determine which operation to perform and what operands are needed. In x86, instruction length can vary (1–15 bytes), so decoding is complex.\n3. Execute: The ALU or other units perform the operation: arithmetic, data movement, memory access, or control transfer (jump).\n4. Write-back (if needed): The result is stored in a register or memory location.\n\nModern CPUs use pipelining to overlap these stages for multiple instructions, greatly increasing throughput. We'll explore this in Level 4."
      },
      {
        "id": "sec-1-2-2",
        "title": "1.2.2 Registers",
        "content": "Registers are the fastest storage in the computer, but they are limited in number. In x86-64, the general-purpose registers are 64 bits wide and have historical names:\n\n\n\nAdditionally, there are special registers:\n- RIP (Instruction Pointer): address of next instruction.\n- RFLAGS: status flags (Zero, Carry, Sign, Overflow, etc.) used for conditional branching.\n- XMM0–XMM15: 128-bit registers for floating-point and SIMD operations.\n- Segment registers (CS, DS, SS, etc.) are rarely used directly in 64-bit mode.\n\nMemory/Register Diagram:",
        "tableData": {
          "headers": [
            "64-bit",
            "32-bit",
            "16-bit",
            "8-bit (low)",
            "Purpose (conventional)",
            "8-bit (high)"
          ],
          "rows": [
            [
              "rax",
              "eax",
              "ax",
              "al",
              "Accumulator, return value",
              "ah"
            ],
            [
              "rbx",
              "ebx",
              "bx",
              "bl",
              "Callee-saved, base pointer",
              "bh"
            ],
            [
              "rcx",
              "ecx",
              "cx",
              "cl",
              "Counter, 4th argument",
              "ch"
            ],
            [
              "rdx",
              "edx",
              "dx",
              "dl",
              "Data, 3rd argument",
              "dh"
            ],
            [
              "rsi",
              "esi",
              "si",
              "sil",
              "Source index, 2nd argument",
              "(none)"
            ],
            [
              "rdi",
              "edi",
              "di",
              "dil",
              "Destination index, 1st argument",
              "(none)"
            ],
            [
              "rbp",
              "ebp",
              "bp",
              "bpl",
              "Base pointer (stack frame)",
              "(none)"
            ],
            [
              "rsp",
              "esp",
              "sp",
              "spl",
              "Stack pointer",
              "(none)"
            ],
            [
              "r8",
              "r8d",
              "r8w",
              "r8b",
              "5th argument",
              "(none)"
            ],
            [
              "r9",
              "r9d",
              "r9w",
              "r9b",
              "6th argument",
              "(none)"
            ],
            [
              "r10",
              "r10d",
              "r10w",
              "r10b",
              "Temporary",
              "(none)"
            ],
            [
              "r11",
              "r11d",
              "r11w",
              "r11b",
              "Temporary",
              "(none)"
            ],
            [
              "r12",
              "r12d",
              "r12w",
              "r12b",
              "Callee-saved",
              "(none)"
            ],
            [
              "r13",
              "r13d",
              "r13w",
              "r13b",
              "Callee-saved",
              "(none)"
            ],
            [
              "r14",
              "r14d",
              "r14w",
              "r14b",
              "Callee-saved",
              "(none)"
            ],
            [
              "r15",
              "r15d",
              "r15w",
              "r15b",
              "Callee-saved",
              "(none)"
            ]
          ]
        },
        "codeSnippets": [
          {
            "language": "text",
            "title": "1.2.2 Registers — diagram / output",
            "code": "CPU Registers                 Main Memory\n+----------------+            +-----------------+\n| RAX            | <--------> | Address 0x0000  |\n| RBX            |            | Address 0x0001  |\n| RCX            |            | ...             |\n| RDX            |            | Address 0xFFFF  |\n| RSI            |            +-----------------+\n| RDI            |\n| RBP            |\n| RSP  ----------|-----> Stack (grows downward)\n| RIP            |\n+----------------+"
          }
        ]
      },
      {
        "id": "sec-1-2-3",
        "title": "1.2.3 Memory",
        "content": "Memory is a linear array of bytes, each with a unique address. The CPU accesses memory via the address bus. In 64-bit mode, addresses are 64 bits, but in practice only 48 bits are used for virtual addresses (canonical addresses). Memory is byte-addressable: each byte has an address, but instructions can load/store words (2 bytes), doublewords (4 bytes), quadwords (8 bytes), etc., from aligned or unaligned addresses.\n\nThe stack is a region of memory used for function calls, local variables, and temporary storage. It grows downward (toward lower addresses) in x86. The RSP register always points to the top of the stack.\n\nThe heap is a region of memory used for dynamic allocation (e.g., malloc in C). It is managed by the operating system and library functions, not directly by Assembly unless we make system calls."
      },
      {
        "id": "sec-1-2-4",
        "title": "1.2.4 RISC vs CISC",
        "content": "x86 is a CISC (Complex Instruction Set Computer) architecture: instructions can be variable length, perform complex operations (e.g., string manipulation, memory-to-memory operations), and have many addressing modes. ARM (including ARM64) and RISC-V are RISC (Reduced Instruction Set Computer): fixed-length instructions, simple load/store architecture, and a larger number of registers. While CISC CPUs internally translate complex instructions into micro-operations (RISC-like), the programmer still sees the CISC instruction set. This course focuses on x86-64, but we'll occasionally contrast with ARM64.",
        "tableData": {
          "headers": [
            "Feature",
            "x86-64 (CISC)",
            "ARM64 (RISC)"
          ],
          "rows": [
            [
              "Instruction length",
              "Variable (1–15 bytes)",
              "Fixed (4 bytes)"
            ],
            [
              "Registers",
              "16 general-purpose",
              "31 general-purpose"
            ],
            [
              "Memory operands",
              "Many instructions can operate directly on memory",
              "Only load/store instructions access memory"
            ],
            [
              "Complexity",
              "High, many instruction variants",
              "Lower, simpler decoding"
            ],
            [
              "Typical use",
              "Desktops, servers",
              "Mobile, embedded, Apple Silicon"
            ]
          ]
        }
      },
      {
        "id": "sec-1-3",
        "title": "1.3 Data Representation",
        "content": ""
      },
      {
        "id": "sec-1-3-1",
        "title": "1.3.1 Binary, Decimal, Hexadecimal",
        "content": "Computers store everything as bits (0/1). A byte is 8 bits. To make binary more readable, we group bits into nibbles (4 bits) and represent each nibble with a hexadecimal digit (0-9, A-F).\n\n\n\nIn Assembly, we often write numbers in different bases:\n- Decimal: mov eax, 255\n- Hexadecimal: mov eax, 0xFF (NASM also allows 0xFF or 255d for decimal, 0b11111111 for binary, 0o377 for octal)\n- Binary: mov eax, 0b11111111",
        "tableData": {
          "headers": [
            "Decimal",
            "Binary (8-bit)",
            "Hexadecimal"
          ],
          "rows": [
            [
              "0",
              "0000 0000",
              "0x00"
            ],
            [
              "1",
              "0000 0001",
              "0x01"
            ],
            [
              "10",
              "0000 1010",
              "0x0A"
            ],
            [
              "15",
              "0000 1111",
              "0x0F"
            ],
            [
              "255",
              "1111 1111",
              "0xFF"
            ]
          ]
        }
      },
      {
        "id": "sec-1-3-2",
        "title": "1.3.2 Two’s Complement",
        "content": "Signed integers are represented using two’s complement. The most significant bit (MSB) is the sign bit: 0 = positive, 1 = negative. To negate a number, invert all bits and add 1. This representation simplifies arithmetic: addition and subtraction work the same for signed and unsigned numbers.\n\nExample: Represent -5 in 8-bit two’s complement.\n- +5 = 0000 0101\n- Invert: 1111 1010\n- Add 1: 1111 1011 = -5\n\nRange for n bits: -2^(n-1) to 2^(n-1)-1. For 32-bit: -2,147,483,648 to 2,147,483,647."
      },
      {
        "id": "sec-1-3-3",
        "title": "1.3.3 Endianness",
        "content": "Endianness describes the byte order of multi-byte data in memory.\n\n- Little-endian: least significant byte stored at lowest address (used by x86, ARM by default).\n- Big-endian: most significant byte stored at lowest address (used by some network protocols, some architectures).\n\nExample: The 32-bit value 0x12345678 stored at address 0x1000:\n\n\n\nThis matters when reading raw bytes or interpreting memory dumps.",
        "tableData": {
          "headers": [
            "Address",
            "Little-endian",
            "Big-endian"
          ],
          "rows": [
            [
              "0x1000",
              "0x78",
              "0x12"
            ],
            [
              "0x1001",
              "0x56",
              "0x34"
            ],
            [
              "0x1002",
              "0x34",
              "0x56"
            ],
            [
              "0x1003",
              "0x12",
              "0x78"
            ]
          ]
        }
      },
      {
        "id": "sec-1-4",
        "title": "1.4 Basic Assembly Program Structure",
        "content": "We'll now write a simple \"Hello, World!\" program using NASM for Linux x86-64. We'll use the Linux system call interface directly, not the C library."
      },
      {
        "id": "sec-1-4-1",
        "title": "1.4.1 Source Code: hello.asm",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "1.4.1 Source Code: hello.asm",
            "code": "; hello.asm - A simple \"Hello, World!\" program in x86-64 Assembly (NASM)\n; Assemble: nasm -f elf64 hello.asm -o hello.o\n; Link:     ld hello.o -o hello\n; Run:      ./hello\n\nsection .data\n    msg db 'Hello, World!', 0xA   ; string with newline\n    len equ $ - msg               ; length of string\n\nsection .text\n    global _start                 ; entry point for linker\n\n_start:\n    ; write syscall: sys_write (1)\n    mov rax, 1          ; syscall number for write\n    mov rdi, 1          ; file descriptor 1 = stdout\n    mov rsi, msg        ; pointer to message\n    mov rdx, len        ; message length\n    syscall             ; invoke kernel\n\n    ; exit syscall: sys_exit (60)\n    mov rax, 60         ; syscall number for exit\n    xor rdi, rdi        ; exit code 0 (set rdi to 0)\n    syscall             ; invoke kernel",
            "explanation": "Line-by-line explanation:\n• section .data declares initialized data. msg db 'Hello, World!', 0xA defines a byte string terminated with newline (0xA). len equ $ - msg computes length using current address ($) minus start.\n• section .text contains code. global _start makes _start visible to linker.\n• mov rax, 1 moves syscall number 1 (write) into rax.\n• mov rdi, 1 sets stdout. mov rsi, msg sets buffer address. mov rdx, len sets count.\n• syscall executes kernel trap. mov rax, 60 and xor rdi, rdi clean exits with code 0."
          }
        ]
      },
      {
        "id": "sec-1-4-2",
        "title": "1.4.2 Line-by-Line Explanation",
        "content": "- section .data declares a data section containing initialized data. msg db 'Hello, World!', 0xA defines a byte string terminated with newline (0xA). len equ $ - msg computes the length using the current address ($) minus the start of msg.\n- section .text contains code. global _start makes the _start label visible to the linker as the program entry point.\n- _start: is the entry point. Execution begins here.\n- mov rax, 1 moves the value 1 into rax. This is the syscall number for write (see Linux x86-64 syscall table).\n- mov rdi, 1 sets file descriptor 1 (stdout).\n- mov rsi, msg loads the address of the message into rsi (second argument for syscall: pointer to buffer).\n- mov rdx, len loads the length into rdx (third argument: count).\n- syscall triggers the kernel to perform the requested operation. The CPU switches to kernel mode, executes the syscall handler, and returns to user mode.\n- Then we set up exit syscall: rax=60, rdi=0 (exit code), and syscall."
      },
      {
        "id": "sec-1-4-3",
        "title": "1.4.3 Expected Output",
        "content": "When assembled, linked, and run, the program prints:\n\nand exits with status 0.",
        "codeSnippets": [
          {
            "language": "text",
            "title": "1.4.3 Expected Output — diagram / output",
            "code": "Hello, World!"
          }
        ]
      },
      {
        "id": "sec-1-4-4",
        "title": "1.4.4 Assembly, Linking, Execution Steps",
        "content": "",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "1.4.4 Assembly, Linking, Execution Steps",
            "code": "nasm -f elf64 hello.asm -o hello.o   # produces object file\nld hello.o -o hello                  # links, produces executable\n./hello                              # run\necho $?                              # prints exit code (0)"
          }
        ]
      },
      {
        "id": "sec-1-4-5",
        "title": "1.4.5 High-Level Equivalent (C)",
        "content": "But note the C version uses the C library and main as entry, while our Assembly uses _start and direct syscalls. When linking with gcc, the C runtime initializes things; here we bypass it.",
        "codeSnippets": [
          {
            "language": "c",
            "title": "1.4.5 High-Level Equivalent (C)",
            "code": "#include <unistd.h>\nint main() {\n    const char msg[] = \"Hello, World!\\n\";\n    write(1, msg, sizeof(msg)-1);\n    return 0;\n}"
          }
        ]
      },
      {
        "id": "sec-1-4-6",
        "title": "1.4.6 Common Mistakes",
        "content": "- Forgetting global _start: linker error \"undefined symbol _start\".\n- Using wrong syscall numbers or argument registers.\n- Not terminating string with newline (cosmetic but expected).\n- Forgetting to exit; program may crash or hang.\n- Using 32-bit registers in 64-bit syscalls (e.g., mov eax, 1 instead of mov rax, 1) – in 64-bit mode, writing to a 32-bit register zero-extends to 64-bit, so it's actually fine, but clarity matters."
      },
      {
        "id": "sec-1-4-7",
        "title": "1.4.7 Best Practices",
        "content": "- Use section .data for constants, section .bss for uninitialized data, section .text for code.\n- Name the entry point _start when linking with ld directly; use main if linking with gcc and C runtime.\n- Use equ for computed constants to avoid magic numbers.\n- Comment each logical block."
      },
      {
        "id": "sec-1-5",
        "title": "1.5 CPU Execution Trace of the Hello Program",
        "content": "Let's trace the first few instructions step by step, showing register and memory state.\n\nInitial state (simplified):\n- RIP = address of _start (after loader sets it).\n- RSP points to top of stack (contains argc, argv, envp).\n- Other registers are undefined (but often zeroed by kernel for security).\n\n\n\nMemory layout at data section:",
        "tableData": {
          "headers": [
            "Step",
            "Instruction",
            "Registers After",
            "Notes"
          ],
          "rows": [
            [
              "1",
              "mov rax, 1",
              "rax=1",
              "Syscall number"
            ],
            [
              "2",
              "mov rdi, 1",
              "rdi=1",
              "stdout"
            ],
            [
              "3",
              "mov rsi, msg",
              "rsi=0x402000 (example)",
              "Address of string"
            ],
            [
              "4",
              "mov rdx, len",
              "rdx=14",
              "Length (including newline)"
            ],
            [
              "5",
              "syscall",
              "Kernel executes write, returns number of bytes written in rax",
              ""
            ],
            [
              "6",
              "mov rax, 60",
              "rax=60",
              "Exit syscall"
            ],
            [
              "7",
              "xor rdi, rdi",
              "rdi=0",
              "Exit code"
            ],
            [
              "8",
              "syscall",
              "Process terminates",
              ""
            ]
          ]
        },
        "codeSnippets": [
          {
            "language": "text",
            "title": "1.5 CPU Execution Trace of the Hello Program — diagram / output",
            "code": "Address    Content\n0x402000   0x48 ('H')\n0x402001   0x65 ('e')\n...\n0x40200C   0x0A (newline)"
          }
        ]
      },
      {
        "id": "sec-1-5-diagram",
        "title": "Diagram: Stack and Registers during execution",
        "content": "",
        "codeSnippets": [
          {
            "language": "text",
            "title": "Diagram: Stack and Registers during execution — diagram / output",
            "code": "Registers:                         Memory:\n+---------+                      +-------------------+\n| RIP     |------------------>   | ...               |\n+---------+                      | (code)            |\n| RAX=1   |                      |                   |\n| RDI=1   |                      |                   |\n| RSI=... |------------------>   | \"Hello, World!\\n\" |\n| RDX=14  |                      |                   |\n| RSP     |-----> (top of stack) |                   |\n+---------+                      +-------------------+"
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-1-1",
        "title": "Exercise 1.1: Modify the Hello Program",
        "description": "Change the message to \"Assembly is fun!\\n\" and reassemble. Verify the output.",
        "hints": "Change the string in section .data and ensure len equ $ - msg recalculates automatically.",
        "solution": "section .data\n    msg db 'Assembly is fun!', 0xA\n    len equ $ - msg",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Replace msg db 'Hello, World!', 0xA with msg db 'Assembly is fun!', 0xA. Recalculate length automatically."
      },
      {
        "id": "ex-1-2",
        "title": "Exercise 1.2: Exit with Different Code",
        "description": "Modify the program to exit with code 7 instead of 0. Run and check echo $?.",
        "hints": "The exit code is placed in rdi before invoking syscall 60.",
        "solution": "    ; exit syscall\n    mov rax, 60\n    mov rdi, 7\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Change xor rdi, rdi to mov rdi, 7. Then exit code is 7."
      },
      {
        "id": "ex-1-3",
        "title": "Exercise 1.3: Two Syscalls",
        "description": "Write a program that uses two write syscalls to print two separate lines, then exits. (Hint: set up registers again for second write.)",
        "solution": "section .data\n    msg1 db 'First line', 0xA\n    len1 equ $ - msg1\n    msg2 db 'Second line', 0xA\n    len2 equ $ - msg2\n\nsection .text\n    global _start\n_start:\n    ; write msg1\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, msg1\n    mov rdx, len1\n    syscall\n\n    ; write msg2\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, msg2\n    mov rdx, len2\n    syscall\n\n    ; exit\n    mov rax, 60\n    xor rdi, rdi\n    syscall",
        "solutionLanguage": "nasm"
      },
      {
        "id": "ex-1-4",
        "title": "Exercise 1.4: Understand Endianness",
        "description": "Write a small Assembly program that defines a 4-byte value 0x12345678 in memory and then loads it into a register. Use GDB to examine the memory bytes and confirm they are little-endian. (We'll cover debugging in later chapters, but you can attempt.)",
        "solution": "section .data\n    value dd 0x12345678\nsection .text\n    global _start\n_start:\n    mov eax, [value]\n    mov rax, 60\n    xor rdi, rdi\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Define in .data: value dd 0x12345678. In code, mov eax, [value] loads the 4-byte value (little-endian). In GDB, x/4bx &value will show 0x78 0x56 0x34 0x12."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is the difference between an assembler and a compiler?",
        "answer": "An assembler translates human-readable assembly instructions almost 1:1 into machine binary opcodes. A compiler translates high-level languages (C, C++, Rust) with abstractions, types, and control structures into assembly or machine code, often performing complex transformations and optimizations."
      },
      {
        "question": "Why is Assembly language called “low-level”?",
        "answer": "Because it lacks language-level abstractions like automatic variable allocation, garbage collection, and hardware abstraction layers. Instructions map directly to the CPU microarchitecture operations."
      },
      {
        "question": "Explain the fetch-decode-execute cycle.",
        "answer": "1. Fetch: CPU reads instruction pointed to by RIP/PC from memory. 2. Decode: Control Unit decodes opcode bits and operand addresses. 3. Execute: ALU/FPU executes operation or transfers control. 4. Write-back: Output stored to register or memory."
      },
      {
        "question": "What is the role of the instruction pointer (RIP)?",
        "answer": "RIP holds the 64-bit virtual memory address of the next instruction to execute in the CPU pipeline."
      },
      {
        "question": "How does the CPU know whether to treat a value as signed or unsigned?",
        "answer": "The CPU stores raw bits without inherent signs. It calculates both signed and unsigned status flags (CF, OF, SF, ZF) simultaneously. The programmer/compiler chooses instructions (like jg vs ja) that interpret the flags as signed or unsigned."
      },
      {
        "question": "What is the significance of the stack pointer (RSP)?",
        "answer": "RSP points to the current top of the stack. It decrements on pushes and increments on pops, growing toward lower memory addresses."
      },
      {
        "question": "In x86-64, how many general-purpose registers are there? Name five.",
        "answer": "There are 16 general-purpose 64-bit registers: RAX, RBX, RCX, RDX, RSI, RDI, RBP, RSP, and R8 through R15."
      },
      {
        "question": "What is endianness? Which endianness does x86 use?",
        "answer": "Endianness defines the order in which bytes of a multi-byte word are stored in memory. x86 uses little-endian, where the least significant byte is stored at the lowest address."
      },
      {
        "question": "What is a system call? How is it invoked in x86-64 Linux?",
        "answer": "A system call requests services from the OS kernel. In x86-64 Linux, it is invoked with the syscall instruction after placing the syscall number in RAX and arguments in RDI, RSI, RDX, R10, R8, R9."
      },
      {
        "question": "What is the difference between section .data and section .bss?",
        "answer": "section .data holds initialized data and occupies space in the binary file. section .bss holds uninitialized data, takes zero space in the binary, and is allocated and zero-filled by the OS loader at runtime."
      }
    ],
    "summary": [
      "Assembly Language is a human-readable form of machine code, providing direct control over the CPU.",
      "The CPU fetches, decodes, and executes instructions in a cycle, using registers for fast storage.",
      "x86-64 has 16 general-purpose registers; we use NASM syntax and Linux syscalls for I/O.",
      "Data is represented in binary/hex, signed integers use two’s complement, and x86 is little-endian.",
      "A complete Assembly program requires sections for data and code, and an entry point.",
      "The assembler and linker transform source code into an executable.",
      "In the next chapter, we will dive deeper into data representation and start manipulating numbers with basic instructions."
    ]
  },
  {
    "id": 2,
    "slug": "chapter-2-data-representation",
    "level": 1,
    "levelTitle": "Foundations",
    "title": "Chapter 2: Data Representation: Binary, Hexadecimal, and Two’s Complement",
    "subtitle": "Bitwise Foundations, Sign Extension, and Little-Endian Architecture",
    "learningObjectives": [
      "Understand the binary and hexadecimal number systems.",
      "Convert between binary, decimal, and hexadecimal.",
      "Grasp the concepts of signed and unsigned integers.",
      "Master two’s complement representation for negative numbers.",
      "Understand basic bitwise operations and their use in assembly.",
      "Learn about endianness and how multi-byte data is stored in memory.",
      "Become familiar with character encoding (ASCII)."
    ],
    "prerequisites": [
      "Basic arithmetic and algebra.",
      "Familiarity with the concept of bits and bytes (introduced in Chapter 1).",
      "A Linux environment with NASM installed for optional exercises."
    ],
    "keyConcepts": [
      "Binary is base‑2; hexadecimal is base‑16.",
      "In assembly, numbers can be written in decimal, hex, binary, or octal.",
      "Two’s complement is the standard way to represent signed integers.",
      "Bitwise operations (AND, OR, XOR, NOT, shifts) manipulate individual bits.",
      "Little-endian (used by x86) stores the least significant byte first in memory.",
      "ASCII maps characters to byte values."
    ],
    "diagramType": "data_representation",
    "sections": [
      {
        "id": "sec-2-1",
        "title": "2.1 Number Systems",
        "content": "Computers store all data as binary digits (bits). A byte is 8 bits. Because long binary strings are hard to read, we often use hexadecimal (base‑16). Each hex digit represents exactly 4 bits (a nibble)."
      },
      {
        "id": "sec-2-1-1",
        "title": "2.1.1 Binary and Hexadecimal",
        "content": "In NASM, you can write numeric literals using different prefixes:\n- Decimal: mov eax, 255 (no prefix)\n- Hexadecimal: mov eax, 0xFF or mov eax, 0xff\n- Binary: mov eax, 0b11111111\n- Octal: mov eax, 0o377",
        "tableData": {
          "headers": [
            "Decimal",
            "Binary (8-bit)",
            "Hexadecimal"
          ],
          "rows": [
            [
              "0",
              "0000 0000",
              "0x00"
            ],
            [
              "1",
              "0000 0001",
              "0x01"
            ],
            [
              "10",
              "0000 1010",
              "0x0A"
            ],
            [
              "15",
              "0000 1111",
              "0x0F"
            ],
            [
              "255",
              "1111 1111",
              "0xFF"
            ]
          ]
        }
      },
      {
        "id": "sec-2-1-2",
        "title": "2.1.2 Conversion",
        "content": "Binary → Hex: group bits in nibbles from the right, convert each nibble.\n\nExample: 1101 0110 → 0xD6\n\nHex → Binary: replace each hex digit with its 4-bit binary equivalent.\n\nDecimal → Binary: repeatedly divide by 2, read remainders upward.\n\nExample: 13 → 1101\n\nDecimal → Hex: divide by 16, use remainders (10→A, 11→B, …).\n\nExample: 200 → C8 (12×16 + 8)\n\nYou should be comfortable converting small numbers mentally; larger numbers can be done with a calculator."
      },
      {
        "id": "sec-2-2",
        "title": "2.2 Data Sizes in Assembly",
        "content": "In x86-64, the CPU can operate on data of various sizes. The size of the data is determined by the instruction and the register or memory operand.\n\n\n\nWhen a 32-bit register is written, the upper 32 bits of the corresponding 64-bit register are automatically zeroed. For example, mov eax, 5 clears the upper half of rax. Writing to a 16-bit or 8-bit register does not affect the upper bits.",
        "tableData": {
          "headers": [
            "Name",
            "Size (bits)",
            "Size (bytes)",
            "NASM suffix",
            "Register examples (64-bit mode)"
          ],
          "rows": [
            [
              "Byte",
              "8",
              "1",
              "byte",
              "al, bl, r8b"
            ],
            [
              "Word",
              "16",
              "2",
              "word",
              "ax, bx, r8w"
            ],
            [
              "Doubleword",
              "32",
              "4",
              "dword",
              "eax, ebx, r8d"
            ],
            [
              "Quadword",
              "64",
              "8",
              "qword",
              "rax, rbx, r8"
            ]
          ]
        }
      },
      {
        "id": "sec-2-3",
        "title": "2.3 Signed and Unsigned Integers",
        "content": "Integers can be interpreted as either unsigned (all bits represent magnitude) or signed (one bit represents sign).\n\n- Unsigned range for n bits: 0 to 2ⁿ − 1.\n  - 8-bit: 0 to 255\n  - 32-bit: 0 to 4,294,967,295\n- Signed range (two’s complement): −2ⁿ⁻¹ to 2ⁿ⁻¹ − 1.\n  - 8-bit: −128 to 127\n  - 32-bit: −2,147,483,648 to 2,147,483,647\n\nThe same bit pattern can represent different values depending on interpretation:\n\n\n\nThe CPU itself does not know whether a value is signed or unsigned; it’s up to the programmer (or compiler) to choose the appropriate instructions. For example, conditional jumps after a comparison differ for signed vs unsigned (Chapter 8).",
        "tableData": {
          "headers": [
            "Bits (8-bit)",
            "Unsigned",
            "Signed (two’s complement)"
          ],
          "rows": [
            [
              "1111 1111",
              "255",
              "-1"
            ],
            [
              "1000 0000",
              "128",
              "-128"
            ],
            [
              "0111 1111",
              "127",
              "127"
            ]
          ]
        }
      },
      {
        "id": "sec-2-4",
        "title": "2.4 Two’s Complement",
        "content": "Two’s complement is the standard method for representing signed integers. Its beauty is that addition and subtraction work identically for signed and unsigned numbers—the hardware does not need separate circuits."
      },
      {
        "id": "sec-2-4-1",
        "title": "2.4.1 How to Negate a Number",
        "content": "To find the two’s complement negative of a number:\n\n1. Invert all bits (one’s complement).\n2. Add 1.\n\nExample: Represent −5 in 8 bits.\n\n- +5 = 0000 0101\n- Invert: 1111 1010\n- Add 1: 1111 1011 (this is −5)"
      },
      {
        "id": "sec-2-4-2",
        "title": "2.4.2 Why It Works",
        "content": "For an n-bit number, two’s complement of x is 2ⁿ − x (mod 2ⁿ). When you add x and its two’s complement, the result is 2ⁿ, which overflows to zero in n bits. Thus x + (−x) = 0."
      },
      {
        "id": "sec-2-4-3",
        "title": "2.4.3 Sign Extension",
        "content": "When moving a smaller signed value into a larger register, the sign bit must be replicated in the higher bits to preserve the value. x86 provides instructions for this:\n\n- movsx (move with sign extension)\n- movzx (move with zero extension, for unsigned)\n\nExample:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "2.4.3 Sign Extension",
            "code": "mov al, -5          ; al = 0xFB (11111011)\nmovsx bx, al        ; bx = 0xFFFB (sign extended, still -5)\nmovzx bx, al        ; bx = 0x00FB (unsigned, 251)"
          }
        ]
      },
      {
        "id": "sec-2-5",
        "title": "2.5 Bitwise Operations",
        "content": "Assembly provides instructions to manipulate individual bits. These are crucial for masking, setting/clearing flags, and efficient arithmetic.\n\n\n\nExample: Check if a number is odd",
        "tableData": {
          "headers": [
            "Instruction",
            "Operation",
            "Example",
            "Effect (on 8-bit values)"
          ],
          "rows": [
            [
              "and",
              "Bitwise AND",
              "and al, 0x0F",
              "Keeps low nibble, clears high"
            ],
            [
              "or",
              "Bitwise OR",
              "or  al, 0x80",
              "Sets the most significant bit"
            ],
            [
              "xor",
              "Bitwise XOR",
              "xor al, al",
              "Zeroes the register (common idiom)"
            ],
            [
              "not",
              "Bitwise NOT",
              "not al",
              "Inverts all bits"
            ],
            [
              "shl",
              "Shift left",
              "shl al, 1",
              "Multiply by 2 (logical)"
            ],
            [
              "shr",
              "Shift right (logical)",
              "shr al, 1",
              "Divide by 2 (unsigned)"
            ],
            [
              "sar",
              "Shift right (arithmetic)",
              "sar al, 1",
              "Divide by 2 (signed, keeps sign)"
            ],
            [
              "rol / ror",
              "Rotate left/right",
              "rol al, 1",
              "Rotate bits circularly"
            ]
          ]
        },
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "2.5 Bitwise Operations",
            "code": "test eax, 1      ; sets Zero flag if bit 0 is 0 (even)\njz  is_even      ; jump if zero\n; else odd"
          }
        ]
      },
      {
        "id": "sec-2-6",
        "title": "2.6 Endianness",
        "content": "Endianness defines the byte order of multi-byte data in memory.\n\n- Little-endian (x86, ARM default): least significant byte at lowest address.\n- Big-endian (some architectures, network protocols): most significant byte first.\n\nExample: 32-bit value 0x12345678 stored at address 0x1000.\n\n\n\nWhen examining memory dumps or raw binary, you must account for endianness.",
        "tableData": {
          "headers": [
            "Address",
            "Little-endian",
            "Big-endian"
          ],
          "rows": [
            [
              "0x1000",
              "0x78",
              "0x12"
            ],
            [
              "0x1001",
              "0x56",
              "0x34"
            ],
            [
              "0x1002",
              "0x34",
              "0x56"
            ],
            [
              "0x1003",
              "0x12",
              "0x78"
            ]
          ]
        }
      },
      {
        "id": "sec-2-6-1",
        "title": "2.6.1 In Assembly",
        "content": "When you define data in .data:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "2.6.1 In Assembly",
            "code": "section .data\n    value dd 0x12345678   ; define a doubleword",
            "explanation": "The assembler stores the bytes in little-endian order. If you later load this value into a register with mov eax, [value], the CPU interprets the bytes correctly and places 0x12345678 in eax."
          }
        ]
      },
      {
        "id": "sec-2-7",
        "title": "2.7 Character Representation: ASCII",
        "content": "Characters are represented as bytes using standard encodings. ASCII maps common English letters, digits, and punctuation to 7-bit values (0–127), stored in 8-bit bytes.\n\n\n\nIn NASM, you can define strings using single quotes or double quotes:",
        "tableData": {
          "headers": [
            "Character",
            "ASCII (hex)",
            "Decimal"
          ],
          "rows": [
            [
              "'A'",
              "0x41",
              "65"
            ],
            [
              "'a'",
              "0x61",
              "97"
            ],
            [
              "'0'",
              "0x30",
              "48"
            ],
            [
              "newline",
              "0x0A",
              "10"
            ],
            [
              "space",
              "0x20",
              "32"
            ]
          ]
        },
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "2.7 Character Representation: ASCII",
            "code": "msg db 'Hello', 0xA, 0    ; 0-terminated string",
            "explanation": "The assembler converts characters to their ASCII codes. For international text, Unicode (UTF-8) is used, which is backward compatible with ASCII."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-2-1",
        "title": "Exercise 2.1: Conversions",
        "description": "Convert the following:\na) 1011 1100 (binary) to hex and decimal (unsigned).\nb) 0x3F to binary and decimal.\nc) 200 (decimal) to hex and binary.",
        "solution": "a) 1011 1100 → hex: 0xBC, decimal (unsigned): 188.\nb) 0x3F → binary: 0011 1111, decimal: 63.\nc) 200 → hex: 0xC8, binary: 1100 1000."
      },
      {
        "id": "ex-2-2",
        "title": "Exercise 2.2: Two’s Complement",
        "description": "Represent −100 in 8-bit two’s complement. Show the steps.",
        "solution": "- 100 in binary (8-bit): 0110 0100\n- Invert: 1001 1011\n- Add 1: 1001 1100 → 0x9C\nThus −100 = 0x9C."
      },
      {
        "id": "ex-2-3",
        "title": "Exercise 2.3: Sign Extension",
        "description": "Given al = 0x80 (which is −128 signed). What is the value of ax after movsx ax, al? After movzx ax, al? Express in hex and interpret as signed/unsigned.",
        "solution": "al = 0x80 (binary 1000 0000).\n- movsx ax, al copies the sign bit (1) to all higher bits: ax = 0xFF80 (signed value −128).\n- movzx ax, al zero-extends: ax = 0x0080 (unsigned value 128)."
      },
      {
        "id": "ex-2-4",
        "title": "Exercise 2.4: Bitwise Operations",
        "description": "Write a short NASM program (or use GDB) that:\n- Loads 0b10101100 into al.\n- Performs and al, 0x0F.\n- What is the result? Explain which bits were cleared.",
        "solution": "mov al, 0b10101100   ; al = 0xAC\nand al, 0x0F         ; al = 0x0C (0000 1100)",
        "solutionLanguage": "nasm",
        "solutionExplanation": "The high nibble (1010) is cleared to 0000, the low nibble (1100) is preserved."
      },
      {
        "id": "ex-2-5",
        "title": "Exercise 2.5: Endianness",
        "description": "Define a quadword in .data with value 0x0102030405060708. Assemble and use GDB to examine the memory bytes. Are they little-endian? Write down the byte order.",
        "solution": "08 07 06 05 04 03 02 01",
        "solutionExplanation": "In memory (little-endian) starting at the label:\n\nThis confirms x86 uses little-endian."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is the difference between signed and unsigned integer representation?",
        "answer": "In unsigned representation, all bits represent positive magnitude. In signed representation (two's complement), the most significant bit is a sign bit (0=positive, 1=negative)."
      },
      {
        "question": "Why is two’s complement preferred over sign-magnitude?",
        "answer": "Two's complement allows addition and subtraction to be performed with the exact same hardware logic without needing separate sign handling circuitry, and it avoids having positive and negative zero."
      },
      {
        "question": "How do you negate a two’s complement number?",
        "answer": "Invert every bit, then add 1, keeping the original bit width. For example, in 8 bits, 0000 0101 becomes 1111 1010, then 1111 1011 (−5)."
      },
      {
        "question": "What does movsx do? When would you use it instead of mov?",
        "answer": "movsx moves a smaller operand into a larger register while copying the sign bit to all upper bits, preserving the negative or positive value when widening data types."
      },
      {
        "question": "Explain the difference between shr and sar.",
        "answer": "shr performs logical shift right, filling vacated high bits with 0 (ideal for unsigned division by 2). sar performs arithmetic shift right, replicating the sign bit to preserve the negative sign for signed division."
      },
      {
        "question": "What is endianness? Which endianness does x86 use?",
        "answer": "Endianness is the byte order of a multi-byte value in memory. x86 is little-endian: the least significant byte occupies the lowest address."
      },
      {
        "question": "Convert 0x1A to binary and decimal.",
        "answer": "0x1A is 0001 1010 in 8-bit binary and 26 in decimal: 1 × 16 + 10 = 26."
      },
      {
        "question": "What is the range of an 8-bit signed integer?",
        "answer": "An 8-bit signed two’s complement integer ranges from −128 to 127 (−2⁷ through 2⁷ − 1)."
      },
      {
        "question": "If eax = 0xFFFFFFFF, what is its value as a signed integer?",
        "answer": "As a signed 32-bit two’s complement integer, 0xFFFFFFFF represents −1. The same bits interpreted as unsigned represent 4,294,967,295."
      },
      {
        "question": "How is the newline character represented in ASCII?",
        "answer": "The ASCII newline (line feed) is hexadecimal 0x0A, decimal 10."
      }
    ],
    "summary": [
      "Computers use binary; we use hexadecimal for readability.",
      "Data sizes: byte (8 bits), word (16), dword (32), qword (64).",
      "Signed integers use two’s complement; negation = invert + 1.",
      "Sign extension preserves negative values when widening.",
      "Bitwise operations allow direct manipulation of bits.",
      "x86 is little-endian, meaning low byte at low address.",
      "ASCII maps characters to bytes; newline is 0x0A.",
      "In the next chapter, we will explore the x86-64 registers, memory layout, and the stack in detail, building the foundation for writing more complex programs."
    ]
  },
  {
    id: 3,
    slug: 'chapter-3-registers-memory-stack',
    level: 1,
    levelTitle: 'Foundations',
    title: 'Chapter 3: CPU Registers, Memory, and the Stack',
    subtitle: 'x86-64 General Purpose Registers, Addressing Modes, and Stack Semantics',
    learningObjectives: [
      'Understand the x86-64 general-purpose registers and their conventional uses.',
      'Learn how memory is addressed and the different addressing modes.',
      'Grasp the concept of the stack, its growth direction, and its role in function calls and local storage.',
      'Understand how to push and pop data on the stack.',
      'Learn how to allocate and deallocate stack space for local variables.',
      'Become familiar with the RSP and RBP registers and stack frames.',
      'Write simple programs that use registers and the stack.'
    ],
    prerequisites: [
      'Basic understanding of assembly syntax and data representation (Chapters 1 and 2).',
      'Familiarity with NASM and the Linux build process.',
      'A Linux environment with NASM, GCC, and GDB installed.'
    ],
    keyConcepts: [
      'Registers are the CPU\'s fastest storage, limited in number, and named by convention.',
      'Memory is a linear array of bytes, addressed by 64-bit pointers.',
      'The stack is a region of memory used for temporary storage, function calls, and local variables.',
      'RSP points to the top of the stack; the stack grows downward (toward lower addresses).',
      'push and pop instructions manipulate the stack and update RSP.',
      'A stack frame is an area on the stack used by a function for its arguments, return address, saved registers, and local variables.'
    ],
    diagramType: 'registers_memory',
    sections: [
      {
        id: 'sec-3-1',
        title: '3.1 General-Purpose Registers in x86-64',
        content: `The x86-64 architecture provides 16 general-purpose registers. Each can be used for arithmetic, data movement, and addressing. Although they are "general-purpose," calling conventions and hardware instructions assign specific roles.

Registers:
• rax: Accumulator; function return value
• rbx: Callee-saved; general base pointer
• rcx: Counter; 4th function argument (System V AMD64 ABI)
• rdx: Data register; 3rd function argument; high half of multiplication/division
• rsi: Source index; 2nd function argument
• rdi: Destination index; 1st function argument
• rbp: Base pointer / frame pointer
• rsp: Stack pointer (points to top of active stack)
• r8-r11: 5th/6th args and temporary scratch registers
• r12-r15: Callee-saved general-purpose registers`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'Partial Register Zero-Extension',
            code: `mov rax, -1         ; rax = 0xFFFFFFFFFFFFFFFF
mov eax, 5          ; rax = 0x0000000000000005 (upper 32 bits cleared automatically!)
mov ax, 10          ; rax = 0x000000000000000A (writing 16-bit does NOT clear upper bits!)`
          }
        ]
      },
      {
        id: 'sec-3-2',
        title: '3.2 Memory Addressing Modes',
        content: `An addressing mode specifies how to compute the effective address of a memory operand. The general form is:
[base + index*scale + displacement]
where scale is 1, 2, 4, or 8.

Examples:
• Immediate: mov eax, 42
• Register: mov eax, ebx
• Direct: mov eax, [0x402000]
• Register indirect: mov eax, [rbx]
• Base + displacement: mov eax, [rbx + 8]
• Base + index*scale: mov eax, [rbx + rcx*4]
• Base + index*scale + displacement: mov eax, [rbx + rcx*4 + 16]
• RIP-relative: mov eax, [rel myvar] (standard for position-independent code)`
      },
      {
        id: 'sec-3-3',
        title: '3.3 The Stack & Stack Frame',
        content: `The stack grows downward: from higher addresses to lower addresses. RSP always points to the top of the stack (the last item pushed).

Push and Pop:
• push operand: RSP = RSP - 8; store operand at [RSP]
• pop operand: operand = [RSP]; RSP = RSP + 8

Stack Frames:
When a function is called, call pushes the return address (RIP). A standard prologue with frame pointer sets up RBP:
push rbp
mov rbp, rsp
sub rsp, N        ; allocate N bytes for locals

Epilogue:
mov rsp, rbp
pop rbp
ret`
      }
    ],
    exercises: [
      {
        id: 'ex-3-1',
        title: 'Exercise 3.1: Register Swap Without Temporary',
        description: 'Write a NASM snippet that swaps rax and rbx using only xor (no push/pop).',
        solution: `xor rax, rbx\nxor rbx, rax\nxor rax, rbx`,
        solutionLanguage: 'nasm',
        solutionExplanation: 'The three XORs swap rax and rbx without allocating temporary memory or stack.'
      }
    ],
    practiceQuestions: [
      {
        question: 'What are the callee-saved registers in x86-64 System V ABI?',
        answer: 'RBX, RBP, R12, R13, R14, and R15 are callee-saved; if a function modifies them, it must restore their original values before returning.'
      },
      {
        question: 'Why is the stack aligned to 16 bytes before a call?',
        answer: 'The System V AMD64 ABI mandates 16-byte stack alignment before a call instruction to optimize memory bus transfers and enable aligned SSE/AVX vector operations without faults.'
      }
    ],
    summary: [
      'x86-64 has 16 general-purpose registers with established ABI conventions.',
      'The stack grows downward; RSP points to the top.',
      'push and pop manage data on the stack and adjust RSP.',
      'Stack frames use RBP to access locals and arguments with stable offsets.',
      'Memory addressing supports base, index, scale, and displacement.'
    ]
  },
  {
    id: 4,
    slug: 'chapter-4-assemblers-linkers-build',
    level: 1,
    levelTitle: 'Foundations',
    title: 'Chapter 4: Assemblers, Linkers, and the Build Process',
    subtitle: 'From Source to Binary: Object Files, Symbol Tables, and Relocations',
    learningObjectives: [
      'Understand the role of the assembler in translating assembly source to machine code.',
      'Learn how the linker combines object files and resolves symbols.',
      'Comprehend the stages of the build process: assembly, linking, and loading.',
      'Explore the ELF object file format and its sections.',
      'Understand symbol tables, relocation, and how external references are resolved.',
      'Differentiate between static and dynamic linking.',
      'Use nasm, ld, and gcc to build executable programs from assembly.',
      'Write a simple Makefile to automate the build process.'
    ],
    prerequisites: [
      'Basic knowledge of assembly syntax (Chapter 1).',
      'Familiarity with Linux command line and file system.',
      'Ability to write and run simple assembly programs.'
    ],
    keyConcepts: [
      'Assembler converts .asm source into an object file (.o) containing machine code and metadata.',
      'Linker combines object files and libraries, resolves symbols, and produces an executable or shared library.',
      'Object file is an intermediate binary format (ELF on Linux) with sections, symbol tables, and relocation entries.',
      'Symbol table lists functions, variables, and other named entities with addresses or offsets.',
      'Relocation is the process of adjusting addresses in code/data when the final layout is known.',
      'Static linking copies library code into the executable; dynamic linking references shared libraries at runtime.'
    ],
    diagramType: 'toolchain_pipeline',
    sections: [
      {
        id: 'sec-4-1',
        title: '4.1 The Build Process Overview',
        content: `Creating an executable from source code involves:
1. Assembly: Translate mnemonics and directives into machine code stored in an object file (.o).
2. Symbol Resolution: Linker matches extern references in one file to global definitions in another.
3. Relocation: Linker patches relative/absolute offsets once final virtual memory addresses are assigned.
4. Loading: Operating system kernel loads the ELF into virtual memory and begins execution at _start.`
      },
      {
        id: 'sec-4-2',
        title: '4.2 Modular Multi-File Assembly Example',
        content: `Here is a complete two-file project where main.asm calls a function in func.asm:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'main.asm',
            code: `; main.asm
section .data
    msg db 'Result: ', 0
section .text
    global _start
    extern add_numbers

_start:
    ; Call add_numbers(3, 4)
    mov rdi, 3
    mov rsi, 4
    call add_numbers       ; result in rax

    ; Exit with code = result (7)
    mov rdi, rax           ; exit code
    mov rax, 60
    syscall`
          },
          {
            language: 'nasm',
            title: 'func.asm',
            code: `; func.asm
section .text
    global add_numbers

add_numbers:
    ; Add rdi + rsi, return in rax
    mov rax, rdi
    add rax, rsi
    ret`
          },
          {
            language: 'make',
            title: 'Makefile',
            code: `ASM = nasm
ASMFLAGS = -f elf64
LD = ld
TARGET = program
OBJECTS = main.o func.o

all: $(TARGET)

$(TARGET): $(OBJECTS)
\t$(LD) $(OBJECTS) -o $(TARGET)

%.o: %.asm
\t$(ASM) $(ASMFLAGS) $< -o $@

clean:
\trm -f $(OBJECTS) $(TARGET)`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-4-1',
        title: 'Exercise 4.1: Inspect Relocations',
        description: 'Assemble a file calling an external function. Use readelf -r to inspect relocation records.',
        solution: 'nasm -f elf64 main.asm -o main.o && readelf -r main.o',
        solutionLanguage: 'bash',
        solutionExplanation: 'Shows relocation entries of type R_X86_64_PLT32 pointing to unresolved symbols.'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is a relocation? Why is it needed?',
        answer: 'A relocation is a record generated by the assembler telling the linker that an instruction refers to a memory address or function not yet placed at a known location. The linker patches this offset when stitching object files together.'
      },
      {
        question: 'Explain the difference between static and dynamic linking.',
        answer: 'Static linking bundles all library code into the final executable, creating a self-contained file with no runtime dependencies. Dynamic linking leaves references to shared libraries (.so), which the OS loader binds at runtime, saving disk and memory.'
      }
    ],
    summary: [
      'Assemblers generate object code, symbols, and relocations.',
      'Linkers resolve symbols across object files and apply address relocations.',
      'ELF is the standard executable format on Linux.',
      'Makefiles automate compiling and linking multi-file projects.'
    ]
  },
  {
    id: 5,
    slug: 'chapter-5-basic-instructions',
    level: 1,
    levelTitle: 'Foundations',
    title: 'Chapter 5: Basic Instructions and Simple Programs',
    subtitle: 'Arithmetic, Bitwise Logic, Status Flags, and Control Flow Loops',
    learningObjectives: [
      'Understand and use fundamental data movement instructions: mov, lea, xchg.',
      'Perform arithmetic operations using add, sub, inc, dec, neg, imul, idiv.',
      'Apply logical and bitwise operations: and, or, xor, not, test.',
      'Use shift and rotate instructions: shl, shr, sar, rol, ror.',
      'Understand how instructions affect CPU status flags.',
      'Write complete assembly programs that perform calculations and output results.',
      'Implement simple loops using jmp and conditional jumps.'
    ],
    prerequisites: [
      'Solid understanding of registers, memory, and the stack (Chapter 3).',
      'Familiarity with the build process using NASM and ld (Chapter 4).',
      'Basic knowledge of binary and hexadecimal representation (Chapter 2).'
    ],
    keyConcepts: [
      'Data movement copies data between registers, memory, and immediate values.',
      'Arithmetic instructions perform integer addition, subtraction, multiplication, and division.',
      'Logical instructions operate on individual bits.',
      'Shift and rotate move bits left or right, useful for multiplication/division by powers of two.',
      'Flags (Zero, Sign, Carry, Overflow) reflect the result of operations and drive conditional branching.',
      'Loops are built using jumps and conditional jumps based on comparisons.'
    ],
    diagramType: 'basic_instructions_flags',
    sections: [
      {
        id: 'sec-5-1',
        title: '5.1 Arithmetic, Signed Multiply & Divide',
        content: `x86-64 provides rich instructions for integer operations:
• add / sub: dest = dest ± src. Updates ZF, SF, CF, OF.
• inc / dec: dest = dest ± 1. Updates ZF, SF, OF, but leaves CF untouched!
• neg: Two's complement negation (dest = 0 - dest).
• imul: Signed multiplication. Can take 1, 2, or 3 operands (e.g. imul rax, rbx, 10).
• idiv: Signed division. Divides rdx:rax by operand. Quotient in rax, remainder in rdx. Must sign-extend rax into rdx using cqo before dividing!`
      },
      {
        id: 'sec-5-2',
        title: '5.2 Sample Programs: Loop Sum & Even/Odd Branching',
        content: `Complete runnable assembly programs demonstrating loops and condition flags:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'sum1toN.asm (Sum from 1 to 10)',
            code: `; sum1toN.asm - Compute sum of 1 to 10, exit with code = sum (55)
section .text
    global _start

_start:
    xor rax, rax        ; accumulator = 0
    mov rcx, 1          ; counter = 1

loop_start:
    add rax, rcx        ; sum += counter
    inc rcx             ; counter++
    cmp rcx, 10
    jle loop_start      ; if counter <= 10, repeat

    mov rdi, rax        ; exit code = sum (55)
    mov rax, 60         ; sys_exit
    syscall`
          },
          {
            language: 'nasm',
            title: 'evenodd.asm (Bit Test Branching)',
            code: `; evenodd.asm - Check if number is even or odd
section .data
    number dq 7
    even_msg db 'Even', 0xA
    even_len equ $ - even_msg
    odd_msg db 'Odd', 0xA
    odd_len equ $ - odd_msg

section .text
    global _start

_start:
    mov rax, [number]
    test rax, 1         ; check bit 0
    jz is_even

    ; odd branch
    mov rax, 1          ; sys_write
    mov rdi, 1
    mov rsi, odd_msg
    mov rdx, odd_len
    syscall
    jmp exit

is_even:
    mov rax, 1
    mov rdi, 1
    mov rsi, even_msg
    mov rdx, even_len
    syscall

exit:
    mov rax, 60
    xor rdi, rdi
    syscall`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-5-1',
        title: 'Exercise 5.1: Sum of Even Numbers',
        description: 'Write a program that sums all even numbers from 1 to 20 (2+4+...+20 = 110). Exit with the sum.',
        solution: `section .text\nglobal _start\n_start:\n    xor rax, rax\n    mov rcx, 2\nloop_start:\n    add rax, rcx\n    add rcx, 2\n    cmp rcx, 20\n    jle loop_start\n    mov rdi, rax\n    mov rax, 60\n    syscall`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is the difference between test and cmp?',
        answer: 'cmp performs subtraction (dest - src) and sets all condition flags without storing the result. test performs bitwise AND (dest & src) and sets ZF, SF, and PF while clearing CF and OF, without altering operands.'
      },
      {
        question: 'Why is cqo necessary before signed 64-bit idiv?',
        answer: 'The idiv rbx instruction expects a 128-bit dividend across rdx:rax. cqo sign-extends the 64-bit value in rax into rdx, filling rdx with all 0s or all 1s depending on whether rax is positive or negative.'
      }
    ],
    summary: [
      'mov copies data; lea computes addresses without modifying flags; xchg swaps.',
      'Arithmetic: add, sub, inc, dec, neg, imul, idiv.',
      'Signed division requires sign-extension using cqo (or cdq).',
      'Logical operations (and, or, xor, not, test) manipulate individual bits.',
      'Shifts and rotates move bits linearly or circularly.',
      'Status flags drive conditional jump branches.'
    ]
  }
];
