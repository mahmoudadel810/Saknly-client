import React, { useState, useEffect } from 'react';

interface MortgageCalculatorProps {
  price: number;
  downPayment?: number;
  termInYears?: number;
}

const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({
  price,
  downPayment = 0,
  termInYears = 1,
}) => {
  const [loanAmount, setLoanAmount] = useState(price - downPayment);
  const [interestRate, setInterestRate] = useState(8); // Default interest rate (e.g., 8%)
  const [loanTerm, setLoanTerm] = useState(termInYears);
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  useEffect(() => {
    const principal = price - downPayment;
    setLoanAmount(principal > 0 ? principal : 0);
    setLoanTerm(termInYears);
  }, [price, downPayment, termInYears]);

  const calculateMonthlyPayment = () => {
    if (loanAmount <= 0 || interestRate <= 0 || loanTerm <= 0) {
      setMonthlyPayment(0);
      return;
    }

    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    const numerator =
      monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments);
    const denominator = Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1;

    if (denominator === 0) {
        setMonthlyPayment(0);
        return;
    }

    const monthlyPaymentValue = loanAmount * (numerator / denominator);
    setMonthlyPayment(monthlyPaymentValue);
  };

  useEffect(() => {
    calculateMonthlyPayment();
  }, [loanAmount, interestRate, loanTerm]);

  return (
    <div className="p-6 mt-6 bg-gray-50 border border-gray-200 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-4 text-gray-800">حاسبة التمويل العقاري</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            سعر العقار
          </label>
          <input
            type="number"
            id="price"
            value={price}
            readOnly
            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="downPayment" className="block text-sm font-medium text-gray-700">
            المقدم
          </label>
          <input
            type="number"
            id="downPayment"
            value={loanAmount === (price-downPayment) ? downPayment: price - loanAmount}
            onChange={(e) => setLoanAmount(price - Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="loanTerm" className="block text-sm font-medium text-gray-700">
            مدة القسط (بالسنوات)
          </label>
          <input
            type="number"
            id="loanTerm"
            value={loanTerm}
            onChange={(e) => setLoanTerm(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700">
            نسبة الفائدة السنوية (%)
          </label>
          <input
            type="number"
            id="interestRate"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
      <div className="mt-6 text-center">
        <h4 className="text-lg font-medium text-gray-600">القسط الشهري المتوقع</h4>
        <p className="text-3xl font-bold text-blue-600">
          {monthlyPayment > 0 ? monthlyPayment.toFixed(2) : '0.00'} EGP
        </p>
      </div>
    </div>
  );
};

export default MortgageCalculator; 