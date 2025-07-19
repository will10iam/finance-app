import { useState, useContext } from "react";
import logo2 from "../../assets/logo2.png";
import "../SignIn/signin.css";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/auth";

export default function SignUp() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const { signUp, loadingAuth } = useContext(AuthContext);

	async function handleSubmit(e) {
		e.preventDefault();

		if (name !== "" && (email !== "") & (password !== "")) {
			await signUp(email, password, name);
		}
	}

	return (
		<div className="container-center">
			<div className="login-area">
				<img src={logo2} alt="Logo" />
			</div>
			<div className="login">
				<form onSubmit={handleSubmit}>
					<h1>crie sua conta!</h1>
					<input
						text="name"
						placeholder="seu nome"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>

					<input
						text="email"
						placeholder="seu email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>

					<input
						text="password"
						placeholder="sua senha"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>

					<button type="submit">
						{loadingAuth ? "carregando.." : "cadastrar"}
					</button>
				</form>

				<Link to="/">já tenho uma conta!</Link>
			</div>
		</div>
	);
}
