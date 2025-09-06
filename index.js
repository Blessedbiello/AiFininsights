// ===================================================================
// AI FINANCIAL INSIGHTS - STUDENT SPENDING ANALYSIS APPLICATION
// ===================================================================
// This application analyzes student spending patterns and provides
// AI-powered insights to help students manage their budgets better.

// Import required modules
import fs from 'fs/promises';     // For reading/writing files asynchronously
import dotenv from 'dotenv';       // For loading environment variables from .env file
import StudentSpendAnalyzer from './src/analyzer.js';    // Our custom data analysis module
import AIInsightsGenerator from './src/ai-insights.js';  // Our AI integration module

// Load environment variables (like API keys) from .env file
dotenv.config();

// ===================================================================
// MAIN APPLICATION CLASS
// ===================================================================
// This class orchestrates the entire analysis process:
// 1. Loads student data
// 2. Analyzes spending patterns
// 3. Generates AI insights
// 4. Creates reports

class SpendAnalysisApp {
  constructor() {
    // Initialize our data analyzer
    this.analyzer = new StudentSpendAnalyzer();
    // AI insights generator will be initialized later (needs API key)
    this.aiInsights = null;
  }

  // ===================================================================
  // INITIALIZATION - Sets up the application and AI connection
  // ===================================================================
  async initialize() {
    console.log('🚀 Starting Student Spend Analysis Application');
    console.log('=' .repeat(60));

    // Try to initialize AI insights generator with OpenAI API
    try {
      // Create AI generator using API key from environment variables
      this.aiInsights = new AIInsightsGenerator(process.env.OPENAI_API_KEY);
      
      // Test if we can actually connect to OpenAI API
      const connectionOk = await this.aiInsights.testConnection();
      if (!connectionOk) {
        console.log('⚠️  AI features will use fallback mode');
      }
    } catch (error) {
      // If AI setup fails, we'll continue with basic analysis only
      console.log('⚠️  AI initialization failed, using basic analysis only');
      console.log('   Error:', error.message);
    }

    // Ensure we have a directory to save our analysis reports
    try {
      await fs.access('./reports');  // Check if reports directory exists
    } catch {
      // If directory doesn't exist, create it
      await fs.mkdir('./reports');
      console.log('📁 Created reports directory');
    }
  }

  // ===================================================================
  // DATA LOADING - Reads student financial data from JSON file
  // ===================================================================
  async loadData() {
    try {
      console.log('\n📊 Loading student spending data...');
      // Load data from our JSON file containing student transactions
      await this.analyzer.loadDataFromFile('./data/student-data.json');
      
      // Check that the data structure is valid and complete
      this.analyzer.validateData();
      
      return true;
    } catch (error) {
      console.error('❌ Failed to load data:', error.message);
      return false;
    }
  }

  // ===================================================================
  // ANALYZE ALL STUDENTS - Processes each student's data individually
  // ===================================================================
  async analyzeAllStudents() {
    // Get list of all student IDs from our data
    const studentIds = this.analyzer.getStudentIds();
    console.log(`\n🔍 Found ${studentIds.length} students to analyze`);

    // Process each student one by one
    for (const studentId of studentIds) {
      await this.analyzeStudent(studentId);
    }

    console.log('\n✅ Analysis completed for all students!');
  }

  // ===================================================================
  // INDIVIDUAL STUDENT ANALYSIS - Core analysis function
  // ===================================================================
  // This function does the heavy lifting:
  // 1. Calculates spending metrics
  // 2. Generates AI insights (if available)
  // 3. Displays results to console
  // 4. Saves detailed report
  
  async analyzeStudent(studentId) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📋 ANALYZING: ${studentId}`);
    console.log(`${'='.repeat(50)}`);

    try {
      // First, generate basic mathematical analysis of spending patterns
      const analysis = this.analyzer.analyzeStudent(studentId);
      
      // Show the basic analysis results to the user
      this.displayBasicAnalysis(analysis);
      
      // Now try to enhance with AI insights (if AI is available)
      let insights = null;
      let quickTips = null;
      let predictions = null;

      if (this.aiInsights) {
        // Convert our analysis into text format that AI can understand
        const summaryForAI = this.analyzer.generateSummaryForAI(analysis);
        
        // Ask AI to generate comprehensive spending insights
        insights = await this.aiInsights.generateInsights(summaryForAI);
        
        // Ask AI for quick, actionable money-saving tips
        quickTips = await this.aiInsights.generateQuickTips(
          analysis.categories, 
          analysis.budget.status
        );

        // Generate spending predictions (only if we have enough transaction data)
        if (analysis.spending.transactionCount > 3) {
          predictions = await this.aiInsights.generatePredictions(
            analysis.budget.spent,
            analysis.budget.remaining,
            6 // Assuming 6 days into month for demo purposes
          );
        }

        // Display all AI-generated content
        this.displayAIInsights(insights, quickTips, predictions);
      }

      // Save all analysis results to a JSON file for future reference
      await this.saveReport(studentId, analysis, insights, quickTips, predictions);

    } catch (error) {
      console.error(`❌ Error analyzing ${studentId}:`, error.message);
    }
  }

  // ===================================================================
  // DISPLAY FUNCTIONS - Pretty-print analysis results to console
  // ===================================================================
  
  displayBasicAnalysis(analysis) {
    // Show student's basic information
    console.log(`\n👤 STUDENT: ${analysis.studentInfo.name}`);
    
    // Display budget utilization summary
    console.log('\n💰 BUDGET SUMMARY:');
    console.log(`   Budget: $${analysis.budget.allocated}`);
    console.log(`   Spent: $${analysis.budget.spent} (${analysis.budget.utilization}%)`);
    console.log(`   Status: ${analysis.budget.status}`);
    console.log(`   Remaining: $${analysis.budget.remaining}`);
    
    // Alert if student is over budget
    if (analysis.budget.isOverBudget) {
      console.log('   🚨 OVER BUDGET!');
    }

    // Show spending by category, ranked from highest to lowest
    console.log('\n📊 SPENDING BREAKDOWN:');
    analysis.categories.forEach((cat, index) => {
      // Add medal icons for top 3 categories
      const icon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
      console.log(`   ${icon} ${cat.name}: $${cat.amount} (${cat.percentage}%) - ${cat.transactionCount} transactions`);
    });

    // Show calculated spending statistics
    console.log('\n📈 SPENDING METRICS:');
    console.log(`   Total Transactions: ${analysis.spending.transactionCount}`);
    console.log(`   Average per Transaction: $${analysis.spending.average}`);
    console.log(`   Daily Average: $${analysis.spending.dailyAverage}`);

    // Show spending patterns over time
    console.log('\n📅 TIMELINE INSIGHTS:');
    console.log(`   Highest spending day: ${analysis.timeline.highestSpendingDay.date} ($${analysis.timeline.highestSpendingDay.amount})`);
    console.log(`   Lowest spending day: ${analysis.timeline.lowestSpendingDay.date} ($${analysis.timeline.lowestSpendingDay.amount})`);
  }

  // Display AI-generated content (if available)
  displayAIInsights(insights, quickTips, predictions) {
    // Show comprehensive AI analysis
    if (insights && insights.success) {
      console.log('\n🤖 AI-POWERED INSIGHTS:');
      console.log(insights.insights);
      console.log(`\n   (Generated using ${insights.tokensUsed} tokens)`);
    }

    // Show quick money-saving tips
    if (quickTips) {
      console.log('\n💡 QUICK TIPS:');
      console.log(quickTips);
    }

    // Show future spending predictions
    if (predictions) {
      console.log('\n🔮 SPENDING PREDICTIONS:');
      console.log(predictions);
    }
  }

  // ===================================================================
  // REPORT SAVING - Creates detailed JSON reports for each student
  // ===================================================================
  
  async saveReport(studentId, analysis, insights, quickTips, predictions) {
    // Create a comprehensive report object with all analysis results
    const report = {
      metadata: {
        studentId: studentId,
        generatedAt: new Date().toISOString(),
        version: "1.0"
      },
      studentInfo: analysis.studentInfo,
      financialAnalysis: {
        spending: analysis.spending,
        budget: analysis.budget,
        categories: analysis.categories,
        timeline: analysis.timeline
      },
      aiInsights: insights,
      quickTips: quickTips,
      predictions: predictions
    };

    const fileName = `./reports/${studentId}_financial_report.json`;
    
    try {
      await fs.writeFile(fileName, JSON.stringify(report, null, 2));
      console.log(`\n💾 Report saved: ${fileName}`);
    } catch (error) {
      console.error('❌ Failed to save report:', error.message);
    }
  }

  // ===================================================================
  // SUMMARY REPORT - Creates overview of all students' financial health
  // ===================================================================
  
  async generateSummaryReport() {
    console.log('\n📋 GENERATING SUMMARY REPORT...');
    
    // Get data for all students
    const studentIds = this.analyzer.getStudentIds();
    const summaryData = [];

    // Analyze each student and extract key metrics for summary
    for (const studentId of studentIds) {
      try {
        const analysis = this.analyzer.analyzeStudent(studentId);
        summaryData.push({
          studentId: studentId,
          name: analysis.studentInfo.name,
          budgetUtilization: analysis.budget.utilization,
          totalSpent: analysis.budget.spent,
          status: analysis.budget.status,
          topCategory: analysis.categories[0]?.name || 'None'
        });
      } catch (error) {
        console.error(`Error processing ${studentId}:`, error.message);
      }
    }

    // Display nice formatted table of all students
    console.log('\n📊 CLASS SPENDING SUMMARY:');
    console.log('Student Name'.padEnd(20) + 'Budget Used'.padEnd(15) + 'Total Spent'.padEnd(15) + 'Status');
    console.log('-'.repeat(65));
    
    summaryData.forEach(student => {
      console.log(
        student.name.padEnd(20) + 
        `${student.budgetUtilization}%`.padEnd(15) + 
        `$${student.totalSpent}`.padEnd(15) + 
        student.status
      );
    });

    // Calculate class-wide statistics and save to file
    const summaryReport = {
      generatedAt: new Date().toISOString(),
      totalStudents: summaryData.length,
      classOverview: {
        averageBudgetUtilization: (summaryData.reduce((sum, s) => sum + s.budgetUtilization, 0) / summaryData.length).toFixed(1),
        studentsOverBudget: summaryData.filter(s => s.budgetUtilization > 100).length,
        totalClassSpending: summaryData.reduce((sum, s) => sum + s.totalSpent, 0)
      },
      students: summaryData
    };

    await fs.writeFile('./reports/class_summary.json', JSON.stringify(summaryReport, null, 2));
    console.log('\n💾 Class summary saved: ./reports/class_summary.json');
  }
}

// ===================================================================
// MAIN EXECUTION - This is where everything starts!
// ===================================================================
// This function runs when you execute: node index.js

async function main() {
  // Create our main application instance
  const app = new SpendAnalysisApp();
  
  try {
    // Step 1: Initialize the application and AI connections
    await app.initialize();
    
    // Step 2: Load student data from JSON file
    const dataLoaded = await app.loadData();
    if (!dataLoaded) {
      console.log('❌ Cannot proceed without data. Please check your data file.');
      return;
    }
    
    // Step 3: Analyze each student's spending patterns
    await app.analyzeAllStudents();
    
    // Step 4: Generate class-wide summary report
    await app.generateSummaryReport();
    
    // Success! Show completion message
    console.log('\n🎉 All analysis completed successfully!');
    console.log('\n📁 Check the ./reports/ folder for detailed reports');
    console.log('🚀 Application finished');

  } catch (error) {
    console.error('💥 Application error:', error.message);
    process.exit(1);
  }
}

// ===================================================================
// AUTO-EXECUTION - Automatically run when this file is executed
// ===================================================================
// This checks if the file is being run directly (not imported)
// If so, it starts the main function

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Export the main class so other files can use it if needed
export default SpendAnalysisApp;