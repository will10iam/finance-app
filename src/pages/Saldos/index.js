/* import { useEffect, useState, useContext } from "react";
import { db } from "../../services/firebaseConection";
import { AuthContext } from "../../contexts/auth";
import { addDoc, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PiggyBankIcon } from "@phosphor-icons/react";
import Title from "../../components/Title";
import "./index.css";

export default function Saldos() {
	const [descricao, setDescricao] = useState("");
	const [valor, setValor] = useState("");
	const [dataAtualizacao, setDataAtualizacao] = useState("");

	const { user } = useContext(AuthContext);
	const navigate = useNavigate();

	async function handleRegister(e) {
		e.preventDefault();

		if (!descricao || !valor || !dataAtualizacao) {
			toast.error("Preencha todos os campos");
			return;
		}

		const valorNumber = Number(valor);

		if (isNaN(valorNumber)) {
			toast.error("Informe um valor válido");
			return;
		}

		try {
			await addDoc(collection(db, "saldos"), {
				descricao,
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
		<>
			<div className="content_title">
				<Title name="Crie um novo saldo" />
				{/* <PiggyBankIcon size={25} /> 
			</div>

			<div className="content">
				<div className="content_form">
					<form onSubmit={handleRegister} className="forms">
						<label>Descrição</label>
						<input
							type="text"
							placeholder="insira de onde é o saldo"
							value={descricao}
							onChange={(e) => setDescricao(e.target.value)}
						/>

						<label>Valor</label>
						<input
							type="number"
							step="0.01"
							placeholder="R$0,00"
							value={valor}
							onChange={(e) => setValor(e.target.value)}
						/>

						<label>Data de Atualização</label>
						<input
							type="date"
							value={dataAtualizacao}
							onChange={(e) => setDataAtualizacao(e.target.value)}
						/>

						<button type="submit" className="content_form_button">
							Salvar
						</button>
					</form>
				</div>
			</div>
		</>
	);
}
 */

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
				userID: user?.uid,
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
			<div className="content_title">
				<Title name="Crie um novo saldo" />
			</div>

			<div className="content">
				<div className="content_form">
					<form onSubmit={handleRegister} className="forms">
						<div className="field">
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

						<div className="field">
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

						<div className="field">
							<label htmlFor="dataAtualizacao">Data de Atualização</label>
							<input
								id="dataAtualizacao"
								type="date"
								value={dataAtualizacao}
								onChange={(e) => setDataAtualizacao(e.target.value)}
							/>
						</div>

						<div className="actions">
							<button type="submit" className="content_form_button">
								Salvar
							</button>
							<button
								type="button"
								className="btn-secondary"
								onClick={() => navigate(-1)}
							>
								Cancelar
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
