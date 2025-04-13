import { Exercise, Workout } from "@/interfaces/interfaces";
import { workoutService } from "@/services/WorkoutService";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";



function ExerciseCardComponent ({exercise} : {exercise : Exercise}) {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [hasActiveWorkout, setHasActiveWorkout] = useState<boolean>(false);
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [deleted, setDeleted] = useState<boolean>(false);
    const navigate = useNavigate();

    //console.log("Exercise card exercise: ", JSON.stringify(exercise));
    

    async function fetchCurrentWorkout(){
        try{
          const currentUser = localStorage.getItem("currentUser");
          const storedWorkout = localStorage.getItem("currentWorkout");
          const storedWorkoutTimestamp = localStorage.getItem('currentWorkoutTimestamp');
          const now = Date.now();
          if (storedWorkout){
              const parsedWorkout = JSON.parse(storedWorkout) as Workout;
              if (currentUser != null){
                const parsedUser = JSON.parse(currentUser);

                if (parsedWorkout && (now - Number(storedWorkoutTimestamp) < 5*60*1000) && parsedUser.UserID == parsedWorkout.UserID){
                  setWorkout(parsedWorkout);
                  setHasActiveWorkout(true);
                }
              }
          } 
        } catch (err){
            setError(err instanceof Error ? err.message : "Error fetching user. Please try again");
        } finally {
            setLoading(false);
        }
    }

    async function handleAddToWorkout(){
        try{
            setLoading(true);
            setError(null);

            if (workout && hasActiveWorkout){
                const addedExercise = await workoutService.addExerciseToWorkout(exercise.ExerciseName, exercise.ExerciseType, exercise.MuscleGroups, [], 0, workout?.WorkoutID);

                const updatedWorkout = await workoutService.fetchWorkoutByID(addedExercise.WorkoutID);
                setWorkout(updatedWorkout);
                navigate('/workout');
            } else {
                throw new Error("Must have a workout active to add exercise");
            }
        } catch (err){
            setError(err instanceof Error ? err.message : "Error fetching user. Please try again");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCurrentWorkout();
    }, [])

    async function handleRemoveExerciseCard(){
      try{
        setLoading(true);
        setError(null);

        const storedDeletedExercises = localStorage.getItem("deletedExerciseCards");
        let parsedDeletedExercises = [];

        if (storedDeletedExercises){
          parsedDeletedExercises = JSON.parse(storedDeletedExercises);
        }

        const updatedDeletedCards = [...parsedDeletedExercises, exercise.ExerciseID];
        localStorage.setItem("deletedExerciseCards", JSON.stringify(updatedDeletedCards));
        setDeleted(true);
      } catch (err){
        setError(err instanceof Error ? err.message : "Error removing exercise card. Please try again");
    } finally {
        setLoading(false);
    }
  }


  if (!deleted){
    return (
      <div className="bg-opacity-95 rounded-xl p-5 h-full flex flex-col shadow-lg hover:shadow-xl transition-all duration-300" style={{ backgroundColor: 'rgba(18, 41, 43, 0.95)', minHeight: '280px' }}>
        {loading && <p className="text-white text-center">Loading...</p>}
        {error && <p className="text-red-400 text-center">{error}</p>}
    
        <div className="flex-1 relative">

          <button 
            className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 active:scale-95 focus:outline-none"
            type="button"
            onClick={handleRemoveExerciseCard}
            disabled={loading}
            aria-label="Delete exercise card"
          >
            <span className="font-bold">×</span>
          </button>

          <h1 className="text-yellow-400 text-xl font-bold mb-3">{exercise.ExerciseName}</h1>
          
          <div className="text-white mb-6">
            <div className="mb-4">
              <p className="text-teal-300 text-xl font-medium mb-1">Exercise Type:</p>
              <p className="text-white text-base">{exercise.ExerciseType}</p>
            </div>
            
            <div className="muscle-groups">
              <p className="text-teal-300 text-xl font-medium mb-2">Muscle Groups:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {exercise.MuscleGroups.map((muscleGroup, idx) => (
                  <span key={idx} className="text-white text-sm bg-white bg-opacity-15 px-3 py-1 rounded-full">
                    {muscleGroup.MuscleGroupName}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {hasActiveWorkout && (
          <button 
            type="button"
            className="w-full py-3 text-base font-bold text-gray-900 transition-all rounded-lg bg-teal-300 hover:bg-teal-400 active:bg-teal-500 active:scale-95 hover:shadow-md focus:ring-2 focus:ring-teal-200 focus:outline-none disabled:bg-opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddToWorkout}
            disabled={loading}
          >
            Add To Workout
          </button>
        )}
      </div>
    );

  }

    
}

export default ExerciseCardComponent;