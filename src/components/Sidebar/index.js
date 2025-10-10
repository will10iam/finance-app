import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import logo2 from "../../assets/logo2.png";
import "./index.css";
import { AuthContext } from "../../contexts/auth";
import { FiSettings, FiPlus } from "react-icons/fi";

export default function Sidebar() {
	const { user } = useContext(AuthContext);
	const [open, setOpen] = useState(false);

	return (
		<>
			<div className="sidebar">
				<div>
					<img src={logo2} alt="" />
				</div>

				<Link to="/dashboard">
					<FiSettings color="#FFF" size={24} />
					Dashboard
				</Link>

				{/* <div className="dropdown">
					<button className="dropdown-toggle" onClick={() => setOpen(!open)}>
						<FiPlus color="#FFF" size={24} />
						Cadastros
					</button>

					{open && (
						<div className="dropdown-menu">
							<Link to="/newReceita">Nova Receita</Link>
							<Link to="/newDespesa">Nova Despesa</Link>
							<Link to="/categorias">Nova Categoria</Link>
						</div>
					)}
				</div> */}
				<nav className="dropdown">
					<button className="dropdown-toggle" onClick={() => setOpen(!open)}>
						<FiPlus color="#FFF" size={24} />
						Lançamentos
					</button>
					{open && (
						<p className="dropdown-menu">
							<Link to="/receitas">Receitas</Link>
							<Link to="/despesas">Despesas</Link>
							<Link to="/categorias">Categorias</Link>
						</p>
					)}
				</nav>
				{/* <Link to="/despesas">
					<FiHome color="#FFF" size={24} />
					Despesas
				</Link>
				<Link to="/categorias">
					<FiUser color="#FFF" size={24} />
					Categoria
				</Link> */}
				{/* <Link to="/profile">
					<FiSettings color="#FFF" size={24} />
					Perfil
				</Link> */}
			</div>
		</>
	);
}
