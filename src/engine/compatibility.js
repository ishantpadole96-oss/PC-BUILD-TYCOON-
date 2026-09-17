// Compatibility Engine - Rules-based PC build validation
// Returns typed issues with severity, message, and suggestions

/**
 * Run all compatibility checks on a build
 * @param {Object} build - { cpu, gpu, motherboard, ram, storage, psu, case, cooler }
 * @returns {Object} { issues: Array<{severity, message, suggestion}>, isBootable: boolean, isComplete: boolean }
 */
export function checkCompatibility(build) {
  const issues = [];
  const { cpu, gpu, motherboard, ram: ramStick, storage: _stor, psu, case: pcCase, cooler } = build;

  // Track what's present
  const present = {};
  Object.entries(build).forEach(([k, v]) => { present[k] = !!v; });
  const requiredParts = ['cpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooler'];
  const missing = requiredParts.filter(k => !present[k]);

  // ── Missing components ──
  if (missing.length > 0 && missing.length < requiredParts.length) {
    issues.push({
      severity: 'critical',
      message: `Missing required components: ${missing.join(', ').toUpperCase()}`,
      suggestion: `Install the missing parts to complete the build.`,
    });
  }

  // ── CPU ↔ Motherboard socket ──
  if (cpu && motherboard) {
    if (cpu.socket !== motherboard.socket) {
      issues.push({
        severity: 'critical',
        message: `Socket mismatch: ${cpu.model} (${cpu.socket}) is incompatible with ${motherboard.model} (${motherboard.socket})`,
        suggestion: `Use a ${cpu.socket} motherboard for this CPU, or pick a ${motherboard.socket} CPU.`,
      });
    }
  }

  // ── Motherboard ↔ RAM type ──
  if (motherboard && ramStick) {
    const mbRamType = motherboard.compatibility?.ramType;
    const ramType = ramStick.specs?.type;
    if (mbRamType && ramType && mbRamType !== ramType) {
      issues.push({
        severity: 'critical',
        message: `RAM type mismatch: ${motherboard.model} requires ${mbRamType}, but ${ramStick.model} is ${ramType}`,
        suggestion: `Use ${mbRamType} RAM with this motherboard.`,
      });
    }
  }

  // ── CPU ↔ RAM type ──
  if (cpu && ramStick) {
    const cpuRamTypes = cpu.compatibility?.ramType?.split(',') || [];
    const ramType = ramStick.specs?.type;
    if (cpuRamTypes.length > 0 && ramType && !cpuRamTypes.includes(ramType)) {
      issues.push({
        severity: 'critical',
        message: `${cpu.model} doesn't support ${ramType} memory`,
        suggestion: `Use ${cpuRamTypes.join(' or ')} RAM with this CPU.`,
      });
    }
  }

  // ── PSU wattage ──
  if (psu) {
    const totalPower = calcTotalPowerDraw(build);
    const psuWattage = psu.specs?.wattage || 0;
    const headroom = psuWattage * 0.8;

    if (totalPower > psuWattage) {
      issues.push({
        severity: 'critical',
        message: `PSU overloaded: Build draws ~${totalPower}W but PSU provides only ${psuWattage}W`,
        suggestion: `Use a PSU with at least ${Math.ceil(totalPower * 1.2)}W capacity.`,
      });
    } else if (totalPower > headroom) {
      issues.push({
        severity: 'warning',
        message: `PSU headroom tight: ${totalPower}W / ${psuWattage}W (${Math.round(totalPower / psuWattage * 100)}% load)`,
        suggestion: `Recommended to stay below 80% load. Consider a ${Math.ceil(totalPower * 1.25 / 50) * 50}W PSU.`,
      });
    }

    // GPU minimum PSU check
    if (gpu && gpu.compatibility?.minPSU && psuWattage < gpu.compatibility.minPSU) {
      issues.push({
        severity: 'warning',
        message: `${gpu.model} recommends at least ${gpu.compatibility.minPSU}W PSU (you have ${psuWattage}W)`,
        suggestion: `Upgrade to a ${gpu.compatibility.minPSU}W or higher PSU.`,
      });
    }
  }

  // ── GPU ↔ Case clearance ──
  if (gpu && pcCase) {
    const gpuLen = gpu.specs?.length || 0;
    const maxLen = pcCase.specs?.maxGpuLength || 999;
    if (gpuLen > maxLen) {
      issues.push({
        severity: 'critical',
        message: `GPU too long: ${gpu.model} (${gpuLen}mm) won't fit in ${pcCase.model} (max ${maxLen}mm)`,
        suggestion: `Use a shorter GPU or a larger case.`,
      });
    } else if (maxLen - gpuLen < 15) {
      issues.push({
        severity: 'info',
        message: `Tight GPU fit: Only ${maxLen - gpuLen}mm clearance remaining`,
        suggestion: `This will work but cable management may be challenging.`,
      });
    }
  }

  // ── Cooler ↔ CPU socket ──
  if (cooler && cpu) {
    const supportedSockets = cooler.compatibility?.sockets || cooler.specs?.sockets || [];
    if (supportedSockets.length > 0 && !supportedSockets.includes(cpu.socket)) {
      issues.push({
        severity: 'critical',
        message: `Cooler ${cooler.model} doesn't support ${cpu.socket} socket`,
        suggestion: `Choose a cooler compatible with ${cpu.socket}.`,
      });
    }
  }

  // ── Cooler height ↔ Case ──
  if (cooler && pcCase && cooler.specs?.height) {
    const maxH = pcCase.specs?.maxCoolerHeight || 999;
    if (cooler.specs.height > maxH) {
      issues.push({
        severity: 'critical',
        message: `Cooler too tall: ${cooler.model} (${cooler.specs.height}mm) won't fit in ${pcCase.model} (max ${maxH}mm)`,
        suggestion: `Use a shorter cooler or a taller case.`,
      });
    }
  }

  // ── Motherboard form factor ↔ Case ──
  if (motherboard && pcCase) {
    const ffOrder = { 'ITX': 0, 'mATX': 1, 'ATX': 2, 'EATX': 3 };
    const mbFF = motherboard.specs?.formFactor;
    const caseFF = pcCase.specs?.formFactor;
    if (mbFF && caseFF && (ffOrder[mbFF] ?? 0) > (ffOrder[caseFF] ?? 0)) {
      issues.push({
        severity: 'critical',
        message: `${motherboard.model} (${mbFF}) is too large for ${pcCase.model} (${caseFF})`,
        suggestion: `Use a ${caseFF} or smaller motherboard, or upgrade the case.`,
      });
    }
  }

  // ── Cooling adequacy ──
  if (cpu && cooler) {
    const cpuTdp = cpu.specs?.tdp || cpu.powerDraw || 65;
    const coolerTdp = cooler.specs?.maxTDP || 100;
    if (cpuTdp > coolerTdp) {
      issues.push({
        severity: 'warning',
        message: `Cooler may be insufficient: ${cooler.model} rated for ${coolerTdp}W but CPU TDP is ${cpuTdp}W`,
        suggestion: `Consider a more powerful cooler for optimal temperatures.`,
      });
    }
  }

  // ── GPU but no discrete + no iGPU ──
  if (!gpu && cpu && !cpu.specs?.integratedGraphics) {
    issues.push({
      severity: 'critical',
      message: `No display output: ${cpu.model} has no integrated graphics and no GPU is installed`,
      suggestion: `Add a dedicated GPU or choose a CPU with integrated graphics.`,
    });
  }

  // ── Airflow assessment ──
  if (pcCase) {
    const fanCount = pcCase.specs?.includedFans || 0;
    const totalPower = calcTotalPowerDraw(build);
    if (totalPower > 300 && fanCount < 3) {
      issues.push({
        severity: 'warning',
        message: `Airflow concern: High-power build (${totalPower}W) with only ${fanCount} case fans`,
        suggestion: `Add more case fans for better airflow.`,
      });
    }
    if (totalPower > 500 && fanCount < 4) {
      issues.push({
        severity: 'warning',
        message: `Airflow warning: Very high-power build needs excellent ventilation`,
        suggestion: `Use a case with at least 4-5 fans for builds over 500W.`,
      });
    }
  }

  // ── Determine boot status ──
  const criticals = issues.filter(i => i.severity === 'critical');
  const warnings = issues.filter(i => i.severity === 'warning');
  const infos = issues.filter(i => i.severity === 'info');
  const isComplete = missing.length === 0;
  const isBootable = isComplete && criticals.length === 0;

  return {
    issues,
    criticals,
    warnings,
    infos,
    isBootable,
    isComplete,
    score: isBootable ? 100 - (warnings.length * 5) - (infos.length * 1) : 0,
  };
}

/**
 * Calculate total system power draw
 */
export function calcTotalPowerDraw(build) {
  let total = 0;
  Object.values(build).forEach(part => {
    if (part && part.powerDraw) total += part.powerDraw;
  });
  return total;
}

/**
 * Calculate total build cost
 */
export function calcTotalCost(build) {
  let total = 0;
  Object.values(build).forEach(part => {
    if (part) total += (part.currentPrice || part.basePrice || 0);
  });
  return total;
}

/**
 * Calculate part count
 */
export function calcPartCount(build) {
  return Object.values(build).filter(Boolean).length;
}
