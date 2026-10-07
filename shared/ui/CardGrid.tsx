import React from "react";

/**
 * The listing-card grid: one column on phones, then 2, 3 and 4. LoadingState's card skeleton uses the same
 * grid, so a page does not shift when its cards arrive.
 */
export const CARD_GRID_CLASS = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

export default function CardGrid({
  children,
  className = "",
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${CARD_GRID_CLASS} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
