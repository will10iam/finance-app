import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Title from "../../components/Title";
import "./index.css";
import { FiEdit2, FiPlus, FiSearch } from "react-icons/fi";
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

	useEffect(() => {
		async function loadReceitas() {
			const q = query(listRef, orderBy("created", "desc"), limit(1));

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

	function toggleModal(item) {
		setShowPostModal(!showPostModal);
		setDetail(item);
	}

	if (loading) {
		return (
			<div>
				<Sidebar />
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
			<Sidebar />
			<div className="content">
				<Title name="Receitas">
					<GiTakeMyMoney size={25} />
				</Title>
				<>
					{receitas.length === 0 ? (
						<div className="container dashboard">
							<span>Nenhuma receita encontrada...</span>
							<Link to="/new" className="new">
								<FiPlus color="#FFF" size={25} />
								Add Receita
							</Link>
						</div>
					) : (
						<>
							<Link to="/new" className="new">
								<FiPlus color="#FFF" size={25} />
								Add Receita
							</Link>

							<table>
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
									{receitas.map((item, index) => {
										return (
											<tr key={index}>
												<td data-label="Tipo">{item.tipo}</td>
												<td data-label="Descrição">{item.descricao}</td>
												<td data-label="Valor">{item.valor}</td>
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
														to={`/new/${item.id}`}
														className="action"
														style={{ backgroundColor: "#f6a935" }}
													>
														<FiEdit2 color="#FFF" size={17} />
													</Link>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>

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
		</>
	);
}
