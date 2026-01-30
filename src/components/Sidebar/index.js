import { useState } from "react";
import "./index.css";
import LogOut from "../LogOutButton";

export default function Sidebar({ isOpen, onClose }) {
	const [openCadastro, setOpenCadastro] = useState(false);

	return (
		<>
			{/* Overlay */}
			{isOpen && <div className="sidebar-overlay" onClick={onClose} />}

			<aside className={`sidebar ${isOpen ? "open" : ""}`}>
				<div className="sidebar-header">
					<h1 className="logo">MeuApp</h1>
				</div>

				<nav className="sidebar-nav">
					<a href="/dashboard">Dashboard</a>
					<a href="/transacoes">Transações</a>

					<button
						className="dropdown-toggle"
						onClick={() => setOpenCadastro(!openCadastro)}
					>
						Cadastros
						<span className={`arrow ${openCadastro ? "open" : ""}`}>▾</span>
					</button>

					{openCadastro && (
						<div className="dropdown-menu">
							<a href="/categorias">Categoria</a>
							<a href="/newReceita">Nova Receita</a>
							<a href="/newDespesa">Nova Despesa</a>
							<a href="/saldos">Saldos</a>
						</div>
					)}
				</nav>

				<div className="sidebar-footer">
					<LogOut />
				</div>
			</aside>
		</>
	);
}
