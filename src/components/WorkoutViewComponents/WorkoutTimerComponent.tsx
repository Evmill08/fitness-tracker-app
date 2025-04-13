import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function WorkoutTimerComponent() {
    const [seconds, setSeconds] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [formattedTime, setFormattedTime] = useState<string>();
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const navigate = useNavigate();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const storedSeconds = localStorage.getItem('workoutSeconds');
        const storedIsRunning = localStorage.getItem('workoutIsRunning');
        //console.log("stored is running: ", JSON.stringify(storedIsRunning));
        if (storedSeconds != null){
            setSeconds(parseInt(storedSeconds, 10));
        }

        if (storedIsRunning == 'true'){
            setIsRunning(true);
        }

        setIsInitialized(true);
    }, [navigate]);

    useEffect(() => {

        if (!isInitialized){
            return;
        }

        if (isRunning == true){
            const currentTime = Date.now();

            localStorage.setItem('currentWorkoutTimestamp', currentTime.toString());
            localStorage.setItem("workoutIsRunning", JSON.stringify(isRunning));

            intervalRef.current = setInterval(() => {
                setSeconds((prevSeconds) => prevSeconds + 1);
                localStorage.setItem('currentWorkoutTimestamp', Date.now().toString());
            }, 1000);

        }else {
            if (intervalRef.current){
                clearInterval(intervalRef.current);
            }
            localStorage.setItem('workoutIsRunning', JSON.stringify(isRunning));
        }

        return () => {
            if (intervalRef.current){
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, isInitialized, navigate]);

    useEffect(() => {
        if (isInitialized){
            localStorage.setItem('workoutSeconds', seconds.toString());
            formatSeconds();
        }
        
    }, [seconds, isInitialized, navigate]);

    const resetTimer = () => {
        setIsRunning(false);
        setSeconds(0);
        localStorage.removeItem('workoutSeconds');
        localStorage.removeItem('workoutIsRunning');
        localStorage.removeItem('currentWorkoutTimestamp');
    }

    const formatSeconds = () => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        let timeString = "";

        if (hours > 0){
            timeString += `${String(hours).padStart(2, '0')}h `;
        }

        if (hours > 0 || minutes > 0){
            timeString += `${String(minutes).padStart(2, '0')}m `;
        }

        timeString += `${String(remainingSeconds).padStart(2,'0')}s `

        setFormattedTime(timeString);
    }

    return (
        <div className="bg-opacity-95 rounded-xl p-5">
            <h1 className="text-white text-2xl text-center font-bold p-3">Workout Time</h1>
            <div className="text-white text-2xl font-bold text-center mb-4">
                {formattedTime}
            </div>
            <div className="flex space-x-4 justify-center">
                <button 
                    type="button"
                    className="px-6 py-3 text-base font-bold text-gray-900 transition-all rounded-lg bg-teal-300 hover:bg-teal-400 active:bg-teal-500 active:scale-95 hover:shadow-md focus:ring-2 focus:ring-teal-200 focus:outline-none disabled:bg-opacity-50 disabled:cursor-not-allowed duration-200"
                    onClick={() => setIsRunning(!isRunning)}
                >
                    {isRunning ? 'Pause' : 'Start'}
                </button>
                <button 
                    type="button"
                    className="px-6 py-3 text-base font-bold text-gray-900 transition-all rounded-lg bg-teal-300 hover:bg-teal-400 active:bg-teal-500 active:scale-95 hover:shadow-md focus:ring-2 focus:ring-teal-200 focus:outline-none disabled:bg-opacity-50 disabled:cursor-not-allowed duration-200"
                    onClick={resetTimer}
                    disabled={seconds === 0}
                >
                    Clear
                </button>
            </div>
        </div>
    );
}

export default WorkoutTimerComponent;