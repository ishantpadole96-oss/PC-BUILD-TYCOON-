// Benchmark Simulation Engine
// Deterministic scoring based on actual component data
// NOTE: All values are SIMULATED GAME VALUES, not real-world benchmarks

/**
 * Run benchmark simulation on a completed build
 * @param {Object} build - The PC build object
 * @returns {Object} Benchmark results
 */
export function runBenchmark(build) {
  const { cpu, gpu, ram: ramStick, storage: stor, cooler, psu } = build;

  if (!cpu) return null;

  // Base scores from components
  const cpuScore = calcCpuScore(cpu);
  const gpuScore = gpu ? calcGpuScore(gpu) : (cpu.specs?.integratedGraphics ? 8 : 0);
  const ramScore = ramStick ? calcRamScore(ramStick) : 0;
  const storageScore = stor ? calcStorageScore(stor) : 0;

  // Overall weighted score
  const overallScore = Math.round(
    cpuScore * 0.30 +
    gpuScore * 0.50 +
    ramScore * 0.10 +
    storageScore * 0.10
  );

  // FPS calculations
  const baseFps1080p = gpuScore * 1.8 + cpuScore * 0.5;
  const baseFps1440p = gpuScore * 1.2 + cpuScore * 0.3;
  const baseFps4k = gpuScore * 0.65 + cpuScore * 0.15;

  // Thermal simulation
  const cpuTdp = cpu.specs?.tdp || cpu.powerDraw || 65;
  const coolerCapacity = cooler?.specs?.maxTDP || 65;
  const thermalHeadroom = coolerCapacity / Math.max(cpuTdp, 1);
  const thermalPenalty = thermalHeadroom < 1.0 ? (1.0 - thermalHeadroom) * 0.3 : 0;

  // Power efficiency
  const totalPower = calcTotalPower(build);
  const psuEfficiency = psu?.specs?.efficiency || 0.8;

  // Apply thermal penalty
  const finalMultiplier = 1.0 - thermalPenalty;

  // CPU temperature estimate
  const cpuTemp = Math.round(35 + (cpuTdp / coolerCapacity) * 40 + Math.random() * 5);
  const gpuTemp = gpu ? Math.round(40 + (gpu.powerDraw / 300) * 35 + Math.random() * 5) : 0;

  // FPS with thermal penalty and variance
  const fps1080p = Math.round(baseFps1080p * finalMultiplier);
  const fps1440p = Math.round(baseFps1440p * finalMultiplier);
  const fps4k = Math.round(baseFps4k * finalMultiplier);

  // 1% lows (typically 60-75% of average)
  const fps1080pLow = Math.round(fps1080p * (0.65 + ramScore * 0.003));
  const fps1440pLow = Math.round(fps1440p * (0.63 + ramScore * 0.003));
  const fps4kLow = Math.round(fps4k * (0.60 + ramScore * 0.003));

  // CPU/GPU utilization
  const cpuUtil = Math.min(99, Math.round(55 + cpuScore * 0.3 + Math.random() * 10));
  const gpuUtil = gpu ? Math.min(99, Math.round(70 + gpuScore * 0.2 + Math.random() * 8)) : 0;

  // Benchmark score (synthetic)
  const benchmarkScore = Math.round(overallScore * 120 + cpuScore * 30 + gpuScore * 50);

  // Noise estimation (dBA)
  const noiseLevel = estimateNoise(build);

  // Performance per rupee
  const totalCost = calcTotalBuildCost(build);
  const perfPerRupee = totalCost > 0 ? Math.round((benchmarkScore / totalCost) * 1000) / 10 : 0;

  return {
    overallScore: Math.min(overallScore, 100),
    benchmarkScore,
    cpu: {
      score: Math.round(cpuScore),
      temperature: Math.min(cpuTemp, 105),
      utilization: cpuUtil,
    },
    gpu: {
      score: Math.round(gpuScore),
      temperature: Math.min(gpuTemp, 95),
      utilization: gpuUtil,
    },
    fps: {
      '1080p': { avg: fps1080p, low1: fps1080pLow },
      '1440p': { avg: fps1440p, low1: fps1440pLow },
      '4k': { avg: fps4k, low1: fps4kLow },
    },
    power: {
      totalDraw: totalPower,
      psuCapacity: psu?.specs?.wattage || 0,
      efficiency: Math.round(psuEfficiency * 100),
    },
    thermal: {
      cpuTemp: Math.min(cpuTemp, 105),
      gpuTemp: Math.min(gpuTemp, 95),
      thermalHeadroom: Math.round(thermalHeadroom * 100),
      thermalPenalty: Math.round(thermalPenalty * 100),
    },
    noise: {
      estimated: noiseLevel,
      rating: noiseLevel < 30 ? 'Silent' : noiseLevel < 38 ? 'Quiet' : noiseLevel < 45 ? 'Normal' : 'Loud',
    },
    value: {
      totalCost,
      perfPerRupee,
      rating: perfPerRupee > 1.5 ? 'Excellent' : perfPerRupee > 1.0 ? 'Good' : perfPerRupee > 0.5 ? 'Average' : 'Poor',
    },
  };
}

function calcCpuScore(cpu) {
  if (!cpu) return 0;
  const s = cpu.specs;
  const coreScore = (s.cores || 4) * 2.5;
  const clockScore = (s.boostClock || 3.0) * 8;
  const ipcMultiplier = getIpcMultiplier(s.architecture);
  const cacheBonus = (s.l3Cache || 8) * 0.15;
  return Math.min((coreScore + clockScore + cacheBonus) * ipcMultiplier, 100);
}

function calcGpuScore(gpu) {
  if (!gpu) return 0;
  const s = gpu.specs;
  return Math.min(s.performanceScore || 50, 100);
}

function calcRamScore(ram) {
  if (!ram) return 0;
  const s = ram.specs;
  const capacityScore = Math.min((s.capacity || 8) / 32, 1) * 50;
  const speedScore = ((s.speed || 3200) - 2400) / 40;
  return Math.min(capacityScore + speedScore, 100);
}

function calcStorageScore(stor) {
  if (!stor) return 0;
  const s = stor.specs;
  const speedScore = s.interface === 'NVMe' ? 80 : s.interface === 'SATA' ? 40 : 20;
  const capacityBonus = Math.min((s.capacity || 256) / 2000, 1) * 20;
  return Math.min(speedScore + capacityBonus, 100);
}

function getIpcMultiplier(arch) {
  const ipc = {
    'Zen 3': 1.0, 'Zen 4': 1.15, 'Zen 4 3D V-Cache': 1.25,
    'Alder Lake': 1.0, 'Raptor Lake': 1.05, 'Raptor Lake Refresh': 1.08,
  };
  return ipc[arch] || 1.0;
}

function estimateNoise(build) {
  let noise = 20; // base ambient
  const cpu = build.cpu;
  const gpu = build.gpu;
  const cooler = build.cooler;

  if (cpu) {
    const cpuTdp = cpu.specs?.tdp || 65;
    noise += cpuTdp * 0.08;
  }
  if (gpu) {
    noise += gpu.powerDraw * 0.05;
  }
  if (cooler) {
    const coolerNoise = cooler.specs?.noiseLevel || 30;
    noise = Math.max(noise, coolerNoise);
  }

  // Case dampening
  if (build.case?.specs?.noiseDampening) {
    noise *= 0.85;
  }

  return Math.round(noise);
}

function calcTotalPower(build) {
  let total = 0;
  Object.values(build).forEach(part => {
    if (part?.powerDraw) total += part.powerDraw;
  });
  return total;
}

function calcTotalBuildCost(build) {
  let total = 0;
  Object.values(build).forEach(part => {
    if (part) total += (part.currentPrice || part.basePrice || 0);
  });
  return total;
}

/**
 * Evaluate how well a build meets customer requirements
 * Returns satisfaction score 0-100
 */
export function evaluateCustomerSatisfaction(build, requirements, benchmarkResults) {
  if (!benchmarkResults) return 0;

  let satisfaction = 50; // base

  const budget = requirements.budget;
  const totalCost = benchmarkResults.value.totalCost;

  // Budget check (most important)
  if (totalCost <= budget) {
    satisfaction += 20;
    if (totalCost <= budget * 0.9) satisfaction += 5; // Under budget bonus
  } else {
    const overBy = ((totalCost - budget) / budget) * 100;
    satisfaction -= Math.min(overBy * 2, 40); // Penalty for over-budget
  }

  // FPS target
  if (requirements.fpsTarget > 0) {
    const targetRes = requirements.resolution || '1080p';
    const actualFps = benchmarkResults.fps[targetRes]?.avg || 0;
    if (actualFps >= requirements.fpsTarget) {
      satisfaction += 15;
      if (actualFps >= requirements.fpsTarget * 1.5) satisfaction += 5;
    } else {
      const shortfall = ((requirements.fpsTarget - actualFps) / requirements.fpsTarget) * 100;
      satisfaction -= Math.min(shortfall, 30);
    }
  }

  // Noise preference
  const noise = benchmarkResults.noise.estimated;
  if (requirements.noisePref === 'silent' && noise > 35) {
    satisfaction -= 15;
  } else if (requirements.noisePref === 'quiet' && noise > 40) {
    satisfaction -= 10;
  } else if (requirements.noisePref === 'silent' && noise <= 30) {
    satisfaction += 10;
  }

  // Storage requirement
  if (requirements.storageMin) {
    const storageCapacity = build.storage?.specs?.capacity || 0;
    if (storageCapacity >= requirements.storageMin) {
      satisfaction += 5;
    } else {
      satisfaction -= 10;
    }
  }

  // Performance score bonus
  const perfScore = benchmarkResults.overallScore;
  if (perfScore > 80) satisfaction += 5;
  if (perfScore > 90) satisfaction += 5;

  return Math.max(0, Math.min(100, Math.round(satisfaction)));
}
