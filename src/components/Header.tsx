import React from "react";
import { Link } from "react-router-dom";

function HeaderComponent() {
    const navLinks = [
        "Home",
        "Workout",
        "Profile",
        "Stats",
        "Exercises"
    ];

    // TODO: Fix header to make it more Appealing
    return (
        <div className="header-container bg-gray-800 p-4 sticky top-0 z-10">
            <h1 className="text-white text-3xl font-bold text-center mb-3">Fitness Tracker</h1>
            <ul className="list-none p-0 m-0 flex justify-center gap-4 w-full text-xl">
                {navLinks.map((link, index) => (
                    <li key={index} className="flex-1 flex justify-center">
                        <Link 
                            to={`/${link.toLowerCase()}`} 
                            className="nav-link inline-block no-underline text-white px-4 py-2 hover:text-teal-300 transition hover:shadow-md rounded-lg hover:bg-slate-700"
                        >
                            {link}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
} 

export default HeaderComponent;