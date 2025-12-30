import { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingInputProps {
  value: number | null;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
};

export default function RatingInput({
  value,
  onChange,
  size = 'md',
  readonly = false,
  showValue = false
}: RatingInputProps): JSX.Element {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue !== null ? hoverValue : (value || 0);

  const handleClick = (rating: number) => {
    if (!readonly) {
      // If clicking the same value, clear it
      if (value === rating) {
        onChange(0);
      } else {
        onChange(rating);
      }
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div
        className={`flex items-center gap-0.5 ${readonly ? '' : 'cursor-pointer'}`}
        onMouseLeave={() => !readonly && setHoverValue(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readonly && setHoverValue(star)}
            disabled={readonly}
            className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                star <= displayValue
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-none text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      {showValue && value !== null && (
        <span className="text-sm text-gray-600 ml-1">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
