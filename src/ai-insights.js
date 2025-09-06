// ===================================================================
// AI INSIGHTS GENERATOR - OpenAI Integration Module
// ===================================================================
// This module connects to OpenAI's API to generate intelligent insights
// about student spending patterns. It provides:
// - Comprehensive financial analysis
// - Quick money-saving tips
// - Future spending predictions
// - Fallback responses when AI is unavailable

import OpenAI from 'openai';

class AIInsightsGenerator {
  constructor(apiKey) {
    // Ensure we have an API key to connect to OpenAI
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    // Initialize the OpenAI client
    this.openai = new OpenAI({
      apiKey: apiKey,
    });

    // Configure AI parameters for financial advice
    this.model = "gpt-3.5-turbo";           // Which AI model to use
    this.temperature = 0.3;                  // Lower = more consistent, less creative responses
    this.maxTokens = 800;                    // Maximum length of AI responses
  }

  // ===================================================================
  // MAIN AI INSIGHT GENERATION
  // ===================================================================
  // This is where the AI magic happens! We send student data to OpenAI
  // and get back intelligent financial insights.
  
  async generateInsights(spendingData) {
    // Create a structured prompt for the AI
    const prompt = this.createInsightsPrompt(spendingData);

    try {
      console.log('🤖 Generating AI insights...');
      
      // Send request to OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a helpful financial advisor specializing in student budgeting and spending analysis. Provide practical, actionable advice that's relevant to college students."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      });

      // Extract the AI's response
      const insights = completion.choices[0].message.content.trim();

      return {
        success: true,
        insights: insights,
        timestamp: new Date().toISOString(),
        tokensUsed: completion.usage.total_tokens  // Track API usage
      };

    } catch (error) {
      console.error('❌ AI insights generation failed:', error.message);
      
      // If AI fails, provide fallback analysis
      return {
        success: false,
        error: error.message,
        insights: this.generateFallbackInsights(spendingData),
        timestamp: new Date().toISOString()
      };
    }
  }

  // ===================================================================
  // PROMPT ENGINEERING - This is how we "talk" to the AI
  // ===================================================================
  // Creating good prompts is crucial for getting useful AI responses.
  // We structure our request to get organized, actionable advice.
  
  createInsightsPrompt(spendingData) {
    return `
Analyze this student's financial data and provide insights:

${spendingData}

Please provide a structured analysis with the following sections:

1. **SPENDING OVERVIEW**: Brief summary of overall financial health

2. **KEY PATTERNS**: Identify 2-3 important spending trends or behaviors

3. **BUDGET ASSESSMENT**: Evaluate budget utilization and financial discipline

4. **RECOMMENDATIONS**: Provide 3-4 specific, actionable recommendations for improvement

5. **ALERTS**: Highlight any concerning patterns that need immediate attention

Keep advice practical and student-friendly. Focus on actionable steps they can take immediately.
    `;
  }

  // ===================================================================
  // QUICK TIPS GENERATION
  // ===================================================================
  // Generate short, actionable money-saving tips based on spending patterns
  
  async generateQuickTips(categories, budgetStatus) {
    // Create a focused prompt for quick tips
    const tipsPrompt = `
Based on spending categories: ${JSON.stringify(categories)}
Budget status: ${budgetStatus}

Provide 3 quick, specific money-saving tips for this student.
Make them practical and directly related to their spending patterns.
Format as a simple numbered list.
    `;

    try {
      // Send a shorter request to AI for quick tips
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system", 
            content: "You are a financial advisor. Give brief, practical money-saving tips for college students."
          },
          {
            role: "user",
            content: tipsPrompt
          }
        ],
        temperature: 0.4,        // Slightly more creative for varied tips
        max_tokens: 200,         // Shorter response for quick tips
      });

      return completion.choices[0].message.content.trim();

    } catch (error) {
      console.error('❌ Quick tips generation failed:', error.message);
      return this.generateFallbackTips(categories);
    }
  }

  // ===================================================================
  // SPENDING PREDICTIONS
  // ===================================================================
  // Use AI to predict future spending based on current patterns
  
  async generatePredictions(currentSpending, budgetRemaining, daysIntoMonth) {
    // Create prompt with current financial data
    const predictionPrompt = `
Current spending: $${currentSpending}
Budget remaining: $${budgetRemaining}
Days into month: ${daysIntoMonth}

Based on current spending pace, predict:
1. Projected monthly spending
2. Whether they'll stay within budget
3. Recommended daily spending limit for rest of month

Keep response brief and focused on numbers and practical guidance.
    `;

    try {
      // Ask AI to analyze trends and make predictions
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a financial analyst. Provide brief spending predictions and recommendations."
          },
          {
            role: "user", 
            content: predictionPrompt
          }
        ],
        temperature: 0.2,        // Very low for consistent mathematical analysis
        max_tokens: 300,
      });

      return completion.choices[0].message.content.trim();

    } catch (error) {
      console.error('❌ Predictions generation failed:', error.message);
      return "Unable to generate predictions at this time.";
    }
  }

  // ===================================================================
  // FALLBACK RESPONSES - When AI is unavailable
  // ===================================================================
  // These provide basic analysis when the AI API fails or is unavailable
  
  generateFallbackInsights(spendingData) {
    return `
**AUTOMATED ANALYSIS**

**SPENDING OVERVIEW**: Analysis based on your recent transaction data.

**KEY PATTERNS**: 
- Review your largest spending categories
- Monitor daily spending frequency
- Track weekend vs weekday patterns

**BUDGET ASSESSMENT**: Check your budget utilization percentage and remaining balance.

**RECOMMENDATIONS**:
1. Set daily spending limits based on remaining budget
2. Track expenses in a spreadsheet or app
3. Review and categorize all transactions weekly
4. Look for subscription services you can cancel

**ALERTS**: Monitor any categories over 30% of total spending.

Note: Full AI analysis temporarily unavailable.
    `;
  }

  // Generate simple tips when AI is unavailable
  generateFallbackTips(categories) {
    // Use the largest spending category to generate relevant tips
    const topCategory = categories[0]?.name || 'spending';
    
    return `
1. Reduce ${topCategory.toLowerCase()} expenses by cooking at home more often
2. Set weekly spending limits for each category
3. Use a budgeting app to track daily expenses
    `;
  }

  // ===================================================================
  // CONNECTION TESTING
  // ===================================================================
  // Test if we can successfully connect to OpenAI API
  
  async testConnection() {
    try {
      // Send a simple test request to verify API connection
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 10,  // Very short response to minimize cost
      });
      
      console.log('✅ OpenAI API connection successful');
      return true;
    } catch (error) {
      console.error('❌ OpenAI API connection failed:', error.message);
      return false;
    }
  }
}

export default AIInsightsGenerator;