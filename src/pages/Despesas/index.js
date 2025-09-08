import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Title from "../../components/Title";
import "./index.css";
import { FiEdit2, FiPlus, FiSearch, FiTrash } from "react-icons/fi";
import { RiBillLine } from "react-icons/ri";

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

	useEffect(() => {
		async function loadDespesas() {
			const q = query(listRef, orderBy("created", "desc"), limit(1));

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
			limit(1)
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

	function toggleModal(item) {
		setShowPostModal(!showPostModal);
		setDetail(item);
	}

	function toggleModalDelete(item) {
		setDeleteItem(item);
		setShowDeleteModal(true);
	}

	if (loading) {
		return (
			<div>
				<Sidebar />
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
			<Sidebar />
			<div className="content">
				<Title name="Despesas">
					<RiBillLine size={25} />
				</Title>
				<>
					{despesas.length === 0 ? (
						<div className="container dashboard">
							<span>Nenhuma despesa encontrada...</span>
							<Link to="/newDespesa" className="new">
								<FiPlus color="#FFF" size={25} />
								Add Despesa
							</Link>
						</div>
					) : (
						<>
							<Link to="/newDespesa" className="new">
								<FiPlus color="#FFF" size={25} />
								Add Despesa
							</Link>

							<table>
								<thead>
									<tr>
										<th scope="col">Tipo</th>
										<th scope="col">Descrição</th>
										<th scope="col">Valor</th>
										<th scope="col">Categoria</th>
										<th scope="col">Data Vencimento</th>
										<th scope="col">Data Pagamento</th>
										<th scope="col">Status</th>
										<th scope="col">Cadastrado em</th>
										<th scope="col">Ações</th>
									</tr>
								</thead>
								<tbody>
									{despesas.map((item, index) => {
										return (
											<tr key={index}>
												<td data-label="Tipo">{item.tipo}</td>
												<td data-label="Descrição">{item.descricao}</td>
												<td data-label="Valor">R${item.valor}</td>
												<td data-label="Categoria">{item.categoria}</td>
												<td data-label="Data Vencimento">
													{item.dataVencimento}
												</td>
												<td data-label="Data Pagamento">
													{item.dataPagamento}
												</td>
												<td data-label="Status">
													<span
														className="badge"
														style={{
															backgroundColor:
																item.status === "Em Aberto"
																	? "#999"
																	: item.status === "Paga"
																	? "#35f645ff"
																	: "#f63b35ff",
														}}
													>
														{item.status}
													</span>
												</td>
												<td data-label="Cadastrado">{item.createdFormat}</td>
												<td data-label="#">
													<button
														className="action"
														style={{ backgroundColor: "#3583f6" }}
														onClick={() => toggleModal(item)}
													>
														<FiSearch color="#FFF" size={17} />
													</button>
													<Link
														to={`/newDespesa/${item.id}`}
														className="action"
														style={{ backgroundColor: "#f6a935" }}
													>
														<FiEdit2 color="#FFF" size={17} />
													</Link>
													<button
														className="action"
														style={{ backgroundColor: "#f63535" }}
														onClick={() => toggleModalDelete(item)}
													>
														<FiTrash color="#FFF" size={17} />
													</button>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>

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
