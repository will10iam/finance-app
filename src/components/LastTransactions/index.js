import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../../services/firebaseConection";
import { collection, getDocs, orderBy, limit, query } from "firebase/firestore";
import { ArrowRightIcon } from "@phosphor-icons/react";

import "./index.css";

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
			}));

			const despesas = despesasSnap.docs.map((doc) => ({
				id: doc.id,
				tipo: "Despesa",
				descricao: doc.data().descricao,
				categoria: doc.data().categoria,
				valor: doc.data().valor,
				data: doc.data().dataVencimento,
			}));

			const todas = [...receitas, ...despesas]
				.sort((a, b) => new Date(b.data) - new Date(a.data))
				.slice(0, 5);

			setTransacoes(todas);
		}

		loadLastTransactions();
	}, []);

	function formatarDataBr(data) {
		if (!data) return "";
		const [ano, mes, dia] = data.split("-");
		return `${dia}/${mes}/${ano}`;
	}

	function formatarValorBRL(valor) {
		return Number(valor).toLocaleString("pt-BR", {
			style: "currency",
			currency: "BRL",
		});
	}

	return (
		<div className="lasttx">
			<div className="lasttx-header">
				<h4>Últimas transações</h4>

				<Link to="/transacoes" className="lasttx-link">
					Ver tudo <ArrowRightIcon size={16} />
				</Link>
			</div>

			{transacoes.length === 0 ? (
				<p className="lasttx-empty">Sem transações por enquanto.</p>
			) : (
				<div className="lasttx-list">
					{transacoes.map((item) => (
						<div className="lasttx-item" key={item.id}>
							<div className="lasttx-left">
								<strong className="lasttx-title">{item.descricao}</strong>
								<span
									className={
										item.tipo === "Receita"
											? "lasttx-badge badge-receita"
											: "lasttx-badge badge-despesa"
									}
								>
									{item.categoria}
								</span>
							</div>

							<div className="lasttx-right">
								<small className="lasttx-date">
									{formatarDataBr(item.data)}
								</small>
								<span
									className={
										item.tipo === "Receita"
											? "lasttx-value entrada"
											: "lasttx-value saida"
									}
								>
									{item.tipo === "Receita" ? "+ " : "- "}
									{formatarValorBRL(item.valor)}
								</span>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
