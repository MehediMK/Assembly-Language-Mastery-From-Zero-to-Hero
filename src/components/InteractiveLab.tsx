import React, { useState } from 'react';
import { Terminal, Binary, Cpu, Activity, Database, ArrowRight } from 'lucide-react';

export const InteractiveLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'converter' | 'flags' | 'syscalls' | 'endian'>('converter');
  
  // Converter states
  const [numInput, setNumInput] = useState<string>('255');
  const numVal = parseInt(numInput, 10) || 0;
  const hexVal = (numVal >>> 0).toString(16).toUpperCase();
  const binVal = (numVal >>> 0).toString(2).padStart(32, '0');

  // Flags states
  const [op1, setOp1] = useState<number>(50);
  const [op2, setOp2] = useState<number>(75);
  const diff = op1 - op2;
  const zf = diff === 0 ? 1 : 0;
  const sf = diff < 0 ? 1 : 0;
  const cf = (op1 >>> 0) < (op2 >>> 0) ? 1 : 0;

  // Endianness states
  const [endianInput, setEndianInput] = useState<string>('12345678'); // 0x12345678

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
        <Terminal className="h-6 w-6 text-teal-600 dark:text-teal-400" />
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Assembly Interactive Laboratory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Live silicon inspection: binary math, register slicing, status flags & system call tables</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 mt-6 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('converter')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
            activeTab === 'converter'
              ? 'bg-teal-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Binary className="h-4 w-4" /> Base Converter & Two's Complement
        </button>

        <button
          onClick={() => setActiveTab('flags')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
            activeTab === 'flags'
              ? 'bg-teal-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Activity className="h-4 w-4" /> RFLAGS & Conditional Jumps
        </button>

        <button
          onClick={() => setActiveTab('endian')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
            activeTab === 'endian'
              ? 'bg-teal-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Database className="h-4 w-4" /> Little vs Big Endian Memory
        </button>

        <button
          onClick={() => setActiveTab('syscalls')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
            activeTab === 'syscalls'
              ? 'bg-teal-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Cpu className="h-4 w-4" /> Cross-ISA Syscall QuickRef
        </button>
      </div>

      {/* Tab 1: Base Converter */}
      {activeTab === 'converter' && (
        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Enter Decimal Integer:
            </label>
            <input
              type="number"
              value={numInput}
              onChange={(e) => setNumInput(e.target.value)}
              className="w-full max-w-sm rounded-lg border border-slate-300 p-2.5 font-mono text-base dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 block uppercase">Hexadecimal</span>
                <span className="font-mono text-xl font-bold text-teal-600 dark:text-teal-400">0x{hexVal}</span>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 block uppercase">Binary (32-bit)</span>
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 break-all">{binVal}</span>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 block uppercase">Signed 8-bit Two's Comp</span>
                <span className="font-mono text-xl font-bold text-rose-600 dark:text-rose-400">
                  {(numVal & 0x80) ? (numVal & 0xff) - 256 : (numVal & 0xff)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: RFLAGS */}
      {activeTab === 'flags' && (
        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">`cmp op1, op2` (op1 - op2) Flag Evaluator</h3>
            
            <div className="flex gap-4 items-center">
              <div>
                <label className="text-xs font-bold block mb-1 text-slate-600 dark:text-slate-400">op1 (Register A)</label>
                <input
                  type="number"
                  value={op1}
                  onChange={(e) => setOp1(parseInt(e.target.value) || 0)}
                  className="rounded border border-slate-300 p-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </div>
              <span className="font-mono font-bold text-lg mt-5">-</span>
              <div>
                <label className="text-xs font-bold block mb-1 text-slate-600 dark:text-slate-400">op2 (Register B)</label>
                <input
                  type="number"
                  value={op2}
                  onChange={(e) => setOp2(parseInt(e.target.value) || 0)}
                  className="rounded border border-slate-300 p-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </div>
              <div className="mt-5 text-xs text-slate-500 font-mono">
                = {diff}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className={`p-3 rounded-lg border text-center ${zf ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <div className="font-mono text-xs font-bold">ZF (Zero)</div>
                <div className="text-2xl font-black mt-1">{zf}</div>
              </div>
              <div className={`p-3 rounded-lg border text-center ${sf ? 'bg-indigo-50 border-indigo-400 text-indigo-800' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <div className="font-mono text-xs font-bold">SF (Sign)</div>
                <div className="text-2xl font-black mt-1">{sf}</div>
              </div>
              <div className={`p-3 rounded-lg border text-center ${cf ? 'bg-amber-50 border-amber-400 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                <div className="font-mono text-xs font-bold">CF (Carry)</div>
                <div className="text-2xl font-black mt-1">{cf}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Endianness */}
      {activeTab === 'endian' && (
        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Little-Endian vs Big-Endian Byte Memory Inspector</h3>
            <p className="text-xs text-slate-500 mb-4">x86-64, ARM64, and RISC-V place the least significant byte at the lowest address.</p>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">32-bit Value: 0x12345678</div>
              <div className="grid grid-cols-4 gap-2 font-mono text-center text-xs">
                <div className="border border-teal-300 bg-teal-50 p-2 rounded text-teal-800 dark:bg-teal-950/40 dark:text-teal-300">
                  <span className="block font-bold">Addr: 0x00</span>
                  <span className="text-base font-black">0x78</span>
                  <span className="text-[10px] block text-slate-400">LSB</span>
                </div>
                <div className="border border-teal-300 bg-teal-50 p-2 rounded text-teal-800 dark:bg-teal-950/40 dark:text-teal-300">
                  <span className="block font-bold">Addr: 0x01</span>
                  <span className="text-base font-black">0x56</span>
                </div>
                <div className="border border-teal-300 bg-teal-50 p-2 rounded text-teal-800 dark:bg-teal-950/40 dark:text-teal-300">
                  <span className="block font-bold">Addr: 0x02</span>
                  <span className="text-base font-black">0x34</span>
                </div>
                <div className="border border-teal-300 bg-teal-50 p-2 rounded text-teal-800 dark:bg-teal-950/40 dark:text-teal-300">
                  <span className="block font-bold">Addr: 0x03</span>
                  <span className="text-base font-black">0x12</span>
                  <span className="text-[10px] block text-slate-400">MSB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Cross-ISA Syscall QuickRef */}
      {activeTab === 'syscalls' && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
              <tr>
                <th className="p-2">Syscall</th>
                <th className="p-2">x86-64 (syscall)</th>
                <th className="p-2">ARM64 (svc #0)</th>
                <th className="p-2">RISC-V (ecall)</th>
                <th className="p-2">MIPS O32 (syscall)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="p-2 font-bold font-sans">read(fd, buf, len)</td>
                <td className="p-2 text-teal-600">RAX = 0</td>
                <td className="p-2 text-indigo-600">X8 = 63</td>
                <td className="p-2 text-amber-600">A7 = 63</td>
                <td className="p-2 text-rose-600">$v0 = 4003</td>
              </tr>
              <tr>
                <td className="p-2 font-bold font-sans">write(fd, buf, len)</td>
                <td className="p-2 text-teal-600">RAX = 1</td>
                <td className="p-2 text-indigo-600">X8 = 64</td>
                <td className="p-2 text-amber-600">A7 = 64</td>
                <td className="p-2 text-rose-600">$v0 = 4004</td>
              </tr>
              <tr>
                <td className="p-2 font-bold font-sans">open(path, flags, mode)</td>
                <td className="p-2 text-teal-600">RAX = 2</td>
                <td className="p-2 text-indigo-600">X8 = 56 (openat)</td>
                <td className="p-2 text-amber-600">A7 = 56</td>
                <td className="p-2 text-rose-600">$v0 = 4005</td>
              </tr>
              <tr>
                <td className="p-2 font-bold font-sans">exit(status)</td>
                <td className="p-2 text-teal-600">RAX = 60</td>
                <td className="p-2 text-indigo-600">X8 = 93</td>
                <td className="p-2 text-amber-600">A7 = 93</td>
                <td className="p-2 text-rose-600">$v0 = 4001</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
