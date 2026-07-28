interface DistrictIconProps {
  district?: { imageUrl: string; name: string } | null;
  className?: string;
}

/** Road-sign graphic standing in for a district's old emoji, everywhere a district is shown. */
const DistrictIcon = ({ district, className = 'h-6 w-10' }: DistrictIconProps) => {
  if (!district) return null;
  return (
    <img
      src={district.imageUrl}
      alt={district.name}
      className={`inline-block object-contain align-middle ${className}`}
    />
  );
};

export default DistrictIcon;
