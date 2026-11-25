import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart, CreditCard, Banknote, Receipt, Target } from 'lucide-react';
import '../styles/PageTitles.css';

const FinancialPage = () => {
  const financialData = {
    totalRevenue: 12500,
    monthlyGrowth: 8.5,
    expenses: 6800,
    profit: 5700,
    savingsGoal: 20000,
    currentSavings: 14500
  };

  const transactions = [
    { id: 1, type: 'income', description: 'Wheat Harvest Sale', amount: 2500, date: '2024-01-15', category: 'Sales' },
    { id: 2, type: 'expense', description: 'Seeds Purchase', amount: -450, date: '2024-01-14', category: 'Supplies' },
    { id: 3, type: 'income', description: 'Vegetables Market', amount: 850, date: '2024-01-13', category: 'Sales' },
    { id: 4, type: 'expense', description: 'Equipment Maintenance', amount: -320, date: '2024-01-12', category: 'Maintenance' }
  ];

  const budgetCategories = [
    { name: 'Seeds & Plants', allocated: 2000, spent: 1650 },
    { name: 'Equipment', allocated: 1500, spent: 890 },
    { name: 'Labor', allocated: 3000, spent: 2800 },
    { name: 'Marketing', allocated: 800, spent: 320 }
  ];

  const getTransactionIcon = (type) => {
    return type === 'income' ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  return (
    <div className="tasks-container">
      {/* Header */}
      <div className="tasks-header">
        <h1 className="page-main-title">
          <DollarSign className="w-7 h-7 title-icon" />
          Financial Management
        </h1>
        <button className="btn-primary">
          <Receipt className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="tasks-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="task-card">
          <div className="task-header">
            <h3 className="task-title">Total Revenue</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="task-description">
            <div className="text-2xl font-bold text-gray-800 mb-2">
              ${financialData.totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-green-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +{financialData.monthlyGrowth}% this month
            </div>
          </div>
        </div>

        <div className="task-card">
          <div className="task-header">
            <h3 className="task-title">Total Expenses</h3>
            <CreditCard className="w-5 h-5 text-gray-600" />
          </div>
          <div className="task-description">
            <div className="text-2xl font-bold text-gray-800 mb-2">
              ${financialData.expenses.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              68% of budget used
            </div>
          </div>
        </div>

        <div className="task-card">
          <div className="task-header">
            <h3 className="task-title">Net Profit</h3>
            <Banknote className="w-5 h-5 text-gray-600" />
          </div>
          <div className="task-description">
            <div className="text-2xl font-bold text-gray-800 mb-2">
              ${financialData.profit.toLocaleString()}
            </div>
            <div className="text-sm text-green-600">
              45.6% profit margin
            </div>
          </div>
        </div>

        <div className="task-card">
          <div className="task-header">
            <h3 className="task-title">Savings Goal</h3>
            <Target className="w-5 h-5 text-gray-600" />
          </div>
          <div className="task-description">
            <div className="text-2xl font-bold text-gray-800 mb-2">
              ${financialData.currentSavings.toLocaleString()}
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(financialData.currentSavings / financialData.savingsGoal) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {Math.round((financialData.currentSavings / financialData.savingsGoal) * 100)}% of ${financialData.savingsGoal.toLocaleString()} goal
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="tasks-section">
        <div className="section-header">
          <h2 className="section-title-pink">
            <PieChart className="w-6 h-6 title-icon" />
            Recent Transactions
          </h2>
        </div>

        <div className="tasks-grid">
          {transactions.map((transaction, index) => (
            <div key={transaction.id} className="task-card">
              <div className="task-header">
                <h4 className="task-title">{transaction.description}</h4>
                <div className={`task-status ${transaction.type === 'income' ? 'status-completed' : 'status-pending'}`}>
                  {getTransactionIcon(transaction.type)}
                  {transaction.type}
                </div>
              </div>
              <div className="task-assignee">{transaction.category} • {transaction.date}</div>
              <div className="task-description">
                <div className={`text-2xl font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button className="btn-secondary">View All Transactions</button>
        </div>
      </div>

      {/* Budget Overview Section */}
      <div className="tasks-section">
        <div className="section-header">
          <h2 className="section-title-pink">
            <PieChart className="w-6 h-6 title-icon" />
            Budget Overview
          </h2>
        </div>

        <div className="tasks-grid">
          {budgetCategories.map((category, index) => (
            <div key={index} className="task-card">
              <div className="task-header">
                <h4 className="task-title">{category.name}</h4>
                <span className="text-sm text-gray-600">
                  ${category.spent} / ${category.allocated}
                </span>
              </div>
              <div className="task-progress">
                <div className="progress-label">
                  <span className="progress-text">Budget Usage</span>
                  <span className="progress-percentage">
                    {Math.round((category.spent / category.allocated) * 100)}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(category.spent / category.allocated) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="task-actions">
                <button className="btn-small btn-edit">
                  <DollarSign className="w-4 h-4" />
                  Adjust
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button className="btn-primary">Adjust Budget</button>
        </div>
      </div>
    </div>
  );
};

export default FinancialPage;
