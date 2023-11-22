import { Link } from 'react-router-dom';
function Home() {
    return (
      <div>
        <h2>Home</h2>
        <p>Welcome to the home page!</p>
        {/* Add a button to navigate to the OAuth page */}
        <Link to="http://localhost:4180/oauth2/">
          <button>Go to OAuth Page</button>
        </Link>
      </div>
    );
  }
  
  export default Home;