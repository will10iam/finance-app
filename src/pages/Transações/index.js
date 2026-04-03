import { useEffect, useState, useContext } from "react";
import {
	collection,
	deleteDoc,
	doc,
	getDocs,
	query,
	where,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/auth";
import {
	FaArrowUp,
	FaArrowDown,
	FaRegTrashAlt,
	FaRegEdit,
} from "react-icons/fa";

import { db } from "../../services/firebaseConection";
import Title from "../../components/Title";
import MonthFilter from "../../components/MonthFilter";

import "./index.css";

function isInFilteredMonth(dataString, mesFiltro) {
	if (!mesFiltro) return true;
	return dataString?.slice(0, 7) === mesFiltro;
}

export default function Transacoes() {
	const [aba, setAba] = useState("todas");
	const [receitas, setReceitas] = useState([]);
	const [despesas, setDespesas] = useState([]);
	const [carregando, setCarregando] = useState(true);

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteItem, setDeleteItem] = useState(null);

	const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);

	const [mesFiltro, setMesFiltro] = useState("");

	const navigate = useNavigate();

	const { user } = useContext(AuthContext);

	useEffect(() => {
		async function carregarDados() {
			try {
				const receitaQuery = query(
					collection(db, "receitas"),
					where("userID", "==", user.uid),
				);

				const despesaQuery = query(
					collection(db, "despesas"),
					where("userID", "==", user.uid),
				);

				const receitaSnap = await getDocs(receitaQuery);
				const despesaSnap = await getDocs(despesaQuery);
				/* const receitaSnap = await getDocs(collection(db, "receitas"));
				const despesaSnap = await getDocs(collection(db, "despesas")); */

				const listaReceitas = receitaSnap.docs.map((d) => ({
					id: d.id,
					tipo: "receita",
					descricao: d.data().descricao,
					categoria: d.data().categoria,
					valor: d.data().valor,
					status: d.data().status,
					dataRecebimento: d.data().dataRecebimento,
					dataPrevisao: d.data().dataPrevisao,
					created: d.data().created,
				}));

				const listaDespesas = despesaSnap.docs.map((d) => ({
					id: d.id,
					tipo: "despesa",
					descricao: d.data().descricao,
					categoria: d.data().categoria,
					valor: d.data().valor,
					status: d.data().status,
					dataVencimento: d.data().dataVencimento,
					created: d.data().created,
				}));

				setReceitas(listaReceitas);
				setDespesas(listaDespesas);
			} catch (error) {
				console.error("Erro ao carregar transações:", error);
			} finally {
				setCarregando(false);
			}
		}

		carregarDados();
	}, [carregando, user?.uid]);

	function formatarDataBR(dataString) {
		if (!dataString) return "";
		const [ano, mes, dia] = dataString.split("-");
		return `${dia}/${mes}/${ano}`;
	}

	function formatarValorBRL(valor) {
		return Number(valor || 0).toLocaleString("pt-BR", {
			style: "currency",
			currency: "BRL",
		});
	}

	function ordenarPorData(lista) {
		return [...lista].sort((a, b) => {
			const dateA = a.created?.toDate();
			const dateB = b.created?.toDate();

			return dateB - dateA;
		});
	}
	/* 
	const listaTodas = ordenarPorData([...receitas, ...despesas]);
	const listaReceitas = ordenarPorData(receitas);
	const listaDespesas = ordenarPorData(despesas); */

	const receitasFiltradas = receitas.filter((r) =>
		isInFilteredMonth(
			r.status === "Recebido" ? r.dataRecebimento : r.dataPrevisao,
			mesFiltro,
		),
	);

	const despesasFiltradas = despesas.filter((d) =>
		isInFilteredMonth(d.dataVencimento, mesFiltro),
	);

	const listaTodas = ordenarPorData([
		...receitasFiltradas,
		...despesasFiltradas,
	]);

	console.log(listaTodas);

	function getListaAtual() {
		if (aba === "receitas") return receitasFiltradas;
		if (aba === "despesas") return despesasFiltradas;
		return listaTodas;
	}

	async function handleDelete() {
		if (!deleteItem) return;

		const collectionName =
			deleteItem.tipo === "receita" ? "receitas" : "despesas";

		try {
			await deleteDoc(doc(db, collectionName, deleteItem.id));

			if (collectionName === "receitas") {
				setReceitas((prev) => prev.filter((r) => r.id !== deleteItem.id));
			} else {
				setDespesas((prev) => prev.filter((d) => d.id !== deleteItem.id));
			}

			setShowDeleteModal(false);
			setDeleteItem(null);
		} catch (error) {
			console.log("Erro ao deletar transação", error);
		}
	}

	function toggleModalDelete(item) {
		setDeleteItem(item);
		setShowDeleteModal(true);
	}

	function getMesAnoAtualPTBR() {
		const hoje = new Date();
		return hoje.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
	}

	function capitalizar(str) {
		return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
	}

	function getMesFormatado(mesFiltro) {
		if (!mesFiltro) return capitalizar(getMesAnoAtualPTBR());

		const [ano, mes] = mesFiltro.split("-");
		const data = new Date(ano, mes - 1);

		return capitalizar(
			data.toLocaleDateString("pt-BR", {
				month: "long",
				year: "numeric",
			}),
		);
	}

	function getStatusInfo(item) {
		const hoje = new Date();
		hoje.setHours(0, 0, 0, 0);

		if (item.tipo === "receita") {
			if (item.status === "Recebido") {
				return { label: "Recebido", color: "green" };
			}
			return { label: "À Receber", color: "yellow" };
		}

		if (item.tipo === "despesa") {
			if (item.status === "Paga") {
				return { label: "Paga", color: "green" };
			}
			const vencimento = item.dataVencimento
				? new Date(item.dataVencimento)
				: null;

			if (vencimento && vencimento < hoje) {
				return { label: "Atrasada", color: "red" };
			}

			return { label: "Em Aberto", color: "yellow" };
		}

		return { label: "", color: "white" };
	}

	if (carregando) {
		return (
			<div className="transacoes-page">
				<div className="content">
					<h2>Carregando transações...</h2>
				</div>
			</div>
		);
	}

	return (
		<div className="transacoes-page">
			<div className="content">
				<div className="transacoes-header">
					<div className="transacoes-header-left">
						<Title name="Transações" />
					</div>

					<button
						type="button"
						onClick={() => setShowNewTransactionModal(true)}
						className="btn-nova-transacao"
					>
						<span className="btn-plus">+</span>
						Nova Transação
					</button>
				</div>

				<div className="dashboard-top">
					<MonthFilter value={mesFiltro} onChange={setMesFiltro} />
				</div>

				<div className="abas-transacoes">
					<button
						className={aba === "todas" ? "aba ativa" : "aba"}
						onClick={() => setAba("todas")}
					>
						Todas <span className="aba-count">({listaTodas.length})</span>
					</button>
					<button
						className={aba === "receitas" ? "aba ativa" : "aba"}
						onClick={() => setAba("receitas")}
					>
						Receitas{" "}
						<span className="aba-count">({receitasFiltradas.length})</span>
					</button>
					<button
						className={aba === "despesas" ? "aba ativa" : "aba"}
						onClick={() => setAba("despesas")}
					>
						Despesas{" "}
						<span className="aba-count">({despesasFiltradas.length})</span>
					</button>
				</div>

				<h2 className="mes-titulo">{getMesFormatado(mesFiltro)}</h2>

				{listaTodas.length === 0 ? (
					<p className="lasttx-empty">Sem transações por enquanto</p>
				) : (
					<div className="lista-transacoes">
						{getListaAtual().map((item) => {
							const statusInfo = getStatusInfo(item);

							return (
								<div className="transacao-card" key={item.id}>
									<div className="transacao-icon">
										{item.tipo === "receita" ? (
											<FaArrowUp className="icon-receita" />
										) : (
											<FaArrowDown className="icon-despesa" />
										)}
									</div>

									<div className="transacao-body">
										<div className="transacao-top">
											<div className="transacao-title-row">
												<p className="transacao-title">{item.descricao}</p>
												<span
													className={`badge ${
														item.tipo === "receita"
															? "badge-receita"
															: "badge-despesa"
													}`}
												>
													{item.categoria}
												</span>

												<span className={`status-badge ${statusInfo.color}`}>
													{statusInfo.label}
												</span>
											</div>

											<div className="transacao-actions">
												<button
													type="button"
													className="icon-btn"
													onClick={() => toggleModalDelete(item)}
													aria-label="Excluir"
													title="Excluir"
												>
													<FaRegTrashAlt />
												</button>

												<Link
													className="icon-btn"
													to={
														item.tipo === "receita"
															? `/newReceita/${item.id}`
															: `/newDespesa/${item.id}`
													}
													aria-label="Editar"
													title="Editar"
												>
													<FaRegEdit />
												</Link>
											</div>
										</div>

										<div className="transacao-meta">
											<small>
												{formatarDataBR(
													item.tipo === "receita"
														? item.dataRecebimento || item.dataPrevisao
														: item.dataVencimento,
												)}
											</small>
										</div>

										<div className="transacao-value">
											<strong
												className={
													item.tipo === "receita"
														? "valor-receita"
														: "valor-despesa"
												}
											>
												{item.tipo === "receita" ? "+ " : "- "}
												{formatarValorBRL(item.valor)}
											</strong>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{showDeleteModal && (
				<div className="modal">
					<div className="modal-content">
						<h3>Confirmar exclusão</h3>
						<p>
							Tem certeza que deseja excluir esta <b>{deleteItem?.tipo}</b>?
						</p>
						<div className="modal-actions">
							<button
								onClick={handleDelete}
								className="btn-danger"
								type="button"
							>
								Sim, excluir
							</button>
							<button
								onClick={() => setShowDeleteModal(false)}
								className="btn-ghost"
								type="button"
							>
								Cancelar
							</button>
						</div>
					</div>
				</div>
			)}

			{showNewTransactionModal && (
				<div className="modal">
					<div className="modal-content">
						<h3>Nova transação</h3>
						<p>Escolha o tipo abaixo:</p>
						<div className="modal-actions">
							<button
								onClick={() => navigate("/newReceita")}
								className="btn-primary"
								type="button"
							>
								Receita
							</button>

							<button
								onClick={() => navigate("/newDespesa")}
								className="btn-danger"
								type="button"
							>
								Despesa
							</button>

							<button
								onClick={() => setShowNewTransactionModal(false)}
								className="btn-ghost"
								type="button"
							>
								Cancelar
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
