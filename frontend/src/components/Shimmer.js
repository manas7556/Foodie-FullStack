
const Shimmer = () => {
  return (
    <div
      className="mx-auto w-full max-w-7xl px-5 py-8"
      role="status"
      aria-label="Loading restaurants"
    >
      <div className="flex flex-wrap justify-center gap-5">
        <div className="w-[220px] animate-pulse overflow-hidden rounded-xl bg-white p-3 shadow-sm">
          <div className="h-[150px] w-full rounded-lg bg-gray-200" />

          <div className="mt-4 h-5 w-4/5 rounded bg-gray-200" />

          <div className="mt-3 h-4 w-1/2 rounded bg-gray-200" />

          <div className="mt-3 h-4 w-3/4 rounded bg-gray-200" />

          <div className="mt-3 h-4 w-2/5 rounded bg-gray-200" />
        </div>
      </div>

      <span className="sr-only">
        Loading restaurant information...
      </span>
    </div>
  );
};

export default Shimmer;
