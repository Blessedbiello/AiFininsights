// ===================================================================
// STUDENT SPENDING ANALYZER - Core Data Analysis Module
// ===================================================================
// This module handles all the mathematical analysis of student spending:
// - Loads and validates student data
// - Calculates spending metrics and patterns
// - Categorizes expenses
// - Analyzes spending timelines
// - Generates AI-ready summaries

import fs from 'fs/promises';

class StudentSpendAnalyzer {
  constructor() {
    // Will hold our loaded student data
    this.data = null;
  }

  // ===================================================================
  // DATA LOADING FUNCTIONS
  // ===================================================================
  
  // Load student data from a JSON file
  async loadDataFromFile(filePath) {
    try {
      // Read the raw text from the file
      const rawData = await fs.readFile(filePath, 'utf8');
      // Convert JSON text to JavaScript object
      this.data = JSON.parse(rawData);
      console.log(`✅ Loaded data for ${this.data.students.length} students`);
    } catch (error) {
      throw new Error(`Failed to load data: ${error.message}`);
    }
  }

  // Load data directly from a JavaScript object (for testing)
  loadData(jsonData) {
    this.data = jsonData;
  }

  // ===================================================================
  // UTILITY FUNCTIONS
  // ===================================================================
  
  // Get a list of all student IDs from our data
  getStudentIds() {
    return this.data ? this.data.students.map(s => s.studentId) : [];
  }

  // ===================================================================
  // MAIN ANALYSIS FUNCTION
  // ===================================================================
  // This is the core function that analyzes a single student's spending
  
  analyzeStudent(studentId) {
    if (!this.data) {
      throw new Error('No data loaded. Call loadData() first.');
    }

    // Find the specific student in our data array
    const student = this.data.students.find(s => s.studentId === studentId);
    if (!student) {
      throw new Error(`Student ${studentId} not found`);
    }

    // Create comprehensive analysis by running all our calculation functions
    const analysis = {
      studentInfo: {
        id: student.studentId,
        name: student.name,
        semester: student.semester,
        budget: student.monthlyBudget
      },
      spending: this.calculateSpendingMetrics(student.transactions),
      budget: this.analyzeBudget(student.transactions, student.monthlyBudget),
      categories: this.analyzeCategoricalSpending(student.transactions),
      timeline: this.analyzeSpendingTimeline(student.transactions)
    };

    return analysis;
  }

  // ===================================================================
  // SPENDING CALCULATIONS
  // ===================================================================
  
  // Calculate basic mathematical metrics about spending
  calculateSpendingMetrics(transactions) {
    // Handle edge case: no transactions
    if (transactions.length === 0) {
      return { total: 0, average: 0, transactionCount: 0, dailyAverage: 0 };
    }

    // Add up all transaction amounts
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    // Calculate average per transaction
    const average = total / transactions.length;
    // Count how many different days the student spent money
    const uniqueDays = this.getUniqueDays(transactions);
    // Calculate average spending per day
    const dailyAverage = uniqueDays > 0 ? total / uniqueDays : 0;

    return {
      total: parseFloat(total.toFixed(2)),
      average: parseFloat(average.toFixed(2)),
      transactionCount: transactions.length,
      dailyAverage: parseFloat(dailyAverage.toFixed(2))
    };
  }

  // Compare actual spending against budget limits
  analyzeBudget(transactions, budget) {
    // Calculate total money spent
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    // Calculate how much budget is left
    const remaining = budget - totalSpent;
    // Calculate what percentage of budget was used
    const utilizationPercentage = budget > 0 ? (totalSpent / budget) * 100 : 0;

    return {
      allocated: budget,
      spent: parseFloat(totalSpent.toFixed(2)),
      remaining: parseFloat(remaining.toFixed(2)),
      utilization: parseFloat(utilizationPercentage.toFixed(1)),
      status: this.getBudgetStatus(utilizationPercentage),
      isOverBudget: totalSpent > budget
    };
  }

  // Group spending by category (Food, Books, Entertainment, etc.)
  analyzeCategoricalSpending(transactions) {
    // Create objects to track totals and counts for each category
    const categoryTotals = {};
    const categoryTransactionCounts = {};

    // Loop through each transaction and add to category totals
    transactions.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      categoryTransactionCounts[t.category] = (categoryTransactionCounts[t.category] || 0) + 1;
    });

    // Calculate total spent across all categories
    const totalSpent = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    // Convert our category data into a formatted array
    const categories = Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      amount: parseFloat(amount.toFixed(2)),
      percentage: totalSpent > 0 ? parseFloat(((amount / totalSpent) * 100).toFixed(1)) : 0,
      transactionCount: categoryTransactionCounts[category],
      averagePerTransaction: parseFloat((amount / categoryTransactionCounts[category]).toFixed(2))
    }));

    // Sort categories by amount spent (highest first)
    return categories.sort((a, b) => b.amount - a.amount);
  }

  // Analyze how spending changes over time
  analyzeSpendingTimeline(transactions) {
    // Group transactions by date and sum amounts
    const dailySpending = {};
    
    transactions.forEach(t => {
      dailySpending[t.date] = (dailySpending[t.date] || 0) + t.amount;
    });

    // Convert to array and sort by date
    const sortedDays = Object.entries(dailySpending)
      .map(([date, amount]) => ({
        date,
        amount: parseFloat(amount.toFixed(2))
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      dailySpending: sortedDays,
      // Find the day with the highest spending
      highestSpendingDay: sortedDays.reduce((max, day) => 
        day.amount > max.amount ? day : max, sortedDays[0] || { date: null, amount: 0 }),
      // Find the day with the lowest spending
      lowestSpendingDay: sortedDays.reduce((min, day) => 
        day.amount < min.amount ? day : min, sortedDays[0] || { date: null, amount: 0 })
    };
  }

  // ===================================================================
  // HELPER FUNCTIONS
  // ===================================================================
  
  // Determine budget status based on percentage used
  getBudgetStatus(utilizationPercentage) {
    if (utilizationPercentage <= 50) return "Conservative";
    if (utilizationPercentage <= 75) return "Moderate";  
    if (utilizationPercentage <= 90) return "High";
    if (utilizationPercentage <= 100) return "Near Limit";
    return "Over Budget";
  }

  // Count how many different days have transactions
  getUniqueDays(transactions) {
    const uniqueDates = new Set(transactions.map(t => t.date));
    return uniqueDates.size;
  }

  // ===================================================================
  // AI INTEGRATION HELPER
  // ===================================================================
  
  // Convert our analysis results into text format that AI can understand
  generateSummaryForAI(analysis) {
    // Create a comma-separated list of spending categories
    const categoryText = analysis.categories
      .map(c => `${c.name}: $${c.amount} (${c.percentage}%)`)
      .join(', ');

    // Format all the analysis data as structured text for AI
    return `
STUDENT PROFILE:
Name: ${analysis.studentInfo.name}
Student ID: ${analysis.studentInfo.id}
Semester: ${analysis.studentInfo.semester}

BUDGET ANALYSIS:
Monthly Budget: $${analysis.budget.allocated}
Total Spent: $${analysis.budget.spent}
Budget Utilization: ${analysis.budget.utilization}%
Status: ${analysis.budget.status}
Remaining Budget: $${analysis.budget.remaining}

SPENDING PATTERNS:
Total Transactions: ${analysis.spending.transactionCount}
Average Transaction: $${analysis.spending.average}
Daily Average Spending: $${analysis.spending.dailyAverage}

CATEGORY BREAKDOWN:
${categoryText}

SPENDING TIMELINE:
Highest spending day: ${analysis.timeline.highestSpendingDay.date} ($${analysis.timeline.highestSpendingDay.amount})
Lowest spending day: ${analysis.timeline.lowestSpendingDay.date} ($${analysis.timeline.lowestSpendingDay.amount})
    `.trim();
  }

  // ===================================================================
  // DATA VALIDATION
  // ===================================================================
  
  // Check that our loaded data has all required fields and proper structure
  validateData() {
    // Check main data structure
    if (!this.data || !this.data.students || !Array.isArray(this.data.students)) {
      throw new Error('Invalid data structure: Missing students array');
    }

    // Check each student's data
    this.data.students.forEach((student, index) => {
      // Validate required student fields
      if (!student.studentId || !student.name || !student.monthlyBudget) {
        throw new Error(`Student ${index + 1}: Missing required fields`);
      }

      // Validate transactions array exists
      if (!student.transactions || !Array.isArray(student.transactions)) {
        throw new Error(`Student ${index + 1}: Missing or invalid transactions`);
      }

      // Check each transaction has required fields
      student.transactions.forEach((transaction, tIndex) => {
        if (!transaction.date || !transaction.category || transaction.amount === undefined) {
          throw new Error(`Student ${index + 1}, Transaction ${tIndex + 1}: Missing required fields`);
        }
      });
    });

    console.log('✅ Data validation passed');
  }
}

export default StudentSpendAnalyzer;