import { useEffect, useState } from "react";
import { db } from "../../services/firebaseConection";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Title from "../../components/Title";
import "./index.css";

export default function EditSaldo() {
	const { id } = useParams();
	const navigate = useNavigate();

	const [descricao, setDescricao] = useState("");
	const [valor, setValor] = useState("");
	const [dataAtualizacao, setDataAtualizacao] = useState("");

	useEffect(() => {
		async function loadSaldo() {
			const docRef = doc(db, "saldos", id);
			const snap = await getDoc(docRef);

			if (snap.exists()) {
				const data = snap.data();
				setDescricao(data.descricao);
				setValor(data.valor);
				setDataAtualizacao(data.dataAtualizacao);
			}
		}

		loadSaldo();
	}, [id]);

	async function handleUpdate(e) {
		e.preventDefault();

		await updateDoc(doc(db, "saldos", id), {
			descricao,
			valor,
			dataAtualizacao,
			updatedAt: new Date(),
		});

		toast.success("Saldo atualizado!");
		navigate("/dashboard");
	}

	return (
		<div className="saldo-edit-page">
			<div className="saldo-edit-header">
				<Title name="Editar Saldo" />
			</div>

			<div className="saldo-edit-card">
				<form onSubmit={handleUpdate} className="saldo-edit-form">
					<div className="saldo-edit-field">
						<label>Descrição</label>
						<input
							value={descricao}
							onChange={(e) => setDescricao(e.target.value)}
						/>
					</div>

					<div className="saldo-edit-field">
						<label>Valor</label>
						<input
							type="number"
							value={valor}
							onChange={(e) => setValor(e.target.value)}
						/>
					</div>
					<div className="saldo-edit-field">
						<label>Data de Atualização</label>
						<input
							type="date"
							value={dataAtualizacao}
							onChange={(e) => setDataAtualizacao(e.target.value)}
						/>
					</div>

					<div className="saldo-edit-actions">
						<button
							type="submit"
							className="saldo-edit-btn saldo-edit-btn-primary"
						>
							Salvar
						</button>

						<button
							type="button"
							className="saldo-edit-btn saldo-edit-btn-secondary"
						>
							Cancelar
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
