// Repair & Diagnostic Simulation Engine
// Generates faulty PCs brought by customers with real symptoms and diagnostic tests

import { ALL_COMPONENTS } from '../data/index';

export const REPAIR_FAULTS = [
  {
    type: 'dead_psu',
    title: 'PC Does Not Turn On at All',
    customerComplaint: 'My computer went POP yesterday with a faint smell of ozone, and now nothing happens when I press power. Please help!',
    symptom: 'No lights, no fan spin, PSU clicks once then stays dead.',
    faultyPartCategory: 'psu',
    diagnosisPrompt: 'Check PSU 12V rail output with Multimeter',
    diagnosticClue: 'PSU multimeter shows 0.0V on all 24-pin motherboard rails. Unit is dead.',
    recommendedAction: 'Replace faulty PSU with a working unit of equal or greater wattage.',
    repairReward: 4500,
    difficulty: 'easy',
  },
  {
    type: 'overheating_cpu',
    title: 'PC Shuts Down Under Load (Thermal Throttling)',
    customerComplaint: 'Computer turns on fine, but after 2 minutes of YouTube or gaming, it suddenly turns off without warning. Fans scream like a jet engine!',
    symptom: 'PC boots to Windows, but CPU temp shoots to 105°C immediately. Thermal trip safety shuts down system.',
    faultyPartCategory: 'cooler',
    diagnosisPrompt: 'Inspect CPU Cooler mount & thermal interface',
    diagnosticClue: 'Cooler bracket is loose and thermal paste is completely dried up and powdery. Cooler fan bearing is jammed.',
    recommendedAction: 'Replace or upgrade the CPU Cooler and apply fresh thermal compound.',
    repairReward: 5200,
    difficulty: 'easy',
  },
  {
    type: 'faulty_ram',
    title: 'System Beeps and Fails to POST (Black Screen)',
    customerComplaint: 'I turned it on this morning and got 3 loud beeps and a black screen. Motherboard LED stays on orange/red.',
    symptom: 'Fans spin at 100%, motherboard DRAM debug LED is solid orange, display output remains black.',
    faultyPartCategory: 'ram',
    diagnosisPrompt: 'Run Memory Diagnostic Tester',
    diagnosticClue: 'DRAM module failed memory address line parity test. Defective memory IC detected.',
    recommendedAction: 'Replace the defective RAM stick with a compatible module.',
    repairReward: 4800,
    difficulty: 'medium',
  },
  {
    type: 'failing_storage',
    title: 'BSOD & "Reboot and Select Proper Boot Device"',
    customerComplaint: 'Windows keeps blue-screening with UNMOUNTABLE_BOOT_VOLUME and now it only shows a black screen asking for boot media.',
    symptom: 'POST passes, but BIOS reports: "No bootable device found. Insert boot media and press any key."',
    faultyPartCategory: 'storage',
    diagnosisPrompt: 'Check S.M.A.R.T. drive health status',
    diagnosticClue: 'Drive S.M.A.R.T. reports 8,420 uncorrectable bad sectors and controller firmware read timeout.',
    recommendedAction: 'Install a new SSD/Storage drive and reinstall operating system.',
    repairReward: 5800,
    difficulty: 'medium',
  },
  {
    type: 'gpu_artifacting',
    title: 'Screen Displays Pink Grid Lines & Driver Crash',
    customerComplaint: 'Screen is covered in crazy colored squares and lines. Every time I launch any game, Windows displays "Display driver nvlddmkm stopped responding".',
    symptom: '2D desktop exhibits checkerboard artifacts; loading 3D benchmark immediately black screens.',
    faultyPartCategory: 'gpu',
    diagnosisPrompt: 'Run GPU VRAM Stress Pattern Analyzer',
    diagnosticClue: 'VRAM Bank #3 reports multiple memory corruption faults. GPU solder ball micro-fracture.',
    recommendedAction: 'Replace the dying GPU with a compatible graphics card.',
    repairReward: 8500,
    difficulty: 'hard',
  },
];

/**
 * Generates a realistic customer repair job PC with a baseline build and 1 damaged part
 */
export function generateRepairJob(jobId = 1) {
  const fault = REPAIR_FAULTS[Math.floor(Math.random() * REPAIR_FAULTS.length)];

  // Pick suitable base parts for a typical customer build
  const sampleCpu = ALL_COMPONENTS.cpu[1]; // i3-12100F
  const sampleMb = ALL_COMPONENTS.motherboard[2]; // compatible board
  const sampleRam = ALL_COMPONENTS.ram[0]; // 16GB DDR4
  const sampleGpu = ALL_COMPONENTS.gpu[0]; // RTX 3050 / 4060
  const samplePsu = ALL_COMPONENTS.psu[0]; // 550W
  const sampleCase = ALL_COMPONENTS.case[0]; // budget case
  const sampleCooler = ALL_COMPONENTS.cooler[0]; // stock
  const sampleStorage = ALL_COMPONENTS.storage[0]; // 500GB SSD

  const initialBuild = {
    cpu: sampleCpu,
    motherboard: sampleMb,
    ram: sampleRam,
    gpu: sampleGpu,
    psu: samplePsu,
    case: sampleCase,
    cooler: sampleCooler,
    storage: sampleStorage,
  };

  // Mark the specific component as damaged
  const damagedCategory = fault.faultyPartCategory;
  if (initialBuild[damagedCategory]) {
    initialBuild[damagedCategory] = {
      ...initialBuild[damagedCategory],
      isDamaged: true,
      faultType: fault.type,
      healthPercent: 0,
    };
  }

  const customerNames = ['Vikram S.', 'Priya N.', 'Rohan K.', 'Anjali M.', 'Karthik R.', 'Sneha D.'];
  const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];

  return {
    id: `repair_${Date.now()}_${jobId}`,
    customerName,
    title: fault.title,
    complaint: fault.customerComplaint,
    symptom: fault.symptom,
    faultType: fault.type,
    faultyPartCategory: fault.faultyPartCategory,
    diagnosticPrompt: fault.diagnosisPrompt,
    diagnosticClue: fault.diagnosticClue,
    recommendedAction: fault.recommendedAction,
    laborFee: fault.repairReward,
    diagnosed: false,
    fixed: false,
    build: initialBuild,
  };
}
