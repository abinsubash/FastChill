"use client"
import { useEffect, useState } from 'react';
import { Eye, EyeOff, ShoppingBag, Snowflake } from 'lucide-react';
import { useRouter } from "next/navigation";
import { setAccessToken } from '@/redux/slices/authSlice';
import { useDispatch } from 'react-redux';

export default function FastChillLogin() {
  const dispatch = useDispatch()
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  useEffect(() => {
    const hasRefreshToken = document.cookie.includes("refresh_token=");
    if (hasRefreshToken) {
      router.replace("/admin"); // 👈 IMPORTANT (replace, not push)
    }
  }, [router]);

  const handleSubmit = async () => {
    setErrors({});

    if (!email || !password) {
      setErrors({
        email: !email ? "Email is required" : undefined,
        password: !password ? "Password is required" : undefined,
      });
      return;
    }

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        }
        return;
      }

      console.log(data)
      dispatch(setAccessToken(data.access_token));
      
      // success
      router.push("/admin");
    } catch (error) {
      setErrors({
        email: "Network error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-8 py-10 text-center">
            <div className="flex justify-center items-center mb-4">
              <div className="relative">
                <ShoppingBag className="w-12 h-12 text-white" strokeWidth={2} />
                <Snowflake className="w-6 h-6 text-blue-200 absolute -top-1 -right-1 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Fast-Chill</h1>
            <p className="text-blue-100 text-sm">Welcome back! Please login to your account</p>
          </div>

          <div className="px-8 py-10">
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <small className="text-red-600 block -mt-3">
                  {errors.email}
                </small>
              )}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-900 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errors.password && (
                <small className="text-red-600 block -mt-3">
                  {errors.password}
                </small>
              )}

              <div className="flex items-center justify-between">
                <button type="button" className="text-sm text-blue-900 hover:text-blue-700 font-semibold transition-colors">
                  Forgot Password?
                </button>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-blue-900 to-blue-700 text-white py-3.5 rounded-xl font-semibold text-base hover:shadow-lg hover:shadow-blue-900/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-white text-xs mt-6 opacity-75">© 2025 Fast-Chill. All rights reserved.</p>
      </div>
    </div>
  );
}
