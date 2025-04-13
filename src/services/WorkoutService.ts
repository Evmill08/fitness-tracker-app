import { Exercise, Workout, User, ExSet, MuscleGroup } from "@/interfaces/interfaces";

export const workoutService = {
    async createWorkout(workoutName: string, date: Date, exercises: Exercise[]){

        const currentUserJSON = localStorage.getItem('currentUser');
        var currentUser = null;
        if (currentUserJSON){
            currentUser = JSON.parse(currentUserJSON) as User;
        }
        
        const currentUserID = currentUser?.UserID;

        const workoutData = {
            workoutID: 0,
            workoutName,
            duration: 0,
            date,
            exercises,
            userID: currentUserID
        }

        const response = await fetch("https://localhost:7019/api/Workout/AddWorkout", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept' : 'text/plain'
            },
            body: JSON.stringify(workoutData)
        });

        if (!response.ok){
            throw new Error("Error adding workout");
        }

        const now = Date.now();
        const workout = await response.json() as Workout;
        //console.log("WorkoutID: ", workout.WorkoutID);

        localStorage.setItem('currentWorkout', JSON.stringify(workout));
        localStorage.setItem('currentWorkoutTimestamp', now.toString());

        return workout;
    },

    async addExerciseToWorkout(exerciseName: string, exerciseType: string, muscleGroups: MuscleGroup[], sets: ExSet[], restTime: number, workoutID: number){
        const exerciseData = {
            exerciseID: 0,
            exerciseName,
            exerciseType,
            muscleGroups,
            sets,
            restTime: 0,
            workoutID
        }

        const response = await fetch("https://localhost:7019/api/Exercise/AddExercise", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept' : 'text/plain'
            },
            body: JSON.stringify(exerciseData)
        });

        if (!response.ok){
            throw new Error("Error adding exercise");
        }

        const exercise = await response.json() as Exercise;

        const workoutResponse = await fetch(`https://localhost:7019/api/Workout/GetWorkoutByID?workoutID=${workoutID}`);
        if (!workoutResponse.ok){
            throw new Error("Error fetching workout by ID");
        }

        const workout = await workoutResponse.json() as Workout;
        const now = Date.now();
        localStorage.setItem('currentWorkout', JSON.stringify(workout));
        localStorage.setItem('currentWorkoutTimestamp', now.toString());
        return exercise;
    },

    async fetchWorkoutByID(workoutID: number){
        const response = await fetch(`https://localhost:7019/api/Workout/GetWorkoutByID?workoutID=${workoutID}`);

        if (!response.ok){
            throw new Error("Error fetching workout");
        }

        const workout = await response.json() as Workout;
        const now = Date.now();
        localStorage.setItem('currentWorkout', JSON.stringify(workout));
        localStorage.setItem('currentWorkoutTimestamp', now.toString());
        return workout;
    },

    async updateWorkout(workout: Workout){

        const user = localStorage.getItem('currentUser');
        let parsedUser;
        if (user){
            parsedUser = JSON.parse(user) as User;
        }

        const workoutData = {
            workoutID: workout.WorkoutID,
            workoutName: workout.WorkoutName,
            duration: workout.Duration,
            date: workout.Date,
            exercises: workout.Exercises,
            userID: parsedUser?.UserID
        }

        //console.log("Update workout data: ", JSON.stringify(workoutData));

        const response = await fetch("https://localhost:7019/api/Workout/UpdateWorkout", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept' : 'text/plain'
            },
            body: JSON.stringify(workoutData),
        });

        //console.log("Response from update workout: ", JSON.stringify(response));

        if (!response.ok){
            throw new Error("Error updating workout");
        }

        const updatedWorkout = await response.json() as Workout;
        const now = Date.now();
        localStorage.setItem('currentWorkout', JSON.stringify(workout));
        localStorage.setItem('currentWorkoutTimestamp', now.toString());
        return updatedWorkout;
    },

    async sortWorkoutsByDate(workouts: Workout[]){
        return workouts.sort((a, b) => {
            return new Date(b.Date).getTime() -  new Date(a.Date).getTime();
        });
    }
}