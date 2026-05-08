import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const CACHE_KEY = 'news_dashboard_cache';
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function useNewsData() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNews = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      if (!forceRefresh) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION_MS) {
            setArticles(data);
            setLoading(false);
            return;
          }
        }
      }

      // If we don't have a specific API key, use spaceflightnewsapi as a fallback, 
      // or use EventRegistry / NewsAPI if the key is provided in .env
      const apiKey = import.meta.env.VITE_NEWS_API_KEY;
      let fetchedArticles = [];

      if (!apiKey || apiKey === 'free_api_no_key_needed') {
        // Fallback to free Spaceflight News API (no key needed)
        const res = await axios.get('https://api.spaceflightnewsapi.net/v4/articles/?limit=10');
        fetchedArticles = res.data.results.map(article => ({
          id: article.id,
          title: article.title,
          source: article.news_site,
          author: "Spaceflight News",
          date: article.published_at,
          image: article.image_url,
          description: article.summary,
          url: article.url
        }));
      } else {
        // Assume EventRegistry/NewsAPI format based on screenshots
        // For demonstration, using NewsAPI.org format if you replace the key
        const res = await axios.get(`https://newsapi.org/v2/top-headlines?language=en&pageSize=10&apiKey=${apiKey}`);
        fetchedArticles = res.data.articles.map((article, idx) => ({
          id: idx,
          title: article.title,
          source: article.source.name,
          author: article.author || "Unknown",
          date: article.publishedAt,
          image: article.urlToImage || 'https://via.placeholder.com/400x200?text=No+Image',
          description: article.description || "No description available.",
          url: article.url
        }));
      }

      setArticles(fetchedArticles);
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: fetchedArticles,
        timestamp: Date.now()
      }));

    } catch (err) {
      console.error("News fetch error:", err);
      setError("Failed to load news articles. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { articles, loading, error, refresh: () => fetchNews(true) };
}
