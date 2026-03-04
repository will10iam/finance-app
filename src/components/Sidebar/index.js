/* import { useState } from "react";
import "./index.css";
import LogOut from "../LogOutButton";

export default function Sidebar({ isOpen, onClose }) {
	const [openCadastro, setOpenCadastro] = useState(false);

	return (
		<>
			{/* Overlay 
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
 */

import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "./index.css";
import LogOut from "../LogOutButton";

export default function Sidebar({ isOpen, onClose }) {
	const [openCadastro, setOpenCadastro] = useState(false);

	// (Opcional) Fechar com ESC
	useEffect(() => {
		function onKeyDown(e) {
			if (e.key === "Escape") onClose?.();
		}
		if (isOpen) window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [isOpen, onClose]);

	// (Opcional) travar scroll quando abrir
	useEffect(() => {
		if (!isOpen) return;
		const original = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = original;
		};
	}, [isOpen]);

	return (
		<>
			{isOpen && (
				<div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />
			)}

			<aside
				className={`sidebar ${isOpen ? "open" : ""}`}
				aria-hidden={!isOpen}
				aria-label="Menu lateral"
			>
				<div className="sidebar-header">
					<div className="sidebar-brand">
						<h1 className="sidebar-logo">MeuApp</h1>
						<span className="sidebar-subtitle">Finance</span>
					</div>

					<button
						type="button"
						className="sidebar-close"
						onClick={onClose}
						aria-label="Fechar menu"
						title="Fechar"
					>
						×
					</button>
				</div>

				<nav className="sidebar-nav">
					<NavLink
						to="/dashboard"
						className={({ isActive }) =>
							`sidebar-link ${isActive ? "active" : ""}`
						}
						onClick={onClose}
					>
						Dashboard
					</NavLink>

					<NavLink
						to="/transacoes"
						className={({ isActive }) =>
							`sidebar-link ${isActive ? "active" : ""}`
						}
						onClick={onClose}
					>
						Transações
					</NavLink>

					<button
						type="button"
						className={`sidebar-link sidebar-dropdown-btn ${
							openCadastro ? "expanded" : ""
						}`}
						onClick={() => setOpenCadastro((prev) => !prev)}
						aria-expanded={openCadastro}
					>
						<span>Cadastros</span>
						<span className={`sidebar-arrow ${openCadastro ? "open" : ""}`}>
							▾
						</span>
					</button>

					<div className={`sidebar-dropdown ${openCadastro ? "open" : ""}`}>
						<NavLink
							to="/categorias"
							className={({ isActive }) =>
								`sidebar-sublink ${isActive ? "active" : ""}`
							}
							onClick={onClose}
						>
							Categoria
						</NavLink>

						<NavLink
							to="/newReceita"
							className={({ isActive }) =>
								`sidebar-sublink ${isActive ? "active" : ""}`
							}
							onClick={onClose}
						>
							Nova Receita
						</NavLink>

						<NavLink
							to="/newDespesa"
							className={({ isActive }) =>
								`sidebar-sublink ${isActive ? "active" : ""}`
							}
							onClick={onClose}
						>
							Nova Despesa
						</NavLink>

						<NavLink
							to="/saldos"
							className={({ isActive }) =>
								`sidebar-sublink ${isActive ? "active" : ""}`
							}
							onClick={onClose}
						>
							Saldos
						</NavLink>
					</div>
				</nav>

				<div className="sidebar-footer">
					<LogOut />
				</div>
			</aside>
		</>
	);
}
