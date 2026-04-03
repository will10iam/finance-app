import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { db } from "../../services/firebaseConection";
import {
	collection,
	getDocs,
	orderBy,
	limit,
	query,
	where,
} from "firebase/firestore";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { AuthContext } from "../../contexts/auth";

import "./index.css";

export default function LastTransactions({ mesFiltro }) {
	const [transacoes, setTransacoes] = useState([]);

	const { user } = useContext(AuthContext);

	useEffect(() => {
		async function loadLastTransactions() {
			if (!user?.uid) return;

			const receitasRef = collection(db, "receitas");
			const despesasRef = collection(db, "despesas");

			const receitasQuery = query(
				receitasRef,
				where("userID", "==", user.uid),
				orderBy("created", "desc"),
				limit(5),
			);

			const despesasQuery = query(
				despesasRef,
				where("userID", "==", user.uid),
				orderBy("created", "desc"),
				limit(5),
			);

			const [receitasSnap, despesasSnap] = await Promise.all([
				getDocs(receitasQuery),
				getDocs(despesasQuery),
			]);

			const receitas = receitasSnap.docs.map((doc) => {
				const data = doc.data();

				return {
					id: doc.id,
					tipo: "Receita",
					descricao: data.descricao,
					categoria: data.categoria,
					valor: data.valor,
					data:
						data.status === "Recebido"
							? data.dataRecebimento
							: data.dataPrevisao,
					created: data.created,
				};
			});

			const despesas = despesasSnap.docs.map((doc) => {
				const data = doc.data();

				return {
					id: doc.id,
					tipo: "Despesa",
					descricao: data.descricao,
					categoria: data.categoria,
					valor: data.valor,
					data: data.dataVencimento,
					created: data.created,
				};
			});

			const todasFiltradas = [...receitas, ...despesas].filter((item) =>
				isInFilteredMonth(item.data, mesFiltro),
			);

			const todas = todasFiltradas
				.sort((a, b) => {
					const dateA = a.created?.toDate?.() || new Date(0);
					const dateB = b.created?.toDate?.() || new Date(0);
					return dateB - dateA;
				})
				.slice(0, 5);

			setTransacoes(todas);
		}

		loadLastTransactions();
	}, [mesFiltro, user?.uid]);

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

	function isInFilteredMonth(dataString, mesFiltro) {
		if (!mesFiltro) return true;
		return dataString?.slice(0, 7) === mesFiltro;
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
