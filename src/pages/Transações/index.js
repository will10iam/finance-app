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
import { Link } from "react-router-dom";

export default function Transacoes() {
	const [aba, setAba] = useState("todas");
	const [receitas, setReceitas] = useState([]);
	const [despesas, setDespesas] = useState([]);
	const [carregando, setCarregando] = useState(true);

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteItem, setDeleteItem] = useState(null);

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

		try {
			await deleteDoc(doc(db, "receitas", deleteItem.id));

			setReceitas((prev) => prev.filter((r) => r.id !== deleteItem.id));
			setShowDeleteModal(false);
			setDeleteItem(null);
		} catch (error) {
			console.log("Erro ao deletar receita", error);
		}
	}

	function toggleModalDelete(item) {
		setDeleteItem(item);
		setShowDeleteModal(true);
	}

	if (carregando) {
		return (
			<>
				<NavBar />
				<div className="content">
					<h2>Carregando transações...</h2>
				</div>
			</>
		);
	}

	return (
		<>
			<div className="content">
				<Title name="Transações" />

				{/* ---------- ABAS ---------- */}
				<div className="abas-transacoes">
					<button
						className={aba === "todas" ? "aba ativa" : "aba"}
						onClick={() => setAba("todas")}
					>
						Todas
					</button>
					<button
						className={aba === "receitas" ? "aba ativa" : "aba"}
						onClick={() => setAba("receitas")}
					>
						Receitas
					</button>
					<button
						className={aba === "despesas" ? "aba ativa" : "aba"}
						onClick={() => setAba("despesas")}
					>
						Despesas
					</button>
				</div>

				{/* ---------- LISTAGEM ---------- */}
				<div className="lista-transacoes">
					{getListaAtual().map((item) => (
						<div className="cardTransacao" key={item.id}>
							<div className="icone">
								{item.tipo === "receita" ? (
									<FaArrowUp color="green" size={22} />
								) : (
									<FaArrowDown color="red" size={22} />
								)}
							</div>

							<div className="info">
								<p className="descricao">{item.descricao}</p>
								<span className="categoria">{item.categoria}</span>
								<span className="data">{formatarDataBR(item.data)}</span>
								<div onClick={() => toggleModalDelete(item)}>
									<FaRegTrashAlt size={20} />
								</div>
								<Link to={`/newReceita/${item.id}`}>
									<FaRegEdit color="#FFF" size={20} />
								</Link>
							</div>

							<div className="valor">
								<h3
									style={{
										color: item.tipo === "receita" ? "#0c8b2d" : "#b90000",
									}}
								>
									{item.tipo === "receita" ? "+ " : "- "}
									{formatarValorBRL(item.valor)}
								</h3>
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
							Tem certeza que deseja excluir esta receita?
							<b>{deleteItem?.descricao}</b>
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
		</>
	);
}
