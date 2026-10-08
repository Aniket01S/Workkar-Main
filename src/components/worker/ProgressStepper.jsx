import React from 'react';
import { Check } from 'lucide-react';

export default function ProgressStepper({ currentStep = 1 }) {
  const steps = [
    { number: 1, label: 'Register' },
    { number: 2, label: 'Permissions' },
    { number: 3, label: 'Profile Details' },
    { number: 4, label: 'Verification' },
  ];

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between max-w-xl mx-auto">
        {steps.map((step, idx) => (
          <React.Fragment key={step.number}>
            {/* Step circle */}
            <div className="flex flex-col items-center relative flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                  currentStep > step.number
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-200/50 shadow-md'
                    : currentStep === step.number
                    ? 'bg-blue-600 border-blue-600 text-white shadow-blue-200/50 shadow-md'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                }`}
              >
                {currentStep > step.number ? (
                  <Check size={18} strokeWidth={2.5} />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`text-xs font-bold mt-2 whitespace-nowrap transition-colors duration-300 ${
                  currentStep >= step.number
                    ? 'text-slate-800 dark:text-slate-200'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connecting line */}
            {idx < steps.length - 1 && (
              <div className="h-0.5 flex-1 bg-slate-100 dark:bg-slate-800 mx-2 relative -mt-5">
                <div
                  className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-500"
                  style={{
                    width:
                      currentStep > step.number
                        ? '100%'
                        : currentStep === step.number
                        ? '0%' // it starts filling as you transition
                        : '0%',
                  }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
