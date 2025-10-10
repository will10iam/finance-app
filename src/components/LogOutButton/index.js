import React, { useContext } from "react";
import { AuthContext } from "../../contexts/auth";
import { AiOutlinePoweroff } from "react-icons/ai";
import { Link } from "react-router-dom";
import "./index.css";

export default function LogOutButton() {
	const { logout } = useContext(AuthContext);

	async function handleLogOut() {
		await logout();
	}

	return (
		<div className="logout-button">
			<Link to="/">
				<button onClick={handleLogOut}>
					<AiOutlinePoweroff color="#FFF" size={24} />
				</button>
			</Link>
		</div>
	);
}
