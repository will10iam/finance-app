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
	const [tipo, setTipo] = useState("Receita");
	const [status, setStatus] = useState("Pendente");
	const [idCategoria, setIdCategoria] = useState(false);

	const [descricao, setDescricao] = useState("");
	const [valor, setValor] = useState("");
	const [dataRecebimento, setDataRecebimento] = useState("");

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
		const docRef = doc(db, "receitas", id);
		await getDoc(docRef)
			.then((snapshot) => {
				setTipo(snapshot.data().tipo);
				//setComplemento(snapshot.data().complemento);
				setStatus(snapshot.data().status);

				let index = lista.findIndex(
					(item) => item.id === snapshot.data().clienteID
				);
				setCategoriaSelected(index);
				setIdCategoria(true);
				setDescricao(snapshot.data().descricao);
				setValor(snapshot.data().valor);
				setDataRecebimento(snapshot.data().dataRecebimento);
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
			const docRef = doc(db, "receitas", id);
			await updateDoc(docRef, {
				categoria: categorias[categoriaSelected].nomeCategoria,
				categoriaID: categorias[categoriaSelected].id,
				tipo: tipo,
				//complemento: complemento,
				status: status,
				descricao: descricao,
				valor: parseFloat(valor.replace(/[R$\s.]/g, "").replace(",", ".")),
				dataRecebimento: dataRecebimento,
				userID: user.uid,
			})
				.then(() => {
					toast.success("Atualizado com sucesso");
					setCategoriaSelected(0);
					//setComplemento("");
					navigate("/dashboard");
				})
				.catch((error) => {
					toast.error("Opa! Alguma coisa deu errado.");
					console.log(error);
				});

			return;
		}

		await addDoc(collection(db, "receitas"), {
			created: new Date(),
			categoria: categorias[categoriaSelected].nomeCategoria,
			categoriaID: categorias[categoriaSelected].id,
			tipo: tipo,
			//complemento: complemento,
			status: status,
			descricao: descricao,
			valor: parseFloat(valor.replace(/[R$\s.]/g, "").replace(",", ".")),
			dataRecebimento: dataRecebimento,
			userID: user.uid,
		})
			.then(() => {
				toast.success("CHAMADO REGISTRADO COM SUCESSO");
				//setComplemento("");
				setCategoriaSelected(0);
			})
			.catch((error) => {
				toast.error(
					"ERRO AO REGISTRAR, VERIFIQUE OS CAMPOS E TENTE NOVAMENTE!"
				);
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
				<Title name={id ? "Editando receita" : "Nova Receita"}>
					<span>
						{id ? <FiEdit size={25} /> : <LiaMoneyBillWaveSolid size={25} />}
					</span>
				</Title>

				<div className="container">
					<form className="form-profile" onSubmit={handleRegister}>
						<label>Tipo</label>
						<select value={tipo} onChange={handleChangeSelect}>
							<option value="Criação de Site">Receita</option>
							<option value="Criação de Artes">Despesa</option>
						</select>

						<label>Descrição</label>
						<input
							type="text"
							placeholder="Descrição da receita"
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

						<label>Data de Recebimento</label>
						<input
							type="date"
							value={dataRecebimento}
							onChange={(e) => setDataRecebimento(e.target.value)}
						/>

						<label>Status</label>
						<div className="status">
							<input
								type="radio"
								name="radio"
								value="Pendente"
								onChange={handleOptionChange}
								checked={status === "Pendente"}
							/>
							<span>Pendente</span>

							<input
								type="radio"
								name="radio"
								value="Recebida"
								onChange={handleOptionChange}
								checked={status === "Recebida"}
							/>
							<span>Recebida</span>

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
