import React from 'react';

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  locationQuery,
  setLocationQuery,
  onSearch
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card rounded-xl p-2 max-w-3xl mx-auto flex flex-col md:flex-row gap-2 shadow-lg mb-stack-lg"
    >
      <div className="flex-1 flex items-center bg-surface-container-lowest rounded-lg px-4 py-3 border border-outline-variant/30 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
        <span className="material-symbols-outlined text-outline mr-2">location_on</span>
        <input
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
          className="w-full bg-transparent border-none focus:ring-0 text-body-md font-body-md text-on-surface placeholder:text-outline/50 outline-none p-0"
          placeholder="Location (e.g. Springfield)"
          type="text"
        />
      </div>
      <div className="flex-1 flex items-center bg-surface-container-lowest rounded-lg px-4 py-3 border border-outline-variant/30 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
        <span className="material-symbols-outlined text-outline mr-2">search</span>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-none focus:ring-0 text-body-md font-body-md text-on-surface placeholder:text-outline/50 outline-none p-0"
          placeholder="Service (e.g. Carpenter, Sarah)"
          type="text"
        />
      </div>
      <button
        type="submit"
        className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label-md text-label-md hover:bg-primary/95 transition-all active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center font-bold"
      >
        Search
      </button>
    </form>
  );
}
