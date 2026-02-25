import { useState } from 'react'
import { Shield, Brain, Lock, User, AlertCircle, LogOut } from 'lucide-react'
import useCareerStore from '../../store/careerStore'

export default function Login() {
    const { setAuthenticated } = useCareerStore()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleLogin = (e) => {
        e.preventDefault()
        if (username === 'Frieze' && password === 'Hakuna@123') {
            setAuthenticated(true)
        } else {
            setError('Invalid credentials. Access Denied.')
        }
    }

    return (
        <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gold-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-gold-500/20">
                        <Brain size={32} className="text-navy-900" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-100 uppercase tracking-widest text-center">CareerWeapon</h1>
                    <p className="text-slate-400 text-sm mt-1">Executive CV Intelligence</p>
                </div>

                <div className="bg-navy-900 border border-navy-700/50 rounded-2xl p-8 shadow-2xl">
                    <div className="flex items-center gap-2 mb-6 border-b border-navy-800 pb-4">
                        <Shield size={18} className="text-gold-500" />
                        <h2 className="text-lg font-semibold text-slate-200">Secure Access</h2>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg flex items-center gap-2 text-danger text-sm">
                                <AlertCircle size={16} className="flex-shrink-0" />
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="label text-xs mb-1.5 block focus-within:text-gold-400 transition-colors">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={16} className="text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input pl-10 w-full"
                                    placeholder="Enter username"
                                    autoComplete="username"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label text-xs mb-1.5 block focus-within:text-gold-400 transition-colors">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={16} className="text-slate-500" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pl-10 w-full"
                                    placeholder="Enter password"
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full btn-primary py-3 flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20 mt-4 h-12"
                        >
                            <Lock size={16} /> Authenticate
                        </button>
                    </form>
                </div>
                <p className="text-center text-slate-600 text-xs mt-6">
                    Unauthorized access is strictly prohibited.
                </p>
            </div>
        </div>
    )
}

export function LogoutButton() {
    const { setAuthenticated } = useCareerStore()

    return (
        <button
            onClick={() => setAuthenticated(false)}
            className="flex items-center gap-2 text-slate-500 hover:text-danger text-xs px-3 py-2 rounded hover:bg-navy-800 w-full transition-all cursor-pointer"
        >
            <LogOut size={13} /> Secure Logout
        </button>
    )
}
