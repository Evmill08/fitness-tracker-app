import { Workout, PersonalBest, Exercise, ExSet, User } from "@/interfaces/interfaces";
import { exerciseService } from "@/services/ExerciseService";
import { personalBestService } from "@/services/PersonalBestService";
import { userService } from "@/services/UserService";
import { workoutService } from "@/services/WorkoutService";
import React, { useState, useEffect, useCallback } from "react";
import WorkoutCalendarComponent from "./WorkoutCalendarComponent";
import {Link, useNavigate } from "react-router-dom";

function StatsWorkoutComponent() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userWorkouts, setUserWorkouts] = useState<Workout[]>([]);
    const [totalWorkoutsCount, setTotalWorkoutCount] = useState<number>(0);
    const [totalWorkoutWeight, setTotalWorkoutWeight] = useState<string>("");
    const [totalWorkoutTime, setTotalWorkoutTime] = useState<string>("");

    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchUser = async () => {
            try{
                setLoading(true);
                setError(null);
    
                const storedUser = localStorage.getItem("currentUser");
    
                if (storedUser){
                    const parsedUser = JSON.parse(storedUser) as User;
                    console.log("Parsed User in stats: ", JSON.stringify(parsedUser));


                    if (parsedUser && parsedUser.UserID){
                        setUser(parsedUser);
                    }
                } 
                return null;
            } catch (err){
                setError(err instanceof Error ? err.message : "Error fetching current user");
                return null;
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchUserWorkouts = async () => {
            if (!user) return;

            try {
                setLoading(true);
                setError(null);
    
                if (user){
                    const storedWorkouts = await userService.getUserWorkouts(user.UserID);
    
                    if (storedWorkouts && storedWorkouts.length > 0){
                        setUserWorkouts(storedWorkouts);
                        setTotalWorkoutCount(storedWorkouts.length || 0);
                        console.log("User Workouts: ", JSON.stringify(storedWorkouts));
                        console.log("User Workout Count: ", JSON.stringify(storedWorkouts.length));
                    }
                }
            } catch (err){
                setError(err instanceof Error ? err.message : "Error fetching current user workouts");
            } finally {
                setLoading(false);
            }
        };
        fetchUserWorkouts();
    }, [user]);

    useEffect(() => {
        const calculateTotalTime = () => {
            try{
                setLoading(true);
                setError(null);
    
                let totalTime = 0;
                if (userWorkouts && userWorkouts.length > 0){
                    for (const workout of userWorkouts){
                        totalTime += workout.Duration;
                    }
                }
                console.log("Total Time: ", totalTime);
    
                setTotalWorkoutTime(formatSeconds(totalTime));
            } catch (err){
                setError(err instanceof Error ? err.message : "Error fetching workouts time");
            } finally {
                setLoading(false);
            }
        };
        calculateTotalTime();
    }, [userWorkouts]);


    useEffect(() => {
        const calculateTotalWeight = async () => {
            if (!userWorkouts || userWorkouts.length == 0){
                setTotalWorkoutWeight("0");
                return;
            }

            try{
                setLoading(true);
                setError(null);
                    
                let totalWeight = 0;
                for (const workout of userWorkouts){
                    for (const exercise of workout.Exercises){
                        const exerciseWeight = await exerciseService.getTotalExerciseWeight(exercise.ExerciseID);
                        totalWeight += exerciseWeight;
                    }
                }

                console.log("Total Weight: ", totalWeight);

                setTotalWorkoutWeight(totalWeight.toLocaleString());
            
            } catch (err){
                setError(err instanceof Error ? err.message : "Error fetching workouts weight");
            } finally {
                setLoading(false);
            }
        };
        calculateTotalWeight();
    }, [userWorkouts]);

    const formatSeconds = (duration: number) => {
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const remainingSeconds = duration % 60;

        let timeString = "";

        if (hours > 0){
            timeString += `${String(hours).padStart(2, '0')}h `;
        }

        if (hours > 0 || minutes > 0){
            timeString += `${String(minutes).padStart(2, '0')}m `;
        }

        timeString += `${String(remainingSeconds).padStart(2,'0')}s `

        return timeString;
    }

    const stats = [
        { statName: "Workouts", stat: totalWorkoutsCount },
        { statName: "Total Time", stat: totalWorkoutTime },
        { statName: "Total Weight", stat: `${totalWorkoutWeight} lbs` }
    ];

    const bgColor = "rgba(18, 41, 43, .95)"

    return (
        <div className="stats-workout-container">
            {loading && <p className="text-white text-center">Loading...</p>}
            {error && <p className="text-red-400 text-center">{error}</p>}
            <div className="mx-auto max-w-4xl my-12">
                <div className="month-track mx-auto mb-16 w-full bg-opacity-95 rounded-3xl p-12" 
                    style={{ backgroundColor: bgColor }}>
                    <h1 className="month-title text-white text-4xl font-bold text-center mb-8">This Month</h1>
                    <Link to="/profile" className="workout-stats-link block no-underline text-inherit">
                        <div className="workout-stats w-full p-4 rounded-2xl transition-all duration-300 hover:bg-opacity-10 hover:bg-white hover:shadow-lg hover:scale-105">
                            <ul className="list-none p-0 m-0 flex justify-center gap-4 w-full ">
                                {stats.map((stat, index) => (
                                    <li key={index} className="flex-1 min-w-40">
                                        <div className="stat-container bg-white bg-opacity-10 rounded-xl p-4 text-center">
                                            <h2 className="stat-name text-teal-300 text-lg font-semibold m-0 mb-2">{stat.statName}</h2>
                                            <p className="stat-value text-yellow-400 text-2xl font-bold m-0">{stat.stat}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="github-style-calender">
                <WorkoutCalendarComponent/>
            </div>
        </div>



    )
}

export default StatsWorkoutComponent;