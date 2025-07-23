import { Routes, Route } from "react-router-dom";

import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import Receitas from "../pages/Receitas";
import Private from "./Private";
import Profile from "../pages/Profile";
import Categoria from "../pages/Categoria";
import New from "../pages/New";

function RoutesApp() {
	return (
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
				path="/profile"
				element={
					<Private>
						<Profile />
					</Private>
				}
			/>
			<Route
				path="/categorias"
				element={
					<Private>
						<Categoria />
					</Private>
				}
			/>
			<Route
				path="/new"
				element={
					<Private>
						<New />
					</Private>
				}
			/>

			<Route
				path="/new/:id"
				element={
					<Private>
						<New />
					</Private>
				}
			/>
		</Routes>
	);
}

export default RoutesApp;
