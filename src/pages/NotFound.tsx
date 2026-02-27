import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="page-not-found bg-muted" role="main">
      <div className="page-not-found-inner">
        <h1 className="page-not-found-title">404</h1>
        <p className="page-not-found-message">Oops! Page not found</p>
        <a href="/" className="page-not-found-link cursor-pointer hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded px-2 py-1">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
