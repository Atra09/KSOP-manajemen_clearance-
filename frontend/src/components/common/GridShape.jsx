const GridShape = () => {
  return (
    <div className="absolute -z-10 h-full w-full">
      <span className="absolute top-0 left-0 h-32 w-32 rounded-full bg-brand-500/10 blur-3xl"></span>
      <span className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl"></span>
    </div>
  );
};

export default GridShape;