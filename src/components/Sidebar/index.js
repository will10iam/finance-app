import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "./index.css";
import LogOut from "../LogOutButton";
import logo from "../../assets/logo5.png";

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
						{/* <h1 className="sidebar-logo">MeuApp</h1>
						<span className="sidebar-subtitle">Finance</span> */}
						<img src={logo} alt="" className="sidebar-logo" />
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
						to="/"
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
