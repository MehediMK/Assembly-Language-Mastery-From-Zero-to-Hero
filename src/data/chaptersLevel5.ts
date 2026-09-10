import { Chapter } from '../types';

export const CHAPTERS_LEVEL_5: Chapter[] = [
  {
    "id": 23,
    "slug": "chapter-23-executable-formats-elf-pe",
    "level": 5,
    "levelTitle": "Low-Level Systems and Reverse Engineering",
    "title": "Chapter 23: Executable Formats: ELF and PE",
    "subtitle": "Binary Anatomy, Program & Section Headers, Relocations, and Dynamic Linking",
    "learningObjectives": [
      "Understand what executable file formats are and why they exist.",
      "Master the ELF (Executable and Linkable Format) used on Linux and Unix-like systems.",
      "Explore the PE (Portable Executable) format used on Windows.",
      "Learn the structure of ELF: header, section headers, program headers, symbol tables, and relocation entries.",
      "Understand dynamic linking, the GOT and PLT, and how shared libraries are loaded.",
      "Analyze PE files: DOS header, PE header, optional header, section table, imports, exports, and relocations.",
      "Use tools like readelf, objdump, dumpbin, and hex editors to inspect executable files.",
      "Write assembly programs that interact with executable metadata (e.g., read ELF headers, resolve symbols).",
      "Recognize how executable formats enable loading, linking, and execution of programs."
    ],
    "prerequisites": [
      "Solid understanding of assembly programming and the build process (Chapters 4–5).",
      "Knowledge of system calls and OS interaction (Chapter 16).",
      "Familiarity with memory layout, sections, and linking (Chapters 4, 13).",
      "Basic understanding of dynamic linking and shared libraries (Chapter 4).",
      "Experience with Linux tools like readelf and objdump (Chapter 17)."
    ],
    "keyConcepts": [
      "An executable format defines how machine code, data, and metadata are organized in a file so the operating system can load and run it.",
      "ELF is the standard format for Linux, Unix, and many embedded systems. It supports both executables, relocatable objects, shared libraries, and core dumps.",
      "PE is the format used by Windows. It is based on the older COFF format and includes DOS compatibility headers.",
      "Sections contain code (.text), data (.data), uninitialized data (.bss), read-only data (.rodata), and other metadata.",
      "Segments (program headers in ELF) define memory mappings for loading.",
      "Symbol tables store names and addresses of functions and variables.",
      "Relocations describe how to patch addresses when the final load address is known.",
      "Dynamic linking uses a dynamic linker to resolve symbols at runtime, using structures like the Global Offset Table (GOT) and Procedure Linkage Table (PLT).",
      "Import/Export tables in PE serve a similar purpose for Windows DLLs."
    ],
    "diagramType": "executable_elf_pe",
    "sections": [
      {
        "id": "sec-23-1",
        "title": "23.1 Introduction to Executable Formats",
        "content": "When you assemble and link a program, the output is an executable file containing machine code, data, and metadata that tells the operating system how to load and execute it. The format of this file is crucial because the OS loader must interpret it correctly. Without a standard format, programs could not be shared across different machines or linkers.\n\nTwo dominant formats:\n- ELF (Executable and Linkable Format): Used on Linux, Unix, and many other systems. It is flexible, extensible, and supports static and dynamic linking.\n- PE (Portable Executable): Used on Windows. It evolved from the COFF format and includes DOS headers for backward compatibility.\n\nUnderstanding these formats is essential for low-level programming, reverse engineering, and malware analysis. In this chapter, we'll examine both formats in detail, focusing on ELF (since we use Linux) and providing a thorough overview of PE."
      },
      {
        "id": "sec-23-2",
        "title": "23.2 The ELF Format",
        "content": "ELF is a binary format defined by the Tool Interface Standard (TIS). It describes three main types of files:\n- Relocatable object files (.o): produced by assembler/compiler, contain code and data plus relocation info, not yet executable.\n- Executable files: ready to be loaded into memory and run; no unresolved symbols (unless dynamically linked).\n- Shared object files (.so): libraries that can be loaded at runtime and linked dynamically.\n- Core dumps: snapshots of process memory for debugging.\n\nAn ELF file consists of:\n1. ELF header: describes the file type, machine architecture, entry point, offsets to program and section headers.\n2. Program header table (optional for relocatable): describes segments to be loaded into memory.\n3. Section header table: describes sections (for linking and debugging).\n4. Sections: .text, .data, .bss, .rodata, .symtab, .strtab, .rela.text, etc.\n5. Segments: groups of sections with memory permissions (read, write, execute).\n\nClarification: The list contains four categories, including ET_CORE. ET_DYN also covers PIE executables."
      },
      {
        "id": "sec-23-2-1",
        "title": "23.2.1 ELF Header",
        "content": "The ELF header is the first part of the file. It has a fixed size (64 bytes for 64-bit). It can be inspected with readelf -h.\n\nKey fields:\n- e_ident[16]: magic number (0x7f 'E' 'L' 'F'), class (32/64-bit), data encoding, version.\n- e_type: ET_REL (relocatable), ET_EXEC (executable), ET_DYN (shared/PIE), ET_CORE.\n- e_machine: architecture (e.g., EM_X86_64 = 62).\n- e_version: always 1.\n- e_entry: virtual address of entry point (_start for executables).\n- e_phoff: offset to program header table.\n- e_shoff: offset to section header table.\n- e_flags: architecture-specific flags.\n- e_ehsize: size of ELF header (64 bytes).\n- e_phentsize: size of each program header entry.\n- e_phnum: number of program headers.\n- e_shentsize: size of each section header entry.\n- e_shnum: number of sections.\n- e_shstrndx: index of section name string table.\n\nExample: View ELF header",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "23.2.1 ELF Header — listing 1",
            "code": "readelf -h hello",
            "explanation": "Output:"
          },
          {
            "language": "text",
            "title": "23.2.1 ELF Header — listing 2",
            "code": "ELF Header:\n  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00\n  Class:                             ELF64\n  Data:                              2's complement, little endian\n  Version:                           1 (current)\n  OS/ABI:                            UNIX - System V\n  ABI Version:                       0\n  Type:                              EXEC (Executable file)\n  Machine:                           Advanced Micro Devices X86-64\n  Version:                           0x1\n  Entry point address:               0x400080\n  Start of program headers:          64 (bytes into file)\n  Start of section headers:          1320 (bytes into file)\n  Flags:                             0x0\n  Size of this header:               64 (bytes)\n  Size of program headers:           56 (bytes)\n  Number of program headers:         4\n  Size of section headers:           64 (bytes)\n  Number of section headers:         13\n  Section header string table index: 10"
          }
        ]
      },
      {
        "id": "sec-23-2-2",
        "title": "23.2.2 Program Headers (Segments)",
        "content": "Program headers describe how the file is mapped into memory. Each entry defines a segment with a type, virtual address, file offset, size in file, size in memory, permissions, and alignment.\n\nCommon segment types:\n- PT_LOAD: loadable segment; the loader maps these into memory.\n- PT_DYNAMIC: dynamic linking information.\n- PT_INTERP: path to the dynamic linker (e.g., /lib64/ld-linux-x86-64.so.2).\n- PT_PHDR: location of program header table itself.\n- PT_NOTE: auxiliary information.\n\nView program headers:\n\nClarification: The displayed outputs are illustrative, not a consistent dump from one binary. Iterate p_type to find PT_LOAD; PT_PHDR or PT_INTERP may come first. See the System V ABI: https://refspecs.linuxfoundation.org/elf/gabi4+/ch5.pheader.html",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "23.2.2 Program Headers (Segments) — listing 1",
            "code": "readelf -l hello",
            "explanation": "Example:"
          },
          {
            "language": "text",
            "title": "23.2.2 Program Headers (Segments) — listing 2",
            "code": "Program Headers:\n  Type           Offset             VirtAddr           PhysAddr\n                 FileSiz            MemSiz              Flags  Align\n  PHDR           0x0000000000000040 0x0000000000400040 0x0000000000400040\n                 0x00000000000001f8 0x00000000000001f8  R      8\n  INTERP         0x0000000000000238 0x0000000000400238 0x0000000000400238\n                 0x000000000000001c 0x000000000000001c  R      1\n      [Requesting program interpreter: /lib64/ld-linux-x86-64.so.2]\n  LOAD           0x0000000000000000 0x0000000000400000 0x0000000000400000\n                 0x00000000000000e0 0x00000000000000e0  R E    200000\n  LOAD           0x00000000000000e0 0x00000000006000e0 0x00000000006000e0\n                 0x000000000000001c 0x000000000000001c  RW     200000\n  DYNAMIC        0x00000000000000e0 0x00000000006000e0 0x00000000006000e0\n                 0x000000000000001c 0x000000000000001c  RW     8\n  NOTE           0x0000000000000254 0x0000000000400254 0x0000000000400254\n                 0x0000000000000044 0x0000000000000044  R      4\n  GNU_STACK      0x0000000000000000 0x0000000000000000 0x0000000000000000\n                 0x0000000000000000 0x0000000000000000  RW     10",
            "explanation": "The INTERP segment tells the kernel to load the dynamic linker, which then loads shared libraries and performs relocations before jumping to the entry point."
          }
        ]
      },
      {
        "id": "sec-23-2-3",
        "title": "23.2.3 Sections",
        "content": "Sections are the linkable units of an object file. They contain code, data, symbol tables, relocation entries, and debugging information. In an executable, sections are still present but less critical for execution; program headers are what the loader uses.\n\nCommon sections:\n- .text: executable code.\n- .data: initialized writable data.\n- .bss: uninitialized data (zero-filled at load).\n- .rodata: read-only data (strings, constants).\n- .symtab: symbol table.\n- .strtab: string table for symbol names.\n- .rela.text, .rela.data: relocation entries.\n- .got, .plt: for dynamic linking.\n\nView sections:\n\nClarification: SHT_NOBITS .bss has a logical sh_size but no file-backed payload. Section headers can be absent from an executable; program headers govern loading.",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "23.2.3 Sections — listing 1",
            "code": "readelf -S hello"
          }
        ]
      },
      {
        "id": "sec-23-2-4",
        "title": "23.2.4 Symbol Table",
        "content": "The symbol table maps names to addresses or offsets. It is essential for linking and debugging. Symbols can be functions, variables, or section names.\n\nView symbols:",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "23.2.4 Symbol Table — listing 1",
            "code": "readelf -s hello",
            "explanation": "Example:"
          },
          {
            "language": "text",
            "title": "23.2.4 Symbol Table — listing 2",
            "code": "Symbol table '.symtab' contains 10 entries:\n   Num:    Value          Size Type    Bind   Vis      Ndx Name\n     0: 0000000000000000     0 NOTYPE  LOCAL  DEFAULT  UND\n     1: 00000000004000b0     0 SECTION LOCAL  DEFAULT    1\n     2: 00000000004000d0     0 SECTION LOCAL  DEFAULT    2\n     3: 00000000004000f8     0 SECTION LOCAL  DEFAULT    3\n     4: 00000000006000e0     0 SECTION LOCAL  DEFAULT    4\n     5: 0000000000000000     0 FILE    LOCAL  DEFAULT  ABS hello.o\n     6: 00000000004000b0    43 FUNC    GLOBAL DEFAULT    1 _start\n     7: 00000000006000e0    14 OBJECT  GLOBAL DEFAULT    4 msg\n     8: 0000000000000000     0 NOTYPE  GLOBAL DEFAULT  UND __bss_start\n     9: 0000000000000000     0 NOTYPE  GLOBAL DEFAULT  UND _edata",
            "explanation": "In dynamically linked executables, many symbols are undefined (UND) and resolved at runtime."
          }
        ]
      },
      {
        "id": "sec-23-2-5",
        "title": "23.2.5 Relocations",
        "content": "Relocations describe how to patch addresses when the final load address is known. For relocatable objects, relocations are essential. For executables, if position-independent (PIE), relocations may still be present for dynamic linking.\n\nTwo types:\n- R_X86_64_RELATIVE: relative to base address.\n- R_X86_64_GLOB_DAT: absolute address of a global symbol.\n- R_X86_64_JUMP_SLOT: address of a PLT entry.\n- R_X86_64_PC32: 32-bit PC-relative.\n\nView relocations:\n\nClarification: The list contains four relocation examples. JUMP_SLOT writes the resolved function address into its relocation target, usually a GOT slot, rather than the address of a PLT entry.",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "23.2.5 Relocations — listing 1",
            "code": "readelf -r hello"
          }
        ]
      },
      {
        "id": "sec-23-2-6",
        "title": "23.2.6 Dynamic Linking",
        "content": "Dynamic linking defers symbol resolution to load time. The executable contains a DYNAMIC segment with pointers to the dynamic linker's required structures. The Global Offset Table (GOT) and Procedure Linkage Table (PLT) are used to call shared library functions.\n\n- GOT: table of addresses; initially points to PLT stubs, later patched to actual function addresses.\n- PLT: small stubs that jump through GOT; the first call triggers lazy resolution via the dynamic linker.\n\nWe'll examine these more in Chapter 24 (Disassembly and Reading Compiler-Generated Assembly).\n\nClarification: Only certain function slots initially route through lazy PLT resolution. Other GOT entries hold data addresses; eager binding resolves functions before first use."
      },
      {
        "id": "sec-23-3",
        "title": "23.3 The PE Format",
        "content": "The Portable Executable (PE) format is used by Windows. It is based on COFF (Common Object File Format) and retains a DOS MZ header for backward compatibility. PE files include .exe, .dll, .sys, .obj, etc.\n\nA PE file consists of:\n1. DOS Header (64 bytes): starts with \"MZ\" magic, contains a pointer to the PE header.\n2. DOS Stub: a small DOS program that prints \"This program cannot be run in DOS mode.\"\n3. PE Header: starts with \"PE\\0\\0\" signature, followed by COFF File Header.\n4. Optional Header (not optional for executables): contains entry point, image base, section alignment, file alignment, subsystem, etc.\n5. Section Table: describes each section (.text, .data, .rdata, .idata, .reloc, etc.).\n6. Sections: raw data.\n\nClarification: Ordinary .obj files are COFF objects, not PE images with MZ/PE wrappers. The conventional DOS message is not a required exact string. Reference: https://learn.microsoft.com/en-us/windows/win32/debug/pe-format"
      },
      {
        "id": "sec-23-3-1",
        "title": "23.3.1 DOS Header and Stub",
        "content": "The DOS header is 64 bytes, starting with 0x5A4D (\"MZ\"). At offset 0x3C is a 4-byte offset to the PE header. The DOS stub is a small program that runs in real mode if the file is executed in DOS."
      },
      {
        "id": "sec-23-3-2",
        "title": "23.3.2 PE Header (COFF File Header)",
        "content": "The PE header starts with the signature 0x00004550 (\"PE\\0\\0\"). After that is a COFF File Header:\n\nFields:\n- Machine: target architecture (e.g., 0x8664 for x64).\n- NumberOfSections: number of sections.\n- TimeDateStamp: build timestamp.\n- PointerToSymbolTable: deprecated (0).\n- NumberOfSymbols: deprecated (0).\n- SizeOfOptionalHeader: size of optional header.\n- Characteristics: flags (e.g., executable, 32-bit/64-bit, DLL).\n\nClarification: TimeDateStamp is not reliable evidence of build time, especially with reproducible builds. COFF objects can use the symbol-table fields."
      },
      {
        "id": "sec-23-3-3",
        "title": "23.3.3 Optional Header",
        "content": "The Optional Header contains critical loading information:\n\n- Magic: 0x10B for PE32, 0x20B for PE32+ (64-bit).\n- AddressOfEntryPoint: RVA (relative virtual address) of entry point.\n- ImageBase: preferred load address.\n- SectionAlignment: alignment of sections in memory (usually 0x1000).\n- FileAlignment: alignment of raw data in file (usually 0x200).\n- SizeOfImage: total size in memory.\n- SizeOfHeaders: size of all headers.\n- Subsystem: 2 for GUI, 3 for console.\n- DllCharacteristics: flags like ASLR, DEP, etc.\n- NumberOfRvaAndSizes: number of data directory entries.\n- DataDirectory[16]: array of directories (imports, exports, relocations, TLS, etc.).\n\nClarification: Runtime entry VA = actual image base + entry RVA. RVA is not a file offset. Bound directory reads by the declared optional-header size and directory count; the certificate directory uses a file offset."
      },
      {
        "id": "sec-23-3-4",
        "title": "23.3.4 Section Table",
        "content": "Each section has a header:\n- Name (8 bytes)\n- VirtualSize, VirtualAddress (RVA)\n- SizeOfRawData, PointerToRawData\n- Characteristics (readable, writable, executable)\n\nCommon sections:\n- .text: code\n- .data: initialized data\n- .rdata: read-only data (imports, strings)\n- .idata: import directory\n- .edata: export directory\n- .reloc: base relocations\n- .rsrc: resources\n- .pdata: exception information (64-bit)\n\nClarification: Section names are conventions. For a file-backed RVA inside a section, offset = PointerToRawData + RVA − VirtualAddress; check that the displacement and read length fit SizeOfRawData and the file."
      },
      {
        "id": "sec-23-3-5",
        "title": "23.3.5 Import and Export Tables",
        "content": "PE uses import and export directories to handle DLL linking.\n\n- Import Directory: lists DLLs and functions imported. Each entry points to an Import Lookup Table (ILT) and Import Address Table (IAT). The IAT is patched by the loader with actual function addresses.\n- Export Directory: for DLLs, lists functions exported by name or ordinal."
      },
      {
        "id": "sec-23-3-6",
        "title": "23.3.6 Relocations",
        "content": "PE uses base relocations (.reloc section) for when the image cannot be loaded at its preferred base (e.g., due to ASLR). Relocation entries specify page offsets and type."
      },
      {
        "id": "sec-23-4",
        "title": "23.4 Comparing ELF and PE",
        "content": "ELF is more uniform and flexible; PE carries legacy DOS baggage but is well-documented.",
        "tableData": {
          "headers": [
            "Feature",
            "ELF",
            "PE"
          ],
          "rows": [
            [
              "Platform",
              "Unix/Linux",
              "Windows"
            ],
            [
              "Magic",
              "7f 45 4c 46",
              "4d 5a (\"MZ\")"
            ],
            [
              "Header",
              "ELF header + Program/Section headers",
              "DOS header + PE header + Optional header"
            ],
            [
              "Entry point",
              "e_entry in ELF header",
              "AddressOfEntryPoint in Optional Header"
            ],
            [
              "Dynamic linking",
              "GOT/PLT + dynamic linker",
              "Import Address Table (IAT)"
            ],
            [
              "Relocations",
              ".rela.text etc.",
              ".reloc section"
            ],
            [
              "Shared libraries",
              ".so",
              ".dll"
            ],
            [
              "Tooling",
              "readelf, objdump",
              "dumpbin, objdump (with PE support)"
            ]
          ]
        }
      },
      {
        "id": "sec-23-5",
        "title": "23.5 Tools for Analyzing Executables",
        "content": ""
      },
      {
        "id": "sec-23-5-1",
        "title": "23.5.1 For ELF",
        "content": "- readelf: Display ELF header, sections, program headers, symbols, relocations.\n- objdump: Disassemble, dump sections, show headers.\n- nm: List symbols.\n- ldd: Print shared library dependencies.\n- strings: Extract printable strings.\n- Hex editors (xxd, hexdump) for raw byte analysis.\n\nClarification: For unfamiliar files, inspect dependency metadata with readelf -d or objdump -p; some ldd implementations can execute a file. DT_NEEDED lists direct dependencies, not the complete transitive runtime dependency graph."
      },
      {
        "id": "sec-23-5-2",
        "title": "23.5.2 For PE",
        "content": "- objdump -x file.exe: Display PE header, sections, symbols (if not stripped).\n- dumpbin (Visual Studio): Powerful PE analyzer.\n- PEview, CFF Explorer: GUI tools for detailed inspection.\n- strings, xxd.\n\nOn Linux, you can analyze PE files with objdump (if built with PE support) or use Wine tools."
      },
      {
        "id": "sec-23-6",
        "title": "23.6 Practical Example: Reading ELF Header in Assembly",
        "content": "We can write an assembly program that opens its own executable file and parses the ELF header to print the entry point. This demonstrates understanding of the format.\n\nClarification: The original overwrites the entry address in RAX with the write return count, prints a NUL in the prefix, and does not validate argc, read length or ELF identification. Use the complete corrected parser below. Addresses vary by linker; PIE values are before load bias. This is a bounded header inspector, not a complete ELF validator; it stops at the first PT_LOAD, supports ordinary ELF64 little-endian headers, and explicitly rejects extended program-header counts.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source parser — entry value overwritten by write",
            "code": "; readelf_header.asm\n; Opens own executable (path passed via argv) and prints entry point.\n; Syscalls: open, read, write, close, exit.\n\nsection .data\n    msg db 'Entry point: 0x', 0\n    msg_len equ $ - msg\n    newline db 0xA\n\nsection .bss\n    fd resq 1\n    elf_header resb 64       ; enough for ELF header\n    buffer resb 16           ; for hex conversion\n\nsection .text\nglobal _start\n\n_start:\n    ; open file: argv[1] is at [rsp+16]? Actually _start has argc at [rsp], argv[0] at [rsp+8], argv[1] at [rsp+16]\n    mov rax, 2              ; open\n    mov rdi, [rsp+16]       ; argv[1] = filename\n    xor rsi, rsi            ; O_RDONLY\n    syscall\n    test rax, rax\n    js  .error\n    mov [fd], rax\n\n    ; read first 64 bytes (ELF header)\n    mov rax, 0              ; read\n    mov rdi, [fd]\n    mov rsi, elf_header\n    mov rdx, 64\n    syscall\n\n    ; extract e_entry (offset 0x18 in ELF64 header) - 8 bytes\n    ; For simplicity, we'll assume 64-bit little-endian\n    mov rax, [elf_header + 0x18]   ; entry point\n\n    ; Print message\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, msg\n    mov rdx, msg_len\n    syscall\n\n    ; Convert entry point (in rax) to hex string and print\n    ; We'll store in buffer as 16 hex digits\n    lea rdi, [buffer + 15]\n    mov rcx, 16\n    mov rbx, rax\n.hex_loop:\n    mov rax, rbx\n    and rax, 0xF\n    cmp rax, 10\n    jl  .digit\n    add rax, 'A' - 10\n    jmp .store\n.digit:\n    add rax, '0'\n.store:\n    mov [rdi], al\n    dec rdi\n    shr rbx, 4\n    dec rcx\n    jnz .hex_loop\n\n    ; print buffer\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, buffer\n    mov rdx, 16\n    syscall\n\n    ; newline\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, newline\n    mov rdx, 1\n    syscall\n\n    ; close file\n    mov rax, 3\n    mov rdi, [fd]\n    syscall\n\n    ; exit\n    mov rax, 60\n    xor rdi, rdi\n    syscall\n\n.error:\n    mov rax, 60\n    mov rdi, 1\n    syscall",
            "explanation": "Assemble and run:"
          },
          {
            "language": "bash",
            "title": "23.6 Practical Example: Reading ELF Header in Assembly — listing 2",
            "code": "nasm -f elf64 readelf_header.asm -o readelf_header.o\nld readelf_header.o -o readelf_header\n./readelf_header ./readelf_header",
            "explanation": "Output:"
          },
          {
            "language": "text",
            "title": "23.6 Practical Example: Reading ELF Header in Assembly — listing 3",
            "code": "Entry point: 0x00000000004000B0",
            "explanation": "This demonstrates reading and parsing the ELF header."
          },
          {
            "language": "nasm",
            "title": "Corrected ELF header and PT_LOAD inspector",
            "code": "; Linux x86-64, NASM. Inspect ELF64 little-endian headers, without executing input.\n; nasm -f elf64 elf23.asm -o elf23.o && ld elf23.o -o elf23\n; ./elf23 /bin/true\n; Exit 1: invalid/unsupported/truncated input or I/O error. PN_XNUM unsupported.\ndefault rel\nsection .data\nentry_msg db 'Entry point: 0x'\nentry_len equ $-entry_msg\ncount_msg db 'Program headers (hex): 0x'\ncount_len equ $-count_msg\nload_msg db 'First PT_LOAD vaddr: 0x'\nload_len equ $-load_msg\nnone_msg db 'No PT_LOAD segment',10\nnone_len equ $-none_msg\nhexchars db '0123456789ABCDEF'\nsection .bss\nhdr resb 64\nph resb 56\nhexbuf resb 17\nsection .text\nglobal _start\n_start:\n    cmp qword [rsp],2\n    jne fail\n    mov rdi,[rsp+16]\n    mov eax,2\n    xor esi,esi\n    xor edx,edx\n    syscall\n    test rax,rax\n    js fail\n    mov r12,rax\n    lea rsi,[hdr]\n    mov edx,64\n    xor r10d,r10d\n    call read_exact\n    cmp dword [hdr],0x464c457f\n    jne fail\n    cmp byte [hdr+4],2\n    jne fail\n    cmp byte [hdr+5],1\n    jne fail\n    cmp byte [hdr+6],1\n    jne fail\n    cmp dword [hdr+20],1\n    jne fail\n    cmp word [hdr+52],64\n    jne fail\n    movzx r14d,word [hdr+56]\n    cmp r14d,65535\n    je fail\n    mov rax,[hdr+24]\n    lea rsi,[entry_msg]\n    mov edx,entry_len\n    call print_hex\n    mov eax,r14d\n    lea rsi,[count_msg]\n    mov edx,count_len\n    call print_hex\n    test r14d,r14d\n    jz no_load\n    cmp word [hdr+54],56\n    jne fail\n    mov r13,[hdr+32]\n    cmp r13,64\n    jb fail\nnext_ph:\n    lea rsi,[ph]\n    mov edx,56\n    mov r10,r13\n    call read_exact\n    cmp dword [ph],1\n    je found\n    add r13,56\n    jc fail\n    dec r14d\n    jnz next_ph\nno_load:\n    lea rsi,[none_msg]\n    mov edx,none_len\n    call write_all\n    jmp done\nfound:\n    mov rax,[ph+16]\n    lea rsi,[load_msg]\n    mov edx,load_len\n    call print_hex\ndone:\n    mov eax,3\n    mov rdi,r12\n    syscall\n    xor edi,edi\n    jmp quit\nfail:\n    mov edi,1\nquit:\n    mov eax,60\n    syscall\n; pread64: R12 fd, RSI destination, RDX size, R10 offset.\n; The kernel checks file access; short reads and EINTR are handled.\nread_exact:\n    mov eax,17\n    mov rdi,r12\n    syscall\n    cmp rax,-4\n    je read_exact\n    test rax,rax\n    jle fail\n    add rsi,rax\n    add r10,rax\n    jc fail\n    sub rdx,rax\n    jnz read_exact\n    ret\n; Print RAX as 16 hex digits after prefix RSI/RDX.\nprint_hex:\n    push rax\n    call write_all\n    pop rax\n    lea rdi,[hexbuf+15]\n    lea r8,[hexchars]\n    mov ecx,16\n.hex:\n    mov r9,rax\n    and r9d,15\n    mov r9b,[r8+r9]\n    mov [rdi],r9b\n    dec rdi\n    shr rax,4\n    loop .hex\n    mov byte [hexbuf+16],10\n    lea rsi,[hexbuf]\n    mov edx,17\nwrite_all:\n    mov eax,1\n    mov edi,1\n    syscall\n    cmp rax,-4\n    je write_all\n    test rax,rax\n    jle fail\n    add rsi,rax\n    sub rdx,rax\n    jnz write_all\n    ret\nsection .note.GNU-stack noalloc noexec nowrite progbits",
            "explanation": "Reports entry, program-header count in hexadecimal, and first PT_LOAD address. Handles short reads, EINTR and missing/truncated input. Kernel process exit closes the descriptor on errors."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-23-1",
        "title": "Exercise 23.1: Explore ELF Sections",
        "description": "Use readelf -S on a simple assembly executable. List the sections and their flags. Identify which sections are loaded into memory (look at program headers).",
        "solution": "readelf -SW ./elf23\nreadelf -lW ./elf23\n# Compare section flags and the Section to Segment mapping.\n# A=allocated, W=writable, X=executable; .bss is NOBITS.",
        "solutionExplanation": "Use readelf -S hello. Sections like .text have AX flags (allocated, executable), .data have WA, .bss has WA but no file size. Program headers show which sections map to memory. More precisely, .bss may show a nonzero section size although its zero-filled bytes occupy no file payload.",
        "solutionLanguage": "bash"
      },
      {
        "id": "ex-23-2",
        "title": "Exercise 23.2: Parse ELF Program Headers",
        "description": "Modify the assembly program in 23.6 to also print the number of program headers (e_phnum at offset 0x38) and the virtual address of the first PT_LOAD segment.",
        "solution": "; Linux x86-64, NASM. Inspect ELF64 little-endian headers, without executing input.\n; nasm -f elf64 elf23.asm -o elf23.o && ld elf23.o -o elf23\n; ./elf23 /bin/true\n; Exit 1: invalid/unsupported/truncated input or I/O error. PN_XNUM unsupported.\ndefault rel\nsection .data\nentry_msg db 'Entry point: 0x'\nentry_len equ $-entry_msg\ncount_msg db 'Program headers (hex): 0x'\ncount_len equ $-count_msg\nload_msg db 'First PT_LOAD vaddr: 0x'\nload_len equ $-load_msg\nnone_msg db 'No PT_LOAD segment',10\nnone_len equ $-none_msg\nhexchars db '0123456789ABCDEF'\nsection .bss\nhdr resb 64\nph resb 56\nhexbuf resb 17\nsection .text\nglobal _start\n_start:\n    cmp qword [rsp],2\n    jne fail\n    mov rdi,[rsp+16]\n    mov eax,2\n    xor esi,esi\n    xor edx,edx\n    syscall\n    test rax,rax\n    js fail\n    mov r12,rax\n    lea rsi,[hdr]\n    mov edx,64\n    xor r10d,r10d\n    call read_exact\n    cmp dword [hdr],0x464c457f\n    jne fail\n    cmp byte [hdr+4],2\n    jne fail\n    cmp byte [hdr+5],1\n    jne fail\n    cmp byte [hdr+6],1\n    jne fail\n    cmp dword [hdr+20],1\n    jne fail\n    cmp word [hdr+52],64\n    jne fail\n    movzx r14d,word [hdr+56]\n    cmp r14d,65535\n    je fail\n    mov rax,[hdr+24]\n    lea rsi,[entry_msg]\n    mov edx,entry_len\n    call print_hex\n    mov eax,r14d\n    lea rsi,[count_msg]\n    mov edx,count_len\n    call print_hex\n    test r14d,r14d\n    jz no_load\n    cmp word [hdr+54],56\n    jne fail\n    mov r13,[hdr+32]\n    cmp r13,64\n    jb fail\nnext_ph:\n    lea rsi,[ph]\n    mov edx,56\n    mov r10,r13\n    call read_exact\n    cmp dword [ph],1\n    je found\n    add r13,56\n    jc fail\n    dec r14d\n    jnz next_ph\nno_load:\n    lea rsi,[none_msg]\n    mov edx,none_len\n    call write_all\n    jmp done\nfound:\n    mov rax,[ph+16]\n    lea rsi,[load_msg]\n    mov edx,load_len\n    call print_hex\ndone:\n    mov eax,3\n    mov rdi,r12\n    syscall\n    xor edi,edi\n    jmp quit\nfail:\n    mov edi,1\nquit:\n    mov eax,60\n    syscall\n; pread64: R12 fd, RSI destination, RDX size, R10 offset.\n; The kernel checks file access; short reads and EINTR are handled.\nread_exact:\n    mov eax,17\n    mov rdi,r12\n    syscall\n    cmp rax,-4\n    je read_exact\n    test rax,rax\n    jle fail\n    add rsi,rax\n    add r10,rax\n    jc fail\n    sub rdx,rax\n    jnz read_exact\n    ret\n; Print RAX as 16 hex digits after prefix RSI/RDX.\nprint_hex:\n    push rax\n    call write_all\n    pop rax\n    lea rdi,[hexbuf+15]\n    lea r8,[hexchars]\n    mov ecx,16\n.hex:\n    mov r9,rax\n    and r9d,15\n    mov r9b,[r8+r9]\n    mov [rdi],r9b\n    dec rdi\n    shr rax,4\n    loop .hex\n    mov byte [hexbuf+16],10\n    lea rsi,[hexbuf]\n    mov edx,17\nwrite_all:\n    mov eax,1\n    mov edi,1\n    syscall\n    cmp rax,-4\n    je write_all\n    test rax,rax\n    jle fail\n    add rsi,rax\n    sub rdx,rax\n    jnz write_all\n    ret\nsection .note.GNU-stack noalloc noexec nowrite progbits",
        "solutionExplanation": "Add code to read e_phnum (2 bytes at offset 0x38) and e_phoff (8 bytes at offset 0x20). Then read the first program header entry (56 bytes) to get p_vaddr (offset 0x10 in program header). Print these. Correction: the first entry need not be PT_LOAD. The complete solution iterates entries, validates the 56-byte entry size, and reports no load segment when none exists.",
        "solutionLanguage": "nasm"
      },
      {
        "id": "ex-23-3",
        "title": "Exercise 23.3: PE Header Analysis",
        "description": "If you have a Windows executable or can create one with a cross-compiler, use objdump -x or a PE tool to view the DOS header, PE header, and sections. Note the entry point and image base.",
        "solution": "objdump -x file.exe\nobjdump -h file.exe\nxxd -l 64 file.exe\n# On a Visual Studio developer command prompt:\n# dumpbin /headers file.exe\n# Record AddressOfEntryPoint (RVA), ImageBase and section permissions.",
        "solutionExplanation": "If using objdump -x file.exe, look for \"PE signature found\" and the subsequent headers. The entry point is in the optional header. Tool wording varies; do not require the literal PE signature found. Compare the MZ bytes and e_lfanew with the PE signature in a hex viewer. A Windows executable is a prerequisite for this optional exercise.",
        "solutionLanguage": "bash"
      },
      {
        "id": "ex-23-4",
        "title": "Exercise 23.4: Dynamic Linking Structures",
        "description": "For a dynamically linked ELF executable (e.g., one using printf), use readelf -d to view the dynamic section. Identify the DT_NEEDED entries and the address of the GOT.",
        "solution": "cat > program.c <<'C'\n#include <stdio.h>\nint main(int argc, char **argv) {\n    (void)argv;\n    printf(\"argc=%d\\n\", argc);\n    return 0;\n}\nC\ngcc -O0 program.c -o program\nreadelf -dW ./program\nreadelf -rW ./program\nreadelf -SW ./program\n# Inspect NEEDED, PLTGOT when present, and .got/.got.plt sections.",
        "solutionExplanation": "readelf -d ./program shows NEEDED libc.so.6, GOT address, etc. PLTGOT is a dynamic tag when present; exact addresses and relocation layout depend on the linker and build options.",
        "solutionLanguage": "bash"
      },
      {
        "id": "ex-23-5",
        "title": "Exercise 23.5: Symbol Resolution",
        "description": "Write an assembly program that defines a global variable and a function. Use nm to list symbols and their addresses. Compare with readelf -s.",
        "solution": "; nasm -f elf64 symbols.asm -o symbols.o\n; ld symbols.o -o symbols\n; nm -n symbols; readelf -sW symbols\n; ./symbols; echo $?      # 42\ndefault rel\nsection .data\nglobal value:data\nvalue dq 41\nsection .text\nglobal _start\nglobal increment:function\nincrement:\n    inc qword [value]\n    mov rax,[value]\n    ret\n_start:\n    call increment\n    mov rdi,rax\n    mov eax,60\n    syscall\nsection .note.GNU-stack noalloc noexec nowrite progbits",
        "solutionExplanation": "Define symbols in .data and .text with global. After linking, nm program shows addresses and types. nm reports D for value and T for increment; readelf reports OBJECT and FUNC because NASM global declarations include type annotations. Compare addresses from your own linked file.",
        "solutionLanguage": "nasm"
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is an executable format? Why are they standardized?",
        "answer": "A binary contract describing code, data, addresses and loader/linker metadata. Standardization lets compatible assemblers, linkers, debuggers and loaders exchange files; architecture and ABI compatibility are still required."
      },
      {
        "question": "Name the three main types of ELF files and explain their purposes.",
        "answer": "ET_REL holds linkable objects, ET_EXEC holds executable images, and ET_DYN holds shared objects or PIE executables. ET_CORE is a fourth category containing process-state snapshots."
      },
      {
        "question": "What is the difference between a section and a segment in ELF?",
        "answer": "Sections organize material for linking and analysis; segments describe runtime mappings. One PT_LOAD can include several sections. Execution can work without a section header table."
      },
      {
        "question": "How does dynamic linking work in ELF? Explain the roles of GOT and PLT.",
        "answer": "The interpreter reads dynamic metadata, loads dependencies and applies relocations. GOT entries contain resolved addresses; PLT stubs dispatch indirect function calls. Lazy resolution is optional, and eager binding can fill slots before execution."
      },
      {
        "question": "What is the purpose of the DOS header in a PE file?",
        "answer": "The MZ header preserves DOS compatibility and its e_lfanew field at file offset 0x3C locates the PE signature. The following DOS stub is separate from native Windows code."
      },
      {
        "question": "Describe the structure of a PE file. What are the major components?",
        "answer": "DOS header and stub, PE signature, COFF file header, optional header, section table, then section data and associated directories. Bounds and optional-header magic must be checked before reading fields."
      },
      {
        "question": "How are imports and exports handled in PE? What are the IAT and EAT?",
        "answer": "Import descriptors identify DLLs and imported names/ordinals; the loader writes resolved addresses to the IAT. The export address table contains exported RVAs, with name/ordinal mappings and possible forwarders."
      },
      {
        "question": "Compare ELF and PE in terms of entry point specification and dynamic linking.",
        "answer": "ELF e_entry is a link-time virtual address; PIE adds its load bias. PE AddressOfEntryPoint is an RVA added to the actual image base. ELF uses dynamic metadata and often GOT/PLT; PE uses import descriptors and the IAT."
      },
      {
        "question": "What is a relocation? Why are relocations needed?",
        "answer": "A relocation describes an address-dependent fixup. Linkers or loaders apply it when symbol placement or load addresses become known. PC-relative references may avoid some runtime fixups but not every relocation."
      },
      {
        "question": "How can you determine the entry point of an ELF executable using readelf? For a PE using objdump?",
        "answer": "Use readelf -h file and read Entry point address. For PE use objdump -x file.exe and inspect AddressOfEntryPoint and ImageBase; add the RVA to the actual load base for a runtime VA."
      }
    ],
    "summary": [
      "Executable formats define how code and data are organized for loading and execution.",
      "ELF is the standard on Linux; it consists of an ELF header, program headers (segments), section headers, and sections.",
      "ELF supports relocatable objects, executables, shared libraries, and core dumps.",
      "Dynamic linking uses the GOT and PLT, with the dynamic linker resolving symbols at runtime.",
      "PE is the Windows format, with DOS headers, PE header, optional header, sections, and import/export tables.",
      "Tools like readelf, objdump, nm, ldd help analyze ELF files; dumpbin and PE viewers for PE.",
      "Understanding executable formats is foundational for reverse engineering, malware analysis, and systems programming.",
      "In the next chapter, we'll learn to disassemble and read compiler-generated assembly, applying this knowledge to understand optimized binaries."
    ]
  },
  {
    "id": 24,
    "slug": "chapter-24-disassembly-reading-compiler-assembly",
    "level": 5,
    "levelTitle": "Low-Level Systems and Reverse Engineering",
    "title": "Chapter 24: Disassembly and Reading Compiler-Generated Assembly",
    "subtitle": "Decoding C Constructs: If-Else, Loops, Switch Tables, and Optimizations",
    "learningObjectives": [
      "Understand the role of disassembly in analyzing binary executables and object files.",
      "Master tools for disassembling: objdump, gdb disassemble, ndisasm, and llvm-objdump.",
      "Learn to read and interpret compiler-generated assembly from C/C++ code at various optimization levels.",
      "Recognize common assembly patterns for functions, loops, conditionals, switch statements, and data structures.",
      "Identify stack frame setup and teardown, parameter passing, and return value handling according to the ABI.",
      "Understand how compiler optimizations transform source code: inlining, loop unrolling, vectorization, and tail-call elimination.",
      "Apply this knowledge to reverse engineering and debugging tasks."
    ],
    "prerequisites": [
      "Solid understanding of x86-64 assembly, registers, addressing modes, and instructions (Chapters 1–13).",
      "Familiarity with the build process, object files, and executable formats (Chapters 4, 23).",
      "Knowledge of calling conventions and stack frames (Chapter 10).",
      "Basic C programming experience.",
      "Ability to use command-line tools like gcc, objdump, and gdb (Chapters 4, 17)."
    ],
    "keyConcepts": [
      "Disassembly is the process of converting machine code back into assembly language.",
      "Compiler-generated assembly reflects the compiler’s implementation of high-level constructs, often with optimizations.",
      "Optimization levels (-O0, -O1, -O2, -O3, -Os, -Og) trade off speed, size, and debuggability.",
      "Prologue and epilogue set up and tear down the stack frame; may be omitted in leaf functions or with frame pointer omission.",
      "Function calls follow the ABI: arguments in registers (first six), return in rax.",
      "Loops are implemented with conditional jumps; compilers may unroll or vectorize.",
      "Switch statements may use jump tables or decision trees.",
      "Arrays and structs are accessed via base+offset addressing.",
      "Tail calls may be optimized into jumps.",
      "Debug symbols (-g) greatly aid disassembly by providing names and source line mappings."
    ],
    "diagramType": "disassembly_analysis",
    "sections": [
      {
        "id": "sec-24-1",
        "title": "24.1 Introduction to Disassembly",
        "content": "Disassembly is the reverse of assembly: it translates raw machine code into human-readable assembly instructions. While high-level decompilation aims to recover C-like code, disassembly works at the instruction level and is essential for understanding compiler output, reverse engineering, and debugging.\n\nWhy read compiler-generated assembly?\n- To verify what the compiler did and identify inefficiencies.\n- To debug optimized code where source-level debugging is difficult.\n- To reverse engineer proprietary or malware binaries.\n- To learn optimization techniques used by compilers.\n\nDisassemblers rely on binary analysis and may struggle with variable-length x86 instructions, indirect jumps, and data embedded in code. However, with proper symbols and section information, disassembly is usually straightforward."
      },
      {
        "id": "sec-24-2",
        "title": "24.2 Tools for Disassembly",
        "content": ""
      },
      {
        "id": "sec-24-2-1",
        "title": "24.2.1 objdump",
        "content": "The most common Linux disassembler. For Intel syntax (preferred):",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "24.2.1 objdump — listing 1",
            "code": "objdump -d -M intel ./program",
            "explanation": "Options:\n- -d: disassemble executable sections.\n- -D: disassemble all sections (including data, sometimes producing garbage if data is interpreted as code).\n- -M intel: use Intel syntax.\n- -S: intermix source lines if debug info available.\n- --start-address=, --stop-address=: limit range."
          }
        ]
      },
      {
        "id": "sec-24-2-2",
        "title": "24.2.2 GDB Disassemble",
        "content": "Inside GDB:\n\nClarification: Prefer disassemble /s for source mixed with assembly; /m is deprecated and can omit instructions after optimization. Use set disassembly-flavor intel and disassemble /r for bytes. Reference: https://sourceware.org/gdb/current/onlinedocs/gdb.html/Machine-Code.html",
        "codeSnippets": [
          {
            "language": "gdb",
            "title": "24.2.2 GDB Disassemble — listing 1",
            "code": "disassemble /m function_name\ndisassemble 0x400080, 0x4000a0",
            "explanation": "The /m option shows source lines mixed with assembly if debug info present."
          }
        ]
      },
      {
        "id": "sec-24-2-3",
        "title": "24.2.3 ndisasm",
        "content": "The NASM disassembler, useful for raw binary blobs:\n\nClarification: ndisasm does not interpret ELF sections or relocations. Extract a known code region first, select the correct bitness and supply its origin with -o when useful.",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "24.2.3 ndisasm — listing 1",
            "code": "ndisasm -b64 file.bin"
          }
        ]
      },
      {
        "id": "sec-24-2-4",
        "title": "24.2.4 llvm-objdump",
        "content": "Similar to GNU objdump, part of LLVM toolchain:",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "24.2.4 llvm-objdump — listing 1",
            "code": "llvm-objdump -d -M intel ./program"
          }
        ]
      },
      {
        "id": "sec-24-3",
        "title": "24.3 Compiler Optimization Levels",
        "content": "GCC offers various optimization levels that dramatically affect generated assembly.\n\n\n\nWe'll examine examples at -O0 and -O2 to see the difference.\n\nClarification: Exact enabled passes depend on compiler version and target. Current GCC documents loop and SLP vectorization at -O2 with a very-cheap cost model; -O3 uses a more permissive model. A flag enables an opportunity, not a guaranteed transformation. Inspect gcc -Q -O2 --help=optimizers. Reference: https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html",
        "tableData": {
          "headers": [
            "Flag",
            "Description"
          ],
          "rows": [
            [
              "-O0",
              "No optimization; code is straightforward, with many stack accesses. Good for debugging."
            ],
            [
              "-O1",
              "Basic optimizations: constant folding, dead code elimination, some inlining."
            ],
            [
              "-O2",
              "More aggressive: instruction scheduling, loop unrolling, vectorization (with -ftree-vectorize enabled by default at -O2 for some targets?), but not always."
            ],
            [
              "-O3",
              "Aggressive: more inlining, loop unrolling, function cloning, and vectorization."
            ],
            [
              "-Os",
              "Optimize for size: similar to -O2 but avoids code bloat."
            ],
            [
              "-Og",
              "Optimize for debugging: enables optimizations that do not interfere with debug experience."
            ]
          ]
        }
      },
      {
        "id": "sec-24-3-1",
        "title": "24.3.1 Example: Simple Function at Different Optimization Levels",
        "content": "C code:",
        "codeSnippets": [
          {
            "language": "c",
            "title": "24.3.1 Example: Simple Function at Different Optimization Levels — listing 1",
            "code": "int add(int a, int b) {\n    return a + b;\n}",
            "explanation": "Compile with -S -masm=intel to see assembly:\n\nAt -O0:"
          },
          {
            "language": "text",
            "title": "24.3.1 Example: Simple Function at Different Optimization Levels — listing 2 (illustrative compiler assembly)",
            "code": "add:\n    push    rbp\n    mov     rbp, rsp\n    mov     DWORD PTR [rbp-4], edi\n    mov     DWORD PTR [rbp-8], esi\n    mov     edx, DWORD PTR [rbp-4]\n    mov     eax, DWORD PTR [rbp-8]\n    add     eax, edx\n    pop     rbp\n    ret",
            "explanation": "At -O0, the compiler stores arguments to stack, reloads them, and uses eax for sum. No optimization.\n\nAt -O2:"
          },
          {
            "language": "text",
            "title": "24.3.1 Example: Simple Function at Different Optimization Levels — listing 3 (illustrative compiler assembly)",
            "code": "add:\n    lea     eax, [rdi+rsi]\n    ret",
            "explanation": "The function simply uses lea to compute sum and returns. No stack frame needed.\n\nThis shows how optimization removes redundant memory operations."
          }
        ]
      },
      {
        "id": "sec-24-3-2",
        "title": "24.3.2 Impact on Function Prologue/Epilogue",
        "content": "- At -O0, almost every function uses push rbp; mov rbp, rsp; ...; pop rbp; ret to establish a frame pointer, making stack accesses clear.\n- At -O2, many functions omit the frame pointer (-fomit-frame-pointer is default at -O1 and higher for x86-64), using rsp-relative addressing or not touching the stack at all if no locals."
      },
      {
        "id": "sec-24-4",
        "title": "24.4 Reading Compiler-Generated Assembly: Function Calls",
        "content": "Understanding how compilers translate function calls is fundamental."
      },
      {
        "id": "sec-24-4-1",
        "title": "24.4.1 Calling a Simple Function",
        "content": "C code:\n\nClarification: The shown out-of-line call is illustrative; the supplied tiny function is commonly inlined at -O2. Put foo in a separate translation unit and disable LTO to inspect the call reliably. Some compiler analyses also avoid unnecessary stack adjustments for known callees.",
        "codeSnippets": [
          {
            "language": "c",
            "title": "24.4.1 Calling a Simple Function — listing 1",
            "code": "int foo(int x) { return x * 2; }\nint bar(int a) {\n    int b = foo(a);\n    return b + 1;\n}",
            "explanation": "Assembly at -O2 (Intel syntax):"
          },
          {
            "language": "text",
            "title": "24.4.1 Calling a Simple Function — listing 2 (illustrative compiler assembly)",
            "code": "foo:\n    lea     eax, [rdi+rdi]      ; x*2\n    ret\n\nbar:\n    sub     rsp, 8              ; align stack? (actually to maintain alignment for call)\n    call    foo                 ; rdi still holds a\n    add     eax, 1\n    add     rsp, 8\n    ret",
            "explanation": "Here foo is inlined? Not necessarily; -O2 may inline small functions, but if not inlined, the call is present. Observe:\n- rdi is passed unchanged to foo.\n- After call, result in eax, then add 1.\n- Note the sub rsp, 8 before call to keep stack 16-byte aligned (since at function entry, rsp is 8 mod 16, and call pushes 8 bytes, so after sub rsp,8, rsp is 0 mod 16 before call). Good."
          }
        ]
      },
      {
        "id": "sec-24-4-2",
        "title": "24.4.2 Passing Arguments",
        "content": "First six integer args in rdi, rsi, rdx, rcx, r8, r9. Additional args on stack.\n\nExample:\n\nClarification: These are System V AMD64 integer/pointer rules, not universal first-six rules. Read the seventh argument at RSP+8 only before stack changes; with push rbp / mov rbp,rsp it is at RBP+16.",
        "codeSnippets": [
          {
            "language": "c",
            "title": "24.4.2 Passing Arguments — listing 1",
            "code": "int many_args(int a, int b, int c, int d, int e, int f, int g) {\n    return a+b+c+d+e+f+g;\n}",
            "explanation": "At -O2, g is on stack at [rsp+8] after prologue? Actually at function entry, 7th arg is at [rsp+8] (since return address at [rsp]). The compiler may use mov eax, [rsp+8] to load it."
          }
        ]
      },
      {
        "id": "sec-24-4-3",
        "title": "24.4.3 Returning Values",
        "content": "Integers/pointers returned in eax/rax. Floating-point in xmm0. Large structs may use hidden pointer."
      },
      {
        "id": "sec-24-5",
        "title": "24.5 Control Flow Patterns",
        "content": ""
      },
      {
        "id": "sec-24-5-1",
        "title": "24.5.1 If-Else",
        "content": "C:",
        "codeSnippets": [
          {
            "language": "c",
            "title": "24.5.1 If-Else — listing 1",
            "code": "int max(int a, int b) {\n    if (a > b)\n        return a;\n    else\n        return b;\n}",
            "explanation": "At -O2:"
          },
          {
            "language": "text",
            "title": "24.5.1 If-Else — listing 2 (illustrative compiler assembly)",
            "code": "max:\n    cmp     edi, esi\n    jle     .L2\n    mov     eax, edi\n    ret\n.L2:\n    mov     eax, esi\n    ret",
            "explanation": "Or using cmovg if profitable:"
          },
          {
            "language": "text",
            "title": "24.5.1 If-Else — listing 3 (illustrative compiler assembly)",
            "code": "max:\n    cmp     edi, esi\n    mov     eax, esi\n    cmovg   eax, edi\n    ret",
            "explanation": "The compiler may choose branchless version for unpredictable branches."
          }
        ]
      },
      {
        "id": "sec-24-5-2",
        "title": "24.5.2 Loops",
        "content": "C:\n\nClarification: Signed overflow in C is undefined. Use a bounded positive n for this demonstration; the original loop also overflows its induction variable at INT_MAX. The displayed instructions illustrate a possible pattern, not a promised gcc output.",
        "codeSnippets": [
          {
            "language": "c",
            "title": "24.5.2 Loops — listing 1",
            "code": "int sum(int n) {\n    int s = 0;\n    for (int i = 1; i <= n; i++)\n        s += i;\n    return s;\n}",
            "explanation": "At -O2, the loop may be optimized into a closed-form formula (arithmetic progression) or kept as loop. If kept:"
          },
          {
            "language": "text",
            "title": "24.5.2 Loops — listing 2 (illustrative compiler assembly)",
            "code": "sum:\n    xor     eax, eax\n    test    edi, edi\n    jle     .L2\n    mov     ecx, 1\n.L3:\n    add     eax, ecx\n    inc     ecx\n    cmp     ecx, edi\n    jle     .L3\n.L2:\n    ret",
            "explanation": "Or with unrolling. Compilers often use induction variable optimization."
          }
        ]
      },
      {
        "id": "sec-24-5-3",
        "title": "24.5.3 Switch Statements",
        "content": "Switch statements can be compiled to:\n- Jump table (dense case values): a table of code addresses, indexed by the switch expression.\n- Decision tree (sparse values): a series of comparisons and jumps.\n\nExample jump table:\n\nClarification: The listing mixes compiler/GAS directives with explanatory semicolon comments; it is not a complete NASM program. PIC jump tables often contain signed 32-bit offsets added to a table base. Returning 10,20,30,40 may become arithmetic without any table.",
        "codeSnippets": [
          {
            "language": "text",
            "title": "24.5.3 Switch Statements — listing 1 (illustrative compiler assembly)",
            "code": "    mov     eax, edi\n    cmp     eax, 3\n    ja      .Ldefault\n    lea     rdx, [.L4]\n    mov     rax, [rdx + rax*8]\n    jmp     rax\n.L4:\n    .quad   .Lcase0\n    .quad   .Lcase1\n    .quad   .Lcase2\n    .quad   .Lcase3"
          }
        ]
      },
      {
        "id": "sec-24-6",
        "title": "24.6 Data Structures and Access",
        "content": ""
      },
      {
        "id": "sec-24-6-1",
        "title": "24.6.1 Arrays",
        "content": "Array access uses scaled indexed addressing.\n\nC:",
        "codeSnippets": [
          {
            "language": "c",
            "title": "24.6.1 Arrays — listing 1",
            "code": "int get(int *arr, int i) {\n    return arr[i];\n}",
            "explanation": "At -O2:"
          },
          {
            "language": "text",
            "title": "24.6.1 Arrays — listing 2 (illustrative compiler assembly)",
            "code": "get:\n    movsxd  rax, esi        ; sign-extend i\n    mov     eax, [rdi + rax*4]\n    ret",
            "explanation": "Notice movsxd to sign-extend 32-bit int to 64-bit for address calculation."
          }
        ]
      },
      {
        "id": "sec-24-6-2",
        "title": "24.6.2 Structures",
        "content": "Structure members accessed via base+offset.\n\nC:",
        "codeSnippets": [
          {
            "language": "c",
            "title": "24.6.2 Structures — listing 1",
            "code": "struct Point { int x; int y; };\nint get_x(struct Point *p) { return p->x; }",
            "explanation": "At -O2:"
          },
          {
            "language": "text",
            "title": "24.6.2 Structures — listing 2 (illustrative compiler assembly)",
            "code": "get_x:\n    mov     eax, [rdi]      ; offset 0\n    ret",
            "explanation": "If get_y:"
          },
          {
            "language": "text",
            "title": "24.6.2 Structures — listing 3 (illustrative compiler assembly)",
            "code": "get_y:\n    mov     eax, [rdi+4]\n    ret"
          }
        ]
      },
      {
        "id": "sec-24-6-3",
        "title": "24.6.3 Linked Lists / Pointer Chasing",
        "content": "C:\n\nClarification: The source snippet omits the Node definition and uses an unnecessary int pointer cast. The typed example below supplies the layout. Both node and node->next must point to valid objects.",
        "codeSnippets": [
          {
            "language": "c",
            "title": "24.6.3 Linked Lists / Pointer Chasing — listing 1",
            "code": "int get_next_value(int *node) {\n    return ((struct Node*)node)->next->value;\n}",
            "explanation": "Assembly involves multiple dereferences."
          },
          {
            "language": "c",
            "title": "Complete typed pointer-chasing example",
            "code": "struct Node { int value; struct Node *next; };\nint get_next_value(struct Node *node) { return node->next->value; }",
            "explanation": "On typical SysV x86-64, next is at offset 8 and value at offset 0. Inspect generated assembly rather than assuming this for every ABI."
          }
        ]
      },
      {
        "id": "sec-24-7",
        "title": "24.7 Compiler Optimizations in Assembly",
        "content": ""
      },
      {
        "id": "sec-24-7-1",
        "title": "24.7.1 Inlining",
        "content": "Small functions may be inlined into callers, eliminating call overhead.\n\nBefore inlining:",
        "codeSnippets": [
          {
            "language": "text",
            "title": "24.7.1 Inlining — listing 1 (illustrative compiler assembly)",
            "code": "call foo",
            "explanation": "After inlining, the body of foo appears directly."
          }
        ]
      },
      {
        "id": "sec-24-7-2",
        "title": "24.7.2 Tail Call Optimization",
        "content": "If a function call is the last operation before return, the compiler may replace call/ret with jmp.\n\nC:",
        "codeSnippets": [
          {
            "language": "c",
            "title": "24.7.2 Tail Call Optimization — listing 1",
            "code": "int f(int x) { return g(x); }",
            "explanation": "At -O2:"
          },
          {
            "language": "text",
            "title": "24.7.2 Tail Call Optimization — listing 2 (illustrative compiler assembly)",
            "code": "f:\n    jmp     g       ; tail call"
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 24.4",
            "code": "int g(int x) { return x*2; }\nint f(int x) { return g(x); }",
            "explanation": "Original source solution: g can be inlined, so -O2 does not guarantee jmp g. See the exercise for a separate-translation-unit experiment."
          }
        ]
      },
      {
        "id": "sec-24-7-3",
        "title": "24.7.3 Loop Unrolling and Vectorization",
        "content": "Compilers may unroll loops to reduce branch overhead or use SSE/AVX to process multiple elements.\n\nExample: sum of array may be vectorized to use addps or paddd.\n\nClarification: Floating-point reduction order affects rounding. Reassociation for vectorized floating sums may require relaxed math flags; packed integer sums have different constraints."
      },
      {
        "id": "sec-24-7-4",
        "title": "24.7.4 Strength Reduction",
        "content": "Replace multiplication by constant with shifts/adds."
      },
      {
        "id": "sec-24-7-5",
        "title": "24.7.5 Constant Folding",
        "content": "Expressions with constants are evaluated at compile time."
      },
      {
        "id": "sec-24-8",
        "title": "24.8 Reading Optimized vs Unoptimized Code",
        "content": "Understanding optimization level helps set expectations.\n\nClarification: The comparison describes tendencies, not guarantees: -O0 need not preserve every call or always use RBP, and optimized code can grow through inlining and unrolling.",
        "tableData": {
          "headers": [
            "Feature",
            "-O0",
            "-O2"
          ],
          "rows": [
            [
              "Stack frame",
              "Always uses rbp",
              "Often omits rbp"
            ],
            [
              "Variable storage",
              "Many stack spills",
              "Mostly registers"
            ],
            [
              "Branches",
              "Direct translation",
              "May use conditional moves"
            ],
            [
              "Loops",
              "Simple, unoptimized",
              "Possibly unrolled/vectorized"
            ],
            [
              "Function calls",
              "Always call",
              "May inline or tail-call"
            ],
            [
              "Code size",
              "Larger, simpler",
              "Smaller/faster, harder to read"
            ]
          ]
        }
      },
      {
        "id": "sec-24-9",
        "title": "24.9 Practical Examples",
        "content": ""
      },
      {
        "id": "sec-24-9-1",
        "title": "24.9.1 Disassemble a Simple Program",
        "content": "Create hello.c:\n\nClarification: GCC can replace printf with puts for this fixed string even at -O0. To preserve printf for this inspection, use -fno-builtin-printf. Use objdump -d -M intel --disassemble=main hello to isolate main.",
        "codeSnippets": [
          {
            "language": "c",
            "title": "24.9.1 Disassemble a Simple Program — listing 1",
            "code": "#include <stdio.h>\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}",
            "explanation": "Compile with symbols and no optimization:"
          },
          {
            "language": "bash",
            "title": "24.9.1 Disassemble a Simple Program — listing 2",
            "code": "gcc -O0 -g hello.c -o hello",
            "explanation": "Disassemble:"
          },
          {
            "language": "bash",
            "title": "24.9.1 Disassemble a Simple Program — listing 3",
            "code": "objdump -d -M intel hello | grep -A20 '<main>:'",
            "explanation": "Observe prologue, call to printf via PLT, and epilogue."
          }
        ]
      },
      {
        "id": "sec-24-9-2",
        "title": "24.9.2 Analyze a Function with GDB",
        "content": "Load binary in GDB, break at function, disassemble:\n\nClarification: Run gdb ./hello at the shell, then enter the remaining commands inside GDB. Use disassemble /s main for current source-mixed output.",
        "codeSnippets": [
          {
            "language": "gdb",
            "title": "24.9.2 Analyze a Function with GDB — listing 1",
            "code": "gdb ./hello\nbreak main\nrun\ndisassemble /m\nstepi\ninfo registers"
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-24-1",
        "title": "Exercise 24.1: Disassemble and Identify",
        "description": "Write a C function that swaps two integers using a temporary variable. Compile with -O0 and -O2, disassemble, and explain the differences.",
        "solution": "void swap(int *a, int *b) {\n    int tmp = *a;\n    *a = *b;\n    *b = tmp;\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "C code:\n\n-O0: uses stack for tmp, loads/stores.\n-O2: uses registers, no stack. Save this C listing as exercise.c; compile with gcc -O0 -g -c exercise.c -o exercise-O0.o and gcc -O2 -g -c exercise.c -o exercise-O2.o, then compare objdump -dr -M intel on both objects."
      },
      {
        "id": "ex-24-2",
        "title": "Exercise 24.2: Recognize Loop Pattern",
        "description": "Write a C function that sums elements of an array of 100 ints. Compile with -O2. Identify loop induction variable, loop exit condition, and any vectorization.",
        "solution": "int sum(int *arr, int n) {\n    int s = 0;\n    for (int i=0; i<n; i++) s += arr[i];\n    return s;\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "C code:\n\n-O2 may use lea and add with pointer increments, or vectorized. Save this C listing as exercise.c; compile with gcc -O0 -g -c exercise.c -o exercise-O0.o and gcc -O2 -g -c exercise.c -o exercise-O2.o, then compare objdump -dr -M intel on both objects. Call sum with n=100 and a valid 100-element array. Test values 0..99, whose sum is 4950. Use -fopt-info-vec-all to inspect vectorization decisions; identify scalar cleanup as well as the main loop."
      },
      {
        "id": "ex-24-3",
        "title": "Exercise 24.3: Switch Statement",
        "description": "Write a C function with a switch statement on an integer 0-3 returning different values. Compile with -O2. Determine if a jump table is used. Show the table entries.",
        "solution": "int f(int x) {\n    switch(x) {\n        case 0: return 10;\n        case 1: return 20;\n        case 2: return 30;\n        case 3: return 40;\n    }\n    return -1;\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "C code:\n\nCompile -O2, look for jump table. Save this C listing as exercise.c; compile with gcc -O0 -g -c exercise.c -o exercise-O0.o and gcc -O2 -g -c exercise.c -o exercise-O2.o, then compare objdump -dr -M intel on both objects. The linear return values usually become 10*(x+1), guarded by an unsigned range test, so there may be no table entries to show. Inspect objdump -s -j .rodata only if that section exists; a constants table is distinct from a control-flow jump table."
      },
      {
        "id": "ex-24-4",
        "title": "Exercise 24.4: Tail Call",
        "description": "Write two C functions where one tail-calls the other. Compile with -O2 and verify that the call is replaced by a jump.",
        "solution": "# Save and run as a shell script in an exercise directory.\ncat > g.c <<'C'\nint g(int x) { return x*2; }\nC\ncat > f.c <<'C'\nextern int g(int);\nint f(int x) { return g(x); }\nC\ngcc -O2 -fno-lto -c f.c -o f.o\ngcc -O2 -fno-lto -c g.c -o g.o\nobjdump -dr -M intel f.o\n# Compare with a build where sibling-call optimization is disabled:\ngcc -O2 -fno-lto -fno-optimize-sibling-calls -c f.c -o f-call.o\nobjdump -dr -M intel f-call.o",
        "solutionLanguage": "bash",
        "solutionExplanation": "-O2: f becomes jmp g. Save this C listing as exercise.c; compile with gcc -O0 -g -c exercise.c -o exercise-O0.o and gcc -O2 -g -c exercise.c -o exercise-O2.o, then compare objdump -dr -M intel on both objects. Run the shell commands above. An external g prevents local inlining without LTO; look for a tail jmp plus relocation in f.o and call/ret in f-call.o."
      },
      {
        "id": "ex-24-5",
        "title": "Exercise 24.5: Struct Access",
        "description": "Define a struct with three fields, write a function that returns the third field. Disassemble and show the offset used.",
        "solution": "struct S { int a; char b; long c; };\nlong get_c(struct S *s) { return s->c; }",
        "solutionLanguage": "c",
        "solutionExplanation": "Offset for c likely 8 or 16 depending on alignment. Disassemble and observe [rdi+8] or [rdi+16]. Save this C listing as exercise.c; compile with gcc -O0 -g -c exercise.c -o exercise-O0.o and gcc -O2 -g -c exercise.c -o exercise-O2.o, then compare objdump -dr -M intel on both objects. Under the chapter’s SysV AMD64 LP64 ABI, c is at offset 8: int occupies 0–3, char occupies 4, padding occupies 5–7, long occupies 8–15. Check with offsetof(struct S,c); offset 16 is not the default for this definition."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is disassembly? How does it differ from decompilation?",
        "answer": "Disassembly decodes machine instructions into mnemonics and operands. Decompilation infers higher-level constructs; neither generally recovers original variable names, comments or exact source without debug information."
      },
      {
        "question": "Which tool would you use to disassemble an ELF binary with Intel syntax?",
        "answer": "objdump -d -M intel program disassembles executable sections of an ELF binary. Add -S for available debug source mappings, or --disassemble=function to focus the output."
      },
      {
        "question": "What are the typical prologue and epilogue instructions for a function with a frame pointer? How does -O2 change this?",
        "answer": "Common setup is push rbp; mov rbp,rsp; sub rsp,N. Teardown is mov rsp,rbp; pop rbp; ret, often expressed as leave; ret. Optimization may omit the frame pointer or the whole frame."
      },
      {
        "question": "How are function arguments passed according to the System V AMD64 ABI? Where are additional arguments beyond six passed?",
        "answer": "For ordinary integer/pointer arguments, RDI, RSI, RDX, RCX, R8 and R9 are used; later arguments use the stack. At an unmodified entry, the seventh integer argument is at RSP+8. Floating arguments use XMM registers; aggregates follow ABI classification."
      },
      {
        "question": "How can you identify a switch statement that uses a jump table in assembly? Show an example.",
        "answer": "A bounds check precedes an indexed load and indirect jump, for example cmp edi,3; ja default; lea rdx,[rel table]; movsxd rax,dword [rdx+rdi*4]; add rax,rdx; jmp rax. This assumes EDI has been zero-extended. The entries here are signed relative code offsets. A table whose loaded value is returned directly is a value table, not a jump table."
      },
      {
        "question": "What is tail call optimization? How does it appear in assembly?",
        "answer": "A eligible final call can reuse the caller return address after restoring its frame, using jmp target. Inlining may eliminate the call entirely, so use separate translation units without LTO to observe a tail jump."
      },
      {
        "question": "How does a compiler typically implement a loop? What are induction variables?",
        "answer": "Look for initialization, a condition, a back edge, and an update. An induction variable changes predictably each iteration, such as an index incrementing by one or a pointer advancing by four bytes. Vector loops may advance by several elements."
      },
      {
        "question": "In optimized code, why might a function not use a frame pointer? What are the trade-offs?",
        "answer": "Omitting RBP saves setup/teardown instructions and makes another register available. Stack offsets may change with RSP, making manual analysis harder; unwind metadata can still support stack traces."
      },
      {
        "question": "How can you tell if an array is being accessed? What addressing mode is used?",
        "answer": "An address such as [rdi+rax*4] suggests four-byte elements, while [rdi+rax*8] suggests eight-byte elements. Track base and index origins: scaled addressing alone does not prove an array or its bounds."
      },
      {
        "question": "Why is it important to know the optimization level when analyzing assembly?",
        "answer": "Optimization can remove variables, fold arithmetic, reorder instructions, inline calls and transform loops. Knowing flags and compiler version helps avoid treating illustrative patterns as guaranteed instruction sequences."
      }
    ],
    "summary": [
      "Disassembly converts machine code to assembly; tools like objdump and GDB are essential.",
      "Compiler-generated assembly varies with optimization level; -O0 is simple but verbose, -O2 is optimized and often uses registers, omits frame pointer, and may inline functions.",
      "Recognize patterns: prologues/epilogues, function calls, loops, switches, array/struct access.",
      "Tail calls become jumps; loops may be unrolled/vectorized.",
      "Understanding ABI and optimization levels is crucial for reading compiler output.",
      "Practice by compiling small snippets and analyzing.",
      "In the next chapter, we’ll delve into stack frames, prologues, and epilogues in more detail."
    ]
  },
  {
    id: 25,
    slug: 'chapter-25-stack-frames-prologues-epilogues',
    level: 5,
    levelTitle: 'Low-Level Systems and Reverse Engineering',
    title: 'Chapter 25: Stack Frames, Prologues, and Epilogues',
    subtitle: 'Standard Frames, Frame Pointer Omission (FPO), Alloca, and Red Zone',
    learningObjectives: [
      'Master prologue and epilogue variations across compilers.',
      'Analyze stack layout for functions with more than 6 arguments.',
      'Understand how dynamic allocation (alloca, VLAs) affects stack pointer tracking.',
      'Recognize red zone usage in stripped leaf functions.'
    ],
    prerequisites: ['Chapters 1–24'],
    keyConcepts: [
      'Frame pointer rbp provides constant offset references even when rsp changes.',
      'Without a frame pointer, all variables are accessed relative to rsp.',
      'The 128-byte red zone enables leaf functions to eliminate sub rsp / add rsp.'
    ],
    diagramType: 'stack_frames_prologues',
    sections: [
      {
        id: 'sec-25-1',
        title: '25.1 Dynamic Stack Allocation (alloca Mechanics)',
        content: `Dynamic stack allocation adjusts rsp at runtime, relying on rbp for stable local variable referencing:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'dynamic_alloc.asm',
            code: `dynamic_alloc:
    push rbp
    mov rbp, rsp
    sub rsp, rdi          ; allocate N bytes dynamically at runtime
    ; [rsp] points to the dynamic buffer
    ; [rbp-8] still reliably accesses static local variables!
    mov rsp, rbp          ; deallocates entire frame and dynamic buffer instantly!
    pop rbp
    ret`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-25-1',
        title: 'Exercise 25.1: Nine Arguments Stack Layout',
        description: 'Map the stack layout for a function taking 9 arguments.',
        solution: 'Args 1-6 in registers (rdi..r9). Arg 7 at [rbp+16], Arg 8 at [rbp+24], Arg 9 at [rbp+32]. Return address is at [rbp+8], saved rbp at [rbp].'
      }
    ],
    practiceQuestions: [
      {
        question: 'Why does alloca deallocate in O(1) time?',
        answer: 'Because the epilogue simply executes mov rsp, rbp (or leave), which restores the stack pointer to the base pointer, reclaiming all dynamically allocated stack bytes in a single instruction.'
      }
    ],
    summary: ['Stack frames manage execution state and locals.', 'Frame pointers simplify debugging and dynamic allocation.']
  },
  {
    id: 26,
    slug: 'chapter-26-reverse-engineering-fundamentals',
    level: 5,
    levelTitle: 'Low-Level Systems and Reverse Engineering',
    title: 'Chapter 26: Reverse Engineering Fundamentals',
    subtitle: 'Static & Dynamic Triage, Symbol Stripping, Control Flow Graphs, and Ghidra/radare2',
    learningObjectives: [
      'Establish a rigorous reverse engineering workflow from triage to reporting.',
      'Identify function boundaries and entry points in stripped binaries.',
      'Reconstruct high-level data structures from memory access offsets.',
      'Perform dynamic analysis using GDB, radare2, and strace.',
      'Analyze a compiled keygen to extract hidden passcodes.'
    ],
    prerequisites: ['Chapters 1–25'],
    keyConcepts: [
      'Static analysis examines binaries without execution; dynamic analysis observes runtime state.',
      'Stripped binaries remove symbol tables, requiring heuristic function boundary detection.',
      'Tracing system calls with strace rapidly exposes file, network, and process behavior.'
    ],
    diagramType: 'reverse_engineering',
    sections: [
      {
        id: 'sec-26-1',
        title: '26.1 Cracking a Keygen via Dynamic Analysis',
        content: `Setting breakpoints on strcmp in GDB to inspect password arguments:`,
        codeSnippets: [
          {
            language: 'gdb',
            title: 'gdb_keygen_cracking',
            code: `(gdb) break strcmp
(gdb) run wrong_pass
Breakpoint 1, __strcmp_avx2 ()
(gdb) x/s $rdi
0x7fffffffe180: "wrong_pass"
(gdb) x/s $rsi
0x4006c4: "secret_access_key"    # Secret passcode revealed in second argument!`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-26-1',
        title: 'Exercise 26.1: Static Triage Workflow',
        description: 'Run file, checksec, strings, and readelf on an unknown binary.',
        solution: 'file target && checksec --file=target && strings -a target | grep -E "(pass|key|flag)" && readelf -h target',
        solutionLanguage: 'bash'
      }
    ],
    practiceQuestions: [
      {
        question: 'How do you locate the main function in a stripped Linux ELF binary?',
        answer: 'Inspect the ELF entry point _start. _start sets up arguments and calls __libc_start_main. The first argument passed in RDI is the address of the user\'s main function.'
      }
    ],
    summary: ['Reverse engineering unites static disassembly and live runtime debugging.', 'Always conduct analysis within isolated virtual environments.']
  },
  {
    id: 27,
    slug: 'chapter-27-optimized-binaries-malware-analysis',
    level: 5,
    levelTitle: 'Low-Level Systems and Reverse Engineering',
    title: 'Chapter 27: Understanding Optimized Binaries and Basic Malware Analysis',
    subtitle: 'Obfuscation, Anti-Analysis, Persistence Mechanisms, and Simulated Keylogger Triage',
    learningObjectives: [
      'Deconstruct obfuscation techniques: control flow flattening and opaque predicates.',
      'Identify anti-debugging checks: ptrace self-attachment and TracerPid inspection.',
      'Detect virtual machine and sandbox environments (CPUID hypervisor bit).',
      'Analyze malware persistence mechanisms (cron jobs, Run keys, services).',
      'Perform safe dynamic analysis on a simulated Linux keylogger.'
    ],
    prerequisites: ['Chapters 1–26'],
    keyConcepts: [
      'Control flow flattening hides natural function hierarchy with a state machine switch loop.',
      'Anti-debugging detects debuggers through timing anomalies or ptrace collisions.',
      'Indicators of Compromise (IOCs) capture file hashes, registry keys, and network telemetry.'
    ],
    diagramType: 'malware_analysis',
    sections: [
      {
        id: 'sec-27-1',
        title: '27.1 Simulated Linux Keylogger Triage',
        content: `Analyzing a binary that opens /dev/input/event0 and logs keystrokes to /tmp/keys.log:`,
        codeSnippets: [
          {
            language: 'bash',
            title: 'Dynamic strace Analysis',
            code: `$ strace ./keylog
openat(AT_FDCWD, "/dev/input/event0", O_RDONLY) = 3
openat(AT_FDCWD, "/tmp/keys.log", O_WRONLY|O_CREAT|O_APPEND, 0600) = 4
read(3, {type=EV_KEY, code=KEY_H, value=1}, 24) = 24
write(4, "h", 1) = 1`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-27-1',
        title: 'Exercise 27.1: CPUID Hypervisor Detection',
        description: 'Check bit 31 of ECX using cpuid leaf 1 to detect VM execution.',
        solution: `mov eax, 1\ncpuid\ntest ecx, 0x80000000   ; bit 31 = hypervisor present\njnz .vm_detected`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'How does ptrace(PTRACE_TRACEME) detect an active debugger?',
        answer: 'Linux allows only a single parent process to trace a child at any time. If GDB is already attached, a call to ptrace(PTRACE_TRACEME) fails and returns -1, alerting the program.'
      }
    ],
    summary: ['Malware evades analysis using obfuscation and sandbox checks.', 'Dynamic execution in monitored sandboxes exposes malicious payloads.']
  }
];
