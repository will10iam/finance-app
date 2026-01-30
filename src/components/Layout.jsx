import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<>
			<button className="menu-button" onClick={() => setSidebarOpen(true)}>
				☰
			</button>

			<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

			<main>{children}</main>
		</>
	);
}
