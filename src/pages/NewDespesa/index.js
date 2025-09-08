import "./index.css";
import Sidebar from "../../components/Sidebar";
import Title from "../../components/Title";
import { FiEdit } from "react-icons/fi";
import { LiaMoneyBillWaveSolid } from "react-icons/lia";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/auth";
import { db } from "../../services/firebaseConection";
import {
	collection,
	getDocs,
	getDoc,
	doc,
	addDoc,
	updateDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

const listRef = collection(db, "categorias");

export default function New() {
	const { user } = useContext(AuthContext);

	const { id } = useParams();

	const navigate = useNavigate();

	const [categoriaSelected, setCategoriaSelected] = useState(0);

	const [categorias, setCategorias] = useState([]);
	const [loadCategoria, setLoadCategoria] = useState(true);

	//const [complemento, setComplemento] = useState("");
	const [tipo, setTipo] = useState("");
	const [status, setStatus] = useState("Em Aberto");
	const [idCategoria, setIdCategoria] = useState(false);

	const [descricao, setDescricao] = useState("");
	const [valor, setValor] = useState("");
	const [dataPagamento, setDataPagamento] = useState("");
	const [dataVencimento, setDataVencimento] = useState("");

	useEffect(() => {
		async function loadCategorias() {
			const querySnapshot = await getDocs(listRef)
				.then((snapshot) => {
					let lista = [];

					snapshot.forEach((doc) => {
						lista.push({
							id: doc.id,
							nomeCategoria: doc.data().nomeCategoria,
						});
					});

					if (snapshot.docs.size === 0) {
						console.log("NENHUMA CATEGORIA ENCONTRADA");
						setCategorias([{ id: "1", nomeCategoria: "FREELA" }]);
						setLoadCategoria(false);
						return;
					}

					setCategorias(lista);
					setLoadCategoria(false);

					if (id) {
						loadId(lista);
					}
				})
				.catch((error) => {
					console.log("ERRO AO BUSCAR AS CATEGORIAS", error);
					setLoadCategoria(false);
					setCategorias([{ id: "1", nomeCategoria: "FREELA" }]);
				});
		}
		loadCategorias();
	}, [id]);

	async function loadId(lista) {
		const docRef = doc(db, "despesas", id);
		await getDoc(docRef)
			.then((snapshot) => {
				setTipo(snapshot.data().tipo);
				//setComplemento(snapshot.data().complemento);
				setStatus(snapshot.data().status);

				let index = lista.findIndex(
					(item) => item.id === snapshot.data().categoriaID
				);
				setCategoriaSelected(index);
				setIdCategoria(true);
				setDescricao(snapshot.data().descricao);
				setValor(snapshot.data().valor);
				setDataPagamento(snapshot.data().dataPagamento);
				setDataVencimento(snapshot.data().dataVencimento);
			})
			.catch((error) => {
				console.log(error);
				setIdCategoria(false);
			});
	}

	function handleOptionChange(e) {
		setStatus(e.target.value);
	}

	function handleChangeSelect(e) {
		setTipo(e.target.value);
	}

	function handleChangeCategoria(e) {
		setCategoriaSelected(e.target.value);
	}

	async function handleRegister(e) {
		e.preventDefault();

		if (idCategoria) {
			const docRef = doc(db, "despesas", id);
			await updateDoc(docRef, {
				categoria: categorias[categoriaSelected].nomeCategoria,
				categoriaID: categorias[categoriaSelected].id,
				tipo: tipo,
				//complemento: complemento,
				status: status,
				descricao: descricao,
				valor: parseFloat(
					String(valor)
						.replace(/[R$\s.]/g, "")
						.replace(",", ".")
				),
				dataPagamento: dataPagamento,
				dataVencimento: dataVencimento,
				userID: user.uid,
			})
				.then(() => {
					toast.success("Atualizado com sucesso");
					setCategoriaSelected(0);
					//setComplemento("");
					navigate("/despesas");
				})
				.catch((error) => {
					toast.error("Opa! Alguma coisa deu errado.");
					console.log(error);
				});

			return;
		}

		await addDoc(collection(db, "despesas"), {
			created: new Date(),
			categoria: categorias[categoriaSelected].nomeCategoria,
			categoriaID: categorias[categoriaSelected].id,
			tipo: tipo,
			//complemento: complemento,
			status: status,
			descricao: descricao,
			valor: parseFloat(
				String(valor)
					.replace(/[R$\s.]/g, "")
					.replace(",", ".")
			),
			dataPagamento: dataPagamento,
			dataVencimento: dataVencimento,
			userID: user.uid,
		})
			.then(() => {
				toast.success("Despesa registrada com sucesso!");
				//setComplemento("");
				setCategoriaSelected(0);
			})
			.catch((error) => {
				toast.error("Opa! Alguma coisa deu errado. Verifique os campos.");
				console.log(error);
			});
	}

	function formatarMoeda(valorDigitado) {
		// Remove tudo que não for número
		const valorNumerico = valorDigitado.replace(/\D/g, "");

		// Converte para número e divide por 100 para colocar os centavos
		const valorFloat = parseFloat(valorNumerico) / 100;

		// Formata como BRL
		return valorFloat.toLocaleString("pt-BR", {
			style: "currency",
			currency: "BRL",
		});
	}

	return (
		<div>
			<Sidebar />

			<div className="content">
				<Title name={id ? "Editando despesa" : "Nova Despesa"}>
					<span>
						{id ? <FiEdit size={25} /> : <LiaMoneyBillWaveSolid size={25} />}
					</span>
				</Title>

				<div className="container">
					<form className="form-profile" onSubmit={handleRegister}>
						<label>Tipo</label>
						<select value={tipo} onChange={handleChangeSelect}>
							<option value="Receita">Receita</option>
							<option value="Despesa">Despesa</option>
						</select>

						<label>Descrição</label>
						<input
							type="text"
							placeholder="Descrição da despesa"
							value={descricao}
							onChange={(e) => setDescricao(e.target.value)}
						/>

						<label>Valor</label>
						<input
							type="text"
							placeholder="R$ 0,00"
							value={valor}
							onChange={(e) => setValor(formatarMoeda(e.target.value))}
						/>

						<label>Categoria</label>
						{loadCategoria ? (
							<input type="text" disabled={true} value="Carregando..." />
						) : (
							<select
								value={categoriaSelected}
								onChange={handleChangeCategoria}
							>
								{categorias.map((item, index) => {
									return (
										<option key={index} value={index}>
											{item.nomeCategoria}
										</option>
									);
								})}
							</select>
						)}

						<label>Data de Pagamento</label>
						<input
							type="date"
							value={dataPagamento}
							onChange={(e) => setDataPagamento(e.target.value)}
						/>

						<label>Data de Vencimento</label>
						<input
							type="date"
							value={dataVencimento}
							onChange={(e) => setDataVencimento(e.target.value)}
						/>

						<label>Status</label>
						<div className="status">
							<input
								type="radio"
								name="radio"
								value="Em Aberto"
								onChange={handleOptionChange}
								checked={status === "Em Aberto"}
							/>
							<span>Em Aberto</span>

							<input
								type="radio"
								name="radio"
								value="Paga"
								onChange={handleOptionChange}
								checked={status === "Paga"}
							/>
							<span>Paga</span>

							{/* <input
								type="radio"
								name="radio"
								value="Finalizado"
								onChange={handleOptionChange}
								checked={status === "Finalizado"}
							/>
							<span>Finalizado</span> */}
						</div>

						{/* <label>Complemento</label>
						<textarea
							type="text"
							placeholder="Descreva seu problema."
							value={complemento}
							onChange={(e) => setComplemento(e.target.value)}
						/> */}

						<button type="submit">Registrar</button>
					</form>
				</div>
			</div>
		</div>
	);
}
