import { useState, useEffect, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { AuthContext } from "../../contexts/auth";
import { db } from "../../services/firebaseConection";
import { collection, getDocs, where, orderBy } from "firebase/firestore";
import ProgressBar from "../../components/ProgressBar";
import Sidebar from "../../components/Sidebar";
import MonthFilter from "../../components/MonthFilter";
import Navbar from "../../components/NavBar";
import LastTransactions from "../../components/LastTransactions";
import {
	CurrencyCircleDollarIcon,
	InvoiceIcon,
	ArticleIcon,
	PiggyBankIcon,
	PencilIcon,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

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
	const [receitas, setReceitas] = useState([]);
	const [despesas, setDespesas] = useState([]);
	const [mesFiltro, setMesFiltro] = useState("");
	const [openReceitas, setOpenReceitas] = useState(false);
	const [openDespesas, setOpenDespesas] = useState(false);
	const [saldos, setSaldos] = useState([]);

	const { user } = useContext(AuthContext);

	const navigate = useNavigate();

	// const hoje = new Date();

	useEffect(() => {
		async function loadData() {
			const receitasSnap = await getDocs(collection(db, "receitas"));
			const despesasSnap = await getDocs(collection(db, "despesas"));
			const saldosSnap = await getDocs(
				collection(db, "saldos"),
				where("userID", "==", user.uid),
				orderBy("created", "desc"),
			);

			setReceitas(
				receitasSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
			);
			setDespesas(
				despesasSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
			);
			setSaldos(saldosSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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

		const saldosFiltrados = saldos.filter((s) =>
			isInFilteredMonth(s.dataAtualizacao, mesFiltro),
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

		/* const saldo = totalRecebidas - totalPagas; */

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
			<Sidebar />
			<MonthFilter value={mesFiltro} onChange={setMesFiltro} />

			<div className="saldo">
				{resumo.saldosFiltrados.length > 0 && (
					<div className="saldo-cards">
						{resumo.saldosFiltrados.map((saldo) => (
							<div className="saldo-card" key={saldo.id}>
								<div className="saldo-header">
									<PiggyBankIcon size={28} />
									<span>{saldo.descricao}</span>
									<Link to={`/saldos/${saldo.id}`}>
										<PencilIcon color="#FFF" size={18} />
									</Link>
								</div>

								<strong>R$ {saldo.valor.toFixed(2)}</strong>

								<small>
									Atualizado em{" "}
									{new Date(saldo.dataAtualizacao).toLocaleDateString("pt-BR")}
								</small>
							</div>
						))}
					</div>
				)}
			</div>

			<div className="dashboard">
				<div className="cards">
					<div className="card receitas">
						<div>
							<CurrencyCircleDollarIcon
								size={40}
								weight="duotone"
								color="#6DC956"
							/>
						</div>

						<h3>Receitas</h3>
						<p>
							R${" "}
							{(resumo.totalRecebidas + resumo.totalAReceber).toFixed(2)}{" "}
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
								open={openDespesas}
								onToggle={() => setOpenDespesas((prev) => !prev)}
							/>
						</div>
					</div>

					<div className="teste">
						<div className="card transacoes">
							<ArticleIcon size={40} weight="duotone" color="#4287f5" />
							<h3>Últimas Transações</h3>
						</div>

						<LastTransactions />
					</div>
				</div>
			</div>
		</>
	);
}
