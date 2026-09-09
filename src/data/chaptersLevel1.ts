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
    "id": 3,
    "slug": "chapter-3-registers-memory-stack",
    "level": 1,
    "levelTitle": "Foundations",
    "title": "Chapter 3: CPU Registers, Memory, and the Stack",
    "subtitle": "x86-64 General Purpose Registers, Addressing Modes, and Stack Semantics",
    "learningObjectives": [
      "Understand the x86-64 general-purpose registers and their conventional uses.",
      "Learn how memory is addressed and the different addressing modes.",
      "Grasp the concept of the stack, its growth direction, and its role in function calls and local storage.",
      "Understand how to push and pop data on the stack.",
      "Learn how to allocate and deallocate stack space for local variables.",
      "Become familiar with the RSP and RBP registers and stack frames.",
      "Write simple programs that use registers and the stack."
    ],
    "prerequisites": [
      "Basic understanding of assembly syntax and data representation (Chapters 1 and 2).",
      "Familiarity with NASM and the Linux build process.",
      "A Linux environment with NASM, GCC, and GDB installed."
    ],
    "keyConcepts": [
      "Registers are the CPU’s fastest storage, limited in number, and named by convention.",
      "Memory is a linear array of bytes, addressed by 64-bit pointers.",
      "The stack is a region of memory used for temporary storage, function calls, and local variables.",
      "RSP points to the top of the stack; the stack grows downward (toward lower addresses).",
      "push and pop instructions manipulate the stack and update RSP.",
      "A stack frame is an area on the stack used by a function for its arguments, return address, saved registers, and local variables."
    ],
    "diagramType": "registers_memory",
    "sections": [
      {
        "id": "sec-3-1",
        "title": "3.1 General-Purpose Registers in x86-64",
        "content": "The x86-64 architecture provides 16 general-purpose registers. Each can be used for arithmetic, data movement, and addressing. Although they are “general-purpose,” certain instructions and calling conventions assign them specific roles. Understanding these conventions is essential for writing interoperable and readable assembly."
      },
      {
        "id": "sec-3-1-1",
        "title": "3.1.1 Register Names and Sizes",
        "content": "The 64-bit registers are named rax, rbx, rcx, rdx, rsi, rdi, rbp, rsp, and r8–r15. For backward compatibility, the lower 32 bits, 16 bits, and 8 bits can be accessed with different names:\n\n\n\nImportant: The registers r8–r15 have byte versions r8b–r15b, but they do not have high-byte variants (like ah). The high-byte accessors ah, bh, ch, dh are only available for rax, rbx, rcx, rdx.",
        "tableData": {
          "headers": [
            "64-bit",
            "32-bit",
            "16-bit",
            "8-bit (low)",
            "8-bit (high)",
            "Conventional Use"
          ],
          "rows": [
            [
              "rax",
              "eax",
              "ax",
              "al",
              "ah",
              "Accumulator; return value"
            ],
            [
              "rbx",
              "ebx",
              "bx",
              "bl",
              "bh",
              "Callee-saved; base pointer (general)"
            ],
            [
              "rcx",
              "ecx",
              "cx",
              "cl",
              "ch",
              "Counter; 4th function argument (SysV)"
            ],
            [
              "rdx",
              "edx",
              "dx",
              "dl",
              "dh",
              "Data; 3rd function argument"
            ],
            [
              "rsi",
              "esi",
              "si",
              "sil",
              "(none)",
              "Source index; 2nd function argument"
            ],
            [
              "rdi",
              "edi",
              "di",
              "dil",
              "(none)",
              "Destination index; 1st function argument"
            ],
            [
              "rbp",
              "ebp",
              "bp",
              "bpl",
              "(none)",
              "Base pointer (stack frame)"
            ],
            [
              "rsp",
              "esp",
              "sp",
              "spl",
              "(none)",
              "Stack pointer (top of stack)"
            ],
            [
              "r8",
              "r8d",
              "r8w",
              "r8b",
              "(none)",
              "5th function argument (SysV)"
            ],
            [
              "r9",
              "r9d",
              "r9w",
              "r9b",
              "(none)",
              "6th function argument (SysV)"
            ],
            [
              "r10",
              "r10d",
              "r10w",
              "r10b",
              "(none)",
              "Temporary; not preserved across calls"
            ],
            [
              "r11",
              "r11d",
              "r11w",
              "r11b",
              "(none)",
              "Temporary; not preserved across calls"
            ],
            [
              "r12",
              "r12d",
              "r12w",
              "r12b",
              "(none)",
              "Callee-saved"
            ],
            [
              "r13",
              "r13d",
              "r13w",
              "r13b",
              "(none)",
              "Callee-saved"
            ],
            [
              "r14",
              "r14d",
              "r14w",
              "r14b",
              "(none)",
              "Callee-saved"
            ],
            [
              "r15",
              "r15d",
              "r15w",
              "r15b",
              "(none)",
              "Callee-saved"
            ]
          ]
        }
      },
      {
        "id": "sec-3-1-2",
        "title": "3.1.2 Zero-Extension and Partial Register Writes",
        "content": "When you write to a 32-bit register (e.g., eax), the CPU automatically zeroes the upper 32 bits of the corresponding 64-bit register. For example:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "3.1.2 Zero-Extension and Partial Register Writes",
            "code": "mov rax, -1         ; rax = 0xFFFFFFFFFFFFFFFF\nmov eax, 5          ; rax = 0x0000000000000005 (upper 32 bits cleared)\nmov ax, 10          ; rax = 0x000000000000000A (writing 16-bit does NOT clear upper bits!)",
            "explanation": "Writing to a 16-bit register (ax) or 8-bit register (al, ah) does not affect the rest of the register. This can cause partial register stalls on some CPUs, but it is still allowed."
          }
        ]
      },
      {
        "id": "sec-3-1-3",
        "title": "3.1.3 Callee-Saved vs Caller-Saved Registers",
        "content": "The System V AMD64 ABI (used on Linux) classifies registers into two groups:\n\n- Caller-saved (volatile): The caller must save these registers before calling a function if their values are needed after the call. The callee may freely modify them. These include rax, rcx, rdx, rsi, rdi, r8–r11.\n- Callee-saved (non-volatile): The callee must preserve the original values of these registers. If the callee wants to use them, it must save them (typically on the stack) and restore before returning. These include rbx, rbp, r12–r15. rsp is also callee-saved by convention (but should be restored to its original value before return).\n\nWe will revisit calling conventions in detail in Chapter 10."
      },
      {
        "id": "sec-3-2",
        "title": "3.2 Special-Purpose Registers",
        "content": "Beyond the general-purpose registers, the CPU has several important registers:\n\n- RIP – Instruction Pointer: Holds the address of the next instruction to execute. It is modified by jumps, calls, and returns. It cannot be directly written by mov; use jmp, call, ret, etc.\n- RFLAGS – Flags Register: Contains status flags (Zero, Carry, Sign, Overflow, etc.) that reflect the result of operations and control conditional branching.\n- Segment Registers (CS, DS, SS, ES, FS, GS): In 64-bit mode, most segmentation is disabled; FS and GS are used for thread-local storage. Generally ignored for user-mode programming.\n- XMM0–XMM15: 128-bit registers used for floating-point and SIMD operations. Later we’ll cover these in Chapter 14."
      },
      {
        "id": "sec-3-3",
        "title": "3.3 Memory Addressing",
        "content": "Memory in x86-64 is byte-addressable. Each byte has a unique address, but instructions can access larger units: word (2 bytes), doubleword (4 bytes), quadword (8 bytes). Addresses are 64-bit, but only 48 bits are used for virtual addresses in practice (canonical addresses)."
      },
      {
        "id": "sec-3-3-1",
        "title": "3.3.1 Addressing Modes",
        "content": "An addressing mode specifies how to compute the effective address of a memory operand. The most common modes are:\n\n- Immediate: The operand is a constant embedded in the instruction (e.g., mov eax, 5). Not a memory address.\n- Register: The operand is a register (e.g., mov eax, ebx).\n- Direct (absolute): The address is a constant (e.g., mov eax, [0x12345678]). In NASM, writing a constant inside brackets treats it as a memory address.\n- Register Indirect: The address is in a register (e.g., mov eax, [rbx]).\n- Base + Displacement: The address is a register plus a constant offset (e.g., mov eax, [rbx + 8]).\n- Indexed: Uses a base register, an index register, a scale (1, 2, 4, 8), and an optional displacement. The general form is [base + index*scale + displacement]. Example: mov eax, [rbx + rcx*4 + 16].\n- RIP-relative: Address is relative to the instruction pointer. NASM defaults to this for direct memory access to labels in 64-bit mode. For instance, mov eax, [myvar] is actually mov eax, [rel myvar]. This is used for position-independent code.\n\nExamples:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "3.3.1 Addressing Modes",
            "code": "mov eax, [0x402000]        ; absolute address (rarely used)\nmov eax, [rbx]             ; register indirect\nmov eax, [rbx + 8]         ; base + displacement\nmov eax, [rbx + rcx*4]     ; base + index*scale\nmov eax, [rbx + rcx*4 + 16]; base + index*scale + disp\nmov eax, [rel myvar]       ; RIP-relative (NASM default for labels)"
          }
        ]
      },
      {
        "id": "sec-3-3-2",
        "title": "3.3.2 Memory Operand Size",
        "content": "The size of the memory operand is determined by the destination register or an explicit size specifier. If the size is ambiguous (e.g., mov [rbx], 5), NASM requires a size keyword:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "3.3.2 Memory Operand Size",
            "code": "mov byte [rbx], 5\nmov word [rbx], 5\nmov dword [rbx], 5\nmov qword [rbx], 5"
          }
        ]
      },
      {
        "id": "sec-3-3-3",
        "title": "3.3.3 Direct Memory Access and the rel Keyword",
        "content": "In NASM 64-bit, when you write mov eax, [myvar], the assembler treats myvar as a symbol and uses RIP-relative addressing automatically. This is good for position-independent code. You can also use the rel keyword explicitly. If you need an absolute address (rare), use the abs keyword or a mov with a constant."
      },
      {
        "id": "sec-3-4",
        "title": "3.4 The Stack",
        "content": "The stack is a region of memory used for:\n- Function call return addresses.\n- Passing arguments (some are passed on the stack).\n- Saving register values.\n- Allocating local variables.\n- Temporary storage.\n\nIn x86-64, the stack grows downward: from higher addresses to lower addresses. The RSP register always points to the top of the stack (the last item pushed). The stack is usually aligned to 16 bytes at function boundaries (per ABI)."
      },
      {
        "id": "sec-3-4-1",
        "title": "3.4.1 Push and Pop",
        "content": "- push operand: Decrements RSP by the operand size (usually 8 bytes for a 64-bit register or immediate) and then stores the operand at the new [RSP].\n- pop operand: Loads the value at [RSP] into the operand and then increments RSP by the operand size.\n\nExample:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "3.4.1 Push and Pop",
            "code": "push rax          ; RSP = RSP - 8; store rax at [RSP]\npush 42           ; push immediate 42\npop rbx           ; load rbx from [RSP]; RSP = RSP + 8"
          }
        ]
      },
      {
        "id": "sec-3-4-2",
        "title": "3.4.2 Stack Operations in a Function",
        "content": "When a function is called (call instruction), the CPU pushes the return address onto the stack (i.e., RSP -= 8, store RIP of next instruction). Upon ret, it pops the return address into RIP and increments RSP.\n\nA typical function prologue (using frame pointer) looks like:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "3.4.2 Stack Operations in a Function — listing 1",
            "code": "push rbp          ; save caller's base pointer\nmov rbp, rsp      ; set new base pointer to current stack pointer\nsub rsp, N        ; allocate N bytes for local variables",
            "explanation": "Epilogue:"
          },
          {
            "language": "nasm",
            "title": "3.4.2 Stack Operations in a Function — listing 2",
            "code": "mov rsp, rbp      ; deallocate locals\npop rbp           ; restore caller's base pointer\nret",
            "explanation": "This creates a stack frame."
          }
        ]
      },
      {
        "id": "sec-3-4-3",
        "title": "3.4.3 Stack Alignment",
        "content": "The System V ABI requires that the stack pointer be 16-byte aligned before a call instruction. This means that at function entry, RSP is 8 mod 16 (because the return address was pushed). To maintain alignment, functions often subtract a multiple of 16 plus 8 for local variables."
      },
      {
        "id": "sec-3-5",
        "title": "3.5 Using the Stack for Local Variables",
        "content": "There are two common approaches for local variables:\n1. Use RSP directly with offsets (more common in optimized code).\n2. Use a frame pointer RBP (easier to read and debug)."
      },
      {
        "id": "sec-3-5-1",
        "title": "3.5.1 Frame Pointer Approach",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "3.5.1 Frame Pointer Approach",
            "code": "section .text\nglobal main\nmain:\n    push rbp\n    mov rbp, rsp\n    sub rsp, 16            ; allocate 16 bytes for two 8-byte locals\n\n    ; local1 at [rbp-8], local2 at [rbp-16]\n    mov qword [rbp-8], 123\n    mov qword [rbp-16], 456\n\n    ; ... use locals ...\n\n    mov rsp, rbp           ; restore stack pointer\n    pop rbp                ; restore base pointer\n    ret"
          }
        ]
      },
      {
        "id": "sec-3-5-2",
        "title": "3.5.2 RSP-Only Approach",
        "content": "Some functions do not use a frame pointer and instead use RSP relative offsets. This saves a register but makes code harder to follow due to changing RSP (especially with pushes/pops). Usually combined with no pushes/pops inside the function except at start/end.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "3.5.2 RSP-Only Approach",
            "code": "main:\n    sub rsp, 16            ; allocate locals\n    mov qword [rsp+8], 123 ; local1 (offset from current RSP)\n    mov qword [rsp], 456   ; local2\n    ; ...\n    add rsp, 16            ; deallocate\n    ret",
            "explanation": "Note: Offsets are positive because RSP points to the lowest allocated address."
          }
        ]
      },
      {
        "id": "sec-3-6",
        "title": "3.6 Stack Frames in Detail",
        "content": "A stack frame comprises:\n- Return address (pushed by call).\n- Saved previous RBP (if frame pointer used).\n- Local variables.\n- Possibly saved callee-saved registers.\n- Function arguments (beyond the first six in SysV, or all in some conventions).\n\nThe typical layout with frame pointer:",
        "codeSnippets": [
          {
            "language": "text",
            "title": "3.6 Stack Frames in Detail",
            "code": "        +------------------------+  Higher addresses\n        |       ...              |\n        | 7th argument (if any)  |\n        | 6th argument           |\n        | ...                    |\n        | Return Address         |\n        | Saved RBP              |  <-- RBP points here\n        | Local variable 1       |\n        | Local variable 2       |\n        | ...                    |\n        | Saved registers        |\n        +------------------------+  Lower addresses (RSP after allocation)",
            "explanation": "The first six integer arguments are passed in registers (rdi, rsi, rdx, rcx, r8, r9), but they may be spilled to the stack by the callee if needed."
          }
        ]
      },
      {
        "id": "sec-3-7",
        "title": "3.7 Example Program: Sum of Two Numbers Using Stack",
        "content": "Let’s write a simple program that demonstrates using registers and the stack. We’ll compute the sum of two integers stored on the stack, then print the result.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "3.7 Example Program: Sum of Two Numbers Using Stack",
            "code": "; stack_example.asm\n; Assemble: nasm -f elf64 stack_example.asm -o stack_example.o\n; Link:     ld stack_example.o -o stack_example\n; Run:      ./stack_example\n\nsection .data\n    msg db 'Sum: ', 0\n    newline db 0xA\n\nsection .bss\n    ; No uninitialized data needed\n\nsection .text\n    global _start\n\n_start:\n    ; Allocate 16 bytes on stack for two 64-bit integers\n    sub rsp, 16\n\n    ; Store two values on stack\n    mov qword [rsp], 10      ; first value at [rsp]\n    mov qword [rsp+8], 20    ; second value at [rsp+8]\n\n    ; Load values into registers\n    mov rax, [rsp]\n    mov rbx, [rsp+8]\n\n    ; Add them\n    add rax, rbx             ; rax = 30\n\n    ; Convert sum to string for printing (simplified: print digits)\n    ; We'll use syscall write to print the number by converting to ASCII\n    ; For simplicity, we'll just print a fixed string and then the number in hex? \n    ; Better: use a simple decimal conversion for numbers < 100.\n    ; We'll implement a minimal conversion for demonstration.\n\n    ; Save sum\n    push rax                 ; push sum onto stack (temporarily)\n\n    ; Print \"Sum: \"\n    mov rax, 1               ; sys_write\n    mov rdi, 1               ; stdout\n    mov rsi, msg\n    mov rdx, 5               ; length of \"Sum: \"\n    syscall\n\n    ; Pop sum and convert to decimal string\n    pop rax                  ; rax = sum (30)\n    ; Convert rax to decimal string on stack\n    ; We'll allocate some space for the string\n    sub rsp, 20              ; allocate buffer\n\n    ; Convert integer in rax to string at rsp\n    mov rdi, rsp             ; destination buffer\n    call int_to_str          ; our own function (not implemented here; would be in later chapters)\n\n    ; For now, we skip conversion and just exit\n    ; In a real program, you'd print the number.\n\n    ; Exit\n    mov rax, 60\n    xor rdi, rdi\n    syscall",
            "explanation": "The above code is incomplete because int_to_str is not defined. Later chapters will cover number conversion and printing."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-3-1",
        "title": "Exercise 3.1: Register Swap",
        "description": "Write a NASM program that swaps the values of rax and rbx using only mov and xor (no push/pop). Verify with GDB.",
        "solution": "xor rax, rbx   ; rax = rax ^ rbx\nxor rbx, rax   ; rbx = rbx ^ (original rax) -> original rax\nxor rax, rbx   ; rax = (original rax ^ original rbx) ^ original rax -> original rbx",
        "solutionLanguage": "nasm",
        "solutionExplanation": "This swaps without a temporary."
      },
      {
        "id": "ex-3-2",
        "title": "Exercise 3.2: Stack Push/Pop",
        "description": "Write a program that pushes 10, 20, 30 onto the stack (using 64-bit pushes) and then pops them into rax, rbx, rcx respectively. What are the final values? Explain the order.",
        "solution": "push 10      ; stack: [10]\npush 20      ; stack: [20, 10]\npush 30      ; stack: [30, 20, 10]\npop rax      ; rax = 30\npop rbx      ; rbx = 20\npop rcx      ; rcx = 10",
        "solutionLanguage": "nasm",
        "solutionExplanation": "The order is LIFO (last in, first out)."
      },
      {
        "id": "ex-3-3",
        "title": "Exercise 3.3: Local Variables with Frame Pointer",
        "description": "Write a function main (linked with ld using _start or with gcc using main) that:\n- Uses frame pointer rbp.\n- Allocates 32 bytes for locals.\n- Stores values 100 and 200 in the first two 8-byte locals.\n- Adds them and stores the result in the third local.\n- Returns the result as exit code (use mov rdi, [rbp-24] and mov rax, 60).\nRun and check echo $? (should be 44 if sum is 300 modulo 256? Actually exit code is 8-bit, so 300 mod 256 = 44). Test.",
        "solution": "section .text\nglobal _start\n_start:\n    push rbp\n    mov rbp, rsp\n    sub rsp, 32          ; 4 qwords\n    mov qword [rbp-8], 100\n    mov qword [rbp-16], 200\n    mov rax, [rbp-8]\n    add rax, [rbp-16]    ; 300\n    mov [rbp-24], rax\n    mov rdi, [rbp-24]    ; 300, but exit code uses low 8 bits: 300 & 0xFF = 44\n    mov rax, 60          ; sys_exit\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Run: ./prog; echo $? gives 44."
      },
      {
        "id": "ex-3-4",
        "title": "Exercise 3.4: Memory Addressing",
        "description": "Write a program that defines an array of 5 dwords in .data. Use indexed addressing ([base + index*4]) to load each element into eax and sum them, then store the sum in a variable. Use GDB to verify.",
        "solution": "section .data\n    arr dd 1, 2, 3, 4, 5\n    len equ ($ - arr) / 4\nsection .bss\n    sum resd 1\nsection .text\nglobal _start\n_start:\n    xor eax, eax\n    xor rcx, rcx\nloop_start:\n    cmp rcx, len\n    je done\n    mov ebx, [arr + rcx*4]\n    add eax, ebx\n    inc rcx\n    jmp loop_start\ndone:\n    mov [sum], eax\n    ; exit\n    mov rax, 60\n    xor rdi, rdi\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Sum = 15, stored in sum."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What are the callee-saved registers in x86-64 System V ABI?",
        "answer": "RBX, RBP, R12, R13, R14, and R15 are callee-saved; if a function modifies them, it must restore their original values before returning."
      },
      {
        "question": "How does push affect RSP? What about pop?",
        "answer": "For a 64-bit push, RSP decreases by 8 and the value is stored at the new top of the stack. A 64-bit pop loads that value and increases RSP by 8."
      },
      {
        "question": "Why is the stack said to grow “downward”?",
        "answer": "Pushing or allocating stack space moves RSP toward lower memory addresses; popping or releasing space moves it toward higher addresses."
      },
      {
        "question": "What is a stack frame? Why is RBP often used?",
        "answer": "A stack frame holds a function’s local variables, saved registers and return information. RBP provides a stable reference for offsets while RSP changes during stack operations."
      },
      {
        "question": "What does sub rsp, 16 do? Why might a function do this?",
        "answer": "It subtracts 16 from the stack pointer, reserving 16 bytes below the previous top of the stack. A function can use that space for local variables or temporary storage."
      },
      {
        "question": "Explain the difference between [rbx+8] and [rbx+rcx*4+8].",
        "answer": "[rbx+8] uses a base register and a fixed displacement. [rbx+rcx*4+8] also adds a scaled index, useful for selecting a four-byte array element."
      },
      {
        "question": "What happens when you write to eax? Does it affect rax?",
        "answer": "Writing EAX replaces the low 32 bits of RAX and clears its upper 32 bits. Writing AX or AL does not clear the remaining bits."
      },
      {
        "question": "How can you swap two registers without a temporary register?",
        "answer": "For distinct registers, use xor rax, rbx; xor rbx, rax; xor rax, rbx. The three operations exchange the values without a third register."
      },
      {
        "question": "What is the purpose of the RIP register?",
        "answer": "RIP is the instruction pointer. It identifies the next instruction address and is changed by control-flow instructions such as jumps, calls and returns."
      },
      {
        "question": "Why is the stack aligned to 16 bytes before a call?",
        "answer": "The System V AMD64 ABI mandates 16-byte stack alignment before a call instruction to optimize memory bus transfers and enable aligned SSE/AVX vector operations without faults."
      }
    ],
    "summary": [
      "x86-64 has 16 general-purpose registers; they have conventional roles but are flexible.",
      "The stack grows downward; RSP points to the top.",
      "push and pop manage data on the stack and adjust RSP.",
      "Stack frames use RBP to access locals and arguments with stable offsets.",
      "Memory addressing supports base, index, scale, and displacement.",
      "Registers are classified as caller-saved or callee-saved by the ABI.",
      "The stack must be kept 16-byte aligned before calls.",
      "In the next chapter, we will explore the build process in detail: how the assembler and linker work to create an executable from source code."
    ]
  },
  {
    "id": 4,
    "slug": "chapter-4-assemblers-linkers-build",
    "level": 1,
    "levelTitle": "Foundations",
    "title": "Chapter 4: Assemblers, Linkers, and the Build Process",
    "subtitle": "From Source to Binary: Object Files, Symbol Tables, and Relocations",
    "learningObjectives": [
      "Understand the role of the assembler in translating assembly source to machine code.",
      "Learn how the linker combines object files and resolves symbols.",
      "Comprehend the stages of the build process: assembly, linking, and loading.",
      "Explore the ELF object file format and its sections.",
      "Understand symbol tables, relocation, and how external references are resolved.",
      "Differentiate between static and dynamic linking.",
      "Use nasm, ld, and gcc to build executable programs from assembly.",
      "Write a simple Makefile to automate the build process."
    ],
    "prerequisites": [
      "Basic knowledge of assembly syntax (Chapter 1).",
      "Familiarity with Linux command line and file system.",
      "Ability to write and run simple assembly programs."
    ],
    "keyConcepts": [
      "Assembler converts .asm source into an object file (.o) containing machine code and metadata.",
      "Linker combines object files and libraries, resolves symbols, and produces an executable or shared library.",
      "Object file is an intermediate binary format (ELF on Linux) with sections, symbol tables, and relocation entries.",
      "Symbol table lists functions, variables, and other named entities with addresses or offsets.",
      "Relocation is the process of adjusting addresses in code/data when the final layout is known.",
      "Static linking copies library code into the executable; dynamic linking references shared libraries at runtime."
    ],
    "diagramType": "toolchain_pipeline",
    "sections": [
      {
        "id": "sec-4-1",
        "title": "4.1 The Build Process Overview",
        "content": "Creating an executable from source code typically involves several steps:\n\n1. Preprocessing (for C/C++): expand macros, includes, etc. Not needed for pure assembly.\n2. Compilation/Assembly: translate source code into machine code stored in an object file.\n3. Linking: combine object files and libraries, resolve symbols, and produce an executable file.\n4. Loading: the operating system loads the executable into memory and starts execution.\n\nFor assembly language, the flow is:",
        "codeSnippets": [
          {
            "language": "text",
            "title": "4.1 The Build Process Overview — listing 1",
            "code": "Assembly source (.asm) --> Assembler (nasm) --> Object file (.o) --> Linker (ld or gcc) --> Executable --> Loader (kernel) --> Running process",
            "explanation": "We will examine each stage."
          }
        ]
      },
      {
        "id": "sec-4-2",
        "title": "4.2 The Assembler: NASM",
        "content": "The assembler reads assembly source code and produces an object file. It performs:\n- Syntax checking.\n- Translation of mnemonics and operands into machine code (opcodes and operands).\n- Calculation of constant expressions (e.g., len equ $ - msg).\n- Generation of symbol table and relocation information for the linker."
      },
      {
        "id": "sec-4-2-1",
        "title": "4.2.1 NASM Syntax and Directives",
        "content": "NASM uses Intel-like syntax. We’ve already seen sections (section .data, .text, .bss) and directives like db, dw, dd, dq, equ, resb, resw, etc.\n\nImportant NASM directives:\n- section .data – initialized data.\n- section .bss – uninitialized data (reserved space).\n- section .text – code.\n- global label – export a symbol so linker can see it.\n- extern label – import a symbol defined elsewhere.\n- equ – define a constant.\n- times – repeat a directive (e.g., times 10 db 0).\n- %define – macro-like text substitution (similar to C #define).\n- %include – include another file."
      },
      {
        "id": "sec-4-2-2",
        "title": "4.2.2 Producing an Object File",
        "content": "To assemble a file:",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "4.2.2 Producing an Object File — listing 1",
            "code": "nasm -f elf64 hello.asm -o hello.o",
            "explanation": "-f elf64 selects the output format (ELF 64-bit for Linux). Other formats: elf32, macho64, win64, etc.\n\nThe object file contains:\n- Machine code for each section.\n- Symbol table with names and addresses (or offsets).\n- Relocation entries for symbols whose addresses are not yet known.\n- Debugging information (if requested with -g)."
          }
        ]
      },
      {
        "id": "sec-4-2-3",
        "title": "4.2.3 Viewing Object File Information",
        "content": "Use objdump or readelf to inspect object files.\n\nExample:",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "4.2.3 Viewing Object File Information — listing 1",
            "code": "nasm -f elf64 hello.asm -o hello.o\nreadelf -S hello.o        # list sections\nreadelf -s hello.o        # list symbols\nobjdump -d hello.o        # disassemble code",
            "explanation": "Sections in a typical assembly object:\n- .text: code.\n- .data: initialized data.\n- .bss: uninitialized data (zero-filled at load).\n- .symtab: symbol table.\n- .rela.text: relocation entries for code section.\n- .rela.data: relocation entries for data section."
          }
        ]
      },
      {
        "id": "sec-4-3",
        "title": "4.3 The Linker: ld",
        "content": "The linker combines one or more object files and libraries into a single executable or shared library. Its main tasks:\n- Resolve symbol references (e.g., calls to external functions).\n- Assign final memory addresses to sections and symbols.\n- Apply relocations: patch addresses in code and data.\n- Handle library linking (static or dynamic).\n- Produce the executable file in the required format (ELF)."
      },
      {
        "id": "sec-4-3-1",
        "title": "4.3.1 Linking a Single Object File",
        "content": "",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "4.3.1 Linking a Single Object File — listing 1",
            "code": "ld hello.o -o hello",
            "explanation": "This links the object file and creates an executable. The entry point defaults to _start.\n\nIf the object file defines main instead of _start, and you link with ld, you must specify the entry point:"
          },
          {
            "language": "bash",
            "title": "4.3.1 Linking a Single Object File — listing 2",
            "code": "ld -e main hello.o -o hello",
            "explanation": "Or link with gcc, which includes the C runtime and sets up _start to call main:"
          },
          {
            "language": "bash",
            "title": "4.3.1 Linking a Single Object File — listing 3",
            "code": "gcc hello.o -o hello"
          }
        ]
      },
      {
        "id": "sec-4-3-2",
        "title": "4.3.2 Linking Multiple Object Files",
        "content": "",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "4.3.2 Linking Multiple Object Files — listing 1",
            "code": "nasm -f elf64 file1.asm -o file1.o\nnasm -f elf64 file2.asm -o file2.o\nld file1.o file2.o -o program",
            "explanation": "Symbols defined as global in one file can be referenced as extern in another, and the linker resolves them."
          }
        ]
      },
      {
        "id": "sec-4-3-3",
        "title": "4.3.3 Linker Scripts",
        "content": "A linker script controls the layout of sections in the output file. The default script is usually sufficient, but advanced projects (e.g., bootloaders) may require custom scripts. The script defines memory regions and assigns sections to addresses.\n\nExample minimal linker script:",
        "codeSnippets": [
          {
            "language": "text",
            "title": "4.3.3 Linker Scripts — listing 1",
            "code": "OUTPUT_FORMAT(\"elf64-x86-64\")\nENTRY(_start)\n\nSECTIONS\n{\n    . = 0x400000;    /* start address */\n    .text : { *(.text) }\n    .data : { *(.data) }\n    .bss  : { *(.bss) }\n}",
            "explanation": "Use with ld -T script.ld file.o -o output."
          }
        ]
      },
      {
        "id": "sec-4-4",
        "title": "4.4 Relocations and Symbol Resolution",
        "content": "When the assembler encounters a reference to a label whose address is not yet known (e.g., a jump to an external function or a data label in another file), it emits a relocation entry. The linker later fills in the correct address."
      },
      {
        "id": "sec-4-4-1",
        "title": "4.4.1 Example of Relocation",
        "content": "Consider two files:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "main.asm",
            "code": "; main.asm\nextern func\nsection .text\nglobal _start\n_start:\n    call func\n    mov rax, 60\n    xor rdi, rdi\n    syscall"
          },
          {
            "language": "nasm",
            "title": "func.asm",
            "code": "; func.asm\nsection .text\nglobal func\nfunc:\n    mov rax, 1\n    ret",
            "explanation": "Assemble both:"
          },
          {
            "language": "bash",
            "title": "4.4.1 Example of Relocation — listing 3",
            "code": "nasm -f elf64 main.asm -o main.o\nnasm -f elf64 func.asm -o func.o",
            "explanation": "Examine relocations in main.o:"
          },
          {
            "language": "bash",
            "title": "4.4.1 Example of Relocation — listing 4",
            "code": "readelf -r main.o",
            "explanation": "Output includes something like:"
          },
          {
            "language": "text",
            "title": "4.4.1 Example of Relocation — listing 5",
            "code": "Relocation section '.rela.text' at offset 0x...\n  Offset          Info           Type           Sym. Value    Sym. Name + Addend\n000000000001  000a00000004 R_X86_64_PLT32    0000000000000000 func - 4",
            "explanation": "The relocation tells the linker: at offset 1 in .text, there is a 32-bit PC-relative reference to func; adjust it based on final address.\n\nAfter linking, the call instruction’s displacement is set correctly."
          }
        ]
      },
      {
        "id": "sec-4-4-2",
        "title": "4.4.2 Types of Relocations",
        "content": "Common x86-64 relocation types:\n- R_X86_64_64: absolute 64-bit address (used in mov rax, symbol).\n- R_X86_64_PC32: 32-bit PC-relative offset.\n- R_X86_64_PLT32: 32-bit PC-relative offset to PLT entry (for dynamic linking).\n- R_X86_64_GOTPCREL: used for RIP-relative access to GOT.\n\nThe assembler chooses the appropriate type based on the instruction and addressing mode."
      },
      {
        "id": "sec-4-5",
        "title": "4.5 Static vs Dynamic Linking",
        "content": ""
      },
      {
        "id": "sec-4-5-1",
        "title": "4.5.1 Static Linking",
        "content": "All library code is copied into the executable. The resulting binary is self-contained but larger. Static libraries are archives (.a) of object files.\n\nExample with C library:",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "4.5.1 Static Linking — listing 1",
            "code": "gcc -static hello.c -o hello_static",
            "explanation": "For assembly, you can link with static libraries (e.g., libc.a) using ld."
          }
        ]
      },
      {
        "id": "sec-4-5-2",
        "title": "4.5.2 Dynamic Linking",
        "content": "The executable contains references to shared libraries (.so). At runtime, the dynamic linker (ld.so) loads the libraries and resolves symbols. This saves disk and memory but introduces a dependency.\n\nFor assembly, linking with gcc by default uses dynamic linking against libc. For pure syscall programs, no libraries are needed, so linking with ld produces a static executable (since no shared libraries are involved).\n\nYou can see dynamic dependencies with ldd:",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "4.5.2 Dynamic Linking — listing 1",
            "code": "ldd hello",
            "explanation": "If no libraries, it says \"not a dynamic executable\"."
          }
        ]
      },
      {
        "id": "sec-4-6",
        "title": "4.6 The ELF Format",
        "content": "Executable and Linkable Format (ELF) is the standard binary format on Linux. It consists of:\n- ELF header: magic number, architecture, entry point, section header table offset, etc.\n- Program header table: describes segments for loading into memory (used by loader).\n- Section header table: describes sections for linking (used by linker).\n- Sections: .text, .data, .bss, .rodata, etc.\n- Segments: grouped sections with permissions (read/execute, read/write).\n\nUse readelf -h, readelf -l, readelf -S to inspect."
      },
      {
        "id": "sec-4-7",
        "title": "4.7 Using GCC for Assembly Linking",
        "content": "While ld is the raw linker, gcc can be used as a driver that performs assembling and linking. This is convenient when mixing C and assembly or when you want the C runtime.\n\nExamples:\n- Assemble and link a single assembly file with gcc:",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "4.7 Using GCC for Assembly Linking — listing 1",
            "code": "gcc hello.asm -o hello",
            "explanation": "(GCC will invoke nasm? Actually GCC expects C source; for assembly you must use -x assembler or use as for GAS syntax. For NASM, you must assemble separately and then link with gcc.)"
          },
          {
            "language": "bash",
            "title": "4.7 Using GCC for Assembly Linking — listing 2",
            "code": "nasm -f elf64 hello.asm -o hello.o\ngcc hello.o -o hello",
            "explanation": "- Link assembly object with C object:"
          },
          {
            "language": "bash",
            "title": "4.7 Using GCC for Assembly Linking — listing 3",
            "code": "gcc main.c asm_func.o -o program",
            "explanation": "When linking with gcc, the entry point is main (by default), and the C runtime performs initialization before calling main."
          }
        ]
      },
      {
        "id": "sec-4-8",
        "title": "4.8 Debugging the Build Process",
        "content": "- Use readelf -s to view symbols and check for undefined symbols.\n- Use nm to list symbols in object files.\n- Use objdump -d to disassemble and inspect machine code.\n- Use ldd to check dynamic library dependencies.\n- Use strace to trace system calls at runtime (helpful for understanding loading and dynamic linking).\n\nExample:",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "4.8 Debugging the Build Process — listing 1",
            "code": "nm hello.o",
            "explanation": "Shows symbols with types (T for text, D for data, U for undefined)."
          }
        ]
      },
      {
        "id": "sec-4-9",
        "title": "4.9 Makefiles for Assembly Projects",
        "content": "A Makefile automates the build process by defining rules and dependencies.\n\nExample Makefile for a project with two assembly files:",
        "codeSnippets": [
          {
            "language": "make",
            "title": "4.9 Makefiles for Assembly Projects — listing 1",
            "code": "ASM = nasm\nASMFLAGS = -f elf64\nLD = ld\nLDFLAGS =\n\nSOURCES = main.asm func.asm\nOBJECTS = $(SOURCES:.asm=.o)\nTARGET = program\n\nall: $(TARGET)\n\n$(TARGET): $(OBJECTS)\n\t$(LD) $(LDFLAGS) $(OBJECTS) -o $(TARGET)\n\n%.o: %.asm\n\t$(ASM) $(ASMFLAGS) $< -o $@\n\nclean:\n\trm -f $(OBJECTS) $(TARGET)\n\n.PHONY: all clean",
            "explanation": "Use:"
          },
          {
            "language": "bash",
            "title": "4.9 Makefiles for Assembly Projects — listing 2",
            "code": "make        # builds\nmake clean  # removes artifacts"
          }
        ]
      },
      {
        "id": "sec-4-10",
        "title": "4.10 Practical Example: Two-File Assembly Project",
        "content": "Let's create a simple project with a main file and a function file.\n\nmain.asm",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "main.asm",
            "code": "; main.asm\nsection .data\n    msg db 'Result: ', 0\nsection .text\n    global _start\n    extern add_numbers\n\n_start:\n    ; Call add_numbers(3, 4)\n    mov rdi, 3\n    mov rsi, 4\n    call add_numbers       ; result in rax\n\n    ; Exit with code = result (7)\n    mov rdi, rax           ; exit code\n    mov rax, 60\n    syscall",
            "explanation": "func.asm"
          },
          {
            "language": "nasm",
            "title": "func.asm",
            "code": "; func.asm\nsection .text\n    global add_numbers\n\nadd_numbers:\n    ; Add rdi + rsi, return in rax\n    mov rax, rdi\n    add rax, rsi\n    ret",
            "explanation": "Build:"
          },
          {
            "language": "bash",
            "title": "4.10 Practical Example: Two-File Assembly Project — listing 3",
            "code": "nasm -f elf64 main.asm -o main.o\nnasm -f elf64 func.asm -o func.o\nld main.o func.o -o program\n./program\necho $?   # prints 7",
            "explanation": "Examine the object files:"
          },
          {
            "language": "bash",
            "title": "4.10 Practical Example: Two-File Assembly Project — listing 4",
            "code": "readelf -s main.o | grep add_numbers   # shows UND (undefined)\nreadelf -s func.o | grep add_numbers   # shows GLOBAL",
            "explanation": "After linking:"
          },
          {
            "language": "bash",
            "title": "4.10 Practical Example: Two-File Assembly Project — listing 5",
            "code": "nm program | grep add_numbers   # shows address"
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-4-1",
        "title": "Exercise 4.1: Assemble and Link",
        "description": "Create an assembly file that defines _start, prints \"Hello\" using a syscall, and exits. Assemble with NASM, link with ld, run, and check output.",
        "solution": "section .data\n    msg db 'Hello', 0xA\n    len equ $ - msg\nsection .text\n    global _start\n_start:\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, msg\n    mov rdx, len\n    syscall\n    mov rax, 60\n    xor rdi, rdi\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Build and run: prints \"Hello\"."
      },
      {
        "id": "ex-4-2",
        "title": "Exercise 4.2: Multiple Objects",
        "description": "Split the program into two files: one with _start and one with a function print_hello that does the actual write syscall. Use extern and global appropriately. Assemble both, link, and run.",
        "solution": "; main.asm\nsection .text\n    global _start\n    extern print_hello\n_start:\n    call print_hello\n    mov rax, 60\n    xor rdi, rdi\n    syscall\n\n; print.asm\nsection .data\n    msg db 'Hello', 0xA\n    len equ $ - msg\nsection .text\n    global print_hello\nprint_hello:\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, msg\n    mov rdx, len\n    syscall\n    ret",
        "solutionLanguage": "nasm",
        "solutionExplanation": "main.asm:\n\nprint.asm:\n\nAssemble both, link."
      },
      {
        "id": "ex-4-3",
        "title": "Exercise 4.3: Static vs Dynamic",
        "description": "Use ldd on your executable. Is it static or dynamic? Why? Now link with gcc (change entry point to main and use gcc -nostartfiles if needed). Check ldd again. Explain differences.",
        "solution": "When linked with ld and using only syscalls, the executable is static (no dynamic libraries). ldd will say \"not a dynamic executable\". If you link with gcc and use main with C library functions, it will be dynamic (linked against libc). ldd shows libc.so.6. Using gcc -static makes it static."
      },
      {
        "id": "ex-4-4",
        "title": "Exercise 4.4: Makefile",
        "description": "Write a Makefile for the two-file project. Add a clean target. Test make and make clean.",
        "solution": "Makefile as shown in the section; test with make."
      },
      {
        "id": "ex-4-5",
        "title": "Exercise 4.5: Inspect Relocations",
        "description": "Assemble a file that calls an external function. Use readelf -r to see relocation entries. Describe what each field means.",
        "solution": "nasm -f elf64 main.asm -o main.o && readelf -r main.o",
        "solutionExplanation": "Assemble main.asm with extern func and call func. readelf -r shows a relocation entry of type R_X86_64_PLT32 for func. The offset indicates where the call instruction’s displacement field is; the linker will fill in the correct relative offset to func (or its PLT entry if dynamic).",
        "solutionLanguage": "bash"
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is the role of the assembler? How does it differ from the compiler?",
        "answer": "An assembler translates assembly instructions and directives into machine code and object-file metadata. A compiler translates a higher-level language into assembly or machine code, handling higher-level constructs along the way."
      },
      {
        "question": "What information is stored in an object file?",
        "answer": "An object file contains section contents such as machine code and initialized data, symbol tables, relocation entries, and optionally debugging information. It also describes reserved storage such as .bss."
      },
      {
        "question": "What is a relocation? Why is it needed?",
        "answer": "A relocation is a record generated by the assembler telling the linker that an instruction refers to a memory address or function not yet placed at a known location. The linker patches this offset when stitching object files together."
      },
      {
        "question": "Explain the difference between static and dynamic linking.",
        "answer": "Static linking bundles all library code into the final executable, creating a self-contained file with no runtime dependencies. Dynamic linking leaves references to shared libraries (.so), which the OS loader binds at runtime, saving disk and memory."
      },
      {
        "question": "What is the ELF format? Name some of its components.",
        "answer": "ELF means Executable and Linkable Format. Its components include an ELF header, section headers and sections; executable files also use program headers to describe loadable segments."
      },
      {
        "question": "How does the linker resolve external symbols?",
        "answer": "The linker matches undefined symbol references in one object file with definitions exported by other object files or libraries, then applies relocations using the resulting layout."
      },
      {
        "question": "What is the difference between global and extern in NASM?",
        "answer": "global exports a symbol defined in the current assembly module. extern declares a symbol defined in another module for the linker to resolve."
      },
      {
        "question": "How can you inspect the symbol table of an object file?",
        "answer": "Use readelf -s file.o or nm file.o to inspect symbols and identify definitions and undefined references."
      },
      {
        "question": "What does R_X86_64_PLT32 mean?",
        "answer": "R_X86_64_PLT32 denotes a 32-bit PC-relative relocation associated with a procedure linkage table reference. The linker resolves the target displacement during linking."
      },
      {
        "question": "When would you use ld versus gcc for linking assembly?",
        "answer": "Use ld for a program providing its own entry point, such as _start with direct system calls. Use gcc as the linker driver when you need the C runtime or are combining assembly objects with C. Assemble NASM source to an object file first."
      }
    ],
    "summary": [
      "The assembler translates assembly to object code, generating machine code, symbols, and relocations.",
      "The linker combines object files, resolves symbols, applies relocations, and produces an executable.",
      "ELF is the standard executable format on Linux, with sections for code, data, and metadata.",
      "Relocations allow the linker to patch addresses when final layout is known.",
      "Static linking copies library code; dynamic linking references shared libraries loaded at runtime.",
      "Tools like readelf, nm, objdump, and ldd help inspect the build process.",
      "Makefiles automate building multi-file projects.",
      "In the next chapter, we’ll begin writing more complex programs using basic instructions, including arithmetic and data movement, to perform useful computations."
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
