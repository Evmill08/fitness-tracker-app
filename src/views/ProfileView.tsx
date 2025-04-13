import UserInfoComponent from "@/components/ProfileViewComponents/UserInfoComponent";
import WorkoutHistoryComponent from "@/components/ProfileViewComponents/WorkoutHistoryComponent";
import React from "react";
import { useNavigate, Link } from "react-router-dom";


function ProfileView() {
    const navigate = useNavigate();
    const bgColor = "rgba(18, 41, 43, .95)"

    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-8 bg-gray-900 text-white">
        <Link to="/">
            <div className={`w-auto inline-block rounded-xl transition-all duration-300 hover:bg-opacity-20 hover:bg-slate-400 px-6 py-3 active:translate-y-1 active:shadow-inner bg-${bgColor}`}>
                <h1 className="text-white text-lg font-medium m-0">Log Out</h1>
            </div>
        </Link>
        <UserInfoComponent />
        <WorkoutHistoryComponent />
      </div>
    );
  }

export default ProfileView;