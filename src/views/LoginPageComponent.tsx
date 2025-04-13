'use client'

import React, {useState, createContext} from "react";
import {useNavigate} from "react-router-dom";
import { userService } from "@/services/UserService";
import { User } from "../interfaces/interfaces";


export const UserContext = createContext<{
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
  }>({
    user: null,
    setUser: () => {},
  });


function LoginPageComponent() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isLogIn, setIsLogIn] = useState<boolean>(true);
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        Username: '',
        Password: '',
        Email: '',
        Weight: '',
        Height: ''
    });
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {id, value} = e.target;
        setFormData({...formData, [id]: value})
    };

    const toggleForm = () => {
        setIsLogIn(!isLogIn);
        setIsSignUp(!isSignUp);
        setError(null);
        setFormData({Username: '', Password: '', Email: '', Weight: '', Height: ''});
    };

    async function handleLogIn() {
        try{
            setLoading(true);
            setError(null);

            const user = await userService.getUserFromSignIn(formData.Username, formData.Password);

            const comlpeteLogin = () => {
                setUser(user);
                localStorage.setItem("currentUser", JSON.stringify(user));
                //console.log("User after log in: ", JSON.stringify(user));

                setTimeout(() => {
                    navigate('/home');
                }, 0);
            };

            comlpeteLogin()
        } catch (err){
            setError(err instanceof Error ? err.message : "Error logging in. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    async function handleSignUp(){
        try{
            setLoading(true);
            setError(null);

            if (!validateUsername(formData.Username)){
                throw new Error("Cannot use this username");
            }

            if (!validateUserPassword(formData.Password)){
                throw new Error("Password must be longer than 6 characters");
            }

            if (!validateUserEmail(formData.Email)){
                throw new Error("Incorrect email format");
            }

            const weight = formData.Weight ? parseFloat(formData.Weight) : 0;
            const height = formData.Height ? parseFloat(formData.Height) : 0;

            const user = await userService.createUser(
                formData.Username,
                formData.Password,
                formData.Email,
                weight,
                height
            );

            const completeSignUp = () => {
                setUser(user);
                localStorage.setItem('currentUser', JSON.stringify(user));
                //console.log("User after sign up: ", JSON.stringify(user));

                setTimeout(() => {
                    navigate('/home');
                }, 0);
            };

            completeSignUp();

        } catch (err) {
            setError(err instanceof Error ? err.message : "Error signing up. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function validateUsername(username: string): boolean{
        return username.length > 6;
    }

    function validateUserPassword(password: string): boolean{
        return password.length > 6;
    }

    function validateUserEmail(email: string): boolean{
        const emailPattern: RegExp =  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(email);
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 overflow-auto py-20">
            <div className="bg-gray-800 p-4 fixed top-0 z-10 w-full">
                <h1 className="text-white text-5xl font-bold text-center mb-2">Fitness Tracker</h1>
            </div>
            <div className="w-4/5 max-w-md p-8 mx-auto rounded-3xl bg-opacity-95 shadow-lg my-10" style={{ backgroundColor: 'rgba(18, 41, 43, 0.95)' }}>
            {isLogIn && (
                    <>
                        <h2 className="mb-12 text-4xl font-bold text-center text-white">Log In</h2>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="Username" className="block mb-2 text-xl font-semibold text-white ml-1">Username</label>
                                <input
                                    id="Username"
                                    className="w-full px-4 py-4 text-lg text-white rounded-xl focus:outline-none focus:scale-102 focus:shadow-md transition-all bg-white bg-opacity-10 focus:bg-opacity-15"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={formData.Username}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="Password" className="block mb-2 text-xl font-semibold text-white ml-1">Password</label>
                                <input
                                    id="Password"
                                    className="w-full px-4 py-4 text-lg text-white rounded-xl focus:outline-none focus:scale-102 focus:shadow-md transition-all bg-white bg-opacity-10 focus:bg-opacity-15"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={formData.Password}
                                    onChange={handleInputChange}
                                />
                            </div>
                            {error && <p className="text-red-400">{error}</p>}
                            <button
                                className="w-full py-4 mt-6 text-xl font-bold text-gray-900 transition-all rounded-xl bg-teal-300 hover:shadow-lg hover:-translate-y-1 disabled:bg-opacity-50 disabled:cursor-not-allowed"
                                type="button"
                                onClick={handleLogIn}
                                disabled={loading || !formData.Username || !formData.Password}
                            >
                                {loading ? "Logging in..." : "Log In"}
                            </button>
                            <p className="mt-4 text-center text-white">
                                Don't have an account?{" "}
                                <button
                                    className="font-medium text-teal-300 hover:underline focus:outline-none"
                                    type="button"
                                    onClick={toggleForm}
                                >
                                    Sign Up
                                </button>
                            </p>
                        </div>
                    </>
                )}

                {isSignUp && (
                    <>
                        <h2 className="mb-8 text-4xl font-bold text-center text-white">Sign Up</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="Username" className="block mb-2 text-xl font-semibold text-white ml-1">Username</label>
                                <input
                                    id="Username"
                                    className="w-full px-4 py-4 text-lg text-white rounded-xl focus:outline-none focus:scale-102 focus:shadow-md transition-all bg-white bg-opacity-10 focus:bg-opacity-15"
                                    type="text"
                                    placeholder="Create a username"
                                    value={formData.Username}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="Password" className="block mb-2 text-xl font-semibold text-white ml-1">Password</label>
                                <input
                                    id="Password"
                                    className="w-full px-4 py-4 text-lg text-white rounded-xl focus:outline-none focus:scale-102 focus:shadow-md transition-all bg-white bg-opacity-10 focus:bg-opacity-15"
                                    type="password"
                                    placeholder="Create a password"
                                    value={formData.Password}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="Email" className="block mb-2 text-xl font-semibold text-white ml-1">Email</label>
                                <input
                                    id="Email"
                                    className="w-full px-4 py-4 text-lg text-white rounded-xl focus:outline-none focus:scale-102 focus:shadow-md transition-all bg-white bg-opacity-10 focus:bg-opacity-15"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.Email}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="Weight" className="block mb-2 text-xl font-semibold text-white ml-1">Weight (optional)</label>
                                <input
                                    id="Weight"
                                    className="w-full px-4 py-4 text-lg text-white rounded-xl focus:outline-none focus:scale-102 focus:shadow-md transition-all bg-white bg-opacity-10 focus:bg-opacity-15"
                                    type="text"
                                    placeholder="Enter weight"
                                    value={formData.Weight}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="Height" className="block mb-2 text-xl font-semibold text-white ml-1">Height (optional)</label>
                                <input
                                    id="Height"
                                    className="w-full px-4 py-4 text-lg text-white rounded-xl focus:outline-none focus:scale-102 focus:shadow-md transition-all bg-white bg-opacity-10 focus:bg-opacity-15"
                                    type="text"
                                    placeholder="Enter height"
                                    value={formData.Height}
                                    onChange={handleInputChange}
                                />
                            </div>
                            {error && <p className="text-red-400">{error}</p>}
                            <button
                                className="w-full py-4 mt-6 text-xl font-bold text-gray-900 transition-all rounded-xl bg-teal-300 hover:shadow-lg hover:-translate-y-1 disabled:bg-opacity-50 disabled:cursor-not-allowed"
                                type="button"
                                onClick={handleSignUp}
                                disabled={loading || !formData.Username || !formData.Password || !formData.Email}
                            >
                                {loading ? "Signing up..." : "Sign Up"}
                            </button>
                            <p className="mt-4 text-center text-white">
                                Already have an account?{" "}
                                <button
                                    className="font-medium text-teal-300 hover:underline focus:outline-none"
                                    type="button"
                                    onClick={toggleForm}
                                >
                                    Log In
                                </button>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default LoginPageComponent;