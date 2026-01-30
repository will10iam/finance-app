import { Routes, Route } from "react-router-dom";

import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import Receitas from "../pages/Receitas";
import Despesas from "../pages/Despesas";
import Private from "./Private";
/* import Profile from "../pages/Profile"; */
import Categoria from "../pages/Categoria";
import NewReceita from "../pages/NewReceita";
import NewDespesa from "../pages/NewDespesa";
import Dashboard from "../pages/Dashboard";
import Testes from "../pages/Testes";
import Transacoes from "../pages/Transações";
import Balances from "../pages/Balances";

import Layout from "../components/Layout";

function RoutesApp() {
	return (
		<Layout>
			<Routes>
				<Route path="/" element={<SignIn />} />
				<Route path="/register" element={<SignUp />} />
				<Route
					path="/receitas"
					element={
						<Private>
							<Receitas />
						</Private>
					}
				/>
				<Route
					path="/despesas"
					element={
						<Private>
							<Despesas />
						</Private>
					}
				/>
				{/* <Route
				path="/profile"
				element={
					<Private>
						<Profile />
					</Private>
				}
			/> */}
				<Route
					path="/categorias"
					element={
						<Private>
							<Categoria />
						</Private>
					}
				/>

				<Route
					path="/dashboard"
					element={
						<Private>
							<Dashboard />
						</Private>
					}
				/>
				<Route
					path="/newReceita"
					element={
						<Private>
							<NewReceita />
						</Private>
					}
				/>

				<Route
					path="/saldos"
					element={
						<Private>
							<Balances />
						</Private>
					}
				/>

				<Route
					path="/newReceita/:id"
					element={
						<Private>
							<NewReceita />
						</Private>
					}
				/>

				<Route
					path="/newDespesa"
					element={
						<Private>
							<NewDespesa />
						</Private>
					}
				/>

				<Route
					path="/newDespesa/:id"
					element={
						<Private>
							<NewDespesa />
						</Private>
					}
				/>

				<Route
					path="/testes"
					element={
						<Private>
							<Testes />
						</Private>
					}
				/>

				<Route
					path="/transacoes"
					element={
						<Private>
							<Transacoes />
						</Private>
					}
				/>
			</Routes>
		</Layout>
	);
}

export default RoutesApp;
