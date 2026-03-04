import { useState, useEffect, useMemo, useContext } from "react";
import "./index.css";

import { AuthContext } from "../../contexts/auth";
import { db } from "../../services/firebaseConection";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

import ProgressBar from "../../components/ProgressBar";
import Sidebar from "../../components/Sidebar";
import MonthFilter from "../../components/MonthFilter";
import LastTransactions from "../../components/LastTransactions";
import Layout from "../../components/Layout";

import {
	CurrencyCircleDollarIcon,
	InvoiceIcon,
	ArticleIcon,
	PiggyBankIcon,
	PencilIcon,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

function parseDate(dateString) {
	if (!dateString) return null;
	const [year, month, day] = dateString.split("-");
	return new Date(Number(year), Number(month) - 1, Number(day));
}

function isInFilteredMonth(dataString, mesFiltro) {
	if (!mesFiltro) return true;
	return dataString?.slice(0, 7) === mesFiltro;
}

export default function Dashboard() {
	const [receitas, setReceitas] = useState([]);
	const [despesas, setDespesas] = useState([]);
	const [mesFiltro, setMesFiltro] = useState("");
	const [openReceitas, setOpenReceitas] = useState(false);
	const [openDespesas, setOpenDespesas] = useState(false);
	const [saldos, setSaldos] = useState([]);

	const { user } = useContext(AuthContext);

	useEffect(() => {
		async function loadData() {
			const receitasSnap = await getDocs(collection(db, "receitas"));
			const despesasSnap = await getDocs(collection(db, "despesas"));

			// ✅ Firestore query do jeito certo:
			const saldosQuery = query(
				collection(db, "saldos"),
				where("userID", "==", user.uid),
				orderBy("created", "desc"),
			);
			const saldosSnap = await getDocs(saldosQuery);

			setReceitas(receitasSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
			setDespesas(despesasSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
			setSaldos(saldosSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
		}

		if (user?.uid) loadData();
	}, [user?.uid]);

	function getDespesaStatus(despesa, hoje) {
		const vencimento = parseDate(despesa.dataVencimento);

		if (despesa.status === "Paga") return "Paga";
		if (vencimento && vencimento < hoje) return "Atrasada";
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
		const saldosFiltrados = saldos.filter((s) =>
			isInFilteredMonth(s.dataAtualizacao, mesFiltro),
		);

		const totalRecebidas = receitasFiltradas
			.filter(
				(r) => r.status === "Recebido" || parseDate(r.dataRecebimento) <= hoje,
			)
			.reduce((acc, r) => acc + Number(r.valor || 0), 0);

		const totalAReceber = receitasFiltradas
			.filter(
				(r) => r.status !== "Recebido" && parseDate(r.dataRecebimento) >= hoje,
			)
			.reduce((acc, r) => acc + Number(r.valor || 0), 0);

		const totalPagas = despesasFiltradas
			.filter((d) => getDespesaStatus(d, hoje) === "Paga")
			.reduce((acc, d) => acc + Number(d.valor || 0), 0);

		const totalAPagar = despesasFiltradas
			.filter((d) => {
				const status = getDespesaStatus(d, hoje);
				return status === "Atrasada" || status === "Em Aberto";
			})
			.reduce((acc, d) => acc + Number(d.valor || 0), 0);

		return {
			totalRecebidas,
			totalAReceber,
			totalPagas,
			totalAPagar,
			saldosFiltrados,
		};
	}, [receitas, despesas, saldos, mesFiltro]);

	return (
		<>
			<div className="dashboard-page">
				<div className="dashboard-top">
					<MonthFilter value={mesFiltro} onChange={setMesFiltro} />
				</div>

				{/* SALDOS */}
				{resumo.saldosFiltrados.length > 0 && (
					<section className="saldo-section">
						<div className="saldo-cards">
							{resumo.saldosFiltrados.map((saldo) => (
								<div className="saldo-card" key={saldo.id}>
									<div className="saldo-header">
										<div className="saldo-left">
											<PiggyBankIcon size={22} weight="duotone" />
											<span className="saldo-desc">{saldo.descricao}</span>
										</div>

										<Link
											className="saldo-edit"
											to={`/saldos/${saldo.id}`}
											title="Editar"
										>
											<PencilIcon size={18} />
										</Link>
									</div>

									<strong className="saldo-value">
										{Number(saldo.valor || 0).toLocaleString("pt-BR", {
											style: "currency",
											currency: "BRL",
										})}
									</strong>

									<small className="saldo-date">
										Atualizado em{" "}
										{new Date(saldo.dataAtualizacao).toLocaleDateString(
											"pt-BR",
										)}
									</small>
								</div>
							))}
						</div>
					</section>
				)}

				<div className="dashboard-grid">
					<div className="card receitas">
						<div className="card-icon">
							<CurrencyCircleDollarIcon size={40} weight="duotone" />
						</div>

						<h3>Receitas</h3>
						<p className="card-total">
							{(resumo.totalRecebidas + resumo.totalAReceber).toLocaleString(
								"pt-BR",
								{
									style: "currency",
									currency: "BRL",
								},
							)}
						</p>

						<ProgressBar
							label="Já recebeu"
							percentage={
								(resumo.totalRecebidas /
									(resumo.totalRecebidas + resumo.totalAReceber || 1)) *
								100
							}
							color="#6DC956"
							remainingValue={resumo.totalAReceber}
							open={openReceitas}
							onToggle={() => setOpenReceitas((prev) => !prev)}
						/>
					</div>

					<div className="card despesas">
						<div className="card-icon">
							<InvoiceIcon size={40} weight="duotone" />
						</div>

						<h3>Despesas</h3>
						<p className="card-total">
							{(resumo.totalAPagar + resumo.totalPagas).toLocaleString(
								"pt-BR",
								{
									style: "currency",
									currency: "BRL",
								},
							)}
						</p>

						<ProgressBar
							label="Já foi pago"
							percentage={
								(resumo.totalPagas /
									(resumo.totalPagas + resumo.totalAPagar || 1)) *
								100
							}
							color="#ee5d4aff"
							remainingValue={resumo.totalAPagar}
							open={openDespesas}
							onToggle={() => setOpenDespesas((prev) => !prev)}
						/>
					</div>

					<div className="card transacoes">
						<div className="transacoes-head">
							<div className="card-icon">
								<ArticleIcon size={40} weight="duotone" />
							</div>
							<h3>Últimas Transações</h3>
						</div>

						<LastTransactions />
					</div>
				</div>
			</div>
		</>
	);
}
