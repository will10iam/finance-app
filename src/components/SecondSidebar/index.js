import { useState } from "react";
import "./index.css";
import logo from "../../assets/logo2.png";
import { ListIcon, XIcon } from "@phosphor-icons/react";

const navItems = ["Dashboard", "Transações", "Relatórios", "Configurações"];

export default function SecondSidebar() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<aside className={`sidebar ${isOpen ? "open" : ""}`}>
			<div className="inner">
				<header>
					<button type="button" onClick={() => setIsOpen(!isOpen)}>
						<span>
							{isOpen ? (
								<XIcon size={32} weight="bold" color="#fff" />
							) : (
								<ListIcon size={32} weight="bold" color="#fff" />
							)}
						</span>
					</button>
					<img src={logo} alt="Logo" />
				</header>
				<nav>
					{navItems.map((item) => (
						<button key={item} type="button">
							<span className="material...">{item}</span>
							<p>{item}</p>
						</button>
					))}
				</nav>
			</div>
		</aside>
	);
}
