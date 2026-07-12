const SkeletonCard = () => (
  <div className="card rounded-xl p-6 animate-fade-in">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-lg skeleton" />
      <div className="h-3 w-24 rounded skeleton" />
    </div>
    <div className="h-8 w-16 rounded skeleton" />
  </div>
);

export default SkeletonCard;
