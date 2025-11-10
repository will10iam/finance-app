import React from "react";
import "./index.css";
import { GoArrowDownRight } from "react-icons/go";
import { FaRegTrashAlt } from "react-icons/fa";

export default function Testes() {
	return (
		<>
			<div className="cardReceitas">
				<div className="cardReceitas_content">
					<div className="cardReceitas_icon">
						<GoArrowDownRight color="#059669" size={30} />
					</div>
					<div className="cardReceitas_info">
						<div className="cardReceitas_title">
							<p>Descrição Receita</p>
							<span>Categoria</span>
						</div>
						<h3>Data de Recebimento</h3>
					</div>
					<div className="cardReceitas_value">
						<h2>+ R$ 100,00</h2>
					</div>
					<div className="cardReceitas_actions">
						<div>
							<FaRegTrashAlt size={20} />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
