import React, { useState, useMemo } from 'react';
import { Search, RefreshCw, ExternalLink } from 'lucide-react';

export default function NewsDashboard({ newsData }) {
  const { articles, loading, error, refresh } = newsData;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'source'

  const displayedArticles = useMemo(() => {
    let filtered = articles.filter(a => 
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date);
      } else {
        return a.source.localeCompare(b.source);
      }
    });

    return filtered.slice(0, 5); // Show 5 articles
  }, [articles, searchTerm, sortBy]);

  if (loading && articles.length === 0) {
    return <div className="p-4 bg-card text-card-foreground rounded-lg border shadow-sm animate-pulse h-96 flex items-center justify-center">Loading News...</div>;
  }

  return (
    <div className="bg-card text-card-foreground p-4 rounded-lg border shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold">Latest Space News</h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2 top-2.5 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="Search news..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-2 bg-background border rounded-md text-sm w-full focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-background border rounded-md py-2 px-3 text-sm w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="date">Sort by Date</option>
            <option value="source">Sort by Source</option>
          </select>

          <button 
            onClick={refresh}
            className="bg-background text-foreground p-2 rounded-md border shadow-sm hover:bg-accent flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <RefreshCw size={16} /> <span className="sm:hidden">Refresh</span>
          </button>
        </div>
      </div>

      {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {displayedArticles.map(article => (
          <div key={article.id} className="flex flex-col border rounded-lg overflow-hidden bg-background hover:shadow-md transition-shadow">
            <div className="h-40 overflow-hidden bg-muted relative">
              <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="text-xs text-muted-foreground mb-2 flex justify-between">
                <span>{article.source}</span>
                <span>{new Date(article.date).toLocaleDateString()}</span>
              </div>
              <h3 className="font-bold text-sm mb-2 line-clamp-2">{article.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-3 mb-4 flex-1">
                {article.description}
              </p>
              <div className="mt-auto pt-2 border-t flex justify-between items-center">
                <span className="text-xs text-muted-foreground truncate max-w-[100px]">{article.author}</span>
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                >
                  Read More <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        ))}
        {displayedArticles.length === 0 && !loading && (
          <div className="col-span-full py-8 text-center text-muted-foreground">
            No articles found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
