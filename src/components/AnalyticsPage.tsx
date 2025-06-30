import  { useState, useEffect } from "react";
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
  Cell
} from "recharts";
import { useParams } from "react-router-dom";
import styled from 'styled-components';

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
    0: 0.9,   // January
    1: 0.85,  // February
    2: 0.95,  // March
    3: 1.0,   // April
    4: 1.05,  // May
    5: 1.1,   // June
    6: 1.15,  // July
    7: 1.2,   // August
    8: 1.15,  // September
    9: 1.1,   // October
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
    seriesA: { amount: 2000000, dilution: 0.20, burnRateIncrease: 2.0 },
    seriesB: { amount: 5000000, dilution: 0.25, burnRateIncrease: 2.5 },
  } as { [key: string]: { amount: number; dilution: number; burnRateIncrease: number } },
  
  // Product-market fit effects
  pmfEffects: {
    viralCoefficient: 0.1,
    referralMultiplier: 1.5,
    retentionImprovement: 0.1,
  }
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
    const last = monthsData[(n - 1 - (i % n))];
    const monthIndex = (n + i) % 12; // For seasonality
    
    // Apply trend-based forecasting
    const trendFactor = 1 + (i * 0.02); // 2% monthly growth trend
    const seasonalityFactor = SIMULATION_CONFIG.seasonality[monthIndex] || 1;
    
    forecasted.push({
      ...last,
      monthName: `Forecast ${i + 1}`,
      marketingSpend: Math.round(last.marketingSpend * trendFactor * seasonalityFactor),
      burnRate: Math.round(last.burnRate * (1 + i * 0.01)), // Gradual burn rate increase
      cac: Math.max(5, last.cac * (1 - i * 0.005)), // CAC optimization over time
      churnRate: Math.max(0.01, last.churnRate * (1 - i * 0.01)), // Churn improvement
      arpu: Math.round(last.arpu * (1 + i * 0.015)), // ARPU growth
      teamSize: Math.min(SIMULATION_CONFIG.teamScaling.maxTeamSize, 
                        Math.round(last.teamSize * (1 + i * 0.05))), // Team growth
      productImprovements: last.productImprovements + i,
      marketExpansion: last.marketExpansion + (i * 0.1),
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
    const baseBurnRate = teamSize * SIMULATION_CONFIG.teamScaling.burnRatePerEmployee;
    const adjustedBurnRate = baseBurnRate * (row.burnRate / (initialTeamSize * SIMULATION_CONFIG.teamScaling.burnRatePerEmployee));
    
    // Calculate marketing effectiveness
    const m_spend = Number(row.marketingSpend) * seasonalityFactor;
    const cac = Number(row.cac);
    const churn = Number(row.churnRate);
    const arpu = Number(row.arpu);
    
    // Product-market fit effects
    const pmfImprovement = (row.productImprovements || 0) * 0.05;
    pmfScore = Math.min(1, pmfScore + pmfImprovement);
    
    // Viral growth based on PMF
    viralGrowth = users * pmfScore * SIMULATION_CONFIG.pmfEffects.viralCoefficient;
    
    // Market saturation effects
    marketSaturation = SIMULATION_CONFIG.saturationCurve(users, marketSize);
    
    // Calculate new user acquisition
    const paidUsers = cac > 0 ? m_spend / cac : 0;
    const organicUsers = viralGrowth * SIMULATION_CONFIG.pmfEffects.referralMultiplier;
    const totalNewUsers = (paidUsers + organicUsers) * marketSaturation;
    
    // Update user base with improved retention
    const retentionRate = 1 - churn + (pmfScore * SIMULATION_CONFIG.pmfEffects.retentionImprovement);
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
  fundingRound: null
});

const COLORS = [
  '#8b5cf6', '#22c55e', '#f59e42', '#ef4444', '#06b6d4', '#eab308', '#6366f1', '#84cc16', '#f472b6', '#0ea5e9'
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

const AnalyticsPage: React.FC = () => {
  const { startupId } = useParams();
  const [forecastMonthsCount, setForecastMonthsCount] = useState(DEFAULT_FORECAST_MONTHS);
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
  const [newMonth, setNewMonth] = useState<any>(getEmptyMonth(monthsData.length));
  const [addMonthLoading, setAddMonthLoading] = useState(false);
  const [equityStructure, setEquityStructure] = useState<{ name: string; percentage: number }[]>([]);
  const [lastValuation, setLastValuation] = useState<number | null>(null);
  const [showAddStakeholder, setShowAddStakeholder] = useState(false);
  const [newStakeholder, setNewStakeholder] = useState({ name: '', percentage: 0 });
  const [valuationInput, setValuationInput] = useState<string>('');
  const [equityError, setEquityError] = useState('');

  // Fetch monthly data from MongoDB on component mount
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setMonthsData(Array.from({ length: 3 }, (_, i) => getDefaultMonth(i)));
          setLoading(false);
          return;
        }
        let url = 'http://localhost:3001/api/user/startup-monthly-data';
        if (startupId) {
          url += `?startupId=${startupId}`;
        }
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch monthly data: ${response.status}`);
        }
        const data = await response.json();
        if (data.monthlyData && data.monthlyData.length > 0) {
          setMonthsData(data.monthlyData);
        } else {
          setMonthsData(Array.from({ length: 3 }, (_, i) => getDefaultMonth(i)));
        }
        setError(null);
      } catch (err) {
        setError('Failed to load monthly data from server. Using default values.');
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
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`http://localhost:3001/api/business/${startupId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
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
        const token = localStorage.getItem('token');
        if (!token) return;
        let url = 'http://localhost:3001/api/business/' + (startupId || JSON.parse(atob(token.split('.')[1])).userId);
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        setEquityStructure(data.equityStructure || [{ name: 'Owner', percentage: 100 }]);
        setLastValuation(data.lastValuation || null);
        setValuationInput(data.lastValuation ? String(data.lastValuation) : '');
      } catch {}
    };
    fetchEquity();
  }, [startupId]);

  const handleSimulate = () => {
    if (monthsData.length === 0) {
      setError('No monthly data available for simulation');
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
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      // Append new month to monthsData
      const updatedMonths = [...monthsData, newMonth];
      const response = await fetch('http://localhost:3001/api/user/startup-monthly-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ monthlyData: updatedMonths })
      });
      if (!response.ok) throw new Error('Failed to add month');
      setShowAddMonth(false);
      setNewMonth(getEmptyMonth(updatedMonths.length));
      // Refresh monthsData
      setMonthsData(updatedMonths);
    } catch (err) {
      alert('Failed to add month.');
    } finally {
      setAddMonthLoading(false);
    }
  };

  const handleAddStakeholder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStakeholder.name || !newStakeholder.percentage || !valuationInput) {
      setEquityError('All fields are required.');
      return;
    }
    const perc = Number(newStakeholder.percentage);
    if (perc <= 0 || perc >= 100) {
      setEquityError('Percentage must be between 0 and 100.');
      return;
    }
    const newVal = Number(valuationInput);
    if (isNaN(newVal) || newVal <= 0) {
      setEquityError('Valuation must be a positive number.');
      return;
    }
    // Dilute existing holders
    const remaining = 100 - perc;
    const updated = equityStructure.map(holder => ({
      ...holder,
      percentage: Number(((holder.percentage / 100) * remaining).toFixed(2))
    }));
    const newStruct = [...updated, { name: newStakeholder.name, percentage: perc }];
    setEquityStructure(newStruct);
    setLastValuation(newVal);
    setShowAddStakeholder(false);
    setNewStakeholder({ name: '', percentage: 0 });
    setEquityError('');
    // Persist to backend
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch('http://localhost:3001/api/user/startup-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          equityStructure: newStruct,
          lastValuation: newVal
        })
      });
    } catch {}
  };

  const handleValuationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setValuationInput(e.target.value);
    const newVal = Number(e.target.value);
    if (!isNaN(newVal) && newVal > 0) {
      setLastValuation(newVal);
      // Persist to backend
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        await fetch('http://localhost:3001/api/user/startup-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            equityStructure,
            lastValuation: newVal
          })
        });
      } catch {}
    }
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
    <div className="min-h-screen bg-[#121212] relative overflow-hidden">
      {/* Main purple gradient beam */}
      <div
        className="absolute inset-0 rotate-45 opacity-40"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #6B21A8 50%, transparent 100%)",
          filter: "blur(80px)",
          transform: "translateY(-50%) rotate(-45deg) scale(2)",
        }}
      />

      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-[#121212]/50 backdrop-blur-[1px]" />

      {/* Content wrapper */}
      <div className="relative z-10 pt-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {startupId ? (
            <h1 className="text-3xl font-bold text-gray-100 mb-2">{startupName || "Startup"}'s Insight</h1>
          ) : (
            <h1 className="text-3xl font-bold text-gray-100 mb-2">Advanced Startup Growth Simulation</h1>
          )}
          <p className="mb-8 text-gray-400 max-w-2xl">
            Advanced simulation with seasonality, product-market fit, viral growth, team scaling, and funding rounds.
          </p>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Simulation Parameters */}
          <div className="bg-[#18181b] rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">Simulation Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-200 font-medium mb-1">Initial Users</label>
                <input
                  type="number"
                  value={simulationParams.initialUsers}
                  onChange={(e) => setSimulationParams(prev => ({ ...prev, initialUsers: Number(e.target.value) }))}
                  className="w-full bg-[#23232b] text-gray-100 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-gray-200 font-medium mb-1">Initial Cash ($)</label>
                <input
                  type="number"
                  value={simulationParams.initialCash}
                  onChange={(e) => setSimulationParams(prev => ({ ...prev, initialCash: Number(e.target.value) }))}
                  className="w-full bg-[#23232b] text-gray-100 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-gray-200 font-medium mb-1">Market Size</label>
                <input
                  type="number"
                  value={simulationParams.marketSize}
                  onChange={(e) => setSimulationParams(prev => ({ ...prev, marketSize: Number(e.target.value) }))}
                  className="w-full bg-[#23232b] text-gray-100 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-gray-200 font-medium mb-1">Initial Team Size</label>
                <input
                  type="number"
                  value={simulationParams.initialTeamSize}
                  onChange={(e) => setSimulationParams(prev => ({ ...prev, initialTeamSize: Number(e.target.value) }))}
                  className="w-full bg-[#23232b] text-gray-100 rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mb-8">
            <div>
              <label className="block text-gray-200 font-medium mb-1">Historical Months: <span className="text-indigo-400">{monthsData.length}</span></label>
              <p className="text-gray-500 text-sm">Data loaded from your startup profile</p>
            </div>
            <div>
              <label className="block text-gray-200 font-medium mb-1">Forecast Months: <span className="text-indigo-400">{forecastMonthsCount}</span></label>
              <input type="range" min={1} max={36} value={forecastMonthsCount} onChange={e => setForecastMonthsCount(Number(e.target.value))} className="w-48 accent-indigo-500" />
            </div>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg shadow"
              onClick={handleSimulate}
              disabled={monthsData.length === 0}
            >
              Run Advanced Simulation
            </button>
            <button
              className="ml-2 text-sm text-gray-400 underline"
              onClick={() => setShowTable((v) => !v)}
            >
              {showTable ? "Hide Table" : "Show Table"}
            </button>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow"
              onClick={handleAddMonth}
            >
              + Add Month
            </button>
          </div>

          {/* Add Month Modal */}
          {showAddMonth && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <form onSubmit={handleAddMonthSubmit} className="bg-[#18181b] rounded-xl p-8 w-full max-w-lg space-y-4 relative">
                <button type="button" className="absolute top-2 right-4 text-gray-400 text-2xl" onClick={() => setShowAddMonth(false)}>&times;</button>
                <h2 className="text-xl font-bold text-gray-100 mb-2">Add New Month</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-xs mb-1">Month Name</label>
                    <input type="text" value={newMonth.monthName} onChange={e => handleNewMonthChange('monthName', e.target.value)} className="w-full bg-[#23232b] text-gray-100 rounded px-2 py-1" />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-xs mb-1">Marketing Spend</label>
                    <input type="number" value={newMonth.marketingSpend} onChange={e => handleNewMonthChange('marketingSpend', Number(e.target.value))} className="w-full bg-[#23232b] text-gray-100 rounded px-2 py-1" />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-xs mb-1">Burn Rate</label>
                    <input type="number" value={newMonth.burnRate} onChange={e => handleNewMonthChange('burnRate', Number(e.target.value))} className="w-full bg-[#23232b] text-gray-100 rounded px-2 py-1" />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-xs mb-1">CAC</label>
                    <input type="number" value={newMonth.cac} onChange={e => handleNewMonthChange('cac', Number(e.target.value))} className="w-full bg-[#23232b] text-gray-100 rounded px-2 py-1" />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-xs mb-1">Churn Rate</label>
                    <input type="number" value={newMonth.churnRate} onChange={e => handleNewMonthChange('churnRate', Number(e.target.value))} className="w-full bg-[#23232b] text-gray-100 rounded px-2 py-1" />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-xs mb-1">ARPU</label>
                    <input type="number" value={newMonth.arpu} onChange={e => handleNewMonthChange('arpu', Number(e.target.value))} className="w-full bg-[#23232b] text-gray-100 rounded px-2 py-1" />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-xs mb-1">Team Size</label>
                    <input type="number" value={newMonth.teamSize} onChange={e => handleNewMonthChange('teamSize', Number(e.target.value))} className="w-full bg-[#23232b] text-gray-100 rounded px-2 py-1" />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-xs mb-1">Product Improvements</label>
                    <input type="number" value={newMonth.productImprovements} onChange={e => handleNewMonthChange('productImprovements', Number(e.target.value))} className="w-full bg-[#23232b] text-gray-100 rounded px-2 py-1" />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-xs mb-1">Market Expansion</label>
                    <input type="number" value={newMonth.marketExpansion} onChange={e => handleNewMonthChange('marketExpansion', Number(e.target.value))} className="w-full bg-[#23232b] text-gray-100 rounded px-2 py-1" />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-xs mb-1">Funding Round</label>
                    <select value={newMonth.fundingRound || ""} onChange={e => handleNewMonthChange('fundingRound', e.target.value || null)} className="w-full bg-[#23232b] text-gray-100 rounded px-2 py-1">
                      <option value="">None</option>
                      <option value="seed">Seed</option>
                      <option value="seriesA">Series A</option>
                      <option value="seriesB">Series B</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg" disabled={addMonthLoading}>
                  {addMonthLoading ? 'Adding...' : 'Add Month'}
                </button>
              </form>
            </div>
          )}

          {/* Display loaded monthly data */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">Your Historical Monthly Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {monthsData.map((row, idx) => (
                <div key={idx} className="bg-[#18181b] rounded-xl p-4 shadow">
                  <div className="mb-2">
                    <h3 className="text-gray-300 text-sm font-semibold">{row.monthName}</h3>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Marketing Spend:</span>
                      <span className="text-gray-200">${row.marketingSpend?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Burn Rate:</span>
                      <span className="text-gray-200">${row.burnRate?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">CAC:</span>
                      <span className="text-gray-200">${row.cac}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Churn Rate:</span>
                      <span className="text-gray-200">{(row.churnRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">ARPU:</span>
                      <span className="text-gray-200">${row.arpu}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Team Size:</span>
                      <span className="text-gray-200">{row.teamSize || 3}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {simResult.length > 0 && (
            <div className="space-y-12">
              {/* Key Metrics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#18181b] rounded-lg p-4">
                  <h3 className="text-gray-400 text-sm">Final Users</h3>
                  <p className="text-2xl font-bold text-gray-100">{simResult[simResult.length - 1].users.toLocaleString()}</p>
                </div>
                <div className="bg-[#18181b] rounded-lg p-4">
                  <h3 className="text-gray-400 text-sm">Final Cash</h3>
                  <p className="text-2xl font-bold text-gray-100">${simResult[simResult.length - 1].cash.toLocaleString()}</p>
                </div>
                <div className="bg-[#18181b] rounded-lg p-4">
                  <h3 className="text-gray-400 text-sm">LTV/CAC Ratio</h3>
                  <p className="text-2xl font-bold text-gray-100">{simResult[simResult.length - 1].ltvCacRatio}</p>
                </div>
                <div className="bg-[#18181b] rounded-lg p-4">
                  <h3 className="text-gray-400 text-sm">Runway (months)</h3>
                  <p className="text-2xl font-bold text-gray-100">{simResult[simResult.length - 1].runway}</p>
                </div>
              </div>

              {/* Advanced Charts */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-100">Growth & Revenue Analysis</h2>
                <div className="bg-[#18181b] rounded-lg p-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={simResult}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="monthName" stroke="#a1a1aa" />
                      <YAxis yAxisId="left" stroke="#a1a1aa" />
                      <YAxis yAxisId="right" orientation="right" stroke="#a1a1aa" />
                      <Tooltip contentStyle={{ background: '#18181b', border: 'none', color: '#fff' }} labelStyle={{ color: '#fff' }} />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} name="Users" />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} name="Revenue" />
                      <Area yAxisId="right" type="monotone" dataKey="cash" fill="rgba(245, 158, 66, 0.2)" stroke="#f59e42" strokeWidth={2} name="Cash" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-100">User Acquisition & Retention</h2>
                <div className="bg-[#18181b] rounded-lg p-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={simResult}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="monthName" stroke="#a1a1aa" />
                      <YAxis stroke="#a1a1aa" />
                      <Tooltip contentStyle={{ background: '#18181b', border: 'none', color: '#fff' }} labelStyle={{ color: '#fff' }} />
                      <Legend />
                      <Bar dataKey="newUsers" fill="#6366f1" name="New Users" />
                      <Bar dataKey="paidUsers" fill="#22c55e" name="Paid Users" />
                      <Bar dataKey="organicUsers" fill="#f59e42" name="Organic Users" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-100">Business Health Metrics</h2>
                <div className="bg-[#18181b] rounded-lg p-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={simResult}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="monthName" stroke="#a1a1aa" />
                      <YAxis yAxisId="left" stroke="#a1a1aa" />
                      <YAxis yAxisId="right" orientation="right" stroke="#a1a1aa" />
                      <Tooltip contentStyle={{ background: '#18181b', border: 'none', color: '#fff' }} labelStyle={{ color: '#fff' }} />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="ltvCacRatio" stroke="#8b5cf6" strokeWidth={2} name="LTV/CAC" />
                      <Line yAxisId="left" type="monotone" dataKey="burnMultiple" stroke="#ef4444" strokeWidth={2} name="Burn Multiple" />
                      <Line yAxisId="right" type="monotone" dataKey="pmfScore" stroke="#06b6d4" strokeWidth={2} name="PMF Score" />
                      <Line yAxisId="right" type="monotone" dataKey="marketSaturation" stroke="#84cc16" strokeWidth={2} name="Market Saturation" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {showTable && (
                <div className="overflow-x-auto bg-[#18181b] rounded-lg p-4">
                  <table className="min-w-full text-xs text-gray-200">
                    <thead>
                      <tr>
                        <th className="px-2 py-1">#</th>
                        <th className="px-2 py-1">Month</th>
                        <th className="px-2 py-1">Users</th>
                        <th className="px-2 py-1">Revenue</th>
                        <th className="px-2 py-1">Cash</th>
                        <th className="px-2 py-1">Net Cash Flow</th>
                        <th className="px-2 py-1">New Users</th>
                        <th className="px-2 py-1">LTV/CAC</th>
                        <th className="px-2 py-1">Burn Multiple</th>
                        <th className="px-2 py-1">PMF Score</th>
                        <th className="px-2 py-1">Runway</th>
                        <th className="px-2 py-1">Forecast?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simResult.map((row, i) => (
                        <tr key={i} className={row.isForecast ? 'bg-[#2d2d3a]' : ''}>
                          <td className="px-2 py-1">{row.month}</td>
                          <td className="px-2 py-1">{row.monthName}</td>
                          <td className="px-2 py-1">{row.users}</td>
                          <td className="px-2 py-1">${row.revenue}</td>
                          <td className="px-2 py-1">${row.cash}</td>
                          <td className="px-2 py-1">${row.netCashFlow}</td>
                          <td className="px-2 py-1">{row.newUsers}</td>
                          <td className="px-2 py-1">{row.ltvCacRatio}</td>
                          <td className="px-2 py-1">{row.burnMultiple}</td>
                          <td className="px-2 py-1">{row.pmfScore}</td>
                          <td className="px-2 py-1">{row.runway}</td>
                          <td className="px-2 py-1">{row.isForecast ? 'Yes' : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Equity Split Section */}
          <EquitySection>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Equity Structure</h3>
            <p className="text-gray-400 text-sm mb-4">Current ownership breakdown. Add a stakeholder to simulate dilution.</p>
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
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Legend />
              </PieChart>
              <div>
                <div className="mb-4">
                  <label className="block text-gray-200 font-medium mb-1">Last Valuation ($)</label>
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
                  <span className="text-gray-100 font-medium" style={{ minWidth: 120 }}>{holder.name}</span>
                  <span className="text-gray-400">{holder.percentage}%</span>
                </EquityRow>
              ))}
            </div>
            {showAddStakeholder && (
              <form onSubmit={handleAddStakeholder} className="mt-6 bg-[#23232b] rounded-lg p-6">
                <h4 className="text-gray-100 font-semibold mb-2">Add New Stakeholder</h4>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Stakeholder Name"
                    value={newStakeholder.name}
                    onChange={e => setNewStakeholder({ ...newStakeholder, name: e.target.value })}
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
                    onChange={e => setNewStakeholder({ ...newStakeholder, percentage: Number(e.target.value) })}
                    className="bg-[#18181b] text-gray-100 rounded px-3 py-2 flex-1"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-200 font-medium mb-1">Valuation ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={valuationInput}
                    onChange={e => setValuationInput(e.target.value)}
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
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;