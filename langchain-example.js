import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import dotenv from 'dotenv';

dotenv.config();

class LangChainExample {
  constructor() {
    this.hasApiKey = !!process.env.OPENAI_API_KEY;
    this.demoMode = !this.hasApiKey;
    
    if (this.hasApiKey) {
      // Step 1: Initialize LangChain's ChatOpenAI model
      this.llm = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        model: "gpt-3.5-turbo",
        temperature: 0.3,
      });
    } else {
      console.log('⚠️  No OPENAI_API_KEY found - running in demo mode');
      console.log('   Examples will show structure without API calls\n');
    }
  }

  // Example 1: Simple Financial Analysis with LangChain
  async basicFinancialAnalysis() {
    console.log('\n🔍 EXAMPLE 1: Basic Financial Analysis with LangChain');
    console.log('=' .repeat(60));

    // Step 2: Create a prompt template
    const prompt = ChatPromptTemplate.fromTemplate(`
      You are a financial advisor for college students.
      
      Student spent: ${300}
      Budget limit: ${400}
      Top spending category: Food
      
      Provide a brief financial assessment in 2-3 sentences.
    `);

    if (this.demoMode) {
      console.log('📋 Demo Mode - Showing LangChain structure:');
      console.log('   1. Prompt template created ✓');
      console.log('   2. Chain would be: prompt.pipe(llm) ✓');
      console.log('   3. Execution would be: chain.invoke({}) ✓');
      console.log('   4. Mock result: "Your spending of $300 against a $400 budget shows good financial discipline..."');
      return;
    }

    try {
      // Step 3: Create a chain by combining prompt + model
      const chain = prompt.pipe(this.llm);
      
      // Step 4: Execute the chain
      const result = await chain.invoke({});
      
      console.log('✅ LangChain Result:');
      console.log(result.content);
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      console.log('💡 Try demo mode by removing OPENAI_API_KEY from .env');
    }
  }

  // Example 2: Dynamic Prompts with Variables
  async dynamicPromptExample() {
    console.log('\n🔍 EXAMPLE 2: Dynamic Prompts with Variables');
    console.log('=' .repeat(60));

    // Step 2: Create a template with variables
    const prompt = ChatPromptTemplate.fromTemplate(`
      Student Budget Analysis:
      - Name: {studentName}
      - Spent: {amountSpent}
      - Budget: {budgetLimit}
      - Days remaining: {daysLeft}
      
      Give this student specific advice on managing their remaining budget.
      Keep it under 100 words.
    `);

    const studentData = {
      studentName: "Alex",
      amountSpent: 250,
      budgetLimit: 400,
      daysLeft: 15
    };

    if (this.demoMode) {
      console.log('📋 Demo Mode - Dynamic Variables:');
      console.log(`   Template variables: {studentName}, {amountSpent}, {budgetLimit}, {daysLeft}`);
      console.log(`   Data: ${JSON.stringify(studentData, null, 2)}`);
      console.log('   Mock advice: "Alex, with $150 remaining and 15 days left, aim for $10/day spending..."');
      return;
    }

    try {
      // Step 3: Create and execute chain with variables
      const chain = prompt.pipe(this.llm);
      const result = await chain.invoke(studentData);
      
      console.log('✅ Dynamic Prompt Result:');
      console.log(`Student: ${studentData.studentName}`);
      console.log(`Budget Status: $${studentData.amountSpent}/$${studentData.budgetLimit}`);
      console.log('\nAdvice:');
      console.log(result.content);
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  // Example 3: Processing Multiple Students
  async processMultipleStudents() {
    console.log('\n🔍 EXAMPLE 3: Processing Multiple Students');
    console.log('=' .repeat(60));

    const students = [
      { name: "Sarah", spent: 180, budget: 300, category: "Entertainment" },
      { name: "Mike", spent: 450, budget: 400, category: "Food" },
      { name: "Emma", spent: 120, budget: 350, category: "Books" }
    ];

    if (this.demoMode) {
      console.log('📋 Demo Mode - Batch Processing:');
      students.forEach(student => {
        console.log(`\n📋 ${student.name}: $${student.spent}/$${student.budget} (${student.category})`);
        console.log(`   Mock tip: "Try meal prep for ${student.category.toLowerCase()} savings!"`);
      });
      return;
    }

    // Create a prompt template for quick tips
    const prompt = ChatPromptTemplate.fromTemplate(`
      Student: {name}
      Spent: {spent} of {budget} budget
      Top category: {category}
      
      Give ONE specific money-saving tip for this student. Keep it under 30 words.
    `);

    const chain = prompt.pipe(this.llm);

    for (const student of students) {
      try {
        console.log(`\n📋 Analyzing ${student.name}:`);
        console.log(`   Budget: $${student.spent}/$${student.budget}`);
        
        const result = await chain.invoke(student);
        console.log(`   💡 Tip: ${result.content}`);
        
      } catch (error) {
        console.error(`   ❌ Error for ${student.name}:`, error.message);
      }
    }
  }

  // Example 4: Comparison - Direct OpenAI vs LangChain
  async comparisonExample() {
    console.log('\n🔍 EXAMPLE 4: Direct OpenAI vs LangChain Comparison');
    console.log('=' .repeat(60));
    
    const studentData = {
      name: "Jordan",
      spent: 320,
      budget: 400
    };

    console.log('📊 Same task, different approaches:');
    console.log(`Student: ${studentData.name} | Spent: $${studentData.spent}/$${studentData.budget}`);
    
    if (this.demoMode) {
      console.log('\n📋 Demo Mode - Comparing Approaches:');
      console.log('🦜 LangChain: Uses templates & chains for clean structure');
      console.log('⚡ Direct OpenAI: Manual message formatting & API calls');
      console.log('🏆 LangChain Result: "Jordan scores 8/10 for staying within budget limits."');
      return;
    }
    
    // LangChain approach
    console.log('\n🦜 LangChain Approach:');
    const prompt = ChatPromptTemplate.fromTemplate(`
      Student {name} spent {spent} out of {budget} budget.
      Rate their financial discipline from 1-10 and explain in one sentence.
    `);
    
    try {
      const chain = prompt.pipe(this.llm);
      const result = await chain.invoke(studentData);
      console.log(`Result: ${result.content}`);
    } catch (error) {
      console.error('❌ LangChain error:', error.message);
    }
  }
}

// Main execution function
async function main() {
  console.log('🦜 Welcome to LangChain for Beginners!');
  console.log('This example shows basic LangChain concepts for financial analysis');
  
  try {
    const langchainExample = new LangChainExample();
    
    // Run all examples
    await langchainExample.basicFinancialAnalysis();
    await langchainExample.dynamicPromptExample();
    await langchainExample.processMultipleStudents();
    await langchainExample.comparisonExample();
    
    console.log('\n🎉 All LangChain examples completed!');
    console.log('\n📚 Key Concepts Demonstrated:');
    console.log('   • LLM initialization with ChatOpenAI');
    console.log('   • Prompt templates with variables');
    console.log('   • Chain creation (prompt + model)');
    console.log('   • Chain execution and result handling');
    
    if (langchainExample.demoMode) {
      console.log('\n🔧 To run with real API calls:');
      console.log('   1. Get an OpenAI API key from https://platform.openai.com');
      console.log('   2. Add OPENAI_API_KEY=your_key_here to your .env file');
      console.log('   3. Run the example again');
    }
    
    console.log('\n💡 Next step: Check LANGCHAIN_GUIDE.md for detailed explanations!');
    
  } catch (error) {
    console.error('💥 Application error:', error.message);
    console.log('\n🔧 Make sure your OPENAI_API_KEY is set in your .env file');
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default LangChainExample;