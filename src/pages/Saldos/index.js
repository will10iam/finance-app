import { useState, useContext } from "react";
import { addDoc, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { db } from "../../services/firebaseConection";
import { AuthContext } from "../../contexts/auth";

import Title from "../../components/Title";
import "./index.css";

export default function Saldos() {
	const [descricao, setDescricao] = useState("");
	const [valor, setValor] = useState("");
	const [dataAtualizacao, setDataAtualizacao] = useState("");

	const { user } = useContext(AuthContext);
	const navigate = useNavigate();

	function moedaParaNumero(valorFormatado) {
		if (!valorFormatado) return 0;

		return parseFloat(
			valorFormatado
				.replace("R$", "")
				.replace(/\s/g, "")
				.replace(/\./g, "")
				.replace(",", "."),
		);
	}

	function formatarMoeda(valorDigitado) {
		const apenasNumeros = String(valorDigitado).replace(/\D/g, "");

		if (!apenasNumeros) return "R$ 0,00";

		const num = (parseInt(apenasNumeros, 10) / 100).toFixed(2);

		return Number(num).toLocaleString("pt-BR", {
			style: "currency",
			currency: "BRL",
		});
	}

	async function handleRegister(e) {
		e.preventDefault();

		if (!user?.uid) {
			toast.error("Você precisa estar logado.");
			return;
		}

		if (!descricao || !valor || !dataAtualizacao) {
			toast.error("Preencha todos os campos");
			return;
		}

		const valorNumber = moedaParaNumero(valor);
		if (Number.isNaN(valorNumber) || valorNumber <= 0) {
			toast.error("Informe um valor válido");
			return;
		}

		try {
			await addDoc(collection(db, "saldos"), {
				descricao: descricao.trim(),
				valor: valorNumber,
				dataAtualizacao,
				created: new Date(),
				userID: user.uid,
			});

			toast.success("Novo saldo salvo com sucesso!");
			navigate("/dashboard");
		} catch (error) {
			console.error(error);
			toast.error("Erro ao salvar saldo");
		}
	}

	return (
		<div className="saldos-page">
			<div className="saldos-header">
				<Title name="Crie um novo saldo" />
			</div>

			<div className="saldos-card">
				<form onSubmit={handleRegister} className="saldos-form">
					<div className="saldos-field">
						<label htmlFor="descricao">Descrição</label>
						<input
							id="descricao"
							type="text"
							placeholder="Ex: Nubank, Banco do Brasil..."
							value={descricao}
							onChange={(e) => setDescricao(e.target.value)}
							autoComplete="off"
						/>
					</div>

					<div className="saldos-field">
						<label htmlFor="valor">Valor</label>
						<input
							id="valor"
							type="text"
							inputMode="numeric"
							placeholder="R$ 0,00"
							value={valor}
							onChange={(e) => setValor(formatarMoeda(e.target.value))}
							autoComplete="off"
						/>
					</div>

					<div className="saldos-field">
						<label htmlFor="dataAtualizacao">Data de Atualização</label>
						<input
							id="dataAtualizacao"
							type="date"
							value={dataAtualizacao}
							onChange={(e) => setDataAtualizacao(e.target.value)}
						/>
					</div>

					<div className="saldos-actions">
						<button type="submit" className="saldos-btn saldos-btn-primary">
							Salvar
						</button>
						<button
							type="button"
							className="saldos-btn saldos-btn-secondary"
							onClick={() => navigate(-1)}
						>
							Cancelar
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
