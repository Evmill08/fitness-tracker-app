import { User } from "@/interfaces/interfaces";
import { userService } from "@/services/UserService";
import React, { useState, useEffect, useCallback } from "react";
import {useNavigate } from "react-router-dom";

function UserInfoComponent(){
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [height, setHeight] = useState<number>(0);
    const [weight, setWeight] = useState<number>(0);
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [editingHeight, setEditingHeight] = useState<boolean>(false);
    const [editingWeight, setEditingWeight] = useState<boolean>(false);
    const [editingUsername, setEditingUsername] = useState<boolean>(false);
    const [editingEmail, setEditingEmail] = useState<boolean>(false);
    const navigate = useNavigate();
    

    useEffect(() => {
        const loadUserInfo = async () => {
            const currentUser = localStorage.getItem("currentUser");
            
            if (currentUser){
                try{
                    setLoading(true);
                    setError(null);
                    const parsedUser = JSON.parse(currentUser) as User;

                    if (parsedUser){
                        setHeight(parsedUser.Height);
                        setWeight(parsedUser.Weight);
                        setEmail(parsedUser.Email);
                        setUsername(parsedUser.Username);
                        setUser(parsedUser);
                        
                    }
                } catch (parseErr){
                    setError(parseErr instanceof Error ? parseErr.message : "Error parsing current User");
                } finally {
                    setLoading(false);
                }
                
            }
        }
        loadUserInfo();
    }, []);

    async function handleUpdateUsername(){
        if (!username.trim()){
            setUsername(username);
            setEditingUsername(false);
            return;
        }

        if (username.length < 6){
            console.error("Username must be longer than 6 characters");
            setUsername(username);        
            setEditingUsername(false);
            return;
        }

        try{
            setLoading(true);
            setError(null);
            console.log("Username to update: ", username);

            if (user){

                const updatedUser = {
                    UserID: user.UserID,
                    Username: username, 
                    Password: user.Password,
                    Email: user.Email,
                    Weight: user.Weight,
                    Height: user.Height,
                    WorkoutHistory: user.WorkoutHistory || [],
                    PersonalBests: user.PersonalBests || []
                }

                console.log("Updated User: ", JSON.stringify(updatedUser));
                const returnedUpdatedUser = await userService.updateUser(updatedUser);

                if (returnedUpdatedUser){
                    setUsername(returnedUpdatedUser.Username);
                    setUser(returnedUpdatedUser);
                    localStorage.setItem("currentUser", JSON.stringify(returnedUpdatedUser));
                    setEditingUsername(false);
                }
            }
        } catch (err){
            setError(err instanceof Error ? err.message : "Error updating username");
        } finally {
            setLoading(false);
        }
    } 

    function validateUserEmail(email: string): boolean{
        const emailPattern: RegExp =  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(email);
    }

    async function handleUpdateEmail(){
        if (!email.trim()){
            setUsername(email);
            setEditingEmail(false);
            return;
        }

        if (!validateUserEmail(email)){
            console.error("Invalid Email Format");
            setEmail(email);        
            setEditingEmail(false);
            return;
        }

        try{
            setLoading(true);
            setError(null);

            if (user){
                const updatedUser = {...user, Email: email};
                const returnedUpdatedUser = await userService.updateUser(updatedUser);

                if (returnedUpdatedUser){
                    setEmail(returnedUpdatedUser.Email);
                    setUser(returnedUpdatedUser);
                    localStorage.setItem("currentUser", JSON.stringify(returnedUpdatedUser));
                    setEditingEmail(false);
                }
            }
        } catch (err){
            setError(err instanceof Error ? err.message : "Error updating username");
        } finally {
            setLoading(false);
        }
    } 

    async function handleUpdateHeight(){
        if (!height){
            setHeight(height);
            setEditingHeight(false);
            return;
        }

        try{
            setLoading(true);
            setError(null);

            if (user){
                const updatedUser = {...user, Height: height};
                const returnedUpdatedUser = await userService.updateUser(updatedUser);

                if (returnedUpdatedUser){
                    setHeight(returnedUpdatedUser.Height);
                    setUser(returnedUpdatedUser);
                    localStorage.setItem("currentUser", JSON.stringify(returnedUpdatedUser));
                    setEditingHeight(false);
                }
            }
        } catch (err){
            setError(err instanceof Error ? err.message : "Error updating username");
        } finally {
            setLoading(false);
        }
    } 

    async function handleUpdateWeight(){
        if (!weight){
            setWeight(weight);
            setEditingWeight(false);
            return;
        }

        try{
            setLoading(true);
            setError(null);

            if (user){
                const updatedUser = {...user, Weight: weight};
                const returnedUpdatedUser = await userService.updateUser(updatedUser);

                if (returnedUpdatedUser){
                    setWeight(returnedUpdatedUser.Weight);
                    setUser(returnedUpdatedUser);
                    localStorage.setItem("currentUser", JSON.stringify(returnedUpdatedUser));
                    setEditingWeight(false);
                }
            }
        } catch (err){
            setError(err instanceof Error ? err.message : "Error updating username");
        } finally {
            setLoading(false);
        }
    } 

    return (
        <div className="w-11/12 mx-auto p-6 bg-gray-800 bg-opacity-80 rounded-xl shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-400 font-medium">Username</div>
                    {editingUsername ? (
                        <div className="flex items-center w-full">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-gray-700 bg-opacity-50 rounded-lg px-3 py-2 text-white text-xl font-bold border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 w-full"
                                autoFocus
                                onBlur={handleUpdateUsername}
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateUsername()}
                            />
                        </div>
                    ) : (
                        <div 
                            className="flex items-center text-yellow-400 text-xl font-bold cursor-pointer hover:text-yellow-300 transition-colors duration-200"
                            onClick={() => setEditingUsername(true)}
                        >
                            {username}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 opacity-60 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-400 font-medium">Email</div>
                    {editingEmail ? (
                        <div className="flex items-center w-full">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-gray-700 bg-opacity-50 rounded-lg px-3 py-2 text-white text-xl font-bold border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 w-full"
                                autoFocus
                                onBlur={handleUpdateEmail}
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateEmail()}
                            />
                        </div>
                    ) : (
                        <div 
                            className="flex items-center text-yellow-400 text-xl font-bold cursor-pointer hover:text-yellow-300 transition-colors duration-200"
                            onClick={() => setEditingEmail(true)}
                        >
                            {email}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 opacity-60 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-400 font-medium">Height (cm)</div>
                    {editingHeight ? (
                        <div className="flex items-center w-full">
                            <input
                                type="number"
                                value={height || ''}
                                onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : 0)}
                                className="bg-gray-700 bg-opacity-50 rounded-lg px-3 py-2 text-white text-xl font-bold border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 w-full"
                                autoFocus
                                onBlur={handleUpdateHeight}
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateHeight()}
                            />
                        </div>
                    ) : (
                        <div 
                            className="flex items-center text-yellow-400 text-xl font-bold cursor-pointer hover:text-yellow-300 transition-colors duration-200"
                            onClick={() => setEditingHeight(true)}
                        >
                            {height}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 opacity-60 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-400 font-medium">Weight (kg)</div>
                    {editingWeight ? (
                        <div className="flex items-center w-full">
                            <input
                                type="number"
                                value={weight || ''}
                                onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : 0)}
                                className="bg-gray-700 bg-opacity-50 rounded-lg px-3 py-2 text-white text-xl font-bold border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 w-full"
                                autoFocus
                                onBlur={handleUpdateWeight}
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateWeight()}
                            />
                        </div>
                    ) : (
                        <div 
                            className="flex items-center text-yellow-400 text-xl font-bold cursor-pointer hover:text-yellow-300 transition-colors duration-200"
                            onClick={() => setEditingWeight(true)}
                        >
                            {weight}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 opacity-60 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


export default UserInfoComponent;