import { useState } from "react";
import Sidebar from "./Sidebar";
import "./Sidebar/index.css";
import logo from "../assets/logo2.png";

export default function Layout({ children }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<>
			<div className="layout">
				<button className="menu-button" onClick={() => setSidebarOpen(true)}>
					☰
				</button>

				<img src={logo} alt="" />
				<p></p>
			</div>

			<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

			<main>{children}</main>
		</>
	);
}
