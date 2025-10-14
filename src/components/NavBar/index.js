import React, { useState } from "react";
import logo from "../../assets/logo2.png";
import "./index.css";
import { Link } from "react-router-dom";

import LogOut from "../LogOutButton";

export default function NavBar() {
	return (
		<div className="navbar">
			<div>
				<img src={logo} alt="Logo" />
			</div>

			<div className="transactions">
				<Link to="/receitas">Receitas</Link>
				<Link to="/despesas">Despesas</Link>
			</div>

			<div className="logout-button">
				<LogOut />
			</div>
		</div>
	);
}
