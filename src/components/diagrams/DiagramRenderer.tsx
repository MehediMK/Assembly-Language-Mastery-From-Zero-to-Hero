import React, { useState } from 'react';
import { 
  Cpu, Layers, Binary, ShieldAlert, Zap, Terminal, Split, Server,
  ArrowRight, CheckCircle2, RotateCw, Activity, Database, GitBranch
} from 'lucide-react';

interface DiagramProps {
  type?: string;
  chapterTitle?: string;
}

export const DiagramRenderer: React.FC<DiagramProps> = ({ type }) => {
  // Interactive states for specific diagrams
  const [activeCycleStep, setActiveCycleStep] = useState<number>(0);
  const [binaryVal, setBinaryVal] = useState<number>(42);
  const [selectedReg, setSelectedReg] = useState<string>('rax');
  const [flagOpA, setFlagOpA] = useState<number>(10);
  const [flagOpB, setFlagOpB] = useState<number>(20);

  // 1. CPU Architecture & Instruction Cycle Diagram
  if (type === 'cpu_architecture' || type === 'cpu_pipeline_cache') {
    const cycleSteps = [
      { name: '1. FETCH', desc: 'Read instruction bytes from memory address in RIP', color: 'bg-teal-600 text-white' },
      { name: '2. DECODE', desc: 'Control Unit interprets opcode (1–15 bytes in x86)', color: 'bg-indigo-600 text-white' },
      { name: '3. EXECUTE', desc: 'ALU/FPU performs arithmetic, logic, or jump calculation', color: 'bg-emerald-600 text-white' },
      { name: '4. WRITE-BACK', desc: 'Result stored to destination register or cache/RAM', color: 'bg-amber-600 text-white' }
    ];

    return (
      <div className="my-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:border-slate-300 print:shadow-none">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Interactive CPU Microarchitecture & Instruction Cycle</span>
          </div>
          <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
            System Schematic
          </span>
        </div>

        {/* Visual CPU Block Diagram */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Layers className="h-4 w-4 text-teal-600" /> Control Unit (CU)
            </h4>
            <div className="mt-3 space-y-2 text-xs">
              <div className="rounded border border-indigo-200 bg-indigo-50 p-2 dark:border-indigo-900/40 dark:bg-indigo-950/30">
                <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300">RIP (Instruction Pointer)</span>
                <p className="mt-0.5 text-slate-600 dark:text-slate-400">Holds next virtual instruction address</p>
              </div>
              <div className="rounded border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">Instruction Decoder</span>
                <p className="mt-0.5 text-slate-600 dark:text-slate-400">Decodes 1-15 byte variable length x86</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Cpu className="h-4 w-4 text-emerald-600" /> Execution Units
            </h4>
            <div className="mt-3 space-y-2 text-xs">
              <div className="rounded border border-emerald-200 bg-emerald-50 p-2 dark:border-emerald-900/40 dark:bg-emerald-950/30">
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">ALU (Arithmetic Logic Unit)</span>
                <p className="mt-0.5 text-slate-600 dark:text-slate-400">add, sub, mul, div, and, or, xor, shifts</p>
              </div>
              <div className="rounded border border-amber-200 bg-amber-50 p-2 dark:border-amber-900/40 dark:bg-amber-950/30">
                <span className="font-mono font-bold text-amber-700 dark:text-amber-300">RFLAGS Register</span>
                <p className="mt-0.5 text-slate-600 dark:text-slate-400">ZF (Zero), SF (Sign), CF (Carry), OF (Overflow)</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Database className="h-4 w-4 text-sky-600" /> Registers & Caches
            </h4>
            <div className="mt-3 space-y-2 text-xs">
              <div className="rounded border border-sky-200 bg-sky-50 p-2 dark:border-sky-900/40 dark:bg-sky-950/30">
                <span className="font-mono font-bold text-sky-700 dark:text-sky-300">16x 64-bit GPRs</span>
                <p className="mt-0.5 text-slate-600 dark:text-slate-400">RAX, RBX, RCX, RDX, RSI, RDI, RSP, RBP, R8-R15</p>
              </div>
              <div className="rounded border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">L1/L2/L3 Cache Hierarchy</span>
                <p className="mt-0.5 text-slate-600 dark:text-slate-400">64-byte Cache Lines with spatial locality</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Step Slider */}
        <div className="mt-6 rounded-lg bg-slate-100/70 p-4 dark:bg-slate-950/60 print:hidden">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
            <span>Cycle Stage: <strong>{cycleSteps[activeCycleStep].name}</strong></span>
            <button 
              onClick={() => setActiveCycleStep((prev) => (prev + 1) % 4)}
              className="inline-flex items-center gap-1 rounded bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200"
            >
              <RotateCw className="h-3 w-3" /> Step Pipeline
            </button>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {cycleSteps.map((step, idx) => (
              <button
                key={step.name}
                onClick={() => setActiveCycleStep(idx)}
                className={`rounded-md p-2.5 text-left text-xs transition-all ${
                  activeCycleStep === idx
                    ? `${step.color} ring-2 ring-teal-500 ring-offset-1`
                    : 'bg-white text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-400'
                }`}
              >
                <div className="font-bold">{step.name}</div>
                <div className="mt-1 line-clamp-2 text-[11px] opacity-90">{step.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. Data Representation Diagram
  if (type === 'data_representation') {
    const hex = (binaryVal & 0xff).toString(16).toUpperCase().padStart(2, '0');
    const binStr = (binaryVal & 0xff).toString(2).padStart(8, '0');
    const signedVal = (binaryVal & 0x80) ? binaryVal - 256 : binaryVal;

    return (
      <div className="my-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:border-slate-300">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Binary className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Interactive Data Representation & Two's Complement Explorer</span>
          </div>
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
            Byte Inspector
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 print:hidden">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Quick Test Values:</span>
          {[0, 1, 10, 42, 127, 128, 200, 255].map((val) => (
            <button
              key={val}
              onClick={() => setBinaryVal(val)}
              className={`rounded px-2.5 py-1 font-mono text-xs font-semibold transition ${
                binaryVal === val 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {val}
            </button>
          ))}
        </div>

        {/* Visual Byte Blocks */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-950">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Unsigned Decimal</div>
            <div className="mt-1 font-mono text-2xl font-bold text-indigo-600 dark:text-indigo-400">{binaryVal & 0xff}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-950">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Hexadecimal</div>
            <div className="mt-1 font-mono text-2xl font-bold text-teal-600 dark:text-teal-400">0x{hex}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-950">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Two's Complement (Signed)</div>
            <div className="mt-1 font-mono text-2xl font-bold text-rose-600 dark:text-rose-400">{signedVal}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-950">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">ASCII Glyph</div>
            <div className="mt-1 font-mono text-2xl font-bold text-amber-600 dark:text-amber-400">
              {binaryVal >= 32 && binaryVal <= 126 ? `'${String.fromCharCode(binaryVal)}'` : 'Non-printable'}
            </div>
          </div>
        </div>

        {/* 8-bit visual nibbles */}
        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>High Nibble (Bits 7..4)</span>
            <span className="font-bold text-rose-500">MSB (Sign: {binStr[0]})</span>
            <span>Low Nibble (Bits 3..0)</span>
          </div>
          <div className="mt-2 grid grid-cols-8 gap-1.5 font-mono text-center">
            {binStr.split('').map((bit, idx) => (
              <div 
                key={idx}
                className={`rounded border p-2 text-sm font-bold ${
                  idx === 0 
                    ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300'
                    : bit === '1'
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300'
                    : 'border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600'
                }`}
              >
                <div>{bit}</div>
                <div className="mt-0.5 text-[9px] font-normal text-slate-400">2^{7-idx}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. 64-bit Register Anatomy Diagram
  if (type === 'registers_memory' || type === 'abi_register_alloc') {
    const registersList = [
      { name: 'rax', desc: 'Accumulator & Return Value', callerSaved: true },
      { name: 'rbx', desc: 'Base Pointer (general)', callerSaved: false },
      { name: 'rcx', desc: 'Counter / 4th Arg', callerSaved: true },
      { name: 'rdx', desc: 'Data / 3rd Arg', callerSaved: true },
      { name: 'rsi', desc: 'Source Index / 2nd Arg', callerSaved: true },
      { name: 'rdi', desc: 'Destination Index / 1st Arg', callerSaved: true },
      { name: 'rbp', desc: 'Stack Base Frame Pointer', callerSaved: false },
      { name: 'rsp', desc: 'Stack Pointer (top of stack)', callerSaved: false },
      { name: 'r8', desc: '5th Function Arg', callerSaved: true },
      { name: 'r9', desc: '6th Function Arg', callerSaved: true },
      { name: 'r10', desc: 'Syscall 4th Arg / Scratch', callerSaved: true },
      { name: 'r11', desc: 'Syscall Clobbered / Scratch', callerSaved: true },
      { name: 'r12', desc: 'Callee-Saved Register', callerSaved: false },
      { name: 'r13', desc: 'Callee-Saved Register', callerSaved: false },
      { name: 'r14', desc: 'Callee-Saved Register', callerSaved: false },
      { name: 'r15', desc: 'Callee-Saved Register', callerSaved: false }
    ];

    return (
      <div className="my-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:border-slate-300">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">x86-64 Register Hierarchy & Sub-Register Slicing</span>
          </div>
          <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
            64-bit to 8-bit Architecture
          </span>
        </div>

        {/* Register Breakdown Visual */}
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Register Sub-Partitioning Scheme (e.g. RAX):</div>
          <div className="mt-3 grid grid-cols-8 gap-1 font-mono text-center text-xs">
            <div className="col-span-4 rounded border border-indigo-200 bg-indigo-50 p-2 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300">
              <span className="font-bold">Upper 32 bits</span>
              <p className="text-[10px] text-slate-500">Zeroed automatically on 32-bit writes</p>
            </div>
            <div className="col-span-2 rounded border border-teal-200 bg-teal-50 p-2 text-teal-700 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-300">
              <span className="font-bold">AH (8-bit)</span>
              <p className="text-[10px] text-slate-500">Bits 8..15</p>
            </div>
            <div className="col-span-2 rounded border border-emerald-200 bg-emerald-50 p-2 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="font-bold">AL (8-bit)</span>
              <p className="text-[10px] text-slate-500">Bits 0..7</p>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1 font-mono text-center text-xs">
            <div className="rounded border border-indigo-300 bg-white p-1.5 font-bold text-indigo-800 dark:border-slate-800 dark:bg-slate-900 dark:text-indigo-300">
              RAX (Full 64-bit Quadword: bits 0..63)
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="rounded border border-teal-300 bg-white p-1.5 font-bold text-teal-800 dark:border-slate-800 dark:bg-slate-900 dark:text-teal-300">
                EAX (32-bit Doubleword)
              </div>
              <div className="rounded border border-emerald-300 bg-white p-1.5 font-bold text-emerald-800 dark:border-slate-800 dark:bg-slate-900 dark:text-emerald-300">
                AX (16-bit Word)
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Register Browser */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 print:hidden">
          {registersList.map((reg) => (
            <button
              key={reg.name}
              onClick={() => setSelectedReg(reg.name)}
              className={`rounded-lg border p-2.5 text-left text-xs transition ${
                selectedReg === reg.name
                  ? 'border-teal-500 bg-teal-50/70 font-semibold text-teal-900 dark:bg-teal-950/40 dark:text-teal-200'
                  : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold uppercase">{reg.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  reg.callerSaved 
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300' 
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300'
                }`}>
                  {reg.callerSaved ? 'Caller-Saved' : 'Callee-Saved'}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">{reg.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 4. Status Flags & ALU Conditions
  if (type === 'basic_instructions_flags' || type === 'arithmetic_logical') {
    const diff = flagOpA - flagOpB;
    const zf = diff === 0 ? 1 : 0;
    const sf = diff < 0 ? 1 : 0;
    const cf = (flagOpA >>> 0) < (flagOpB >>> 0) ? 1 : 0;
    const of = ((flagOpA > 0 && flagOpB < 0 && diff < 0) || (flagOpA < 0 && flagOpB > 0 && diff > 0)) ? 1 : 0;

    return (
      <div className="my-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:border-slate-300">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Interactive RFLAGS Status Matrix Simulator</span>
          </div>
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
            cmp / sub Evaluator
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold">Operand A:</span>
            <input 
              type="number" 
              value={flagOpA} 
              onChange={(e) => setFlagOpA(parseInt(e.target.value) || 0)} 
              className="w-20 rounded border border-slate-300 px-2 py-1 font-mono dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold">Operand B:</span>
            <input 
              type="number" 
              value={flagOpB} 
              onChange={(e) => setFlagOpB(parseInt(e.target.value) || 0)} 
              className="w-20 rounded border border-slate-300 px-2 py-1 font-mono dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
          <span className="text-slate-400">Calculates `cmp A, B` (computes A - B = {diff})</span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className={`rounded-lg border p-3 text-center ${zf ? 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950'}`}>
            <div className="font-mono text-sm font-bold">ZF (Zero Flag)</div>
            <div className="mt-1 text-2xl font-black">{zf}</div>
            <div className="text-[10px] mt-0.5">{zf ? 'A == B' : 'A != B'}</div>
          </div>
          <div className={`rounded-lg border p-3 text-center ${sf ? 'border-indigo-400 bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300' : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950'}`}>
            <div className="font-mono text-sm font-bold">SF (Sign Flag)</div>
            <div className="mt-1 text-2xl font-black">{sf}</div>
            <div className="text-[10px] mt-0.5">{sf ? 'Result Negative' : 'Result Positive'}</div>
          </div>
          <div className={`rounded-lg border p-3 text-center ${cf ? 'border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950'}`}>
            <div className="font-mono text-sm font-bold">CF (Carry Flag)</div>
            <div className="mt-1 text-2xl font-black">{cf}</div>
            <div className="text-[10px] mt-0.5">{cf ? 'Unsigned A < B' : 'Unsigned A >= B'}</div>
          </div>
          <div className={`rounded-lg border p-3 text-center ${of ? 'border-rose-400 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300' : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950'}`}>
            <div className="font-mono text-sm font-bold">OF (Overflow Flag)</div>
            <div className="mt-1 text-2xl font-black">{of}</div>
            <div className="text-[10px] mt-0.5">{of ? 'Signed Overflow' : 'Safe'}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded bg-slate-100 px-2 py-1 font-mono text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            je / jz: <strong>{zf ? 'TAKEN' : 'NOT TAKEN'}</strong>
          </span>
          <span className="rounded bg-slate-100 px-2 py-1 font-mono text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            jl (signed &lt;): <strong>{sf !== of ? 'TAKEN' : 'NOT TAKEN'}</strong>
          </span>
          <span className="rounded bg-slate-100 px-2 py-1 font-mono text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            jb (unsigned &lt;): <strong>{cf ? 'TAKEN' : 'NOT TAKEN'}</strong>
          </span>
          <span className="rounded bg-slate-100 px-2 py-1 font-mono text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            jg (signed &gt;): <strong>{!zf && sf === of ? 'TAKEN' : 'NOT TAKEN'}</strong>
          </span>
        </div>
      </div>
    );
  }

  // 5. Stack Frame & Memory Architecture
  if (type === 'procedures_stack' || type === 'stack_frames_prologues' || type === 'recursion_locals') {
    return (
      <div className="my-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:border-slate-300">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">x86-64 Stack Frame Anatomy & Red Zone Architecture</span>
          </div>
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
            Stack Memory Map
          </span>
        </div>

        <div className="mt-5 flex flex-col items-center">
          <div className="w-full max-w-md space-y-1.5 font-mono text-xs">
            <div className="text-center text-[11px] text-slate-400">▲ Higher Addresses (0x7FFF...FFFF)</div>

            <div className="rounded border border-amber-300 bg-amber-50 p-2.5 text-center text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
              <span className="font-bold">[RBP + 24]</span>: 8th Argument (Passed on Stack)
            </div>
            <div className="rounded border border-amber-300 bg-amber-50 p-2.5 text-center text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
              <span className="font-bold">[RBP + 16]</span>: 7th Argument (Passed on Stack)
            </div>
            <div className="rounded border border-rose-300 bg-rose-50 p-2.5 text-center text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              <span className="font-bold">[RBP + 8]</span>: Saved Return Address (Pushed by `call`)
            </div>
            <div className="rounded border border-indigo-400 bg-indigo-100 p-2.5 text-center font-bold text-indigo-900 shadow-sm dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
              <span>[RBP]</span>: Saved Caller RBP &larr; Frame Pointer Base
            </div>
            <div className="rounded border border-teal-300 bg-teal-50 p-2.5 text-center text-teal-800 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-300">
              <span className="font-bold">[RBP - 8]</span>: Local Variable 1
            </div>
            <div className="rounded border border-teal-300 bg-teal-50 p-2.5 text-center text-teal-800 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-300">
              <span className="font-bold">[RBP - 16]</span>: Local Variable 2 &larr; RSP (Top of Allocated Frame)
            </div>
            <div className="rounded border border-dashed border-rose-300 bg-rose-50/50 p-2.5 text-center text-[11px] text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
              <span className="font-bold">128-Byte Red Zone [RSP - 128..-1]</span>
              <p className="text-[10px]">Guaranteed safe scratch space for Leaf Functions (No sub rsp required!)</p>
            </div>

            <div className="text-center text-[11px] text-slate-400">▼ Lower Addresses (Stack Grows Downward)</div>
          </div>
        </div>
      </div>
    );
  }

  // 6. Security, Buffer Overflow & ROP Chain Diagram
  if (type === 'shellcoding' || type === 'buffer_overflow' || type === 'rop_code_reuse' || type === 'anti_debugging' || type === 'defensive_assembly') {
    return (
      <div className="my-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:border-slate-300">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Security Architecture: Buffer Smashing & ROP Chain Gadget Flow</span>
          </div>
          <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
            Exploit Mechanics
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Stack Overflow Smashing Visual */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Stack Buffer Smashing Flow:</h4>
            <div className="mt-3 space-y-1.5 font-mono text-xs">
              <div className="rounded border border-slate-300 bg-white p-2 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                [0x00..0x3F] char buffer[64] (Legitimate Input Zone)
              </div>
              <div className="rounded border border-amber-300 bg-amber-50 p-2 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                [0x40..0x47] Saved RBP (Overwritten with garbage 'A'*8)
              </div>
              <div className="rounded border border-rose-400 bg-rose-100 p-2 font-bold text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
                [0x48..0x4F] Saved RIP &larr; Hijacked to Gadget / Shellcode
              </div>
            </div>
          </div>

          {/* ROP Execution Sequence */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Ret2Libc Execution Chain:</h4>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center gap-2 rounded border border-indigo-200 bg-indigo-50 p-2 text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-200">
                <span className="font-mono font-bold">1. Gadget:</span>
                <code>pop rdi; ret</code>
                <ArrowRight className="h-4 w-4 ml-auto text-indigo-600" />
              </div>
              <div className="flex items-center gap-2 rounded border border-slate-200 bg-white p-2 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <span className="font-mono font-bold">2. Value:</span>
                <code>pointer to "/bin/sh"</code>
                <span className="ml-auto text-[10px] text-slate-500">Popped into RDI</span>
              </div>
              <div className="flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50 p-2 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
                <span className="font-mono font-bold">3. Target:</span>
                <code>system() entry address</code>
                <span className="ml-auto text-[10px] text-emerald-600 font-bold">Shell Spawned!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 7. Cross-Platform Multi-Architecture Comparison
  if (type === 'arm_assembly' || type === 'riscv_assembly' || type === 'mips_architecture' || type === 'isa_comparison' || type === 'portable_assembly') {
    return (
      <div className="my-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:border-slate-300">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Split className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Cross-Platform ISA Architecture Matrix</span>
          </div>
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
            x86-64 • ARM64 • RISC-V • MIPS
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
            <span className="font-bold text-slate-800 dark:text-slate-200">x86-64</span>
            <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <div>• <strong>CISC</strong> (1-15 bytes)</div>
              <div>• 16 GPRs (RAX..R15)</div>
              <div>• 2-operand (`add rax, rbx`)</div>
              <div>• `syscall` (RAX)</div>
              <div>• RFLAGS condition codes</div>
            </div>
          </div>

          <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-3.5 dark:border-teal-900/50 dark:bg-teal-950/20">
            <span className="font-bold text-teal-800 dark:text-teal-300">ARM64 (AArch64)</span>
            <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <div>• <strong>RISC</strong> (Fixed 32-bit)</div>
              <div>• 31 GPRs + `XZR` zero reg</div>
              <div>• 3-operand (`add x0, x1, x2`)</div>
              <div>• `svc #0` (X8)</div>
              <div>• `CSEL` branchless select</div>
            </div>
          </div>

          <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/20">
            <span className="font-bold text-indigo-800 dark:text-indigo-300">RISC-V (RV64)</span>
            <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <div>• <strong>Open Modular RISC</strong></div>
              <div>• 32 Regs (`x0` hardwired 0)</div>
              <div>• Direct compare branches</div>
              <div>• `ecall` (A7)</div>
              <div>• Optional 16-bit C extension</div>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3.5 dark:border-amber-900/50 dark:bg-amber-950/20">
            <span className="font-bold text-amber-800 dark:text-amber-300">MIPS32</span>
            <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <div>• <strong>Classic RISC</strong></div>
              <div>• 32 Regs ($0..$31)</div>
              <div>• <strong>Delay Slot</strong> execution</div>
              <div>• `syscall` ($v0 = 4000+)</div>
              <div>• Simple load/store model</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback Generic Architectural Card
  return (
    <div className="my-6 rounded-xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex items-center gap-2">
        <GitBranch className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">System Architectural Schematic</span>
      </div>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
        Hardware-level execution mapping for {type ? type.replace(/_/g, ' ') : 'Assembly instructions'}.
      </p>
    </div>
  );
};
