import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../utils/firebase';
import { useNavigate } from 'react-router-dom';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirect to home or any protected route
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-950 to-green-900">
      <form
        onSubmit={handleSignIn}
        className="bg-green-900 p-8 rounded-2xl shadow-2xl w-80 border border-green-700"
      >
        <h2 className="text-3xl mb-6 text-green-400 font-bold text-center">Sign In</h2>
        {error && (
          <div className="text-red-400 mb-4 text-center">{error}</div>
        )}
        <label className="block text-green-200 text-sm mb-1 mt-2" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 rounded bg-green-950 text-green-200 border border-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <label className="block text-green-200 text-sm mb-1 mt-2" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          className="w-full mb-6 p-2 rounded bg-green-950 text-green-200 border border-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white py-2 rounded font-semibold transition shadow-lg"
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

export default SignInPage;