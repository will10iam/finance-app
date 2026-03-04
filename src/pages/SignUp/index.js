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

		if (name.trim() !== "" && email.trim() !== "" && password !== "") {
			await signUp(email.trim(), password, name.trim());
		}
	}

	return (
		<div className="container-center">
			<div className="login">
				<div className="login-area">
					<img src={logo2} alt="Logo do app" />
				</div>

				<form onSubmit={handleSubmit} className="login-form">
					<h1>Criar conta</h1>

					<label className="login-label" htmlFor="name">
						Nome
					</label>
					<input
						id="name"
						type="text"
						placeholder="Seu nome"
						value={name}
						onChange={(e) => setName(e.target.value)}
						autoComplete="name"
						required
					/>

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
						placeholder="Crie uma senha"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						autoComplete="new-password"
						required
					/>

					<button type="submit" disabled={loadingAuth}>
						{loadingAuth ? "Carregando..." : "Cadastrar"}
					</button>

					<Link className="login-link" to="/">
						Já tenho uma conta
					</Link>
				</form>
			</div>
		</div>
	);
}
