import { useEffect, useState } from "react";
import { db } from "../../services/firebaseConection";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
		<form onSubmit={handleUpdate}>
			<input value={descricao} onChange={(e) => setDescricao(e.target.value)} />
			<input
				type="number"
				value={valor}
				onChange={(e) => setValor(e.target.value)}
			/>
			<input
				type="date"
				value={dataAtualizacao}
				onChange={(e) => setDataAtualizacao(e.target.value)}
			/>

			<button type="submit">Salvar</button>
		</form>
	);
}
