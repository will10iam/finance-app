import { Outlet } from "react-router-dom";
import Private from "./Private";
import Layout from "../components/Layout";

export default function PrivateLayout() {
	return (
		<Private>
			<Layout>
				<Outlet />
			</Layout>
		</Private>
	);
}
