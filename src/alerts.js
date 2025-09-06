class BudgetAlerts {
  static generateAlerts(analysis) {
    const alerts = [];
    const { budget, categories, spending } = analysis;

    // Budget utilization alerts
    if (budget.utilization > 100) {
      alerts.push({
        type: 'CRITICAL',
        message: `Over budget by ${Math.abs(budget.remaining)}`,
        action: 'Immediate spending reduction required'
      });
    } else if (budget.utilization > 90) {
      alerts.push({
        type: 'WARNING', 
        message: `Approaching budget limit (${budget.utilization}% used)`,
        action: 'Monitor remaining spending carefully'
      });
    } else if (budget.utilization > 75) {
      alerts.push({
        type: 'CAUTION',
        message: `Budget 75% utilized with ${budget.utilization}% spent`,
        action: 'Consider reducing discretionary spending'
      });
    }

    // Category concentration alerts
    categories.forEach(category => {
      if (category.percentage > 50) {
        alerts.push({
          type: 'INFO',
          message: `${category.name} represents ${category.percentage}% of total spending`,
          action: `Consider diversifying expenses or reducing ${category.name.toLowerCase()} costs`
        });
      }
    });

    // High transaction frequency alerts
    if (spending.transactionCount > 20) {
      alerts.push({
        type: 'INFO',
        message: `High transaction frequency: ${spending.transactionCount} transactions`,
        action: 'Consider consolidating purchases to reduce impulse spending'
      });
    }

    // Large single transaction alerts
    if (spending.average > budget.allocated * 0.1) {
      alerts.push({
        type: 'CAUTION',
        message: `Average transaction size is high: ${spending.average}`,
        action: 'Review large purchases and consider if they align with priorities'
      });
    }

    return alerts;
  }

  static displayAlerts(alerts, studentName) {
    if (alerts.length === 0) {
      console.log(`✅ No alerts for ${studentName}`);
      return;
    }

    console.log(`\n🚨 ALERTS for ${studentName}:`);
    alerts.forEach(alert => {
      const icon = this.getAlertIcon(alert.type);class BudgetAlerts {
  static generateAlerts(analysis) {
    const alerts = [];
    const { budget, categories, spending } = analysis;

    // Budget utilization alerts
    if (budget.utilization > 100) {
      alerts.push({
        type: 'CRITICAL',
        message: `Over budget by ${Math.abs(budget.remaining)}`,
        action: 'Immediate spending reduction required'
      });
    } else if (budget.utilization > 90) {
      alerts.push({
        type: 'WARNING', 
        message: `Approaching budget limit (${budget.utilization}% used)`,
        action: 'Monitor remaining spending carefully'
      });
    } else if (budget.utilization > 75) {
      alerts.push({
        type: 'CAUTION',
        message: `Budget 75% utilized with ${budget.utilization}% spent`,
        action: 'Consider reducing discretionary spending'
      });
    }

    // Category concentration alerts
    categories.forEach(category => {
      if (category.percentage > 50) {
        alerts.push({
          type: 'INFO',
          message: `${category.name} represents ${category.percentage}% of total spending`,
          action: `Consider diversifying expenses or reducing ${category.name.toLowerCase()} costs`
        });
      }
    });

    // High transaction frequency alerts
    if (spending.transactionCount > 20) {
      alerts.push({
        type: 'INFO',
        message: `High transaction frequency: ${spending.transactionCount} transactions`,
        action: 'Consider consolidating purchases to reduce impulse spending'
      });
    }

    // Large single transaction alerts
    if (spending.average > budget.allocated * 0.1) {
      alerts.push({
        type: 'CAUTION',
        message: `Average transaction size is high: ${spending.average}`,
        action: 'Review large purchases and consider if they align with priorities'
      });
    }

    return alerts;
  }

  static displayAlerts(alerts, studentName) {
    if (alerts.length === 0) {
      console.log(`✅ No alerts for ${studentName}`);
      return;
    }

    console.log(`\n🚨 ALERTS for ${studentName}:`);
    alerts.forEach(alert => {
      const icon = this.getAlertIcon(alert.type);
      console.log(`${icon} ${alert.type}: ${alert.message}`);
      console.log(`   Action: ${alert.action}\n`);
    });
  }

  static getAlertIcon(type) {
    const icons = {
      'CRITICAL': '🔴',
      'WARNING': '🟡', 
      'CAUTION': '🟠',
      'INFO': '🔵'
    };
    return icons[type] || '⚪';
  }

  static generateEmailAlert(analysis, alerts) {
    if (alerts.length === 0) return null;

    const criticalAlerts = alerts.filter(a => a.type === 'CRITICAL');
    if (criticalAlerts.length === 0) return null;

    return {
      to: `${analysis.studentInfo.id}@university.edu`,
      subject: `Budget Alert: Immediate Action Required`,
      body: `
Dear ${analysis.studentInfo.name},

Your budget requires immediate attention:

Budget Status: ${analysis.budget.status}
Amount Over Budget: ${Math.abs(analysis.budget.remaining)}
Utilization: ${analysis.budget.utilization}%

Critical Actions Needed:
${criticalAlerts.map(alert => `• ${alert.action}`).join('\n')}

Please review your spending and adjust your budget immediately.

Best regards,
Financial Wellness Team
      `
    };
  }
}

export default BudgetAlerts;
      console.log(`${icon} ${alert.type}: ${alert.message}`);
      console.log(`   Action: ${alert.action}\n`);
    });
  }

  static getAlertIcon(type) {
    const icons = {
      'CRITICAL': '🔴',
      'WARNING': '🟡', 
      'CAUTION': '🟠',
      'INFO': '🔵'
    };
    return icons[type] || '⚪';
  }

  static generateEmailAlert(analysis, alerts) {
    if (alerts.length === 0) return null;

    const criticalAlerts = alerts.filter(a => a.type === 'CRITICAL');
    if (criticalAlerts.length === 0) return null;

    return {
      to: `${analysis.studentInfo.id}@university.edu`,
      subject: `Budget Alert: Immediate Action Required`,
      body: `
Dear ${analysis.studentInfo.name},

Your budget requires immediate attention:

Budget Status: ${analysis.budget.status}
Amount Over Budget: ${Math.abs(analysis.budget.remaining)}
Utilization: ${analysis.budget.utilization}%

Critical Actions Needed:
${criticalAlerts.map(alert => `• ${alert.action}`).join('\n')}

Please review your spending and adjust your budget immediately.

Best regards,
Financial Wellness Team
      `
    };
  }
}

export default BudgetAlerts;