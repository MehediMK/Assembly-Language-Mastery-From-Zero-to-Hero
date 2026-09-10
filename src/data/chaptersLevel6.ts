import { Chapter } from '../types';

export const CHAPTERS_LEVEL_6: Chapter[] = [
  {
    "id": 28,
    "slug": "chapter-28-project-1-calculator",
    "level": 6,
    "levelTitle": "Advanced Projects",
    "title": "Chapter 28: Project 1: Command-Line Calculator",
    "subtitle": "Parsing CLI Arguments, ASCII Conversion (atoi/itoa), and 64-bit Math",
    "learningObjectives": [
      "Apply assembly language fundamentals to build a complete, functional command-line calculator.",
      "Parse command-line arguments from the stack at _start.",
      "Implement string-to-integer conversion (atoi) and integer-to-string conversion (itoa).",
      "Perform integer arithmetic operations: addition, subtraction, multiplication, and division.",
      "Handle errors gracefully: invalid arguments, unknown operators, and division by zero.",
      "Use system calls for output and process exit.",
      "Structure an assembly program into logical sections and routines for readability and maintainability.",
      "Test and debug the program using GDB and command-line execution."
    ],
    "prerequisites": [
      "Mastery of x86-64 assembly basics: registers, memory, stack (Chapters 1–13).",
      "Understanding of procedures, calling conventions, and stack frames (Chapter 10).",
      "Knowledge of system calls for I/O and process control (Chapter 16).",
      "Familiarity with the build process and debugging tools (Chapters 4, 17).",
      "Completion of previous chapters up to Chapter 27."
    ],
    "keyConcepts": [
      "Command-line arguments are passed to _start on the stack: [rsp] = argc, [rsp+8] = argv[0], [rsp+16] = argv[1], etc.",
      "String conversion is essential for handling numeric input and output without the C library.",
      "Signed division requires sign-extension using cqo before idiv.",
      "Error handling in assembly involves checking conditions and exiting with appropriate messages and codes.",
      "Modular design separates parsing, arithmetic, and output into small routines, making the program easier to understand and extend."
    ],
    "diagramType": "project_calculator",
    "sections": [
      {
        "id": "sec-28-1",
        "title": "28.1 Project Overview",
        "content": "We will build a simple command-line calculator that accepts an expression in the form:",
        "codeSnippets": [
          {
            "language": "text",
            "title": "28.1 Project Overview — listing 1",
            "code": "./calc <operand1> <operator> <operand2>",
            "explanation": "For example:"
          },
          {
            "language": "bash",
            "title": "28.1 Project Overview — listing 2",
            "code": "./calc 12 + 7\n./calc 20 - 5\n./calc 6 x 4\n./calc 100 / 8",
            "explanation": "The calculator performs the specified integer operation and prints the result followed by a newline. It handles signed integers (positive and negative) and prints an error message for invalid input or division by zero.\n\nSupported operators:\n- + addition\n- - subtraction\n- x multiplication (using x instead of * to avoid shell globbing)\n- / integer division (truncated toward zero, like C)\n\nProgram exit codes:\n- 0 on success\n- 1 on usage error (wrong number of arguments)\n- 2 on unknown operator\n- 3 on division by zero"
          }
        ]
      },
      {
        "id": "sec-28-2",
        "title": "28.2 Program Design",
        "content": "The program is organized into several routines, each with a single responsibility:\n\n- _start: entry point, validates argc, extracts arguments, calls conversion and calculation, prints result or error.\n- atoi: converts a null-terminated string to a signed 32-bit integer.\n- itoa: converts a signed 32-bit integer to a null-terminated decimal string.\n- strlen: returns the length of a null-terminated string (used for writing messages).\n- print_string: writes a null-terminated string to stdout using the write syscall.\n- print_error: prints an error message and exits with a given code.\n- Arithmetic operations are performed inline in _start after parsing the operator.\n\nData sections:\n- .data contains static strings for usage, error messages, and the newline character.\n- .bss reserves buffers for the converted string output and for intermediate storage.\n\nWe use 32-bit integers (int) for simplicity; the ABI's int is 32-bit. This limits the range to about ±2 billion, which is sufficient for demonstration.\n\nClarification: The corrected companion retains the 32-bit default range and the original four operators, while optional build flags enable the exercise extensions. Its output routine returns a byte slice including newline rather than requiring strlen; its parser reports failure separately from the numeric result."
      },
      {
        "id": "sec-28-3",
        "title": "28.3 Implementation Details",
        "content": ""
      },
      {
        "id": "sec-28-3-1",
        "title": "28.3.1 Reading Command-Line Arguments",
        "content": "At _start, the stack contains:\n\nClarification: RCX is caller-saved and the source atoi overwrites it. Keeping argv[3] in RCX across the first call loses the pointer. The complete companion stores argument pointers in R12–R14 and uses helpers that preserve them.",
        "codeSnippets": [
          {
            "language": "text",
            "title": "28.3.1 Reading Command-Line Arguments — listing 1",
            "code": "[rsp]      = argc (number of arguments, including program name)\n[rsp+8]    = argv[0] (program name)\n[rsp+16]   = argv[1] (first operand)\n[rsp+24]   = argv[2] (operator)\n[rsp+32]   = argv[3] (second operand)",
            "explanation": "We first check that argc == 4. If not, print usage and exit 1.\n\nThen we load the pointers:"
          },
          {
            "language": "nasm",
            "title": "28.3.1 Reading Command-Line Arguments — listing 2",
            "code": "mov rsi, [rsp+16]   ; argv[1]\nmov rdx, [rsp+24]   ; argv[2] (operator)\nmov rcx, [rsp+32]   ; argv[3]"
          }
        ]
      },
      {
        "id": "sec-28-3-2",
        "title": "28.3.2 String to Integer (atoi)",
        "content": "The atoi routine expects a pointer to a null-terminated string in rsi and returns the integer in eax. It handles an optional leading minus sign.\n\nClarification: The first listing returns zero on an invalid character; the later full-source variant returns the parsed prefix. Neither matches strict validation and both accept empty/sign-only strings and wrap on overflow. The corrected parser rejects the entire invalid input and supports the exact selected signed range.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "atoi: convert string at rsi to integer, return in eax",
            "code": "; atoi: convert string at rsi to integer, return in eax\natoi:\n    xor eax, eax          ; result = 0\n    xor r8d, r8d          ; sign = 0 (positive)\n    ; check for '-'\n    cmp byte [rsi], '-'\n    jne .parse_digits\n    mov r8d, 1            ; sign = 1\n    inc rsi               ; skip '-'\n.parse_digits:\n    movzx ecx, byte [rsi] ; load character\n    test ecx, ecx\n    jz .done\n    cmp ecx, '0'\n    jb .invalid           ; if below '0', invalid\n    cmp ecx, '9'\n    ja .invalid           ; if above '9', invalid\n    sub ecx, '0'          ; convert to digit\n    imul eax, eax, 10     ; result *= 10\n    add eax, ecx          ; result += digit\n    inc rsi\n    jmp .parse_digits\n.invalid:\n    ; If invalid, we could set an error flag, but for simplicity we return 0.\n    xor eax, eax\n    ret\n.done:\n    test r8d, r8d\n    jz .positive\n    neg eax               ; apply sign\n.positive:\n    ret",
            "explanation": "For simplicity, invalid characters are treated as end of string (ignored). A more robust version would signal an error, but this suffices for the project."
          }
        ]
      },
      {
        "id": "sec-28-3-3",
        "title": "28.3.3 Integer to String (itoa)",
        "content": "The itoa routine converts a signed 32-bit integer in eax to a null-terminated string at the buffer pointed by rdi. It returns the length in eax.\n\nClarification: The first itoa is an unfinished draft without a complete epilogue; retain it for comparison only. The second uses unsigned DIV after forming the magnitude, which can represent INT32_MIN as unsigned 2147483648. For a 64-bit unsigned magnitude, clear RDX before DIV; CQO would be wrong when that magnitude has its high bit set.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "itoa: convert integer in eax to string at rdi, null-terminated.",
            "code": "; itoa: convert integer in eax to string at rdi, null-terminated.\n; returns length in eax.\nitoa:\n    push rbx\n    push rcx\n    push rdx\n    push rdi            ; save buffer pointer\n\n    mov ebx, 10         ; divisor\n    mov ecx, eax        ; save number\n    xor edx, edx\n    test eax, eax\n    jns .not_negative\n    mov byte [rdi], '-' ; store minus\n    inc rdi\n    neg eax             ; make positive\n    mov ecx, eax        ; update saved number (positive)\n.not_negative:\n    ; handle zero\n    test eax, eax\n    jnz .convert\n    mov byte [rdi], '0'\n    inc rdi\n    jmp .finish\n.convert:\n    ; We need to generate digits in reverse order, so use a temporary stack buffer.\n    sub rsp, 32         ; local buffer for up to 10 digits + sign (safe)\n    mov rsi, rsp        ; pointer to start of temp buffer\n    xor edx, edx\n.digit_loop:\n    xor edx, edx\n    div ebx             ; eax = quotient, edx = remainder\n    add dl, '0'\n    mov [rsi], dl       ; store digit\n    inc rsi\n    test eax, eax\n    jnz .digit_loop\n\n    ; Now rsi points one past last digit in temp buffer.\n    ; Copy digits in reverse to destination.\n    mov rcx, rsi\n    sub rcx, rsp        ; number of digits\n    mov rbx, rcx        ; save digit count\n    dec rsi             ; point to last digit\n.copy_loop:\n    mov al, [rsi]\n    mov [rdi], al\n    inc rdi\n    dec rsi\n    dec rcx\n    jnz .copy_loop\n    add rsp, 32         ; restore stack\n.finish:\n    mov byte [rdi], 0   ; null terminate\n    ; compute length: if negative, length = digit_count + 1, else digit_count.\n    ; We can just return the difference between rdi and original buffer pointer.\n    pop rdi             ; restore original buffer\n    mov rax, rdi        ; start\n    ; rdi currently points to null; but we need original start.\n    ; We'll recompute length from saved original pointer and current rdi? \n    ; Better: store original start in a register, then subtract.\n    ; For simplicity, we return the count of digits (plus sign if negative) by using saved rbx? \n    ; Since we already popped rdi, we lost it. We'll restructure.\n    ; I'll rewrite itoa with clearer length tracking.",
            "explanation": "The above itoa has a flaw in computing length after popping. Let's provide a cleaner version:"
          },
          {
            "language": "nasm",
            "title": "itoa: convert signed int in eax to string at rdi, null-terminated.",
            "code": "; itoa: convert signed int in eax to string at rdi, null-terminated.\n; Returns length in eax.\nitoa:\n    push rbx\n    push rcx\n    push rdx\n    push rdi            ; save original buffer\n\n    mov ebx, 10         ; divisor\n    mov ecx, eax        ; keep copy\n    xor r8d, r8d        ; length = 0\n\n    ; handle negative\n    test eax, eax\n    jns .positive\n    neg eax\n    mov byte [rdi], '-'\n    inc rdi\n    inc r8d             ; length++\n\n.positive:\n    ; handle zero\n    test eax, eax\n    jnz .convert\n    mov byte [rdi], '0'\n    inc rdi\n    inc r8d\n    jmp .finish\n\n.convert:\n    ; Generate digits in reverse on stack.\n    sub rsp, 32\n    mov rsi, rsp\n    xor edx, edx\n.digit_loop:\n    xor edx, edx\n    div ebx             ; eax = quotient, edx = remainder\n    add dl, '0'\n    mov [rsi], dl\n    inc rsi\n    inc r8d             ; count digit\n    test eax, eax\n    jnz .digit_loop\n\n    ; Copy from stack to destination in correct order.\n    mov rcx, rsi\n    sub rcx, rsp        ; number of digits\n    dec rsi\n.copy_loop:\n    mov al, [rsi]\n    mov [rdi], al\n    inc rdi\n    dec rsi\n    dec rcx\n    jnz .copy_loop\n    add rsp, 32\n\n.finish:\n    mov byte [rdi], 0\n    mov eax, r8d        ; length\n    pop rdi             ; restore original (not needed)\n    pop rdx\n    pop rcx\n    pop rbx\n    ret",
            "explanation": "This version tracks length in r8d and avoids recomputing."
          }
        ]
      },
      {
        "id": "sec-28-3-4",
        "title": "28.3.4 Arithmetic Operations",
        "content": "After parsing the operator (single character from argv[2]), we perform the corresponding operation:\n\nClarification: Check arithmetic overflow and signed-minimum divided by -1 as well as division by zero. For a 32-bit signed dividend use CDQ before IDIV r32; CQO is for a 64-bit dividend. The companion’s remainder of minimum/-1 is deliberately zero without executing the overflowing division.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "28.3.4 Arithmetic Operations — listing 1",
            "code": "    ; operands in eax (a) and ebx (b)\n    ; operator char in r8b (low byte of r8)\n    cmp r8b, '+'\n    je .add\n    cmp r8b, '-'\n    je .sub\n    cmp r8b, 'x'\n    je .mul\n    cmp r8b, '/'\n    je .div\n    ; unknown operator: error\n    jmp error_unknown\n\n.add:\n    add eax, ebx\n    jmp .print_result\n.sub:\n    sub eax, ebx\n    jmp .print_result\n.mul:\n    imul eax, ebx\n    jmp .print_result\n.div:\n    test ebx, ebx\n    jz error_div_zero\n    cdq                 ; sign-extend eax into edx:eax\n    idiv ebx            ; eax = quotient\n    jmp .print_result",
            "explanation": "Important: We use ebx for the second operand, but ebx is callee-saved. However, in _start we are not called by anyone, so we can use any register. Still, it's good practice to preserve if needed; but we are the top-level, so we can freely use rbx."
          }
        ]
      },
      {
        "id": "sec-28-3-5",
        "title": "28.3.5 Output",
        "content": "After computing the result in eax, convert to string and print:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "28.3.5 Output — listing 1",
            "code": "    lea rdi, [buffer]\n    call itoa          ; length in eax\n    mov rdx, rax       ; length\n    mov rax, 1         ; sys_write\n    mov rdi, 1         ; stdout\n    lea rsi, [buffer]\n    syscall\n    ; print newline\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, newline\n    mov rdx, 1\n    syscall\n    ; exit success\n    mov rax, 60\n    xor rdi, rdi\n    syscall"
          }
        ]
      },
      {
        "id": "sec-28-3-6",
        "title": "28.3.6 Error Handling",
        "content": "Define strings and exit codes in .data:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "28.3.6 Error Handling — listing 1",
            "code": "section .data\n    usage_msg db 'Usage: ./calc <operand1> <operator> <operand2>', 0xA, 0\n    unknown_op_msg db 'Error: unknown operator', 0xA, 0\n    div_zero_msg db 'Error: division by zero', 0xA, 0\n    newline db 0xA",
            "explanation": "For printing an error message and exiting, we can use a helper that prints the message (using strlen) and exits with a code in rdi. However, we can just inline."
          }
        ]
      },
      {
        "id": "sec-28-4",
        "title": "28.4 Full Source Code",
        "content": "Below is the complete calc.asm:\n\nClarification: The original full program can fault because atoi overwrites RCX before argv[3] is reused. It also accepts operator prefixes and malformed numbers. Save the corrected listing below as calc.asm. It provides all extension logic behind NASM build flags, so the exercises require no omitted routines. It uses 64-bit internal arithmetic and enforces the 32-bit range by default.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source calc.asm — argument pointer and validation bugs",
            "code": "; calc.asm - Command-line calculator\n; Usage: ./calc <operand1> <operator> <operand2>\n; Operators: + - x /\n; Assemble: nasm -f elf64 calc.asm -o calc.o\n; Link:     ld calc.o -o calc\n; Run:      ./calc 12 + 7\n\nsection .data\n    usage_msg db 'Usage: ./calc <operand1> <operator> <operand2>', 0xA, 0\n    unknown_op_msg db 'Error: unknown operator', 0xA, 0\n    div_zero_msg db 'Error: division by zero', 0xA, 0\n    newline db 0xA\n\nsection .bss\n    buffer resb 32        ; for itoa result\n\nsection .text\n    global _start\n\n;----------------------------------------------------------\n; atoi: convert string at rsi to integer in eax\n;----------------------------------------------------------\natoi:\n    xor eax, eax          ; result = 0\n    xor r8d, r8d          ; sign flag\n    cmp byte [rsi], '-'\n    jne .parse\n    mov r8d, 1\n    inc rsi\n.parse:\n    movzx ecx, byte [rsi]\n    test ecx, ecx\n    jz .apply_sign\n    cmp ecx, '0'\n    jb .apply_sign        ; stop if not digit\n    cmp ecx, '9'\n    ja .apply_sign\n    sub ecx, '0'\n    imul eax, eax, 10\n    add eax, ecx\n    inc rsi\n    jmp .parse\n.apply_sign:\n    test r8d, r8d\n    jz .done\n    neg eax\n.done:\n    ret\n\n;----------------------------------------------------------\n; itoa: convert signed int in eax to string at rdi\n; returns length in eax\n;----------------------------------------------------------\nitoa:\n    push rbx\n    push rcx\n    push rdx\n    push rdi            ; save original buffer\n\n    mov ebx, 10\n    mov ecx, eax        ; copy\n    xor r8d, r8d        ; length\n\n    test eax, eax\n    jns .not_neg\n    neg eax\n    mov byte [rdi], '-'\n    inc rdi\n    inc r8d\n.not_neg:\n    test eax, eax\n    jnz .convert\n    mov byte [rdi], '0'\n    inc rdi\n    inc r8d\n    jmp .finish\n.convert:\n    sub rsp, 32\n    mov rsi, rsp\n    xor edx, edx\n.digit_loop:\n    xor edx, edx\n    div ebx\n    add dl, '0'\n    mov [rsi], dl\n    inc rsi\n    inc r8d\n    test eax, eax\n    jnz .digit_loop\n    ; copy digits in reverse\n    mov rcx, rsi\n    sub rcx, rsp\n    dec rsi\n.copy_loop:\n    mov al, [rsi]\n    mov [rdi], al\n    inc rdi\n    dec rsi\n    dec rcx\n    jnz .copy_loop\n    add rsp, 32\n.finish:\n    mov byte [rdi], 0\n    mov eax, r8d\n    pop rdi\n    pop rdx\n    pop rcx\n    pop rbx\n    ret\n\n;----------------------------------------------------------\n; strlen: return length of null-terminated string at rsi in rax\n;----------------------------------------------------------\nstrlen:\n    xor eax, eax\n.loop:\n    cmp byte [rsi + rax], 0\n    je .done\n    inc rax\n    jmp .loop\n.done:\n    ret\n\n;----------------------------------------------------------\n; _start\n;----------------------------------------------------------\n_start:\n    ; Check argc\n    mov r10, [rsp]          ; argc\n    cmp r10, 4\n    jne .usage_error\n\n    ; Load argv pointers\n    mov rsi, [rsp+16]       ; argv[1]\n    mov rdx, [rsp+24]       ; argv[2] operator\n    mov rcx, [rsp+32]       ; argv[3]\n\n    ; Convert first operand\n    call atoi\n    mov ebx, eax            ; save a\n\n    ; Convert second operand\n    push rbx                ; save a temporarily\n    mov rsi, rcx\n    call atoi\n    mov ecx, eax            ; ecx = b\n    pop rbx                 ; restore a in ebx\n\n    ; Load operator character\n    movzx r8d, byte [rdx]   ; operator char\n\n    ; Perform operation\n    cmp r8b, '+'\n    je .add\n    cmp r8b, '-'\n    je .sub\n    cmp r8b, 'x'\n    je .mul\n    cmp r8b, '/'\n    je .div\n\n    ; Unknown operator\n    jmp .unknown_op\n\n.add:\n    mov eax, ebx\n    add eax, ecx\n    jmp .print_result\n.sub:\n    mov eax, ebx\n    sub eax, ecx\n    jmp .print_result\n.mul:\n    mov eax, ebx\n    imul eax, ecx\n    jmp .print_result\n.div:\n    test ecx, ecx\n    jz .div_zero\n    mov eax, ebx\n    cdq                 ; sign-extend eax into edx:eax\n    idiv ecx\n    jmp .print_result\n\n.print_result:\n    lea rdi, [buffer]\n    call itoa\n    mov rdx, rax\n    mov rax, 1\n    mov rdi, 1\n    lea rsi, [buffer]\n    syscall\n    ; newline\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, newline\n    mov rdx, 1\n    syscall\n    ; exit 0\n    mov rax, 60\n    xor rdi, rdi\n    syscall\n\n.usage_error:\n    mov rsi, usage_msg\n    call strlen\n    mov rdx, rax\n    mov rax, 1\n    mov rdi, 2          ; stderr\n    syscall\n    mov rax, 60\n    mov rdi, 1\n    syscall\n\n.unknown_op:\n    mov rsi, unknown_op_msg\n    call strlen\n    mov rdx, rax\n    mov rax, 1\n    mov rdi, 2\n    syscall\n    mov rax, 60\n    mov rdi, 2\n    syscall\n\n.div_zero:\n    mov rsi, div_zero_msg\n    call strlen\n    mov rdx, rax\n    mov rax, 1\n    mov rdi, 2\n    syscall\n    mov rax, 60\n    mov rdi, 3\n    syscall"
          },
          {
            "language": "nasm",
            "title": "Complete corrected calculator with optional exercise modes",
            "code": "; calc.asm -- Linux x86-64, checked signed integer calculator.\n; nasm -f elf64 calc.asm -o calc.o && ld calc.o -o calc\n; Optional NASM flags: -DWIDTH=64 -DEXTENDED=1 -DINTERACTIVE=1\n; Interactive build reads expressions from stdin, one per line, until EOF.\n; Codes: 0 success, 1 usage, 2 operator, 3 zero divisor,\n;        4 invalid/out-of-range input, 5 arithmetic overflow, 6 I/O failure.\n%ifndef WIDTH\n%define WIDTH 32\n%endif\n%ifndef EXTENDED\n%define EXTENDED 0\n%endif\n%ifndef INTERACTIVE\n%define INTERACTIVE 0\n%endif\n%if WIDTH != 32 && WIDTH != 64\n%error WIDTH must be 32 or 64\n%endif\ndefault rel\nsection .data\nusage db 'Usage: calc integer operator integer',10,0\nop_error db 'Error: unknown operator',10,0\nzero_error db 'Error: division by zero',10,0\ninput_error db 'Error: invalid or out-of-range integer/line',10,0\noverflow_error db 'Error: arithmetic overflow',10,0\nsection .bss\noutput resb 32\nline resb 256\none resb 1\nline_len resq 1\nline_bad resb 1\nat_eof resb 1\nsection .text\nglobal _start\n_start:\n%if INTERACTIVE\n    cmp qword [rsp],1\n    jne usage_exit\n    xor r15d,r15d           ; any error in the session\n.again:\n    call read_line\n    test eax,eax\n    jz .session_done\n    cmp eax,2\n    je .bad_line\n    call tokenize\n    jc .bad_line\n    test eax,eax\n    jz .again              ; ignore whitespace-only lines\n    call evaluate\n    test eax,eax\n    jz .again\n    mov r15d,1\n    jmp .again\n.bad_line:\n    lea rsi,[input_error]\n    mov ebx,4\n    call report\n    mov r15d,1\n    jmp .again\n.session_done:\n    mov edi,r15d           ; 0 if all expressions succeeded, otherwise 1\n%else\n    cmp qword [rsp],4\n    jne usage_exit\n    mov r12,[rsp+16]\n    mov r13,[rsp+24]\n    mov r14,[rsp+32]\n    call evaluate\n    mov edi,eax\n%endif\nexit:\n    mov eax,60\n    syscall\nusage_exit:\n    lea rsi,[usage]\n    mov ebx,1\n    call report\n    mov edi,eax\n    jmp exit\nio_exit:\n    mov edi,6\n    jmp exit\n; Inputs R12=operand1 string, R13=operator string, R14=operand2 string.\n; R15 preserved. Returns status in EAX; emits result or error.\nevaluate:\n    push rbx               ; align nested calls; keep caller RBX\n    mov rsi,r12\n    call parse_int\n    jc .input\n    mov rbx,rax\n    mov rsi,r14\n    call parse_int\n    jc .input\n    mov r10,rax\n    cmp byte [r13],0\n    je .operator\n    cmp byte [r13+1],0\n    jne .operator\n    movzx ecx,byte [r13]\n    mov rax,rbx\n    cmp cl,'+'\n    je .add\n    cmp cl,'-'\n    je .sub\n    cmp cl,'x'\n    je .mul\n%if EXTENDED\n    cmp cl,'*'\n    je .mul\n    cmp cl,'%'\n    je .divide\n%endif\n    cmp cl,'/'\n    jne .operator\n.divide:\n    test r10,r10\n    jz .zero\n    mov rdx,0x8000000000000000\n    cmp rax,rdx\n    jne .idiv\n    cmp r10,-1\n    jne .idiv\n    cmp cl,'%'\n    jne .overflow\n    xor eax,eax            ; mathematical remainder; avoid hardware #DE\n    jmp .result\n.idiv:\n    cqo\n    idiv r10\n    cmp cl,'%'\n    jne .result\n    mov rax,rdx\n    jmp .result\n.add:\n    add rax,r10\n    jo .overflow\n    jmp .result\n.sub:\n    sub rax,r10\n    jo .overflow\n    jmp .result\n.mul:\n    imul rax,r10\n    jo .overflow\n.result:\n%if WIDTH = 32\n    movsxd rdx,eax\n    cmp rax,rdx\n    jne .overflow\n%endif\n    call format_int\n    mov edi,1\n    call write_all\n    xor eax,eax\n    pop rbx\n    ret\n.input:\n    lea rsi,[input_error]\n    mov ebx,4\n    jmp .error\n.operator:\n    lea rsi,[op_error]\n    mov ebx,2\n    jmp .error\n.zero:\n    lea rsi,[zero_error]\n    mov ebx,3\n    jmp .error\n.overflow:\n    lea rsi,[overflow_error]\n    mov ebx,5\n.error:\n    call report\n    pop rbx\n    ret\n; Full-string parser, optional leading minus, at least one digit.\n; Negative accumulation handles INT64_MIN. CF=1 error, CF=0 RAX result.\nparse_int:\n    xor eax,eax\n    xor r8d,r8d\n    cmp byte [rsi],'-'\n    jne .first\n    inc rsi\n    mov r8d,1\n.first:\n    cmp byte [rsi],0\n    je .bad\n.loop:\n    movzx edx,byte [rsi]\n    test edx,edx\n    jz .done\n    sub edx,'0'\n    cmp edx,9\n    ja .bad\n    imul rax,rax,10\n    jo .bad\n    sub rax,rdx\n    jo .bad\n    inc rsi\n    jmp .loop\n.done:\n    test r8d,r8d\n    jnz .range\n    neg rax\n    jo .bad\n.range:\n%if WIDTH = 32\n    movsxd rdx,eax\n    cmp rax,rdx\n    jne .bad\n%endif\n    clc\n    ret\n.bad:\n    stc\n    ret\n; Signed RAX -> RSI/RDX byte slice including LF, no NUL required.\nformat_int:\n    lea rsi,[output+31]\n    mov byte [rsi],10\n    mov r8,rax\n    test rax,rax\n    jns .magnitude\n    neg rax                ; INT64_MIN remains unsigned 2^63, valid for DIV\n.magnitude:\n    mov r9d,10\n.digit:\n    xor edx,edx\n    div r9\n    add dl,'0'\n    dec rsi\n    mov [rsi],dl\n    test rax,rax\n    jnz .digit\n    test r8,r8\n    jns .length\n    dec rsi\n    mov byte [rsi],'-'\n.length:\n    lea rdx,[output+32]\n    sub rdx,rsi\n    ret\n; RSI NUL-terminated diagnostic; EBX status, preserved across write.\nreport:\n    xor edx,edx\n.length:\n    cmp byte [rsi+rdx],0\n    je .print\n    inc edx\n    jmp .length\n.print:\n    mov edi,2\n    call write_all\n    mov eax,ebx\n    ret\nwrite_all:\n    mov eax,1\n    syscall\n    cmp rax,-4\n    je write_all\n    test rax,rax\n    jle io_exit\n    add rsi,rax\n    sub rdx,rax\n    jnz write_all\n    ret\n; Bounded line reader: 0 EOF, 1 line, 2 overlong or embedded NUL.\n; Reads bytes individually for clarity; drains an invalid line to LF/EOF.\nread_line:\n    cmp byte [at_eof],0\n    jne .eof\n    mov qword [line_len],0\n    mov byte [line_bad],0\n.next:\n    xor eax,eax\n    xor edi,edi\n    lea rsi,[one]\n    mov edx,1\n    syscall\n    cmp rax,-4\n    je .next\n    test rax,rax\n    js io_exit\n    jz .end_file\n    mov al,[one]\n    cmp al,10\n    je .ready\n    test al,al\n    jz .bad\n    mov rcx,[line_len]\n    cmp rcx,255\n    jae .bad\n    lea rdx,[line]\n    mov [rdx+rcx],al\n    inc qword [line_len]\n    jmp .next\n.bad:\n    mov byte [line_bad],1\n    jmp .next\n.end_file:\n    mov byte [at_eof],1\n    cmp qword [line_len],0\n    jne .ready\n    cmp byte [line_bad],0\n    jne .ready\n.eof:\n    xor eax,eax\n    ret\n.ready:\n    mov rcx,[line_len]\n    lea rdx,[line]\n    mov byte [rdx+rcx],0\n    movzx eax,byte [line_bad]\n    inc eax\n    ret\n; Split on space, tab, CR. CF error unless exactly 3 tokens or blank line.\ntokenize:\n    lea rsi,[line]\n    xor ecx,ecx\n.skip:\n    mov al,[rsi]\n    test al,al\n    jz .finish\n    cmp al,' '\n    je .space\n    cmp al,9\n    je .space\n    cmp al,13\n    je .space\n    inc ecx\n    cmp ecx,1\n    jne .second\n    mov r12,rsi\n    jmp .scan\n.second:\n    cmp ecx,2\n    jne .third\n    mov r13,rsi\n    jmp .scan\n.third:\n    cmp ecx,3\n    jne .bad\n    mov r14,rsi\n.scan:\n    mov al,[rsi]\n    test al,al\n    jz .finish\n    cmp al,' '\n    je .delimiter\n    cmp al,9\n    je .delimiter\n    cmp al,13\n    je .delimiter\n    inc rsi\n    jmp .scan\n.delimiter:\n    mov byte [rsi],0\n.space:\n    inc rsi\n    jmp .skip\n.finish:\n    mov eax,ecx\n    test ecx,ecx\n    jz .ok\n    cmp ecx,3\n    jne .bad\n.ok:\n    clc\n    ret\n.bad:\n    stc\n    ret\nsection .note.GNU-stack noalloc noexec nowrite progbits",
            "explanation": "Default: WIDTH=32, EXTENDED=0, INTERACTIVE=0. Build commands appear in the listing and exercises. Inputs allow an optional minus; a leading plus is rejected. Interactive lines contain exactly three whitespace-separated tokens and at most 255 bytes before LF."
          }
        ]
      },
      {
        "id": "sec-28-5",
        "title": "28.5 Build and Test",
        "content": "Assemble and link:\n\nClarification: Run the original test cases against the corrected listing. Also test -2147483648 + 0, 2147483647 + 1, abc + 1, an empty operand, a multi-character operator, and -2147483648 / -1. Expected statuses are 0,5,4,4,2,5 respectively; diagnostics go to stderr.",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "28.5 Build and Test — listing 1",
            "code": "nasm -f elf64 calc.asm -o calc.o\nld calc.o -o calc",
            "explanation": "Test cases:"
          },
          {
            "language": "bash",
            "title": "28.5 Build and Test — listing 2",
            "code": "./calc 12 + 7\n# Output: 19\n\n./calc 20 - 5\n# Output: 15\n\n./calc 6 x 4\n# Output: 24\n\n./calc 100 / 8\n# Output: 12\n\n./calc -5 + 3\n# Output: -2\n\n./calc 10 / 0\n# Output (stderr): Error: division by zero\n\n./calc 5 % 3\n# Output (stderr): Error: unknown operator\n\n./calc 1 + 2 3\n# Output (stderr): Usage: ..."
          }
        ]
      },
      {
        "id": "sec-28-6",
        "title": "28.6 Possible Extensions",
        "content": "- Support % modulo operator using idiv and taking remainder (edx).\n- Support * for multiplication (requires careful shell escaping, e.g., ./calc 5 '*' 3).\n- Support floating-point numbers using SSE (Chapter 14).\n- Implement an interactive mode that reads lines from stdin in a loop.\n- Evaluate expressions with parentheses (requires a parser, stack, and precedence handling).\n- Handle larger numbers (64-bit) or arbitrary precision.\n- Add more error checking in atoi to detect invalid characters.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source: Solution 28.1",
            "code": "    cmp r8b, '%'\n    je .mod\n...\n.mod:\n    test ecx, ecx\n    jz .div_zero\n    mov eax, ebx\n    cdq\n    idiv ecx\n    mov eax, edx        ; remainder\n    jmp .print_result",
            "explanation": "Original source Solution 28.1: retained guidance; the exercise build uses the complete corrected calculator in section 28.4."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 28.2",
            "code": "    cmp r8b, '*'\n    je .mul",
            "explanation": "Original source Solution 28.2: retained guidance; the exercise build uses the complete corrected calculator in section 28.4."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 28.3",
            "code": "Loop reading from stdin. Use a buffer of e.g., 64 bytes. After reading, null-terminate and parse. You may need to parse tokens by splitting on spaces, which is more involved. One approach: use sscanf equivalent? In assembly, manually parse. This is a substantial extension; hint: first implement a simple line reader, then reuse atoi after finding operator position.",
            "explanation": "Original source Solution 28.3: retained guidance; the exercise build uses the complete corrected calculator in section 28.4."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 28.4",
            "code": "Change registers to 64-bit (rax, rbx, etc.). atoi should use rax and 64-bit multiply (imul rax, rax, 10). itoa uses rax and divides by 10 with cqo. Division uses idiv rcx. Ensure all string lengths fit.",
            "explanation": "Original source Solution 28.4: retained guidance; the exercise build uses the complete corrected calculator in section 28.4."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 28.5",
            "code": "atoi:\n    xor r9d, r9d         ; error flag\n    ...\n.invalid:\n    mov r9d, 1\n    ret",
            "explanation": "Original source Solution 28.5: retained guidance; the exercise build uses the complete corrected calculator in section 28.4."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-28-1",
        "title": "Exercise 28.1: Add Modulo Operator",
        "description": "Extend the calculator to support % (modulo). The program should compute the remainder of integer division, with the same sign as the dividend (like C's %). Update the usage message and operator parsing.",
        "solution": "nasm -f elf64 -DEXTENDED=1 calc.asm -o calc-mod.o\nld calc-mod.o -o calc-mod\n./calc-mod 10 '%' 3\n./calc-mod -10 '%' 3\n./calc-mod 10 '%' -3\n# Results: 1, -1, 1. Zero divisor reports status 3.",
        "solutionLanguage": "bash",
        "solutionExplanation": "Add comparison for % in operator parsing:\n\nUpdate usage string to include %. Use the complete corrected section 28.4 listing saved as calc.asm. All parsing, formatting, arithmetic and I/O routines are included there."
      },
      {
        "id": "ex-28-2",
        "title": "Exercise 28.2: Support Multiplication with `*`",
        "description": "Modify the operator parsing to accept * in addition to x. Test with shell quoting: ./calc 5 '*' 3. Explain why the quotes are necessary.",
        "solution": "nasm -f elf64 -DEXTENDED=1 calc.asm -o calc-star.o\nld calc-star.o -o calc-star\n./calc-star 5 '*' 3\n./calc-star 5 x 3\n# Both print 15. Quoting prevents shell wildcard expansion.",
        "solutionLanguage": "bash",
        "solutionExplanation": "Add:\n\nThen use ./calc 5 '*' 3. The quotes prevent shell glob expansion. Use the complete corrected section 28.4 listing saved as calc.asm. All parsing, formatting, arithmetic and I/O routines are included there."
      },
      {
        "id": "ex-28-3",
        "title": "Exercise 28.3: Interactive Mode",
        "description": "Implement an interactive calculator that reads a line from stdin, parses it into operands and operator, prints the result, and repeats until EOF. Use the read syscall and a buffer. Consider edge cases like empty lines and whitespace.",
        "solution": "nasm -f elf64 -DINTERACTIVE=1 -DEXTENDED=1 calc.asm -o calc-repl.o\nld calc-repl.o -o calc-repl\nprintf '12 + 7\\n\\n -5 \\t x 3\\r\\n10 / 0\\n8 - 2' | ./calc-repl\n# stdout: 19, -15, 6 on separate lines; stderr: division by zero.\n# Processes the last line without LF, continues after error, exits 1.",
        "solutionExplanation": " Use the complete corrected section 28.4 listing saved as calc.asm. All parsing, formatting, arithmetic and I/O routines are included there. The included read_line uses the raw read syscall, retries EINTR, drains long/NUL-containing lines, and stops at EOF. tokenize splits space/tab/CR without accepting extra tokens. This byte-at-a-time implementation favors clarity over throughput.",
        "solutionLanguage": "bash"
      },
      {
        "id": "ex-28-4",
        "title": "Exercise 28.4: 64-bit Arithmetic",
        "description": "Change the calculator to use 64-bit integers (rax, rbx, etc.) and update atoi/itoa accordingly. Test with numbers larger than 2^31-1 (e.g., 2147483648 + 1). What adjustments are needed for division (cqo instead of cdq)?",
        "solution": "nasm -f elf64 -DWIDTH=64 calc.asm -o calc64.o\nld calc64.o -o calc64\n./calc64 2147483648 + 1\n./calc64 -9223372036854775808 + 0\n./calc64 9223372036854775807 + 1\n# Results: 2147483649; -9223372036854775808; overflow status 5.",
        "solutionExplanation": " Use the complete corrected section 28.4 listing saved as calc.asm. All parsing, formatting, arithmetic and I/O routines are included there. Arithmetic division uses CQO/IDIV r64; decimal formatting uses unsigned DIV with RDX=0. The buffer accommodates 20 signed digits plus newline. The build flag changes range checks as well as accepted values.",
        "solutionLanguage": "bash"
      },
      {
        "id": "ex-28-5",
        "title": "Exercise 28.5: Error Checking in `atoi`",
        "description": "Modify atoi to return an error code if the string contains any non-digit characters (except the leading minus). For example, ./calc abc + 1 should print an error and exit with a non-zero code. Implement a flag or separate return register.",
        "solution": "nasm -f elf64 calc.asm -o calc.o\nld calc.o -o calc\n./calc abc + 1\n./calc '' + 1\n./calc - + 1\n./calc 12junk + 1\n./calc 2147483648 + 1\n# Each reports invalid/out-of-range input and exits 4.\n./calc -2147483648 + 0\n# Valid minimum: prints -2147483648 and exits 0.",
        "solutionLanguage": "bash",
        "solutionExplanation": "Add a flag register (e.g., r9d) set to 1 on invalid. The caller checks and prints an error. Example:\n\nAfter call, test r9d and branch to error. Use the complete corrected section 28.4 listing saved as calc.asm. All parsing, formatting, arithmetic and I/O routines are included there. parse_int returns CF=1 on malformed/out-of-range input and CF=0 with the result. The caller checks CF immediately. This avoids confusing valid zero with failure."
      }
    ],
    "practiceQuestions": [
      {
        "question": "How are command-line arguments passed to an assembly program at _start? Explain the stack layout.",
        "answer": "At Linux x86-64 process entry, RSP points to argc; RSP+8 holds argv[0], +16 argv[1], +24 argv[2], +32 argv[3]. Validate argc before dereferencing. Calls and pushes change RSP, so preserve argument pointers in registers that helper routines preserve or load them before stack changes."
      },
      {
        "question": "Describe the algorithm used by atoi to convert a string to an integer. How does it handle negative numbers?",
        "answer": "Consume an optional minus and at least one digit, multiply the accumulated value by ten and add the new digit. A checked implementation rejects empty strings, trailing junk and overflow. Negative accumulation accommodates the most negative signed integer without requiring its signed positive magnitude."
      },
      {
        "question": "Why is cdq necessary before signed division? What would happen if you omitted it?",
        "answer": "CDQ sign-extends EAX into EDX:EAX, the dividend for 32-bit IDIV. Stale EDX can produce a wrong quotient or a divide exception. CQO is the 64-bit equivalent; guard zero divisors and minimum-integer divided by -1."
      },
      {
        "question": "How would you modify the calculator to support floating-point numbers? Which registers and instructions would you use?",
        "answer": "Parse decimal input to float/double, operate in XMM registers with ADDSS/ADDSD, SUBSS/SUBSD, MULSS/MULSD and DIVSS/DIVSD, then format the result. Parsing/formatting, rounding, infinities and NaNs need explicit handling; changing only arithmetic instructions is insufficient."
      },
      {
        "question": "What is the purpose of using stderr for error messages instead of stdout? How do you write to stderr in assembly?",
        "answer": "Stderr keeps diagnostics separate from successful output for redirection and pipelines. For Linux x86-64 write, set EAX=1, EDI=2, RSI=buffer and RDX=length. Handle short writes and EINTR."
      },
      {
        "question": "In itoa, why do we generate digits in reverse order and then copy them? Could we generate them directly in correct order?",
        "answer": "Repeated unsigned division by ten yields least-significant digits first. Reverse them, fill a buffer backward and return a slice, or determine the highest decimal power first. Unsigned magnitude conversion also handles the signed minimum value."
      },
      {
        "question": "What are the exit codes used in this project, and why are they chosen?",
        "answer": "The original uses 0 success, 1 usage, 2 unknown operator, 3 division by zero. The corrected version adds 4 invalid/range input, 5 arithmetic overflow and 6 I/O error. These application-defined codes distinguish failures; interactive mode returns 1 if any line failed."
      },
      {
        "question": "How would you implement an interactive calculator that reads from stdin? What additional complexity arises compared to command-line arguments?",
        "answer": "Read bounded lines, retain partial data across reads, split exactly three tokens, evaluate and repeat. Handle blank lines, tabs, CRLF, EOF after an unterminated line, too-long lines and errors without losing the next expression. The complete companion drains invalid lines and continues."
      },
      {
        "question": "Explain the difference between imul eax, eax, 10 and mul ebx. Which is more appropriate for atoi and why?",
        "answer": "IMUL EAX,EAX,10 returns the low 32-bit product and sets signed overflow flags; MUL EBX treats operands as unsigned and writes EDX:EAX. For checked signed parsing, use a deliberate range strategy and inspect overflow, rather than silently discarding upper bits."
      },
      {
        "question": "If you wanted to support parentheses and operator precedence, what data structures and algorithms would you need to implement?",
        "answer": "Use tokenization plus a grammar, for example recursive descent or shunting-yard with operator and value stacks. Encode precedence and associativity, distinguish unary minus, check parentheses and bound input/stack depth."
      }
    ],
    "summary": [
      "Building a complete assembly program requires integrating many skills: string conversion, arithmetic, error handling, and system calls.",
      "Command-line arguments are accessed directly from the stack at _start.",
      "atoi and itoa are fundamental routines for processing numeric I/O.",
      "Signed division requires sign extension (cdq/cqo) before idiv.",
      "Structured error handling with distinct exit codes makes the program robust and user-friendly.",
      "Modular design (separate routines) improves readability and facilitates extensions."
    ]
  },
  {
    "id": 29,
    "slug": "chapter-29-project-2-string-manipulation-library",
    "level": 6,
    "levelTitle": "Advanced Projects",
    "title": "Chapter 29: Project 2: String Manipulation Library",
    "subtitle": "Building a Full C-Compatible libstring.asm: strlen, strcpy, strcat, memmove",
    "learningObjectives": [
      "Design and implement a reusable assembly library of string and memory manipulation functions.",
      "Master the use of x86 string instructions (movs, stos, lods, cmps, scas) with repeat prefixes.",
      "Understand pointer arithmetic and null-terminated string conventions in assembly.",
      "Handle edge cases: empty strings, overlapping memory, and buffer boundaries.",
      "Write functions that follow the System V AMD64 ABI for interoperability with C code.",
      "Create a header file with extern declarations and a test program to validate the library.",
      "Build and link a multi-file assembly project using NASM and ld.",
      "Apply techniques for efficient string processing and memory operations."
    ],
    "prerequisites": [
      "Solid understanding of x86-64 assembly, registers, and memory addressing (Chapters 1–13).",
      "Familiarity with procedures, calling conventions, and stack frames (Chapter 10).",
      "Knowledge of string instructions and memory operations (Chapter 9).",
      "Experience with modular programming and linking multiple object files (Chapter 15).",
      "Basic knowledge of C string functions for reference."
    ],
    "keyConcepts": [
      "String library provides common operations on null-terminated character arrays.",
      "Functions follow the C calling convention: arguments in registers (rdi, rsi, rdx, etc.), return value in rax.",
      "Null terminator (0) marks the end of strings.",
      "rep movsb/stosb/cmpsb/scasb accelerate block operations.",
      "memmove handles overlapping memory correctly by choosing forward or backward copy.",
      "Return values: strlen returns length, strcpy/strcat return destination pointer, strcmp returns difference, etc.",
      "Header file (.inc) declares exported functions and constants for use by other modules.",
      "A test program validates each function and prints results."
    ],
    "diagramType": "project_string_lib",
    "sections": [
      {
        "id": "sec-29-1",
        "title": "29.1 Project Overview",
        "content": "We will build a string manipulation library (libstring.asm) containing the following functions:\n\n\n\nAll functions follow the System V AMD64 ABI and are safe to call from C or assembly.\n\nWe will also create:\n- stringlib.inc: header file with extern declarations and any constants.\n- test_strings.asm: a test program that exercises the library and prints results using system calls.\n\nThe library will be assembled separately and linked with the test program.",
        "tableData": {
          "headers": [
            "Function",
            "Description"
          ],
          "rows": [
            [
              "strlen",
              "Return length of null-terminated string."
            ],
            [
              "strcpy",
              "Copy source string to destination (including null)."
            ],
            [
              "strncpy",
              "Copy up to n bytes; pad with nulls if source shorter."
            ],
            [
              "strcat",
              "Concatenate source to end of destination."
            ],
            [
              "strncat",
              "Concatenate up to n bytes, then add null."
            ],
            [
              "strcmp",
              "Compare two strings; return difference."
            ],
            [
              "strncmp",
              "Compare up to n bytes."
            ],
            [
              "strchr",
              "Find first occurrence of character."
            ],
            [
              "strrchr",
              "Find last occurrence of character."
            ],
            [
              "strstr",
              "Find first occurrence of substring."
            ],
            [
              "memset",
              "Fill memory with a byte."
            ],
            [
              "memcpy",
              "Copy n bytes (assumes no overlap)."
            ],
            [
              "memmove",
              "Copy n bytes, handling overlap."
            ],
            [
              "memcmp",
              "Compare n bytes."
            ]
          ]
        }
      },
      {
        "id": "sec-29-2",
        "title": "29.2 Program Design",
        "content": ""
      },
      {
        "id": "sec-29-2-1",
        "title": "29.2.1 Conventions",
        "content": "- All string functions assume pointers are valid and null-terminated where applicable.\n- memset, memcpy, memmove, memcmp operate on raw memory and take an explicit length in rdx.\n- For functions returning a pointer (e.g., strcpy), we return the original destination pointer (passed in rdi) in rax.\n- We use 64-bit registers and the cld instruction to ensure forward direction for string instructions.\n- For memmove, we detect overlap and choose forward or backward copy accordingly."
      },
      {
        "id": "sec-29-2-2",
        "title": "29.2.2 Efficiency Considerations",
        "content": "- Use rep movsb for memcpy and strcpy (after computing length) for speed on modern CPUs.\n- Use rep stosb for memset.\n- Use repne scasb for strlen and strchr.\n- For strcmp, use repe cmpsb for byte comparison; alternatively, compare word by word with cmpsq for speed, but byte-wise is simpler.\n- For small counts, explicit loops may be faster due to lower overhead, but for a library, rep is acceptable.\n\nClarification: REP performance depends on CPU, length and alignment; do not promise acceleration for every string instruction. REPE CMPSB does not stop at equal NUL bytes, and REPNE SCASB does not search simultaneously for a character and NUL."
      },
      {
        "id": "sec-29-2-3",
        "title": "29.2.3 Error Handling",
        "content": "In C, these functions typically do not check for null pointers; they rely on the caller. We assume valid pointers. If a pointer is null, behavior is undefined (like C). We will not add error checking to keep the library simple and fast."
      },
      {
        "id": "sec-29-3",
        "title": "29.3 Implementation Details",
        "content": "We'll implement each function using a mix of string instructions and custom loops."
      },
      {
        "id": "sec-29-3-1",
        "title": "29.3.1 strlen",
        "content": "Use repne scasb to scan for null byte.\n\nClarification: The first listing is an unfinished draft with invalid text in an instruction. The corrected full library below provides a complete STRLEN.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "strlen: rdi = string",
            "code": "; strlen: rdi = string\n; returns length in rax (excluding null)\nstrlen:\n    xor al, al          ; search for 0\n    mov rcx, -1         ; max count\n    cld\n    repne scasb\n    ; rdi points one past null; compute length = (rdi - original) - 1\n    mov rax, rdi\n    sub rax, rcx? No, we lost original. Better: save original first.\n    ; We'll use a different method:\n    ; Save rdi, then after scan, compute rdi - original - 1.\n    ; Let's rewrite:",
            "explanation": "Better implementation:"
          },
          {
            "language": "nasm",
            "title": "29.3.1 strlen — listing 2",
            "code": "strlen:\n    push rdi\n    xor al, al\n    mov rcx, -1\n    cld\n    repne scasb\n    ; rdi points to null terminator? Actually repne scasb increments rdi after each comparison, so when found, rdi points one byte after null.\n    ; So rdi now = original + length + 1\n    pop rsi             ; original pointer\n    mov rax, rdi\n    sub rax, rsi\n    dec rax             ; subtract 1 for null\n    ret"
          }
        ]
      },
      {
        "id": "sec-29-3-2",
        "title": "29.3.2 strcpy",
        "content": "Compute length, then copy including null using rep movsb.\n\nClarification: The original calls strlen with destination in RDI, then loses the destination as the scan advances. Passing the source and preserving both pointers is necessary; the complete library avoids the nested call with a byte loop.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source specimen — see correction: 29.3.2 strcpy — listing 1",
            "code": "strcpy:\n    ; Save dest in r9\n    mov r9, rdi\n    ; Compute length of src (rsi)\n    push rsi\n    call strlen         ; rax = length of src\n    pop rsi\n    mov rcx, rax\n    inc rcx             ; include null\n    cld\n    rep movsb           ; copy from rsi to rdi\n    mov rax, r9         ; return dest\n    ret"
          }
        ]
      },
      {
        "id": "sec-29-3-3",
        "title": "29.3.3 strncpy",
        "content": "Copy up to n bytes; if source shorter, pad with nulls.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "29.3.3 strncpy — listing 1",
            "code": "strncpy:\n    mov r9, rdi         ; save dest\n    mov rcx, rdx        ; n\n    xor r8d, r8d        ; copied = 0\n.loop:\n    cmp r8, rdx\n    je .done\n    mov al, [rsi]\n    mov [rdi], al\n    test al, al\n    jz .pad\n    inc rsi\n    inc rdi\n    inc r8\n    jmp .loop\n.pad:\n    ; source ended, pad remaining with null\n    inc rdi\n    inc r8\n    ; fill rest with 0\n    mov al, 0\n    mov rcx, rdx\n    sub rcx, r8\n    cld\n    rep stosb\n.done:\n    mov rax, r9\n    ret"
          }
        ]
      },
      {
        "id": "sec-29-3-4",
        "title": "29.3.4 strcat",
        "content": "Find end of dest, then copy source.\n\nClarification: Neither original strcat version works as written: the source pointer is not passed to strlen, and the second reuses a consumed RCX for unrelated scans/copies. The complete library independently finds the destination terminator and copies through the source NUL.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source specimen — see correction: 29.3.4 strcat — listing 1",
            "code": "strcat:\n    mov r9, rdi         ; save dest\n    ; find end of dest\n    xor al, al\n    mov rcx, -1\n    cld\n    repne scasb\n    dec rdi             ; point to null terminator\n    ; copy src\n    mov rsi, rdx? No, second arg is in rsi. We need to preserve rsi before scanning? Actually in our calling convention, dest in rdi, src in rsi.\n    ; rdi currently points at null of dest, so we can copy src there.\n    ; Need to compute length of src.\n    push rsi\n    call strlen\n    pop rsi\n    mov rcx, rax\n    inc rcx             ; include null\n    cld\n    rep movsb           ; copies from rsi to rdi\n    mov rax, r9\n    ret",
            "explanation": "But careful: we used call strlen which modifies rdi, but we need to preserve the pointer to end of dest. We pushed rsi but not rdi. After repne scasb, rdi points to one past null; we decremented to point at null. Then we call strlen which will modify rdi (as it uses it), so we lose the pointer. We need to save rdi before calling strlen or use a different approach.\n\nBetter: compute length of src first, then find end of dest."
          },
          {
            "language": "nasm",
            "title": "Original source specimen — see correction: 29.3.4 strcat — listing 2",
            "code": "strcat:\n    push rdi            ; save dest\n    ; compute length of src\n    push rsi\n    call strlen\n    pop rsi\n    mov rcx, rax        ; length of src\n    inc rcx             ; include null\n    pop rdi             ; restore dest\n    ; find end of dest\n    xor al, al\n    mov rdx, rdi        ; save dest start\n    cld\n    repne scasb         ; scan dest for null\n    dec rdi             ; point to null\n    ; copy src to dest end\n    cld\n    rep movsb\n    mov rax, rdx        ; return dest\n    ret",
            "explanation": "This works."
          }
        ]
      },
      {
        "id": "sec-29-3-5",
        "title": "29.3.5 strncat",
        "content": "Similar to strcat, but copies at most n bytes, then appends null.\n\nClarification: The first draft overwrites the count and never initializes the scan count. The second listing fixes these points. n bounds bytes read from source, not total destination capacity; leave room for the final NUL.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "29.3.5 strncat — listing 1",
            "code": "strncat:\n    push rdi\n    ; find end of dest\n    xor al, al\n    mov rdx, rdi\n    cld\n    repne scasb\n    dec rdi             ; point to null\n    ; copy up to n bytes from src\n    mov rcx, rdx        ; n from third arg? In ABI, third arg in rdx. We used rdx as dest start, but we overwrote it. Need to save n before.\n    ; Actually, third argument n is in rdx. We used rdx for dest start, losing n. Let's restructure.",
            "explanation": "Better implementation:"
          },
          {
            "language": "nasm",
            "title": "29.3.5 strncat — listing 2",
            "code": "strncat:\n    push rdi\n    mov r8, rdx         ; save n\n    ; find end of dest\n    xor al, al\n    mov rcx, -1\n    cld\n    repne scasb\n    dec rdi             ; point to null\n    ; copy up to n bytes\n    mov rcx, r8         ; n\n    cld\n.copy_loop:\n    test rcx, rcx\n    jz .done\n    mov al, [rsi]\n    mov [rdi], al\n    test al, al\n    jz .done            ; if null, we're done\n    inc rsi\n    inc rdi\n    dec rcx\n    jmp .copy_loop\n.done:\n    mov byte [rdi], 0   ; null terminate\n    pop rax             ; return dest\n    ret"
          }
        ]
      },
      {
        "id": "sec-29-3-6",
        "title": "29.3.6 strcmp",
        "content": "Compare byte by byte using repe cmpsb, then compute difference.\n\nClarification: REPE CMPSB compares past matching NULs. The original also subtracts second-string byte minus first-string byte, reversing the required sign. Use the NUL-aware unsigned-byte loop in the complete library.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source specimen — see correction: 29.3.6 strcmp — listing 1",
            "code": "strcmp:\n    xor eax, eax\n    mov rcx, -1\n    cld\n    repe cmpsb\n    je .equal\n    ; find difference: after repe, rsi and rdi point to byte after mismatch\n    movzx eax, byte [rsi-1]\n    movzx edx, byte [rdi-1]\n    sub eax, edx\n    ret\n.equal:\n    xor eax, eax\n    ret"
          }
        ]
      },
      {
        "id": "sec-29-3-7",
        "title": "29.3.7 strncmp",
        "content": "Compare up to n bytes.\n\nClarification: Handle n=0 before any comparison, and stop at a matching NUL. Flags from a zero-iteration REP are stale; pointer-minus-one loads are invalid in that case. The complete library checks these conditions.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source specimen — see correction: 29.3.7 strncmp — listing 1",
            "code": "strncmp:\n    mov rcx, rdx        ; n\n    cld\n    repe cmpsb\n    je .equal\n    ; if rcx != 0, mismatch occurred\n    movzx eax, byte [rsi-1]\n    movzx edx, byte [rdi-1]\n    sub eax, edx\n    ret\n.equal:\n    xor eax, eax\n    ret"
          }
        ]
      },
      {
        "id": "sec-29-3-8",
        "title": "29.3.8 strchr",
        "content": "Find first occurrence of a character in string. Character passed in sil (low byte of rsi). Return pointer to first occurrence or 0.\n\nClarification: The explanation claiming a nonmatching NUL stops REPNE SCASB is incorrect. It can scan beyond the string. The complete implementation checks target equality and NUL separately.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source specimen — see correction: 29.3.8 strchr — listing 1",
            "code": "strchr:\n    mov al, sil         ; char to find\n    mov rcx, -1\n    cld\n    repne scasb         ; scan for char or null\n    jne .not_found      ; if not found (ZF=0 means found? Actually repne stops when ZF=1 (match) or rcx=0. If rcx=0 and no match, ZF=0.)\n    ; found: rdi points one past match\n    lea rax, [rdi-1]\n    ret\n.not_found:\n    xor eax, eax\n    ret",
            "explanation": "Wait, we need to also check for null terminator. The scan will stop at null as well if char is not found before null. The repne scasb stops when al == [rdi] (ZF=1) or rcx == 0. So if we reach null, al != 0 (unless we are searching for null). For normal chars, null will not match al, so the scan stops at null with ZF=0, which we handle as not found. Good."
          }
        ]
      },
      {
        "id": "sec-29-3-9",
        "title": "29.3.9 strrchr",
        "content": "Find last occurrence. Scan forward to find null, then scan backward for char.\n\nClarification: The original starts by searching for the target rather than NUL, then scans backward without a lower bound. The complete implementation tracks the latest matching pointer during one bounded-by-NUL forward pass, including a search for zero.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source specimen — see correction: 29.3.9 strrchr — listing 1",
            "code": "strrchr:\n    mov al, sil         ; char\n    mov rcx, -1\n    cld\n    repne scasb         ; find null terminator (by searching for 0)\n    ; rdi points one past null\n    dec rdi             ; point to null\n    ; now scan backward for char\n    std                 ; set direction flag (backward)\n    mov rcx, -1\n    repne scasb         ; scan backward for char\n    cld                 ; clear direction flag\n    je .found\n    xor eax, eax\n    ret\n.found:\n    lea rax, [rdi+1]    ; because backward scan leaves rdi one before match? Actually in backward direction, after repne scasb, rdi points one byte before the match. So match is at rdi+1.\n    ret",
            "explanation": "This is a bit tricky; we need to ensure correctness. We'll test."
          }
        ]
      },
      {
        "id": "sec-29-3-10",
        "title": "29.3.10 strstr",
        "content": "Find first occurrence of substring. Naive algorithm: for each position in haystack, check if needle matches. Use nested loops.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "29.3.10 strstr — listing 1",
            "code": "strstr:\n    ; rdi = haystack, rsi = needle\n    push r12\n    push r13\n    mov r12, rdi        ; current position in haystack\n    mov r13, rsi        ; save needle\n.outer_loop:\n    mov rdi, r12\n    mov rsi, r13\n    ; compare characters\n.inner_loop:\n    mov al, [rsi]\n    test al, al\n    jz .found           ; reached end of needle, match\n    cmp al, [rdi]\n    jne .not_match\n    inc rsi\n    inc rdi\n    jmp .inner_loop\n.not_match:\n    ; check if we reached end of haystack\n    cmp byte [r12], 0\n    je .not_found\n    inc r12\n    jmp .outer_loop\n.found:\n    mov rax, r12\n    pop r13\n    pop r12\n    ret\n.not_found:\n    xor eax, eax\n    pop r13\n    pop r12\n    ret",
            "explanation": "This is naive O(n*m); acceptable for a library, but could be optimized with KMP etc."
          }
        ]
      },
      {
        "id": "sec-29-3-11",
        "title": "29.3.11 memset",
        "content": "Fill n bytes with a byte.\n\nClarification: Only the final original version preserves the destination independently of AL. The full library saves the destination in R8 and returns it after the fill.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "29.3.11 memset — listing 1",
            "code": "memset:\n    mov al, sil         ; byte value (low 8 bits of rsi)\n    mov rcx, rdx        ; count\n    cld\n    rep stosb\n    mov rax, rdi        ; return dest (original rdi before fill)\n    ret",
            "explanation": "But careful: rep stosb modifies rdi, so we need to return original. Save rdi first."
          },
          {
            "language": "nasm",
            "title": "29.3.11 memset — listing 2",
            "code": "memset:\n    mov rax, rdi        ; save dest\n    mov al, sil         ; byte\n    mov rcx, rdx\n    cld\n    rep stosb\n    ret                 ; rax still has original dest? Wait, we used al for byte, overwriting low byte of rax. Need to preserve rax.",
            "explanation": "Better:"
          },
          {
            "language": "nasm",
            "title": "29.3.11 memset — listing 3",
            "code": "memset:\n    push rdi\n    mov al, sil\n    mov rcx, rdx\n    cld\n    rep stosb\n    pop rax\n    ret"
          }
        ]
      },
      {
        "id": "sec-29-3-12",
        "title": "29.3.12 memcpy",
        "content": "Copy n bytes, assume no overlap.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "29.3.12 memcpy — listing 1",
            "code": "memcpy:\n    push rdi\n    mov rcx, rdx\n    cld\n    rep movsb\n    pop rax\n    ret"
          }
        ]
      },
      {
        "id": "sec-29-3-13",
        "title": "29.3.13 memmove",
        "content": "If destination > source and overlap, copy backward; else copy forward.\n\nClarification: The complete library handles n=0 before computing last-byte addresses and uses destination-source < n to identify backward overlap without adding n to a pointer.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "29.3.13 memmove — listing 1",
            "code": "memmove:\n    push rdi\n    mov rax, rdi        ; dest\n    mov rcx, rdx        ; n\n    cmp rdi, rsi\n    jbe .forward        ; if dest <= src, forward copy is safe\n    ; check if overlap: dest < src+n?\n    lea rdx, [rsi+rcx]\n    cmp rdi, rdx\n    jae .forward        ; no overlap\n    ; backward copy\n    std                 ; set direction flag\n    lea rsi, [rsi+rcx-1]\n    lea rdi, [rdi+rcx-1]\n    rep movsb\n    cld\n    jmp .done\n.forward:\n    cld\n    rep movsb\n.done:\n    pop rax\n    ret",
            "explanation": "Need to ensure rsi and rdi are adjusted correctly for backward copy. rep movsb with direction flag set decrements rdi and rsi after each byte. So we set them to end-of-buffer (last byte) and copy backward. Good."
          }
        ]
      },
      {
        "id": "sec-29-3-14",
        "title": "29.3.14 memcmp",
        "content": "Compare n bytes.\n\nClarification: As with strncmp, explicitly return zero for n=0 and subtract unsigned first-byte minus second-byte at the first mismatch. MEMCMP compares exactly n bytes and does not treat NUL specially.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source specimen — see correction: 29.3.14 memcmp — listing 1",
            "code": "memcmp:\n    mov rcx, rdx\n    cld\n    repe cmpsb\n    je .equal\n    movzx eax, byte [rsi-1]\n    movzx edx, byte [rdi-1]\n    sub eax, edx\n    ret\n.equal:\n    xor eax, eax\n    ret"
          }
        ]
      },
      {
        "id": "sec-29-4",
        "title": "29.4 Full Library Source Code",
        "content": "Create stringlib.asm with all functions. We'll include a header stringlib.inc with extern declarations.\n\nstringlib.inc:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "29.4 Full Library Source Code — listing 1",
            "code": "extern strlen\nextern strcpy\nextern strncpy\nextern strcat\nextern strncat\nextern strcmp\nextern strncmp\nextern strchr\nextern strrchr\nextern strstr\nextern memset\nextern memcpy\nextern memmove\nextern memcmp",
            "explanation": "stringlib.asm:\nWe'll write the full code as outlined, making sure to preserve registers as needed. We'll add global declarations at top.\n\n(Full code will be provided in the final output, but here we summarize.)"
          },
          {
            "language": "nasm",
            "title": "Complete stringlib.asm",
            "code": "; stringlib.asm: NASM ELF64, System V AMD64, valid caller-provided buffers.\n; String copy/concatenation require sufficient capacity and no overlap.\n; Byte comparisons use unsigned char. DF is clear on return.\ndefault rel\nsection .text\nglobal strlen,strcpy,strncpy,strcat,strncat,strcmp,strncmp\nglobal strchr,strrchr,strstr,memset,memcpy,memmove,memcmp\nstrlen:\n    mov rdx,rdi\n    xor eax,eax\n    mov rcx,-1\n    cld\n    repne scasb\n    mov rax,rdi\n    sub rax,rdx\n    dec rax\n    ret\nstrcpy:\n    mov rax,rdi\n.loop:\n    mov dl,[rsi]\n    mov [rdi],dl\n    inc rsi\n    inc rdi\n    test dl,dl\n    jnz .loop\n    ret\nstrncpy:\n    mov r8,rdi\n    mov rcx,rdx\n    cld\n.loop:\n    test rcx,rcx\n    jz .done\n    mov al,[rsi]\n    mov [rdi],al\n    inc rdi\n    dec rcx\n    test al,al\n    jz .pad\n    inc rsi\n    jmp .loop\n.pad:\n    rep stosb\n.done:\n    mov rax,r8\n    ret\nstrcat:\n    mov rax,rdi\n.end:\n    cmp byte [rdi],0\n    je .copy\n    inc rdi\n    jmp .end\n.copy:\n    mov dl,[rsi]\n    mov [rdi],dl\n    inc rsi\n    inc rdi\n    test dl,dl\n    jnz .copy\n    ret\nstrncat:\n    mov rax,rdi\n.end:\n    cmp byte [rdi],0\n    je .copy\n    inc rdi\n    jmp .end\n.copy:\n    test rdx,rdx\n    jz .terminate\n    mov cl,[rsi]\n    test cl,cl\n    jz .terminate\n    mov [rdi],cl\n    inc rdi\n    inc rsi\n    dec rdx\n    jmp .copy\n.terminate:\n    mov byte [rdi],0\n    ret\nstrcmp:\n.loop:\n    movzx eax,byte [rdi]\n    movzx edx,byte [rsi]\n    cmp eax,edx\n    jne .difference\n    test eax,eax\n    jz .difference\n    inc rdi\n    inc rsi\n    jmp .loop\n.difference:\n    sub eax,edx\n    ret\nstrncmp:\n    test rdx,rdx\n    jz .equal\n.loop:\n    movzx eax,byte [rdi]\n    movzx ecx,byte [rsi]\n    cmp eax,ecx\n    jne .difference\n    test eax,eax\n    jz .equal\n    inc rdi\n    inc rsi\n    dec rdx\n    jnz .loop\n.equal:\n    xor eax,eax\n    ret\n.difference:\n    sub eax,ecx\n    ret\nstrchr:\n.loop:\n    mov al,[rdi]\n    cmp al,sil\n    je .found\n    test al,al\n    jz .missing\n    inc rdi\n    jmp .loop\n.found:\n    mov rax,rdi\n    ret\n.missing:\n    xor eax,eax\n    ret\nstrrchr:\n    xor eax,eax\n.loop:\n    mov dl,[rdi]\n    cmp dl,sil\n    cmove rax,rdi\n    inc rdi\n    test dl,dl\n    jnz .loop\n    ret\nstrstr:\n    mov rax,rdi\n.outer:\n    mov r8,rax\n    mov r9,rsi\n.inner:\n    mov dl,[r9]\n    test dl,dl\n    jz .found\n    cmp dl,[r8]\n    jne .next\n    inc r8\n    inc r9\n    jmp .inner\n.next:\n    cmp byte [rax],0\n    je .missing\n    inc rax\n    jmp .outer\n.found:\n    ret\n.missing:\n    xor eax,eax\n    ret\nmemset:\n    mov r8,rdi\n    mov eax,esi\n    mov rcx,rdx\n    cld\n    rep stosb\n    mov rax,r8\n    ret\nmemcpy:\n    mov rax,rdi\n    mov rcx,rdx\n    cld\n    rep movsb\n    ret\nmemmove:\n    mov rax,rdi\n    mov rcx,rdx\n    cld\n    test rcx,rcx\n    jz .done\n    cmp rdi,rsi\n    jbe .forward\n    mov r8,rdi\n    sub r8,rsi\n    cmp r8,rcx\n    jae .forward\n    lea rdi,[rdi+rcx-1]\n    lea rsi,[rsi+rcx-1]\n    std\n    rep movsb\n    cld\n    ret\n.forward:\n    rep movsb\n.done:\n    ret\nmemcmp:\n    test rdx,rdx\n    jz .equal\n.loop:\n    movzx eax,byte [rdi]\n    movzx ecx,byte [rsi]\n    cmp eax,ecx\n    jne .difference\n    inc rdi\n    inc rsi\n    dec rdx\n    jnz .loop\n.equal:\n    xor eax,eax\n    ret\n.difference:\n    sub eax,ecx\n    ret\nsection .note.GNU-stack noalloc noexec nowrite progbits",
            "explanation": "All 14 exported functions are defined. Standard caller preconditions apply: accessible source, sufficient destination capacity, valid n-byte regions, and no overlap except for memmove. Scalar loops intentionally avoid speculative word reads past NUL."
          },
          {
            "language": "c",
            "title": "C declarations: stringlib.h",
            "code": "#ifndef STRINGLIB_H\n#define STRINGLIB_H\n#include <stddef.h>\n/* C test build prefixes exports with asm_ to avoid replacing libc symbols. */\nsize_t asm_strlen(const char *);\nchar *asm_strcpy(char *,const char *);\nchar *asm_strncpy(char *,const char *,size_t);\nchar *asm_strcat(char *,const char *);\nchar *asm_strncat(char *,const char *,size_t);\nint asm_strcmp(const char *,const char *);\nint asm_strncmp(const char *,const char *,size_t);\nchar *asm_strchr(const char *,int);\nchar *asm_strrchr(const char *,int);\nchar *asm_strstr(const char *,const char *);\nvoid *asm_memset(void *,int,size_t);\nvoid *asm_memcpy(void *,const void *,size_t);\nvoid *asm_memmove(void *,const void *,size_t);\nint asm_memcmp(const void *,const void *,size_t);\n#endif",
            "explanation": "For C tests, objcopy prefixes the object symbols with asm_ so the educational routines do not interpose on libc. The original stringlib.inc continues to work with the unprefixed object."
          }
        ]
      },
      {
        "id": "sec-29-5",
        "title": "29.5 Test Program",
        "content": "We'll create test_strings.asm that calls each function and prints results. For simplicity, we'll use printf from libc? But we want to avoid libc, so we'll use write syscall and our own itoa for numbers. We'll include a small itoa in the test program, or just exit with codes and verify manually. For better demonstration, we'll print strings and numbers.\n\nWe'll write a helper print_string and print_number using write.\n\nThe test program will:\n- Test strlen on \"Hello\" -> 5\n- Test strcpy copying \"World\" to buffer\n- Test strcat concatenating \"Hello\" and \" World\"\n- Test strcmp on equal strings -> 0\n- Test strchr finding 'l' in \"Hello\" -> pointer to first 'l'\n- Test strstr finding \"ell\" in \"Hello\" -> pointer\n- Test memset and memcpy\n- Test memmove overlap\n\nWe'll print results as strings or numbers.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Complete test_strings.asm",
            "code": "; test_strings.asm -- raw-syscall smoke test; C companion covers all 14 APIs.\n%include \"stringlib.inc\"\ndefault rel\nsection .data\nhello db 'Hello',0\nworld db ' World',0\nell db 'ell',0\nexpected db 'Hello World',0\nok db 'String library smoke checks passed',10\noklen equ $-ok\nsection .bss\nbuffer resb 64\nsection .text\nglobal _start\n_start:\n    lea rdi,[hello]\n    call strlen\n    cmp rax,5\n    jne fail\n    lea rdi,[buffer]\n    lea rsi,[hello]\n    call strcpy\n    lea rdi,[buffer]\n    lea rsi,[world]\n    call strcat\n    lea rdi,[buffer]\n    lea rsi,[expected]\n    call strcmp\n    test eax,eax\n    jnz fail\n    lea rdi,[hello]\n    mov esi,'l'\n    call strchr\n    lea rdx,[hello+2]\n    cmp rax,rdx\n    jne fail\n    lea rdi,[hello]\n    lea rsi,[ell]\n    call strstr\n    lea rdx,[hello+1]\n    cmp rax,rdx\n    jne fail\n    lea rdi,[buffer]\n    mov esi,'X'\n    mov edx,16\n    call memset\n    cmp byte [buffer+15],'X'\n    jne fail\n    lea rdi,[buffer]\n    lea rsi,[hello]\n    mov edx,6\n    call memcpy\n    lea rdi,[buffer+1]\n    lea rsi,[buffer]\n    mov edx,6\n    call memmove\n    lea rdi,[buffer+1]\n    lea rsi,[hello]\n    call strcmp\n    test eax,eax\n    jnz fail\n    mov eax,1\n    mov edi,1\n    lea rsi,[ok]\n    mov edx,oklen\n    syscall\n    xor edi,edi\n    jmp quit\nfail:\n    mov edi,1\nquit:\n    mov eax,60\n    syscall\nsection .note.GNU-stack noalloc noexec nowrite progbits",
            "explanation": "Raw Linux syscall smoke test for the originally listed demonstrations. Returns zero and prints a success message when the checks pass; returns one on a failed assertion."
          },
          {
            "language": "c",
            "title": "Complete C regression: test_strings.c",
            "code": "#include \"stringlib.h\"\n#include <assert.h>\n#include <stdio.h>\n#include <string.h>\nint main(void) {\n    char b[64], c[64]; const char s[]=\"Hello\";\n    assert(asm_strlen(s)==5 && asm_strlen(\"\")==0);\n    assert(asm_strcpy(b,\"World\")==b && !strcmp(b,\"World\"));\n    memset(b,0x55,sizeof b);\n    assert(asm_strncpy(b,\"a\",5)==b && !memcmp(b,\"a\\0\\0\\0\\0\",5) && b[5]==0x55);\n    asm_strncpy(b,\"abcdef\",3); assert(!memcmp(b,\"abc\",3));\n    asm_strcpy(b,\"Hello\"); assert(asm_strcat(b,\" World\")==b && !strcmp(b,\"Hello World\"));\n    asm_strcpy(b,\"A\"); assert(asm_strncat(b,\"BCD\",2)==b && !strcmp(b,\"ABC\"));\n    assert(asm_strcmp(\"same\",\"same\")==0 && asm_strcmp(\"a\",\"b\")<0);\n    assert(asm_strcmp(\"\\xff\",\"\\x01\")>0);\n    assert(asm_strncmp(\"a\",\"b\",0)==0 && asm_strncmp(\"ab\",\"ac\",1)==0);\n    assert(asm_strncmp(\"a\",\"aa\",8)<0);\n    assert(asm_strchr(s,'l')==s+2 && asm_strchr(s,'z')==NULL && asm_strchr(s,0)==s+5);\n    assert(asm_strrchr(s,'l')==s+3 && asm_strrchr(s,'z')==NULL && asm_strrchr(s,0)==s+5);\n    assert(asm_strstr(s,\"ell\")==s+1 && asm_strstr(s,\"\")==s && !asm_strstr(s,\"Hello!\"));\n    assert(asm_memset(b,0xAB,8)==b); for(int i=0;i<8;i++)assert((unsigned char)b[i]==0xAB);\n    assert(asm_memcpy(c,b,8)==c && !memcmp(c,b,8));\n    assert(asm_memcmp(\"\\xff\",\"\\x01\",1)>0 && asm_memcmp(\"a\",\"b\",0)==0);\n    for (size_t src=0;src<16;src++) for (size_t dst=0;dst<16;dst++)\n        for (size_t n=0;n<=16;n++) {\n            for (size_t i=0;i<64;i++) b[i]=c[i]=(char)i;\n            memmove(c+dst,c+src,n);\n            assert(asm_memmove(b+dst,b+src,n)==b+dst);\n            assert(!memcmp(b,c,sizeof b));\n        }\n    puts(\"All 14 string/memory functions passed, including overlap cases.\");\n    return 0;\n}",
            "explanation": "Checks all 14 APIs, return pointers, zero counts, unsigned comparisons, NUL searches, strncpy padding, and 4352 overlapping move cases against libc."
          }
        ]
      },
      {
        "id": "sec-29-6",
        "title": "29.6 Build and Test",
        "content": "",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "29.6 Build and Test — listing 1",
            "code": "nasm -f elf64 stringlib.asm -o stringlib.o\nnasm -f elf64 test_strings.asm -o test_strings.o\nld test_strings.o stringlib.o -o test_strings\n./test_strings",
            "explanation": "Expected output will show results."
          },
          {
            "language": "bash",
            "title": "Build and run the C comparison",
            "code": "nasm -f elf64 stringlib.asm -o stringlib.o\nobjcopy --prefix-symbols=asm_ stringlib.o stringlib-c.o\ngcc -O2 -Wall -Wextra test_strings.c stringlib-c.o -o test_strings_c\n./test_strings_c",
            "explanation": "Save the header and test source beside the library. The pure-assembly build above uses stringlib.o; this C build uses stringlib-c.o."
          }
        ]
      },
      {
        "id": "sec-29-7",
        "title": "29.7 Possible Extensions",
        "content": "- Add strdup (allocate memory and copy) using brk or mmap.\n- Implement strtok for tokenizing strings.\n- Add case-insensitive comparison (strcasecmp).\n- Optimize strcmp using word-wise comparison (cmpsq).\n- Implement strstr using Boyer-Moore or KMP for efficiency.\n- Add strlcpy/strlcat for bounded versions.\n\nOriginal source solution placeholder: (Solutions provided for exercises, including code snippets and explanations.)",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Complete exercise support: extensions.asm",
            "code": "; extensions.asm -- links with prefixed stringlib-c.o and libc using gcc.\ndefault rel\nsection .bss\nnext_token resq 1\nsection .text\nglobal asm_strdup,asm_strtok,asm_strcasecmp,asm_strlen_loop\nextern malloc,asm_strlen,asm_memcpy\nasm_strdup:\n    push rbx\n    push r12\n    sub rsp,8\n    mov rbx,rdi\n    call asm_strlen\n    add rax,1\n    jc .failed\n    mov r12,rax\n    mov rdi,rax\n    call malloc wrt ..plt\n    test rax,rax\n    jz .done\n    mov rdi,rax\n    mov rsi,rbx\n    mov rdx,r12\n    call asm_memcpy\n    jmp .done\n.failed:\n    xor eax,eax\n.done:\n    add rsp,8\n    pop r12\n    pop rbx\n    ret\n; Destructive strtok with static state, not reentrant/thread-safe.\n; RDI=mutable string or NULL, RSI=NUL-terminated delimiter set each call.\nasm_strtok:\n    test rdi,rdi\n    jnz .skip\n    mov rdi,[next_token]\n    test rdi,rdi\n    jz .none\n.skip:\n    mov dl,[rdi]\n    test dl,dl\n    jz .none\n    mov rcx,rsi\n.skip_set:\n    mov r8b,[rcx]\n    test r8b,r8b\n    jz .begin\n    cmp dl,r8b\n    je .skip_char\n    inc rcx\n    jmp .skip_set\n.skip_char:\n    inc rdi\n    jmp .skip\n.begin:\n    mov rax,rdi\n.scan:\n    mov dl,[rdi]\n    test dl,dl\n    jz .last\n    mov rcx,rsi\n.scan_set:\n    mov r8b,[rcx]\n    test r8b,r8b\n    jz .advance\n    cmp dl,r8b\n    je .split\n    inc rcx\n    jmp .scan_set\n.advance:\n    inc rdi\n    jmp .scan\n.split:\n    mov byte [rdi],0\n    inc rdi\n    mov [next_token],rdi\n    ret\n.last:\n    mov qword [next_token],0\n    ret\n.none:\n    mov qword [next_token],0\n    xor eax,eax\n    ret\n; ASCII-only comparison, not locale-aware POSIX strcasecmp.\nasm_strcasecmp:\n.loop:\n    movzx eax,byte [rdi]\n    movzx edx,byte [rsi]\n    cmp eax,'A'\n    jb .second\n    cmp eax,'Z'\n    ja .second\n    add eax,32\n.second:\n    cmp edx,'A'\n    jb .compare\n    cmp edx,'Z'\n    ja .compare\n    add edx,32\n.compare:\n    cmp eax,edx\n    jne .difference\n    test eax,eax\n    jz .difference\n    inc rdi\n    inc rsi\n    jmp .loop\n.difference:\n    sub eax,edx\n    ret\nasm_strlen_loop:\n    xor eax,eax\n.loop:\n    cmp byte [rdi+rax],0\n    je .done\n    inc rax\n    jmp .loop\n.done:\n    ret\nsection .note.GNU-stack noalloc noexec nowrite progbits",
            "explanation": "Exports asm_strdup, asm_strtok, asm_strcasecmp and asm_strlen_loop. Links with the prefixed core object and libc. ASCII case folding is explicit; strtok uses shared static state and modifies its input."
          },
          {
            "language": "bash",
            "title": "Exercise support build",
            "code": "nasm -f elf64 extensions.asm -o extensions.o\n# Link any exercise C file with:\n# gcc -O2 exercise.c extensions.o stringlib-c.o -o exercise",
            "explanation": "The malloc-based duplicate is released with free. The educational strtok is not reentrant; do not use it concurrently or on string literals."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-29-1",
        "title": "Exercise 29.1: Implement `strdup`",
        "description": "Write a function strdup that allocates memory (using malloc or brk) and copies the source string into it. Return pointer to new string.",
        "solution": "#include <assert.h>\n#include <stdlib.h>\n#include <string.h>\nextern char *asm_strdup(const char *);\nint main(void) {\n    char source[]=\"duplicate me\";\n    char *copy=asm_strdup(source);\n    assert(copy && copy!=source && strcmp(copy,source)==0);\n    source[0]='D'; assert(copy[0]=='d'); free(copy);\n    copy=asm_strdup(\"\"); assert(copy && copy[0]==0); free(copy);\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "Use the full asm_strdup in extensions.asm. It preserves callee-saved registers, aligns calls, checks allocation failure, and copies the terminator. Link with extensions.o and stringlib-c.o using gcc; allocated memory belongs to the caller."
      },
      {
        "id": "ex-29-2",
        "title": "Exercise 29.2: Implement `strtok`",
        "description": "Write strtok that tokenizes a string based on delimiters. It should maintain a static pointer for subsequent calls.",
        "solution": "#include <assert.h>\n#include <stddef.h>\n#include <string.h>\nextern char *asm_strtok(char *,const char *);\nint main(void) {\n    char text[]=\" ,one,,two;three;\";\n    assert(!strcmp(asm_strtok(text,\" ,;\"),\"one\"));\n    assert(!strcmp(asm_strtok(NULL,\" ,;\"),\"two\"));\n    assert(!strcmp(asm_strtok(NULL,\" ,;\"),\"three\"));\n    assert(asm_strtok(NULL,\" ,;\")==NULL);\n    char whole[]=\"a,b\";assert(!strcmp(asm_strtok(whole,\"\"),\"a,b\"));\n    char empty[]=\"\";assert(asm_strtok(empty,\",\")==NULL);\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "Use asm_strtok from the complete extensions.asm. It skips delimiter runs, inserts NULs, saves the next position and accepts a fresh delimiter set on every call. Its static pointer makes concurrent or nested tokenization unsuitable; a reentrant variant would accept caller-owned state."
      },
      {
        "id": "ex-29-3",
        "title": "Exercise 29.3: Optimize `strlen`",
        "description": "Compare performance of repne scasb version vs a simple loop. Write two versions and benchmark with perf.",
        "solution": "#define _POSIX_C_SOURCE 200809L\n#include \"stringlib.h\"\n#include <assert.h>\n#include <stdio.h>\n#include <string.h>\n#include <time.h>\nextern size_t asm_strlen_loop(const char *);\nstatic double now(void) {struct timespec t;clock_gettime(CLOCK_MONOTONIC,&t);return t.tv_sec+t.tv_nsec*1e-9;}\nint main(void) {\n    char s[4097]; memset(s,'a',sizeof s); s[4096]=0;\n    size_t lengths[]={0,1,15,64,1024,4096};\n    for(size_t k=0;k<sizeof lengths/sizeof lengths[0];k++) {\n        size_t n=lengths[k];s[n]=0;\n        assert(asm_strlen(s)==n && asm_strlen_loop(s)==n);\n        for(int mode=0;mode<2;mode++) {\n            size_t checksum=0;double start=now();\n            for(size_t i=0;i<20000;i++) checksum+=mode?asm_strlen_loop(s):asm_strlen(s);\n            printf(\"n=%zu mode=%s seconds=%.6f checksum=%zu\\n\",n,mode?\"loop\":\"scas\",now()-start,checksum);\n            assert(checksum==20000*n);\n        }\n        s[n]='a';\n    }\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "Save as bench.c and link with extensions.o/stringlib-c.o. The benchmark measures both complete NASM routines over multiple lengths and checks results outside and inside timed loops. Repeat runs and report CPU/compiler/lengths. Optional: perf stat -e cycles,instructions ./bench when permitted; elapsed time works without performance-counter access."
      },
      {
        "id": "ex-29-4",
        "title": "Exercise 29.4: Add `strcasecmp`",
        "description": "Implement case-insensitive comparison by converting characters to lowercase before comparing.",
        "solution": "#include <assert.h>\nextern int asm_strcasecmp(const char *,const char *);\nint main(void) {\n    assert(asm_strcasecmp(\"Hello\",\"hELLo\")==0);\n    assert(asm_strcasecmp(\"a\",\"B\")<0);\n    assert(asm_strcasecmp(\"Z\",\"y\")>0);\n    assert(asm_strcasecmp(\"\",\"\")==0);\n    assert(asm_strcasecmp(\"[\",\"{\")<0);\n    assert(asm_strcasecmp(\"\\xff\",\"\\x01\")>0);\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "The full ASCII-only routine appears in extensions.asm. It folds only A–Z, so punctuation and high bytes remain unchanged; blindly OR-ing 0x20 would also alter nonletters. Compare unsigned byte values and stop at NUL. Locale and Unicode handling require a different contract."
      },
      {
        "id": "ex-29-5",
        "title": "Exercise 29.5: Test `memmove` with Overlap",
        "description": "Write a test program that copies a buffer to an overlapping destination and verifies correctness using both forward and backward overlap scenarios.",
        "solution": "#include \"stringlib.h\"\n#include <assert.h>\n#include <stdio.h>\n#include <string.h>\nint main(void) {\n    char b[64], c[64]; const char s[]=\"Hello\";\n    assert(asm_strlen(s)==5 && asm_strlen(\"\")==0);\n    assert(asm_strcpy(b,\"World\")==b && !strcmp(b,\"World\"));\n    memset(b,0x55,sizeof b);\n    assert(asm_strncpy(b,\"a\",5)==b && !memcmp(b,\"a\\0\\0\\0\\0\",5) && b[5]==0x55);\n    asm_strncpy(b,\"abcdef\",3); assert(!memcmp(b,\"abc\",3));\n    asm_strcpy(b,\"Hello\"); assert(asm_strcat(b,\" World\")==b && !strcmp(b,\"Hello World\"));\n    asm_strcpy(b,\"A\"); assert(asm_strncat(b,\"BCD\",2)==b && !strcmp(b,\"ABC\"));\n    assert(asm_strcmp(\"same\",\"same\")==0 && asm_strcmp(\"a\",\"b\")<0);\n    assert(asm_strcmp(\"\\xff\",\"\\x01\")>0);\n    assert(asm_strncmp(\"a\",\"b\",0)==0 && asm_strncmp(\"ab\",\"ac\",1)==0);\n    assert(asm_strncmp(\"a\",\"aa\",8)<0);\n    assert(asm_strchr(s,'l')==s+2 && asm_strchr(s,'z')==NULL && asm_strchr(s,0)==s+5);\n    assert(asm_strrchr(s,'l')==s+3 && asm_strrchr(s,'z')==NULL && asm_strrchr(s,0)==s+5);\n    assert(asm_strstr(s,\"ell\")==s+1 && asm_strstr(s,\"\")==s && !asm_strstr(s,\"Hello!\"));\n    assert(asm_memset(b,0xAB,8)==b); for(int i=0;i<8;i++)assert((unsigned char)b[i]==0xAB);\n    assert(asm_memcpy(c,b,8)==c && !memcmp(c,b,8));\n    assert(asm_memcmp(\"\\xff\",\"\\x01\",1)>0 && asm_memcmp(\"a\",\"b\",0)==0);\n    for (size_t src=0;src<16;src++) for (size_t dst=0;dst<16;dst++)\n        for (size_t n=0;n<=16;n++) {\n            for (size_t i=0;i<64;i++) b[i]=c[i]=(char)i;\n            memmove(c+dst,c+src,n);\n            assert(asm_memmove(b+dst,b+src,n)==b+dst);\n            assert(!memcmp(b,c,sizeof b));\n        }\n    puts(\"All 14 string/memory functions passed, including overlap cases.\");\n    return 0;\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "The full test program in section 29.5 exercises both overlap directions, equal pointers and zero lengths using a separate libc reference buffer. It checks all bytes, not just the return pointer. Build using the section 29.6 C commands. The assembly routine restores DF after backward copying."
      }
    ],
    "practiceQuestions": [
      {
        "question": "How does strlen work using repne scasb? Explain the register setup and result calculation.",
        "answer": "Set AL=0, RCX to a large count, clear DF, and scan from RDI using REPNE SCASB. It advances past the NUL; subtract the original pointer and one. This requires an accessible terminated string, not just RCX=-1."
      },
      {
        "question": "Why is it necessary to save rdi before calling strlen in strcpy? What would happen if you didn't?",
        "answer": "STRLEN takes its input in RDI and may change caller-saved registers. Save the destination, pass the source in RDI, retain the source pointer and length, then restore the copy destination. The original source forgets to pass the source. The corrected strcpy uses a direct byte loop."
      },
      {
        "question": "How does memmove determine whether to copy forward or backward? Why is this important?",
        "answer": "Copy forward when destination is below/equal to source or outside its range. When destination is above source and destination-source < n, copy backward from the last byte. Otherwise a forward copy can overwrite unread source bytes. Restore DF afterward."
      },
      {
        "question": "What is the difference between strcpy and strncpy? When would you use strncpy?",
        "answer": "STRCPY copies through the NUL. STRNCPY writes exactly n bytes, pads short sources with zeros, and may omit termination when the source length is at least n. It fits fixed-width fields; it is not a general safe-string substitute. Capacity is always the caller’s responsibility."
      },
      {
        "question": "Explain how strchr uses repne scasb and how it detects not found.",
        "answer": "REPNE SCASB searches only for AL or count exhaustion; it does not also stop at NUL for a nonzero target. Use a byte loop testing both conditions, or determine a safe bounded count first. Searching for NUL must return the terminator pointer."
      },
      {
        "question": "In strcat, why do you need to find the end of the destination before copying? Show the assembly steps.",
        "answer": "Concatenation replaces the old destination terminator with source data. Save the original destination, advance a temporary pointer until byte zero, copy source bytes including their terminator, and return the saved destination. Ensure capacity for both lengths plus one."
      },
      {
        "question": "How would you implement strcmp using word-wise comparison instead of byte-wise? What are the trade-offs?",
        "answer": "Word loads can reduce loop iterations but require zero-byte detection, mismatch-byte localization and care around page boundaries. Compare unsigned bytes in lexical order; comparing little-endian qwords numerically gives the wrong ordering. Do not read inaccessible bytes past a terminator."
      },
      {
        "question": "What is the purpose of the direction flag in string instructions? How do you set/clear it?",
        "answer": "DF=0 advances RSI/RDI, DF=1 decrements them for string instructions. CLD clears and STD sets it. The SysV ABI expects DF clear at entry and return, so a backward memmove must execute CLD before returning."
      },
      {
        "question": "Describe how strstr works in a naive implementation. What is its time complexity?",
        "answer": "For each candidate haystack position, compare successive bytes with the needle until mismatch or needle NUL. Empty needle matches the starting pointer; reaching haystack NUL without a match fails. Worst-case work is O(n*m)."
      },
      {
        "question": "How does the ABI specify the return value for functions like strcpy and memset? Why is it useful?",
        "answer": "Pointer results return in RAX under SysV AMD64. STRCPY and MEMSET return the original destination, enabling chained use. REP changes RDI, and storing a fill byte into AL can corrupt a pointer saved in RAX; keep it elsewhere until returning."
      }
    ],
    "summary": [
      "A string library in assembly provides low-level implementations of common C string functions.",
      "String instructions with repeat prefixes offer efficient block operations.",
      "Pointer arithmetic and null-terminated string handling are fundamental.",
      "The ABI must be followed for interoperability.",
      "Testing with a separate program validates the library."
    ]
  },
  {
    "id": 30,
    "slug": "chapter-30-project-3-array-sorting-utilities",
    "level": 6,
    "levelTitle": "Advanced Projects",
    "title": "Chapter 30: Project 3: Array and Sorting Utilities",
    "subtitle": "Iterative Sorts (Bubble, Selection, Insertion), Recursive Quicksort & Binary Search",
    "learningObjectives": [
      "Apply assembly language to implement fundamental array operations and sorting algorithms.",
      "Understand array representation in memory and efficient traversal using pointers and indexed addressing.",
      "Implement iterative sorting algorithms: bubble sort, selection sort, and insertion sort.",
      "Implement a recursive sorting algorithm: quicksort, demonstrating stack management and recursion.",
      "Implement binary search on a sorted array for efficient lookup.",
      "Write functions that follow the System V AMD64 ABI for interoperability with C code.",
      "Create a reusable array utilities library and a test program to validate functionality.",
      "Practice modular programming, linking multiple object files, and using a makefile.",
      "Compare algorithm performance and understand trade-offs (time complexity, memory usage)."
    ],
    "prerequisites": [
      "Mastery of x86-64 assembly: registers, memory, addressing modes (Chapters 1–13).",
      "Solid understanding of control flow, loops, and procedures (Chapters 8, 10).",
      "Experience with recursion and stack frames (Chapter 11).",
      "Knowledge of system calls for I/O (Chapter 16).",
      "Familiarity with modular programming and linking (Chapter 15).",
      "Basic understanding of algorithm complexity (optional but helpful)."
    ],
    "keyConcepts": [
      "Arrays are contiguous blocks of memory; elements accessed via base + index * element size.",
      "Sorting algorithms reorder array elements according to a comparison function.",
      "Bubble sort: O(n²), simple but inefficient; repeatedly swaps adjacent elements.",
      "Selection sort: O(n²), finds minimum/maximum and places it.",
      "Insertion sort: O(n²) but efficient for small or nearly sorted arrays.",
      "Quicksort: O(n log n) average, divide-and-conquer using partitioning.",
      "Binary search: O(log n) on sorted arrays, repeatedly halves search interval.",
      "Recursion uses the stack for each call; quicksort is naturally recursive.",
      "Stable vs unstable sorting: bubble, insertion stable; selection and quicksort typically unstable.",
      "In-place sorting uses O(1) extra space; quicksort uses O(log n) stack space."
    ],
    "diagramType": "project_sorting_utils",
    "sections": [
      {
        "id": "sec-30-1",
        "title": "30.1 Project Overview",
        "content": "We will build an array utilities library (arraylib.asm) containing functions for:\n\n- array_sum: sum all elements of an integer array.\n- array_min / array_max: find minimum/maximum element.\n- array_reverse: reverse array elements in place.\n- bubble_sort: sort ascending using bubble sort.\n- selection_sort: sort ascending using selection sort.\n- insertion_sort: sort ascending using insertion sort.\n- quicksort: sort ascending using recursive quicksort.\n- binary_search: search for a value in a sorted array, return index or -1.\n\nAll functions use 32-bit signed integers (int) as element type. They follow the System V AMD64 ABI:\n\n- rdi = pointer to first element (or array)\n- rsi = number of elements (or other args)\n- Return in eax (or rax for pointer/index)\n\nWe will also create:\n- arraylib.inc: header with extern declarations.\n- test_array.asm: test program that exercises the functions and prints results.\n- Makefile: automates build.\n\nClarification: The completed library uses the stated C signatures with signed 32-bit int lengths, not arbitrary 64-bit counts. len<=0 yields a no-op for mutations, zero for sum/min/max and -1 for search. Zero is an explicit empty min/max convention, not a mathematical extremum. array_sum wraps modulo 2^32; use a wider API when an exact larger sum is required."
      },
      {
        "id": "sec-30-2",
        "title": "30.2 Program Design",
        "content": ""
      },
      {
        "id": "sec-30-2-1",
        "title": "30.2.1 Data Representation",
        "content": "We use 32-bit integers (4 bytes) as array elements. The array pointer is 64-bit (rdi). Length is 64-bit (rsi) but often stored in 32-bit registers for loop counters.\n\nAccessing element i: mov eax, [rdi + rcx*4] where rcx is index.\n\nClarification: Only the low 32 bits of an int argument are meaningful. Normalize ESI before using RSI in an address. Do not assume a caller supplied a fully initialized 64-bit RSI."
      },
      {
        "id": "sec-30-2-2",
        "title": "30.2.2 Function Signatures",
        "content": "We'll define prototypes:\n\n- int array_sum(int *arr, int len); returns sum.\n- int array_min(int *arr, int len); returns min value.\n- int array_max(int *arr, int len); returns max value.\n- void array_reverse(int *arr, int len); no return.\n- void bubble_sort(int *arr, int len);\n- void selection_sort(int *arr, int len);\n- void insertion_sort(int *arr, int len);\n- void quicksort(int *arr, int len);\n- int binary_search(int *arr, int len, int target); returns index or -1.\n\nFor quicksort, we need an internal recursive routine; we'll wrap it in a non-recursive entry that sets up registers and calls the recursive partition function."
      },
      {
        "id": "sec-30-2-3",
        "title": "30.2.3 Efficiency Considerations",
        "content": "- Use pointer arithmetic instead of indexing where beneficial.\n- For bubble/selection/insertion, simple loops suffice.\n- Quicksort uses recursion; stack depth is O(log n) on average. Use a frame pointer for clarity.\n- Ensure proper register preservation (callee-saved registers) in recursive functions.\n\nClarification: The straightforward last-pivot quicksort has O(n) worst-case stack depth as well as O(n²) worst-case time. O(log n) stack is an average-case statement for this implementation, not a guarantee."
      },
      {
        "id": "sec-30-3",
        "title": "30.3 Implementation Details",
        "content": "We'll implement each function step by step."
      },
      {
        "id": "sec-30-3-1",
        "title": "30.3.1 array_sum",
        "content": "Simple loop, accumulate in eax.\n\nClarification: The source loop does not reject a negative length; the complete library does so before reading. Its explicit modular sum avoids making an unsupported promise about C signed-overflow semantics.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "30.3.1 array_sum — listing 1",
            "code": "array_sum:\n    xor eax, eax\n    xor ecx, ecx\n.loop:\n    cmp ecx, esi\n    je .done\n    add eax, [rdi + rcx*4]\n    inc ecx\n    jmp .loop\n.done:\n    ret"
          }
        ]
      },
      {
        "id": "sec-30-3-2",
        "title": "30.3.2 array_min and array_max",
        "content": "Initialize with first element, then compare and update.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "30.3.2 array_min and array_max — listing 1",
            "code": "array_min:\n    test esi, esi\n    jle .empty\n    mov eax, [rdi]\n    mov ecx, 1\n.loop:\n    cmp ecx, esi\n    je .done\n    mov edx, [rdi + rcx*4]\n    cmp edx, eax\n    jge .skip\n    mov eax, edx\n.skip:\n    inc ecx\n    jmp .loop\n.done:\n    ret\n.empty:\n    xor eax, eax\n    ret",
            "explanation": "array_max similar with jle to update."
          }
        ]
      },
      {
        "id": "sec-30-3-3",
        "title": "30.3.3 array_reverse",
        "content": "Two pointers: start and end, swap until they meet.\n\nClarification: The complete routine normalizes the length to RSI and uses unsigned pointer ordering. For 64-bit elements, both stride and load/store widths must change, as in the exercise support file.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "30.3.3 array_reverse — listing 1",
            "code": "array_reverse:\n    test esi, esi\n    jle .done\n    lea r8, [rdi]           ; left\n    lea r9, [rdi + rsi*4 - 4] ; right\n.loop:\n    cmp r8, r9\n    jge .done\n    mov eax, [r8]\n    mov edx, [r9]\n    mov [r8], edx\n    mov [r9], eax\n    add r8, 4\n    sub r9, 4\n    jmp .loop\n.done:\n    ret"
          }
        ]
      },
      {
        "id": "sec-30-3-4",
        "title": "30.3.4 bubble_sort",
        "content": "Nested loops; outer from 0 to n-1, inner from 0 to n-i-1.\n\nClarification: The first bubble-sort listing is an unfinished draft. The complete version returns before decrementing counts of one or less, including INT_MIN, and keeps each adjacent read inside the active range.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "30.3.4 bubble_sort — listing 1",
            "code": "bubble_sort:\n    ; rdi = arr, esi = n\n    mov ecx, esi            ; outer counter = n-1\n    dec ecx\n.outer:\n    test ecx, ecx\n    jle .done\n    xor edx, edx            ; inner index = 0\n.inner:\n    mov eax, edx\n    inc eax\n    cmp eax, esi            ; inner < n - outer? Actually we can compare with n-outer.\n    ; simpler: inner from 0 to ecx-1 (ecx = outer remaining)\n    ; but easier to use original n and offset.\n    ; We'll implement inner loop with index r8 from 0 to ecx-1 (since ecx = n-1-outer)\n    ; We'll need to save ecx.\n    ; I'll rewrite with proper indexes.",
            "explanation": "Better bubble sort:"
          },
          {
            "language": "nasm",
            "title": "30.3.4 bubble_sort — listing 2",
            "code": "bubble_sort:\n    ; rdi = arr, esi = n\n    mov r10d, esi           ; n\n    dec r10d                ; last index = n-1\n.outer_loop:\n    test r10d, r10d\n    jle .done\n    xor r8d, r8d            ; inner index i = 0\n.inner_loop:\n    cmp r8d, r10d\n    jge .inner_done\n    lea r9, [rdi + r8*4]    ; pointer to element i\n    mov eax, [r9]\n    mov edx, [r9+4]\n    cmp eax, edx\n    jle .no_swap\n    mov [r9], edx\n    mov [r9+4], eax\n.no_swap:\n    inc r8d\n    jmp .inner_loop\n.inner_done:\n    dec r10d\n    jmp .outer_loop\n.done:\n    ret",
            "explanation": "This uses r10d as the number of passes (or upper bound of inner loop). It sorts ascending."
          }
        ]
      },
      {
        "id": "sec-30-3-5",
        "title": "30.3.5 selection_sort",
        "content": "Find minimum in unsorted part and swap with current position.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "30.3.5 selection_sort — listing 1",
            "code": "selection_sort:\n    ; rdi = arr, esi = n\n    xor ecx, ecx            ; current index i = 0\n.outer_loop:\n    cmp ecx, esi\n    jge .done\n    mov edx, ecx            ; min_index = i\n    mov eax, [rdi + rcx*4]  ; min_value\n    mov r8d, ecx\n    inc r8d                 ; j = i+1\n.inner_loop:\n    cmp r8d, esi\n    jge .inner_done\n    mov r9d, [rdi + r8*4]\n    cmp r9d, eax\n    jge .skip\n    mov eax, r9d\n    mov edx, r8d\n.skip:\n    inc r8d\n    jmp .inner_loop\n.inner_done:\n    ; swap arr[i] and arr[min_index]\n    mov r9d, [rdi + rcx*4]  ; current value\n    mov r10d, [rdi + rdx*4] ; min value\n    mov [rdi + rcx*4], r10d\n    mov [rdi + rdx*4], r9d\n    inc ecx\n    jmp .outer_loop\n.done:\n    ret"
          }
        ]
      },
      {
        "id": "sec-30-3-6",
        "title": "30.3.6 insertion_sort",
        "content": "Start from second element, insert into sorted prefix.\n\nClarification: When EDX decrements from zero it becomes 0xFFFFFFFF, zero-extended in RDX. The source address [rdi+rdx*4+4] then points far beyond the array. Increment EDX back to the nonnegative insertion index before forming the address, as in the completed library.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "30.3.6 insertion_sort — listing 1",
            "code": "insertion_sort:\n    ; rdi = arr, esi = n\n    mov ecx, 1              ; i = 1\n.outer_loop:\n    cmp ecx, esi\n    jge .done\n    mov eax, [rdi + rcx*4]  ; key = arr[i]\n    mov edx, ecx\n    dec edx                 ; j = i-1\n.inner_loop:\n    cmp edx, 0\n    jl .inner_done\n    mov r8d, [rdi + rdx*4]  ; arr[j]\n    cmp r8d, eax\n    jle .inner_done\n    ; shift arr[j] to arr[j+1]\n    lea r9, [rdi + rdx*4]\n    mov r10d, [r9]\n    mov [r9+4], r10d\n    dec edx\n    jmp .inner_loop\n.inner_done:\n    ; insert key at j+1\n    lea r9, [rdi + rdx*4 + 4]\n    mov [r9], eax\n    inc ecx\n    jmp .outer_loop\n.done:\n    ret"
          }
        ]
      },
      {
        "id": "sec-30-3-7",
        "title": "30.3.7 quicksort",
        "content": "We'll implement a recursive quicksort. For simplicity, we'll choose the last element as pivot. Partitioning in-place using two indices.\n\nWe'll write a wrapper quicksort that calls an internal recursive function qs_rec with parameters: rdi = arr, rsi = low index, rdx = high index (inclusive). The wrapper sets low=0, high=n-1 and calls qs_rec.\n\nqs_rec:\n- If low >= high, return.\n- Partition: pivot = arr[high]; i = low - 1; for j = low to high-1: if arr[j] <= pivot, i++, swap arr[i] and arr[j]; finally swap arr[i+1] and arr[high]; pivot_index = i+1.\n- Recursively call qs_rec(low, pivot_index-1) and qs_rec(pivot_index+1, high).\n\nWe must save registers properly. Use frame pointer and callee-saved registers. We'll store low, high, pivot_index on stack.\n\nImplementation:\n\nClarification: The original recursive function pushes an odd number of registers after RBP, leaving nested calls misaligned. The completed version adds/removes an eight-byte pad and normalizes the wrapper length. It retains the simple last-pivot algorithm so its limitations remain visible; use the mergesort extension for predictable O(n log n) work.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "30.3.7 quicksort — listing 1",
            "code": "quicksort:\n    ; rdi = arr, esi = n\n    push rbp\n    mov rbp, rsp\n    ; if n <= 1, return\n    cmp esi, 1\n    jle .done\n    ; call qs_rec(arr, 0, n-1)\n    mov rdx, rsi\n    dec rdx\n    xor esi, esi\n    call qs_rec\n.done:\n    pop rbp\n    ret\n\nqs_rec:\n    ; rdi = arr, esi = low, edx = high\n    push rbp\n    mov rbp, rsp\n    push rbx\n    push r12\n    push r13\n    push r14\n    push r15\n\n    ; check base case: low >= high\n    cmp esi, edx\n    jge .return\n\n    ; We'll save low/high in callee-saved regs\n    mov r12d, esi        ; low\n    mov r13d, edx        ; high\n\n    ; Partition:\n    ; pivot = arr[high]\n    mov eax, [rdi + r13*4]   ; pivot value\n    ; i = low - 1\n    mov r14d, r12d\n    dec r14d                ; i\n    ; j = low\n    mov r15d, r12d          ; j\n.loop_j:\n    cmp r15d, r13d\n    jge .partition_done     ; j < high\n    mov ebx, [rdi + r15*4]  ; arr[j]\n    cmp ebx, eax\n    jg .not_less\n    ; if arr[j] <= pivot\n    inc r14d                ; i++\n    ; swap arr[i] and arr[j]\n    mov ecx, [rdi + r14*4]\n    mov edx, [rdi + r15*4]\n    mov [rdi + r14*4], edx\n    mov [rdi + r15*4], ecx\n.not_less:\n    inc r15d\n    jmp .loop_j\n.partition_done:\n    ; swap arr[i+1] and arr[high]\n    inc r14d                ; i+1\n    mov ecx, [rdi + r14*4]\n    mov edx, [rdi + r13*4]\n    mov [rdi + r14*4], edx\n    mov [rdi + r13*4], ecx\n    ; pivot_index = r14\n    mov r15d, r14d          ; save pivot index\n\n    ; Recursively sort left: qs_rec(arr, low, pivot-1)\n    mov edx, r15d\n    dec edx\n    mov esi, r12d\n    call qs_rec\n\n    ; Recursively sort right: qs_rec(arr, pivot+1, high)\n    mov esi, r15d\n    inc esi\n    mov edx, r13d\n    call qs_rec\n\n.return:\n    pop r15\n    pop r14\n    pop r13\n    pop r12\n    pop rbx\n    pop rbp\n    ret",
            "explanation": "This uses many callee-saved registers; we must save them. The recursive calls will also save/restore as needed. This implementation is correct but may be further optimized."
          }
        ]
      },
      {
        "id": "sec-30-3-8",
        "title": "30.3.8 binary_search",
        "content": "Assumes array sorted ascending. Return index or -1.\n\nClarification: The complete search handles nonpositive lengths before subtracting one and computes mid as low+(high-low)/2. Only EAX defines the int return; a C caller interprets 0xFFFFFFFF as -1, while assembly needing a signed 64-bit result must sign-extend EAX.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "30.3.8 binary_search — listing 1",
            "code": "binary_search:\n    ; rdi = arr, esi = len, edx = target\n    xor ecx, ecx            ; low = 0\n    mov r8d, esi\n    dec r8d                 ; high = len-1\n    mov r9d, edx            ; target\n.loop:\n    cmp ecx, r8d\n    jg .not_found\n    ; mid = (low + high) / 2\n    lea eax, [rcx + r8]\n    shr eax, 1\n    mov r10d, eax           ; mid\n    mov eax, [rdi + r10*4]  ; arr[mid]\n    cmp eax, r9d\n    je .found\n    jl .go_right            ; arr[mid] < target\n    ; go left: high = mid-1\n    lea r8d, [r10-1]\n    jmp .loop\n.go_right:\n    lea ecx, [r10+1]\n    jmp .loop\n.found:\n    mov eax, r10d\n    ret\n.not_found:\n    mov eax, -1\n    ret"
          }
        ]
      },
      {
        "id": "sec-30-4",
        "title": "30.4 Full Library Source Code",
        "content": "Create arraylib.asm with all functions. We'll add global declarations.\n\narraylib.inc:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "30.4 Full Library Source Code — listing 1",
            "code": "extern array_sum\nextern array_min\nextern array_max\nextern array_reverse\nextern bubble_sort\nextern selection_sort\nextern insertion_sort\nextern quicksort\nextern binary_search",
            "explanation": "arraylib.asm:\nWe'll include the full code from above, with proper global directives."
          },
          {
            "language": "nasm",
            "title": "Complete arraylib.asm",
            "code": "; arraylib.asm: SysV AMD64; signed int elements and int lengths.\n; len<=0: sum/min/max return 0, search returns -1, mutation is a no-op.\n; array_sum returns the low 32 bits (explicit modular sum).\ndefault rel\nsection .text\nglobal array_sum,array_min,array_max,array_reverse,bubble_sort\nglobal selection_sort,insertion_sort,quicksort,binary_search\narray_sum:\n    xor eax, eax\n    test esi,esi\n    jle .done\n    xor ecx, ecx\n.loop:\n    cmp ecx, esi\n    je .done\n    add eax, [rdi + rcx*4]\n    inc ecx\n    jmp .loop\n.done:\n    ret\n\narray_min:\n    test esi, esi\n    jle .empty\n    mov eax, [rdi]\n    mov ecx, 1\n.loop:\n    cmp ecx, esi\n    je .done\n    mov edx, [rdi + rcx*4]\n    cmp edx, eax\n    jge .skip\n    mov eax, edx\n.skip:\n    inc ecx\n    jmp .loop\n.done:\n    ret\n.empty:\n    xor eax, eax\n    ret\n\narray_max:\n    test esi, esi\n    jle .empty\n    mov eax, [rdi]\n    mov ecx, 1\n.loop:\n    cmp ecx, esi\n    je .done\n    mov edx, [rdi + rcx*4]\n    cmp edx, eax\n    jle .skip\n    mov eax, edx\n.skip:\n    inc ecx\n    jmp .loop\n.done:\n    ret\n.empty:\n    xor eax, eax\n    ret\n\narray_reverse:\n    test esi, esi\n    jle .done\n    mov esi,esi           ; normalize int length to a 64-bit index\n    lea r8, [rdi]           ; left\n    lea r9, [rdi + rsi*4 - 4] ; right\n.loop:\n    cmp r8, r9\n    jae .done\n    mov eax, [r8]\n    mov edx, [r9]\n    mov [r8], edx\n    mov [r9], eax\n    add r8, 4\n    sub r9, 4\n    jmp .loop\n.done:\n    ret\n\nbubble_sort:\n    ; rdi = arr, esi = n\n    cmp esi,1\n    jle .done\n    mov r10d, esi           ; n\n    dec r10d                ; last index = n-1\n.outer_loop:\n    test r10d, r10d\n    jle .done\n    xor r8d, r8d            ; inner index i = 0\n.inner_loop:\n    cmp r8d, r10d\n    jge .inner_done\n    lea r9, [rdi + r8*4]    ; pointer to element i\n    mov eax, [r9]\n    mov edx, [r9+4]\n    cmp eax, edx\n    jle .no_swap\n    mov [r9], edx\n    mov [r9+4], eax\n.no_swap:\n    inc r8d\n    jmp .inner_loop\n.inner_done:\n    dec r10d\n    jmp .outer_loop\n.done:\n    ret\n\nselection_sort:\n    ; rdi = arr, esi = n\n    xor ecx, ecx            ; current index i = 0\n.outer_loop:\n    cmp ecx, esi\n    jge .done\n    mov edx, ecx            ; min_index = i\n    mov eax, [rdi + rcx*4]  ; min_value\n    mov r8d, ecx\n    inc r8d                 ; j = i+1\n.inner_loop:\n    cmp r8d, esi\n    jge .inner_done\n    mov r9d, [rdi + r8*4]\n    cmp r9d, eax\n    jge .skip\n    mov eax, r9d\n    mov edx, r8d\n.skip:\n    inc r8d\n    jmp .inner_loop\n.inner_done:\n    ; swap arr[i] and arr[min_index]\n    mov r9d, [rdi + rcx*4]  ; current value\n    mov r10d, [rdi + rdx*4] ; min value\n    mov [rdi + rcx*4], r10d\n    mov [rdi + rdx*4], r9d\n    inc ecx\n    jmp .outer_loop\n.done:\n    ret\n\ninsertion_sort:\n    ; rdi = arr, esi = n\n    mov ecx, 1              ; i = 1\n.outer_loop:\n    cmp ecx, esi\n    jge .done\n    mov eax, [rdi + rcx*4]  ; key = arr[i]\n    mov edx, ecx\n    dec edx                 ; j = i-1\n.inner_loop:\n    cmp edx, 0\n    jl .inner_done\n    mov r8d, [rdi + rdx*4]  ; arr[j]\n    cmp r8d, eax\n    jle .inner_done\n    ; shift arr[j] to arr[j+1]\n    lea r9, [rdi + rdx*4]\n    mov r10d, [r9]\n    mov [r9+4], r10d\n    dec edx\n    jmp .inner_loop\n.inner_done:\n    ; insert key at j+1\n    inc edx               ; j=-1 becomes index 0 in 32 bits\n    lea r9, [rdi + rdx*4]\n    mov [r9], eax\n    inc ecx\n    jmp .outer_loop\n.done:\n    ret\n\nquicksort:\n    ; rdi = arr, esi = n\n    push rbp\n    mov rbp, rsp\n    ; if n <= 1, return\n    cmp esi, 1\n    jle .done\n    ; call qs_rec(arr, 0, n-1)\n    mov edx, esi\n    dec rdx\n    xor esi, esi\n    call qs_rec\n.done:\n    pop rbp\n    ret\n\nqs_rec:\n    ; rdi = arr, esi = low, edx = high\n    push rbp\n    mov rbp, rsp\n    push rbx\n    push r12\n    push r13\n    push r14\n    push r15\n    sub rsp,8              ; align recursive calls\n\n    ; check base case: low >= high\n    cmp esi, edx\n    jge .return\n\n    ; We'll save low/high in callee-saved regs\n    mov r12d, esi        ; low\n    mov r13d, edx        ; high\n\n    ; Partition:\n    ; pivot = arr[high]\n    mov eax, [rdi + r13*4]   ; pivot value\n    ; i = low - 1\n    mov r14d, r12d\n    dec r14d                ; i\n    ; j = low\n    mov r15d, r12d          ; j\n.loop_j:\n    cmp r15d, r13d\n    jge .partition_done     ; j < high\n    mov ebx, [rdi + r15*4]  ; arr[j]\n    cmp ebx, eax\n    jg .not_less\n    ; if arr[j] <= pivot\n    inc r14d                ; i++\n    ; swap arr[i] and arr[j]\n    mov ecx, [rdi + r14*4]\n    mov edx, [rdi + r15*4]\n    mov [rdi + r14*4], edx\n    mov [rdi + r15*4], ecx\n.not_less:\n    inc r15d\n    jmp .loop_j\n.partition_done:\n    ; swap arr[i+1] and arr[high]\n    inc r14d                ; i+1\n    mov ecx, [rdi + r14*4]\n    mov edx, [rdi + r13*4]\n    mov [rdi + r14*4], edx\n    mov [rdi + r13*4], ecx\n    ; pivot_index = r14\n    mov r15d, r14d          ; save pivot index\n\n    ; Recursively sort left: qs_rec(arr, low, pivot-1)\n    mov edx, r15d\n    dec edx\n    mov esi, r12d\n    call qs_rec\n\n    ; Recursively sort right: qs_rec(arr, pivot+1, high)\n    mov esi, r15d\n    inc esi\n    mov edx, r13d\n    call qs_rec\n\n.return:\n    add rsp,8\n    pop r15\n    pop r14\n    pop r13\n    pop r12\n    pop rbx\n    pop rbp\n    ret\n\nbinary_search:\n    ; rdi = arr, esi = len, edx = target\n    test esi,esi\n    jle .not_found\n    xor ecx, ecx            ; low = 0\n    mov r8d, esi\n    dec r8d                 ; high = len-1\n    mov r9d, edx            ; target\n.loop:\n    cmp ecx, r8d\n    jg .not_found\n    ; mid = (low + high) / 2\n    mov eax,r8d\n    sub eax,ecx\n    shr eax,1\n    add eax,ecx\n    mov r10d, eax           ; mid\n    mov eax, [rdi + r10*4]  ; arr[mid]\n    cmp eax, r9d\n    je .found\n    jl .go_right            ; arr[mid] < target\n    ; go left: high = mid-1\n    lea r8d, [r10-1]\n    jmp .loop\n.go_right:\n    lea ecx, [r10+1]\n    jmp .loop\n.found:\n    mov eax, r10d\n    ret\n.not_found:\n    mov eax, -1\n    ret\n\nsection .note.GNU-stack noalloc noexec nowrite progbits",
            "explanation": "Defines all nine exports with corrected bounds, insertion addressing and recursive-call alignment. A nonempty array must have len accessible int elements."
          }
        ]
      },
      {
        "id": "sec-30-5",
        "title": "30.5 Test Program",
        "content": "We'll create test_array.asm that exercises the functions and prints results. For simplicity, we'll use write syscall and our own itoa to print numbers. We'll define an array in .data, call each function, and print the relevant results.\n\nWe'll include a print_number function that converts an integer to string and writes it. We can reuse the itoa from Chapter 28, but we can write a simplified version that prints signed 32-bit.\n\nThe test program will:\n- Define an array: [5, 2, 9, 1, 7, 3]\n- Print original sum, min, max.\n- Reverse the array and print first element.\n- Sort using bubble_sort and print sorted array.\n- Test binary_search on sorted array.\n\nWe'll print the sorted array by iterating and printing each number separated by spaces.\n\nSince printing numbers in assembly is verbose, we'll keep the test program modest.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Complete test_array.asm",
            "code": "; test_array.asm -- assemble and link using the chapter Makefile.\n%include \"arraylib.inc\"\ndefault rel\nsection .data\na dd 5,2,9,1,7,3\nsum_msg db 'Sum: '\nsum_len equ $-sum_msg\nmin_msg db 'Min: '\nmin_len equ $-min_msg\nmax_msg db 'Max: '\nmax_len equ $-max_msg\nreverse_msg db 'Reversed first: '\nreverse_len equ $-reverse_msg\nsorted_msg db 'Sorted: '\nsorted_len equ $-sorted_msg\nsearch_msg db 'Search 7 at index: '\nsearch_len equ $-search_msg\nsection .bss\noutput resb 32\nsection .text\nglobal _start\n%macro LABEL 1\n    lea rsi,[%1_msg]\n    mov edx,%1_len\n    call print_bytes\n%endmacro\n%macro STAT 2\n    lea rdi,[a]\n    mov esi,6\n    call %2\n    movsxd r12,eax\n    LABEL %1\n    mov rax,r12\n    mov edi,10\n    call print_number\n%endmacro\n_start:\n    STAT sum,array_sum\n    STAT min,array_min\n    STAT max,array_max\n    lea rdi,[a]\n    mov esi,6\n    call array_reverse\n    LABEL reverse\n    movsxd rax,dword [a]\n    mov edi,10\n    call print_number\n    lea rdi,[a]\n    mov esi,6\n    call bubble_sort\n    LABEL sorted\n    xor r12d,r12d\n.next:\n    lea r13,[a]\n    movsxd rax,dword [r13+r12*4]\n    mov edi,' '\n    cmp r12d,5\n    jne .print\n    mov edi,10\n.print:\n    call print_number\n    inc r12d\n    cmp r12d,6\n    jb .next\n    lea rdi,[a]\n    mov esi,6\n    mov edx,7\n    call binary_search\n    movsxd r12,eax\n    LABEL search\n    mov rax,r12\n    mov edi,10\n    call print_number\n    xor edi,edi\n    mov eax,60\n    syscall\nprint_number:\n    lea rsi,[output+31]\n    mov [rsi],dil\n    mov r8,rax\n    test rax,rax\n    jns .magnitude\n    neg rax\n.magnitude:\n    mov r9d,10\n.digit:\n    xor edx,edx\n    div r9\n    add dl,'0'\n    dec rsi\n    mov [rsi],dl\n    test rax,rax\n    jnz .digit\n    test r8,r8\n    jns .length\n    dec rsi\n    mov byte [rsi],'-'\n.length:\n    lea rdx,[output+32]\n    sub rdx,rsi\nprint_bytes:\n    mov eax,1\n    mov edi,1\n    syscall\n    cmp rax,-4\n    je print_bytes\n    test rax,rax\n    jle io_error\n    add rsi,rax\n    sub rdx,rax\n    jnz print_bytes\n    ret\nio_error:\n    mov edi,1\n    mov eax,60\n    syscall\nsection .note.GNU-stack noalloc noexec nowrite progbits",
            "explanation": "Prints the exact six-line demonstration below using Linux write and exit. Includes signed integer formatting and short-write/EINTR handling; no omitted itoa routine."
          }
        ]
      },
      {
        "id": "sec-30-6",
        "title": "30.6 Build and Test",
        "content": "Create a Makefile:",
        "codeSnippets": [
          {
            "language": "make",
            "title": "30.6 Build and Test — listing 1",
            "code": "ASM = nasm\nASMFLAGS = -f elf64\nLD = ld\nTARGET = test_array\nOBJECTS = test_array.o arraylib.o\n\nall: $(TARGET)\n\n$(TARGET): $(OBJECTS)\n\t$(LD) $(OBJECTS) -o $(TARGET)\n\n%.o: %.asm\n\t$(ASM) $(ASMFLAGS) $< -o $@\n\nclean:\n\trm -f $(OBJECTS) $(TARGET)",
            "explanation": "Run make, then ./test_array.\n\nExpected output:"
          },
          {
            "language": "text",
            "title": "30.6 Build and Test — listing 2",
            "code": "Sum: 27\nMin: 1\nMax: 9\nReversed first: 3\nSorted: 1 2 3 5 7 9\nSearch 7 at index: 4"
          },
          {
            "language": "bash",
            "title": "Build extension tests",
            "code": "nasm -f elf64 arraylib.asm -o arraylib.o\nnasm -f elf64 extensions.asm -o extensions.o\ngcc -O2 -Wall -Wextra test_arrays.c arraylib.o extensions.o -o test_arrays\n./test_arrays\n# Optional, when counters are permitted:\n# perf stat -e cycles,instructions ./test_arrays",
            "explanation": "The raw-syscall demonstration still builds with the original Makefile. The extension harness links libc for allocation, reference sorting and clock measurements."
          }
        ]
      },
      {
        "id": "sec-30-7",
        "title": "30.7 Possible Extensions",
        "content": "- Implement mergesort for stable O(n log n) sorting.\n- Add heap_sort.\n- Support floating-point arrays using SSE.\n- Implement array_remove_duplicates.\n- Add array_binary_insert for sorted insertion.\n- Optimize quicksort with median-of-three pivot and insertion sort for small subarrays.\n- Implement sorting for 64-bit integers or other data types.\n\nOriginal source solution placeholder: (Provide detailed solutions for each exercise.)",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Complete extension library: extensions.asm",
            "code": "; extensions.asm: SysV AMD64; int element/length interfaces unless noted.\ndefault rel\nsection .text\nglobal array_sum_unrolled,array_reverse64,binary_search_ptr,merge_sort\nextern malloc,free\narray_sum_unrolled:\n    xor eax,eax\n    xor r8d,r8d\n    test esi,esi\n    jle .done\n    mov esi,esi\n    xor ecx,ecx\n    mov r9d,esi\n    and r9d,-4\n.loop:\n    cmp ecx,r9d\n    jae .tail\n    add eax,[rdi+rcx*4]\n    add r8d,[rdi+rcx*4+4]\n    add eax,[rdi+rcx*4+8]\n    add r8d,[rdi+rcx*4+12]\n    add ecx,4\n    jmp .loop\n.tail:\n    cmp ecx,esi\n    jae .combine\n    add eax,[rdi+rcx*4]\n    inc ecx\n    jmp .tail\n.combine:\n    add eax,r8d\n.done:\n    ret\n; void array_reverse64(int64_t *a, int n)\narray_reverse64:\n    cmp esi,1\n    jle .done\n    mov esi,esi\n    lea r8,[rdi+rsi*8-8]\n.loop:\n    cmp rdi,r8\n    jae .done\n    mov rax,[rdi]\n    mov rdx,[r8]\n    mov [rdi],rdx\n    mov [r8],rax\n    add rdi,8\n    sub r8,8\n    jmp .loop\n.done:\n    ret\nbinary_search_ptr:\n    test esi,esi\n    jle .missing\n    mov r8,rdi\n    mov esi,esi\n    lea r9,[rdi+rsi*4]      ; half-open [first,last)\n.loop:\n    cmp r8,r9\n    jae .missing\n    mov rax,r9\n    sub rax,r8\n    shr rax,3              ; half the element count\n    lea rcx,[r8+rax*4]\n    cmp [rcx],edx\n    je .found\n    jl .right\n    mov r9,rcx\n    jmp .loop\n.right:\n    lea r8,[rcx+4]\n    jmp .loop\n.found:\n    mov rax,rcx\n    sub rax,rdi\n    shr rax,2\n    ret\n.missing:\n    mov eax,-1\n    ret\n; int merge_sort(int *a,int n): 0 success, -1 allocation failure.\n; Stable bottom-up mergesort; malloc scratch avoids unbounded stack growth.\nmerge_sort:\n    cmp esi,1\n    jle .trivial\n    push rbp\n    push rbx\n    push r12\n    push r13\n    push r14\n    push r15\n    sub rsp,8\n    mov r12,rdi\n    mov r13d,esi\n    lea rdi,[r13*4]\n    call malloc wrt ..plt\n    test rax,rax\n    jz .failed\n    mov r14,rax\n    mov r15d,1\n.pass:\n    xor ebx,ebx\n.pair:\n    cmp rbx,r13\n    jae .copy_back\n    lea r8,[rbx+r15]        ; middle\n    cmp r8,r13\n    cmova r8,r13\n    lea r9,[r8+r15]         ; end\n    cmp r9,r13\n    cmova r9,r13\n    mov r10,rbx            ; left cursor\n    mov r11,r8             ; right cursor\n    mov rcx,rbx            ; output cursor\n.merge:\n    cmp rcx,r9\n    jae .next_pair\n    cmp r10,r8\n    jae .right\n    cmp r11,r9\n    jae .left\n    mov eax,[r12+r10*4]\n    cmp eax,[r12+r11*4]\n    jle .left              ; equal values come from left: stable\n.right:\n    mov eax,[r12+r11*4]\n    inc r11\n    jmp .store\n.left:\n    mov eax,[r12+r10*4]\n    inc r10\n.store:\n    mov [r14+rcx*4],eax\n    inc rcx\n    jmp .merge\n.next_pair:\n    mov rbx,r9\n    jmp .pair\n.copy_back:\n    mov rdi,r12\n    mov rsi,r14\n    mov rcx,r13\n    cld\n    rep movsd\n    shl r15,1\n    cmp r15,r13\n    jb .pass\n    mov rdi,r14\n    call free wrt ..plt\n    xor eax,eax\n    jmp .return\n.failed:\n    mov eax,-1\n.return:\n    add rsp,8\n    pop r15\n    pop r14\n    pop r13\n    pop r12\n    pop rbx\n    pop rbp\n    ret\n.trivial:\n    xor eax,eax\n    ret\nsection .note.GNU-stack noalloc noexec nowrite progbits",
            "explanation": "Adds four-way unrolled sum with two accumulators and a tail, 64-bit element reversal, pointer-interval binary search, and stable bottom-up mergesort. The malloc/free-backed scratch array avoids interfering with libc’s program break and is released before returning. Allocation failure returns -1 without modifying the input."
          },
          {
            "language": "c",
            "title": "Complete tests and timing harness: test_arrays.c",
            "code": "#define _POSIX_C_SOURCE 200809L\n#include <assert.h>\n#include <limits.h>\n#include <stdint.h>\n#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <time.h>\nextern int array_sum(int*,int),array_min(int*,int),array_max(int*,int);\nextern void array_reverse(int*,int),bubble_sort(int*,int),selection_sort(int*,int),insertion_sort(int*,int),quicksort(int*,int);\nextern int binary_search(int*,int,int),binary_search_ptr(int*,int,int),array_sum_unrolled(int*,int),merge_sort(int*,int);\nextern void array_reverse64(int64_t*,int);\nstatic int compare(const void *a,const void *b){int x=*(const int*)a,y=*(const int*)b;return (x>y)-(x<y);}\nstatic void merge_adapter(int *a,int n){assert(merge_sort(a,n)==0);}\nstatic double now(void){struct timespec t;assert(clock_gettime(CLOCK_MONOTONIC,&t)==0);return t.tv_sec+t.tv_nsec*1e-9;}\nint main(void) {\n    void (*sorts[])(int*,int)={bubble_sort,selection_sort,insertion_sort,quicksort,merge_adapter};\n    const char *names[]={\"bubble\",\"selection\",\"insertion\",\"quick\",\"merge\"};\n    int small[]={INT_MAX,-1,0,INT_MIN,4,4};\n    assert(array_min(small,6)==INT_MIN && array_max(small,6)==INT_MAX);\n    for(int n=-1;n<=6;n++) {\n        uint32_t expected=0;for(int i=0;i<n;i++)expected+=(uint32_t)small[i];\n        assert((uint32_t)array_sum(small,n)==expected);\n        assert((uint32_t)array_sum_unrolled(small,n)==expected);\n    }\n    for(int n=0;n<=64;n++) for(int pattern=0;pattern<4;pattern++) {\n        int a[64],reference[64];\n        for(int i=0;i<n;i++)reference[i]=pattern==0?i:pattern==1?-i:pattern==2?7:(i*31%17)-8;\n        for(size_t k=0;k<5;k++) {\n            memcpy(a,reference,(size_t)n*sizeof *a);\n            sorts[k](a,n);\n            for(int i=1;i<n;i++)assert(a[i-1]<=a[i]);\n        }\n        memcpy(a,reference,(size_t)n*sizeof *a);array_reverse(a,n);\n        for(int i=0;i<n;i++)assert(a[i]==reference[n-i-1]);\n    }\n    int64_t wide[]={INT64_MIN,5,INT64_MAX};array_reverse64(wide,3);\n    assert(wide[0]==INT64_MAX && wide[1]==5 && wide[2]==INT64_MIN);\n    for(int n=1000;n<=10000;n*=10) {\n        int *original=malloc((size_t)n*sizeof *original),*a=malloc((size_t)n*sizeof *a),*ref=malloc((size_t)n*sizeof *ref);\n        assert(original&&a&&ref);uint32_t state=12345;\n        for(int i=0;i<n;i++){state=state*1664525u+1013904223u;original[i]=(int)(state%200001u)-100000;}\n        memcpy(ref,original,(size_t)n*sizeof *ref);qsort(ref,(size_t)n,sizeof *ref,compare);\n        for(size_t k=0;k<5;k++) {\n            memcpy(a,original,(size_t)n*sizeof *a);double start=now();sorts[k](a,n);double elapsed=now()-start;\n            assert(!memcmp(a,ref,(size_t)n*sizeof *a));\n            printf(\"n=%d sort=%s seconds=%.6f\\n\",n,names[k],elapsed);\n        }\n        size_t checksum=0;double start=now();\n        for(int i=0;i<n;i++){int index=binary_search(a,n,original[i]);assert(index>=0&&a[index]==original[i]);checksum+=(size_t)index;}\n        printf(\"indexed search seconds=%.6f checksum=%zu\\n\",now()-start,checksum);\n        checksum=0;start=now();\n        for(int i=0;i<n;i++){int index=binary_search_ptr(a,n,original[i]);assert(index>=0&&a[index]==original[i]);checksum+=(size_t)index;}\n        printf(\"pointer search seconds=%.6f checksum=%zu\\n\",now()-start,checksum);\n        assert(binary_search(a,n,INT_MAX)==-1&&binary_search_ptr(a,n,INT_MAX)==-1);\n        for(int mode=0;mode<2;mode++) {\n            uint32_t total=0;start=now();\n            for(int j=0;j<1000;j++)total+=(uint32_t)(mode?array_sum_unrolled(a,n):array_sum(a,n));\n            printf(\"sum mode=%d seconds=%.6f checksum=%u\\n\",mode,now()-start,total);\n        }\n        free(ref);free(a);free(original);\n    }\n    puts(\"Array and sorting checks passed.\");\n}",
            "explanation": "Checks empty, sorted, reverse, equal and duplicate patterns; verifies five sorts against libc qsort on identical LCG-generated arrays of 1000 and 10000 elements; tests sums, wide reversal and searches. Timings are observations, not promised rankings."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-30-1",
        "title": "Exercise 30.1: Implement `array_sum` with Unrolling",
        "description": "Write a version of array_sum that unrolls the loop by 4 and uses two accumulators. Compare performance with the simple version using perf.",
        "solution": "#define _POSIX_C_SOURCE 200809L\n#include <assert.h>\n#include <limits.h>\n#include <stdint.h>\n#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <time.h>\nextern int array_sum(int*,int),array_min(int*,int),array_max(int*,int);\nextern void array_reverse(int*,int),bubble_sort(int*,int),selection_sort(int*,int),insertion_sort(int*,int),quicksort(int*,int);\nextern int binary_search(int*,int,int),binary_search_ptr(int*,int,int),array_sum_unrolled(int*,int),merge_sort(int*,int);\nextern void array_reverse64(int64_t*,int);\nstatic int compare(const void *a,const void *b){int x=*(const int*)a,y=*(const int*)b;return (x>y)-(x<y);}\nstatic void merge_adapter(int *a,int n){assert(merge_sort(a,n)==0);}\nstatic double now(void){struct timespec t;assert(clock_gettime(CLOCK_MONOTONIC,&t)==0);return t.tv_sec+t.tv_nsec*1e-9;}\nint main(void) {\n    void (*sorts[])(int*,int)={bubble_sort,selection_sort,insertion_sort,quicksort,merge_adapter};\n    const char *names[]={\"bubble\",\"selection\",\"insertion\",\"quick\",\"merge\"};\n    int small[]={INT_MAX,-1,0,INT_MIN,4,4};\n    assert(array_min(small,6)==INT_MIN && array_max(small,6)==INT_MAX);\n    for(int n=-1;n<=6;n++) {\n        uint32_t expected=0;for(int i=0;i<n;i++)expected+=(uint32_t)small[i];\n        assert((uint32_t)array_sum(small,n)==expected);\n        assert((uint32_t)array_sum_unrolled(small,n)==expected);\n    }\n    for(int n=0;n<=64;n++) for(int pattern=0;pattern<4;pattern++) {\n        int a[64],reference[64];\n        for(int i=0;i<n;i++)reference[i]=pattern==0?i:pattern==1?-i:pattern==2?7:(i*31%17)-8;\n        for(size_t k=0;k<5;k++) {\n            memcpy(a,reference,(size_t)n*sizeof *a);\n            sorts[k](a,n);\n            for(int i=1;i<n;i++)assert(a[i-1]<=a[i]);\n        }\n        memcpy(a,reference,(size_t)n*sizeof *a);array_reverse(a,n);\n        for(int i=0;i<n;i++)assert(a[i]==reference[n-i-1]);\n    }\n    int64_t wide[]={INT64_MIN,5,INT64_MAX};array_reverse64(wide,3);\n    assert(wide[0]==INT64_MAX && wide[1]==5 && wide[2]==INT64_MIN);\n    for(int n=1000;n<=10000;n*=10) {\n        int *original=malloc((size_t)n*sizeof *original),*a=malloc((size_t)n*sizeof *a),*ref=malloc((size_t)n*sizeof *ref);\n        assert(original&&a&&ref);uint32_t state=12345;\n        for(int i=0;i<n;i++){state=state*1664525u+1013904223u;original[i]=(int)(state%200001u)-100000;}\n        memcpy(ref,original,(size_t)n*sizeof *ref);qsort(ref,(size_t)n,sizeof *ref,compare);\n        for(size_t k=0;k<5;k++) {\n            memcpy(a,original,(size_t)n*sizeof *a);double start=now();sorts[k](a,n);double elapsed=now()-start;\n            assert(!memcmp(a,ref,(size_t)n*sizeof *a));\n            printf(\"n=%d sort=%s seconds=%.6f\\n\",n,names[k],elapsed);\n        }\n        size_t checksum=0;double start=now();\n        for(int i=0;i<n;i++){int index=binary_search(a,n,original[i]);assert(index>=0&&a[index]==original[i]);checksum+=(size_t)index;}\n        printf(\"indexed search seconds=%.6f checksum=%zu\\n\",now()-start,checksum);\n        checksum=0;start=now();\n        for(int i=0;i<n;i++){int index=binary_search_ptr(a,n,original[i]);assert(index>=0&&a[index]==original[i]);checksum+=(size_t)index;}\n        printf(\"pointer search seconds=%.6f checksum=%zu\\n\",now()-start,checksum);\n        assert(binary_search(a,n,INT_MAX)==-1&&binary_search_ptr(a,n,INT_MAX)==-1);\n        for(int mode=0;mode<2;mode++) {\n            uint32_t total=0;start=now();\n            for(int j=0;j<1000;j++)total+=(uint32_t)(mode?array_sum_unrolled(a,n):array_sum(a,n));\n            printf(\"sum mode=%d seconds=%.6f checksum=%u\\n\",mode,now()-start,total);\n        }\n        free(ref);free(a);free(original);\n    }\n    puts(\"Array and sorting checks passed.\");\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "Use the full corresponding routine in extensions.asm and the C build commands in section 30.6. This complete shared harness checks results before comparing timings. Each sort receives a fresh copy of the same input; duplicate searches may return different valid matching indices. array_sum_unrolled processes groups of four with EAX/R8D accumulators, then a scalar tail. Both implementations use the same modulo-2^32 contract. The harness checks lengths -1 through 6 and times both sums; performance counters are optional."
      },
      {
        "id": "ex-30-2",
        "title": "Exercise 30.2: Add `array_reverse` for 64-bit elements",
        "description": "Modify array_reverse to work on an array of 64-bit integers (long). Adjust offsets and element size.",
        "solution": "#define _POSIX_C_SOURCE 200809L\n#include <assert.h>\n#include <limits.h>\n#include <stdint.h>\n#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <time.h>\nextern int array_sum(int*,int),array_min(int*,int),array_max(int*,int);\nextern void array_reverse(int*,int),bubble_sort(int*,int),selection_sort(int*,int),insertion_sort(int*,int),quicksort(int*,int);\nextern int binary_search(int*,int,int),binary_search_ptr(int*,int,int),array_sum_unrolled(int*,int),merge_sort(int*,int);\nextern void array_reverse64(int64_t*,int);\nstatic int compare(const void *a,const void *b){int x=*(const int*)a,y=*(const int*)b;return (x>y)-(x<y);}\nstatic void merge_adapter(int *a,int n){assert(merge_sort(a,n)==0);}\nstatic double now(void){struct timespec t;assert(clock_gettime(CLOCK_MONOTONIC,&t)==0);return t.tv_sec+t.tv_nsec*1e-9;}\nint main(void) {\n    void (*sorts[])(int*,int)={bubble_sort,selection_sort,insertion_sort,quicksort,merge_adapter};\n    const char *names[]={\"bubble\",\"selection\",\"insertion\",\"quick\",\"merge\"};\n    int small[]={INT_MAX,-1,0,INT_MIN,4,4};\n    assert(array_min(small,6)==INT_MIN && array_max(small,6)==INT_MAX);\n    for(int n=-1;n<=6;n++) {\n        uint32_t expected=0;for(int i=0;i<n;i++)expected+=(uint32_t)small[i];\n        assert((uint32_t)array_sum(small,n)==expected);\n        assert((uint32_t)array_sum_unrolled(small,n)==expected);\n    }\n    for(int n=0;n<=64;n++) for(int pattern=0;pattern<4;pattern++) {\n        int a[64],reference[64];\n        for(int i=0;i<n;i++)reference[i]=pattern==0?i:pattern==1?-i:pattern==2?7:(i*31%17)-8;\n        for(size_t k=0;k<5;k++) {\n            memcpy(a,reference,(size_t)n*sizeof *a);\n            sorts[k](a,n);\n            for(int i=1;i<n;i++)assert(a[i-1]<=a[i]);\n        }\n        memcpy(a,reference,(size_t)n*sizeof *a);array_reverse(a,n);\n        for(int i=0;i<n;i++)assert(a[i]==reference[n-i-1]);\n    }\n    int64_t wide[]={INT64_MIN,5,INT64_MAX};array_reverse64(wide,3);\n    assert(wide[0]==INT64_MAX && wide[1]==5 && wide[2]==INT64_MIN);\n    for(int n=1000;n<=10000;n*=10) {\n        int *original=malloc((size_t)n*sizeof *original),*a=malloc((size_t)n*sizeof *a),*ref=malloc((size_t)n*sizeof *ref);\n        assert(original&&a&&ref);uint32_t state=12345;\n        for(int i=0;i<n;i++){state=state*1664525u+1013904223u;original[i]=(int)(state%200001u)-100000;}\n        memcpy(ref,original,(size_t)n*sizeof *ref);qsort(ref,(size_t)n,sizeof *ref,compare);\n        for(size_t k=0;k<5;k++) {\n            memcpy(a,original,(size_t)n*sizeof *a);double start=now();sorts[k](a,n);double elapsed=now()-start;\n            assert(!memcmp(a,ref,(size_t)n*sizeof *a));\n            printf(\"n=%d sort=%s seconds=%.6f\\n\",n,names[k],elapsed);\n        }\n        size_t checksum=0;double start=now();\n        for(int i=0;i<n;i++){int index=binary_search(a,n,original[i]);assert(index>=0&&a[index]==original[i]);checksum+=(size_t)index;}\n        printf(\"indexed search seconds=%.6f checksum=%zu\\n\",now()-start,checksum);\n        checksum=0;start=now();\n        for(int i=0;i<n;i++){int index=binary_search_ptr(a,n,original[i]);assert(index>=0&&a[index]==original[i]);checksum+=(size_t)index;}\n        printf(\"pointer search seconds=%.6f checksum=%zu\\n\",now()-start,checksum);\n        assert(binary_search(a,n,INT_MAX)==-1&&binary_search_ptr(a,n,INT_MAX)==-1);\n        for(int mode=0;mode<2;mode++) {\n            uint32_t total=0;start=now();\n            for(int j=0;j<1000;j++)total+=(uint32_t)(mode?array_sum_unrolled(a,n):array_sum(a,n));\n            printf(\"sum mode=%d seconds=%.6f checksum=%u\\n\",mode,now()-start,total);\n        }\n        free(ref);free(a);free(original);\n    }\n    puts(\"Array and sorting checks passed.\");\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "Use the full corresponding routine in extensions.asm and the C build commands in section 30.6. This complete shared harness checks results before comparing timings. Each sort receives a fresh copy of the same input; duplicate searches may return different valid matching indices. array_reverse64 uses eight-byte strides and qword loads/stores. The harness includes INT64_MIN and INT64_MAX; on SysV AMD64 Linux, long is 64 bits, while int64_t states the width explicitly."
      },
      {
        "id": "ex-30-3",
        "title": "Exercise 30.3: Implement `mergesort`",
        "description": "Implement mergesort as an additional sorting algorithm. It requires a temporary array for merging. Use the stack or allocate memory with brk.",
        "solution": "#define _POSIX_C_SOURCE 200809L\n#include <assert.h>\n#include <limits.h>\n#include <stdint.h>\n#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <time.h>\nextern int array_sum(int*,int),array_min(int*,int),array_max(int*,int);\nextern void array_reverse(int*,int),bubble_sort(int*,int),selection_sort(int*,int),insertion_sort(int*,int),quicksort(int*,int);\nextern int binary_search(int*,int,int),binary_search_ptr(int*,int,int),array_sum_unrolled(int*,int),merge_sort(int*,int);\nextern void array_reverse64(int64_t*,int);\nstatic int compare(const void *a,const void *b){int x=*(const int*)a,y=*(const int*)b;return (x>y)-(x<y);}\nstatic void merge_adapter(int *a,int n){assert(merge_sort(a,n)==0);}\nstatic double now(void){struct timespec t;assert(clock_gettime(CLOCK_MONOTONIC,&t)==0);return t.tv_sec+t.tv_nsec*1e-9;}\nint main(void) {\n    void (*sorts[])(int*,int)={bubble_sort,selection_sort,insertion_sort,quicksort,merge_adapter};\n    const char *names[]={\"bubble\",\"selection\",\"insertion\",\"quick\",\"merge\"};\n    int small[]={INT_MAX,-1,0,INT_MIN,4,4};\n    assert(array_min(small,6)==INT_MIN && array_max(small,6)==INT_MAX);\n    for(int n=-1;n<=6;n++) {\n        uint32_t expected=0;for(int i=0;i<n;i++)expected+=(uint32_t)small[i];\n        assert((uint32_t)array_sum(small,n)==expected);\n        assert((uint32_t)array_sum_unrolled(small,n)==expected);\n    }\n    for(int n=0;n<=64;n++) for(int pattern=0;pattern<4;pattern++) {\n        int a[64],reference[64];\n        for(int i=0;i<n;i++)reference[i]=pattern==0?i:pattern==1?-i:pattern==2?7:(i*31%17)-8;\n        for(size_t k=0;k<5;k++) {\n            memcpy(a,reference,(size_t)n*sizeof *a);\n            sorts[k](a,n);\n            for(int i=1;i<n;i++)assert(a[i-1]<=a[i]);\n        }\n        memcpy(a,reference,(size_t)n*sizeof *a);array_reverse(a,n);\n        for(int i=0;i<n;i++)assert(a[i]==reference[n-i-1]);\n    }\n    int64_t wide[]={INT64_MIN,5,INT64_MAX};array_reverse64(wide,3);\n    assert(wide[0]==INT64_MAX && wide[1]==5 && wide[2]==INT64_MIN);\n    for(int n=1000;n<=10000;n*=10) {\n        int *original=malloc((size_t)n*sizeof *original),*a=malloc((size_t)n*sizeof *a),*ref=malloc((size_t)n*sizeof *ref);\n        assert(original&&a&&ref);uint32_t state=12345;\n        for(int i=0;i<n;i++){state=state*1664525u+1013904223u;original[i]=(int)(state%200001u)-100000;}\n        memcpy(ref,original,(size_t)n*sizeof *ref);qsort(ref,(size_t)n,sizeof *ref,compare);\n        for(size_t k=0;k<5;k++) {\n            memcpy(a,original,(size_t)n*sizeof *a);double start=now();sorts[k](a,n);double elapsed=now()-start;\n            assert(!memcmp(a,ref,(size_t)n*sizeof *a));\n            printf(\"n=%d sort=%s seconds=%.6f\\n\",n,names[k],elapsed);\n        }\n        size_t checksum=0;double start=now();\n        for(int i=0;i<n;i++){int index=binary_search(a,n,original[i]);assert(index>=0&&a[index]==original[i]);checksum+=(size_t)index;}\n        printf(\"indexed search seconds=%.6f checksum=%zu\\n\",now()-start,checksum);\n        checksum=0;start=now();\n        for(int i=0;i<n;i++){int index=binary_search_ptr(a,n,original[i]);assert(index>=0&&a[index]==original[i]);checksum+=(size_t)index;}\n        printf(\"pointer search seconds=%.6f checksum=%zu\\n\",now()-start,checksum);\n        assert(binary_search(a,n,INT_MAX)==-1&&binary_search_ptr(a,n,INT_MAX)==-1);\n        for(int mode=0;mode<2;mode++) {\n            uint32_t total=0;start=now();\n            for(int j=0;j<1000;j++)total+=(uint32_t)(mode?array_sum_unrolled(a,n):array_sum(a,n));\n            printf(\"sum mode=%d seconds=%.6f checksum=%u\\n\",mode,now()-start,total);\n        }\n        free(ref);free(a);free(original);\n    }\n    puts(\"Array and sorting checks passed.\");\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "Use the full corresponding routine in extensions.asm and the C build commands in section 30.6. This complete shared harness checks results before comparing timings. Each sort receives a fresh copy of the same input; duplicate searches may return different valid matching indices. merge_sort uses bottom-up runs and caller-visible allocation failure rather than deep recursion or an unbounded stack allocation. Each pass merges into scratch and copies back; equal values come from the left run. Memory cost is O(n). The exercise’s brk suggestion is replaced by malloc/free for compatibility with this C-linked library."
      },
      {
        "id": "ex-30-4",
        "title": "Exercise 30.4: Optimize Binary Search",
        "description": "Rewrite binary_search to use pointer arithmetic instead of index calculation. Which is faster? Benchmark.",
        "solution": "#define _POSIX_C_SOURCE 200809L\n#include <assert.h>\n#include <limits.h>\n#include <stdint.h>\n#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <time.h>\nextern int array_sum(int*,int),array_min(int*,int),array_max(int*,int);\nextern void array_reverse(int*,int),bubble_sort(int*,int),selection_sort(int*,int),insertion_sort(int*,int),quicksort(int*,int);\nextern int binary_search(int*,int,int),binary_search_ptr(int*,int,int),array_sum_unrolled(int*,int),merge_sort(int*,int);\nextern void array_reverse64(int64_t*,int);\nstatic int compare(const void *a,const void *b){int x=*(const int*)a,y=*(const int*)b;return (x>y)-(x<y);}\nstatic void merge_adapter(int *a,int n){assert(merge_sort(a,n)==0);}\nstatic double now(void){struct timespec t;assert(clock_gettime(CLOCK_MONOTONIC,&t)==0);return t.tv_sec+t.tv_nsec*1e-9;}\nint main(void) {\n    void (*sorts[])(int*,int)={bubble_sort,selection_sort,insertion_sort,quicksort,merge_adapter};\n    const char *names[]={\"bubble\",\"selection\",\"insertion\",\"quick\",\"merge\"};\n    int small[]={INT_MAX,-1,0,INT_MIN,4,4};\n    assert(array_min(small,6)==INT_MIN && array_max(small,6)==INT_MAX);\n    for(int n=-1;n<=6;n++) {\n        uint32_t expected=0;for(int i=0;i<n;i++)expected+=(uint32_t)small[i];\n        assert((uint32_t)array_sum(small,n)==expected);\n        assert((uint32_t)array_sum_unrolled(small,n)==expected);\n    }\n    for(int n=0;n<=64;n++) for(int pattern=0;pattern<4;pattern++) {\n        int a[64],reference[64];\n        for(int i=0;i<n;i++)reference[i]=pattern==0?i:pattern==1?-i:pattern==2?7:(i*31%17)-8;\n        for(size_t k=0;k<5;k++) {\n            memcpy(a,reference,(size_t)n*sizeof *a);\n            sorts[k](a,n);\n            for(int i=1;i<n;i++)assert(a[i-1]<=a[i]);\n        }\n        memcpy(a,reference,(size_t)n*sizeof *a);array_reverse(a,n);\n        for(int i=0;i<n;i++)assert(a[i]==reference[n-i-1]);\n    }\n    int64_t wide[]={INT64_MIN,5,INT64_MAX};array_reverse64(wide,3);\n    assert(wide[0]==INT64_MAX && wide[1]==5 && wide[2]==INT64_MIN);\n    for(int n=1000;n<=10000;n*=10) {\n        int *original=malloc((size_t)n*sizeof *original),*a=malloc((size_t)n*sizeof *a),*ref=malloc((size_t)n*sizeof *ref);\n        assert(original&&a&&ref);uint32_t state=12345;\n        for(int i=0;i<n;i++){state=state*1664525u+1013904223u;original[i]=(int)(state%200001u)-100000;}\n        memcpy(ref,original,(size_t)n*sizeof *ref);qsort(ref,(size_t)n,sizeof *ref,compare);\n        for(size_t k=0;k<5;k++) {\n            memcpy(a,original,(size_t)n*sizeof *a);double start=now();sorts[k](a,n);double elapsed=now()-start;\n            assert(!memcmp(a,ref,(size_t)n*sizeof *a));\n            printf(\"n=%d sort=%s seconds=%.6f\\n\",n,names[k],elapsed);\n        }\n        size_t checksum=0;double start=now();\n        for(int i=0;i<n;i++){int index=binary_search(a,n,original[i]);assert(index>=0&&a[index]==original[i]);checksum+=(size_t)index;}\n        printf(\"indexed search seconds=%.6f checksum=%zu\\n\",now()-start,checksum);\n        checksum=0;start=now();\n        for(int i=0;i<n;i++){int index=binary_search_ptr(a,n,original[i]);assert(index>=0&&a[index]==original[i]);checksum+=(size_t)index;}\n        printf(\"pointer search seconds=%.6f checksum=%zu\\n\",now()-start,checksum);\n        assert(binary_search(a,n,INT_MAX)==-1&&binary_search_ptr(a,n,INT_MAX)==-1);\n        for(int mode=0;mode<2;mode++) {\n            uint32_t total=0;start=now();\n            for(int j=0;j<1000;j++)total+=(uint32_t)(mode?array_sum_unrolled(a,n):array_sum(a,n));\n            printf(\"sum mode=%d seconds=%.6f checksum=%u\\n\",mode,now()-start,total);\n        }\n        free(ref);free(a);free(original);\n    }\n    puts(\"Array and sorting checks passed.\");\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "Use the full corresponding routine in extensions.asm and the C build commands in section 30.6. This complete shared harness checks results before comparing timings. Each sort receives a fresh copy of the same input; duplicate searches may return different valid matching indices. binary_search_ptr maintains a half-open pointer interval and calculates a midpoint from its byte span; the result is converted back to an element index. The harness measures both searches separately and verifies membership, without assuming either version is universally faster."
      },
      {
        "id": "ex-30-5",
        "title": "Exercise 30.5: Test Sorting Algorithms",
        "description": "Create a test program that generates an array of random numbers (use a simple LCG) and verifies that each sorting algorithm correctly sorts. Compare execution times for n=1000, 10000.",
        "solution": "#define _POSIX_C_SOURCE 200809L\n#include <assert.h>\n#include <limits.h>\n#include <stdint.h>\n#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <time.h>\nextern int array_sum(int*,int),array_min(int*,int),array_max(int*,int);\nextern void array_reverse(int*,int),bubble_sort(int*,int),selection_sort(int*,int),insertion_sort(int*,int),quicksort(int*,int);\nextern int binary_search(int*,int,int),binary_search_ptr(int*,int,int),array_sum_unrolled(int*,int),merge_sort(int*,int);\nextern void array_reverse64(int64_t*,int);\nstatic int compare(const void *a,const void *b){int x=*(const int*)a,y=*(const int*)b;return (x>y)-(x<y);}\nstatic void merge_adapter(int *a,int n){assert(merge_sort(a,n)==0);}\nstatic double now(void){struct timespec t;assert(clock_gettime(CLOCK_MONOTONIC,&t)==0);return t.tv_sec+t.tv_nsec*1e-9;}\nint main(void) {\n    void (*sorts[])(int*,int)={bubble_sort,selection_sort,insertion_sort,quicksort,merge_adapter};\n    const char *names[]={\"bubble\",\"selection\",\"insertion\",\"quick\",\"merge\"};\n    int small[]={INT_MAX,-1,0,INT_MIN,4,4};\n    assert(array_min(small,6)==INT_MIN && array_max(small,6)==INT_MAX);\n    for(int n=-1;n<=6;n++) {\n        uint32_t expected=0;for(int i=0;i<n;i++)expected+=(uint32_t)small[i];\n        assert((uint32_t)array_sum(small,n)==expected);\n        assert((uint32_t)array_sum_unrolled(small,n)==expected);\n    }\n    for(int n=0;n<=64;n++) for(int pattern=0;pattern<4;pattern++) {\n        int a[64],reference[64];\n        for(int i=0;i<n;i++)reference[i]=pattern==0?i:pattern==1?-i:pattern==2?7:(i*31%17)-8;\n        for(size_t k=0;k<5;k++) {\n            memcpy(a,reference,(size_t)n*sizeof *a);\n            sorts[k](a,n);\n            for(int i=1;i<n;i++)assert(a[i-1]<=a[i]);\n        }\n        memcpy(a,reference,(size_t)n*sizeof *a);array_reverse(a,n);\n        for(int i=0;i<n;i++)assert(a[i]==reference[n-i-1]);\n    }\n    int64_t wide[]={INT64_MIN,5,INT64_MAX};array_reverse64(wide,3);\n    assert(wide[0]==INT64_MAX && wide[1]==5 && wide[2]==INT64_MIN);\n    for(int n=1000;n<=10000;n*=10) {\n        int *original=malloc((size_t)n*sizeof *original),*a=malloc((size_t)n*sizeof *a),*ref=malloc((size_t)n*sizeof *ref);\n        assert(original&&a&&ref);uint32_t state=12345;\n        for(int i=0;i<n;i++){state=state*1664525u+1013904223u;original[i]=(int)(state%200001u)-100000;}\n        memcpy(ref,original,(size_t)n*sizeof *ref);qsort(ref,(size_t)n,sizeof *ref,compare);\n        for(size_t k=0;k<5;k++) {\n            memcpy(a,original,(size_t)n*sizeof *a);double start=now();sorts[k](a,n);double elapsed=now()-start;\n            assert(!memcmp(a,ref,(size_t)n*sizeof *a));\n            printf(\"n=%d sort=%s seconds=%.6f\\n\",n,names[k],elapsed);\n        }\n        size_t checksum=0;double start=now();\n        for(int i=0;i<n;i++){int index=binary_search(a,n,original[i]);assert(index>=0&&a[index]==original[i]);checksum+=(size_t)index;}\n        printf(\"indexed search seconds=%.6f checksum=%zu\\n\",now()-start,checksum);\n        checksum=0;start=now();\n        for(int i=0;i<n;i++){int index=binary_search_ptr(a,n,original[i]);assert(index>=0&&a[index]==original[i]);checksum+=(size_t)index;}\n        printf(\"pointer search seconds=%.6f checksum=%zu\\n\",now()-start,checksum);\n        assert(binary_search(a,n,INT_MAX)==-1&&binary_search_ptr(a,n,INT_MAX)==-1);\n        for(int mode=0;mode<2;mode++) {\n            uint32_t total=0;start=now();\n            for(int j=0;j<1000;j++)total+=(uint32_t)(mode?array_sum_unrolled(a,n):array_sum(a,n));\n            printf(\"sum mode=%d seconds=%.6f checksum=%u\\n\",mode,now()-start,total);\n        }\n        free(ref);free(a);free(original);\n    }\n    puts(\"Array and sorting checks passed.\");\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "Use the full corresponding routine in extensions.asm and the C build commands in section 30.6. This complete shared harness checks results before comparing timings. Each sort receives a fresh copy of the same input; duplicate searches may return different valid matching indices. The LCG uses uint32_t wraparound and a fixed seed for repeatability. qsort provides a full reference permutation, so merely producing a nondecreasing but corrupted array cannot pass the large-array tests. Compare repeated timing runs on the intended machine."
      }
    ],
    "practiceQuestions": [
      {
        "question": "How do you compute the address of the i-th element in an array of 32-bit integers? Show the assembly.",
        "answer": "For int elements, address = base + i*4. With base in RDI and nonnegative index in RCX: mov eax,[rdi+rcx*4]. Validate the index and normalize its width before forming an address."
      },
      {
        "question": "Explain the difference between stable and unstable sorting algorithms. Give examples.",
        "answer": "A stable sort preserves the input order of records with equal keys. Bubble and insertion are stable when they move only strictly out-of-order values; the shown selection and quicksort swaps are not. Stable mergesort chooses the left element on ties."
      },
      {
        "question": "Describe the partitioning step in quicksort. What is the role of the pivot?",
        "answer": "With the last element as pivot, scan the other elements and grow a prefix containing values no greater than the pivot. Swap the pivot immediately after that prefix, then sort both sides. The partition establishes ordering around the pivot, not complete ordering within each side."
      },
      {
        "question": "Why is quicksort's average time complexity O(n log n)? What causes the worst-case O(n²)?",
        "answer": "Balanced partitions give logarithmic depth with linear partition work per level. Repeatedly selecting an extreme pivot creates one nearly full subproblem, producing quadratic work. Sorted, reverse-sorted and all-equal data can trigger this in the simple last-pivot version."
      },
      {
        "question": "How does binary search work? What are the preconditions?",
        "answer": "Binary search compares a target with a midpoint and discards the half that cannot contain it. It requires ascending order under the same comparison and valid bounds. Empty input returns -1; duplicate matches may return any matching index."
      },
      {
        "question": "In insertion sort, why is it efficient for nearly sorted arrays?",
        "answer": "Insertion sort shifts elements only while they exceed the key. A nearly sorted input has few inversions and therefore few shifts; an already sorted array needs a linear scan."
      },
      {
        "question": "How would you modify the sorting algorithms to sort in descending order?",
        "answer": "Reverse signed value comparisons while preserving index/bounds comparisons. For example bubble swaps when left<right rather than left>right. Update the binary-search ordering too if it will search descending output."
      },
      {
        "question": "What are the advantages and disadvantages of bubble sort compared to insertion sort?",
        "answer": "Bubble sort is simple and stable but typically makes many comparisons and swaps. An early-exit flag improves its best case. Insertion sort usually moves less data and performs well on short or nearly sorted arrays; both have quadratic worst cases."
      },
      {
        "question": "How does recursion in quicksort affect stack usage? How can you reduce it?",
        "answer": "The straightforward recursive version uses logarithmic stack on average and linear stack in the worst case. Recurse only on the smaller partition and loop over the larger one to bound stack depth; introsort can also switch algorithms after excessive partition depth."
      },
      {
        "question": "If you needed to sort a very large array that doesn't fit in memory, which sorting algorithm would you choose? Why?",
        "answer": "Use external merge sorting: sort memory-sized runs, write them to storage, then merge runs using bounded buffers. Its mostly sequential I/O suits data larger than memory; account for temporary storage and failure recovery."
      }
    ],
    "summary": [
      "Array manipulation in assembly requires careful pointer arithmetic and loop control.",
      "Sorting algorithms illustrate different trade-offs between time complexity, stability, and memory usage.",
      "Bubble sort, selection sort, insertion sort are O(n²) but simple to implement.",
      "Quicksort is O(n log n) average, uses recursion and partitioning.",
      "Binary search is O(log n) and requires sorted array.",
      "Modular design with header files and separate compilation enables reusable libraries.",
      "Performance can be improved with loop unrolling, better algorithms, and optimized code."
    ]
  },
  {
    "id": 31,
    "slug": "chapter-31-project-4-file-io-custom-memory-routines",
    "level": 6,
    "levelTitle": "Advanced Projects",
    "title": "Chapter 31: Project 4: File I/O and Custom Memory Routines",
    "subtitle": "Dynamic Memory Allocator (malloc, free, calloc) & File I/O Wrapper",
    "learningObjectives": [
      "Apply system calls to implement file I/O operations in assembly: open, close, read, write, lseek.",
      "Build a custom dynamic memory allocator (malloc/free) using the brk system call.",
      "Manage a free list of memory blocks with headers containing size and next pointer.",
      "Implement memory allocation strategies: first-fit, splitting, and coalescing.",
      "Handle file and memory errors gracefully.",
      "Write a reusable library (fileio.asm, allocator.asm) and a test program.",
      "Use modular programming, header files, and a Makefile for building.",
      "Understand how memory allocators work internally and how system calls interact with the heap."
    ],
    "prerequisites": [
      "Solid understanding of system calls, file descriptors, and I/O (Chapter 16).",
      "Mastery of memory addressing, pointers, and structures (Chapters 3, 9, 13).",
      "Knowledge of modular programming and linking (Chapter 15).",
      "Experience with procedures, calling conventions, and stack frames (Chapter 10).",
      "Familiarity with arrays and string manipulation (Chapters 9, 29)."
    ],
    "keyConcepts": [
      "File descriptors are small integers representing open files (0=stdin, 1=stdout, 2=stderr).",
      "open, read, write, lseek, close are the primary syscalls for file I/O.",
      "brk adjusts the program break (end of data segment) to allocate or release heap memory.",
      "Free list is a linked list of free memory blocks; each block has a header with size and next pointer.",
      "First-fit allocation selects the first free block large enough to satisfy a request.",
      "Splitting divides a larger free block into two when the requested size is smaller.",
      "Coalescing merges adjacent free blocks when memory is freed to reduce fragmentation.",
      "Alignment ensures returned pointers are 16-byte aligned, as required by the ABI.",
      "Block header stores metadata (size, next pointer, free status) just before the user data.",
      "Error handling returns negative values or null pointers and sets an error code (if applicable)."
    ],
    "diagramType": "project_allocator",
    "sections": [
      {
        "id": "sec-31-1",
        "title": "31.1 Project Overview",
        "content": "We will build two libraries and a test program:\n\n1. File I/O library (fileio.asm): Wraps system calls into convenient functions.\n   - open_file(path, flags, mode) -> fd\n   - close_file(fd) -> 0\n   - read_file(fd, buffer, count) -> bytes read\n   - write_file(fd, buffer, count) -> bytes written\n   - lseek_file(fd, offset, whence) -> new offset\n   - get_file_size(path) -> size\n   - copy_file(src_path, dst_path) -> 0\n\n2. Memory allocator (allocator.asm): Implements a simple malloc/free.\n   - malloc(size) -> pointer or 0\n   - free(ptr)\n   - calloc(num, size) -> pointer or 0\n   - realloc(ptr, size) -> pointer or 0\n\n3. Test program (test_project.asm): Exercises file I/O (create, write, read, copy) and memory allocation (allocate, write, free, reallocate).\n\nAll functions follow the System V AMD64 ABI. We'll use 64-bit sizes for file offsets and memory sizes."
      },
      {
        "id": "sec-31-2",
        "title": "31.2 File I/O Library Design",
        "content": ""
      },
      {
        "id": "sec-31-2-1",
        "title": "31.2.1 System Call Wrap",
        "content": "Each function sets up the syscall number in rax and arguments in registers, then executes syscall. On error (negative return), we return -1 and optionally set a global error variable (we'll skip for simplicity). The functions mirror the C library's open, read, etc., but without buffering.\n\nClarification: The original wrappers actually return raw -errno, despite promising -1. The completed fileio.asm normalizes errors consistently, retries interrupted reads/writes, and documents that successful read/write counts may still be short. It does not provide libc errno."
      },
      {
        "id": "sec-31-2-2",
        "title": "31.2.2 Function Signatures",
        "content": "- int open_file(const char *path, int flags, int mode);\n- int close_file(int fd);\n- ssize_t read_file(int fd, void *buf, size_t count);\n- ssize_t write_file(int fd, const void *buf, size_t count);\n- off_t lseek_file(int fd, off_t offset, int whence);\n- off_t get_file_size(const char *path);\n- int copy_file(const char *src, const char *dst);\n\nFlags and modes are passed as integers. We'll define common constants in fileio.inc."
      },
      {
        "id": "sec-31-2-3",
        "title": "31.2.3 Implementation of copy_file",
        "content": "copy_file uses a buffer (e.g., 4096 bytes) allocated on the stack (or static buffer) to read from source and write to destination until EOF."
      },
      {
        "id": "sec-31-3",
        "title": "31.3 Memory Allocator Design",
        "content": ""
      },
      {
        "id": "sec-31-3-1",
        "title": "31.3.1 Heap Management with brk",
        "content": "The brk system call sets the program break (end of data segment). The initial break is the end of the BSS section. We can call brk(0) to get the current break, and brk(new_addr) to increase or decrease it. We manage a free list of blocks carved out of this region.\n\nClarification: Query the actual break; do not assume it equals the BSS end. Address-space layout can include a gap. Raw brk success is determined by comparing its return with the requested address."
      },
      {
        "id": "sec-31-3-2",
        "title": "31.3.2 Block Header",
        "content": "Each block, whether allocated or free, begins with a header:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "31.3.2 Block Header — listing 1",
            "code": "struc Block\n    .size: resq 1      ; size of user data (not including header)\n    .next: resq 1      ; pointer to next block in free list (only meaningful if free)\nendstruc\nBLOCK_HEADER_SIZE equ 16",
            "explanation": "The header is 16 bytes (2 qwords), aligned to 16. User data starts immediately after the header. We'll ensure all returned pointers are 16-byte aligned by aligning the total block size (header + user size) to 16."
          }
        ]
      },
      {
        "id": "sec-31-3-3",
        "title": "31.3.3 Free List",
        "content": "A singly linked list of free blocks. Initially, the free list is empty. When we need memory, we call brk to extend the heap by a large chunk (e.g., page size), and create a new free block from that chunk, adding it to the free list.\n\nmalloc uses first-fit: traverse the free list, find the first block with size >= requested size. If found, we may split the block: take the needed portion, and the remainder becomes a new free block. If no block is large enough, we extend the heap via brk to create a new block.\n\nfree adds the block back to the free list. We also attempt to coalesce adjacent free blocks to reduce fragmentation. To coalesce, we need to know if the next block is free. Since blocks are contiguous, we can compute the next block's address as ptr + BLOCK_HEADER_SIZE + size. We'll check if that block is free by comparing its address with entries in the free list? That's O(n). Simpler: we'll store a magic number in the header to identify blocks, and after freeing, we can check if the next block (by address) is free by looking at its header's next? Not reliable. For simplicity, we'll skip coalescing in this project; it's an optional extension.\n\nClarification: The complete allocator below includes the coalescing exercise: maintain an address-sorted free list and merge physically adjacent successor and predecessor blocks. A nonzero next pointer is not a reliable allocated/free marker. This implementation is single-threaded and requires exclusive ownership of brk."
      },
      {
        "id": "sec-31-3-4",
        "title": "31.3.4 Allocator Functions",
        "content": "- malloc(size): align size up to 16. Search free list for a block. If found, remove from free list, split if remaining size >= BLOCK_HEADER_SIZE + 16 (minimum block size). Return pointer to user data. If not found, call brk to allocate a new chunk of at least size + BLOCK_HEADER_SIZE, create a free block, add to free list, then allocate from it.\n- free(ptr): compute block address as ptr - BLOCK_HEADER_SIZE. Add block to free list. Optionally coalesce.\n- calloc(num, size): call malloc(num*size), then zero the memory using memset or rep stosb.\n- realloc(ptr, size): if ptr is null, call malloc. If size is zero, free ptr and return null. Otherwise, if new size <= old size, return same ptr (or shrink). If new size > old size, allocate new block, copy old data, free old block. We'll implement simple version.\n\nWe'll maintain a global pointer free_list_head in BSS, initialized to 0.\n\nClarification: calloc must check multiplication overflow; malloc must check rounding and heap-growth overflow. A split’s remaining payload is old_capacity − requested_capacity − header_size. realloc failure must leave the old allocation unchanged."
      },
      {
        "id": "sec-31-4",
        "title": "31.4 File I/O Library Implementation",
        "content": "We'll create fileio.asm with global functions.\n\nClarification: The original get_file_size clobbers RBX and saves its result in RCX, which close’s SYSCALL overwrites. The copy draft loses arguments; the later listing omits O_TRUNC, treats an initial open error as success, and loses unwritten bytes on a short write. Use the complete library below. It checks same-file device/inode identity before truncating and uses a per-call buffer.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "fileio.asm",
            "code": "; fileio.asm\n%include \"fileio.inc\"\n\nsection .text\n\n; open_file: rdi=path, rsi=flags, rdx=mode\n; returns fd or -1\nopen_file:\n    mov rax, 2          ; sys_open\n    syscall\n    ret\n\nclose_file:\n    mov rax, 3          ; sys_close\n    syscall\n    ret\n\nread_file:\n    mov rax, 0          ; sys_read\n    syscall\n    ret\n\nwrite_file:\n    mov rax, 1          ; sys_write\n    syscall\n    ret\n\nlseek_file:\n    mov rax, 8          ; sys_lseek\n    syscall\n    ret\n\nget_file_size:\n    ; open file read-only\n    push rdi\n    mov rax, 2\n    mov rsi, 0          ; O_RDONLY\n    xor rdx, rdx\n    syscall\n    pop rdi\n    test rax, rax\n    js  .error\n    mov rbx, rax        ; fd\n\n    ; lseek to end\n    mov rdi, rbx\n    mov rsi, 0\n    mov rdx, 2          ; SEEK_END\n    mov rax, 8\n    syscall\n    mov rcx, rax        ; save size\n    ; close\n    mov rdi, rbx\n    mov rax, 3\n    syscall\n    mov rax, rcx\n    ret\n.error:\n    mov rax, -1\n    ret\n\ncopy_file:\n    ; rdi = src, rsi = dst\n    push rbp\n    mov rbp, rsp\n    sub rsp, 4096       ; allocate buffer on stack? That's large; better use static buffer.\n    ; We'll use a static buffer in .bss for simplicity.\n    ; But here we'll allocate on stack and use r10 as buffer pointer.\n    mov r10, rsp        ; buffer pointer\n\n    ; open source\n    mov rax, 2\n    mov rdi, rdi        ; src path (already in rdi)\n    xor rsi, rsi        ; O_RDONLY\n    syscall\n    test rax, rax\n    js  .copy_error\n    mov r12, rax        ; src fd\n\n    ; open dest\n    mov rax, 2\n    mov rdi, rdx        ; dst path? Wait, we need original dst path. We clobbered rdi.\n    ; Need to save args first.",
            "explanation": "We need to carefully preserve registers. Let's rewrite copy_file properly:"
          },
          {
            "language": "nasm",
            "title": "31.4 File I/O Library Implementation — listing 2",
            "code": "copy_file:\n    push rbp\n    mov rbp, rsp\n    sub rsp, 16          ; alignment (we'll use stack buffer in .bss)\n    push rbx\n    push r12\n    push r13\n    push r14\n\n    mov r12, rdi         ; src path\n    mov r13, rsi         ; dst path\n\n    ; open source\n    mov rax, 2\n    mov rdi, r12\n    xor rsi, rsi         ; O_RDONLY\n    xor rdx, rdx\n    syscall\n    test rax, rax\n    js  .copy_error\n    mov r14, rax         ; src fd\n\n    ; open destination (create/truncate)\n    mov rax, 2\n    mov rdi, r13\n    mov rsi, 0x41        ; O_WRONLY | O_CREAT | O_TRUNC? Let's set proper flags: O_WRONLY=1, O_CREAT=64, O_TRUNC=512 -> 577 (0x241)\n    mov rdx, 0644o       ; permissions\n    syscall\n    test rax, rax\n    js  .copy_close_src_error\n    mov rbx, rax         ; dst fd\n\n    ; loop reading and writing\n.copy_loop:\n    mov rax, 0           ; read\n    mov rdi, r14\n    lea rsi, [buffer]    ; static buffer in .bss\n    mov rdx, 4096\n    syscall\n    test rax, rax\n    js  .copy_close_both_error\n    jz  .copy_done       ; EOF\n    mov r8, rax          ; bytes read\n    mov rax, 1           ; write\n    mov rdi, rbx\n    lea rsi, [buffer]\n    mov rdx, r8\n    syscall\n    test rax, rax\n    js  .copy_close_both_error\n    jmp .copy_loop\n\n.copy_done:\n    ; close both\n    mov rax, 3\n    mov rdi, r14\n    syscall\n    mov rax, 3\n    mov rdi, rbx\n    syscall\n    xor eax, eax\n    jmp .copy_exit\n\n.copy_error:\n    xor eax, eax\n    jmp .copy_exit\n\n.copy_close_src_error:\n    mov rax, 3\n    mov rdi, r14\n    syscall\n    mov rax, -1\n    jmp .copy_exit\n\n.copy_close_both_error:\n    mov rax, 3\n    mov rdi, r14\n    syscall\n    mov rax, 3\n    mov rdi, rbx\n    syscall\n    mov rax, -1\n.copy_exit:\n    pop r14\n    pop r13\n    pop r12\n    pop rbx\n    mov rsp, rbp\n    pop rbp\n    ret",
            "explanation": "We'll add a static buffer in .bss: buffer resb 4096."
          }
        ]
      },
      {
        "id": "sec-31-5",
        "title": "31.5 Memory Allocator Implementation",
        "content": "We'll create allocator.asm with the following global symbols and BSS variables.\n\nClarification: The original allocator is an unfinished, non-assembling draft. It confuses chunk size with break addresses, fails to check raw brk correctly, and overstates split capacity by one header. The complete version below supplies initialization, growth, split/coalesce, calloc and realloc, with all exports and error paths.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "allocator.asm",
            "code": "; allocator.asm\n%include \"allocator.inc\"\n\nstruc Block\n    .size: resq 1\n    .next: resq 1\nendstruc\n\nBLOCK_HEADER_SIZE equ 16\nALIGNMENT equ 16\n\nsection .bss\n    free_list_head resq 1\n    heap_start resq 1\n    heap_end resq 1\n\nsection .text\n\n; Initialize allocator (optional)\ninit_allocator:\n    ; get current brk\n    mov rax, 12\n    xor rdi, rdi\n    syscall\n    mov [heap_start], rax\n    mov [heap_end], rax\n    mov qword [free_list_head], 0\n    ret\n\n; align size up to 16\nalign_up:\n    add rdi, ALIGNMENT-1\n    and rdi, ~(ALIGNMENT-1)\n    ret\n\n; malloc: rdi = size\n; returns pointer to user data or 0\nmalloc:\n    push rbx\n    push rcx\n    push rdx\n    push r12\n    push r13\n\n    ; align size\n    call align_up\n    mov r12, rdi        ; aligned size (including header? no, user size)\n\n    ; search free list\n    lea rbx, [free_list_head]   ; pointer to head pointer\n    mov rcx, [rbx]      ; current block\n.search_loop:\n    test rcx, rcx\n    jz .extend_heap      ; no free block\n    mov rax, [rcx + Block.size]\n    cmp rax, r12\n    jae .found_block\n    ; move to next\n    lea rbx, [rcx + Block.next]\n    mov rcx, [rbx]\n    jmp .search_loop\n\n.found_block:\n    ; remove from free list: *rbx = block->next\n    mov rdx, [rcx + Block.next]\n    mov [rbx], rdx\n    ; split if remaining size >= BLOCK_HEADER_SIZE + 16\n    mov rax, [rcx + Block.size]\n    sub rax, r12\n    cmp rax, BLOCK_HEADER_SIZE + 16\n    jb .no_split\n    ; split: new_block = rcx + BLOCK_HEADER_SIZE + r12\n    lea rdx, [rcx + BLOCK_HEADER_SIZE + r12]\n    mov [rdx + Block.size], rax      ; remaining size\n    ; add new block to free list\n    mov r8, [free_list_head]\n    mov [rdx + Block.next], r8\n    mov [free_list_head], rdx\n    ; set allocated block size = r12\n    mov [rcx + Block.size], r12\n.no_split:\n    ; return pointer to user data (rcx + BLOCK_HEADER_SIZE)\n    lea rax, [rcx + BLOCK_HEADER_SIZE]\n    jmp .malloc_done\n\n.extend_heap:\n    ; We need to allocate from brk.\n    ; Compute required chunk: header + aligned size\n    mov rdi, r12\n    add rdi, BLOCK_HEADER_SIZE\n    add rdi, 4095\n    and rdi, ~4095         ; round to page\n    ; Call brk to extend heap by rdi bytes\n    mov rax, 12\n    mov rdi, [heap_end]\n    add rdi, rdi           ; Actually need to add new size to old break.\n    ; Better: new_break = heap_end + chunk_size\n    ; We'll do:\n    mov r9, rdi            ; chunk size\n    mov rax, 12\n    mov rdi, [heap_end]\n    add rdi, r9\n    syscall\n    test rax, rax\n    js .malloc_fail\n    ; update heap_end\n    mov [heap_end], rax\n    ; create a free block at old heap_end\n    mov rcx, [heap_end]\n    sub rcx, r9            ; block address = old heap_end\n    mov [rcx + Block.size], r9 - BLOCK_HEADER_SIZE\n    ; add to free list\n    mov rdx, [free_list_head]\n    mov [rcx + Block.next], rdx\n    mov [free_list_head], rcx\n    ; now retry search\n    jmp .search_loop\n\n.malloc_fail:\n    xor eax, eax\n.malloc_done:\n    pop r13\n    pop r12\n    pop rdx\n    pop rcx\n    pop rbx\n    ret",
            "explanation": "This is a bit messy; we'll refine later. We need to fix the logic for heap extension and retry.\n\nBetter to have a helper grow_heap that calls brk and adds a block to free list, then malloc restarts search.\n\nLet's rewrite with cleaner structure. The code is getting long; we'll provide a complete but simple allocator that works."
          }
        ]
      },
      {
        "id": "sec-31-6",
        "title": "31.6 Test Program",
        "content": "We'll create test_project.asm that:\n\n1. Uses open_file, write_file, close_file to create a file \"test.txt\" and write \"Hello, World!\".\n2. Uses read_file to read the file back into a buffer (allocated with malloc).\n3. Uses get_file_size to print file size.\n4. Copies the file to \"copy.txt\" using copy_file.\n5. Tests memory allocator by allocating, writing, reading, and freeing.\n\nWe'll print results using write syscall and simple string messages.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Complete test_project.asm",
            "code": "; test_project.asm -- run in a disposable directory; test.txt must not exist.\n%include \"fileio.inc\"\n%include \"allocator.inc\"\ndefault rel\nsection .data\npath db 'test.txt',0\ncopy_path db 'copy.txt',0\nmessage db 'Hello, World!'\nmessage_len equ $-message\nok db 'File size: 13',10,'File and memory checks passed',10\nok_len equ $-ok\nsection .text\nglobal _start\n_start:\n    lea rdi,[path]\n    mov esi,1|64|128       ; create new file, O_EXCL avoids accidental overwrite\n    mov edx,0o600\n    call open_file\n    test rax,rax\n    js fail\n    mov r12,rax\n    mov rdi,rax\n    lea rsi,[message]\n    mov edx,message_len\n    call write_file\n    cmp rax,message_len\n    jne fail\n    mov rdi,r12\n    call close_file\n    test rax,rax\n    js fail\n    lea rdi,[path]\n    call get_file_size\n    cmp rax,message_len\n    jne fail\n    lea rdi,[path]\n    call read_entire_file\n    test rax,rax\n    jz fail\n    cmp rdx,message_len\n    jne fail\n    mov r12,rax\n    mov rsi,rax\n    lea rdi,[message]\n    mov ecx,message_len\n    cld\n    repe cmpsb\n    jne fail\n    mov rdi,r12\n    mov esi,8192\n    call realloc\n    test rax,rax\n    jz fail\n    mov r12,rax\n    mov rsi,rax\n    lea rdi,[message]\n    mov ecx,message_len\n    repe cmpsb\n    jne fail\n    mov rdi,r12\n    call free\n    lea rdi,[path]\n    lea rsi,[copy_path]\n    call copy_file\n    test rax,rax\n    jnz fail\n    mov edi,1\n    lea rsi,[ok]\n    mov edx,ok_len\n    call write_file\n    cmp rax,ok_len\n    jne fail\n    xor edi,edi\n    jmp quit\nfail:\n    mov edi,1\nquit:\n    mov eax,60\n    syscall\nsection .note.GNU-stack noalloc noexec nowrite progbits",
            "explanation": "Run the original Makefile in a disposable exercise directory. The test creates a new test.txt, validates its 13-byte contents, grows/frees its allocation, copies the file, and prints two success lines. O_EXCL makes an existing test.txt a deliberate failure."
          }
        ]
      },
      {
        "id": "sec-31-7",
        "title": "31.7 Full Source Code, Makefile, and Build",
        "content": "We'll provide the complete files. Due to length, we'll summarize but ensure all essential code is included.\n\nMakefile:",
        "codeSnippets": [
          {
            "language": "make",
            "title": "31.7 Full Source Code, Makefile, and Build — listing 1",
            "code": "ASM = nasm\nASMFLAGS = -f elf64\nLD = ld\nTARGET = test_project\nOBJECTS = test_project.o fileio.o allocator.o\n\nall: $(TARGET)\n\n$(TARGET): $(OBJECTS)\n\t$(LD) $(OBJECTS) -o $(TARGET)\n\n%.o: %.asm\n\t$(ASM) $(ASMFLAGS) $< -o $@\n\nclean:\n\trm -f $(OBJECTS) $(TARGET)"
          },
          {
            "language": "nasm",
            "title": "Complete fileio.asm",
            "code": "; fileio.asm -- Linux x86-64. Wrappers normalize negative errno to -1.\n; read/write may return short counts; copy handles them internally.\n; copy overwrites regular destination files after rejecting the same inode.\ndefault rel\nsection .rodata\nprogress db 'Copied another 1 MiB',10\nprogress_len equ $-progress\nsection .text\nglobal open_file,close_file,read_file,write_file,lseek_file,get_file_size\n global copy_file,copy_file_progress,read_entire_file\nextern malloc,free\nopen_file:\n    mov eax,2\n    syscall\n    jmp normalize\nclose_file:\n    mov eax,3\n    syscall\n    jmp normalize\nread_file:\n    xor eax,eax\n    syscall\n    cmp rax,-4\n    je read_file\n    jmp normalize\nwrite_file:\n    mov eax,1\n    syscall\n    cmp rax,-4\n    je write_file\n    jmp normalize\nlseek_file:\n    mov eax,8\n    syscall\nnormalize:\n    test rax,rax\n    jns .done\n    mov rax,-1\n.done:\n    ret\nget_file_size:\n    push rbx\n    push r12\n    sub rsp,8\n    xor esi,esi\n    xor edx,edx\n    call open_file\n    test rax,rax\n    js .done\n    mov rbx,rax\n    mov rdi,rax\n    xor esi,esi\n    mov edx,2\n    call lseek_file\n    mov r12,rax\n    mov rdi,rbx\n    call close_file\n    test rax,rax\n    js .done\n    mov rax,r12\n.done:\n    add rsp,8\n    pop r12\n    pop rbx\n    ret\ncopy_file:\n    xor r8d,r8d\n    jmp copy_common\ncopy_file_progress:\n    mov r8d,1\ncopy_common:\n    push rbx\n    push r12\n    push r13\n    push r14\n    push r15\n    sub rsp,4400           ; data buffer plus two full x86-64 stat structs\n    mov r15d,r8d\n    mov r13,rsi\n    xor esi,esi\n    xor edx,edx\n    call open_file\n    test rax,rax\n    js .error\n    mov r12,rax\n    mov rdi,r13\n    mov esi,65             ; O_WRONLY|O_CREAT; truncate only after inode check\n    mov edx,0o644\n    call open_file\n    test rax,rax\n    js .close_src_error\n    mov rbx,rax\n    mov eax,5              ; fstat(source)\n    mov rdi,r12\n    lea rsi,[rsp+4096]\n    syscall\n    test rax,rax\n    js .close_both_error\n    mov eax,5              ; fstat(destination)\n    mov rdi,rbx\n    lea rsi,[rsp+4240]\n    syscall\n    test rax,rax\n    js .close_both_error\n    mov rax,[rsp+4096]     ; st_dev\n    cmp rax,[rsp+4240]\n    jne .truncate\n    mov rax,[rsp+4104]     ; st_ino\n    cmp rax,[rsp+4248]\n    je .close_both_error\n.truncate:\n    mov eax,77             ; ftruncate destination\n    mov rdi,rbx\n    xor esi,esi\n    syscall\n    test rax,rax\n    js .close_both_error\n    xor r13d,r13d          ; bytes copied\n    mov r14d,1048576       ; next progress threshold\n.read:\n    mov rdi,r12\n    mov rsi,rsp\n    mov edx,4096\n    call read_file\n    test rax,rax\n    js .close_both_error\n    jz .success\n    mov r8,rax\n    mov rdx,rax\n    mov rdi,rbx\n    mov rsi,rsp\n    call write_all_fd\n    test rax,rax\n    js .close_both_error\n    add r13,r8\n    test r15d,r15d\n    jz .read\n.progress:\n    cmp r13,r14\n    jb .read\n    lea rsi,[progress]\n    mov edx,progress_len\n    mov edi,2\n    call write_all_fd\n    test rax,rax\n    js .close_both_error\n    add r14,1048576\n    jmp .progress\n.success:\n    mov rdi,r12\n    call close_file\n    mov r12,rax\n    mov rdi,rbx\n    call close_file\n    or rax,r12\n    jmp .return\n.close_both_error:\n    mov rdi,rbx\n    call close_file\n.close_src_error:\n    mov rdi,r12\n    call close_file\n.error:\n    mov rax,-1\n.return:\n    add rsp,4400\n    pop r15\n    pop r14\n    pop r13\n    pop r12\n    pop rbx\n    ret\n; RDI fd, RSI bytes, RDX count; 0 success, -1 error; R8 preserved.\nwrite_all_fd:\n    test rdx,rdx\n    jz .done\n.loop:\n    mov eax,1\n    syscall\n    cmp rax,-4\n    je .loop\n    test rax,rax\n    jle .error\n    add rsi,rax\n    sub rdx,rax\n    jnz .loop\n.done:\n    xor eax,eax\n    ret\n.error:\n    mov rax,-1\n    ret\n; read_entire_file(path): RAX=allocated bytes, RDX=size; RAX=0 on error.\n; Reads the initial size of a seekable file; rejects premature EOF.\n; Empty files return a non-NULL allocation and size 0. No NUL is appended.\nread_entire_file:\n    push rbx\n    push r12\n    push r13\n    push r14\n    sub rsp,8\n    xor esi,esi\n    xor edx,edx\n    call open_file\n    test rax,rax\n    js .fail\n    mov rbx,rax\n    mov rdi,rax\n    xor esi,esi\n    mov edx,2\n    call lseek_file\n    test rax,rax\n    js .close_fail\n    mov r12,rax\n    mov rdi,rbx\n    xor esi,esi\n    xor edx,edx\n    call lseek_file\n    test rax,rax\n    js .close_fail\n    mov rdi,r12\n    test rdi,rdi\n    jnz .allocate\n    mov edi,1\n.allocate:\n    call malloc\n    test rax,rax\n    jz .close_fail\n    mov r13,rax\n    xor r14d,r14d\n.read:\n    cmp r14,r12\n    jae .complete\n    mov rdi,rbx\n    lea rsi,[r13+r14]\n    mov rdx,r12\n    sub rdx,r14\n    call read_file\n    test rax,rax\n    jle .free_fail\n    add r14,rax\n    jmp .read\n.complete:\n    mov rdi,rbx\n    call close_file\n    test rax,rax\n    js .free_only\n    mov rax,r13\n    mov rdx,r12\n    jmp .return\n.free_fail:\n    mov rdi,rbx\n    call close_file\n.free_only:\n    mov rdi,r13\n    call free\n    jmp .fail\n.close_fail:\n    mov rdi,rbx\n    call close_file\n.fail:\n    xor eax,eax\n    xor edx,edx\n.return:\n    add rsp,8\n    pop r14\n    pop r13\n    pop r12\n    pop rbx\n    ret\nsection .note.GNU-stack noalloc noexec nowrite progbits",
            "explanation": "Includes the seven planned APIs plus copy_file_progress and read_entire_file. get_file_size/read_entire_file require seekable inputs. Copy may leave a partial destination on error and does not preserve permissions/timestamps or promise crash durability."
          },
          {
            "language": "nasm",
            "title": "Complete allocator.asm",
            "code": "; allocator.asm -- single-threaded brk allocator for standalone Linux programs.\n; Do not mix with libc malloc/sbrk or another owner of the process break.\n; 16-byte headers: payload capacity, next free block. Sorted free list.\n; malloc(0)=NULL; free(NULL) is a no-op; invalid/double frees are unsupported.\ndefault rel\nsection .bss\nfree_list_head resq 1\nheap_end resq 1\nsection .text\nglobal malloc,free,calloc,realloc,init_allocator\ninit_allocator:\n    cmp qword [heap_end],0\n    jne .done\n    mov eax,12\n    xor edi,edi\n    syscall\n    mov rdi,rax\n    add rdi,15\n    jc .fail\n    and rdi,-16\n    mov eax,12\n    syscall\n    cmp rax,rdi\n    jne .fail\n    mov [heap_end],rax\n.done:\n    xor eax,eax\n    ret\n.fail:\n    mov eax,-1\n    ret\nmalloc:\n    test rdi,rdi\n    jz .zero\n    push rbx\n    push r12\n    push r13\n    push r14\n    sub rsp,8\n    mov r12,rdi\n    add r12,15\n    jc .fail\n    and r12,-16\n    call init_allocator\n    test eax,eax\n    jnz .fail\n.restart:\n    lea rbx,[free_list_head]\n.search:\n    mov rcx,[rbx]\n    test rcx,rcx\n    jz .grow\n    mov rax,[rcx]\n    cmp rax,r12\n    jae .found\n    lea rbx,[rcx+8]\n    jmp .search\n.found:\n    mov rdx,[rcx+8]\n    sub rax,r12\n    cmp rax,32              ; room for header and >=16 payload\n    jb .whole\n    lea r8,[rcx+r12+16]\n    sub rax,16              ; new header consumes part of remainder\n    mov [r8],rax\n    mov [r8+8],rdx\n    mov [rbx],r8\n    mov [rcx],r12\n    jmp .return_block\n.whole:\n    mov [rbx],rdx\n.return_block:\n    lea rax,[rcx+16]\n    jmp .done\n.grow:\n    mov r14,r12\n    add r14,16+4095\n    jc .fail\n    and r14,-4096\n    mov r13,[heap_end]\n    mov rdi,r13\n    add rdi,r14\n    jc .fail\n    mov eax,12\n    syscall\n    cmp rax,rdi             ; raw brk returns old break on failure\n    jne .fail\n    mov [heap_end],rax\n    lea rax,[r14-16]\n    mov [r13],rax\n    lea rdi,[r13+16]\n    call free              ; insert new region and merge its predecessor\n    jmp .restart\n.fail:\n    xor eax,eax\n.done:\n    add rsp,8\n    pop r14\n    pop r13\n    pop r12\n    pop rbx\n    ret\n.zero:\n    xor eax,eax\n    ret\nfree:\n    test rdi,rdi\n    jz .done\n    lea r8,[rdi-16]         ; block header\n    lea r9,[free_list_head] ; pointer to predecessor's next link\n    xor r10d,r10d           ; predecessor block\n.find:\n    mov rcx,[r9]\n    test rcx,rcx\n    jz .insert\n    cmp rcx,r8\n    jae .insert\n    mov r10,rcx\n    lea r9,[rcx+8]\n    jmp .find\n.insert:\n    mov [r8+8],rcx\n    mov [r9],r8\n    test rcx,rcx\n    jz .previous\n    mov rax,[r8]\n    lea rdx,[r8+rax+16]\n    cmp rdx,rcx\n    jne .previous\n    add rax,[rcx]\n    add rax,16\n    mov [r8],rax\n    mov rax,[rcx+8]\n    mov [r8+8],rax\n.previous:\n    test r10,r10\n    jz .done\n    mov rax,[r10]\n    lea rdx,[r10+rax+16]\n    cmp rdx,r8\n    jne .done\n    add rax,[r8]\n    add rax,16\n    mov [r10],rax\n    mov rax,[r8+8]\n    mov [r10+8],rax\n.done:\n    ret\ncalloc:\n    mov rax,rdi\n    mul rsi\n    test rdx,rdx\n    jnz .fail\n    push rbx\n    mov rbx,rax\n    mov rdi,rax\n    call malloc\n    test rax,rax\n    jz .done\n    mov r8,rax\n    mov rdi,rax\n    mov rcx,rbx\n    xor eax,eax\n    cld\n    rep stosb\n    mov rax,r8\n.done:\n    pop rbx\n    ret\n.fail:\n    xor eax,eax\n    ret\nrealloc:\n    test rdi,rdi\n    jz .new\n    test rsi,rsi\n    jz .zero\n    cmp rsi,[rdi-16]\n    jbe .same\n    push rbx\n    push r12\n    push r13\n    mov rbx,rdi\n    mov r12,rsi\n    mov r13,[rdi-16]\n    mov rdi,rsi\n    call malloc\n    test rax,rax\n    jz .return\n    mov r12,rax\n    mov rdi,rax\n    mov rsi,rbx\n    mov rcx,r13\n    cld\n    rep movsb\n    mov rdi,rbx\n    call free\n    mov rax,r12\n.return:\n    pop r13\n    pop r12\n    pop rbx\n    ret\n.new:\n    mov rdi,rsi\n    jmp malloc\n.zero:\n    sub rsp,8\n    call free\n    add rsp,8\n    xor eax,eax\n    ret\n.same:\n    mov rax,rdi\n    ret\nsection .note.GNU-stack noalloc noexec nowrite progbits",
            "explanation": "Standalone brk-based allocator with first-fit, 16-byte alignment, splitting, sorted coalescing, multiplication/rounding checks, and failure-preserving realloc. Retains freed regions for reuse; it does not shrink the process break or support over-aligned allocations."
          },
          {
            "language": "nasm",
            "title": "Complete fileio.inc",
            "code": "extern open_file\nextern close_file\nextern read_file\nextern write_file\nextern lseek_file\nextern get_file_size\nextern copy_file\nextern copy_file_progress\nextern read_entire_file\n%define O_RDONLY 0\n%define O_WRONLY 1\n%define O_CREAT 64\n%define O_EXCL 128\n%define O_TRUNC 512\n%define SEEK_SET 0\n%define SEEK_END 2",
            "explanation": "Declarations belong in callers; fileio.asm defines global symbols and does not include a header that declares its own definitions extern."
          },
          {
            "language": "nasm",
            "title": "Complete allocator.inc",
            "code": "extern init_allocator\nextern malloc\nextern free\nextern calloc\nextern realloc",
            "explanation": "Include in the standalone caller. Do not link this allocator into a libc program using another brk manager."
          },
          {
            "language": "bash",
            "title": "Build the extended regression",
            "code": "nasm -f elf64 allocator.asm -o allocator.o\nnasm -f elf64 fileio.asm -o fileio.o\nnasm -f elf64 test_entry.asm -o test_entry.o\ngcc -O2 -ffreestanding -fno-builtin -fno-stack-protector -fno-pie -c test31.c -o test31.o\nld test_entry.o test31.o fileio.o allocator.o -o test31\n./test31",
            "explanation": "Use a fresh disposable directory: the regression creates source.bin, copy.bin and empty.bin. ld links without libc, avoiding conflicting heap ownership."
          }
        ]
      },
      {
        "id": "sec-31-8",
        "title": "31.8 Possible Extensions",
        "content": "- Implement realloc properly.\n- Add coalescing of adjacent free blocks.\n- Use mmap for large allocations.\n- Add error checking and errno.\n- Implement buffered I/O.\n- Support reading/writing binary data.\n\nOriginal source solution placeholder: (We'll provide concise solutions.)",
        "codeSnippets": [
          {
            "language": "c",
            "title": "Freestanding regression and benchmark: test31.c",
            "code": "/* Freestanding tests: compile with -ffreestanding -fno-builtin -fno-stack-protector.\n   Link with ld and test_entry.o; do not link libc with the brk allocator. */\n#include <stddef.h>\n#include <stdint.h>\nextern void *malloc(size_t),*calloc(size_t,size_t),*realloc(void*,size_t);\nextern void free(void*);\nextern long open_file(const char*,int,int),close_file(long),write_file(long,const void*,size_t),get_file_size(const char*);\nextern long copy_file(const char*,const char*),copy_file_progress(const char*,const char*);\nstruct Blob {void *data;size_t size;};\nextern struct Blob read_entire_file(const char*);\nextern uint64_t clock_ticks(void);\n#define CHECK(condition) do {if (!(condition)) return 1;} while(0)\nstatic unsigned char bytes[4096];\nstatic void *slots[64];\nstatic size_t lengths[64];\nint test_main(void) {\n    CHECK(malloc(0)==0 && malloc(SIZE_MAX)==0 && calloc(SIZE_MAX,2)==0);\n    unsigned char *a=malloc(64),*b=malloc(64),*c=malloc(64);\n    CHECK(a&&b&&c&&(((uintptr_t)a| (uintptr_t)b | (uintptr_t)c)&15)==0);\n    for(size_t i=0;i<64;i++)a[i]=(unsigned char)i;\n    CHECK(realloc(a,SIZE_MAX)==0);for(size_t i=0;i<64;i++)CHECK(a[i]==(unsigned char)i);\n    unsigned char *grown=realloc(a,9000);CHECK(grown);for(size_t i=0;i<64;i++)CHECK(grown[i]==(unsigned char)i);\n    CHECK(realloc(grown,32)==grown);free(grown);free(b);free(c);\n    a=malloc(64);b=malloc(64);c=malloc(64);CHECK(a&&b&&c);\n    free(a);free(b);unsigned char *merged=malloc(128);CHECK(merged==a);\n    free(merged);free(c);free(0);\n    unsigned char *z=calloc(127,3);CHECK(z);for(size_t i=0;i<381;i++)CHECK(z[i]==0);CHECK(realloc(z,0)==0);\n    uint32_t state=31;uint64_t start=clock_ticks();\n    for(unsigned iteration=0;iteration<20000;iteration++) {\n        state=state*1664525u+1013904223u;size_t slot=(state>>16)%64;\n        if(slots[slot]) {unsigned char *p=slots[slot];for(size_t i=0;i<lengths[slot];i++)CHECK(p[i]==(unsigned char)slot);free(p);}\n        size_t n=1+(state%2048);slots[slot]=malloc(n);lengths[slot]=n;CHECK(slots[slot]);\n        unsigned char *p=slots[slot];for(size_t i=0;i<n;i++)p[i]=(unsigned char)slot;\n    }\n    uint64_t elapsed=clock_ticks()-start;CHECK(elapsed>0);\n    for(size_t i=0;i<64;i++)free(slots[i]);\n    /* Print elapsed monotonic nanoseconds without libc. */\n    char digits[32];size_t at=sizeof digits;digits[--at]='\\n';do {digits[--at]=(char)('0'+elapsed%10);elapsed/=10;}while(elapsed);\n    const char label[]=\"Allocator workload nanoseconds: \";CHECK(write_file(1,label,sizeof label-1)>0);CHECK(write_file(1,digits+at,sizeof digits-at)>0);\n    long fd=open_file(\"source.bin\",1|64|128,0600);CHECK(fd>=0);\n    for(size_t i=0;i<sizeof bytes;i++)bytes[i]=(unsigned char)i;\n    for(int i=0;i<513;i++)CHECK(write_file(fd,bytes,sizeof bytes)==(long)sizeof bytes);\n    CHECK(close_file(fd)==0 && get_file_size(\"source.bin\")==513*4096);\n    CHECK(copy_file_progress(\"source.bin\",\"copy.bin\")==0);\n    CHECK(copy_file(\"source.bin\",\"source.bin\")==-1);\n    CHECK(get_file_size(\"source.bin\")==513*4096);\n    CHECK(copy_file(\"missing.bin\",\"unused.bin\")==-1);\n    struct Blob blob=read_entire_file(\"copy.bin\");CHECK(blob.data && blob.size==513*4096);\n    for(size_t i=0;i<blob.size;i++){CHECK(((unsigned char*)blob.data)[i]==(unsigned char)i);}\n    free(blob.data);\n    fd=open_file(\"empty.bin\",1|64|128,0600);CHECK(fd>=0 && close_file(fd)==0);\n    blob=read_entire_file(\"empty.bin\");CHECK(blob.data && blob.size==0);free(blob.data);\n    blob=read_entire_file(\"missing.bin\");CHECK(!blob.data && blob.size==0);\n    const char ok[]=\"Allocator and file-I/O checks passed\\n\";CHECK(write_file(1,ok,sizeof ok-1)>0);\n    return 0;\n}",
            "explanation": "Checks allocation failure preservation, coalescing/reuse, zeroing, 20000 varied allocation operations, a 2 MiB+4096-byte binary copy, same-inode protection and empty/missing file behavior. Compiled C uses only our assembly libraries, not libc."
          },
          {
            "language": "nasm",
            "title": "Freestanding entry and clock: test_entry.asm",
            "code": "; test_entry.asm -- entry and timing helper for freestanding test31.c\nsection .text\nglobal _start,clock_ticks\nextern test_main\n_start:\n    call test_main\n    mov edi,eax\n    mov eax,60\n    syscall\nclock_ticks:\n    sub rsp,24\n    mov eax,228            ; clock_gettime\n    mov edi,1              ; CLOCK_MONOTONIC\n    mov rsi,rsp\n    syscall\n    test rax,rax\n    js .error\n    mov rax,[rsp]\n    imul rax,rax,1000000000\n    add rax,[rsp+8]\n    add rsp,24\n    ret\n.error:\n    mov edi,2\n    mov eax,60\n    syscall\nsection .note.GNU-stack noalloc noexec nowrite progbits",
            "explanation": "Provides process entry and CLOCK_MONOTONIC nanoseconds through syscall 228. Test timing includes verification work; it is an allocator workload measurement, not a claim of isolated malloc latency."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-31-1",
        "title": "Exercise 31.1: Implement `realloc`",
        "description": "Write a realloc function that resizes a previously allocated block, copying data if necessary.",
        "solution": "/* Freestanding tests: compile with -ffreestanding -fno-builtin -fno-stack-protector.\n   Link with ld and test_entry.o; do not link libc with the brk allocator. */\n#include <stddef.h>\n#include <stdint.h>\nextern void *malloc(size_t),*calloc(size_t,size_t),*realloc(void*,size_t);\nextern void free(void*);\nextern long open_file(const char*,int,int),close_file(long),write_file(long,const void*,size_t),get_file_size(const char*);\nextern long copy_file(const char*,const char*),copy_file_progress(const char*,const char*);\nstruct Blob {void *data;size_t size;};\nextern struct Blob read_entire_file(const char*);\nextern uint64_t clock_ticks(void);\n#define CHECK(condition) do {if (!(condition)) return 1;} while(0)\nstatic unsigned char bytes[4096];\nstatic void *slots[64];\nstatic size_t lengths[64];\nint test_main(void) {\n    CHECK(malloc(0)==0 && malloc(SIZE_MAX)==0 && calloc(SIZE_MAX,2)==0);\n    unsigned char *a=malloc(64),*b=malloc(64),*c=malloc(64);\n    CHECK(a&&b&&c&&(((uintptr_t)a| (uintptr_t)b | (uintptr_t)c)&15)==0);\n    for(size_t i=0;i<64;i++)a[i]=(unsigned char)i;\n    CHECK(realloc(a,SIZE_MAX)==0);for(size_t i=0;i<64;i++)CHECK(a[i]==(unsigned char)i);\n    unsigned char *grown=realloc(a,9000);CHECK(grown);for(size_t i=0;i<64;i++)CHECK(grown[i]==(unsigned char)i);\n    CHECK(realloc(grown,32)==grown);free(grown);free(b);free(c);\n    a=malloc(64);b=malloc(64);c=malloc(64);CHECK(a&&b&&c);\n    free(a);free(b);unsigned char *merged=malloc(128);CHECK(merged==a);\n    free(merged);free(c);free(0);\n    unsigned char *z=calloc(127,3);CHECK(z);for(size_t i=0;i<381;i++)CHECK(z[i]==0);CHECK(realloc(z,0)==0);\n    uint32_t state=31;uint64_t start=clock_ticks();\n    for(unsigned iteration=0;iteration<20000;iteration++) {\n        state=state*1664525u+1013904223u;size_t slot=(state>>16)%64;\n        if(slots[slot]) {unsigned char *p=slots[slot];for(size_t i=0;i<lengths[slot];i++)CHECK(p[i]==(unsigned char)slot);free(p);}\n        size_t n=1+(state%2048);slots[slot]=malloc(n);lengths[slot]=n;CHECK(slots[slot]);\n        unsigned char *p=slots[slot];for(size_t i=0;i<n;i++)p[i]=(unsigned char)slot;\n    }\n    uint64_t elapsed=clock_ticks()-start;CHECK(elapsed>0);\n    for(size_t i=0;i<64;i++)free(slots[i]);\n    /* Print elapsed monotonic nanoseconds without libc. */\n    char digits[32];size_t at=sizeof digits;digits[--at]='\\n';do {digits[--at]=(char)('0'+elapsed%10);elapsed/=10;}while(elapsed);\n    const char label[]=\"Allocator workload nanoseconds: \";CHECK(write_file(1,label,sizeof label-1)>0);CHECK(write_file(1,digits+at,sizeof digits-at)>0);\n    long fd=open_file(\"source.bin\",1|64|128,0600);CHECK(fd>=0);\n    for(size_t i=0;i<sizeof bytes;i++)bytes[i]=(unsigned char)i;\n    for(int i=0;i<513;i++)CHECK(write_file(fd,bytes,sizeof bytes)==(long)sizeof bytes);\n    CHECK(close_file(fd)==0 && get_file_size(\"source.bin\")==513*4096);\n    CHECK(copy_file_progress(\"source.bin\",\"copy.bin\")==0);\n    CHECK(copy_file(\"source.bin\",\"source.bin\")==-1);\n    CHECK(get_file_size(\"source.bin\")==513*4096);\n    CHECK(copy_file(\"missing.bin\",\"unused.bin\")==-1);\n    struct Blob blob=read_entire_file(\"copy.bin\");CHECK(blob.data && blob.size==513*4096);\n    for(size_t i=0;i<blob.size;i++){CHECK(((unsigned char*)blob.data)[i]==(unsigned char)i);}\n    free(blob.data);\n    fd=open_file(\"empty.bin\",1|64|128,0600);CHECK(fd>=0 && close_file(fd)==0);\n    blob=read_entire_file(\"empty.bin\");CHECK(blob.data && blob.size==0);free(blob.data);\n    blob=read_entire_file(\"missing.bin\");CHECK(!blob.data && blob.size==0);\n    const char ok[]=\"Allocator and file-I/O checks passed\\n\";CHECK(write_file(1,ok,sizeof ok-1)>0);\n    return 0;\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "The complete implementation appears in allocator.asm or fileio.asm above; this shared freestanding harness exercises it. Save as test31.c and use test_entry.asm with the section 31.7 build commands. Do not link libc with this brk allocator. realloc preserves the original 64 bytes during growth to 9000, reuses sufficient capacity on shrink and retains the old allocation when SIZE_MAX fails. It also supports NULL and zero-size cases according to the documented contract."
      },
      {
        "id": "ex-31-2",
        "title": "Exercise 31.2: Add Coalescing",
        "description": "Modify free to merge adjacent free blocks. You'll need to maintain a doubly linked free list or search for adjacent blocks by address.",
        "solution": "/* Freestanding tests: compile with -ffreestanding -fno-builtin -fno-stack-protector.\n   Link with ld and test_entry.o; do not link libc with the brk allocator. */\n#include <stddef.h>\n#include <stdint.h>\nextern void *malloc(size_t),*calloc(size_t,size_t),*realloc(void*,size_t);\nextern void free(void*);\nextern long open_file(const char*,int,int),close_file(long),write_file(long,const void*,size_t),get_file_size(const char*);\nextern long copy_file(const char*,const char*),copy_file_progress(const char*,const char*);\nstruct Blob {void *data;size_t size;};\nextern struct Blob read_entire_file(const char*);\nextern uint64_t clock_ticks(void);\n#define CHECK(condition) do {if (!(condition)) return 1;} while(0)\nstatic unsigned char bytes[4096];\nstatic void *slots[64];\nstatic size_t lengths[64];\nint test_main(void) {\n    CHECK(malloc(0)==0 && malloc(SIZE_MAX)==0 && calloc(SIZE_MAX,2)==0);\n    unsigned char *a=malloc(64),*b=malloc(64),*c=malloc(64);\n    CHECK(a&&b&&c&&(((uintptr_t)a| (uintptr_t)b | (uintptr_t)c)&15)==0);\n    for(size_t i=0;i<64;i++)a[i]=(unsigned char)i;\n    CHECK(realloc(a,SIZE_MAX)==0);for(size_t i=0;i<64;i++)CHECK(a[i]==(unsigned char)i);\n    unsigned char *grown=realloc(a,9000);CHECK(grown);for(size_t i=0;i<64;i++)CHECK(grown[i]==(unsigned char)i);\n    CHECK(realloc(grown,32)==grown);free(grown);free(b);free(c);\n    a=malloc(64);b=malloc(64);c=malloc(64);CHECK(a&&b&&c);\n    free(a);free(b);unsigned char *merged=malloc(128);CHECK(merged==a);\n    free(merged);free(c);free(0);\n    unsigned char *z=calloc(127,3);CHECK(z);for(size_t i=0;i<381;i++)CHECK(z[i]==0);CHECK(realloc(z,0)==0);\n    uint32_t state=31;uint64_t start=clock_ticks();\n    for(unsigned iteration=0;iteration<20000;iteration++) {\n        state=state*1664525u+1013904223u;size_t slot=(state>>16)%64;\n        if(slots[slot]) {unsigned char *p=slots[slot];for(size_t i=0;i<lengths[slot];i++)CHECK(p[i]==(unsigned char)slot);free(p);}\n        size_t n=1+(state%2048);slots[slot]=malloc(n);lengths[slot]=n;CHECK(slots[slot]);\n        unsigned char *p=slots[slot];for(size_t i=0;i<n;i++)p[i]=(unsigned char)slot;\n    }\n    uint64_t elapsed=clock_ticks()-start;CHECK(elapsed>0);\n    for(size_t i=0;i<64;i++)free(slots[i]);\n    /* Print elapsed monotonic nanoseconds without libc. */\n    char digits[32];size_t at=sizeof digits;digits[--at]='\\n';do {digits[--at]=(char)('0'+elapsed%10);elapsed/=10;}while(elapsed);\n    const char label[]=\"Allocator workload nanoseconds: \";CHECK(write_file(1,label,sizeof label-1)>0);CHECK(write_file(1,digits+at,sizeof digits-at)>0);\n    long fd=open_file(\"source.bin\",1|64|128,0600);CHECK(fd>=0);\n    for(size_t i=0;i<sizeof bytes;i++)bytes[i]=(unsigned char)i;\n    for(int i=0;i<513;i++)CHECK(write_file(fd,bytes,sizeof bytes)==(long)sizeof bytes);\n    CHECK(close_file(fd)==0 && get_file_size(\"source.bin\")==513*4096);\n    CHECK(copy_file_progress(\"source.bin\",\"copy.bin\")==0);\n    CHECK(copy_file(\"source.bin\",\"source.bin\")==-1);\n    CHECK(get_file_size(\"source.bin\")==513*4096);\n    CHECK(copy_file(\"missing.bin\",\"unused.bin\")==-1);\n    struct Blob blob=read_entire_file(\"copy.bin\");CHECK(blob.data && blob.size==513*4096);\n    for(size_t i=0;i<blob.size;i++){CHECK(((unsigned char*)blob.data)[i]==(unsigned char)i);}\n    free(blob.data);\n    fd=open_file(\"empty.bin\",1|64|128,0600);CHECK(fd>=0 && close_file(fd)==0);\n    blob=read_entire_file(\"empty.bin\");CHECK(blob.data && blob.size==0);free(blob.data);\n    blob=read_entire_file(\"missing.bin\");CHECK(!blob.data && blob.size==0);\n    const char ok[]=\"Allocator and file-I/O checks passed\\n\";CHECK(write_file(1,ok,sizeof ok-1)>0);\n    return 0;\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "The complete implementation appears in allocator.asm or fileio.asm above; this shared freestanding harness exercises it. Save as test31.c and use test_entry.asm with the section 31.7 build commands. Do not link libc with this brk allocator. free inserts blocks in address order, merges the successor, then the predecessor when addresses meet exactly. The harness frees two adjacent 64-byte blocks and verifies a 128-byte allocation reuses their combined region. Live neighboring allocations prevent merging across occupied space."
      },
      {
        "id": "ex-31-3",
        "title": "Exercise 31.3: File Copy with Progress",
        "description": "Enhance copy_file to print a progress message every 1 MB copied.",
        "solution": "/* Freestanding tests: compile with -ffreestanding -fno-builtin -fno-stack-protector.\n   Link with ld and test_entry.o; do not link libc with the brk allocator. */\n#include <stddef.h>\n#include <stdint.h>\nextern void *malloc(size_t),*calloc(size_t,size_t),*realloc(void*,size_t);\nextern void free(void*);\nextern long open_file(const char*,int,int),close_file(long),write_file(long,const void*,size_t),get_file_size(const char*);\nextern long copy_file(const char*,const char*),copy_file_progress(const char*,const char*);\nstruct Blob {void *data;size_t size;};\nextern struct Blob read_entire_file(const char*);\nextern uint64_t clock_ticks(void);\n#define CHECK(condition) do {if (!(condition)) return 1;} while(0)\nstatic unsigned char bytes[4096];\nstatic void *slots[64];\nstatic size_t lengths[64];\nint test_main(void) {\n    CHECK(malloc(0)==0 && malloc(SIZE_MAX)==0 && calloc(SIZE_MAX,2)==0);\n    unsigned char *a=malloc(64),*b=malloc(64),*c=malloc(64);\n    CHECK(a&&b&&c&&(((uintptr_t)a| (uintptr_t)b | (uintptr_t)c)&15)==0);\n    for(size_t i=0;i<64;i++)a[i]=(unsigned char)i;\n    CHECK(realloc(a,SIZE_MAX)==0);for(size_t i=0;i<64;i++)CHECK(a[i]==(unsigned char)i);\n    unsigned char *grown=realloc(a,9000);CHECK(grown);for(size_t i=0;i<64;i++)CHECK(grown[i]==(unsigned char)i);\n    CHECK(realloc(grown,32)==grown);free(grown);free(b);free(c);\n    a=malloc(64);b=malloc(64);c=malloc(64);CHECK(a&&b&&c);\n    free(a);free(b);unsigned char *merged=malloc(128);CHECK(merged==a);\n    free(merged);free(c);free(0);\n    unsigned char *z=calloc(127,3);CHECK(z);for(size_t i=0;i<381;i++)CHECK(z[i]==0);CHECK(realloc(z,0)==0);\n    uint32_t state=31;uint64_t start=clock_ticks();\n    for(unsigned iteration=0;iteration<20000;iteration++) {\n        state=state*1664525u+1013904223u;size_t slot=(state>>16)%64;\n        if(slots[slot]) {unsigned char *p=slots[slot];for(size_t i=0;i<lengths[slot];i++)CHECK(p[i]==(unsigned char)slot);free(p);}\n        size_t n=1+(state%2048);slots[slot]=malloc(n);lengths[slot]=n;CHECK(slots[slot]);\n        unsigned char *p=slots[slot];for(size_t i=0;i<n;i++)p[i]=(unsigned char)slot;\n    }\n    uint64_t elapsed=clock_ticks()-start;CHECK(elapsed>0);\n    for(size_t i=0;i<64;i++)free(slots[i]);\n    /* Print elapsed monotonic nanoseconds without libc. */\n    char digits[32];size_t at=sizeof digits;digits[--at]='\\n';do {digits[--at]=(char)('0'+elapsed%10);elapsed/=10;}while(elapsed);\n    const char label[]=\"Allocator workload nanoseconds: \";CHECK(write_file(1,label,sizeof label-1)>0);CHECK(write_file(1,digits+at,sizeof digits-at)>0);\n    long fd=open_file(\"source.bin\",1|64|128,0600);CHECK(fd>=0);\n    for(size_t i=0;i<sizeof bytes;i++)bytes[i]=(unsigned char)i;\n    for(int i=0;i<513;i++)CHECK(write_file(fd,bytes,sizeof bytes)==(long)sizeof bytes);\n    CHECK(close_file(fd)==0 && get_file_size(\"source.bin\")==513*4096);\n    CHECK(copy_file_progress(\"source.bin\",\"copy.bin\")==0);\n    CHECK(copy_file(\"source.bin\",\"source.bin\")==-1);\n    CHECK(get_file_size(\"source.bin\")==513*4096);\n    CHECK(copy_file(\"missing.bin\",\"unused.bin\")==-1);\n    struct Blob blob=read_entire_file(\"copy.bin\");CHECK(blob.data && blob.size==513*4096);\n    for(size_t i=0;i<blob.size;i++){CHECK(((unsigned char*)blob.data)[i]==(unsigned char)i);}\n    free(blob.data);\n    fd=open_file(\"empty.bin\",1|64|128,0600);CHECK(fd>=0 && close_file(fd)==0);\n    blob=read_entire_file(\"empty.bin\");CHECK(blob.data && blob.size==0);free(blob.data);\n    blob=read_entire_file(\"missing.bin\");CHECK(!blob.data && blob.size==0);\n    const char ok[]=\"Allocator and file-I/O checks passed\\n\";CHECK(write_file(1,ok,sizeof ok-1)>0);\n    return 0;\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "The complete implementation appears in allocator.asm or fileio.asm above; this shared freestanding harness exercises it. Save as test31.c and use test_entry.asm with the section 31.7 build commands. Do not link libc with this brk allocator. copy_file_progress uses cumulative bytes successfully written, emitting one stderr message per crossed 1 MiB threshold. The 513×4096-byte test must produce exactly two progress lines. Data and progress writes both handle short counts and EINTR."
      },
      {
        "id": "ex-31-4",
        "title": "Exercise 31.4: Read Entire File",
        "description": "Write a function read_entire_file(path) that opens, reads the entire file into a newly allocated buffer, and returns pointer and size.",
        "solution": "/* Freestanding tests: compile with -ffreestanding -fno-builtin -fno-stack-protector.\n   Link with ld and test_entry.o; do not link libc with the brk allocator. */\n#include <stddef.h>\n#include <stdint.h>\nextern void *malloc(size_t),*calloc(size_t,size_t),*realloc(void*,size_t);\nextern void free(void*);\nextern long open_file(const char*,int,int),close_file(long),write_file(long,const void*,size_t),get_file_size(const char*);\nextern long copy_file(const char*,const char*),copy_file_progress(const char*,const char*);\nstruct Blob {void *data;size_t size;};\nextern struct Blob read_entire_file(const char*);\nextern uint64_t clock_ticks(void);\n#define CHECK(condition) do {if (!(condition)) return 1;} while(0)\nstatic unsigned char bytes[4096];\nstatic void *slots[64];\nstatic size_t lengths[64];\nint test_main(void) {\n    CHECK(malloc(0)==0 && malloc(SIZE_MAX)==0 && calloc(SIZE_MAX,2)==0);\n    unsigned char *a=malloc(64),*b=malloc(64),*c=malloc(64);\n    CHECK(a&&b&&c&&(((uintptr_t)a| (uintptr_t)b | (uintptr_t)c)&15)==0);\n    for(size_t i=0;i<64;i++)a[i]=(unsigned char)i;\n    CHECK(realloc(a,SIZE_MAX)==0);for(size_t i=0;i<64;i++)CHECK(a[i]==(unsigned char)i);\n    unsigned char *grown=realloc(a,9000);CHECK(grown);for(size_t i=0;i<64;i++)CHECK(grown[i]==(unsigned char)i);\n    CHECK(realloc(grown,32)==grown);free(grown);free(b);free(c);\n    a=malloc(64);b=malloc(64);c=malloc(64);CHECK(a&&b&&c);\n    free(a);free(b);unsigned char *merged=malloc(128);CHECK(merged==a);\n    free(merged);free(c);free(0);\n    unsigned char *z=calloc(127,3);CHECK(z);for(size_t i=0;i<381;i++)CHECK(z[i]==0);CHECK(realloc(z,0)==0);\n    uint32_t state=31;uint64_t start=clock_ticks();\n    for(unsigned iteration=0;iteration<20000;iteration++) {\n        state=state*1664525u+1013904223u;size_t slot=(state>>16)%64;\n        if(slots[slot]) {unsigned char *p=slots[slot];for(size_t i=0;i<lengths[slot];i++)CHECK(p[i]==(unsigned char)slot);free(p);}\n        size_t n=1+(state%2048);slots[slot]=malloc(n);lengths[slot]=n;CHECK(slots[slot]);\n        unsigned char *p=slots[slot];for(size_t i=0;i<n;i++)p[i]=(unsigned char)slot;\n    }\n    uint64_t elapsed=clock_ticks()-start;CHECK(elapsed>0);\n    for(size_t i=0;i<64;i++)free(slots[i]);\n    /* Print elapsed monotonic nanoseconds without libc. */\n    char digits[32];size_t at=sizeof digits;digits[--at]='\\n';do {digits[--at]=(char)('0'+elapsed%10);elapsed/=10;}while(elapsed);\n    const char label[]=\"Allocator workload nanoseconds: \";CHECK(write_file(1,label,sizeof label-1)>0);CHECK(write_file(1,digits+at,sizeof digits-at)>0);\n    long fd=open_file(\"source.bin\",1|64|128,0600);CHECK(fd>=0);\n    for(size_t i=0;i<sizeof bytes;i++)bytes[i]=(unsigned char)i;\n    for(int i=0;i<513;i++)CHECK(write_file(fd,bytes,sizeof bytes)==(long)sizeof bytes);\n    CHECK(close_file(fd)==0 && get_file_size(\"source.bin\")==513*4096);\n    CHECK(copy_file_progress(\"source.bin\",\"copy.bin\")==0);\n    CHECK(copy_file(\"source.bin\",\"source.bin\")==-1);\n    CHECK(get_file_size(\"source.bin\")==513*4096);\n    CHECK(copy_file(\"missing.bin\",\"unused.bin\")==-1);\n    struct Blob blob=read_entire_file(\"copy.bin\");CHECK(blob.data && blob.size==513*4096);\n    for(size_t i=0;i<blob.size;i++){CHECK(((unsigned char*)blob.data)[i]==(unsigned char)i);}\n    free(blob.data);\n    fd=open_file(\"empty.bin\",1|64|128,0600);CHECK(fd>=0 && close_file(fd)==0);\n    blob=read_entire_file(\"empty.bin\");CHECK(blob.data && blob.size==0);free(blob.data);\n    blob=read_entire_file(\"missing.bin\");CHECK(!blob.data && blob.size==0);\n    const char ok[]=\"Allocator and file-I/O checks passed\\n\";CHECK(write_file(1,ok,sizeof ok-1)>0);\n    return 0;\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "The complete implementation appears in allocator.asm or fileio.asm above; this shared freestanding harness exercises it. Save as test31.c and use test_entry.asm with the section 31.7 build commands. Do not link libc with this brk allocator. read_entire_file returns RAX=buffer and RDX=size; the C struct Blob maps these two integer-class fields to those registers. It reads the initial seekable-file size, rejects premature EOF, ignores later growth, and does not append NUL. Empty files return an allocated pointer with length zero; the caller frees successful buffers."
      },
      {
        "id": "ex-31-5",
        "title": "Exercise 31.5: Benchmark Malloc",
        "description": "Write a test that allocates and frees many blocks of random sizes and measures performance with perf.",
        "solution": "/* Freestanding tests: compile with -ffreestanding -fno-builtin -fno-stack-protector.\n   Link with ld and test_entry.o; do not link libc with the brk allocator. */\n#include <stddef.h>\n#include <stdint.h>\nextern void *malloc(size_t),*calloc(size_t,size_t),*realloc(void*,size_t);\nextern void free(void*);\nextern long open_file(const char*,int,int),close_file(long),write_file(long,const void*,size_t),get_file_size(const char*);\nextern long copy_file(const char*,const char*),copy_file_progress(const char*,const char*);\nstruct Blob {void *data;size_t size;};\nextern struct Blob read_entire_file(const char*);\nextern uint64_t clock_ticks(void);\n#define CHECK(condition) do {if (!(condition)) return 1;} while(0)\nstatic unsigned char bytes[4096];\nstatic void *slots[64];\nstatic size_t lengths[64];\nint test_main(void) {\n    CHECK(malloc(0)==0 && malloc(SIZE_MAX)==0 && calloc(SIZE_MAX,2)==0);\n    unsigned char *a=malloc(64),*b=malloc(64),*c=malloc(64);\n    CHECK(a&&b&&c&&(((uintptr_t)a| (uintptr_t)b | (uintptr_t)c)&15)==0);\n    for(size_t i=0;i<64;i++)a[i]=(unsigned char)i;\n    CHECK(realloc(a,SIZE_MAX)==0);for(size_t i=0;i<64;i++)CHECK(a[i]==(unsigned char)i);\n    unsigned char *grown=realloc(a,9000);CHECK(grown);for(size_t i=0;i<64;i++)CHECK(grown[i]==(unsigned char)i);\n    CHECK(realloc(grown,32)==grown);free(grown);free(b);free(c);\n    a=malloc(64);b=malloc(64);c=malloc(64);CHECK(a&&b&&c);\n    free(a);free(b);unsigned char *merged=malloc(128);CHECK(merged==a);\n    free(merged);free(c);free(0);\n    unsigned char *z=calloc(127,3);CHECK(z);for(size_t i=0;i<381;i++)CHECK(z[i]==0);CHECK(realloc(z,0)==0);\n    uint32_t state=31;uint64_t start=clock_ticks();\n    for(unsigned iteration=0;iteration<20000;iteration++) {\n        state=state*1664525u+1013904223u;size_t slot=(state>>16)%64;\n        if(slots[slot]) {unsigned char *p=slots[slot];for(size_t i=0;i<lengths[slot];i++)CHECK(p[i]==(unsigned char)slot);free(p);}\n        size_t n=1+(state%2048);slots[slot]=malloc(n);lengths[slot]=n;CHECK(slots[slot]);\n        unsigned char *p=slots[slot];for(size_t i=0;i<n;i++)p[i]=(unsigned char)slot;\n    }\n    uint64_t elapsed=clock_ticks()-start;CHECK(elapsed>0);\n    for(size_t i=0;i<64;i++)free(slots[i]);\n    /* Print elapsed monotonic nanoseconds without libc. */\n    char digits[32];size_t at=sizeof digits;digits[--at]='\\n';do {digits[--at]=(char)('0'+elapsed%10);elapsed/=10;}while(elapsed);\n    const char label[]=\"Allocator workload nanoseconds: \";CHECK(write_file(1,label,sizeof label-1)>0);CHECK(write_file(1,digits+at,sizeof digits-at)>0);\n    long fd=open_file(\"source.bin\",1|64|128,0600);CHECK(fd>=0);\n    for(size_t i=0;i<sizeof bytes;i++)bytes[i]=(unsigned char)i;\n    for(int i=0;i<513;i++)CHECK(write_file(fd,bytes,sizeof bytes)==(long)sizeof bytes);\n    CHECK(close_file(fd)==0 && get_file_size(\"source.bin\")==513*4096);\n    CHECK(copy_file_progress(\"source.bin\",\"copy.bin\")==0);\n    CHECK(copy_file(\"source.bin\",\"source.bin\")==-1);\n    CHECK(get_file_size(\"source.bin\")==513*4096);\n    CHECK(copy_file(\"missing.bin\",\"unused.bin\")==-1);\n    struct Blob blob=read_entire_file(\"copy.bin\");CHECK(blob.data && blob.size==513*4096);\n    for(size_t i=0;i<blob.size;i++){CHECK(((unsigned char*)blob.data)[i]==(unsigned char)i);}\n    free(blob.data);\n    fd=open_file(\"empty.bin\",1|64|128,0600);CHECK(fd>=0 && close_file(fd)==0);\n    blob=read_entire_file(\"empty.bin\");CHECK(blob.data && blob.size==0);free(blob.data);\n    blob=read_entire_file(\"missing.bin\");CHECK(!blob.data && blob.size==0);\n    const char ok[]=\"Allocator and file-I/O checks passed\\n\";CHECK(write_file(1,ok,sizeof ok-1)>0);\n    return 0;\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "The complete implementation appears in allocator.asm or fileio.asm above; this shared freestanding harness exercises it. Save as test31.c and use test_entry.asm with the section 31.7 build commands. Do not link libc with this brk allocator. A fixed-seed LCG varies sizes and replacement slots over 20000 operations. The test verifies stored bytes before freeing and prints elapsed monotonic nanoseconds. Optional perf stat ./test31 requires permission to access counters; report unavailable counters rather than inventing results."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What system calls are used for file I/O in Linux? List their numbers and arguments.",
        "answer": "Linux x86-64 uses read=0 and write=1 with fd/buffer/count, open=2 with path/flags/mode, close=3 with fd, and lseek=8 with fd/offset/whence. Arguments use RDI, RSI and RDX here. Numbers differ on other architectures."
      },
      {
        "question": "How does brk work? How can you allocate memory using it?",
        "answer": "brk(0) queries the current program break. Request a larger absolute break, then verify the returned address equals the request before using the added region. Raw Linux brk returns the current break on failure rather than the usual negative errno. A custom owner must not compete with libc malloc/sbrk."
      },
      {
        "question": "What is a free list? How does first-fit allocation work?",
        "answer": "A free list links currently available blocks. First-fit scans until capacity is sufficient, removes that block, and splits it only if the remainder can hold a new header plus a useful aligned payload. Search time depends on list length."
      },
      {
        "question": "Why do we need a block header in a memory allocator? What information does it contain?",
        "answer": "A header records capacity and free-list linkage before the returned data. free subtracts the header size to recover metadata. Extra state can support debugging or faster coalescing; the simple allocator assumes valid, single frees."
      },
      {
        "question": "How do you ensure returned pointers from malloc are 16-byte aligned?",
        "answer": "Align the initial heap address and each payload size to 16, and use a header whose size is also divisible by 16. Check addition/rounding overflow before arithmetic; rounding only sizes cannot fix an unaligned heap base."
      },
      {
        "question": "What is the difference between open flags O_WRONLY, O_CREAT, and O_TRUNC?",
        "answer": "O_WRONLY selects write access; O_CREAT creates a missing file using a supplied mode filtered by umask; O_TRUNC truncates an existing regular file when opened for writing. O_CREAT alone does not truncate. The corrected copy checks device/inode identity before truncating."
      },
      {
        "question": "How would you implement realloc? What are the steps?",
        "answer": "NULL input delegates to malloc; this implementation frees and returns NULL for size zero. Reuse sufficient capacity when possible. Otherwise allocate first, copy the old payload, then free the old block. If allocation fails, leave the original allocation intact."
      },
      {
        "question": "Why might you use mmap instead of brk for large allocations?",
        "answer": "Anonymous mmap provides separate mappings that can be unmapped independently, useful for large allocations. It avoids requiring one contiguous program-break region but has page-rounding and mapping overhead. Track each block’s allocation origin before freeing."
      },
      {
        "question": "In copy_file, why do we read in chunks rather than the entire file at once?",
        "answer": "A fixed-size buffer bounds memory consumption and works for large files. A successful read may be short; write may consume only part of that chunk. Retry EINTR, loop until each chunk is written and close descriptors on every path."
      },
      {
        "question": "How can you detect errors from system calls? What does a negative return value mean?",
        "answer": "Most raw Linux syscalls return -errno in the range -4095..-1 on error. The completed wrappers normalize negative results to -1 and do not set libc errno. Zero means EOF for read and success for many other calls; raw brk is a notable exception."
      }
    ],
    "summary": [
      "File I/O in assembly uses system calls directly; wrapping them simplifies usage.",
      "A custom memory allocator uses brk and a free list; first-fit and splitting are straightforward.",
      "Block headers store metadata before user data.",
      "Alignment is crucial; return pointers aligned to 16 bytes.",
      "Modular design with separate files and a Makefile promotes reuse.",
      "Error handling is essential for robustness."
    ]
  },
  {
    "id": 32,
    "slug": "chapter-32-project-5-integrating-assembly-with-c",
    "level": 6,
    "levelTitle": "Advanced Projects",
    "title": "Chapter 32: Project 5: Integrating Assembly with C",
    "subtitle": "Fast Math Library: Calling C from Assembly & Assembly Kernels in C Programs",
    "learningObjectives": [
      "Understand how to integrate assembly language with C programs at the file and function level.",
      "Master the process of writing assembly functions that follow the System V AMD64 ABI and can be called from C.",
      "Learn how to call C library functions (like printf) from assembly.",
      "Use header files to declare external functions and share constants between C and assembly.",
      "Build and link mixed C/assembly projects using gcc and a Makefile.",
      "Debug mixed-language programs using GDB with source-level breakpoints and assembly stepping.",
      "Apply integration techniques to create a high-performance library with assembly kernels and C orchestration."
    ],
    "prerequisites": [
      "Solid understanding of x86-64 assembly, registers, and instructions (Chapters 1–13).",
      "Mastery of calling conventions, stack frames, and the ABI (Chapters 10, 19).",
      "Familiarity with C programming and compilation.",
      "Knowledge of inline assembly basics (Chapter 20).",
      "Experience with modular programming and linking (Chapter 15)."
    ],
    "keyConcepts": [
      "Mixed-language programming combines assembly and C, leveraging C for high-level logic and assembly for performance-critical or hardware-specific code.",
      "The System V AMD64 ABI defines how functions pass arguments (first six in rdi, rsi, rdx, rcx, r8, r9) and return values (rax for integers).",
      "Caller-saved registers can be freely modified; callee-saved registers must be preserved.",
      "When calling C from assembly, link with gcc and declare external symbols using extern.",
      "Header files (.h for C, .inc for assembly) provide consistent declarations.",
      "Alignment of the stack (16-byte before call) is mandatory.",
      "Variadic functions like printf require al set to the number of vector registers used (usually 0 for integer-only calls).",
      "GDB can debug both C and assembly simultaneously when both are compiled with -g."
    ],
    "diagramType": "project_c_integration",
    "sections": [
      {
        "id": "sec-32-1",
        "title": "32.1 Introduction to Integrating Assembly with C",
        "content": "C is the lingua franca of systems programming, but sometimes you need the low-level control or performance of assembly. Integrating the two allows you to write most of the program in C for productivity, while isolating hot spots or hardware-specific code in assembly. This chapter presents a complete project that demonstrates the typical workflow.\n\nWhy mix?\n- Performance: Hand-optimized assembly can outperform compiler-generated code for critical kernels (e.g., SIMD, bit manipulation).\n- Hardware access: Instructions like cpuid, rdtsc, and in/out are not directly available in C without inline assembly or intrinsics.\n- Learning: Understanding how C constructs map to assembly improves your low-level skills.\n\nApproaches:\n1. Separate assembly files: Write assembly functions in .asm files, assemble with NASM, and link with C object files.\n2. Inline assembly: Embed assembly in C using GCC extended asm (covered in Chapter 20).\n3. Compiler intrinsics: Use built-in functions that map to single instructions (not covered here).\n\nThis chapter focuses on separate assembly files, which is the cleanest and most scalable method for substantial assembly code.\n\nClarification: Assembly is not automatically faster than optimized C, and separate calls can add overhead. Privileged port I/O instructions still require suitable OS permission; putting them in assembly does not bypass privilege checks."
      },
      {
        "id": "sec-32-2",
        "title": "32.2 Review of ABI and Calling Conventions",
        "content": "To interface correctly, both sides must agree on:\n\n- Argument passing: first six integer/pointer arguments in rdi, rsi, rdx, rcx, r8, r9; additional on stack.\n- Return value: rax for integer/pointer; xmm0 for floating-point.\n- Callee-saved registers: rbx, rbp, r12–r15. The assembly function must preserve these if it modifies them.\n- Caller-saved registers: rax, rcx, rdx, rsi, rdi, r8–r11 can be freely modified.\n- Stack alignment: Before a call, rsp must be 16-byte aligned. At function entry, rsp is 8 mod 16.\n- Variadic functions: For functions like printf, al must be set to the number of vector registers used to pass arguments (0 if no floating-point arguments).\n\nWhen writing assembly functions called from C, we follow these rules exactly.\n\nClarification: The first-six rule concerns ordinary integer/pointer arguments. Floating arguments use XMM registers, and aggregates follow ABI classification. AL communicates the vector-register argument count (or allowed upper bound), not the total number of printf arguments."
      },
      {
        "id": "sec-32-3",
        "title": "32.3 Project Overview: Fast Math Library",
        "content": "We'll build a small library of assembly functions that perform operations that are either tedious or not directly expressible in C, and then call them from a C main program.\n\nFunctions to implement in assembly:\n\n1. int fast_abs(int x) – returns absolute value without branching.\n2. int max_of_three(int a, int b, int c) – returns maximum of three integers.\n3. int sum_array(int *arr, int len) – sums an array of integers.\n4. int popcount64(unsigned long long x) – counts set bits in a 64-bit integer.\n5. void swap_int(int *a, int *b) – swaps two integers in memory.\n6. int is_power_of_two(unsigned int x) – returns 1 if x is a power of two, 0 otherwise.\n\nC program (main.c) calls these functions, prints results using printf, and verifies correctness.\n\nWe'll also create a header file fastmath.h with prototypes for C, and an assembly header fastmath.inc with extern declarations and constants."
      },
      {
        "id": "sec-32-4",
        "title": "32.4 Writing the Assembly Functions",
        "content": "We'll create fastmath.asm with global symbols for each function."
      },
      {
        "id": "sec-32-4-1",
        "title": "32.4.1 fast_abs",
        "content": "Branchless absolute value using sign mask.\n\nClarification: The positive absolute value of INT_MIN is not representable in int. This routine returns the unchanged INT_MIN bit pattern for that one input; its contract explicitly documents the result rather than claiming a representable mathematical absolute value. Use a wider or unsigned return type for the full magnitude.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "32.4.1 fast_abs — listing 1",
            "code": "global fast_abs\n; int fast_abs(int x)\nfast_abs:\n    mov eax, edi\n    cdq                 ; sign-extend eax into edx (edx = 0 if positive, -1 if negative)\n    xor eax, edx        ; if negative, invert bits\n    sub eax, edx        ; if negative, add 1\n    ret"
          }
        ]
      },
      {
        "id": "sec-32-4-2",
        "title": "32.4.2 max_of_three",
        "content": "Use conditional moves.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "32.4.2 max_of_three — listing 1",
            "code": "global max_of_three\n; int max_of_three(int a, int b, int c)\nmax_of_three:\n    mov eax, edi\n    cmp esi, eax\n    cmovg eax, esi\n    cmp edx, eax\n    cmovg eax, edx\n    ret"
          }
        ]
      },
      {
        "id": "sec-32-4-3",
        "title": "32.4.3 sum_array",
        "content": "Sum array of 32-bit integers.\n\nClarification: sum_array returns a modulo-2^32 sum and zero for nonpositive lengths. Its assembly wrapping behavior should not be compared with a C reference that invokes signed overflow.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "32.4.3 sum_array — listing 1",
            "code": "global sum_array\n; int sum_array(int *arr, int len)\nsum_array:\n    xor eax, eax\n    test esi, esi\n    jle .done\n    xor ecx, ecx\n.loop:\n    add eax, [rdi + rcx*4]\n    inc ecx\n    cmp ecx, esi\n    jl .loop\n.done:\n    ret"
          }
        ]
      },
      {
        "id": "sec-32-4-4",
        "title": "32.4.4 popcount64",
        "content": "Use the popcnt instruction if available (guaranteed on modern x86-64). We'll implement with a fallback loop, but we can use popcnt directly.\n\nClarification: POPCNT is not guaranteed by baseline x86-64. The complete library checks CPUID leaf 1 ECX bit 23 before using it, preserving RBX, and otherwise uses a software loop. The software symbol is exported separately for testing; checking CPUID on every call is simple but adds measurable overhead.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "32.4.4 popcount64 — listing 1",
            "code": "global popcount64\n; int popcount64(unsigned long long x)\npopcount64:\n    popcnt rax, rdi\n    ret",
            "explanation": "If you want a software fallback (for older CPUs), we can write a loop, but we'll assume modern CPU."
          }
        ]
      },
      {
        "id": "sec-32-4-5",
        "title": "32.4.5 swap_int",
        "content": "Swap two integers in memory using xchg or load/store.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "32.4.5 swap_int — listing 1",
            "code": "global swap_int\n; void swap_int(int *a, int *b)\nswap_int:\n    mov eax, [rdi]\n    mov ecx, [rsi]\n    mov [rdi], ecx\n    mov [rsi], eax\n    ret"
          }
        ]
      },
      {
        "id": "sec-32-4-6",
        "title": "32.4.6 is_power_of_two",
        "content": "Check if exactly one bit set.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "32.4.6 is_power_of_two — listing 1",
            "code": "global is_power_of_two\n; int is_power_of_two(unsigned int x)\nis_power_of_two:\n    test edi, edi\n    jz .no\n    lea eax, [rdi - 1]\n    test edi, eax\n    jz .yes\n.no:\n    xor eax, eax\n    ret\n.yes:\n    mov eax, 1\n    ret"
          }
        ]
      },
      {
        "id": "sec-32-5",
        "title": "32.5 Creating the C Program",
        "content": "We'll write main.c that includes fastmath.h and calls these functions.\n\nfastmath.h:",
        "codeSnippets": [
          {
            "language": "c",
            "title": "32.5 Creating the C Program — listing 1",
            "code": "#ifndef FASTMATH_H\n#define FASTMATH_H\n\nint fast_abs(int x);\nint max_of_three(int a, int b, int c);\nint sum_array(int *arr, int len);\nint popcount64(unsigned long long x);\nvoid swap_int(int *a, int *b);\nint is_power_of_two(unsigned int x);\n\n#endif",
            "explanation": "main.c:"
          },
          {
            "language": "c",
            "title": "32.5 Creating the C Program — listing 2",
            "code": "#include <stdio.h>\n#include \"fastmath.h\"\n\nint main() {\n    // Test fast_abs\n    printf(\"fast_abs(-5) = %d\\n\", fast_abs(-5));\n\n    // Test max_of_three\n    printf(\"max_of_three(3, 9, 7) = %d\\n\", max_of_three(3, 9, 7));\n\n    // Test sum_array\n    int arr[] = {1, 2, 3, 4, 5};\n    printf(\"sum_array = %d\\n\", sum_array(arr, 5));\n\n    // Test popcount64\n    printf(\"popcount64(0xF0F0) = %d\\n\", popcount64(0xF0F0));\n\n    // Test swap_int\n    int a = 10, b = 20;\n    swap_int(&a, &b);\n    printf(\"swap_int: a=%d, b=%d\\n\", a, b);\n\n    // Test is_power_of_two\n    printf(\"is_power_of_two(16) = %d\\n\", is_power_of_two(16));\n    printf(\"is_power_of_two(18) = %d\\n\", is_power_of_two(18));\n\n    return 0;\n}"
          }
        ]
      },
      {
        "id": "sec-32-6",
        "title": "32.6 Assembly Header File (Optional)",
        "content": "Create fastmath.inc for use in other assembly files (if needed):",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "32.6 Assembly Header File (Optional) — listing 1",
            "code": "extern fast_abs\nextern max_of_three\nextern sum_array\nextern popcount64\nextern swap_int\nextern is_power_of_two",
            "explanation": "This is optional for this project but demonstrates good practice."
          }
        ]
      },
      {
        "id": "sec-32-7",
        "title": "32.7 Build Process",
        "content": "We'll use nasm to assemble fastmath.asm into an object file, then compile main.c with gcc, and link everything with gcc (which automatically links libc and the C runtime).\n\nCommands:",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "32.7 Build Process — listing 1",
            "code": "nasm -f elf64 fastmath.asm -o fastmath.o\ngcc -c main.c -o main.o\ngcc main.o fastmath.o -o fastmath_test\n./fastmath_test",
            "explanation": "We can automate with a Makefile:"
          },
          {
            "language": "make",
            "title": "32.7 Build Process — listing 2",
            "code": "ASM = nasm\nASMFLAGS = -f elf64\nCC = gcc\nCFLAGS = -Wall -Wextra -O2\n\nTARGET = fastmath_test\nOBJS = main.o fastmath.o\n\nall: $(TARGET)\n\n$(TARGET): $(OBJS)\n\t$(CC) $(OBJS) -o $(TARGET)\n\nmain.o: main.c fastmath.h\n\t$(CC) $(CFLAGS) -c main.c -o main.o\n\nfastmath.o: fastmath.asm\n\t$(ASM) $(ASMFLAGS) fastmath.asm -o fastmath.o\n\nclean:\n\trm -f $(OBJS) $(TARGET)",
            "explanation": "Build and run:"
          },
          {
            "language": "bash",
            "title": "32.7 Build Process — listing 3",
            "code": "make\n./fastmath_test",
            "explanation": "Expected output:"
          },
          {
            "language": "text",
            "title": "32.7 Build Process — listing 4",
            "code": "fast_abs(-5) = 5\nmax_of_three(3, 9, 7) = 9\nsum_array = 15\npopcount64(0xF0F0) = 8\nswap_int: a=20, b=10\nis_power_of_two(16) = 1\nis_power_of_two(18) = 0"
          },
          {
            "language": "nasm",
            "title": "Complete portable-baseline fastmath.asm",
            "code": "default rel\nsection .text\nglobal fast_abs\n; int fast_abs(int x)\nfast_abs:\n    mov eax, edi\n    cdq                 ; sign-extend eax into edx (edx = 0 if positive, -1 if negative)\n    xor eax, edx        ; if negative, invert bits\n    sub eax, edx        ; if negative, add 1\n    ret\nglobal max_of_three\n; int max_of_three(int a, int b, int c)\nmax_of_three:\n    mov eax, edi\n    cmp esi, eax\n    cmovg eax, esi\n    cmp edx, eax\n    cmovg eax, edx\n    ret\nglobal sum_array\n; int sum_array(int *arr, int len)\nsum_array:\n    xor eax, eax\n    test esi, esi\n    jle .done\n    xor ecx, ecx\n.loop:\n    add eax, [rdi + rcx*4]\n    inc ecx\n    cmp ecx, esi\n    jl .loop\n.done:\n    ret\nglobal swap_int\n; void swap_int(int *a, int *b)\nswap_int:\n    mov eax, [rdi]\n    mov ecx, [rsi]\n    mov [rdi], ecx\n    mov [rsi], eax\n    ret\nglobal is_power_of_two\n; int is_power_of_two(unsigned int x)\nis_power_of_two:\n    test edi, edi\n    jz .no\n    lea eax, [rdi - 1]\n    test edi, eax\n    jz .yes\n.no:\n    xor eax, eax\n    ret\n.yes:\n    mov eax, 1\n    ret\nglobal popcount64,popcount64_soft\npopcount64:\n    push rbx\n    mov eax,1\n    xor ecx,ecx\n    cpuid\n    bt ecx,23\n    pop rbx\n    jnc popcount64_soft\n    popcnt rax,rdi\n    ret\npopcount64_soft:\n    xor eax,eax\n.loop:\n    test rdi,rdi\n    jz .done\n    lea rdx,[rdi-1]\n    and rdi,rdx\n    inc eax\n    jmp .loop\n.done:\n    ret\nsection .note.GNU-stack noalloc noexec nowrite progbits",
            "explanation": "Save alongside the original fastmath.h and main.c. All original six public APIs and expected outputs remain available; software popcount provides a baseline fallback."
          }
        ]
      },
      {
        "id": "sec-32-8",
        "title": "32.8 Calling C Functions from Assembly",
        "content": "Sometimes you need to call C library functions (like printf) from assembly. This requires:\n\n1. Declare the C function with extern.\n2. Follow the ABI for arguments.\n3. For variadic functions, set al to the number of vector registers used (usually 0 for integer-only).\n\nExample: Assembly program using printf\n\nClarification: For default PIE linking, use default rel for local data and call printf wrt ..plt. The original -no-pie command intentionally supports its absolute-address version. A normal gcc link already provides _start through runtime startup objects; user code defines main.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "print_hello.asm",
            "code": "; print_hello.asm\nsection .data\n    fmt db 'Hello, %s!', 0xA, 0\n    name db 'World', 0\n\nsection .text\nglobal main\nextern printf\n\nmain:\n    push rbp\n    mov rbp, rsp\n    sub rsp, 16          ; align stack for call (after push rbp, rsp is 16-aligned; sub 16 keeps it)\n    lea rdi, [fmt]\n    lea rsi, [name]\n    xor eax, eax         ; no vector registers\n    call printf\n    xor eax, eax         ; return 0\n    leave\n    ret",
            "explanation": "Assemble and link with gcc:"
          },
          {
            "language": "bash",
            "title": "32.8 Calling C Functions from Assembly — listing 2",
            "code": "nasm -f elf64 print_hello.asm -o print_hello.o\ngcc print_hello.o -o print_hello -no-pie\n./print_hello",
            "explanation": "Note: If linking with gcc and using main as entry, the C runtime initializes and calls main. We must use main instead of _start because the C runtime expects main. If we used _start, we'd bypass the C runtime and printf might not work without initialization. So for C library functions, use main and link with gcc."
          }
        ]
      },
      {
        "id": "sec-32-9",
        "title": "32.9 Debugging Mixed C/Assembly",
        "content": "GDB can debug both languages if compiled with debug info:\n\n- Assemble with -g for NASM.\n- Compile C with -g.\n\nExample:\n\nClarification: Use -g -F dwarf with NASM for explicit debug format. Prefer GDB disassemble /s over deprecated /m. Breakpoints by function name are more reproducible than copied line numbers.",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "32.9 Debugging Mixed C/Assembly — listing 1",
            "code": "nasm -f elf64 -g fastmath.asm -o fastmath.o\ngcc -g -c main.c -o main.o\ngcc main.o fastmath.o -o fastmath_test\ngdb ./fastmath_test",
            "explanation": "In GDB:\n- Set breakpoints at C lines: break main.c:10\n- Set breakpoints at assembly functions: break fast_abs\n- Step through assembly with stepi when inside assembly.\n- Use disassemble /m to see source and assembly interleaved.\n- Examine registers and variables.\n\nThis mixed debugging is powerful for understanding how assembly integrates with C."
          }
        ]
      },
      {
        "id": "sec-32-10",
        "title": "32.10 Performance Considerations",
        "content": "When integrating assembly for performance:\n\n- Keep assembly functions small and focused; let C handle high-level logic.\n- Follow the ABI exactly; any violation can cause subtle bugs.\n- Use callee-saved registers only if needed, and save/restore them properly.\n- Avoid unnecessary stack adjustments; use the red zone if the function is a leaf and doesn't call other functions.\n- Use -O2 or -O3 for C code to avoid pessimizing the overall program.\n- Benchmark with perf to ensure the assembly actually improves performance."
      },
      {
        "id": "sec-32-11",
        "title": "32.11 Possible Extensions",
        "content": "- Add SIMD functions using SSE/AVX for array processing.\n- Implement a function that uses cpuid to query CPU features and returns a string.\n- Create a more complex example: an assembly matrix multiplication kernel called from C.\n- Call C functions from assembly to allocate memory (malloc) and use it in assembly.\n- Build a shared library (.so) from assembly and C, and use dlopen to load it dynamically.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source: Solution 32.2",
            "code": "section .data\n    fmt db '%d', 0xA, 0\nsection .text\nglobal print_int\nextern printf\n\nprint_int:\n    push rbp\n    mov rbp, rsp\n    sub rsp, 16\n    lea rdi, [fmt]\n    mov esi, edi        ; integer argument in esi\n    xor eax, eax\n    call printf\n    leave\n    ret",
            "explanation": "Original source Solution 32.2; see the corrected complete exercise below."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 32.3",
            "code": "sum_array_unrolled:\n    xor eax, eax\n    xor ecx, ecx\n    xor edx, edx\n    mov r8d, esi\n    shr r8d, 2          ; number of 4-element blocks\n    test r8d, r8d\n    jz .remainder\n.loop:\n    add eax, [rdi + rcx*4]\n    add edx, [rdi + rcx*4 + 4]\n    add eax, [rdi + rcx*4 + 8]\n    add edx, [rdi + rcx*4 + 12]\n    add ecx, 4\n    dec r8d\n    jnz .loop\n    add eax, edx\n.remainder:\n    ; handle remaining elements\n    cmp ecx, esi\n    jge .done\n.rem_loop:\n    add eax, [rdi + rcx*4]\n    inc ecx\n    cmp ecx, esi\n    jl .rem_loop\n.done:\n    ret",
            "explanation": "Original source Solution 32.3; see the corrected complete exercise below."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 32.4",
            "code": "my_func:\n    push rbx\n    push r12\n    ; use rbx and r12\n    pop r12\n    pop rbx\n    ret",
            "explanation": "Original source Solution 32.4; see the corrected complete exercise below."
          },
          {
            "language": "c",
            "title": "Complete C exercise caller: test_extensions.c",
            "code": "#define _POSIX_C_SOURCE 200809L\n#include \"fastmath.h\"\n#include <assert.h>\n#include <limits.h>\n#include <stdint.h>\n#include <stdio.h>\n#include <time.h>\nextern long long fast_abs_ll(long long);\nextern void print_int(int);\nextern int sum_array_unrolled(int*,int),popcount64_soft(unsigned long long);\nextern unsigned long long my_func(unsigned long long);\nstatic double now(void){struct timespec t;clock_gettime(CLOCK_MONOTONIC,&t);return t.tv_sec+t.tv_nsec*1e-9;}\nint main(void) {\n    assert(fast_abs(INT_MIN)==INT_MIN && fast_abs(-5)==5);\n    assert(fast_abs_ll(LLONG_MIN)==LLONG_MIN && fast_abs_ll(-5000000000LL)==5000000000LL);\n    assert(max_of_three(INT_MIN,0,INT_MAX)==INT_MAX);\n    assert(popcount64(0)==0 && popcount64(~0ULL)==64 && popcount64_soft(~0ULL)==64);\n    for(unsigned i=0;i<64;i++)assert(popcount64(1ULL<<i)==1 && popcount64_soft(1ULL<<i)==1);\n    assert(my_func(11)==40);int x=3,y=7;swap_int(&x,&y);assert(x==7&&y==3);swap_int(&x,&x);assert(x==7);\n    assert(is_power_of_two(0)==0 && is_power_of_two(0x80000000u)==1);\n    int a[10000];for(int i=0;i<10000;i++)a[i]=(i%101)-50;\n    for(int n=-1;n<10;n++){uint32_t expected=0;for(int i=0;i<n;i++)expected+=(uint32_t)a[i];assert((uint32_t)sum_array(a,n)==expected && (uint32_t)sum_array_unrolled(a,n)==expected);}\n    for(int mode=0;mode<2;mode++){uint32_t total=0;double start=now();for(int i=0;i<10000;i++)total+=(uint32_t)(mode?sum_array_unrolled(a,10000):sum_array(a,10000));printf(\"mode=%d seconds=%.6f checksum=%u\\n\",mode,now()-start,total);}\n    print_int(-123);print_int(0);\n    return 0;\n}",
            "explanation": "Save exercise solutions 1–4 as abs_ll.asm, print_int.asm, unrolled.asm and saved.asm; link with the core library using the next build commands. Both popcount paths are value-tested without assuming POPCNT availability."
          },
          {
            "language": "bash",
            "title": "Build and run all extension exercises",
            "code": "nasm -f elf64 fastmath.asm -o fastmath.o\nfor name in abs_ll print_int unrolled saved; do\n    nasm -f elf64 \"$name.asm\" -o \"$name.o\"\ndone\ngcc -O2 -Wall -Wextra test_extensions.c fastmath.o abs_ll.o print_int.o unrolled.o saved.o -o test_extensions\n./test_extensions\n# Optional: perf stat -e cycles,instructions ./test_extensions",
            "explanation": "The benchmark prints observed durations and checksums; repeat on the intended CPU before making speed claims. Performance-counter permission is not required for its monotonic-clock timing."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-32-1",
        "title": "Exercise 32.1: Add `fast_abs` for 64-bit",
        "description": "Modify fast_abs to work on 64-bit integers (long long). Change the prototype to long long fast_abs_ll(long long x) and implement using cqo and 64-bit registers. Update the C program to test it.",
        "solution": "section .text\nglobal fast_abs_ll\n; long long fast_abs_ll(long long x)\nfast_abs_ll:\n    mov rax, rdi\n    cqo                 ; sign-extend rax into rdx\n    xor rax, rdx\n    sub rax, rdx\n    ret\nsection .note.GNU-stack noalloc noexec nowrite progbits",
        "solutionLanguage": "nasm",
        "solutionExplanation": "C prototype: long long fast_abs_ll(long long x); As with int, LLONG_MIN has no positive long long representation; the routine returns LLONG_MIN for that input by explicit contract. The test below verifies this without calling C llabs on LLONG_MIN."
      },
      {
        "id": "ex-32-2",
        "title": "Exercise 32.2: Assembly Function Calling C",
        "description": "Write an assembly function print_int that takes an integer argument and prints it using printf from C library. The function should be declared in C and called from a C main. Ensure proper stack alignment and al setting.",
        "solution": "default rel\nsection .rodata\nfmt db '%d',10,0\nsection .text\nglobal print_int\nextern printf\nprint_int:\n    mov esi,edi             ; preserve input before replacing RDI\n    lea rdi,[fmt]\n    sub rsp,8               ; entry RSP=8 mod 16 -> call aligned\n    xor eax,eax\n    call printf wrt ..plt\n    add rsp,8\n    ret\nsection .note.GNU-stack noalloc noexec nowrite progbits",
        "solutionLanguage": "nasm",
        "solutionExplanation": "C declaration: void print_int(int x); The original loads the format address into RDI before copying EDI, so it prints address bits instead of the input. This version moves the input first and links with default PIE. Test print_int(-123) and print_int(0)."
      },
      {
        "id": "ex-32-3",
        "title": "Exercise 32.3: Array Sum with Unrolling",
        "description": "Optimize sum_array by unrolling the loop 4 times and using two accumulators. Compare performance with the simple version using perf on a large array.",
        "solution": "section .text\nglobal sum_array_unrolled\nsum_array_unrolled:\n    xor eax, eax\n    test esi,esi\n    jle .done\n    xor ecx, ecx\n    xor edx, edx\n    mov r8d, esi\n    shr r8d, 2          ; number of 4-element blocks\n    test r8d, r8d\n    jz .remainder\n.loop:\n    add eax, [rdi + rcx*4]\n    add edx, [rdi + rcx*4 + 4]\n    add eax, [rdi + rcx*4 + 8]\n    add edx, [rdi + rcx*4 + 12]\n    add ecx, 4\n    dec r8d\n    jnz .loop\n    add eax, edx\n.remainder:\n    ; handle remaining elements\n    cmp ecx, esi\n    jge .done\n.rem_loop:\n    add eax, [rdi + rcx*4]\n    inc ecx\n    cmp ecx, esi\n    jl .rem_loop\n.done:\n    ret\nsection .note.GNU-stack noalloc noexec nowrite progbits",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Unrolled sum: Nonpositive lengths must return before converting the count to four-element blocks. The two accumulators are combined after block processing and the tail covers n modulo four. Use unsigned arithmetic for reference checks."
      },
      {
        "id": "ex-32-4",
        "title": "Exercise 32.4: Use Callee-Saved Registers",
        "description": "Write an assembly function that uses rbx and r12 as temporaries. Show the necessary prologue and epilogue to preserve them. Call it from C.",
        "solution": "section .text\nglobal my_func\n; unsigned long long my_func(unsigned long long x): 3*x+7 modulo 2^64\nmy_func:\n    push rbx\n    push r12\n    mov rbx,rdi\n    lea r12,[rbx+rbx*2]\n    lea rax,[r12+7]\n    pop r12\n    pop rbx\n    ret\nsection .note.GNU-stack noalloc noexec nowrite progbits",
        "solutionLanguage": "nasm",
        "solutionExplanation": " The function now actually uses and restores RBX/R12. It is a leaf; if you add a nested call after these two pushes, add an eight-byte alignment pad first. The C harness checks my_func(11)==40."
      },
      {
        "id": "ex-32-5",
        "title": "Exercise 32.5: Mixed Debugging",
        "description": "Compile the project with debug info, run in GDB, set breakpoints in both C and assembly, and step through the sum_array function to observe registers and stack.",
        "solution": "# Shell commands after saving original main.c/header and complete fastmath.asm:\nnasm -f elf64 -g -F dwarf fastmath.asm -o fastmath.o\ngcc -O0 -g -c main.c -o main.o\ngcc main.o fastmath.o -o fastmath_test\ngdb ./fastmath_test\n# Enter these inside GDB:\n# set disassembly-flavor intel\n# break main\n# break sum_array\n# run\n# continue\n# info registers rdi rsi rax rcx rsp\n# x/5dw $rdi\n# disassemble /s sum_array\n# stepi\n# info frame\n# continue",
        "solutionLanguage": "bash",
        "solutionExplanation": "Original source guidance: Steps described in text. At sum_array entry RDI points to {1,2,3,4,5}, ESI is 5 and RSP mod 16 is 8. Step through accumulator/index updates; final EAX is 15. The caller resumes its printf call after the assembly returns. Use the original main.c as the predictable debug target."
      }
    ],
    "practiceQuestions": [
      {
        "question": "How do you call an assembly function from C? What steps are required?",
        "answer": "Define a global NASM symbol with ABI-compatible arguments and returns, declare its prototype in a C header, assemble as ELF64, compile the C caller, then link both objects with gcc. Use matching types, preserve required registers and add a non-executable GNU-stack note."
      },
      {
        "question": "What is the role of the header file in mixed-language projects?",
        "answer": "The header states parameter types, return types and the calling contract. It lets the C compiler generate correct calls and diagnose mismatches. NASM extern declarations name symbols but do not perform C type checking."
      },
      {
        "question": "Why must you set al to 0 before calling printf from assembly? What happens if you don't?",
        "answer": "For an integer-only variadic call, AL=0 declares that no vector argument registers are used. When passing floating arguments, set the appropriate vector-register count or permitted upper bound. Leaving AL arbitrary violates the ABI and may cause incorrect register-save behavior."
      },
      {
        "question": "What is the difference between using _start and main as entry when linking with gcc?",
        "answer": "_start is the raw process entry; the normal C runtime supplies it and calls main after initialization. Define main and link with gcc to use the normal C runtime. Defining your own _start requires a deliberate startup/link strategy rather than adding it to an ordinary gcc link."
      },
      {
        "question": "Which registers must an assembly function preserve according to the ABI?",
        "answer": "RBX, RBP and R12–R15 must be restored if changed, and RSP must be restored before RET. SysV XMM registers are caller-saved. DF must be clear on entry/return; additional floating-point control-state rules also apply."
      },
      {
        "question": "How do you debug a mixed C/assembly program in GDB? What commands are useful?",
        "answer": "Use NASM -g -F dwarf and GCC -g, then break main or break sum_array. Use stepi, nexti, disassemble /s, info registers, info frame and memory examination. Optimized C may inline functions or remove source variables."
      },
      {
        "question": "Explain the importance of stack alignment when calling C functions from assembly.",
        "answer": "Before an ordinary SysV AMD64 call, RSP must be aligned to 16 bytes; the callee enters with RSP modulo 16 equal to 8. Misalignment can fault in callees using aligned stack operations. Include all pushes, local allocations and outgoing arguments in the calculation."
      },
      {
        "question": "Can you use C library functions like malloc from assembly? How would you declare them?",
        "answer": "Yes: extern malloc, place the size in RDI, align RSP, call malloc wrt ..plt when appropriate, and check the returned RAX for NULL. Preserve live caller-saved values around the call and release successful allocations with the matching free."
      },
      {
        "question": "What are the advantages of keeping assembly in separate files versus inline assembly?",
        "answer": "Separate files offer explicit ABI boundaries, reusable symbols and easier isolated assembly/debugging. Inline asm can integrate with compiler allocation but needs correct constraints, clobbers and volatility. External calls may add overhead and prevent compiler inlining."
      },
      {
        "question": "Write a simple assembly function that returns the length of a string and can be called from C. Show the prototype and implementation.",
        "answer": "C prototype: size_t asm_strlen(const char *s); NASM: global asm_strlen; asm_strlen: xor eax,eax; .loop: cmp byte [rdi+rax],0; je .done; inc rax; jmp .loop; .done: ret. Place each instruction/label on its own line, include <stddef.h> in C, and require a valid terminated string."
      }
    ],
    "summary": [
      "Integrating assembly with C is straightforward if you follow the ABI.",
      "Write assembly functions in separate files, declare them global, and link with gcc.",
      "Use header files to share prototypes.",
      "Call C functions from assembly by declaring extern and linking with gcc; use main as entry for C runtime.",
      "Debug mixed programs with GDB using debug symbols for both languages.",
      "Performance can be improved by writing critical kernels in assembly while keeping high-level logic in C.",
      "Always respect stack alignment, register conventions, and variadic function requirements."
    ]
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
