import { useState } from "react";

import Header from "../../components/Sidebar";
import Title from "../../components/Title";

// import { FiUser } from "react-icons/fi";
import { BiSolidCategoryAlt } from "react-icons/bi";

import { db } from "../../services/firebaseConection";
import { addDoc, collection } from "firebase/firestore";
import { toast } from "react-toastify";

export default function Categoria() {
	const [nome, setNome] = useState("");
	//const [cnpj, setCnpj] = useState("");
	//const [endereco, setEndereco] = useState("");

	async function handleRegister(e) {
		e.preventDefault();

		if (nome !== "") {
			await addDoc(collection(db, "categorias"), {
				nomeCategoria: nome,
				/* cnpj: cnpj,
				endereco: endereco, */
			})
				.then(() => {
					setNome("");
					//setCnpj("");
					//setEndereco("");
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
			<Header />

			<div className="content">
				<Title name="Categorias">
					<BiSolidCategoryAlt size={25} />
				</Title>

				<div className="container">
					<form className="form-profile" onSubmit={handleRegister}>
						<label>Nome da Categoria</label>
						<input
							type="text"
							placeholder="insira o nome da categoria"
							value={nome}
							onChange={(e) => setNome(e.target.value)}
						/>

						{/* <label>CNPJ</label>
						<input
							type="number"
							placeholder="insira o CNPJ do cliente"
							value={cnpj}
							onChange={(e) => setCnpj(e.target.value)}
						/>

						<label>Endereço</label>
						<input
							type="text"
							placeholder="insira o endereço do cliente"
							value={endereco}
							onChange={(e) => setEndereco(e.target.value)}
						/> */}

						<button type="submit">Salvar</button>
					</form>
				</div>
			</div>
		</>
	);
}
