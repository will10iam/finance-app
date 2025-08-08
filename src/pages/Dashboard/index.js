import React, { useState, useEffect, useMemo } from "react";
import "./index.css";
import Title from "../../components/Title";
import { MdDashboard } from "react-icons/md";
import { db } from "../../services/firebaseConection";
import { collection, getDocs } from "firebase/firestore";
import Sidebar from "../../components/Sidebar";

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

	const resumo = useMemo(() => {
		const hoje = new Date();
		const totalRecebidas = receitas
			.filter(
				(r) => r.status === "Recebido" || new Date(r.dataRecebimento) <= hoje
			)
			.reduce((acc, r) => acc + Number(r.valor), 0);

		const totalAReceber = receitas
			.filter((r) => new Date(r.dataRecebimento) > hoje)
			.reduce((acc, r) => acc + Number(r.valor), 0);

		const totalPagas = despesas
			.filter((d) => d.status === "Pago" || new Date(d.dataPagamento) <= hoje)
			.reduce((acc, d) => acc + Number(d.valor), 0);

		const totalAPagar = despesas
			.filter((d) => new Date(d.dataPagamento) > hoje)
			.reduce((acc, d) => acc + Number(d.valor), 0);

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
