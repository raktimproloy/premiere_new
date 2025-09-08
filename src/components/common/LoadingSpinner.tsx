interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'gray' | 'white' | 'yellow';
  text?: string;
  className?: string;
  showText?: boolean;
}

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue', 
  text,
  className = '',
  showText = true
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'border-t-blue-600',
    gray: 'border-t-gray-600',
    white: 'border-t-white',
    yellow: 'border-t-yellow-400'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} border-2 border-gray-200 ${colorClasses[color]} rounded-full animate-spin`}></div>
      {showText && text && (
        <p className="text-gray-600 text-sm mt-2">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
