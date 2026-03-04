import { Routes, Route } from "react-router-dom";

import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";

import Receitas from "../pages/Receitas";
import Despesas from "../pages/Despesas";
import Categoria from "../pages/Categoria";
import NewReceita from "../pages/NewReceita";
import NewDespesa from "../pages/NewDespesa";
import Dashboard from "../pages/Dashboard";
import Transacoes from "../pages/Transações";
import Saldos from "../pages/Saldos";
import EditSaldo from "../pages/EditarSaldo";

import Layout from "../components/Layout";
import Private from "./Private";

function RoutesApp() {
	return (
		<Routes>
			<Route path="/" element={<SignIn />} />
			<Route path="/register" element={<SignUp />} />

			<Route
				element={
					<Private>
						<Layout />
					</Private>
				}
			>
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/receitas" element={<Receitas />} />
				<Route path="/despesas" element={<Despesas />} />
				<Route path="/categorias" element={<Categoria />} />

				<Route path="/newReceita" element={<NewReceita />} />
				<Route path="/newReceita/:id" element={<NewReceita />} />

				<Route path="/newDespesa" element={<NewDespesa />} />
				<Route path="/newDespesa/:id" element={<NewDespesa />} />

				<Route path="/saldos" element={<Saldos />} />
				<Route path="/saldos/:id" element={<EditSaldo />} />

				<Route path="/transacoes" element={<Transacoes />} />
			</Route>
		</Routes>
	);
}

export default RoutesApp;
