import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { toast } from "react-toastify";

import Title from "../../components/Title";
import { db } from "../../services/firebaseConection";

import "./index.css";

export default function Categoria() {
	const [nome, setNome] = useState("");

	async function handleRegister(e) {
		e.preventDefault();

		const nomeTrim = nome.trim();

		if (!nomeTrim) {
			toast.error("Preencha o campo corretamente");
			return;
		}

		try {
			await addDoc(collection(db, "categorias"), {
				nomeCategoria: nomeTrim,
			});

			setNome("");
			toast.success("Cadastrado com sucesso");
		} catch (error) {
			console.log(error);
			toast.error("Erro ao fazer o cadastro!");
		}
	}

	return (
		<div className="categoria-page">
			<div className="categoria-header">
				<Title name="Categorias" />
			</div>

			<div className="categoria-card">
				<form className="categoria-form" onSubmit={handleRegister}>
					<div className="categoria-field">
						<label htmlFor="nomeCategoria">Nome da categoria</label>
						<input
							id="nomeCategoria"
							type="text"
							placeholder="Ex: Mercado, Aluguel, Salário..."
							value={nome}
							onChange={(e) => setNome(e.target.value)}
							autoComplete="off"
						/>
					</div>

					<button type="submit" className="categoria-btn">
						Salvar
					</button>
				</form>
			</div>
		</div>
	);
}
