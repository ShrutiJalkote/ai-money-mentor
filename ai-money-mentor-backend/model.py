def calculate_plan(income, expenses):
    savings = income - expenses
    emergency_fund = savings * 6
    sip = savings * 0.3

    return {
        "savings": savings,
        "emergency_fund": emergency_fund,
        "recommended_sip": sip
    }

def calculate_score(income, expenses):
    savings = income - expenses
    ratio = savings / income if income > 0 else 0

    if ratio > 0.4:
        return 90
    elif ratio > 0.2:
        return 70
    else:
        return 50