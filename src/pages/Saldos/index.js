import { useEffect, useState, useContext } from "react";
import { db } from "../../services/firebaseConection";
import { AuthContext } from "../../contexts/auth";
import { addDoc, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PiggyBankIcon } from "@phosphor-icons/react";
import Title from "../../components/Title";
import "./index.css";

export default function Saldos() {
	const [descricao, setDescricao] = useState("");
	const [valor, setValor] = useState("");
	const [dataAtualizacao, setDataAtualizacao] = useState("");

	const { user } = useContext(AuthContext);
	const navigate = useNavigate();

	async function handleRegister(e) {
		e.preventDefault();

		if (!descricao || !valor || !dataAtualizacao) {
			toast.error("Preencha todos os campos");
			return;
		}

		const valorNumber = Number(valor);

		if (isNaN(valorNumber)) {
			toast.error("Informe um valor válido");
			return;
		}

		try {
			await addDoc(collection(db, "saldos"), {
				descricao,
				valor: valorNumber,
				dataAtualizacao,
				created: new Date(),
				userID: user.uid,
			});

			toast.success("Novo saldo salvo com sucesso!");
			navigate("/dashboard");
		} catch (error) {
			console.error(error);
			toast.error("Erro ao salvar saldo");
		}
	}

	return (
		<>
			<div className="content_title">
				<Title name="Crie um novo saldo" />
				{/* <PiggyBankIcon size={25} /> */}
			</div>

			<div className="content">
				<div className="content_form">
					<form onSubmit={handleRegister} className="forms">
						<label>Descrição</label>
						<input
							type="text"
							placeholder="insira de onde é o saldo"
							value={descricao}
							onChange={(e) => setDescricao(e.target.value)}
						/>

						<label>Valor</label>
						<input
							type="number"
							step="0.01"
							placeholder="R$0,00"
							value={valor}
							onChange={(e) => setValor(e.target.value)}
						/>

						<label>Data de Atualização</label>
						<input
							type="date"
							value={dataAtualizacao}
							onChange={(e) => setDataAtualizacao(e.target.value)}
						/>

						<button type="submit" className="content_form_button">
							Salvar
						</button>
					</form>
				</div>
			</div>
		</>
	);
}
