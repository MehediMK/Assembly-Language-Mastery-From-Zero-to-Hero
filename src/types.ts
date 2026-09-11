export interface ChapterSection {
  id: string;
  title: string;
  content: string;
  codeSnippets?: {
    language: 'text' | 'nasm' | 'c' | 'bash' | 'gdb' | 'python' | 'make' | 'arm' | 'riscv' | 'mips';
    title?: string;
    code: string;
    explanation?: string;
  }[];
  tableData?: {
    headers: string[];
    rows: string[][];
  };
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  hints?: string;
  solution: string;
  solutionLanguage?: 'text' | 'nasm' | 'c' | 'bash' | 'gdb' | 'python' | 'make' | 'arm' | 'riscv' | 'mips';
  solutionExplanation?: string;
}

export interface PracticeQuestion {
  question: string;
  answer: string;
}

export interface Chapter {
  id: number;
  slug: string;
  level: number;
  levelTitle: string;
  title: string;
  subtitle?: string;
  learningObjectives: string[];
  prerequisites: string[];
  keyConcepts: string[];
  sections: ChapterSection[];
  diagramType?: 
    | 'cpu_architecture'
    | 'data_representation'
    | 'registers_memory'
    | 'toolchain_pipeline'
    | 'basic_instructions_flags'
    | 'addressing_modes'
    | 'arithmetic_logical'
    | 'control_flow'
    | 'strings_arrays'
    | 'procedures_stack'
    | 'recursion_locals'
    | 'advanced_pointers'
    | 'structures_memory'
    | 'simd_floating'
    | 'macros_modular'
    | 'syscalls_os'
    | 'gdb_debugging'
    | 'cpu_pipeline_cache'
    | 'abi_register_alloc'
    | 'inline_assembly'
    | 'optimization_techniques'
    | 'atomic_concurrency'
    | 'executable_elf_pe'
    | 'disassembly_analysis'
    | 'stack_frames_prologues'
    | 'reverse_engineering'
    | 'malware_analysis'
    | 'project_calculator'
    | 'project_string_lib'
    | 'project_sorting_utils'
    | 'project_allocator'
    | 'project_c_integration'
    | 'project_mini_vm'
    | 'project_shell'
    | 'embedded_mcu'
    | 'mmio_peripherals'
    | 'interrupts_nvic'
    | 'low_power'
    | 'bootloaders'
    | 'shellcoding'
    | 'buffer_overflow'
    | 'rop_code_reuse'
    | 'anti_debugging'
    | 'defensive_assembly'
    | 'arm_assembly'
    | 'riscv_assembly'
    | 'mips_architecture'
    | 'isa_comparison'
    | 'portable_assembly';
  exercises: Exercise[];
  practiceQuestions: PracticeQuestion[];
  summary: string[];
}

export interface BookLevel {
  level: number;
  title: string;
  tagline: string;
  description: string;
  chapterRange: [number, number];
}

export type ThemeMode = 'light' | 'dark' | 'sepia' | 'terminal';
export type FontMode = 'sans' | 'serif' | 'mono';
export type ReaderViewMode = 'reader' | 'book-spread' | 'print-preview' | 'interactive-lab';
