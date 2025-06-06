import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Percent, Calendar } from 'lucide-react';

interface MortgageCalculatorProps {
  propertyPrice: number;
}

const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({ propertyPrice }) => {
  const [loanAmount, setLoanAmount] = useState(propertyPrice * 0.8); // 20% down payment
  const [downPayment, setDownPayment] = useState(propertyPrice * 0.2);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);

  useEffect(() => {
    setLoanAmount(propertyPrice - downPayment);
  }, [propertyPrice, downPayment]);

  useEffect(() => {
    calculateMortgage();
  }, [loanAmount, interestRate, loanTerm]);

  const calculateMortgage = () => {
    const principal = loanAmount;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    if (monthlyRate === 0) {
      const payment = principal / numberOfPayments;
      setMonthlyPayment(payment);
      setTotalPayment(principal);
      setTotalInterest(0);
      return;
    }

    const monthlyPaymentCalc = 
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalPaymentCalc = monthlyPaymentCalc * numberOfPayments;
    const totalInterestCalc = totalPaymentCalc - principal;

    setMonthlyPayment(monthlyPaymentCalc);
    setTotalPayment(totalPaymentCalc);
    setTotalInterest(totalInterestCalc);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyDetailed = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-6 h-6 text-yellow-500" />
        <h3 className="text-xl font-semibold text-neutral-800">Mortgage Calculator</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Property Price
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="number"
                value={propertyPrice}
                readOnly
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Down Payment
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <p className="text-sm text-neutral-500 mt-1">
              {((downPayment / propertyPrice) * 100).toFixed(1)}% of property price
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Interest Rate
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Loan Term (Years)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <select
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value={15}>15 years</option>
                <option value={20}>20 years</option>
                <option value={25}>25 years</option>
                <option value={30}>30 years</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-neutral-800 mb-4">Monthly Payment</h4>
            <div className="text-3xl font-bold text-yellow-600">
              {formatCurrencyDetailed(monthlyPayment)}
            </div>
            <p className="text-sm text-neutral-600 mt-2">Principal & Interest</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-neutral-50 rounded-lg p-4">
              <h5 className="font-medium text-neutral-700 mb-2">Loan Amount</h5>
              <p className="text-xl font-semibold text-neutral-800">
                {formatCurrency(loanAmount)}
              </p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4">
              <h5 className="font-medium text-neutral-700 mb-2">Total Interest</h5>
              <p className="text-xl font-semibold text-neutral-800">
                {formatCurrency(totalInterest)}
              </p>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-lg p-4">
            <h5 className="font-medium text-neutral-700 mb-2">Total Payment</h5>
            <p className="text-xl font-semibold text-neutral-800">
              {formatCurrency(totalPayment)}
            </p>
            <p className="text-sm text-neutral-600 mt-1">
              Over {loanTerm} years
            </p>
          </div>

          {/* Payment Breakdown Chart */}
          <div className="bg-neutral-50 rounded-lg p-4">
            <h5 className="font-medium text-neutral-700 mb-3">Payment Breakdown</h5>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Principal</span>
                <span className="text-sm font-medium">
                  {((loanAmount / totalPayment) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${(loanAmount / totalPayment) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-600">Interest</span>
                <span className="text-sm font-medium">
                  {((totalInterest / totalPayment) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div 
                  className="bg-neutral-400 h-2 rounded-full"
                  style={{ width: `${(totalInterest / totalPayment) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This calculator provides estimates only. Actual payments may vary based on taxes, insurance, PMI, and other factors. Consult with a mortgage professional for accurate calculations.
        </p>
      </div>
    </div>
  );
};

export default MortgageCalculator;