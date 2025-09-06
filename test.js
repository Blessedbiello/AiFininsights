import StudentSpendAnalyzer from './src/analyzer.js';

async function testApplication() {
  console.log('🧪 Testing Student Spend Analyzer...\n');

  const analyzer = new StudentSpendAnalyzer();

  try {
    // Test 1: Load data
    console.log('Test 1: Loading data...');
    await analyzer.loadDataFromFile('./data/student-data.json');
    console.log('✅ Data loaded successfully\n');

    // Test 2: Validate data
    console.log('Test 2: Validating data structure...');
    analyzer.validateData();
    console.log('✅ Data validation passed\n');

    // Test 3: Analyze student
    console.log('Test 3: Analyzing sample student...');
    const analysis = analyzer.analyzeStudent('STU001');
    console.log('✅ Student analysis completed');
    console.log(`   Student: ${analysis.studentInfo.name}`);
    console.log(`   Budget utilization: ${analysis.budget.utilization}%\n`);

    // Test 4: Generate AI summary
    console.log('Test 4: Generating AI summary...');
    const summary = analyzer.generateSummaryForAI(analysis);
    console.log('✅ AI summary generated');
    console.log(`   Summary length: ${summary.length} characters\n`);

    console.log('🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testApplication();





