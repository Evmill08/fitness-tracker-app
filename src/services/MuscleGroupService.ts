import {  MuscleGroup } from "@/interfaces/interfaces";

export const muscleGroupService = {
    async addMuscleGroup(muscleGroupName: string){
        const response = await fetch(`https://localhost:7019/api/MuscleGroup/AddMuscleGroup?muscleGroupName=${muscleGroupName}`, {
            method: "POST",
            headers: {
                'accept' : 'text/plain'
            }
        });

        if (!response.ok){
            throw new Error("Error adding muscle group or muscle group already exists");
        }

        const muscleGroup = await response.json() as MuscleGroup;

        return muscleGroup;
    },

    async addMuscleGroupToExercise(muscleGroupID: number, ExerciseID: number) {
        const mgData = {
            muscleGroupID: muscleGroupID,
            ExerciseID: ExerciseID
        }

        //console.log("mgData being added: ", JSON.stringify(mgData));

        const response = await fetch(`https://localhost:7019/api/MuscleGroup/AddMuscleGroupToExercise`, 
            {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                'accept' : 'text/plain'
            },
                body: JSON.stringify(mgData)
            }
        );
        
        if (!response.ok) {
            throw new Error(`Error adding muscle group to exercise: ${response.status}`);
        }
        
        const muscleGroup = await response.json() as MuscleGroup;
        //console.log("Muscle Group added in muscle group service: ", JSON.stringify(muscleGroup));
        return muscleGroup;
    },

    async removeMuscleGroupFromExercise(muscleGroupID: number, exerciseID: number){
        const response = await fetch(`https://localhost:7019/api/MuscleGroup/RemoveMuscleGroupFromExercise?muscleGroupID=${muscleGroupID}&exerciseID=${exerciseID}`);

        if (!response.ok){
            throw new Error("Error removing muscle group from exercise");
        }

        return true;
    },

    async getMuscleGroupFromExerciseByName(muscleGroupName: string, exerciseID: number){
        const response = await fetch(`https://localhost:7019/api/MuscleGroup/GetMuscleGroupsByExerciseID?exerciseID=${exerciseID}`);

        if (!response.ok){
            throw new Error("Error fetching muscle groups for exercise");
        }

        const muscleGroups = await response.json() as MuscleGroup[];
        //console.log("Muscle groups returned: ", JSON.stringify(muscleGroups));

        for (var muscleGroup of muscleGroups){
            if (muscleGroup.MuscleGroupName == muscleGroupName){
                return muscleGroup;
            } 
        }
    },

    async getMuscleGroupFromExercise(exerciseID: number){
        const response = await fetch(`https://localhost:7019/api/MuscleGroup/GetMuscleGroupsByExerciseID?exerciseID=${exerciseID}`);

        if (!response.ok){
            throw new Error("Error fetching muscle groups");
        }

        const muscleGroups = await response.json() as MuscleGroup[];

        return muscleGroups;
    },

    async getMuscleGroupByName(muscleGroupName: string) {
        try {
            const response = await fetch("https://localhost:7019/api/MuscleGroup/GetAllMuscleGroups");
            
            if (!response.ok) {
                throw new Error("Error fetching muscle groups");
            }
            
            const muscleGroups = await response.json() as MuscleGroup[];
            //console.log("Muscle groups:", muscleGroups);
            
            // Find existing muscle group
            const existingGroup = muscleGroups.find(group => 
                group.MuscleGroupName.toLowerCase() === muscleGroupName.toLowerCase()
            );
            
            if (existingGroup) {
                return existingGroup as MuscleGroup;
            }
            
            // If not found, add a new one
            const newMG = await this.addMuscleGroup(muscleGroupName);
            console.log(newMG);
        } catch (error) {
            console.error("Error in getMuscleGroupByName:", error);
            throw error;
        }
    },

    async getMuscleGroupMap(): Promise<Map<string, MuscleGroup[]>> {
        const response = await fetch("https://localhost:7019/api/MuscleGroup/GetAllMuscleGroups");
            
        if (!response.ok) {
            throw new Error("Error fetching muscle groups");
        }
        
        const muscleGroups = await response.json() as MuscleGroup[];

        let MuscleGroupMap = new Map<string, MuscleGroup[]>();

        let upperGroup = ["Traps", "Upper Chest", "Lower Chest", "Chest", "Upper Back", "Lower Back", "Rhomboids", "Lats" ];
        let armGroup = ["Biceps", "Triceps", "Side Delt", "Rear Delt", "Front Delt", "Forearms", "Shoulders"];
        let coreGroup = ["Upper Abdominals", "Lower Abdominals", "Obliques", "Transverse Abdominus", "Abdominals"];
        let lowerGroup = ["Hamstrings", "Glutes", "Quads", "Calves"];

        let upperMapGroup = new Array<MuscleGroup>();
        let armMapGroup = new Array<MuscleGroup>();
        let coreMapGroup = new Array<MuscleGroup>();
        let lowerMapGroup = new Array<MuscleGroup>();

        for (var mg of muscleGroups){
            if (upperGroup.find(gName => gName == mg.MuscleGroupName)){
                upperMapGroup.push(mg);
            } else if (armGroup.find(gName => gName == mg.MuscleGroupName)){
                armMapGroup.push(mg);
            } else if (coreGroup.find(gName => gName == mg.MuscleGroupName)){
                coreMapGroup.push(mg);
            } else {
                lowerMapGroup.push(mg);
            }
        }

        MuscleGroupMap.set("Upper", upperMapGroup);
        MuscleGroupMap.set("Arms", armMapGroup);
        MuscleGroupMap.set("Core", coreMapGroup);
        MuscleGroupMap.set("Lower", lowerMapGroup);
        
        return MuscleGroupMap;
    }
}