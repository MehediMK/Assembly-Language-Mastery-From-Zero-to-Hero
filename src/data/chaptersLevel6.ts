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
