
import React from 'react';

// Theme: "Google Blue Professional"
// Primary: Blue-600 (#2563eb) - Standard, Trustworthy, Tech-focused.
// Backgrounds: White & Slate-50 for extreme cleanliness.

export const GlassCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm rounded-lg p-5 md:p-6 transition-all duration-200 ${className}`} {...props}>
    {children}
  </div>
);

export const GlassButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'outline' }> = ({ children, className = '', variant = 'primary', ...props }) => {
  let baseStyles = "px-6 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
  
  const variants = {
    // Primary: Google Blue style
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md shadow-blue-500/20 dark:bg-blue-600 dark:hover:bg-blue-500",
    // Secondary: Subtle Gray
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
    // Outline: Blue Border
    outline: "border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-600 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-500",
    // Danger: Red
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const GlassInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium ${className}`}
    {...props}
  />
));
GlassInput.displayName = 'GlassInput';

export const GlassSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className = '', children, ...props }) => (
   <select
    className={`w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    {children}
  </select>
);

export const LoadingScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-200">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"></div>
                <h2 className="text-sm font-bold tracking-widest uppercase text-slate-500">Loading Workspace</h2>
            </div>
        </div>
    );
}
