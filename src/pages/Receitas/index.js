import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Title from "../../components/Title";
import NavBar from "../../components/NavBar";
import DropdownMes from "../../components/DropdownMes";
import "./index.css";
import { FiEdit2, FiPlus, FiSearch, FiTrash } from "react-icons/fi";
import { GoArrowDownRight } from "react-icons/go";
import { FaRegTrashAlt, FaRegEdit } from "react-icons/fa";
import { GiTakeMyMoney } from "react-icons/gi";
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

const listRef = collection(db, "receitas");

export default function Receitas() {
	const [receitas, setReceitas] = useState([]);
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
		async function loadReceitas() {
			const q = query(listRef, orderBy("created", "desc"), limit(20));

			const querySnapshot = await getDocs(q);
			setReceitas([]);
			await updateState(querySnapshot);

			setLoading(false);
		}

		loadReceitas();
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
					dataRecebimento: doc.data().dataRecebimento,
					created: doc.data().created,
					createdFormat: format(doc.data().created.toDate(), "dd/MM/yyyy"),
					// complemento: doc.data().complemento,
					status: doc.data().status,
				});
			});

			const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

			setReceitas((receitas) => [...receitas, ...lista]);
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
			await deleteDoc(doc(db, "receitas", deleteItem.id));

			setReceitas((prev) => prev.filter((r) => r.id !== deleteItem.id));
			setShowDeleteModal(false);
			setDeleteItem(null);
		} catch (error) {
			console.log("Erro ao deletar receita", error);
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
				{/* <Sidebar /> */}
				<div className="content">
					<Title name="Receitas">
						<GiTakeMyMoney size={25} />
					</Title>

					<div className="container dashboard">
						<span>Buscando receitas do casal...</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			{/* 	<Sidebar /> */}
			<NavBar />
			<div className="content">
				{/* <div className="filtro">
					<label>Filtrar por mês:</label>
					<input
						type="month"
						value={mesFiltro}
						onChange={(e) => setMesFiltro(e.target.value)}
					/>
				</div */}
				<Title name="Receitas">
					<GiTakeMyMoney size={30} />
				</Title>

				<div className="filtro-mes">
					<DropdownMes mesFiltro={mesFiltro} setMesFiltro={setMesFiltro} />
					<Link to="/newReceita" className="add_button">
						<FiPlus color="#FFF" size={25} />
						Nova Receita
					</Link>
				</div>
				<>
					{receitas.length === 0 ? (
						<div className="container dashboard">
							<span>Nenhuma receita encontrada...</span>
							{/* <Link to="/newReceita" className="new">
								<FiPlus color="#FFF" size={25} />
								Add Receita
							</Link> */}
						</div>
					) : (
						<>
							{/* <Link to="/newReceita" className="new">
								<FiPlus color="#FFF" size={25} />
								Add Receita
							</Link> */}
							{receitas
								.filter((item) => {
									if (!mesFiltro) return true;
									const [anoFiltro, mesFiltroNum] = mesFiltro.split("-");
									const [anoItem, mesItem] = item.dataRecebimento.split("-");

									return anoItem === anoFiltro && mesItem === mesFiltroNum;
								})
								.map((item, index) => {
									return (
										<div className="cardReceitas" key={index}>
											<div className="cardReceitas_content">
												<div className="cardReceitas_icon">
													<GoArrowDownRight color="#059669" size={25} />
												</div>
												<div className="cardReceitas_info">
													<div className="cardReceitas_title">
														<p>{item.descricao}</p>
														<span>{item.categoria}</span>
													</div>
													<h3>{formatarDataBR(item.dataRecebimento)}</h3>
												</div>
												<div className="cardReceitas_value">
													<h2>+ {formatarValorBRL(item.valor)}</h2>
												</div>
												<div className="cardReceitas_actions">
													<div onClick={() => toggleModalDelete(item)}>
														<FaRegTrashAlt size={20} />
													</div>
													<Link to={`/newReceita/${item.id}`}>
														<FaRegEdit color="#FFF" size={20} />
													</Link>
												</div>
											</div>
										</div>
									);
								})}
							{/* <table>
								<thead>
									<tr>
										<th scope="col">Tipo</th>
										<th scope="col">Descrição</th>
										<th scope="col">Valor</th>
										<th scope="col">Categoria</th>
										<th scope="col">Data Recebida</th>
										<th scope="col">Status</th>
										<th scope="col">Cadastrado em</th>
										<th scope="col">Ações</th>
									</tr>
								</thead>
								<tbody>
									{receitas
										.filter((item) => {
											if (!mesFiltro) return true;
											const [anoFiltro, mesFiltroNum] = mesFiltro.split("-");
											const [anoItem, mesItem] =
												item.dataRecebimento.split("-");

											return anoItem === anoFiltro && mesItem === mesFiltroNum;
										})
										.map((item, index) => {
											return (
												<tr key={index}>
													<td data-label="Tipo">{item.tipo}</td>
													<td data-label="Descrição">{item.descricao}</td>
													<td data-label="Valor">R${item.valor}</td>
													<td data-label="Categoria">{item.categoria}</td>
													<td data-label="Data Recebida">
														{item.dataRecebimento}
													</td>
													<td data-label="Status">
														<span
															className="badge"
															style={{
																backgroundColor:
																	item.status === "À receber"
																		? "#f6d935ff"
																		: item.status === "Recebido"
																		? "#35f645ff"
																		: "#999",
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
															to={`/newReceita/${item.id}`}
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
							</table> */}
							{loadingMore && <h3>Buscando mais receitas..</h3>}
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
