import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Workout, User } from '@/interfaces/interfaces';
import { workoutService } from '@/services/WorkoutService';

interface WorkoutContextType {
    currentWorkout: Workout | null;
    setCurrentWorkout: (workout: Workout) => void;
    refreshWorkout: () => Promise<void>
    isLoading: boolean;
    clearCurrentWorkout: () => void;
}

const workoutContext = createContext<WorkoutContextType| undefined>(undefined);

export const WorkoutProvider: React.FC<{children: ReactNode}> = ({children}) => {
    const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    
    useEffect(() => {
        const storedWorkout = localStorage.getItem("currentWorkout");
        const storedUser = localStorage.getItem("currentUser");
        const storedWorkoutTimestamp = localStorage.getItem('currentWorkoutTimestamp');
        const now = Date.now();

        if (storedWorkout){
            const parsedWorkout = JSON.parse(storedWorkout) as Workout;
            if (storedUser){
                const parsedUser = JSON.parse(storedUser) as User;

                const isUserMatch = parsedUser.UserID == parsedWorkout.UserID;
                const isWorkoutOngoing = parsedWorkout.Duration == 0;

                if (parsedWorkout && isUserMatch && isWorkoutOngoing){
                    setCurrentWorkout(parsedWorkout);
                    setUser(parsedUser);
                } else {
                    localStorage.removeItem("currentWorkout");
                    localStorage.removeItem("currentWorkoutTimestamp");
                }
            }
        }
    }, []);

    const clearCurrentWorkout = useCallback(() => {
        setCurrentWorkout(null);
        localStorage.removeItem("currentWorkout");
        localStorage.removeItem("currentWorkoutTimestamp");
    }, []);

    const refreshWorkout = useCallback(async () => {
        try{
            setIsLoading(true);
            const storedWorkout = localStorage.getItem("currentWorkout");
            const storedUser = localStorage.getItem("currentUser");

            if (!storedWorkout || !storedUser){
                console.log("Not active workout");
                setIsLoading(false);
                return;
            }

            const parsedWorkout = JSON.parse(storedWorkout) as Workout;
            const parsedUser = JSON.parse(storedUser) as User;
            const workoutID = parsedWorkout.WorkoutID;

            const updatedWorkout = await workoutService.fetchWorkoutByID(workoutID);

            if (updatedWorkout && parsedUser && updatedWorkout.UserID == parsedUser.UserID){

                if (updatedWorkout.Duration == 0){
                    setCurrentWorkout(updatedWorkout);
                    localStorage.setItem('currentWorkout', JSON.stringify(updatedWorkout));
                } else {
                    clearCurrentWorkout();
                }

                
            }
        } catch (error) {
            console.error('Failed to refresh workout:', error);
            clearCurrentWorkout();
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <workoutContext.Provider value={{
            currentWorkout,
            setCurrentWorkout,
            refreshWorkout,
            isLoading,
            clearCurrentWorkout,
        }}>
            {children}
        </workoutContext.Provider>
    )
};

export const useWorkout = (): WorkoutContextType => {
    const context = useContext(workoutContext);
    if (context === undefined){
        throw new Error("useWorkout must be used within a WorkoutProvider");
    }
    return context;
};