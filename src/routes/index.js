/* import { Routes, Route } from "react-router-dom";

import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";

import Categoria from "../pages/Categoria";
import NewReceita from "../pages/NewReceita";
import NewDespesa from "../pages/NewDespesa";
import Dashboard from "../pages/Dashboard";
import Transacoes from "../pages/Transações";
import Saldos from "../pages/Saldos";
import EditSaldo from "../pages/EditarSaldo";

import Private from "./Private";

function RoutesApp() {
	return (
		<Routes>
			<Route path="/" element={<SignIn />} />
			<Route path="/register" element={<SignUp />} />
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
						<Saldos />
					</Private>
				}
			/>

			<Route
				path="/saldos/:id"
				element={
					<Private>
						<EditSaldo />
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
				path="/transacoes"
				element={
					<Private>
						<Transacoes />
					</Private>
				}
			/>
		</Routes>
	);
}

export default RoutesApp;
 */

import { Routes, Route } from "react-router-dom";

import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";

import Categoria from "../pages/Categoria";
import NewReceita from "../pages/NewReceita";
import NewDespesa from "../pages/NewDespesa";
import Dashboard from "../pages/Dashboard";
import Transacoes from "../pages/Transações";
import Saldos from "../pages/Saldos";
import EditSaldo from "../pages/EditarSaldo";

import PrivateLayout from "./PrivateLayout";

function RoutesApp() {
	return (
		<Routes>
			{/* Públicas (sem Layout) */}
			<Route path="/" element={<SignIn />} />
			<Route path="/register" element={<SignUp />} />

			{/* Privadas (com Layout automático) */}
			<Route element={<PrivateLayout />}>
				<Route path="/dashboard" element={<Dashboard />} />
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
