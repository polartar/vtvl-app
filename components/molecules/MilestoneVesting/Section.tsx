interface IMilestoneVestingSectionProps extends React.AllHTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const MilestoneVestingSection: React.FC<IMilestoneVestingSectionProps> = ({ children, ...props }) => {
  return (
    <div
      {...props}
      className="before:content-[''] before:border before:border-b-0 before:border-gray-100 before:h-2 before:w-full before:block">
      <div className="px-6 py-3">{children}</div>
    </div>
  );
};

export default MilestoneVestingSection;
