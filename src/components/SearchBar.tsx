import React from 'react'

export const SearchBar: React.FC<{ query: string; onQueryChange: (q: string) => void }> = ({ query, onQueryChange }) => {
  return (
    <div className="mb-3">
      <input
        className="form-control"
        placeholder="Szukaj po tytule, autorze lub kategorii..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
    </div>
  )
}

export default SearchBar
