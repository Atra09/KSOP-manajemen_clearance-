const SearchBar = ({ searchTerm, setSearchTerm, placeholder }) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder || "Cari surat..."}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-10 pr-4 text-sm focus:border-brand-300 focus:outline-none focus:ring-1 focus:ring-brand-500/10 xl:w-80"
      />
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  );
};

export default SearchBar;