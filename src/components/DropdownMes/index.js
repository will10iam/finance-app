import React, { useState } from "react";
import "./index.css";

export default function DropdownMes({ mesFiltro, setMesFiltro }) {
	const [open, setOpen] = useState(false);

	// Lista de meses
	const meses = [
		{ nome: "Janeiro", valor: "2025-01" },
		{ nome: "Fevereiro", valor: "2025-02" },
		{ nome: "Março", valor: "2025-03" },
		{ nome: "Abril", valor: "2025-04" },
		{ nome: "Maio", valor: "2025-05" },
		{ nome: "Junho", valor: "2025-06" },
		{ nome: "Julho", valor: "2025-07" },
		{ nome: "Agosto", valor: "2025-08" },
		{ nome: "Setembro", valor: "2025-09" },
		{ nome: "Outubro", valor: "2025-10" },
		{ nome: "Novembro", valor: "2025-11" },
		{ nome: "Dezembro", valor: "2025-12" },
	];

	// Nome exibido (ex: OUTUBRO)
	const mesAtualNome =
		meses.find((m) => m.valor === mesFiltro)?.nome.toLocaleUpperCase() ||
		"Todos";

	const handleSelect = (valor) => {
		setMesFiltro(valor);
		setOpen(false);
	};

	return (
		<div className="dropdown-mes">
			<button className="dropdown-button" onClick={() => setOpen(!open)}>
				{mesAtualNome}
				<span className={`arrow ${open ? "up" : "down"}`}>▼</span>
			</button>

			{open && (
				<ul className="dropdown-list">
					<li onClick={() => handleSelect("")}>Todos</li>
					{meses.map((m) => (
						<li key={m.valor} onClick={() => handleSelect(m.valor)}>
							{m.nome}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
