import {User, Workout} from "../interfaces/interfaces"

export const userService = {

    async createUser(Username: string, Password: string, Email: string, Weight=0, Height=0){
        const userData = {
            UserID: 0,
            Username, 
            Password, 
            Email, 
            Weight,
            Height
        }
        const response = await fetch("https://localhost:7019/api/User/AddUser", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept' : 'text/plain'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok){
            throw new Error("Error Adding User");
        }

        const now = Date.now();
        const user = await response.json() as User;

        // Cache the user data
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('currentUserTimestamp', now.toString());

        //console.log("User: ", JSON.stringify(user));
        return user;
    },

    async getUserFromSignIn(Username: string, Password: string): Promise<User> {
        const response = await fetch(`https://localhost:7019/api/User/ValidateUserLogin?username=${Username}&password=${Password}`);
        if (!response.ok){
            throw new Error("Error logging in user");
        }

        const now = Date.now();
        const user = await response.json() as User;

        if ("ErrorMessage" in user){
            throw new Error("Incorrect user credentials: ");
        }
        //console.log("User after sign in: ", JSON.stringify(user));

        // Cache the user data
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('currentUserTimestamp', now.toString());

        return user;
    },


    async getCurrentUser(UserID: number): Promise<User> {
        const cachedUser = localStorage.getItem('currentUser');
        const cachedTimestamp = localStorage.getItem('currentUserTimestamp');
        const now = Date.now();

        if (cachedUser && cachedTimestamp && (now - Number(cachedTimestamp) < 5*60*1000)){
            return JSON.parse(cachedUser) as User;  // Need to cast this to User
        }

        // Your getCurrentUser method is incomplete - you need to complete it like this:
        const response = await fetch(`https://localhost:7019/api/User/GetUserByID?userID=${UserID}`);
        if (!response.ok) {
            throw new Error("Error fetching current user");
        }
        
        const user = await response.json() as User;
        
        // Cache the user data
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('currentUserTimestamp', now.toString());
        
        return user;
    },

    async getUserWorkouts(UserID: number){
        const response = await fetch(`https://localhost:7019/api/Workout/GetUserWorkouts?userID=${UserID}`);

        if (!response.ok){
            throw new Error("Error fetching user workouts");
        }

        const workouts = await response.json() as Workout[];
        return workouts;
    },

    async getMonthlyUserWorkouts(UserID: number) {
        const workouts = await this.getUserWorkouts(UserID);
        //console.log("Workouts for the month in the service ", JSON.stringify(workouts));
        
        const currentMonth = new Date().getMonth();
        //console.log("Current month", currentMonth);
        
        const updatedWorkouts = workouts.filter(workout => {
            const workoutMonth = new Date(workout.Date).getMonth();
            return workoutMonth === currentMonth;
        });
        
        //console.log("Updated workouts after filtering by month", JSON.stringify(updatedWorkouts));
        return updatedWorkouts;
    },

    async getUserFromStorage() {
        const userJSON = localStorage.getItem('currentUser');
        if (userJSON){
            return JSON.parse(userJSON) as User;
        } else {
            throw new Error("Error fetching cached User");
        }
    },

    async updateUser(user: User) {
        // Fetch current user
        const userResponse = await fetch(`https://localhost:7019/api/User/GetUserByID?userID=${user.UserID}`);
        
        if (!userResponse.ok) {
            throw new Error("Error fetching user");
        }
        
        const userObj = await userResponse.json() as User;
        console.log("User Response: ", JSON.stringify(userObj));
    
        console.log("Available user properties:", Object.keys(userObj));

        console.log("User: ", JSON.stringify(user));

        console.log("User Password: ", JSON.stringify(userObj.Password));
        console.log("Password input: ", user.Password);
            
        const userData = {
            userID: user.UserID,
            username: user.Username, 
            password: user.Password,
            email: user.Email,
            weight: user.Weight,
            height: user.Height,
            workoutHistory: user.WorkoutHistory || [],
            personalBests: user.PersonalBests || []
        };
        
        console.log("user data: ", JSON.stringify(userData));
        
        // Send update request
        const response = await fetch("https://localhost:7019/api/User/UpdateUser", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'text/plain'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error updating user:", errorText);
            throw new Error(`Error updating user: ${response.status} ${errorText}`);
        }
        
        const updatedUser = await response.json() as User;
    
        console.log("Updated User: ", JSON.stringify(updatedUser));
        
        // After successful update, update local storage
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        
        return updatedUser;
    }
}