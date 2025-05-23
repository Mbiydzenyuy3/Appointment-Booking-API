//Header component
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { logout } = useAuth();

  return (
    <>
      <header className="header">
        <Link to="/" className="text-xl font-bold">
          <h1 className="logo">
            <span>📅</span>BOOKEasy
          </h1>
        </Link>

        <div className="space-x-4">
          <button className="btn login" onClick={logout}>
            Logout
          </button>
        </div>
      </header>
    </>
  );
}
