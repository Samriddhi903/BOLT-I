import React, { useState, useEffect, useMemo } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  ComposedChart,
  Legend,
} from "recharts";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Clock,
  ChevronRight,
  Zap,
  Users as UsersIcon,
  Briefcase,
  Target,
  UserPlus,
} from "lucide-react";
import RotatingText from "./RotatingText";

const DEFAULT_FORECAST_MONTHS = 12;
const DEFAULTS = {
  initialUsers: 0,
  initialCash: 0,
  marketSize: 0,
  initialTeamSize: 0,
  initialBurnRate: 0,
};

// Advanced simulation parameters
const SIMULATION_CONFIG = {
  // Seasonality factors (monthly multipliers)
  seasonality: {
    0: 0.9, // January
    1: 0.85, // February
    2: 0.95, // March
    3: 1.0, // April
    4: 1.05, // May
    5: 1.1, // June
    6: 1.15, // July
    7: 1.2, // August
    8: 1.15, // September
    9: 1.1, // October
    10: 1.05, // November
    11: 0.95, // December
  } as { [key: number]: number },

  // Market saturation curve
  saturationCurve: (users: number, marketSize: number) => {
    const saturation = users / marketSize;
    return Math.max(0.1, 1 - Math.pow(saturation, 0.5));
  },

  // Team scaling factors
  teamScaling: {
    burnRatePerEmployee: 8000,
    productivityPerEmployee: 1.2,
    maxTeamSize: 50,
  },

  // Funding round effects
  fundingRounds: {
    seed: { amount: 500000, dilution: 0.15, burnRateIncrease: 1.5 },
    seriesA: { amount: 2000000, dilution: 0.2, burnRateIncrease: 2.0 },
    seriesB: { amount: 5000000, dilution: 0.25, burnRateIncrease: 2.5 },
  } as {
    [key: string]: {
      amount: number;
      dilution: number;
      burnRateIncrease: number;
    };
  },

  // Product-market fit effects
  pmfEffects: {
    viralCoefficient: 0.1,
    referralMultiplier: 1.5,
    retentionImprovement: 0.1,
  },
};

// Add input validation constants
const INPUT_CONSTRAINTS = {
  users: {
    min: 1,
    max: 1000000,
    step: 1,
    presets: [
      { label: "Startup", value: 100 },
      { label: "Growth", value: 1000 },
      { label: "Scale", value: 10000 },
    ],
  },
  cash: {
    min: 0,
    max: 10000000,
    step: 1000,
    presets: [
      { label: "Seed", value: 50000 },
      { label: "Series A", value: 500000 },
      { label: "Series B", value: 2000000 },
    ],
  },
  marketSize: {
    min: 1000,
    max: 10000000,
    step: 1000,
    presets: [
      { label: "Niche", value: 10000 },
      { label: "Growing", value: 100000 },
      { label: "Large", value: 1000000 },
    ],
  },
  teamSize: {
    min: 1,
    max: 50,
    step: 1,
    presets: [2, 3, 5, 10, 20],
  },
  forecast: {
    min: 1,
    max: 60,
    step: 1,
    presets: [6, 12, 24, 36],
  },
};

// Add helper function for number formatting
const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

// Add validation helper
const validateInput = (
  value: number,
  constraints: { min: number; max: number }
): number => {
  if (isNaN(value)) return constraints.min;
  return Math.min(Math.max(value, constraints.min), constraints.max);
};

function getDefaultMonth(i: number) {
  return {
    monthName: `Month ${i + 1}`,
    marketingSpend: 3000,
    burnRate: 8000,
    cac: 30,
    churnRate: 0.05,
    arpu: 20,
    teamSize: 3,
    productImprovements: 0,
    marketExpansion: 0,
    fundingRound: null,
  };
}

function forecastMonths(monthsData: any[], monthsAhead: number) {
  const n = monthsData.length;
  const forecasted = [];

  for (let i = 0; i < monthsAhead; i++) {
    const last = monthsData[n - 1 - (i % n)];
    const monthIndex = (n + i) % 12; // For seasonality

    // Apply trend-based forecasting
    const trendFactor = 1 + i * 0.02; // 2% monthly growth trend
    const seasonalityFactor = SIMULATION_CONFIG.seasonality[monthIndex] || 1;

    forecasted.push({
      ...last,
      monthName: `Forecast ${i + 1}`,
      marketingSpend: Math.round(
        last.marketingSpend * trendFactor * seasonalityFactor
      ),
      burnRate: Math.round(last.burnRate * (1 + i * 0.01)), // Gradual burn rate increase
      cac: Math.max(5, last.cac * (1 - i * 0.005)), // CAC optimization over time
      churnRate: Math.max(0.01, last.churnRate * (1 - i * 0.01)), // Churn improvement
      arpu: Math.round(last.arpu * (1 + i * 0.015)), // ARPU growth
      teamSize: Math.min(
        SIMULATION_CONFIG.teamScaling.maxTeamSize,
        Math.round(last.teamSize * (1 + i * 0.05))
      ), // Team growth
      productImprovements: last.productImprovements + i,
      marketExpansion: last.marketExpansion + i * 0.1,
      fundingRound: null,
    });
  }
  return forecasted;
}

function simulateAdvancedGrowth(
  monthsData: any[],
  initialUsers: number,
  initialCash: number,
  marketSize: number,
  initialTeamSize: number = 3
) {
  let users = initialUsers;
  let cash = initialCash;
  let teamSize = initialTeamSize;
  let totalFunding = 0;
  let equityDilution = 0;
  let pmfScore = 0.3; // Product-market fit score (0-1)
  let viralGrowth = 0;
  let marketSaturation = 1;

  const results = [];

  for (let i = 0; i < monthsData.length; i++) {
    const row = monthsData[i];
    const monthIndex = i % 12;
    const seasonalityFactor = SIMULATION_CONFIG.seasonality[monthIndex] || 1;

    // Update team size and related metrics
    teamSize = row.teamSize || teamSize;
    const baseBurnRate =
      teamSize * SIMULATION_CONFIG.teamScaling.burnRatePerEmployee;
    const adjustedBurnRate =
      baseBurnRate *
      (row.burnRate /
        (initialTeamSize * SIMULATION_CONFIG.teamScaling.burnRatePerEmployee));

    // Calculate marketing effectiveness
    const m_spend = Number(row.marketingSpend) * seasonalityFactor;
    const cac = Number(row.cac);
    const churn = Number(row.churnRate);
    const arpu = Number(row.arpu);

    // Product-market fit effects
    const pmfImprovement = (row.productImprovements || 0) * 0.05;
    pmfScore = Math.min(1, pmfScore + pmfImprovement);

    // Viral growth based on PMF
    viralGrowth =
      users * pmfScore * SIMULATION_CONFIG.pmfEffects.viralCoefficient;

    // Market saturation effects
    marketSaturation = SIMULATION_CONFIG.saturationCurve(users, marketSize);

    // Calculate new user acquisition
    const paidUsers = cac > 0 ? m_spend / cac : 0;
    const organicUsers =
      viralGrowth * SIMULATION_CONFIG.pmfEffects.referralMultiplier;
    const totalNewUsers = (paidUsers + organicUsers) * marketSaturation;

    // Update user base with improved retention
    const retentionRate =
      1 - churn + pmfScore * SIMULATION_CONFIG.pmfEffects.retentionImprovement;
    users = (users + totalNewUsers) * retentionRate;
    users = Math.min(users, marketSize);

    // Revenue calculations
    const revenue = users * arpu * (1 + pmfScore * 0.2); // PMF improves revenue per user
    const expenses = adjustedBurnRate + m_spend;
    const netCashFlow = revenue - expenses;

    // Funding round logic
    let fundingInflow = 0;
    if (row.fundingRound && cash < 50000) {
      const round = SIMULATION_CONFIG.fundingRounds[row.fundingRound];
      if (round) {
        fundingInflow = round.amount;
        totalFunding += round.amount;
        equityDilution += round.dilution;
        cash += round.amount;
      }
    }

    cash = cash + netCashFlow;

    // Calculate advanced metrics
    const ltv = arpu / churn;
    const ltvCacRatio = ltv / cac;
    const burnMultiple = Math.abs(netCashFlow) / revenue;
    const runway = cash / Math.abs(netCashFlow);

    results.push({
      month: i + 1,
      monthName: row.monthName,
      users: Math.round(users),
      revenue: Math.round(revenue),
      cash: Math.round(cash),
      expenses: Math.round(expenses),
      netCashFlow: Math.round(netCashFlow),
      newUsers: Math.round(totalNewUsers),
      paidUsers: Math.round(paidUsers),
      organicUsers: Math.round(organicUsers),
      churnedUsers: Math.round(users * churn),
      teamSize: teamSize,
      pmfScore: Math.round(pmfScore * 100) / 100,
      ltvCacRatio: Math.round(ltvCacRatio * 100) / 100,
      burnMultiple: Math.round(burnMultiple * 100) / 100,
      runway: Math.round(runway * 10) / 10,
      marketSaturation: Math.round(marketSaturation * 100) / 100,
      fundingInflow: fundingInflow,
      totalFunding: totalFunding,
      equityDilution: Math.round(equityDilution * 100) / 100,
      isForecast: row.monthName.startsWith("Forecast"),
    });

    if (cash < -100000) break; // Stop if cash goes too negative
  }
  return results;
}

// Update the team size options to just have values
const TEAM_SIZE_OPTIONS = [2, 3, 5, 10, 20] as const;

const AnalyticsPage: React.FC = () => {
  const { startupId } = useParams();
  const [forecastMonthsCount, setForecastMonthsCount] = useState(0);
  const [monthsData, setMonthsData] = useState<any[]>([]);
  const [simResult, setSimResult] = useState<any[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulationParams, setSimulationParams] = useState({
    initialUsers: 0,
    initialCash: 0,
    marketSize: 0,
    initialTeamSize: 0,
  });
  const [startupName, setStartupName] = useState<string>("");

  // Add validation for simulation start
  const canStartSimulation = useMemo(() => {
    return (
      simulationParams.initialUsers > 0 &&
      simulationParams.initialCash > 0 &&
      simulationParams.marketSize > 0 &&
      simulationParams.initialTeamSize > 0 &&
      monthsData.length > 0 &&
      forecastMonthsCount > 0
    );
  }, [simulationParams, monthsData.length, forecastMonthsCount]);

  // Fetch monthly data from MongoDB on component mount
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setMonthsData(
            Array.from({ length: 3 }, (_, i) => getDefaultMonth(i))
          );
          setLoading(false);
          return;
        }
        let url = "http://localhost:3001/api/user/startup-monthly-data";
        if (startupId) {
          url += `?startupId=${startupId}`;
        }
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch monthly data: ${response.status}`);
        }
        const data = await response.json();
        if (data.monthlyData && data.monthlyData.length > 0) {
          setMonthsData(data.monthlyData);
        } else {
          setMonthsData(
            Array.from({ length: 3 }, (_, i) => getDefaultMonth(i))
          );
        }
        setError(null);
      } catch (err) {
        setError(
          "Failed to load monthly data from server. Using default values."
        );
        setMonthsData(Array.from({ length: 3 }, (_, i) => getDefaultMonth(i)));
      } finally {
        setLoading(false);
      }
    };
    fetchMonthlyData();
  }, [startupId]);

  // Fetch startup name if viewing as investor
  useEffect(() => {
    const fetchStartupName = async () => {
      if (!startupId) return;
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(
          `http://localhost:3001/api/business/${startupId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) return;
        const data = await res.json();
        setStartupName(data.companyName || data.name || "Startup");
      } catch {
        setStartupName("Startup");
      }
    };
    fetchStartupName();
  }, [startupId]);

  // Update input handling to properly handle empty values
  const handleInputChange = (
    field: keyof typeof simulationParams,
    value: string | number,
    constraints: { min: number; max: number }
  ) => {
    // Handle empty string or null
    if (value === "" || value === null) {
      setSimulationParams((prev) => ({
        ...prev,
        [field]: 0,
      }));
      return;
    }

    // Convert to number and validate
    const numValue = typeof value === "string" ? Number(value) : value;

    // Check if it's a valid number
    if (isNaN(numValue)) {
      return;
    }

    const validatedValue = Math.min(Math.max(numValue, 0), constraints.max);
    setSimulationParams((prev) => ({
      ...prev,
      [field]: validatedValue,
    }));
  };

  const handleSimulate = () => {
    if (!canStartSimulation) {
      setError(
        "Please fill in all required parameters before running the simulation"
      );
      return;
    }

    const forecasted = forecastMonths(monthsData, forecastMonthsCount);
    const allMonths = [...monthsData, ...forecasted];
    const result = simulateAdvancedGrowth(
      allMonths,
      simulationParams.initialUsers,
      simulationParams.initialCash,
      simulationParams.marketSize,
      simulationParams.initialTeamSize
    );
    setSimResult(result);
    setShowTable(true);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-6"></div>
          <RotatingText
            text="Analyzing your startup data..."
            className="text-gray-400 text-lg"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-[#121212] to-[#121212] relative overflow-hidden">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] pointer-events-none" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none" />

      {/* Radial gradient for depth */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-gray-900/90 pointer-events-none" />

      {/* Content wrapper */}
      <div className="relative z-10 pt-24 pb-12 px-4 max-w-7xl mx-auto">
        {/* Simulation Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <Settings className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <RotatingText
                  text="Simulation Controls"
                  className="text-xl font-semibold text-white block"
                />
                <RotatingText
                  text="Configure your growth parameters"
                  className="text-gray-400 text-sm"
                  delay={0.1}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Initial Users Input */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border ${
                  simulationParams.initialUsers === 0
                    ? "border-gray-700/30"
                    : "border-gray-700/50"
                } relative group`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`p-3 ${
                      simulationParams.initialUsers === 0
                        ? "bg-purple-500/5"
                        : "bg-purple-500/10"
                    } rounded-xl group-hover:bg-purple-500/20 transition-colors`}
                  >
                    <UsersIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <RotatingText
                      text="Initial Users"
                      className="block text-gray-300 text-sm font-medium mb-1"
                    />
                    <RotatingText
                      text="Required"
                      className="text-xs text-gray-500"
                      delay={0.1}
                    />
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={
                      simulationParams.initialUsers === 0
                        ? ""
                        : simulationParams.initialUsers
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "initialUsers",
                        e.target.value,
                        INPUT_CONSTRAINTS.users
                      )
                    }
                    min={0}
                    max={INPUT_CONSTRAINTS.users.max}
                    step={INPUT_CONSTRAINTS.users.step}
                    className={`w-full bg-gray-900/50 border ${
                      simulationParams.initialUsers === 0
                        ? "border-gray-700/30 focus:border-purple-500/30"
                        : "border-gray-700/50 focus:border-purple-500/50"
                    } rounded-lg px-4 py-2.5 text-gray-100 focus:ring-2 focus:ring-purple-500/50 transition-all pl-4 pr-20`}
                    placeholder="Enter users..."
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    users
                  </span>
                </div>
                <div className="mt-3">
                  <input
                    type="range"
                    min={0}
                    max={INPUT_CONSTRAINTS.users.max}
                    step={INPUT_CONSTRAINTS.users.step}
                    value={simulationParams.initialUsers}
                    onChange={(e) =>
                      handleInputChange(
                        "initialUsers",
                        Number(e.target.value),
                        INPUT_CONSTRAINTS.users
                      )
                    }
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between mt-2">
                    {INPUT_CONSTRAINTS.users.presets.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() =>
                          handleInputChange(
                            "initialUsers",
                            preset.value,
                            INPUT_CONSTRAINTS.users
                          )
                        }
                        className="px-2 py-1 text-xs rounded-md bg-gray-700/50 text-gray-300 hover:bg-purple-500/20 hover:text-purple-400 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Initial Cash Input */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border ${
                  simulationParams.initialCash === 0
                    ? "border-gray-700/30"
                    : "border-gray-700/50"
                } relative group`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-emerald-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <RotatingText
                      text="Initial Cash"
                      className="block text-gray-300 text-sm font-medium mb-1"
                    />
                    <RotatingText
                      text="Required"
                      className="text-xs text-gray-500"
                      delay={0.1}
                    />
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={
                      simulationParams.initialCash === 0
                        ? ""
                        : simulationParams.initialCash
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "initialCash",
                        e.target.value,
                        INPUT_CONSTRAINTS.cash
                      )
                    }
                    min={0}
                    max={INPUT_CONSTRAINTS.cash.max}
                    step={INPUT_CONSTRAINTS.cash.step}
                    className={`w-full bg-gray-900/50 border ${
                      simulationParams.initialCash === 0
                        ? "border-gray-700/30 focus:border-green-500/30"
                        : "border-gray-700/50 focus:border-green-500/50"
                    } rounded-lg px-4 py-2.5 text-gray-100 focus:ring-2 focus:ring-green-500/50 transition-all pl-8`}
                    placeholder="Enter amount..."
                  />
                </div>
                <div className="mt-3">
                  <input
                    type="range"
                    min={0}
                    max={INPUT_CONSTRAINTS.cash.max}
                    step={INPUT_CONSTRAINTS.cash.step}
                    value={simulationParams.initialCash}
                    onChange={(e) =>
                      handleInputChange(
                        "initialCash",
                        Number(e.target.value),
                        INPUT_CONSTRAINTS.cash
                      )
                    }
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between mt-2">
                    {INPUT_CONSTRAINTS.cash.presets.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() =>
                          handleInputChange(
                            "initialCash",
                            preset.value,
                            INPUT_CONSTRAINTS.cash
                          )
                        }
                        className="px-2 py-1 text-xs rounded-md bg-gray-700/50 text-gray-300 hover:bg-green-500/20 hover:text-green-400 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      ${formatNumber(INPUT_CONSTRAINTS.cash.min)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ${formatNumber(INPUT_CONSTRAINTS.cash.max)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Market Size Input */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border ${
                  simulationParams.marketSize === 0
                    ? "border-gray-700/30"
                    : "border-gray-700/50"
                } relative group`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                    <Target className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <RotatingText
                      text="Market Size"
                      className="block text-gray-300 text-sm font-medium mb-1"
                    />
                    <RotatingText
                      text="Required"
                      className="text-xs text-gray-500"
                      delay={0.1}
                    />
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={
                      simulationParams.marketSize === 0
                        ? ""
                        : simulationParams.marketSize
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "marketSize",
                        e.target.value,
                        INPUT_CONSTRAINTS.marketSize
                      )
                    }
                    min={0}
                    max={INPUT_CONSTRAINTS.marketSize.max}
                    step={INPUT_CONSTRAINTS.marketSize.step}
                    className={`w-full bg-gray-900/50 border ${
                      simulationParams.marketSize === 0
                        ? "border-gray-700/30 focus:border-blue-500/30"
                        : "border-gray-700/50 focus:border-blue-500/50"
                    } rounded-lg px-4 py-2.5 text-gray-100 focus:ring-2 focus:ring-blue-500/50 transition-all`}
                    placeholder="Enter market size..."
                  />
                </div>
                <div className="mt-3">
                  <input
                    type="range"
                    min={0}
                    max={INPUT_CONSTRAINTS.marketSize.max}
                    step={INPUT_CONSTRAINTS.marketSize.step}
                    value={simulationParams.marketSize}
                    onChange={(e) =>
                      handleInputChange(
                        "marketSize",
                        Number(e.target.value),
                        INPUT_CONSTRAINTS.marketSize
                      )
                    }
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between mt-2">
                    {INPUT_CONSTRAINTS.marketSize.presets.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() =>
                          handleInputChange(
                            "marketSize",
                            preset.value,
                            INPUT_CONSTRAINTS.marketSize
                          )
                        }
                        className="px-2 py-1 text-xs rounded-md bg-gray-700/50 text-gray-300 hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Team Size Input */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border ${
                  simulationParams.initialTeamSize === 0
                    ? "border-gray-700/30"
                    : "border-gray-700/50"
                } relative group`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-red-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                    <UserPlus className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <RotatingText
                      text="Initial Team Size"
                      className="block text-gray-300 text-sm font-medium mb-1"
                    />
                    <RotatingText
                      text="Required"
                      className="text-xs text-gray-500"
                      delay={0.1}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {TEAM_SIZE_OPTIONS.map((value, index) => {
                    const isSelected =
                      simulationParams.initialTeamSize === value;
                    return (
                      <motion.button
                        key={value}
                        onClick={() =>
                          handleInputChange(
                            "initialTeamSize",
                            value,
                            INPUT_CONSTRAINTS.teamSize
                          )
                        }
                        whileHover={!isSelected ? { scale: 1.05 } : {}}
                        whileTap={!isSelected ? { scale: 0.95 } : {}}
                        className={`relative p-4 rounded-xl ${
                          isSelected
                            ? "bg-orange-500/20 text-orange-400 ring-2 ring-orange-500/50"
                            : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
                        } transition-all duration-200 flex items-center justify-center`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <span className="text-2xl font-semibold">{value}</span>
                      </motion.button>
                    );
                  })}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={
                      simulationParams.initialTeamSize === 0
                        ? ""
                        : simulationParams.initialTeamSize
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "initialTeamSize",
                        e.target.value,
                        INPUT_CONSTRAINTS.teamSize
                      )
                    }
                    min={0}
                    max={INPUT_CONSTRAINTS.teamSize.max}
                    step={INPUT_CONSTRAINTS.teamSize.step}
                    className={`w-full bg-gray-900/50 border ${
                      simulationParams.initialTeamSize === 0
                        ? "border-gray-700/30 focus:border-orange-500/30"
                        : "border-gray-700/50 focus:border-orange-500/50"
                    } rounded-lg px-4 py-2.5 text-gray-100 focus:ring-2 focus:ring-orange-500/50 transition-all`}
                    placeholder="Enter team size..."
                  />
                </div>
              </motion.div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-6 p-4 bg-gray-800/30 rounded-xl backdrop-blur-sm border border-gray-700/50">
                <div>
                  <RotatingText
                    text="Historical Data"
                    className="block text-gray-300 text-sm font-medium mb-1"
                  />
                  <div className="flex items-center gap-2">
                    <RotatingText
                      text={monthsData.length.toString()}
                      className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
                    />
                    <RotatingText
                      text="months"
                      className="text-gray-400 text-sm"
                      delay={0.1}
                    />
                  </div>
                </div>
                <div className="h-12 w-px bg-gray-700/50" />
                <div>
                  <RotatingText
                    text="Forecast Period"
                    className="block text-gray-300 text-sm font-medium mb-1"
                  />
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={INPUT_CONSTRAINTS.forecast.max}
                      step={INPUT_CONSTRAINTS.forecast.step}
                      value={forecastMonthsCount}
                      onChange={(e) =>
                        setForecastMonthsCount(
                          validateInput(
                            Number(e.target.value),
                            INPUT_CONSTRAINTS.forecast
                          )
                        )
                      }
                      className={`w-32 ${
                        forecastMonthsCount === 0
                          ? "accent-gray-600"
                          : "accent-purple-500"
                      }`}
                    />
                    <RotatingText
                      text={forecastMonthsCount.toString()}
                      className={`text-2xl font-bold ${
                        forecastMonthsCount === 0
                          ? "text-gray-600"
                          : "bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
                      }`}
                    />
                    <RotatingText
                      text="months"
                      className="text-gray-400 text-sm"
                      delay={0.1}
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {INPUT_CONSTRAINTS.forecast.presets.map((months) => (
                      <button
                        key={months}
                        onClick={() => setForecastMonthsCount(months)}
                        className={`px-2 py-1 text-xs rounded-md ${
                          forecastMonthsCount === months
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-gray-700/50 text-gray-300 hover:bg-purple-500/10"
                        } transition-colors`}
                      >
                        {months}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: canStartSimulation ? 1.02 : 1 }}
                whileTap={{ scale: canStartSimulation ? 0.98 : 1 }}
                onClick={handleSimulate}
                disabled={!canStartSimulation}
                className={`px-8 py-3 bg-gradient-to-r ${
                  canStartSimulation
                    ? "from-purple-600 to-blue-600 hover:shadow-purple-500/40"
                    : "from-gray-700 to-gray-600"
                } rounded-xl text-white font-medium shadow-lg shadow-purple-500/25 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <TrendingUp className="w-5 h-5" />
                <RotatingText text="Run Simulation" />
              </motion.button>
              {error && (
                <RotatingText text={error} className="text-red-400 text-sm" />
              )}
            </div>
          </div>
        </motion.div>

        {/* Historical Data Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <RotatingText
                text="Historical Performance"
                className="text-xl font-semibold text-white"
              />
              <RotatingText
                text="Your startup's monthly metrics"
                className="text-gray-400 text-sm"
                delay={0.1}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monthsData.map((row, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800/50 shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {row.monthName}
                  </h3>
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Clock className="w-4 h-4 text-purple-400" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Marketing Spend</span>
                    <span className="text-gray-200 font-medium">
                      ${row.marketingSpend?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Burn Rate</span>
                    <span className="text-gray-200 font-medium">
                      ${row.burnRate?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">CAC</span>
                    <span className="text-gray-200 font-medium">
                      ${row.cac}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Churn Rate</span>
                    <span className="text-gray-200 font-medium">
                      {(row.churnRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">ARPU</span>
                    <span className="text-gray-200 font-medium">
                      ${row.arpu}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Team Size</span>
                    <span className="text-gray-200 font-medium">
                      {row.teamSize || 3}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {simResult.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-12"
          >
            {/* Key Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800/50 shadow-xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-gray-400">Final Users</h3>
                </div>
                <p className="text-3xl font-bold text-white">
                  {simResult[simResult.length - 1].users.toLocaleString()}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800/50 shadow-xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="text-gray-400">Final Cash</h3>
                </div>
                <p className="text-3xl font-bold text-white">
                  ${simResult[simResult.length - 1].cash.toLocaleString()}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800/50 shadow-xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Activity className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-gray-400">LTV/CAC Ratio</h3>
                </div>
                <p className="text-3xl font-bold text-white">
                  {simResult[simResult.length - 1].ltvCacRatio}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800/50 shadow-xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="text-gray-400">Runway</h3>
                </div>
                <p className="text-3xl font-bold text-white">
                  {simResult[simResult.length - 1].runway} months
                </p>
              </motion.div>
            </div>

            {/* Charts Section */}
            <div className="space-y-8">
              {/* Growth & Revenue Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Growth & Revenue Analysis
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Track your key growth metrics
                    </p>
                  </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800/50 shadow-xl">
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={simResult}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="monthName" stroke="#a1a1aa" />
                      <YAxis yAxisId="left" stroke="#a1a1aa" />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#a1a1aa"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f1f1f",
                          border: "1px solid #333",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        }}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="users"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={false}
                        name="Users"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={false}
                        name="Revenue"
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="cash"
                        fill="rgba(245, 158, 11, 0.1)"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        name="Cash"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* User Acquisition & Retention */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      User Acquisition & Retention
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Monitor your user growth channels
                    </p>
                  </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800/50 shadow-xl">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={simResult}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="monthName" stroke="#a1a1aa" />
                      <YAxis stroke="#a1a1aa" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f1f1f",
                          border: "1px solid #333",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        }}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Legend />
                      <Bar dataKey="newUsers" fill="#8b5cf6" name="New Users" />
                      <Bar
                        dataKey="paidUsers"
                        fill="#22c55e"
                        name="Paid Users"
                      />
                      <Bar
                        dataKey="organicUsers"
                        fill="#f59e0b"
                        name="Organic Users"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Business Health Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-purple-500/10 rounded-xl">
                    <Activity className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Business Health Metrics
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Track your key performance indicators
                    </p>
                  </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-gray-800/50 shadow-xl">
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={simResult}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="monthName" stroke="#a1a1aa" />
                      <YAxis yAxisId="left" stroke="#a1a1aa" />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#a1a1aa"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f1f1f",
                          border: "1px solid #333",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        }}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="ltvCacRatio"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={false}
                        name="LTV/CAC"
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="burnMultiple"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={false}
                        name="Burn Multiple"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="pmfScore"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        dot={false}
                        name="PMF Score"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="marketSaturation"
                        stroke="#84cc16"
                        strokeWidth={2}
                        dot={false}
                        name="Market Saturation"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Detailed Data Table */}
            <AnimatePresence>
              {showTable && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800/50 shadow-xl overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-800">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            #
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Month
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Users
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Revenue
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Cash
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Net Cash Flow
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            New Users
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            LTV/CAC
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Burn Multiple
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            PMF Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Runway
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {simResult.map((row, i) => (
                          <motion.tr
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.03 }}
                            className={`${
                              row.isForecast
                                ? "bg-purple-900/10"
                                : "hover:bg-gray-800/30"
                            } transition-colors`}
                          >
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {row.month}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {row.monthName}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {row.users.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              ${row.revenue.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              ${row.cash.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              ${row.netCashFlow.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {row.newUsers.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {row.ltvCacRatio}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {row.burnMultiple}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {row.pmfScore}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {row.runway}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
