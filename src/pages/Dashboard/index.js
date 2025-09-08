import React, { useState, useEffect, useMemo } from "react";
import "./index.css";
import Title from "../../components/Title";
import { MdDashboard } from "react-icons/md";
import { db } from "../../services/firebaseConection";
import { collection, getDocs } from "firebase/firestore";
import Sidebar from "../../components/Sidebar";

// Função auxiliar para converter string de data "dd/MM/yyyy" em objeto Date
function parseDate(dateString) {
	if (!dateString) return null;
	const [year, month, day] = dateString.split("-");
	return new Date(Number(year), Number(month) - 1, Number(day));
}

export default function Dashboard() {
	const [loading, setLoading] = useState(true);
	const [receitas, setReceitas] = useState([]);
	const [despesas, setDespesas] = useState([]);
	// const hoje = new Date();

	useEffect(() => {
		async function loadData() {
			const receitasSnap = await getDocs(collection(db, "receitas"));
			const despesasSnap = await getDocs(collection(db, "despesas"));

			setReceitas(
				receitasSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
			);
			setDespesas(
				despesasSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
			);
		}
		loadData();
	}, []);

	function getDespesaStatus(despesa, hoje) {
		const vencimento = parseDate(despesa.dataVencimento);

		if (despesa.status === "Paga") {
			return "Paga";
		}

		if (vencimento < hoje) {
			return "Atrasada";
		}

		return "Em Aberto";
	}

	const resumo = useMemo(() => {
		const hoje = new Date();
		hoje.setHours(0, 0, 0, 0);

		//Receitas
		const totalRecebidas = receitas
			.filter(
				(r) => r.status === "Recebido" || parseDate(r.dataRecebimento) <= hoje
			)
			.reduce((acc, r) => acc + parseFloat(r.valor), 0);

		const totalAReceber = receitas
			.filter(
				(r) => r.status !== "Recebido" && parseDate(r.dataRecebimento) >= hoje
			)
			.reduce((acc, r) => acc + parseFloat(r.valor), 0);

		//Despesas
		const totalPagas = despesas
			.filter((d) => getDespesaStatus(d, hoje) === "Paga")
			.reduce((acc, d) => acc + parseFloat(d.valor), 0);

		const totalAPagar = despesas
			.filter((d) => {
				const status = getDespesaStatus(d, hoje);
				return status === "Atrasada" || status === "Em Aberto";
			})
			.reduce((acc, d) => acc + parseFloat(d.valor), 0);

		const saldo = totalRecebidas - totalPagas;

		return { totalRecebidas, totalAReceber, totalPagas, totalAPagar, saldo };
	}, [receitas, despesas]);

	/* if (loading) {
		return (
			<div className="content">
				<Title name="Dashboard">
					<MdDashboard size={25} />
				</Title>

				<div className="container dashboard">
					<span>Carregando dados do dashboard...</span>
				</div>
			</div>
		);
	} */
	return (
		<>
			<Sidebar />
			<div className="content">
				<div className="dashboard">
					<div className="card receitas">
						<h3>Receitas Recebidas</h3>
						<p>R$ {resumo.totalRecebidas.toFixed(2)}</p>
					</div>

					<div className="card receitas">
						<h3>Receitas a Receber</h3>
						<p>R$ {resumo.totalAReceber.toFixed(2)}</p>
					</div>

					<div className="card despesas">
						<h3>Despesas Pagas</h3>
						<p>R$ {resumo.totalPagas.toFixed(2)}</p>
					</div>

					<div className="card despesas">
						<h3>Despesas a Pagar</h3>
						<p>R$ {resumo.totalAPagar.toFixed(2)}</p>
					</div>

					<div
						className={`card saldo ${
							resumo.saldo >= 0 ? "positivo" : "negativo"
						}`}
					>
						<h3>Saldo</h3>
						<p>R$ {resumo.saldo.toFixed(2)}</p>
					</div>
				</div>
			</div>
		</>
	);
}
