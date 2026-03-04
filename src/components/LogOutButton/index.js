import { useContext } from "react";
import { AuthContext } from "../../contexts/auth";
import { useNavigate } from "react-router-dom";
import "./index.css";

export default function LogOutButton() {
	const { logout } = useContext(AuthContext);
	const navigate = useNavigate();

	async function handleLogOut() {
		try {
			await logout();
			navigate("/"); // redireciona após logout
		} catch (error) {
			console.error("Erro ao deslogar:", error);
		}
	}

	return (
		<button type="button" className="logout-btn" onClick={handleLogOut}>
			Deslogar
		</button>
	);
}
