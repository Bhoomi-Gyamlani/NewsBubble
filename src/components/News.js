import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import NewsItem from "./NewsItem";
import Spinner from "./Spinner";
import InfiniteScroll from "react-infinite-scroll-component";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const News = ({ pageSize = 5, category = "general" }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const fetchNews = async (isInitialLoad = false) => {
    try {
      setLoading(true);
      const baseUrl = "https://newsapi.org/v2/top-headlines";
       const apiKey = "0e8251ecef7c4d20a82436eb7d306b4e"
       const url = `${baseUrl}?category=${category}&apiKey=${apiKey}&page=${page}&pageSize=${pageSize}`;
      
      let retries = 3;
      let backoff = 1000; 
      let response;

      while (retries > 0) {
        response = await fetch(url);
        if (response.ok) {
          break;
        } else if (response.status === 429) {
          console.warn("Rate limit hit. Retrying...");
          await delay(backoff); 
          backoff *= 2;
          retries--;
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      if (!response.ok) {
        throw new Error("Failed to fetch news after retries.");
      }

      const data = await response.json();
      setArticles((prev) => (isInitialLoad ? data.articles : [...prev, ...data.articles]));
      setTotalResults(data.totalResults);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching news:", error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1); 
    fetchNews(true); 

    // eslint-disable-next-line 
  }, [category]);

  const fetchMoreData = () => {
    setPage((prevPage) => prevPage + 1);
    fetchNews();
  };

  return (
    <div className="container my-3">
      <h1 className="text-center" style={{ margin: "35px 0" }}>
        NewsBubble - Top {category.charAt(0).toUpperCase() + category.slice(1)} Headlines
      </h1>

      {loading && <Spinner />}

      <InfiniteScroll
        dataLength={articles.length}
        next={fetchMoreData}
        hasMore={articles.length < totalResults}
        loader={<Spinner />}
      >
        <div className="row">
          {articles.map((article, index) => (
            <div className="col-md-4" key={index}>
              <NewsItem
                title={article.title}
                description={article.description}
                imageUrl={article.urlToImage}
                newsUrl={article.url}
                author={article.author}
                date={article.publishedAt}
                source={article.source.name}
              />
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

News.propTypes = {
  pageSize: PropTypes.number,
  category: PropTypes.string,
};

export default News;
