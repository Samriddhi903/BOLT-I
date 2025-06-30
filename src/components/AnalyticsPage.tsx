import { useState, useEffect } from "react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useParams } from "react-router-dom";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_FORECAST_MONTHS = 12;
const DEFAULTS = {
  initialUsers: 100,
  initialCash: 50000,
  marketSize: 10000,
  initialTeamSize: 3,
  initialBurnRate: 8000,
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

const getEmptyMonth = (index: number) => ({
  monthName: `Month ${index + 1}`,
  marketingSpend: 3000,
  burnRate: 8000,
  cac: 30,
  churnRate: 0.05,
  arpu: 20,
  teamSize: 3,
  productImprovements: 0,
  marketExpansion: 0,
  fundingRound: null,
});

const COLORS = [
  "#8b5cf6",
  "#22c55e",
  "#f59e42",
  "#ef4444",
  "#06b6d4",
  "#eab308",
  "#6366f1",
  "#84cc16",
  "#f472b6",
  "#0ea5e9",
];

const EquitySection = styled.div`
  background: rgba(39, 39, 42, 0.7);
  border: 1px solid rgba(139, 92, 246, 0.18);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const EquityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ErrorText = styled.div`
  color: #ef4444;
  margin-bottom: 1rem;
  font-size: 0.95rem;
`;

type PendingInvestment = {
  _id: string;
  amount: number;
  equity: number;
  investorId: string;
};

// Advanced animations
const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
`;

const Container = styled.div`
  padding: 6rem 2rem 2rem 2rem;
  background: linear-gradient(120deg, #1a1025 0%, #13111d 50%, #0d0b14 100%);
  min-height: 100vh;
  color: #fff;
`;

const ControlSection = styled.div`
  background: rgba(20, 16, 36, 0.4);
  border-radius: 24px;
  padding: 3rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
`;

const MonthsDisplay = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr auto;
  gap: 4rem;
  align-items: center;
`;

const MonthSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const MonthLabel = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &::before {
    content: "";
    width: 8px;
    height: 8px;
    background: #8b5cf6;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
  }
`;

const MonthValue = styled.div`
  font-size: 5rem;
  font-weight: 600;
  color: #fff;
  line-height: 1;
`;

const RangeSlider = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
`;

const MonthSlider = styled.input`
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  background: linear-gradient(90deg, #8b5cf6 0%, rgba(139, 92, 246, 0.2) 100%);
  border-radius: 2px;
  outline: none;
  opacity: 0.9;
  margin: 1rem 0;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #8b5cf6;
    cursor: pointer;
    border: 3px solid #fff;
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  height: 100%;
`;

const Button = styled(motion.button)`
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(139, 92, 246, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Card = styled(motion.div)`
  background: rgba(30, 30, 45, 0.4);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 24px;
  padding: 2.5rem;
  margin-bottom: 2rem;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #fff;
    margin: 0;
  }

  p {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
    margin: 0;
  }
`;

const IconWrapper = styled.div`
  background: rgba(139, 92, 246, 0.2);
  border-radius: 12px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Input = styled.input`
  width: 100%;
  background: rgba(20, 20, 35, 0.4);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  color: #fff;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: rgba(139, 92, 246, 0.4);
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
  }
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div`
  background: rgba(20, 20, 35, 0.4);
  border: 1px solid rgba(139, 92, 246, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.75rem;
`;

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// Add Modal styled component
const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled(motion.div)`
  background: rgba(30, 30, 45, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

// Add this at the end of your file for global animations
const GlobalStyle = createGlobalStyle`
  @keyframes pulse {
    0% { opacity: 0.8; }
    50% { opacity: 1; }
    100% { opacity: 0.8; }
  }
`;

// Add back the ChartContainer component
const ChartContainer = styled(Card)`
  height: 400px;
  margin-bottom: 2rem;
`;

const Table = styled.div`
  width: 100%;
  overflow-x: auto;
  background: rgba(20, 20, 35, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  margin-bottom: 2rem;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 50px 150px repeat(10, minmax(120px, 1fr));
  padding: 1rem;
  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
  position: sticky;
  top: 0;
  background: rgba(20, 20, 35, 0.95);
  backdrop-filter: blur(10px);

  > div {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.5rem;
    text-align: right;

    &:first-child,
    &:nth-child(2) {
      text-align: left;
    }
  }
`;

const TableRow = styled.div<{ isForecast?: boolean }>`
  display: grid;
  grid-template-columns: 50px 150px repeat(10, minmax(120px, 1fr));
  padding: 1rem;
  border-bottom: 1px solid rgba(139, 92, 246, 0.1);
  background: ${(props) =>
    props.isForecast ? "rgba(139, 92, 246, 0.1)" : "transparent"};
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(139, 92, 246, 0.15);
  }

  > div {
    padding: 0.5rem;
    text-align: right;
    color: rgba(255, 255, 255, 0.9);

    &:first-child,
    &:nth-child(2) {
      text-align: left;
    }
  }
`;

// Add the BarChartContainer component
const BarChartContainer = styled(Card)`
  height: 400px;
  margin-bottom: 2rem;
`;

const AnalyticsPage: React.FC = () => {
  const { startupId } = useParams();
  const [forecastMonthsCount, setForecastMonthsCount] = useState(
    DEFAULT_FORECAST_MONTHS
  );
  const [monthsData, setMonthsData] = useState<any[]>([]);
  const [simResult, setSimResult] = useState<any[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulationParams, setSimulationParams] = useState({
    initialUsers: DEFAULTS.initialUsers,
    initialCash: DEFAULTS.initialCash,
    marketSize: DEFAULTS.marketSize,
    initialTeamSize: DEFAULTS.initialTeamSize,
  });
  const [startupName, setStartupName] = useState<string>("");
  const [showAddMonth, setShowAddMonth] = useState(false);
  const [newMonth, setNewMonth] = useState<any>(
    getEmptyMonth(monthsData.length)
  );
  const [addMonthLoading, setAddMonthLoading] = useState(false);
  const [equityStructure, setEquityStructure] = useState<
    { name: string; percentage: number }[]
  >([]);
  const [lastValuation, setLastValuation] = useState<number | null>(null);
  const [showAddStakeholder, setShowAddStakeholder] = useState(false);
  const [newStakeholder, setNewStakeholder] = useState({
    name: "",
    percentage: 0,
  });
  const [valuationInput, setValuationInput] = useState<string>("");
  const [equityError, setEquityError] = useState("");
  const [pendingInvestments, setPendingInvestments] = useState<
    PendingInvestment[]
  >([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState("");
  const [userRole, setUserRole] = useState<"startup" | "investor" | null>(null);

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

  // Fetch equity structure and valuation
  useEffect(() => {
    const fetchEquity = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        let url =
          "http://localhost:3001/api/business/" +
          (startupId || JSON.parse(atob(token.split(".")[1])).userId);
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setEquityStructure(
          data.equityStructure || [{ name: "Owner", percentage: 100 }]
        );
        setLastValuation(data.lastValuation || null);
        setValuationInput(data.lastValuation ? String(data.lastValuation) : "");
      } catch {}
    };
    fetchEquity();
  }, [startupId]);

  useEffect(() => {
    // Only fetch if user is a startup (add your own user role check if needed)
    const fetchPendingInvestments = async () => {
      setPendingLoading(true);
      setPendingError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(
          "http://localhost:3001/api/startup/pending-investments",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch pending investments");
        const data = await res.json();
        setPendingInvestments(data.investments || []);
      } catch (err) {
        setPendingError("Error loading pending investments");
      } finally {
        setPendingLoading(false);
      }
    };
    fetchPendingInvestments();
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch("http://localhost:3001/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role);
        }
      } catch (error) {
        // ignore
      }
    };
    fetchUserRole();
  }, []);

  const handleSimulate = () => {
    if (monthsData.length === 0) {
      setError("No monthly data available for simulation");
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

  // Add Month handler
  const handleAddMonth = () => {
    setNewMonth(getEmptyMonth(monthsData.length));
    setShowAddMonth(true);
  };

  const handleNewMonthChange = (field: string, value: any) => {
    setNewMonth((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleAddMonthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMonthLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");
      // Append new month to monthsData
      const updatedMonths = [...monthsData, newMonth];
      const response = await fetch(
        "http://localhost:3001/api/user/startup-monthly-data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ monthlyData: updatedMonths }),
        }
      );
      if (!response.ok) throw new Error("Failed to add month");
      setShowAddMonth(false);
      setNewMonth(getEmptyMonth(updatedMonths.length));
      // Refresh monthsData
      setMonthsData(updatedMonths);
    } catch (err) {
      alert("Failed to add month.");
    } finally {
      setAddMonthLoading(false);
    }
  };

  const handleAddStakeholder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStakeholder.name || !newStakeholder.percentage || !valuationInput) {
      setEquityError("All fields are required.");
      return;
    }
    const perc = Number(newStakeholder.percentage);
    if (perc <= 0 || perc >= 100) {
      setEquityError("Percentage must be between 0 and 100.");
      return;
    }
    const newVal = Number(valuationInput);
    if (isNaN(newVal) || newVal <= 0) {
      setEquityError("Valuation must be a positive number.");
      return;
    }
    // Dilute existing holders
    const remaining = 100 - perc;
    const updated = equityStructure.map((holder) => ({
      ...holder,
      percentage: Number(((holder.percentage / 100) * remaining).toFixed(2)),
    }));
    const newStruct = [
      ...updated,
      { name: newStakeholder.name, percentage: perc },
    ];
    setEquityStructure(newStruct);
    setLastValuation(newVal);
    setShowAddStakeholder(false);
    setNewStakeholder({ name: "", percentage: 0 });
    setEquityError("");
    // Persist to backend
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await fetch("http://localhost:3001/api/user/startup-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          equityStructure: newStruct,
          lastValuation: newVal,
        }),
      });
    } catch {}
  };

  const handleValuationChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValuationInput(e.target.value);
    const newVal = Number(e.target.value);
    if (!isNaN(newVal) && newVal > 0) {
      setLastValuation(newVal);
      // Persist to backend
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        await fetch("http://localhost:3001/api/user/startup-details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            equityStructure,
            lastValuation: newVal,
          }),
        });
      } catch {}
    }
  };

  const handleApprove = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3001/api/investments/${id}/approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setPendingInvestments(pendingInvestments.filter((inv) => inv._id !== id));
  };

  const handleReject = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3001/api/investments/${id}/reject`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setPendingInvestments(pendingInvestments.filter((inv) => inv._id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your startup data...</p>
        </div>
      </div>
    );
  }

  return (
    <Container>
      <motion.div className="max-w-7xl mx-auto">
        <Card>
          <Title>
            <IconWrapper>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                  stroke="#8B5CF6"
                  strokeWidth="2"
                />
                <path
                  d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1656 17.2551 20.3766 17.7642 20.3766 18.295C20.3766 18.8258 20.1656 19.3349 19.79 19.71C19.4149 20.0856 18.9058 20.2966 18.375 20.2966C17.8442 20.2966 17.3351 20.0856 16.96 19.71L16.9 19.65C16.4178 19.1783 15.6971 19.0477 15.08 19.32C14.4755 19.5791 14.0826 20.1724 14.08 20.83V21C14.08 22.1046 13.1846 23 12.08 23C10.9754 23 10.08 22.1046 10.08 21V20.91C10.0642 20.2327 9.63587 19.6339 9 19.4C8.38291 19.1277 7.66219 19.2583 7.18 19.73L7.12 19.79C6.74485 20.1656 6.23582 20.3766 5.705 20.3766C5.17418 20.3766 4.66515 20.1656 4.29 19.79C3.91435 19.4149 3.70336 18.9058 3.70336 18.375C3.70336 17.8442 3.91435 17.3351 4.29 16.96L4.35 16.9C4.82167 16.4178 4.95231 15.6971 4.68 15.08C4.42093 14.4755 3.82758 14.0826 3.17 14.08H3C1.89543 14.08 1 13.1846 1 12.08C1 10.9754 1.89543 10.08 3 10.08H3.09C3.76733 10.0642 4.36613 9.63587 4.6 9C4.87231 8.38291 4.74167 7.66219 4.27 7.18L4.21 7.12C3.83435 6.74485 3.62336 6.23582 3.62336 5.705C3.62336 5.17418 3.83435 4.66515 4.21 4.29C4.58515 3.91435 5.09418 3.70336 5.625 3.70336C6.15582 3.70336 6.66485 3.91435 7.04 4.29L7.1 4.35C7.58219 4.82167 8.30291 4.95231 8.92 4.68H9C9.60447 4.42093 9.99738 3.82758 10 3.17V3C10 1.89543 10.8954 1 12 1C13.1046 1 14 1.89543 14 3V3.09C14.0026 3.74758 14.3955 4.34093 15 4.6C15.6171 4.87231 16.3378 4.74167 16.82 4.27L16.88 4.21C17.2551 3.83435 17.7642 3.62336 18.295 3.62336C18.8258 3.62336 19.3349 3.83435 19.71 4.21C20.0856 4.58515 20.2966 5.09418 20.2966 5.625C20.2966 6.15582 20.0856 6.66485 19.71 7.04L19.65 7.1C19.1783 7.58219 19.0477 8.30291 19.32 8.92V9C19.5791 9.60447 20.1724 9.99738 20.83 10H21C22.1046 10 23 10.8954 23 12C23 13.1046 22.1046 14 21 14H20.91C20.2524 14.0026 19.6591 14.3955 19.4 15Z"
                  stroke="#8B5CF6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </IconWrapper>
            <div>
              <h2>Simulation Controls</h2>
              <p>Configure your growth parameters</p>
            </div>
          </Title>

          <MetricGrid>
            <MetricCard>
              <MetricLabel>Initial Users</MetricLabel>
              <Input
                type="number"
                value={simulationParams.initialUsers}
                onChange={(e) =>
                  setSimulationParams((prev) => ({
                    ...prev,
                    initialUsers: Number(e.target.value),
                  }))
                }
              />
            </MetricCard>
            <MetricCard>
              <MetricLabel>Initial Cash ($)</MetricLabel>
              <Input
                type="number"
                value={simulationParams.initialCash}
                onChange={(e) =>
                  setSimulationParams((prev) => ({
                    ...prev,
                    initialCash: Number(e.target.value),
                  }))
                }
              />
            </MetricCard>
            <MetricCard>
              <MetricLabel>Market Size</MetricLabel>
              <Input
                type="number"
                value={simulationParams.marketSize}
                onChange={(e) =>
                  setSimulationParams((prev) => ({
                    ...prev,
                    marketSize: Number(e.target.value),
                  }))
                }
              />
            </MetricCard>
            <MetricCard>
              <MetricLabel>Initial Team Size</MetricLabel>
              <Input
                type="number"
                value={simulationParams.initialTeamSize}
                onChange={(e) =>
                  setSimulationParams((prev) => ({
                    ...prev,
                    initialTeamSize: Number(e.target.value),
                  }))
                }
              />
            </MetricCard>
          </MetricGrid>

          <MonthsDisplay>
            <MonthSection>
              <MonthLabel>Historical Months</MonthLabel>
              <MonthValue>{monthsData.length}</MonthValue>
            </MonthSection>

            <RangeSlider>
              <MonthLabel>Forecast Range</MonthLabel>
              <MonthSlider
                type="range"
                min={1}
                max={36}
                value={forecastMonthsCount}
                onChange={(e) => setForecastMonthsCount(Number(e.target.value))}
              />
              <MonthValue style={{ textAlign: "right" }}>
                {forecastMonthsCount}
              </MonthValue>
            </RangeSlider>

            <ButtonGroup>
              <Button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSimulate}
              >
                Run Simulation
              </Button>
              <Button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddMonth}
              >
                Add Month
              </Button>
            </ButtonGroup>
          </MonthsDisplay>
        </Card>

        {/* Historical Months Display */}
        {monthsData.length > 0 && (
          <Card>
            <Title>
              <h2>Historical Performance</h2>
            </Title>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {monthsData.map((month, index) => (
                <MetricCard key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <MetricLabel>{month.monthName}</MetricLabel>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Marketing Spend</span>
                      <span className="text-white">
                        ${month.marketingSpend}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Burn Rate</span>
                      <span className="text-white">${month.burnRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">CAC</span>
                      <span className="text-white">${month.cac}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Churn Rate</span>
                      <span className="text-white">
                        {(month.churnRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">ARPU</span>
                      <span className="text-white">${month.arpu}</span>
                    </div>
                  </div>
                </MetricCard>
              ))}
            </div>
          </Card>
        )}

        {/* Simulation Results */}
        {simResult.length > 0 && (
          <motion.div variants={stagger}>
            <Card>
              <Title>
                <h2>Key Metrics</h2>
              </Title>
              <MetricGrid>
                <MetricCard>
                  <MetricLabel>Final Users</MetricLabel>
                  <div className="text-2xl font-semibold text-purple-500">
                    {simResult[simResult.length - 1].users.toLocaleString()}
                  </div>
                </MetricCard>
                <MetricCard>
                  <MetricLabel>Final Cash</MetricLabel>
                  <div className="text-2xl font-semibold text-purple-500">
                    ${simResult[simResult.length - 1].cash.toLocaleString()}
                  </div>
                </MetricCard>
                <MetricCard>
                  <MetricLabel>LTV/CAC Ratio</MetricLabel>
                  <div className="text-2xl font-semibold text-purple-500">
                    {simResult[simResult.length - 1].ltvCacRatio}
                  </div>
                </MetricCard>
                <MetricCard>
                  <MetricLabel>Runway (months)</MetricLabel>
                  <div className="text-2xl font-semibold text-purple-500">
                    {simResult[simResult.length - 1].runway}
                  </div>
                </MetricCard>
              </MetricGrid>
            </Card>

            {/* Growth & Revenue Chart */}
            <ChartContainer>
              <Title>
                <h2>Growth & Revenue Analysis</h2>
              </Title>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={simResult}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis dataKey="monthName" stroke="#a1a1aa" />
                  <YAxis yAxisId="left" stroke="#a1a1aa" />
                  <YAxis yAxisId="right" orientation="right" stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(24, 24, 27, 0.9)",
                      border: "1px solid rgba(139, 92, 246, 0.2)",
                      borderRadius: "8px",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="users"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="cash"
                    fill="rgba(139, 92, 246, 0.1)"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Business Health Chart */}
            <ChartContainer>
              <Title>
                <h2>Business Health Metrics</h2>
              </Title>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={simResult}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis dataKey="monthName" stroke="#a1a1aa" />
                  <YAxis yAxisId="left" stroke="#a1a1aa" />
                  <YAxis yAxisId="right" orientation="right" stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(24, 24, 27, 0.9)",
                      border: "1px solid rgba(139, 92, 246, 0.2)",
                      borderRadius: "8px",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="ltvCacRatio"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="burnMultiple"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="pmfScore"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* User Growth Bar Chart */}
            <BarChartContainer>
              <Title>
                <h2>Monthly User Growth</h2>
              </Title>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={simResult}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis dataKey="monthName" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(24, 24, 27, 0.9)",
                      border: "1px solid rgba(139, 92, 246, 0.2)",
                      borderRadius: "8px",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="newUsers" name="New Users" fill="#8b5cf6" />
                  <Bar dataKey="users" name="Total Users" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </BarChartContainer>

            {/* Detailed Simulation Results Table - Moved to just above Equity Structure */}
            <Card>
              <Title>
                <h2>Detailed Simulation Results</h2>
              </Title>
              <Table>
                <TableHeader>
                  <div>#</div>
                  <div>Month</div>
                  <div>Users</div>
                  <div>Revenue</div>
                  <div>Cash</div>
                  <div>Net Cash Flow</div>
                  <div>New Users</div>
                  <div>LTV/CAC</div>
                  <div>Burn Multiple</div>
                  <div>PMF Score</div>
                  <div>Runway</div>
                  <div>Forecast?</div>
                </TableHeader>
                {simResult.map((row, index) => (
                  <TableRow
                    key={index}
                    isForecast={row.monthName.startsWith("Forecast")}
                  >
                    <div>{index + 1}</div>
                    <div>{row.monthName}</div>
                    <div>{row.users.toLocaleString()}</div>
                    <div>${row.revenue.toLocaleString()}</div>
                    <div>${row.cash.toLocaleString()}</div>
                    <div>${row.netCashFlow.toLocaleString()}</div>
                    <div>{row.newUsers.toLocaleString()}</div>
                    <div>{row.ltvCacRatio.toFixed(2)}</div>
                    <div>{row.burnMultiple.toFixed(2)}</div>
                    <div>{row.pmfScore.toFixed(2)}</div>
                    <div>{row.runway.toFixed(1)}</div>
                    <div>
                      {row.monthName.startsWith("Forecast") ? "Yes" : ""}
                    </div>
                  </TableRow>
                ))}
              </Table>
            </Card>
          </motion.div>
        )}

        {/* Equity Structure Section */}
        <EquitySection>
          <h3 className="text-lg font-semibold text-gray-100 mb-2">
            Equity Structure
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Current ownership breakdown. Add a stakeholder to simulate dilution.
          </p>
          {equityError && <ErrorText>{equityError}</ErrorText>}
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <PieChart width={320} height={320}>
              <Pie
                data={equityStructure}
                dataKey="percentage"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
              >
                {equityStructure.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={COLORS[idx % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value}%`} />
              <Legend />
            </PieChart>
            <div>
              <div className="mb-4">
                <label className="block text-gray-200 font-medium mb-1">
                  Last Valuation ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={valuationInput}
                  onChange={handleValuationChange}
                  className="w-full bg-[#23232b] text-gray-100 rounded px-3 py-2"
                />
              </div>
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow"
                onClick={() => setShowAddStakeholder(true)}
                type="button"
              >
                + Add Stakeholder
              </button>
            </div>
          </div>
          <div className="mt-6">
            {equityStructure.map((holder, idx) => (
              <EquityRow key={idx}>
                <span
                  className="text-gray-100 font-medium"
                  style={{ minWidth: 120 }}
                >
                  {holder.name}
                </span>
                <span className="text-gray-400">{holder.percentage}%</span>
              </EquityRow>
            ))}
          </div>
          {showAddStakeholder && (
            <form
              onSubmit={handleAddStakeholder}
              className="mt-6 bg-[#23232b] rounded-lg p-6"
            >
              <h4 className="text-gray-100 font-semibold mb-2">
                Add New Stakeholder
              </h4>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Stakeholder Name"
                  value={newStakeholder.name}
                  onChange={(e) =>
                    setNewStakeholder({
                      ...newStakeholder,
                      name: e.target.value,
                    })
                  }
                  className="bg-[#18181b] text-gray-100 rounded px-3 py-2 flex-1"
                  required
                />
                <input
                  type="number"
                  min={0.1}
                  max={99.9}
                  step={0.1}
                  placeholder="% Equity"
                  value={newStakeholder.percentage}
                  onChange={(e) =>
                    setNewStakeholder({
                      ...newStakeholder,
                      percentage: Number(e.target.value),
                    })
                  }
                  className="bg-[#18181b] text-gray-100 rounded px-3 py-2 flex-1"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-200 font-medium mb-1">
                  Valuation ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={valuationInput}
                  onChange={(e) => setValuationInput(e.target.value)}
                  className="w-full bg-[#18181b] text-gray-100 rounded px-3 py-2"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg shadow"
              >
                Add Stakeholder
              </button>
              <button
                type="button"
                className="ml-4 text-gray-400 underline"
                onClick={() => setShowAddStakeholder(false)}
              >
                Cancel
              </button>
            </form>
          )}
        </EquitySection>

        {/* Pending Investments Dashboard */}
        {userRole === "startup" &&
          (pendingLoading ? (
            <div className="p-4 text-center">
              Loading pending investments...
            </div>
          ) : pendingInvestments.length > 0 ? (
            <div className="p-4 bg-purple-900/10 rounded-xl mb-6">
              <h2 className="text-xl font-bold mb-2 text-purple-400">
                Pending Investment Requests
              </h2>
              <ul>
                {pendingInvestments.map((inv) => (
                  <li
                    key={inv._id}
                    className="mb-3 flex items-center justify-between bg-purple-900/20 p-3 rounded"
                  >
                    <div>
                      <div className="font-semibold text-white">
                        Amount: ${inv.amount} | Equity: {inv.equity}%
                      </div>
                      <div className="text-sm text-gray-300">
                        Investor ID: {inv.investorId}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(inv._id)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(inv._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null)}

        {/* Add Month Modal */}
        {showAddMonth && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalContent
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              style={{
                background: "rgba(30, 30, 45, 0.95)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              }}
            >
              <Button
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  padding: "0.5rem",
                  minWidth: "auto",
                  background: "transparent",
                  border: "none",
                }}
                onClick={() => setShowAddMonth(false)}
              >
                ✕
              </Button>
              <Title>
                <h2>Add New Month</h2>
              </Title>
              <form onSubmit={handleAddMonthSubmit}>
                <MetricGrid>
                  <MetricCard>
                    <MetricLabel>Month Name</MetricLabel>
                    <Input
                      type="text"
                      value={newMonth.monthName}
                      onChange={(e) =>
                        handleNewMonthChange("monthName", e.target.value)
                      }
                      placeholder={`Month ${monthsData.length + 1}`}
                    />
                  </MetricCard>
                  <MetricCard>
                    <MetricLabel>Marketing Spend</MetricLabel>
                    <Input
                      type="number"
                      value={newMonth.marketingSpend}
                      onChange={(e) =>
                        handleNewMonthChange(
                          "marketingSpend",
                          Number(e.target.value)
                        )
                      }
                    />
                  </MetricCard>
                  <MetricCard>
                    <MetricLabel>Burn Rate</MetricLabel>
                    <Input
                      type="number"
                      value={newMonth.burnRate}
                      onChange={(e) =>
                        handleNewMonthChange("burnRate", Number(e.target.value))
                      }
                    />
                  </MetricCard>
                  <MetricCard>
                    <MetricLabel>CAC</MetricLabel>
                    <Input
                      type="number"
                      value={newMonth.cac}
                      onChange={(e) =>
                        handleNewMonthChange("cac", Number(e.target.value))
                      }
                    />
                  </MetricCard>
                  <MetricCard>
                    <MetricLabel>Churn Rate</MetricLabel>
                    <Input
                      type="number"
                      step="0.01"
                      value={newMonth.churnRate}
                      onChange={(e) =>
                        handleNewMonthChange(
                          "churnRate",
                          Number(e.target.value)
                        )
                      }
                    />
                  </MetricCard>
                  <MetricCard>
                    <MetricLabel>ARPU</MetricLabel>
                    <Input
                      type="number"
                      value={newMonth.arpu}
                      onChange={(e) =>
                        handleNewMonthChange("arpu", Number(e.target.value))
                      }
                    />
                  </MetricCard>
                </MetricGrid>
                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    type="button"
                    onClick={() => setShowAddMonth(false)}
                    style={{
                      background: "rgba(239, 68, 68, 0.2)",
                      borderColor: "rgba(239, 68, 68, 0.3)",
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addMonthLoading}>
                    {addMonthLoading ? "Adding..." : "Add Month"}
                  </Button>
                </div>
              </form>
            </ModalContent>
          </Modal>
        )}
      </motion.div>
    </Container>
  );
};

export default AnalyticsPage;
