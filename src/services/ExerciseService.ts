import { Exercise} from "@/interfaces/interfaces";

export const exerciseService = {
    async getExerciseCards(userID: number): Promise<Exercise[]>{
        const response = await fetch(`https://localhost:7019/api/Exercise/GetUserExerciseCards?userID=${userID}`);

        if (!response.ok){
            throw new Error("Error fetching user exercise cards");
        }

        const exercises = await response.json() as Exercise[];

        const deletedExerciseIDsString = localStorage.getItem("deletedExerciseCards");
        let deletedExerciseIDs: number[] = [];

        if (deletedExerciseIDsString){
            try{
                deletedExerciseIDs = JSON.parse(deletedExerciseIDsString);
            } catch (err){
                console.error("Error parsing deleted excercise IDs: ", err);
                localStorage.setItem("deletedExerciseCards", JSON.stringify([]));
            }
        } else {
            localStorage.setItem("deletedExerciseCards", JSON.stringify([]));
        }

        //console.log("Deleted Exercise IDs: ", JSON.stringify(deletedExerciseIDs));
        //console.log("Exercises in exercise service before filter: ", JSON.stringify(exercises));
        
        const filteredExercises = exercises.filter(exercise => 
            !deletedExerciseIDs.includes(exercise.ExerciseID)
        );
        

        //console.log("Exercises in exercise service after filter: ", JSON.stringify(filteredExercises));

        return filteredExercises;
    },

    async getTotalExerciseWeight(exerciseID: number){
        const response = await fetch(`https://localhost:7019/api/Exercise/GetExerciseByID?exerciseID=${exerciseID}`);

        if (!response.ok){
            throw new Error("Error fetching exercise from db");
        }

        const exercise = await response.json() as Exercise;
        let excerciseTotalWeight = 0;
        exercise.Sets.forEach(set => {
            excerciseTotalWeight += set.Reps * set.Weight;
        });

        return excerciseTotalWeight;
    },

    async getExercisesByWorkoutID(workoutID: number){
        const response = await fetch(`https://localhost:7019/api/Exercise/GetExercisesByWorkout?workoutID=${workoutID}`);

        if (!response.ok){
            throw new Error("Error fetching exercises by workout");
        }

        const exercises = await response.json() as Exercise[];
        return exercises;
    },

    async removeExerciseFromWorkout(exerciseID: number){
        const response = await fetch(`https://localhost:7019/api/Exercise/DeleteExercise?exerciseID=${exerciseID}`,{
            method: "POST",
            headers: {
                'accept': 'text/plain'
            }
        });

        if (!response.ok){
            throw new Error("Error deleting exercise");
        }

        return true;
    },

    async updateExercise(exercise: Exercise){
        const exerciseData = {
            ExerciseID: exercise.ExerciseID,
            ExerciseName: exercise.ExerciseName,
            ExerciseType: exercise.ExerciseType,
            MuscleGroups: exercise.MuscleGroups,
            Sets: exercise.Sets,
            RestTime: exercise.RestTime,
            WorkoutID: exercise.WorkoutID
        }

        const response = await fetch("https://localhost:7019/api/Exercise/UpdateExercise", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept' : 'text/plain'
            },
            body: JSON.stringify(exerciseData)
        })

        if (!response.ok){
            throw new Error("Error updating exercise");
        }

        const updatedExercise = await response.json() as Exercise;
        return updatedExercise;

    },

    async checkExerciseExists(exerciseID: number){
        const response = await fetch(`https://localhost:7019/api/Exercise/GetExerciseByID?exerciseID=${exerciseID}`);

        if (!response.ok){
            throw new Error("Exercise not found");
        }

        const exercise = await response.json() as Exercise;

        return exercise;
    },

    async getExerciseByID(exerciseID: number){
        const response = await fetch(`https://localhost:7019/api/Exercise/GetExerciseByID?exerciseID=${exerciseID}`);

        if (!response.ok){
            throw new Error("Exercise not found");
        }

        const exercise = await response.json() as Exercise;

        return exercise;
    }


    
}