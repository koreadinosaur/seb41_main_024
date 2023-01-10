type badgeProps = {
  isOpen: boolean;
};

const Badge = ({ isOpen }: badgeProps) => {
  return (
    <>
      {isOpen ? (
        <div className="flex justify-center items-center w-16 h-6 rounded-md bg-primary">
          <span className="text-xs text-white">모집 중</span>
        </div>
      ) : (
        <div className="flex justify-center items-center w-16 h-6 rounded-md bg-slate-400">
          <span className="text-xs text-white">모집 완료</span>
        </div>
      )}
    </>
  );
};

export default Badge;
