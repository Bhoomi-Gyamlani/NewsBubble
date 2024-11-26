// import React, { useEffect, useState } from "react";
// import NewsItem from "./NewsItem";
// import Spinner from "./Spinner";
// import PropTypes from "prop-types";
// import InfiniteScroll from "react-infinite-scroll-component";

// const News = ({ pageSize = 8, category = "general", setProgress }) => {
//   const [articles, setArticles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [totalResults, setTotalResults] = useState(0);

//   // Capitalize the first letter of the category name
//   const capitalizeFirstLetter = (string) =>
//     string.charAt(0).toUpperCase() + string.slice(1);

//   // Update the news based on the category and page
//   const updateNews = async () => {
//     try {
//       setProgress(10); // Start progress bar

//       const url = `https://newsapi.org/v2/top-headlines?category=${category}&apiKey=${process.env.REACT_APP_NEWS_API}&page=${page}&pageSize=${pageSize}`;
      
//       const response = await fetch(url);
//       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
//       const parsedData = await response.json();

//       setProgress(50); // Progress update

//       setArticles(parsedData.articles || []);
//       setTotalResults(parsedData.totalResults || 0);
//       setLoading(false); // Set loading to false once data is fetched
//       setProgress(100); // End progress bar
//     } catch (error) {
//       console.error("Error fetching news:", error);
//       setLoading(false); // Stop loading
//       setProgress(100); // End progress bar
//     }
//   };

//   useEffect(() => {
//     document.title = `NewsBubble - ${capitalizeFirstLetter(category)} Headlines`;
//     updateNews(); // Call updateNews when category or page size changes
//     // eslint-disable-next-line
//   }, [category, pageSize]);

//   // Fetching more data when scrolled down
//   const fetchMoreData = async () => {
//     const newPage = page + 1;
//     setPage(newPage);

//     try {
//       const url = `https://newsapi.org/v2/top-headlines?category=${category}&apiKey=${process.env.REACT_APP_NEWS_API}&page=${newPage}&pageSize=${pageSize}`;
//       const response = await fetch(url);
//       const parsedData = await response.json();

//       if (parsedData?.articles) {
//         setArticles((prevArticles) => [...prevArticles, ...parsedData.articles]);
//       }
//     } catch (error) {
//       console.error("Error fetching more news:", error);
//     }
//   };

//   return (
//     <div className="container my-3">
//       <h1 className="text-center" style={{ margin: "35px 0px", marginTop: "90px" }}>
//         NewsBubble - Top {capitalizeFirstLetter(category)} Headlines
//       </h1>
//       {loading ? (
//         <Spinner /> // Show loading spinner while fetching
//       ) : (
//         <InfiniteScroll
//           dataLength={articles.length}
//           next={fetchMoreData}
//           hasMore={articles.length < totalResults}
//           loader={<Spinner />}
//         >
//           <div className="container">
//             <div className="row">
//               {articles.map((article, index) => (
//                 <div className="col-md-4" key={`${article.url}-${index}`}>
//                   <NewsItem
//                     title={article.title || "No Title Available"}
//                     description={article.description || "No Description Available"}
//                     imageUrl={article.urlToImage}
//                     newsUrl={article.url}
//                     author={article.author || "Unknown"}
//                     date={article.publishedAt || "Unknown Date"}
//                     source={article.source?.name || "Unknown Source"}
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>
//         </InfiniteScroll>
//       )}
//     </div>
//   );
// };

// // PropTypes validation
// News.propTypes = {
//   pageSize: PropTypes.number,
//   category: PropTypes.string,
//   setProgress: PropTypes.func.isRequired,
// };

// export default News;







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
      const url = `${baseUrl}?category=${category}&apiKey=${process.env.REACT_APP_NEWS_API}&page=${page}&pageSize=${pageSize}`;
      
      let retries = 3;
      let backoff = 1000; // Start with a 1-second backoff
      let response;

      while (retries > 0) {
        response = await fetch(url);
        if (response.ok) {
          break;
        } else if (response.status === 429) {
          console.warn("Rate limit hit. Retrying...");
          await delay(backoff); // Exponential backoff
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
    setPage(1); // Reset page when category changes
    fetchNews(true); // Fetch initial news
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
