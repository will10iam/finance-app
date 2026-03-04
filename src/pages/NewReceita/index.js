import "./index.css";
import Title from "../../components/Title";
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

export default function NewReceita() {
	const { user } = useContext(AuthContext);
	const { id } = useParams();
	const navigate = useNavigate();

	const [categoriaSelected, setCategoriaSelected] = useState(0);
	const [categorias, setCategorias] = useState([]);
	const [loadCategoria, setLoadCategoria] = useState(true);

	const [tipo, setTipo] = useState("Receita");
	const [status, setStatus] = useState("À Receber");
	const [idCategoria, setIdCategoria] = useState(false);

	const [descricao, setDescricao] = useState("");
	const [valor, setValor] = useState("");
	const [dataRecebimento, setDataRecebimento] = useState("");

	useEffect(() => {
		async function loadCategorias() {
			try {
				const snapshot = await getDocs(listRef);
				const lista = snapshot.docs.map((d) => ({
					id: d.id,
					nomeCategoria: d.data().nomeCategoria,
				}));

				if (snapshot.size === 0) {
					setCategorias([{ id: "1", nomeCategoria: "FREELA" }]);
					setLoadCategoria(false);
					return;
				}

				setCategorias(lista);
				setLoadCategoria(false);

				if (id) loadId(lista);
			} catch (error) {
				console.log("ERRO AO BUSCAR AS CATEGORIAS", error);
				setCategorias([{ id: "1", nomeCategoria: "FREELA" }]);
				setLoadCategoria(false);
			}
		}

		loadCategorias();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function loadId(lista) {
		try {
			const docRef = doc(db, "receitas", id);
			const snapshot = await getDoc(docRef);

			setTipo(snapshot.data().tipo);
			setStatus(snapshot.data().status);

			const index = lista.findIndex(
				(item) => item.id === snapshot.data().categoriaID,
			);
			setCategoriaSelected(index >= 0 ? index : 0);
			setIdCategoria(true);

			setDescricao(snapshot.data().descricao);
			setValor(formatarMoeda(String(snapshot.data().valor)));
			setDataRecebimento(snapshot.data().dataRecebimento);
		} catch (error) {
			console.log(error);
			setIdCategoria(false);
		}
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

	function moedaParaNumero(valor) {
		if (!valor) return 0;

		return parseFloat(
			valor
				.replace("R$", "")
				.replace(/\s/g, "")
				.replace(/\./g, "")
				.replace(",", "."),
		);
	}

	async function handleRegister(e) {
		e.preventDefault();

		const valorConvertido = moedaParaNumero(valor);

		if (!descricao || !dataRecebimento || !valorConvertido) {
			toast.error("Preencha os campos corretamente.");
			return;
		}

		try {
			if (idCategoria) {
				const docRef = doc(db, "receitas", id);
				await updateDoc(docRef, {
					categoria: categorias[categoriaSelected]?.nomeCategoria ?? "",
					categoriaID: categorias[categoriaSelected]?.id ?? "",
					tipo,
					status,
					descricao,
					valor: valorConvertido,
					dataRecebimento,
					userID: user.uid,
				});

				toast.success("Atualizado com sucesso");
				setCategoriaSelected(0);
				navigate("/transacoes");
				return;
			}

			await addDoc(collection(db, "receitas"), {
				created: new Date(),
				categoria: categorias[categoriaSelected]?.nomeCategoria ?? "",
				categoriaID: categorias[categoriaSelected]?.id ?? "",
				tipo,
				status,
				descricao,
				valor: valorConvertido,
				dataRecebimento,
				userID: user.uid,
			});

			toast.success("Receita registrada com sucesso!");
			setCategoriaSelected(0);
			navigate("/transacoes");
		} catch (error) {
			toast.error("Erro ao registrar. Verifique os campos.");
			console.log(error);
		}
	}

	function formatarMoeda(valorDigitado) {
		const valorNumerico = String(valorDigitado).replace(/\D/g, "");
		if (!valorNumerico) return "R$ 0,00";

		const valorFloat = (parseInt(valorNumerico, 10) / 100).toFixed(2);

		return Number(valorFloat).toLocaleString("pt-BR", {
			style: "currency",
			currency: "BRL",
		});
	}

	return (
		<div className="new-receita-page">
			<div className="new-receita-header">
				<Title name={id ? "Editando receita" : "Nova Receita"} />
			</div>

			<div className="new-receita-card">
				<form className="new-receita-form" onSubmit={handleRegister}>
					<div className="new-receita-field">
						<label>Tipo</label>
						<select value={tipo} onChange={handleChangeSelect}>
							<option value="Receita">Receita</option>
							<option value="Despesa">Despesa</option>
						</select>
					</div>

					<div className="new-receita-field">
						<label>Descrição</label>
						<input
							type="text"
							placeholder="Descrição da receita"
							value={descricao}
							onChange={(e) => setDescricao(e.target.value)}
							autoComplete="off"
						/>
					</div>

					<div className="new-receita-field">
						<label>Valor</label>
						<input
							type="text"
							placeholder="R$ 0,00"
							value={valor}
							onChange={(e) => setValor(formatarMoeda(e.target.value))}
							autoComplete="off"
						/>
					</div>

					<div className="new-receita-field">
						<label>Categoria</label>
						{loadCategoria ? (
							<input type="text" disabled value="Carregando..." />
						) : (
							<select
								value={categoriaSelected}
								onChange={handleChangeCategoria}
							>
								{categorias.map((item, index) => (
									<option key={item.id} value={index}>
										{item.nomeCategoria}
									</option>
								))}
							</select>
						)}
					</div>

					<div className="new-receita-field">
						<label>Data de Recebimento</label>
						<input
							type="date"
							value={dataRecebimento}
							onChange={(e) => setDataRecebimento(e.target.value)}
						/>
					</div>

					<div className="new-receita-field">
						<label>Status</label>
						<div className="new-receita-status">
							<label className="new-receita-status-option">
								<input
									type="radio"
									name="status"
									value="À Receber"
									onChange={handleOptionChange}
									checked={status === "À Receber"}
								/>
								<span>À Receber</span>
							</label>

							<label className="new-receita-status-option">
								<input
									type="radio"
									name="status"
									value="Recebido"
									onChange={handleOptionChange}
									checked={status === "Recebido"}
								/>
								<span>Recebido</span>
							</label>
						</div>
					</div>

					<button type="submit" className="new-receita-btn">
						Registrar
					</button>
				</form>
			</div>
		</div>
	);
}
