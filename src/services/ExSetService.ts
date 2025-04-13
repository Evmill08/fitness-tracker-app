import { ExSet } from "@/interfaces/interfaces";

export const exSetService = {
    async addExSetToExericse(Weight: number, Reps: number, RPE: number, exericseID: number): Promise<ExSet> {
        const ExSetData = {
            exSetID: 0, 
            weight: Weight, 
            reps: Reps, 
            dateStarted: new Date().toISOString(), 
            rpe: RPE, 
            exerciseID: exericseID
        }

        const response = await fetch(`https://localhost:7019/api/Set/AddSetToExercise?exerciseID=${exericseID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept' : 'text/plain'
            },
            body: JSON.stringify(ExSetData)
        });

        if (!response.ok){
            throw new Error("Error adding set to exercise");
        }

        const ExSet = await response.json() as ExSet;
        console.log("Added set: ", JSON.stringify(ExSet));

        return ExSet;
    },

    async removeExSetFromExercise(exSetID: number, exerciseID: number){
        const response = await fetch(`https://localhost:7019/api/Set/DeleteSetFromExercise?ExSetID=${exSetID}&ExerciseID=${exerciseID}`, {
            method: "POST",
            headers: {
                'accept': 'text/plain'
            }
        });

        if (!response.ok){
            throw new Error("Error removing set from exercise");
        }

        return true;
    },

    async updateExSet(exSet: ExSet){
        const ExSetData = {
            ExSetID: exSet.ExSetID,
            Weight: exSet.Weight,
            Reps: exSet.Reps,
            DateStarted: exSet.DateStarted,
            RPE: exSet.RPE,
            ExerciseID: exSet.ExerciseID,
        }

        const response = await fetch("https://localhost:7019/api/Set/UpdateSet", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept' : 'text/plain'
            },
            body: JSON.stringify(ExSetData) 
        })

        if (!response.ok){
            throw new Error("Error updating set");
        }

        const set = await response.json() as ExSet;
        return set;
    }
}