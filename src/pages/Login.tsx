import React from 'react'
import {useAuth} from "../contexts/AuthContext.tsx";
import {type NavigateFunction, useNavigate} from "react-router-dom";

const Home: React.FC = () => {
  const [loginInput, setLoginInput] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const { login } = useAuth()

  const navigate:NavigateFunction = useNavigate();

const handleLogin = async (e: React.SyntheticEvent): Promise<void> => {
  e.preventDefault();

  setError(null);

  try {
    await login(loginInput, password);
    navigate('/books');
  } catch (err: unknown) {
    let message = 'Błąd logowania';
    if (typeof err === 'string') {
      message = err;
    } else if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
      message = (err as { message: string }).message;
    }
    setError(message);
  }
}

  return (
      <div className="card mb-3 p-4 text-center w-25">
        <h1>Zaloguj</h1>

        <form className="card-body text-start">
          <div className="mb-2">
            <label className="form-label">Login</label>
            <input className="form-control" value={loginInput} onChange={(e) => setLoginInput(e.target.value)}/>
          </div>
          <div className="mb-4">
            <label className="form-label">Hasło</label>
            <input type="password" className="form-control" value={password}
                   onChange={(e) => setPassword(e.target.value)}/>
          </div>
          <div className="d-flex gap-2 justify-content-center">
            <button type="submit" className="btn btn-primary" onClick={(e) => handleLogin(e)}>Zaloguj</button>
          </div>

          {error && (
              <div className="alert alert-danger mt-3" role="alert">
                {error}
              </div>
          )}
        </form>
      </div>
  )
}

export default Home
