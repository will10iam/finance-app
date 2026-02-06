import { useState } from "react";

/* import Header from "../../components/Sidebar"; */
import Title from "../../components/Title";
import { BiSolidCategoryAlt } from "react-icons/bi";

import { db } from "../../services/firebaseConection";
import { addDoc, collection } from "firebase/firestore";
import { toast } from "react-toastify";

export default function Categoria() {
	const [nome, setNome] = useState("");

	async function handleRegister(e) {
		e.preventDefault();

		if (nome !== "") {
			await addDoc(collection(db, "categorias"), {
				nomeCategoria: nome,
			})
				.then(() => {
					setNome("");
					toast.success("Cadastrado com sucesso");
				})
				.catch((error) => {
					console.log(error);
					toast.error("Erro ao fazer ao cadastro!");
				});
		} else {
			toast.error("Preencha o campo corretamente");
		}
	}

	return (
		<>
			{/* <Header /> */}

			<div className="">
				<Title name="Categorias">
					<BiSolidCategoryAlt size={25} />
				</Title>

				<div className="">
					<form className="" onSubmit={handleRegister}>
						<label>Nome da Categoria</label>
						<input
							type="text"
							placeholder="insira o nome da categoria"
							value={nome}
							onChange={(e) => setNome(e.target.value)}
						/>

						<button type="submit">Salvar</button>
					</form>
				</div>
			</div>
		</>
	);
}
