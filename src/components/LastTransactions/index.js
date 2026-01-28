import { useEffect, useState } from "react";
import { db } from "../../services/firebaseConection";
import { collection, getDocs, orderBy, limit, query } from "firebase/firestore";

export default function LastTransactions() {
	const [transacoes, setTransacoes] = useState([]);

	useEffect(() => {
		async function loadLastTransactions() {
			const receitasRef = collection(db, "receitas");
			const despesasRef = collection(db, "despesas");

			const receitasQuery = query(
				receitasRef,
				orderBy("dataRecebimento", "desc"),
				limit(5),
			);

			const despesasQuery = query(
				despesasRef,
				orderBy("dataVencimento", "desc"),
				limit(5),
			);

			const [receitasSnap, despesasSnap] = await Promise.all([
				getDocs(receitasQuery),
				getDocs(despesasQuery),
			]);

			const receitas = receitasSnap.docs.map((doc) => ({
				id: doc.id,
				tipo: "Receita",
				descricao: doc.data().descricao,
				categoria: doc.data().categoria,
				valor: doc.data().valor,
				data: doc.data().dataRecebimento,
				created: doc.data().created,
			}));

			const despesas = despesasSnap.docs.map((doc) => ({
				id: doc.id,
				tipo: "Despesa",
				descricao: doc.data().descricao,
				categoria: doc.data().categoria,
				valor: doc.data().valor,
				data: doc.data().dataVencimento,
				created: doc.data().created,
			}));

			const todas = [...receitas, ...despesas]
				.sort((a, b) => new Date(b.data) - new Date(a.data))
				.slice(0, 5);

			setTransacoes(todas);
		}

		loadLastTransactions();
	}, []);

	function formatarDataBr(data) {
		const [ano, mes, dia] = data.split("-");
		return `${dia}/${mes}/${ano}`;
	}

	function formatarValorBRL(valor) {
		return valor.toLocaleString("pt-BR", {
			style: "currency",
			currency: "BRL",
		});
	}

	return (
		<div>
			{transacoes.map((item) => (
				<div key={item}>
					<div>
						<strong>{item.descricao}</strong>
						<span>{item.categoria}</span>
					</div>

					<div>
						<small>{formatarDataBr(item.data)}</small>
						<p className={item.tipo === "Receita" ? "entrada" : "saida"}>
							{item.tipo === "Receita" ? "+" : "-"}{" "}
							{formatarValorBRL(item.valor)}
						</p>
					</div>
				</div>
			))}
		</div>
	);
}
