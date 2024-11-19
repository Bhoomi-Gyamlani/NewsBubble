import React, { useEffect, useState } from "react";
import NewsItem from "./NewsItem";
import Spinner from "./Spinner";
import PropTypes from "prop-types";
import InfiniteScroll from "react-infinite-scroll-component";

const News = ({ pageSize = 8, category = "general", setProgress }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Capitalize the first letter of the category name
  const capitalizeFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

  // Fetch and update the news
  const updateNews = async () => {
    try {
      setProgress(10);
      const url = `https://newsapi.org/v2/top-headlines?category=${category}&apiKey=${process.env.REACT_APP_NEWS_API}&page=${page}&pageSize=${pageSize}`;
      const response = await fetch(url);
      setProgress(30);
      const parsedData = await response.json();
      setProgress(70);

      if (parsedData?.articles) {
        setArticles(parsedData.articles);
        setTotalResults(parsedData.totalResults);
      } else {
        setArticles([]);
        setTotalResults(0);
      }

      setLoading(false);
      setProgress(100);
    } catch (error) {
      console.error("Error fetching news:", error);
      setLoading(false);
      setProgress(100);
    }
  };

  // Update news when category or pageSize changes
  useEffect(() => {
    document.title = `NewsBubble - ${capitalizeFirstLetter(category)} Headlines`;
    updateNews();
    // eslint-disable-next-line
  }, [category, pageSize]);

  // Fetch more data for InfiniteScroll
  const fetchMoreData = async () => {
    const newPage = page + 1;
    setPage(newPage);

    try {
      const url = `https://newsapi.org/v2/top-headlines?category=${category}&apiKey=${process.env.REACT_APP_NEWS_API}&page=${newPage}&pageSize=${pageSize}`;
      const response = await fetch(url);
      const parsedData = await response.json();

      if (parsedData?.articles) {
        setArticles((prevArticles) => [...prevArticles, ...parsedData.articles]);
      }
    } catch (error) {
      console.error("Error fetching more news:", error);
    }
  };

  return (
    <div className="container my-3">
      <h1 className="text-center" style={{ margin: "35px 0px", marginTop: "90px" }}>
        NewsBubble - Top {capitalizeFirstLetter(category)} Headlines
      </h1>
      {loading ? (
        <Spinner />
      ) : (
        <InfiniteScroll
          dataLength={articles.length}
          next={fetchMoreData}
          hasMore={articles.length < totalResults}
          loader={<Spinner />}
        >
          <div className="container">
            <div className="row">
              {articles.map((article, index) => (
                <div className="col-md-4" key={`${article.url}-${index}`}>
                  <NewsItem
                    title={article.title || "No Title Available"}
                    description={article.description || "No Description Available"}
                    imageUrl={article.urlToImage}
                    newsUrl={article.url}
                    author={article.author || "Unknown"}
                    date={article.publishedAt || "Unknown Date"}
                    source={article.source?.name || "Unknown Source"}
                  />
                </div>
              ))}
            </div>
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
};

// PropTypes 
News.propTypes = {
  pageSize: PropTypes.number,
  category: PropTypes.string,
  setProgress: PropTypes.func.isRequired,
};

export default News;
