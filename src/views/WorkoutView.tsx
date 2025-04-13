import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Workout, Exercise } from "@/interfaces/interfaces";
import { exerciseService } from "@/services/ExerciseService";
import { workoutService } from "@/services/WorkoutService";
import AddExerciseComponent from "@/components/WorkoutViewComponents/AddExerciseComponent";
import WorkoutTimerComponent from "@/components/WorkoutViewComponents/WorkoutTimerComponent";
import WorkoutExerciseCardComponent from "@/components/WorkoutViewComponents/WorkoutExerciseCardComponent";
import WorkoutStats from "@/components/WorkoutViewComponents/WorkoutStats";
import WorkoutSummary from "@/components/WorkoutViewComponents/WorkoutSummary";
import { useWorkout } from "@/contexts/WorkoutContext";



export const WorkoutView = () => {
    const {currentWorkout, setCurrentWorkout, refreshWorkout, isLoading, clearCurrentWorkout} = useWorkout();
    const [workoutActive, setWorkoutActive] = useState<boolean>(false);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [workoutName, setWorkoutName] = useState<string>("New Workout");
    const [showWorkoutSummary, setShowWorkoutSummary] = useState<boolean>(false);
    const [workoutForSummary, setWorkoutForSummary] = useState<Workout | null>(null);
    const [editingName, setEditingName] = useState<boolean>(false);
    const [seconds, setSeconds] = useState<number>(0);
    const [finishedWorkout, setFinishedWorkout] = useState<Workout | null>(null);
    const navigate = useNavigate();


    useEffect(() =>  {
        const loadWorkout = async () => {
            const currentUser = localStorage.getItem("currentUser");
            const storedWorkout = localStorage.getItem("currentWorkout");
            const storedWorkoutTimestamp = localStorage.getItem('currentWorkoutTimestamp');
            const now = Date.now();
            //console.log("Stored Workout: ", storedWorkout);

            if (storedWorkout != null){
                try{
                    const parsedWorkout = JSON.parse(storedWorkout) as Workout;
                    if (currentUser != null){
                        const parsedUser = JSON.parse(currentUser) as User;

                        //console.log("Parsed Workout: ", JSON.stringify(parsedWorkout));

                        if (parsedWorkout && (parsedWorkout.Duration == 0) && parsedUser.UserID == parsedWorkout.UserID){
                            setWorkoutName(parsedWorkout.WorkoutName || "New Workout");
                            setWorkoutActive(true);
                            await refreshWorkout();
                        } else {
                            localStorage.removeItem("currentWorkout");
                            localStorage.removeItem("currentWorkoutTimestamp");
                            setWorkoutActive(false);
                        }
                    }
                } catch (err){
                    console.error("Error parsing workout from local storage: ", err);
                    setWorkoutActive(false);
                    localStorage.removeItem("currentWorkout");
                    localStorage.removeItem("currentWorkoutTimestamp");
                }
                
            } else {
                setWorkoutActive(false);
            }
        }
        loadWorkout();
    }, [navigate]);

    useEffect(() => {
        if (currentWorkout != null){
            setWorkoutName(currentWorkout.WorkoutName || "New Workout");
            setWorkoutActive(true);
            fetchExercises();
        }
    }, [currentWorkout]);

    useEffect(() => {
        if (workoutActive){
            refreshWorkout();
        }
    }, [workoutActive]);

    async function handleStartWorkout(){
        try{
            setLoading(false);
            setError(null);

            const now = new Date();
            const newWorkout = await workoutService.createWorkout(workoutName, now, []);
            if (newWorkout){
                setCurrentWorkout(newWorkout);
                localStorage.setItem("currentWorkoutTimestamp", Date.now().toString());
                setWorkoutActive(true);
            }
        } catch (err){
            setError(err instanceof Error ? err.message : "Error starting workout. Please try again");
        } finally {
            setLoading(false);
        }
    }

    async function handleEndWorkout() {
        try{
            setLoading(true);
            setError(null);
            const duration = await fetchDuration();

            if (currentWorkout){
                const updatedWorkout = {...currentWorkout};
                console.log("Updated Workout: ", JSON.stringify(updatedWorkout));
                updatedWorkout.Duration = duration || 1;
                
                console.log("Workout duration: ", updatedWorkout.Duration);
                const result = await workoutService.updateWorkout(updatedWorkout);
                console.log("Updated Workout after handle end workout: ", JSON.stringify(result));
                if (!result){
                    console.error("Workout update failed");
                }

                setFinishedWorkout(result);

                setShowWorkoutSummary(true);
                setWorkoutForSummary(finishedWorkout);

                clearCurrentWorkout();
                localStorage.removeItem("workoutSeconds");
                localStorage.removeItem("workoutIsRunning");
                
                await refreshWorkout();

                setWorkoutActive(false);
                
            }
        } catch (err){
            setError(err instanceof Error ? err.message : "Error finishing workout. Please try again");
        } finally {
            setLoading(false);
        } 
    }

    async function fetchDuration(){
        try {
            setLoading(true);
            setError(null);

            const storedSeconds = localStorage.getItem("workoutSeconds");
            //console.log("Seconds: ", storedSeconds);
            if (storedSeconds){
                const parsedSeconds = parseInt(storedSeconds);
                //console.log("parsed seconds: ", parsedSeconds);
                return parsedSeconds;
            }

            if (currentWorkout){
                const workoutStart = currentWorkout?.Date;
                const endTime = new Date()
                if (workoutStart){
                    const duration = Math.floor((endTime.getTime() - new Date(workoutStart).getTime()) / 1000);
                    return duration;
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error setting workout duration");
            return 0;
        } finally {
            setLoading(false);
        }
    }

    async function fetchExercises(){
        try{
            setLoading(true);
            setError(null);

            if (currentWorkout && workoutActive){
                const fetchedExercises = await exerciseService.getExercisesByWorkoutID(currentWorkout.WorkoutID);
                //console.log("Fetched Exercises: ", JSON.stringify(fetchedExercises));
                if (fetchedExercises != null){
                    setExercises(fetchedExercises);
                }
            }
        } catch (err){
            setError(err instanceof Error ? err.message : "Error fetching exercises. Please try again");
        } finally {
            setLoading(false);
        }  
    }

    async function handleUpdateWorkoutName(){
        if (!workoutName.trim()){
            setWorkoutName("New Workout");
            setEditingName(false);
            return;
        }

        try{
            setLoading(true);
            setError(null);

            if (currentWorkout){
                const updatedWorkout = {...currentWorkout, WorkoutName: workoutName};
    
                const returnedUpdatedWorkout = await workoutService.updateWorkout(updatedWorkout);

                if (!returnedUpdatedWorkout){
                    throw new Error("Error updating workout name");
                }

                setCurrentWorkout(returnedUpdatedWorkout);
                setEditingName(false);
            }
        } catch (err){
            setError(err instanceof Error ? err.message : "Error updating workout name");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (currentWorkout && currentWorkout.Exercises){
            setExercises(currentWorkout.Exercises);
        } else{
            setExercises([]);
        }
    }, [currentWorkout])

 

    return (
        <div className="mx-auto px-4 py-6 min-h-screen bg-gray-900 text-white relative">
            {loading && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-300"></div>
                </div>
            )}
          
            {error && (
                <div className="absolute top-4 right-4 left-4 bg-red-900 bg-opacity-90 text-white p-4 rounded-lg text-sm border border-red-700 shadow-lg z-50">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-300" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                </div>
            )}

            <h1 className="text-3xl font-bold text-teal-300 mb-6 text-center">My Workout</h1>
            
            {!workoutActive || !currentWorkout ? (
                <div className="flex flex-col items-center justify-center space-y-6 mt-12">
                    <div className="text-center mb-6">
                        <div className="text-gray-400 mb-4">Ready to start your workout?</div>
                        <div className="mb-6">
                            <input
                                type="text"
                                value={workoutName}
                                onChange={(e) => setWorkoutName(e.target.value)}
                                placeholder="Workout Name"
                                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white w-full max-w-md mb-4 focus:outline-none focus:ring-2 focus:ring-teal-300"
                            />
                        </div>
                    </div>
                    <button 
                        type="button"
                        className="w-full max-w-md py-4 text-lg font-bold text-gray-900 transition-all rounded-lg bg-teal-300 hover:bg-teal-400 active:bg-teal-500 active:scale-95 hover:shadow-md focus:ring-2 focus:ring-teal-200 focus:outline-none disabled:bg-opacity-50 disabled:cursor-not-allowed"
                        onClick={handleStartWorkout}
                        disabled={loading}
                    >
                        Start Workout
                    </button>
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    <div className="bg-gray-800 rounded-xl p-4 shadow-lg mb-6">
                        <WorkoutTimerComponent/>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-4 shadow-lg mb-6">
                        {editingName ? (
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    value={workoutName}
                                    onChange={(e) => setWorkoutName(e.target.value)}
                                    className="bg-gray-700 bg-opacity-50 rounded-lg px-3 py-2 text-white text-xl font-bold border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 w-full"
                                    autoFocus
                                    onBlur={handleUpdateWorkoutName}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateWorkoutName()}
                                />
                            </div>
                        ) : (
                            <h2 
                                className="text-yellow-400 text-xl font-bold cursor-pointer hover:text-yellow-300 transition-colors duration-200 flex items-center"
                                onClick={() => setEditingName(true)}
                            >
                                {workoutName}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </h2>
                        )}
                    </div>

                    {/* Main content area with flex grow to fill available space */}
                    <div className="flex-grow">
                        {/* Exercise grid with specified layout */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {exercises && exercises.length > 0 ? (
                                <>
                                    {exercises.map((exercise, idx) => (
                                        <WorkoutExerciseCardComponent exercise={exercise} key={idx}/>
                                    ))}
                                    {/* Add Exercise always as the last grid item */}
                                    <div className="h-full">
                                        <AddExerciseComponent />
                                    </div>
                                </>
                            ) : (
                                <div className="h-full">
                                    <AddExerciseComponent />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom row with stats and finish workout button */}
                    <div className="flex flex-col md:flex-row justify-between items-end mt-auto pt-6 gap-4">
                        {/* Stats section taking up 1/4 to 1/3 of the width */}
                        <div className="w-full md:w-2/3">
                            {currentWorkout && <WorkoutStats workout={currentWorkout}/>}
                        </div>

                        {/* End workout button aligned with the bottom of stats */}
                        <div className="w-full md:w-1/3 self-end">
                            <button
                                type="button"
                                className="w-full py-3 text-base font-bold text-white transition-all rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 active:scale-95 hover:shadow-md focus:ring-2 focus:ring-red-500 focus:outline-none disabled:bg-opacity-50 disabled:cursor-not-allowed"
                                onClick={handleEndWorkout}
                                disabled={loading}
                            >
                                Finish Workout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {finishedWorkout && showWorkoutSummary && (
                <WorkoutSummary 
                    workout={finishedWorkout} 
                    isOpen={showWorkoutSummary} 
                    onClose={() => setShowWorkoutSummary(false)}
                />
            )}
        </div>
    );
}
export default WorkoutView;