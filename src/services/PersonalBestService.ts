import { PersonalBest} from "@/interfaces/interfaces";
import { edgeServerAppPaths } from "next/dist/build/webpack/plugins/pages-manifest-plugin";

export const personalBestService = {
    async addPersonalBest(ExerciseID: number, ExerciseName: string, Weight: number, Reps: number, DateSet: Date, UserID: number){
        try {
            // First check if this personal best already exists to avoid duplicate key errors
            try {
                const checkResponse = await fetch(`https://localhost:7019/api/PersonalBest/GetPersonalBestByExerciseID?exerciseID=${ExerciseID}`);
                
                if (checkResponse.ok) {
                    const existingPB = await checkResponse.json();
                    
                    // If we got a valid PB back (not an error object), update it instead of adding
                    if (existingPB && !existingPB.ErrorMessage && existingPB.ExerciseID) {
                        console.log("PB already exists with this ExerciseID, updating instead");
                        const pbToUpdate = {
                            ExerciseID: ExerciseID,
                            ExerciseName: ExerciseName,
                            Weight: Weight,
                            Reps: Reps,
                            DateSet: DateSet,
                            UserID: UserID
                        };
                        return await this.updatePersonalBest(pbToUpdate);
                    }
                }
            } catch (checkError) {
                // If checking fails, we'll still try to add (might be that the endpoint doesn't exist)
                console.log("Failed to check for existing PB:", checkError);
            }
            
            const pbData = {
                exerciseID: ExerciseID,
                exerciseName: ExerciseName,
                weight: Weight,
                reps: Reps,
                dateSet: DateSet,
                userID: UserID
            };
    
            console.log("Adding new PB with weight:", pbData.weight);
    
            const response = await fetch("https://localhost:7019/api/PersonalBest/AddPersonalBest", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'text/plain'
                },
                body: JSON.stringify(pbData)
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                
                // If we get a duplicate key error, try updating instead
                if (errorText.includes("duplicate key") || errorText.includes("PRIMARY KEY constraint")) {
                    console.log("Got duplicate key error, trying to update instead");
                    const pbToUpdate = {
                        ExerciseID: ExerciseID,
                        ExerciseName: ExerciseName,
                        Weight: Weight,
                        Reps: Reps,
                        DateSet: DateSet,
                        UserID: UserID
                    };
                    return await this.updatePersonalBest(pbToUpdate);
                }
                
                throw new Error(`Error adding Personal Best: ${errorText}`);
            }
    
            const pb = await response.json();
            
            // Check if response is an error object
            if (pb.StatusCode === 500 || pb.ErrorMessage) {
                // If it's a duplicate key error, try updating instead
                if (pb.ErrorMessage && pb.ErrorMessage.includes("duplicate key")) {
                    console.log("Got duplicate key error in response, trying to update instead");
                    const pbToUpdate = {
                        ExerciseID: ExerciseID,
                        ExerciseName: ExerciseName,
                        Weight: Weight,
                        Reps: Reps,
                        DateSet: DateSet,
                        UserID: UserID
                    };
                    return await this.updatePersonalBest(pbToUpdate);
                }
                
                throw new Error(pb.ErrorMessage || "Unknown error");
            }
            
            console.log("PB successfully added:", JSON.stringify(pb));
            return pb;
        } catch (error) {
            console.error("Error in addPersonalBest:", error);
            throw error;
        }
    },

    async removePersonalBest(exerciseID: number){
        const response = await fetch(`https://localhost:7019/api/PersonalBest/DeletePersonalBest?exerciseID=${exerciseID}`);

        if (!response.ok){
            throw new Error("Error removing personal best");
        }

        return true;
    },

    async checkPersonalBest(userID: number, checkPB: PersonalBest){
        try {
            const response = await fetch(`https://localhost:7019/api/PersonalBest/GetExercisePB?exerciseName=${encodeURIComponent(checkPB.ExerciseName)}&userID=${userID}`);

            if (!response.ok){
                const errorText = await response.text();
                console.log(`Error response from GetExercicePB: ${errorText}`);

                throw new Error ("Error fetching personal best");
            }

            const data = await response.json();

            if (data.StatusCode == 404){
                console.log("No Existing PB found, adding new one");
                return await this.addPersonalBest(
                    checkPB.ExerciseID,
                    checkPB.ExerciseName,
                    checkPB.Weight,
                    checkPB.Reps,
                    checkPB.DateSet, 
                    checkPB.UserID
                );
            }

            if (data.StatusCode == 500){
                console.log("API returned error object");

                if (data.ErrorMessage && data.ErrorMessage.includes("Not Found")){
                    console.log("No Personal best found for this exercise, adding one");
                    return await this.addPersonalBest(
                        checkPB.ExerciseID,
                        checkPB.ExerciseName,
                        checkPB.Weight,
                        checkPB.Reps,
                        checkPB.DateSet, 
                        checkPB.UserID
                    );
                }

                throw new Error(data.ErrorMessage || "Unknown Error");
            }

            const pb = data as PersonalBest;
            console.log("Found Existing PB: ", JSON.stringify(pb));

            if (checkPB.Weight > pb.Weight || (checkPB.Weight == pb.Weight && checkPB.Reps >= pb.Reps)){
                console.log("New PB is better than existing one, updating");
                const updatedPB = await this.updatePersonalBest(checkPB);
                return updatedPB;
            }
            return pb;

        } catch (error) {
            console.error("Error in checkPersonalBest:", error);
            throw error;
        }
    },

    async updatePersonalBest(personalBest: PersonalBest){
        const pbData = {
            exerciseID: personalBest.ExerciseID,
            exerciseName: personalBest.ExerciseName,
            weight: personalBest.Weight,
            reps: personalBest.Reps,
            dateSet: personalBest.DateSet,
            userID: personalBest.UserID
        }

        const response = await fetch("https://localhost:7019/api/PersonalBest/UpdatePersonalBest", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept' : 'text/plain'
            },
            body: JSON.stringify(pbData)
        });

        if (!response.ok){
            throw new Error("Error updating personal best");
        }

        const pb = await response.json() as PersonalBest;
        return pb;
    },

    async getUserPersonalBests(userID: number){
        const response = await fetch(`https://localhost:7019/api/PersonalBest/GetUserPBs?userID=${userID}`);

        if (!response.ok){
            throw new Error("Error fetching user personal bests");
        }

        const personalBests = await response.json() as PersonalBest[];

        return personalBests;
    },

    async sortPersonalBestsByDate(personalBests: PersonalBest[]){
        return personalBests.sort((a, b) => {
            return new Date(b.DateSet).getTime() -  new Date(a.DateSet).getTime();
        });
    }
}