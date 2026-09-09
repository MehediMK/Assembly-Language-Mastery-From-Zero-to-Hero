import { Chapter } from '../types';

export const CHAPTERS_LEVEL_6: Chapter[] = [
  {
    id: 28,
    slug: 'chapter-28-project-1-calculator',
    level: 6,
    levelTitle: 'Advanced Projects',
    title: 'Chapter 28: Project 1: Command-Line Calculator',
    subtitle: 'Parsing CLI Arguments, ASCII Conversion (atoi/itoa), and 64-bit Math',
    learningObjectives: [
      'Parse command-line arguments directly from the stack at _start.',
      'Implement robust atoi and itoa routines without the C library.',
      'Handle arithmetic operations (+, -, x, /) with division by zero safeguards.',
      'Deliver exit codes and structured error messages to stderr.'
    ],
    prerequisites: ['Chapters 1–27'],
    keyConcepts: [
      'Command-line parameters sit on the initial stack: [rsp]=argc, [rsp+8]=argv[0], etc.',
      'Multiplication uses "x" to avoid bash wildcard globbing expansion.',
      'Writing to stderr uses file descriptor 2.'
    ],
    diagramType: 'project_calculator',
    sections: [
      {
        id: 'sec-28-1',
        title: '28.1 Complete Production Code: calc.asm',
        content: `Full command-line calculator written in pure NASM x86-64:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'calc.asm',
            code: `; calc.asm - Command-line calculator
; Usage: ./calc <operand1> <operator> <operand2>
; Operators: + - x /

section .data
    usage_msg db 'Usage: ./calc <operand1> <operator> <operand2>', 0xA, 0
    unknown_op_msg db 'Error: unknown operator', 0xA, 0
    div_zero_msg db 'Error: division by zero', 0xA, 0
    newline db 0xA

section .bss
    buffer resb 32

section .text
    global _start

atoi:
    xor eax, eax
    xor r8d, r8d
    cmp byte [rsi], '-'
    jne .parse
    mov r8d, 1
    inc rsi
.parse:
    movzx ecx, byte [rsi]
    test ecx, ecx
    jz .apply_sign
    cmp ecx, '0'
    jb .apply_sign
    cmp ecx, '9'
    ja .apply_sign
    sub ecx, '0'
    imul eax, eax, 10
    add eax, ecx
    inc rsi
    jmp .parse
.apply_sign:
    test r8d, r8d
    jz .done
    neg eax
.done:
    ret

itoa:
    push rbx; push rcx; push rdx; push rdi
    mov ebx, 10
    mov ecx, eax
    xor r8d, r8d
    test eax, eax
    jns .pos
    neg eax
    mov byte [rdi], '-'
    inc rdi
    inc r8d
.pos:
    test eax, eax
    jnz .conv
    mov byte [rdi], '0'
    inc rdi
    inc r8d
    jmp .finish
.conv:
    sub rsp, 32
    mov rsi, rsp
    xor edx, edx
.digit_loop:
    xor edx, edx
    div ebx
    add dl, '0'
    mov [rsi], dl
    inc rsi
    inc r8d
    test eax, eax
    jnz .digit_loop
    mov rcx, rsi
    sub rcx, rsp
    dec rsi
.copy_loop:
    mov al, [rsi]
    mov [rdi], al
    inc rdi
    dec rsi
    dec rcx
    jnz .copy_loop
    add rsp, 32
.finish:
    mov byte [rdi], 0
    mov eax, r8d
    pop rdi; pop rdx; pop rcx; pop rbx
    ret

strlen:
    xor eax, eax
.loop:
    cmp byte [rsi + rax], 0
    je .done
    inc rax
    jmp .loop
.done:
    ret

_start:
    mov r10, [rsp]        ; argc
    cmp r10, 4
    jne .usage_error

    mov rsi, [rsp+16]     ; argv[1]
    mov rdx, [rsp+24]     ; argv[2]
    mov rcx, [rsp+32]     ; argv[3]

    call atoi
    mov ebx, eax          ; operand 1

    push rbx
    mov rsi, rcx
    call atoi
    mov ecx, eax          ; operand 2
    pop rbx

    movzx r8d, byte [rdx] ; operator

    cmp r8b, '+'
    je .add
    cmp r8b, '-'
    je .sub
    cmp r8b, 'x'
    je .mul
    cmp r8b, '/'
    je .div
    jmp .unknown_op

.add:
    mov eax, ebx; add eax, ecx; jmp .print_result
.sub:
    mov eax, ebx; sub eax, ecx; jmp .print_result
.mul:
    mov eax, ebx; imul eax, ecx; jmp .print_result
.div:
    test ecx, ecx; jz .div_zero
    mov eax, ebx; cdq; idiv ecx; jmp .print_result

.print_result:
    lea rdi, [buffer]
    call itoa
    mov rdx, rax
    mov rax, 1; mov rdi, 1; lea rsi, [buffer]; syscall
    mov rax, 1; mov rdi, 1; lea rsi, [newline]; mov rdx, 1; syscall
    mov rax, 60; xor rdi, rdi; syscall

.usage_error:
    mov rsi, usage_msg; call strlen; mov rdx, rax
    mov rax, 1; mov rdi, 2; syscall
    mov rax, 60; mov rdi, 1; syscall

.unknown_op:
    mov rsi, unknown_op_msg; call strlen; mov rdx, rax
    mov rax, 1; mov rdi, 2; syscall
    mov rax, 60; mov rdi, 2; syscall

.div_zero:
    mov rsi, div_zero_msg; call strlen; mov rdx, rax
    mov rax, 1; mov rdi, 2; syscall
    mov rax, 60; mov rdi, 3; syscall`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-28-1',
        title: 'Exercise 28.1: Add Modulo Operator (%)',
        description: 'Extend the calculator to support % using idiv and output remainder in edx.',
        solution: `cmp r8b, '%'\nje .mod\n.mod:\ntest ecx, ecx\njz .div_zero\nmov eax, ebx\ncdq\nidiv ecx\nmov eax, edx   ; remainder\njmp .print_result`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'Why do we use "x" instead of "*" for multiplication in command-line arguments?',
        answer: 'Because the shell interprets "*" as a wildcard file globbing pattern, expanding it into all filenames in the current directory unless properly escaped.'
      }
    ],
    summary: ['Project 1 demonstrates argument extraction and numeric conversions.', 'Clean error handling to stderr enhances command-line UX.']
  },
  {
    id: 29,
    slug: 'chapter-29-project-2-string-manipulation-library',
    level: 6,
    levelTitle: 'Advanced Projects',
    title: 'Chapter 29: Project 2: String Manipulation Library',
    subtitle: 'Building a Full C-Compatible libstring.asm: strlen, strcpy, strcat, memmove',
    learningObjectives: [
      'Design a modular assembly library conforming to System V AMD64 ABI.',
      'Implement 14 core string and memory functions in pure assembly.',
      'Handle pointer overlaps safely in memmove using forward/backward rep movsb.',
      'Build and link test suites with Makefile automation.'
    ],
    prerequisites: ['Chapters 1–28'],
    keyConcepts: [
      'All string functions assume null-terminated strings and valid pointers.',
      'memmove checks if dest < src + n to detect overlap and select direction.',
      'Export symbols with global and declare in stringlib.inc.'
    ],
    diagramType: 'project_string_lib',
    sections: [
      {
        id: 'sec-29-1',
        title: '29.1 Safe Overlap memmove Implementation',
        content: `Handling memory buffer overlap gracefully:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'memmove.asm',
            code: `global memmove
section .text
memmove:
    push rdi
    mov rax, rdi        ; destination pointer
    mov rcx, rdx        ; count
    cmp rdi, rsi
    jbe .forward        ; if dest <= src, forward copy is safe

    ; check overlap: dest < src + count
    lea rdx, [rsi + rcx]
    cmp rdi, rdx
    jae .forward        ; no overlap

    ; overlap detected: copy backwards
    std                 ; set direction flag (backward)
    lea rsi, [rsi + rcx - 1]
    lea rdi, [rdi + rcx - 1]
    rep movsb
    cld                 ; clear direction flag
    jmp .done

.forward:
    cld
    rep movsb

.done:
    pop rax             ; return destination
    ret`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-29-1',
        title: 'Exercise 29.1: Case-Insensitive strcmp (strcasecmp)',
        description: 'Implement strcasecmp by normalizing letters with and al, 0xDF or adding 32.',
        solution: `strcasecmp:\n.loop:\n    mov al, [rsi]\n    mov dl, [rdi]\n    ; convert lowercase to uppercase\n    cmp al, 'a'; jb .no1; cmp al, 'z'; ja .no1; sub al, 32\n.no1:\n    cmp dl, 'a'; jb .no2; cmp dl, 'z'; ja .no2; sub dl, 32\n.no2:\n    cmp al, dl\n    jne .diff\n    test al, al; jz .equal\n    inc rsi; inc rdi; jmp .loop`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'Why does memcpy produce undefined behavior on overlapping buffers?',
        answer: 'memcpy uses forward copying (cld; rep movsb). If destination is higher than source and overlaps, writing earlier bytes overwrites unread source bytes ahead, corrupting the copy. memmove detects this and copies backward.'
      }
    ],
    summary: ['libstring provides clean C-compatible low-level memory utilities.', 'Direction flag management is critical for backwards memory copies.']
  },
  {
    id: 30,
    slug: 'chapter-30-project-3-array-sorting-utilities',
    level: 6,
    levelTitle: 'Advanced Projects',
    title: 'Chapter 30: Project 3: Array and Sorting Utilities',
    subtitle: 'Iterative Sorts (Bubble, Selection, Insertion), Recursive Quicksort & Binary Search',
    learningObjectives: [
      'Implement Bubble, Selection, and Insertion sorts in x86-64 assembly.',
      'Construct a recursive In-Place Quicksort with stack frame management.',
      'Implement O(log n) Binary Search.',
      'Benchmark algorithm performance across array sizes.'
    ],
    prerequisites: ['Chapters 1–29'],
    keyConcepts: [
      'Quicksort partitions around a pivot element, recursing on sub-arrays.',
      'Binary search requires sorted input data to halve search windows.',
      'Preserve callee-saved registers across recursive partitions.'
    ],
    diagramType: 'project_sorting_utils',
    sections: [
      {
        id: 'sec-30-1',
        title: '30.1 Recursive Quicksort in Assembly',
        content: `In-place Quicksort implementation in NASM:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'quicksort.asm',
            code: `global quicksort

section .text
quicksort:
    push rbp; mov rbp, rsp
    cmp esi, 1; jle .done
    mov rdx, rsi; dec rdx; xor esi, esi
    call qs_rec
.done:
    pop rbp; ret

qs_rec:
    push rbp; mov rbp, rsp
    push rbx; push r12; push r13; push r14; push r15
    cmp esi, edx; jge .return

    mov r12d, esi        ; low
    mov r13d, edx        ; high

    ; Partition: pivot = arr[high]
    mov eax, [rdi + r13*4]
    mov r14d, r12d; dec r14d   ; i = low - 1
    mov r15d, r12d             ; j = low

.loop_j:
    cmp r15d, r13d; jge .part_done
    mov ebx, [rdi + r15*4]
    cmp ebx, eax; jg .skip
    inc r14d
    mov ecx, [rdi + r14*4]
    mov [rdi + r14*4], ebx
    mov [rdi + r15*4], ecx
.skip:
    inc r15d; jmp .loop_j

.part_done:
    inc r14d
    mov ecx, [rdi + r14*4]
    mov edx, [rdi + r13*4]
    mov [rdi + r14*4], edx
    mov [rdi + r13*4], ecx
    mov r15d, r14d       ; pivot index

    ; recurse left
    mov edx, r15d; dec edx; mov esi, r12d; call qs_rec
    ; recurse right
    mov esi, r15d; inc esi; mov edx, r13d; call qs_rec

.return:
    pop r15; pop r14; pop r13; pop r12; pop rbx; pop rbp; ret`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-30-1',
        title: 'Exercise 30.1: Binary Search with 32-bit Integers',
        description: 'Write binary_search returning 0-based index or -1 if not present.',
        solution: `binary_search:\n    xor ecx, ecx; mov r8d, esi; dec r8d\n.loop:\n    cmp ecx, r8d; jg .not_found\n    lea eax, [rcx + r8]; shr eax, 1\n    mov r10d, eax\n    mov eax, [rdi + r10*4]\n    cmp eax, edx\n    je .found\n    jl .right\n    lea r8d, [r10-1]; jmp .loop\n.right:\n    lea ecx, [r10+1]; jmp .loop\n.found: mov eax, r10d; ret\n.not_found: mov eax, -1; ret`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'Why does Quicksort have O(n log n) average time complexity?',
        answer: 'Because partitioning divides an array of size n in half at each recursion level (log n levels), performing n comparisons at each level. If the pivot is poorly chosen (already sorted array with last element as pivot), it degrades to O(n²).'
      }
    ],
    summary: ['Quicksort offers superior cache locality.', 'Binary search delivers O(log n) lookups on sorted arrays.']
  },
  {
    id: 31,
    slug: 'chapter-31-project-4-file-io-custom-memory-routines',
    level: 6,
    levelTitle: 'Advanced Projects',
    title: 'Chapter 31: Project 4: File I/O and Custom Memory Routines',
    subtitle: 'Dynamic Memory Allocator (malloc, free, calloc) & File I/O Wrapper',
    learningObjectives: [
      'Wrap Linux file system calls (open, close, read, write, lseek) in a clean API.',
      'Implement a dynamic heap memory allocator using the brk system call.',
      'Manage a singly linked free list with 16-byte metadata block headers.',
      'Enforce strict 16-byte alignment on all allocated heap blocks.'
    ],
    prerequisites: ['Chapters 1–30'],
    keyConcepts: [
      'brk expands and contracts the process data segment break boundary.',
      'Block headers store chunk size and next pointer right before user data.',
      'First-fit scans the free list for the earliest block satisfying requested size.'
    ],
    diagramType: 'project_allocator',
    sections: [
      {
        id: 'sec-31-1',
        title: '31.1 Custom Heap Allocator Architecture',
        content: `A complete malloc and free implementation written in pure NASM assembly using brk:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'allocator.asm',
            code: `struc Block
    .size: resq 1        ; user size
    .next: resq 1        ; next free block pointer
endstruc
BLOCK_HEADER_SIZE equ 16
ALIGNMENT equ 16

section .bss
    free_list_head resq 1
    heap_end       resq 1

section .text
    global malloc, free

align_up:
    add rdi, ALIGNMENT-1
    and rdi, ~(ALIGNMENT-1)
    ret

malloc:
    push rbx; push rcx; push rdx; push r12; push r13
    call align_up
    mov r12, rdi        ; size

    lea rbx, [free_list_head]
    mov rcx, [rbx]
.search:
    test rcx, rcx
    jz .extend
    mov rax, [rcx + Block.size]
    cmp rax, r12
    jae .found
    lea rbx, [rcx + Block.next]
    mov rcx, [rbx]
    jmp .search

.found:
    mov rdx, [rcx + Block.next]
    mov [rbx], rdx      ; unlink
    lea rax, [rcx + BLOCK_HEADER_SIZE]
    jmp .done

.extend:
    mov rdi, r12
    add rdi, BLOCK_HEADER_SIZE + 4095
    and rdi, ~4095      ; round to 4KB page
    mov r13, rdi        ; chunk size

    ; sys_brk(0) to get current break
    mov rax, 12; xor rdi, rdi; syscall
    mov rbx, rax        ; old break

    ; sys_brk(old_break + chunk_size)
    mov rdi, rbx; add rdi, r13; mov rax, 12; syscall
    test rax, rax; js .fail

    ; initialize block
    mov [rbx + Block.size], r12
    lea rax, [rbx + BLOCK_HEADER_SIZE]
    jmp .done

.fail:
    xor eax, eax
.done:
    pop r13; pop r12; pop rdx; pop rcx; pop rbx; ret

free:
    test rdi, rdi; jz .ret
    sub rdi, BLOCK_HEADER_SIZE
    ; insert at head of free list
    mov rax, [free_list_head]
    mov [rdi + Block.next], rax
    mov [free_list_head], rdi
.ret:
    ret`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-31-1',
        title: 'Exercise 31.1: Implement calloc',
        description: 'Implement calloc(num, size) by calling malloc and zeroing the memory buffer with rep stosb.',
        solution: `calloc:\n    imul rdi, rsi\n    push rdi\n    call malloc\n    pop rcx\n    test rax, rax; jz .done\n    push rax\n    mov rdi, rax\n    xor al, al\n    cld\n    rep stosb\n    pop rax\n.done:\n    ret`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'Why must malloc allocate 16 bytes more than the requested user size?',
        answer: 'To store the internal metadata Block header (size and free list next pointer) immediately preceding the memory pointer returned to the user application.'
      }
    ],
    summary: ['brk controls the heap data segment boundary.', 'Free lists and block headers allow efficient dynamic memory reclamation.']
  },
  {
    id: 32,
    slug: 'chapter-32-project-5-integrating-assembly-with-c',
    level: 6,
    levelTitle: 'Advanced Projects',
    title: 'Chapter 32: Project 5: Integrating Assembly with C',
    subtitle: 'Fast Math Library: Calling C from Assembly & Assembly Kernels in C Programs',
    learningObjectives: [
      'Build a cohesive mixed-language C and Assembly software architecture.',
      'Call assembly functions from C using matching headers and ABI prototypes.',
      'Invoke C library routines (printf) directly from pure assembly.',
      'Set up multi-target Makefiles with GCC linking.'
    ],
    prerequisites: ['Chapters 1–31'],
    keyConcepts: [
      'C headers declare extern functions with matching prototypes.',
      'Variadic functions like printf require al=0 to indicate zero floating-point registers.',
      'gcc -no-pie links assembly object files with the standard C runtime.'
    ],
    diagramType: 'project_c_integration',
    sections: [
      {
        id: 'sec-32-1',
        title: '32.1 Fast Math Library Integration',
        content: `Implementing assembly kernels and calling them from a C driver:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'fastmath.asm',
            code: `global fast_abs, max_of_three, sum_array, is_power_of_two

section .text
fast_abs:
    mov eax, edi
    cdq
    xor eax, edx
    sub eax, edx
    ret

max_of_three:
    mov eax, edi
    cmp esi, eax; cmovg eax, esi
    cmp edx, eax; cmovg eax, edx
    ret

sum_array:
    xor eax, eax
    test esi, esi; jle .done
    xor ecx, ecx
.loop:
    add eax, [rdi + rcx*4]
    inc ecx
    cmp ecx, esi; jl .loop
.done:
    ret

is_power_of_two:
    test edi, edi; jz .no
    lea eax, [rdi - 1]
    test edi, eax; jz .yes
.no: xor eax, eax; ret
.yes: mov eax, 1; ret`
          },
          {
            language: 'c',
            title: 'main.c',
            code: `#include <stdio.h>
#include "fastmath.h"

int main() {
    printf("fast_abs(-42) = %d\\n", fast_abs(-42));
    printf("max_of_three(12, 99, 45) = %d\\n", max_of_three(12, 99, 45));
    int arr[] = {10, 20, 30, 40};
    printf("sum_array = %d\\n", sum_array(arr, 4));
    printf("is_power_of_two(64) = %d\\n", is_power_of_two(64));
    return 0;
}`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-32-1',
        title: 'Exercise 32.1: Calling printf from Assembly',
        description: 'Write an assembly program that calls printf with a format string.',
        solution: `section .data\n    fmt db 'Result: %d', 0xA, 0\nsection .text\n    global main\n    extern printf\nmain:\n    push rbp\n    mov rbp, rsp\n    sub rsp, 16\n    lea rdi, [fmt]\n    mov rsi, 42\n    xor eax, eax   ; al = 0 (no vector registers)\n    call printf\n    xor eax, eax\n    leave\n    ret`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'Why must al be cleared to 0 before calling printf in x86-64 assembly?',
        answer: 'printf is a variadic function. The System V AMD64 ABI requires the caller to place the number of vector (XMM) registers used for argument passing in AL. Passing AL=0 signals that no floating-point arguments are passed.'
      }
    ],
    summary: ['Assembly kernels provide peak execution performance in C programs.', 'Strict adherence to ABI conventions ensures seamless interoperability.']
  },
  {
    id: 33,
    slug: 'chapter-33-project-6-mini-virtual-machine',
    level: 6,
    levelTitle: 'Advanced Projects',
    title: 'Chapter 33: Project 6: Mini Virtual Machine',
    subtitle: 'Building a 32-Bit Instruction Bytecode Interpreter & Virtual CPU',
    learningObjectives: [
      'Design a custom Instruction Set Architecture (ISA) with 12 opcodes.',
      'Implement an efficient fetch-decode-execute loop with a jump table in assembly.',
      'Model 4 virtual registers (R0–R3), program counter (PC), and 256-byte virtual RAM.',
      'Execute custom compiled bytecode programs that compute and print results.'
    ],
    prerequisites: ['Chapters 1–32'],
    keyConcepts: [
      'A virtual machine interprets custom software instructions in a continuous loop.',
      'Jump tables provide O(1) instruction dispatching based on the opcode.',
      'Instruction bit-packing stores opcode, destination register, source, and 16-bit immediate in one 32-bit dword.'
    ],
    diagramType: 'project_mini_vm',
    sections: [
      {
        id: 'sec-33-1',
        title: '33.1 Complete Virtual Machine: vm.asm',
        content: `Complete runnable Virtual Machine written in x86-64 NASM assembly:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'vm.asm',
            code: `; vm.asm - Mini Virtual Machine
; Opcode constants
%define OP_HALT     0
%define OP_LOAD     1
%define OP_ADD      2
%define OP_SUB      3
%define OP_MUL      4
%define OP_DIV      5
%define OP_STORE    6
%define OP_LOAD_MEM 7
%define OP_JUMP     8
%define OP_JZ       9
%define OP_JNZ      10
%define OP_PRINT    11
%define NUM_REGS    4
%define MEM_SIZE    64

section .data
    program:
        dd (OP_LOAD) | (0 << 8) | (5 << 16)       ; LOAD R0, 5
        dd (OP_LOAD) | (1 << 8) | (10 << 16)      ; LOAD R1, 10
        dd (OP_ADD)  | (0 << 8) | (1 << 8)        ; ADD R0, R1
        dd (OP_PRINT) | (0 << 8)                  ; PRINT R0
        dd OP_HALT                                ; HALT
    program_len equ ($ - program) / 4
    newline db 0xA

section .bss
    vm_regs resd NUM_REGS
    vm_mem  resd MEM_SIZE
    outbuf  resb 32

section .text
    global _start

itoa:
    push rbx; push rcx; push rdx; push rdi
    mov ebx, 10; mov ecx, eax; xor r8d, r8d
    test eax, eax; jns .pos
    neg eax; mov byte [rdi], '-'; inc rdi; inc r8d
.pos:
    test eax, eax; jnz .conv
    mov byte [rdi], '0'; inc rdi; inc r8d; jmp .finish
.conv:
    sub rsp, 32; mov rsi, rsp; xor edx, edx
.dloop:
    xor edx, edx; div ebx; add dl, '0'; mov [rsi], dl; inc rsi; inc r8d
    test eax, eax; jnz .dloop
    mov rcx, rsi; sub rcx, rsp; dec rsi
.cloop:
    mov al, [rsi]; mov [rdi], al; inc rdi; dec rsi; dec rcx; jnz .cloop
    add rsp, 32
.finish:
    mov byte [rdi], 0; mov eax, r8d
    pop rdi; pop rdx; pop rcx; pop rbx; ret

_start:
    lea rsi, [program]
    xor ebx, ebx        ; PC = 0

.fetch:
    cmp ebx, program_len; jge .exit
    mov r8d, [rsi + rbx*4]
    inc ebx

    movzx ecx, r8b      ; opcode
    lea rdx, [dispatch_table]
    cmp ecx, OP_PRINT; ja .exit
    mov rax, [rdx + rcx*8]
    jmp rax

dispatch_table:
    dq .op_halt, .op_load, .op_add, .op_sub, .op_mul, .op_div
    dq .op_store, .op_load_mem, .op_jump, .op_jz, .op_jnz, .op_print

.op_halt: jmp .exit

.op_load:
    mov ecx, r8d; shr ecx, 8; movzx edx, cl; shr ecx, 8
    movsx eax, cx       ; 16-bit immediate
    lea rdi, [vm_regs + rdx*4]
    mov [rdi], eax
    jmp .fetch

.op_add:
    mov ecx, r8d; shr ecx, 8; movzx r9d, cl; shr ecx, 8; movzx r10d, cl
    lea rdi, [vm_regs + r9*4]; mov eax, [rdi]
    lea rdi, [vm_regs + r10*4]; mov edx, [rdi]
    add eax, edx
    lea rdi, [vm_regs + r9*4]; mov [rdi], eax
    jmp .fetch

.op_sub:
    mov ecx, r8d; shr ecx, 8; movzx r9d, cl; shr ecx, 8; movzx r10d, cl
    lea rdi, [vm_regs + r9*4]; mov eax, [rdi]
    lea rdi, [vm_regs + r10*4]; mov edx, [rdi]
    sub eax, edx
    lea rdi, [vm_regs + r9*4]; mov [rdi], eax
    jmp .fetch

.op_mul:
    mov ecx, r8d; shr ecx, 8; movzx r9d, cl; shr ecx, 8; movzx r10d, cl
    lea rdi, [vm_regs + r9*4]; mov eax, [rdi]
    lea rdi, [vm_regs + r10*4]; mov edx, [rdi]
    imul eax, edx
    lea rdi, [vm_regs + r9*4]; mov [rdi], eax
    jmp .fetch

.op_div:
    mov ecx, r8d; shr ecx, 8; movzx r9d, cl; shr ecx, 8; movzx r10d, cl
    lea rdi, [vm_regs + r9*4]; mov eax, [rdi]
    lea rdi, [vm_regs + r10*4]; mov ecx, [rdi]
    cdq; idiv ecx
    lea rdi, [vm_regs + r9*4]; mov [rdi], eax
    jmp .fetch

.op_store:
    mov ecx, r8d; shr ecx, 8; movzx r9d, cl; shr ecx, 8; movzx r10d, cl
    lea rdi, [vm_regs + r9*4]; mov eax, [rdi]
    lea rdi, [vm_regs + r10*4]; mov edx, [rdi]
    cmp edx, MEM_SIZE; jae .exit
    lea rdi, [vm_mem + rdx*4]; mov [rdi], eax
    jmp .fetch

.op_load_mem:
    mov ecx, r8d; shr ecx, 8; movzx r9d, cl; shr ecx, 8; movzx r10d, cl
    lea rdi, [vm_regs + r10*4]; mov edx, [rdi]
    cmp edx, MEM_SIZE; jae .exit
    lea rdi, [vm_mem + rdx*4]; mov eax, [rdi]
    lea rdi, [vm_regs + r9*4]; mov [rdi], eax
    jmp .fetch

.op_jump:
    mov eax, r8d; shr eax, 16; movsx eax, ax
    mov ebx, eax; jmp .fetch

.op_jz:
    mov ecx, r8d; shr ecx, 8; movzx r9d, cl
    lea rdi, [vm_regs + r9*4]; mov eax, [rdi]
    test eax, eax; jnz .fetch
    mov eax, r8d; shr eax, 16; movsx eax, ax; mov ebx, eax; jmp .fetch

.op_jnz:
    mov ecx, r8d; shr ecx, 8; movzx r9d, cl
    lea rdi, [vm_regs + r9*4]; mov eax, [rdi]
    test eax, eax; jz .fetch
    mov eax, r8d; shr eax, 16; movsx eax, ax; mov ebx, eax; jmp .fetch

.op_print:
    mov ecx, r8d; shr ecx, 8; movzx r9d, cl
    lea rdi, [vm_regs + r9*4]; mov eax, [rdi]
    lea rdi, [outbuf]; call itoa
    mov edx, eax; mov eax, 1; mov rdi, 1; lea rsi, [outbuf]; syscall
    mov eax, 1; mov rdi, 1; lea rsi, [newline]; mov rdx, 1; syscall
    jmp .fetch

.exit:
    mov rax, 60; xor rdi, rdi; syscall`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-33-1',
        title: 'Exercise 33.1: Add Modulo Opcode (OP_MOD = 12)',
        description: 'Extend the dispatch table and add handler for computing reg1 = reg1 % reg2.',
        solution: `dispatch_table: ... dq .op_mod\n.op_mod:\n    mov ecx, r8d; shr ecx, 8; movzx r9d, cl; shr ecx, 8; movzx r10d, cl\n    lea rdi, [vm_regs + r9*4]; mov eax, [rdi]\n    lea rdi, [vm_regs + r10*4]; mov ecx, [rdi]\n    cdq; idiv ecx\n    lea rdi, [vm_regs + r9*4]; mov [rdi], edx\n    jmp .fetch`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'How does an interpreter loop emulate a CPU fetch-decode-execute cycle?',
        answer: 'The interpreter loop maintains a virtual Program Counter (PC), fetches bytecode from memory at PC, decodes the opcode, branches via a dispatch table to the corresponding handler, executes the state update, increments PC, and loops.'
      }
    ],
    summary: ['Virtual machines emulate hardware architectures in software.', 'Bytecode interpreters power language runtimes and secure sandboxes.']
  },
  {
    id: 34,
    slug: 'chapter-34-project-7-low-level-systems-shell',
    level: 6,
    levelTitle: 'Advanced Projects',
    title: 'Chapter 34: Project 7: Low-Level Systems Project',
    subtitle: 'Building "ash": A Native Unix Shell in Pure Assembly with Fork, Execve, Wait4',
    learningObjectives: [
      'Implement an interactive command-line Unix shell in x86-64 assembly.',
      'Manage processes using Linux fork, execve, and wait4 system calls.',
      'Implement built-in commands (echo, pwd, cd, exit).',
      'Tokenize command strings and construct NULL-terminated argv arrays.'
    ],
    prerequisites: ['Chapters 1–33'],
    keyConcepts: [
      'fork duplicates the parent process, returning 0 in the child and the child\'s PID in the parent.',
      'execve replaces the child\'s memory image with the targeted binary.',
      'wait4 blocks the parent process until the child terminates.'
    ],
    diagramType: 'project_shell',
    sections: [
      {
        id: 'sec-34-1',
        title: '34.1 Complete Native Assembly Shell: shell.asm',
        content: `Full interactive shell written in pure assembly without libc:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'shell.asm',
            code: `; shell.asm - Minimal Assembly Shell ("ash")
%define SYS_READ     0
%define SYS_WRITE    1
%define SYS_EXIT     60
%define SYS_FORK     57
%define SYS_EXECVE   59
%define SYS_WAIT4    61
%define SYS_CHDIR    80
%define SYS_GETCWD   79
%define STDIN        0
%define STDOUT       1
%define MAX_ARGS     16
%define BUF_SIZE     256

section .data
    prompt    db '$ ', 0
    newline   db 0xA, 0
    echo_str  db 'echo', 0
    pwd_str   db 'pwd', 0
    cd_str    db 'cd', 0
    exit_str  db 'exit', 0
    space     db ' ', 0
    exec_err  db 'ash: command not found', 0xA, 0

section .text
    global _start

strlen:
    xor eax, eax
.l: cmp byte [rsi+rax], 0; je .d; inc rax; jmp .l
.d: ret

strcmp:
    xor eax, eax
.l: mov al, [rsi]; mov dl, [rdi]; cmp al, dl; jne .diff
    test al, al; jz .eq; inc rsi; inc rdi; jmp .l
.diff: sub al, dl; movsx eax, al; ret
.eq: xor eax, eax; ret

print:
    push rsi; call strlen; mov rdx, rax; pop rsi
    mov rax, SYS_WRITE; mov rdi, STDOUT; syscall; ret

parse_input:
    xor eax, eax; mov r8, rdi; mov r9, rsi
.skip:
    mov dl, [r9]; cmp dl, ' '; je .sp; cmp dl, 9; je .sp; cmp dl, 0xA; je .fin; test dl, dl; jz .fin
    cmp eax, ecx; jge .fin
    mov [r8 + rax*8], r9; inc eax
.scan:
    mov dl, [r9]; cmp dl, ' '; je .tend; cmp dl, 9; je .tend; cmp dl, 0xA; je .tend; test dl, dl; jz .tend
    inc r9; jmp .scan
.tend:
    mov byte [r9], 0; inc r9; jmp .skip
.sp: inc r9; jmp .skip
.fin:
    mov qword [r8 + rax*8], 0; ret

_start:
    sub rsp, BUF_SIZE + MAX_ARGS*8 + BUF_SIZE
    mov rbp, rsp
    lea r12, [rbp]                          ; input_buf
    lea r13, [rbp + BUF_SIZE]               ; argv
    lea r14, [rbp + BUF_SIZE + MAX_ARGS*8]  ; cwd_buf

.loop:
    mov rsi, prompt; call print
    mov rax, SYS_READ; mov rdi, STDIN; mov rsi, r12; mov rdx, BUF_SIZE; syscall
    test rax, rax; jle .exit
    mov byte [r12 + rax], 0

    mov rsi, r12; mov rdi, r13; mov rcx, MAX_ARGS; call parse_input
    test rax, rax; jz .loop
    mov r15, rax         ; argc

    mov rsi, [r13]       ; argv[0]
    mov rdi, exit_str; call strcmp; test eax, eax; jz .exit
    mov rsi, [r13]; mov rdi, pwd_str; call strcmp; test eax, eax; jz .pwd
    mov rsi, [r13]; mov rdi, echo_str; call strcmp; test eax, eax; jz .echo

    ; External command
    mov rax, SYS_FORK; syscall
    test rax, rax; js .loop
    jz .child

    ; Parent
    mov rax, SYS_WAIT4; mov rdi, -1; xor rsi, rsi; xor rdx, rdx; xor r10, r10; syscall
    jmp .loop

.child:
    mov rdi, [r13]; mov rsi, r13; xor rdx, rdx; mov rax, SYS_EXECVE; syscall
    mov rsi, exec_err; call print
    mov rax, SYS_EXIT; mov rdi, 127; syscall

.echo:
    mov rcx, 1
.eloop:
    cmp rcx, r15; jge .edone
    mov rsi, [r13 + rcx*8]; call print
    mov rsi, space; call print
    inc rcx; jmp .eloop
.edone:
    mov rsi, newline; call print
    jmp .loop

.pwd:
    mov rax, SYS_GETCWD; mov rdi, r14; mov rsi, BUF_SIZE; syscall
    mov rsi, r14; call print
    mov rsi, newline; call print
    jmp .loop

.exit:
    mov rax, SYS_EXIT; xor rdi, rdi; syscall`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-34-1',
        title: 'Exercise 34.1: Implement cd command',
        description: 'Add cd built-in using chdir (syscall 80) on argv[1].',
        solution: `mov rdi, [r13 + 8]   ; argv[1]\nmov rax, SYS_CHDIR\nsyscall`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'Why must cd be implemented as a shell built-in rather than an external executable?',
        answer: 'External commands run in child processes created by fork. If cd were external, it would change the working directory of the child process, which terminates immediately, leaving the parent shell directory unchanged.'
      }
    ],
    summary: ['Project 7 integrates process management, system calls, and string parsing.', 'Native assembly shells grant absolute mastery of the Linux environment.']
  }
];
