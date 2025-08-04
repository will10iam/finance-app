import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import avatarImg from "../../assets/avatar.png";
import "./index.css";
import { AuthContext } from "../../contexts/auth";
import { FiHome, FiSettings, FiUser, FiPlus } from "react-icons/fi";
import { AiOutlinePoweroff } from "react-icons/ai";

export default function Sidebar() {
	const { user, logout } = useContext(AuthContext);
	const [open, setOpen] = useState(false);

	async function handleLogOut() {
		await logout();
	}

	return (
		<>
			<div className="sidebar">
				<div>
					<img
						src={user.avatarUrl === null ? avatarImg : user.avatarUrl}
						alt=""
					/>
				</div>

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
						Cadastros
					</button>
					{open && (
						<p className="dropdown-menu">
							<Link to="/receitas">Receitas</Link>
							<Link to="/newDespesa">Despesas</Link>
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
				<Link to="/profile">
					<FiSettings color="#FFF" size={24} />
					Perfil
				</Link>

				<Link to="/">
					<button onClick={handleLogOut}>
						<AiOutlinePoweroff color="#FFF" size={24} />
					</button>
					Sair
				</Link>
			</div>
		</>
	);
}
