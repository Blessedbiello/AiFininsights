import fs from 'fs/promises';

class DataExporter {
  static async exportToCSV(analysisResults, filename) {
    const csvHeaders = [
      'Student ID',
      'Student Name', 
      'Budget',
      'Total Spent',
      'Budget Utilization %',
      'Status',
      'Transactions Count',
      'Average Transaction',
      'Top Category',
      'Top Category Amount'
    ];

    const csvRows = analysisResults.map(result => [
      result.studentInfo.id,
      result.studentInfo.name,
      result.budget.allocated,
      result.budget.spent,
      result.budget.utilization,
      result.budget.status,
      result.spending.transactionCount,
      result.spending.average,
      result.categories[0]?.name || 'None',
      result.categories[0]?.amount || 0
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    await fs.writeFile(filename, csvContent);
    console.log(`📊 CSV exported to: ${filename}`);
  }

  static async exportCategoriesBreakdown(analysisResults, filename) {
    const allCategories = new Set();
    
    // Collect all unique categories
    analysisResults.forEach(result => {
      result.categories.forEach(cat => allCategories.add(cat.name));
    });

    const headers = ['Student ID', 'Student Name', ...Array.from(allCategories)];
    
    const rows = analysisResults.map(result => {
      const row = [result.studentInfo.id, result.studentInfo.name];
      
      allCategories.forEach(category => {
        const categoryData = result.categories.find(c => c.name === category);
        row.push(categoryData ? categoryData.amount : 0);
      });
      
      return row;
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    await fs.writeFile(filename, csvContent);
    console.log(`📈 Categories breakdown exported to: ${filename}`);
  }
}

export default DataExporter;