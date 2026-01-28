import React, { useState, useEffect, useMemo } from "react";
import "./index.css";
import nubank from "../../assets/nu.svg";
import bbrasil from "../../assets/bb.svg";
import c6bank from "../../assets/c6.svg";
import { db } from "../../services/firebaseConection";
import { collection, getDocs } from "firebase/firestore";
/* import Title from "../../components/Title";
import { MdDashboard } from "react-icons/md";
import Sidebar from "../../components/Sidebar";
import SecondSidebar from "../../components/SecondSidebar";
import LogOutButton from "../../components/LogOutButton"; */
import DropdownMes from "../../components/DropdownMes";
import ProgressBar from "../../components/ProgressBar";
import Navbar from "../../components/NavBar";
import LastTransactions from "../../components/LastTransactions";
import {
	CurrencyCircleDollarIcon,
	/* HandArrowDownIcon,
	CheckFatIcon,
	TargetIcon,
	HandCoinsIcon, */
	InvoiceIcon,
	ArticleIcon,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { GoArrowDownRight } from "react-icons/go";

// Função auxiliar para converter string de data "dd/MM/yyyy" em objeto Date
function parseDate(dateString) {
	if (!dateString) return null;
	const [year, month, day] = dateString.split("-");
	return new Date(Number(year), Number(month) - 1, Number(day));
}

// Filtro simplificado pelo mês (YYYY-MM)
function isInFilteredMonth(dataString, mesFiltro) {
	if (!mesFiltro) return true; // sem filtro, traz tudo
	return dataString?.slice(0, 7) === mesFiltro;
}

export default function Dashboard() {
	const [loading, setLoading] = useState(true);
	const [receitas, setReceitas] = useState([]);
	const [despesas, setDespesas] = useState([]);
	const [mesFiltro, setMesFiltro] = useState("");
	const [saldoNubank, setSaldoNubank] = useState(0);

	// const hoje = new Date();

	useEffect(() => {
		async function loadData() {
			const receitasSnap = await getDocs(collection(db, "receitas"));
			const despesasSnap = await getDocs(collection(db, "despesas"));

			setReceitas(
				receitasSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
			);
			setDespesas(
				despesasSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
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

		const receitasFiltradas = receitas.filter((r) =>
			isInFilteredMonth(r.dataRecebimento, mesFiltro),
		);
		const despesasFiltradas = despesas.filter((d) =>
			isInFilteredMonth(d.dataVencimento, mesFiltro),
		);

		//Receitas
		const totalRecebidas = receitasFiltradas
			.filter(
				(r) => r.status === "Recebido" || parseDate(r.dataRecebimento) <= hoje,
			)
			.reduce((acc, r) => acc + parseFloat(r.valor), 0);

		const totalAReceber = receitasFiltradas
			.filter(
				(r) => r.status !== "Recebido" && parseDate(r.dataRecebimento) >= hoje,
			)
			.reduce((acc, r) => acc + parseFloat(r.valor), 0);

		//Despesas
		const totalPagas = despesasFiltradas
			.filter((d) => getDespesaStatus(d, hoje) === "Paga")
			.reduce((acc, d) => acc + parseFloat(d.valor), 0);

		const totalAPagar = despesasFiltradas
			.filter((d) => {
				const status = getDespesaStatus(d, hoje);
				return status === "Atrasada" || status === "Em Aberto";
			})
			.reduce((acc, d) => acc + parseFloat(d.valor), 0);

		const saldo = totalRecebidas - totalPagas;

		return { totalRecebidas, totalAReceber, totalPagas, totalAPagar, saldo };
	}, [receitas, despesas, mesFiltro]);

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
			{/* <SecondSidebar /> */}
			{/* <Sidebar />
			<LogOutButton /> */}
			{/* <Title name="Dashboard">
				<MdDashboard size={25} />
				</Title> */}
			<Navbar />
			<div className="filtro-mes">
				<DropdownMes mesFiltro={mesFiltro} setMesFiltro={setMesFiltro} />
			</div>

			<div className="dashboard">
				{/* <div className="filtro-mes">
					<label>Filtrar por mês:</label>
					<input
						type="month"
						value={mesFiltro}
						onChange={(e) => setMesFiltro(e.target.value)}
					/>
				</div> */}

				<div className="cards">
					<Link to="/receitas">
						<div className="card receitas">
							<CurrencyCircleDollarIcon
								size={40}
								weight="duotone"
								color="#6DC956"
							/>
							<h3>Receitas</h3>
							<p>
								R$ {(resumo.totalRecebidas + resumo.totalAReceber).toFixed(2)}
							</p>

							<div className="progress-section">
								<ProgressBar
									label="Já recebeu"
									percentage={
										(resumo.totalRecebidas /
											(resumo.totalRecebidas + resumo.totalAReceber || 1)) *
										100
									}
									color="#6DC956"
									remainingValue={resumo.totalAReceber}
								/>
							</div>
						</div>
					</Link>

					{/* <div className="card receitas">
						<HandArrowDownIcon size={40} weight="duotone" color="#F8C4B4" />
						<h3>Total à Receber</h3>
						<p>R$ {resumo.totalAReceber.toFixed(2)}</p>
					</div> */}

					{/* <div className="card despesas">
						<CheckFatIcon size={40} weight="duotone" color="#6DC956" />
						<h3>Total Pagas</h3>
						<p>R$ {resumo.totalPagas.toFixed(2)}</p>
					</div> */}

					<Link to="/despesas">
						<div className="card despesas">
							<InvoiceIcon size={40} weight="duotone" color="#ee5d4aff" />
							<h3>Despesas</h3>
							<p>R$ {(resumo.totalAPagar + resumo.totalPagas).toFixed(2)}</p>

							<div>
								<ProgressBar
									label="Já foi Pago"
									percentage={
										(resumo.totalPagas /
											(resumo.totalPagas + resumo.totalAPagar || 1)) *
										100
									}
									color="#ee5d4aff"
									remainingValue={resumo.totalAPagar}
								/>
							</div>
						</div>
					</Link>

					<div className="teste">
						<div className="card transacoes">
							<ArticleIcon size={40} weight="duotone" color="#4287f5" />
							<h3>Últimas Transações</h3>
						</div>

						{/* <div className="last_infos">
							<GoArrowDownRight size={30} color="#059669" />
							<div>
								<p>Categoria</p>
								<p>Descrição</p>
							</div>
							<div>
								<p>R$0,00</p>
							</div>
						</div> */}

						<LastTransactions />
					</div>
				</div>

				{/* <div className="bank-cards">
					<div className="nubank">
						<img src={nubank} alt="logo nu" />
						<h3>Will</h3>
						<p>R$155,56</p>
					</div>
					<div className="bbrasil">
						<img src={bbrasil} alt="logo bb" />
						<h3>Amália</h3>
						<p>R$0,00</p>
					</div>
					<div className="c6bank">
						<img src={c6bank} alt="logo c6" />
						<h3>Amália</h3>
						<p>R$142,62</p>
					</div>
				</div> */}
				{/* <div
						className={`card saldo ${
							resumo.saldo >= 0 ? "positivo" : "negativo"
						}`}
					>
						<HandCoinsIcon size={40} weight="duotone" color="#f3de23ff" />
						<h3>Saldo</h3>
						<p>R$ {resumo.saldo.toFixed(2)}</p>
					</div> */}
			</div>
		</>
	);
}
