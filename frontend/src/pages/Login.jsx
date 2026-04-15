import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { PasswordInput } from '../components/Common';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-center mb-8">
                    <div className="mx-auto w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
                        P
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Account Login</h1>
                    <p className="text-slate-500 text-sm font-medium">Please enter your credentials to access the platform</p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 p-3 rounded-lg mb-6 text-xs text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="name@company.com"
                            required
                        />
                    </div>

                    <PasswordInput
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        name="password"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary mt-2"
                    >
                        {loading ? 'Processing...' : 'Login to Workspace'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-slate-500 text-xs font-medium">
                        Need an account? <Link to="/signup" className="text-blue-600 hover:underline font-bold">Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
