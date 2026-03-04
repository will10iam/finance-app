import { useState, useContext } from "react";
import logo from "../../assets/logo2.png";
import "./signin.css";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/auth";

export default function SignIn() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const { signIn, loadingAuth } = useContext(AuthContext);

	async function handleSubmit(e) {
		e.preventDefault();

		if (email.trim() !== "" && password !== "") {
			await signIn(email.trim(), password);
		}
	}

	return (
		<div className="container-center">
			<div className="login">
				<div className="login-area">
					<img src={logo} alt="Logo do app" />
				</div>

				<form onSubmit={handleSubmit} className="login-form">
					<h1>Entrar</h1>

					<label className="login-label" htmlFor="email">
						Email
					</label>
					<input
						id="email"
						type="email"
						placeholder="seuemail@exemplo.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						autoComplete="email"
						required
					/>

					<label className="login-label" htmlFor="password">
						Senha
					</label>
					<input
						id="password"
						type="password"
						placeholder="Digite sua senha"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						autoComplete="current-password"
						required
					/>

					<button type="submit" disabled={loadingAuth}>
						{loadingAuth ? "Carregando..." : "Acessar"}
					</button>

					<Link className="login-link" to="/register">
						Criar uma conta
					</Link>
				</form>
			</div>
		</div>
	);
}
