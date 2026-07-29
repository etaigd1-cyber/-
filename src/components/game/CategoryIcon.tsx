interface CategoryIconProps {
  category?: { imageUrl?: string; name: string } | null;
  className?: string;
}

/** The rounded-square logo standing in for a challenge category's old emoji. */
const CategoryIcon = ({ category, className = 'h-8 w-8' }: CategoryIconProps) => {
  if (!category?.imageUrl) return null;
  return (
    <img
      src={category.imageUrl}
      alt={category.name}
      className={`inline-block object-contain align-middle rounded-lg ${className}`}
    />
  );
};

export default CategoryIcon;
