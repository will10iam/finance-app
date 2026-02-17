import { useEffect, useState } from "react";
import Title from "../../components/Title";
import NavBar from "../../components/NavBar";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../../services/firebaseConection";
import { format } from "date-fns";
import {
	FaArrowUp,
	FaArrowDown,
	FaRegTrashAlt,
	FaRegEdit,
} from "react-icons/fa";
import "./index.css";
import { Link, useNavigate } from "react-router-dom";

export default function Transacoes() {
	const [aba, setAba] = useState("todas");
	const [receitas, setReceitas] = useState([]);
	const [despesas, setDespesas] = useState([]);
	const [carregando, setCarregando] = useState(true);

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteItem, setDeleteItem] = useState(null);

	const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);

	const navigate = useNavigate();

	useEffect(() => {
		async function carregarDados() {
			try {
				const receitaSnap = await getDocs(collection(db, "receitas"));
				const despesaSnap = await getDocs(collection(db, "despesas"));

				const listaReceitas = receitaSnap.docs.map((doc) => ({
					id: doc.id,
					tipo: "receita",
					descricao: doc.data().descricao,
					categoria: doc.data().categoria,
					valor: doc.data().valor,
					data: doc.data().dataRecebimento, // ← 📌 DATA USADA PARA ORDENAR
				}));

				const listaDespesas = despesaSnap.docs.map((doc) => ({
					id: doc.id,
					tipo: "despesa",
					descricao: doc.data().descricao,
					categoria: doc.data().categoria,
					valor: doc.data().valor,
					data: doc.data().dataVencimento, // ← 📌 DATA USADA PARA ORDENAR
				}));

				setReceitas(listaReceitas);
				setDespesas(listaDespesas);
			} catch (error) {
				console.error("Erro ao carregar transações:", error);
			}

			setCarregando(false);
		}

		carregarDados();
	}, []);

	// ---------- FORMATADORES ----------
	function formatarDataBR(dataString) {
		if (!dataString) return "";
		const [ano, mes, dia] = dataString.split("-");
		return `${dia}/${mes}/${ano}`;
	}

	function formatarValorBRL(valor) {
		return valor.toLocaleString("pt-BR", {
			style: "currency",
			currency: "BRL",
		});
	}

	// ---------- FUNÇÃO QUE ORDENA POR DATA ----------
	function ordenarPorData(lista) {
		return [...lista].sort((a, b) => {
			const dataA = new Date(a.data);
			const dataB = new Date(b.data);
			return dataB - dataA; // mais recente primeiro
		});
	}

	// ---------- LISTAS FILTRADAS ----------
	const listaTodas = ordenarPorData([...receitas, ...despesas]);
	const listaReceitas = ordenarPorData(receitas);
	const listaDespesas = ordenarPorData(despesas);

	function getListaAtual() {
		if (aba === "receitas") return listaReceitas;
		if (aba === "despesas") return listaDespesas;
		return listaTodas;
	}

	// ---------- FUNÇÃO PARA EXCLUIR TRANSAÇÃO ----------
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

	function toggleNewTransaction() {
		setShowNewTransactionModal(true);
	}

	function getMesAnoAtualPTBR() {
		const hoje = new Date();
		return hoje.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
	}

	function capitalizar(str) {
		return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
	}

	if (carregando) {
		return (
			<>
				<div className="content">
					<h2>Carregando transações...</h2>
				</div>
			</>
		);
	}

	return (
		<>
			<div className="content">
				<div className="transacoes-header">
					<div className="transacoes-header-left">
						<Title name="Transações" />
					</div>
					<div
						onClick={() => toggleNewTransaction()}
						className="btn-nova-transacao"
					>
						<span className="btn-plus">+</span>
						Nova Transação
					</div>
				</div>

				{/* ---------- ABAS ---------- */}
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
						Receitas <span className="aba-count">({listaReceitas.length})</span>
					</button>
					<button
						className={aba === "despesas" ? "aba ativa" : "aba"}
						onClick={() => setAba("despesas")}
					>
						Despesas <span className="aba-count">({listaDespesas.length})</span>
					</button>
				</div>

				<h2 className="mes-titulo">{capitalizar(getMesAnoAtualPTBR())}</h2>

				{/* ---------- LISTAGEM ---------- */}
				<div className="lista-transacoes">
					{getListaAtual().map((item) => (
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
											className={`badge ${item.tipo === "receita" ? "badge-receita" : "badge-despesa"}`}
										>
											{item.categoria}
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
											<FaRegEdit color="#FFF" size={20} />
										</Link>
									</div>
								</div>

								<div className="transacao-meta">
									<small>{formatarDataBR(item.data)}</small>
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
					))}
				</div>
			</div>

			{showDeleteModal && (
				<div className="modal">
					<div className="modal-content">
						<h3>Confirmar exclusão</h3>
						<p>
							Tem certeza que deseja excluir esta <b>{deleteItem?.tipo}</b>
						</p>
						<div className="modal-actions">
							<button
								onClick={handleDelete}
								style={{ backgroundColor: "#f63535", color: "#fff" }}
							>
								Sim, excluir
							</button>
							<button onClick={() => setShowDeleteModal(false)}>
								Cancelar
							</button>
						</div>
					</div>
				</div>
			)}

			{showNewTransactionModal && (
				<div className="modal">
					<div className="modal-content">
						<h3>Quer adicionar uma nova transação?</h3>
						<p>Escolha o tipo abaixo</p>
						<div className="modal-actions">
							<button
								onClick={() => navigate("/newReceita")}
								style={{ backgroundColor: "#f63535", color: "#fff" }}
							>
								Receita
							</button>

							<button
								onClick={() => navigate("/newDespesa")}
								style={{ backgroundColor: "#f63535", color: "#fff" }}
							>
								Despesa
							</button>
							<button onClick={() => setShowNewTransactionModal(false)}>
								Cancelar
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
