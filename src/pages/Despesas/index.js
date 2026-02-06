import { useEffect, useState } from "react";

import Title from "../../components/Title";
import NavBar from "../../components/NavBar";
import DropdownMes from "../../components/DropdownMes";
import "./index.css";
import { FiPlus } from "react-icons/fi";
import { RiBillLine } from "react-icons/ri";
import { GoArrowUpRight } from "react-icons/go";
import { FaRegTrashAlt, FaRegEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import { db } from "../../services/firebaseConection";
import {
	collection,
	orderBy,
	limit,
	getDocs,
	startAfter,
	query,
	deleteDoc,
	doc,
} from "firebase/firestore";
import { format } from "date-fns";
import Modal from "../../components/Modal";

const listRef = collection(db, "despesas");

export default function Despesas() {
	const [despesas, setDespesas] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isEmpty, setIsEmpty] = useState(false);
	const [lastDocs, setLastDocs] = useState();
	const [loadingMore, setLoadingMore] = useState(false);

	const [showPostModal, setShowPostModal] = useState(false);
	const [detail, setDetail] = useState();

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteItem, setDeleteItem] = useState(null);

	const [mesFiltro, setMesFiltro] = useState("");

	useEffect(() => {
		async function loadDespesas() {
			const q = query(listRef, orderBy("created", "desc"), limit(15));

			const querySnapshot = await getDocs(q);
			setDespesas([]);
			await updateState(querySnapshot);

			setLoading(false);
		}

		loadDespesas();
		return () => {};
	}, []);

	async function updateState(querySnapshot) {
		const isCollectionEmpty = querySnapshot.size === 0;

		if (!isCollectionEmpty) {
			let lista = [];

			querySnapshot.forEach((doc) => {
				lista.push({
					id: doc.id,
					tipo: doc.data().tipo,
					descricao: doc.data().descricao,
					descricaoID: doc.data().descricaoID,
					valor: doc.data().valor,
					categoria: doc.data().categoria,
					dataVencimento: doc.data().dataVencimento,
					dataPagamento: doc.data().dataPagamento,
					created: doc.data().created,
					createdFormat: format(doc.data().created.toDate(), "dd/MM/yyyy"),
					// complemento: doc.data().complemento,
					status: doc.data().status,
				});
				console.log(doc.data().tipo);
			});
			const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

			setDespesas((despesas) => [...despesas, ...lista]);
			setLastDocs(lastDoc);
		} else {
			setIsEmpty(true);
		}

		setLoadingMore(false);
	}

	async function handleMore() {
		setLoadingMore(true);

		const q = query(
			listRef,
			orderBy("created", "desc"),
			startAfter(lastDocs),
			limit(20),
		);
		const querySnapshot = await getDocs(q);
		await updateState(querySnapshot);
	}

	async function handleDelete() {
		if (!deleteItem) return;

		try {
			await deleteDoc(doc(db, "despesas", deleteItem.id));

			//remove da lista sem precisar recarregar tudo
			setDespesas((prev) => prev.filter((d) => d.id !== deleteItem.id));
			setShowDeleteModal(false);
			setDeleteItem(null);
		} catch (error) {
			console.error("Erro ao deletar despesa: ", error);
		}
	}

	function toggleModalDelete(item) {
		setDeleteItem(item);
		setShowDeleteModal(true);
	}

	function formatarValorBRL(valor) {
		return valor.toLocaleString("pt-BR", {
			style: "currency",
			currency: "BRL",
		});
	}

	function formatarDataBR(dataString) {
		if (!dataString) return "";
		const [ano, mes, dia] = dataString.split("-");
		return `${dia}/${mes}/${ano}`;
	}

	if (loading) {
		return (
			<div>
				<div className="content">
					<Title name="Despesas">
						<RiBillLine size={25} />
					</Title>

					<div className="container dashboard">
						<span>Buscando despesas do casal...</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<NavBar />
			<div className="content">
				<Title name="Despesas">
					<RiBillLine size={25} />
				</Title>

				<div className="filtro-mes">
					<DropdownMes mesFiltro={mesFiltro} setMesFiltro={setMesFiltro} />
					<Link to="/newDespesa" className="add_button">
						<FiPlus color="#FFF" size={25} />
						Nova Despesa
					</Link>
				</div>
				<>
					{despesas.length === 0 ? (
						<div className="container dashboard">
							<span>Nenhuma despesa encontrada...</span>
						</div>
					) : (
						<>
							{despesas
								.filter((item) => {
									if (!mesFiltro) return true;
									const [anoFiltro, mesFiltroNum] = mesFiltro.split("-");
									const [anoItem, mesItem] = item.dataVencimento.split("-");
									return anoItem === anoFiltro && mesItem === mesFiltroNum;
								})
								.map((item, index) => {
									return (
										<div className="cardDespesas" key={index}>
											<div className="cardDespesas_content">
												<div className="cardDespesas_icon">
													<GoArrowUpRight color="#eb2e0dff" size={25} />
												</div>
												<div className="cardDespesas_info">
													<div className="cardDespesas_title">
														<p>{item.descricao}</p>
														<span>{item.categoria}</span>
													</div>
													<h3>{formatarDataBR(item.dataVencimento)}</h3>
												</div>
												<div className="cardDespesas_value">
													<h2>- {formatarValorBRL(item.valor)}</h2>
												</div>
												<div className="cardDespesas_actions">
													<div onClick={() => toggleModalDelete(item)}>
														<FaRegTrashAlt size={20} />
													</div>
													<Link to={`/newDespesa/${item.id}`}>
														<FaRegEdit color="#FFF" size={20} />
													</Link>
												</div>
											</div>
										</div>
									);
								})}
							{loadingMore && <h3>Buscando mais despesas..</h3>}
							{!loadingMore && !isEmpty && (
								<button className="btn-more" onClick={handleMore}>
									Buscar mais
								</button>
							)}
						</>
					)}
				</>
			</div>

			{showPostModal && (
				<Modal
					conteudo={detail}
					close={() => setShowPostModal(!showPostModal)}
				/>
			)}

			{showDeleteModal && (
				<div className="modal">
					<div className="modal-content">
						<h3>Confirmar exclusão</h3>
						<p>
							Tem certeza que deseja excluir a despesa{" "}
							<b>{deleteItem?.descricao}</b>?
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
